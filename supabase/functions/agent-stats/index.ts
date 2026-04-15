/**
 * TrainedBy — Stats Reporter Agent
 * ─────────────────────────────────────────────────────────────────────────────
 * Triggered by: pg_cron every Sunday at 19:00
 *
 * What it does:
 *   For each Pro trainer:
 *   1. Pulls last 7 days vs previous 7 days: views, leads, WhatsApp taps
 *   2. Calculates conversion rate (leads / views)
 *   3. Generates one insight and one specific action
 *   4. Sends a clean weekly summary via preferred channel
 *
 * The trainer reads it Sunday evening and knows exactly where they stand.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../_shared/logger.ts';
import { sendToTrainer } from '../_shared/channel.ts';
import { getMarket, type Locale } from '../_shared/locale.ts';

const log = createLogger('agent-stats');

const ANTHROPIC_KEY = () => Deno.env.get('ANTHROPIC_API_KEY')!;

interface WeekStats {
  views: number;
  leads: number;
  waTaps: number;
  prevViews: number;
  prevLeads: number;
  conversionRate: number;
}

async function fetchStats(sb: ReturnType<typeof createClient>, trainerId: string): Promise<WeekStats> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
  const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000).toISOString();

  // This week
  const { data: thisWeek } = await sb
    .from('profile_events')
    .select('event_type')
    .eq('trainer_id', trainerId)
    .gte('created_at', weekAgo);

  // Previous week
  const { data: prevWeek } = await sb
    .from('profile_events')
    .select('event_type')
    .eq('trainer_id', trainerId)
    .gte('created_at', twoWeeksAgo)
    .lt('created_at', weekAgo);

  const count = (events: { event_type: string }[] | null, type: string) =>
    events?.filter(e => e.event_type === type).length ?? 0;

  const views = count(thisWeek, 'view');
  const leads = count(thisWeek, 'lead');
  const waTaps = count(thisWeek, 'whatsapp_tap');
  const prevViews = count(prevWeek, 'view');
  const prevLeads = count(prevWeek, 'lead');
  const conversionRate = views > 0 ? Math.round((leads / views) * 100) : 0;

  return { views, leads, waTaps, prevViews, prevLeads, conversionRate };
}

async function generateInsight(
  trainerName: string,
  stats: WeekStats,
  market: ReturnType<typeof getMarket>,
): Promise<{ insight: string; action: string }> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY(),
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 200,
      temperature: 0.4,
      system: `You are a direct business advisor for personal trainers in ${market.city}. Write in ${market.language}. Be specific, data-driven, and brief.`,
      messages: [{
        role: 'user',
        content: `Trainer: ${trainerName}. This week: ${stats.views} views, ${stats.leads} leads, ${stats.waTaps} WhatsApp taps, ${stats.conversionRate}% conversion. Previous week: ${stats.prevViews} views, ${stats.prevLeads} leads.

Write exactly:
INSIGHT: [one sentence about what the data means — specific, not generic]
ACTION: [one specific thing they should do this week to improve — under 20 words]`,
      }],
    }),
  });

  const data = await res.json();
  const raw = data.content?.[0]?.text ?? '';

  const insightMatch = raw.match(/INSIGHT:\s*(.+?)(?=ACTION:|$)/is);
  const actionMatch = raw.match(/ACTION:\s*(.+?)$/is);

  return {
    insight: insightMatch?.[1]?.trim() ?? 'Keep building — consistency compounds.',
    action: actionMatch?.[1]?.trim() ?? 'Share your profile link with one person today.',
  };
}

function trend(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? ' ↑' : '';
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return ' →';
  return pct > 0 ? ` ↑${pct}%` : ` ↓${Math.abs(pct)}%`;
}

Deno.serve(async (_req: Request) => {
  const sb = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: trainers } = await sb
    .from('trainers')
    .select('id, name, full_name, locale, plan, assistant_channel, telegram_chat_id, whatsapp')
    .in('plan', ['pro', 'premium'])
    .limit(500);

  if (!trainers?.length) {
    return new Response(JSON.stringify({ ok: true, sent: 0 }), { status: 200 });
  }

  let sent = 0;
  for (const trainer of trainers) {
    const market = getMarket(trainer.locale as Locale);
    const trainerName = trainer.name || trainer.full_name || 'Trainer';

    try {
      const stats = await fetchStats(sb, trainer.id);
      const { insight, action } = await generateInsight(trainerName, stats, market);

      const weekLabel = new Date().toLocaleDateString('en', {
        month: 'short', day: 'numeric',
        timeZone: market.timezone,
      });

      const message = [
        `📊 *Weekly Report — w/e ${weekLabel}*`,
        '',
        `👁 Views: *${stats.views}*${trend(stats.views, stats.prevViews)}`,
        `📩 Leads: *${stats.leads}*${trend(stats.leads, stats.prevLeads)}`,
        `💬 WhatsApp taps: *${stats.waTaps}*`,
        `📈 Conversion: *${stats.conversionRate}%*`,
        '',
        `💡 ${insight}`,
        '',
        `✅ *This week:* ${action}`,
      ].join('\n');

      await sendToTrainer(
        {
          channel: trainer.assistant_channel || 'dashboard',
          telegram_chat_id: trainer.telegram_chat_id,
          whatsapp: trainer.whatsapp,
          trainer_id: trainer.id,
        },
        { text: message },
        'stats-agent',
      );

      sent++;
      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      log.error('Stats agent failed for trainer', { trainer_id: trainer.id, err });
    }
  }

  log.info('Stats agent done', { sent });
  return new Response(JSON.stringify({ ok: true, sent }), { status: 200 });
});
