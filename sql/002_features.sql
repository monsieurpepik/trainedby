-- ============================================================
-- TrainedBy.ae — Migration 002: 10 New Product Features
-- ============================================================

-- 1. SPECIALTY / NICHE TAGS — stored as array on trainers table
ALTER TABLE trainers
  ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS training_modes TEXT[] DEFAULT '{"in-person"}', -- in-person, online, hybrid
  ADD COLUMN IF NOT EXISTS video_intro_url TEXT,
  ADD COLUMN IF NOT EXISTS bio_generated BOOLEAN DEFAULT FALSE;

-- 2. TRANSFORMATION GALLERY — before/after photos with consent
CREATE TABLE IF NOT EXISTS transformations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  before_url TEXT NOT NULL,
  after_url TEXT NOT NULL,
  duration_weeks INTEGER,
  goal_type TEXT, -- weight-loss, muscle-gain, athletic, lifestyle
  client_consent BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transformations_trainer ON transformations(trainer_id);

-- RLS: transformations are publicly readable; only service role can write
ALTER TABLE transformations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read transformations with consent"
  ON transformations FOR SELECT
  USING (client_consent = TRUE);
-- No INSERT/UPDATE/DELETE policy for anon — all writes go through edge functions using service role key

-- 3. SESSION BOOKINGS — direct booking from profile
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  package_id UUID REFERENCES session_packages(id),
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  client_whatsapp TEXT,
  goal TEXT,
  preferred_time TEXT, -- morning, afternoon, evening, flexible
  preferred_days TEXT[], -- mon, tue, wed, thu, fri, sat, sun
  training_mode TEXT DEFAULT 'in-person', -- in-person, online, hybrid
  status TEXT DEFAULT 'pending', -- pending, confirmed, cancelled, completed
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_trainer ON bookings(trainer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- RLS: bookings are private — no public read or write; all access via service role edge functions
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
-- No policies = zero anon access. Service role key bypasses RLS entirely.

-- 4. VERIFIED CLIENT REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id),
  client_name TEXT NOT NULL,
  client_avatar_initials TEXT,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT NOT NULL,
  goal_achieved TEXT, -- what they achieved
  verified BOOLEAN DEFAULT FALSE, -- verified = came through a booking
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_trainer ON reviews(trainer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- RLS: only verified reviews are publicly readable; no public writes
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read verified reviews"
  ON reviews FOR SELECT
  USING (verified = TRUE);
-- No INSERT/UPDATE/DELETE policy for anon — all writes via service role edge functions

-- Aggregate rating on trainers table
ALTER TABLE trainers
  ADD COLUMN IF NOT EXISTS avg_rating NUMERIC(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Function to update trainer rating when review added
CREATE OR REPLACE FUNCTION update_trainer_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE trainers SET
    avg_rating = (SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM reviews WHERE trainer_id = NEW.trainer_id AND verified = TRUE),
    review_count = (SELECT COUNT(*) FROM reviews WHERE trainer_id = NEW.trainer_id AND verified = TRUE)
  WHERE id = NEW.trainer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_trainer_rating ON reviews;
CREATE TRIGGER trg_update_trainer_rating
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_trainer_rating();

-- 5. PROGRESS CHECK-INS — weekly client check-in submissions
CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  weight_kg NUMERIC(5,2),
  mood INTEGER CHECK (mood BETWEEN 1 AND 5), -- 1=struggling, 5=great
  energy INTEGER CHECK (energy BETWEEN 1 AND 5),
  sleep_hours NUMERIC(4,1),
  notes TEXT,
  photo_url TEXT,
  week_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checkins_trainer ON checkins(trainer_id);
CREATE INDEX IF NOT EXISTS idx_checkins_client ON checkins(client_email);

-- RLS: check-ins are private — no public access; all access via service role edge functions
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
-- No policies = zero anon access.

-- 6. WHATSAPP BROADCAST LISTS — trainer sends to all leads
CREATE TABLE IF NOT EXISTS broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  recipient_count INTEGER DEFAULT 0,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_broadcasts_trainer ON broadcasts(trainer_id);

-- RLS: broadcasts are private — no public access
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;
-- No policies = zero anon access.

-- 7. TRAINER AVAILABILITY — for booking calendar
CREATE TABLE IF NOT EXISTS availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  UNIQUE(trainer_id, day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_availability_trainer ON availability(trainer_id);

-- RLS: availability is publicly readable (clients need to see when trainer is free)
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read trainer availability"
  ON availability FOR SELECT
  USING (is_available = TRUE);
-- No public write access

-- 8. RATE LIMITING TABLE — for edge function rate limiting
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,            -- e.g. "submit-lead:ip:1.2.3.4" or "magic-link:email:x@y.com"
  count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(key)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON rate_limits(key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);

-- RLS: rate_limits table is internal only — no public access
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
-- No policies = zero anon access. Service role manages this table.

-- Auto-cleanup old rate limit windows (older than 1 hour)
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- 9. SEED SAMPLE DATA — specialties and reviews for sarah
UPDATE trainers SET
  specialties = ARRAY['Strength Training', 'Fat Loss', 'Muscle Gain', 'HIIT', 'Functional Training'],
  training_modes = ARRAY['in-person', 'online', 'hybrid'],
  avg_rating = 4.9,
  review_count = 3
WHERE slug = 'sarah';

-- Seed sample reviews for sarah
INSERT INTO reviews (trainer_id, client_name, client_avatar_initials, rating, review_text, goal_achieved, verified, featured)
SELECT
  t.id,
  r.client_name,
  r.initials,
  r.rating,
  r.review_text,
  r.goal_achieved,
  TRUE,
  TRUE
FROM trainers t,
(VALUES
  ('Aisha Al Rashid', 'AA', 5, 'Sarah completely transformed my approach to fitness. Lost 12kg in 3 months and actually enjoyed every session. Her knowledge of nutrition alongside training is exceptional.', 'Lost 12kg in 3 months'),
  ('James Mitchell', 'JM', 5, 'Best investment I have made in Dubai. Sarah''s programming is smart, progressive, and she genuinely cares about results. My strength has doubled in 6 months.', 'Doubled strength in 6 months'),
  ('Priya Sharma', 'PS', 5, 'I was nervous about starting with a trainer but Sarah made it so comfortable. She adapted everything to my schedule and goals. Already recommended her to 4 friends.', 'Built consistent gym habit')
) AS r(client_name, initials, rating, review_text, goal_achieved)
WHERE t.slug = 'sarah'
ON CONFLICT DO NOTHING;

-- Seed availability for sarah (Sun-Thu, 6am-8pm)
INSERT INTO availability (trainer_id, day_of_week, start_time, end_time)
SELECT t.id, d.day, '06:00'::TIME, '20:00'::TIME
FROM trainers t, (VALUES (0),(1),(2),(3),(4)) AS d(day)
WHERE t.slug = 'sarah'
ON CONFLICT DO NOTHING;
