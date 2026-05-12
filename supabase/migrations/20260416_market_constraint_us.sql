-- Add 'us' to the trainers market CHECK constraint
-- This was applied manually to the live DB on 2026-04-16
-- This migration documents the change and ensures it runs on any future redeploy

ALTER TABLE trainers DROP CONSTRAINT IF EXISTS trainers_market_check;
ALTER TABLE trainers ADD CONSTRAINT trainers_market_check
  CHECK (market IN ('ae', 'uk', 'us', 'es', 'fr', 'it', 'in'));
