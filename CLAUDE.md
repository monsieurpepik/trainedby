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

**Before writing any code, check for a relevant skill:**

```
skills/brainstorming              — Before designing anything new
skills/writing-plans              — Before implementing a feature
skills/test-driven-development    — Before writing implementation code
skills/systematic-debugging       — Before guessing at a bug fix
skills/verification-before-completion — Before claiming anything is done
skills/requesting-code-review     — After completing any task
```

These are not suggestions. They are the process.

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
- **Admin dashboard:** trainedby.ae/superadmin (password: trainedby-admin-2026)
- **Supabase project:** mezhtdbfyvkshpuplqqw
- **Netlify:** Auto-deploys on push to `main`
