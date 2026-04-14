-- ─────────────────────────────────────────────────────────────────────────────
-- TrainedBy Agent OS — Weekly Cron Schedules
-- ─────────────────────────────────────────────────────────────────────────────
-- Uses pg_cron (available in Supabase) to trigger edge functions on schedule.
-- All times are UTC. UAE (GST) = UTC+4.
--
-- Schedule:
--   content-agent  → Sunday 06:00 UTC (10:00 GST)  — weekly blog post
--   growth-agent   → Monday 05:00 UTC (09:00 GST)  — weekly funnel digest
--   meta-agent     → Sunday 16:00 UTC (20:00 GST)  — weekly product memo
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable http extension for calling edge functions
CREATE EXTENSION IF NOT EXISTS http;

-- ── Content Agent: Every Sunday at 06:00 UTC (10:00 GST) ─────────────────────
SELECT cron.schedule(
  'trainedby-content-agent-weekly',
  '0 6 * * 0',  -- Sunday 06:00 UTC
  $$
  SELECT http_post(
    'https://mezhtdbfyvkshpuplqqw.supabase.co/functions/v1/content-agent',
    '{}',
    'application/json'
  );
  $$
);

-- ── Growth Agent: Every Monday at 05:00 UTC (09:00 GST) ──────────────────────
SELECT cron.schedule(
  'trainedby-growth-agent-weekly',
  '0 5 * * 1',  -- Monday 05:00 UTC
  $$
  SELECT http_post(
    'https://mezhtdbfyvkshpuplqqw.supabase.co/functions/v1/growth-agent',
    '{"action":"digest"}',
    'application/json'
  );
  $$
);

-- ── Meta Agent: Every Sunday at 16:00 UTC (20:00 GST) ────────────────────────
SELECT cron.schedule(
  'trainedby-meta-agent-weekly',
  '0 16 * * 0',  -- Sunday 16:00 UTC
  $$
  SELECT http_post(
    'https://mezhtdbfyvkshpuplqqw.supabase.co/functions/v1/meta-agent',
    '{}',
    'application/json'
  );
  $$
);

-- Verify schedules were created
SELECT jobname, schedule, command FROM cron.job WHERE jobname LIKE 'trainedby-%';
