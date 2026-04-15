/**
 * TrainedBy  -  Price Benchmarking Agent
 * ─────────────────────────────────────────────────────────────────────────────
 * Trigger: Cron  -  first Monday of each month at 9am
 *
 * What it does:
 *   Pulls pricing data from trainers in the same city with similar verification
 *   level and specialties. Sends each trainer a market rate comparison and a
 *   one-line script to test a price increase with their next new client.
 *
 * Why it matters:
 *   Trainers are chronically underpriced and terrified to raise rates.
 *   Market data + a script removes both blockers. Direct income impact.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendToTrainer } from '../_shared/channel.ts';
import { getMarket } from '../_shared/locale.ts';

const sb = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const CLAUDE_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;

async function callClaude(prompt: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

interface PriceStats {
  min: number;
  max: number;
  median: number;
  count: number;
}

function calcStats(prices: number[]): PriceStats {
  if (prices.length === 0) return { min: 0, max: 0, median: 0, count: 0 };
  const sorted = [...prices].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    median: Math.round(median),
    count: sorted.length,
  };
}

async function getPriceScript(
  trainerName: string,
  currentRate: number,
  marketMedian: number,
  currency: string,
  specialties: string[],
): Promise<string> {
  const suggestedRate = Math.round(marketMedian * 1.05 / 10) * 10; // round to nearest 10
  const prompt = `Write a one-sentence WhatsApp message a personal trainer named ${trainerName} can send to their NEXT NEW CLIENT to test a price increase.

Current rate: ${currency}${currentRate}/session
Suggested new rate: ${currency}${suggestedRate}/session
Specialties: ${specialties.slice(0, 2).join(', ')}

Requirements:
- Casual, confident, not apologetic
- Frames the price as the value, not an increase
- One sentence only
- No emojis
- Sounds like a human, not a script

Output ONLY the one sentence, nothing else.`;

  return await callClaude(prompt);
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const body = await req.json();
    const singleTrainerId: string | null = body.trainer_id ?? null;

    // Fetch trainers to benchmark
    let trainersQuery = sb
      .from('trainers')
      .select('id, name, city, specialties, packages, whatsapp, telegram_chat_id, assistant_channel, locale, plan, verified, reps_number')
      .eq('plan', 'pro')
      .not('city', 'is', null);

    if (singleTrainerId) {
      trainersQuery = trainersQuery.eq('id', singleTrainerId);
    }

    const { data: trainers } = await trainersQuery;
    if (!trainers || trainers.length === 0) {
      return new Response(JSON.stringify({ ok: true, sent: 0 }), { status: 200 });
    }

    let sent = 0;
    let skipped = 0;

    for (const trainer of trainers) {
      try {
        const market = getMarket(String(trainer.locale ?? 'en'));
        const specialties: string[] = Array.isArray(trainer.specialties) ? trainer.specialties : [];
        const city = String(trainer.city ?? '');

        // Extract trainer's current rate from packages
        const packages = Array.isArray(trainer.packages) ? trainer.packages : [];
        const rates = packages
          .map((p: Record<string, unknown>) => {
            if (p.price && p.sessions) return Number(p.price) / Number(p.sessions);
            return null;
          })
          .filter((r): r is number => r !== null && r > 0);

        if (rates.length === 0) { skipped++; continue; }
        const trainerRate = Math.round(rates.reduce((a, b) => a + b, 0) / rates.length);

        // Find comparable trainers: same city, at least one overlapping specialty, verified
        const { data: comparables } = await sb
          .from('trainers')
          .select('packages, verified')
          .eq('city', city)
          .neq('id', trainer.id)
          .not('packages', 'is', null);

        const marketRates: number[] = [];
        for (const comp of comparables ?? []) {
          const compPackages = Array.isArray(comp.packages) ? comp.packages : [];
          for (const p of compPackages as Record<string, unknown>[]) {
            if (p.price && p.sessions) {
              const rate = Number(p.price) / Number(p.sessions);
              if (rate > 50 && rate < 2000) marketRates.push(Math.round(rate));
            }
          }
        }

        if (marketRates.length < 3) { skipped++; continue; } // not enough data

        const stats = calcStats(marketRates);
        const trainerFirstName = String(trainer.name ?? 'there').split(' ')[0];

        // Only send if trainer is meaningfully below median (>10% below)
        const isUnderpriced = trainerRate < stats.median * 0.9;

        const priceScript = isUnderpriced
          ? await getPriceScript(trainerFirstName, trainerRate, stats.median, market.currency, specialties)
          : null;

        const positionLabel = trainerRate < stats.min * 1.1
          ? '🔴 Below market'
          : trainerRate < stats.median * 0.95
          ? '🟡 Below median'
          : trainerRate < stats.max * 0.9
          ? '🟢 At market rate'
          : '⭐ Premium tier';

        let message = `📊 *${city} market rates  -  ${specialties.slice(0, 2).join(' & ')}*

${stats.count} verified trainers in your city charge:
• Low: *${market.currency}${stats.min}*
• Median: *${market.currency}${stats.median}*
• High: *${market.currency}${stats.max}*

Your rate: *${market.currency}${trainerRate}/session* ${positionLabel}`;

        if (isUnderpriced && priceScript) {
          const suggestedRate = Math.round(stats.median * 1.05 / 10) * 10;
          message += `\n\nTest *${market.currency}${suggestedRate}* with your next new client. Send them:\n_"${priceScript}"_`;
        } else {
          message += `\n\nYou're priced competitively. Keep it there.`;
        }

        await sendToTrainer(
          {
            channel: String(trainer.assistant_channel ?? 'dashboard') as 'telegram' | 'whatsapp' | 'dashboard',
            telegram_chat_id: trainer.telegram_chat_id as number | null,
            whatsapp: trainer.whatsapp as string | null,
            trainer_id: String(trainer.id),
          },
          { text: message, parse_mode: 'Markdown' },
          'pricing-agent',
        );

        sent++;
        await new Promise(r => setTimeout(r, 200));

      } catch (err) {
        console.error(`Pricing agent error for trainer ${trainer.id}:`, err);
        skipped++;
      }
    }

    return new Response(
      JSON.stringify({ ok: true, sent, skipped, total: trainers.length }),
      { status: 200 },
    );

  } catch (err) {
    console.error('Pricing agent error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
