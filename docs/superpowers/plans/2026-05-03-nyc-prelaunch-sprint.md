# NYC Pre-Launch Sprint — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the four remaining gaps before launching TrainedBy on trainedby.com targeting NYC personal trainers.

**Architecture:** Four independent tasks that can be executed in any order. Tasks 1–3 are code/SQL changes committed to main and auto-deployed by Netlify. Task 4 is a manual Stripe testing protocol that requires the bank account to be verified first.

**Tech Stack:** Astro (layouts, components), Supabase PostgreSQL (migrations via SQL files), Stripe Connect (manual E2E testing), Unsplash (trainer avatar URLs)

**Spec:** `docs/superpowers/specs/2026-05-03-nyc-prelaunch-sprint-design.md`

---

## Pre-flight: What's Already Done

Before starting, verify these are working — they were implemented previously and do not need to be rebuilt:

- `src/components/CookieConsent.astro` — exists, imported in `Base.astro` line 23, rendered line 543
- `src/pages/join.astro` — consent checkbox exists at line 546, enforced in `verifyAndCreate()` at line 977
- `trainedby.com` market config — USD, $19/month, NASM/ACE/NSCA, `paymentEnabled: true` in `src/lib/market.ts`

---

## Task 1: Add Cookie Banner to BaseMinimal Layout

**Files:**
- Modify: `src/layouts/BaseMinimal.astro`

`Base.astro` already includes `CookieConsent`. `BaseMinimal.astro` (used by `/for-trainers` and `/my-bookings`) does not. This task adds it.

- [ ] **Step 1: Open `src/layouts/BaseMinimal.astro` and locate the closing `</body>` tag**

The file ends at line 170 with:
```html
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 2: Add the CookieConsent import and component**

Replace the body section:

```astro
---
import { getMarket } from '../lib/market.ts';
import { ClientRouter } from 'astro:transitions';
import CookieConsent from '../components/CookieConsent.astro';
```

Add `import CookieConsent` right after the existing two imports at the top of the frontmatter. Then update the body:

```html
  <body>
    <slot />
    <CookieConsent />
  </body>
```

- [ ] **Step 3: Verify the banner uses light theme colors on BaseMinimal pages**

`CookieConsent.astro` uses `var(--surface-1, #1a1a2e)` as its background fallback. BaseMinimal pages set `--bg: #FFFFFF` but not `--surface-1`. The dark fallback `#1a1a2e` will show on these pages, which is acceptable (dark banner on light page is visible and clear). No style change needed.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/BaseMinimal.astro
git commit -m "feat: add CookieConsent banner to BaseMinimal layout (CCPA)"
```

- [ ] **Step 5: Verify deployment**

After Netlify auto-deploys, open `https://trainedby.com/for-trainers` in an incognito window. The cookie banner should appear at the bottom within 500ms. Clear localStorage and reload to re-test.

---

## Task 2: NYC Trainer Seed Migration

**Files:**
- Create: `supabase/migrations/20260503_nyc_seed_trainers.sql`

Seeds 15 demo trainer profiles across NYC neighborhoods. All marked `is_demo = true` for clean removal post-launch.

- [ ] **Step 1: Create the migration file**

Create `supabase/migrations/20260503_nyc_seed_trainers.sql` with the content below. This is idempotent — safe to run multiple times.

```sql
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
  'I combine Pilates fundamentals with functional strength work to build bodies that look and move well. NASM certified with advanced Pilates training, 5 years, 140 clients. I train in-home in the West Village, Chelsea, and SoHo.',
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
```

- [ ] **Step 2: Apply the migration to production**

```bash
# Apply via Supabase CLI (requires SUPABASE_ACCESS_TOKEN in env)
npx supabase db push --db-url "postgresql://postgres:<password>@db.mezhtdbfyvkshpuplqqw.supabase.co:5432/postgres"
```

Or apply directly in the Supabase SQL editor at https://supabase.com/dashboard/project/mezhtdbfyvkshpuplqqw/sql — paste the entire file content and run.

- [ ] **Step 3: Verify in Supabase**

```sql
SELECT slug, name, city, market, is_demo FROM trainers WHERE market = 'com' AND is_demo = TRUE ORDER BY created_at DESC LIMIT 20;
```

Expected: 15 rows, all `market = 'com'`, `is_demo = TRUE`, `city = 'New York City'`.

- [ ] **Step 4: Verify on the live site**

Open `https://trainedby.com/find/new-york-city` in a browser.

Expected: Trainer cards appear with photos, names, certifications, and NYC neighborhoods.

- [ ] **Step 5: Commit the migration file**

```bash
git add supabase/migrations/20260503_nyc_seed_trainers.sql
git commit -m "feat: seed 15 demo trainer profiles for NYC launch (trainedby.com)"
```

---

## Task 3: Blog Schema Fix + NYC Content Migration

**Files:**
- Create: `supabase/migrations/20260503_nyc_blog_content.sql`

The `blog.astro` page queries `category`, `cover_url`, `emoji`, and `read_time_mins` columns, but the `blog_posts` table does not have them. This causes Supabase to return an error and the page falls back to sample articles. This migration adds the missing columns and inserts 10 NYC-focused articles.

- [ ] **Step 1: Create the migration file**

Create `supabase/migrations/20260503_nyc_blog_content.sql`:

```sql
-- NYC Blog Content Migration
-- 1. Adds missing columns that blog.astro queries (category, cover_url, emoji, read_time_mins)
-- 2. Inserts 10 NYC-focused articles for TrainedBy US launch
-- Idempotent: ON CONFLICT (slug) DO NOTHING

-- ── Add missing columns to blog_posts ────────────────────────────────────────
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS category      TEXT DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS cover_url     TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS emoji         TEXT DEFAULT '💪',
  ADD COLUMN IF NOT EXISTS read_time_mins INTEGER DEFAULT 5;

-- ── 1. Consumer: How to Find a Trainer in NYC ────────────────────────────────
INSERT INTO blog_posts (
  slug, title, meta_description, excerpt,
  content_markdown, keyword, tags, word_count,
  status, author, locale, brand, published_at,
  category, emoji, read_time_mins
) VALUES (
  'how-to-find-a-certified-personal-trainer-in-nyc',
  'How to Find a Certified Personal Trainer in New York City',
  'A practical guide to finding a verified, certified personal trainer in NYC — what certifications to look for, what to pay, and how to avoid getting burned.',
  'Finding a great personal trainer in NYC is harder than it looks. Here is exactly what to look for, what to pay, and how to verify credentials before you commit.',
  E'# How to Find a Certified Personal Trainer in New York City\n\nNew York City has more personal trainers per square mile than anywhere else in the country. It also has more uncertified ones. The problem is not finding a trainer — it is finding a good one.\n\nThis guide gives you a clear framework for finding a certified, verified personal trainer in NYC who will actually get you results.\n\n## Start with Certification\n\nAny trainer worth hiring holds a nationally recognized certification. The three you should look for:\n\n**NASM-CPT (National Academy of Sports Medicine)** — The most widely recognized certification in the US. Comprehensive curriculum covering exercise science, assessment, and program design.\n\n**ACE-CPT (American Council on Exercise)** — A respected, well-established certification with strong emphasis on safety and technique.\n\n**NSCA-CSCS (National Strength and Conditioning Association — Certified Strength and Conditioning Specialist)** — The gold standard for athletic performance and advanced strength training.\n\nDo not accept "I am certified" as an answer. Ask for the certification body and number, then verify it directly on the certifying body''s website.\n\n## What to Pay in NYC\n\nPersonal training in New York City is expensive. Here is the honest range:\n\n- **Budget:** $60–$80 per session (newer trainers, less central locations)\n- **Mid-range:** $90–$130 per session (experienced, certified, established)\n- **Premium:** $150–$250+ per session (specialist credentials, private studios, celebrity trainers)\n\nPackages almost always offer better value than per-session pricing. A trainer who charges $100/session often offers 10-session packages at $850–$900.\n\n## How to Vet a Trainer\n\nFour things to check before you pay anything:\n\n1. **Verify the certification** — Go directly to NASM, ACE, or NSCA''s websites and use their credential verification tool. Enter the trainer''s certification number.\n\n2. **Check their profile** — A trainer with a complete public profile (photo, specialties, packages, reviews) is more accountable than one who only exists on Instagram.\n\n3. **Ask about their process** — A good trainer will want to assess your movement, discuss your history, and build a program specific to you. If a trainer skips this and jumps straight to training, that is a red flag.\n\n4. **Do a trial session** — Most certified trainers in NYC offer a first session at a reduced rate or free. Take it. You will know within 50 minutes whether this person can actually help you.\n\n## Where to Find Verified NYC Trainers\n\nTrainedBy is a verified trainer platform for NYC. Every trainer on the platform has their certification number verified against the relevant certifying body''s database. You can browse NASM, ACE, and NSCA-certified trainers by neighborhood — Midtown, Brooklyn, Queens, and beyond.\n\n[Find a verified personal trainer near you →](/find/new-york-city)',
  'find certified personal trainer NYC',
  ARRAY['NYC', 'personal trainer', 'NASM', 'ACE', 'certification', 'New York City'],
  720, 'published', 'TrainedBy Team', 'en', 'trainedby',
  NOW() - INTERVAL '5 days',
  'consumer', '🗽', 7
) ON CONFLICT (slug) DO NOTHING;

-- ── 2. Consumer: NASM vs ACE vs NSCA ─────────────────────────────────────────
INSERT INTO blog_posts (
  slug, title, meta_description, excerpt,
  content_markdown, keyword, tags, word_count,
  status, author, locale, brand, published_at,
  category, emoji, read_time_mins
) VALUES (
  'nasm-vs-ace-vs-nsca-which-certification-to-trust',
  'NASM vs ACE vs NSCA: Which Trainer Certification Should You Trust?',
  'The three most respected personal trainer certifications in the US explained. What they mean, who holds them, and which one to look for when hiring a trainer in NYC.',
  'NASM, ACE, and NSCA are the three certifications that actually matter. Here is what each one means and which you should look for based on your goals.',
  E'# NASM vs ACE vs NSCA: Which Trainer Certification Should You Trust?\n\nWhen you are looking for a personal trainer in NYC, you will see a lot of letters after people''s names. Most of them do not mean much. Three of them do.\n\n## NASM-CPT\n\n**National Academy of Sports Medicine Certified Personal Trainer**\n\nNASM is the most widely recognized certification in the US fitness industry. Its curriculum is grounded in the Optimum Performance Training model — a systematic approach to exercise programming that progresses clients from basic stability through to high-performance power training.\n\nNASM trainers are particularly strong at assessment, corrective exercise, and building progressive programs. If you are coming back from an injury, starting from zero, or working on general fitness and weight loss, a NASM-certified trainer is an excellent choice.\n\n## ACE-CPT\n\n**American Council on Exercise Certified Personal Trainer**\n\nACE has been certifying trainers since 1985. Its certification is highly respected and places strong emphasis on client safety, ethical practice, and behavior change. ACE trainers tend to be client-centered and excellent at working with diverse populations — including older adults, beginners, and people with health considerations.\n\nIf you are 50+, new to exercise, or dealing with a health condition, an ACE-certified trainer often has the background to work with you safely.\n\n## NSCA-CSCS\n\n**National Strength and Conditioning Association Certified Strength and Conditioning Specialist**\n\nThe CSCS is the most academically rigorous certification in the field. It requires a bachelor''s degree in a related field as a prerequisite. NSCA-CSCS trainers are the specialists — the coaches who train athletes, competitive lifters, and people who want to perform at a genuinely high level.\n\nIf you are training for a specific athletic goal (marathon, triathlon, competition, sport), an NSCA-CSCS coach will program at a level that most personal trainers cannot match.\n\n## Which Should You Look For?\n\n- **General fitness, weight loss, starting out:** NASM-CPT or ACE-CPT\n- **50+, health conditions, injury history:** ACE-CPT (look for Senior Fitness Specialist or similar)\n- **Athletic performance, strength sports, competition:** NSCA-CSCS\n- **Women''s specific goals:** NASM Women''s Fitness Specialist or ACE pre/postnatal\n\nAll three certifications require passing a proctored exam and ongoing continuing education to maintain. A trainer who holds one of these is not guessing — they have been tested on exercise science, anatomy, and program design.\n\nYou can verify any trainer''s certification status directly:\n- NASM: nasm.org/resources/validate-credentials\n- ACE: acefitness.org/certify/ace-exam-overview\n- NSCA: nsca.com/certification\n\nOr browse TrainedBy — every trainer on the platform has their certification verified before their profile goes live.\n\n[Browse NASM and ACE certified trainers in NYC →](/find/new-york-city)',
  'NASM ACE NSCA certification difference',
  ARRAY['NASM', 'ACE', 'NSCA', 'certification', 'personal trainer', 'NYC'],
  680, 'published', 'TrainedBy Team', 'en', 'trainedby',
  NOW() - INTERVAL '4 days',
  'consumer', '🎓', 7
) ON CONFLICT (slug) DO NOTHING;

-- ── 3. Consumer: Cost of a Personal Trainer in NYC ───────────────────────────
INSERT INTO blog_posts (
  slug, title, meta_description, excerpt,
  content_markdown, keyword, tags, word_count,
  status, author, locale, brand, published_at,
  category, emoji, read_time_mins
) VALUES (
  'how-much-does-a-personal-trainer-cost-in-nyc',
  'How Much Does a Personal Trainer Cost in New York City? (2026 Guide)',
  'Honest pricing guide for personal training in NYC. What you will pay per session, for packages, and for in-home training — plus what drives the price up or down.',
  'Personal training in NYC costs more than most people expect. Here is the honest breakdown — per session, per package, and what you actually get for the money.',
  E'# How Much Does a Personal Trainer Cost in New York City? (2026 Guide)\n\nPersonal training in New York City is expensive. There is no way around it. But knowing what is reasonable, what is overpriced, and what the numbers actually include will help you get the best value for your investment.\n\n## The Per-Session Range\n\n**$60–$80/session** — Newer trainers (1–3 years experience), working at budget gyms or in public parks. Certified, but limited client experience. Good option if you want to support someone building their career.\n\n**$90–$130/session** — The mid-market sweet spot for NYC. Experienced (4–8 years), certified with NASM, ACE, or NSCA, established client base. This is where most quality training happens.\n\n**$150–$200+/session** — Specialist credentials (NSCA-CSCS, sport-specific coaching), private studio space included, high-demand trainers with long waitlists.\n\n**$250+/session** — Celebrity trainers, in-home luxury, or highly specialized medical fitness.\n\n## Package Pricing Is Usually Better\n\nMost established trainers in NYC sell packages rather than individual sessions. A trainer who charges $120/session might offer:\n- 5-session starter: $550 ($110/session)\n- 10-session package: $1,050 ($105/session)\n- Monthly program (12 sessions): $1,200 ($100/session)\n\nPackages also create commitment on both sides — the trainer programs a full month of progressive training, you show up consistently.\n\n## What Drives the Price Up\n\n- **In-home training** adds $20–$40/session (travel time, equipment transport)\n- **Private studio access** vs gym floor adds $15–$30/session\n- **Specialist certifications** (NSCA-CSCS, sports nutrition, corrective exercise) command premium rates\n- **Manhattan** is 15–25% more expensive than Brooklyn, Queens, or the Bronx\n\n## What You Should Get At Each Price Point\n\nAt any price point above $80/session, you should get: an initial fitness assessment, a written program tailored to your goals, and a trainer who adjusts the program based on your progress. If you are paying $120/session and getting a generic workout with no progression, you are overpaying.\n\n## How to Compare Trainers\n\nCheck credentials first. A trainer charging $90/session with a verified NASM-CPT certification is worth more than a trainer charging $80 with no verifiable credentials.\n\nTrainedBy shows you verified, certified NYC trainers with transparent package pricing. No surprises.\n\n[See NYC trainer profiles and pricing →](/find/new-york-city)',
  'personal trainer cost NYC',
  ARRAY['NYC', 'personal trainer cost', 'pricing', 'New York City fitness'],
  600, 'published', 'TrainedBy Team', 'en', 'trainedby',
  NOW() - INTERVAL '3 days',
  'consumer', '💰', 6
) ON CONFLICT (slug) DO NOTHING;

-- ── 4. Consumer: Best Outdoor Training Spots NYC ──────────────────────────────
INSERT INTO blog_posts (
  slug, title, meta_description, excerpt,
  content_markdown, keyword, tags, word_count,
  status, author, locale, brand, published_at,
  category, emoji, read_time_mins
) VALUES (
  'best-outdoor-training-spots-nyc-2026',
  'The Best Outdoor Training Spots in NYC (2026)',
  'The top parks and outdoor spaces in New York City for personal training sessions — by neighborhood, with what each location is best for.',
  'New York City has some of the best outdoor training spots in the country if you know where to go. Here are the best by neighborhood.',
  E'# The Best Outdoor Training Spots in NYC (2026)\n\nNew York City trainers do not need a gym. The city has world-class outdoor training infrastructure — if you know where to find it.\n\n## Central Park (Manhattan)\n\nThe obvious choice and for good reason. Central Park offers flat running loops (the Reservoir loop is exactly 1.58 miles), hills for sprint work, open meadows for agility drills, and pull-up bars in the fitness area near 77th Street and West Drive. Best for: running, HIIT, outdoor bootcamp. Park with a trainer who knows the space — midday crowds on weekends can make certain exercises impractical.\n\n## Hudson River Park (West Side, Manhattan)\n\nThe Hudson River Greenway runs 11 miles along the West Side. Piers 25 and 40 have open spaces perfect for agility work and functional training. The path is flat and consistent, making it excellent for timed cardio intervals. Best for: running, cycling intervals, functional movement work.\n\n## Brooklyn Bridge Park (DUMBO / Brooklyn Heights)\n\nOne of the best training environments in the city. Multiple piers, open grass, fitness equipment, and the Manhattan skyline as a backdrop. Pier 2 has basketball courts and athletic fields. Pier 5 has athletic fields and is less crowded on weekday mornings. Best for: athletic conditioning, running, group training.\n\n## Prospect Park (Brooklyn)\n\nBrooklyn''s answer to Central Park. The 3.35-mile loop is a favorite for runners and cyclists. The Nethermead is a large open meadow ideal for drills, agility work, and outdoor bootcamps. Best for: long runs, functional conditioning, bootcamp-style sessions.\n\n## Queensbridge Park (Long Island City, Queens)\n\nThe largest park in Queens. Open fields, a running path along the East River, and significantly less crowded than Manhattan parks. Best for: distance running, open-space conditioning, budget-friendly training.\n\n## Van Cortlandt Park (The Bronx)\n\nNew York City''s third-largest park. Famous for its cross-country running trails — the same trails used by elite high school and college runners. Best for: trail running, hill work, athletic conditioning.\n\n## Pelham Bay Park (The Bronx)\n\nNew York City''s largest park. Genuinely remote feeling for a city park. Multiple trails, open fields, and access to the waterfront. Best for: trail running, endurance work.\n\n## Finding a Trainer Who Trains Outdoors\n\nNot every trainer is set up for outdoor sessions. The best outdoor trainers in NYC bring portable equipment (resistance bands, TRX, kettlebells) and know how to structure sessions that use the environment effectively.\n\nBrowse outdoor and bootcamp trainers across NYC neighborhoods on TrainedBy.\n\n[Find an outdoor trainer near you →](/find/new-york-city)',
  'outdoor training spots NYC',
  ARRAY['NYC', 'outdoor training', 'parks', 'personal trainer outdoors', 'New York City'],
  580, 'published', 'TrainedBy Team', 'en', 'trainedby',
  NOW() - INTERVAL '2 days',
  'consumer', '🌳', 6
) ON CONFLICT (slug) DO NOTHING;

-- ── 5. Consumer: Questions to Ask Before Hiring a Trainer ────────────────────
INSERT INTO blog_posts (
  slug, title, meta_description, excerpt,
  content_markdown, keyword, tags, word_count,
  status, author, locale, brand, published_at,
  category, emoji, read_time_mins
) VALUES (
  'questions-to-ask-before-hiring-a-personal-trainer-nyc',
  '7 Questions to Ask Before Hiring a Personal Trainer in NYC',
  'Before you pay for personal training in New York City, ask these 7 questions. They will tell you everything you need to know about whether a trainer is worth hiring.',
  'Most people hire a trainer based on how they look or how confident they seem. Here are the 7 questions that actually tell you whether someone can get you results.',
  E'# 7 Questions to Ask Before Hiring a Personal Trainer in NYC\n\nHiring a personal trainer in New York City is an investment. A good trainer will change how you look, feel, and move. A bad one will take your money and give you generic workouts you could find on YouTube for free.\n\nThese 7 questions sort the good from the bad — fast.\n\n## 1. "What is your certification, and can I verify it?"\n\nThe only correct answer is a specific certification number from NASM, ACE, NSCA, or an equivalently rigorous body — and immediate willingness to share it. If a trainer says they are "certified" without specifics, ask which organization. If they hesitate or get defensive, walk away.\n\nYou can verify NASM credentials at nasm.org/resources/validate-credentials. ACE at acefitness.org. NSCA at nsca.com/certification.\n\n## 2. "What would a typical first month with you look like?"\n\nA good trainer has a process. They should describe an initial assessment, a discussion of your goals and history, a structured first month of programming with clear progressions, and check-ins to adjust based on how you are responding.\n\nIf a trainer says "we just start training and see how it goes," that is not a process — that is winging it.\n\n## 3. "How do you handle injuries or physical limitations?"\n\nEvery client has something — a bad knee, a tight hip, a shoulder that clicks. A certified trainer knows how to work around these issues and when to refer you to a physiotherapist. If a trainer says they can "work through everything," be cautious. The correct answer involves assessment, modification, and professional boundaries.\n\n## 4. "What results have your recent clients gotten?"\n\nAsk for specifics, not generalities. "My clients get amazing results" is meaningless. "Three of my current clients lost 15+ pounds in 90 days while building visible muscle" is meaningful. Look for concrete outcomes and the process behind them.\n\n## 5. "What does your program include besides the sessions?"\n\nThe best trainers in NYC give you something to do between sessions — homework, a nutrition framework, a recovery protocol, check-in messages. The worst show up for the session and disappear the rest of the week. You are paying for transformation, not hourly supervision.\n\n## 6. "What is your cancellation policy?"\n\nThis is a professionalism signal. A serious trainer has clear, written policies. Typical NYC policies allow cancellation with 24 hours notice. If a trainer has no policy, or the policy is vague, that is a business that does not take itself seriously.\n\n## 7. "Can I see your profile or reviews?"\n\nEstablished trainers have a digital presence — a profile page with photos, specialties, packages, and reviews from real clients. A trainer who only exists on Instagram and has no verifiable credentials is not a professional, regardless of follower count.\n\nTrainedBy shows you verified, reviewed trainers across NYC. Every certification is checked before a profile goes live.\n\n[Browse verified NYC trainers →](/find/new-york-city)',
  'questions ask personal trainer NYC',
  ARRAY['NYC', 'personal trainer', 'hiring', 'fitness', 'certification'],
  650, 'published', 'TrainedBy Team', 'en', 'trainedby',
  NOW() - INTERVAL '1 day',
  'consumer', '❓', 7
) ON CONFLICT (slug) DO NOTHING;

-- ── 6. Trainer: Get More Clients in NYC ──────────────────────────────────────
INSERT INTO blog_posts (
  slug, title, meta_description, excerpt,
  content_markdown, keyword, tags, word_count,
  status, author, locale, brand, published_at,
  category, emoji, read_time_mins
) VALUES (
  'how-to-get-more-personal-training-clients-nyc',
  'How to Get More Personal Training Clients in New York City',
  'Practical strategies for certified personal trainers in NYC to get more clients — SEO, referrals, social, and a verified online profile that works while you sleep.',
  'Getting clients in NYC is a full-time job on top of the training. Here are the strategies that actually work for certified trainers in New York City.',
  E'# How to Get More Personal Training Clients in New York City\n\nNew York City is the best and worst place to be a personal trainer. Best: there are 8 million potential clients within a 10-mile radius. Worst: there are also 40,000 other trainers competing for them.\n\nHere is what actually works for certified trainers building a client base in NYC.\n\n## Start With a Verified Online Presence\n\nMost trainers in NYC have Instagram. Almost none have a public, verifiable profile page that shows their certification, their specialties, their packages, and their location.\n\nWhen someone in Midtown searches "NASM personal trainer Midtown Manhattan," the trainers who show up in results are the ones who have built searchable profiles. Instagram does not rank in local Google searches. A dedicated profile page does.\n\nTrainedBy creates a verified profile at trainedby.com/[your-name] that shows your NASM, ACE, or NSCA certification badge (verified automatically), your specialties, your packages, and your neighborhood. It is free to start.\n\n## Referrals Are Your Most Reliable Channel\n\nEvery trainer you talk to knows referrals are important. Almost none have a system for generating them.\n\nA simple system that works: after a client completes their first month, send a personal message. "I have really enjoyed working with you. If you know anyone in [neighborhood] who is looking for a trainer, I would love an introduction. I keep [X] referral spots open each month for people recommended by current clients."\n\nThe specificity matters. "I keep X spots open" creates scarcity. "In [neighborhood]" tells them exactly who to think of.\n\n## Use Local SEO, Not Social\n\nSocial media gets you followers. Local SEO gets you clients.\n\nThe highest-intent client in NYC is not scrolling Instagram looking for a trainer — they are Googling "ACE certified personal trainer Brooklyn" or "personal trainer near me Williamsburg."\n\nA few things that help you show up:\n- A Google Business Profile with your name, certification, neighborhood, and link to your profile\n- A profile page with neighborhood-specific keywords in your bio\n- Client reviews that mention your location and specialty\n\n## Narrow Your Specialty\n\nNYC clients have options. They do not hire generalists. They hire the trainer who is specifically known for what they need.\n\nIf you train busy executives, say that. If you specialize in women over 40, say that. If you are the best Olympic weightlifting coach in Queens, say that. The narrower your positioning, the faster word spreads.\n\n## Build a Profile That Works While You Sleep\n\nYour best clients are going to find you online at 11pm on a Tuesday when they decide they are finally doing this. If your profile is a dead Instagram link with 47 followers, they will move on.\n\nTrainedBy is free for certified trainers. Your profile is live in 60 seconds, your certification is verified automatically, and clients can contact you directly from your page.\n\n[Create your free verified profile →](https://trainedby.com/join)',
  'get more personal training clients NYC',
  ARRAY['NYC', 'personal trainer', 'get clients', 'fitness business', 'trainer marketing'],
  620, 'published', 'TrainedBy Team', 'en', 'trainedby',
  NOW() - INTERVAL '6 days',
  'trainer', '📈', 6
) ON CONFLICT (slug) DO NOTHING;

-- ── 7. Trainer: Building Your Business in NYC ────────────────────────────────
INSERT INTO blog_posts (
  slug, title, meta_description, excerpt,
  content_markdown, keyword, tags, word_count,
  status, author, locale, brand, published_at,
  category, emoji, read_time_mins
) VALUES (
  'building-personal-training-business-nyc-2026',
  'Building Your Personal Training Business in NYC: The 2026 Guide',
  'A practical guide for certified personal trainers in New York City on pricing, packages, client retention, and building a sustainable fitness business.',
  'Building a profitable personal training business in NYC takes more than clients — it takes systems. Here is what the trainers who make six figures are actually doing.',
  E'# Building Your Personal Training Business in NYC: The 2026 Guide\n\nTraining people is one skill. Running a training business is another. Most trainers who struggle in NYC are great at the first and have never learned the second.\n\nHere is what the trainers who build sustainable, profitable businesses in New York City actually do differently.\n\n## Price for Sustainability, Not Accessibility\n\nNew York City has the highest cost of living in the US. Trainers who price themselves at the bottom of the market often cannot survive the overhead — transport, equipment, liability insurance, certification renewal — without working more hours than is sustainable.\n\nA NASM-certified trainer with 3+ years of experience in NYC should be charging $90–$120/session. If you are charging $60, you are either undervaluing yourself or early in your career and building a portfolio.\n\n## Sell Packages, Not Sessions\n\nPer-session pricing creates unpredictable income and inconsistent clients. Monthly packages do the opposite.\n\nA standard package structure that works in NYC:\n- **Starter (1 month, 8 sessions):** $800 — two sessions per week, good for testing the relationship\n- **Core (1 month, 12 sessions):** $1,100 — three sessions per week, the volume that produces visible results\n- **Premium (1 month, 12 sessions + nutrition coaching):** $1,400 — full service for clients who want maximum results\n\nPackages also give you something concrete to sell rather than asking clients to commit to sessions indefinitely.\n\n## Retain Clients With Outcomes, Not Relationship\n\nThe trainers who lose clients after 2–3 months usually made the relationship their retention mechanism. Clients stayed because they liked the trainer, not because they were getting results.\n\nBuild your retention around outcomes: monthly progress photos (with consent), strength milestones, body composition measurements. When a client can see their progress documented over 90 days, they do not leave. When they cannot see progress — even if they are progressing — they do.\n\n## Build a Digital Presence That Generates Inbound\n\nThe most efficient client acquisition channel for NYC trainers is a searchable, verified online profile. Every minute your profile exists, it is working. Your Instagram requires you to post. Your TrainedBy profile requires nothing.\n\nTrainedBy is the verified trainer platform for NYC. Free to start, Pro at $19/month — and the ROI on one retained client is immediate.\n\n[Create your profile and start getting found →](https://trainedby.com/join)',
  'personal training business NYC 2026',
  ARRAY['NYC', 'personal trainer', 'business', 'pricing', 'retention'],
  580, 'published', 'TrainedBy Team', 'en', 'trainedby',
  NOW() - INTERVAL '7 days',
  'trainer', '🏋️', 6
) ON CONFLICT (slug) DO NOTHING;

-- ── 8. Trainer: Why NYC Trainers Use TrainedBy ───────────────────────────────
INSERT INTO blog_posts (
  slug, title, meta_description, excerpt,
  content_markdown, keyword, tags, word_count,
  status, author, locale, brand, published_at,
  category, emoji, read_time_mins
) VALUES (
  'why-nyc-trainers-use-trainedby',
  'Why NYC Personal Trainers Are Switching to TrainedBy',
  'The link-in-bio problem for personal trainers — and why certified trainers in New York City are building their client presence on TrainedBy instead of Linktree.',
  'Linktree is fine for bands and influencers. For certified personal trainers, it does nothing. Here is why NYC trainers are building their presence on TrainedBy.',
  E'# Why NYC Personal Trainers Are Switching to TrainedBy\n\nEvery personal trainer in New York City has a link in their Instagram bio. For most, it goes to Linktree, a generic link page with no fitness context, no certification display, and no way for a client to understand why they should choose this trainer over the 40 others they found this week.\n\n## The Problem With Generic Link-in-Bio Tools\n\nLinktree, Beacons, Carrd — these tools are built for anyone. They do nothing specific to solve the problem a certified fitness professional actually has.\n\nThe problem: you have credentials, experience, and real results — but nowhere to show them in a way that builds trust with a potential client before they ever meet you.\n\nA potential client needs to see:\n- That your certification is real and current\n- What you specialize in\n- What your training packages include and cost\n- Where in the city you train\n- What previous clients say about you\n\nLinktree has none of this. It is a list of links. It does not build trust. It does not convert.\n\n## What TrainedBy Does Instead\n\nTrainedBy is built specifically for certified fitness professionals. When you create a profile:\n\n**Your certification is verified** — Enter your NASM, ACE, or NSCA number and TrainedBy verifies it against the certifying body''s database. Your verified badge appears on your profile within minutes.\n\n**Your profile is searchable** — Your profile page at trainedby.com/[your-name] is indexed by Google. When someone searches "NASM personal trainer Midtown Manhattan," you can show up.\n\n**Your packages are displayed** — Add your training packages with descriptions and pricing. No more DM-to-find-out pricing that kills conversion.\n\n**Clients can contact you directly** — No middleman. Enquiries go straight to you.\n\n## Who It Is Built For\n\nTrainedBy is for certified trainers who are serious about their business. If you hold a NASM-CPT, ACE-CPT, NSCA-CSCS, or equivalent credential, your profile is free to create and live in 60 seconds.\n\nPro plan ($19/month) unlocks advanced analytics, priority search placement, and client management tools.\n\n[Create your free verified profile →](https://trainedby.com/join)',
  'personal trainers NYC TrainedBy',
  ARRAY['NYC', 'TrainedBy', 'personal trainer', 'Linktree alternative', 'fitness platform'],
  560, 'published', 'TrainedBy Team', 'en', 'trainedby',
  NOW() - INTERVAL '8 days',
  'trainer', '🔗', 5
) ON CONFLICT (slug) DO NOTHING;

-- ── 9. Brand: How TrainedBy Verifies Certifications ──────────────────────────
INSERT INTO blog_posts (
  slug, title, meta_description, excerpt,
  content_markdown, keyword, tags, word_count,
  status, author, locale, brand, published_at,
  category, emoji, read_time_mins
) VALUES (
  'how-trainedby-verifies-fitness-certifications',
  'How TrainedBy Verifies Fitness Certifications — And Why It Matters',
  'TrainedBy verifies every trainer''s certification before their profile goes live. Here is how the verification process works and why it protects clients.',
  'Anyone can claim to be a certified personal trainer. TrainedBy checks. Here is how our verification process works.',
  E'# How TrainedBy Verifies Fitness Certifications — And Why It Matters\n\nThere is no regulation preventing anyone from calling themselves a personal trainer in the United States. No license is required. No test is mandatory. Anyone can print business cards, charge $80/session, and train clients with zero formal education in exercise science.\n\nThis is the problem TrainedBy was built to solve.\n\n## The Verification Process\n\nEvery trainer who creates a profile on TrainedBy must submit their certification number during signup. Here is what happens next:\n\n**Step 1: Submission** — The trainer enters their certification number and the certifying body (NASM, ACE, NSCA, or other accepted body).\n\n**Step 2: Automated check** — TrainedBy''s verification system cross-references the submitted number against the certifying body''s credential database. This happens within minutes of submission.\n\n**Step 3: Status update** — If the credential is verified as active, the trainer''s profile receives a verified badge. If the credential cannot be verified (expired, suspended, or the number does not match), the profile is not published until the issue is resolved.\n\n**Step 4: Ongoing monitoring** — Certifications expire. TrainedBy monitors certification status and flags profiles where credentials have lapsed.\n\n## What Counts as a Verified Certification\n\nTrainedBy currently verifies credentials from:\n- NASM (National Academy of Sports Medicine)\n- ACE (American Council on Exercise)\n- NSCA (National Strength and Conditioning Association)\n- REPs UK (Register of Exercise Professionals UK)\n- REPs UAE\n- And other recognized bodies by market\n\n## Why It Matters for Clients\n\nA verified badge on a TrainedBy profile means one thing: someone has independently confirmed that this trainer holds the credential they claim to hold, and that credential is current.\n\nIt does not guarantee a great trainer. Certification is a baseline — it tells you someone passed a rigorous exam and is accountable to an industry body. What you do with the session is up to you and your trainer.\n\nBut it eliminates the risk of paying $100/session to someone who watched YouTube videos and called themselves a coach.\n\n[Browse verified trainers in New York City →](/find/new-york-city)',
  'how TrainedBy verifies certifications',
  ARRAY['TrainedBy', 'certification verification', 'NASM', 'ACE', 'fitness safety'],
  580, 'published', 'TrainedBy Team', 'en', 'trainedby',
  NOW() - INTERVAL '9 days',
  'brand', '✅', 6
) ON CONFLICT (slug) DO NOTHING;

-- ── 10. Brand: TrainedBy vs Linktree for Trainers ────────────────────────────
INSERT INTO blog_posts (
  slug, title, meta_description, excerpt,
  content_markdown, keyword, tags, word_count,
  status, author, locale, brand, published_at,
  category, emoji, read_time_mins
) VALUES (
  'trainedby-vs-linktree-for-personal-trainers',
  'TrainedBy vs Linktree for Personal Trainers: An Honest Comparison',
  'Should personal trainers use TrainedBy or Linktree as their link-in-bio? An honest feature-by-feature comparison for certified fitness professionals.',
  'Linktree works for creators. TrainedBy is built for fitness professionals. Here is what that difference actually means in practice.',
  E'# TrainedBy vs Linktree for Personal Trainers: An Honest Comparison\n\nIf you are a certified personal trainer looking for a link-in-bio solution, you have probably already tried Linktree. Most trainers have. And most trainers find that it does the job of organizing links but does nothing to actually help them get clients.\n\nHere is an honest feature-by-feature comparison.\n\n## Certification Verification\n\n**Linktree:** None. Anyone can link to anything. There is no way for a potential client to verify that you are actually certified.\n\n**TrainedBy:** Built-in. Enter your NASM, ACE, or NSCA number and your credential is verified against the certifying body''s database. Your verified badge appears on your profile.\n\n**Why it matters:** Clients in 2026 are savvy. They have been burned by uncertified trainers. A verified badge on your profile removes the biggest objection before the first conversation.\n\n## Search Discoverability\n\n**Linktree:** Not searchable. Your Linktree page does not rank in Google for local fitness searches. No potential client in Manhattan searching "NASM trainer near me" will find your Linktree.\n\n**TrainedBy:** Designed for discoverability. Your trainedby.com/[name] profile is indexed by Google and designed to rank for local fitness searches. TrainedBy also has a city directory (/find/new-york-city) that surfaces trainers in local search.\n\n**Why it matters:** The client who is actively searching for a trainer in your neighborhood is worth 10x the client who passively sees your Instagram content.\n\n## Package Display and Pricing\n\n**Linktree:** Links only. You can link to a booking page or a PDF, but there is no native way to display your training packages with descriptions and pricing.\n\n**TrainedBy:** Native package display. Add your packages with session counts, descriptions, and monthly pricing. Clients know exactly what they are getting and what it costs before they contact you.\n\n**Why it matters:** "DM for pricing" is a conversion killer. Transparent pricing attracts serious clients and filters out price-shoppers.\n\n## Analytics\n\n**Linktree:** Click counts. You can see which links get clicked.\n\n**TrainedBy:** Profile views, package views, lead enquiries, and source tracking. You know whether your traffic is coming from Instagram, Google, or direct referrals — and what those visitors are looking at.\n\n## Price\n\n**Linktree:** Free tier available. Pro at $9/month.\n\n**TrainedBy:** Free forever for certified trainers. Pro at $19/month — includes advanced analytics, priority search placement, and client management tools.\n\n## The Bottom Line\n\nLinktree is a tool for creators who want to organize links. TrainedBy is a platform built specifically for certified fitness professionals who want to build a client acquisition system.\n\nIf you are a serious trainer with real credentials, the comparison is not close.\n\n[Create your free TrainedBy profile →](https://trainedby.com/join)',
  'TrainedBy vs Linktree personal trainers',
  ARRAY['TrainedBy', 'Linktree', 'personal trainer', 'link in bio', 'fitness platform'],
  640, 'published', 'TrainedBy Team', 'en', 'trainedby',
  NOW() - INTERVAL '10 days',
  'brand', '⚖️', 6
) ON CONFLICT (slug) DO NOTHING;
```

- [ ] **Step 2: Apply the migration to production**

Apply via Supabase SQL editor at https://supabase.com/dashboard/project/mezhtdbfyvkshpuplqqw/sql — paste the entire file and run.

- [ ] **Step 3: Verify the schema changes**

```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'blog_posts'
AND column_name IN ('category', 'cover_url', 'emoji', 'read_time_mins')
ORDER BY column_name;
```

Expected: 4 rows returned.

- [ ] **Step 4: Verify the articles**

```sql
SELECT slug, title, category, status FROM blog_posts
WHERE locale = 'en' AND status = 'published'
ORDER BY published_at DESC LIMIT 15;
```

Expected: 10 NYC articles visible.

- [ ] **Step 5: Verify on live site**

Open `https://trainedby.com/blog`. Articles should render with titles, categories, and emoji. If the page still shows sample articles, open browser DevTools → Network → find the Supabase request → check for column errors.

- [ ] **Step 6: Commit the migration file**

```bash
git add supabase/migrations/20260503_nyc_blog_content.sql
git commit -m "feat: add blog_posts columns + 10 NYC articles for US launch"
```

---

## Task 4: Stripe E2E Payment Test Protocol

**Files:** None — this is a manual verification protocol.

**Prerequisite:** Bank account must be verified in Stripe dashboard before starting. Do not begin this task until Stripe dashboard shows "Payouts enabled."

This task verifies the complete money path works in USD before accepting real customers.

- [ ] **Step 1: Confirm Stripe dashboard is in test mode**

Go to https://dashboard.stripe.com → confirm the toggle in the top-left says "Test mode." All steps 2–7 use test mode.

- [ ] **Step 2: Test trainer Stripe Connect onboarding**

Open `https://trainedby.com/dashboard` in an incognito browser (use a test trainer account).

Navigate to the billing/upgrade section. Click "Connect Stripe" or "Get Paid."

Expected: Browser redirects to Stripe Connect onboarding at `https://connect.stripe.com/setup/...`

If redirect fails: Check Supabase function logs for `connect-stripe`. Go to https://supabase.com/dashboard/project/mezhtdbfyvkshpuplqqw/functions → `connect-stripe` → Logs.

- [ ] **Step 3: Complete Stripe Connect onboarding with test data**

On the Stripe Connect onboarding page, use test data:
- Business type: Individual
- Name: Test Trainer
- DOB: 01/01/1990
- SSN last 4: 0000 (Stripe test value)
- Bank: routing 110000000, account 000123456789 (Stripe test values)

Complete all steps until Stripe redirects back to `trainedby.com/connect-stripe-return`.

Expected: Redirect to TrainedBy with success state. Check Supabase: `SELECT stripe_account_id FROM trainers WHERE email = '[test trainer email]'` — should be populated with `acct_...` value.

- [ ] **Step 4: Test Pro subscription checkout ($19 USD)**

From the test trainer dashboard, trigger the Pro upgrade flow.

Expected: Stripe Checkout page opens in USD, showing $19.00/month.

Use test card: `4242 4242 4242 4242`, expiry `12/34`, CVC `123`, ZIP `10001`.

Expected: Checkout completes, redirected back to TrainedBy.

Verify in Supabase: `SELECT plan, plan_expires_at FROM trainers WHERE email = '[test email]'` — `plan` should be `'pro'`.

- [ ] **Step 5: Verify webhook delivery**

Go to Stripe dashboard → Developers → Webhooks → find your endpoint → Recent deliveries.

Expected: `checkout.session.completed` event shows status `200` (not failed).

If webhook failed: Check Supabase function logs for `stripe-webhook`. The most common cause is the JWT verification being enabled — webhook functions must have `verify_jwt = false` in `supabase/config.toml`.

- [ ] **Step 6: Switch to live mode and do one real charge**

In Stripe dashboard, toggle from Test mode to Live mode.

Update Stripe keys in Supabase Edge Function secrets:
- Go to https://supabase.com/dashboard/project/mezhtdbfyvkshpuplqqw/settings/functions
- Update `STRIPE_SECRET_KEY` to the live secret key (starts with `sk_live_...`)
- Update `STRIPE_WEBHOOK_SECRET` to the live webhook signing secret

Repeat Step 4 with a real credit card. Charge $19.00.

Verify in Stripe live mode dashboard: Payment appears under Payments.

- [ ] **Step 7: Verify payout is queued**

In Stripe live mode → Balance → confirm the $19 payment appears in your balance (minus Stripe fee: ~$0.85).

Standard payout timing: 2 business days to bank for US accounts in standard mode. Instant payouts available if enabled.

- [ ] **Step 8: Monitor for 24 hours**

Check Stripe dashboard for any failed webhook deliveries. Check Supabase `stripe-webhook` function logs for errors. Confirm no duplicate `plan` updates or webhook retries causing issues.

**Definition of done:** One real $19 USD charge appears in Stripe live mode, trainer plan shows `pro` in Supabase, payout queued to bank.

---

## Self-Review Checklist

Before declaring this plan complete, verify:

- [ ] Task 1 covers BaseMinimal.astro cookie banner gap ✅
- [ ] Task 2 seeds 15 NYC trainers with real INSERT statements (no placeholders) ✅
- [ ] Task 3 adds missing blog schema columns before INSERTing content ✅
- [ ] Task 3 includes 10 full articles (no placeholder content) ✅
- [ ] Task 4 Stripe protocol covers test mode → live mode → payout verification ✅
- [ ] All SQL is idempotent (ON CONFLICT DO NOTHING) ✅
- [ ] All column names match existing schema (verified against migrations) ✅
