import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14?target=deno";

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
  const webhookSecret = Deno.env.get("STRIPE_CLUB_WEBHOOK_SECRET")!;

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature!, webhookSecret);
  } catch (err) {
    return new Response(`Webhook error: ${err.message}`, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return new Response("ok");
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const { club_id, user_id } = session.metadata ?? {};

  if (!club_id || !user_id) {
    return new Response("Missing metadata", { status: 400 });
  }

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { error } = await sb.from("club_members").upsert({
    club_id,
    user_id,
    status: "active",
    stripe_payment_intent_id: session.payment_intent as string,
  }, { onConflict: "club_id,user_id" });

  if (error) {
    console.error("Failed to create membership:", error.message);
    return new Response("DB error", { status: 500 });
  }

  return new Response("ok");
});
