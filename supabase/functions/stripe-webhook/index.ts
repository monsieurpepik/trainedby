import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { captureException } from "../_shared/sentry.ts";
import { createLogger } from "../_shared/logger.ts";
import { getDashboardUrl, getPricingUrl } from "../_shared/market_url.ts";

const logger = createLogger("stripe-webhook");

Deno.serve(async (req) => {
  const start = Date.now();
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("No signature", { status: 400 });

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (e) {
    logger.warn("Webhook signature verification failed", { error: String(e) });
    return new Response("Invalid signature", { status: 400 });
  }

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // ── Idempotency: check if this event has already been processed ──────────
  const eventId = event.id;
  const { data: existing } = await sb
    .from("processed_webhook_events")
    .select("id")
    .eq("event_id", eventId)
    .single();

  if (existing) {
    logger.info("Duplicate webhook event — skipping", { event_id: eventId, type: event.type });
    return new Response(JSON.stringify({ received: true, duplicate: true }), { status: 200 });
  }

  // Mark as processing immediately to prevent race conditions
  await sb.from("processed_webhook_events").insert({
    event_id: eventId,
    event_type: event.type,
    processed_at: new Date().toISOString(),
  }).onConflict("event_id").ignore();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const trainer_id = session.metadata?.trainer_id;
        const plan = session.metadata?.plan;
        if (trainer_id && plan) {
          await sb.from("trainers").update({
            plan,
            subscription_status: "active",
            stripe_subscription_id: session.subscription as string,
          }).eq("id", trainer_id);

          const { data: trainer } = await sb
            .from("trainers")
            .select("name, email, market")
            .eq("id", trainer_id)
            .single();

          const SELF_BASE = `${Deno.env.get("SUPABASE_URL")}/functions/v1`;
          const svcKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
          const market = trainer?.market ?? "ae";

          if (trainer) {
            // Telegram alert to founder
            fetch(`${SELF_BASE}/ceo-agent/notify`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${svcKey}` },
              body: JSON.stringify({ type: "pro_upgrade", data: { name: trainer.name, email: trainer.email, market } }),
            }).catch(() => {});

            // Pro welcome lifecycle email — market-aware
            fetch(`${SELF_BASE}/lifecycle-email`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${svcKey}` },
              body: JSON.stringify({ trainer_id, type: "pro_welcome", market }),
            }).catch(() => {});
          }

          logger.info("Checkout completed — trainer upgraded", { trainer_id, plan, market });
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const trainer_id = sub.metadata?.trainer_id;
        if (trainer_id) {
          const plan = sub.metadata?.plan || "free";
          await sb.from("trainers").update({
            plan: sub.status === "active" ? plan : "free",
            subscription_status: sub.status,
            subscription_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          }).eq("id", trainer_id);
          logger.info("Subscription updated", { trainer_id, status: sub.status, plan });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const trainer_id = sub.metadata?.trainer_id;
        if (trainer_id) {
          await sb.from("trainers").update({
            plan: "free",
            subscription_status: "cancelled",
            stripe_subscription_id: null,
          }).eq("id", trainer_id);
          logger.info("Subscription cancelled", { trainer_id });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        if (customerId) {
          await sb.from("trainers").update({ subscription_status: "past_due" }).eq("stripe_customer_id", customerId);
          logger.warn("Payment failed", { customer_id: customerId });
        }
        break;
      }
    }

    logger.request(req, 200, start, { event_type: event.type });
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (e) {
    await captureException(e, { function: "stripe-webhook", event_id: eventId, event_type: event.type });
    logger.exception(e, { event_id: eventId });
    return new Response("Handler error", { status: 500 });
  }
});
