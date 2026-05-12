-- NYC Trainer Seed Profiles
-- 15 demo trainers spread across NYC neighborhoods for trainedby.com launch.
-- All profiles marked is_demo = true for clean removal once real trainers join.
-- market = 'com', locale = 'en-us'
-- Idempotent: ON CONFLICT (slug) DO NOTHING

-- ── Manhattan: Midtown ────────────────────────────────────────────────────────
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
  'marcus-johnson-nyc',
  'Marcus Johnson',
  'Strength & Fat Loss Coach — Midtown Manhattan',
  'I train executives and professionals in Midtown who need real results without spending their life in the gym. 8 years, 290 clients, NASM-CPT certified. My sessions run 50 minutes — structured, progressive, no filler. If you want a trainer who programs based on data and holds you accountable, I am the right fit.',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=85',
  ARRAY['Strength Training', 'Fat Loss', 'Executive Fitness', 'Nutrition Coaching'],
  ARRAY['NASM-CPT', 'Precision Nutrition Level 1'],
  'NASM-CPT-847291', TRUE, 'Certified',
  8, 290,
  'New York City', 'USA', NULL, '@marcusjohnsonfit',
  'pro', 'verified', TRUE,
  4.9, 52, 400,
  TRUE, TRUE, 'en-us', 'com'
) ON CONFLICT (slug) DO NOTHING;

-- ── Manhattan: Upper East Side ────────────────────────────────────────────────
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
  'sarah-chen-ues',
  'Sarah Chen',
  'Women''s Strength Coach — Upper East Side',
  'I specialize in strength training for women who are done with cardio that gets them nowhere. ACE certified, 6 years, 180 clients. My clients lift heavier than they thought possible and feel better than they have in years. Based on the UES, I train at private studios and in-home.',
  'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=800&q=85',
  ARRAY['Women''s Strength', 'Body Recomposition', 'Mobility', 'Postpartum Fitness'],
  ARRAY['ACE-CPT', 'NASM Women''s Fitness Specialist'],
  'ACE-CPT-392847', TRUE, 'Certified',
  6, 180,
  'New York City', 'USA', NULL, '@sarahchenfitness',
  'pro', 'verified', TRUE,
  4.8, 38, 450,
  TRUE, TRUE, 'en-us', 'com'
) ON CONFLICT (slug) DO NOTHING;

-- ── Manhattan: Downtown (Tribeca / FiDi) ──────────────────────────────────────
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
  'david-rivera-tribeca',
  'David Rivera',
  'Athletic Performance Coach — Tribeca',
  'Former Division I soccer player. I train athletes, weekend warriors, and finance professionals who want to move and perform like athletes. NSCA-CSCS certified, 10 years, 320 clients. My programming is built around movement quality first, load second.',
  'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800&q=85',
  ARRAY['Athletic Performance', 'Speed & Agility', 'Injury Prevention', 'HIIT'],
  ARRAY['NSCA-CSCS', 'ACE-CPT', 'FMS Level 2'],
  'NSCA-CSCS-193847', TRUE, 'Certified',
  10, 320,
  'New York City', 'USA', NULL, '@davidriveracscs',
  'pro', 'verified', TRUE,
  4.9, 61, 500,
  TRUE, TRUE, 'en-us', 'com'
) ON CONFLICT (slug) DO NOTHING;

-- ── Manhattan: West Village ───────────────────────────────────────────────────
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
  'emily-walsh-west-village',
  'Emily Walsh',
  'Pilates & Functional Fitness — West Village',
  'I combine Pilates fundamentals with functional strength work to create balanced, injury-resistant bodies. NASM certified with advanced Pilates training, 5 years, 140 clients. I train in-home in the West Village, Chelsea, and SoHo.',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=85',
  ARRAY['Pilates', 'Functional Fitness', 'Core Strength', 'Flexibility'],
  ARRAY['NASM-CPT', 'Comprehensive Pilates Certification (BASI)'],
  'NASM-CPT-558291', TRUE, 'Certified',
  5, 140,
  'New York City', 'USA', NULL, '@emilywalshmoves',
  'pro', 'verified', TRUE,
  4.8, 29, 380,
  TRUE, TRUE, 'en-us', 'com'
) ON CONFLICT (slug) DO NOTHING;

-- ── Manhattan: Harlem ─────────────────────────────────────────────────────────
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
  'james-okafor-harlem',
  'James Okafor',
  'Bodybuilding & Muscle Building — Harlem',
  'I am a natural bodybuilder and NSCA-certified coach who helps men build serious muscle the right way. No shortcuts, no gimmicks. 7 years, 210 clients. I train clients in commercial gyms across Upper Manhattan and the Bronx. If you want to actually look like you lift, let''s talk.',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=85',
  ARRAY['Bodybuilding', 'Muscle Building', 'Powerlifting', 'Nutrition Planning'],
  ARRAY['NSCA-CPT', 'ISSA Bodybuilding Specialist'],
  'NSCA-CPT-672918', TRUE, 'Certified',
  7, 210,
  'New York City', 'USA', NULL, '@jamesokaforfit',
  'pro', 'verified', TRUE,
  4.7, 44, 350,
  TRUE, TRUE, 'en-us', 'com'
) ON CONFLICT (slug) DO NOTHING;

-- ── Brooklyn: Williamsburg ────────────────────────────────────────────────────
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
  'alex-torres-williamsburg',
  'Alex Torres',
  'CrossFit & Conditioning Coach — Williamsburg',
  'CrossFit Level 2 trainer and NASM certified. I work with people who want to get genuinely fit — not just look fit. 6 years, 230 clients. I program for the person in front of me, not a generic template. Based in Williamsburg, I also work with remote clients.',
  'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&q=85',
  ARRAY['CrossFit', 'Conditioning', 'Olympic Weightlifting', 'Endurance'],
  ARRAY['NASM-CPT', 'CrossFit Level 2 Trainer'],
  'NASM-CPT-447382', TRUE, 'Certified',
  6, 230,
  'New York City', 'USA', NULL, '@alextorrescoach',
  'pro', 'verified', TRUE,
  4.8, 41, 320,
  TRUE, TRUE, 'en-us', 'com'
) ON CONFLICT (slug) DO NOTHING;

-- ── Brooklyn: Park Slope ──────────────────────────────────────────────────────
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
  'nina-patel-park-slope',
  'Nina Patel',
  'Pre/Postnatal & Women''s Wellness — Park Slope',
  'I specialize in keeping women strong and safe through pregnancy and postpartum recovery. ACE certified with pre/postnatal specialization, 9 years, 260 clients. I train in-home in Park Slope, Carroll Gardens, and Cobble Hill. Moms trust me because I have been through it myself.',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=85',
  ARRAY['Pre/Postnatal Fitness', 'Women''s Health', 'Core Restoration', 'Gentle Strength'],
  ARRAY['ACE-CPT', 'ACE Pre/Postnatal Fitness Specialist'],
  'ACE-CPT-283746', TRUE, 'Certified',
  9, 260,
  'New York City', 'USA', NULL, '@ninapatelfitness',
  'pro', 'verified', TRUE,
  4.9, 57, 420,
  TRUE, TRUE, 'en-us', 'com'
) ON CONFLICT (slug) DO NOTHING;

-- ── Brooklyn: Crown Heights ───────────────────────────────────────────────────
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
  'michael-brown-crown-heights',
  'Michael Brown',
  'Weight Loss & Habit Coach — Crown Heights',
  'I help people lose weight and keep it off by changing the habits that caused the problem. NASM certified with behavior change certification. 5 years, 175 clients. My program is 80% lifestyle, 20% gym. If you have tried everything and the weight keeps coming back, that is my specialty.',
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=85',
  ARRAY['Weight Loss', 'Habit Coaching', 'Nutrition', 'Beginner Fitness'],
  ARRAY['NASM-CPT', 'NASM Behavior Change Specialist'],
  'NASM-CPT-918273', TRUE, 'Certified',
  5, 175,
  'New York City', 'USA', NULL, '@michaelbrowncoach',
  'pro', 'verified', TRUE,
  4.7, 33, 300,
  TRUE, TRUE, 'en-us', 'com'
) ON CONFLICT (slug) DO NOTHING;

-- ── Queens: Astoria ───────────────────────────────────────────────────────────
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
  'diana-kostadinova-astoria',
  'Diana Kostadinova',
  'Olympic Lifting & Strength Coach — Astoria',
  'Former competitive weightlifter. I teach people to lift heavy things correctly. NSCA-CSCS and USA Weightlifting certified, 8 years, 195 clients. Based in Astoria with access to a full weightlifting platform. If you want to learn the snatch and clean & jerk, I am the coach for you.',
  'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&q=85',
  ARRAY['Olympic Weightlifting', 'Powerlifting', 'Strength & Conditioning', 'Competition Prep'],
  ARRAY['NSCA-CSCS', 'USA Weightlifting Level 1'],
  'NSCA-CSCS-374829', TRUE, 'Certified',
  8, 195,
  'New York City', 'USA', NULL, '@dianakcoach',
  'pro', 'verified', TRUE,
  4.9, 48, 480,
  TRUE, TRUE, 'en-us', 'com'
) ON CONFLICT (slug) DO NOTHING;

-- ── Queens: Long Island City ──────────────────────────────────────────────────
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
  'ryan-kim-lic',
  'Ryan Kim',
  'Running & Endurance Coach — Long Island City',
  'Marathon runner and endurance coach. I help people run their first 5K, qualify for Boston, and everything in between. ACE certified, USATF Level 1 coach, 7 years, 220 clients. LIC is perfect for training — direct access to the waterfront and Queensbridge Park.',
  'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=85',
  ARRAY['Running Coaching', 'Marathon Training', 'Endurance', 'Injury Prevention'],
  ARRAY['ACE-CPT', 'USATF Level 1 Coach'],
  'ACE-CPT-192837', TRUE, 'Certified',
  7, 220,
  'New York City', 'USA', NULL, '@ryankimruns',
  'pro', 'verified', TRUE,
  4.8, 39, 360,
  TRUE, TRUE, 'en-us', 'com'
) ON CONFLICT (slug) DO NOTHING;

-- ── Queens: Jackson Heights ───────────────────────────────────────────────────
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
  'priya-sharma-jackson-heights',
  'Priya Sharma',
  'Yoga-Integrated Strength — Jackson Heights',
  'I blend functional strength training with yoga-based mobility to create balanced, injury-resistant bodies. NASM certified with Yoga Alliance RYT-200. 6 years, 160 clients. I offer morning sessions before the commute. Serving Jackson Heights, Woodside, and Elmhurst.',
  'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800&q=85',
  ARRAY['Strength Training', 'Yoga', 'Mobility', 'Stress Reduction'],
  ARRAY['NASM-CPT', 'Yoga Alliance RYT-200'],
  'NASM-CPT-563819', TRUE, 'Certified',
  6, 160,
  'New York City', 'USA', NULL, '@priyasharmafit',
  'pro', 'verified', TRUE,
  4.8, 31, 330,
  TRUE, TRUE, 'en-us', 'com'
) ON CONFLICT (slug) DO NOTHING;

-- ── The Bronx ─────────────────────────────────────────────────────────────────
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
  'carlos-mendez-bronx',
  'Carlos Mendez',
  'Boxing & Functional Fitness — The Bronx',
  'Amateur boxer turned coach. I train people who want to fight fit without fighting. My sessions combine boxing fundamentals, conditioning, and functional strength. NASM certified, 7 years, 185 clients. I train at local gyms across the Bronx and offer outdoor sessions at Pelham Bay Park.',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=85',
  ARRAY['Boxing', 'Conditioning', 'Functional Strength', 'HIIT'],
  ARRAY['NASM-CPT', 'USA Boxing Coach'],
  'NASM-CPT-729183', TRUE, 'Certified',
  7, 185,
  'New York City', 'USA', NULL, '@carlosmendezboxing',
  'pro', 'verified', TRUE,
  4.7, 36, 280,
  TRUE, TRUE, 'en-us', 'com'
) ON CONFLICT (slug) DO NOTHING;

-- ── Staten Island ─────────────────────────────────────────────────────────────
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
  'jessica-deangelo-staten-island',
  'Jessica DeAngelo',
  'Senior Fitness & Mobility — Staten Island',
  'I specialize in fitness for adults over 50 — building strength, balance, and confidence so they stay independent and active. ACE certified with Senior Fitness Specialist credential. 11 years, 310 clients. I do in-home sessions across Staten Island. My oldest client is 81 and deadlifts.',
  'https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=800&q=85',
  ARRAY['Senior Fitness', 'Balance & Fall Prevention', 'Gentle Strength', 'Mobility'],
  ARRAY['ACE-CPT', 'ACE Senior Fitness Specialist'],
  'ACE-CPT-837261', TRUE, 'Certified',
  11, 310,
  'New York City', 'USA', NULL, '@jessicadeangelo',
  'pro', 'verified', TRUE,
  4.9, 63, 350,
  TRUE, TRUE, 'en-us', 'com'
) ON CONFLICT (slug) DO NOTHING;

-- ── Manhattan: Chelsea (online + in-person hybrid) ────────────────────────────
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
  'tom-hayes-chelsea',
  'Tom Hayes',
  'Hybrid Training Coach — Chelsea',
  'I help busy New Yorkers train consistently whether they are at the gym, traveling, or working from home. NASM certified with online coaching certification. 5 years, 210 clients. My hybrid clients get in-person sessions when they are in NYC and follow structured programs everywhere else.',
  'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=85',
  ARRAY['Hybrid Training', 'Home Workouts', 'Strength Training', 'Travel Fitness'],
  ARRAY['NASM-CPT', 'NASM Online Coaching Certification'],
  'NASM-CPT-481927', TRUE, 'Certified',
  5, 210,
  'New York City', 'USA', NULL, '@tomhayescoach',
  'pro', 'verified', TRUE,
  4.8, 42, 390,
  TRUE, TRUE, 'en-us', 'com'
) ON CONFLICT (slug) DO NOTHING;

-- ── Brooklyn: DUMBO / Brooklyn Heights ────────────────────────────────────────
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
  'lisa-santiago-dumbo',
  'Lisa Santiago',
  'Outdoor & Bootcamp Training — DUMBO',
  'I run small-group and 1-on-1 sessions along the Brooklyn waterfront and Brooklyn Bridge Park. NASM certified, 8 years, 240 clients. There is something about training with the Manhattan skyline behind you that pushes people harder. I train all fitness levels. Sessions run rain or shine.',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=85',
  ARRAY['Outdoor Training', 'Bootcamp', 'Group Fitness', 'Cardio Conditioning'],
  ARRAY['NASM-CPT', 'NASM Group Personal Training Specialist'],
  'NASM-CPT-639274', TRUE, 'Certified',
  8, 240,
  'New York City', 'USA', NULL, '@lisasantiagofit',
  'pro', 'verified', TRUE,
  4.8, 47, 300,
  TRUE, TRUE, 'en-us', 'com'
) ON CONFLICT (slug) DO NOTHING;
