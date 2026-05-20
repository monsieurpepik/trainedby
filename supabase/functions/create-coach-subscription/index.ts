import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Auth: subscriber must be signed in
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const sbAnon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data: { user }, error: authErr } = await sbAnon.auth.getUser(token);
  if (authErr || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  let body: { trainer_id?: string; return_url?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }
  const { trainer_id, return_url } = body;

  if (!trainer_id) {
    return new Response(JSON.stringify({ error: "trainer_id required" }), {
      status: 400, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Fetch trainer + subscription price
  const { data: trainer, error: trainerErr } = await sb
    .from("trainers")
    .select("id, slug, name, subscription_price_cents")
    .eq("id", trainer_id)
    .maybeSingle();

  if (trainerErr) {
    return new Response(JSON.stringify({ error: "Database error" }), {
      status: 500, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  if (!trainer || !trainer.subscription_price_cents) {
    return new Response(JSON.stringify({ error: "Trainer does not have a subscription product" }), {
      status: 404, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  // Check if user already has an active subscription
  const { data: existing, error: existingErr } = await sb
    .from("coach_subscriptions")
    .select("id, status")
    .eq("trainer_id", trainer_id)
    .eq("subscriber_id", user.id)
    .maybeSingle();

  if (existingErr) {
    return new Response(JSON.stringify({ error: "Database error" }), {
      status: 500, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  if (existing && (existing.status === "active" || existing.status === "trialing")) {
    return new Response(JSON.stringify({ ok: true, already_subscribed: true, checkout_url: null }), {
      headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
  const siteUrl = Deno.env.get("PUBLIC_SITE_URL") ?? "https://trainedby.com";
  const successUrl = return_url ?? `${siteUrl}/${trainer.slug}/videos?subscribed=1`;
  const cancelUrl = return_url ?? `${siteUrl}/${trainer.slug}/videos`;

  let session: { url: string | null };
  try {
    session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: user.email ?? undefined,
      line_items: [{
        price_data: {
          currency: "usd",
          recurring: { interval: "month" },
          unit_amount: trainer.subscription_price_cents,
          product_data: {
            name: `${trainer.name} — Monthly Video Access`,
          },
        },
        quantity: 1,
      }],
      success_url: `${successUrl}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: { trainer_id, subscriber_id: user.id },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: `Stripe error: ${err instanceof Error ? err.message : err}` }), {
      status: 500, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ ok: true, checkout_url: session.url }), {
    headers: { ...corsHeaders, "content-type": "application/json" }
  });
});
