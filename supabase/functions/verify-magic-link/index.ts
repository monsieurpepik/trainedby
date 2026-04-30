import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getMarketBaseUrl } from '../_shared/market_url.ts';

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Note: credentials:true requires a specific origin, not wildcard.
// The frontend must send requests with credentials:include.
const stagingUrl = Deno.env.get('STAGING_URL');
const ALLOWED_ORIGINS = [
  getMarketBaseUrl('ae'),
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  ...(stagingUrl ? [stagingUrl] : []),
];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Credentials": "true",
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { token } = await req.json();

    if (!token || typeof token !== "string" || token.length > 200) {
      return new Response(JSON.stringify({ error: "Token required" }), {
        status: 400, headers: corsHeaders,
      });
    }

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ── Fetch and validate the magic link ─────────────────────────────────────
    const { data: link, error } = await sb
      .from("magic_links")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .single();

    if (error || !link) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401, headers: corsHeaders,
      });
    }

    if (new Date(link.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "Token expired" }), {
        status: 401, headers: corsHeaders,
      });
    }

    // ── Mark one-time token as used ───────────────────────────────────────────
    await sb.from("magic_links").update({ used: true }).eq("id", link.id);

    // ── Fetch trainer ─────────────────────────────────────────────────────────
    let trainer = null;
    if (link.trainer_id) {
      const { data } = await sb.from("trainers").select("*").eq("id", link.trainer_id).single();
      trainer = data;
    } else {
      const { data } = await sb.from("trainers").select("*").eq("email", link.email.toLowerCase()).single();
      trainer = data;
    }

    if (!trainer) {
      return new Response(JSON.stringify({ error: "No trainer found for this email" }), {
        status: 404, headers: corsHeaders,
      });
    }

    // ── Update last seen ──────────────────────────────────────────────────────
    await sb.from("trainers")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", trainer.id);

    // ── Issue a long-lived session token ──────────────────────────────────────
    // The session token is a separate, long-lived credential stored as an HttpOnly cookie.
    // It replaces the magic link token in localStorage, eliminating the XSS attack surface.
    const sessionToken = crypto.randomUUID() + "-" + crypto.randomUUID();
    const sessionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await sb.from("magic_links").insert({
      email: trainer.email,
      token: sessionToken,
      trainer_id: trainer.id,
      expires_at: sessionExpiry.toISOString(),
      used: false,
    });

    // ── Build response with HttpOnly cookie ───────────────────────────────────
    // HttpOnly: JavaScript cannot read this cookie  -  eliminates XSS token theft.
    // Secure: Only sent over HTTPS.
    // SameSite=Strict: Not sent on cross-site requests  -  prevents CSRF.
    const cookieValue = [
      `tb_session=${sessionToken}`,
      `Expires=${sessionExpiry.toUTCString()}`,
      "Path=/",
      "HttpOnly",
      "Secure",
      "SameSite=Strict",
    ].join("; ");

    // Return safe trainer data (strip sensitive fields before sending to client)
    const safeTrainer = {
      id: trainer.id,
      slug: trainer.slug,
      name: trainer.name,
      email: trainer.email,
      title: trainer.title,
      plan: trainer.plan,
      reps_verified: trainer.reps_verified,
      verification_status: trainer.verification_status,
      avatar_url: trainer.avatar_url,
    };

    return new Response(JSON.stringify({ ok: true, trainer: safeTrainer }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Set-Cookie": cookieValue,
      },
    });

  } catch (e) {
    console.error("verify-magic-link error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: getCorsHeaders(req),
    });
  }
});
