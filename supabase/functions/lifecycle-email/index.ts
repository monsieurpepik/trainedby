import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getProfileUrl, getDashboardUrl, getPricingUrl, getJoinUrl, getMarketBrand, getMarketSupportEmail } from '../_shared/market_url.ts';
import { captureException } from '../_shared/sentry.ts';
import { callClaude } from '../_shared/claude.ts';
import { TRAINEDBY_PERSONA } from '../_shared/voice.ts';
import { getLocale, getEmailCopy, getPersona, getMarket } from '../_shared/locale.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
// FROM_EMAIL is now locale-aware — set per-send below
const TELEGRAM_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') || '';
const FOUNDER_CHAT_ID = Deno.env.get('FOUNDER_CHAT_ID') || '';

const sb = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

// ── Email templates ───────────────────────────────────────────────────────────

interface Trainer {
  id: string;
  name: string;
  email: string;
  plan: string;
  reps_verified: boolean;
  city: string;
  slug: string;
  bio: string;
  avatar_url: string;
  specialties: string[];
  instagram: string;
  created_at: string;
}

function completionScore(t: Trainer): number {
  let score = 0;
  if (t.avatar_url) score += 20;
  if (t.bio && t.bio.length > 30) score += 20;
  if (t.reps_verified) score += 15;
  if (t.specialties && t.specialties.length > 0) score += 10;
  if (t.city) score += 10;
  if (t.instagram) score += 10;
  return score;
}

function getMissingItems(t: Trainer): string[] {
  const missing: string[] = [];
  if (!t.avatar_url) missing.push('a profile photo');
  if (!t.bio || t.bio.length < 30) missing.push('a bio');
  if (!t.reps_verified) missing.push('REPs UAE verification');
  if (!t.specialties || t.specialties.length === 0) missing.push('your specialties');
  if (!t.city) missing.push('your city');
  if (!t.instagram) missing.push('your Instagram');
  return missing;
}

function emailBase(content: string, market = 'ae'): string {
  const brand = getMarketBrand(market);
  const supportEmail = getMarketSupportEmail(market);
  const baseUrl = `https://${market === 'ae' ? 'trainedby.ae' : market === 'fr' ? 'coachepar.fr' : market === 'it' ? 'allenaticon.it' : market === 'es' || market === 'mx' ? 'entrenacon.com' : market === 'uk' ? 'trainedby.uk' : market === 'in' ? 'trainedby.in' : 'trainedby.com'}`;
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
  <div class="logo">${brand.replace('é', 'é')}</div>
  <div class="card">
    ${content}
  </div>
  <div class="footer">
    ${brand}<br>
    You're receiving this because you signed up at ${baseUrl}<br>
    <a href="${baseUrl}/unsubscribe" style="color:rgba(255,255,255,0.25)">Unsubscribe</a>
  </div>
</div>
</body>
</html>`;
}

function welcomeEmail(t: Trainer, market = 'ae'): { subject: string; html: string } {
  const profileUrl = getProfileUrl(market, t.slug);
  const dashUrl = getDashboardUrl(market);
  const brand = getMarketBrand(market);
  return {
    subject: `Welcome to ${brand}, ${t.name.split(' ')[0]}`,
    html: emailBase(`
      <h1>You're in. Now let's get clients finding you.</h1>
      <p>Your TrainedBy profile is live at <a href="${profileUrl}" style="color:#FF5C00">${profileUrl}</a>.</p>
      <p>Trainers with complete profiles get <span class="highlight">5× more leads</span> than those with empty ones. Here's what to do in the next 10 minutes:</p>
      <ul class="checklist">
        <li>Add a clear profile photo (not a gym selfie — face forward, good lighting)</li>
        <li>Write a 2-sentence bio that says who you help and how</li>
        <li>Add your REPs UAE number to get the verified badge</li>
        <li>Set your session packages so clients know your rates</li>
      </ul>
      <a href="${dashUrl}" class="btn">Complete Your Profile →</a>
      <hr class="divider">
      <p style="font-size:12px">Any questions? Just reply to this email. A real person reads every response.</p>
    `)
  };
}

function nudgeEmail(t: Trainer, market = 'ae'): { subject: string; html: string } {
  const dashUrl = getDashboardUrl(market);
  const missing = getMissingItems(t);
  const pct = completionScore(t);
  return {
    subject: `${t.name.split(' ')[0]}, your profile is ${pct}% complete`,
    html: emailBase(`
      <h1>You're ${pct}% there.</h1>
      <p>Your TrainedBy profile is live but not yet working hard for you. Clients who find you right now see an incomplete profile — and they move on.</p>
      ${missing.length > 0 ? `
      <p>You're still missing:</p>
      <ul class="checklist">
        ${missing.map(m => `<li>${m}</li>`).join('')}
      </ul>` : ''}
      <p>Takes less than 5 minutes. Do it now while it's fresh.</p>
      <a href="${dashUrl}" class="btn">Finish Your Profile →</a>
    `)
  };
}

function firstLeadEmail(t: Trainer, leadName: string, market = 'ae'): { subject: string; html: string } {
  const dashUrl = getDashboardUrl(market);
  return {
    subject: `You just got your first lead on TrainedBy`,
    html: emailBase(`
      <h1>First lead. That's how it starts.</h1>
      <p><span class="highlight">${leadName}</span> just reached out through your TrainedBy profile. They're interested in working with you.</p>
      <p>Reply within the hour. The trainers who convert leads are the ones who respond fast — not the ones with the best credentials.</p>
      <a href="${dashUrl}" class="btn">View Your Leads →</a>
      <hr class="divider">
      <p style="font-size:12px">Pro tip: Upgrade to Pro to see all your leads, track conversions, and sell digital products directly from your profile.</p>
    `)
  };
}

function proWelcomeEmail(t: Trainer, market = 'ae'): { subject: string; html: string } {
  const dashUrl = getDashboardUrl(market);
  return {
    subject: `Pro is live. Here's what to do first.`,
    html: emailBase(`
      <h1>You're on Pro. Now use it.</h1>
      <p>Most trainers upgrade and then do nothing different. Don't be that trainer.</p>
      <p>Here's what to set up in the next 30 minutes:</p>
      <ul class="checklist">
        <li>Create your first digital product (a PDF nutrition guide, a 4-week plan, anything)</li>
        <li>Set up your Grand Slam Offer — bundle sessions + a digital product</li>
        <li>Copy your referral link and put it in your Instagram bio</li>
        <li>Refer 4 trainers and your Pro subscription is free forever</li>
      </ul>
      <a href="${dashUrl}" class="btn">Go to Dashboard →</a>
    `)
  };
}

function sevenDayEmail(t: Trainer, market = 'ae'): { subject: string; html: string } {
  const dashUrl = getDashboardUrl(market);
  const pricingUrl = getPricingUrl(market);
  const pct = completionScore(t);
  return {
    subject: `One week in — here's where you stand`,
    html: emailBase(`
      <h1>You've been on TrainedBy for a week.</h1>
      <p>Your profile is <span class="highlight">${pct}% complete</span>. ${pct >= 80 ? 'That\'s solid.' : 'There\'s still room to improve.'}</p>
      ${pct < 80 ? `<p>Trainers with 80%+ complete profiles get significantly more views. A few more minutes on your profile could make a real difference.</p>
      <a href="${dashUrl}" class="btn">Finish Your Profile →</a>` : ''}
      ${t.plan === 'free' ? `
      <hr class="divider">
      <p>You're on the free plan. If you're serious about building a client base in the UAE, Pro gives you digital product sales, the Affiliate Vault, and priority listing. <span class="highlight">149 AED/month.</span></p>
      <a href="${pricingUrl}" class="btn" style="background:#1c1c1c;border:1px solid rgba(255,92,0,0.3)">See What Pro Includes →</a>
      ` : ''}
    `)
  };
}

function monthlyReportEmail(t: Trainer, stats: { views: number; leads: number; }, market = 'ae'): { subject: string; html: string } {
  const dashUrl = getDashboardUrl(market);
  const month = new Date().toLocaleDateString('en-AE', { month: 'long', year: 'numeric' });
  return {
    subject: `Your TrainedBy report for ${month}`,
    html: emailBase(`
      <h1>Your ${month} report.</h1>
      <p>Here's how your TrainedBy profile performed this month:</p>
      <ul class="checklist">
        <li>Profile views: <span class="highlight">${stats.views}</span></li>
        <li>Leads received: <span class="highlight">${stats.leads}</span></li>
      </ul>
      ${stats.leads === 0 ? '<p>No leads this month. The most common reason: incomplete profile or no REPs badge. Both are fixable in under 10 minutes.</p>' : '<p>Keep the momentum going. Reply to every lead within the hour.</p>'}
      <a href="${dashUrl}" class="btn">View Dashboard →</a>
    `)
  };
}

// ── Send email via Resend ──────────────────────────────────────────────────
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  fromEmail = 'TrainedBy <hello@trainedby.ae>'
): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.log(`[lifecycle-email] No Resend key — would send to ${to}: ${subject}`);
    return true; // Graceful no-op when key not set
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: fromEmail, to, subject, html }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`[lifecycle-email] Resend error: ${err}`);
    return false;
  }
  return true;
}

// ── Telegram notification ─────────────────────────────────────────────────────
async function notifyFounder(message: string): Promise<void> {
  if (!TELEGRAM_TOKEN || !FOUNDER_CHAT_ID) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: FOUNDER_CHAT_ID,
      text: message,
      parse_mode: 'Markdown',
    }),
  });
}

// ── Main handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json();
    const { trainer_id, type, force = false, lead_name, stats } = body;

    // Scheduled run: process all trainers for a given lifecycle type
    if (!trainer_id && type) {
      return await runScheduledLifecycle(type);
    }

    // Single trainer
    if (!trainer_id) {
      return new Response(JSON.stringify({ error: 'trainer_id required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: trainer, error } = await sb
      .from('trainers')
      .select('*')
      .eq('id', trainer_id)
      .single();

    if (error || !trainer) {
      return new Response(JSON.stringify({ error: 'Trainer not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ── Locale detection ──
    // Detect from trainer's domain field, or fall back to request origin
    const trainerLocale = getLocale(trainer.domain || req.headers.get('origin'));
    const emailCopy = getEmailCopy(trainerLocale);
    const marketConfig = getMarket(trainerLocale);
    const fromEmail = `${emailCopy.from_name} <${emailCopy.from_email}>`;

    let email: { subject: string; html: string } | null = null;

    const market = body.market || trainer.market || 'ae';

    switch (type) {
      case 'welcome':
        email = welcomeEmail(trainer, market);
        break;
      case 'nudge':
        email = nudgeEmail(trainer, market);
        break;
      case 'first_lead':
        email = firstLeadEmail(trainer, lead_name || 'A potential client', market);
        break;
      case 'pro_welcome':
        email = proWelcomeEmail(trainer, market);
        break;
      case 'seven_day':
        email = sevenDayEmail(trainer, market);
        break;
      case 'monthly_report':
        email = monthlyReportEmail(trainer, stats || { views: 0, leads: 0 }, market);
        break;
      default:
        return new Response(JSON.stringify({ error: 'Unknown email type' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    if (!trainer.email || !trainer.email.includes('@')) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid email address' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const ok = await sendEmail(trainer.email, email.subject, email.html, fromEmail);

    // Log the email send
    await sb.from('email_log').insert({
      trainer_id,
      type,
      subject: email.subject,
      sent_at: new Date().toISOString(),
      success: ok,
    }).catch(() => {}); // Non-fatal if table doesn't exist yet

    return new Response(JSON.stringify({ ok, subject: email.subject }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    await captureException(err, { function: 'lifecycle-email' });
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// ── Scheduled lifecycle runs ──────────────────────────────────────────────────
async function runScheduledLifecycle(type: string): Promise<Response> {
  const now = new Date();
  let sent = 0;
  let skipped = 0;

  if (type === 'nudge') {
    // Send to trainers who signed up 48h ago and have < 50% completion
    const cutoff = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
    const cutoffEnd = new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString();

    const { data: trainers } = await sb
      .from('trainers')
      .select('*')
      .gte('created_at', cutoffEnd)
      .lte('created_at', cutoff);

    for (const t of (trainers || [])) {
      if (completionScore(t) >= 50) { skipped++; continue; }
      if (!t.email?.includes('@')) { skipped++; continue; }
      const email = nudgeEmail(t);
      await sendEmail(t.email, email.subject, email.html);
      sent++;
      await new Promise(r => setTimeout(r, 200));
    }

    await notifyFounder(`📧 *Nudge emails sent*\nSent: ${sent} | Skipped: ${skipped}`);
  }

  if (type === 'seven_day') {
    const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const cutoffEnd = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString();

    const { data: trainers } = await sb
      .from('trainers')
      .select('*')
      .gte('created_at', cutoffEnd)
      .lte('created_at', cutoff);

    for (const t of (trainers || [])) {
      if (!t.email?.includes('@')) { skipped++; continue; }
      const email = sevenDayEmail(t);
      await sendEmail(t.email, email.subject, email.html);
      sent++;
      await new Promise(r => setTimeout(r, 200));
    }

    await notifyFounder(`📧 *7-day emails sent*\nSent: ${sent} | Skipped: ${skipped}`);
  }

  if (type === 'monthly_report') {
    const { data: trainers } = await sb.from('trainers').select('*');

    for (const t of (trainers || [])) {
      if (!t.email?.includes('@')) { skipped++; continue; }
      // Get stats for this trainer
      const { count: leads } = await sb
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('trainer_id', t.id)
        .gte('created_at', new Date(now.getFullYear(), now.getMonth(), 1).toISOString());

      const email = monthlyReportEmail(t, { views: 0, leads: leads || 0 });
      await sendEmail(t.email, email.subject, email.html);
      sent++;
      await new Promise(r => setTimeout(r, 200));
    }

    await notifyFounder(`📧 *Monthly reports sent*\nSent: ${sent} | Skipped: ${skipped}`);
  }

  return new Response(JSON.stringify({ ok: true, type, sent, skipped }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
