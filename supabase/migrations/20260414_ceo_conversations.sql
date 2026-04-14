-- CEO conversation memory table
-- Stores conversation history between the CEO bot and the founder
CREATE TABLE IF NOT EXISTS public.ceo_conversations (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id     TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS ceo_conversations_chat_id_idx ON public.ceo_conversations (chat_id, created_at DESC);

-- Enable RLS (only service role can access)
ALTER TABLE public.ceo_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON public.ceo_conversations FOR ALL USING (auth.role() = 'service_role');

COMMENT ON TABLE public.ceo_conversations IS 'CEO bot conversation history for memory/context';
