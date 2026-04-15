/**
 * TrainedBy — Profile Agent
 * ─────────────────────────────────────────────────────────────────────────────
 * Triggered by: pg_cron every Sunday at 10:00
 *
 * What it does:
 *   For each Pro trainer with an incomplete or underperforming profile:
 *   1. Scores the profile across 6 dimensions
 *   2. Picks the single highest-impact improvement
 *   3. Sends one specific, actionable suggestion — not a list, not a lecture
 *
 * One suggestion per week. Specific. Actionable. Done in 5 minutes.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../_shared/logger.ts';
import { sendToTrainer } from '../_shared/channel.ts';
import { getMarket, type Locale } from '../_shared/locale.ts';

const log = createLogger('agent-profile');

const ANTHROPIC_KEY = () => Deno.env.get('ANTHROPIC_API_KEY')!;

interface ProfileScore {
  issue: string;
  priority: number; // 1 = highest
  suggestion: string;
}

function scoreProfile(trainer: Record<string, unknown>): ProfileScore | null {
  const issues: ProfileScore[] = [];

  // No photo
  if (!trainer.avatar_url) {
    issues.push({
      issue: 'no_photo',
      priority: 1,
      suggestion: 'Add a professional photo. Profiles with photos get 3x more leads. Use a clear headshot — gym background, good lighting.',
    });
  }

  // Bio too short or missing
  const bio = (trainer.bio as string) || '';
  if (bio.length < 80) {
    issues.push({
      issue: 'weak_bio',
      priority: 2,
      suggestion: `Your bio is ${bio.length < 10 ? 'missing' : 'too short'}. Write 3 sentences: who you help, how you help them, and one result you've achieved with a client. Keep it client-focused, not CV-focused.`,
    });
  }

  // No packages
  const packages = trainer.packages as unknown[];
  if (!packages?.length) {
    issues.push({
      issue: 'no_packages',
      priority: 3,
      suggestion: 'Add at least one package. Trainers with packages listed convert 40% more leads. Start with one: name it, price it, describe the outcome in one sentence.',
    });
  }

  // No specialties
  const specialties = trainer.specialties as string[];
  if (!specialties?.length) {
    issues.push({
      issue: 'no_specialties',
      priority: 4,
      suggestion: 'Add your specialties. This is how clients find you in search. Pick 3-5 that describe exactly who you help (e.g. "Fat Loss", "Postnatal Fitness", "Marathon Prep").',
    });
  }

  // No certifications
  const certs = trainer.certifications as string[];
  if (!certs?.length) {
    issues.push({
      issue: 'no_certs',
      priority: 5,
      suggestion: 'Add your certifications. Clients use this to decide whether to trust you. Even one cert listed increases conversion.',
    });
  }

  if (!issues.length) return null;

  // Return highest priority issue
  issues.sort((a, b) => a.priority - b.priority);
  return issues[0];
}

async function generatePersonalisedSuggestion(
  trainerName: string,
  issue: ProfileScore,
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
      max_tokens: 200,
      temperature: 0.4,
      system: `You are a direct, no-fluff business advisor for personal trainers in ${market.city}. Write in ${market.language}. Be specific and practical. Under 60 words.`,
      messages: [{
        role: 'user',
        content: `Trainer: ${trainerName}. Profile issue: ${issue.issue}. Base suggestion: "${issue.suggestion}". Rewrite this as a direct, personal message to ${trainerName}. Start with their name. Make it feel like advice from a colleague, not a system notification.`,
      }],
    }),
  });

  const data = await res.json();
  return data.content?.[0]?.text ?? issue.suggestion;
}

Deno.serve(async (_req: Request) => {
  const sb = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: trainers } = await sb
    .from('trainers')
    .select('id, name, full_name, bio, avatar_url, specialties, certifications, packages, locale, plan, assistant_channel, telegram_chat_id, whatsapp')
    .in('plan', ['pro', 'premium'])
    .limit(500);

  if (!trainers?.length) {
    return new Response(JSON.stringify({ ok: true, sent: 0 }), { status: 200 });
  }

  let sent = 0;
  for (const trainer of trainers) {
    const issue = scoreProfile(trainer as Record<string, unknown>);
    if (!issue) continue; // Profile is complete — nothing to suggest

    const market = getMarket(trainer.locale as Locale);
    const trainerName = trainer.name || trainer.full_name || 'Trainer';

    try {
      const suggestion = await generatePersonalisedSuggestion(trainerName, issue, market);

      const message = [
        `💡 *One thing to improve this week*`,
        '',
        suggestion,
        '',
        `_Tap Edit Profile to make the change. Takes 5 minutes._`,
      ].join('\n');

      await sendToTrainer(
        {
          channel: trainer.assistant_channel || 'dashboard',
          telegram_chat_id: trainer.telegram_chat_id,
          whatsapp: trainer.whatsapp,
          trainer_id: trainer.id,
        },
        { text: message },
        'profile-agent',
      );

      sent++;
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      log.error('Profile agent failed for trainer', { trainer_id: trainer.id, err });
    }
  }

  log.info('Profile agent done', { sent });
  return new Response(JSON.stringify({ ok: true, sent }), { status: 200 });
});
