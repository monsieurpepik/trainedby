/**
 * TrainedBy  -  Trainer AI Assistant
 * ─────────────────────────────────────────────────────────────────────────────
 * Context-aware AI assistant for Pro trainers.
 * Accessible via:
 *   - Dashboard chat (POST with { trainer_id, message, conversation_id })
 *   - WhatsApp webhook (routed from wa-webhook function)
 *   - Telegram bot (routed from trainer-bot function)
 *
 * Uses Claude tool_use (native function calling) to fetch live data and
 * take actions: draft messages, suggest packages, generate captions, etc.
 *
 * Only available to trainers on plan = 'pro' or 'premium'.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../_shared/logger.ts';
import { jsonResponse, errorResponse, CORS_HEADERS } from '../_shared/errors.ts';
import { getLocale, getMarket, getPersona, type Locale } from '../_shared/locale.ts';

const log = createLogger('trainer-assistant');

const ANTHROPIC_KEY = () => {
  const k = Deno.env.get('ANTHROPIC_API_KEY');
  if (!k) throw new Error('ANTHROPIC_API_KEY not set');
  return k;
};

const MODEL = 'claude-haiku-4-5'; // Fast enough for conversational use

// ── Tool definitions ──────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: 'get_leads',
    description: "Fetch the trainer's recent leads (enquiries from potential clients). Returns name, date, status, and any message.",
    input_schema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Max leads to return (default 10)' },
        status: {
          type: 'string',
          enum: ['new', 'contacted', 'converted', 'lost', 'all'],
          description: 'Filter by status',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_stats',
    description: "Fetch the trainer's profile analytics: views, leads, conversion rate, WhatsApp taps.",
    input_schema: {
      type: 'object',
      properties: {
        period: {
          type: 'string',
          enum: ['7d', '30d', '90d'],
          description: 'Time period (default 30d)',
        },
      },
      required: [],
    },
  },
  {
    name: 'draft_whatsapp_reply',
    description: 'Draft a professional WhatsApp reply to a specific lead. Returns a ready-to-send message.',
    input_schema: {
      type: 'object',
      properties: {
        lead_name: { type: 'string', description: 'Name of the lead to reply to' },
        lead_message: { type: 'string', description: 'What the lead said (if known)' },
        intent: {
          type: 'string',
          description: 'What the trainer wants to achieve (e.g. book a trial, send pricing, follow up)',
        },
      },
      required: ['lead_name', 'intent'],
    },
  },
  {
    name: 'draft_instagram_caption',
    description: "Draft an Instagram caption for the trainer to post. Tailored to their specialties and local market.",
    input_schema: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          description: 'Topic or theme of the post (e.g. "morning workout", "client transformation", "nutrition tip")',
        },
        tone: {
          type: 'string',
          enum: ['motivational', 'educational', 'personal', 'promotional'],
          description: 'Tone of the caption',
        },
      },
      required: ['topic'],
    },
  },
  {
    name: 'suggest_package',
    description: 'Suggest a session package the trainer could add to their profile, with name, price, description, and outcome.',
    input_schema: {
      type: 'object',
      properties: {
        goal: {
          type: 'string',
          description: 'Client goal this package should target (e.g. fat loss, marathon prep, muscle gain)',
        },
        sessions: { type: 'number', description: 'Number of sessions in the package' },
      },
      required: ['goal'],
    },
  },
  {
    name: 'improve_bio',
    description: "Rewrite the trainer's bio to be more compelling and client-focused.",
    input_schema: {
      type: 'object',
      properties: {
        focus: {
          type: 'string',
          description: 'What to emphasise (e.g. results, credentials, personality, niche)',
        },
      },
      required: [],
    },
  },
];

// ── Trainer context type ──────────────────────────────────────────────────────

interface TrainerContext {
  id: string;
  name: string;
  specialties: string[];
  bio: string;
  city: string;
  certifications: string[];
  locale: string;
  plan: string;
  packages: Array<{ name: string; price: number; sessions: number }>;
}

// ── Sub-prompt helper (used inside tool execution) ────────────────────────────

async function callClaudeText(system: string, user: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY(),
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 512,
      temperature: 0.7,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

// ── Tool execution ────────────────────────────────────────────────────────────

async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  trainer: TrainerContext,
  sb: ReturnType<typeof createClient>,
): Promise<string> {
  log.info('Executing tool', { tool: toolName });

  const market = getMarket(trainer.locale as Locale);
  const persona = getPersona(trainer.locale as Locale);

  switch (toolName) {
    case 'get_leads': {
      const limit = (toolInput.limit as number) || 10;
      const status = (toolInput.status as string) || 'all';
      let query = sb
        .from('leads')
        .select('id, name, email, message, status, created_at')
        .eq('trainer_id', trainer.id)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (status !== 'all') query = query.eq('status', status);
      const { data, error } = await query;
      if (error) return `Error fetching leads: ${error.message}`;
      if (!data || data.length === 0) return 'No leads found.';
      return JSON.stringify(
        data.map((l: Record<string, unknown>) => ({
          name: l.name,
          email: l.email,
          message: l.message || '(no message)',
          status: l.status,
          date: new Date(l.created_at as string).toLocaleDateString(),
        })),
      );
    }

    case 'get_stats': {
      const period = (toolInput.period as string) || '30d';
      const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
      const since = new Date(Date.now() - days * 86400000).toISOString();
      const { data, error } = await sb
        .from('profile_events')
        .select('event_type')
        .eq('trainer_id', trainer.id)
        .gte('created_at', since);
      if (error) return `Error fetching stats: ${error.message}`;
      const views = data?.filter((e: { event_type: string }) => e.event_type === 'view').length || 0;
      const leads = data?.filter((e: { event_type: string }) => e.event_type === 'lead').length || 0;
      const waTaps = data?.filter((e: { event_type: string }) => e.event_type === 'whatsapp_tap').length || 0;
      const convRate = views > 0 ? ((leads / views) * 100).toFixed(1) : '0';
      return JSON.stringify({ period, views, leads, whatsapp_taps: waTaps, conversion_rate: `${convRate}%` });
    }

    case 'draft_whatsapp_reply': {
      const { lead_name, lead_message, intent } = toolInput as Record<string, string>;
      return await callClaudeText(
        `You are a professional personal trainer named ${trainer.name} based in ${trainer.city || market.country}. Write a warm, professional WhatsApp message. Keep it under 100 words. No emojis unless the trainer uses them. Sound human, not corporate.`,
        `Draft a WhatsApp reply to ${lead_name}${lead_message ? ` who said: "${lead_message}"` : ''}. Intent: ${intent}. My specialties: ${trainer.specialties.join(', ')}.`,
      );
    }

    case 'draft_instagram_caption': {
      const { topic, tone = 'motivational' } = toolInput as Record<string, string>;
      return await callClaudeText(
        `${persona} You are a personal trainer writing Instagram content. Write a ${tone} caption about "${topic}". Include 3-5 relevant hashtags at the end. Keep it authentic and under 150 words.`,
        `Write an Instagram caption for ${trainer.name}, a ${trainer.specialties.join(' & ')} trainer in ${trainer.city || market.country}.`,
      );
    }

    case 'suggest_package': {
      const { goal, sessions = 8 } = toolInput as { goal: string; sessions?: number };
      return await callClaudeText(
        `You are a fitness business consultant. Suggest a session package for a personal trainer. Return a JSON object with: name, sessions, price (in ${market.currency}), description (1 sentence), outcome (what the client achieves), and guarantee (optional risk-reversal statement).`,
        `Trainer: ${trainer.name}, specialties: ${trainer.specialties.join(', ')}, market: ${market.country}. Suggest a ${sessions}-session package targeting: ${goal}.`,
      );
    }

    case 'improve_bio': {
      const { focus = 'results and personality' } = toolInput as Record<string, string>;
      return await callClaudeText(
        `${persona} You are a copywriter specialising in personal trainer profiles. Rewrite the bio to be client-focused, specific, and compelling. Max 80 words. No clichés ("passionate", "dedicated", "journey"). Focus on: ${focus}.`,
        `Trainer: ${trainer.name}, specialties: ${trainer.specialties.join(', ')}, city: ${trainer.city || market.country}, certifications: ${trainer.certifications.join(', ')}.\n\nCurrent bio: "${trainer.bio || '(no bio yet)'}"`,
      );
    }

    default:
      return `Unknown tool: ${toolName}`;
  }
}

// ── Agentic loop with tool_use ────────────────────────────────────────────────

async function runAssistant(
  trainer: TrainerContext,
  history: Array<{ role: string; content: unknown }>,
  userMessage: string,
  sb: ReturnType<typeof createClient>,
): Promise<string> {
  const market = getMarket(trainer.locale as Locale);
  const persona = getPersona(trainer.locale as Locale);

  const systemPrompt = `${persona}

You are the personal AI assistant for ${trainer.name}, a ${trainer.specialties.join(' & ')} trainer on ${market.brandName} in ${trainer.city || market.country}.

Trainer context:
- Specialties: ${trainer.specialties.join(', ') || 'not set'}
- Certifications: ${trainer.certifications.join(', ') || 'not set'}
- Current packages: ${trainer.packages.length > 0
    ? trainer.packages.map(p => `${p.name} (${p.sessions} sessions, ${market.currency} ${p.price})`).join('; ')
    : 'none yet  -  suggest adding some'}
- Bio: ${trainer.bio || '(not written yet)'}
- Plan: ${trainer.plan}

You have tools to fetch live data (leads, stats) and generate content (WhatsApp replies, Instagram captions, package suggestions, bio rewrites).

Be direct, practical, and specific. When a trainer asks for a draft or suggestion, use the relevant tool immediately and return the result. When they ask about their business performance, fetch the data first.

Keep responses concise  -  this is a chat interface. Use line breaks for readability. No markdown headers in chat responses.`;

  const messages: Array<{ role: string; content: unknown }> = [
    ...history,
    { role: 'user', content: userMessage },
  ];

  // Agentic loop  -  max 5 iterations to prevent runaway
  for (let i = 0; i < 5; i++) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_KEY(),
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        temperature: 0.3,
        system: systemPrompt,
        tools: TOOLS,
        messages,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    const stopReason: string = data.stop_reason;
    const content: Array<{ type: string; id?: string; name?: string; input?: Record<string, unknown>; text?: string }> = data.content ?? [];

    messages.push({ role: 'assistant', content });

    if (stopReason === 'end_turn') {
      const textBlock = content.find(b => b.type === 'text');
      return textBlock?.text ?? '';
    }

    if (stopReason === 'tool_use') {
      const toolResults: Array<{ type: string; tool_use_id: string; content: string }> = [];
      for (const block of content) {
        if (block.type !== 'tool_use') continue;
        const result = await executeTool(block.name!, block.input ?? {}, trainer, sb);
        toolResults.push({ type: 'tool_result', tool_use_id: block.id!, content: result });
      }
      messages.push({ role: 'user', content: toolResults });
      continue;
    }

    break;
  }

  return 'I was unable to complete that request. Please try again.';
}

// ── Conversation persistence ──────────────────────────────────────────────────

async function getHistory(
  sb: ReturnType<typeof createClient>,
  trainerId: string,
  conversationId: string,
  limit = 12,
): Promise<Array<{ role: string; content: unknown }>> {
  const { data } = await sb
    .from('assistant_conversations')
    .select('role, content')
    .eq('trainer_id', trainerId)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit);
  return (data ?? []).map((r: { role: string; content: unknown }) => ({ role: r.role, content: r.content }));
}

async function saveMessages(
  sb: ReturnType<typeof createClient>,
  trainerId: string,
  conversationId: string,
  userMsg: string,
  assistantMsg: string,
): Promise<void> {
  const now = new Date().toISOString();
  await sb.from('assistant_conversations').insert([
    { trainer_id: trainerId, conversation_id: conversationId, role: 'user', content: userMsg, created_at: now },
    { trainer_id: trainerId, conversation_id: conversationId, role: 'assistant', content: assistantMsg, created_at: now },
  ]);
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });

  const start = Date.now();
  const sb = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    const body = await req.json();
    const {
      trainer_id,
      message,
      conversation_id = 'default',
      source = 'dashboard', // 'dashboard' | 'whatsapp' | 'telegram'
    } = body;

    if (!trainer_id || !message) {
      return errorResponse('trainer_id and message are required', 400);
    }

    // Fetch trainer
    const { data: trainer, error: trainerErr } = await sb
      .from('trainers')
      .select('id, name, full_name, specialties, bio, city, certifications, locale, plan, packages')
      .eq('id', trainer_id)
      .single();

    if (trainerErr || !trainer) return errorResponse('Trainer not found', 404);

    // Pro gate
    if (trainer.plan !== 'pro' && trainer.plan !== 'premium') {
      return errorResponse('AI assistant is a Pro feature. Upgrade at /pricing.', 403);
    }

    const ctx: TrainerContext = {
      id: trainer.id,
      name: trainer.name || trainer.full_name || 'Trainer',
      specialties: Array.isArray(trainer.specialties) ? trainer.specialties : [],
      bio: trainer.bio || '',
      city: trainer.city || '',
      certifications: Array.isArray(trainer.certifications) ? trainer.certifications : [],
      locale: trainer.locale || 'en',
      plan: trainer.plan,
      packages: Array.isArray(trainer.packages) ? trainer.packages : [],
    };

    const history = await getHistory(sb, trainer_id, conversation_id);
    const reply = await runAssistant(ctx, history, message, sb);
    await saveMessages(sb, trainer_id, conversation_id, message, reply);

    log.info('Assistant reply sent', {
      trainer_id,
      source,
      conversation_id,
      duration_ms: Date.now() - start,
    });

    return jsonResponse({ ok: true, reply, conversation_id });

  } catch (err) {
    log.exception(err, { step: 'trainer_assistant' });
    return errorResponse('Assistant error', 500);
  }
});
