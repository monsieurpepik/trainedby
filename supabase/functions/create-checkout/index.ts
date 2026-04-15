import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Stripe price IDs — set these in your Stripe dashboard and add to env
const PRICE_IDS: Record<string, Record<string, string>> = {
  pro: {
    monthly: Deno.env.get("STRIPE_PRICE_PRO_MONTHLY") || "price_pro_monthly",
    annual: Deno.env.get("STRIPE_PRICE_PRO_ANNUAL") || "price_pro_annual",
  },
  premium: {
    monthly: Deno.env.get("STRIPE_PRICE_PREMIUM_MONTHLY") || "price_premium_monthly",
    annual: Deno.env.get("STRIPE_PRICE_PREMIUM_ANNUAL") || "price_premium_annual",
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });

    // Verify token — must be unused and not expired
    const { data: link } = await sb
      .from("magic_links")
      .select("trainer_id, expires_at, used")
      .eq("token", token)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .single();
    if (!link?.trainer_id) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const { trainer_id, plan, billing = "monthly", success_url, cancel_url } = await req.json();
    if (link.trainer_id !== trainer_id) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });

    const { data: trainer } = await sb.from("trainers").select("email,name,stripe_customer_id").eq("id", trainer_id).single();
    if (!trainer) return new Response(JSON.stringify({ error: "Trainer not found" }), { status: 404, headers: corsHeaders });

    // Get or create Stripe customer
    let customerId = trainer.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: trainer.email, name: trainer.name, metadata: { trainer_id } });
      customerId = customer.id;
      await sb.from("trainers").update({ stripe_customer_id: customerId }).eq("id", trainer_id);
    }

    const priceId = PRICE_IDS[plan]?.[billing];
    if (!priceId) return new Response(JSON.stringify({ error: "Invalid plan" }), { status: 400, headers: corsHeaders });

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: success_url || "https://trainedby.ae/dashboard?upgraded=1",
      cancel_url: cancel_url || "https://trainedby.ae/pricing",
      metadata: { trainer_id, plan },
      subscription_data: { metadata: { trainer_id, plan } },
      allow_promotion_codes: true,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: corsHeaders });
  }
});
