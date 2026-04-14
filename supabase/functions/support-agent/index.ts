/**
 * TrainedBy — Support Agent v2
 * ─────────────────────────────────────────────────────────────────────────────
 * RAG-powered chatbot with the TrainedBy Voice System applied.
 * Answers trainer questions like a knowledgeable colleague, not a corporate bot.
 *
 * POST /functions/v1/support-agent   — answer a trainer question
 * GET  /functions/v1/support-agent   — health check
 *
 * Anti-slop measures:
 *   1. Persona injection: answers like a senior trainer who knows the platform
 *   2. Banned phrase list enforced
 *   3. Response length capped at 3-4 sentences (prevents over-explaining)
 *   4. Slop score logged for monitoring (no retry — speed matters in chat)
 *   5. Temperature 0.3 (factual accuracy) with persona to prevent blandness
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { jsonResponse, errorResponse, CORS_HEADERS } from '../_shared/errors.ts';
import { createLogger } from '../_shared/logger.ts';
import { calculateSlopScore } from '../_shared/voice.ts';

const log = createLogger('support-agent');

// Fallback knowledge base
const FALLBACK_KB: Record<string, string> = {
  pricing: 'TrainedBy has two tiers: Free (verified profile, public listing, basic analytics — no card needed) and Pro (149 AED/month — digital product sales, Affiliate Vault, Grand Slam Offer builder, priority listing, advanced analytics, custom domain). Upgrade or downgrade any time from your dashboard.',
  reps: 'REPs UAE is the official UAE fitness register. TrainedBy verifies your REPs status automatically at signup. Your badge appears on your public profile and updates within 24 hours if your status changes.',
  digital_products: 'Pro trainers sell digital products (PDF plans, video programmes, nutrition guides) directly from their profile. Stripe handles payments. You keep 95% — 5% platform fee. Weekly payouts to your UAE bank account.',
  affiliate: 'The Affiliate Vault gives Pro trainers pre-negotiated deals with UAE fitness brands. Activate the brands you want, share your link, earn commission automatically every month. No minimum payout threshold.',
  referral: 'Every Pro trainer gets a referral link. Refer another trainer to Pro and earn 20% of their subscription — recurring, for as long as they stay. Refer 4 trainers and your Pro is free forever.',
  plan_builder: 'The Grand Slam Offer Builder creates high-ticket packages combining sessions, digital products, and affiliate products. AI suggests pricing and positioning based on your speciality.',
  magic_link: 'TrainedBy uses passwordless login. Enter your email, get a one-time link, click it. Links expire in 15 minutes. Not in your inbox? Check spam.',
  profile: 'Your profile URL is trainedby.ae/yourname. Customise slug, bio, specialities, certifications, and social links from Edit Profile. REPs badge adds automatically after verification.',
  cancel: 'Cancel Pro any time from Settings → Subscription. Profile reverts to Free at end of billing period. Your data, digital products, and affiliate earnings are preserved.',
  support: 'Urgent issues: support@trainedby.ae. Response within 4 hours, Sun-Thu 9am-6pm GST.',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: CORS_HEADERS });
  }
  if (req.method === 'GET') {
    return jsonResponse({ status: 'ok', agent: 'support-agent', version: '2.0.0' });
  }
  if (req.method === 'POST') return handleQuestion(req);
  return errorResponse('Method not allowed', 405);
});

async function handleQuestion(req: Request): Promise<Response> {
  const start = Date.now();

  try {
    const body = await req.json().catch(() => ({}));
    const { question, trainer_id, conversation_id } = body as {
      question: string;
      trainer_id?: string;
      conversation_id?: string;
    };

    if (!question || typeof question !== 'string' || question.trim().length < 3) {
      return errorResponse('Missing or invalid question', 400, 'VALIDATION_ERROR');
    }

    const trimmedQuestion = question.trim().substring(0, 500);

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) return errorResponse('Support agent not configured', 500);

    const openaiBase = (Deno.env.get('OPENAI_BASE_URL') ?? 'https://api.openai.com/v1');

    const sb = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // ── 1. Retrieve knowledge chunks ──────────────────────────────────────────
    let context = '';

    try {
      const searchWords = trimmedQuestion
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 3)
        .slice(0, 3);

      let docs: Array<{ title: string; content: string }> | null = null;

      for (const word of searchWords) {
        const { data } = await sb
          .from('support_docs')
          .select('title, content')
          .or(`title.ilike.%${word}%,content.ilike.%${word}%`)
          .limit(3);
        if (data && data.length > 0) { docs = data; break; }
      }

      if (!docs || docs.length === 0) {
        const { data } = await sb.from('support_docs').select('title, content').limit(3);
        docs = data;
      }

      if (docs && docs.length > 0) {
        context = docs.map((d: { title: string; content: string }) =>
          `${d.title}: ${d.content}`
        ).join('\n\n');
      }
    } catch (_dbErr) {
      // Fall through to fallback KB
    }

    // Fallback KB
    if (!context) {
      const q = trimmedQuestion.toLowerCase();
      const matched = Object.entries(FALLBACK_KB)
        .filter(([key]) => q.includes(key.replace(/_/g, ' ')) || q.includes(key))
        .map(([, val]) => val);

      if (matched.length === 0) {
        const qWords = new Set(q.split(/\s+/));
        const scored = Object.entries(FALLBACK_KB).map(([key, val]) => {
          const overlap = val.toLowerCase().split(/\s+/).filter(w => qWords.has(w)).length;
          return { key, val, overlap };
        });
        scored.sort((a, b) => b.overlap - a.overlap);
        matched.push(...scored.slice(0, 3).map(s => s.val));
      }

      context = matched.slice(0, 3).join('\n\n');
    }

    // ── 2. Build human-sounding system prompt ─────────────────────────────────
    const systemPrompt = `You are the TrainedBy support assistant. You know this platform inside out.

Your tone: Direct, warm, no-nonsense. You answer like a knowledgeable colleague — not a customer service bot.

Rules:
- Answer in 2-4 sentences MAX unless a short list genuinely helps
- No corporate phrases ("I'd be happy to help", "Great question!", "Certainly!")
- No hedging ("It might be worth considering...")
- If the answer isn't in the context below, say: "I don't have that info — email support@trainedby.ae and they'll sort you out."
- Use Markdown sparingly (bold for key numbers/prices only)
- Never make up features or prices

Context (use ONLY this):
${context}`;

    // ── 3. Call LLM (with graceful fallback to KB-only answer) ──────────────────
    let answer = '';
    try {
      const aiRes = await fetch(`${openaiBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-nano',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: trimmedQuestion },
          ],
          temperature: 0.3,
          max_tokens: 300,
        }),
      });

      if (!aiRes.ok) throw new Error(`LLM returned ${aiRes.status}`);
      const aiData = await aiRes.json();
      answer = aiData.choices?.[0]?.message?.content ?? '';
    } catch (llmErr) {
      log.warn('LLM call failed — using KB fallback', { error: String(llmErr) });
    }

    // KB-only fallback: return the most relevant context chunk directly
    if (!answer) {
      if (context) {
        // Extract the first meaningful sentence from the context
        const firstChunk = context.split('\n\n')[0].replace(/^###.*\n/, '').trim();
        answer = firstChunk.length > 20
          ? firstChunk
          : "I don't have that info — email support@trainedby.ae and they'll sort you out.";
      } else {
        answer = "I don't have that info — email support@trainedby.ae and they'll sort you out.";
      }
    }

    // ── 4. Log slop score (no retry for chat — speed matters) ─────────────────
    const { score: slopScore, found: slopFound } = calculateSlopScore(answer);
    if (slopScore > 20) {
      log.warn('High slop score in support response', { score: slopScore, found: slopFound });
    }

    // ── 5. Log conversation ───────────────────────────────────────────────────
    const convId = conversation_id ?? crypto.randomUUID();
    try {
      await sb.from('support_conversations').insert({
        conversation_id: convId,
        trainer_id: trainer_id ?? null,
        question: trimmedQuestion,
        answer,
        context_used: context.substring(0, 500),
        duration_ms: Date.now() - start,
        created_at: new Date().toISOString(),
      });
    } catch (convErr) {
      log.warn('Failed to log conversation', { error: String(convErr) });
    }

    log.info('Support question answered', {
      duration_ms: Date.now() - start,
      slop_score: slopScore,
    });

    return jsonResponse({
      answer,
      conversation_id: convId,
      sources: context ? ['TrainedBy Knowledge Base'] : [],
    });
  } catch (err) {
    log.exception(err);
    return errorResponse('Internal error', 500);
  }
}
