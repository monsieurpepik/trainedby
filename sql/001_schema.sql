-- ============================================================
-- TrainedBy.ae — Supabase Database Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TRAINERS
-- ============================================================
CREATE TABLE IF NOT EXISTS trainers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  phone           TEXT,
  title           TEXT,
  bio             TEXT,
  avatar_url      TEXT,
  cover_url       TEXT,

  -- Specialties & certs
  specialties     TEXT[] DEFAULT '{}',
  certifications  TEXT[] DEFAULT '{}',

  -- REPs verification
  reps_number     TEXT,
  reps_level      TEXT DEFAULT 'level_3',
  reps_verified   BOOLEAN DEFAULT FALSE,
  reps_verified_at TIMESTAMPTZ,

  -- Stats
  years_experience  INTEGER,
  clients_trained   INTEGER,
  sessions_delivered INTEGER DEFAULT 0,

  -- Location
  locations       TEXT[] DEFAULT '{"gym"}',
  city            TEXT DEFAULT 'Dubai',
  country         TEXT DEFAULT 'AE',

  -- Social
  instagram       TEXT,
  tiktok          TEXT,
  youtube         TEXT,

  -- Availability
  accepting_clients BOOLEAN DEFAULT TRUE,

  -- Gallery
  gallery_urls    TEXT[] DEFAULT '{}',

  -- Billing
  plan            TEXT DEFAULT 'free' CHECK (plan IN ('free','pro','premium')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'inactive',
  subscription_period_end TIMESTAMPTZ,

  -- Referral
  referred_by     TEXT,
  referral_credits INTEGER DEFAULT 0,

  -- Verification status
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending','verified','rejected','unsubmitted')),

  -- Metadata
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at    TIMESTAMPTZ
);

-- ============================================================
-- SESSION PACKAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS session_packages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id  UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  price       NUMERIC(10,2) NOT NULL,
  currency    TEXT DEFAULT 'AED',
  duration    TEXT DEFAULT '60min',
  sessions    INTEGER DEFAULT 1,
  description TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LEADS
-- ============================================================
CREATE TABLE IF NOT EXISTS leads (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id  UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  name        TEXT,
  phone       TEXT,
  email       TEXT,
  goal        TEXT,
  type        TEXT DEFAULT 'booking' CHECK (type IN ('booking','assessment','package','wa_tap')),

  -- Assessment data
  age         INTEGER,
  gender      TEXT,
  weight_kg   NUMERIC(5,1),
  height_cm   NUMERIC(5,1),
  bmi         NUMERIC(4,1),
  tdee        INTEGER,
  activity_level TEXT,
  location_pref  TEXT,

  -- Package interest
  package_id  UUID REFERENCES session_packages(id),

  -- Source
  source      TEXT DEFAULT 'profile',
  utm_source  TEXT,
  utm_medium  TEXT,
  utm_campaign TEXT,

  -- Status
  status      TEXT DEFAULT 'new' CHECK (status IN ('new','contacted','converted','lost')),

  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROFILE VIEWS (analytics)
-- ============================================================
CREATE TABLE IF NOT EXISTS profile_views (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id  UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  ip_hash     TEXT,
  user_agent  TEXT,
  referrer    TEXT,
  country     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EVENTS (WhatsApp taps, assessment opens, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id  UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL,  -- 'wa_tap', 'assessment_open', 'assessment_complete', 'book_tap', 'share'
  metadata    JSONB DEFAULT '{}',
  ip_hash     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MAGIC LINKS / OTP
-- ============================================================
CREATE TABLE IF NOT EXISTS magic_links (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT NOT NULL,
  token       TEXT UNIQUE NOT NULL,
  otp         TEXT,
  trainer_id  UUID REFERENCES trainers(id) ON DELETE CASCADE,
  used        BOOLEAN DEFAULT FALSE,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '15 minutes'),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REFERRALS
-- ============================================================
CREATE TABLE IF NOT EXISTS referrals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_slug   TEXT NOT NULL,
  referred_email  TEXT NOT NULL,
  referred_id     UUID REFERENCES trainers(id),
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','signed_up','upgraded','credited')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_trainers_slug ON trainers(slug);
CREATE INDEX IF NOT EXISTS idx_trainers_email ON trainers(email);
CREATE INDEX IF NOT EXISTS idx_trainers_plan ON trainers(plan);
CREATE INDEX IF NOT EXISTS idx_trainers_reps_verified ON trainers(reps_verified);
CREATE INDEX IF NOT EXISTS idx_trainers_verification_status ON trainers(verification_status);
CREATE INDEX IF NOT EXISTS idx_trainers_city ON trainers(city);
CREATE INDEX IF NOT EXISTS idx_session_packages_trainer ON session_packages(trainer_id);
CREATE INDEX IF NOT EXISTS idx_leads_trainer ON leads(trainer_id);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_views_trainer ON profile_views(trainer_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_created ON profile_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_trainer ON events(trainer_id);
CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_magic_links_token ON magic_links(token);
CREATE INDEX IF NOT EXISTS idx_magic_links_email ON magic_links(email);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Trainers table: public read for verified profiles, write via edge functions only
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read verified trainer profiles"
  ON trainers FOR SELECT
  USING (verification_status = 'verified' OR verification_status = 'pending');

-- Session packages: public read
ALTER TABLE session_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read session packages"
  ON session_packages FOR SELECT USING (true);

-- Leads: no public read (edge functions use service role)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Profile views: insert only via edge functions
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- Events: insert only via edge functions
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Magic links: no public access
ALTER TABLE magic_links ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trainers_updated_at
  BEFORE UPDATE ON trainers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SAMPLE DATA (for testing — remove in production)
-- ============================================================
INSERT INTO trainers (
  slug, name, email, phone, title, bio,
  specialties, certifications, reps_number, reps_level,
  reps_verified, verification_status, years_experience,
  clients_trained, sessions_delivered, locations,
  instagram, accepting_clients, plan
) VALUES (
  'sarah',
  'Sarah Al Mansoori',
  'sarah@example.com',
  '+971501234567',
  'Strength & Conditioning Coach',
  'Dubai-based strength coach with 8 years of experience transforming bodies and mindsets. I specialise in fat loss, muscle building, and helping women feel strong and confident. My sessions are intense, focused, and built around your goals — not a generic programme.',
  ARRAY['Strength','Fat Loss','Muscle Gain','HIIT'],
  ARRAY['REPs Level 3','NASM CPT','Nutrition Coach'],
  'REP-12345',
  'level_3',
  TRUE,
  'verified',
  8,
  240,
  3200,
  ARRAY['gym','home'],
  'sarahfitdubai',
  TRUE,
  'pro'
) ON CONFLICT (slug) DO NOTHING;

-- Insert sample packages for sarah
DO $$
DECLARE trainer_uuid UUID;
BEGIN
  SELECT id INTO trainer_uuid FROM trainers WHERE slug = 'sarah';
  IF trainer_uuid IS NOT NULL THEN
    INSERT INTO session_packages (trainer_id, name, price, duration, sessions, is_featured, sort_order)
    VALUES
      (trainer_uuid, 'Trial Session', 150, '60min', 1, FALSE, 0),
      (trainer_uuid, 'Monthly Pack', 1800, '60min', 8, TRUE, 1),
      (trainer_uuid, 'Transformation Package', 3200, '60min', 16, FALSE, 2)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
