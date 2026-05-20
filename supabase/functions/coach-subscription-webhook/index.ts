import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function mapStripeStatus(stripeStatus: string): string {
  switch (stripeStatus) {
    case "active":     return "active";
    case "past_due":   return "past_due";
    case "trialing":   return "trialing";
    case "unpaid":     return "unpaid";
    case "incomplete": return "incomplete";
    case "incomplete_expired": return "incomplete_expired";
    default:           return "canceled"; // covers: "canceled", "paused", any future Stripe statuses
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";
  const webhookSecret = Deno.env.get("STRIPE_SUBSCRIPTION_WEBHOOK_SECRET")!;

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    return new Response(JSON.stringify({ error: `Webhook error: ${err}` }), {
      status: 400, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated"
  ) {
    const sub = event.data.object as Stripe.Subscription;
    const trainerId = sub.metadata?.trainer_id;
    const subscriberId = sub.metadata?.subscriber_id;

    if (!trainerId || !subscriberId) {
      // Subscription not from our flow — ignore
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "content-type": "application/json" }
      });
    }

    const priceAmount = (sub.items.data[0]?.price?.unit_amount) ?? 0;
    const currentPeriodEnd = new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString();

    const { error: upsertErr } = await sb
      .from("coach_subscriptions")
      .upsert({
        trainer_id: trainerId,
        subscriber_id: subscriberId,
        stripe_subscription_id: sub.id,
        stripe_customer_id: typeof sub.customer === "string" ? sub.customer : (sub.customer as Stripe.Customer).id,
        status: mapStripeStatus(sub.status),
        price_cents: priceAmount,
        current_period_end: currentPeriodEnd,
      }, { onConflict: "trainer_id,subscriber_id" });

    if (upsertErr) {
      return new Response(JSON.stringify({ error: "db_error" }), {
        status: 500, headers: { ...corsHeaders, "content-type": "application/json" }
      });
    }

  } else if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;

    const { error: updateErr } = await sb
      .from("coach_subscriptions")
      .update({ status: "canceled", current_period_end: new Date().toISOString() })
      .eq("stripe_subscription_id", sub.id);

    if (updateErr) {
      return new Response(JSON.stringify({ error: "db_error" }), {
        status: 500, headers: { ...corsHeaders, "content-type": "application/json" }
      });
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, "content-type": "application/json" }
  });
});
