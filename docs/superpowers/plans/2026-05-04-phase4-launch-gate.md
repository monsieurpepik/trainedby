# Phase 4 — Launch Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every verification item crossed off, documented with evidence. Open signups gate opens.

**Architecture:** This phase is manual verification + documentation. No new code is written unless a verification item uncovers a real bug. Each gate item requires a screenshot or command output as evidence. All evidence lives in `docs/runbooks/launch-verification.md`.

**Tech Stack:** Browser (incognito), Playwright, Google Rich Results Test, Stripe Dashboard, Bash

---

## Task 1: docs/runbooks/launch-verification.md

This is the primary output of Phase 4. Every gate item gets documented here with evidence.

**Files:**
- Create: `docs/runbooks/launch-verification.md`

- [ ] **Step 1: Create the verification runbook template**

```markdown
# Launch Verification Runbook

**Date:** 2026-05-04
**Verifier:** [name]
**Status:** IN PROGRESS

Each item must be checked manually and marked ✅ with evidence (screenshot path or command output).

---

## Hard Gates (all must pass before open signups)

### 1. Legal pages render in incognito

Open each URL in a fresh incognito window. Check: page loads, no blank content, no console errors.

| Page | URL | Status | Evidence |
|------|-----|--------|----------|
| Privacy Policy | https://trainedby.ae/privacy | ⬜ | — |
| Terms of Service | https://trainedby.ae/terms | ⬜ | — |
| Cookie Policy | https://trainedby.ae/cookie-policy | ⬜ | — |

**How to check:** Open incognito → navigate to URL → open DevTools Console → screenshot page with no errors.

---

### 2. Cookie consent banner

- [ ] Banner appears on first visit (incognito, trainedby.ae)
- [ ] Banner does not appear after accepting (reload same session)
- [ ] Banner reappears in a new incognito session

**Evidence:** Screenshot of banner on first visit.

---

### 3. Consent checkboxes on /join and lead forms

- [ ] `/join` — "I agree to terms" checkbox present and required (form doesn't submit unchecked)
- [ ] Lead form on `/[slug]` — consent checkbox present and required

**Evidence:** Screenshot of each form with checkbox visible.

---

### 4. Google Rich Results Test — trainer profile

1. Go to https://search.google.com/test/rich-results
2. Enter a live trainer profile URL (e.g., `https://trainedby.ae/sarah-al-mansoori`)
3. Verify: `Person` structured data detected, no errors

- [ ] Rich Results Test passes with no errors
- [ ] `Person` type detected

**Evidence:** Screenshot of Rich Results Test result page.

---

### 5. WhatsApp OG card

1. Open WhatsApp (mobile or web)
2. Send `https://trainedby.ae/[trainer-slug]` to yourself
3. Wait 30 seconds for link preview to generate

- [ ] Branded OG card appears (trainer name, photo, market logo)
- [ ] Not the generic fallback image

**Evidence:** Screenshot of WhatsApp link preview.

---

### 6. Stripe currency verification

Check that the payment router sends the correct currency per market.

```bash
# In Stripe Dashboard → Payments → filter by recent test payments
# Or check the payment-router edge function logs:
supabase functions logs payment-router --project-ref mezhtdbfyvkshpuplqqw | head -50
```

- [ ] `ae` market → AED currency in Stripe dashboard
- [ ] `com` market → USD currency in Stripe dashboard

**Evidence:** Screenshot of Stripe Payments dashboard showing both currencies.

---

### 7. Sentry live

- [ ] At least 1 confirmed event in Sentry dashboard
- [ ] Event is from the frontend (not a smoke test error from > 24 hours ago)

**Evidence:** Screenshot of Sentry Issues page with at least 1 event and timestamp.

---

### 8. CI pipeline blocking PRs

- [ ] Open a test PR to `staging`
- [ ] GitHub Actions CI workflow appears in the PR Checks section
- [ ] If CI fails, PR is blocked (merge button greyed out)

**Evidence:** Screenshot of PR with CI checks visible.

---

## Gate Summary

| Gate | Status | Evidence file |
|------|--------|---------------|
| Legal pages | ⬜ | — |
| Cookie consent | ⬜ | — |
| Consent checkboxes | ⬜ | — |
| Google Rich Results | ⬜ | — |
| WhatsApp OG card | ⬜ | — |
| Stripe currency | ⬜ | — |
| Sentry live | ⬜ | — |
| CI pipeline | ⬜ | — |

**All gates ✅ → open signups → LinkedIn post**
```

- [ ] **Step 2: Commit**

```bash
git add docs/runbooks/launch-verification.md
git commit -m "docs: add launch verification runbook with 8 hard gate checklist"
```

---

## Task 2: docs/runbooks/seed-cohort.md

**Files:**
- Create: `docs/runbooks/seed-cohort.md`

- [ ] **Step 1: Create the seed cohort runbook**

```markdown
# Seed Cohort Runbook

White-glove onboarding for the first 5 UAE + 3 US trainers.

**Target:** 5 complete UAE profiles + 3 complete US profiles before open signups.
**Definition of complete:** profile completeness score ≥ 80% (photo + bio + Instagram + at least 1 package + cert uploaded).

---

## UAE Outreach Tracker

| Trainer | Contact | Outreach date | Status | Profile URL | Score |
|---------|---------|---------------|--------|-------------|-------|
| 1 | | | Pending | — | — |
| 2 | | | Pending | — | — |
| 3 | | | Pending | — | — |
| 4 | | | Pending | — | — |
| 5 | | | Pending | — | — |

## US Outreach Tracker

| Trainer | Contact | Outreach date | Status | Profile URL | Score |
|---------|---------|---------------|--------|-------------|-------|
| 1 | | | Pending | — | — |
| 2 | | | Pending | — | — |
| 3 | | | Pending | — | — |

---

## Outreach Script (WhatsApp / DM)

```
Hey [name], I'm building a platform that connects people looking for personal trainers with coaches like you. It's already live at trainedby.ae — I'd love to set up your profile for free as part of our launch. Takes 10 minutes on a call and I'll handle the setup. Interested?
```

---

## Onboarding Call Script (15 minutes)

**Before the call:**
- Create their account: POST to `register-trainer` edge function with their name, email, and market
- Send them the magic link manually (via `send-magic-link` function or the admin dashboard)

**During the call:**
1. Share screen — show them their profile URL already exists
2. Walk through dashboard: "this is your completeness score, here's what you need to fill in"
3. Photo: upload a professional headshot together (or get them to share one in the chat)
4. Bio: write it together — 2-3 sentences about specialty, years of experience, and target client
5. Instagram: paste their handle
6. Package: create 1 package together — name, description, price, sessions per month
7. Cert: upload their certification PDF or image

**After the call:**
- Confirm score is ≥ 80% in the admin dashboard
- Send them a follow-up with their profile URL and a sharing template

---

## "First Lead" Celebration Trigger

When a seed trainer gets their first lead:
1. The `lifecycle-email` function sends them a notification automatically
2. Follow up with a personal WhatsApp: "You just got your first lead — let me know how it goes!"
3. Log the lead in this tracker:

| Trainer | First lead date | Lead outcome |
|---------|-----------------|--------------|
| | | |

---

## Friction Log

Note anything that confused a seed trainer. These are product bugs, not user errors.

| Session | Pain point | Severity | Fix? |
|---------|------------|----------|------|
| | | | |

---

## Gate Condition

Seed cohort complete when:
- [ ] 5 UAE trainers with score ≥ 80%
- [ ] 3 US trainers with score ≥ 80%
- [ ] All 8 hard launch gates ✅ in `launch-verification.md`

→ Open signups → post on LinkedIn
```

- [ ] **Step 2: Commit**

```bash
git add docs/runbooks/seed-cohort.md
git commit -m "docs: add seed cohort runbook with outreach tracker and onboarding script"
```

---

## Task 3: LAUNCH.md

**Files:**
- Create: `LAUNCH.md`

- [ ] **Step 1: Create LAUNCH.md**

```markdown
# TrainedBy — Launch Gate

## Hard Gates

All 8 items must be ✅ before signups open. See [docs/runbooks/launch-verification.md](docs/runbooks/launch-verification.md) for evidence.

| Gate | Status | Verified by | Date |
|------|--------|-------------|------|
| Legal pages render | ⬜ | — | — |
| Cookie consent banner | ⬜ | — | — |
| Consent checkboxes on /join and lead forms | ⬜ | — | — |
| Google Rich Results Test passes | ⬜ | — | — |
| WhatsApp OG card shows trainer branding | ⬜ | — | — |
| Stripe shows correct currency per market | ⬜ | — | — |
| Sentry has ≥ 1 confirmed live event | ⬜ | — | — |
| CI pipeline blocks failing PRs | ⬜ | — | — |

---

## Seed Cohort Progress

See [docs/runbooks/seed-cohort.md](docs/runbooks/seed-cohort.md) for full tracker.

| Market | Target | Complete |
|--------|--------|---------|
| UAE | 5 trainers ≥ 80% | 0 / 5 |
| US | 3 trainers ≥ 80% | 0 / 3 |

---

## Open Signups Checklist

When all hard gates ✅ and seed cohort targets met:

- [ ] Remove waitlist gate from `/join` (set `waitlistEnabled: false` in `market.ts` for ae and com)
- [ ] Enable email capture on homepage hero (set `signupsEnabled: true`)
- [ ] Post on LinkedIn (draft in `docs/runbooks/seed-cohort.md`)
- [ ] Activate Telegram bot monitoring (`@TrainedByCEO_bot` weekly digest)
- [ ] Set Google Analytics conversion goal on `/dashboard` (first login)

---

## Post-Launch Monitoring

**Daily (first 2 weeks):**
- Check Sentry for new errors
- Check `@TrainedByCEO_bot` for new leads and signups
- Review Stripe for payment failures

**Weekly:**
- Check profile completeness scores — reach out to any trainer below 60%
- Review friction log from seed cohort
- Run Lighthouse on trainedby.ae

**Monthly:**
- Update METRICS.md with current counts
- Review ADR log — any decisions that need revisiting?
```

- [ ] **Step 2: Commit**

```bash
git add LAUNCH.md
git commit -m "docs: add LAUNCH.md — hard gates checklist, seed cohort tracker, post-launch monitoring"
```

---

## Task 4: Run All Verification Checks

Work through `docs/runbooks/launch-verification.md` top to bottom. For each gate:

- [ ] **Gate 1: Legal pages** — open each in incognito, screenshot
- [ ] **Gate 2: Cookie consent** — verify banner appears, persists, resets in new incognito session
- [ ] **Gate 3: Consent checkboxes** — verify /join and lead form both have required checkbox
- [ ] **Gate 4: Google Rich Results** — submit a live trainer profile URL, screenshot result
- [ ] **Gate 5: WhatsApp OG card** — send a trainer profile URL to yourself, screenshot preview
- [ ] **Gate 6: Stripe currency** — confirm AED and USD appear for respective markets
- [ ] **Gate 7: Sentry live** — confirm at least 1 event in Sentry dashboard
- [ ] **Gate 8: CI pipeline** — open a test PR, confirm CI runs and blocks on failure

For each gate that fails: file a task (do not fix inline) and note it in `docs/runbooks/launch-verification.md`.

- [ ] **Update LAUNCH.md with results**

Fill in the Status, Verified by, and Date columns for every row that passed.

- [ ] **Commit evidence**

```bash
git add docs/runbooks/launch-verification.md LAUNCH.md
git commit -m "docs: record launch gate verification results"
```

---

## Verification

- [ ] `LAUNCH.md` exists with hard gates table
- [ ] `docs/runbooks/launch-verification.md` exists with all 8 gate templates
- [ ] `docs/runbooks/seed-cohort.md` exists with outreach tracker and onboarding script
- [ ] All gates in LAUNCH.md marked ✅ (or blockers documented with tasks filed)
- [ ] Seed cohort targets met (5 UAE + 3 US trainers at ≥ 80% completeness)
