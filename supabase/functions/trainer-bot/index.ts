/**
 * TrainedBy  -  Trainer Telegram Bot
 * ─────────────────────────────────────────────────────────────────────────────
 * A per-brand Telegram bot that gives Pro trainers access to their AI
 * assistant directly from Telegram.
 *
 * Setup:
 *   1. Create a bot via @BotFather for each brand:
 *      - @TrainedByAssistantBot (UAE/UK/US/India)
 *      - @EntrenAconBot (Spain)
 *      - @CoachEParBot (France)
 *      - @AllenaticOnBot (Italy)
 *   2. Set TRAINER_BOT_TOKEN env var (one per brand, or a comma-separated map)
 *   3. Register webhook: POST https://api.telegram.org/bot<TOKEN>/setWebhook
 *      with url = https://<project>.supabase.co/functions/v1/trainer-bot
 *
 * Trainer identification:
 *   - Trainers link their Telegram account in dashboard settings
 *   - We store their Telegram chat_id in trainers.telegram_chat_id
 *   - On first message, we send a /start flow to link the account
 *
 * Commands:
 *   /start  -  link account or show welcome
 *   /leads  -  show recent leads
 *   /stats  -  show 30-day stats
 *   /help   -  show available commands
 *   (anything else)  -  routed to AI assistant
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../_shared/logger.ts';

const log = createLogger('trainer-bot');

const BOT_TOKEN = () => {
  const t = Deno.env.get('TRAINER_BOT_TOKEN');
  if (!t) throw new Error('TRAINER_BOT_TOKEN not set');
  return t;
};
const SUPABASE_URL = () => Deno.env.get('SUPABASE_URL')!;
const SUPABASE_KEY = () => Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const FUNCTION_BASE = () => Deno.env.get('SUPABASE_URL')!.replace('/rest/v1', '') + '/functions/v1';

// ── Telegram helpers ──────────────────────────────────────────────────────────

async function sendMessage(chatId: number, text: string, parseMode = 'Markdown'): Promise<void> {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN()}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: parseMode,
      disable_web_page_preview: true,
    }),
  });
}

async function sendTyping(chatId: number): Promise<void> {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN()}/sendChatAction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, action: 'typing' }),
  });
}

// ── Trainer lookup ────────────────────────────────────────────────────────────

async function findTrainerByTelegramId(
  sb: ReturnType<typeof createClient>,
  telegramChatId: number,
): Promise<{ id: string; name: string; plan: string; locale: string } | null> {
  const { data } = await sb
    .from('trainers')
    .select('id, name, full_name, plan, locale')
    .eq('telegram_chat_id', telegramChatId)
    .eq('assistant_channel', 'telegram')
    .maybeSingle();

  if (!data) return null;
  return {
    id: data.id,
    name: data.name || data.full_name || 'Trainer',
    plan: data.plan,
    locale: data.locale || 'en',
  };
}

// ── Link account via token ────────────────────────────────────────────────────
// Trainers get a one-time link token from the dashboard, then send /start <token>

async function linkAccount(
  sb: ReturnType<typeof createClient>,
  telegramChatId: number,
  telegramUsername: string | undefined,
  linkToken: string,
): Promise<{ name: string } | null> {
  // Find trainer by link token
  const { data: trainer } = await sb
    .from('trainers')
    .select('id, name, full_name')
    .eq('telegram_link_token', linkToken)
    .maybeSingle();

  if (!trainer) return null;

  // Save the chat_id and clear the token
  await sb
    .from('trainers')
    .update({
      telegram_chat_id: telegramChatId,
      telegram_username: telegramUsername ?? null,
      telegram_link_token: null,
      assistant_channel: 'telegram',
    })
    .eq('id', trainer.id);

  return { name: trainer.name || trainer.full_name || 'Trainer' };
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
      source: 'telegram',
    }),
  });

  if (!res.ok) {
    log.error('Trainer assistant error', { status: res.status });
    return "Sorry, I'm having trouble right now. Please try again in a moment.";
  }

  const data = await res.json();
  return data.reply ?? "I couldn't generate a response. Please try again.";
}

// ── Command handlers ──────────────────────────────────────────────────────────

async function handleStart(
  sb: ReturnType<typeof createClient>,
  chatId: number,
  username: string | undefined,
  args: string,
): Promise<void> {
  if (args) {
    // /start <link_token>  -  account linking flow
    const linked = await linkAccount(sb, chatId, username, args);
    if (linked) {
      await sendMessage(chatId,
        `✅ *Account linked!*\n\nHey ${linked.name} 👋 Your AI assistant is ready.\n\nJust send me a message  -  ask about your leads, get a WhatsApp draft, or request an Instagram caption.\n\nType /help to see what I can do.`
      );
    } else {
      await sendMessage(chatId,
        `❌ *Invalid link token.*\n\nGo to your dashboard → Settings → AI Assistant and generate a new link.`
      );
    }
    return;
  }

  // Check if already linked
  const trainer = await findTrainerByTelegramId(sb, chatId);
  if (trainer) {
    await sendMessage(chatId,
      `👋 Hey ${trainer.name}! Your assistant is ready.\n\nJust send me a message. Type /help for commands.`
    );
  } else {
    await sendMessage(chatId,
      `👋 *Welcome to your TrainedBy AI Assistant.*\n\nTo link your account:\n1. Go to your dashboard\n2. Settings → AI Assistant\n3. Choose Telegram and tap "Generate Link"\n4. Click the link or paste the code here with /start <code>`
    );
  }
}

async function handleHelp(chatId: number, trainerName: string): Promise<void> {
  await sendMessage(chatId,
    `*Your AI Assistant  -  Commands*\n\n` +
    `/leads  -  Show your recent leads\n` +
    `/stats  -  Show your 30-day stats\n` +
    `/help  -  Show this message\n\n` +
    `*Or just talk to me:*\n` +
    `"Draft a WhatsApp reply to Ahmed"\n` +
    `"Write an Instagram caption about leg day"\n` +
    `"Suggest a fat loss package"\n` +
    `"Rewrite my bio"\n` +
    `"How many views did I get this week?"`
  );
}

async function handleLeads(
  sb: ReturnType<typeof createClient>,
  chatId: number,
  trainerId: string,
): Promise<void> {
  const { data } = await sb
    .from('leads')
    .select('name, status, created_at, message')
    .eq('trainer_id', trainerId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (!data || data.length === 0) {
    await sendMessage(chatId, "You have no leads yet. Share your profile link to start getting enquiries.");
    return;
  }

  const lines = data.map((l: { name: string; status: string; created_at: string; message: string }) =>
    `• *${l.name}*  -  ${l.status} (${new Date(l.created_at).toLocaleDateString()})\n  ${l.message ? `"${l.message.substring(0, 60)}${l.message.length > 60 ? '…' : ''}"` : '(no message)'}`
  );

  await sendMessage(chatId, `*Your last ${data.length} leads:*\n\n${lines.join('\n\n')}`);
}

async function handleStats(
  sb: ReturnType<typeof createClient>,
  chatId: number,
  trainerId: string,
): Promise<void> {
  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const { data } = await sb
    .from('profile_events')
    .select('event_type')
    .eq('trainer_id', trainerId)
    .gte('created_at', since);

  const views = data?.filter((e: { event_type: string }) => e.event_type === 'view').length || 0;
  const leads = data?.filter((e: { event_type: string }) => e.event_type === 'lead').length || 0;
  const waTaps = data?.filter((e: { event_type: string }) => e.event_type === 'whatsapp_tap').length || 0;
  const convRate = views > 0 ? ((leads / views) * 100).toFixed(1) : '0';

  await sendMessage(chatId,
    `*Your last 30 days:*\n\n` +
    `👁 Views: *${views}*\n` +
    `📩 Leads: *${leads}*\n` +
    `💬 WhatsApp taps: *${waTaps}*\n` +
    `📈 Conversion rate: *${convRate}%*`
  );
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('OK', { status: 200 });

  let update: Record<string, unknown>;
  try {
    update = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const message = update.message as Record<string, unknown> | undefined;
  if (!message) return new Response('OK', { status: 200 });

  const chatId = (message.chat as Record<string, unknown>)?.id as number;
  const text = (message.text as string) ?? '';
  const username = (message.from as Record<string, unknown>)?.username as string | undefined;

  if (!chatId || !text) return new Response('OK', { status: 200 });

  log.info('Telegram message', { chatId, text: text.substring(0, 50) });

  const sb = createClient(SUPABASE_URL(), SUPABASE_KEY());

  // Parse command
  const isCommand = text.startsWith('/');
  const [rawCommand, ...argParts] = text.split(' ');
  const command = rawCommand.toLowerCase().split('@')[0]; // strip @botname
  const args = argParts.join(' ').trim();

  try {
    // Handle /start regardless of link status
    if (command === '/start') {
      await handleStart(sb, chatId, username, args);
      return new Response('OK', { status: 200 });
    }

    // All other interactions require a linked account
    const trainer = await findTrainerByTelegramId(sb, chatId);

    if (!trainer) {
      await sendMessage(chatId,
        "Your account isn't linked yet. Send /start to connect your TrainedBy profile."
      );
      return new Response('OK', { status: 200 });
    }

    if (trainer.plan !== 'pro' && trainer.plan !== 'premium') {
      await sendMessage(chatId,
        "The AI assistant is available on the Pro plan. Upgrade at your dashboard → Pricing."
      );
      return new Response('OK', { status: 200 });
    }

    if (command === '/help') {
      await handleHelp(chatId, trainer.name);
      return new Response('OK', { status: 200 });
    }

    if (command === '/leads') {
      await handleLeads(sb, chatId, trainer.id);
      return new Response('OK', { status: 200 });
    }

    if (command === '/stats') {
      await handleStats(sb, chatId, trainer.id);
      return new Response('OK', { status: 200 });
    }

    // Free-form message → route to assistant
    await sendTyping(chatId);
    const conversationId = `tg_${chatId}`;
    const reply = await routeToAssistant(trainer.id, text, conversationId);
    await sendMessage(chatId, reply);

  } catch (err) {
    log.exception(err, { step: 'trainer_bot' });
    await sendMessage(chatId, "Something went wrong. Please try again.");
  }

  return new Response('OK', { status: 200 });
});
