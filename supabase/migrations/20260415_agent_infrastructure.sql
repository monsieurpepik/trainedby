-- TrainedBy  -  Autonomous Agent Infrastructure
-- ─────────────────────────────────────────────────────────────────────────────
-- Adds:
--   1. trainer_notifications table  -  dashboard fallback for agent messages
--   2. Calendar columns on trainers (calendly_url, google_calendar_token)
--   3. pg_cron schedules for all 4 cron-triggered agents
--   4. Database webhook triggers for Lead Responder and Booking Prep agents
--   5. agent_runs audit log

-- ── 1. Trainer notifications (dashboard fallback) ─────────────────────────────

CREATE TABLE IF NOT EXISTS trainer_notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id  UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  agent       TEXT NOT NULL,        -- 'lead-responder' | 'followup-agent' | etc.
  message     TEXT NOT NULL,
  read        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trainer_notif_trainer_unread
  ON trainer_notifications (trainer_id, read, created_at DESC);

ALTER TABLE trainer_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trainer_read_own_notifications"
  ON trainer_notifications FOR SELECT
  USING (trainer_id = auth.uid());

CREATE POLICY "trainer_update_own_notifications"
  ON trainer_notifications FOR UPDATE
  USING (trainer_id = auth.uid());

CREATE POLICY "service_role_all_notifications"
  ON trainer_notifications FOR ALL
  USING (auth.role() = 'service_role');

-- ── 2. Calendar columns on trainers ──────────────────────────────────────────

ALTER TABLE trainers
  ADD COLUMN IF NOT EXISTS calendly_url             TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS google_calendar_token    TEXT DEFAULT NULL,  -- OAuth access token (encrypted at rest)
  ADD COLUMN IF NOT EXISTS google_calendar_refresh  TEXT DEFAULT NULL;  -- Refresh token

-- ── 3. Agent runs audit log ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS agent_runs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent       TEXT NOT NULL,
  triggered   TEXT NOT NULL,        -- 'cron' | 'webhook'
  trainers_processed INT DEFAULT 0,
  messages_sent      INT DEFAULT 0,
  errors             INT DEFAULT 0,
  duration_ms        INT DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 4. pg_cron schedules ──────────────────────────────────────────────────────
-- Requires pg_cron extension (enabled in Supabase by default)
-- All times are UTC. Adjust per primary market timezone.
-- UAE (UTC+4): 08:00 local = 04:00 UTC | 19:00 local = 15:00 UTC | 10:00 local = 06:00 UTC
-- UK  (UTC+1): 08:00 local = 07:00 UTC | 19:00 local = 18:00 UTC | 10:00 local = 09:00 UTC
-- We use UTC times that approximate the UAE market (primary market at launch)

-- Follow-up agent: daily at 09:00 UAE time (05:00 UTC)
SELECT cron.schedule(
  'agent-followup-daily',
  '0 5 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/agent-followup',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
) ON CONFLICT (jobname) DO UPDATE SET schedule = EXCLUDED.schedule;

-- Content agent: every Monday at 08:00 UAE time (04:00 UTC)
SELECT cron.schedule(
  'agent-content-weekly',
  '0 4 * * 1',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/agent-content',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
) ON CONFLICT (jobname) DO UPDATE SET schedule = EXCLUDED.schedule;

-- Profile agent: every Sunday at 10:00 UAE time (06:00 UTC)
SELECT cron.schedule(
  'agent-profile-weekly',
  '0 6 * * 0',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/agent-profile',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
) ON CONFLICT (jobname) DO UPDATE SET schedule = EXCLUDED.schedule;

-- Stats reporter: every Sunday at 19:00 UAE time (15:00 UTC)
SELECT cron.schedule(
  'agent-stats-weekly',
  '0 15 * * 0',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/agent-stats',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
) ON CONFLICT (jobname) DO UPDATE SET schedule = EXCLUDED.schedule;

-- ── 5. Database webhook triggers ─────────────────────────────────────────────
-- These call the edge functions directly via pg_net when DB events occur.
-- Requires pg_net extension (enabled in Supabase by default).

-- Lead Responder: fires on new lead INSERT
CREATE OR REPLACE FUNCTION trigger_lead_responder()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/agent-lead-responder',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'leads',
      'record', row_to_json(NEW)
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_lead_insert ON leads;
CREATE TRIGGER on_lead_insert
  AFTER INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION trigger_lead_responder();

-- Booking Prep: fires when lead status changes to 'booked'
CREATE OR REPLACE FUNCTION trigger_booking_prep()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.status = 'booked' AND (OLD.status IS NULL OR OLD.status != 'booked') THEN
    PERFORM net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/agent-booking-prep',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key')
      ),
      body := jsonb_build_object(
        'type', 'UPDATE',
        'table', 'leads',
        'record', row_to_json(NEW),
        'old_record', row_to_json(OLD)
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_lead_booked ON leads;
CREATE TRIGGER on_lead_booked
  AFTER UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION trigger_booking_prep();

-- ── 6. Notification badge helper ─────────────────────────────────────────────
-- Returns unread notification count for a trainer (used by dashboard badge)

CREATE OR REPLACE FUNCTION get_unread_notification_count(p_trainer_id UUID)
RETURNS INT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INT
  FROM trainer_notifications
  WHERE trainer_id = p_trainer_id AND read = false;
$$;
