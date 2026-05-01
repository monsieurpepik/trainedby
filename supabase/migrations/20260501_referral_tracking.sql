-- Add referral tracking column to trainers table
ALTER TABLE trainers
  ADD COLUMN IF NOT EXISTS referred_by_slug TEXT DEFAULT NULL;

-- Index for querying referral chains (e.g. "how many did @sarah refer?")
CREATE INDEX IF NOT EXISTS idx_trainers_referred_by_slug
  ON trainers (referred_by_slug)
  WHERE referred_by_slug IS NOT NULL;

COMMENT ON COLUMN trainers.referred_by_slug IS
  'Slug of the trainer who referred this signup via /join?ref=<slug>';
