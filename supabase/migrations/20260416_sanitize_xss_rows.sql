-- Migration: sanitize_xss_rows
-- Removes any stored XSS payloads from the trainers.name column.
-- The register-trainer edge function already sanitizes on insert;
-- this cleans up any rows that were inserted before that protection was added.

-- Strip HTML tags from trainer names
UPDATE trainers
SET name = regexp_replace(name, '<[^>]*>', '', 'g')
WHERE name ~ '<[^>]*>';

-- Remove rows where name is empty or only whitespace after stripping
DELETE FROM trainers
WHERE trim(name) = '' OR name IS NULL;

-- Add a DB-level check constraint to prevent future XSS via direct SQL
-- (belt-and-suspenders alongside the edge function sanitization)
ALTER TABLE trainers
  ADD CONSTRAINT trainers_name_no_html
  CHECK (name !~ '<[^>]*>');
