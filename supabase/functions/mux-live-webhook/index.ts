import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, mux-signature",
};

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const secret = Deno.env.get("MUX_WEBHOOK_SECRET");
  if (!secret) {
    return new Response(JSON.stringify({ error: "secret_not_configured" }), { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  const sigHeader = req.headers.get("mux-signature") ?? "";
  const raw = await req.text();

  // Mux signature: "t=timestamp,v1=signature"
  const parts = Object.fromEntries(
    sigHeader.split(",").map((p) => {
      const idx = p.indexOf("=");
      return [p.slice(0, idx), p.slice(idx + 1)];
    })
  );
  const t = parts["t"] ?? "";
  const v1 = parts["v1"] ?? "";
  if (!t || !v1) {
    return new Response("bad_signature", { status: 401, headers: corsHeaders });
  }

  const expected = await hmacSha256Hex(secret, `${t}.${raw}`);
  if (!timingSafeEqual(expected, v1)) {
    return new Response("bad_signature", { status: 401, headers: corsHeaders });
  }

  let evt: { type: string; data: Record<string, unknown> };
  try { evt = JSON.parse(raw); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  if (evt.type === "video.live_stream.active") {
    const streamId = evt.data.id as string;
    const { data: session, error: updateErr } = await sb.from("live_sessions")
      .update({ status: "live" })
      .eq("mux_stream_id", streamId)
      .select("id, trainer_id, title")
      .maybeSingle();

    if (updateErr) {
      console.error("DB update failed:", updateErr.message);
    }

    if (session) {
      // Send email notifications to followers + subscribers
      const { data: trainer } = await sb.from("trainers")
        .select("name, slug")
        .eq("id", session.trainer_id)
        .maybeSingle();

      // Get follower emails via club_followers (followers of the trainer's clubs)
      const { data: trainerClubs } = await sb.from("clubs")
        .select("id")
        .eq("trainer_id", session.trainer_id);

      const emails = new Set<string>();

      if (trainerClubs && trainerClubs.length > 0) {
        const clubIds = trainerClubs.map((c: { id: string }) => c.id);
        const { data: followers } = await sb.from("club_followers")
          .select("user_id, users!inner(email)")
          .in("club_id", clubIds);
        // deno-lint-ignore no-explicit-any
        (followers ?? []).forEach((f: any) => { if (f.users?.email) emails.add(f.users.email); });
      }

      // Get subscriber emails
      const { data: subs } = await sb.from("coach_subscriptions")
        .select("subscriber_id, users!inner(email)")
        .eq("trainer_id", session.trainer_id)
        .in("status", ["active", "trialing"]);
      // deno-lint-ignore no-explicit-any
      (subs ?? []).forEach((s: any) => { if (s.users?.email) emails.add(s.users.email); });

      const liveUrl = `https://trainedby.ae/live/${session.id}`;
      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (resendKey) {
        for (const email of emails) {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "TrainedBy <notifications@trainedby.ae>",
              to: [email],
              subject: `${trainer?.name ?? "Your coach"} is LIVE now`,
              html: `<p><b>${trainer?.name ?? "Your coach"}</b> just went live: <b>${session.title}</b></p><p><a href="${liveUrl}">Watch now →</a></p>`,
            }),
          });
        }
      }
    }
  } else if (evt.type === "video.live_stream.idle") {
    const streamId = evt.data.id as string;
    await sb.from("live_sessions")
      .update({ status: "scheduled" })
      .eq("mux_stream_id", streamId);
  } else if (evt.type === "video.asset.ready") {
    const liveStreamId = evt.data.live_stream_id as string | undefined;
    if (liveStreamId) {
      await sb.from("live_sessions")
        .update({ mux_asset_id: evt.data.id as string })
        .eq("mux_stream_id", liveStreamId);
    }
  }

  return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "content-type": "application/json" } });
});
