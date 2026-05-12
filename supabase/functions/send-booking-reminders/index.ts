// supabase/functions/send-booking-reminders/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { CORS_HEADERS, jsonResponse, serverError } from '../_shared/errors.ts';
import { createLogger } from '../_shared/logger.ts';

const log = createLogger('send-booking-reminders');
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';

async function sendEmail(to: string, subject: string, html: string, from = 'TrainedBy <noreply@trainedby.com>'): Promise<void> {
  if (!RESEND_API_KEY) { log.warn('No Resend key', { to }); return; }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!res.ok) log.error('Resend error', { status: res.status });
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
  .detail{background:#1a1a1a;border-radius:8px;padding:12px 16px;margin-bottom:8px;font-size:13px;color:#fff}
  .detail-label{font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:2px}
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
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const now = new Date();
    const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000).toISOString();
    const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString();

    const { data: bookings, error } = await sb
      .from('bookings')
      .select(`
        id, consumer_name, consumer_email, consumer_phone, scheduled_at, duration_min,
        trainer:trainers(name, email),
        session_type:session_types(name)
      `)
      .eq('status', 'confirmed')
      .gte('scheduled_at', windowStart)
      .lte('scheduled_at', windowEnd);

    if (error) {
      log.error('Failed to query bookings', { error });
      return serverError('Query failed');
    }

    log.info('Sending reminders', { count: bookings?.length ?? 0 });

    for (const booking of (bookings ?? [])) {
      const dateStr = new Date(booking.scheduled_at).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      });
      const timeStr = new Date(booking.scheduled_at).toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
      });

      // Consumer reminder
      const consumerHtml = emailBase(`
        <h1>Session reminder — tomorrow</h1>
        <p>Hi ${booking.consumer_name}, just a reminder that you have a session tomorrow.</p>
        <div class="detail"><div class="detail-label">Session</div>${(booking.session_type as any)?.name ?? 'Session'}</div>
        <div class="detail"><div class="detail-label">Date</div>${dateStr}</div>
        <div class="detail"><div class="detail-label">Time</div>${timeStr}</div>
        <div class="detail"><div class="detail-label">Duration</div>${booking.duration_min} minutes</div>
        <div class="detail"><div class="detail-label">Trainer</div>${(booking.trainer as any)?.name ?? 'Your trainer'}</div>`);

      await sendEmail(booking.consumer_email, 'Session tomorrow — TrainedBy reminder', consumerHtml);

      // Trainer reminder
      const trainerEmail = (booking.trainer as any)?.email;
      if (trainerEmail) {
        const trainerHtml = emailBase(`
          <h1>Session tomorrow</h1>
          <p>Reminder: you have a session tomorrow.</p>
          <div class="detail"><div class="detail-label">Client</div>${booking.consumer_name}</div>
          <div class="detail"><div class="detail-label">Phone</div>${booking.consumer_phone}</div>
          <div class="detail"><div class="detail-label">Date</div>${dateStr}</div>
          <div class="detail"><div class="detail-label">Time</div>${timeStr}</div>
          <div class="detail"><div class="detail-label">Duration</div>${booking.duration_min} minutes</div>`);
        await sendEmail(trainerEmail, `Session tomorrow: ${booking.consumer_name}`, trainerHtml);
      }
    }

    return jsonResponse({ reminded: bookings?.length ?? 0 });
  } catch (err) {
    log.exception('send-booking-reminders', err);
    return serverError('Internal error');
  }
});
