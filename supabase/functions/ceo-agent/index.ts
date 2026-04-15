/**
 * TrainedBy  -  CEO Agent (Telegram Orchestrator)
 * ─────────────────────────────────────────────────────────────────────────────
 * The AI CEO that orchestrates all agents and communicates with the founder
 * via Telegram. Acts as the single point of control for the entire Agent OS.
 *
 * Telegram webhook: POST /functions/v1/ceo-agent
 *
 * Commands:
 *   /start         -  Welcome message + status overview
 *   /status        -  Live health check of all agents + DB metrics
 *   /growth        -  Trigger growth agent digest now
 *   /content       -  Generate a new blog post now
 *   /meta          -  Run meta-agent product improvement memo now
 *   /posts         -  List recent blog posts
 *   /memo          -  Show latest meta-agent memo
 *   /ask <text>    -  Ask the CEO agent a free-form question about the business
 *   /help          -  Show all commands
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
      case '/draft-blog':
        if (!args) {
          await sendMessage(chatId, '✍️ Usage: `/draft-blog <trainer name>, <specialty>, <city>`\n\nExample: `/draft-blog Sarah Al Mansoori, Marathon Prep, Dubai`');
        } else {
          await handleDraftBlog(chatId, args);
        }
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
      case '/learn':
        if (!args) {
          await sendMessage(chatId, '📚 Usage: `/learn <topic>`\n\nExamples:\n`/learn hormozi`  -  show all Hormozi frameworks\n`/learn growth`  -  show all growth frameworks\n`/learn pricing`  -  show pricing frameworks');
        } else {
          await handleLearn(chatId, args);
        }
        break;
      case '/directive':
        if (!args) {
          await sendMessage(chatId, '🎯 Usage: `/directive <goal>`\n\nExample: `/directive increase pro conversion`\n\nI will apply relevant frameworks from the knowledge base to your current business data and produce an action plan.');
        } else {
          await handleDirective(chatId, args);
        }
        break;
      case '/kb':
        await handleKnowledgeBase(chatId, args);
        break;
      case '/context':
        await handleBusinessContext(chatId);
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
📈 *Growth Agent*  -  tracks your funnel, spots drop-offs, emails you weekly
✍️ *Content Agent*  -  publishes one SEO blog post per week automatically
💬 *Support Agent*  -  answers trainer questions 24/7
🧠 *Meta Agent*  -  synthesises everything into weekly product improvement memos

*Quick commands:*
/status  -  live metrics right now
/growth  -  trigger weekly growth digest
/content  -  publish a new blog post
/meta  -  run product improvement analysis
/ask  -  ask me anything about the business

What do you want to know?`);
}

async function handleHelp(chatId: number): Promise<void> {
  await sendMessage(chatId, `*TrainedBy CEO Agent  -  Commands*

/status  -  Live health check + key metrics
/growth  -  Trigger growth agent digest now
/content  -  Generate + publish a new blog post
/draft-blog <trainer>, <specialty>, <city>  -  Draft a blog post for a trainer
/meta  -  Run product improvement memo now
/posts  -  List recent blog posts
/memo  -  Show latest meta-agent memo
/ask <question>  -  Ask me anything about the business

Or just type any message  -  I'll answer it directly.

*Strategic commands:*
/learn <topic>  -  browse knowledge base by topic or source
/directive <goal>  -  apply frameworks to a business goal
/kb  -  show knowledge base summary
/context  -  show current business context snapshot`);
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
${suggs || '  No data yet  -  add funnel tracking to the frontend'}`);
  } catch (err) {
    await sendMessage(chatId, `❌ Error: ${String(err)}`);
  }
}

async function handleDraftBlog(chatId: number, args: string): Promise<void> {
  await sendMessage(chatId, `✍️ Drafting blog post for: ${args}... (this takes ~30 seconds)`);
  await sendTyping(chatId);

  const systemPrompt = \`You are an expert SEO content writer for TrainedBy, a platform for verified personal trainers.
You are writing a blog post on behalf of a specific trainer.
The tone should be authoritative, practical, and conversational.
Include a catchy title, an introduction, 3-4 actionable tips, and a conclusion that encourages readers to book a session with the trainer.
Output ONLY the blog post content in Markdown format. Do not include any meta commentary.\`;

  const userMessage = \`Write a 600-word SEO-optimized blog post for a trainer with the following details: \${args}. Focus on their specialty and mention their city.\`;

  try {
    const response = await callClaude(ANTHROPIC_KEY(), {
      model: 'claude-sonnet-4-5',
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
      max_tokens: 1500,
      temperature: 0.7,
    });

    await sendMessage(chatId, \`✅ *Draft ready for \${args.split(',')[0]}*\n\n\${response.text}\n\n_Copy this, review it, and send it to the trainer for approval._\`);
  } catch (err) {
    log.warn('Claude call failed in /draft-blog', { error: String(err) });
    await sendMessage(chatId, \`❌ Failed to draft blog post: \${String(err)}\`);
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

${quality.slop_score > 20 ? '⚠️ Slop score is high  -  review before promoting' : '✅ Quality check passed'}`);
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

  const systemPrompt = `You are the AI CEO of TrainedBy.ae  -  a UAE platform for verified personal trainers. You have full visibility into the business metrics, agent outputs, and product roadmap.

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

// ── Knowledge base commands ─────────────────────────────────────────────────

async function handleLearn(chatId: number, query: string): Promise<void> {
  await sendTyping(chatId);
  const sb = createClient(SUPABASE_URL(), SUPABASE_KEY());

  // Search by source name or category or tags
  const q = query.toLowerCase().trim();
  const { data } = await sb
    .from('knowledge_base')
    .select('source, category, title, content, tags')
    .or(`source.ilike.%${q}%,category.ilike.%${q}%,title.ilike.%${q}%,tags.cs.{${q}}`)
    .limit(5);

  if (!data || data.length === 0) {
    await sendMessage(chatId, `📚 No knowledge base entries found for "${query}".\n\nTry: hormozi, growth, pricing, retention, metrics, market, offer, content`);
    return;
  }

  const entries = data.map((e: { source: string; category: string; title: string; content: string }, i: number) =>
    `*${i + 1}. ${e.title}*\n_[${e.source} / ${e.category}]_\n${e.content.substring(0, 300)}${e.content.length > 300 ? '...' : ''}`
  ).join('\n\n─────\n\n');

  await sendMessage(chatId, `📚 *Knowledge Base: "${query}"* (${data.length} results)\n\n${entries}`);
}

async function handleKnowledgeBase(chatId: number, filter: string): Promise<void> {
  await sendTyping(chatId);
  const sb = createClient(SUPABASE_URL(), SUPABASE_KEY());

  const { data } = await sb
    .from('knowledge_base')
    .select('source, category, title')
    .order('source')
    .order('category');

  if (!data || data.length === 0) {
    await sendMessage(chatId, '📚 Knowledge base is empty. It will be populated automatically.');
    return;
  }

  // Group by source
  const grouped: Record<string, string[]> = {};
  for (const e of data as { source: string; category: string; title: string }[]) {
    if (!grouped[e.source]) grouped[e.source] = [];
    grouped[e.source].push(`  • ${e.title}`);
  }

  const summary = Object.entries(grouped)
    .map(([src, titles]) => `*${src}* (${titles.length})\n${titles.join('\n')}`)
    .join('\n\n');

  await sendMessage(chatId, `📚 *Knowledge Base* (${data.length} entries)\n\n${summary}\n\nUse /learn <topic> to read any entry.`);
}

async function handleBusinessContext(chatId: number): Promise<void> {
  await sendTyping(chatId);
  const sb = createClient(SUPABASE_URL(), SUPABASE_KEY());

  const { data } = await sb
    .from('business_context')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!data) {
    // Generate a fresh context snapshot
    await sendMessage(chatId, '📊 No business context snapshot yet. Generating one now...');
    await updateBusinessContext(sb);
    await sendMessage(chatId, '✅ Business context updated. Run /context again to view it.');
    return;
  }

  const ctx = data as Record<string, unknown>;
  const problems = (ctx.open_problems as string[] ?? []).map((p: string, i: number) => `  ${i + 1}. ${p}`).join('\n');

  await sendMessage(chatId, `📊 *Business Context Snapshot*
_Week of ${ctx.week_start}_

💰 MRR: *${ctx.mrr_aed} AED*
👥 Trainers: *${ctx.trainer_count}* (${ctx.pro_count} Pro, ${ctx.free_count} Free)
📈 New this week: *${ctx.new_signups_week}*
📉 Churn: *${ctx.churn_week}*
🔄 Funnel conversion: *${ctx.funnel_conversion}%*

🎯 *Strategic Priority:*
${ctx.strategic_priority ?? 'Not set'}

⚠️ *Open Problems:*
${problems || '  None logged'}

💡 *Hormozi Diagnosis:*
${ctx.hormozi_diagnosis ?? 'Not generated yet  -  run /directive to get one'}`);
}

async function updateBusinessContext(sb: ReturnType<typeof createClient>): Promise<void> {
  const [trainers, funnel] = await Promise.all([
    sb.from('trainers').select('plan, created_at'),
    sb.from('funnel_events').select('event_name').gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const allTrainers = trainers.data ?? [];
  const proCount = allTrainers.filter((t: { plan: string }) => t.plan === 'pro').length;
  const newThisWeek = allTrainers.filter((t: { created_at: string }) => new Date(t.created_at) > weekAgo).length;
  const mrr = proCount * 149;

  const events = funnel.data ?? [];
  const landingViews = events.filter((e: { event_name: string }) => e.event_name === 'join_landing_view').length;
  const signups = events.filter((e: { event_name: string }) => e.event_name === 'join_signup_complete').length;
  const conversion = landingViews > 0 ? Math.round((signups / landingViews) * 100) : 0;

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  await sb.from('business_context').upsert({
    week_start: weekStart.toISOString().split('T')[0],
    mrr_aed: mrr,
    trainer_count: allTrainers.length,
    pro_count: proCount,
    free_count: allTrainers.length - proCount,
    new_signups_week: newThisWeek,
    churn_week: 0,
    funnel_conversion: conversion,
    strategic_priority: proCount < 10 ? 'Get to 10 Pro trainers before running paid ads' : 'Scale to 50 Pro trainers',
    open_problems: JSON.stringify([
      landingViews === 0 ? 'No funnel tracking data yet  -  frontend events not firing' : null,
      proCount === 0 ? 'Zero Pro subscribers  -  pricing or value proposition may need work' : null,
      allTrainers.length < 5 ? 'Less than 5 trainers  -  cold start problem, need manual outreach' : null,
    ].filter(Boolean)),
  }, { onConflict: 'week_start' });
}

// ── Directive handler ─────────────────────────────────────────────────────────

async function handleDirective(chatId: number, directive: string): Promise<void> {
  await sendTyping(chatId);
  await sendMessage(chatId, `🎯 Processing directive: "${directive}"\n\nSearching knowledge base and analysing business data...`);

  const sb = createClient(SUPABASE_URL(), SUPABASE_KEY());

  // Extract keywords from directive for KB search
  const keywords = directive.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const searchTerms = keywords.slice(0, 3);

  // Search knowledge base for relevant frameworks
  const kbResults = await Promise.all(
    searchTerms.map(term =>
      sb.from('knowledge_base')
        .select('source, title, content, category')
        .or(`title.ilike.%${term}%,content.ilike.%${term}%,tags.cs.{${term}},category.ilike.%${term}%`)
        .limit(3)
    )
  );

  const allKb: Array<{ source: string; title: string; content: string; category: string }> = [];
  const seen = new Set<string>();
  for (const r of kbResults) {
    for (const e of (r.data ?? []) as Array<{ source: string; title: string; content: string; category: string }>) {
      if (!seen.has(e.title)) {
        seen.add(e.title);
        allKb.push(e);
      }
    }
  }

  // Get current business context
  const [trainers, funnel, ctx] = await Promise.all([
    sb.from('trainers').select('plan, created_at').limit(200),
    sb.from('funnel_events').select('event_name').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    sb.from('business_context').select('*').order('created_at', { ascending: false }).limit(1).single(),
  ]);

  const allTrainers = trainers.data ?? [];
  const proCount = allTrainers.filter((t: { plan: string }) => t.plan === 'pro').length;
  const events = funnel.data ?? [];
  const landingViews = events.filter((e: { event_name: string }) => e.event_name === 'join_landing_view').length;
  const signups = events.filter((e: { event_name: string }) => e.event_name === 'join_signup_complete').length;
  const conversion = landingViews > 0 ? ((signups / landingViews) * 100).toFixed(1) : 'unknown';

  const businessData = `
Current business state:
- Trainers: ${allTrainers.length} total, ${proCount} Pro
- MRR: ${proCount * 149} AED
- Funnel (last 30 days): ${landingViews} landing views → ${signups} signups = ${conversion}% conversion
- Strategic priority: ${(ctx.data as Record<string, unknown>)?.strategic_priority ?? 'not set'}
`;

  const kbContext = allKb.length > 0
    ? `\nRelevant frameworks from knowledge base:\n${allKb.map(e => `[${e.source} / ${e.category}] ${e.title}:\n${e.content.substring(0, 400)}`).join('\n\n')}`
    : '\nNo directly relevant frameworks found in knowledge base.';

  const systemPrompt = `You are the AI CEO of a multi-market platform for verified personal trainers  -  operating as TrainedBy.ae (UAE), TrainedBy.uk (UK), TrainedBy.com (global), entrenacon.com (Spain), coachepar.fr (France), allenaticon.it (Italy), and TrainedBy.in (India). You have deep knowledge of Alex Hormozi's frameworks (Value Equation, offer design), Andrew Chen's cold start problem, Lenny Rachitsky's growth loops, and SaaS metrics.

The founder has issued a strategic directive. Your job is to:
1. Identify the most relevant framework(s) from the knowledge base
2. Apply them to the current business data
3. Produce a specific, ranked action plan with clear owners (which agent or human)
4. Name the exact metric that will move if the plan works

Be direct. No fluff. Every action must be specific and executable this week.`;

  const userMessage = `Directive: "${directive}"

${businessData}
${kbContext}

Produce a strategic action plan. Format as:
1. Framework applied: [name]
2. Diagnosis: [what the data tells us]
3. Action plan (3-5 steps, each with: action, owner, timeline, success metric)
4. The one metric to watch this week`;

  try {
    const response = await callClaude(ANTHROPIC_KEY(), {
      model: 'claude-sonnet-4-5',
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
      max_tokens: 800,
      temperature: 0.3,
    });

    // Save directive to DB
    await sb.from('directives').insert({
      directive,
      status: 'in_progress',
      framework: allKb[0]?.source ?? 'general',
      action_plan: { raw_response: response.text },
    });

    await sendMessage(chatId, `🎯 *Directive: "${directive}"*\n\n${response.text}\n\n_Saved to directives log. Use /context to see open problems._`);
  } catch (err) {
    log.warn('Claude call failed in /directive', { error: String(err) });
    await sendMessage(chatId, `⚠️ Could not generate action plan. Here are the relevant frameworks I found:\n\n${allKb.map(e => `*${e.title}* (${e.source})`).join('\n')}`);
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
      case 'new_signup': {
        const t = data as any;
        const pct = t.completion_pct ?? 0;
        const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10));
        await sendMessage(chatId,
          `🆕 *New trainer signed up*\n\n` +
          `👤 *${t.name}*\n` +
          `📧 ${t.email}\n` +
          `📍 ${t.city || 'City not set'}\n` +
          `🏅 REPs: ${t.reps_verified ? '✓ Verified' : 'Not yet'}\n` +
          `📊 Profile: ${bar} ${pct}%\n\n` +
          `Reply within the hour for best conversion.`
        );
        break;
      }
      case 'pro_upgrade': {
        const t = data as any;
        await sendMessage(chatId,
          `💰 *Pro upgrade!*\n\n` +
          `👤 *${t.name}*\n` +
          `📧 ${t.email}\n` +
          `💳 149 AED/month\n\n` +
          `That's your MRR growing. Send them the Pro welcome email.`
        );
        break;
      }
      case 'first_lead': {
        const t = data as any;
        await sendMessage(chatId,
          `🎯 *First lead for a trainer*\n\n` +
          `Trainer: *${t.trainer_name}*\n` +
          `Lead: ${t.lead_name} (${t.lead_email || 'no email'})\n` +
          `Interest: ${t.interest || 'General enquiry'}\n\n` +
          `The trainer has been notified. This is the moment they decide if TrainedBy is worth it.`
        );
        break;
      }
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
