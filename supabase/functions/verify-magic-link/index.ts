import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { MARKET_DOMAINS } from '../_shared/market_url.ts';

// ─── CORS ─────────────────────────────────────────────────────────────────────
// credentials:true requires a specific origin, not wildcard.
// All 8 market domains + local dev + optional staging URL are allowed.
const stagingUrl = Deno.env.get('STAGING_URL');
const ALLOWED_ORIGINS = [
  ...Object.values(MARKET_DOMAINS),
  "http://localhost:3000",
  "http://localhost:4323",
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

    // Fetch packages count — needed for dashboard checklist accuracy
    const { count: pkgCount } = await sb
      .from('session_packages')
      .select('id', { count: 'exact', head: true })
      .eq('trainer_id', trainer.id);

    // Return safe trainer data (strip sensitive fields before sending to client)
    const safeTrainer = {
      // identity
      id: trainer.id,
      slug: trainer.slug,
      name: trainer.name,
      email: trainer.email,
      title: trainer.title,
      plan: trainer.plan,
      // verification
      reps_verified: trainer.reps_verified,
      reps_number: trainer.reps_number,
      verification_status: trainer.verification_status,
      // profile content (needed for checklist + edit form pre-fill)
      avatar_url: trainer.avatar_url,
      bio: trainer.bio,
      city: trainer.city,
      instagram: trainer.instagram,
      specialties: trainer.specialties,
      accepting_clients: trainer.accepting_clients,
      // contact
      phone: trainer.phone,
      whatsapp: trainer.whatsapp,
      // completeness signal
      packages_count: pkgCount ?? 0,
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
