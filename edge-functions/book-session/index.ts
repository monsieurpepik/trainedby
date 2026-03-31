import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json();
    const { trainer_id, client_name, client_phone, client_email, package_id, preferred_date, preferred_time, notes } = body;

    if (!trainer_id || !client_name || !client_phone) {
      return new Response(JSON.stringify({ error: 'trainer_id, client_name, client_phone are required' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }

    // Insert booking
    const { data: booking, error: bookErr } = await supabase
      .from('bookings')
      .insert({
        trainer_id,
        client_name,
        client_phone,
        client_email: client_email || null,
        package_id: package_id || null,
        preferred_date: preferred_date || null,
        preferred_time: preferred_time || null,
        notes: notes || null,
        status: 'pending'
      })
      .select()
      .single();

    if (bookErr) throw bookErr;

    // Also insert as a lead for backwards compatibility
    await supabase.from('leads').insert({
      trainer_id,
      name: client_name,
      phone: client_phone,
      email: client_email || null,
      message: `Booking request${preferred_date ? ` for ${preferred_date}` : ''}${notes ? `: ${notes}` : ''}`,
      source: 'booking'
    });

    // Get trainer info for notification
    const { data: trainer } = await supabase
      .from('trainers')
      .select('full_name, email, whatsapp')
      .eq('id', trainer_id)
      .single();

    // Send email notification via Resend
    const RESEND_KEY = Deno.env.get('RESEND_API_KEY');
    if (RESEND_KEY && trainer?.email) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'TrainedBy.ae <hello@trainedby.ae>',
          to: trainer.email,
          subject: `New booking request from ${client_name}`,
          html: `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#0a0a0a;color:#fff;padding:32px;border-radius:12px">
              <div style="font-size:22px;font-weight:800;margin-bottom:4px">New Booking Request</div>
              <div style="color:#999;margin-bottom:24px">Someone wants to train with you</div>
              <div style="background:#1a1a1a;border-radius:10px;padding:20px;margin-bottom:20px">
                <div style="margin-bottom:12px"><strong>Client:</strong> ${client_name}</div>
                <div style="margin-bottom:12px"><strong>WhatsApp:</strong> ${client_phone}</div>
                ${preferred_date ? `<div style="margin-bottom:12px"><strong>Preferred Date:</strong> ${preferred_date}${preferred_time ? ` at ${preferred_time}` : ''}</div>` : ''}
                ${notes ? `<div style="margin-bottom:12px"><strong>Notes:</strong> ${notes}</div>` : ''}
              </div>
              <a href="https://wa.me/${client_phone.replace(/\D/g,'')}" style="display:inline-block;background:#25D366;color:#fff;padding:14px 24px;border-radius:10px;text-decoration:none;font-weight:700">
                Reply on WhatsApp
              </a>
            </div>`
        })
      });
    }

    return new Response(JSON.stringify({ success: true, booking_id: booking.id }), {
      headers: { ...cors, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' }
    });
  }
});
