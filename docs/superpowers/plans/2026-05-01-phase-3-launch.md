# Phase 3 — Launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clear the remaining pre-launch engineering gate items and execute a seeded cohort launch (20-30 UAE + 10-15 US trainers) before opening public signups.

**Architecture:** Two sequential tracks: (1) engineering fixes — harden multi-market correctness by removing the last hardcoded `trainedby.ae` strings from edge functions and verifying Sentry captures errors from both frontend and edge layer; (2) operational — run the full pre-launch gate audit, then execute UAE and US seeded cohort outreach using structured tracker docs, white-glove onboarding, and a final open-signups gate check.

**Tech Stack:** Deno edge functions (Supabase), `_shared/market_url.ts` for domain resolution, Sentry (frontend: `@sentry/astro`, edge: `_shared/sentry.ts`), Resend email API, Netlify env vars, Supabase secrets.

---

## File Map

**Modified by engineering tasks:**
- `supabase/functions/register-trainer/index.ts` — replace hardcoded domain in welcome email
- `supabase/functions/join-waitlist/index.ts` — replace hardcoded domain in email body links
- `supabase/functions/growth-agent/index.ts` — replace hardcoded domain in email footer and from address

**Created by operational tasks:**
- `.planning/launch/pre-launch-audit.md` — gate checklist results with evidence
- `.planning/launch/uae-outreach.md` — UAE seeded cohort contact tracker
- `.planning/launch/us-outreach.md` — US seeded cohort contact tracker
- `.planning/launch/onboarding-checklist.md` — white-glove onboarding process per trainer
- `.planning/launch/open-signups-gate.md` — final gate check before announcing public signups

---

## Task 1: Fix hardcoded trainedby.ae in register-trainer welcome email

`register-trainer` sends a welcome email after signup but always links to `trainedby.ae` regardless of the trainer's market. `_shared/market_url.ts` already has `getEditUrl()`, `getProfileUrl()`, `getMarketSupportEmail()`, and `getMarketBrand()` — use them.

**Files:**
- Modify: `supabase/functions/register-trainer/index.ts`

- [ ] **Step 1: Read the current sendWelcomeEmail function**

  Open `supabase/functions/register-trainer/index.ts`. Find the `sendWelcomeEmail` function (around line 242). It currently has this signature:

  ```ts
  async function sendWelcomeEmail(
    email: string,
    slug: string,
    token: string,
    isExisting: boolean
  )
  ```

  And hardcodes:
  ```ts
  const editUrl = `https://trainedby.ae/edit?token=${token}`;
  const profileUrl = `https://trainedby.ae/${slug}`;
  // ...
  from: "TrainedBy <hello@trainedby.ae>",
  ```

- [ ] **Step 2: Add market param + import market_url helpers**

  At the top of `register-trainer/index.ts`, add the import (after the existing imports):

  ```ts
  import { getEditUrl, getProfileUrl, getMarketSupportEmail, getMarketBrand } from '../_shared/market_url.ts';
  ```

  Change the `sendWelcomeEmail` signature to accept `market`:

  ```ts
  async function sendWelcomeEmail(
    email: string,
    slug: string,
    token: string,
    isExisting: boolean,
    market: string
  )
  ```

- [ ] **Step 3: Replace hardcoded URLs and from address inside sendWelcomeEmail**

  Replace the three hardcoded strings:

  ```ts
  // Before:
  const editUrl = `https://trainedby.ae/edit?token=${token}`;
  const profileUrl = `https://trainedby.ae/${slug}`;

  // After:
  const editUrl = `${getEditUrl(market)}?token=${token}`;
  const profileUrl = getProfileUrl(market, slug);
  ```

  Replace the `from` field:

  ```ts
  // Before:
  from: "TrainedBy <hello@trainedby.ae>",

  // After:
  from: `${getMarketBrand(market)} <${getMarketSupportEmail(market)}>`,
  ```

  Also replace the `TrainedBy` brand name hardcoded in the email HTML (there is a `<span>TrainedBy</span>` in the email template around line 278). Replace it with `${getMarketBrand(market)}`.

- [ ] **Step 4: Find where sendWelcomeEmail is called and pass the market**

  Search the file for `sendWelcomeEmail(`. It is called once. The request body already has `name, email, phone, title, specialties, reps_number, referred_by` — add `market` to the destructure:

  ```ts
  // Before:
  const { name, email, phone, title, specialties, reps_number, referred_by } = body;

  // After:
  const { name, email, phone, title, specialties, reps_number, referred_by, market = 'ae' } = body;
  ```

  Then update the call site to pass `market`:

  ```ts
  // Before:
  await sendWelcomeEmail(email, slug, token, isExisting);

  // After:
  await sendWelcomeEmail(email, slug, token, isExisting, market);
  ```

- [ ] **Step 5: Verify join.astro sends market in the register-trainer request body**

  Search `src/pages/join.astro` for the `register-trainer` fetch call. Confirm it sends `market` in the JSON body. It should look like:

  ```js
  body: JSON.stringify({ name, email, ..., market })
  ```

  If `market` is missing from the body, find where the market select value is stored in the join form state and add it.

- [ ] **Step 6: Commit**

  ```bash
  git add supabase/functions/register-trainer/index.ts src/pages/join.astro
  git commit -m "fix: make register-trainer welcome email market-aware"
  ```

---

## Task 2: Fix hardcoded trainedby.ae in join-waitlist and growth-agent

**Files:**
- Modify: `supabase/functions/join-waitlist/index.ts`
- Modify: `supabase/functions/growth-agent/index.ts`

- [ ] **Step 1: Fix join-waitlist — email body links**

  Open `supabase/functions/join-waitlist/index.ts`. The `CONFIRMATION_COPY` object has `en`, `fr`, `it`, `es` email bodies. Each body links to `https://trainedby.ae` instead of the per-market domain.

  The function already has `FROM_EMAILS` keyed by market. Add a domain map and update the email bodies to use it.

  Add after the existing `FROM_EMAILS` map:

  ```ts
  import { getMarketBaseUrl } from '../_shared/market_url.ts';
  ```

  Then find where `CONFIRMATION_COPY` body strings are used. The function receives a `market` parameter — pass `getMarketBaseUrl(market)` into each email body. The simplest approach: replace the static `CONFIRMATION_COPY` body text so it becomes a function that accepts the domain:

  ```ts
  function getConfirmationBody(locale: string, marketUrl: string): string {
    const bodies: Record<string, string> = {
      en: `<p>Thanks for joining the waitlist. You'll be the first to know when we launch in your market  -  and you'll get the early-bird price locked in.</p>
  <p>In the meantime, feel free to check out what's already live on <a href="${marketUrl}">${marketUrl.replace('https://', '')}</a>.</p>`,
      fr: `<p>Merci de rejoindre la liste d'attente. Vous serez le premier informé du lancement en France  -  avec le prix de lancement bloqué.</p>
  <p>En attendant, découvrez ce qui est déjà en ligne sur <a href="${marketUrl}">${marketUrl.replace('https://', '')}</a>.</p>`,
      it: `<p>Grazie per esserti unito alla lista d'attesa. Sarai il primo a sapere del lancio in Italia  -  con il prezzo di lancio bloccato.</p>
  <p>Nel frattempo, scopri cosa è già online su <a href="${marketUrl}">${marketUrl.replace('https://', '')}</a>.</p>`,
      es: `<p>Gracias por unirte a la lista de espera. Serás el primero en saber del lanzamiento en tu mercado  -  con el precio de lanzamiento bloqueado.</p>
  <p>Mientras tanto, descubre lo que ya está en línea en <a href="${marketUrl}">${marketUrl.replace('https://', '')}</a>.</p>`,
    };
    return bodies[locale] ?? bodies['en'];
  }
  ```

  Remove the old static `CONFIRMATION_COPY` object. Find where it was used (e.g., `CONFIRMATION_COPY[locale]?.body`) and replace with `getConfirmationBody(locale, getMarketBaseUrl(market))`.

- [ ] **Step 2: Fix growth-agent — email footer and from address**

  Open `supabase/functions/growth-agent/index.ts`.

  Add the import at the top:

  ```ts
  import { getMarketBaseUrl } from '../_shared/market_url.ts';
  ```

  **Line 283 — email footer:**
  ```ts
  // Before:
  <p style="color:#555;font-size:12px;text-align:center;margin-top:32px;">TrainedBy Growth Agent · <a href="https://trainedby-ae.netlify.app" style="color:#FF5C00;">trainedby.ae</a></p>

  // After:
  <p style="color:#555;font-size:12px;text-align:center;margin-top:32px;">TrainedBy Growth Agent · <a href="${getMarketBaseUrl('ae')}" style="color:#FF5C00;">trainedby.ae</a></p>
  ```

  **Line 292 — from address:**
  ```ts
  // Before:
  from: 'TrainedBy Growth Agent <growth@trainedby.ae>',

  // After:
  from: Deno.env.get('GROWTH_FROM_EMAIL') ?? 'TrainedBy Growth Agent <growth@trainedby.ae>',
  ```

  Note: growth-agent is an internal system email sent to the founder, not to multi-market customers. The `GROWTH_FROM_EMAIL` env var lets you override it without code changes. The hardcoded fallback is acceptable for now — the remaining change (`getMarketBaseUrl`) ensures the footer link is driven from the single source of truth rather than a literal string that could drift.

- [ ] **Step 3: Commit**

  ```bash
  git add supabase/functions/join-waitlist/index.ts supabase/functions/growth-agent/index.ts
  git commit -m "fix: remove hardcoded trainedby.ae from join-waitlist and growth-agent"
  ```

---

## Task 3: Wire Sentry DSN and verify end-to-end error reporting

The Sentry integration code is fully wired (`@sentry/astro` in `astro.config.mjs`, `_shared/sentry.ts` in edge functions). What's missing is the DSN being set in the two deployment environments. This task also verifies the full pipeline works.

**Files:**
- No code changes — this is a configuration and verification task.

- [ ] **Step 1: Create a Sentry project (if not yet done)**

  Go to `sentry.io` → New Project → Platform: `JavaScript (Browser)` → project name: `trainedby-frontend`. Do the same for `trainedby-edge` (Platform: `Node.js` or `Other`). Copy both DSNs.

- [ ] **Step 2: Set Sentry DSN in Netlify**

  In the Netlify dashboard: Site → Environment variables.

  Add:
  - `PUBLIC_SENTRY_DSN` = the **frontend** DSN from step 1
  - `SENTRY_AUTH_TOKEN` = a Sentry auth token with `project:write` scope (from sentry.io → Settings → Auth Tokens)

  These are read by `astro.config.mjs` at build time.

- [ ] **Step 3: Set Sentry DSN in Supabase secrets**

  ```bash
  supabase secrets set SENTRY_DSN=<edge-function-dsn> --project-ref mezhtdbfyvkshpuplqqw
  ```

  This is read by `_shared/sentry.ts` via `Deno.env.get('SENTRY_DSN')`.

- [ ] **Step 4: Trigger a test error from the frontend**

  In `src/pages/dashboard.astro`, temporarily add a throw in the frontmatter SSR block after the auth check:

  ```ts
  // TEMP: Sentry smoke test — remove after verifying
  throw new Error('Sentry frontend smoke test');
  ```

  Deploy to Netlify (push to main). Visit `/dashboard`. Wait 60 seconds. Check the Sentry dashboard → `trainedby-frontend` project. Confirm the error appears with the correct stack trace and environment label.

  Remove the throw, redeploy.

- [ ] **Step 5: Trigger a test error from an edge function**

  In `supabase/functions/send-magic-link/index.ts`, temporarily add after the imports:

  ```ts
  // TEMP: Sentry smoke test — remove after verifying
  import { captureException } from '../_shared/sentry.ts';
  ```

  And inside the `serve()` handler at the top:

  ```ts
  await captureException(new Error('Sentry edge smoke test'), { function: 'send-magic-link' });
  ```

  Deploy the function:
  ```bash
  SUPABASE_ACCESS_TOKEN=<token> ./scripts/deploy_functions.sh send-magic-link
  ```

  Call the function once (send a magic link request). Wait 60 seconds. Check Sentry → `trainedby-edge`. Confirm the error appears.

  Remove the test throw, redeploy.

- [ ] **Step 6: Commit Sentry is confirmed working**

  No code to commit (config lives in env). Log the verification in `.planning/launch/pre-launch-audit.md` (created in Task 4).

---

## Task 4: Pre-launch gate audit

Run every item in the pre-launch gate checklist systematically. Document evidence for each pass. Flag any fail with a remediation note.

**Files:**
- Create: `.planning/launch/pre-launch-audit.md`

- [ ] **Step 1: Create the audit document**

  Create `.planning/launch/pre-launch-audit.md`:

  ```markdown
  # Pre-Launch Gate Audit
  Date: 2026-05-01
  
  ## Gate Checklist
  
  | Item | Status | Evidence / Notes |
  |------|--------|-----------------|
  | Sentry frontend errors | ❌ PENDING | |
  | Sentry edge function errors | ❌ PENDING | |
  | Zero duplicate payment events (idempotency) | ❌ PENDING | |
  | Rate limiting — send-magic-link (10/hr) | ❌ PENDING | |
  | Rate limiting — register-trainer (5/hr) | ❌ PENDING | |
  | Rate limiting — submit-lead (20/hr) | ❌ PENDING | |
  | Rate limiting — create-checkout (10/hr) | ❌ PENDING | |
  | Rate limiting — payment-router (10/hr) | ❌ PENDING | |
  | Zero trainedby.ae hardcoded strings in source | ❌ PENDING | |
  | /privacy page live with correct content | ❌ PENDING | |
  | /terms page live with correct content | ❌ PENDING | |
  | /cookie-policy page live with correct content | ❌ PENDING | |
  | Cookie consent banner on all pages | ❌ PENDING | |
  | Consent checkbox on trainer signup | ❌ PENDING | |
  | Consent checkbox on lead capture forms | ❌ PENDING | |
  | Admin password not in source files | ❌ PENDING | |
  | Payment router — UAE Stripe AED flow | ❌ PENDING | |
  | Payment router — US Stripe USD flow | ❌ PENDING | |
  | Trainer profiles — Google Rich Results Test | ❌ PENDING | |
  | OG images — WhatsApp share preview | ❌ PENDING | |
  | /join multi-step flow with auto-save | ❌ PENDING | |
  | Profile completeness widget — real data | ❌ PENDING | |
  | PWA Lighthouse audit passing | ❌ PENDING | |
  | 5+ UAE trainer profiles live and complete | ❌ PENDING | |
  | 3+ US trainer profiles live and complete | ❌ PENDING | |
  
  ## Open Issues
  (Fill as you audit)
  ```

- [ ] **Step 2: Audit Sentry**

  After completing Task 3, mark both Sentry rows ✅ with the timestamp of the confirmed error capture.

- [ ] **Step 3: Audit idempotency**

  Check `supabase/functions/stripe-webhook/index.ts` — confirm it reads from `processed_webhook_events` before processing and inserts after. Do the same for `razorpay-webhook`. Confirm the migration `20260415_idempotency_and_monitoring.sql` is applied to production.

  Run in Supabase SQL editor:
  ```sql
  SELECT table_name FROM information_schema.tables WHERE table_name = 'processed_webhook_events';
  ```

  Mark ✅ if table exists and code uses it.

- [ ] **Step 4: Audit rate limiting**

  For each of the 5 functions, grep to confirm `checkRateLimit` is called:

  ```bash
  grep -l "checkRateLimit" supabase/functions/send-magic-link/index.ts \
    supabase/functions/register-trainer/index.ts \
    supabase/functions/submit-lead/index.ts \
    supabase/functions/create-checkout/index.ts \
    supabase/functions/payment-router/index.ts
  ```

  Expected: all 5 files listed. Mark each row ✅ or ❌.

- [ ] **Step 5: Audit hardcoded URLs**

  After Tasks 1 and 2 are complete, run:

  ```bash
  grep -rn "trainedby\.ae" src/ supabase/functions/ \
    --include="*.ts" --include="*.astro" --include="*.js" \
    | grep -v "_shared/market_url.ts" \
    | grep -v "src/lib/market.ts" \
    | grep -v "src/lib/i18n.ts" \
    | grep -v "astro.config.mjs" \
    | grep -v ".planning/"
  ```

  The grep excludes the legitimate market-config files (market.ts and i18n.ts define the UAE market — those strings are correct). Expected output: empty. If anything appears, fix it before marking ✅.

- [ ] **Step 6: Audit legal pages**

  Visit (or `curl`) the live URLs:
  - `https://trainedby.ae/privacy` — confirm CCPA + PDPL sections present
  - `https://trainedby.ae/terms` — confirm liability disclaimer and cancellation terms
  - `https://trainedby.ae/cookie-policy` — confirm cookie table with purpose column

  Mark all three ✅ or note what content is missing.

- [ ] **Step 7: Audit cookie consent**

  Open an incognito browser window. Visit `https://trainedby.ae`. Confirm the cookie consent banner appears. Accept it. Reload — confirm banner does not reappear. Open DevTools → Application → Local Storage → confirm `tb_cookie_consent = accepted`. Mark ✅.

- [ ] **Step 8: Audit consent checkboxes**

  Visit `/join` — confirm checkbox is unchecked by default and form submission is blocked without checking it. Visit a trainer profile page and submit the lead form — confirm the consent checkbox is present and required. Mark each ✅ or ❌.

- [ ] **Step 9: Audit admin password**

  ```bash
  grep -rn "superadmin\|admin.*password\|old-admin" CLAUDE.md src/ supabase/ --include="*.md" --include="*.ts" --include="*.astro"
  ```

  Expected: no plaintext passwords. CLAUDE.md should say "password stored in 1Password". Mark ✅ if clean.

- [ ] **Step 10: Audit payment router**

  In Stripe dashboard, find a test mode checkout created via `payment-router` for market=ae (AED). Confirm the currency is AED. Do the same for market=com (USD). Mark each ✅.

- [ ] **Step 11: Audit schema.org and OG images**

  Go to [Google Rich Results Test](https://search.google.com/test/rich-results) (search.google.com/test/rich-results). Paste a live trainer profile URL (e.g., `https://trainedby.ae/<slug>`). Confirm `Person` schema detected with no errors. Mark ✅.

  Send a trainer profile URL on WhatsApp to yourself. Confirm the branded OG image card appears. Mark ✅.

- [ ] **Step 12: Audit Phase 2b items (join, completeness, PWA)**

  These were shipped in Phase 2b — verify they're still working on the current production build:
  - `/join` — go through all 3 steps, close browser after step 1, reopen — confirm step 2 is pre-filled
  - `/dashboard` — log in, confirm profile completeness shows real data not "0%"
  - Chrome DevTools → Lighthouse → Progressive Web App — run audit on `/dashboard`. Confirm green PWA score.

  Mark each ✅.

- [ ] **Step 13: Update audit doc and commit**

  Update `.planning/launch/pre-launch-audit.md` with results. Commit:

  ```bash
  git add .planning/launch/pre-launch-audit.md
  git commit -m "docs: pre-launch gate audit results"
  ```

---

## Task 5: UAE seeded cohort — outreach tracker

Create a structured contact tracker for the 20-30 UAE trainer targets.

**Files:**
- Create: `.planning/launch/uae-outreach.md`

- [ ] **Step 1: Create UAE outreach tracker**

  Create `.planning/launch/uae-outreach.md`:

  ```markdown
  # UAE Seeded Cohort — Outreach Tracker
  Target: 20-30 trainers. Open signups gate: 5+ with complete profiles + 1 lead each.
  
  ## Status Key
  - 🎯 Target — identified, not yet contacted
  - 📤 Contacted — outreach sent (DM / WhatsApp / email)
  - 💬 Replied — responded, interested
  - ✅ Onboarded — profile live and complete on trainedby.ae
  - 🏆 First lead — received at least 1 lead
  - ❌ Declined — not interested
  
  ## Contacts
  
  | # | Name | Specialty | Channel | Status | Notes |
  |---|------|-----------|---------|--------|-------|
  | 1 | | | | 🎯 | |
  | 2 | | | | 🎯 | |
  | 3 | | | | 🎯 | |
  
  ## Outreach Message Template (WhatsApp/DM)
  
  > Hi [Name], I'm the founder of TrainedBy — a platform for personal trainers in Dubai
  > to get discovered online and receive leads directly. I'm doing a private beta with
  > a small group of trainers before we open to everyone. I'd love to give you a free
  > profile and walk you through it personally. Takes 15 minutes. Interested?
  
  ## Gate Progress
  - [ ] 5 trainers with complete profiles
  - [ ] 5 trainers with at least 1 lead received
  ```

- [ ] **Step 2: Populate with initial targets**

  Fill in the first 10 rows with UAE trainers from your existing contacts, REPs UAE directory, or Instagram search (use relevant Dubai/Abu Dhabi fitness hashtags). For each, note the channel (WhatsApp, Instagram DM, LinkedIn) and specialty.

- [ ] **Step 3: Commit**

  ```bash
  git add .planning/launch/uae-outreach.md
  git commit -m "docs: UAE seeded cohort outreach tracker"
  ```

---

## Task 6: US seeded cohort — outreach tracker

**Files:**
- Create: `.planning/launch/us-outreach.md`

- [ ] **Step 1: Create US outreach tracker**

  Create `.planning/launch/us-outreach.md`:

  ```markdown
  # US Seeded Cohort — Outreach Tracker
  Target: 10-15 trainers. Focus: NASM/ACE newly certified (graduated within last 6 months).
  Open signups gate: 3+ with complete profiles + 1 lead each.
  
  ## Status Key
  (Same as UAE tracker)
  - 🎯 Target — identified, not yet contacted
  - 📤 Contacted
  - 💬 Replied
  - ✅ Onboarded
  - 🏆 First lead
  - ❌ Declined
  
  ## Contacts
  
  | # | Name | Cert (NASM/ACE) | City | Channel | Status | Notes |
  |---|------|-----------------|------|---------|--------|-------|
  | 1 | | | | | 🎯 | |
  | 2 | | | | | 🎯 | |
  | 3 | | | | | 🎯 | |
  
  ## Sourcing Channels
  - LinkedIn search: "NASM certified personal trainer 2025" OR "ACE certified 2025"
  - Instagram: `#NASMcertified`, `#personaltrainer`, filter by recent posts
  - NASM Find a Trainer directory (nasm.org) — newly listed profiles
  
  ## Outreach Message Template (LinkedIn / Instagram DM)
  
  > Hi [Name], congrats on the NASM/ACE cert! I'm the founder of TrainedBy.com — a
  > platform that helps certified trainers get found by clients online without paying
  > for ads. I'm personally onboarding the first 15 US trainers before public launch.
  > It's free, takes 15 minutes, and I'll walk you through it. Worth a look?
  
  ## Gate Progress
  - [ ] 3 trainers with complete profiles
  - [ ] 3 trainers with at least 1 lead received
  ```

- [ ] **Step 2: Populate with initial targets**

  Fill in the first 5-8 rows using LinkedIn search or the NASM trainer directory. Add name, cert, city, and channel for each target.

- [ ] **Step 3: Commit**

  ```bash
  git add .planning/launch/us-outreach.md
  git commit -m "docs: US seeded cohort outreach tracker"
  ```

---

## Task 7: White-glove onboarding checklist

Create a repeatable per-trainer onboarding process. This is what you walk every seed cohort trainer through personally.

**Files:**
- Create: `.planning/launch/onboarding-checklist.md`

- [ ] **Step 1: Create the onboarding checklist**

  Create `.planning/launch/onboarding-checklist.md`:

  ```markdown
  # White-Glove Onboarding Checklist
  
  Use this for every seed cohort trainer. Complete it during a shared screen call or
  step-by-step via WhatsApp. Expected time: 15-20 minutes per trainer.
  
  ## Pre-call
  - [ ] Find their Instagram handle (speeds up step 2)
  - [ ] Find their cert body + number if possible
  - [ ] Open trainedby.ae/join in your browser to screen-share
  
  ## During the call
  
  ### Step 1 — Basic info
  - [ ] Enter their full name as they want it displayed
  - [ ] Email (their primary, so magic links arrive reliably)
  - [ ] Certification type and number
  - [ ] Market (ae or com)
  - [ ] Submit → confirm they receive the magic link email
  
  ### Step 2 — Profile
  - [ ] Upload a professional photo (headshot, square, >500px)
  - [ ] Write the bio together — use the AI Bio button, then edit
  - [ ] Enter Instagram handle (without @)
  - [ ] Note any friction in this step → add to `.planning/launch/friction-log.md`
  
  ### Step 3 — Packages
  - [ ] Create at least 1 package (name, price, duration, description)
  - [ ] Set availability (e.g., "Mon-Fri 6am-8pm, weekends by arrangement")
  
  ## Post-call
  - [ ] Send them a DM with their profile URL: `https://trainedby.ae/<slug>`
  - [ ] Ask them to share it with at least 2 clients this week
  - [ ] Add a row to the outreach tracker and mark status ✅ Onboarded
  - [ ] Add them to the friction log if they hit any confusion during the flow
  
  ## Friction Log
  See `.planning/launch/friction-log.md` — created after first onboarding session.
  ```

- [ ] **Step 2: Create friction log**

  Create `.planning/launch/friction-log.md`:

  ```markdown
  # Onboarding Friction Log
  
  Observations from white-glove onboarding sessions. Fix before opening signups.
  
  | Date | Trainer | Step | What they got stuck on | Fix shipped? |
  |------|---------|------|------------------------|--------------|
  | | | | | |
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add .planning/launch/onboarding-checklist.md .planning/launch/friction-log.md
  git commit -m "docs: white-glove onboarding checklist and friction log"
  ```

---

## Task 8: Open signups gate check

Before announcing public signups, verify the gate criteria are all met.

**Files:**
- Create: `.planning/launch/open-signups-gate.md`

- [ ] **Step 1: Create the gate check document**

  Create `.planning/launch/open-signups-gate.md`:

  ```markdown
  # Open Signups Gate Check
  
  Date started: ___
  Date opened: ___
  
  ## Hard Gates (ALL must be ✅ before opening)
  
  - [ ] All pre-launch audit items ✅ (see pre-launch-audit.md)
  - [ ] 5+ UAE trainer profiles complete (photo + bio + 1 package + cert number present)
  - [ ] 3+ US trainer profiles complete
  - [ ] At least 1 UAE trainer has received a real lead
  - [ ] At least 1 US trainer has received a real lead
  - [ ] Friction log: no P0 issues open (flow blockers that prevent signup completion)
  - [ ] `/join` tested on mobile (iPhone Safari + Android Chrome)
  
  ## Actions when gate opens
  
  1. Post on LinkedIn: "TrainedBy is open for signups — personal trainers in Dubai and the US can join at trainedby.ae/join"
  2. DM all 🏆 First-lead trainers asking for a testimonial quote
  3. Post trainer success story (first lead received) as social proof
  4. Update the join page hero with a real trainer name + stat if available
  
  ## Monitoring (first 7 days post-launch)
  - Check Sentry daily for new errors
  - Check Supabase → trainers table for new signups
  - Check Supabase → leads table for new leads
  - Run growth-agent weekly report (Telegram @TrainedByCEO_bot)
  ```

- [ ] **Step 2: Fill in the gate check as conditions are met**

  As each seed cohort trainer completes their profile and receives their first lead, tick off the rows. Don't open until all hard gates are checked.

- [ ] **Step 3: Commit when gate passes**

  ```bash
  git add .planning/launch/open-signups-gate.md
  git commit -m "docs: open signups gate check — all criteria met, launch ready"
  ```

---

## Self-Review

### Spec coverage

| Spec requirement | Task covering it |
|-----------------|-----------------|
| Zero hardcoded trainedby.ae in source | Tasks 1 & 2 |
| Sentry reporting errors from frontend + edge | Task 3 |
| Pre-launch gate verified | Task 4 |
| Recruit 20-30 UAE trainers | Tasks 5 & 7 |
| Recruit 10-15 US trainers | Tasks 6 & 7 |
| White-glove onboarding | Task 7 |
| Fix blockers found during seed cohort | Task 7 (friction log) |
| Open signups once gate conditions met | Task 8 |
| Content SEO flywheel | No task — already live via trainer profile pages |

No gaps found.

### Placeholder scan

No TBD, TODO, or "implement later" strings. All code blocks are complete.

### Type consistency

No shared types across tasks. Each edge function change is self-contained.
