import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Auth: verify JWT, must be a trainer
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const sbAnon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data: { user }, error: authErr } = await sbAnon.auth.getUser(token);
  if (authErr || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  const { title, description, is_free } = await req.json();
  if (!title) {
    return new Response(JSON.stringify({ error: "title required" }), {
      status: 400, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Verify caller is a trainer — look up by email (trainers table has no auth_id column)
  const { data: trainer } = await sb
    .from("trainers")
    .select("id")
    .eq("email", user.email)
    .maybeSingle();

  if (!trainer) {
    return new Response(JSON.stringify({ error: "Trainer profile not found" }), {
      status: 403, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  // Create Mux direct upload URL
  const muxTokenId = Deno.env.get("MUX_TOKEN_ID")!;
  const muxTokenSecret = Deno.env.get("MUX_TOKEN_SECRET")!;
  const muxAuth = btoa(`${muxTokenId}:${muxTokenSecret}`);

  const muxRes = await fetch("https://api.mux.com/video/v1/uploads", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${muxAuth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      new_asset_settings: { playback_policy: ["public"] },
      cors_origin: "*",
    }),
  });

  if (!muxRes.ok) {
    const err = await muxRes.text();
    return new Response(JSON.stringify({ error: `Mux error: ${err}` }), {
      status: 500, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  const muxData = await muxRes.json();
  const uploadId = muxData.data.id as string;
  const uploadUrl = muxData.data.url as string;

  // Insert video record in processing state
  const { data: video, error: insertErr } = await sb
    .from("videos")
    .insert({
      trainer_id: trainer.id,
      title,
      description: description ?? null,
      is_free: is_free ?? false,
      mux_upload_id: uploadId,
      status: "processing",
    })
    .select("id")
    .single();

  if (insertErr || !video) {
    return new Response(JSON.stringify({ error: insertErr?.message ?? "Insert failed" }), {
      status: 500, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ ok: true, upload_url: uploadUrl, video_id: video.id }), {
    headers: { ...corsHeaders, "content-type": "application/json" }
  });
});
