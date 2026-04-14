/**
 * TrainedBy — Trainer AI Assistant
 * ─────────────────────────────────────────────────────────────────────────────
 * A personal AI assistant for each trainer. Knows their profile, clients,
 * leads, plan history, and the TrainedBy platform context.
 *
 * POST /functions/v1/trainer-assistant
 * Body: { trainer_id: string, message: string, conversation_id?: string }
 * Auth: Bearer <trainer JWT or service role>
 *
 * Capabilities:
 *   - Answer questions about their profile, leads, and clients
 *   - Generate workout plans, nutrition advice, and session structures
 *   - Write bio copy, social media captions, and email templates
 *   - Suggest pricing strategies based on their market
 *   - Explain their verification status and next steps
 *   - Help with client communication drafts
 *   - Give business growth advice specific to their market
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { CORS_HEADERS } from '../_shared/errors.ts';
import { createLogger } from '../_shared/logger.ts';
import { callClaude } from '../_shared/claude.ts';
import { getPersona, getMarket } from '../_shared/locale.ts';

const log = createLogger('trainer-assistant');

const SUPABASE_URL = () => Deno.env.get('SUPABASE_URL')!;
const SUPABASE_KEY = () => Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANTHROPIC_KEY = () => Deno.env.get('ANTHROPIC_API_KEY')!;

interface TrainerAssistantRequest {
  trainer_id: string;
  message: string;
  conversation_id?: string;
  locale?: string;
}

interface TrainerProfile {
  id: string;
  name: string;
  email: string;
  bio: string;
  specialisms: string[];
  certifications: string[];
  market: string;
  city: string;
  plan: string;
  reps_verified: boolean;
  verification_status: string;
  price_per_session: number;
  years_experience: number;
  languages: string[];
  created_at: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: CORS_HEADERS });

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  let body: TrainerAssistantRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  const { trainer_id, message, conversation_id, locale } = body;

  if (!trainer_id || !message) {
    return new Response(JSON.stringify({ error: 'trainer_id and message are required' }), {
      status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  const sb = createClient(SUPABASE_URL(), SUPABASE_KEY());

  // Load trainer profile
  const { data: trainer, error: trainerErr } = await sb
    .from('trainers')
    .select('*')
    .eq('id', trainer_id)
    .single();

  if (trainerErr || !trainer) {
    return new Response(JSON.stringify({ error: 'Trainer not found' }), {
      status: 404, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  const t = trainer as TrainerProfile;
  const market = getMarket(locale ?? t.market ?? 'ae');
  const persona = getPersona(locale ?? t.market ?? 'ae');

  // Load recent leads and conversations for context
  const [leads, convHistory, recentPlans] = await Promise.all([
    sb.from('leads').select('name, email, interest, created_at').eq('trainer_id', trainer_id)
      .order('created_at', { ascending: false }).limit(5),
    conversation_id
      ? sb.from('trainer_conversations').select('role, content, created_at')
          .eq('conversation_id', conversation_id)
          .order('created_at', { ascending: true }).limit(20)
      : Promise.resolve({ data: [] }),
    sb.from('ai_plans').select('goal, created_at').eq('trainer_id', trainer_id)
      .order('created_at', { ascending: false }).limit(3),
  ]);

  // Build trainer context
  const trainerContext = `
TRAINER PROFILE:
- Name: ${t.name}
- Market: ${market.name} (${market.currency} ${market.price}/mo platform fee)
- City: ${t.city || 'Not set'}
- Plan: ${t.plan} (${t.plan === 'pro' ? 'Pro — full access' : 'Free — limited features'})
- Verified: ${t.reps_verified ? `Yes (${market.certBody})` : 'Not yet verified'}
- Verification status: ${t.verification_status || 'unverified'}
- Bio: ${t.bio || 'Not written yet'}
- Specialisms: ${(t.specialisms ?? []).join(', ') || 'Not set'}
- Certifications: ${(t.certifications ?? []).join(', ') || 'Not set'}
- Price per session: ${t.price_per_session ? `${market.currency} ${t.price_per_session}` : 'Not set'}
- Years experience: ${t.years_experience || 'Not set'}
- Languages: ${(t.languages ?? []).join(', ') || 'Not set'}
- Member since: ${new Date(t.created_at).toLocaleDateString('en-AE')}

RECENT LEADS (${leads.data?.length ?? 0}):
${(leads.data ?? []).map((l: { name: string; email: string; interest: string; created_at: string }) =>
  `- ${l.name} (${l.email}): "${l.interest || 'General enquiry'}" — ${new Date(l.created_at).toLocaleDateString('en-AE')}`
).join('\n') || 'No leads yet'}

RECENT AI PLANS GENERATED: ${(recentPlans.data ?? []).length}
`;

  // Build conversation history
  const conversationHistory = (convHistory.data ?? []).map((m: { role: string; content: string }) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  // Add current message
  conversationHistory.push({ role: 'user', content: message });

  // Build system prompt
  const systemPrompt = `You are the personal AI assistant for ${t.name}, a personal trainer on the TrainedBy platform in ${market.name}.

${persona}

You have full knowledge of their profile, leads, and business context. You help them:
1. **Grow their business** — pricing, positioning, client acquisition, profile optimisation
2. **Serve their clients better** — workout plans, nutrition advice, session structures, progressions
3. **Write compelling content** — bio copy, social media captions, email templates, client communications
4. **Navigate the platform** — verification steps, Pro features, how to use their dashboard
5. **Understand their market** — what clients in ${market.name} want, local competition, pricing benchmarks

IMPORTANT RULES:
- Always respond in ${market.language === 'fr' ? 'French' : market.language === 'it' ? 'Italian' : market.language === 'es' ? 'Spanish' : 'English'} unless the trainer writes in a different language
- Be direct, practical, and specific — no generic advice
- When generating workout plans, use proper sets/reps/rest format
- When suggesting pricing, reference the ${market.name} market specifically
- If they ask about verification, explain the ${market.certBody} process
- Keep responses concise for chat (under 400 words unless generating a full plan)

${trainerContext}`;

  try {
    const response = await callClaude(ANTHROPIC_KEY(), {
      model: 'claude-haiku-4-5',
      system: systemPrompt,
      messages: conversationHistory,
      max_tokens: 800,
      temperature: 0.5,
    });

    const assistantMessage = response.text;

    // Save conversation to DB
    const convId = conversation_id ?? crypto.randomUUID();
    await sb.from('trainer_conversations').insert([
      { conversation_id: convId, trainer_id, role: 'user', content: message },
      { conversation_id: convId, trainer_id, role: 'assistant', content: assistantMessage },
    ]);

    log.info('Trainer assistant response', { trainer_id, conversation_id: convId, tokens: response.usage?.output_tokens });

    return new Response(JSON.stringify({
      reply: assistantMessage,
      conversation_id: convId,
      usage: response.usage,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });

  } catch (err) {
    log.exception(err);
    return new Response(JSON.stringify({ error: 'AI assistant unavailable. Please try again.' }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }
});
