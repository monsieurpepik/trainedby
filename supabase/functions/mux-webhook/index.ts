import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const body = await req.text();

  // Verify Mux webhook signature
  const webhookSecret = Deno.env.get("MUX_WEBHOOK_SECRET");
  if (webhookSecret) {
    const muxSignature = req.headers.get("mux-signature") ?? "";
    // Mux signature format: "t=<timestamp>,v1=<signature>"
    const parts = Object.fromEntries(muxSignature.split(",").map(p => p.split("=")));
    const timestamp = parts["t"] ?? "";
    const expectedSig = parts["v1"] ?? "";
    const payload = `${timestamp}.${body}`;
    const hmac = createHmac("sha256", webhookSecret);
    hmac.update(payload);
    const computedSig = hmac.digest("hex");
    if (computedSig !== expectedSig) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401, headers: { ...corsHeaders, "content-type": "application/json" }
      });
    }
  }

  let event: { type: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(body);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  if (event.type === "video.asset.ready") {
    const assetId = event.data.id as string;
    const uploadId = event.data.upload_id as string | undefined;
    const playbackIds = event.data.playback_ids as Array<{ id: string; policy: string }> | undefined;
    const playbackId = playbackIds?.[0]?.id ?? null;
    const duration = event.data.duration as number | undefined;

    // Thumbnail: Mux generates a thumbnail at the image URL pattern
    const thumbnailUrl = playbackId
      ? `https://image.mux.com/${playbackId}/thumbnail.jpg`
      : null;

    // Find video by upload_id
    if (uploadId) {
      await sb
        .from("videos")
        .update({
          mux_asset_id: assetId,
          mux_playback_id: playbackId,
          duration_seconds: duration ? Math.round(duration) : null,
          thumbnail_url: thumbnailUrl,
          status: "ready",
        })
        .eq("mux_upload_id", uploadId);
    }
  } else if (event.type === "video.asset.errored") {
    const uploadId = event.data.upload_id as string | undefined;
    if (uploadId) {
      await sb
        .from("videos")
        .update({ status: "errored" })
        .eq("mux_upload_id", uploadId);
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, "content-type": "application/json" }
  });
});
