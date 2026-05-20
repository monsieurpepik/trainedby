import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Tier { price_cents: number; total_spots: number; claimed: number }

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const sbAnon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data: { user }, error: authErr } = await sbAnon.auth.getUser(token);
  if (authErr || !user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  let body: { title?: string; club_id?: string; is_season_drop?: boolean; drop_tiers?: Tier[]; starts_at?: string };
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { ...corsHeaders, "content-type": "application/json" } });
  }
  if (!body.title || typeof body.title !== "string") {
    return new Response(JSON.stringify({ error: "title required" }), { status: 400, headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  const isDrop = !!body.is_season_drop;
  let tiers: Tier[] | null = null;
  if (isDrop) {
    if (!Array.isArray(body.drop_tiers) || body.drop_tiers.length < 1 || body.drop_tiers.length > 4) {
      return new Response(JSON.stringify({ error: "drop_tiers must be 1-4 entries" }), { status: 400, headers: { ...corsHeaders, "content-type": "application/json" } });
    }
    tiers = body.drop_tiers.map((t) => ({
      price_cents: Math.max(0, Math.floor(Number(t.price_cents))),
      total_spots: Math.max(0, Math.floor(Number(t.total_spots))),
      claimed: 0,
    }));
    if (tiers.some((t) => t.price_cents <= 0)) {
      return new Response(JSON.stringify({ error: "tier price_cents must be > 0" }), { status: 400, headers: { ...corsHeaders, "content-type": "application/json" } });
    }
    if (tiers.some((t) => t.total_spots <= 0)) {
      return new Response(JSON.stringify({ error: "tier total_spots must be > 0" }), { status: 400, headers: { ...corsHeaders, "content-type": "application/json" } });
    }
  }

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data: trainer, error: trErr } = await sb.from("trainers").select("id").eq("email", user.email).maybeSingle();
  if (trErr || !trainer) {
    return new Response(JSON.stringify({ error: "trainer_not_found" }), { status: 403, headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  if (body.club_id) {
    const { data: club } = await sb.from("clubs").select("id, trainer_id").eq("id", body.club_id).maybeSingle();
    if (!club || club.trainer_id !== trainer.id) {
      return new Response(JSON.stringify({ error: "club_not_owned" }), { status: 403, headers: { ...corsHeaders, "content-type": "application/json" } });
    }
  }

  const muxTokenId = Deno.env.get("MUX_TOKEN_ID");
  const muxTokenSecret = Deno.env.get("MUX_TOKEN_SECRET");
  if (!muxTokenId || !muxTokenSecret) {
    return new Response(JSON.stringify({ error: "Server misconfiguration" }), { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  const muxAuth = btoa(`${muxTokenId}:${muxTokenSecret}`);
  const muxResp = await fetch("https://api.mux.com/video/v1/live-streams", {
    method: "POST",
    headers: { "Authorization": `Basic ${muxAuth}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      playback_policy: ["signed"],
      reconnect_window: 60,
      new_asset_settings: { playback_policy: ["signed"] },
    }),
  });
  if (!muxResp.ok) {
    const text = await muxResp.text();
    return new Response(JSON.stringify({ error: "mux_create_failed", detail: text }), { status: 502, headers: { ...corsHeaders, "content-type": "application/json" } });
  }
  const muxJson = await muxResp.json();
  const muxStream = muxJson.data;
  const playbackId = muxStream.playback_ids?.[0]?.id;
  if (!playbackId) {
    return new Response(JSON.stringify({ error: "mux_no_playback_id" }), { status: 502, headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  const { data: session, error: insErr } = await sb.from("live_sessions").insert({
    trainer_id: trainer.id,
    club_id: body.club_id ?? null,
    title: body.title,
    mux_stream_id: muxStream.id,
    mux_stream_key: muxStream.stream_key,
    mux_playback_id: playbackId,
    status: "scheduled",
    is_season_drop: isDrop,
    drop_tiers: tiers,
    starts_at: body.starts_at ?? null,
  }).select("id").single();

  if (insErr || !session) {
    return new Response(JSON.stringify({ error: "db_insert_failed", detail: insErr?.message }), { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  return new Response(JSON.stringify({
    ok: true,
    session_id: session.id,
    rtmp_url: "rtmps://global-live.mux.com:443/app",
    stream_key: muxStream.stream_key,
    playback_id: playbackId,
  }), { headers: { ...corsHeaders, "content-type": "application/json" } });
});
