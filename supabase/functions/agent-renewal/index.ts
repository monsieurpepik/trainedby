/**
 * TrainedBy — Package Renewal Alert Agent
 * ─────────────────────────────────────────────────────────────────────────────
 * Trigger: Cron — daily at 8am, OR DB webhook on sessions table UPDATE
 *          where sessions_remaining changes to 2
 *
 * What it does:
 *   Scans all active client packages where sessions_remaining == 2.
 *   For each, sends the trainer a WhatsApp/Telegram message with:
 *     - Client name, package name, sessions remaining
 *     - A ready-to-send renewal WhatsApp message written in the trainer's voice
 *     - The renewal value (sessions × rate)
 *
 * This is the highest-value agent for trainers with existing clients.
 * One renewal message sent at the right time = AED 1,800+ for the trainer.
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
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

async function draftRenewalMessage(
  trainerName: string,
  clientName: string,
  packageName: string,
  sessionsRemaining: number,
  pricePerSession: number,
  currency: string,
  specialties: string[],
): Promise<string> {
  const totalValue = pricePerSession * 8; // assume 8-session renewal block
  const prompt = `Write a WhatsApp renewal message from personal trainer ${trainerName} to their client ${clientName}.

Context:
- Client has ${sessionsRemaining} sessions left in their "${packageName}" package
- Trainer specialises in: ${specialties.slice(0, 2).join(', ')}
- Price per session: ${currency}${pricePerSession}
- Renewal block value: ${currency}${totalValue}

Requirements:
- Warm, personal, not salesy
- Acknowledge the client's progress (keep it generic but specific-feeling — "your consistency has been incredible", "the results are showing")
- Create mild urgency (trainer opening new spots, rate may change)
- End with a clear, easy yes/no question
- 3–4 sentences max
- No emojis
- Sound like a human trainer, not a marketing email

Output ONLY the WhatsApp message text, nothing else.`;

  return await callClaude(prompt);
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const body = await req.json();

    // Support single-trainer webhook trigger or full cron sweep
    const singleTrainerId: string | null = body.trainer_id ?? null;
    const singlePackageId: string | null = body.package_id ?? null;

    let packages: Array<Record<string, unknown>> = [];

    if (singlePackageId) {
      // Webhook mode: specific package triggered
      const { data } = await sb
        .from('client_packages')
        .select(`
          id, trainer_id, client_name, client_whatsapp, package_name,
          sessions_remaining, price_per_session, renewal_alert_sent_at,
          trainers (
            id, name, title, specialties, whatsapp, telegram_chat_id,
            assistant_channel, locale, plan
          )
        `)
        .eq('id', singlePackageId)
        .eq('sessions_remaining', 2)
        .is('renewal_alert_sent_at', null)
        .single();

      if (data) packages = [data];
    } else {
      // Cron mode: sweep all packages with 2 sessions remaining
      const { data } = await sb
        .from('client_packages')
        .select(`
          id, trainer_id, client_name, client_whatsapp, package_name,
          sessions_remaining, price_per_session, renewal_alert_sent_at,
          trainers (
            id, name, title, specialties, whatsapp, telegram_chat_id,
            assistant_channel, locale, plan
          )
        `)
        .eq('sessions_remaining', 2)
        .is('renewal_alert_sent_at', null)
        .eq('active', true);

      packages = data ?? [];
    }

    let sent = 0;
    let skipped = 0;

    for (const pkg of packages) {
      const trainer = pkg.trainers as Record<string, unknown>;
      if (!trainer) { skipped++; continue; }

      // Only Pro trainers get this agent
      if (trainer.plan !== 'pro') { skipped++; continue; }

      const market = getMarket(String(trainer.locale ?? 'en'));
      const trainerFirstName = String(trainer.name ?? 'there').split(' ')[0];
      const specialties = Array.isArray(trainer.specialties) ? trainer.specialties : [];
      const pricePerSession = Number(pkg.price_per_session ?? 0);
      const renewalValue = pricePerSession * 8;

      const renewalScript = await draftRenewalMessage(
        trainerFirstName,
        String(pkg.client_name),
        String(pkg.package_name),
        Number(pkg.sessions_remaining),
        pricePerSession,
        market.currency,
        specialties,
      );

      const message = `💰 *Renewal opportunity — ${pkg.client_name}*

${pkg.client_name} has *${pkg.sessions_remaining} sessions left* in their "${pkg.package_name}" package.

Renewal value: *${market.currency}${renewalValue}*

*Send this now:*
_${renewalScript}_

Reply YES to log this as sent.`;

      await sendToTrainer(
        {
          channel: String(trainer.assistant_channel ?? 'dashboard') as 'telegram' | 'whatsapp' | 'dashboard',
          telegram_chat_id: trainer.telegram_chat_id as number | null,
          whatsapp: trainer.whatsapp as string | null,
          trainer_id: String(trainer.id),
        },
        { text: message, parse_mode: 'Markdown' },
        'renewal-agent',
      );

      // Mark alert as sent to prevent duplicates
      await sb
        .from('client_packages')
        .update({ renewal_alert_sent_at: new Date().toISOString() })
        .eq('id', pkg.id);

      sent++;
      await new Promise(r => setTimeout(r, 150));
    }

    return new Response(
      JSON.stringify({ ok: true, sent, skipped, total: packages.length }),
      { status: 200 },
    );

  } catch (err) {
    console.error('Renewal agent error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
