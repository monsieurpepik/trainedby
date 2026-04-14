/**
 * razorpay-webhook — Verifies Razorpay payment and upgrades trainer to Pro
 * ─────────────────────────────────────────────────────────────────────────────
 * Razorpay sends a POST to this endpoint after payment.payment.captured event.
 *
 * Security: Verifies HMAC-SHA256 signature using RAZORPAY_WEBHOOK_SECRET
 *
 * On success:
 *   1. Upgrades trainer plan to 'pro' in Supabase
 *   2. Fires lifecycle-email (pro_welcome)
 *   3. Fires CEO bot Telegram alert (pro_upgrade)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
};

async function hmacSHA256(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const RAZORPAY_WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const EDGE_BASE = `${SUPABASE_URL}/functions/v1`;

  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature') ?? '';

  // Verify signature
  if (RAZORPAY_WEBHOOK_SECRET) {
    const expected = await hmacSHA256(RAZORPAY_WEBHOOK_SECRET, rawBody);
    if (expected !== signature) {
      console.error('Invalid Razorpay webhook signature');
      return new Response('Forbidden', { status: 403 });
    }
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  // Only handle successful payment captures
  if (event.event !== 'payment.captured') {
    return new Response(JSON.stringify({ received: true, action: 'ignored' }),
      { headers: { 'Content-Type': 'application/json' } });
  }

  const payment = event.payload?.payment?.entity;
  if (!payment) return new Response('ok');

  const { trainer_id, plan, email } = payment.notes ?? {};

  if (!trainer_id) {
    console.error('No trainer_id in payment notes');
    return new Response('ok');
  }

  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Upgrade trainer to Pro
  const { data: trainer, error } = await sb
    .from('trainers')
    .update({
      plan: 'pro',
      pro_since: new Date().toISOString(),
      razorpay_payment_id: payment.id,
    })
    .eq('id', trainer_id)
    .select('id, name, email, city')
    .single();

  if (error) {
    console.error('Failed to upgrade trainer:', error);
    return new Response('Internal error', { status: 500 });
  }

  // Log payment
  await sb.from('payment_attempts').upsert({
    trainer_id,
    provider: 'razorpay',
    order_id: payment.order_id,
    payment_id: payment.id,
    amount: payment.amount,
    currency: payment.currency,
    plan: plan ?? 'pro_499',
    status: 'captured',
    updated_at: new Date().toISOString(),
  }, { onConflict: 'order_id' }).catch(() => {});

  const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

  // Fire Pro welcome email
  fetch(`${EDGE_BASE}/lifecycle-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': ANON_KEY },
    body: JSON.stringify({ type: 'pro_welcome', trainer_id }),
  }).catch(() => {});

  // Fire CEO bot Telegram alert
  fetch(`${EDGE_BASE}/ceo-agent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': ANON_KEY },
    body: JSON.stringify({
      type: 'notify',
      event_type: 'pro_upgrade',
      trainer: {
        name: trainer?.name,
        email: trainer?.email ?? email,
        city: trainer?.city,
        amount: `₹${(payment.amount / 100).toFixed(0)}`,
        market: 'India (.in)',
      },
    }),
  }).catch(() => {});

  console.log(`✅ Trainer ${trainer_id} upgraded to Pro via Razorpay (${payment.id})`);

  return new Response(JSON.stringify({ success: true }),
    { headers: { 'Content-Type': 'application/json' } });
});
