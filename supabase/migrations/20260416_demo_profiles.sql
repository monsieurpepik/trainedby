-- Demo trainer profiles - one per locale
-- These are example profiles shown to prospective trainers so they can see
-- what a completed Pro profile looks like before signing up.
-- All profiles are marked is_demo = true so they are excluded from real search results.
-- Idempotent: safe to run multiple times.

-- Add is_demo column if it does not exist
ALTER TABLE trainers
  ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;

-- Add whatsapp column alias (profile page uses both 'whatsapp' and phone)
ALTER TABLE trainers
  ADD COLUMN IF NOT EXISTS whatsapp TEXT DEFAULT NULL;

ALTER TABLE trainers
  ADD COLUMN IF NOT EXISTS instagram_handle TEXT DEFAULT NULL;

ALTER TABLE trainers
  ADD COLUMN IF NOT EXISTS full_name TEXT GENERATED ALWAYS AS (name) STORED;

ALTER TABLE trainers
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

ALTER TABLE trainers
  ADD COLUMN IF NOT EXISTS avg_rating NUMERIC(3,1) DEFAULT NULL;

ALTER TABLE trainers
  ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

ALTER TABLE trainers
  ADD COLUMN IF NOT EXISTS price_from INTEGER DEFAULT NULL;

ALTER TABLE trainers
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT NULL;

ALTER TABLE trainers
  ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT NULL;

ALTER TABLE trainers
  ADD COLUMN IF NOT EXISTS clients_trained INTEGER DEFAULT NULL;

-- ─── UAE - trainedby.ae ───────────────────────────────────────────────────────
INSERT INTO trainers (
  slug, name, title, bio,
  avatar_url, specialties, certifications,
  reps_number, reps_verified, reps_level,
  years_experience, clients_trained,
  city, country, whatsapp, instagram_handle,
  plan, verification_status, is_verified,
  avg_rating, review_count, price_from,
  accepting_clients, is_demo, locale, market
) VALUES (
  'sarah-al-mansoori',
  'Sarah Al Mansoori',
  'Strength and Fat Loss Coach',
  'I help busy professionals in Dubai build strength and lose fat without spending their life in the gym. 7 years coaching, 340 clients, REPs UAE Level 3 certified. My sessions are 45 minutes - no filler, no fluff. If you want a trainer who will tell you exactly what to do and why, I am the right fit.',
  'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=800&q=85',
  ARRAY['Strength Training', 'Fat Loss', 'HIIT', 'Nutrition Coaching'],
  ARRAY['REPs UAE Level 3', 'NASM CPT', 'Precision Nutrition Level 1'],
  'REP-UAE-00123', TRUE, 'Level 3',
  7, 340,
  'Dubai', 'UAE',
  '+971501234567', '@sarahfitdubai',
  'pro', 'verified', TRUE,
  4.9, 47, 350,
  TRUE, TRUE, 'en-ae', 'ae'
) ON CONFLICT (slug) DO NOTHING;

-- ─── UK - trainedby.uk ───────────────────────────────────────────────────────
INSERT INTO trainers (
  slug, name, title, bio,
  avatar_url, specialties, certifications,
  reps_number, reps_verified, reps_level,
  years_experience, clients_trained,
  city, country, whatsapp, instagram_handle,
  plan, verification_status, is_verified,
  avg_rating, review_count, price_from,
  accepting_clients, is_demo, locale, market
) VALUES (
  'james-hartley',
  'James Hartley',
  'Performance and Mobility Coach',
  'Former rugby player turned coach. I work with athletes and office workers who want to move better and perform at a higher level. REPs UK registered, 9 years experience, based in Manchester. My approach is simple: fix the movement first, then build the strength on top of it.',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=85',
  ARRAY['Sports Performance', 'Mobility', 'Strength Training', 'Injury Rehab'],
  ARRAY['REPs UK Level 3', 'UKSCA Accredited S&C Coach', 'FMS Level 2'],
  'REP-UK-04521', TRUE, 'Level 3',
  9, 280,
  'Manchester', 'UK',
  '+447911234567', '@jamesharfitness',
  'pro', 'verified', TRUE,
  4.8, 63, 65,
  TRUE, TRUE, 'en-uk', 'uk'
) ON CONFLICT (slug) DO NOTHING;

-- ─── US - trainedby.com ───────────────────────────────────────────────────────
INSERT INTO trainers (
  slug, name, title, bio,
  avatar_url, specialties, certifications,
  years_experience, clients_trained,
  city, country, whatsapp, instagram_handle,
  plan, verification_status, is_verified,
  avg_rating, review_count, price_from,
  accepting_clients, is_demo, locale, market
) VALUES (
  'marcus-johnson',
  'Marcus Johnson',
  'NASM Certified Personal Trainer',
  'I train clients in New York who want real results, not a gym buddy. NASM CPT, 6 years coaching, specialising in body recomposition and first-time lifters. I keep my client roster small on purpose - 12 active clients max. Every session is programmed specifically for you, not pulled from a template.',
  'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=800&q=85',
  ARRAY['Body Recomposition', 'Strength Training', 'Beginner Coaching', 'Online Training'],
  ARRAY['NASM CPT', 'NASM CNC', 'ACE Health Coach'],
  6, 190,
  'New York', 'USA',
  '+12125550147', '@marcusjohnsonfit',
  'pro', 'verified', TRUE,
  4.9, 38, 120,
  TRUE, TRUE, 'en-us', 'us'
) ON CONFLICT (slug) DO NOTHING;

-- ─── Spain - entrenacon.com ───────────────────────────────────────────────────
INSERT INTO trainers (
  slug, name, title, bio,
  avatar_url, specialties, certifications,
  years_experience, clients_trained,
  city, country, whatsapp, instagram_handle,
  plan, verification_status, is_verified,
  avg_rating, review_count, price_from,
  accepting_clients, is_demo, locale, market
) VALUES (
  'lucia-fernandez',
  'Lucia Fernandez',
  'Entrenadora Personal y Coach de Fuerza',
  'Entreno a mujeres en Madrid que quieren ganar fuerza sin miedo a los pesos libres. 5 anos de experiencia, mas de 200 clientas, titulada NSCA-CPT. Mi metodo se basa en progresion real: cada semana sabes exactamente cuanto has mejorado. Sin dietas milagro, sin rutinas genericas.',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=85',
  ARRAY['Entrenamiento de Fuerza', 'Perdida de Grasa', 'Entrenamiento Femenino', 'Nutricion Deportiva'],
  ARRAY['NSCA-CPT', 'Grado en Ciencias del Deporte (INEF Madrid)', 'Precision Nutrition Nivel 1'],
  5, 210,
  'Madrid', 'Espana',
  '+34612345678', '@luciafernandezfit',
  'pro', 'verified', TRUE,
  5.0, 29, 55,
  TRUE, TRUE, 'es', 'es'
) ON CONFLICT (slug) DO NOTHING;

-- ─── France - coachepar.fr ───────────────────────────────────────────────────
INSERT INTO trainers (
  slug, name, title, bio,
  avatar_url, specialties, certifications,
  years_experience, clients_trained,
  city, country, whatsapp, instagram_handle,
  plan, verification_status, is_verified,
  avg_rating, review_count, price_from,
  accepting_clients, is_demo, locale, market
) VALUES (
  'thomas-moreau',
  'Thomas Moreau',
  'Coach Sportif BPJEPS - Force et Conditionnement',
  'Je coache des professionnels parisiens qui veulent progresser sans perdre de temps. Diplome BPJEPS APSF, 8 ans d experience, 260 clients accompagnes. Je travaille en seances de 50 minutes, en salle ou a domicile dans le 8e et le 16e arrondissement. Pas de bla-bla : chaque seance a un objectif precis.',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=85',
  ARRAY['Force', 'Conditionnement Physique', 'Perte de Poids', 'Preparation Sportive'],
  ARRAY['BPJEPS APSF', 'DEUST STAPS', 'Nutrition du Sportif (INSEP)'],
  8, 260,
  'Paris', 'France',
  '+33612345678', '@thomasmoreau_coach',
  'pro', 'verified', TRUE,
  4.9, 51, 75,
  TRUE, TRUE, 'fr', 'fr'
) ON CONFLICT (slug) DO NOTHING;

-- ─── Italy - allenatacon.it ───────────────────────────────────────────────────
INSERT INTO trainers (
  slug, name, title, bio,
  avatar_url, specialties, certifications,
  years_experience, clients_trained,
  city, country, whatsapp, instagram_handle,
  plan, verification_status, is_verified,
  avg_rating, review_count, price_from,
  accepting_clients, is_demo, locale, market
) VALUES (
  'giulia-romano',
  'Giulia Romano',
  'Personal Trainer Certificata CONI',
  'Alleno clienti a Milano che vogliono migliorare la composizione corporea e la forza funzionale. Laureata in Scienze Motorie, certificata CONI, 6 anni di esperienza con oltre 180 clienti seguiti. Le mie sessioni durano 55 minuti e sono strutturate al minuto. Niente improvvisazione.',
  'https://images.unsplash.com/photo-1609899464726-209f9a4e9b6c?w=800&q=85',
  ARRAY['Composizione Corporea', 'Forza Funzionale', 'Allenamento Femminile', 'Postura e Mobilita'],
  ARRAY['Laurea in Scienze Motorie (Universita degli Studi di Milano)', 'CONI Personal Trainer', 'FIF Pilates'],
  6, 180,
  'Milano', 'Italia',
  '+39312345678', '@giuliaromano_pt',
  'pro', 'verified', TRUE,
  4.8, 34, 70,
  TRUE, TRUE, 'it', 'it'
) ON CONFLICT (slug) DO NOTHING;

-- ─── India - trainedby.in ─────────────────────────────────────────────────────
INSERT INTO trainers (
  slug, name, title, bio,
  avatar_url, specialties, certifications,
  years_experience, clients_trained,
  city, country, whatsapp, instagram_handle,
  plan, verification_status, is_verified,
  avg_rating, review_count, price_from,
  accepting_clients, is_demo, locale, market
) VALUES (
  'arjun-sharma',
  'Arjun Sharma',
  'Strength Coach and Sports Nutritionist',
  'I train working professionals in Mumbai who want to build muscle and improve their health markers. ACE certified, 5 years coaching, 150 clients. I focus on sustainable training - programmes you can follow for years, not just 12 weeks. Online and in-person sessions available across Bandra and Andheri.',
  'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=85',
  ARRAY['Muscle Building', 'Sports Nutrition', 'Online Coaching', 'Corporate Wellness'],
  ARRAY['ACE CPT', 'ISSA Sports Nutritionist', 'NSCA CSCS'],
  5, 150,
  'Mumbai', 'India',
  '+919876543210', '@arjunsharmafit',
  'pro', 'verified', TRUE,
  4.9, 22, 2500,
  TRUE, TRUE, 'en-in', 'in'
) ON CONFLICT (slug) DO NOTHING;

-- ─── Seed session packages for each demo trainer ─────────────────────────────
-- UAE - Sarah
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Single Session', 350, 'AED', 45, 1, 'One 45-minute strength session. Bring your training history if you have one.', FALSE, 1
FROM trainers WHERE slug = 'sarah-al-mansoori'
ON CONFLICT DO NOTHING;

INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, '8-Session Block', 2400, 'AED', 45, 8, 'Best value. 8 sessions over 4 weeks. Includes a nutrition audit in session 1.', TRUE, 2
FROM trainers WHERE slug = 'sarah-al-mansoori'
ON CONFLICT DO NOTHING;

INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Online Coaching', 1200, 'AED', NULL, NULL, 'Monthly online coaching. Weekly check-ins, full programme, WhatsApp support.', FALSE, 3
FROM trainers WHERE slug = 'sarah-al-mansoori'
ON CONFLICT DO NOTHING;

-- UK - James
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Single Session', 65, 'GBP', 60, 1, 'One 60-minute performance or mobility session.', FALSE, 1
FROM trainers WHERE slug = 'james-hartley'
ON CONFLICT DO NOTHING;

INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, '10-Session Block', 580, 'GBP', 60, 10, '10 sessions over 5 weeks. Includes movement screen and programme design.', TRUE, 2
FROM trainers WHERE slug = 'james-hartley'
ON CONFLICT DO NOTHING;

-- US - Marcus
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Intro Session', 120, 'USD', 60, 1, 'First session includes a full assessment and programme overview.', FALSE, 1
FROM trainers WHERE slug = 'marcus-johnson'
ON CONFLICT DO NOTHING;

INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, '12-Session Block', 1200, 'USD', 60, 12, '12 sessions over 6 weeks. Full programme, nutrition guidance, weekly check-ins.', TRUE, 2
FROM trainers WHERE slug = 'marcus-johnson'
ON CONFLICT DO NOTHING;

-- Spain - Lucia
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Sesion Individual', 55, 'EUR', 55, 1, 'Una sesion de 55 minutos de entrenamiento de fuerza personalizado.', FALSE, 1
FROM trainers WHERE slug = 'lucia-fernandez'
ON CONFLICT DO NOTHING;

INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Bono 8 Sesiones', 380, 'EUR', 55, 8, '8 sesiones en 4 semanas. Incluye plan de entrenamiento y seguimiento nutricional.', TRUE, 2
FROM trainers WHERE slug = 'lucia-fernandez'
ON CONFLICT DO NOTHING;

-- France - Thomas
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Seance Decouverte', 75, 'EUR', 50, 1, 'Premiere seance avec bilan posture et objectifs. Remboursee si vous prenez un forfait.', FALSE, 1
FROM trainers WHERE slug = 'thomas-moreau'
ON CONFLICT DO NOTHING;

INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Forfait 10 Seances', 650, 'EUR', 50, 10, '10 seances sur 5 semaines. Programme individualise et suivi WhatsApp.', TRUE, 2
FROM trainers WHERE slug = 'thomas-moreau'
ON CONFLICT DO NOTHING;

-- Italy - Giulia
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Sessione Singola', 70, 'EUR', 55, 1, 'Una sessione di 55 minuti. Porta con te la tua storia di allenamento.', FALSE, 1
FROM trainers WHERE slug = 'giulia-romano'
ON CONFLICT DO NOTHING;

INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Pacchetto 8 Sessioni', 490, 'EUR', 55, 8, '8 sessioni in 4 settimane. Include analisi posturale e piano nutrizionale.', TRUE, 2
FROM trainers WHERE slug = 'giulia-romano'
ON CONFLICT DO NOTHING;

-- India - Arjun
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Single Session', 2500, 'INR', 60, 1, 'One 60-minute strength or nutrition session.', FALSE, 1
FROM trainers WHERE slug = 'arjun-sharma'
ON CONFLICT DO NOTHING;

INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Monthly Online Coaching', 8000, 'INR', NULL, NULL, 'Full monthly programme, weekly check-ins, WhatsApp support. No commute required.', TRUE, 2
FROM trainers WHERE slug = 'arjun-sharma'
ON CONFLICT DO NOTHING;
