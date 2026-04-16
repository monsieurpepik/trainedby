-- Add citations column to blog_posts for Perplexity-sourced URLs
-- Idempotent: safe to run multiple times

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS citations TEXT[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN blog_posts.citations IS
  'Source URLs returned by Perplexity sonar-pro during research step. Empty array for posts generated without research.';
