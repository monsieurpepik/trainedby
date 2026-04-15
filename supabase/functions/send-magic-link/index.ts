import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Rate Limiting ────────────────────────────────────────────────────────────
// Limits magic link requests to 3 per email per 15 minutes.
// Prevents email bombing and auth token enumeration attacks.
async function checkRateLimit(
  sb: ReturnType<typeof createClient>,
  key: string,
  maxCount: number,
  windowMinutes: number
): Promise<boolean> {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

  await sb.from("rate_limits")
    .delete()
    .eq("key", key)
    .lt("window_start", windowStart);

  const { data: existing } = await sb.from("rate_limits")
    .select("id, count")
    .eq("key", key)
    .gte("window_start", windowStart)
    .single();

  if (!existing) {
    await sb.from("rate_limits").insert({ key, count: 1 });
    return true;
  }

  if (existing.count >= maxCount) return false;

  await sb.from("rate_limits")
    .update({ count: existing.count + 1 })
    .eq("id", existing.id);

  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const { email, redirect } = body;

    // ── Validate email ────────────────────────────────────────────────────────
    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ error: "Email required" }), {
        status: 400, headers: corsHeaders,
      });
    }

    const cleanEmail = email.toLowerCase().trim().slice(0, 254);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400, headers: corsHeaders,
      });
    }

    // Validate redirect URL  -  only allow known TrainedBy domains
    const allowedRedirects = [
      "https://trainedby.ae/edit",
      "https://trainedby-ae.netlify.app/edit",
      "https://trainedby.ae/dashboard",
    ];
    const safeRedirect = allowedRedirects.includes(redirect)
      ? redirect
      : "https://trainedby.ae/edit";

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ── Rate limit: 3 magic links per email per 15 minutes ────────────────────
    const allowed = await checkRateLimit(sb, `magic-link:${cleanEmail}`, 3, 15);
    if (!allowed) {
      // Return 200 to avoid leaking whether the email exists
      // (don't tell an attacker they've hit the limit for a specific email)
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Find trainer by email ─────────────────────────────────────────────────
    const { data: trainer } = await sb.from("trainers")
      .select("id,slug,name")
      .eq("email", cleanEmail)
      .single();

    // ── Generate token ────────────────────────────────────────────────────────
    const token = crypto.randomUUID() + "-" + Date.now().toString(36);
    await sb.from("magic_links").insert({
      email: cleanEmail,
      token,
      trainer_id: trainer?.id ?? null,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    });

    const magicUrl = `${safeRedirect}?token=${token}`;

    // ── Send email via Resend ─────────────────────────────────────────────────
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      // Dev environment  -  log the magic URL instead of failing
      console.log("DEV: Magic link URL:", magicUrl);
      return new Response(JSON.stringify({ ok: true, dev_url: magicUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "TrainedBy <hello@trainedby.ae>",
        to: cleanEmail,
        subject: "Your TrainedBy sign-in link",
        html: `
          <div style="background:#0a0a0a;padding:40px 24px;font-family:Inter,sans-serif;max-width:480px;margin:0 auto;">
            <div style="margin-bottom:32px;">
              <span style="background:#FF5C00;color:#fff;font-family:Manrope,sans-serif;font-weight:800;font-size:16px;padding:6px 12px;border-radius:8px;">TB</span>
              <span style="color:#fff;font-family:Manrope,sans-serif;font-weight:800;font-size:16px;margin-left:8px;">TrainedBy</span>
            </div>
            <h1 style="color:#fff;font-family:Manrope,sans-serif;font-size:24px;font-weight:800;margin-bottom:8px;">Sign in to TrainedBy</h1>
            <p style="color:rgba(255,255,255,0.55);font-size:15px;margin-bottom:28px;line-height:1.6;">Click the button below to sign in. This link expires in 15 minutes.</p>
            <a href="${magicUrl}" style="display:inline-block;background:#FF5C00;color:#fff;font-family:Manrope,sans-serif;font-weight:700;font-size:15px;padding:16px 32px;border-radius:12px;text-decoration:none;">Sign In to TrainedBy →</a>
            <p style="color:rgba(255,255,255,0.25);font-size:12px;margin-top:28px;">If you didn't request this, you can safely ignore this email. Link expires in 15 minutes.</p>
          </div>`,
      }),
    });

    if (!emailRes.ok) {
      const err = await emailRes.text();
      console.error("Resend error:", err);
      return new Response(JSON.stringify({ error: "Email send failed" }), {
        status: 500, headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("send-magic-link error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: corsHeaders,
    });
  }
});
