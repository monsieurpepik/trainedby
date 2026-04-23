-- Migration: xss_constraint_applied
-- Date: 2026-04-23
-- Status: XSS rows were cleaned via Python script (apply_xss_migration_v2.py).
--         3 test rows with <script>alert('xss')</script> in name were sanitized.
--
-- This migration adds the DB-level CHECK constraint to prevent future XSS
-- via direct SQL inserts (belt-and-suspenders alongside edge function sanitization).
--
-- NOTE: Run this in the Supabase SQL editor with the service role.
--       The constraint will fail if any dirty rows still exist.

ALTER TABLE trainers
  ADD CONSTRAINT IF NOT EXISTS trainers_name_no_html
  CHECK (name !~ '<[^>]*>');
