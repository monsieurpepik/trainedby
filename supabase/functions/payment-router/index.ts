/**
 * payment-router  -  Unified Payment Gateway Router
 * ─────────────────────────────────────────────────────────────────────────────
 * Routes payment requests to the correct provider based on market:
 *   - Stripe: AE, UK, COM, FR, IT, ES, MX
 *   - Razorpay: IN
 *
 * POST /payment-router
 * Body: {
 *   trainer_id: string,
 *   plan: 'pro' | 'premium',
 *   billing: 'monthly' | 'annual',
 *   market: string,          // auto-detected from market_configs
 *   success_url?: string,
 *   cancel_url?: string,
 * }
 *
 * Returns:
 *   Stripe: { provider: 'stripe', checkout_url: string }
 *   Razorpay: { provider: 'razorpay', order_id, amount, currency, key_id }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { captureException } from '../_shared/sentry.ts';
import { createLogger } from '../_shared/logger.ts';
import { checkRateLimit, addRateLimitHeaders } from '../_shared/rate_limit.ts';
import { getDashboardUrl, getPricingUrl, getMarketBaseUrl } from '../_shared/market_url.ts';

const logger = createLogger('payment-router');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Market → payment provider mapping
const PAYMENT_PROVIDERS: Record<string, 'stripe' | 'razorpay'> = {
  ae: 'stripe',
  com: 'stripe',
  uk: 'stripe',
  fr: 'stripe',
  it: 'stripe',
  es: 'stripe',
  mx: 'stripe',
  in: 'razorpay',
};

// Stripe price IDs per market per plan
const STRIPE_PRICES: Record<string, Record<string, Record<string, string>>> = {
  ae: {
    pro: {
      monthly: Deno.env.get('STRIPE_PRICE_PRO_MONTHLY') || '',
      annual: Deno.env.get('STRIPE_PRICE_PRO_ANNUAL') || '',
    },
    premium: {
      monthly: Deno.env.get('STRIPE_PRICE_PREMIUM_MONTHLY') || '',
      annual: Deno.env.get('STRIPE_PRICE_PREMIUM_ANNUAL') || '',
    },
  },
};

// Razorpay plan amounts (in paise)
const RAZORPAY_PLANS: Record<string, { amount: number; label: string }> = {
  pro_monthly: { amount: 49900, label: 'TrainedBy Pro  -  ₹499/month' },
  pro_annual:  { amount: 499900, label: 'TrainedBy Pro  -  ₹4,999/year' },
};

Deno.serve(async (req) => {
  const start = Date.now();
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
  const responseHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

  // Rate limiting: 10 payment attempts per minute per IP
  if (checkRateLimit(`payment:${ip}`, 10, 60_000)) {
    addRateLimitHeaders(responseHeaders, `payment:${ip}`, 10);
    return new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429, headers: responseHeaders });
  }

  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: responseHeaders });

    const sb = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verify magic link token  -  must be unused and not expired
    const { data: link } = await sb
      .from('magic_links')
      .select('trainer_id, expires_at, used')
      .eq('token', token)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!link?.trainer_id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: responseHeaders });
    }

    const body = await req.json();
    const { trainer_id, plan = 'pro', billing = 'monthly', market: requestedMarket, success_url, cancel_url } = body;

    if (link.trainer_id !== trainer_id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: responseHeaders });
    }

    // Get trainer and their market
    const { data: trainer } = await sb
      .from('trainers')
      .select('id, name, email, market, stripe_customer_id')
      .eq('id', trainer_id)
      .single();

    if (!trainer) {
      return new Response(JSON.stringify({ error: 'Trainer not found' }), { status: 404, headers: responseHeaders });
    }

    const market = requestedMarket || trainer.market || 'ae';
    const provider = PAYMENT_PROVIDERS[market] ?? 'stripe';

    logger.info('Payment router request', { trainer_id, market, provider, plan, billing });

    // ── Stripe flow ──────────────────────────────────────────────────────────
    if (provider === 'stripe') {
      const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
      if (!STRIPE_SECRET_KEY) {
        return new Response(JSON.stringify({ error: 'Stripe not configured' }), { status: 503, headers: responseHeaders });
      }

      const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

      // Get or create Stripe customer
      let customerId = trainer.stripe_customer_id;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: trainer.email,
          name: trainer.name,
          metadata: { trainer_id, market },
        });
        customerId = customer.id;
        await sb.from('trainers').update({ stripe_customer_id: customerId }).eq('id', trainer_id);
      }

      // Get price ID  -  use market-specific if available, fall back to AE
      const marketPrices = STRIPE_PRICES[market] ?? STRIPE_PRICES['ae'];
      const priceId = marketPrices?.[plan]?.[billing];
      if (!priceId) {
        return new Response(JSON.stringify({ error: `No price configured for ${market}/${plan}/${billing}` }), { status: 400, headers: responseHeaders });
      }

      const baseUrl = getMarketBaseUrl(market);
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: success_url || getDashboardUrl(market, 'upgraded=1'),
        cancel_url: cancel_url || getPricingUrl(market),
        metadata: { trainer_id, plan, market },
        subscription_data: { metadata: { trainer_id, plan, market } },
      });

      logger.request(req, 200, start, { provider: 'stripe', market });
      return new Response(JSON.stringify({
        provider: 'stripe',
        checkout_url: session.url,
      }), { headers: responseHeaders });
    }

    // ── Razorpay flow ────────────────────────────────────────────────────────
    if (provider === 'razorpay') {
      const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID');
      const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');

      if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        return new Response(JSON.stringify({
          error: 'Razorpay not configured',
          setup_url: 'https://dashboard.razorpay.com/app/keys',
        }), { status: 503, headers: responseHeaders });
      }

      const planKey = `${plan}_${billing}`;
      const planConfig = RAZORPAY_PLANS[planKey] ?? RAZORPAY_PLANS['pro_monthly'];

      const orderPayload = {
        amount: planConfig.amount,
        currency: 'INR',
        receipt: `tb_${trainer_id.substring(0, 8)}_${Date.now()}`,
        notes: {
          trainer_id,
          plan,
          email: trainer.email,
          market,
        },
      };

      const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
      const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      if (!orderRes.ok) {
        const err = await orderRes.text();
        logger.error('Razorpay order creation failed', { error: err });
        return new Response(JSON.stringify({ error: 'Payment provider error' }), { status: 502, headers: responseHeaders });
      }

      const order = await orderRes.json();

      logger.request(req, 200, start, { provider: 'razorpay', market });
      return new Response(JSON.stringify({
        provider: 'razorpay',
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: RAZORPAY_KEY_ID,
        trainer_name: trainer.name,
        trainer_email: trainer.email,
        description: planConfig.label,
      }), { headers: responseHeaders });
    }

    return new Response(JSON.stringify({ error: 'Unknown payment provider' }), { status: 400, headers: responseHeaders });

  } catch (e) {
    await captureException(e, { function: 'payment-router' });
    logger.exception(e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: responseHeaders });
  }
});
