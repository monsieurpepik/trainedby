import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getMarketBrand, getMarketSupportEmail, getDashboardUrl, getMarketBaseUrl } from '../_shared/market_url.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const CRON_SECRET = Deno.env.get('CRON_SECRET') || '';
const TELEGRAM_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') || '';
const FOUNDER_CHAT_ID = Deno.env.get('FOUNDER_CHAT_ID') || '';

const sb = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

function timingSafeEqual(a: string, b: string): boolean {
  const ae = new TextEncoder().encode(a);
  const be = new TextEncoder().encode(b);
  const len = Math.max(ae.length, be.length);
  let result = ae.length ^ be.length;
  for (let i = 0; i < len; i++) result |= (ae[i] ?? 0) ^ (be[i] ?? 0);
  return result === 0;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

function emailBase(content: string, market = 'ae'): string {
  const brand = getMarketBrand(market);
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { margin: 0; padding: 0; background: #0a0a0a; font-family: 'Inter', -apple-system, sans-serif; }
  .wrap { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
  .logo { font-family: 'Manrope', sans-serif; font-size: 20px; font-weight: 800; color: #fff; margin-bottom: 32px; }
  .logo span { color: #FF5C00; }
  .card { background: #111; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 28px; }
  h1 { font-family: 'Manrope', sans-serif; font-size: 22px; font-weight: 800; color: #fff; margin: 0 0 12px; line-height: 1.3; }
  p { font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.7; margin: 0 0 16px; }
  .btn { display: inline-block; background: #FF5C00; color: #fff; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none; margin: 8px 0; }
  .divider { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 24px 0; }
  .footer { font-size: 11px; color: rgba(255,255,255,0.25); margin-top: 24px; line-height: 1.6; }
  .highlight { color: #FF5C00; font-weight: 700; }
  .checklist { list-style: none; padding: 0; margin: 16px 0; }
  .checklist li { padding: 8px 0; font-size: 13px; color: rgba(255,255,255,0.7); border-bottom: 1px solid rgba(255,255,255,0.05); }
  .checklist li:last-child { border-bottom: none; }
  .checklist li::before { content: '→ '; color: #FF5C00; font-weight: 700; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo">Trained<span>By</span></div>
  <div class="card">
    ${content}
  </div>
  <div class="footer">
    ${brand}<br>
    You're receiving this because you have a profile on ${brand}.<br>
    <a href="${getMarketBaseUrl(market)}/unsubscribe" style="color:rgba(255,255,255,0.25)">Unsubscribe</a>
  </div>
</div>
</body>
</html>`;
}

function weeklyDigestEmail(name: string, _slug: string, market: string, views: number, leads: number, waTaps: number): { subject: string; html: string } {
  const brand = getMarketBrand(market);
  const dashUrl = getDashboardUrl(market);
  const firstName = (name?.trim() || 'there').split(' ')[0] || 'there';
  const subject = `${firstName}, your week on ${brand}: ${views} views · ${leads} leads`;
  const html = emailBase(`
    <h1>Your week on ${brand}</h1>
    <p>Here's how your profile performed in the last 7 days:</p>
    <ul class="checklist">
      <li>Profile views: <span class="highlight">${views}</span></li>
      <li>New leads: <span class="highlight">${leads}</span></li>
      <li>WhatsApp taps: <span class="highlight">${waTaps}</span></li>
    </ul>
    ${leads > 0
      ? `<p>You have <span class="highlight">${leads} new lead${leads > 1 ? 's' : ''}</span> waiting. Reply within the hour to convert.</p>`
      : '<p>No leads this week. Make sure your profile has a clear photo, bio, and specialties — those are the biggest factors.</p>'}
    <a href="${dashUrl}" class="btn">Open Dashboard →</a>
  `, market);
  return { subject, html };
}

async function sendEmail(to: string, subject: string, html: string, from: string): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.log(`[weekly-digest] No Resend key — would send to ${to}: ${subject}`);
    return true;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error(`[weekly-digest] Resend error for ${to}: ${err}`);
    return false;
  }
  return true;
}

async function notifyFounder(message: string): Promise<void> {
  if (!TELEGRAM_TOKEN || !FOUNDER_CHAT_ID) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: FOUNDER_CHAT_ID, text: message, parse_mode: 'Markdown' }),
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const cronSecret = req.headers.get('x-cron-secret');
  if (!CRON_SECRET || !cronSecret || !timingSafeEqual(cronSecret, CRON_SECRET)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { data: trainers, error: fetchError } = await sb
      .from('trainers')
      .select('id, name, email, slug, market, plan')
      .not('email', 'is', null)
      .neq('email', '');

    if (fetchError) {
      console.error('[weekly-digest] Failed to fetch trainers:', fetchError.message);
      return new Response(JSON.stringify({ error: fetchError.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    let sent = 0;
    let skipped = 0;

    for (const t of (trainers || [])) {
      if (!t.email?.includes('@')) { skipped++; continue; }

      const [viewsRes, leadsRes, eventsRes] = await Promise.all([
        sb.from('profile_views').select('*', { count: 'exact', head: true }).eq('trainer_id', t.id).gte('created_at', weekAgo),
        sb.from('leads').select('*', { count: 'exact', head: true }).eq('trainer_id', t.id).gte('created_at', weekAgo),
        sb.from('events')
          .select('*', { count: 'exact', head: true })
          .eq('trainer_id', t.id)
          .eq('event_type', 'wa_tap')
          .gte('created_at', weekAgo),
      ]);

      const views = viewsRes.count || 0;
      const leads = leadsRes.count || 0;
      const waTaps = eventsRes.count || 0;

      if (views === 0 && leads === 0 && waTaps === 0) { skipped++; continue; }

      const market = t.market || 'ae';
      const email = weeklyDigestEmail(t.name, t.slug, market, views, leads, waTaps);
      const from = `${getMarketBrand(market)} <${getMarketSupportEmail(market)}>`;
      const ok = await sendEmail(t.email, email.subject, email.html, from);
      if (ok) sent++; else skipped++;
      await new Promise(r => setTimeout(r, 200));
    }

    await notifyFounder(`📊 *Weekly digest sent*\nSent: ${sent} | Skipped: ${skipped}`);

    return new Response(JSON.stringify({ ok: true, sent, skipped }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('[weekly-digest] Unexpected error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
