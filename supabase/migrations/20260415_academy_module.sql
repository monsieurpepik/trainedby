-- ============================================================
-- TrainedBy Academy Module Migration
-- 2026-04-15
-- ============================================================

-- ── Academies ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academies (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                TEXT UNIQUE NOT NULL,
  name                TEXT NOT NULL,
  sport               TEXT NOT NULL DEFAULT 'multi-sport',
  logo_url            TEXT,
  cover_url           TEXT,
  description         TEXT,
  location            TEXT,
  city                TEXT DEFAULT 'Dubai',
  country             TEXT DEFAULT 'AE',
  google_maps_url     TEXT,
  contact_email       TEXT NOT NULL,
  contact_phone       TEXT,
  whatsapp            TEXT,
  website_url         TEXT,
  instagram_url       TEXT,
  stripe_customer_id  TEXT,
  plan                TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro','elite')),
  verified            BOOLEAN NOT NULL DEFAULT false,
  admin_email         TEXT NOT NULL,
  admin_magic_token   TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Academy Coaches (links trainers → academies) ─────────────
CREATE TABLE IF NOT EXISTS academy_coaches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id      UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  trainer_id      UUID REFERENCES trainers(id) ON DELETE SET NULL,
  -- For coaches not yet on TrainedBy:
  name            TEXT,
  role            TEXT NOT NULL DEFAULT 'coach',
  bio             TEXT,
  photo_url       TEXT,
  display_order   INT NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  bank_name       TEXT,
  bank_iban       TEXT,
  bank_account_name TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Programs (term, holiday camp, drop-in etc.) ──────────────
CREATE TABLE IF NOT EXISTS programs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id          UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  sport               TEXT NOT NULL,
  age_min             INT,
  age_max             INT,
  age_label           TEXT,                -- e.g. "U10", "Adults"
  description         TEXT,
  duration_weeks      INT,
  sessions_per_week   INT NOT NULL DEFAULT 1,
  price_aed           NUMERIC(10,2),
  price_gbp           NUMERIC(10,2),
  currency            TEXT NOT NULL DEFAULT 'AED',
  max_capacity        INT NOT NULL DEFAULT 20,
  enrolled_count      INT NOT NULL DEFAULT 0,
  location            TEXT,
  start_date          DATE,
  end_date            DATE,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  is_featured         BOOLEAN NOT NULL DEFAULT false,
  program_type        TEXT NOT NULL DEFAULT 'term' CHECK (program_type IN ('term','holiday_camp','drop_in','private','trial')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Sessions (individual training slots within a program) ────
CREATE TABLE IF NOT EXISTS academy_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id      UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  coach_id        UUID REFERENCES academy_coaches(id) ON DELETE SET NULL,
  session_date    DATE NOT NULL,
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  location        TEXT,
  notes           TEXT,
  status          TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Bookings (parent enrolls child in program) ───────────────
CREATE TABLE IF NOT EXISTS academy_bookings (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id                UUID NOT NULL REFERENCES programs(id) ON DELETE RESTRICT,
  academy_id                UUID NOT NULL REFERENCES academies(id) ON DELETE RESTRICT,
  -- Parent details
  parent_name               TEXT NOT NULL,
  parent_email              TEXT NOT NULL,
  parent_phone              TEXT NOT NULL,
  -- Child details
  child_name                TEXT NOT NULL,
  child_dob                 DATE,
  child_age                 INT,
  child_notes               TEXT,
  -- Payment
  amount_paid               NUMERIC(10,2) NOT NULL,
  currency                  TEXT NOT NULL DEFAULT 'AED',
  platform_fee              NUMERIC(10,2),
  academy_payout            NUMERIC(10,2),
  stripe_payment_intent_id  TEXT,
  stripe_checkout_session_id TEXT,
  payment_method            TEXT,          -- card, apple_pay, tabby
  -- Status
  status                    TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','refunded','no_show')),
  confirmation_sent         BOOLEAN NOT NULL DEFAULT false,
  reminder_sent             BOOLEAN NOT NULL DEFAULT false,
  -- Metadata
  source                    TEXT DEFAULT 'web', -- web, admin, api
  notes                     TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Coach Payouts (weekly settlement records) ────────────────
CREATE TABLE IF NOT EXISTS coach_payouts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id        UUID NOT NULL REFERENCES academy_coaches(id) ON DELETE RESTRICT,
  academy_id      UUID NOT NULL REFERENCES academies(id) ON DELETE RESTRICT,
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  sessions_count  INT NOT NULL DEFAULT 0,
  gross_amount    NUMERIC(10,2) NOT NULL,
  platform_fee    NUMERIC(10,2) NOT NULL DEFAULT 0,
  net_amount      NUMERIC(10,2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'AED',
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','paid','failed')),
  transfer_ref    TEXT,
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Availability (coach weekly schedule) ─────────────────────
CREATE TABLE IF NOT EXISTS coach_availability (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id        UUID NOT NULL REFERENCES academy_coaches(id) ON DELETE CASCADE,
  day_of_week     INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  is_blocked      BOOLEAN NOT NULL DEFAULT false,
  notes           TEXT,
  UNIQUE (coach_id, day_of_week, start_time)
);

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_academies_slug ON academies(slug);
CREATE INDEX IF NOT EXISTS idx_programs_academy ON programs(academy_id);
CREATE INDEX IF NOT EXISTS idx_programs_active ON programs(academy_id, is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_program ON academy_sessions(program_id, session_date);
CREATE INDEX IF NOT EXISTS idx_acad_bookings_program ON academy_bookings(program_id);
CREATE INDEX IF NOT EXISTS idx_acad_bookings_email ON academy_bookings(parent_email);
CREATE INDEX IF NOT EXISTS idx_acad_bookings_status ON academy_bookings(status);
CREATE INDEX IF NOT EXISTS idx_acad_bookings_academy ON academy_bookings(academy_id);
CREATE INDEX IF NOT EXISTS idx_coach_payouts_coach ON coach_payouts(coach_id, period_start);

-- ── RLS Policies ──────────────────────────────────────────────
ALTER TABLE academies ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_availability ENABLE ROW LEVEL SECURITY;

-- Public read for academy profiles and programs
CREATE POLICY "academies_public_read" ON academies FOR SELECT USING (true);
CREATE POLICY "academy_coaches_public_read" ON academy_coaches FOR SELECT USING (is_active = true);
CREATE POLICY "programs_public_read" ON programs FOR SELECT USING (is_active = true);
CREATE POLICY "sessions_public_read" ON academy_sessions FOR SELECT USING (true);

-- Service role can do everything (edge functions use service role key)
CREATE POLICY "academies_service_all" ON academies FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "coaches_service_all" ON academy_coaches FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "programs_service_all" ON programs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "sessions_service_all" ON academy_sessions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "acad_bookings_service_all" ON academy_bookings FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "payouts_service_all" ON coach_payouts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "coach_avail_service_all" ON coach_availability FOR ALL USING (auth.role() = 'service_role');

-- ── Useful Views ──────────────────────────────────────────────
CREATE OR REPLACE VIEW academy_dashboard AS
SELECT
  a.id,
  a.slug,
  a.name,
  a.sport,
  a.city,
  a.plan,
  a.verified,
  COUNT(DISTINCT p.id) FILTER (WHERE p.is_active) AS active_programs,
  COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'confirmed') AS total_bookings,
  COALESCE(SUM(b.amount_paid) FILTER (WHERE b.status = 'confirmed'), 0) AS total_revenue,
  COALESCE(SUM(b.platform_fee) FILTER (WHERE b.status = 'confirmed'), 0) AS platform_revenue
FROM academies a
LEFT JOIN programs p ON p.academy_id = a.id
LEFT JOIN academy_bookings b ON b.academy_id = a.id AND b.program_id = p.id
GROUP BY a.id;

-- ── Trigger: update updated_at ────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS academies_updated_at ON academies;
CREATE TRIGGER academies_updated_at BEFORE UPDATE ON academies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS programs_updated_at ON programs;
CREATE TRIGGER programs_updated_at BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS bookings_updated_at ON academy_bookings;
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON academy_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
