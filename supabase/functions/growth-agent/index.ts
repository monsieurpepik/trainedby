/**
 * TrainedBy — Growth Agent
 * ─────────────────────────────────────────────────────────────────────────────
 * Dual-purpose edge function:
 *
 *   POST /functions/v1/growth-agent          — track a funnel event (client-side)
 *   POST /functions/v1/growth-agent/digest   — generate + email weekly owner digest (cron)
 *
 * Funnel events tracked:
 *   landing_view, join_step_1, join_step_2, join_complete,
 *   pricing_view, profile_view, wa_tap, plan_builder_open, plan_builder_complete
 *
 * The weekly digest:
 *   - Computes conversion rates at each funnel step
 *   - Identifies the biggest drop-off point
 *   - Generates an LLM hypothesis for why the drop-off happened
 *   - Emails the owner with a ranked list of improvement suggestions
 *   - Writes the memo to the `agent_memos` table for the meta-agent to consume
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { jsonResponse, errorResponse, CORS_HEADERS } from '../_shared/errors.ts';
import { createLogger } from '../_shared/logger.ts';

const log = createLogger('growth-agent');

const FUNNEL_STEPS = [
  'landing_view',
  'join_step_1',
  'join_step_2',
  'join_complete',
];

// ─── Main handler ─────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: CORS_HEADERS });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  // ── Route: POST /growth-agent/digest (cron or manual trigger) ──────────────
  if (req.method === 'POST' && path.endsWith('/digest')) {
    return handleDigest(req);
  }

  // ── Route: POST /growth-agent (track event) ────────────────────────────────
  if (req.method === 'POST') {
    return handleTrackEvent(req);
  }

  return errorResponse('Method not allowed', 405);
});

// ─── Track a funnel event ─────────────────────────────────────────────────────
async function handleTrackEvent(req: Request): Promise<Response> {
  const start = Date.now();
  try {
    const body = await req.json().catch(() => ({}));
    const { event, properties = {} } = body as {
      event: string;
      properties?: Record<string, unknown>;
    };

    if (!event || typeof event !== 'string') {
      return errorResponse('Missing required field: event', 400, 'VALIDATION_ERROR');
    }

    const sb = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Capture session/device context from headers
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const ua = req.headers.get('user-agent') ?? 'unknown';
    const referer = req.headers.get('referer') ?? '';

    const { error } = await sb.from('funnel_events').insert({
      event,
      properties: {
        ...properties,
        ip,
        ua,
        referer,
      },
      created_at: new Date().toISOString(),
    });

    if (error) {
      log.error('Failed to insert funnel event', { error: error.message, event });
      return errorResponse('Failed to record event', 500);
    }

    log.info('Funnel event tracked', { event, duration_ms: Date.now() - start });
    return jsonResponse({ ok: true, event });
  } catch (err) {
    log.exception(err);
    return errorResponse('Internal error', 500);
  }
}

// ─── Generate weekly growth digest ───────────────────────────────────────────
async function handleDigest(req: Request): Promise<Response> {
  const start = Date.now();
  log.info('Growth digest started');

  try {
    const sb = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();

    // ── 1. Pull funnel event counts for this week and last week ──────────────
    const [thisWeekRows, lastWeekRows, trainersThisWeek, trainersLastWeek, leadsThisWeek, leadsLastWeek] =
      await Promise.all([
        sb.from('funnel_events').select('event').gte('created_at', weekAgo),
        sb.from('funnel_events').select('event').gte('created_at', twoWeeksAgo).lt('created_at', weekAgo),
        sb.from('trainers').select('id', { count: 'exact' }).gte('created_at', weekAgo),
        sb.from('trainers').select('id', { count: 'exact' }).gte('created_at', twoWeeksAgo).lt('created_at', weekAgo),
        sb.from('leads').select('id', { count: 'exact' }).gte('created_at', weekAgo),
        sb.from('leads').select('id', { count: 'exact' }).gte('created_at', twoWeeksAgo).lt('created_at', weekAgo),
      ]);

    // Count events by type
    const countEvents = (rows: { event: string }[]) => {
      const counts: Record<string, number> = {};
      for (const r of rows) counts[r.event] = (counts[r.event] ?? 0) + 1;
      return counts;
    };

    const thisWeek = countEvents(thisWeekRows.data ?? []);
    const lastWeek = countEvents(lastWeekRows.data ?? []);

    // ── 2. Compute funnel conversion rates ───────────────────────────────────
    const funnelThis = FUNNEL_STEPS.map(step => ({
      step,
      count: thisWeek[step] ?? 0,
    }));

    const funnelLast = FUNNEL_STEPS.map(step => ({
      step,
      count: lastWeek[step] ?? 0,
    }));

    // Find biggest drop-off step this week
    let biggestDropStep = '';
    let biggestDropPct = 0;
    for (let i = 1; i < funnelThis.length; i++) {
      const prev = funnelThis[i - 1].count;
      const curr = funnelThis[i].count;
      if (prev > 0) {
        const dropPct = ((prev - curr) / prev) * 100;
        if (dropPct > biggestDropPct) {
          biggestDropPct = dropPct;
          biggestDropStep = funnelThis[i].step;
        }
      }
    }

    const topOfFunnel = funnelThis[0].count;
    const bottomOfFunnel = funnelThis[funnelThis.length - 1].count;
    const overallConversion = topOfFunnel > 0
      ? ((bottomOfFunnel / topOfFunnel) * 100).toFixed(1)
      : '0.0';

    // ── 3. Generate LLM hypothesis for biggest drop-off ──────────────────────
    let hypothesis = '';
    let suggestions: string[] = [];

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (openaiKey && biggestDropStep) {
      const prompt = `You are a growth analyst for TrainedBy.ae, a UAE platform for personal trainers.

This week's funnel data:
${funnelThis.map(f => `  ${f.step}: ${f.count} events`).join('\n')}

Biggest drop-off: ${biggestDropStep} (${biggestDropPct.toFixed(0)}% drop from previous step)
Overall conversion: ${overallConversion}%
New trainer signups: ${trainersThisWeek.count ?? 0} (vs ${trainersLastWeek.count ?? 0} last week)
New leads: ${leadsThisWeek.count ?? 0} (vs ${leadsLastWeek.count ?? 0} last week)

Generate:
1. A one-sentence hypothesis for WHY the biggest drop-off is happening at "${biggestDropStep}"
2. Three specific, actionable product changes ranked by expected impact (highest first)
3. One A/B test to run this week

Respond as JSON: { "hypothesis": "...", "suggestions": ["...", "...", "..."], "ab_test": "..." }`;

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
            temperature: 0.4,
          }),
        });
        const aiData = await aiRes.json();
        const parsed = JSON.parse(aiData.choices?.[0]?.message?.content ?? '{}');
        hypothesis = parsed.hypothesis ?? '';
        suggestions = parsed.suggestions ?? [];
        const abTest = parsed.ab_test ?? '';
        if (abTest) suggestions.push(`A/B test: ${abTest}`);
      } catch (aiErr) {
        log.warn('LLM hypothesis generation failed', { error: String(aiErr) });
        hypothesis = `High drop-off at ${biggestDropStep} — manual review needed.`;
        suggestions = ['Review UX at drop-off step', 'Check for mobile rendering issues', 'Simplify copy at this step'];
      }
    } else {
      hypothesis = biggestDropStep
        ? `High drop-off at ${biggestDropStep} — manual review needed.`
        : 'Insufficient funnel data this week.';
      suggestions = ['Add more funnel tracking events', 'Drive more top-of-funnel traffic', 'Review join flow on mobile'];
    }

    // ── 4. Build memo object ─────────────────────────────────────────────────
    const memo = {
      agent: 'growth-agent',
      week_ending: now.toISOString(),
      funnel_this_week: funnelThis,
      funnel_last_week: funnelLast,
      overall_conversion_pct: parseFloat(overallConversion),
      biggest_drop_step: biggestDropStep,
      biggest_drop_pct: parseFloat(biggestDropPct.toFixed(1)),
      new_trainers: trainersThisWeek.count ?? 0,
      new_trainers_delta: (trainersThisWeek.count ?? 0) - (trainersLastWeek.count ?? 0),
      new_leads: leadsThisWeek.count ?? 0,
      new_leads_delta: (leadsThisWeek.count ?? 0) - (leadsLastWeek.count ?? 0),
      hypothesis,
      suggestions,
      generated_at: now.toISOString(),
    };

    // ── 5. Write memo to agent_memos table ───────────────────────────────────
    const { error: memoErr } = await sb.from('agent_memos').insert({
      agent: 'growth-agent',
      memo,
      created_at: now.toISOString(),
    });
    if (memoErr) log.warn('Failed to write memo to DB', { error: memoErr.message });

    // ── 6. Send email digest to owner ────────────────────────────────────────
    const ownerEmail = Deno.env.get('OWNER_EMAIL') ?? 'admin@trainedby.ae';
    const emailSent = await sendDigestEmail(ownerEmail, memo);

    log.info('Growth digest complete', {
      duration_ms: Date.now() - start,
      conversion: overallConversion,
      drop_step: biggestDropStep,
      email_sent: emailSent,
    });

    return jsonResponse({ ok: true, memo, email_sent: emailSent });
  } catch (err) {
    log.exception(err);
    return errorResponse('Internal error', 500);
  }
}

// ─── Send digest email via Supabase (Resend) ─────────────────────────────────
async function sendDigestEmail(
  to: string,
  memo: Record<string, unknown>,
): Promise<boolean> {
  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (!resendKey) {
    log.warn('RESEND_API_KEY not set — skipping email');
    return false;
  }

  const funnel = memo.funnel_this_week as Array<{ step: string; count: number }>;
  const suggestions = memo.suggestions as string[];
  const weekEnding = new Date(memo.week_ending as string).toLocaleDateString('en-AE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const funnelRows = funnel.map(f =>
    `<tr><td style="padding:6px 12px;border-bottom:1px solid #222;">${f.step.replace(/_/g, ' ')}</td><td style="padding:6px 12px;border-bottom:1px solid #222;text-align:right;font-weight:600;">${f.count}</td></tr>`
  ).join('');

  const suggestionItems = suggestions.map((s, i) =>
    `<li style="margin-bottom:8px;"><strong>#${i + 1}:</strong> ${s}</li>`
  ).join('');

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>TrainedBy Weekly Growth Digest</title></head>
<body style="font-family:'Helvetica Neue',sans-serif;background:#0a0a0a;color:#e0e0e0;padding:32px;max-width:600px;margin:0 auto;">
  <div style="border-bottom:2px solid #FF5C00;padding-bottom:16px;margin-bottom:24px;">
    <h1 style="color:#fff;font-size:22px;margin:0;">TrainedBy <span style="color:#FF5C00;">Growth Digest</span></h1>
    <p style="color:#888;font-size:13px;margin:4px 0 0;">Week ending ${weekEnding}</p>
  </div>

  <h2 style="color:#fff;font-size:16px;margin-bottom:12px;">📊 Funnel This Week</h2>
  <table style="width:100%;border-collapse:collapse;background:#111;border-radius:8px;overflow:hidden;margin-bottom:24px;">
    <thead><tr style="background:#1a1a1a;">
      <th style="padding:8px 12px;text-align:left;color:#888;font-size:12px;text-transform:uppercase;">Step</th>
      <th style="padding:8px 12px;text-align:right;color:#888;font-size:12px;text-transform:uppercase;">Events</th>
    </tr></thead>
    <tbody>${funnelRows}</tbody>
  </table>

  <div style="background:#111;border-left:3px solid #FF5C00;padding:16px;border-radius:4px;margin-bottom:24px;">
    <p style="margin:0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Overall Conversion</p>
    <p style="margin:4px 0 0;font-size:28px;font-weight:700;color:#fff;">${memo.overall_conversion_pct}%</p>
    <p style="margin:8px 0 0;font-size:13px;color:#aaa;">Biggest drop-off: <strong style="color:#FF5C00;">${String(memo.biggest_drop_step).replace(/_/g, ' ')}</strong> (${memo.biggest_drop_pct}% drop)</p>
  </div>

  <div style="background:#111;border:1px solid #222;padding:16px;border-radius:8px;margin-bottom:24px;">
    <h3 style="color:#fff;font-size:14px;margin:0 0 8px;">🤖 Agent Hypothesis</h3>
    <p style="color:#ccc;font-size:14px;margin:0;line-height:1.6;">${memo.hypothesis}</p>
  </div>

  <h2 style="color:#fff;font-size:16px;margin-bottom:12px;">🎯 Ranked Improvement Suggestions</h2>
  <ul style="background:#111;border:1px solid #222;border-radius:8px;padding:16px 16px 16px 32px;margin-bottom:24px;color:#ccc;font-size:14px;line-height:1.7;">
    ${suggestionItems}
  </ul>

  <div style="background:#111;border:1px solid #222;padding:16px;border-radius:8px;margin-bottom:24px;">
    <h3 style="color:#fff;font-size:14px;margin:0 0 8px;">📈 Signups & Leads</h3>
    <p style="color:#ccc;font-size:14px;margin:0;">New trainers: <strong style="color:#fff;">${memo.new_trainers}</strong> (${(memo.new_trainers_delta as number) >= 0 ? '+' : ''}${memo.new_trainers_delta} vs last week)</p>
    <p style="color:#ccc;font-size:14px;margin:4px 0 0;">New leads: <strong style="color:#fff;">${memo.new_leads}</strong> (${(memo.new_leads_delta as number) >= 0 ? '+' : ''}${memo.new_leads_delta} vs last week)</p>
  </div>

  <p style="color:#555;font-size:12px;text-align:center;margin-top:32px;">Generated by TrainedBy Growth Agent · <a href="https://trainedby-ae.netlify.app" style="color:#FF5C00;">trainedby.ae</a></p>
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
        from: 'TrainedBy Growth Agent <growth@trainedby.ae>',
        to: [to],
        subject: `📊 TrainedBy Weekly Digest — ${memo.overall_conversion_pct}% conversion, ${memo.new_trainers} new trainers`,
        html,
      }),
    });
    return res.ok;
  } catch (err) {
    log.warn('Email send failed', { error: String(err) });
    return false;
  }
}
