# TrainedBy — AI Agent Instructions

This file governs how AI coding agents (Claude Code, Cursor, Codex, etc.) work on this project. Read it fully before starting any task.

## Project Overview

TrainedBy is a global multi-market personal trainer discovery platform with a SaaS layer for trainers. It operates across 10 domains in 4 languages (EN, FR, IT, ES), sharing one Supabase backend.

**Stack:** Astro (frontend, Netlify), Supabase (PostgreSQL + Deno Edge Functions), Stripe Connect, Resend email, Telegram bot, Claude AI.

**Repo structure:**
- `src/pages/` — Astro pages (consumer + trainer dashboard)
- `src/lib/` — Shared utilities (market.ts, i18n.ts, supabase.ts)
- `supabase/functions/` — 34 Deno edge functions
- `supabase/migrations/` — All DB migrations
- `scripts/` — Deployment and maintenance scripts

## Mandatory Workflows

### Primary Framework: Get Shit Done (GSD)

GSD is the primary execution framework. Use it for any task that takes more than 5 minutes.

```
/gsd-do <description>       — Smart dispatcher: describe what you want, GSD routes it
/gsd-quick <task>           — Small task with quality guarantees (commits, state tracking)
/gsd-fast <task>            — Trivial task (typo, config change) — no overhead
/gsd-debug <issue>          — Systematic debugging with persistent state
/gsd-plan-phase N           — Research + plan a phase (4 parallel researchers)
/gsd-execute-phase N        — Build with wave-based parallel execution
/gsd-verify-work            — UAT + automated verification
/gsd-code-review            — Two-stage review (spec compliance + code quality)
/gsd-progress               — Check status and what's next
/gsd-resume-work            — Resume after context reset
```

All GSD commands live in `commands/gsd/`. See `skills/get-shit-done/SKILL.md` for full reference.

### Supporting Skills (Superpowers)

Use these within a GSD workflow for specific techniques:

```
skills/brainstorming              — Before designing anything new
skills/writing-plans              — Before implementing a feature
skills/test-driven-development    — During execute-phase for TDD enforcement
skills/systematic-debugging       — When /gsd-debug needs deeper root cause analysis
skills/verification-before-completion — Before any /gsd-ship or PR creation
skills/requesting-code-review     — After completing any task
skills/trainedby-edge-functions   — When touching any Supabase edge function
skills/get-shit-done              — Full GSD reference
```

These are not suggestions. They are the process.

## Branching Strategy

This project uses a **Simplified GitFlow** model. **NEVER push directly to `main`.**

| Branch | Purpose | Deploys to |
|---|---|---|
| `main` | Production — protected | trainedby.ae, coachepar.fr, etc. |
| `staging` | Pre-production UAT | Netlify staging environment |
| `feat/*` | New features | Netlify preview URL |
| `fix/*` | Bug fixes | Netlify preview URL |
| `hotfix/*` | Critical production fixes | Merges to `main` then `staging` |

**Standard workflow for all new work:**
1. Branch from `staging`: `git checkout staging && git checkout -b feat/your-feature`
2. Build and test using GSD + Superpowers workflows
3. Open PR against `staging` when done — Netlify will build a preview URL
4. After staging UAT passes, open PR from `staging` → `main` to release to production

**Hotfix workflow (production is broken):**
1. Branch from `main`: `git checkout main && git checkout -b hotfix/description`
2. Fix, test, open PR against `main`
3. After merge, immediately cherry-pick to `staging` to keep them in sync

## Core Rules

### 1. Never deploy without verification
Always run `scripts/deploy_functions.sh --verify-only` after deploying any edge function. Webhook functions (`ceo-agent`, `stripe-webhook`, `razorpay-webhook`, `academy-booking-webhook`) must have `verify_jwt = false`. See `deployment_auth_plan.md`.

### 2. No fabricated numbers
Never add fake metrics, fake trainer counts, fake income figures, or fake scarcity to any page. All numbers must come from the database.

### 3. One backend, all markets
All 10 domains share the same Supabase project (`mezhtdbfyvkshpuplqqw`). Never create market-specific backends or duplicate tables.

### 4. Secrets stay in Supabase
Never hardcode API keys, tokens, or secrets in source files. All secrets are stored in Supabase Edge Function secrets and accessed via `Deno.env.get()`.

### 5. Migrations over direct DB edits
All schema changes must go through `supabase/migrations/`. Never alter the production database directly without a migration file.

### 6. Market config is the source of truth
`src/lib/market.ts` defines all market settings (locale, currency, certBody, paymentEnabled, waitlistEnabled). Never hardcode market-specific logic outside this file.

## Debugging Protocol

When something is broken, use `skills/systematic-debugging` — not guessing. The four phases are:

1. **Reproduce** — confirm the exact failure with evidence
2. **Isolate** — narrow to the smallest failing case
3. **Root cause** — find the actual cause, not a symptom
4. **Fix and verify** — fix the cause, verify with evidence

The JWT authentication failure on `ceo-agent` (April 2026) is a canonical example of what happens when you skip this process.

## Edge Function Conventions

- All functions must handle `OPTIONS` (CORS preflight)
- All functions must return `200 ok` for Telegram webhook POSTs (even on error — Telegram will retry otherwise)
- Webhook functions validate the caller inside the function body (chat ID check, Stripe signature, Razorpay signature)
- Use `../\_shared/logger.ts` for all logging
- Use `../\_shared/claude.ts` for all Claude API calls
- Use `../\_shared/errors.ts` for CORS headers

## Deployment

Always use the safe deployment script:
```bash
SUPABASE_ACCESS_TOKEN=<token> ./scripts/deploy_functions.sh <function-name>
```

Never run `supabase functions deploy` directly without the wrapper.

## Key Contacts

- **CEO Bot:** @TrainedByCEO_bot (Telegram) — Founder's executive AI
- **Admin dashboard:** trainedby.ae/superadmin (password stored in 1Password — ask founder)
- **Supabase project:** mezhtdbfyvkshpuplqqw
- **Netlify:** Auto-deploys `main` to production. `staging` branch deploys to staging environment.
