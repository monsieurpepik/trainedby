-- ─────────────────────────────────────────────────────────────────────────────
-- Agent v2 Infrastructure
-- Supports: WOW moment, Package Renewal, Review Harvester,
--           Price Benchmarking, Dead Lead Reactivation
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Trainers table additions ───────────────────────────────────────────────

ALTER TABLE trainers
  ADD COLUMN IF NOT EXISTS wow_sent_at        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS profile_complete   BOOLEAN DEFAULT FALSE;

-- ── 2. Sessions table ─────────────────────────────────────────────────────────
-- Tracks individual training sessions for review harvesting and booking prep.

CREATE TABLE IF NOT EXISTS sessions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id              UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  client_name             TEXT NOT NULL,
  client_whatsapp         TEXT,
  status                  TEXT NOT NULL DEFAULT 'scheduled'
                            CHECK (status IN ('scheduled','complete','cancelled','no-show')),
  scheduled_at            TIMESTAMPTZ,
  completed_at            TIMESTAMPTZ,
  notes                   TEXT,
  review_request_sent_at  TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sessions_trainer_id_idx   ON sessions(trainer_id);
CREATE INDEX IF NOT EXISTS sessions_status_idx       ON sessions(status);
CREATE INDEX IF NOT EXISTS sessions_completed_at_idx ON sessions(completed_at);

-- ── 3. Client packages table ──────────────────────────────────────────────────
-- Tracks session packages sold to clients for renewal alert agent.

CREATE TABLE IF NOT EXISTS client_packages (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id              UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  client_name             TEXT NOT NULL,
  client_whatsapp         TEXT,
  package_name            TEXT NOT NULL,
  total_sessions          INT NOT NULL DEFAULT 8,
  sessions_remaining      INT NOT NULL DEFAULT 8,
  price_per_session       NUMERIC(10,2),
  active                  BOOLEAN DEFAULT TRUE,
  renewal_alert_sent_at   TIMESTAMPTZ,
  started_at              TIMESTAMPTZ DEFAULT NOW(),
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS client_packages_trainer_id_idx    ON client_packages(trainer_id);
CREATE INDEX IF NOT EXISTS client_packages_sessions_remaining_idx
  ON client_packages(sessions_remaining) WHERE active = TRUE;

-- ── 4. Leads table additions ──────────────────────────────────────────────────

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS reactivation_sent_at TIMESTAMPTZ;

-- ── 5. Enable pg_cron extension (if not already enabled) ─────────────────────

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ── 6. Cron schedules ─────────────────────────────────────────────────────────

-- Review harvester: every 30 minutes, sweep sessions completed 2h ago
SELECT cron.schedule(
  'agent-review-sweep',
  '*/30 * * * *',
  $$
    SELECT net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/agent-review',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb
    );
  $$
);

-- Package renewal: daily at 8am UTC
SELECT cron.schedule(
  'agent-renewal-daily',
  '0 8 * * *',
  $$
    SELECT net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/agent-renewal',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb
    );
  $$
);

-- Price benchmarking: first Monday of each month at 9am UTC
SELECT cron.schedule(
  'agent-pricing-monthly',
  '0 9 1-7 * 1',
  $$
    SELECT net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/agent-pricing',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb
    );
  $$
);

-- Dead lead reactivation: 1st of each month at 10am UTC
SELECT cron.schedule(
  'agent-reactivation-monthly',
  '0 10 1 * *',
  $$
    SELECT net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/agent-reactivation',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb
    );
  $$
);

-- ── 7. DB webhook trigger: WOW moment on profile_complete = true ──────────────
-- The actual webhook registration is done via Supabase Dashboard or CLI.
-- This function is called by the webhook when profile_complete changes to true.

CREATE OR REPLACE FUNCTION notify_profile_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.profile_complete = TRUE AND (OLD.profile_complete IS NULL OR OLD.profile_complete = FALSE) THEN
    PERFORM net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/agent-wow',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object('trainer_id', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_complete ON trainers;
CREATE TRIGGER on_profile_complete
  AFTER UPDATE OF profile_complete ON trainers
  FOR EACH ROW EXECUTE FUNCTION notify_profile_complete();

-- ── 8. DB webhook trigger: renewal alert when sessions_remaining hits 2 ───────

CREATE OR REPLACE FUNCTION notify_renewal_alert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sessions_remaining = 2 AND OLD.sessions_remaining > 2 AND NEW.active = TRUE THEN
    PERFORM net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/agent-renewal',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object('package_id', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_sessions_remaining_low ON client_packages;
CREATE TRIGGER on_sessions_remaining_low
  AFTER UPDATE OF sessions_remaining ON client_packages
  FOR EACH ROW EXECUTE FUNCTION notify_renewal_alert();

-- ── 9. DB webhook trigger: review harvester when session marked complete ──────

CREATE OR REPLACE FUNCTION notify_session_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'complete' AND OLD.status != 'complete' THEN
    -- Schedule review request 2 hours later via pg_cron one-shot
    PERFORM cron.schedule(
      'review-' || NEW.id::text,
      date_trunc('minute', NOW() + interval '2 hours'),
      format(
        $$
          SELECT net.http_post(
            url := %L || '/functions/v1/agent-review',
            headers := jsonb_build_object(
              'Authorization', 'Bearer ' || %L,
              'Content-Type', 'application/json'
            ),
            body := jsonb_build_object('session_id', %L)
          );
          SELECT cron.unschedule('review-%s');
        $$,
        current_setting('app.supabase_url'),
        current_setting('app.service_role_key'),
        NEW.id::text,
        NEW.id::text
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_session_complete ON sessions;
CREATE TRIGGER on_session_complete
  AFTER UPDATE OF status ON sessions
  FOR EACH ROW EXECUTE FUNCTION notify_session_complete();

-- ── 10. Helper: mark profile as complete when key fields are filled ───────────

CREATE OR REPLACE FUNCTION check_profile_complete()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_complete := (
    NEW.photo_url IS NOT NULL AND
    NEW.bio IS NOT NULL AND length(NEW.bio) > 40 AND
    NEW.specialties IS NOT NULL AND jsonb_array_length(NEW.specialties::jsonb) > 0 AND
    NEW.city IS NOT NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_trainer_update_check_complete ON trainers;
CREATE TRIGGER on_trainer_update_check_complete
  BEFORE UPDATE ON trainers
  FOR EACH ROW EXECUTE FUNCTION check_profile_complete();
