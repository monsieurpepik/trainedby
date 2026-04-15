/**
 * TrainedBy — CEO Agent v2 (Executive AI)
 * ─────────────────────────────────────────────────────────────────────────────
 * An AI CEO that runs the business, orchestrates agents, and communicates
 * with the founder via Telegram like a senior executive.
 *
 * Personality: Direct. Confident. No fluff. Thinks in first principles.
 * Speaks like a CEO reporting to a board — not like a chatbot.
 *
 * Proactive behaviours:
 *   - 08:00 GST daily: Morning briefing (key metrics + one priority)
 *   - 09:00 Mon GST: Weekly growth digest (runs growth-agent)
 *   - 20:00 Sun GST: Weekly priorities memo (runs meta-agent)
 *   - Real-time: Anomaly alerts, new signups, cert approvals, academy bookings
 *
 * Commands:
 *   /brief     — Morning briefing right now
 *   /status    — Live platform metrics
 *   /global    — All markets overview
 *   /markets   — Per-market breakdown
 *   /waitlist  — Waitlist signups
 *   /pending   — Cert reviews
 *   /academy   — Academy revenue
 *   /run <agent> — Trigger an agent (growth/content/meta/outreach)
 *   /decide <question> — CEO makes a decision with reasoning
 *   /priorities — Current week's top 3 priorities
 *   /problems  — Open problems the CEO is tracking
 *   /hire      — What roles the business needs next
 *   /ask <q>   — Free-form question
 *   /help      — All commands
 *
 * Skills Commands (Superpowers integration):
 *   /debug <issue>     — Systematic 4-phase debugging protocol
 *   /plan <feature>    — Structured implementation plan with TDD tasks
 *   /brainstorm <idea> — Socratic design refinement before building
 *   /review            — Pre-merge code review checklist
 *   /skill             — List all available development skills
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
const SELF_URL = () => `https://mezhtdbfyvkshpuplqqw.supabase.co/functions/v1`;

// ── CEO Persona ───────────────────────────────────────────────────────────────
const CEO_SYSTEM_PROMPT = `You are the AI CEO of TrainedBy — a global platform for verified personal trainers and sports academies, operating across UAE, UK, France, Italy, Spain, Mexico, and India.

You report directly to the founder (Boban). You are not a chatbot. You are a senior executive who:
- Thinks in first principles, not frameworks
- Gives direct answers with clear reasoning
- Surfaces problems before being asked
- Makes decisions and owns them
- Speaks concisely — no filler, no hedging
- Uses numbers when available, flags when data is missing
- Ends every substantive reply with one clear next action

Your tone: confident, direct, slightly formal but not stiff. Like a McKinsey partner who actually builds things.

You have full visibility into:
- All platform metrics (trainers, revenue, leads, conversions)
- All markets (AE, UK, FR, IT, ES, MX, IN)
- All agents (growth, content, meta, outreach, support, verify)
- The academy module (sports academies, bookings, payouts)
- The verification system (cert reviews, REPs lookups)

When the founder sends a message, respond as a CEO would respond to a board member — with context, judgment, and a clear recommendation.`;

// ── Telegram helpers ──────────────────────────────────────────────────────────
async function sendMessage(chatId: string | number, text: string, parseMode = 'Markdown'): Promise<void> {
  const chunks = splitMessage(text);
  for (const chunk of chunks) {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN()}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: chunk,
        parse_mode: parseMode,
        disable_web_page_preview: true,
      }),
    });
  }
}

function splitMessage(text: string, maxLen = 4000): string[] {
  if (text.length <= maxLen) return [text];
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > maxLen) {
    const cut = remaining.lastIndexOf('\n', maxLen);
    const pos = cut > maxLen / 2 ? cut : maxLen;
    chunks.push(remaining.slice(0, pos));
    remaining = remaining.slice(pos).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

async function sendTyping(chatId: string | number): Promise<void> {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN()}/sendChatAction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, action: 'typing' }),
  });
}

function isAuthorized(chatId: number): boolean {
  return String(chatId) === FOUNDER_CHAT_ID();
}

// ── Data helpers ──────────────────────────────────────────────────────────────
async function getPlatformSnapshot(sb: ReturnType<typeof createClient>) {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [trainers, leads, certs, waitlist, academyBookings, conversations] = await Promise.all([
    sb.from('trainers').select('id, plan, market, created_at, verification_status'),
    sb.from('leads').select('id, created_at').gte('created_at', weekAgo),
    sb.from('cert_reviews').select('id, final_status').eq('final_status', 'pending'),
    sb.from('market_waitlist').select('id, market, created_at').gte('created_at', weekAgo),
    sb.from('academy_bookings').select('id, amount_paid, status').eq('status', 'confirmed').gte('created_at', monthAgo),
    sb.from('support_conversations').select('id').gte('created_at', weekAgo),
  ]);

  const allTrainers = trainers.data ?? [];
  const proTrainers = allTrainers.filter((t: { plan: string }) => t.plan === 'pro');
  const freeTrainers = allTrainers.filter((t: { plan: string }) => t.plan === 'free');
  const newThisWeek = allTrainers.filter((t: { created_at: string }) => t.created_at >= weekAgo);
  const verifiedCount = allTrainers.filter((t: { verification_status: string }) => t.verification_status === 'verified').length;

  // Market breakdown
  const marketCounts: Record<string, { total: number; pro: number }> = {};
  for (const t of allTrainers as { market: string; plan: string }[]) {
    const m = t.market ?? 'ae';
    if (!marketCounts[m]) marketCounts[m] = { total: 0, pro: 0 };
    marketCounts[m].total++;
    if (t.plan === 'pro') marketCounts[m].pro++;
  }

  const mrr = proTrainers.length * 149; // AED
  const academyRevenue = (academyBookings.data ?? []).reduce((sum: number, b: { amount_paid: number }) => sum + (b.amount_paid ?? 0), 0);
  const platformFee = Math.round(academyRevenue * 0.1);

  return {
    totalTrainers: allTrainers.length,
    proCount: proTrainers.length,
    freeCount: freeTrainers.length,
    newThisWeek: newThisWeek.length,
    verifiedCount,
    mrr,
    leadsThisWeek: (leads.data ?? []).length,
    pendingCerts: (certs.data ?? []).length,
    waitlistThisWeek: (waitlist.data ?? []).length,
    academyRevenue,
    platformFee,
    supportConvs: (conversations.data ?? []).length,
    marketCounts,
  };
}

// ── Main handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: CORS_HEADERS });

  if (req.method === 'GET') {
    return new Response(JSON.stringify({ status: 'ok', agent: 'ceo-agent', version: '2.0.0' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(req.url);

  // Proactive notification endpoint (called by other agents or cron)
  if (req.method === 'POST' && url.pathname.endsWith('/notify')) {
    return handleNotify(req);
  }

  // Scheduled briefing endpoint (called by pg_cron or external cron)
  if (req.method === 'POST' && url.pathname.endsWith('/brief')) {
    return handleScheduledBrief();
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
  const text = ((message.text as string) ?? '').trim();

  if (!isAuthorized(chatId)) {
    await sendMessage(chatId, 'This is a private executive channel.');
    return new Response('ok', { status: 200 });
  }

  const command = text.startsWith('/') ? text.split(' ')[0].toLowerCase() : null;
  const args = command ? text.slice(command.length).trim() : text;

  try {
    if (command) {
      switch (command) {
        case '/start':
          await handleIntro(chatId);
          break;
        case '/brief':
          await handleBriefing(chatId);
          break;
        case '/status':
          await handleStatus(chatId);
          break;
        case '/global':
          await handleGlobal(chatId);
          break;
        case '/markets':
          await handleMarkets(chatId);
          break;
        case '/waitlist':
          await handleWaitlist(chatId, args);
          break;
        case '/pending':
          await handlePending(chatId);
          break;
        case '/academy':
          await handleAcademy(chatId);
          break;
        case '/run':
          await handleRunAgent(chatId, args);
          break;
        case '/decide':
          if (!args) {
            await sendMessage(chatId, 'Usage: `/decide <question>`\n\nExample: `/decide Should we run paid ads in Dubai now?`');
          } else {
            await handleDecide(chatId, args);
          }
          break;
        case '/priorities':
          await handlePriorities(chatId);
          break;
        case '/problems':
          await handleProblems(chatId);
          break;
        case '/hire':
          await handleHire(chatId);
          break;
        case '/directive':
          if (!args) {
            await sendMessage(chatId, 'Usage: `/directive <goal>`\n\nExample: `/directive get to 10 pro trainers this week`');
          } else {
            await handleDirective(chatId, args);
          }
          break;
        case '/ask':
          await handleFreeform(chatId, args || 'What is the most important thing I should know right now?');
          break;
        case '/help':
          await handleHelp(chatId);
          break;
        // Skills commands (Superpowers integration)
        case '/debug':
          if (!args) {
            await sendMessage(chatId, 'Usage: `/debug <issue>`\n\nExample: `/debug stripe webhook not firing in UAE`');
          } else {
            await handleDebug(chatId, args);
          }
          break;
        case '/plan':
          if (!args) {
            await sendMessage(chatId, 'Usage: `/plan <feature>`\n\nExample: `/plan add Google Calendar sync to academy bookings`');
          } else {
            await handlePlan(chatId, args);
          }
          break;
        case '/brainstorm':
          if (!args) {
            await sendMessage(chatId, 'Usage: `/brainstorm <idea>`\n\nExample: `/brainstorm referral programme for trainers`');
          } else {
            await handleBrainstorm(chatId, args);
          }
          break;
        case '/review':
          await handleReview(chatId, args);
          break;
        case '/skill':
          await handleSkill(chatId, args);
          break;
        case '/gsd':
          await handleGSD(chatId, args);
          break;
        // Legacy commands
        case '/growth':
          await handleRunAgent(chatId, 'growth');
          break;
        case '/content':
          await handleRunAgent(chatId, 'content');
          break;
        case '/meta':
          await handleRunAgent(chatId, 'meta');
          break;
        case '/context':
          await handlePriorities(chatId);
          break;
        case '/learn':
          await handleLearn(chatId, args);
          break;
        case '/kb':
          await handleKB(chatId);
          break;
        case '/posts':
          await handlePosts(chatId);
          break;
        case '/memo':
          await handleMemo(chatId);
          break;
        default:
          await sendMessage(chatId, `Unknown command: \`${command}\`\n\nType /help to see all commands.`);
      }
    } else {
      // Natural language — treat as conversation with the CEO
      await handleFreeform(chatId, text);
    }
  } catch (err) {
    log.exception(err);
    await sendMessage(chatId, `Something went wrong on my end. I've logged it. Try again.`);
  }

  return new Response('ok', { status: 200 });
}

// ── Command handlers ──────────────────────────────────────────────────────────

async function handleIntro(chatId: number): Promise<void> {
  const sb = createClient(SUPABASE_URL(), SUPABASE_KEY());
  const snap = await getPlatformSnapshot(sb);

  await sendMessage(chatId, `*TrainedBy — Executive Briefing*

I'm running the business. Here's where we stand:

👥 *${snap.totalTrainers}* trainers on platform (${snap.proCount} Pro · ${snap.freeCount} Free)
💰 *${snap.mrr.toLocaleString()} AED* estimated MRR
✅ *${snap.verifiedCount}* verified trainers
📋 *${snap.pendingCerts}* cert reviews pending
🌍 Active in ${Object.keys(snap.marketCounts).length} markets

${snap.totalTrainers === 0 ? '⚠️ No trainers yet. First priority: manual outreach to 10 UAE PTs this week.' : snap.proCount === 0 ? '⚠️ Zero Pro subscribers. The product is live but not converting. That is the problem to solve.' : `📈 Growing. ${snap.newThisWeek} new trainers this week.`}

What do you want to work on?`);
}

async function handleBriefing(chatId: number): Promise<void> {
  await sendTyping(chatId);
  const sb = createClient(SUPABASE_URL(), SUPABASE_KEY());
  const snap = await getPlatformSnapshot(sb);

  // Get latest agent memo
  const { data: latestMemo } = await sb
    .from('agent_memos')
    .select('agent, summary, created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const memoLine = latestMemo
    ? `\n🤖 Last agent run: *${(latestMemo as { agent: string; summary: string; created_at: string }).agent}* — ${(latestMemo as { agent: string; summary: string; created_at: string }).summary?.substring(0, 80) ?? 'completed'}`
    : '';

  const marketLines = Object.entries(snap.marketCounts)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 4)
    .map(([m, c]) => `  ${m.toUpperCase()}: ${c.total} trainers, ${c.pro} Pro`)
    .join('\n');

  // Generate CEO priority for today
  const priority = snap.proCount === 0
    ? 'Convert first Pro subscriber — offer a 30-day free trial to the top 3 free trainers by profile completeness'
    : snap.pendingCerts > 0
    ? `Clear ${snap.pendingCerts} pending cert review${snap.pendingCerts > 1 ? 's' : ''} — verified trainers convert 3× better`
    : snap.newThisWeek === 0
    ? 'Zero new signups this week — run outreach-agent or post in UAE fitness groups today'
    : `Keep momentum — ${snap.newThisWeek} new trainers this week. Focus on activation (profile completion).`;

  await sendMessage(chatId, `*Morning Briefing*
_${new Date().toLocaleDateString('en-AE', { weekday: 'long', day: 'numeric', month: 'long' })}_

📊 *Platform*
  Trainers: ${snap.totalTrainers} (${snap.proCount} Pro · +${snap.newThisWeek} this week)
  MRR: ${snap.mrr.toLocaleString()} AED
  Leads this week: ${snap.leadsThisWeek}
  Pending certs: ${snap.pendingCerts}
  Waitlist (new): ${snap.waitlistThisWeek}

🌍 *Markets*
${marketLines || '  No market data yet'}
${memoLine}

🎯 *Today's priority:*
${priority}`);
}

async function handleStatus(chatId: number): Promise<void> {
  await sendTyping(chatId);
  const sb = createClient(SUPABASE_URL(), SUPABASE_KEY());
  const snap = await getPlatformSnapshot(sb);

  await sendMessage(chatId, `*Platform Status*

👥 Trainers: *${snap.totalTrainers}* (${snap.proCount} Pro · ${snap.freeCount} Free)
✅ Verified: *${snap.verifiedCount}*
💰 Est. MRR: *${snap.mrr.toLocaleString()} AED*
📋 Pending certs: *${snap.pendingCerts}*
📩 Leads this week: *${snap.leadsThisWeek}*
🏋️ Academy revenue (30d): *${snap.academyRevenue.toLocaleString()} AED* (platform fee: ${snap.platformFee.toLocaleString()} AED)
💬 Support convs (7d): *${snap.supportConvs}*
🌍 Waitlist signups (7d): *${snap.waitlistThisWeek}*

All systems operational ✅`);
}

async function handleGlobal(chatId: number): Promise<void> {
  await sendTyping(chatId);
  const sb = createClient(SUPABASE_URL(), SUPABASE_KEY());
  const snap = await getPlatformSnapshot(sb);

  const MARKET_LABELS: Record<string, string> = {
    ae: '🇦🇪 UAE', uk: '🇬🇧 UK', fr: '🇫🇷 France', it: '🇮🇹 Italy',
    es: '🇪🇸 Spain', mx: '🇲🇽 Mexico', in: '🇮🇳 India',
  };

  const PAYMENT_MARKETS = new Set(['ae', 'uk', 'com']);

  const marketLines = Object.entries(snap.marketCounts)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([m, c]) => {
      const label = MARKET_LABELS[m] ?? m.toUpperCase();
      const payStatus = PAYMENT_MARKETS.has(m) ? '💳 Live' : '⏳ Waitlist';
      const mrr = c.pro * 149;
      return `${label}: ${c.total} trainers · ${c.pro} Pro · ${mrr > 0 ? mrr.toLocaleString() + ' AED' : payStatus}`;
    })
    .join('\n');

  // Waitlist totals
  const { data: wlData } = await sb
    .from('market_waitlist')
    .select('market')
    .in('market', ['fr', 'it', 'es', 'mx', 'in']);

  const wlCounts: Record<string, number> = {};
  for (const w of (wlData ?? []) as { market: string }[]) {
    wlCounts[w.market] = (wlCounts[w.market] ?? 0) + 1;
  }
  const wlTotal = Object.values(wlCounts).reduce((a, b) => a + b, 0);
  const wlLines = Object.entries(wlCounts).map(([m, c]) => `  ${MARKET_LABELS[m] ?? m}: ${c}`).join('\n');

  await sendMessage(chatId, `*Global Overview*

📊 *Totals*
  Trainers: ${snap.totalTrainers} · Pro: ${snap.proCount} · MRR: ${snap.mrr.toLocaleString()} AED

🌍 *By Market*
${marketLines || '  No data yet'}

⏳ *Waitlist* (${wlTotal} total)
${wlLines || '  No waitlist signups yet'}`);
}

async function handleMarkets(chatId: number): Promise<void> {
  await handleGlobal(chatId);
}

async function handleWaitlist(chatId: number, filter: string): Promise<void> {
  await sendTyping(chatId);
  const sb = createClient(SUPABASE_URL(), SUPABASE_KEY());

  const query = sb.from('market_waitlist').select('name, email, market, created_at').order('created_at', { ascending: false }).limit(20);
  if (filter) query.eq('market', filter.toLowerCase());

  const { data } = await query;
  if (!data || data.length === 0) {
    await sendMessage(chatId, `No waitlist signups yet${filter ? ` for market: ${filter}` : ''}.`);
    return;
  }

  const lines = (data as { name: string; email: string; market: string; created_at: string }[])
    .map(w => `  • *${w.name}* (${w.market.toUpperCase()}) — ${w.email} — ${new Date(w.created_at).toLocaleDateString('en-AE')}`)
    .join('\n');

  await sendMessage(chatId, `*Waitlist* (${data.length} shown)\n\n${lines}\n\nUse \`/waitlist fr\` to filter by market.`);
}

async function handlePending(chatId: number): Promise<void> {
  await sendTyping(chatId);
  const sb = createClient(SUPABASE_URL(), SUPABASE_KEY());

  const { data } = await sb
    .from('cert_reviews')
    .select('id, trainer_id, extracted_name, issuing_body, expiry_date, claude_confidence, created_at')
    .eq('final_status', 'pending')
    .order('created_at', { ascending: false })
    .limit(10);

  if (!data || data.length === 0) {
    await sendMessage(chatId, 'No pending cert reviews. ✅');
    return;
  }

  const lines = (data as { id: string; extracted_name: string; issuing_body: string; expiry_date: string; claude_confidence: number; created_at: string }[])
    .map((c, i) => `  ${i + 1}. *${c.extracted_name ?? 'Unknown'}* — ${c.issuing_body ?? 'Unknown body'} — Exp: ${c.expiry_date ?? 'N/A'} — Confidence: ${Math.round((c.claude_confidence ?? 0) * 100)}%`)
    .join('\n');

  await sendMessage(chatId, `*Pending Cert Reviews* (${data.length})\n\n${lines}\n\nApprove at: trainedby.ae/admin`);
}

async function handleAcademy(chatId: number): Promise<void> {
  await sendTyping(chatId);
  const sb = createClient(SUPABASE_URL(), SUPABASE_KEY());

  const [academies, bookings] = await Promise.all([
    sb.from('academies').select('id, name, sport, city, plan').order('created_at', { ascending: false }),
    sb.from('academy_bookings').select('amount_paid, platform_fee, status').eq('status', 'confirmed'),
  ]);

  const totalAcademies = (academies.data ?? []).length;
  const grossRevenue = (bookings.data ?? []).reduce((sum: number, b: { amount_paid: number }) => sum + (b.amount_paid ?? 0), 0);
  const platformRevenue = (bookings.data ?? []).reduce((sum: number, b: { platform_fee: number }) => sum + (b.platform_fee ?? 0), 0);
  const totalBookings = (bookings.data ?? []).length;

  const academyLines = ((academies.data ?? []) as { name: string; sport: string; city: string; plan: string }[])
    .slice(0, 5)
    .map(a => `  • *${a.name}* — ${a.sport} · ${a.city} · ${a.plan}`)
    .join('\n');

  await sendMessage(chatId, `*Academy Module*

🏫 Academies: *${totalAcademies}*
${academyLines || '  None registered yet'}

💰 Confirmed bookings: *${totalBookings}*
  Gross revenue: *${grossRevenue.toLocaleString()} AED*
  Platform fee (10%): *${platformRevenue.toLocaleString()} AED*

To onboard an academy: POST to \`/functions/v1/create-academy\``);
}

async function handleRunAgent(chatId: number, agentName: string): Promise<void> {
  const agent = agentName.toLowerCase().trim();
  const agentMap: Record<string, string> = {
    growth: 'growth-agent',
    content: 'content-agent',
    meta: 'meta-agent',
    outreach: 'outreach-agent',
    verify: 'reverify-agent',
  };

  const slug = agentMap[agent];
  if (!slug) {
    await sendMessage(chatId, `Unknown agent: \`${agent}\`\n\nAvailable: growth, content, meta, outreach, verify`);
    return;
  }

  await sendMessage(chatId, `Running *${slug}*...`);
  await sendTyping(chatId);

  try {
    const res = await fetch(`${SELF_URL()}/${slug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_KEY()}` },
      body: JSON.stringify({ action: 'run' }),
    });

    const data = await res.json().catch(() => ({}));

    if (data.error) {
      await sendMessage(chatId, `*${slug}* failed: ${data.error}`);
      return;
    }

    // Format response based on agent
    if (agent === 'growth') {
      const memo = data.memo ?? {};
      await sendMessage(chatId, `*Growth Agent — Complete*

New trainers: *${memo.new_trainers ?? 0}* (${memo.new_trainers_delta >= 0 ? '+' : ''}${memo.new_trainers_delta ?? 0} vs last week)
Conversion: *${memo.overall_conversion_pct ?? 0}%*
${memo.hypothesis ? `\nHypothesis: ${memo.hypothesis}` : ''}
${memo.suggestions ? `\nTop actions:\n${(memo.suggestions as string[]).slice(0, 3).map((s: string, i: number) => `  ${i + 1}. ${s}`).join('\n')}` : ''}`);
    } else if (agent === 'content') {
      const post = data.post ?? {};
      await sendMessage(chatId, `*Content Agent — Post Published*\n\n"${post.title ?? 'New post'}"\nKeyword: ${post.keyword ?? 'N/A'}`);
    } else {
      await sendMessage(chatId, `*${slug}* completed. ${data.summary ?? 'Check Supabase logs for details.'}`);
    }
  } catch (err) {
    await sendMessage(chatId, `*${slug}* timed out or errored. Check Supabase logs.`);
    log.warn(`Agent run failed: ${slug}`, { error: String(err) });
  }
}

async function handleDecide(chatId: number, question: string): Promise<void> {
  await sendTyping(chatId);
  await sendMessage(chatId, `Thinking through: _"${question}"_`);

  const sb = createClient(SUPABASE_URL(), SUPABASE_KEY());
  const snap = await getPlatformSnapshot(sb);

  const context = `
Current state:
- ${snap.totalTrainers} trainers (${snap.proCount} Pro, ${snap.freeCount} Free)
- MRR: ${snap.mrr.toLocaleString()} AED
- ${snap.newThisWeek} new trainers this week
- ${snap.pendingCerts} pending cert reviews
- ${snap.leadsThisWeek} leads this week
- Markets: ${Object.keys(snap.marketCounts).join(', ')}
- Waitlist markets: FR, IT, ES, MX, IN
`;

  try {
    const response = await callClaude(ANTHROPIC_KEY(), {
      model: 'claude-haiku-4-5',
      system: CEO_SYSTEM_PROMPT + `\n\nThe founder is asking you to make a decision. Structure your answer as:\n1. Decision: [yes/no/conditional]\n2. Reasoning: [2-3 sentences max]\n3. Condition/caveat: [what would change this]\n4. Action: [one specific next step]\n\nBe direct. No hedging.`,
      messages: [{
        role: 'user',
        content: `Decision needed: "${question}"\n\nBusiness context:\n${context}`,
      }],
      max_tokens: 400,
      temperature: 0.2,
    });

    await sendMessage(chatId, `*Decision: "${question}"*\n\n${response.text}`);
  } catch {
    await sendMessage(chatId, `Couldn't process that decision right now. Try /ask instead.`);
  }
}

async function handlePriorities(chatId: number): Promise<void> {
  await sendTyping(chatId);
  const sb = createClient(SUPABASE_URL(), SUPABASE_KEY());
  const snap = await getPlatformSnapshot(sb);

  // Generate dynamic priorities based on current state
  const priorities: string[] = [];

  if (snap.totalTrainers < 10) {
    priorities.push('*Get to 10 trainers* — manual outreach to UAE PTs on Instagram and LinkedIn. Target: REPs-verified trainers in Dubai Marina, JLT, DIFC.');
  } else if (snap.proCount === 0) {
    priorities.push('*First Pro conversion* — personally call the 3 most active free trainers. Offer 60-day Pro trial in exchange for a testimonial.');
  } else if (snap.proCount < 10) {
    priorities.push(`*Scale to 10 Pro trainers* — currently at ${snap.proCount}. Run outreach-agent and follow up manually with leads.`);
  } else {
    priorities.push(`*Grow Pro base* — ${snap.proCount} Pro trainers. Target: 50 by end of quarter.`);
  }

  if (snap.pendingCerts > 0) {
    priorities.push(`*Clear ${snap.pendingCerts} pending cert review${snap.pendingCerts > 1 ? 's' : ''}* — verified trainers convert 3× better. Do this today.`);
  }

  if (snap.waitlistThisWeek > 5) {
    priorities.push(`*Activate waitlist momentum* — ${snap.waitlistThisWeek} signups this week from FR/IT/ES/MX/IN. Consider launching one market early.`);
  } else {
    priorities.push('*Build content pipeline* — run content-agent to publish 2 SEO posts this week. Organic traffic is the cheapest acquisition channel.');
  }

  const lines = priorities.map((p, i) => `${i + 1}. ${p}`).join('\n\n');

  await sendMessage(chatId, `*This Week's Priorities*\n\n${lines}\n\n_Use /decide <question> if you want me to make a call on anything._`);
}

async function handleProblems(chatId: number): Promise<void> {
  await sendTyping(chatId);
  const sb = createClient(SUPABASE_URL(), SUPABASE_KEY());
  const snap = await getPlatformSnapshot(sb);

  const problems: string[] = [];

  if (snap.totalTrainers === 0) problems.push('*Cold start* — no trainers on platform. Need 10 before any marketing makes sense.');
  if (snap.proCount === 0 && snap.totalTrainers > 0) problems.push('*Zero revenue* — trainers are signing up but not converting to Pro. Either pricing, value prop, or awareness of Pro features is the blocker.');
  if (snap.pendingCerts > 3) problems.push(`*Cert review backlog* — ${snap.pendingCerts} reviews pending. Slow verification damages trust.`);
  if (snap.leadsThisWeek === 0 && snap.totalTrainers > 0) problems.push('*No client leads this week* — trainers are not getting value. This will cause churn.');
  if (snap.verifiedCount === 0 && snap.totalTrainers > 0) problems.push('*No verified trainers* — the core value proposition (verified trainers) is not yet demonstrated.');

  if (problems.length === 0) {
    await sendMessage(chatId, `No critical problems right now. Platform is operating normally.\n\nUse /priorities to see what to focus on.`);
    return;
  }

  const lines = problems.map((p, i) => `${i + 1}. ${p}`).join('\n\n');
  await sendMessage(chatId, `*Open Problems* (${problems.length})\n\n${lines}\n\nUse /decide <problem> to get a recommendation on any of these.`);
}

async function handleHire(chatId: number): Promise<void> {
  await sendTyping(chatId);
  const sb = createClient(SUPABASE_URL(), SUPABASE_KEY());
  const snap = await getPlatformSnapshot(sb);

  let hireAdvice = '';

  if (snap.totalTrainers < 20) {
    hireAdvice = `*Too early to hire.*\n\nAt ${snap.totalTrainers} trainers and ${snap.mrr.toLocaleString()} AED MRR, every dirham should go into acquisition, not payroll.\n\nWhat you need right now is not employees — it's:\n  1. A part-time community manager (freelance, 2h/day) to seed the trainer community\n  2. A UAE fitness influencer partnership (rev-share, no cash)\n  3. Your own time on outreach for the next 60 days\n\nHire when you hit 50 Pro trainers.`;
  } else if (snap.proCount < 20) {
    hireAdvice = `*One hire: a growth operator.*\n\nSomeone who can run outreach, manage partnerships, and own trainer onboarding. UAE-based. Fitness background preferred.\n\nNot a developer. Not a marketer. An operator.\n\nBudget: 8,000–12,000 AED/month. Equity optional.`;
  } else {
    hireAdvice = `*Two hires now:*\n\n1. *Growth operator* — owns trainer acquisition and onboarding\n2. *Customer success* — owns trainer retention and Pro upgrades\n\nBoth UAE-based. Both on performance bonuses tied to Pro trainer count.\n\nAt ${snap.mrr.toLocaleString()} AED MRR you can afford both.`;
  }

  await sendMessage(chatId, `*Hiring Advice*\n\n${hireAdvice}`);
}

async function handleFreeform(chatId: number, text: string): Promise<void> {
  await sendTyping(chatId);
  const sb = createClient(SUPABASE_URL(), SUPABASE_KEY());
  const snap = await getPlatformSnapshot(sb);

  // Get recent conversation history
  const { data: history } = await sb
    .from('ceo_conversations')
    .select('role, content')
    .eq('chat_id', String(chatId))
    .order('created_at', { ascending: false })
    .limit(10);

  const recentMessages = ((history ?? []) as { role: string; content: string }[])
    .reverse()
    .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

  const businessContext = `
Current platform state:
- ${snap.totalTrainers} trainers (${snap.proCount} Pro · ${snap.freeCount} Free)
- MRR: ${snap.mrr.toLocaleString()} AED
- ${snap.newThisWeek} new trainers this week, ${snap.leadsThisWeek} leads
- ${snap.verifiedCount} verified trainers, ${snap.pendingCerts} pending cert reviews
- Markets live: AE, UK, COM | Waitlist: FR, IT, ES, MX, IN
- Academy: ${snap.academyRevenue.toLocaleString()} AED gross revenue (30d)
`;

  const messages = [
    ...recentMessages,
    {
      role: 'user' as const,
      content: `${text}\n\n[Business context: ${businessContext}]`,
    },
  ];

  try {
    const response = await callClaude(ANTHROPIC_KEY(), {
      model: 'claude-haiku-4-5',
      system: CEO_SYSTEM_PROMPT,
      messages,
      max_tokens: 600,
      temperature: 0.3,
    });

    // Save conversation to DB
    await sb.from('ceo_conversations').insert([
      { chat_id: String(chatId), role: 'user', content: text },
      { chat_id: String(chatId), role: 'assistant', content: response.text },
    ]);

    await sendMessage(chatId, response.text);
  } catch (err) {
    log.warn('Claude call failed in freeform', { error: String(err) });
    await sendMessage(chatId, `I couldn't process that right now. Try /status for live metrics or /brief for a full briefing.`);
  }
}

async function handleDirective(chatId: number, directive: string): Promise<void> {
  await sendTyping(chatId);
  await sendMessage(chatId, `Processing directive: _"${directive}"_\n\nAnalysing business data and assigning tasks...`);

  const sb = createClient(SUPABASE_URL(), SUPABASE_KEY());
  const snap = await getPlatformSnapshot(sb);

  const businessData = `
Platform state:
- ${snap.totalTrainers} trainers (${snap.proCount} Pro)
- MRR: ${snap.mrr.toLocaleString()} AED
- ${snap.newThisWeek} new this week
- ${snap.leadsThisWeek} leads this week
- Markets: AE, UK live | FR, IT, ES, MX, IN waitlist
`;

  try {
    const response = await callClaude(ANTHROPIC_KEY(), {
      model: 'claude-haiku-4-5',
      system: CEO_SYSTEM_PROMPT + `\n\nThe founder has issued a strategic directive. Respond as a CEO who just received a board directive. Format:\n\n**Directive received:** [restate it]\n**My assessment:** [1-2 sentences on feasibility and priority]\n**Agent assignments:**\n- [agent name]: [specific task]\n- [agent name]: [specific task]\n**What I need from you:** [1 specific thing the founder must do]\n**Success metric:** [how we'll know it worked, with a number and timeline]`,
      messages: [{
        role: 'user',
        content: `Directive: "${directive}"\n\n${businessData}`,
      }],
      max_tokens: 500,
      temperature: 0.2,
    });

    // Save to directives table
    await sb.from('directives').insert({
      directive,
      status: 'in_progress',
      action_plan: { raw_response: response.text },
    }).catch(() => null); // Non-blocking

    await sendMessage(chatId, response.text);
  } catch {
    await sendMessage(chatId, `Couldn't process that directive right now. Try again in a moment.`);
  }
}

async function handleHelp(chatId: number): Promise<void> {
  await sendMessage(chatId, `*TrainedBy CEO — Commands*

*Briefings*
/brief — Morning briefing (metrics + today's priority)
/status — Live platform metrics
/global — All markets in one view
/markets — Per-market breakdown
/priorities — This week's top 3 priorities
/problems — Open problems I'm tracking

*Operations*
/pending — Cert reviews awaiting approval
/waitlist [market] — Waitlist signups
/academy — Academy bookings and revenue

*Agent Control*
/run growth — Trigger growth digest
/run content — Publish a new blog post
/run meta — Run product improvement memo
/run outreach — Run outreach agent
/run verify — Re-verify all trainers

*Strategy*
/decide <question> — I make a decision with reasoning
/directive <goal> — I assign tasks to agents
/hire — Hiring advice based on current stage

Or just *type anything* — I'll respond as your CEO.

*Skills & Development*
/debug <issue> — Systematic 4-phase debugging protocol
/plan <feature> — TDD implementation plan with exact tasks
/brainstorm <idea> — Socratic design refinement
/review [context] — Pre-merge code review checklist
/skill — All development skills
/gsd [command] — Get Shit Done framework reference`);
}

// ── Skills handlers (Superpowers integration) ───────────────────────────────

async function handleDebug(chatId: number, issue: string): Promise<void> {
  await sendTyping(chatId);
  const sb = createClient(SUPABASE_URL(), SUPABASE_KEY());
  const snap = await getPlatformSnapshot(sb);

  try {
    const response = await callClaude(ANTHROPIC_KEY(), {
      model: 'claude-haiku-4-5',
      system: CEO_SYSTEM_PROMPT + `\n\nYou are now activating the *Systematic Debugging* skill. This is a 4-phase protocol:\n\n**Phase 1 — Reproduce:** Identify the exact failure with evidence. What is the symptom? When did it start? What changed?\n**Phase 2 — Isolate:** Narrow to the smallest failing case. What is the minimal reproduction?\n**Phase 3 — Root Cause:** Find the actual cause, not a symptom. Ask "why" 5 times.\n**Phase 4 — Fix & Verify:** Propose the fix. Specify how to verify it worked with evidence.\n\nFormat your response with these four phases clearly labelled. End with one concrete next action the developer should take RIGHT NOW.\n\nContext about the TrainedBy platform:\n- Stack: Astro frontend, Supabase (Deno edge functions + PostgreSQL), Stripe, Telegram bot\n- ${snap.totalTrainers} trainers, ${snap.proCount} Pro subscribers\n- 34 edge functions deployed\n- Key rule: webhook functions must have verify_jwt=false`,
      messages: [{ role: 'user', content: `Debug this issue: ${issue}` }],
      max_tokens: 700,
      temperature: 0.1,
    });
    await sendMessage(chatId, `🔍 *Systematic Debug: ${issue}*\n\n${response.text}`);
  } catch {
    await sendMessage(chatId, `Couldn't run debug protocol right now. Try again.`);
  }
}

async function handlePlan(chatId: number, feature: string): Promise<void> {
  await sendTyping(chatId);
  const sb = createClient(SUPABASE_URL(), SUPABASE_KEY());
  const snap = await getPlatformSnapshot(sb);

  try {
    const response = await callClaude(ANTHROPIC_KEY(), {
      model: 'claude-haiku-4-5',
      system: CEO_SYSTEM_PROMPT + `\n\nYou are now activating the *Writing Plans* skill. Generate a structured implementation plan.\n\nRules:\n- Break work into bite-sized tasks (2-5 minutes each)\n- Every task must have: exact file paths, what to write/change, verification step\n- Follow TDD: write failing test first, then implementation\n- Start with the plan header:\n  # [Feature] Implementation Plan\n  Goal: [one sentence]\n  Architecture: [2-3 sentences]\n  Tech Stack: Deno/TypeScript, Supabase, Astro\n\n- Use checkbox syntax: - [ ] Step\n- Group into numbered Tasks\n- End with: Verification — how to confirm the whole feature works\n\nPlatform context:\n- ${snap.totalTrainers} trainers on platform\n- Stack: Astro + Supabase edge functions (Deno) + PostgreSQL\n- All functions in supabase/functions/, shared utils in _shared/\n- Frontend in src/pages/ and src/lib/`,
      messages: [{ role: 'user', content: `Write an implementation plan for: ${feature}` }],
      max_tokens: 900,
      temperature: 0.2,
    });
    await sendMessage(chatId, `📋 *Implementation Plan: ${feature}*\n\n${response.text}`);
  } catch {
    await sendMessage(chatId, `Couldn't generate plan right now. Try again.`);
  }
}

async function handleBrainstorm(chatId: number, idea: string): Promise<void> {
  await sendTyping(chatId);
  const sb = createClient(SUPABASE_URL(), SUPABASE_KEY());
  const snap = await getPlatformSnapshot(sb);

  try {
    const response = await callClaude(ANTHROPIC_KEY(), {
      model: 'claude-haiku-4-5',
      system: CEO_SYSTEM_PROMPT + `\n\nYou are now activating the *Brainstorming* skill. Refine this idea through Socratic questioning before any code is written.\n\nProcess:\n1. Restate the idea in one sentence to confirm understanding\n2. Ask 3 clarifying questions that would change the design if answered differently\n3. Present 2-3 design alternatives with tradeoffs\n4. Recommend one approach with clear reasoning\n5. Identify the one biggest risk\n\nBe direct. Don't pad. The goal is to surface hidden assumptions and prevent building the wrong thing.\n\nPlatform context: ${snap.totalTrainers} trainers, ${snap.proCount} Pro, operating in AE/UK/FR/IT/ES/MX/IN markets.`,
      messages: [{ role: 'user', content: `Brainstorm: ${idea}` }],
      max_tokens: 700,
      temperature: 0.4,
    });
    await sendMessage(chatId, `💡 *Brainstorm: ${idea}*\n\n${response.text}`);
  } catch {
    await sendMessage(chatId, `Couldn't run brainstorm right now. Try again.`);
  }
}

async function handleReview(chatId: number, context: string): Promise<void> {
  await sendTyping(chatId);

  try {
    const response = await callClaude(ANTHROPIC_KEY(), {
      model: 'claude-haiku-4-5',
      system: CEO_SYSTEM_PROMPT + `\n\nYou are now activating the *Requesting Code Review* skill. Generate a pre-merge review checklist.\n\nThe review has two stages:\n**Stage 1 — Spec compliance:** Does the code do what was planned?\n**Stage 2 — Code quality:** Is it well-structured, secure, and maintainable?\n\nFor each stage, provide a checklist of specific things to verify. Flag any common failure patterns for TrainedBy:\n- JWT misconfiguration on webhook functions\n- Missing CORS OPTIONS handler\n- Hardcoded secrets or market-specific logic\n- Missing migration file for schema changes\n- Telegram functions returning non-200 on error\n- Fabricated metrics or placeholder data left in`,
      messages: [{ role: 'user', content: context ? `Review context: ${context}` : 'Generate a general pre-merge review checklist for the latest changes.' }],
      max_tokens: 600,
      temperature: 0.1,
    });
    await sendMessage(chatId, `✅ *Code Review Checklist*\n\n${response.text}`);
  } catch {
    await sendMessage(chatId, `Couldn't generate review checklist right now. Try again.`);
  }
}

async function handleGSD(chatId: number, args: string): Promise<void> {
  await sendTyping(chatId);

  if (!args) {
    await sendMessage(chatId, `*Get Shit Done (GSD) — Command Reference*

🚀 *Primary workflow commands:*
\`/gsd-do <description>\` — Smart dispatcher, routes to the right command
\`/gsd-quick <task>\` — Small task with quality guarantees
\`/gsd-fast <task>\` — Trivial task, no planning overhead
\`/gsd-debug <issue>\` — Systematic debugging with persistent state

📋 *Phase lifecycle:*
\`/gsd-discuss-phase N\` — Lock in preferences before planning
\`/gsd-plan-phase N\` — 4 parallel researchers → planner → plan-checker
\`/gsd-execute-phase N\` — Wave-based parallel execution
\`/gsd-verify-work\` — UAT + automated verification
\`/gsd-ship\` — Create PR / merge

📊 *Status & recovery:*
\`/gsd-progress\` — Current project status
\`/gsd-resume-work\` — Resume after context reset
\`/gsd-code-review\` — Two-stage code review

*All 73 GSD commands live in \`commands/gsd/\` in the repo.*

Use /gsd <command-name> for details on any specific command.
Or use /plan, /debug, /brainstorm, /review for quick access.`);
    return;
  }

  // Describe a specific GSD command
  const gsdCommands: Record<string, string> = {
    'do': '*gsd-do*\nSmart dispatcher. Describe what you want in plain English — GSD routes it to the right command automatically. Never need to remember command names.\n\nExample: `/gsd-do fix the stripe webhook not firing`',
    'quick': '*gsd-quick*\nExecute a small, self-contained task with full GSD quality guarantees (atomic commits, STATE.md tracking). Skips research and discussion by default. Add `--full` for the complete pipeline.\n\nExample: `/gsd-quick add a "verified" badge to trainer profiles`',
    'fast': '*gsd-fast*\nExecute a trivial task directly — no subagents, no planning. For tasks under 2 minutes: typo fixes, config changes, forgotten commits.\n\nExample: `/gsd-fast fix typo in the UAE landing page headline`',
    'debug': '*gsd-debug*\nSystematic debugging using the scientific method. Spawns an isolated subagent (fresh 200k context) to investigate. Maintains state across context resets so debugging sessions survive.\n\nAdd `--diagnose` to find root cause without applying a fix.\n\nExample: `/gsd-debug stripe webhook returning 401 in production`',
    'plan-phase': '*gsd-plan-phase*\nResearch and plan a specific phase. Spawns 4 parallel researchers (stack, features, architecture, pitfalls), synthesises findings, generates a plan, and runs a plan-checker. Plans where tasks lack verification commands are rejected.\n\nExample: `/gsd-plan-phase 1`',
    'execute-phase': '*gsd-execute-phase*\nExecute all plans in a phase using wave-based parallel execution. Each subagent gets a fresh 200k context. Supports `--tdd` flag for test-driven execution.\n\nExample: `/gsd-execute-phase 1`',
    'verify-work': '*gsd-verify-work*\nManual UAT + automated verification. Checks that the implementation matches the plan. Creates fix plans for any gaps found.\n\nRun after every execute-phase before shipping.',
    'code-review': '*gsd-code-review*\nTwo-stage review: spec compliance (does it do what was planned?) then code quality (is it well-structured, secure, maintainable?). Dispatches a gsd-code-reviewer subagent with precisely crafted context.',
    'progress': '*gsd-progress*\nCheck current project status: which phase you are in, what is complete, what is next, any blockers. Essential after a context reset.',
    'resume-work': '*gsd-resume-work*\nRestore session context after a reset. Reads STATE.md, ROADMAP.md, and the current phase plan to reconstruct exactly where you left off.',
  };

  const cmdKey = args.toLowerCase().replace('/gsd-', '').replace('gsd-', '');
  const desc = gsdCommands[cmdKey];
  if (desc) {
    await sendMessage(chatId, desc);
  } else {
    await sendMessage(chatId, `GSD command \`${args}\` not found.\n\nUse /gsd to see all available commands.`);
  }
}

async function handleSkill(chatId: number, skillName: string): Promise<void> {
  if (!skillName) {
    await sendMessage(chatId, `*Development Skills & Frameworks*

🏗️ *Primary Framework:*
/gsd — Get Shit Done: full lifecycle from idea to shipped code

🔍 *Quick Skills Commands:*
/debug <issue> — 4-phase systematic debugging
/plan <feature> — TDD implementation plan
/brainstorm <idea> — Socratic design refinement
/review [context] — Pre-merge code review checklist

📚 *Full Superpowers Skills Library:*
• get-shit-done (primary framework)
• brainstorming
• writing-plans
• test-driven-development
• systematic-debugging
• verification-before-completion
• requesting-code-review
• receiving-code-review
• executing-plans
• subagent-driven-development
• dispatching-parallel-agents
• using-git-worktrees
• finishing-a-development-branch
• writing-skills
• trainedby-edge-functions (custom)

All skills in \`skills/\`, GSD commands in \`commands/gsd/\`. Use /skill <name> for details.`);
    return;
  }

  // Map skill names to brief descriptions
  const skillDescriptions: Record<string, string> = {
    'brainstorming': '*Brainstorming*\nActivate before designing anything new. Refines rough ideas through Socratic questions, explores alternatives, validates design before a single line of code is written.\n\nUse: `/brainstorm <idea>`',
    'writing-plans': '*Writing Plans*\nActivate before implementing a feature. Breaks work into 2-5 minute bite-sized tasks with exact file paths, complete code snippets, and verification steps. Every task is TDD-first.\n\nUse: `/plan <feature>`',
    'test-driven-development': '*Test-Driven Development*\nIron law: no production code without a failing test first. RED (write failing test) → GREEN (minimal code to pass) → REFACTOR (clean up). If you wrote code before the test, delete it.\n\nActivated automatically by the /plan command.',
    'systematic-debugging': '*Systematic Debugging*\n4-phase protocol: Reproduce → Isolate → Root Cause → Fix & Verify. Never guess. The JWT incident (April 2026) is a canonical example of what happens without this process.\n\nUse: `/debug <issue>`',
    'verification-before-completion': '*Verification Before Completion*\nIron law: no completion claims without fresh verification evidence. Run the command. Read the output. THEN claim the result. "Should work" is not evidence.\n\nActivated automatically before any deployment.',
    'requesting-code-review': '*Requesting Code Review*\nTwo-stage review: spec compliance first, then code quality. Dispatch after each task in subagent-driven development and before any merge to main.\n\nUse: `/review [context]`',
    'trainedby-edge-functions': '*TrainedBy Edge Functions (Custom)*\nTrainedBy-specific patterns: JWT classification, webhook handling, Telegram alerts, deployment verification. The canonical reference for all edge function work.\n\nSee: `skills/trainedby-edge-functions/SKILL.md`',
  };

  const desc = skillDescriptions[skillName.toLowerCase()];
  if (desc) {
    await sendMessage(chatId, desc);
  } else {
    await sendMessage(chatId, `Skill \`${skillName}\` not found.\n\nUse /skill to see all available skills.`);
  }
}

// ── Legacy handlers ───────────────────────────────────────────────────────────

async function handleLearn(chatId: number, query: string): Promise<void> {
  await sendTyping(chatId);
  const sb = createClient(SUPABASE_URL(), SUPABASE_KEY());
  const q = query.toLowerCase().trim();
  const { data } = await sb
    .from('knowledge_base')
    .select('source, category, title, content')
    .or(`source.ilike.%${q}%,category.ilike.%${q}%,title.ilike.%${q}%`)
    .limit(3);

  if (!data || data.length === 0) {
    await sendMessage(chatId, `No knowledge base entries found for "${query}".`);
    return;
  }
  const entries = (data as { source: string; category: string; title: string; content: string }[])
    .map((e, i) => `*${i + 1}. ${e.title}*\n_[${e.source}]_\n${e.content.substring(0, 300)}...`)
    .join('\n\n');
  await sendMessage(chatId, `*Knowledge Base: "${query}"*\n\n${entries}`);
}

async function handleKB(chatId: number): Promise<void> {
  await sendTyping(chatId);
  const sb = createClient(SUPABASE_URL(), SUPABASE_KEY());
  const { data, count } = await sb.from('knowledge_base').select('source, title', { count: 'exact' }).limit(20);
  if (!data || data.length === 0) {
    await sendMessage(chatId, 'Knowledge base is empty.');
    return;
  }
  const lines = (data as { source: string; title: string }[]).map(e => `  • ${e.title} [${e.source}]`).join('\n');
  await sendMessage(chatId, `*Knowledge Base* (${count ?? data.length} entries)\n\n${lines}\n\nUse /learn <topic> to search.`);
}

async function handlePosts(chatId: number): Promise<void> {
  await sendTyping(chatId);
  const sb = createClient(SUPABASE_URL(), SUPABASE_KEY());
  const { data } = await sb.from('blog_posts').select('title, published_at, keyword').order('published_at', { ascending: false }).limit(5);
  if (!data || data.length === 0) {
    await sendMessage(chatId, 'No blog posts yet. Use /run content to publish one.');
    return;
  }
  const lines = (data as { title: string; published_at: string; keyword: string }[])
    .map((p, i) => `  ${i + 1}. *${p.title}*\n     ${new Date(p.published_at).toLocaleDateString('en-AE')} · keyword: ${p.keyword}`)
    .join('\n\n');
  await sendMessage(chatId, `*Recent Blog Posts*\n\n${lines}`);
}

async function handleMemo(chatId: number): Promise<void> {
  await sendTyping(chatId);
  const sb = createClient(SUPABASE_URL(), SUPABASE_KEY());
  const { data } = await sb.from('agent_memos').select('agent, summary, created_at').order('created_at', { ascending: false }).limit(1).single();
  if (!data) {
    await sendMessage(chatId, 'No agent memos yet. Use /run meta to generate one.');
    return;
  }
  const m = data as { agent: string; summary: string; created_at: string };
  await sendMessage(chatId, `*Latest Memo*\n_${m.agent} · ${new Date(m.created_at).toLocaleDateString('en-AE')}_\n\n${m.summary}`);
}

// ── Proactive notification handler ────────────────────────────────────────────
async function handleNotify(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { type, data } = body;
    const chatId = FOUNDER_CHAT_ID();

    const messages: Record<string, string> = {
      new_trainer: `🆕 *New trainer joined*\n${data?.name ?? 'Someone'} signed up${data?.market ? ` (${data.market.toUpperCase()})` : ''}.`,
      pro_upgrade: `💰 *Pro upgrade*\n${data?.name ?? 'A trainer'} upgraded to Pro. +149 AED MRR.`,
      new_lead: `📋 *New lead*\n${data?.client_name ?? 'A client'} contacted ${data?.trainer_name ?? 'a trainer'}.`,
      cert_submitted: `📄 *Cert review submitted*\n${data?.name ?? 'A trainer'} submitted a certificate for review. Confidence: ${data?.confidence ? Math.round(data.confidence * 100) + '%' : 'N/A'}`,
      cert_approved: `✅ *Cert approved*\n${data?.name ?? 'A trainer'} is now verified.`,
      academy_booking: `🏫 *Academy booking*\n${data?.parent_name ?? 'A parent'} booked ${data?.program_name ?? 'a programme'} at ${data?.academy_name ?? 'an academy'}. ${data?.amount ? data.amount.toLocaleString() + ' AED' : ''}`,
      anomaly: `⚠️ *Anomaly detected*\n${data?.message ?? 'Unusual activity detected. Check the dashboard.'}`,
      waitlist: `⏳ *Waitlist signup*\n${data?.name ?? 'Someone'} joined the waitlist for ${data?.market ? data.market.toUpperCase() : 'a market'}.`,
    };

    const msg = messages[type] ?? `📬 *Notification*\n${JSON.stringify(data).substring(0, 200)}`;
    await sendMessage(chatId, msg);

    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    log.exception(err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// ── Scheduled briefing ────────────────────────────────────────────────────────
async function handleScheduledBrief(): Promise<Response> {
  try {
    await handleBriefing(Number(FOUNDER_CHAT_ID()));
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    log.exception(err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
