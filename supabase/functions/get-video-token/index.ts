import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SignJWT, importPKCS8 } from "https://deno.land/x/jose@v4.14.4/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Auth required
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const sbAnon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data: { user }, error: authErr } = await sbAnon.auth.getUser(token);
  if (authErr || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  let body: { video_id?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }
  const { video_id } = body;

  if (!video_id) {
    return new Response(JSON.stringify({ error: "video_id required" }), {
      status: 400, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Fetch video
  const { data: video, error: videoErr } = await sb
    .from("videos")
    .select("id, trainer_id, mux_playback_id, is_free, status")
    .eq("id", video_id)
    .eq("status", "ready")
    .maybeSingle();

  if (videoErr) {
    return new Response(JSON.stringify({ error: "Database error" }), {
      status: 500, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  if (!video || !video.mux_playback_id) {
    return new Response(JSON.stringify({ error: "Video not found" }), {
      status: 404, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  // Free video: no token needed — caller can use playback_id directly
  if (video.is_free) {
    return new Response(JSON.stringify({ ok: true, token: null, playback_id: video.mux_playback_id }), {
      headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  // Verify active subscription for this trainer
  const { data: sub, error: subErr } = await sb
    .from("coach_subscriptions")
    .select("id")
    .eq("trainer_id", video.trainer_id)
    .eq("subscriber_id", user.id)
    .in("status", ["active", "trialing"])
    .maybeSingle();

  if (subErr) {
    return new Response(JSON.stringify({ error: "Database error" }), {
      status: 500, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  if (!sub) {
    return new Response(JSON.stringify({ error: "Subscription required" }), {
      status: 403, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  // Generate signed Mux JWT
  const signingKeyId = Deno.env.get("MUX_SIGNING_KEY_ID");
  const signingKeyB64 = Deno.env.get("MUX_SIGNING_PRIVATE_KEY");

  if (!signingKeyId || !signingKeyB64) {
    return new Response(JSON.stringify({ error: "Server misconfiguration" }), {
      status: 500, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  // Mux provides the private key as base64-encoded PKCS8 PEM
  const pemContent = atob(signingKeyB64);
  const privateKey = await importPKCS8(pemContent, "RS256");

  const expTime = Math.floor(Date.now() / 1000) + 86400; // 24h

  const signedToken = await new SignJWT({})
    .setProtectedHeader({ alg: "RS256", kid: signingKeyId })
    .setAudience("v")
    .setSubject(video.mux_playback_id)
    .setExpirationTime(expTime)
    .sign(privateKey);

  return new Response(JSON.stringify({ ok: true, token: signedToken, playback_id: video.mux_playback_id }), {
    headers: { ...corsHeaders, "content-type": "application/json" }
  });
});
