-- TrainedBy — Trainer AI Assistant Schema
-- ─────────────────────────────────────────────────────────────────────────────
-- Adds:
--   1. assistant_conversations table — persists chat history per trainer per channel
--   2. trainer channel preference columns — assistant_channel, telegram_chat_id,
--      telegram_username, telegram_link_token

-- ── 1. Conversation history ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS assistant_conversations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id       UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  conversation_id  TEXT NOT NULL,          -- 'default' | 'wa_<phone>' | 'tg_<chatId>'
  role             TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content          TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_asst_conv_trainer_conv
  ON assistant_conversations (trainer_id, conversation_id, created_at);

-- RLS: trainers can only read their own conversations
ALTER TABLE assistant_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trainer_read_own_conversations"
  ON assistant_conversations FOR SELECT
  USING (trainer_id = auth.uid());

CREATE POLICY "service_role_all_conversations"
  ON assistant_conversations FOR ALL
  USING (auth.role() = 'service_role');

-- ── 2. Trainer channel preference columns ────────────────────────────────────

ALTER TABLE trainers
  ADD COLUMN IF NOT EXISTS assistant_channel    TEXT DEFAULT 'dashboard'
    CHECK (assistant_channel IN ('dashboard', 'whatsapp', 'telegram')),
  ADD COLUMN IF NOT EXISTS telegram_chat_id     BIGINT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS telegram_username    TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS telegram_link_token  TEXT DEFAULT NULL;

-- Unique index so two trainers can't accidentally share a Telegram chat
CREATE UNIQUE INDEX IF NOT EXISTS idx_trainers_telegram_chat_id
  ON trainers (telegram_chat_id)
  WHERE telegram_chat_id IS NOT NULL;

-- ── 3. Token generation helper ───────────────────────────────────────────────
-- Called from the dashboard to generate a one-time Telegram link token.
-- Returns the token so the frontend can display it.

CREATE OR REPLACE FUNCTION generate_telegram_link_token(p_trainer_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token TEXT;
BEGIN
  -- Generate a short readable token (8 hex chars)
  v_token := encode(gen_random_bytes(4), 'hex');

  UPDATE trainers
  SET telegram_link_token = v_token
  WHERE id = p_trainer_id;

  RETURN v_token;
END;
$$;
