/**
 * TrainedBy — Support Agent
 * ─────────────────────────────────────────────────────────────────────────────
 * RAG-powered chatbot that answers trainer questions using the TrainedBy
 * knowledge base. Embedded on the dashboard page.
 *
 * POST /functions/v1/support-agent   — answer a trainer question
 * GET  /functions/v1/support-agent   — health check
 *
 * Architecture:
 *   1. Receive question from trainer
 *   2. Retrieve top-3 relevant knowledge chunks from `support_docs` table
 *      (uses Supabase pgvector similarity search if embeddings are available,
 *       falls back to keyword search)
 *   3. Build a grounded prompt with retrieved context
 *   4. Stream LLM response back to client
 *   5. Log conversation to `support_conversations` for meta-agent analysis
 *
 * Knowledge base is seeded in the `support_docs` table (see migration).
 * New docs can be added via the admin panel or directly in Supabase.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { jsonResponse, errorResponse, CORS_HEADERS } from '../_shared/errors.ts';
import { createLogger } from '../_shared/logger.ts';

const log = createLogger('support-agent');

// Fallback knowledge base (used if DB is empty or unavailable)
const FALLBACK_KB: Record<string, string> = {
  pricing: `TrainedBy has two tiers:
- **Free**: Verified profile, public listing, basic analytics. No credit card needed.
- **Pro (149 AED/month)**: Digital product sales, Affiliate Vault, Grand Slam Offer builder, priority listing, advanced analytics, custom domain.
You can upgrade or downgrade at any time from your dashboard.`,

  reps: `REPs UAE (Register of Exercise Professionals) is the official UAE fitness industry register. TrainedBy verifies your REPs status automatically when you sign up. Your badge appears on your public profile and builds client trust. If your REPs status changes, your badge updates automatically within 24 hours.`,

  digital_products: `Pro trainers can sell digital products directly from their TrainedBy profile:
- PDF training plans
- Video programmes
- Nutrition guides
- Assessment templates
Payments are processed via Stripe. You receive 95% of each sale (5% platform fee). Payouts are weekly to your UAE bank account.`,

  affiliate: `The Affiliate Vault gives Pro trainers access to pre-negotiated affiliate deals with UAE fitness brands (supplements, equipment, apparel). You activate the brands you want, share your unique link, and earn commission on every purchase — automatically, every month. No minimum threshold for payouts.`,

  referral: `Every Pro trainer gets a unique referral link. When another trainer signs up to Pro through your link, you earn 20% of their monthly subscription — recurring, for as long as they stay. Refer 4 trainers and your Pro subscription is free forever.`,

  plan_builder: `The Grand Slam Offer Builder (Plan Builder) helps you create high-ticket training packages that combine sessions, digital products, and affiliate products into a single compelling offer. It uses AI to suggest pricing and positioning based on your speciality and target client.`,

  magic_link: `TrainedBy uses passwordless login (magic links). Enter your email, receive a one-time login link, click it to access your dashboard. Links expire after 15 minutes. If you don't receive the email, check your spam folder or try again.`,

  profile: `Your TrainedBy profile URL is trainedby.ae/yourname. You can customise your slug, bio, specialities, certifications, and social links from the Edit Profile page. Your REPs badge is automatically added once verification is complete.`,

  cancel: `You can cancel your Pro subscription at any time from your dashboard under Settings → Subscription. Your profile reverts to the Free tier at the end of your billing period. Your digital products, affiliate earnings, and profile data are preserved.`,

  support: `For urgent issues, email support@trainedby.ae. Response time is within 4 hours during UAE business hours (Sun-Thu 9am-6pm GST).`,
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: CORS_HEADERS });
  }

  if (req.method === 'GET') {
    return jsonResponse({ status: 'ok', agent: 'support-agent', version: '1.0.0' });
  }

  if (req.method === 'POST') {
    return handleQuestion(req);
  }

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

    const sb = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // ── 1. Retrieve relevant knowledge chunks ─────────────────────────────
    let context = '';

    // Try DB first — use ilike for broad keyword matching
    try {
      const searchWords = trimmedQuestion
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 3)
        .slice(0, 3);

      let docs: Array<{ title: string; content: string }> | null = null;

      if (searchWords.length > 0) {
        // Try each word until we get results
        for (const word of searchWords) {
          const { data } = await sb
            .from('support_docs')
            .select('title, content')
            .or(`title.ilike.%${word}%,content.ilike.%${word}%`)
            .limit(3);
          if (data && data.length > 0) {
            docs = data;
            break;
          }
        }
      }

      if (!docs || docs.length === 0) {
        // Fallback: return top 3 docs by category relevance
        const { data } = await sb
          .from('support_docs')
          .select('title, content')
          .limit(3);
        docs = data;
      }

      if (docs && docs.length > 0) {
        context = docs.map((d: { title: string; content: string }) =>
          `### ${d.title}\n${d.content}`
        ).join('\n\n');
      }
    } catch (_dbErr) {
      // Fall through to fallback KB
    }

    // Fallback: keyword match against in-memory KB
    if (!context) {
      const q = trimmedQuestion.toLowerCase();
      const matched = Object.entries(FALLBACK_KB)
        .filter(([key]) => q.includes(key.replace(/_/g, ' ')) || q.includes(key))
        .map(([, val]) => val);

      // If no keyword match, include top 3 most relevant by word overlap
      if (matched.length === 0) {
        const qWords = new Set(q.split(/\s+/));
        const scored = Object.entries(FALLBACK_KB).map(([key, val]) => {
          const valWords = val.toLowerCase().split(/\s+/);
          const overlap = valWords.filter(w => qWords.has(w)).length;
          return { key, val, overlap };
        });
        scored.sort((a, b) => b.overlap - a.overlap);
        matched.push(...scored.slice(0, 3).map(s => s.val));
      }

      context = matched.slice(0, 3).join('\n\n');
    }

    // ── 2. Build grounded prompt ──────────────────────────────────────────
    const systemPrompt = `You are the TrainedBy support assistant — helpful, concise, and knowledgeable about the TrainedBy platform for UAE personal trainers.

Answer questions using ONLY the provided context. If the answer isn't in the context, say "I don't have that information — please email support@trainedby.ae" and nothing else.

Rules:
- Be concise (2-4 sentences max unless a list is needed)
- Use Markdown formatting for lists and bold text
- Always be friendly and professional
- Never make up features or pricing that aren't in the context
- If asked about something unrelated to TrainedBy, politely redirect

Context:
${context}`;

    // ── 3. Call LLM ───────────────────────────────────────────────────────
    const openaiBase = Deno.env.get('OPENAI_BASE_URL') ?? 'https://api.openai.com/v1';
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
        temperature: 0.2,
        max_tokens: 400,
      }),
    });

    const aiData = await aiRes.json();
    const answer = aiData.choices?.[0]?.message?.content ?? 'I could not generate an answer. Please email support@trainedby.ae.';

    // ── 4. Log conversation ───────────────────────────────────────────────
    const convId = conversation_id ?? crypto.randomUUID();
    await sb.from('support_conversations').insert({
      conversation_id: convId,
      trainer_id: trainer_id ?? null,
      question: trimmedQuestion,
      answer,
      context_used: context.substring(0, 500),
      duration_ms: Date.now() - start,
      created_at: new Date().toISOString(),
    }).catch(err => log.warn('Failed to log conversation', { error: String(err) }));

    log.info('Support question answered', {
      duration_ms: Date.now() - start,
      question_len: trimmedQuestion.length,
      answer_len: answer.length,
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
