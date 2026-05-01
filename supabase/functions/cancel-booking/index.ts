// supabase/functions/cancel-booking/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { CORS_HEADERS, jsonResponse, errorResponse, validationError, notFoundError, serverError, isValidUUID } from '../_shared/errors.ts';
import { createLogger } from '../_shared/logger.ts';

const log = createLogger('cancel-booking');
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';

async function computeHmac(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder();
  const aKey = await crypto.subtle.importKey('raw', enc.encode('compare'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const aSig = await crypto.subtle.sign('HMAC', aKey, enc.encode(a));
  const bSig = await crypto.subtle.sign('HMAC', aKey, enc.encode(b));
  const aArr = new Uint8Array(aSig);
  const bArr = new Uint8Array(bSig);
  let diff = 0;
  for (let i = 0; i < aArr.length; i++) diff |= aArr[i] ^ bArr[i];
  return diff === 0;
}

async function sendEmail(to: string, subject: string, html: string, from = 'TrainedBy <noreply@trainedby.com>'): Promise<void> {
  if (!RESEND_API_KEY) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, html }),
  });
}

function emailBase(content: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  body{margin:0;padding:0;background:#0a0a0a;font-family:'Inter',-apple-system,sans-serif}
  .wrap{max-width:560px;margin:0 auto;padding:40px 20px}
  .logo{font-family:'Manrope',sans-serif;font-size:20px;font-weight:800;color:#fff;margin-bottom:32px}
  .logo span{color:#FF5C00}
  .card{background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:28px}
  h1{font-family:'Manrope',sans-serif;font-size:22px;font-weight:800;color:#fff;margin:0 0 12px}
  p{font-size:14px;color:rgba(255,255,255,0.7);line-height:1.7;margin:0 0 16px}
  .footer{font-size:11px;color:rgba(255,255,255,0.25);margin-top:24px;line-height:1.6}
</style></head><body>
<div class="wrap">
  <div class="logo">Trained<span>By</span></div>
  <div class="card">${content}</div>
  <div class="footer">TrainedBy · trainedby.com</div>
</div></body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });

  try {
    const { bookingId, token } = await req.json();
    if (!bookingId || !token) return validationError('bookingId', 'bookingId and token are required');

    if (!isValidUUID(bookingId)) return validationError('bookingId', 'Invalid bookingId format');

    const bookingSecret = Deno.env.get('BOOKING_SECRET');
    if (!bookingSecret) {
      log.error('BOOKING_SECRET env var not set');
      return serverError('Server misconfiguration');
    }
    const expected = await computeHmac(bookingSecret, `cancel:${bookingId}`);
    const valid = await timingSafeEqual(token, expected);
    if (!valid) {
      log.warn('Invalid cancel token', { bookingId });
      return errorResponse('Invalid or expired cancellation link', 403);
    }

    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { data: booking, error: bErr } = await sb
      .from('bookings')
      .select('id, trainer_id, consumer_name, consumer_email, scheduled_at, duration_min, amount_cents, stripe_payment_intent_id, stripe_charge_id, status')
      .eq('id', bookingId)
      .single();

    if (bErr || !booking) return notFoundError('Booking');

    if (booking.status === 'cancelled') return jsonResponse({ cancelled: true, refunded: false, alreadyCancelled: true });
    if (booking.status === 'refunded') return jsonResponse({ cancelled: true, refunded: true, alreadyCancelled: true });
    if (booking.status !== 'confirmed') return errorResponse('Booking cannot be cancelled in its current state', 400);

    const now = new Date();
    const scheduledAt = new Date(booking.scheduled_at);
    const hoursUntil = (scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60);
    const refundEligible = hoursUntil >= 24;

    let refunded = false;

    if (refundEligible && booking.stripe_payment_intent_id) {
      const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' });
      try {
        await stripe.refunds.create({ payment_intent: booking.stripe_payment_intent_id });
        refunded = true;
        log.info('Refund issued', { bookingId, paymentIntentId: booking.stripe_payment_intent_id });
      } catch (stripeErr) {
        log.error('Stripe refund failed', { bookingId, stripeErr });
        return serverError('Refund failed — please contact support');
      }
    }

    const { error: updateError } = await sb.from('bookings').update({
      status: refunded ? 'refunded' : 'cancelled',
      cancelled_at: new Date().toISOString(),
      refunded_at: refunded ? new Date().toISOString() : null,
    }).eq('id', bookingId);

    if (updateError) {
      log.error('Failed to update booking status', { bookingId, refunded, updateError });
      if (refunded) {
        log.error('CRITICAL: Stripe refund issued but booking not marked — needs manual reconciliation', { bookingId });
      }
      return serverError('Failed to update booking status');
    }

    const refundMsg = refunded
      ? `A full refund of $${(booking.amount_cents / 100).toFixed(2)} has been issued and will appear within 5–10 business days.`
      : `Your session was within 24 hours, so no refund is available per our cancellation policy.`;

    const html = emailBase(`
      <h1>Booking cancelled</h1>
      <p>Hi ${booking.consumer_name}, your session on ${new Date(booking.scheduled_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} has been cancelled.</p>
      <p>${refundMsg}</p>`);

    await sendEmail(booking.consumer_email, 'Your booking has been cancelled — TrainedBy', html);

    return jsonResponse({ cancelled: true, refunded });
  } catch (err) {
    log.exception('cancel-booking', err);
    return serverError('Internal error');
  }
});
