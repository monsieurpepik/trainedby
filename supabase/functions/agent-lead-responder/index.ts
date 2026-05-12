/**
 * TrainedBy  -  Lead Responder Agent
 * ─────────────────────────────────────────────────────────────────────────────
 * Triggered by: Supabase database webhook on INSERT to `leads` table.
 *
 * What it does:
 *   1. Fetches the trainer's profile and the new lead details
 *   2. Drafts a personalised WhatsApp reply the trainer can send to the lead
 *   3. Builds a calendar scheduling link (Calendly / Google Calendar)
 *   4. Sends the trainer a message via their preferred channel:
 *      "New lead from Ahmed. Here's a draft reply  -  copy and send it."
 *
 * Only runs for Pro trainers.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../_shared/logger.ts';
import { sendToTrainer } from '../_shared/channel.ts';
import { buildCalendarLink } from '../_shared/calendar.ts';
import { getMarket, getPersona, type Locale } from '../_shared/locale.ts';

const log = createLogger('agent-lead-responder');

const ANTHROPIC_KEY = () => Deno.env.get('ANTHROPIC_API_KEY')!;

async function draftReply(
  trainerName: string,
  trainerSpecialties: string[],
  clientName: string,
  clientMessage: string,
  market: ReturnType<typeof getMarket>,
  persona: string,
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
      max_tokens: 300,
      temperature: 0.6,
      system: `${persona} You are writing a WhatsApp reply on behalf of ${trainerName}, a ${trainerSpecialties.join(' & ')} trainer in ${market.city}. Write a warm, professional first reply to a new potential client. Under 80 words. No emojis unless the trainer's style calls for it. Sound human. End with a question that moves the conversation forward (e.g. "When are you free for a quick call?").`,
      messages: [{
        role: 'user',
        content: `New lead: ${clientName} sent this message: "${clientMessage || 'I\'m interested in personal training'}". Draft the trainer\'s WhatsApp reply.`,
      }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

Deno.serve(async (req: Request) => {
  const body = await req.json();

  // Supabase webhook payload: { type: 'INSERT', table: 'leads', record: {...} }
  const lead = body.record ?? body;
  if (!lead?.id || !lead?.trainer_id) {
    return new Response('Missing lead data', { status: 400 });
  }

  const sb = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Fetch trainer
  const { data: trainer } = await sb
    .from('trainers')
    .select('id, name, full_name, specialties, locale, plan, assistant_channel, telegram_chat_id, whatsapp, calendly_url, google_calendar_token')
    .eq('id', lead.trainer_id)
    .single();

  if (!trainer) {
    log.error('Trainer not found', { trainer_id: lead.trainer_id });
    return new Response('Trainer not found', { status: 404 });
  }

  // Pro gate
  if (trainer.plan !== 'pro' && trainer.plan !== 'premium') {
    return new Response('Free plan  -  skipping', { status: 200 });
  }

  const market = getMarket(trainer.locale as Locale);
  const persona = getPersona(trainer.locale as Locale);
  const trainerName = trainer.name || trainer.full_name || 'Trainer';
  const specialties = Array.isArray(trainer.specialties) ? trainer.specialties : [];

  log.info('New lead received', { trainer_id: trainer.id, lead_id: lead.id, client: lead.name });

  // Draft WhatsApp reply
  const draft = await draftReply(
    trainerName,
    specialties,
    lead.name || 'your new lead',
    lead.message || '',
    market,
    persona,
  );

  // Build calendar link
  const calLink = await buildCalendarLink(
    {
      name: trainerName,
      calendly_url: trainer.calendly_url,
      google_calendar_token: trainer.google_calendar_token,
    },
    {
      clientName: lead.name || 'New Client',
      clientEmail: lead.email,
      title: `Initial Consultation  -  ${lead.name || 'New Client'} & ${trainerName}`,
      durationMinutes: 30,
    },
  );

  // Build the message
  const message = [
    `📩 *New lead: ${lead.name || 'Someone'}*`,
    lead.message ? `"${lead.message}"` : '',
    '',
    `*Draft reply to send on WhatsApp:*`,
    `─────────────────`,
    draft,
    `─────────────────`,
    '',
    `📅 [${calLink.label}](${calLink.url})`,
    '',
    `_Copy the draft above and send it from your WhatsApp._`,
  ].filter(l => l !== null).join('\n');

  await sendToTrainer(
    {
      channel: trainer.assistant_channel || 'dashboard',
      telegram_chat_id: trainer.telegram_chat_id,
      whatsapp: trainer.whatsapp,
      trainer_id: trainer.id,
    },
    { text: message },
    'lead-responder',
  );

  log.info('Lead responder sent', { trainer_id: trainer.id, lead_id: lead.id });
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
});
