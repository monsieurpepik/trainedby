-- TrainedBy  -  Magic Links Security Hardening
-- ─────────────────────────────────────────────────────────────────────────────
-- Ensures the magic_links table enforces single-use and expiry.
-- Safe to run even if columns already exist (uses IF NOT EXISTS / DO NOTHING).

-- Create the table if it doesn't exist yet (idempotent)
CREATE TABLE IF NOT EXISTS magic_links (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  token       TEXT NOT NULL UNIQUE,
  trainer_id  UUID REFERENCES trainers(id) ON DELETE CASCADE,
  used        BOOLEAN NOT NULL DEFAULT false,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '15 minutes'),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add columns if they were missing on an older schema
ALTER TABLE magic_links
  ADD COLUMN IF NOT EXISTS used       BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '15 minutes');

-- Index for the validation query pattern:
-- .eq("token", token).eq("used", false).gt("expires_at", now)
CREATE INDEX IF NOT EXISTS idx_magic_links_token_active
  ON magic_links (token, used, expires_at)
  WHERE used = false;

-- Expire old tokens automatically (optional cleanup  -  keeps the table lean)
-- Runs via pg_cron every hour, deletes tokens older than 24h
SELECT cron.schedule(
  'magic-links-cleanup',
  '0 * * * *',
  $$
  DELETE FROM magic_links
  WHERE expires_at < now() - interval '24 hours';
  $$
) ON CONFLICT (jobname) DO UPDATE SET schedule = EXCLUDED.schedule;

-- RLS: trainers can only see their own magic links
ALTER TABLE magic_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "service_role_all_magic_links"
  ON magic_links FOR ALL
  USING (auth.role() = 'service_role');
