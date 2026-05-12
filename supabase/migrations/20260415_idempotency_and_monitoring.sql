-- ============================================================
-- TrainedBy  -  Idempotency & Monitoring Migration
-- 2026-04-15
-- ============================================================
-- Prevents double-processing of Stripe and Razorpay webhooks
-- when payment providers retry failed deliveries.

-- ── 1. Processed webhook events (idempotency) ────────────────
CREATE TABLE IF NOT EXISTS processed_webhook_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id     TEXT NOT NULL UNIQUE,   -- Stripe event ID or Razorpay payment ID
  event_type   TEXT NOT NULL,          -- e.g. 'checkout.session.completed'
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups on event_id
CREATE INDEX IF NOT EXISTS idx_processed_webhook_events_event_id
  ON processed_webhook_events (event_id);

-- Auto-clean events older than 30 days (Stripe retries max 3 days)
CREATE OR REPLACE FUNCTION cleanup_old_webhook_events() RETURNS void AS $$
BEGIN
  DELETE FROM processed_webhook_events
  WHERE processed_at < now() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (requires pg_cron)
DO $outer$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'cleanup-webhook-events',
      '0 4 * * *',  -- Daily at 04:00 UTC
      $cron$ SELECT cleanup_old_webhook_events(); $cron$
    );
  END IF;
END $outer$;

-- ── 2. Email send log ─────────────────────────────────────────
-- Tracks all lifecycle emails sent, for deduplication and analytics
CREATE TABLE IF NOT EXISTS email_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  subject    TEXT,
  sent_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  success    BOOLEAN NOT NULL DEFAULT true,
  market     TEXT DEFAULT 'ae'
);

CREATE INDEX IF NOT EXISTS idx_email_log_trainer
  ON email_log (trainer_id, type, sent_at DESC);

-- ── 3. RLS ────────────────────────────────────────────────────
ALTER TABLE processed_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

-- Service role only (edge functions use service role key)
-- No public access needed for these tables
