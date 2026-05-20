-- supabase/migrations/20260521_phase5_cohorts.sql
-- NOTE: cohorts table is created before cohort_members, so cohorts_select_member
-- policy (which references cohort_members) is applied after cohort_members is created.
-- Trainer identity uses email = auth.jwt()->>'email' because trainers table has no user_id FK.

-- Step 1: cohorts (service_role policy only — member policy added after cohort_members exists)
CREATE TABLE IF NOT EXISTS cohorts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id      uuid REFERENCES trainers(id) ON DELETE CASCADE NOT NULL,
  live_session_id uuid REFERENCES live_sessions(id) ON DELETE CASCADE NOT NULL UNIQUE,
  title           text NOT NULL,
  starts_at       timestamptz NOT NULL DEFAULT now(),
  ends_at         timestamptz NOT NULL,
  status          text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cohorts_dates_check CHECK (ends_at > starts_at)
);
CREATE INDEX IF NOT EXISTS cohorts_trainer_idx ON cohorts(trainer_id);
CREATE INDEX IF NOT EXISTS cohorts_status_idx ON cohorts(status);
ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;

DO $outer$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cohorts' AND policyname = 'service role full access to cohorts') THEN
    CREATE POLICY "service role full access to cohorts" ON cohorts FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $outer$;

-- Step 2: cohort_members
CREATE TABLE IF NOT EXISTS cohort_members (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id  uuid REFERENCES cohorts(id) ON DELETE CASCADE NOT NULL,
  user_id    uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  joined_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(cohort_id, user_id)
);
CREATE INDEX IF NOT EXISTS cohort_members_cohort_idx ON cohort_members(cohort_id);
CREATE INDEX IF NOT EXISTS cohort_members_user_idx ON cohort_members(user_id);
ALTER TABLE cohort_members ENABLE ROW LEVEL SECURITY;

DO $outer$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cohort_members' AND policyname = 'cohort_members_select_own') THEN
    CREATE POLICY "cohort_members_select_own" ON cohort_members FOR SELECT
      USING (
        user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM cohorts
          WHERE cohorts.id = cohort_members.cohort_id
            AND cohorts.trainer_id IN (
              SELECT id FROM trainers WHERE email = (auth.jwt() ->> 'email')
            )
        )
      );
  END IF;
END $outer$;

DO $outer$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cohort_members' AND policyname = 'service role full access to cohort_members') THEN
    CREATE POLICY "service role full access to cohort_members" ON cohort_members FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $outer$;

-- Step 3: cohorts_select_member (cohort_members now exists)
DO $outer$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cohorts' AND policyname = 'cohorts_select_member') THEN
    CREATE POLICY "cohorts_select_member" ON cohorts FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM cohort_members
          WHERE cohort_members.cohort_id = cohorts.id
            AND cohort_members.user_id = auth.uid()
        )
        OR trainer_id IN (
          SELECT id FROM trainers WHERE email = (auth.jwt() ->> 'email')
        )
      );
  END IF;
END $outer$;

-- Step 4: cohort_rooms
CREATE TABLE IF NOT EXISTS cohort_rooms (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id       uuid REFERENCES cohorts(id) ON DELETE CASCADE NOT NULL,
  mux_playback_id text,
  status          text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  opened_at       timestamptz NOT NULL DEFAULT now(),
  closed_at       timestamptz
);
CREATE INDEX IF NOT EXISTS cohort_rooms_cohort_idx ON cohort_rooms(cohort_id);
CREATE INDEX IF NOT EXISTS cohort_rooms_status_idx ON cohort_rooms(status);
ALTER TABLE cohort_rooms ENABLE ROW LEVEL SECURITY;

DO $outer$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cohort_rooms' AND policyname = 'cohort_rooms_select_member') THEN
    CREATE POLICY "cohort_rooms_select_member" ON cohort_rooms FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM cohort_members
          WHERE cohort_members.cohort_id = cohort_rooms.cohort_id
            AND cohort_members.user_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM cohorts
          JOIN trainers ON cohorts.trainer_id = trainers.id
          WHERE cohorts.id = cohort_rooms.cohort_id
            AND trainers.email = (auth.jwt() ->> 'email')
        )
      );
  END IF;
END $outer$;

DO $outer$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cohort_rooms' AND policyname = 'service role full access to cohort_rooms') THEN
    CREATE POLICY "service role full access to cohort_rooms" ON cohort_rooms FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $outer$;

-- Step 5: cohort_messages
CREATE TABLE IF NOT EXISTS cohort_messages (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id    uuid REFERENCES cohorts(id) ON DELETE CASCADE NOT NULL,
  user_id      uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  display_name text NOT NULL,
  text         text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS cohort_messages_created_idx ON cohort_messages(cohort_id, created_at DESC);
ALTER TABLE cohort_messages ENABLE ROW LEVEL SECURITY;

DO $outer$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cohort_messages' AND policyname = 'cohort_messages_select_member') THEN
    CREATE POLICY "cohort_messages_select_member" ON cohort_messages FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM cohort_members
          WHERE cohort_members.cohort_id = cohort_messages.cohort_id
            AND cohort_members.user_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM cohorts
          JOIN trainers ON cohorts.trainer_id = trainers.id
          WHERE cohorts.id = cohort_messages.cohort_id
            AND trainers.email = (auth.jwt() ->> 'email')
        )
      );
  END IF;
END $outer$;

DO $outer$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cohort_messages' AND policyname = 'cohort_messages_insert_member') THEN
    CREATE POLICY "cohort_messages_insert_member" ON cohort_messages FOR INSERT
      WITH CHECK (
        user_id = auth.uid() AND (
          EXISTS (
            SELECT 1 FROM cohort_members
            WHERE cohort_members.cohort_id = cohort_messages.cohort_id
              AND cohort_members.user_id = auth.uid()
          )
          OR EXISTS (
            SELECT 1 FROM cohorts
            JOIN trainers ON cohorts.trainer_id = trainers.id
            WHERE cohorts.id = cohort_messages.cohort_id
              AND trainers.email = (auth.jwt() ->> 'email')
          )
        )
      );
  END IF;
END $outer$;

DO $outer$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cohort_messages' AND policyname = 'service role full access to cohort_messages') THEN
    CREATE POLICY "service role full access to cohort_messages" ON cohort_messages FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $outer$;

-- pg_cron: mark cohorts as completed daily when ends_at has passed
DO $outer$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule('complete-expired-cohorts');
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $outer$;

DO $outer$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'complete-expired-cohorts',
      '0 3 * * *',
      $$UPDATE cohorts SET status = 'completed' WHERE ends_at < now() AND status = 'active'$$
    );
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $outer$;
