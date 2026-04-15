/**
 * create-razorpay-order  -  India market payment integration
 * ─────────────────────────────────────────────────────────────────────────────
 * Creates a Razorpay order for TrainedBy Pro subscriptions on trainedby.in
 *
 * POST /create-razorpay-order
 * Body: { trainer_id: string, plan: 'pro_499' | 'pro_999', email: string, name: string }
 *
 * Returns: { order_id, amount, currency, key_id } for the Razorpay checkout widget
 *
 * Flow:
 *   1. Validate trainer exists
 *   2. Create Razorpay order via Management API
 *   3. Return order details for frontend Razorpay.js checkout
 *   4. Webhook (razorpay-webhook) verifies payment and upgrades trainer to Pro
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PLANS = {
  pro_499: { amount: 49900, label: 'TrainedBy Pro  -  ₹499/month' },   // amount in paise
  pro_999: { amount: 99900, label: 'TrainedBy Pro  -  ₹999/month' },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID');
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return new Response(JSON.stringify({
        error: 'Razorpay not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET secrets.',
        setup_url: 'https://dashboard.razorpay.com/app/keys',
      }), { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { trainer_id, plan = 'pro_499', email, name } = await req.json();

    if (!trainer_id || !email) {
      return new Response(JSON.stringify({ error: 'trainer_id and email are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const planConfig = PLANS[plan as keyof typeof PLANS] ?? PLANS.pro_499;

    // Verify trainer exists
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: trainer, error: trainerErr } = await sb
      .from('trainers')
      .select('id, name, email, plan')
      .eq('id', trainer_id)
      .single();

    if (trainerErr || !trainer) {
      return new Response(JSON.stringify({ error: 'Trainer not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (trainer.plan === 'pro') {
      return new Response(JSON.stringify({ error: 'Already on Pro plan' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Create Razorpay order
    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: planConfig.amount,
        currency: 'INR',
        receipt: `tb_${trainer_id.slice(0, 8)}_${Date.now()}`,
        notes: {
          trainer_id,
          plan,
          email,
          platform: 'trainedby.in',
        },
      }),
    });

    if (!orderRes.ok) {
      const errBody = await orderRes.text();
      console.error('Razorpay order creation failed:', errBody);
      return new Response(JSON.stringify({ error: 'Failed to create payment order. Try again.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const order = await orderRes.json();

    // Log the pending order in Supabase
    await sb.from('payment_attempts').upsert({
      trainer_id,
      provider: 'razorpay',
      order_id: order.id,
      amount: planConfig.amount,
      currency: 'INR',
      plan,
      status: 'created',
      created_at: new Date().toISOString(),
    }, { onConflict: 'order_id' }).catch(() => {}); // non-blocking

    return new Response(JSON.stringify({
      order_id: order.id,
      amount: planConfig.amount,
      currency: 'INR',
      key_id: RAZORPAY_KEY_ID,
      name: 'TrainedBy Pro',
      description: planConfig.label,
      prefill: {
        name: name || trainer.name,
        email: email || trainer.email,
      },
      theme: { color: '#FF5C00' },
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('create-razorpay-order error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
