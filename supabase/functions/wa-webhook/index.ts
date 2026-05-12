/**
 * TrainedBy  -  WhatsApp Webhook Handler
 * ─────────────────────────────────────────────────────────────────────────────
 * Receives inbound WhatsApp messages via the WhatsApp Business Cloud API
 * (Meta) and routes them to the trainer-assistant.
 *
 * Setup:
 *   1. Create a Meta App at developers.facebook.com
 *   2. Add WhatsApp product, get a phone number
 *   3. Set webhook URL to: https://<project>.supabase.co/functions/v1/wa-webhook
 *   4. Set WHATSAPP_VERIFY_TOKEN and WHATSAPP_ACCESS_TOKEN env vars
 *
 * Trainer identification:
 *   - Trainers register their WhatsApp number in dashboard settings
 *   - We look up the trainer by their registered WhatsApp number
 *   - If not found, we send an onboarding message
 *
 * Conversation routing:
 *   - Each trainer's WhatsApp number maps to a unique conversation_id
 *   - Messages are forwarded to trainer-assistant and the reply is sent back
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../_shared/logger.ts';

const log = createLogger('wa-webhook');

const VERIFY_TOKEN = () => Deno.env.get('WHATSAPP_VERIFY_TOKEN') ?? 'trainedby-wa-verify';
const ACCESS_TOKEN = () => Deno.env.get('WHATSAPP_ACCESS_TOKEN') ?? '';
const SUPABASE_URL = () => Deno.env.get('SUPABASE_URL')!;
const SUPABASE_KEY = () => Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const FUNCTION_BASE = () => Deno.env.get('SUPABASE_URL')!.replace('/rest/v1', '') + '/functions/v1';

// ── Send a WhatsApp message ───────────────────────────────────────────────────

async function sendWhatsApp(to: string, text: string, phoneNumberId: string): Promise<void> {
  const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
  await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  });
}

// ── Look up trainer by WhatsApp number ───────────────────────────────────────

async function findTrainerByWhatsApp(
  sb: ReturnType<typeof createClient>,
  phoneNumber: string,
): Promise<{ id: string; name: string; plan: string; locale: string } | null> {
  // Normalise: strip leading + and spaces
  const normalised = phoneNumber.replace(/^\+/, '').replace(/\s/g, '');

  const { data } = await sb
    .from('trainers')
    .select('id, name, full_name, plan, locale')
    .or(`whatsapp.eq.${normalised},whatsapp.eq.+${normalised},whatsapp.eq.${phoneNumber}`)
    .eq('assistant_channel', 'whatsapp')
    .maybeSingle();

  if (!data) return null;
  return {
    id: data.id,
    name: data.name || data.full_name || 'Trainer',
    plan: data.plan,
    locale: data.locale || 'en',
  };
}

// ── Route message to trainer-assistant ───────────────────────────────────────

async function routeToAssistant(
  trainerId: string,
  message: string,
  conversationId: string,
): Promise<string> {
  const res = await fetch(`${FUNCTION_BASE()}/trainer-assistant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_KEY()}`,
    },
    body: JSON.stringify({
      trainer_id: trainerId,
      message,
      conversation_id: conversationId,
      source: 'whatsapp',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    log.error('Trainer assistant error', { status: res.status, error: err });
    return "Sorry, I'm having trouble right now. Please try again in a moment.";
  }

  const data = await res.json();
  return data.reply ?? "I couldn't generate a response. Please try again.";
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // ── Webhook verification (GET) ────────────────────────────────────────────
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === VERIFY_TOKEN()) {
      log.info('WhatsApp webhook verified');
      return new Response(challenge, { status: 200 });
    }
    return new Response('Forbidden', { status: 403 });
  }

  // ── Inbound message (POST) ────────────────────────────────────────────────
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  // WhatsApp Cloud API payload structure
  const entry = (body.entry as Array<Record<string, unknown>>)?.[0];
  const changes = (entry?.changes as Array<Record<string, unknown>>)?.[0];
  const value = changes?.value as Record<string, unknown>;
  const messages = value?.messages as Array<Record<string, unknown>>;

  if (!messages || messages.length === 0) {
    // Status update or other non-message event  -  acknowledge and ignore
    return new Response('OK', { status: 200 });
  }

  const msg = messages[0];
  const msgType = msg.type as string;
  const fromNumber = msg.from as string;
  const phoneNumberId = (value?.metadata as Record<string, unknown>)?.phone_number_id as string;

  // Only handle text messages for now
  if (msgType !== 'text') {
    log.info('Non-text message received', { type: msgType, from: fromNumber });
    return new Response('OK', { status: 200 });
  }

  const inboundText = ((msg.text as Record<string, unknown>)?.body as string) ?? '';
  if (!inboundText.trim()) return new Response('OK', { status: 200 });

  log.info('WhatsApp message received', { from: fromNumber, length: inboundText.length });

  const sb = createClient(SUPABASE_URL(), SUPABASE_KEY());

  // Look up trainer
  const trainer = await findTrainerByWhatsApp(sb, fromNumber);

  if (!trainer) {
    // Unknown number  -  send onboarding message
    await sendWhatsApp(
      fromNumber,
      "Hi! I don't recognise this number as a registered trainer. To connect your WhatsApp to your AI assistant, go to your dashboard → Settings → AI Assistant and select WhatsApp as your channel.",
      phoneNumberId,
    );
    return new Response('OK', { status: 200 });
  }

  if (trainer.plan !== 'pro' && trainer.plan !== 'premium') {
    await sendWhatsApp(
      fromNumber,
      "The AI assistant is available on the Pro plan. Upgrade at your dashboard → Pricing.",
      phoneNumberId,
    );
    return new Response('OK', { status: 200 });
  }

  // Use the trainer's phone number as the conversation ID (persistent per trainer)
  const conversationId = `wa_${fromNumber}`;

  // Route to assistant
  const reply = await routeToAssistant(trainer.id, inboundText, conversationId);

  // Send reply back via WhatsApp
  await sendWhatsApp(fromNumber, reply, phoneNumberId);

  log.info('WhatsApp reply sent', { to: fromNumber, trainer_id: trainer.id });
  return new Response('OK', { status: 200 });
});
