-- supabase/migrations/20260519_club_culture_phase1.sql

-- Season columns on clubs
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS season_number int NOT NULL DEFAULT 1;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS parent_club_id uuid REFERENCES clubs(id);
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS public_leaderboard boolean NOT NULL DEFAULT true;

-- Season tracking on club_members
ALTER TABLE club_members ADD COLUMN IF NOT EXISTS season_number int NOT NULL DEFAULT 1;

-- Followers table
CREATE TABLE IF NOT EXISTS club_followers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id     uuid REFERENCES clubs(id) ON DELETE CASCADE NOT NULL,
  user_id     uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  followed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(club_id, user_id)
);

ALTER TABLE club_followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "followers visible to all"
  ON club_followers FOR SELECT USING (true);

CREATE POLICY "user manages own follows"
  ON club_followers FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user deletes own follows"
  ON club_followers FOR DELETE USING (auth.uid() = user_id);

-- Index for fast follower lookups
CREATE INDEX IF NOT EXISTS club_followers_club_id_idx ON club_followers(club_id);
CREATE INDEX IF NOT EXISTS club_followers_user_id_idx ON club_followers(user_id);
