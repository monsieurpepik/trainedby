import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SignJWT, importPKCS8 } from "https://deno.land/x/jose@v4.14.4/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function signMuxToken(playbackId: string): Promise<string> {
  const keyId = Deno.env.get("MUX_SIGNING_KEY_ID");
  const privKeyB64 = Deno.env.get("MUX_SIGNING_PRIVATE_KEY");
  if (!keyId || !privKeyB64) throw new Error("MUX signing keys not configured");
  const pem = atob(privKeyB64);
  const key = await importPKCS8(pem, "RS256");
  return await new SignJWT({})
    .setProtectedHeader({ alg: "RS256", kid: keyId })
    .setSubject(playbackId)
    .setAudience("v")
    .setExpirationTime("4h")
    .sign(key);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("authorization") ?? "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "");
  const sbAnon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data: { user }, error: authErr } = await sbAnon.auth.getUser(jwt);
  if (authErr || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  let body: { live_session_id?: string };
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { ...corsHeaders, "content-type": "application/json" } });
  }
  if (!body.live_session_id) {
    return new Response(JSON.stringify({ error: "live_session_id required" }), { status: 400, headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data: session, error: sessErr } = await sb.from("live_sessions")
    .select("id, trainer_id, club_id, status, mux_playback_id")
    .eq("id", body.live_session_id)
    .maybeSingle();

  if (sessErr || !session) {
    return new Response(JSON.stringify({ error: "session_not_found" }), { status: 404, headers: { ...corsHeaders, "content-type": "application/json" } });
  }
  if (session.status !== "live") {
    return new Response(JSON.stringify({ error: "session_not_live" }), { status: 409, headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  // Access check: subscriber (coach_subscriptions uses subscriber_id NOT user_id) or club member
  const { data: sub } = await sb.from("coach_subscriptions")
    .select("id")
    .eq("trainer_id", session.trainer_id)
    .eq("subscriber_id", user.id)        // NOTE: subscriber_id, not user_id
    .in("status", ["active", "trialing"])
    .maybeSingle();

  let clubMember = null;
  if (!sub && session.club_id) {
    const { data: cm } = await sb.from("club_members")
      .select("id")
      .eq("club_id", session.club_id)
      .eq("user_id", user.id)           // club_members uses user_id
      .eq("status", "active")
      .maybeSingle();
    clubMember = cm;
  }

  if (!sub && !clubMember) {
    return new Response(JSON.stringify({ error: "paywall", trainer_id: session.trainer_id }), { status: 403, headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  // Upsert attendee record
  await sb.from("live_attendees").upsert(
    { live_session_id: session.id, user_id: user.id },
    { onConflict: "live_session_id,user_id" }
  );

  // Optional: create today's check-in for active club members
  if (clubMember && session.club_id) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { data: existing } = await sb.from("checkins")
      .select("id")
      .eq("user_id", user.id)
      .eq("club_id", session.club_id)
      .gte("created_at", todayStart.toISOString())
      .maybeSingle();
    if (!existing) {
      await sb.from("checkins").insert({
        user_id: user.id,
        club_id: session.club_id,
        source: "live_session",
      });
    }
  }

  if (!session.mux_playback_id) {
    return new Response(JSON.stringify({ error: "no_playback_id" }), { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  let token: string;
  try {
    token = await signMuxToken(session.mux_playback_id);
  } catch (err) {
    return new Response(JSON.stringify({ error: "token_generation_failed", detail: String(err) }), { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  return new Response(JSON.stringify({ ok: true, playback_id: session.mux_playback_id, token }), {
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
});
