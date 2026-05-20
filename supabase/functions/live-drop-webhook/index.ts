import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

async function hmacSha256Hex(secret: string, msg: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const secret = Deno.env.get("STRIPE_LIVE_DROP_WEBHOOK_SECRET");
  if (!secret) {
    return new Response(JSON.stringify({ error: "secret_not_configured" }), { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  const sigHeader = req.headers.get("stripe-signature") ?? "";
  const raw = await req.text();

  // Stripe signature: "t=timestamp,v1=signature"
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

  let evt: { type: string; data: { object: Record<string, unknown> } };
  try { evt = JSON.parse(raw); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  if (evt.type !== "checkout.session.completed") {
    return new Response(JSON.stringify({ ok: true, ignored: true }), { headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const checkoutId = evt.data.object.id as string;
  const meta = (evt.data.object.metadata ?? {}) as Record<string, string>;
  const liveSessionId = meta.live_session_id;
  const userId = meta.user_id;

  // Mark claim completed
  await sb.from("live_drop_claims")
    .update({ status: "completed" })
    .eq("stripe_checkout_id", checkoutId);

  if (liveSessionId && userId) {
    // Fetch session to get club_id and updated drop_tiers
    const { data: session } = await sb.from("live_sessions")
      .select("id, club_id, drop_tiers")
      .eq("id", liveSessionId)
      .maybeSingle();

    if (session?.club_id) {
      // Create club membership for the buyer
      await sb.from("club_members").upsert({
        club_id: session.club_id,
        user_id: userId,
        status: "active",
      }, { onConflict: "club_id,user_id" });
    }

    if (session) {
      // Broadcast updated tier state to all viewers
      await sb.channel("drops").send({
        type: "broadcast",
        event: "tier_update",
        payload: { live_session_id: liveSessionId, drop_tiers: session.drop_tiers },
      });
    }
  }

  return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "content-type": "application/json" } });
});
