/**
 * TrainedBy  -  Outreach Agent
 * ─────────────────────────────────────────────────────────────────────────────
 * Identifies expert trainers on the platform and sends personalised outreach
 * emails asking for their expert thoughts on a topic. Trainer-authored content
 * is the only content strategy  -  the platform never publishes AI-only blog posts
 * as "from a trainer".
 *
 * Actions:
 *   POST { action: 'identify' }            -  find best trainers to approach
 *   POST { action: 'draft', trainer_id, topic }  -  draft personalised outreach
 *   POST { action: 'send', request_id }    -  send the outreach email
 *   POST { action: 'run' }                 -  full weekly run (identify + draft + send)
 *   GET                                    -  health check
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { CORS_HEADERS } from '../_shared/errors.ts';
import { createLogger } from '../_shared/logger.ts';
import { callClaude } from '../_shared/claude.ts';
import { getMarketBaseUrl, getMarketBrand, getDashboardUrl, getMarketSupportEmail } from '../_shared/market_url.ts';

const log = createLogger('outreach-agent');

const SUPABASE_URL = () => Deno.env.get('SUPABASE_URL')!;
const SUPABASE_KEY = () => Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANTHROPIC_KEY = () => Deno.env.get('ANTHROPIC_API_KEY')!;
const RESEND_KEY = () => Deno.env.get('RESEND_API_KEY') ?? '';

// ── Blog topics pool  -  rotated weekly ─────────────────────────────────────────

const TOPIC_POOL = [
  { topic: 'The biggest mistake clients make in their first 30 days', category: 'client-education' },
  { topic: 'How I structure a consultation to close without being pushy', category: 'business' },
  { topic: 'What REPs certification actually means for client trust', category: 'credibility' },
  { topic: 'Training clients in Ramadan: what actually works', category: 'uae-specific' },
  { topic: 'The one metric I track for every client that predicts success', category: 'methodology' },
  { topic: 'How I built my first 10 clients without spending on ads', category: 'growth' },
  { topic: 'The difference between training in a hotel gym vs a box gym in Dubai', category: 'uae-specific' },
  { topic: 'Why most online training programmes fail and what I do differently', category: 'methodology' },
  { topic: 'How I price my services without underselling', category: 'business' },
  { topic: 'What I wish I knew before becoming a personal trainer in the UAE', category: 'career' },
];

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: CORS_HEADERS });

  if (req.method === 'GET') {
    return new Response(JSON.stringify({ status: 'ok', agent: 'outreach-agent', version: '1.0.0' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const body = await req.json() as { action?: string; trainer_id?: string; topic?: string; request_id?: string };
    const action = body.action ?? 'run';

    const sb = createClient(SUPABASE_URL(), SUPABASE_KEY());

    switch (action) {
      case 'identify':
        return Response.json(await identifyTrainers(sb));
      case 'draft':
        if (!body.trainer_id || !body.topic) {
          return Response.json({ error: 'trainer_id and topic required' }, { status: 400 });
        }
        return Response.json(await draftOutreach(sb, body.trainer_id, body.topic));
      case 'send':
        if (!body.request_id) {
          return Response.json({ error: 'request_id required' }, { status: 400 });
        }
        return Response.json(await sendOutreach(sb, body.request_id));
      case 'run':
        return Response.json(await weeklyRun(sb));
      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err) {
    log.exception(err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
});

// ── Identify best trainers to approach ────────────────────────────────────────

async function identifyTrainers(sb: ReturnType<typeof createClient>): Promise<Record<string, unknown>> {
  // Find trainers who:
  // 1. Have a bio (they can write)
  // 2. Are REPs verified (credibility)
  // 3. Haven't been approached in the last 30 days
  // 4. Have NOT already been sent an outreach this week

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: recentRequests } = await sb
    .from('content_requests')
    .select('trainer_id')
    .gte('created_at', thirtyDaysAgo);

  const recentTrainerIds = (recentRequests ?? []).map((r: { trainer_id: string }) => r.trainer_id);

  const query = sb
    .from('trainers')
    .select('id, name, email, city, specialties, bio, reps_verified, plan')
    .not('bio', 'is', null)
    .neq('bio', '')
    .eq('reps_verified', true)
    .limit(20);

  const { data: trainers } = await query;

  if (!trainers || trainers.length === 0) {
    return { candidates: [], message: 'No eligible trainers found. Need REPs-verified trainers with bios.' };
  }

  // Filter out recently approached
  const eligible = trainers.filter((t: { id: string }) => !recentTrainerIds.includes(t.id));

  // Score trainers: Pro trainers first, then by bio length (proxy for engagement)
  const scored = eligible.map((t: { id: string; name: string; email: string; city: string; specialties: string[]; bio: string; reps_verified: boolean; plan: string }) => ({
    ...t,
    score: (t.plan === 'pro' ? 10 : 0) + Math.min(t.bio?.length ?? 0, 500) / 50,
  })).sort((a: { score: number }, b: { score: number }) => b.score - a.score);

  log.info('Identified candidates', { count: scored.length });

  return {
    candidates: scored.slice(0, 5),
    total_eligible: eligible.length,
    total_trainers: trainers.length,
  };
}

// ── Draft personalised outreach email ─────────────────────────────────────────

async function draftOutreach(
  sb: ReturnType<typeof createClient>,
  trainerId: string,
  topic: string,
): Promise<Record<string, unknown>> {
  const { data: trainer } = await sb
    .from('trainers')
    .select('name, email, city, specialties, bio, plan')
    .eq('id', trainerId)
    .single();

  if (!trainer) return { error: 'Trainer not found' };

  const t = trainer as { name: string; email: string; city: string; specialties: string[]; bio: string; plan: string };

  const systemPrompt = `You are writing a personalised outreach email on behalf of TrainedBy.ae  -  a platform for verified personal trainers in the UAE. 

The email asks the trainer to share their expert thoughts on a topic for a blog post. The tone is collegial, direct, and respectful of their expertise. You are not asking them to write a full article  -  just to share their perspective in a few paragraphs, which the platform will format and publish under their name with their profile linked.

Rules:
- Address them by first name only
- Reference something specific about their background or location
- The ask is clear and low-effort: "Share your thoughts in a few paragraphs"
- No corporate language. No "I hope this email finds you well."
- Subject line: direct and specific, not clickbait
- Email body: under 150 words
- End with a simple yes/no question to make it easy to respond`;

  const userMessage = `Trainer: ${t.name}
City: ${t.city || 'UAE'}
Specialties: ${(t.specialties ?? []).join(', ') || 'Personal training'}
Bio snippet: ${(t.bio ?? '').substring(0, 200)}
Plan: ${t.plan}

Topic to pitch: "${topic}"

Write the outreach email (subject line + body).`;

  const response = await callClaude(ANTHROPIC_KEY(), {
    model: 'claude-haiku-4-5',
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
    max_tokens: 400,
    temperature: 0.6,
  });

  // Parse subject and body from response
  const lines = response.text.split('\n');
  const subjectLine = lines.find((l: string) => l.toLowerCase().startsWith('subject:'));
  const subject = subjectLine ? subjectLine.replace(/^subject:\s*/i, '').trim() : `Quick question, ${t.name.split(' ')[0]}`;
  const body = lines.filter((l: string) => !l.toLowerCase().startsWith('subject:')).join('\n').trim();

  // Save to content_requests
  const { data: request } = await sb.from('content_requests').insert({
    trainer_id: trainerId,
    topic,
    angle: topic,
    outreach_subject: subject,
    outreach_body: body,
    status: 'pending',
  }).select().single();

  return {
    request_id: (request as { id: string })?.id,
    trainer_name: t.name,
    trainer_email: t.email,
    subject,
    body,
    preview: body.substring(0, 200),
  };
}

// ── Send outreach email ────────────────────────────────────────────────────────

async function sendOutreach(sb: ReturnType<typeof createClient>, requestId: string): Promise<Record<string, unknown>> {
  const { data: request } = await sb
    .from('content_requests')
    .select('*, trainer:trainer_id(name, email, market)')
    .eq('id', requestId)
    .single();

  if (!request) return { error: 'Request not found' };

  const r = request as {
    id: string;
    topic: string;
    outreach_subject: string;
    outreach_body: string;
    status: string;
    trainer: { name: string; email: string; market?: string };
  };

  if (r.status !== 'pending') {
    return { error: `Request is already ${r.status}` };
  }

  const trainerEmail = r.trainer?.email;
  const trainerName = r.trainer?.name;
  const trainerMarket = r.trainer?.market ?? 'ae';
  const fromEmail = `${getMarketBrand(trainerMarket)} <${getMarketSupportEmail(trainerMarket)}>`;

  if (!trainerEmail) return { error: 'Trainer email not found' };

  // Send via Resend
  const resendKey = RESEND_KEY();
  if (!resendKey) {
    return { error: 'RESEND_API_KEY not set', would_send_to: trainerEmail };
  }

  const emailHtml = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a; padding: 32px 24px;">
  <div style="margin-bottom: 32px;">
    <img src="${getMarketBaseUrl(trainerMarket)}/logo.svg" alt="TrainedBy" style="height: 32px;" />
  </div>
  <div style="white-space: pre-wrap; line-height: 1.7; font-size: 15px;">${r.outreach_body}</div>
  <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e5e5; font-size: 13px; color: #666;">
    <p>${getMarketBrand(trainerMarket)}</p>
    <p><a href="${getDashboardUrl(trainerMarket)}" style="color: #FF5C00;">Your dashboard</a></p>
  </div>
</div>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: trainerEmail,
      subject: r.outreach_subject,
      html: emailHtml,
    }),
  });

  const resData = await res.json() as { id?: string; error?: string };

  if (!res.ok) {
    log.warn('Resend failed', { error: resData });
    return { error: `Email failed: ${JSON.stringify(resData)}` };
  }

  // Update status
  await sb.from('content_requests').update({
    status: 'sent',
    outreach_sent_at: new Date().toISOString(),
  }).eq('id', requestId);

  log.info('Outreach sent', { trainer: trainerName, topic: r.topic });

  return {
    sent: true,
    to: trainerEmail,
    subject: r.outreach_subject,
    resend_id: resData.id,
  };
}

// ── Weekly run: identify + draft + send for top 2 trainers ────────────────────

async function weeklyRun(sb: ReturnType<typeof createClient>): Promise<Record<string, unknown>> {
  log.info('Starting weekly outreach run');

  // Pick a topic based on week number
  const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const topic = TOPIC_POOL[weekNum % TOPIC_POOL.length];

  // Identify candidates
  const identified = await identifyTrainers(sb) as { candidates: Array<{ id: string; name: string }> };
  const candidates = identified.candidates ?? [];

  if (candidates.length === 0) {
    log.info('No candidates found for outreach');
    return { sent: 0, message: 'No eligible trainers found', topic: topic.topic };
  }

  // Draft and send to top 2 candidates
  const results = [];
  for (const candidate of candidates.slice(0, 2)) {
    try {
      const draft = await draftOutreach(sb, candidate.id, topic.topic) as { request_id?: string; error?: string };
      if (draft.error || !draft.request_id) {
        results.push({ trainer: candidate.name, status: 'draft_failed', error: draft.error });
        continue;
      }

      const sent = await sendOutreach(sb, draft.request_id) as { sent?: boolean; error?: string };
      results.push({
        trainer: candidate.name,
        status: sent.sent ? 'sent' : 'send_failed',
        error: sent.error,
      });
    } catch (err) {
      results.push({ trainer: candidate.name, status: 'error', error: String(err) });
    }
  }

  const sentCount = results.filter(r => r.status === 'sent').length;
  log.info('Weekly outreach complete', { sent: sentCount, topic: topic.topic });

  return {
    topic: topic.topic,
    category: topic.category,
    candidates_found: candidates.length,
    sent: sentCount,
    results,
  };
}
