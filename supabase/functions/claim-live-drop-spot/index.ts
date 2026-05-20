import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

  // Atomic tier claim via Postgres function (FOR UPDATE row lock prevents overselling)
  const { data: rpc, error: rpcErr } = await sb.rpc("claim_drop_tier", { session_id: body.live_session_id });
  if (rpcErr) {
    return new Response(JSON.stringify({ error: "rpc_failed", detail: rpcErr.message }), { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } });
  }
  if (rpc?.error) {
    const statusMap: Record<string, number> = {
      sold_out: 409,
      session_not_live: 409,
      session_not_found: 404,
      not_a_season_drop: 400,
      no_tiers_configured: 400,
    };
    return new Response(JSON.stringify({ error: rpc.error }), { status: statusMap[rpc.error] ?? 400, headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  const tierPriceCents: number = rpc.tier_price_cents;

  // Fetch session for title
  const { data: session } = await sb.from("live_sessions")
    .select("id, title")
    .eq("id", body.live_session_id)
    .maybeSingle();

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    return new Response(JSON.stringify({ error: "Server misconfiguration" }), { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  const origin = req.headers.get("origin") ?? "https://trainedby.ae";
  const params = new URLSearchParams();
  params.append("mode", "payment");
  params.append("success_url", `${origin}/live/${body.live_session_id}?claim=success`);
  params.append("cancel_url", `${origin}/live/${body.live_session_id}?claim=cancelled`);
  params.append("line_items[0][price_data][currency]", "aed");
  params.append("line_items[0][price_data][product_data][name]", `Season drop spot — ${session?.title ?? "Live"}`);
  params.append("line_items[0][price_data][unit_amount]", String(tierPriceCents));
  params.append("line_items[0][quantity]", "1");
  params.append("metadata[live_session_id]", body.live_session_id);
  params.append("metadata[user_id]", user.id);
  params.append("metadata[tier_price_cents]", String(tierPriceCents));
  if (user.email) params.append("customer_email", user.email);

  const stripeResp = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${stripeKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!stripeResp.ok) {
    const errText = await stripeResp.text();
    return new Response(JSON.stringify({ error: "stripe_failed", detail: errText }), { status: 502, headers: { ...corsHeaders, "content-type": "application/json" } });
  }
  const checkout = await stripeResp.json();

  // Insert claim record
  const { error: claimErr } = await sb.from("live_drop_claims").insert({
    live_session_id: body.live_session_id,
    user_id: user.id,
    stripe_checkout_id: checkout.id,
    tier_price_cents: tierPriceCents,
    status: "pending",
  });

  if (claimErr) {
    console.error("Failed to insert live_drop_claims:", claimErr.message);
  }

  return new Response(JSON.stringify({ ok: true, checkout_url: checkout.url }), {
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
});
