# TrainedBy — Foundation to Launch Design
**Date:** 2026-04-30
**Markets:** UAE (trainedby.ae) + US (trainedby.com), others via SEO content
**Approach:** Parallel foundation tracks → product polish → seeded launch

---

## 1. Strategy

Build in three sequential phases. Phase 1 runs two parallel tracks (engineering + compliance) that are fully independent. Phases 2 and 3 follow sequentially.

```
Phase 1 (Foundation)
  Track 1 — Engineering:  Sentry → Idempotency → Rate limiting → Hardcoded URLs
  Track 2 — Compliance:   Legal pages → Cookie consent → Consent checkboxes → Admin password rotation
                                    ↓
Phase 2 (Product)
  2a — Multi-Domain:      Payment router → Per-domain sitemaps → schema.org → OG images
  2b — UX/Growth:         Multi-step onboarding → Profile completeness → PWA
                                    ↓
Phase 3 (Launch)
  Seeded cohort (UAE + US) → open signups → content SEO flywheel
```

No phase executes without a verified `PLAN.md`. GSD manages all execution.

---

## 2. Phase 1 — Foundation

### Track 1: Engineering Quality

**Priority order:** risk-highest first.

#### 1.1 Sentry Error Monitoring
- Add `@sentry/astro` to the Astro frontend (browser + SSR)
- Add Sentry initialization to `supabase/functions/_shared/errors.ts` so all 45 edge functions report errors automatically without touching each function individually
- Sentry DSN stored in Supabase secrets (`SENTRY_DSN`) and Netlify env var
- Success criteria: a deliberate thrown error in both frontend and an edge function appears in the Sentry dashboard within 60 seconds

#### 1.2 Payment Idempotency
- `stripe-webhook` and `razorpay-webhook` must reject duplicate webhook deliveries
- Implementation: create a `processed_webhooks` Supabase table (`event_id TEXT PRIMARY KEY, processed_at TIMESTAMPTZ`)
- On each webhook: check if `event.id` exists → reject with 200 if so → process and insert if not
- The 200 response on duplicate is intentional — Stripe/Razorpay stop retrying on 2xx
- Success criteria: replaying the same webhook event ID twice results in exactly one DB write

#### 1.3 Rate Limiting
- Shared utility: `supabase/functions/_shared/ratelimit.ts`
- Strategy: token bucket per IP, stored in a `rate_limits` Supabase table (IP hash + count + window start)
- IP is hashed with `IP_HASH_SALT` before storage (already in `.env.example`)
- Apply to: `send-magic-link` (10/hr), `register-trainer` (5/hr), `submit-lead` (20/hr), `create-checkout` (10/hr), `create-razorpay-order` (10/hr)
- Returns 429 with `Retry-After` header on breach
- Success criteria: 11th request within the window to `send-magic-link` from same IP returns 429

#### 1.4 Remove Hardcoded URLs
- Frontend: replace all `trainedby.ae` strings with `Astro.url.origin` (server-side) or `window.location.origin` (client-side)
- Edge functions: replace hardcoded domain references with `Deno.env.get('PUBLIC_URL')` — set per-market in Supabase secrets
- Grep target: `trainedby.ae` across `src/` and `supabase/functions/`
- Success criteria: running the app on `localhost` and on `trainedby.com` produces correct self-referential URLs with zero hardcoded `.ae` references

---

### Track 2: Compliance (parallel with Track 1)

#### 2.1 Legal Pages
- Populate `/privacy`, `/terms`, `/cookie-policy` (routes already exist in `src/pages/`)
- Content must cover:
  - **Privacy:** CCPA (US) + PDPL (UAE) — data collected, purpose, retention, right to delete
  - **Terms:** TrainedBy is a software provider not employer/trainer, liability disclaimer for physical injury, Stripe Connected Account Agreement incorporation, subscription cancellation terms
  - **Cookie Policy:** what cookies are set, purpose, how to opt out
- All three pages use the existing `Base.astro` layout and market-aware brand name

#### 2.2 Cookie Consent Banner
- `src/components/CookieConsent.astro` already exists — wire it to actually appear and block non-essential cookies until accepted
- Consent preference stored in `localStorage` key `tb_cookie_consent` (`accepted` | `declined`)
- Banner dismissed on accept; preference persists across sessions
- No third-party cookie library — keep it native
- Success criteria: fresh browser session shows banner; accepting hides it; preference survives page reload

#### 2.3 Consent Checkboxes
- `join.astro` trainer signup: add required checkbox "I agree to the [Terms of Service] and [Privacy Policy]" — form cannot submit without it
- Consumer lead capture forms: add "I consent to being contacted by this trainer" checkbox (PDPL requirement)
- Both checkboxes must be unchecked by default

#### 2.4 Admin Password Rotation
- Remove `trainedby-admin-2026` from `CLAUDE.md` immediately (it's in a public repo)
- Rotate the actual `/superadmin` password
- New password stored only in a password manager — never in source files or committed docs

---

## 3. Phase 2 — Product

### 2a: Multi-Domain Engine

#### Payment Router
- New edge function: `payment-router`
- Reads `market_configs.payment_provider` from Supabase for the trainer's market
- Routes to `create-checkout` (Stripe) or `create-razorpay-order` (Razorpay) accordingly
- All frontend checkout calls go through `payment-router` — never directly to provider functions
- Adding a new payment provider = one new case in the router + new edge function, no frontend changes

#### Per-Domain Sitemaps + robots.txt
- Astro endpoint: `src/pages/sitemap.xml.ts` — generates sitemap scoped to the current domain's trainers only
- Astro endpoint: `src/pages/robots.txt.ts` — generates `Sitemap:` directive pointing to the correct domain's sitemap
- Each domain gets crawled and indexed independently by Google

#### schema.org JSON-LD on Trainer Profiles
- `[slug].astro` gets a `<script type="application/ld+json">` block per render
- Schema type: `Person` with `worksFor`, `hasCredential` (certifications), `aggregateRating` (from reviews), `address` (market city)
- Data sourced from the trainer's Supabase row — no static content
- Success criteria: Google Rich Results Test passes on a live trainer profile URL

#### Dynamic OG Images
- Server-side generation via Astro API route: `src/pages/og/[slug].png.ts`
- Renders: trainer name, photo (or initials fallback), cert badge, market brand name
- Uses Satori (lightweight, no headless browser, works on Netlify/Deno)
- `[slug].astro` `<meta property="og:image">` points to this route
- Success criteria: sharing a trainer profile link on WhatsApp shows a branded card

---

### 2b: UX & Growth

#### Multi-Step Onboarding (`/join`)
- Refactor from one long form to 3 steps with progress indicator:
  - Step 1: Name, email, certification type + number, market
  - Step 2: Profile photo, bio (AI-assisted via `ai-bio-writer`), Instagram handle
  - Step 3: Package names + pricing, availability
- Each step auto-saves to `localStorage` on change — trainer can close and resume
- Step 1 data submitted to `register-trainer` immediately to create the record; steps 2-3 use `update-trainer`
- Consent checkbox on Step 1 before any data is sent
- Success criteria: drop a session after Step 1, reload `/join` — Step 2 is pre-filled

#### Profile Completeness Widget
- `ProfileCompleteness.astro` already exists — wire to real data
- Fields tracked: photo, bio (>50 chars), Instagram, at least 1 package, at least 1 review, cert verified
- Score thresholds:
  - <50%: neutral — show what's missing
  - 50-69%: green progress — "You're on your way"
  - 70-99%: show "Upgrade to Pro" nudge inline
  - 100%: show "Share your profile" prompt with Web Share API
- Score computed server-side in the dashboard page render, not client-side

#### PWA
- `public/manifest.json`: app name, icons (192x192 + 512x512), `display: standalone`, `start_url: /dashboard`, theme color matches `--brand`
- Service worker registered from `Base.astro`: caches dashboard shell (HTML, CSS, JS) for offline load
- Data fetches (edge function calls) remain live — no offline data caching
- iOS: `<meta name="apple-mobile-web-app-capable">` + apple touch icon
- Success criteria: Chrome DevTools Lighthouse PWA audit passes; "Add to Home Screen" prompt appears on mobile

---

## 4. Phase 3 — Launch

**Approach:** seeded cohort, not open signups.

1. Recruit 20-30 UAE trainers (home market — warm outreach, existing contacts)
2. Recruit 10-15 US trainers (NASM/ACE newly certified — LinkedIn/Instagram DMs)
3. White-glove onboarding: walk each trainer through `/join` personally, watch friction points
4. Fix any blockers found during seed cohort before opening signups
5. Open signups once 3+ trainers in each market have completed profiles and received their first lead
6. Content SEO: every trainer profile is a long-tail keyword page from day one — no additional work required

---

## 5. GSD Project Structure

```
.planning/
  STATE.md                         — current phase + active task
  DECISIONS.md                     — architectural decisions log
  CONCERNS.md                      — known issues / tech debt
  phases/
    phase-1a-engineering/
      PLAN.md
    phase-1b-compliance/
      PLAN.md
    phase-2a-multimarket/
      PLAN.md
    phase-2b-ux/
      PLAN.md
    phase-3-launch/
      PLAN.md
```

Each `PLAN.md` is created via `/gsd-plan-phase` before execution begins. Each phase is verified via `/gsd-verify-work` before the next phase starts.

---

## 6. Success Criteria (Pre-Launch Gate)

Before opening signups, all of the following must be true:

- [ ] Sentry reporting errors from both frontend and edge functions
- [ ] Zero duplicate payment events processable (idempotency verified)
- [ ] Rate limiting active on all 5 high-risk endpoints
- [ ] Zero `trainedby.ae` hardcoded strings in source
- [ ] `/privacy`, `/terms`, `/cookie-policy` pages live with correct content
- [ ] Cookie consent banner working on all pages
- [ ] Consent checkboxes on trainer signup and lead forms
- [ ] Admin password rotated and removed from source
- [ ] Payment router live and tested in UAE (Stripe AED) + US (Stripe USD)
- [ ] Trainer profiles passing Google Rich Results Test
- [ ] OG images rendering on WhatsApp share
- [ ] `/join` multi-step flow with auto-save working end-to-end
- [ ] Profile completeness widget wired to real data
- [ ] PWA Lighthouse audit passing
- [ ] 5+ trainer profiles live and complete in UAE, 3+ in US
