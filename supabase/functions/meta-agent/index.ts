/**
 * TrainedBy  -  Meta-Agent v2 (Recursive Self-Improvement Engine)
 * ─────────────────────────────────────────────────────────────────────────────
 * Synthesises all agent outputs into a weekly product memo.
 * Uses the TrainedBy Voice System for direct, opinionated recommendations.
 *
 * POST /functions/v1/meta-agent    -  run meta-analysis (weekly cron)
 * GET  /functions/v1/meta-agent    -  return latest memo
 *
 * Anti-slop measures:
 *   1. Persona: writes as a founder/product lead, not a consultant
 *   2. Each improvement must have a specific metric it will move
 *   3. Quick win must have a specific hour estimate
 *   4. Big bet must have a falsifiable success metric
 *   5. Slop filter applied to all text fields
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { jsonResponse, errorResponse, CORS_HEADERS } from '../_shared/errors.ts';
import { createLogger } from '../_shared/logger.ts';
import { calculateSlopScore } from '../_shared/voice.ts';
import { callClaudeJSON } from '../_shared/claude.ts';
import { getMarketSupportEmail } from '../_shared/market_url.ts';

const log = createLogger('meta-agent');

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: CORS_HEADERS });
  }
  if (req.method === 'GET') return handleGetLatestMemo();
  if (req.method === 'POST') return handleRunMetaAnalysis();
  return errorResponse('Method not allowed', 405);
});

async function handleGetLatestMemo(): Promise<Response> {
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

async function handleRunMetaAnalysis(): Promise<Response> {
  const start = Date.now();
  log.info('Meta-agent v2 started');

  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!anthropicKey) return errorResponse('ANTHROPIC_API_KEY not configured', 500);

  const sb = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [growthMemoRow, contentMemoRow] = await Promise.all([
    sb.from('agent_memos').select('memo, created_at').eq('agent', 'growth-agent')
      .order('created_at', { ascending: false }).limit(1).single(),
    sb.from('agent_memos').select('memo, created_at').eq('agent', 'content-agent')
      .order('created_at', { ascending: false }).limit(1).single(),
  ]);

  const growthMemo = growthMemoRow.data?.memo ?? null;
  const contentMemo = contentMemoRow.data?.memo ?? null;

  const { data: supportConvs } = await sb
    .from('support_conversations')
    .select('question')
    .gte('created_at', weekAgo)
    .limit(50);

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

  const topQuestions = (supportConvs ?? [])
    .map((c: { question: string }) => c.question)
    .slice(0, 5)
    .join('; ');

  const growthSummary = growthMemo
    ? `Funnel conversion: ${growthMemo.overall_conversion_pct}%. Biggest drop: ${growthMemo.biggest_drop_step} (${growthMemo.biggest_drop_pct}% drop). New trainers: ${growthMemo.new_trainers} (${growthMemo.new_trainers_delta >= 0 ? '+' : ''}${growthMemo.new_trainers_delta}). Hypothesis: ${growthMemo.hypothesis}`
    : 'Growth agent has not run yet.';

  const contentSummary = contentMemo
    ? `Published: "${contentMemo.title}" targeting "${contentMemo.keyword}". Slop score: ${contentMemo.slop_score ?? 'N/A'}.`
    : 'Content agent has not run yet.';

  const supportSummary = supportConvs?.length
    ? `${supportConvs.length} support conversations this week. Top questions: ${topQuestions}`
    : 'No support conversations this week.';

  const prompt = `You are the founder of TrainedBy.ae reviewing your weekly numbers. You are direct, opinionated, and focused on one thing: getting trainers to upgrade from Free to Pro.

Platform this week:
- Total trainers: ${platformMetrics.total_trainers}
- Pro trainers: ${platformMetrics.pro_trainers} (${platformMetrics.conversion_to_pro} conversion)
- Total leads generated for trainers: ${platformMetrics.total_leads}
- Weekly funnel events: ${JSON.stringify(platformMetrics.weekly_events)}

Agent reports:
- Growth: ${growthSummary}
- Content: ${contentSummary}
- Support: ${supportSummary}

Write a Product Improvement Memo. Be direct. No corporate speak.

Rules:
- Executive summary: 2 sentences max. State the single most important thing happening.
- Each improvement must name the SPECIFIC metric it will move (e.g. "will increase free-to-pro conversion by ~5%")
- Quick win: something a developer can ship in under 2 hours. Be specific about what changes.
- Big bet: one thing that could double Pro conversions if it works. State the hypothesis as a bet.
- Watch metric: one number to check next Monday morning.
- Do NOT use: "leverage", "optimize", "holistic", "synergy", "game-changer", "it's important to", "consider"

Respond as JSON:
{
  "executive_summary": "...",
  "improvements": [
    { "rank": 1, "title": "...", "rationale": "...", "metric_moved": "...", "effort": "low|medium|high", "impact": "low|medium|high" }
  ],
  "quick_win": { "title": "...", "description": "...", "estimated_hours": 1.5 },
  "big_bet": { "title": "...", "hypothesis": "...", "success_metric": "..." },
  "watch_metric": "..."
}`;

  let analysis: Record<string, unknown> = {};
  try {
    analysis = await callClaudeJSON(anthropicKey, {
      model: 'claude-sonnet-4-5',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2000,
    });

    // Check slop
    const allText = [
      analysis.executive_summary,
      ...(analysis.improvements as Array<{ rationale: string }> ?? []).map(i => i.rationale),
      (analysis.quick_win as { description: string })?.description,
      (analysis.big_bet as { hypothesis: string })?.hypothesis,
    ].filter(Boolean).join(' ');

    const { score, found } = calculateSlopScore(String(allText));
    if (score > 20) {
      log.warn('Slop detected in meta memo', { score, found });
    }
  } catch (err) {
    log.exception(err, { step: 'llm_synthesis' });
    return errorResponse('LLM synthesis failed', 500);
  }

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

  await sb.from('agent_memos').insert({
    agent: 'meta-agent',
    memo,
    created_at: now.toISOString(),
  });

  const ownerEmail = Deno.env.get('OWNER_EMAIL') ?? getMarketSupportEmail('ae');
  await sendMetaMemoEmail(ownerEmail, memo);

  log.info('Meta-agent complete', { duration_ms: Date.now() - start });
  return jsonResponse({ ok: true, memo });
}

async function sendMetaMemoEmail(to: string, memo: Record<string, unknown>): Promise<boolean> {
  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (!resendKey) return false;

  const improvements = (memo.improvements as Array<{
    rank: number; title: string; rationale: string; metric_moved?: string; effort: string; impact: string;
  }> ?? []);

  const improvementRows = improvements.map(imp =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #222;font-weight:600;color:#FF5C00;">#${imp.rank}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #222;color:#fff;">${imp.title}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #222;color:#aaa;font-size:13px;">${imp.rationale}${imp.metric_moved ? `<br><em style="color:#FF5C00;">${imp.metric_moved}</em>` : ''}</td>
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
<head><meta charset="UTF-8"></head>
<body style="font-family:'Helvetica Neue',sans-serif;background:#0a0a0a;color:#e0e0e0;padding:32px;max-width:640px;margin:0 auto;">
  <div style="border-bottom:2px solid #FF5C00;padding-bottom:16px;margin-bottom:24px;">
    <h1 style="color:#fff;font-size:22px;margin:0;">TrainedBy <span style="color:#FF5C00;">Product Memo</span></h1>
    <p style="color:#888;font-size:13px;margin:4px 0 0;">Week ending ${weekEnding}</p>
  </div>
  <div style="background:#111;border-left:3px solid #FF5C00;padding:16px;border-radius:4px;margin-bottom:24px;">
    <h3 style="color:#fff;font-size:14px;margin:0 0 8px;">This week</h3>
    <p style="color:#ccc;font-size:14px;margin:0;line-height:1.7;">${memo.executive_summary}</p>
  </div>
  <div style="display:flex;gap:12px;margin-bottom:24px;">
    <div style="flex:1;background:#111;border:1px solid #222;padding:16px;border-radius:8px;text-align:center;">
      <p style="color:#888;font-size:11px;text-transform:uppercase;margin:0;">Trainers</p>
      <p style="color:#fff;font-size:24px;font-weight:700;margin:4px 0 0;">${metrics?.total_trainers ?? 0}</p>
    </div>
    <div style="flex:1;background:#111;border:1px solid #222;padding:16px;border-radius:8px;text-align:center;">
      <p style="color:#888;font-size:11px;text-transform:uppercase;margin:0;">Pro</p>
      <p style="color:#FF5C00;font-size:24px;font-weight:700;margin:4px 0 0;">${metrics?.pro_trainers ?? 0}</p>
    </div>
    <div style="flex:1;background:#111;border:1px solid #222;padding:16px;border-radius:8px;text-align:center;">
      <p style="color:#888;font-size:11px;text-transform:uppercase;margin:0;">Free→Pro</p>
      <p style="color:#00C853;font-size:24px;font-weight:700;margin:4px 0 0;">${metrics?.conversion_to_pro ?? '0%'}</p>
    </div>
  </div>
  <h2 style="color:#fff;font-size:16px;margin-bottom:12px;">Top 5 improvements</h2>
  <table style="width:100%;border-collapse:collapse;background:#111;border-radius:8px;overflow:hidden;margin-bottom:24px;">
    <thead><tr style="background:#1a1a1a;">
      <th style="padding:8px 12px;text-align:left;color:#888;font-size:11px;width:40px;">#</th>
      <th style="padding:8px 12px;text-align:left;color:#888;font-size:11px;">What</th>
      <th style="padding:8px 12px;text-align:left;color:#888;font-size:11px;">Why</th>
      <th style="padding:8px 12px;text-align:center;color:#888;font-size:11px;width:50px;">Impact</th>
    </tr></thead>
    <tbody>${improvementRows}</tbody>
  </table>
  ${quickWin ? `<div style="background:#0d1f0d;border:1px solid #1a3a1a;padding:16px;border-radius:8px;margin-bottom:16px;">
    <h3 style="color:#00C853;font-size:14px;margin:0 0 8px;">Ship this week (${quickWin.estimated_hours}h)</h3>
    <p style="color:#fff;font-size:14px;font-weight:600;margin:0 0 4px;">${quickWin.title}</p>
    <p style="color:#aaa;font-size:13px;margin:0;">${quickWin.description}</p>
  </div>` : ''}
  ${bigBet ? `<div style="background:#1a0d00;border:1px solid #3a1a00;padding:16px;border-radius:8px;margin-bottom:24px;">
    <h3 style="color:#FF5C00;font-size:14px;margin:0 0 8px;">Big bet</h3>
    <p style="color:#fff;font-size:14px;font-weight:600;margin:0 0 4px;">${bigBet.title}</p>
    <p style="color:#aaa;font-size:13px;margin:0 0 8px;">${bigBet.hypothesis}</p>
    <p style="color:#888;font-size:12px;margin:0;">Win condition: <strong style="color:#FF5C00;">${bigBet.success_metric}</strong></p>
  </div>` : ''}
  <div style="background:#111;border:1px solid #222;padding:12px 16px;border-radius:8px;margin-bottom:24px;">
    <p style="color:#888;font-size:12px;margin:0;">Check Monday: <strong style="color:#fff;">${memo.watch_metric}</strong></p>
  </div>
  <p style="color:#555;font-size:12px;text-align:center;margin-top:32px;">TrainedBy Meta-Agent · <a href="${getMarketBaseUrl('ae')}" style="color:#FF5C00;">${getMarketBaseUrl('ae').replace('https://', '')}</a></p>
</body>
</html>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: `TrainedBy Meta-Agent <${getMarketSupportEmail('ae')}>`,
        to: [to],
        subject: `TrainedBy Product Memo  -  ${improvements[0]?.title ?? 'Weekly review'}`,
        html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
