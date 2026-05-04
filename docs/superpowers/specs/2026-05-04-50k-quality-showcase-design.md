# TrainedBy — $50k Quality Showcase
**Date:** 2026-05-04
**Status:** Approved — pending implementation plan
**Author:** Brainstorming session via Superpowers + GSD

---

## Problem

The platform is functionally complete but has ~12 pre-launch audit items pending and no showcase layer. An investor or YC evaluator opening the repo today would see an impressive product obscured by gaps: no Sentry, no CI, no architecture docs, no structured ADR log, a shallow README. The goal is to close every gap and make the repo itself a compelling artifact.

---

## Goal

1. **B (primary):** Impress investors and YC-style evaluators — the code, docs, and git history tell a coherent story of deliberate, high-quality engineering.
2. **C (secondary):** Enable future hires and contractors to onboard in under 30 minutes — runbooks, architecture docs, contribution guide.

---

## Approach

4-phase GSD model. Each phase has a plan → execute → verify cycle. Showcase artifacts are deliverables within each phase, not afterthoughts. The git history reflects the phases.

---

## Phase 1 — Foundation

**Goal:** Observable and trustworthy infrastructure.

### Technical deliverables
- **Sentry live on all surfaces**
  - `PUBLIC_SENTRY_DSN` set in Netlify (frontend)
  - `SENTRY_DSN` set in Supabase secrets (edge functions)
  - Smoke test: deliberate error triggered → confirmed in Sentry dashboard
  - Evidence: screenshot + env var names documented
- **CI/CD pipeline (GitHub Actions)**
  - `ci.yml`: type-check (`astro check`), lint, unit tests — runs on every PR to `staging`
  - `deploy-preview.yml`: Netlify preview URL posted as PR comment
  - `edge-functions.yml`: deploys changed edge functions on merge to `staging`
  - Merge blocked if CI fails

### Showcase artifacts
- **`ARCHITECTURE.md`** — technical memo covering:
  - Why Astro (SSG performance for SEO-heavy trainer profiles)
  - Why Supabase + Deno edge functions (cost at scale, no cold starts)
  - Why multi-domain over subdomains (local SEO per market)
  - Data flow diagram: trainer signup → lead capture → payment → webhook
- **ADR log** in `docs/decisions/`
  - `001-astro-over-nextjs.md`
  - `002-supabase-edge-functions.md`
  - `003-multi-domain-architecture.md`

---

## Phase 2 — Product Polish

**Goal:** Every pre-launch audit item closed. Product works perfectly end-to-end.

### Technical deliverables
- **OG images + schema.org**
  - Dynamic OG image per trainer profile (name, photo, market branding)
  - `schema.org` `Person` + `LocalBusiness` JSON-LD on all trainer profile pages
  - Verified: Google Rich Results Test passes, WhatsApp share shows branded card
- **Profile completeness widget — real data**
  - Reads actual DB columns: photo, bio, instagram, packages, cert
  - Calculates real percentage (not hardcoded "0%")
  - Shows exactly which field to complete next
- **PWA — Lighthouse green**
  - `manifest.json` wired to `Base.astro`
  - Service worker for dashboard offline shell
  - Lighthouse PWA score ≥ 90 on `/dashboard`
- **`/join` multi-step auto-save**
  - Step progress persisted to `localStorage`
  - Playwright e2e test: close after step 1, reopen, step 2 pre-filled
- **Payment router currency verification**
  - Code audit: `payment-router` sends `currency: 'AED'` for `market=ae`, `'USD'` for `market=com`
  - Fix any gap found
  - Unit test added to `tests/edge-functions.test.ts`

### Showcase artifact
- **`PRODUCT_DECISIONS.md`**
  - Why gamified completeness over passive nudges
  - Why PWA over native app
  - Why dynamic OG over static images

---

## Phase 3 — Showcase Layer

**Goal:** The repo itself is a compelling artifact. Cold reader understands product, architecture, and founder thinking in 5 minutes.

### Deliverables
- **`README.md`** — rewritten as a technical memo
  - One-line product description
  - Architecture overview with Mermaid diagram (frontend → edge functions → Supabase → payment providers)
  - Market scope (10 domains, 4 languages, 2 payment providers)
  - Key metrics: 56 edge functions, N trainer profiles, N markets live
  - "How it works" — 4 steps: trainer signup → profile → lead capture → payment
  - Links to ARCHITECTURE.md, ADR log, CONTRIBUTING.md
  - No marketing copy — dense, honest, technical
- **`CONTRIBUTING.md`** — future hires guide
  - Local setup in under 10 commands
  - GSD workflow on this project
  - Branch → PR → staging → main flow with examples
  - Edge function development guide
  - Codebase map: where to find market config, i18n, edge functions, migrations
- **`METRICS.md`** — live snapshot
  - Markets live, edge functions deployed, trainer profiles, leads captured
  - Infrastructure: Supabase plan, Netlify plan, avg response time
- **`docs/` restructure**
  - `docs/decisions/` — ADR log
  - `docs/specs/` — brainstorming specs per major feature
  - `docs/runbooks/` — add market, deploy edge function, run seed cohort
  - `docs/superpowers/` — GSD specs (existing, keep)

---

## Phase 4 — Launch Gate

**Goal:** Every verification item crossed off. Open signups gate opens.

### Verification run (manual, documented with screenshots)
- Legal pages render correctly in incognito (privacy, terms, cookie-policy)
- Cookie consent banner: appears on first visit, persists correctly
- Consent checkboxes: present and blocking on `/join` and lead forms
- Google Rich Results Test: trainer profile passes with no errors
- WhatsApp share: branded OG card appears
- Stripe dashboard: `payment-router` shows AED for UAE, USD for US
- All results documented in `docs/runbooks/launch-verification.md`

### Operational deliverables
- **`docs/runbooks/seed-cohort.md`** — promoted from `.planning/launch/onboarding-checklist.md`
  - White-glove onboarding script
  - UAE + US outreach tracker templates
  - "First lead" celebration trigger
  - Friction log process
- **`LAUNCH.md`** — hard gates checklist + seed cohort progress tracker + post-launch monitoring cadence

### Gate condition
All hard gates ✅ → open signups → LinkedIn post + Telegram bot monitoring active.

---

## Success Criteria

| Signal | Target |
|--------|--------|
| Sentry catching errors | Live dashboard with at least 1 confirmed event |
| CI pipeline | Blocking PRs on failure |
| Lighthouse PWA score | ≥ 90 on `/dashboard` |
| Google Rich Results | Pass on 1+ live trainer profile |
| Pre-launch audit items | All ✅ |
| README cold-read time | Investor understands product in < 5 min |
| Seed cohort | 5+ UAE + 3+ US trainer profiles complete |
| Open signups gate | All hard gates cleared |

---

## Constraints

- Never push directly to `main` — all work through `feat/*` → `staging` → `main`
- Edge function changes require the `trainedby-edge-functions` skill
- Each phase ends with `/gsd-verify-work` before moving to next phase
- Showcase artifacts are required phase deliverables, not optional cleanup
