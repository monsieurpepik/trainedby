-- supabase/migrations/20260518_clubs_schema.sql

-- ============================================================
-- USERS (club members — separate from trainers)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  display_name  TEXT NOT NULL,
  avatar_url    TEXT,
  google_id     TEXT UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own row"
  ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own row"
  ON users FOR UPDATE USING (auth.uid() = id);

-- Trigger: auto-create users row on Google OAuth sign-in
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, avatar_url, google_id)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'sub'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- CLUBS
-- ============================================================
CREATE TABLE IF NOT EXISTS clubs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id       UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  slug             TEXT UNIQUE NOT NULL,
  name             TEXT NOT NULL,
  goal             TEXT NOT NULL,
  duration_days    INT NOT NULL DEFAULT 30,
  is_free          BOOLEAN NOT NULL DEFAULT FALSE,
  price_cents      INT,
  stripe_price_id  TEXT,
  stripe_product_id TEXT,
  max_members      INT,
  starts_at        DATE,
  ends_at          DATE,
  status           TEXT NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft','active','ended')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active clubs"
  ON clubs FOR SELECT USING (status IN ('active','ended'));
CREATE POLICY "Trainer can manage own clubs"
  ON clubs FOR ALL USING (
    trainer_id IN (SELECT id FROM trainers WHERE email = auth.jwt()->>'email')
  );

-- ============================================================
-- CLUB_MEMBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS club_members (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id                  UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id                  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  stripe_payment_intent_id TEXT,
  status                   TEXT NOT NULL DEFAULT 'active'
                           CHECK (status IN ('active','cancelled')),
  UNIQUE (club_id, user_id)
);

ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can read their own memberships"
  ON club_members FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Trainer can read their club members"
  ON club_members FOR SELECT USING (
    club_id IN (
      SELECT id FROM clubs WHERE trainer_id IN (
        SELECT id FROM trainers WHERE email = auth.jwt()->>'email'
      )
    )
  );

-- ============================================================
-- MISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS missions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id           UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  day_number        INT NOT NULL CHECK (day_number BETWEEN 1 AND 365),
  title             TEXT NOT NULL,
  description       TEXT,
  type              TEXT NOT NULL DEFAULT 'other'
                    CHECK (type IN ('run','workout','nutrition','recovery','mindset','other')),
  ai_draft          BOOLEAN NOT NULL DEFAULT TRUE,
  edited_by_trainer BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (club_id, day_number)
);

ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Club members can read missions"
  ON missions FOR SELECT USING (
    club_id IN (
      SELECT club_id FROM club_members WHERE user_id = auth.uid() AND status = 'active'
    )
    OR
    club_id IN (
      SELECT id FROM clubs WHERE trainer_id IN (
        SELECT id FROM trainers WHERE email = auth.jwt()->>'email'
      )
    )
    OR
    club_id IN (SELECT id FROM clubs WHERE status IN ('active','ended'))
  );

-- ============================================================
-- CHECKINS
-- ============================================================
CREATE TABLE IF NOT EXISTS checkins (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id      UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  mission_id   UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source       TEXT NOT NULL DEFAULT 'manual'
               CHECK (source IN ('manual','strava','oura','whoop')),
  proof_url    TEXT,
  note         TEXT,
  streak_day   INT NOT NULL DEFAULT 1,
  UNIQUE (mission_id, user_id)
);

ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone in the club can read checkins"
  ON checkins FOR SELECT USING (
    club_id IN (
      SELECT club_id FROM club_members WHERE user_id = auth.uid() AND status = 'active'
    )
    OR
    club_id IN (
      SELECT id FROM clubs WHERE trainer_id IN (
        SELECT id FROM trainers WHERE email = auth.jwt()->>'email'
      )
    )
  );
CREATE POLICY "Members can insert their own checkins"
  ON checkins FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================
-- CLUB_SHOUTOUTS (trainer feed posts)
-- ============================================================
CREATE TABLE IF NOT EXISTS club_shoutouts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id    UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  text       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE club_shoutouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Club members can read shoutouts"
  ON club_shoutouts FOR SELECT USING (
    club_id IN (
      SELECT club_id FROM club_members WHERE user_id = auth.uid() AND status = 'active'
    )
    OR
    club_id IN (
      SELECT id FROM clubs WHERE trainer_id IN (
        SELECT id FROM trainers WHERE email = auth.jwt()->>'email'
      )
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clubs_trainer ON clubs(trainer_id);
CREATE INDEX IF NOT EXISTS idx_clubs_status ON clubs(status);
CREATE INDEX IF NOT EXISTS idx_club_members_club ON club_members(club_id);
CREATE INDEX IF NOT EXISTS idx_club_members_user ON club_members(user_id);
CREATE INDEX IF NOT EXISTS idx_missions_club_day ON missions(club_id, day_number);
CREATE INDEX IF NOT EXISTS idx_checkins_club_date ON checkins(club_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_checkins_user_club ON checkins(user_id, club_id);
