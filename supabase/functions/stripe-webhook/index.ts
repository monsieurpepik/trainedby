import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("No signature", { status: 400 });

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (e) {
    console.error("Webhook signature verification failed:", e);
    return new Response("Invalid signature", { status: 400 });
  }

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

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

          // Fetch trainer details for notifications
          const { data: trainer } = await sb.from("trainers").select("name, email").eq("id", trainer_id).single();
          const SELF_BASE = `https://mezhtdbfyvkshpuplqqw.supabase.co/functions/v1`;
          const svcKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

          // Telegram alert to founder
          if (trainer) {
            fetch(`${SELF_BASE}/ceo-agent/notify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${svcKey}` },
              body: JSON.stringify({ type: 'pro_upgrade', data: { name: trainer.name, email: trainer.email } })
            }).catch(() => {});

            // Pro welcome lifecycle email
            fetch(`${SELF_BASE}/lifecycle-email`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${svcKey}` },
              body: JSON.stringify({ trainer_id, type: 'pro_welcome' })
            }).catch(() => {});
          }
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
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        if (customerId) {
          await sb.from("trainers").update({ subscription_status: "past_due" }).eq("stripe_customer_id", customerId);
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (e) {
    console.error("Webhook handler error:", e);
    return new Response("Handler error", { status: 500 });
  }
});
