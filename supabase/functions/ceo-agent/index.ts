/**
 * TrainedBy — CEO Agent (Telegram Orchestrator)
 * ─────────────────────────────────────────────────────────────────────────────
 * The AI CEO that orchestrates all agents and communicates with the founder
 * via Telegram. Acts as the single point of control for the entire Agent OS.
 *
 * Telegram webhook: POST /functions/v1/ceo-agent
 *
 * Commands:
 *   /start        — Welcome message + status overview
 *   /status       — Live health check of all agents + DB metrics
 *   /growth       — Trigger growth agent digest now
 *   /content      — Generate a new blog post now
 *   /meta         — Run meta-agent product improvement memo now
 *   /posts        — List recent blog posts
 *   /memo         — Show latest meta-agent memo
 *   /ask <text>   — Ask the CEO agent a free-form question about the business
 *   /help         — Show all commands
 *
 * Proactive reports (triggered by other agents):
 *   - Weekly growth digest (Monday 9am GST)
 *   - New blog post published
 *   - Weekly product improvement memo (Sunday 8pm GST)
 *   - Anomaly alerts (conversion drop > 20%)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { CORS_HEADERS } from '../_shared/errors.ts';
import { createLogger } from '../_shared/logger.ts';
import { callClaude } from '../_shared/claude.ts';

const log = createLogger('ceo-agent');

const BOT_TOKEN = () => Deno.env.get('TELEGRAM_BOT_TOKEN')!;
const FOUNDER_CHAT_ID = () => Deno.env.get('TELEGRAM_FOUNDER_CHAT_ID')!;
const SUPABASE_URL = () => Deno.env.get('SUPABASE_URL')!;
const SUPABASE_KEY = () => Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANTHROPIC_KEY = () => Deno.env.get('ANTHROPIC_API_KEY')!;
const SELF_URL = () => Deno.env.get('SUPABASE_FUNCTION_URL') ?? `https://mezhtdbfyvkshpuplqqw.supabase.co/functions/v1`;

// ── Telegram helpers ──────────────────────────────────────────────────────────

async function sendMessage(chatId: string | number, text: string, parseMode = 'Markdown'): Promise<void> {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN()}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: parseMode, disable_web_page_preview: true }),
  });
}

async function sendTyping(chatId: string | number): Promise<void> {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN()}/sendChatAction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, action: 'typing' }),
  });
}

// ── Auth guard ────────────────────────────────────────────────────────────────

function isAuthorized(chatId: number): boolean {
  return String(chatId) === FOUNDER_CHAT_ID();
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: CORS_HEADERS });

  // Health check
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ status: 'ok', agent: 'ceo-agent', version: '1.0.0' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Proactive notification endpoint (called by other agents)
  const url = new URL(req.url);
  if (req.method === 'POST' && url.pathname.endsWith('/notify')) {
    return handleNotify(req);
  }

  // Telegram webhook
  if (req.method === 'POST') {
    return handleTelegramUpdate(req);
  }

  return new Response('Method not allowed', { status: 405 });
});

async function handleTelegramUpdate(req: Request): Promise<Response> {
  let update: Record<string, unknown>;
  try {
    update = await req.json();
  } catch {
    return new Response('ok', { status: 200 });
  }

  const message = update.message as Record<string, unknown> | undefined;
  if (!message) return new Response('ok', { status: 200 });

  const chatId = (message.chat as Record<string, unknown>)?.id as number;
  const text = (message.text as string) ?? '';
  const from = message.from as Record<string, unknown>;

  log.info('Telegram message', { chatId, text: text.substring(0, 50) });

  // Auth check
  if (!isAuthorized(chatId)) {
    await sendMessage(chatId, '⛔ Unauthorized. This bot is private.');
    return new Response('ok', { status: 200 });
  }

  // Route commands
  const command = text.split(' ')[0].toLowerCase();
  const args = text.slice(command.length).trim();

  try {
    switch (command) {
      case '/start':
        await handleStart(chatId, from);
        break;
      case '/status':
        await handleStatus(chatId);
        break;
      case '/growth':
        await handleTriggerGrowth(chatId);
        break;
      case '/content':
        await handleTriggerContent(chatId);
        break;
      case '/meta':
        await handleTriggerMeta(chatId);
        break;
      case '/posts':
        await handleListPosts(chatId);
        break;
      case '/memo':
        await handleLatestMemo(chatId);
        break;
      case '/ask':
        if (!args) {
          await sendMessage(chatId, '❓ Usage: `/ask <your question>`\n\nExample: `/ask Why is our join conversion low?`');
        } else {
          await handleAsk(chatId, args);
        }
        break;
      case '/help':
        await handleHelp(chatId);
        break;
      default:
        // Treat any non-command message as a free-form question
        if (!text.startsWith('/')) {
          await handleAsk(chatId, text);
        } else {
          await sendMessage(chatId, `Unknown command: \`${command}\`\n\nType /help to see all commands.`);
        }
    }
  } catch (err) {
    log.exception(err);
    await sendMessage(chatId, '⚠️ Something went wrong. Check the Supabase logs.');
  }

  return new Response('ok', { status: 200 });
}

// ── Command handlers ──────────────────────────────────────────────────────────

async function handleStart(chatId: number, from: Record<string, unknown>): Promise<void> {
  const name = (from?.first_name as string) ?? 'Founder';
  await sendMessage(chatId, `👋 *Hey ${name}.*

I'm your AI CEO for TrainedBy. I run the business while you focus on growth.

Here's what I manage:
📈 *Growth Agent* — tracks your funnel, spots drop-offs, emails you weekly
✍️ *Content Agent* — publishes one SEO blog post per week automatically
💬 *Support Agent* — answers trainer questions 24/7
🧠 *Meta Agent* — synthesises everything into weekly product improvement memos

*Quick commands:*
/status — live metrics right now
/growth — trigger weekly growth digest
/content — publish a new blog post
/meta — run product improvement analysis
/ask — ask me anything about the business

What do you want to know?`);
}

async function handleHelp(chatId: number): Promise<void> {
  await sendMessage(chatId, `*TrainedBy CEO Agent — Commands*

/status — Live health check + key metrics
/growth — Trigger growth agent digest now
/content — Generate + publish a new blog post
/meta — Run product improvement memo now
/posts — List recent blog posts
/memo — Show latest meta-agent memo
/ask <question> — Ask me anything about the business

Or just type any message — I'll answer it directly.`);
}

async function handleStatus(chatId: number): Promise<void> {
  await sendTyping(chatId);
  const sb = createClient(SUPABASE_URL(), SUPABASE_KEY());

  const [trainers, leads, posts, convs, memos] = await Promise.all([
    sb.from('trainers').select('id, plan, created_at', { count: 'exact' }),
    sb.from('leads').select('id', { count: 'exact' }),
    sb.from('blog_posts').select('id, title, published_at').order('published_at', { ascending: false }).limit(1),
    sb.from('support_conversations').select('id', { count: 'exact' })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    sb.from('agent_memos').select('agent, created_at').order('created_at', { ascending: false }).limit(4),
  ]);

  const totalTrainers = trainers.count ?? 0;
  const proTrainers = (trainers.data ?? []).filter((t: { plan: string }) => t.plan === 'pro').length;
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newThisWeek = (trainers.data ?? []).filter((t: { created_at: string }) => new Date(t.created_at) > weekAgo).length;
  const latestPost = posts.data?.[0];
  const lastMemos = (memos.data ?? []).map((m: { agent: string; created_at: string }) =>
    `  • ${m.agent}: ${new Date(m.created_at).toLocaleDateString('en-AE')}`
  ).join('\n');

  await sendMessage(chatId, `📊 *TrainedBy Status*

👥 *Trainers*
  Total: ${totalTrainers} | Pro: ${proTrainers} | New this week: ${newThisWeek}

📋 *Leads*
  Total: ${leads.count ?? 0}

✍️ *Latest Blog Post*
  ${latestPost ? `"${latestPost.title}"\n  Published: ${new Date(latestPost.published_at).toLocaleDateString('en-AE')}` : 'None yet'}

💬 *Support (last 7 days)*
  ${convs.count ?? 0} conversations handled

🤖 *Agent Last Runs*
${lastMemos || '  No runs yet'}

All systems operational ✅`);
}

async function handleTriggerGrowth(chatId: number): Promise<void> {
  await sendMessage(chatId, '📈 Triggering growth agent digest...');
  await sendTyping(chatId);

  try {
    const res = await fetch(`${SELF_URL()}/growth-agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_KEY()}` },
      body: JSON.stringify({ action: 'digest' }),
    });
    const data = await res.json();

    if (data.error) {
      await sendMessage(chatId, `❌ Growth agent failed: ${data.error}`);
      return;
    }

    const memo = data.memo ?? {};
    const drops = memo.biggest_drop_step ? `\n📉 Biggest drop: *${memo.biggest_drop_step}* (${memo.biggest_drop_pct?.toFixed(0)}%)` : '';
    const hyp = memo.hypothesis ? `\n\n💡 *Hypothesis:* ${memo.hypothesis}` : '';
    const suggs = (memo.suggestions as string[] ?? []).slice(0, 3).map((s: string, i: number) => `  ${i + 1}. ${s}`).join('\n');

    await sendMessage(chatId, `📈 *Growth Digest*

👥 New trainers: *${memo.new_trainers ?? 0}* (${memo.new_trainers_delta >= 0 ? '+' : ''}${memo.new_trainers_delta ?? 0} vs last week)
📊 Overall conversion: *${memo.overall_conversion_pct ?? 0}%*${drops}${hyp}

*Suggestions:*
${suggs || '  No data yet — add funnel tracking to the frontend'}`);
  } catch (err) {
    await sendMessage(chatId, `❌ Error: ${String(err)}`);
  }
}

async function handleTriggerContent(chatId: number): Promise<void> {
  await sendMessage(chatId, '✍️ Generating new blog post... (this takes ~30 seconds)');
  await sendTyping(chatId);

  try {
    const res = await fetch(`${SELF_URL()}/content-agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_KEY()}` },
      body: JSON.stringify({}),
    });
    const data = await res.json();

    if (data.error) {
      await sendMessage(chatId, `❌ Content agent failed: ${data.error}`);
      return;
    }

    const post = data.post ?? {};
    const quality = data.quality ?? {};

    await sendMessage(chatId, `✅ *New Blog Post Published*

📝 *"${post.title}"*
🔑 Keyword: ${post.keyword}
📊 ${post.word_count} words | Slop score: ${quality.slop_score ?? 0}/100
🔗 trainedby.ae/blog/${post.slug}

${quality.slop_score > 20 ? '⚠️ Slop score is high — review before promoting' : '✅ Quality check passed'}`);
  } catch (err) {
    await sendMessage(chatId, `❌ Error: ${String(err)}`);
  }
}

async function handleTriggerMeta(chatId: number): Promise<void> {
  await sendMessage(chatId, '🧠 Running meta-agent analysis... (this takes ~30 seconds)');
  await sendTyping(chatId);

  try {
    const res = await fetch(`${SELF_URL()}/meta-agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_KEY()}` },
      body: JSON.stringify({}),
    });
    const data = await res.json();

    if (data.error) {
      await sendMessage(chatId, `❌ Meta agent failed: ${data.error}`);
      return;
    }

    const memo = data.memo ?? {};
    const improvements = (memo.improvements as Array<{ rank: number; title: string; metric_moved: string }> ?? [])
      .slice(0, 3)
      .map(i => `  ${i.rank}. *${i.title}* → ${i.metric_moved}`)
      .join('\n');

    const quickWin = memo.quick_win as { title: string; estimated_hours: number } | undefined;
    const bigBet = memo.big_bet as { title: string; success_metric: string } | undefined;

    await sendMessage(chatId, `🧠 *Weekly Product Memo*

${memo.executive_summary ?? 'No summary'}

*Top 3 Improvements:*
${improvements || '  No data yet'}

⚡ *Quick Win (${quickWin?.estimated_hours ?? '?'}h):* ${quickWin?.title ?? 'N/A'}

🎯 *Big Bet:* ${bigBet?.title ?? 'N/A'}
  Success metric: ${bigBet?.success_metric ?? 'N/A'}

📌 *Watch this week:* ${memo.watch_metric ?? 'N/A'}`);
  } catch (err) {
    await sendMessage(chatId, `❌ Error: ${String(err)}`);
  }
}

async function handleListPosts(chatId: number): Promise<void> {
  await sendTyping(chatId);
  const sb = createClient(SUPABASE_URL(), SUPABASE_KEY());
  const { data } = await sb
    .from('blog_posts')
    .select('title, keyword, word_count, published_at, slug')
    .order('published_at', { ascending: false })
    .limit(8);

  if (!data || data.length === 0) {
    await sendMessage(chatId, '📝 No blog posts yet. Use /content to generate the first one.');
    return;
  }

  const list = data.map((p: { title: string; keyword: string; word_count: number; published_at: string; slug: string }, i: number) =>
    `${i + 1}. *${p.title}*\n   ${p.keyword} | ${p.word_count}w | ${new Date(p.published_at).toLocaleDateString('en-AE')}`
  ).join('\n\n');

  await sendMessage(chatId, `📝 *Recent Blog Posts*\n\n${list}`);
}

async function handleLatestMemo(chatId: number): Promise<void> {
  await sendTyping(chatId);
  const sb = createClient(SUPABASE_URL(), SUPABASE_KEY());
  const { data } = await sb
    .from('agent_memos')
    .select('memo, created_at')
    .eq('agent', 'meta-agent')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!data) {
    await sendMessage(chatId, '🧠 No memo yet. Use /meta to generate one.');
    return;
  }

  const memo = data.memo as Record<string, unknown>;
  const improvements = (memo.improvements as Array<{ rank: number; title: string }> ?? [])
    .slice(0, 5)
    .map(i => `  ${i.rank}. ${i.title}`)
    .join('\n');

  await sendMessage(chatId, `🧠 *Latest Product Memo*
_Generated: ${new Date(data.created_at).toLocaleDateString('en-AE')}_

${memo.executive_summary ?? ''}

*Improvements:*
${improvements}

⚡ Quick win: ${(memo.quick_win as { title: string })?.title ?? 'N/A'}
🎯 Big bet: ${(memo.big_bet as { title: string })?.title ?? 'N/A'}
📌 Watch: ${memo.watch_metric ?? 'N/A'}`);
}

async function handleAsk(chatId: number, question: string): Promise<void> {
  await sendTyping(chatId);

  const sb = createClient(SUPABASE_URL(), SUPABASE_KEY());

  // Pull recent context from DB
  const [trainers, posts, memos, convs] = await Promise.all([
    sb.from('trainers').select('plan, created_at').order('created_at', { ascending: false }).limit(100),
    sb.from('blog_posts').select('title, keyword, published_at').order('published_at', { ascending: false }).limit(5),
    sb.from('agent_memos').select('agent, memo, created_at').order('created_at', { ascending: false }).limit(3),
    sb.from('support_conversations').select('question, answer').order('created_at', { ascending: false }).limit(5),
  ]);

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const totalTrainers = trainers.data?.length ?? 0;
  const proTrainers = (trainers.data ?? []).filter((t: { plan: string }) => t.plan === 'pro').length;
  const newThisWeek = (trainers.data ?? []).filter((t: { created_at: string }) => new Date(t.created_at) > weekAgo).length;

  const context = `
Current business metrics:
- Total trainers: ${totalTrainers} (${proTrainers} Pro, ${totalTrainers - proTrainers} Free)
- New trainers this week: ${newThisWeek}
- Recent blog posts: ${(posts.data ?? []).map((p: { title: string }) => p.title).join(', ')}
- Recent agent memos: ${(memos.data ?? []).map((m: { agent: string; created_at: string }) => `${m.agent} (${new Date(m.created_at).toLocaleDateString()})`).join(', ')}
- Recent support questions: ${(convs.data ?? []).map((c: { question: string }) => c.question).join(' | ')}
`;

  const systemPrompt = `You are the AI CEO of TrainedBy.ae — a UAE platform for verified personal trainers. You have full visibility into the business metrics, agent outputs, and product roadmap.

You communicate via Telegram with the founder. Be direct, specific, and actionable. No fluff. If you don't know something, say so.

${context}`;

  try {
    const response = await callClaude(ANTHROPIC_KEY(), {
      model: 'claude-haiku-4-5',
      system: systemPrompt,
      messages: [{ role: 'user', content: question }],
      max_tokens: 500,
      temperature: 0.4,
    });

    await sendMessage(chatId, response.text);
  } catch (err) {
    log.warn('Claude call failed in /ask', { error: String(err) });
    await sendMessage(chatId, `I couldn't process that right now. Try /status for live metrics or /help for available commands.`);
  }
}

// ── Proactive notification handler ────────────────────────────────────────────

async function handleNotify(req: Request): Promise<Response> {
  try {
    const { type, data } = await req.json() as { type: string; data: Record<string, unknown> };
    const chatId = FOUNDER_CHAT_ID();

    switch (type) {
      case 'blog_published':
        await sendMessage(chatId, `✍️ *New post published*\n\n"${data.title}"\n🔑 ${data.keyword} | ${data.word_count}w\n🔗 trainedby.ae/blog/${data.slug}`);
        break;
      case 'growth_digest':
        await sendMessage(chatId, `📈 *Weekly Growth Digest ready*\n\n${data.summary ?? 'Check /growth for details'}`);
        break;
      case 'meta_memo':
        await sendMessage(chatId, `🧠 *Weekly Product Memo ready*\n\n${data.summary ?? 'Check /memo for details'}`);
        break;
      case 'anomaly':
        await sendMessage(chatId, `🚨 *Anomaly detected*\n\n${data.message}`);
        break;
      default:
        await sendMessage(chatId, `📬 Agent update: ${JSON.stringify(data).substring(0, 200)}`);
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
