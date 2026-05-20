-- supabase/migrations/20260520_phase2_video_library.sql

-- Add subscription + Mux signing key fields to trainers
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS subscription_price_cents int;
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS mux_signing_key_id text;
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS mux_signing_private_key text;

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

CREATE POLICY "subscriber sees own subscriptions"
  ON coach_subscriptions FOR SELECT
  USING (auth.uid() = subscriber_id);

CREATE POLICY "trainer sees their subscriber list"
  ON coach_subscriptions FOR SELECT
  USING (auth.email() = (SELECT email FROM trainers WHERE id = trainer_id));

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

-- All ready videos are metadata-visible (thumbnail, title, duration)
-- Playback gating for non-free videos is handled at app level via signed tokens
CREATE POLICY "ready videos visible to all"
  ON videos FOR SELECT
  USING (status = 'ready');

-- Trainers see all their own videos (including processing/errored)
CREATE POLICY "trainer sees own videos"
  ON videos FOR SELECT
  USING (trainer_id = (SELECT id FROM trainers WHERE email = auth.email()));

CREATE INDEX IF NOT EXISTS videos_trainer_id_idx ON videos(trainer_id);
