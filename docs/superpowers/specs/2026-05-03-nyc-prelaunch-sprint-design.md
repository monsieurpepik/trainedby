# NYC Pre-Launch Sprint — Implementation Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Get TrainedBy ready for a full hard launch in New York City — real trainers, real consumers, real USD payments — within one week.

**Target market:** `trainedby.com` (USD, NASM/ACE/NSCA, $19/month Pro)

**Launch city:** New York City (NYC) — seeded first, then open to US-wide organic traffic

---

## Context

- Stripe Atlas Delaware LLC entity: ✅ exists
- Bank account: finalizing (payments testing blocked until this clears)
- Stripe Connect edge functions: exist but **never tested**
- Legal pages (`/privacy`, `/terms`, `/cookie-policy`): exist with real content
- Cookie consent banner: ❌ missing
- Consent checkbox on `/join`: ❌ missing
- NYC trainer profiles: ❌ zero seeded
- Blog content: ❌ empty

---

## Track 1 — Payments End-to-End Test & Go-Live

**Scope:** Verify the full money path works in USD before launch. This is the highest-risk item.

**Steps:**

1. **Bank account clears** — prerequisite, no action needed except waiting. Do not start payment testing until Stripe dashboard shows bank account verified.

2. **Stripe test-mode E2E — trainer onboarding**
   - Open a fresh trainer account on `trainedby.com`
   - Navigate to dashboard → "Connect Stripe" 
   - Verify `connect-stripe` edge function redirects to Stripe Connect onboarding URL
   - Complete Stripe onboarding with test data
   - Verify `connect-stripe-return` edge function handles callback and updates `trainers.stripe_account_id`

3. **Stripe test-mode E2E — Pro subscription**
   - From a trainer account, trigger Pro upgrade flow
   - Verify `payment-router` edge function creates a Stripe Checkout Session in USD
   - Complete checkout with Stripe test card `4242 4242 4242 4242`
   - Verify trainer `plan` column updates to `pro` in Supabase
   - Verify `stripe-webhook` receives `checkout.session.completed` and processes it

4. **Stripe test-mode E2E — client booking payment (if applicable)**
   - If client-to-trainer payments are in scope, test a package purchase on a trainer's public profile
   - Verify funds route correctly via Stripe Connect (platform takes cut, remainder to trainer)

5. **Switch to live mode**
   - Update Stripe keys in Supabase Edge Function secrets from test to live
   - Do one real $1 charge using a real card to verify live mode works
   - Confirm payout appears in bank within 2-7 business days (standard Stripe timeline)

6. **Monitor for 24 hours**
   - Check Stripe dashboard for failed webhooks
   - Check Supabase logs for `stripe-webhook` errors
   - Confirm `plan` column correctly reflects paid status

**Definition of done:** Real USD charge processed, trainer `plan = 'pro'`, payout visible in Stripe balance destined for bank account.

---

## Track 2 — Legal & Compliance (CCPA)

**Scope:** Two additions required before collecting any US user data.

### 2a. Cookie Consent Banner

**What:** A bottom-of-screen banner that appears on first visit for US visitors. Stores `cookie_consent=accepted|declined` in `localStorage`. Must appear before any analytics fire.

**Behavior:**
- Shows on first visit (no cookie preference stored)
- "Accept" → sets `localStorage.cookie_consent = 'accepted'`, hides banner, enables analytics
- "Decline" → sets `localStorage.cookie_consent = 'declined'`, hides banner, no analytics loaded
- Banner does not reappear once preference is set
- Links to `/cookie-policy`

**Where it lives:** Added to `src/layouts/Base.astro` as a global component visible on all pages.

**Design:** Fixed bottom bar, white background, brief text: *"We use cookies to improve your experience. [Cookie Policy](/cookie-policy)"* + Accept/Decline buttons. Uses existing CSS vars (`--brand`, `--text`, `--bg`, `--border`).

**Implementation:** Pure vanilla JS + HTML injected via `<script>` in Base.astro. No external library. Under 30 lines of code.

### 2b. Consent Checkbox on `/join`

**What:** A required checkbox on the trainer signup form that must be checked before the form can be submitted.

**Label:** `I agree to the [Terms of Service](/terms) and [Privacy Policy](/privacy)`

**Behavior:**
- Checkbox is unchecked by default
- Form submit button is disabled until checkbox is checked
- Inline validation message if user tries to submit without checking: "Please accept the Terms and Privacy Policy to continue"

**Where it lives:** `src/pages/join.astro` — added just above the submit button.

**Definition of done:** US visitors see cookie banner on first visit; trainer signup requires explicit Terms/Privacy acceptance.

---

## Track 3 — NYC Trainer Supply Seeding

**Scope:** Insert 15-20 realistic NYC trainer profiles so the marketplace looks populated at launch.

**Profile requirements:**
- `city`: New York City
- `neighborhood`: spread across Midtown, Brooklyn, Upper East Side, Williamsburg, Tribeca, Astoria
- `certification`: NASM-CPT, ACE-CPT, or NSCA-CSCS
- `cert_number`: plausible format (e.g., `NASM-CPT-847291`)
- `specialties`: realistic array (e.g., `["Strength Training", "Weight Loss", "HIIT"]`)
- `packages`: 2-3 packages each, USD pricing ($250-$700/month)
- `avatar_url`: licensed stock headshot from Unsplash (fitness professional)
- `plan`: `pro` (so they show up prominently)
- `is_active`: `true`
- `reps_verified`: `true`
- `bio`: 2-3 sentence realistic bio, first-person, NYC-specific

**Method:** SQL migration file — `supabase/migrations/20260503_nyc_seed_trainers.sql` — with 15-20 INSERT statements. Profiles are clearly marked as demo data via `is_demo = true` (column already exists from migration `20260416_demo_profiles.sql`) so they can be cleanly removed post-launch once real trainers join.

**Trainer profile spread:**
| Trainer | Neighborhood | Cert | Specialty |
|---------|-------------|------|-----------|
| 5 trainers | Manhattan (Midtown/UES) | NASM-CPT | Strength, Weight Loss |
| 4 trainers | Brooklyn (Williamsburg/Park Slope) | ACE-CPT | HIIT, Functional |
| 3 trainers | Queens (Astoria/LIC) | NSCA-CSCS | Athletic Performance |
| 3 trainers | Downtown Manhattan (Tribeca/FiDi) | NASM-CPT | Corporate Wellness |
| 2 trainers | The Bronx / Staten Island | ACE-CPT | Outdoor, Bootcamp |

**Definition of done:** `/find/new-york-city` shows 15+ trainer cards with photos, certifications, and packages.

---

## Track 4 — Blog Content

**Scope:** 10 articles published to the blog to establish operational legitimacy and capture NYC search traffic.

**Content split:**

### Consumer-facing (5 articles)
1. "How to Find a Certified Personal Trainer in New York City" — covers NASM/ACE/NSCA, what to look for, avg NYC prices
2. "NASM vs ACE vs NSCA: Which Certification Should You Trust in a NYC Trainer?" — educational, builds TrainedBy's authority on cert verification
3. "The Best Neighborhoods in NYC to Train Outdoors in 2026" — Central Park, Prospect Park, Hudson River Park, etc.
4. "How Much Does a Personal Trainer Cost in New York City?" — USD pricing guide, $50-$200/session range
5. "What to Ask Before Hiring a Personal Trainer in NYC" — 7 questions, positions TrainedBy's verification as the answer

### Trainer-facing (3 articles)
6. "How to Get More Personal Training Clients in New York City" — SEO tips, social, referrals, TrainedBy profile optimization
7. "Building Your Personal Training Business in NYC: The 2026 Guide" — pricing, packages, client retention
8. "Why NYC Personal Trainers Are Moving Their Booking Links to TrainedBy" — social proof angle, vs Linktree

### Brand/trust (2 articles)
9. "How TrainedBy Verifies Fitness Certifications — And Why It Matters" — trust-building, NASM/ACE verification process
10. "TrainedBy vs Linktree for Personal Trainers: A Comparison" — conversion-focused, targets trainers searching alternatives

**Implementation:**
- Articles are AI-generated (Claude) at 600-900 words each
- Published via Supabase `blog_posts` table or equivalent CMS mechanism
- Each article has: `title`, `slug`, `content` (HTML or Markdown), `published_at`, `author` ("TrainedBy Team"), `meta_description`, `category` (consumer | trainer | brand)
- Internal links between articles and to `/find/new-york-city`

**Definition of done:** `/blog` shows 10 articles with proper titles and meta descriptions. Each article renders without errors.

---

## Launch Sequence (Day-by-Day)

| Day | Focus |
|-----|-------|
| Day 1 | Track 2 (Legal): cookie banner + consent checkbox |
| Day 1-2 | Track 4 (Blog): generate + publish 10 articles |
| Day 2-3 | Track 3 (Supply): write + run NYC trainer seed migration |
| Day 3-5 | Track 1 (Payments): E2E test as soon as bank clears |
| Day 6 | Smoke test everything on `trainedby.com` live |
| Day 7 | Launch — share trainer signup link to NYC fitness communities |

---

## Out of Scope

- Stripe Atlas tax setup (handled separately by founder)
- ICO registration (UK-only requirement)
- Paid advertising / influencer outreach
- Consumer-facing email sequences
- Mobile app

---

## Success Criteria

- [ ] USD Pro subscription checkout completes without error
- [ ] Trainer receives payout confirmation in Stripe dashboard
- [ ] Cookie consent banner visible on first visit to `trainedby.com`
- [ ] `/join` form requires Terms/Privacy acceptance
- [ ] `/find/new-york-city` shows 15+ trainer profiles with photos
- [ ] `/blog` shows 10 published articles
- [ ] Zero JS console errors on landing, find, and join pages
