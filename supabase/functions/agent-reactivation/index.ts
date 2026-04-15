/**
 * TrainedBy — Dead Lead Reactivation Agent
 * ─────────────────────────────────────────────────────────────────────────────
 * Trigger: Cron — 1st of each month at 10am
 *
 * What it does:
 *   Sweeps leads that are 14–45 days old with status 'new' or 'contacted'
 *   (i.e., never converted and gone cold). For each, drafts one final
 *   low-pressure reactivation message and sends it to the trainer.
 *
 * Converts 5–10% of dead leads. Trainers who see even one converted dead
 * lead will never cancel their Pro subscription.
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
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

async function draftReactivation(
  trainerName: string,
  clientName: string,
  originalMessage: string,
  specialties: string[],
  locale: string,
): Promise<string> {
  const langInstructions: Record<string, string> = {
    en: 'Write in English.',
    es: 'Escribe en español.',
    fr: 'Écris en français.',
    it: 'Scrivi in italiano.',
  };

  const prompt = `Write a final reactivation WhatsApp message from personal trainer ${trainerName} to a cold lead named ${clientName}.

Context:
- The lead originally messaged about: "${originalMessage.slice(0, 120)}"
- Trainer specialises in: ${specialties.slice(0, 2).join(', ')}
- It has been 2–4 weeks since their last contact
- This is the LAST message — low pressure, no follow-up after this

Requirements:
- Acknowledge that life gets busy, no guilt
- Keep a slot open for them
- Offer one free trial session or a no-commitment first call
- 2–3 sentences max
- Warm but not desperate
- No emojis
- ${langInstructions[locale] ?? langInstructions['en']}

Output ONLY the WhatsApp message text, nothing else.`;

  return await callClaude(prompt);
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const body = await req.json();
    const singleTrainerId: string | null = body.trainer_id ?? null;

    const now = new Date();
    const fourtyFiveDaysAgo = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();

    // Fetch cold leads in the 14–45 day window
    let leadsQuery = sb
      .from('leads')
      .select(`
        id, trainer_id, name, message, created_at, status,
        reactivation_sent_at,
        trainers (
          id, name, specialties, whatsapp, telegram_chat_id,
          assistant_channel, locale, plan
        )
      `)
      .in('status', ['new', 'contacted'])
      .gte('created_at', fourtyFiveDaysAgo)
      .lte('created_at', fourteenDaysAgo)
      .is('reactivation_sent_at', null);

    if (singleTrainerId) {
      leadsQuery = leadsQuery.eq('trainer_id', singleTrainerId);
    }

    const { data: leads } = await leadsQuery;
    if (!leads || leads.length === 0) {
      return new Response(JSON.stringify({ ok: true, sent: 0 }), { status: 200 });
    }

    // Group leads by trainer to send one batched message per trainer
    const byTrainer = new Map<string, Array<Record<string, unknown>>>();
    for (const lead of leads) {
      const trainer = lead.trainers as Record<string, unknown>;
      if (!trainer || trainer.plan !== 'pro') continue;
      const tid = String(trainer.id);
      if (!byTrainer.has(tid)) byTrainer.set(tid, []);
      byTrainer.get(tid)!.push(lead);
    }

    let sent = 0;
    let skipped = 0;

    for (const [, trainerLeads] of byTrainer) {
      try {
        const trainer = trainerLeads[0].trainers as Record<string, unknown>;
        const market = getMarket(String(trainer.locale ?? 'en'));
        const trainerFirstName = String(trainer.name ?? 'there').split(' ')[0];
        const specialties: string[] = Array.isArray(trainer.specialties) ? trainer.specialties : [];
        const locale = String(trainer.locale ?? 'en');

        // Build the message: list each cold lead with its draft
        const leadBlocks: string[] = [];

        for (const lead of trainerLeads.slice(0, 5)) { // cap at 5 per trainer per sweep
          const draft = await draftReactivation(
            trainerFirstName,
            String(lead.name),
            String(lead.message ?? ''),
            specialties,
            locale,
          );

          leadBlocks.push(`*${lead.name}* (${Math.round((now.getTime() - new Date(String(lead.created_at)).getTime()) / (1000 * 60 * 60 * 24))}d ago)\n_"${draft}"_`);

          // Mark as sent
          await sb
            .from('leads')
            .update({ reactivation_sent_at: new Date().toISOString() })
            .eq('id', lead.id);

          await new Promise(r => setTimeout(r, 100));
        }

        const message = `🔄 *${trainerLeads.length} cold lead${trainerLeads.length > 1 ? 's' : ''} — one last try*

These leads went quiet 2–4 weeks ago. Send each one this message today:\n\n${leadBlocks.join('\n\n')}

5–10% will reply. One converted lead pays for your Pro subscription for months.`;

        await sendToTrainer(
          {
            channel: String(trainer.assistant_channel ?? 'dashboard') as 'telegram' | 'whatsapp' | 'dashboard',
            telegram_chat_id: trainer.telegram_chat_id as number | null,
            whatsapp: trainer.whatsapp as string | null,
            trainer_id: String(trainer.id),
          },
          { text: message, parse_mode: 'Markdown' },
          'reactivation-agent',
        );

        sent++;
        await new Promise(r => setTimeout(r, 200));

      } catch (err) {
        console.error('Reactivation agent error for trainer:', err);
        skipped++;
      }
    }

    return new Response(
      JSON.stringify({ ok: true, sent, skipped, total: byTrainer.size }),
      { status: 200 },
    );

  } catch (err) {
    console.error('Reactivation agent error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
