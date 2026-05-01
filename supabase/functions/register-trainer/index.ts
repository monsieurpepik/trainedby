import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getEditUrl, getProfileUrl, getMarketSupportEmail, getMarketBrand } from '../_shared/market_url.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Input Sanitization ───────────────────────────────────────────────────────
// Strip HTML tags and control characters from user-supplied strings.
// Prevents stored XSS when trainer names/bios are rendered in the dashboard.
function sanitize(value: string | undefined | null): string {
  if (!value) return "";
  return value
    .replace(/<[^>]*>/g, "")          // strip HTML tags
    .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, "") // strip control characters
    .trim()
    .slice(0, 500);                    // hard cap at 500 chars
}

function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim().slice(0, 254);
}

// ─── Slugify ──────────────────────────────────────────────────────────────────
function slugify(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 40); // slugs capped at 40 chars
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────
// Limits registration attempts to 5 per email per 15 minutes.
// Uses the rate_limits table added in 002_features.sql.
async function checkRateLimit(
  sb: ReturnType<typeof createClient>,
  key: string,
  maxCount: number,
  windowMinutes: number
): Promise<boolean> {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

  // Clean up expired windows for this key
  await sb.from("rate_limits")
    .delete()
    .eq("key", key)
    .lt("window_start", windowStart);

  // Check current count
  const { data: existing } = await sb.from("rate_limits")
    .select("id, count")
    .eq("key", key)
    .gte("window_start", windowStart)
    .single();

  if (!existing) {
    // First request in this window  -  create entry
    await sb.from("rate_limits").insert({ key, count: 1 });
    return true; // allowed
  }

  if (existing.count >= maxCount) {
    return false; // rate limited
  }

  // Increment counter
  await sb.from("rate_limits")
    .update({ count: existing.count + 1 })
    .eq("id", existing.id);

  return true; // allowed
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const { name, email, phone, title, specialties, reps_number, referred_by, market = 'ae' } = body;

    // ── Validate required fields ──────────────────────────────────────────────
    if (!name || !email) {
      return new Response(JSON.stringify({ error: "Name and email are required" }), {
        status: 400, headers: corsHeaders,
      });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400, headers: corsHeaders,
      });
    }

    // ── Sanitize all inputs ───────────────────────────────────────────────────
    const cleanName = sanitize(name);
    const cleanEmail = sanitizeEmail(email);
    const cleanPhone = sanitize(phone);
    const cleanTitle = sanitize(title);
    const cleanReps = sanitize(reps_number);
    const cleanReferredBy = sanitize(referred_by);
    const cleanSpecialties = Array.isArray(specialties)
      ? specialties.slice(0, 10).map((s: string) => sanitize(s))
      : [];

    if (!cleanName) {
      return new Response(JSON.stringify({ error: "Invalid name" }), {
        status: 400, headers: corsHeaders,
      });
    }

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ── Rate limit: 5 registration attempts per email per 15 minutes ──────────
    const allowed = await checkRateLimit(sb, `register:${cleanEmail}`, 5, 15);
    if (!allowed) {
      return new Response(JSON.stringify({ error: "Too many attempts. Please try again in 15 minutes." }), {
        status: 429, headers: corsHeaders,
      });
    }

    // ── Check if email already exists ─────────────────────────────────────────
    const { data: existing } = await sb.from("trainers")
      .select("id,slug")
      .eq("email", cleanEmail)
      .single();

    if (existing) {
      // Send magic link to existing account
      const token = crypto.randomUUID() + "-" + Date.now().toString(36);
      await sb.from("magic_links").insert({
        email: cleanEmail,
        token,
        trainer_id: existing.id,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      });
      await sendWelcomeEmail(cleanEmail, existing.slug, token, true, market);
      return new Response(JSON.stringify({ ok: true, existing: true, slug: existing.slug }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Generate unique slug (bounded  -  max 10 attempts) ──────────────────────
    // Using a bounded loop prevents infinite hang if DB is slow or under load.
    // On collision after 10 attempts, we append a UUID fragment to guarantee uniqueness.
    let baseSlug = slugify(cleanName) || "trainer";
    let slug = baseSlug;

    for (let attempt = 0; attempt <= 10; attempt++) {
      if (attempt === 10) {
        // Guaranteed unique fallback  -  append 6 random hex chars
        slug = `${baseSlug}-${crypto.randomUUID().slice(0, 6)}`;
        break;
      }
      const { data: taken } = await sb.from("trainers")
        .select("id")
        .eq("slug", slug)
        .single();
      if (!taken) break;
      slug = attempt === 0 ? `${baseSlug}2` : `${baseSlug}${attempt + 2}`;
    }

    // ── Create trainer ─────────────────────────────────────────────────────────
    const { data: trainer, error } = await sb.from("trainers").insert({
      slug,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone || null,
      title: cleanTitle || null,
      specialties: cleanSpecialties,
      reps_number: cleanReps || null,
      verification_status: cleanReps ? "pending" : "unsubmitted",
      referred_by: cleanReferredBy || null,
    }).select().single();

    if (error) throw error;

    // ── Handle referral ────────────────────────────────────────────────────────
    if (cleanReferredBy) {
      await sb.from("referrals").insert({
        referrer_slug: cleanReferredBy,
        referred_email: cleanEmail,
        referred_id: trainer.id,
      });
    }

    // ── Generate magic link token ──────────────────────────────────────────────
    const token = crypto.randomUUID() + "-" + Date.now().toString(36);
    await sb.from("magic_links").insert({
      email: cleanEmail,
      token,
      trainer_id: trainer.id,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    });

    // ── Send welcome email ─────────────────────────────────────────────────────
    await sendWelcomeEmail(cleanEmail, slug, token, false, market);

    // ── Notify CEO agent (Telegram alert) ─────────────────────────────────────
    const SELF_BASE = `https://mezhtdbfyvkshpuplqqw.supabase.co/functions/v1`;
    fetch(`${SELF_BASE}/ceo-agent/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` },
      body: JSON.stringify({
        type: 'new_signup',
        data: {
          name: cleanName,
          email: cleanEmail,
          city: null,
          reps_verified: false,
          completion_pct: cleanSpecialties.length > 0 ? 10 : 0,
        }
      })
    }).catch(() => {}); // Non-fatal

    // ── Queue lifecycle welcome email (via lifecycle-email function) ────────────
    fetch(`${SELF_BASE}/lifecycle-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` },
      body: JSON.stringify({ trainer_id: trainer.id, type: 'welcome' })
    }).catch(() => {}); // Non-fatal

    return new Response(JSON.stringify({ ok: true, slug, trainer_id: trainer.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("register-trainer error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: corsHeaders,
    });
  }
});

async function sendWelcomeEmail(
  email: string,
  slug: string,
  token: string,
  isExisting: boolean,
  market: string
) {
  const editUrl = `${getEditUrl(market)}?token=${token}`;
  const profileUrl = getProfileUrl(market, slug);

  const subject = isExisting
    ? "Welcome back to TrainedBy"
    : "Your TrainedBy profile is ready 🔥";
  const headline = isExisting ? "Welcome back!" : "Your profile is live!";
  const bodyText = isExisting
    ? `Sign in to edit your profile and check your leads.`
    : `Your TrainedBy profile is live at <a href="${profileUrl}" style="color:#FF5C00;">${profileUrl}</a>. Complete your profile to get your REPs badge and start receiving leads.`;

  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) return; // graceful no-op in dev environments

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${getMarketBrand(market)} <${getMarketSupportEmail(market)}>`,
      to: email,
      subject,
      html: `
        <div style="background:#0a0a0a;padding:40px 24px;font-family:Inter,sans-serif;max-width:480px;margin:0 auto;">
          <div style="margin-bottom:32px;">
            <span style="background:#FF5C00;color:#fff;font-family:Manrope,sans-serif;font-weight:800;font-size:16px;padding:6px 12px;border-radius:8px;">TB</span>
            <span style="color:#fff;font-family:Manrope,sans-serif;font-weight:800;font-size:16px;margin-left:8px;">${getMarketBrand(market)}</span>
          </div>
          <h1 style="color:#fff;font-family:Manrope,sans-serif;font-size:24px;font-weight:800;margin-bottom:8px;">${headline}</h1>
          <p style="color:rgba(255,255,255,0.55);font-size:15px;margin-bottom:28px;line-height:1.6;">${bodyText}</p>
          <a href="${editUrl}" style="display:inline-block;background:#FF5C00;color:#fff;font-family:Manrope,sans-serif;font-weight:700;font-size:15px;padding:16px 32px;border-radius:12px;text-decoration:none;">
            ${isExisting ? "Sign In →" : "Complete My Profile →"}
          </a>
          <p style="color:rgba(255,255,255,0.25);font-size:12px;margin-top:28px;">This sign-in link expires in 15 minutes. Your profile URL: ${profileUrl}</p>
        </div>`,
    }),
  });
}
