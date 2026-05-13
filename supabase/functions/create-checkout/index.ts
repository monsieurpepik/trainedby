import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { checkRateLimit } from '../_shared/rate_limit.ts';
import { getDashboardUrl, getPricingUrl } from '../_shared/market_url.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Market → currency code (mirrors src/lib/market.ts)
const MARKET_CURRENCY: Record<string, string> = {
  ae: 'AED', uk: 'GBP', us: 'USD', com: 'USD',
  fr: 'EUR', it: 'EUR', es: 'EUR', mx: 'MXN', in: 'INR',
};

// Returns the Stripe price ID for a given plan, billing cycle, and market.
// Env var convention: STRIPE_PRICE_PRO_MONTHLY_AED (market-specific)
// Falls back to: STRIPE_PRICE_PRO_MONTHLY (global default)
function getPriceId(plan: string, billing: string, market: string): string | undefined {
  const currency = MARKET_CURRENCY[market] ?? 'USD';
  const key = `STRIPE_PRICE_${plan.toUpperCase()}_${billing.toUpperCase()}`;
  return Deno.env.get(`${key}_${currency}`) || Deno.env.get(key) || undefined;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Rate limit: 10 checkout attempts per IP per hour
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const limited = checkRateLimit(`checkout:${clientIp}`, 10, 60 * 60 * 1000);
  if (limited) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again later.', code: 'RATE_LIMITED' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '3600' } }
    );
  }

  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });

    // Verify token  -  must be unused and not expired
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

    const { data: trainer } = await sb.from("trainers").select("email,name,stripe_customer_id,market").eq("id", trainer_id).single();
    if (!trainer) return new Response(JSON.stringify({ error: "Trainer not found" }), { status: 404, headers: corsHeaders });

    // Get or create Stripe customer
    let customerId = trainer.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: trainer.email, name: trainer.name, metadata: { trainer_id } });
      customerId = customer.id;
      await sb.from("trainers").update({ stripe_customer_id: customerId }).eq("id", trainer_id);
    }

    const priceId = getPriceId(plan, billing, trainer.market ?? 'ae');
    if (!priceId) return new Response(JSON.stringify({ error: "Invalid plan" }), { status: 400, headers: corsHeaders });

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: success_url || getDashboardUrl(trainer?.market ?? 'ae', 'upgraded=1'),
      cancel_url: cancel_url || getPricingUrl(trainer?.market ?? 'ae'),
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
