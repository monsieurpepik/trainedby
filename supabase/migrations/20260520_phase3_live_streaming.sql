-- supabase/migrations/20260520_phase3_live_streaming.sql

-- live_sessions
CREATE TABLE IF NOT EXISTS live_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id      uuid REFERENCES trainers(id) ON DELETE CASCADE NOT NULL,
  club_id         uuid REFERENCES clubs(id),
  title           text NOT NULL,
  mux_stream_id   text,
  mux_stream_key  text,
  mux_playback_id text,
  mux_asset_id    text,
  status          text NOT NULL DEFAULT 'scheduled',
  is_season_drop  boolean NOT NULL DEFAULT false,
  drop_tiers      jsonb,
  starts_at       timestamptz,
  ended_at        timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS live_sessions_trainer_id_idx ON live_sessions(trainer_id);
CREATE INDEX IF NOT EXISTS live_sessions_status_idx ON live_sessions(status);
CREATE INDEX IF NOT EXISTS live_sessions_mux_stream_id_idx ON live_sessions(mux_stream_id);

ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'live_sessions' AND policyname = 'live_sessions_select_all') THEN
    CREATE POLICY "live_sessions_select_all" ON live_sessions FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'live_sessions' AND policyname = 'service role full access to live_sessions') THEN
    CREATE POLICY "service role full access to live_sessions" ON live_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- live_attendees
CREATE TABLE IF NOT EXISTS live_attendees (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  live_session_id uuid REFERENCES live_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id         uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  joined_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE(live_session_id, user_id)
);
CREATE INDEX IF NOT EXISTS live_attendees_session_idx ON live_attendees(live_session_id);

ALTER TABLE live_attendees ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'live_attendees' AND policyname = 'live_attendees_select_all') THEN
    CREATE POLICY "live_attendees_select_all" ON live_attendees FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'live_attendees' AND policyname = 'service role full access to live_attendees') THEN
    CREATE POLICY "service role full access to live_attendees" ON live_attendees FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- live_drop_claims
CREATE TABLE IF NOT EXISTS live_drop_claims (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  live_session_id     uuid REFERENCES live_sessions(id) NOT NULL,
  user_id             uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  stripe_checkout_id  text NOT NULL UNIQUE,
  tier_price_cents    int NOT NULL,
  status              text NOT NULL DEFAULT 'pending',
  claimed_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS live_drop_claims_session_idx ON live_drop_claims(live_session_id);
CREATE INDEX IF NOT EXISTS live_drop_claims_user_idx ON live_drop_claims(user_id);

ALTER TABLE live_drop_claims ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'live_drop_claims' AND policyname = 'live_drop_claims_select_own') THEN
    CREATE POLICY "live_drop_claims_select_own" ON live_drop_claims FOR SELECT USING (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'live_drop_claims' AND policyname = 'service role full access to live_drop_claims') THEN
    CREATE POLICY "service role full access to live_drop_claims" ON live_drop_claims FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Atomic tier claim function (prevents overselling via FOR UPDATE row lock)
CREATE OR REPLACE FUNCTION claim_drop_tier(session_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sess live_sessions;
  tiers jsonb;
  tier_idx int := -1;
  tier jsonb;
BEGIN
  SELECT * INTO sess FROM live_sessions WHERE id = session_id FOR UPDATE;
  IF NOT FOUND THEN RETURN json_build_object('error', 'session_not_found'); END IF;
  IF sess.status != 'live' THEN RETURN json_build_object('error', 'session_not_live'); END IF;
  IF NOT sess.is_season_drop THEN RETURN json_build_object('error', 'not_a_season_drop'); END IF;
  tiers := sess.drop_tiers;
  IF tiers IS NULL OR jsonb_array_length(tiers) = 0 THEN
    RETURN json_build_object('error', 'no_tiers_configured');
  END IF;
  FOR i IN 0..jsonb_array_length(tiers)-1 LOOP
    tier := tiers->i;
    IF (tier->>'total_spots')::int = 0 OR (tier->>'claimed')::int < (tier->>'total_spots')::int THEN
      tier_idx := i; EXIT;
    END IF;
  END LOOP;
  IF tier_idx = -1 THEN RETURN json_build_object('error', 'sold_out'); END IF;
  tiers := jsonb_set(tiers, array[tier_idx::text, 'claimed'],
    to_jsonb((tiers->tier_idx->>'claimed')::int + 1));
  UPDATE live_sessions SET drop_tiers = tiers WHERE id = session_id;
  RETURN json_build_object(
    'ok', true,
    'tier_index', tier_idx,
    'tier_price_cents', (tiers->tier_idx->>'price_cents')::int,
    'claimed', (tiers->tier_idx->>'claimed')::int,
    'total_spots', (tiers->tier_idx->>'total_spots')::int,
    'drop_tiers', tiers
  );
END;
$$;
