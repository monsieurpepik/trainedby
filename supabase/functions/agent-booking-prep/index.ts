/**
 * TrainedBy  -  Booking Prep Agent
 * ─────────────────────────────────────────────────────────────────────────────
 * Triggered by: Supabase database webhook on UPDATE to `leads` table
 *               where new.status = 'booked'
 *
 * What it does:
 *   1. Fetches the trainer and client details
 *   2. Generates a session prep note: client goal, suggested warm-up,
 *      3 questions to ask in the first session
 *   3. Builds a calendar event / scheduling link
 *   4. Sends the trainer a prep brief via their preferred channel
 *
 * The trainer arrives at the first session prepared, not winging it.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../_shared/logger.ts';
import { sendToTrainer } from '../_shared/channel.ts';
import { buildCalendarLink } from '../_shared/calendar.ts';
import { getMarket, getPersona, type Locale } from '../_shared/locale.ts';

const log = createLogger('agent-booking-prep');

const ANTHROPIC_KEY = () => Deno.env.get('ANTHROPIC_API_KEY')!;

async function generateSessionPrep(
  trainerName: string,
  clientName: string,
  clientMessage: string,
  specialties: string[],
  market: ReturnType<typeof getMarket>,
  persona: string,
): Promise<{ warmUp: string; questions: string[]; notes: string }> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY(),
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 400,
      temperature: 0.5,
      system: `${persona} You prepare personal trainers for first sessions with new clients. Be practical and specific. Write in ${market.language}.`,
      messages: [{
        role: 'user',
        content: `Trainer: ${trainerName} (specialties: ${specialties.join(', ') || 'general fitness'}).
Client: ${clientName}. Their message: "${clientMessage || 'Interested in personal training'}".

Write a first-session prep brief. Format exactly:
WARM_UP: [2-sentence warm-up suggestion based on likely client goal]
Q1: [first question to ask the client]
Q2: [second question]
Q3: [third question]
NOTES: [one tactical note for the trainer  -  e.g. what to watch for, how to set expectations]`,
      }],
    }),
  });

  const data = await res.json();
  const raw = data.content?.[0]?.text ?? '';

  const warmUpMatch = raw.match(/WARM_UP:\s*(.+?)(?=Q1:|$)/is);
  const q1Match = raw.match(/Q1:\s*(.+?)(?=Q2:|$)/is);
  const q2Match = raw.match(/Q2:\s*(.+?)(?=Q3:|$)/is);
  const q3Match = raw.match(/Q3:\s*(.+?)(?=NOTES:|$)/is);
  const notesMatch = raw.match(/NOTES:\s*(.+?)$/is);

  return {
    warmUp: warmUpMatch?.[1]?.trim() ?? 'Start with a light 5-minute cardio warm-up and mobility assessment.',
    questions: [
      q1Match?.[1]?.trim() ?? 'What is your main goal for the next 3 months?',
      q2Match?.[1]?.trim() ?? 'Have you trained with a PT before? What worked and what didn\'t?',
      q3Match?.[1]?.trim() ?? 'Are there any injuries or limitations I should know about?',
    ],
    notes: notesMatch?.[1]?.trim() ?? 'Focus on building rapport in this first session  -  results come later.',
  };
}

Deno.serve(async (req: Request) => {
  const body = await req.json();

  // Supabase webhook: { type: 'UPDATE', table: 'leads', record: {...}, old_record: {...} }
  const lead = body.record ?? body;
  const oldLead = body.old_record ?? {};

  // Only trigger when status changes TO 'booked'
  if (lead?.status !== 'booked' || oldLead?.status === 'booked') {
    return new Response('Not a booking event', { status: 200 });
  }

  if (!lead?.trainer_id) {
    return new Response('Missing trainer_id', { status: 400 });
  }

  const sb = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: trainer } = await sb
    .from('trainers')
    .select('id, name, full_name, specialties, locale, plan, assistant_channel, telegram_chat_id, whatsapp, calendly_url, google_calendar_token')
    .eq('id', lead.trainer_id)
    .single();

  if (!trainer || (trainer.plan !== 'pro' && trainer.plan !== 'premium')) {
    return new Response('Free plan or trainer not found', { status: 200 });
  }

  const market = getMarket(trainer.locale as Locale);
  const persona = getPersona(trainer.locale as Locale);
  const trainerName = trainer.name || trainer.full_name || 'Trainer';
  const specialties = Array.isArray(trainer.specialties) ? trainer.specialties : [];

  log.info('Booking confirmed', { trainer_id: trainer.id, lead_id: lead.id, client: lead.name });

  // Generate session prep
  const prep = await generateSessionPrep(
    trainerName,
    lead.name || 'your new client',
    lead.message || '',
    specialties,
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
      title: `First Session  -  ${lead.name || 'New Client'} & ${trainerName}`,
      durationMinutes: 60,
      notes: `Client goal from enquiry: ${lead.message || 'Not specified'}`,
    },
  );

  const message = [
    `🎉 *${lead.name || 'New client'} is booked in!*`,
    '',
    `*Session prep:*`,
    `🔥 Warm-up: ${prep.warmUp}`,
    '',
    `*3 questions to ask:*`,
    `1. ${prep.questions[0]}`,
    `2. ${prep.questions[1]}`,
    `3. ${prep.questions[2]}`,
    '',
    `📝 ${prep.notes}`,
    '',
    `📅 [${calLink.label}](${calLink.url})`,
  ].join('\n');

  await sendToTrainer(
    {
      channel: trainer.assistant_channel || 'dashboard',
      telegram_chat_id: trainer.telegram_chat_id,
      whatsapp: trainer.whatsapp,
      trainer_id: trainer.id,
    },
    { text: message },
    'booking-prep',
  );

  log.info('Booking prep sent', { trainer_id: trainer.id, lead_id: lead.id });
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
});
