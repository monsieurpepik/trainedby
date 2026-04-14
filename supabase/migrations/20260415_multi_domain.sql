-- ============================================================
-- Multi-Domain Architecture Migration
-- Expands market support to all 10 domains
-- One backend, one DB, all markets unified
-- ============================================================

-- 1. Expand market CHECK constraint on trainers to include all markets
ALTER TABLE trainers
  DROP CONSTRAINT IF EXISTS trainers_market_check;

ALTER TABLE trainers
  ADD CONSTRAINT trainers_market_check
  CHECK (market IN ('ae','uk','in','com','fr','it','es','mx'));

-- 2. Add locale column to trainers (derived from market but stored for fast queries)
ALTER TABLE trainers
  ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en'
  CHECK (locale IN ('en','fr','it','es'));

-- Update existing trainers locale from market
UPDATE trainers SET locale = CASE
  WHEN market = 'fr' THEN 'fr'
  WHEN market = 'it' THEN 'it'
  WHEN market IN ('es','mx') THEN 'es'
  ELSE 'en'
END;

-- 3. Add locale to academies table
ALTER TABLE academies
  ADD COLUMN IF NOT EXISTS market TEXT DEFAULT 'ae'
  CHECK (market IN ('ae','uk','in','com','fr','it','es','mx'));

ALTER TABLE academies
  ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en'
  CHECK (locale IN ('en','fr','it','es'));

ALTER TABLE academies
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'AED';

ALTER TABLE academies
  ADD COLUMN IF NOT EXISTS payment_enabled BOOLEAN DEFAULT false;

-- 4. Expand market_configs to include all 10 markets
-- First expand the CHECK constraint if it exists
ALTER TABLE market_configs
  DROP CONSTRAINT IF EXISTS market_configs_market_check;

-- Add new columns to market_configs
ALTER TABLE market_configs
  ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS payment_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS payment_provider TEXT DEFAULT NULL, -- 'stripe', 'telr', null
  ADD COLUMN IF NOT EXISTS payment_note TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS waitlist_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS brand_name TEXT DEFAULT 'TrainedBy',
  ADD COLUMN IF NOT EXISTS brand_tagline TEXT DEFAULT 'The Trainer''s Operating System',
  ADD COLUMN IF NOT EXISTS support_email TEXT DEFAULT 'hello@trainedby.ae',
  ADD COLUMN IF NOT EXISTS join_path TEXT DEFAULT '/join',
  ADD COLUMN IF NOT EXISTS find_path TEXT DEFAULT '/find';

-- 5. Update existing market configs with new fields
UPDATE market_configs SET
  locale = 'en',
  payment_enabled = true,
  payment_provider = 'stripe',
  brand_name = 'TrainedBy',
  support_email = 'hello@trainedby.ae',
  brand_tagline = 'The UAE Trainer''s Operating System'
WHERE market = 'ae';

UPDATE market_configs SET
  locale = 'en',
  payment_enabled = true,
  payment_provider = 'stripe',
  brand_name = 'TrainedBy',
  support_email = 'hello@trainedby.com',
  brand_tagline = 'The Trainer''s Operating System'
WHERE market = 'com';

UPDATE market_configs SET
  locale = 'en',
  payment_enabled = true,
  payment_provider = 'stripe',
  brand_name = 'TrainedBy',
  support_email = 'hello@trainedby.uk',
  brand_tagline = 'The UK Trainer''s Operating System'
WHERE market = 'uk';

UPDATE market_configs SET
  locale = 'en',
  payment_enabled = false,
  payment_provider = NULL,
  waitlist_enabled = true,
  brand_name = 'TrainedBy',
  support_email = 'hello@trainedby.in',
  brand_tagline = 'The India Trainer''s Operating System',
  payment_note = 'Payments launching soon in India. Join the waitlist for early access.'
WHERE market = 'in';

-- 6. Insert new market configs for FR, IT, ES, MX
INSERT INTO market_configs (
  market, domain, currency, currency_symbol, pro_price, pro_price_label,
  certification_body, hero_headline, hero_subline, cta_text, trust_badges,
  locale, payment_enabled, payment_provider, payment_note, waitlist_enabled,
  brand_name, brand_tagline, support_email, join_path, find_path
) VALUES
(
  'fr', 'coachepar.fr', 'EUR', '€', 19, '19€/mois',
  'BPJEPS / STAPS / DEUG STAPS',
  'Arrêtez d''échanger votre temps contre de l''argent.',
  'La seule plateforme qui transforme votre expertise fitness en business — avec des produits digitaux, des revenus d''affiliation et un constructeur d''offres intégré.',
  'Créer votre profil gratuit →',
  '{"BPJEPS Vérifié","Certifié STAPS","Paiement sécurisé"}',
  'fr', false, NULL,
  'Les paiements arrivent bientôt en France. Rejoignez la liste d''attente pour un accès anticipé.',
  true,
  'CoachéPar', 'Le Système d''Exploitation du Coach',
  'bonjour@coachepar.fr', '/join', '/find'
),
(
  'it', 'allenaticon.it', 'EUR', '€', 19, '19€/mese',
  'EQF / CONI / FIPE',
  'Smetti di scambiare il tuo tempo con denaro.',
  'L''unica piattaforma che trasforma la tua esperienza fitness in un business — con prodotti digitali, reddito da affiliazione e un costruttore di offerte integrato.',
  'Crea il tuo profilo gratuito →',
  '{"Certificato EQF","Verificato CONI","Pagamento sicuro"}',
  'it', false, NULL,
  'I pagamenti arriveranno presto in Italia. Unisciti alla lista d''attesa per l''accesso anticipato.',
  true,
  'AllenatoCon', 'Il Sistema Operativo del Coach',
  'ciao@allenaticon.it', '/join', '/find'
),
(
  'es', 'entrenacon.com', 'EUR', '€', 19, '19€/mes',
  'NSCA / ISSA / CFES',
  'Deja de cambiar tu tiempo por dinero.',
  'La única plataforma que convierte tu experiencia fitness en un negocio — con productos digitales, ingresos de afiliados y un constructor de ofertas integrado.',
  'Crea tu perfil gratuito →',
  '{"Certificado NSCA","Verificado ISSA","Pago seguro"}',
  'es', false, NULL,
  'Los pagos llegarán pronto en España. Únete a la lista de espera para acceso anticipado.',
  true,
  'EntrenaCon', 'El Sistema Operativo del Entrenador',
  'hola@entrenacon.com', '/join', '/find'
),
(
  'mx', 'entrenacon.mx', 'MXN', 'MX$', 399, 'MX$399/mes',
  'CONADE / NSCA',
  'Deja de cambiar tu tiempo por dinero.',
  'La única plataforma que convierte tu experiencia fitness en un negocio — con productos digitales, ingresos de afiliados y un constructor de ofertas integrado.',
  'Crea tu perfil gratuito →',
  '{"Certificado CONADE","Verificado NSCA","Pago seguro"}',
  'es', false, NULL,
  'Los pagos llegarán pronto en México. Únete a la lista de espera para acceso anticipado.',
  true,
  'EntrenaCon', 'El Sistema Operativo del Entrenador',
  'hola@entrenacon.mx', '/join', '/find'
)
ON CONFLICT (market) DO UPDATE SET
  locale = EXCLUDED.locale,
  payment_enabled = EXCLUDED.payment_enabled,
  payment_provider = EXCLUDED.payment_provider,
  payment_note = EXCLUDED.payment_note,
  waitlist_enabled = EXCLUDED.waitlist_enabled,
  brand_name = EXCLUDED.brand_name,
  brand_tagline = EXCLUDED.brand_tagline,
  support_email = EXCLUDED.support_email;

-- 7. Create a waitlist table for markets without payment enabled
CREATE TABLE IF NOT EXISTS market_waitlist (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market          TEXT NOT NULL,
  email           TEXT NOT NULL,
  name            TEXT,
  role            TEXT CHECK (role IN ('trainer','client','academy')),
  source_domain   TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(market, email)
);

CREATE INDEX IF NOT EXISTS idx_waitlist_market ON market_waitlist(market);
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON market_waitlist(email);

-- RLS on waitlist
ALTER TABLE market_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waitlist"
  ON market_waitlist FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can read waitlist"
  ON market_waitlist FOR SELECT
  USING (true); -- secured by service role in edge functions

-- 8. Create a unified global_stats view for the super-admin dashboard
CREATE OR REPLACE VIEW global_stats AS
SELECT
  mc.market,
  mc.brand_name,
  mc.domain,
  mc.currency,
  mc.locale,
  mc.payment_enabled,
  mc.waitlist_enabled,
  COUNT(DISTINCT t.id) AS trainer_count,
  COUNT(DISTINCT t.id) FILTER (WHERE t.plan = 'pro') AS pro_count,
  COUNT(DISTINCT t.id) FILTER (WHERE t.verification_status = 'verified') AS verified_count,
  COUNT(DISTINCT t.id) FILTER (WHERE t.created_at > now() - interval '7 days') AS new_this_week,
  COUNT(DISTINCT t.id) FILTER (WHERE t.created_at > now() - interval '30 days') AS new_this_month,
  COUNT(DISTINCT w.id) AS waitlist_count,
  COUNT(DISTINCT ab.id) AS academy_bookings_total,
  COALESCE(SUM(ab.amount_paid) FILTER (WHERE ab.status = 'confirmed'), 0) AS revenue_total_cents
FROM market_configs mc
LEFT JOIN trainers t ON t.market = mc.market
LEFT JOIN market_waitlist w ON w.market = mc.market
LEFT JOIN academies a ON a.market = mc.market
LEFT JOIN academy_bookings ab ON ab.academy_id = a.id
GROUP BY mc.market, mc.brand_name, mc.domain, mc.currency, mc.locale, mc.payment_enabled, mc.waitlist_enabled;

-- 9. Add market to funnel_events for cross-market analytics
ALTER TABLE funnel_events
  ADD COLUMN IF NOT EXISTS market TEXT DEFAULT 'ae',
  ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en';

-- 10. Create market_revenue view for financial overview
CREATE OR REPLACE VIEW market_revenue AS
SELECT
  mc.market,
  mc.brand_name,
  mc.currency,
  mc.currency_symbol,
  mc.payment_enabled,
  COALESCE(sub.mrr_cents, 0) AS mrr_cents,
  COALESCE(sub.pro_count, 0) AS paying_trainers,
  COALESCE(bk.booking_revenue_cents, 0) AS academy_booking_revenue_cents,
  COALESCE(sub.mrr_cents, 0) + COALESCE(bk.booking_revenue_cents, 0) AS total_revenue_cents
FROM market_configs mc
LEFT JOIN (
  SELECT market, COUNT(*) AS pro_count,
    COUNT(*) * (
      CASE market
        WHEN 'ae' THEN 14900
        WHEN 'uk' THEN 1299
        WHEN 'com' THEN 1499
        WHEN 'fr' THEN 1900
        WHEN 'it' THEN 1900
        WHEN 'es' THEN 1900
        WHEN 'mx' THEN 39900
        ELSE 0
      END
    ) AS mrr_cents
  FROM trainers WHERE plan = 'pro'
  GROUP BY market
) sub ON sub.market = mc.market
LEFT JOIN (
  SELECT a.market, SUM(ab.amount_paid) AS booking_revenue_cents FROM academy_bookings ab
  JOIN academies a ON a.id = ab.academy_id
  WHERE ab.status = 'confirmed'
  GROUP BY a.market
) bk ON bk.market = mc.market;
