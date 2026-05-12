/**
 * TrainedBy  -  Follow-up Agent
 * ─────────────────────────────────────────────────────────────────────────────
 * Triggered by: pg_cron daily at 09:00 trainer local time (approximated per timezone)
 *
 * What it does:
 *   1. Finds all Pro trainers with leads that are:
 *      - status = 'new' (not yet contacted)
 *      - created more than 48 hours ago
 *   2. For each such trainer, drafts a follow-up message per lead
 *   3. Sends the trainer one consolidated nudge via their preferred channel
 *
 * One message per trainer per day  -  not one per lead.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../_shared/logger.ts';
import { sendToTrainer } from '../_shared/channel.ts';
import { getMarket, getPersona, type Locale } from '../_shared/locale.ts';

const log = createLogger('agent-followup');

const ANTHROPIC_KEY = () => Deno.env.get('ANTHROPIC_API_KEY')!;

async function draftFollowUp(
  trainerName: string,
  clientName: string,
  originalMessage: string,
  daysSince: number,
  market: ReturnType<typeof getMarket>,
): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY(),
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 150,
      temperature: 0.5,
      system: `You write short, warm WhatsApp follow-up messages for personal trainers in ${market.city}. Under 50 words. No pressure. Sound human. End with a soft open question.`,
      messages: [{
        role: 'user',
        content: `Trainer: ${trainerName}. Client: ${clientName}. Original message: "${originalMessage || 'Interested in PT'}". Days since lead: ${daysSince}. Write a follow-up WhatsApp message.`,
      }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

Deno.serve(async (_req: Request) => {
  const sb = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const cutoff = new Date(Date.now() - 48 * 3600 * 1000).toISOString();

  // Find cold leads grouped by trainer
  const { data: coldLeads } = await sb
    .from('leads')
    .select(`
      id, name, message, created_at, trainer_id,
      trainers!inner(id, name, full_name, locale, plan, assistant_channel, telegram_chat_id, whatsapp)
    `)
    .eq('status', 'new')
    .lt('created_at', cutoff)
    .in('trainers.plan', ['pro', 'premium'])
    .limit(200);

  if (!coldLeads?.length) {
    log.info('No cold leads found');
    return new Response(JSON.stringify({ ok: true, sent: 0 }), { status: 200 });
  }

  // Group by trainer
  const byTrainer = new Map<string, { trainer: Record<string, unknown>; leads: typeof coldLeads }>();
  for (const lead of coldLeads) {
    const t = lead.trainers as Record<string, unknown>;
    const tid = t.id as string;
    if (!byTrainer.has(tid)) byTrainer.set(tid, { trainer: t, leads: [] });
    byTrainer.get(tid)!.leads.push(lead);
  }

  let sent = 0;
  for (const { trainer, leads } of byTrainer.values()) {
    const market = getMarket(trainer.locale as Locale);
    const trainerName = (trainer.name || trainer.full_name || 'Trainer') as string;

    // Build follow-up drafts  -  max 3 per message to avoid overwhelming
    const topLeads = leads.slice(0, 3);
    const sections: string[] = [];

    for (const lead of topLeads) {
      const daysSince = Math.floor(
        (Date.now() - new Date(lead.created_at).getTime()) / 86400000,
      );
      const draft = await draftFollowUp(
        trainerName,
        lead.name || 'your lead',
        lead.message || '',
        daysSince,
        market,
      );
      sections.push(
        `*${lead.name || 'Lead'}* (${daysSince}d ago)\n${draft}`,
      );
    }

    const remaining = leads.length - topLeads.length;
    const message = [
      `⏰ *${leads.length} lead${leads.length > 1 ? 's' : ''} waiting for a reply*`,
      '',
      sections.join('\n\n─────────────────\n\n'),
      remaining > 0 ? `\n_+ ${remaining} more in your dashboard_` : '',
    ].join('\n');

    await sendToTrainer(
      {
        channel: (trainer.assistant_channel as 'telegram' | 'whatsapp' | 'dashboard') || 'dashboard',
        telegram_chat_id: trainer.telegram_chat_id as number | null,
        whatsapp: trainer.whatsapp as string | null,
        trainer_id: trainer.id as string,
      },
      { text: message },
      'followup-agent',
    );

    sent++;
    await new Promise(r => setTimeout(r, 200));
  }

  log.info('Follow-up agent done', { trainers_notified: sent });
  return new Response(JSON.stringify({ ok: true, sent }), { status: 200 });
});
