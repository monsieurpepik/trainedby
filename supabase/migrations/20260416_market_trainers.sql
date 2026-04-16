-- ============================================================
-- Multi-market demo trainer profiles
-- 3 trainers per market × 7 markets = 21 trainers total
-- Each trainer has: local name, local city, local currency,
-- local certifications, local bio, and correct market tag
-- ============================================================

-- ============================================================
-- UAE (trainedby.ae) — AED, REPs UAE, Dubai/Abu Dhabi
-- ============================================================

INSERT INTO trainers (
  slug, name, title, bio,
  avatar_url, specialties, certifications,
  years_experience, clients_trained, avg_rating, review_count, price_from,
  city, country, whatsapp, instagram_handle,
  training_modes, verification_status, tier,
  accepting_clients, is_demo, locale, market
) VALUES (
  'sarah-al-mansoori',
  'Sarah Al Mansoori',
  'Strength & Fat Loss Coach',
  'I help busy professionals in Dubai build strength and lose fat without spending their life in the gym. 7 years coaching, 340 clients, REPs UAE Level 3 certified. My sessions are 45 minutes - no filler, no fluff. If you want a trainer who will tell you exactly what to do and why, I am the right fit.',
  'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=800&q=85',
  ARRAY['Strength Training','Fat Loss','HIIT','Nutrition Coaching'],
  ARRAY['REPs UAE Level 3','NASM CPT','Precision Nutrition Level 1'],
  7, 340, 4.9, 38, 350,
  'Dubai', 'UAE', '+971501234567', 'sarah.fit.dubai',
  ARRAY['in-person','online'], 'verified', 'pro',
  TRUE, TRUE, 'en-ae', 'ae'
) ON CONFLICT (slug) DO UPDATE SET
  avatar_url = EXCLUDED.avatar_url,
  market = EXCLUDED.market,
  locale = EXCLUDED.locale,
  is_demo = TRUE;

INSERT INTO trainers (
  slug, name, title, bio,
  avatar_url, specialties, certifications,
  years_experience, clients_trained, avg_rating, review_count, price_from,
  city, country, whatsapp, instagram_handle,
  training_modes, verification_status, tier,
  accepting_clients, is_demo, locale, market
) VALUES (
  'khalid-rashid',
  'Khalid Rashid',
  'HIIT & Athletic Performance Coach',
  'Former national-level sprinter turned coach. I work with clients who want to move better, perform better, and look better. Based in Dubai Marina. REPs UAE Level 4. 12 years in sport and coaching. I do not do generic programmes - every session is built around you.',
  'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=800&q=85',
  ARRAY['HIIT','Athletic Performance','Speed & Agility','Strength'],
  ARRAY['REPs UAE Level 4','NSCA CSCS','Speed & Agility Specialist'],
  12, 420, 4.8, 52, 400,
  'Dubai', 'UAE', '+971502345678', 'khalid.performance',
  ARRAY['in-person'], 'verified', 'pro',
  TRUE, TRUE, 'en-ae', 'ae'
) ON CONFLICT (slug) DO UPDATE SET
  avatar_url = EXCLUDED.avatar_url,
  market = EXCLUDED.market,
  locale = EXCLUDED.locale,
  is_demo = TRUE;

INSERT INTO trainers (
  slug, name, title, bio,
  avatar_url, specialties, certifications,
  years_experience, clients_trained, avg_rating, review_count, price_from,
  city, country, whatsapp, instagram_handle,
  training_modes, verification_status, tier,
  accepting_clients, is_demo, locale, market
) VALUES (
  'nour-haddad',
  'Nour Haddad',
  'Nutrition & Wellness Coach',
  'I specialise in sustainable fat loss and hormonal health for women in the UAE. Certified nutritionist and personal trainer. I combine evidence-based training with practical nutrition - no crash diets, no extreme protocols. Based in Abu Dhabi, available online across the UAE.',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=85',
  ARRAY['Nutrition','Fat Loss','Womens Health','Hormonal Wellness'],
  ARRAY['REPs UAE Level 3','Precision Nutrition Level 2','Pre/Postnatal Specialist'],
  5, 180, 5.0, 29, 300,
  'Abu Dhabi', 'UAE', '+971503456789', 'nour.wellness.ae',
  ARRAY['in-person','online'], 'verified', 'free',
  TRUE, TRUE, 'en-ae', 'ae'
) ON CONFLICT (slug) DO UPDATE SET
  avatar_url = EXCLUDED.avatar_url,
  market = EXCLUDED.market,
  locale = EXCLUDED.locale,
  is_demo = TRUE;

-- Packages: UAE trainers
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Single Session', 350, 'AED', 45, 1, 'One 45-minute strength session. Bring your training history if you have one.', FALSE, 1
FROM trainers WHERE slug = 'sarah-al-mansoori' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, '8-Session Block', 2400, 'AED', 45, 8, 'Best value. 8 sessions over 4 weeks. Includes a nutrition audit in session 1.', TRUE, 2
FROM trainers WHERE slug = 'sarah-al-mansoori' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Online Coaching', 1200, 'AED', NULL, NULL, 'Monthly online coaching. Weekly check-ins, full programme, WhatsApp support.', FALSE, 3
FROM trainers WHERE slug = 'sarah-al-mansoori' ON CONFLICT DO NOTHING;

INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Single Session', 400, 'AED', 60, 1, 'One 60-minute performance session. Assessment included on first session.', FALSE, 1
FROM trainers WHERE slug = 'khalid-rashid' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, '10-Session Block', 3500, 'AED', 60, 10, '10 sessions over 5 weeks. Full athletic programme and weekly performance review.', TRUE, 2
FROM trainers WHERE slug = 'khalid-rashid' ON CONFLICT DO NOTHING;

INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Single Session', 300, 'AED', 60, 1, 'One 60-minute nutrition and training session.', FALSE, 1
FROM trainers WHERE slug = 'nour-haddad' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, '12-Week Transformation', 2800, 'AED', NULL, NULL, '12 weeks of nutrition coaching, weekly check-ins, and full training programme.', TRUE, 2
FROM trainers WHERE slug = 'nour-haddad' ON CONFLICT DO NOTHING;

-- ============================================================
-- UK (trainedby.uk) — GBP, REPs UK / CIMSPA, London/Manchester
-- ============================================================

INSERT INTO trainers (
  slug, name, title, bio,
  avatar_url, specialties, certifications,
  years_experience, clients_trained, avg_rating, review_count, price_from,
  city, country, whatsapp, instagram_handle,
  training_modes, verification_status, tier,
  accepting_clients, is_demo, locale, market
) VALUES (
  'james-hartley',
  'James Hartley',
  'Strength & Mobility Coach',
  'I train busy Londoners who want to get stronger, move better, and stay injury-free. REPs UK Level 3, CIMSPA member, 9 years coaching. I work from a private studio in Shoreditch and online. No group classes, no waiting - just focused 1-to-1 work.',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=85',
  ARRAY['Strength Training','Mobility','Injury Rehab','Movement'],
  ARRAY['REPs UK Level 3','CIMSPA','FMS Certified'],
  9, 280, 4.9, 41, 65,
  'London', 'UK', '+447700900001', 'james.hartley.pt',
  ARRAY['in-person','online'], 'verified', 'pro',
  TRUE, TRUE, 'en-uk', 'uk'
) ON CONFLICT (slug) DO UPDATE SET
  avatar_url = EXCLUDED.avatar_url,
  market = EXCLUDED.market,
  locale = EXCLUDED.locale,
  is_demo = TRUE;

INSERT INTO trainers (
  slug, name, title, bio,
  avatar_url, specialties, certifications,
  years_experience, clients_trained, avg_rating, review_count, price_from,
  city, country, whatsapp, instagram_handle,
  training_modes, verification_status, tier,
  accepting_clients, is_demo, locale, market
) VALUES (
  'emily-chen-uk',
  'Emily Chen',
  'Olympic Lifting & Conditioning Coach',
  'I coach Olympic weightlifting and general strength conditioning in Manchester. Former GB junior lifter. UKSCA accredited, REPs Level 4. I work with athletes, CrossFitters, and anyone who wants to learn to lift properly. Technique first, always.',
  'https://images.unsplash.com/photo-1609899464726-209f9a4e9b6c?w=800&q=85',
  ARRAY['Olympic Lifting','Strength','CrossFit','Conditioning'],
  ARRAY['REPs UK Level 4','UKSCA Accredited','British Weightlifting Coach'],
  8, 195, 4.8, 33, 70,
  'Manchester', 'UK', '+447700900002', 'emily.lifts',
  ARRAY['in-person','online'], 'verified', 'pro',
  TRUE, TRUE, 'en-uk', 'uk'
) ON CONFLICT (slug) DO UPDATE SET
  avatar_url = EXCLUDED.avatar_url,
  market = EXCLUDED.market,
  locale = EXCLUDED.locale,
  is_demo = TRUE;

INSERT INTO trainers (
  slug, name, title, bio,
  avatar_url, specialties, certifications,
  years_experience, clients_trained, avg_rating, review_count, price_from,
  city, country, whatsapp, instagram_handle,
  training_modes, verification_status, tier,
  accepting_clients, is_demo, locale, market
) VALUES (
  'tom-walsh-uk',
  'Tom Walsh',
  'Running & Endurance Coach',
  'I help runners of all levels go further and faster without getting injured. Sub-3 marathon runner, UESCA certified running coach, REPs Level 3. Based in Bristol, coaching online across the UK. From Couch to 5K to ultramarathon - I have coached it all.',
  'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=85',
  ARRAY['Running','Endurance','Marathon','Triathlon'],
  ARRAY['UESCA Running Coach','REPs UK Level 3','Triathlon England Coach'],
  6, 220, 4.7, 28, 55,
  'Bristol', 'UK', '+447700900003', 'tom.runs.uk',
  ARRAY['in-person','online'], 'verified', 'free',
  TRUE, TRUE, 'en-uk', 'uk'
) ON CONFLICT (slug) DO UPDATE SET
  avatar_url = EXCLUDED.avatar_url,
  market = EXCLUDED.market,
  locale = EXCLUDED.locale,
  is_demo = TRUE;

-- Packages: UK trainers
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Single Session', 65, 'GBP', 60, 1, 'One 60-minute strength or mobility session at my Shoreditch studio.', FALSE, 1
FROM trainers WHERE slug = 'james-hartley' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, '10-Session Block', 580, 'GBP', 60, 10, '10 sessions over 5 weeks. Includes movement screen and full programme design.', TRUE, 2
FROM trainers WHERE slug = 'james-hartley' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Online Coaching', 180, 'GBP', NULL, NULL, 'Monthly online coaching. Programme, check-ins, and WhatsApp support.', FALSE, 3
FROM trainers WHERE slug = 'james-hartley' ON CONFLICT DO NOTHING;

INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Single Session', 70, 'GBP', 60, 1, 'One 60-minute Olympic lifting or conditioning session.', FALSE, 1
FROM trainers WHERE slug = 'emily-chen-uk' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, '8-Session Block', 520, 'GBP', 60, 8, '8 sessions over 4 weeks. Full technique coaching and strength programme.', TRUE, 2
FROM trainers WHERE slug = 'emily-chen-uk' ON CONFLICT DO NOTHING;

INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Single Session', 55, 'GBP', 60, 1, 'One 60-minute run coaching session or gait analysis.', FALSE, 1
FROM trainers WHERE slug = 'tom-walsh-uk' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, '12-Week Marathon Plan', 420, 'GBP', NULL, NULL, 'Full 12-week marathon training plan with weekly check-ins and run analysis.', TRUE, 2
FROM trainers WHERE slug = 'tom-walsh-uk' ON CONFLICT DO NOTHING;

-- ============================================================
-- US / Global (trainedby.com) — USD, NASM/ACE/NSCA, New York/LA
-- ============================================================

INSERT INTO trainers (
  slug, name, title, bio,
  avatar_url, specialties, certifications,
  years_experience, clients_trained, avg_rating, review_count, price_from,
  city, country, whatsapp, instagram_handle,
  training_modes, verification_status, tier,
  accepting_clients, is_demo, locale, market
) VALUES (
  'marcus-johnson',
  'Marcus Johnson',
  'Strength & Body Composition Coach',
  'I train high-performers in New York who want to build muscle, lose fat, and feel elite. 11 years coaching, 500+ clients, NSCA CSCS certified. I work from a private gym in Midtown and online globally. My programmes are built on science, not trends.',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=85',
  ARRAY['Strength Training','Body Composition','Muscle Gain','Performance'],
  ARRAY['NSCA CSCS','NASM CPT','Precision Nutrition Level 2'],
  11, 510, 4.9, 67, 120,
  'New York', 'USA', '+12125550001', 'marcus.johnson.fit',
  ARRAY['in-person','online'], 'verified', 'pro',
  TRUE, TRUE, 'en-us', 'us'
) ON CONFLICT (slug) DO UPDATE SET
  avatar_url = EXCLUDED.avatar_url,
  market = EXCLUDED.market,
  locale = EXCLUDED.locale,
  is_demo = TRUE;

INSERT INTO trainers (
  slug, name, title, bio,
  avatar_url, specialties, certifications,
  years_experience, clients_trained, avg_rating, review_count, price_from,
  city, country, whatsapp, instagram_handle,
  training_modes, verification_status, tier,
  accepting_clients, is_demo, locale, market
) VALUES (
  'ashley-rivera',
  'Ashley Rivera',
  'Functional Fitness & Pilates Coach',
  'I help women in Los Angeles build functional strength, improve posture, and feel confident in their bodies. ACE certified, Balanced Body Pilates instructor. I blend strength training with Pilates principles for results that last. Studio in Silver Lake, online worldwide.',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=85',
  ARRAY['Pilates','Functional Fitness','Posture','Womens Health'],
  ARRAY['ACE CPT','Balanced Body Pilates','FMS Level 2'],
  7, 310, 5.0, 44, 100,
  'Los Angeles', 'USA', '+13105550002', 'ashley.rivera.fit',
  ARRAY['in-person','online'], 'verified', 'pro',
  TRUE, TRUE, 'en-us', 'us'
) ON CONFLICT (slug) DO UPDATE SET
  avatar_url = EXCLUDED.avatar_url,
  market = EXCLUDED.market,
  locale = EXCLUDED.locale,
  is_demo = TRUE;

INSERT INTO trainers (
  slug, name, title, bio,
  avatar_url, specialties, certifications,
  years_experience, clients_trained, avg_rating, review_count, price_from,
  city, country, whatsapp, instagram_handle,
  training_modes, verification_status, tier,
  accepting_clients, is_demo, locale, market
) VALUES (
  'derek-kim',
  'Derek Kim',
  'Athletic Performance & Speed Coach',
  'Former D1 track athlete, now coaching athletes and fitness enthusiasts in Chicago. NSCA CSCS, USA Track and Field Level 2. I specialise in speed, power, and athletic conditioning. If you want to move like an athlete, I am your coach.',
  'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=800&q=85',
  ARRAY['Athletic Performance','Speed','Power','Conditioning'],
  ARRAY['NSCA CSCS','USAW Level 2','USATF Level 2'],
  8, 260, 4.8, 35, 110,
  'Chicago', 'USA', '+13125550003', 'derek.kim.speed',
  ARRAY['in-person','online'], 'verified', 'free',
  TRUE, TRUE, 'en-us', 'us'
) ON CONFLICT (slug) DO UPDATE SET
  avatar_url = EXCLUDED.avatar_url,
  market = EXCLUDED.market,
  locale = EXCLUDED.locale,
  is_demo = TRUE;

-- Packages: US trainers
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Intro Session', 120, 'USD', 60, 1, 'First session includes a full assessment and programme overview.', FALSE, 1
FROM trainers WHERE slug = 'marcus-johnson' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, '12-Session Block', 1200, 'USD', 60, 12, '12 sessions over 6 weeks. Full programme, nutrition guidance, weekly check-ins.', TRUE, 2
FROM trainers WHERE slug = 'marcus-johnson' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Online Coaching', 350, 'USD', NULL, NULL, 'Monthly online coaching. Programme, check-ins, and messaging support.', FALSE, 3
FROM trainers WHERE slug = 'marcus-johnson' ON CONFLICT DO NOTHING;

INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Single Session', 100, 'USD', 55, 1, 'One 55-minute Pilates or functional fitness session at my Silver Lake studio.', FALSE, 1
FROM trainers WHERE slug = 'ashley-rivera' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, '8-Session Block', 720, 'USD', 55, 8, '8 sessions over 4 weeks. Personalised programme and posture assessment.', TRUE, 2
FROM trainers WHERE slug = 'ashley-rivera' ON CONFLICT DO NOTHING;

INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Single Session', 110, 'USD', 60, 1, 'One 60-minute athletic performance session.', FALSE, 1
FROM trainers WHERE slug = 'derek-kim' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, '8-Week Speed Programme', 780, 'USD', NULL, NULL, '8-week speed and power programme with 2 sessions per week and weekly analysis.', TRUE, 2
FROM trainers WHERE slug = 'derek-kim' ON CONFLICT DO NOTHING;

-- ============================================================
-- France (coachepar.fr) — EUR, BPJEPS/STAPS, Paris/Lyon
-- ============================================================

INSERT INTO trainers (
  slug, name, title, bio,
  avatar_url, specialties, certifications,
  years_experience, clients_trained, avg_rating, review_count, price_from,
  city, country, whatsapp, instagram_handle,
  training_modes, verification_status, tier,
  accepting_clients, is_demo, locale, market
) VALUES (
  'thomas-moreau',
  'Thomas Moreau',
  'Coach Force et Conditionnement',
  'Je coache des professionnels parisiens qui veulent gagner en force et perdre du gras sans passer leur vie en salle. Diplome BPJEPS AF, 8 ans d experience, 290 clients. Mes seances durent 50 minutes - structurees, efficaces, sans remplissage. Si vous voulez un coach qui vous dit exactement quoi faire et pourquoi, je suis la bonne personne.',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=85',
  ARRAY['Force','Perte de Poids','Conditionnement','Nutrition'],
  ARRAY['BPJEPS Activites Physiques','STAPS Licence','Precision Nutrition Level 1'],
  8, 290, 4.9, 43, 75,
  'Paris', 'France', '+33612345678', 'thomas.moreau.coach',
  ARRAY['in-person','online'], 'verified', 'pro',
  TRUE, TRUE, 'fr', 'fr'
) ON CONFLICT (slug) DO UPDATE SET
  avatar_url = EXCLUDED.avatar_url,
  market = EXCLUDED.market,
  locale = EXCLUDED.locale,
  is_demo = TRUE;

INSERT INTO trainers (
  slug, name, title, bio,
  avatar_url, specialties, certifications,
  years_experience, clients_trained, avg_rating, review_count, price_from,
  city, country, whatsapp, instagram_handle,
  training_modes, verification_status, tier,
  accepting_clients, is_demo, locale, market
) VALUES (
  'camille-dubois',
  'Camille Dubois',
  'Coach Pilates et Bien-etre',
  'Je specialise dans le Pilates reformer et le renforcement musculaire pour les femmes a Lyon. Formatrice certifiee BPJEPS, instructrice Pilates certifiee. Je combine la methode Pilates avec un travail de force fonctionnel pour des resultats durables. Studio prive a Lyon, coaching en ligne disponible.',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=85',
  ARRAY['Pilates','Renforcement Musculaire','Sante Feminine','Bien-etre'],
  ARRAY['BPJEPS Activites Physiques','Pilates Reformer Certified','Pre/Postnatal Specialist'],
  6, 175, 5.0, 31, 80,
  'Lyon', 'France', '+33623456789', 'camille.pilates.lyon',
  ARRAY['in-person','online'], 'verified', 'pro',
  TRUE, TRUE, 'fr', 'fr'
) ON CONFLICT (slug) DO UPDATE SET
  avatar_url = EXCLUDED.avatar_url,
  market = EXCLUDED.market,
  locale = EXCLUDED.locale,
  is_demo = TRUE;

INSERT INTO trainers (
  slug, name, title, bio,
  avatar_url, specialties, certifications,
  years_experience, clients_trained, avg_rating, review_count, price_from,
  city, country, whatsapp, instagram_handle,
  training_modes, verification_status, tier,
  accepting_clients, is_demo, locale, market
) VALUES (
  'antoine-leroy',
  'Antoine Leroy',
  'Coach Running et Performance',
  'Ancien coureur de demi-fond, je coache maintenant des coureurs de tous niveaux a Bordeaux. BPJEPS AF, entraineur FFA niveau 2. Du 5 km au marathon, je construis des plans d entrainement bases sur la science et adaptes a votre vie. Disponible en presentiel a Bordeaux et en ligne partout en France.',
  'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=85',
  ARRAY['Running','Endurance','Marathon','Performance'],
  ARRAY['BPJEPS Activites Physiques','FFA Entraineur Niveau 2','Nutrition du Sport'],
  5, 140, 4.8, 24, 65,
  'Bordeaux', 'France', '+33634567890', 'antoine.running.fr',
  ARRAY['in-person','online'], 'verified', 'free',
  TRUE, TRUE, 'fr', 'fr'
) ON CONFLICT (slug) DO UPDATE SET
  avatar_url = EXCLUDED.avatar_url,
  market = EXCLUDED.market,
  locale = EXCLUDED.locale,
  is_demo = TRUE;

-- Packages: France trainers
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Seance Decouverte', 75, 'EUR', 50, 1, 'Premiere seance avec bilan posture et objectifs. Remboursee si vous prenez un forfait.', FALSE, 1
FROM trainers WHERE slug = 'thomas-moreau' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Forfait 10 Seances', 650, 'EUR', 50, 10, '10 seances sur 5 semaines. Programme individualise et suivi WhatsApp.', TRUE, 2
FROM trainers WHERE slug = 'thomas-moreau' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Coaching en Ligne', 200, 'EUR', NULL, NULL, 'Coaching mensuel en ligne. Programme, bilans hebdomadaires et support WhatsApp.', FALSE, 3
FROM trainers WHERE slug = 'thomas-moreau' ON CONFLICT DO NOTHING;

INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Seance Individuelle', 80, 'EUR', 55, 1, 'Une seance de Pilates reformer ou renforcement musculaire.', FALSE, 1
FROM trainers WHERE slug = 'camille-dubois' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Forfait 8 Seances', 580, 'EUR', 55, 8, '8 seances en 4 semaines. Bilan postural et programme personnalise.', TRUE, 2
FROM trainers WHERE slug = 'camille-dubois' ON CONFLICT DO NOTHING;

INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Seance Running', 65, 'EUR', 60, 1, 'Une seance de coaching running avec analyse de foullee.', FALSE, 1
FROM trainers WHERE slug = 'antoine-leroy' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Plan Marathon 12 Semaines', 380, 'EUR', NULL, NULL, 'Plan marathon 12 semaines avec bilans hebdomadaires et ajustements en temps reel.', TRUE, 2
FROM trainers WHERE slug = 'antoine-leroy' ON CONFLICT DO NOTHING;

-- ============================================================
-- Italy (allenaticon.it) — EUR, EQF/CONI/FIPE, Milan/Rome
-- ============================================================

INSERT INTO trainers (
  slug, name, title, bio,
  avatar_url, specialties, certifications,
  years_experience, clients_trained, avg_rating, review_count, price_from,
  city, country, whatsapp, instagram_handle,
  training_modes, verification_status, tier,
  accepting_clients, is_demo, locale, market
) VALUES (
  'giulia-romano',
  'Giulia Romano',
  'Coach Composizione Corporea e Forza',
  'Alleno clienti a Milano che vogliono migliorare la composizione corporea e la forza funzionale. Laureata in Scienze Motorie, certificata CONI, 6 anni di esperienza con oltre 180 clienti seguiti. Le mie sessioni durano 55 minuti e sono strutturate al minuto. Niente improvvisazione.',
  'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=800&q=85',
  ARRAY['Composizione Corporea','Forza Funzionale','Allenamento Femminile','Postura e Mobilita'],
  ARRAY['Laurea in Scienze Motorie (Universita degli Studi di Milano)','CONI Personal Trainer','FIF Pilates'],
  6, 180, 4.9, 36, 70,
  'Milano', 'Italy', '+39312345678', 'giulia.romano.coach',
  ARRAY['in-person','online'], 'verified', 'pro',
  TRUE, TRUE, 'it', 'it'
) ON CONFLICT (slug) DO UPDATE SET
  avatar_url = EXCLUDED.avatar_url,
  market = EXCLUDED.market,
  locale = EXCLUDED.locale,
  is_demo = TRUE;

INSERT INTO trainers (
  slug, name, title, bio,
  avatar_url, specialties, certifications,
  years_experience, clients_trained, avg_rating, review_count, price_from,
  city, country, whatsapp, instagram_handle,
  training_modes, verification_status, tier,
  accepting_clients, is_demo, locale, market
) VALUES (
  'marco-ferrari',
  'Marco Ferrari',
  'Coach Forza e Powerlifting',
  'Alleno atleti e appassionati di forza a Roma. Istruttore FIPE, Laurea in Scienze Motorie. Specializzato in powerlifting, forza massimale e programmazione avanzata. Se vuoi imparare a sollevare bene e diventare piu forte ogni settimana, sono il coach giusto.',
  'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=800&q=85',
  ARRAY['Powerlifting','Forza Massimale','Programmazione Avanzata','Tecnica di Sollevamento'],
  ARRAY['FIPE Istruttore di Pesistica','Laurea in Scienze Motorie','EQF Livello 5'],
  9, 240, 4.8, 44, 65,
  'Roma', 'Italy', '+39323456789', 'marco.ferrari.forza',
  ARRAY['in-person','online'], 'verified', 'pro',
  TRUE, TRUE, 'it', 'it'
) ON CONFLICT (slug) DO UPDATE SET
  avatar_url = EXCLUDED.avatar_url,
  market = EXCLUDED.market,
  locale = EXCLUDED.locale,
  is_demo = TRUE;

INSERT INTO trainers (
  slug, name, title, bio,
  avatar_url, specialties, certifications,
  years_experience, clients_trained, avg_rating, review_count, price_from,
  city, country, whatsapp, instagram_handle,
  training_modes, verification_status, tier,
  accepting_clients, is_demo, locale, market
) VALUES (
  'sofia-bianchi',
  'Sofia Bianchi',
  'Coach Nutrizione e Benessere',
  'Specializzata in nutrizione sportiva e perdita di peso sostenibile per donne a Torino. Biologa nutrizionista, personal trainer certificata CONI. Combino allenamento e nutrizione per risultati concreti e duraturi. Niente diete drastiche, niente protocolli estremi.',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=85',
  ARRAY['Nutrizione Sportiva','Perdita di Peso','Salute Femminile','Benessere'],
  ARRAY['Biologa Nutrizionista','CONI Personal Trainer','Specialista Pre/Post Parto'],
  5, 155, 5.0, 27, 75,
  'Torino', 'Italy', '+39334567890', 'sofia.bianchi.wellness',
  ARRAY['in-person','online'], 'verified', 'free',
  TRUE, TRUE, 'it', 'it'
) ON CONFLICT (slug) DO UPDATE SET
  avatar_url = EXCLUDED.avatar_url,
  market = EXCLUDED.market,
  locale = EXCLUDED.locale,
  is_demo = TRUE;

-- Packages: Italy trainers
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Sessione Singola', 70, 'EUR', 55, 1, 'Una sessione di allenamento personalizzato di 55 minuti.', FALSE, 1
FROM trainers WHERE slug = 'giulia-romano' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Pacchetto 10 Sessioni', 620, 'EUR', 55, 10, 'Il mio pacchetto piu richiesto. 10 sessioni con valutazione iniziale e programma dedicato.', TRUE, 2
FROM trainers WHERE slug = 'giulia-romano' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Coaching Online Mensile', 180, 'EUR', NULL, NULL, 'Coaching mensile online. Check-in settimanali, programma completo e supporto WhatsApp.', FALSE, 3
FROM trainers WHERE slug = 'giulia-romano' ON CONFLICT DO NOTHING;

INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Sessione Singola', 65, 'EUR', 60, 1, 'Una sessione di powerlifting o forza massimale.', FALSE, 1
FROM trainers WHERE slug = 'marco-ferrari' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Blocco 12 Sessioni', 700, 'EUR', 60, 12, '12 sessioni in 6 settimane. Programmazione avanzata e analisi tecnica video.', TRUE, 2
FROM trainers WHERE slug = 'marco-ferrari' ON CONFLICT DO NOTHING;

INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Sessione Singola', 75, 'EUR', 60, 1, 'Una sessione di consulenza nutrizionale e allenamento.', FALSE, 1
FROM trainers WHERE slug = 'sofia-bianchi' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Programma 12 Settimane', 750, 'EUR', NULL, NULL, '12 settimane di coaching nutrizionale e allenamento con check-in settimanali.', TRUE, 2
FROM trainers WHERE slug = 'sofia-bianchi' ON CONFLICT DO NOTHING;

-- ============================================================
-- Spain / LatAm (entrenacon.com) — EUR, NSCA/ISSA/CFES, Madrid/Barcelona
-- ============================================================

INSERT INTO trainers (
  slug, name, title, bio,
  avatar_url, specialties, certifications,
  years_experience, clients_trained, avg_rating, review_count, price_from,
  city, country, whatsapp, instagram_handle,
  training_modes, verification_status, tier,
  accepting_clients, is_demo, locale, market
) VALUES (
  'lucia-fernandez',
  'Lucia Fernandez',
  'Entrenadora de Fuerza y Composicion Corporal',
  'Entreno a profesionales en Madrid que quieren ganar fuerza y perder grasa sin pasar horas en el gimnasio. Licenciada en Ciencias del Deporte, certificada NSCA. 7 anos de experiencia, mas de 260 clientes. Mis sesiones duran 55 minutos y estan estructuradas al minuto. Sin relleno, sin improvisacion.',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=85',
  ARRAY['Fuerza','Composicion Corporal','HIIT','Nutricion'],
  ARRAY['NSCA-CPT','Licenciatura en Ciencias del Deporte','Precision Nutrition Level 1'],
  7, 260, 4.9, 39, 55,
  'Madrid', 'Spain', '+34612345678', 'lucia.fernandez.fit',
  ARRAY['in-person','online'], 'verified', 'pro',
  TRUE, TRUE, 'es', 'es'
) ON CONFLICT (slug) DO UPDATE SET
  avatar_url = EXCLUDED.avatar_url,
  market = EXCLUDED.market,
  locale = EXCLUDED.locale,
  is_demo = TRUE;

INSERT INTO trainers (
  slug, name, title, bio,
  avatar_url, specialties, certifications,
  years_experience, clients_trained, avg_rating, review_count, price_from,
  city, country, whatsapp, instagram_handle,
  training_modes, verification_status, tier,
  accepting_clients, is_demo, locale, market
) VALUES (
  'pablo-garcia',
  'Pablo Garcia',
  'Entrenador de Rendimiento Atletico',
  'Ex atleta universitario, ahora entreno a deportistas y aficionados al fitness en Barcelona. NSCA CSCS, Licenciado en CAFE. Especializado en velocidad, potencia y acondicionamiento atletico. Si quieres moverte como un atleta y rendir al maximo, soy tu entrenador.',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=85',
  ARRAY['Rendimiento Atletico','Velocidad','Potencia','Acondicionamiento'],
  ARRAY['NSCA CSCS','Licenciatura CAFE','Entrenador Nacional de Atletismo'],
  8, 210, 4.8, 32, 60,
  'Barcelona', 'Spain', '+34623456789', 'pablo.garcia.sport',
  ARRAY['in-person','online'], 'verified', 'pro',
  TRUE, TRUE, 'es', 'es'
) ON CONFLICT (slug) DO UPDATE SET
  avatar_url = EXCLUDED.avatar_url,
  market = EXCLUDED.market,
  locale = EXCLUDED.locale,
  is_demo = TRUE;

INSERT INTO trainers (
  slug, name, title, bio,
  avatar_url, specialties, certifications,
  years_experience, clients_trained, avg_rating, review_count, price_from,
  city, country, whatsapp, instagram_handle,
  training_modes, verification_status, tier,
  accepting_clients, is_demo, locale, market
) VALUES (
  'ana-martinez',
  'Ana Martinez',
  'Entrenadora de Yoga y Bienestar',
  'Especializada en yoga terapeutico y entrenamiento funcional para mujeres en Valencia. Instructora de yoga certificada RYT 500, personal trainer ISSA. Combino yoga, movilidad y fuerza para mejorar tu calidad de vida. Clases presenciales en Valencia y online para toda Espana.',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=85',
  ARRAY['Yoga','Movilidad','Bienestar Femenino','Entrenamiento Funcional'],
  ARRAY['RYT 500 Yoga Alliance','ISSA Personal Trainer','Especialista en Yoga Terapeutico'],
  6, 190, 5.0, 33, 50,
  'Valencia', 'Spain', '+34634567890', 'ana.martinez.yoga',
  ARRAY['in-person','online'], 'verified', 'free',
  TRUE, TRUE, 'es', 'es'
) ON CONFLICT (slug) DO UPDATE SET
  avatar_url = EXCLUDED.avatar_url,
  market = EXCLUDED.market,
  locale = EXCLUDED.locale,
  is_demo = TRUE;

-- Packages: Spain trainers
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Sesion Individual', 55, 'EUR', 55, 1, 'Una sesion de 55 minutos de entrenamiento de fuerza personalizado.', FALSE, 1
FROM trainers WHERE slug = 'lucia-fernandez' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Bono 10 Sesiones', 490, 'EUR', 55, 10, '10 sesiones en 5 semanas. Incluye plan de entrenamiento y seguimiento nutricional.', TRUE, 2
FROM trainers WHERE slug = 'lucia-fernandez' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Coaching Online Mensual', 150, 'EUR', NULL, NULL, 'Coaching mensual online. Programa, seguimiento semanal y soporte por WhatsApp.', FALSE, 3
FROM trainers WHERE slug = 'lucia-fernandez' ON CONFLICT DO NOTHING;

INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Sesion Individual', 60, 'EUR', 60, 1, 'Una sesion de 60 minutos de rendimiento atletico.', FALSE, 1
FROM trainers WHERE slug = 'pablo-garcia' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Programa 8 Semanas', 420, 'EUR', NULL, NULL, 'Programa de 8 semanas de velocidad y potencia con 2 sesiones por semana.', TRUE, 2
FROM trainers WHERE slug = 'pablo-garcia' ON CONFLICT DO NOTHING;

INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Clase Individual', 50, 'EUR', 60, 1, 'Una clase de yoga terapeutico o entrenamiento funcional.', FALSE, 1
FROM trainers WHERE slug = 'ana-martinez' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Bono 8 Clases', 360, 'EUR', 60, 8, '8 clases en 4 semanas. Programa personalizado de yoga y movilidad.', TRUE, 2
FROM trainers WHERE slug = 'ana-martinez' ON CONFLICT DO NOTHING;

-- ============================================================
-- India (trainedby.in) — INR, TrainedBy Verified, Mumbai/Delhi
-- ============================================================

INSERT INTO trainers (
  slug, name, title, bio,
  avatar_url, specialties, certifications,
  years_experience, clients_trained, avg_rating, review_count, price_from,
  city, country, whatsapp, instagram_handle,
  training_modes, verification_status, tier,
  accepting_clients, is_demo, locale, market
) VALUES (
  'arjun-sharma',
  'Arjun Sharma',
  'Strength & Nutrition Coach',
  'I help working professionals in Mumbai build strength and manage their nutrition without complicated protocols. ACE certified, 8 years coaching, 300+ clients. I work from a private studio in Bandra and online across India. My approach is simple: consistent effort, smart programming, real results.',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=85',
  ARRAY['Strength Training','Nutrition','Fat Loss','Muscle Gain'],
  ARRAY['ACE CPT','Precision Nutrition Level 1','TrainedBy Verified'],
  8, 310, 4.9, 47, 2500,
  'Mumbai', 'India', '+919876543210', 'arjun.sharma.fit',
  ARRAY['in-person','online'], 'verified', 'pro',
  TRUE, TRUE, 'en-in', 'in'
) ON CONFLICT (slug) DO UPDATE SET
  avatar_url = EXCLUDED.avatar_url,
  market = EXCLUDED.market,
  locale = EXCLUDED.locale,
  is_demo = TRUE;

INSERT INTO trainers (
  slug, name, title, bio,
  avatar_url, specialties, certifications,
  years_experience, clients_trained, avg_rating, review_count, price_from,
  city, country, whatsapp, instagram_handle,
  training_modes, verification_status, tier,
  accepting_clients, is_demo, locale, market
) VALUES (
  'priya-kapoor',
  'Priya Kapoor',
  'Yoga and Functional Fitness Coach',
  'I combine traditional yoga with modern functional training for women in Delhi. RYT 500 certified, ISSA personal trainer. 6 years experience, 200+ clients. I specialise in helping women build strength, improve flexibility, and reduce stress. Online coaching available across India.',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=85',
  ARRAY['Yoga','Functional Fitness','Womens Health','Stress Management'],
  ARRAY['RYT 500 Yoga Alliance','ISSA CPT','Pre/Postnatal Specialist'],
  6, 200, 5.0, 34, 2000,
  'Delhi', 'India', '+919876543211', 'priya.kapoor.yoga',
  ARRAY['in-person','online'], 'verified', 'pro',
  TRUE, TRUE, 'en-in', 'in'
) ON CONFLICT (slug) DO UPDATE SET
  avatar_url = EXCLUDED.avatar_url,
  market = EXCLUDED.market,
  locale = EXCLUDED.locale,
  is_demo = TRUE;

INSERT INTO trainers (
  slug, name, title, bio,
  avatar_url, specialties, certifications,
  years_experience, clients_trained, avg_rating, review_count, price_from,
  city, country, whatsapp, instagram_handle,
  training_modes, verification_status, tier,
  accepting_clients, is_demo, locale, market
) VALUES (
  'rohit-verma',
  'Rohit Verma',
  'Athletic Performance & Cricket Conditioning Coach',
  'Former state-level cricketer, now coaching athletes and fitness enthusiasts in Bangalore. NSCA certified, specialised in cricket conditioning and athletic performance. I work with cricketers, runners, and anyone who wants to move and perform better. Studio in Indiranagar, online across India.',
  'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=800&q=85',
  ARRAY['Athletic Performance','Cricket Conditioning','Speed','Agility'],
  ARRAY['NSCA-CPT','Cricket Conditioning Specialist','TrainedBy Verified'],
  7, 165, 4.8, 26, 2200,
  'Bangalore', 'India', '+919876543212', 'rohit.verma.coach',
  ARRAY['in-person','online'], 'verified', 'free',
  TRUE, TRUE, 'en-in', 'in'
) ON CONFLICT (slug) DO UPDATE SET
  avatar_url = EXCLUDED.avatar_url,
  market = EXCLUDED.market,
  locale = EXCLUDED.locale,
  is_demo = TRUE;

-- Packages: India trainers
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Single Session', 2500, 'INR', 60, 1, 'One 60-minute strength or nutrition session at my Bandra studio.', FALSE, 1
FROM trainers WHERE slug = 'arjun-sharma' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Monthly Online Coaching', 8000, 'INR', NULL, NULL, 'Full monthly programme, weekly check-ins, WhatsApp support. No commute required.', TRUE, 2
FROM trainers WHERE slug = 'arjun-sharma' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, '12-Session Block', 25000, 'INR', 60, 12, '12 sessions over 6 weeks. Full programme, nutrition guidance, and weekly reviews.', FALSE, 3
FROM trainers WHERE slug = 'arjun-sharma' ON CONFLICT DO NOTHING;

INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Single Session', 2000, 'INR', 60, 1, 'One 60-minute yoga or functional fitness session.', FALSE, 1
FROM trainers WHERE slug = 'priya-kapoor' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Monthly Coaching', 7000, 'INR', NULL, NULL, 'Monthly yoga and fitness coaching. Weekly sessions and WhatsApp support.', TRUE, 2
FROM trainers WHERE slug = 'priya-kapoor' ON CONFLICT DO NOTHING;

INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, 'Single Session', 2200, 'INR', 60, 1, 'One 60-minute athletic performance or conditioning session.', FALSE, 1
FROM trainers WHERE slug = 'rohit-verma' ON CONFLICT DO NOTHING;
INSERT INTO session_packages (trainer_id, name, price, currency, duration, sessions, description, is_featured, sort_order)
SELECT id, '8-Week Performance Programme', 14000, 'INR', NULL, NULL, '8-week athletic performance programme with 2 sessions per week and weekly analysis.', TRUE, 2
FROM trainers WHERE slug = 'rohit-verma' ON CONFLICT DO NOTHING;
