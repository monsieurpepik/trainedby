import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const sbAnon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data: { user }, error: authErr } = await sbAnon.auth.getUser(token);
  if (authErr || !user?.email) {
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

  const { data: trainer, error: trErr } = await sb.from("trainers").select("id").eq("email", user.email).maybeSingle();
  if (trErr || !trainer) {
    return new Response(JSON.stringify({ error: "trainer_not_found" }), { status: 403, headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  const { data: session, error: sessErr } = await sb.from("live_sessions")
    .select("id, trainer_id, mux_stream_id")
    .eq("id", body.live_session_id)
    .maybeSingle();
  if (sessErr || !session) {
    return new Response(JSON.stringify({ error: "session_not_found" }), { status: 404, headers: { ...corsHeaders, "content-type": "application/json" } });
  }
  if (session.trainer_id !== trainer.id) {
    return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  if (session.mux_stream_id) {
    const muxTokenId = Deno.env.get("MUX_TOKEN_ID");
    const muxTokenSecret = Deno.env.get("MUX_TOKEN_SECRET");
    if (muxTokenId && muxTokenSecret) {
      const muxAuth = btoa(`${muxTokenId}:${muxTokenSecret}`);
      await fetch(`https://api.mux.com/video/v1/live-streams/${session.mux_stream_id}/disable`, {
        method: "PUT",
        headers: { "Authorization": `Basic ${muxAuth}` },
      });
    }
  }

  const { error: updateErr } = await sb.from("live_sessions")
    .update({ status: "ended", ended_at: new Date().toISOString() })
    .eq("id", session.id);

  if (updateErr) {
    return new Response(JSON.stringify({ error: "db_update_failed", detail: updateErr.message }), { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "content-type": "application/json" } });
});
