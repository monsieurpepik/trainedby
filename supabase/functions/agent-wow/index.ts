/**
 * TrainedBy — WOW Moment Agent
 * ─────────────────────────────────────────────────────────────────────────────
 * Trigger: DB webhook on trainers table UPDATE where profile_complete changes
 *          to true (or photo + bio + specialties all non-null for the first time)
 *
 * What it does (within 60 seconds of profile completion):
 *   1. Scores the profile and identifies the single most impactful fix
 *   2. Writes 3 Instagram captions for their specialties + city
 *   3. Drafts a sample lead reply in their voice
 *   All delivered in one WhatsApp / Telegram message.
 *
 * Goal: create the "this thing already knows me" aha moment that converts
 *       free trainers to Pro.
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
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

async function scoreProfile(trainer: Record<string, unknown>): Promise<{ score: number; fix: string }> {
  const fields = [
    trainer.photo_url ? 10 : 0,
    trainer.bio && String(trainer.bio).length > 80 ? 20 : trainer.bio ? 10 : 0,
    Array.isArray(trainer.specialties) && trainer.specialties.length > 0 ? 15 : 0,
    trainer.title ? 10 : 0,
    trainer.city ? 10 : 0,
    trainer.packages && Array.isArray(trainer.packages) && trainer.packages.length > 0 ? 20 : 0,
    trainer.reps_number ? 15 : 0,
  ];
  const score = fields.reduce((a, b) => a + b, 0);

  let fix = 'Add your session packages — trainers with packages get 3× more leads.';
  if (!trainer.photo_url) fix = 'Add a professional photo — profiles with photos get 5× more views.';
  else if (!trainer.bio || String(trainer.bio).length < 80) fix = 'Write a 2-sentence bio focused on client results, not your credentials.';
  else if (!trainer.reps_number) fix = 'Add your certification number — the verified badge doubles conversion.';
  else if (!trainer.packages || !Array.isArray(trainer.packages) || trainer.packages.length === 0) fix = 'Add your session packages — trainers with packages get 3× more leads.';

  return { score, fix };
}

async function generateWowMessage(trainer: Record<string, unknown>, market: ReturnType<typeof getMarket>): Promise<string> {
  const name = String(trainer.name ?? 'there').split(' ')[0];
  const specialties = Array.isArray(trainer.specialties) ? trainer.specialties.slice(0, 3).join(', ') : 'fitness';
  const city = String(trainer.city ?? market.exampleCity);
  const title = String(trainer.title ?? 'Personal Trainer');
  const { score, fix } = await scoreProfile(trainer);

  const prompt = `You are writing a WhatsApp message from a fitness platform to a personal trainer who just completed their profile.

Trainer: ${name}
Title: ${title}
Specialties: ${specialties}
City: ${city}
Market: ${market.brandName} (${market.locale})
Profile score: ${score}/100

Write EXACTLY this structure (no intro, no sign-off, just the content):

🎉 *${name}, your profile is live!*

*Profile score: ${score}/100*
One thing to fix right now: ${fix}

---

*3 Instagram captions ready to post:*

1. [Write a 2-sentence educational caption about ${specialties} with a hook, a tip, and a CTA to book. Include 3 relevant hashtags. City: ${city}.]

2. [Write a motivational caption about transformation/results. Personal, specific, ends with a question to drive comments. 3 hashtags.]

3. [Write a story-style caption: "The most common mistake I see with ${specialties.split(',')[0].trim()}..." — give the mistake, the fix, the result. 3 hashtags.]

---

*Sample reply for your first lead:*

[Write a WhatsApp reply a trainer named ${name} would send to a new lead. Warm, specific to ${specialties}, mentions ${city}, asks one qualifying question about their goal. 3–4 sentences max. No emojis.]

---

Reply STOP to pause these updates.`;

  return await callClaude(prompt);
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const body = await req.json();

    // Support both direct call (trainer_id) and DB webhook payload
    let trainerId: string | null = body.trainer_id ?? null;
    if (!trainerId && body.record) {
      trainerId = body.record.id ?? null;
    }

    if (!trainerId) {
      return new Response(JSON.stringify({ error: 'trainer_id required' }), { status: 400 });
    }

    // Fetch trainer
    const { data: trainer, error } = await sb
      .from('trainers')
      .select('id, name, title, bio, photo_url, specialties, city, packages, reps_number, whatsapp, telegram_chat_id, assistant_channel, locale, wow_sent_at')
      .eq('id', trainerId)
      .single();

    if (error || !trainer) {
      return new Response(JSON.stringify({ error: 'Trainer not found' }), { status: 404 });
    }

    // Idempotency: only fire once per trainer
    if (trainer.wow_sent_at) {
      return new Response(JSON.stringify({ skipped: 'already sent' }), { status: 200 });
    }

    const market = getMarket(trainer.locale ?? 'en');
    const message = await generateWowMessage(trainer, market);

    await sendToTrainer(
      {
        channel: trainer.assistant_channel ?? 'dashboard',
        telegram_chat_id: trainer.telegram_chat_id,
        whatsapp: trainer.whatsapp,
        trainer_id: trainer.id,
      },
      { text: message, parse_mode: 'Markdown' },
      'wow-agent',
    );

    // Mark as sent
    await sb.from('trainers').update({ wow_sent_at: new Date().toISOString() }).eq('id', trainerId);

    return new Response(JSON.stringify({ ok: true, trainer_id: trainerId }), { status: 200 });

  } catch (err) {
    console.error('WOW agent error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
