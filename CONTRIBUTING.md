# Contributing to TrainedBy

Everything a new engineer needs to go from zero to shipping.

---

## Local Setup

You need: Node 22, pnpm 9, Supabase CLI, Deno.

```bash
# 1. Clone
git clone https://github.com/your-org/trainedby.git
cd trainedby

# 2. Install frontend deps
pnpm install

# 3. Copy env template and fill in values
cp .env.example .env.local
# Required: PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY

# 4. Start Supabase locally
supabase start
# This starts PostgreSQL, Auth, Edge Functions runtime on localhost

# 5. Run migrations
supabase db push

# 6. Start the frontend
pnpm dev
# Astro starts at http://localhost:4321
```

Verify: open `http://localhost:4321` — you should see the TrainedBy homepage for the `ae` market (default when running on localhost).

---

## Project Structure

| Path | What lives here |
|------|-----------------|
| `src/pages/` | Astro pages — one file per route. `[slug].astro` = trainer profile. `dashboard.astro` = trainer dashboard. `og/[slug].png.ts` = OG image API route. |
| `src/lib/market.ts` | **Source of truth for all market config.** Locale, currency, cert body, payment provider, domain. If it's market-specific, it goes here. |
| `src/lib/i18n.ts` | Translation strings. Keys are in English; values are per-locale translations. |
| `src/lib/supabase.ts` | Supabase client factory. Use `createServerClient()` in Astro pages, `createBrowserClient()` in React components. |
| `src/layouts/Base.astro` | Shared HTML shell — head, OG tags, service worker registration, analytics. All pages use this. |
| `src/components/` | Astro components (SSR) and React islands (interactive). |
| `supabase/functions/` | 55 Deno edge functions. Each is a self-contained directory with `index.ts`. |
| `supabase/functions/_shared/` | Shared utilities used across edge functions. |
| `supabase/migrations/` | All schema changes as timestamped SQL files. |
| `scripts/deploy_functions.sh` | **Always use this to deploy edge functions** — never `supabase functions deploy` directly. |

---

## Branching

This project uses simplified GitFlow.

```
main        — production (trainedby.ae etc.)
staging     — pre-production UAT
feat/*      — new features → PR against staging
fix/*       — bug fixes → PR against staging
hotfix/*    — critical production fixes → PR against main, then cherry-pick to staging
```

**Standard workflow:**

```bash
# 1. Branch from staging
git checkout staging && git pull
git checkout -b feat/your-feature

# 2. Build, test, commit
# 3. Open PR against staging
gh pr create --base staging

# 4. After staging UAT → PR from staging → main
```

Never push directly to `main`.

---

## Making a Change

### Frontend (Astro page or component)

```bash
# Type-check
pnpm exec astro check

# Unit tests
pnpm test

# Dev server
pnpm dev
```

### Database schema change

Always through migrations — never edit the DB directly.

```bash
# Create a new migration
supabase migration new your_migration_name

# Edit the generated file in supabase/migrations/
# Then apply locally
supabase db push

# Verify your migration works, then commit the file
git add supabase/migrations/
git commit -m "db: your migration description"
```

### Edge function

Each edge function lives in `supabase/functions/<function-name>/index.ts`.

**Development:**

```bash
# Serve a single function locally
supabase functions serve <function-name> --env-file .env.local

# Run tests (Deno)
cd supabase/functions/<function-name>
deno test --allow-net --allow-env
```

**Shared utilities** (`_shared/`):
- `logger.ts` — structured logging. Use this, not `console.log`.
- `sentry.ts` — error capture. Import and call `captureException()` in catch blocks.
- `errors.ts` — CORS headers. Every function needs CORS on OPTIONS.
- `claude.ts` — Claude API client. Use for all AI calls.
- `rate_limit.ts` — IP rate limiter. Wire this on all public-facing functions.

**Deployment:**

```bash
# Always use the wrapper script
SUPABASE_ACCESS_TOKEN=<token> ./scripts/deploy_functions.sh <function-name>

# Verify JWT config after deploy
SUPABASE_ACCESS_TOKEN=<token> ./scripts/deploy_functions.sh --verify-only

# Webhook functions (ceo-agent, stripe-webhook, razorpay-webhook, academy-booking-webhook)
# must have verify_jwt = false — the deploy script enforces this.
```

---

## Market Config

`src/lib/market.ts` is the source of truth for every market-specific setting:

```typescript
// Adding a new market: add one entry to the MARKETS object
{
  key: 'au',
  domain: 'trainedby.com.au',
  locale: 'en-AU',
  currency: 'AUD',
  currencySymbol: 'A$',
  certBody: 'Fitness Australia',
  paymentEnabled: true,
  stripe: true,
}
```

Never hardcode market-specific logic outside this file.

---

## Testing

```bash
# Unit tests (Vitest)
pnpm test

# Unit tests with coverage
pnpm test:ci

# Type-check (Astro)
pnpm exec astro check

# E2E tests (Playwright — requires dev server running)
pnpm exec playwright test
```

CI runs `astro check` and `pnpm test:ci` on every PR to `staging`.

---

## Secrets

All secrets live in Supabase Edge Function secrets — never in source files.

```bash
# Set a secret (production)
supabase secrets set SECRET_NAME=value --project-ref mezhtdbfyvkshpuplqqw

# List secrets
supabase secrets list --project-ref mezhtdbfyvkshpuplqqw
```

Local dev: use `.env.local` (gitignored). Never commit `.env` files.

---

## Runbooks

- [docs/runbooks/github-secrets.md](docs/runbooks/github-secrets.md) — CI/CD secrets setup
- [docs/runbooks/sentry-setup.md](docs/runbooks/sentry-setup.md) — Sentry DSN and smoke test
- [docs/runbooks/stripe-prices.md](docs/runbooks/stripe-prices.md) — Adding a new Stripe price ID
- [docs/runbooks/seed-cohort.md](docs/runbooks/seed-cohort.md) — White-glove trainer onboarding
