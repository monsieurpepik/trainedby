-- Add Stripe Connect fields to trainers
ALTER TABLE trainers
  ADD COLUMN IF NOT EXISTS stripe_connect_account_id TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS stripe_connect_onboarded   BOOLEAN DEFAULT FALSE;

-- Session types offered by a trainer
CREATE TABLE IF NOT EXISTS session_types (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id    UUID        NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  name          TEXT        NOT NULL,
  duration_min  INT         NOT NULL CHECK (duration_min > 0),
  price_cents   INT         NOT NULL CHECK (price_cents > 0),
  type          TEXT        NOT NULL CHECK (type IN ('single', 'package')),
  package_count INT         CHECK (
    (type = 'package' AND package_count > 1) OR
    (type = 'single'  AND package_count IS NULL)
  ),
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Weekly recurring schedule (one row per day trainer is available)
CREATE TABLE IF NOT EXISTS trainer_availability (
  id           UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id   UUID  NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  day_of_week  INT   NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time   TIME  NOT NULL,
  end_time     TIME  NOT NULL CHECK (end_time > start_time),
  UNIQUE (trainer_id, day_of_week)
);

-- Date-specific blocks or one-off open days
CREATE TABLE IF NOT EXISTS availability_overrides (
  id          UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id  UUID  NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  date        DATE  NOT NULL,
  is_blocked  BOOLEAN NOT NULL DEFAULT TRUE,
  note        TEXT,
  UNIQUE (trainer_id, date)
);

-- NOTE: bookings table already existed with a different schema (lead/inquiry bookings).
-- We extend it with direct-booking columns rather than CREATE TABLE IF NOT EXISTS.
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS session_type_id          UUID REFERENCES session_types(id),
  ADD COLUMN IF NOT EXISTS consumer_name            TEXT,
  ADD COLUMN IF NOT EXISTS consumer_email           TEXT,
  ADD COLUMN IF NOT EXISTS consumer_phone           TEXT,
  ADD COLUMN IF NOT EXISTS consumer_goal            TEXT,
  ADD COLUMN IF NOT EXISTS scheduled_at             TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS duration_min             INT,
  ADD COLUMN IF NOT EXISTS amount_cents             INT,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_charge_id         TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_at             TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS refunded_at              TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS package_credit_id        UUID;

-- Per-session credits from a package purchase
CREATE TABLE IF NOT EXISTS package_credits (
  id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id               UUID        NOT NULL REFERENCES trainers(id),
  session_type_id          UUID        NOT NULL REFERENCES session_types(id),
  consumer_email           TEXT        NOT NULL,
  consumer_name            TEXT        NOT NULL,
  stripe_payment_intent_id TEXT        NOT NULL,
  status                   TEXT        NOT NULL DEFAULT 'available'
    CHECK (status IN ('available','scheduled','used','cancelled')),
  booking_id               UUID        REFERENCES bookings(id),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Deferred circular FK: bookings.package_credit_id → package_credits.id
ALTER TABLE bookings
  ADD CONSTRAINT fk_bookings_package_credit
  FOREIGN KEY (package_credit_id) REFERENCES package_credits(id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_session_types_trainer     ON session_types(trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_availability_trainer ON trainer_availability(trainer_id);
CREATE INDEX IF NOT EXISTS idx_availability_overrides_trainer ON availability_overrides(trainer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_trainer          ON bookings(trainer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_at     ON bookings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_bookings_status           ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_package_credits_email     ON package_credits(consumer_email);
CREATE INDEX IF NOT EXISTS idx_package_credits_trainer   ON package_credits(trainer_id);

-- Enable RLS on all new tables
ALTER TABLE session_types          ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_availability   ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings               ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_credits        ENABLE ROW LEVEL SECURITY;
