-- supabase/migrations/20260520_phase2_video_library.sql

-- Add subscription price field to trainers
-- NOTE: mux_signing_key_id and mux_signing_private_key are intentionally omitted.
-- Phase 2 uses global Supabase secrets (MUX_SIGNING_KEY_ID, MUX_SIGNING_PRIVATE_KEY).
-- Storing RSA private keys as plaintext DB columns is a security risk.
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS subscription_price_cents int;

-- Coach subscriptions (monthly recurring, Stripe Billing)
CREATE TABLE IF NOT EXISTS coach_subscriptions (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id              uuid REFERENCES trainers(id) ON DELETE CASCADE NOT NULL,
  subscriber_id           uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id  text NOT NULL UNIQUE,
  stripe_customer_id      text NOT NULL,
  status                  text NOT NULL DEFAULT 'active',
  price_cents             int NOT NULL,
  current_period_end      timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now(),
  UNIQUE(trainer_id, subscriber_id)
);

ALTER TABLE coach_subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'coach_subscriptions' AND constraint_name = 'coach_subscriptions_status_check'
  ) THEN
    ALTER TABLE coach_subscriptions ADD CONSTRAINT coach_subscriptions_status_check
      CHECK (status IN ('active', 'past_due', 'canceled', 'trialing', 'unpaid', 'incomplete', 'incomplete_expired'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'coach_subscriptions' AND policyname = 'subscriber sees own subscriptions') THEN
    CREATE POLICY "subscriber sees own subscriptions"
      ON coach_subscriptions FOR SELECT
      USING (auth.uid() = subscriber_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'coach_subscriptions' AND policyname = 'trainer sees their subscriber list') THEN
    CREATE POLICY "trainer sees their subscriber list"
      ON coach_subscriptions FOR SELECT
      USING (auth.jwt()->>'email' = (SELECT email FROM trainers WHERE id = trainer_id));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'coach_subscriptions' AND policyname = 'service role full access to coach_subscriptions') THEN
    CREATE POLICY "service role full access to coach_subscriptions"
      ON coach_subscriptions FOR ALL
      TO service_role
      USING (true) WITH CHECK (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS coach_subscriptions_trainer_id_idx ON coach_subscriptions(trainer_id);
CREATE INDEX IF NOT EXISTS coach_subscriptions_subscriber_id_idx ON coach_subscriptions(subscriber_id);

-- Videos (VOD library, hosted on Mux)
CREATE TABLE IF NOT EXISTS videos (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id        uuid REFERENCES trainers(id) ON DELETE CASCADE NOT NULL,
  title             text NOT NULL,
  description       text,
  mux_upload_id     text,
  mux_asset_id      text,
  mux_playback_id   text,
  duration_seconds  int,
  thumbnail_url     text,
  is_free           boolean NOT NULL DEFAULT false,
  status            text NOT NULL DEFAULT 'processing',
  created_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'videos' AND constraint_name = 'videos_status_check'
  ) THEN
    ALTER TABLE videos ADD CONSTRAINT videos_status_check
      CHECK (status IN ('processing', 'ready', 'errored'));
  END IF;
END $$;

-- All ready videos are metadata-visible (thumbnail, title, duration)
-- Playback gating for non-free videos is handled at app level via signed tokens
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'videos' AND policyname = 'ready videos visible to all') THEN
    CREATE POLICY "ready videos visible to all"
      ON videos FOR SELECT
      USING (status = 'ready');
  END IF;
END $$;

-- Trainers see all their own videos (including processing/errored)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'videos' AND policyname = 'trainer sees own videos') THEN
    CREATE POLICY "trainer sees own videos"
      ON videos FOR SELECT
      USING (trainer_id = (SELECT id FROM trainers WHERE email = auth.jwt()->>'email'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'videos' AND policyname = 'service role full access to videos') THEN
    CREATE POLICY "service role full access to videos"
      ON videos FOR ALL
      TO service_role
      USING (true) WITH CHECK (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS videos_trainer_id_idx ON videos(trainer_id);
CREATE INDEX IF NOT EXISTS videos_status_idx ON videos(status);
