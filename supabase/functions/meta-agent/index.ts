/**
 * TrainedBy — Meta-Agent (Recursive Self-Improvement Engine)
 * ─────────────────────────────────────────────────────────────────────────────
 * Reads outputs from all other agents (growth, content, support) and produces
 * a weekly product improvement memo with ranked, actionable recommendations.
 *
 * POST /functions/v1/meta-agent   — run the meta-analysis (weekly cron)
 * GET  /functions/v1/meta-agent   — return the latest memo
 *
 * Process:
 *   1. Pull the latest memo from each agent (growth, content, support)
 *   2. Pull Stripe MRR and churn data
 *   3. Synthesise all signals into a ranked product backlog
 *   4. Generate a "Product Improvement Memo" with LLM
 *   5. Email the memo to the owner
 *   6. Write the memo to `agent_memos` for historical tracking
 *   7. (Future) Open a GitHub PR with the top suggestion auto-implemented
 *
 * This is the recursive self-improvement loop:
 *   Observe → Hypothesise → Prioritise → Implement → Measure → Repeat
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { jsonResponse, errorResponse, CORS_HEADERS } from '../_shared/errors.ts';
import { createLogger } from '../_shared/logger.ts';

const log = createLogger('meta-agent');

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: CORS_HEADERS });
  }

  if (req.method === 'GET') {
    return handleGetLatestMemo(req);
  }

  if (req.method === 'POST') {
    return handleRunMetaAnalysis(req);
  }

  return errorResponse('Method not allowed', 405);
});

// ─── Return latest meta-agent memo ───────────────────────────────────────────
async function handleGetLatestMemo(_req: Request): Promise<Response> {
  const sb = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data, error } = await sb
    .from('agent_memos')
    .select('memo, created_at')
    .eq('agent', 'meta-agent')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return jsonResponse({ memo: null, message: 'No memo generated yet' });
  return jsonResponse(data);
}

// ─── Run full meta-analysis ───────────────────────────────────────────────────
async function handleRunMetaAnalysis(_req: Request): Promise<Response> {
  const start = Date.now();
  log.info('Meta-agent started');

  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) return errorResponse('OPENAI_API_KEY not configured', 500);

  const sb = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // ── 1. Pull latest memo from each agent ──────────────────────────────────
  const [growthMemoRow, contentMemoRow] = await Promise.all([
    sb.from('agent_memos').select('memo, created_at').eq('agent', 'growth-agent')
      .order('created_at', { ascending: false }).limit(1).single(),
    sb.from('agent_memos').select('memo, created_at').eq('agent', 'content-agent')
      .order('created_at', { ascending: false }).limit(1).single(),
  ]);

  const growthMemo = growthMemoRow.data?.memo ?? null;
  const contentMemo = contentMemoRow.data?.memo ?? null;

  // ── 2. Pull support conversation stats ───────────────────────────────────
  const { data: supportConvs } = await sb
    .from('support_conversations')
    .select('question, answer')
    .gte('created_at', weekAgo)
    .limit(50);

  // Find most common question topics
  const questionTopics = (supportConvs ?? [])
    .map((c: { question: string }) => c.question.toLowerCase())
    .join(' ');

  // ── 3. Pull platform metrics ──────────────────────────────────────────────
  const [totalTrainers, proTrainers, totalLeads, recentEvents] = await Promise.all([
    sb.from('trainers').select('id', { count: 'exact' }),
    sb.from('trainers').select('id', { count: 'exact' }).eq('tier', 'pro'),
    sb.from('leads').select('id', { count: 'exact' }),
    sb.from('funnel_events').select('event').gte('created_at', weekAgo),
  ]);

  const eventCounts: Record<string, number> = {};
  for (const e of (recentEvents.data ?? [])) {
    eventCounts[e.event] = (eventCounts[e.event] ?? 0) + 1;
  }

  const platformMetrics = {
    total_trainers: totalTrainers.count ?? 0,
    pro_trainers: proTrainers.count ?? 0,
    conversion_to_pro: totalTrainers.count
      ? `${(((proTrainers.count ?? 0) / totalTrainers.count) * 100).toFixed(1)}%`
      : '0%',
    total_leads: totalLeads.count ?? 0,
    weekly_events: eventCounts,
  };

  // ── 4. Build synthesis prompt ─────────────────────────────────────────────
  const growthSummary = growthMemo ? `
Growth Agent Report:
- Overall funnel conversion: ${growthMemo.overall_conversion_pct}%
- Biggest drop-off: ${growthMemo.biggest_drop_step} (${growthMemo.biggest_drop_pct}% drop)
- New trainers this week: ${growthMemo.new_trainers} (${growthMemo.new_trainers_delta >= 0 ? '+' : ''}${growthMemo.new_trainers_delta})
- New leads: ${growthMemo.new_leads} (${growthMemo.new_leads_delta >= 0 ? '+' : ''}${growthMemo.new_leads_delta})
- Agent hypothesis: ${growthMemo.hypothesis}
- Agent suggestions: ${(growthMemo.suggestions as string[]).join('; ')}` : 'Growth agent has not run yet.';

  const contentSummary = contentMemo ? `
Content Agent Report:
- Published: "${contentMemo.title}" targeting "${contentMemo.keyword}"
- Word count: ${contentMemo.word_count}
- Deploy triggered: ${contentMemo.deploy_triggered}` : 'Content agent has not run yet.';

  const supportSummary = supportConvs && supportConvs.length > 0
    ? `Support Agent: ${supportConvs.length} conversations this week. Common topics: ${questionTopics.substring(0, 300)}`
    : 'Support agent: No conversations this week.';

  const prompt = `You are the product strategist for TrainedBy.ae, a UAE platform for personal trainers.

Review the weekly agent reports and platform metrics below, then produce a structured Product Improvement Memo.

=== PLATFORM METRICS ===
Total trainers: ${platformMetrics.total_trainers}
Pro trainers: ${platformMetrics.pro_trainers} (${platformMetrics.conversion_to_pro} conversion)
Total leads generated: ${platformMetrics.total_leads}
Weekly funnel events: ${JSON.stringify(platformMetrics.weekly_events)}

=== AGENT REPORTS ===
${growthSummary}

${contentSummary}

${supportSummary}

=== YOUR TASK ===
Produce a Product Improvement Memo with:
1. Executive summary (2-3 sentences on the state of the business)
2. Top 5 product improvements ranked by impact × effort (highest ROI first)
3. One "quick win" that can be shipped this week (< 2 hours of dev)
4. One "big bet" that could 10x a key metric if it works
5. Key metric to watch next week

Respond as JSON:
{
  "executive_summary": "...",
  "improvements": [
    { "rank": 1, "title": "...", "rationale": "...", "effort": "low|medium|high", "impact": "low|medium|high" }
  ],
  "quick_win": { "title": "...", "description": "...", "estimated_hours": 1.5 },
  "big_bet": { "title": "...", "hypothesis": "...", "success_metric": "..." },
  "watch_metric": "..."
}`;

  let analysis: Record<string, unknown> = {};
  try {
    const aiRes = await fetch((Deno.env.get('OPENAI_BASE_URL') ?? 'https://api.openai.com/v1') + '/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });
    const aiData = await aiRes.json();
    analysis = JSON.parse(aiData.choices?.[0]?.message?.content ?? '{}');
  } catch (err) {
    log.exception(err, { step: 'llm_synthesis' });
    return errorResponse('LLM synthesis failed', 500);
  }

  // ── 5. Build full memo ────────────────────────────────────────────────────
  const memo = {
    agent: 'meta-agent',
    week_ending: now.toISOString(),
    platform_metrics: platformMetrics,
    growth_memo_date: growthMemoRow.data?.created_at ?? null,
    content_memo_date: contentMemoRow.data?.created_at ?? null,
    support_conversations_this_week: supportConvs?.length ?? 0,
    executive_summary: analysis.executive_summary,
    improvements: analysis.improvements,
    quick_win: analysis.quick_win,
    big_bet: analysis.big_bet,
    watch_metric: analysis.watch_metric,
    generated_at: now.toISOString(),
  };

  // ── 6. Save memo ──────────────────────────────────────────────────────────
  await sb.from('agent_memos').insert({
    agent: 'meta-agent',
    memo,
    created_at: now.toISOString(),
  });

  // ── 7. Email the memo to owner ────────────────────────────────────────────
  const ownerEmail = Deno.env.get('OWNER_EMAIL') ?? 'admin@trainedby.ae';
  await sendMetaMemoEmail(ownerEmail, memo);

  log.info('Meta-agent complete', { duration_ms: Date.now() - start });

  return jsonResponse({ ok: true, memo });
}

// ─── Send meta memo email ─────────────────────────────────────────────────────
async function sendMetaMemoEmail(
  to: string,
  memo: Record<string, unknown>,
): Promise<boolean> {
  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (!resendKey) return false;

  const improvements = (memo.improvements as Array<{
    rank: number; title: string; rationale: string; effort: string; impact: string;
  }> ?? []);

  const improvementRows = improvements.map(imp =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #222;font-weight:600;color:#FF5C00;">#${imp.rank}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #222;color:#fff;">${imp.title}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #222;color:#aaa;">${imp.rationale}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #222;text-align:center;">${imp.impact === 'high' ? '🔥' : imp.impact === 'medium' ? '⚡' : '💧'}</td>
    </tr>`
  ).join('');

  const quickWin = memo.quick_win as { title: string; description: string; estimated_hours: number } | null;
  const bigBet = memo.big_bet as { title: string; hypothesis: string; success_metric: string } | null;
  const metrics = memo.platform_metrics as Record<string, unknown>;

  const weekEnding = new Date(memo.week_ending as string).toLocaleDateString('en-AE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>TrainedBy Weekly Product Memo</title></head>
<body style="font-family:'Helvetica Neue',sans-serif;background:#0a0a0a;color:#e0e0e0;padding:32px;max-width:640px;margin:0 auto;">
  <div style="border-bottom:2px solid #FF5C00;padding-bottom:16px;margin-bottom:24px;">
    <h1 style="color:#fff;font-size:22px;margin:0;">TrainedBy <span style="color:#FF5C00;">Product Memo</span></h1>
    <p style="color:#888;font-size:13px;margin:4px 0 0;">Week ending ${weekEnding} · Generated by Meta-Agent</p>
  </div>

  <div style="background:#111;border-left:3px solid #FF5C00;padding:16px;border-radius:4px;margin-bottom:24px;">
    <h3 style="color:#fff;font-size:14px;margin:0 0 8px;">📋 Executive Summary</h3>
    <p style="color:#ccc;font-size:14px;margin:0;line-height:1.7;">${memo.executive_summary}</p>
  </div>

  <div style="display:flex;gap:12px;margin-bottom:24px;">
    <div style="flex:1;background:#111;border:1px solid #222;padding:16px;border-radius:8px;text-align:center;">
      <p style="color:#888;font-size:11px;text-transform:uppercase;margin:0;">Total Trainers</p>
      <p style="color:#fff;font-size:24px;font-weight:700;margin:4px 0 0;">${metrics?.total_trainers ?? 0}</p>
    </div>
    <div style="flex:1;background:#111;border:1px solid #222;padding:16px;border-radius:8px;text-align:center;">
      <p style="color:#888;font-size:11px;text-transform:uppercase;margin:0;">Pro Trainers</p>
      <p style="color:#FF5C00;font-size:24px;font-weight:700;margin:4px 0 0;">${metrics?.pro_trainers ?? 0}</p>
    </div>
    <div style="flex:1;background:#111;border:1px solid #222;padding:16px;border-radius:8px;text-align:center;">
      <p style="color:#888;font-size:11px;text-transform:uppercase;margin:0;">Free→Pro</p>
      <p style="color:#00C853;font-size:24px;font-weight:700;margin:4px 0 0;">${metrics?.conversion_to_pro ?? '0%'}</p>
    </div>
  </div>

  <h2 style="color:#fff;font-size:16px;margin-bottom:12px;">🎯 Top 5 Product Improvements</h2>
  <table style="width:100%;border-collapse:collapse;background:#111;border-radius:8px;overflow:hidden;margin-bottom:24px;">
    <thead><tr style="background:#1a1a1a;">
      <th style="padding:8px 12px;text-align:left;color:#888;font-size:11px;text-transform:uppercase;width:40px;">#</th>
      <th style="padding:8px 12px;text-align:left;color:#888;font-size:11px;text-transform:uppercase;">Improvement</th>
      <th style="padding:8px 12px;text-align:left;color:#888;font-size:11px;text-transform:uppercase;">Rationale</th>
      <th style="padding:8px 12px;text-align:center;color:#888;font-size:11px;text-transform:uppercase;width:50px;">Impact</th>
    </tr></thead>
    <tbody>${improvementRows}</tbody>
  </table>

  ${quickWin ? `
  <div style="background:#0d1f0d;border:1px solid #1a3a1a;padding:16px;border-radius:8px;margin-bottom:16px;">
    <h3 style="color:#00C853;font-size:14px;margin:0 0 8px;">⚡ Quick Win This Week (${quickWin.estimated_hours}h)</h3>
    <p style="color:#fff;font-size:14px;font-weight:600;margin:0 0 4px;">${quickWin.title}</p>
    <p style="color:#aaa;font-size:13px;margin:0;">${quickWin.description}</p>
  </div>` : ''}

  ${bigBet ? `
  <div style="background:#1a0d00;border:1px solid #3a1a00;padding:16px;border-radius:8px;margin-bottom:24px;">
    <h3 style="color:#FF5C00;font-size:14px;margin:0 0 8px;">🚀 Big Bet</h3>
    <p style="color:#fff;font-size:14px;font-weight:600;margin:0 0 4px;">${bigBet.title}</p>
    <p style="color:#aaa;font-size:13px;margin:0 0 8px;">${bigBet.hypothesis}</p>
    <p style="color:#888;font-size:12px;margin:0;">Success metric: <strong style="color:#FF5C00;">${bigBet.success_metric}</strong></p>
  </div>` : ''}

  <div style="background:#111;border:1px solid #222;padding:12px 16px;border-radius:8px;margin-bottom:24px;">
    <p style="color:#888;font-size:12px;margin:0;">📊 Watch next week: <strong style="color:#fff;">${memo.watch_metric}</strong></p>
  </div>

  <p style="color:#555;font-size:12px;text-align:center;margin-top:32px;">Generated by TrainedBy Meta-Agent · <a href="https://trainedby-ae.netlify.app" style="color:#FF5C00;">trainedby.ae</a></p>
</body>
</html>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'TrainedBy Meta-Agent <meta@trainedby.ae>',
        to: [to],
        subject: `🧠 TrainedBy Weekly Product Memo — ${improvements[0]?.title ?? 'Review ready'}`,
        html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
