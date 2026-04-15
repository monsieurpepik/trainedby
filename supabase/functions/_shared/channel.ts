/**
 * TrainedBy  -  Channel Delivery Helper
 * ─────────────────────────────────────────────────────────────────────────────
 * Sends a message to a trainer via their preferred channel.
 * Used by all autonomous background agents.
 *
 * Channels:
 *   - telegram: sends via Telegram Bot API (TRAINER_BOT_TOKEN)
 *   - whatsapp: sends via Meta WhatsApp Cloud API (WHATSAPP_ACCESS_TOKEN)
 *   - dashboard: stores in trainer_notifications table for dashboard pickup
 */

export interface TrainerChannelConfig {
  channel: 'telegram' | 'whatsapp' | 'dashboard';
  telegram_chat_id?: number | null;
  whatsapp?: string | null;       // trainer's registered WhatsApp number
  trainer_id: string;
}

export interface ChannelMessage {
  text: string;
  parse_mode?: 'Markdown' | 'HTML' | 'plain';
}

// ── Telegram ──────────────────────────────────────────────────────────────────

async function sendTelegram(chatId: number, text: string): Promise<void> {
  const token = Deno.env.get('TRAINER_BOT_TOKEN');
  if (!token) throw new Error('TRAINER_BOT_TOKEN not set');

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    }),
  });
}

// ── WhatsApp ──────────────────────────────────────────────────────────────────

async function sendWhatsApp(to: string, text: string): Promise<void> {
  const token = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
  const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
  if (!token || !phoneNumberId) throw new Error('WhatsApp credentials not set');

  // Normalise number: ensure it starts with country code, no +
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

// ── Dashboard notification (fallback) ─────────────────────────────────────────

async function sendDashboardNotification(
  trainerId: string,
  text: string,
  agentName: string,
): Promise<void> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  await fetch(`${supabaseUrl}/rest/v1/trainer_notifications`, {
    method: 'POST',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({
      trainer_id: trainerId,
      agent: agentName,
      message: text,
      read: false,
      created_at: new Date().toISOString(),
    }),
  });
}

// ── Main delivery function ────────────────────────────────────────────────────

/**
 * Send a message to a trainer via their preferred channel.
 * Falls back to dashboard notification if the preferred channel is not configured.
 */
export async function sendToTrainer(
  config: TrainerChannelConfig,
  message: ChannelMessage,
  agentName = 'agent',
): Promise<void> {
  const { channel, telegram_chat_id, whatsapp, trainer_id } = config;

  try {
    if (channel === 'telegram' && telegram_chat_id) {
      await sendTelegram(telegram_chat_id, message.text);
      return;
    }

    if (channel === 'whatsapp' && whatsapp) {
      await sendWhatsApp(whatsapp, message.text);
      return;
    }

    // Fallback: dashboard notification
    await sendDashboardNotification(trainer_id, message.text, agentName);

  } catch (err) {
    // Always try dashboard as last resort
    try {
      await sendDashboardNotification(trainer_id, message.text, agentName);
    } catch {
      // Silently fail  -  we don't want agent errors to bubble up
    }
    throw err;
  }
}

// ── Batch delivery ────────────────────────────────────────────────────────────

/**
 * Send the same message to multiple trainers.
 * Used by cron-triggered agents (Stats Reporter, Content Agent, etc.)
 */
export async function sendToTrainers(
  trainers: TrainerChannelConfig[],
  getMessage: (config: TrainerChannelConfig) => ChannelMessage,
  agentName: string,
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const t of trainers) {
    try {
      const msg = getMessage(t);
      await sendToTrainer(t, msg, agentName);
      sent++;
      // Rate limit: 1 message per 100ms to avoid API throttling
      await new Promise(r => setTimeout(r, 100));
    } catch {
      failed++;
    }
  }

  return { sent, failed };
}
