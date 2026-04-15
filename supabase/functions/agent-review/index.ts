/**
 * TrainedBy — Review Harvester Agent
 * ─────────────────────────────────────────────────────────────────────────────
 * Trigger: DB webhook on sessions table UPDATE where status changes to 'complete'
 *          Delayed 2 hours via pg_cron or Supabase scheduled function.
 *
 * What it does:
 *   2 hours after a session is marked complete, sends the CLIENT (not the trainer)
 *   a WhatsApp message asking for a review of their trainer.
 *
 *   The review link points to the trainer's profile page with a ?review=1 param
 *   that opens a review modal.
 *
 * Why it matters:
 *   More reviews → higher ranking on the find page → more organic leads.
 *   Trainers understand this equation. It's a visible, compound benefit of
 *   staying on the platform.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getMarket } from '../_shared/locale.ts';

const sb = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

async function sendWhatsApp(to: string, text: string): Promise<void> {
  const token = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
  const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
  if (!token || !phoneNumberId) return; // silently skip if not configured

  const normalised = to.replace(/^\+/, '').replace(/\s/g, '');
  await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: normalised,
      type: 'text',
      text: { body: text },
    }),
  });
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const body = await req.json();

    // Support single session trigger or cron sweep of sessions completed 2h ago
    const singleSessionId: string | null = body.session_id ?? null;

    let sessions: Array<Record<string, unknown>> = [];

    if (singleSessionId) {
      const { data } = await sb
        .from('sessions')
        .select(`
          id, trainer_id, client_name, client_whatsapp, completed_at,
          review_request_sent_at,
          trainers (
            id, name, slug, locale, plan
          )
        `)
        .eq('id', singleSessionId)
        .eq('status', 'complete')
        .is('review_request_sent_at', null)
        .single();

      if (data) sessions = [data];
    } else {
      // Cron sweep: sessions completed 1.5–3h ago with no review request sent
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();

      const { data } = await sb
        .from('sessions')
        .select(`
          id, trainer_id, client_name, client_whatsapp, completed_at,
          review_request_sent_at,
          trainers (
            id, name, slug, locale, plan
          )
        `)
        .eq('status', 'complete')
        .gte('completed_at', fourHoursAgo)
        .lte('completed_at', twoHoursAgo)
        .is('review_request_sent_at', null)
        .not('client_whatsapp', 'is', null);

      sessions = data ?? [];
    }

    let sent = 0;
    let skipped = 0;

    for (const session of sessions) {
      const trainer = session.trainers as Record<string, unknown>;
      if (!trainer) { skipped++; continue; }

      // Only Pro trainers get automated review harvesting
      if (trainer.plan !== 'pro') { skipped++; continue; }

      if (!session.client_whatsapp) { skipped++; continue; }

      const market = getMarket(String(trainer.locale ?? 'en'));
      const trainerFirstName = String(trainer.name ?? 'your trainer').split(' ')[0];
      const profileUrl = `https://${market.domain}/${trainer.slug}?review=1`;

      // Locale-aware review request message
      const messages: Record<string, string> = {
        en: `Hey ${session.client_name}! How was your session with ${trainerFirstName} today?\n\nLeave them a quick review — it takes 30 seconds and means everything to them:\n${profileUrl}`,
        es: `¡Hola ${session.client_name}! ¿Qué tal tu sesión con ${trainerFirstName} hoy?\n\nDéjales una reseña rápida — tarda 30 segundos y significa mucho para ellos:\n${profileUrl}`,
        fr: `Bonjour ${session.client_name} ! Comment s'est passée votre séance avec ${trainerFirstName} aujourd'hui ?\n\nLaissez-leur un avis rapide — ça prend 30 secondes et ça compte énormément pour eux :\n${profileUrl}`,
        it: `Ciao ${session.client_name}! Com'è andata la sessione con ${trainerFirstName} oggi?\n\nLascia una recensione veloce — ci vogliono 30 secondi e significa tutto per loro:\n${profileUrl}`,
      };

      const locale = String(trainer.locale ?? 'en');
      const messageText = messages[locale] ?? messages['en'];

      await sendWhatsApp(String(session.client_whatsapp), messageText);

      // Mark as sent
      await sb
        .from('sessions')
        .update({ review_request_sent_at: new Date().toISOString() })
        .eq('id', session.id);

      sent++;
      await new Promise(r => setTimeout(r, 150));
    }

    return new Response(
      JSON.stringify({ ok: true, sent, skipped, total: sessions.length }),
      { status: 200 },
    );

  } catch (err) {
    console.error('Review agent error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
