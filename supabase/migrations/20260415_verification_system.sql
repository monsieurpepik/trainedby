-- ─── Verification System Migration ───────────────────────────────────────────
-- Creates cert_reviews table and adds verification columns to trainers table.
-- Run: supabase db push --project-ref mezhtdbfyvkshpuplqqw

-- ─── 1. Add verification columns to trainers ──────────────────────────────────
ALTER TABLE trainers
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified','pending','verified','name_mismatch','not_found','lapsed','rejected','manual_review_required')),
  ADD COLUMN IF NOT EXISTS verification_method TEXT
    CHECK (verification_method IN ('register','cert_upload','manual')),
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS market TEXT DEFAULT 'ae'
    CHECK (market IN ('ae','uk','in','com')),
  ADD COLUMN IF NOT EXISTS reps_number TEXT,
  ADD COLUMN IF NOT EXISTS reps_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS reps_level TEXT;

-- ─── 2. cert_reviews table ────────────────────────────────────────────────────
-- Stores every certificate upload and Claude Vision analysis result.
-- Pending rows appear in the admin verification queue.
CREATE TABLE IF NOT EXISTS cert_reviews (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id          UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  cert_image_url      TEXT,
  cert_number         TEXT,
  issuing_body        TEXT,
  expiry_date         DATE,
  extracted_name      TEXT,
  claude_decision     TEXT CHECK (claude_decision IN ('approve','manual_review','reject')),
  claude_confidence   TEXT CHECK (claude_confidence IN ('high','medium','low')),
  claude_reasoning    TEXT,
  name_match          BOOLEAN,
  cert_match          BOOLEAN,
  final_status        TEXT DEFAULT 'pending'
    CHECK (final_status IN ('pending','verified','rejected')),
  reviewed_by         TEXT,
  reviewed_at         TIMESTAMPTZ,
  reviewer_note       TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Index for the admin queue (pending items, newest first)
CREATE INDEX IF NOT EXISTS idx_cert_reviews_pending
  ON cert_reviews (created_at DESC)
  WHERE final_status = 'pending';

-- Index for trainer lookups
CREATE INDEX IF NOT EXISTS idx_cert_reviews_trainer
  ON cert_reviews (trainer_id, created_at DESC);

-- ─── 3. Storage bucket for cert uploads ──────────────────────────────────────
-- Note: Bucket creation must be done via Supabase dashboard or Storage API.
-- Bucket name: trainer-certs (private, 10MB limit, JPEG/PNG/PDF only)
-- Policy: authenticated trainers can INSERT their own certs; admins can SELECT all.

-- ─── 4. RLS policies for cert_reviews ────────────────────────────────────────
ALTER TABLE cert_reviews ENABLE ROW LEVEL SECURITY;

-- Admins (service role) can do everything  -  handled via service role key in edge functions
-- Trainers can read their own reviews only (via anon key + trainer_id match)
CREATE POLICY "trainers_read_own_cert_reviews"
  ON cert_reviews FOR SELECT
  USING (
    trainer_id IN (
      SELECT id FROM trainers WHERE id = trainer_id
    )
  );

-- ─── 5. Scheduled cron for monthly re-verification ───────────────────────────
-- Runs on the 1st of each month at 03:00 UTC (05:00 GST)
-- Requires pg_cron extension (enabled by default on Supabase Pro)
DO $outer$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'monthly-reverify',
      '0 3 1 * *',
      $cron$
        SELECT net.http_post(
          url := current_setting('app.supabase_url') || '/functions/v1/reverify-agent',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.service_role_key')
          ),
          body := '{}'::jsonb
        );
      $cron$
    );
  END IF;
END $outer$;

-- ─── 6. Helper view: verification queue ──────────────────────────────────────
-- Used by admin dashboard to show pending cert reviews with trainer info.
CREATE OR REPLACE VIEW verification_queue AS
  SELECT
    cr.id AS review_id,
    cr.trainer_id,
    t.name AS trainer_name,
    t.email AS trainer_email,
    t.market,
    cr.cert_image_url,
    cr.cert_number,
    cr.issuing_body,
    cr.expiry_date,
    cr.extracted_name,
    cr.claude_decision,
    cr.claude_confidence,
    cr.claude_reasoning,
    cr.name_match,
    cr.cert_match,
    cr.final_status,
    cr.created_at
  FROM cert_reviews cr
  JOIN trainers t ON t.id = cr.trainer_id
  WHERE cr.final_status = 'pending'
  ORDER BY cr.created_at DESC;
