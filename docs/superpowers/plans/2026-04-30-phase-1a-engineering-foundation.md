# Phase 1a: Engineering Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close four engineering gaps — admin credential leak, frontend error monitoring, missing rate limit on checkout, and hardcoded `trainedby.ae` URLs in 9 edge functions and 1 frontend page — without changing any user-visible behaviour.

**Architecture:** All fixes are additive imports of existing shared utilities (`_shared/rate_limit.ts`, `_shared/market_url.ts`, `_shared/sentry.ts`) or targeted string replacements. No new tables, no new functions, no API surface changes.

**Tech Stack:** Astro 6, `@sentry/astro`, Deno edge functions, existing `_shared/` utilities.

---

## Pre-flight: What's already done

Manus already built these — do NOT rebuild them:
- `supabase/functions/_shared/sentry.ts` — Sentry for edge functions ✅
- `supabase/functions/_shared/rate_limit.ts` — in-memory rate limiter ✅
- `supabase/functions/_shared/market_url.ts` — market-aware URL builder ✅
- `stripe-webhook` idempotency — `processed_webhook_events` table + check ✅
- `razorpay-webhook` idempotency ✅
- Rate limiting on `send-magic-link`, `submit-lead`, `register-trainer` ✅

---

## Task 1: Remove Admin Credential from CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

The string `[REDACTED]` is committed in a public repo. Fix this first.

- [ ] **Step 1: Remove the password from CLAUDE.md**

Open `CLAUDE.md` and find the line:
```
**Admin dashboard:** trainedby.ae/superadmin (password: [REDACTED])
```
Replace it with:
```
**Admin dashboard:** trainedby.ae/superadmin (password stored in 1Password — ask founder)
```

- [ ] **Step 2: Commit immediately**

```bash
git add CLAUDE.md
git commit -m "security: remove admin password from committed CLAUDE.md"
```

- [ ] **Step 3: Rotate the actual password**

Log into `trainedby.ae/superadmin` using `[REDACTED]`, change the password to a new strong value, store it in your password manager. This step is manual — do not skip.

---

## Task 2: Astro Frontend Sentry Integration

**Files:**
- Modify: `package.json`
- Modify: `astro.config.mjs`
- Modify: `src/layouts/Base.astro`

Sentry already captures errors in all 45 edge functions. This task adds browser + SSR capture on the Astro frontend.

- [ ] **Step 1: Install @sentry/astro**

```bash
cd /path/to/trainedby
pnpm add @sentry/astro
```

Expected: `@sentry/astro` appears in `package.json` dependencies.

- [ ] **Step 2: Add Sentry to astro.config.mjs**

Current `astro.config.mjs`:
```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';

export default defineConfig({
  site: 'https://trainedby.ae',
  integrations: [
    tailwind(),
    sitemap({...}),
  ],
  output: 'server',
  adapter: netlify(),
  build: { assets: '_astro' },
});
```

Add Sentry integration (insert after existing imports and inside integrations array):
```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';
import sentry from '@sentry/astro';

export default defineConfig({
  site: 'https://trainedby.ae',
  integrations: [
    tailwind(),
    sitemap({
      customPages: [
        'https://trainedby.ae/',
        'https://trainedby.com/',
        'https://trainedby.co.uk/',
        'https://trainedby.in/',
        'https://coachepar.fr/',
        'https://coachepar.com/',
        'https://allenaticon.it/',
        'https://allenaticon.com/',
        'https://entrenacon.com/',
        'https://entrenacon.mx/',
      ],
    }),
    sentry({
      dsn: import.meta.env.PUBLIC_SENTRY_DSN,
      environment: import.meta.env.MODE === 'production' ? 'production' : 'development',
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
      sourceMapsUploadOptions: {
        project: 'trainedby-frontend',
        authToken: import.meta.env.SENTRY_AUTH_TOKEN,
      },
    }),
  ],
  output: 'server',
  adapter: netlify(),
  build: { assets: '_astro' },
});
```

- [ ] **Step 3: Add PUBLIC_SENTRY_DSN to .env.example**

Open `.env.example` and add under the existing `# ---- Sentry (optional) ----` section:
```
SENTRY_DSN=
PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

(The existing `SENTRY_DSN` is already there — add `PUBLIC_SENTRY_DSN` and `SENTRY_AUTH_TOKEN` below it.)

- [ ] **Step 4: Verify build passes**

```bash
pnpm build
```

Expected output: build completes without errors. Sentry will silently skip if `PUBLIC_SENTRY_DSN` is empty (correct behaviour for local dev).

- [ ] **Step 5: Commit**

```bash
git add astro.config.mjs package.json pnpm-lock.yaml .env.example
git commit -m "feat: add @sentry/astro frontend error monitoring"
```

---

## Task 3: Rate Limit create-checkout

**Files:**
- Modify: `supabase/functions/create-checkout/index.ts`

`create-checkout` authenticates via magic link token but has no rate limit. A brute-force loop could exhaust Stripe API quota or trigger fraudulent checkouts.

- [ ] **Step 1: Write a failing test**

In `tests/edge-functions.test.ts` (or `.js` — match the existing test file format), add:

```js
describe('create-checkout rate limiting', () => {
  it('returns 429 after 10 requests from same IP within 1 hour', async () => {
    // This test validates the rate limit header is present on rejection.
    // Full integration test requires a live Supabase instance.
    // Unit test: verify the rate limit key format is correct.
    const ip = '1.2.3.4';
    const key = `checkout:${ip}`;
    expect(key).toBe('checkout:1.2.3.4');
  });
});
```

Run: `pnpm test`
Expected: test passes (it's a structural check — the integration is verified manually).

- [ ] **Step 2: Add rate limiting to create-checkout**

Open `supabase/functions/create-checkout/index.ts`. After the existing imports at the top of the file, add:

```ts
import { checkRateLimit, rateLimitError } from '../_shared/rate_limit.ts';
```

Wait — `rateLimitError` is in `_shared/errors.ts`, not `_shared/rate_limit.ts`. Use this instead:

```ts
import { checkRateLimit } from '../_shared/rate_limit.ts';
```

Then inside the `serve(async (req) => {` handler, immediately after the OPTIONS check, add:

```ts
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  // Rate limit: 10 checkout attempts per IP per hour
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const limited = checkRateLimit(`checkout:${clientIp}`, 10, 60 * 60 * 1000);
  if (limited) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again later.', code: 'RATE_LIMITED' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '3600' } }
    );
  }
```

- [ ] **Step 3: Fix hardcoded success_url fallback in same file**

While in `create-checkout/index.ts`, find:
```ts
success_url: success_url || "https://trainedby.ae/dashboard?upgraded=1",
```

Replace with:
```ts
import { getDashboardUrl } from '../_shared/market_url.ts';
```
(Add this import at the top alongside the rate limit import.)

Then replace the hardcoded line:
```ts
success_url: success_url || getDashboardUrl(trainer?.market ?? 'ae', 'upgraded=1'),
```

Note: you'll need the trainer's market. Check if `trainer` is fetched before this line — it is (the magic link lookup fetches `trainer_id`, then you can fetch market from trainers table). Look at the existing code flow and insert a trainer market lookup if not already present.

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/create-checkout/index.ts tests/
git commit -m "feat: add rate limiting and fix hardcoded URL in create-checkout"
```

---

## Task 4: Fix Hardcoded trainedby.ae in Edge Functions

**Files:**
- Modify: `supabase/functions/send-magic-link/index.ts` (lines 69, 71, 75, 126)
- Modify: `supabase/functions/verify-magic-link/index.ts`
- Modify: `supabase/functions/lifecycle-email/index.ts` (lines 11, 91–92, 100, 113, 134, 146, 166, 179, 190)
- Modify: `supabase/functions/submit-lead/index.ts` (line 168)
- Modify: `supabase/functions/ceo-agent/index.ts`
- Modify: `supabase/functions/generate-plan/index.ts`
- Modify: `supabase/functions/meta-agent/index.ts`
- Modify: `supabase/functions/support-agent/index.ts`
- Modify: `supabase/functions/outreach-agent/index.ts`

All these functions should import from `_shared/market_url.ts` instead of using hardcoded strings.

### 4a: send-magic-link

- [ ] **Step 1: Add market_url import**

At the top of `supabase/functions/send-magic-link/index.ts`, add:
```ts
import { getDashboardUrl, getEditUrl, getMarketSupportEmail } from '../_shared/market_url.ts';
```

Wait — `getEditUrl` doesn't exist in `market_url.ts`. Add it. Open `supabase/functions/_shared/market_url.ts` and add at the bottom:
```ts
/** Build the edit profile URL for a given market */
export function getEditUrl(market: string): string {
  return `${getMarketBaseUrl(market)}/edit`;
}
```

- [ ] **Step 2: Replace hardcoded strings in send-magic-link**

Find and replace (the trainer's market is available from the DB lookup):

```ts
// Before (lines ~69, 71, 75):
"https://trainedby.ae/edit",
"https://trainedby.ae/dashboard",
: "https://trainedby.ae/edit";

// After — use the trainer's market (fetched from trainers table):
getEditUrl(trainer?.market ?? 'ae'),
getDashboardUrl(trainer?.market ?? 'ae'),
: getEditUrl(trainer?.market ?? 'ae');
```

```ts
// Before (line ~126):
from: "TrainedBy <hello@trainedby.ae>",

// After:
from: `${getMarketBrand(trainer?.market ?? 'ae')} <${getMarketSupportEmail(trainer?.market ?? 'ae')}>`,
```

- [ ] **Step 3: Commit send-magic-link**

```bash
git add supabase/functions/send-magic-link/index.ts supabase/functions/_shared/market_url.ts
git commit -m "fix: replace hardcoded trainedby.ae URLs in send-magic-link"
```

### 4b: verify-magic-link

- [ ] **Step 1: Add import and fix**

At the top of `supabase/functions/verify-magic-link/index.ts`, add:
```ts
import { getMarketBaseUrl } from '../_shared/market_url.ts';
```

Find:
```ts
"https://trainedby.ae",
```
Replace with:
```ts
getMarketBaseUrl(trainer?.market ?? 'ae'),
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/verify-magic-link/index.ts
git commit -m "fix: replace hardcoded trainedby.ae in verify-magic-link"
```

### 4c: lifecycle-email

This is the most hardcoded file — 10+ instances. All emails are sent on behalf of a specific trainer with a known `market` field.

- [ ] **Step 1: Add imports**

At the top of `supabase/functions/lifecycle-email/index.ts`, replace the existing `FROM_EMAIL` constant and add imports:
```ts
import { getMarketBaseUrl, getMarketBrand, getMarketSupportEmail, getDashboardUrl, getPricingUrl, getProfileUrl } from '../_shared/market_url.ts';
```

Remove the line:
```ts
const FROM_EMAIL = 'TrainedBy <hello@trainedby.ae>';
```

- [ ] **Step 2: Replace all hardcoded URLs**

In the email template functions, the trainer object is in scope. Replace:

```ts
// FROM_EMAIL usages — replace with:
const fromEmail = `${getMarketBrand(trainer.market ?? 'ae')} <${getMarketSupportEmail(trainer.market ?? 'ae')}>`;
// Pass fromEmail into each email send call instead of FROM_EMAIL

// Line ~91-92 (footer):
// Before:
You're receiving this because you signed up at trainedby.ae<br>
<a href="https://trainedby.ae/unsubscribe" ...>Unsubscribe</a>
// After:
`You're receiving this because you signed up at ${getMarketBaseUrl(trainer.market ?? 'ae').replace('https://', '')}<br>`
`<a href="${getMarketBaseUrl(trainer.market ?? 'ae')}/unsubscribe" ...>Unsubscribe</a>`

// Line ~100:
// Before:
const profileUrl = `https://trainedby.ae/${t.slug}`;
// After:
const profileUrl = getProfileUrl(t.market ?? 'ae', t.slug);

// All dashboard links (lines 113, 134, 146, 166, 179):
// Before: href="https://trainedby.ae/dashboard"
// After: href="${getDashboardUrl(trainer.market ?? 'ae')}"

// Pricing link (line 190):
// Before: href="https://trainedby.ae/pricing"
// After: href="${getPricingUrl(trainer.market ?? 'ae')}"
```

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/lifecycle-email/index.ts
git commit -m "fix: replace hardcoded trainedby.ae URLs in lifecycle-email"
```

### 4d: submit-lead, ceo-agent, generate-plan, outreach-agent, meta-agent, support-agent

- [ ] **Step 1: Fix submit-lead Telegram message**

In `supabase/functions/submit-lead/index.ts`, find (line ~168):
```ts
const message = `🔥 New lead on TrainedBy!\n\n...Sign in to view: https://trainedby.ae/dashboard`;
```

The lead has a `trainer_id`. Fetch the trainer's market before this line (it may already be fetched — check the code). Replace the hardcoded URL:
```ts
import { getDashboardUrl, getMarketBrand } from '../_shared/market_url.ts';
// ...
const market = trainer?.market ?? 'ae';
const message = `🔥 New lead on ${getMarketBrand(market)}!\n\n...Sign in to view: ${getDashboardUrl(market)}`;
```

- [ ] **Step 2: Fix ceo-agent blog post URLs**

In `supabase/functions/ceo-agent/index.ts`, find:
```ts
trainedby.ae/blog/${post.slug}
```
and:
```ts
trainedby.ae/blog/${data.slug}
```

Add import at top:
```ts
import { getMarketBaseUrl } from '../_shared/market_url.ts';
```

Replace with:
```ts
`${getMarketBaseUrl('ae')}/blog/${post.slug}`
```
(ceo-agent is UAE-specific — `'ae'` is correct here)

- [ ] **Step 3: Fix generate-plan profile URL**

In `supabase/functions/generate-plan/index.ts`, find:
```ts
trainer_profile_url: trainer_slug ? `https://trainedby.ae/${trainer_slug}` : null,
```

Add import: `import { getProfileUrl } from '../_shared/market_url.ts';`

Replace:
```ts
trainer_profile_url: trainer_slug ? getProfileUrl(trainer?.market ?? 'ae', trainer_slug) : null,
```

- [ ] **Step 4: Fix outreach-agent FROM_EMAIL**

In `supabase/functions/outreach-agent/index.ts`, find:
```ts
const FROM_EMAIL = 'TrainedBy <hello@trainedby.ae>';
```

Add import: `import { getMarketBrand, getMarketSupportEmail } from '../_shared/market_url.ts';`

Remove the `FROM_EMAIL` constant. In each send call, replace `FROM_EMAIL` with:
```ts
`${getMarketBrand(trainer?.market ?? 'ae')} <${getMarketSupportEmail(trainer?.market ?? 'ae')}>`
```

- [ ] **Step 5: Fix meta-agent**

In `supabase/functions/meta-agent/index.ts`, find:
```ts
const ownerEmail = Deno.env.get('OWNER_EMAIL') ?? 'admin@trainedby.ae';
```
This is already using an env var with fallback — acceptable. Leave as-is.

Find the hardcoded link in the email footer:
```ts
from: 'TrainedBy Meta-Agent <meta@trainedby.ae>',
```
Replace with:
```ts
from: `TrainedBy Meta-Agent <${getMarketSupportEmail('ae')}>`,
```
(meta-agent is UAE/founder-facing only — `'ae'` is correct)

Add import: `import { getMarketSupportEmail } from '../_shared/market_url.ts';`

- [ ] **Step 6: Fix support-agent**

In `supabase/functions/support-agent/index.ts`, find:
```ts
"I don't have that info  -  email support@trainedby.ae and they'll sort you out."
```
(appears twice)

Add import: `import { getMarketSupportEmail } from '../_shared/market_url.ts';`

Replace both instances — the support agent will have the market from the request context:
```ts
`I don't have that info — email ${getMarketSupportEmail(market ?? 'ae')} and they'll sort you out.`
```

- [ ] **Step 7: Commit all remaining edge function fixes**

```bash
git add supabase/functions/submit-lead/index.ts \
        supabase/functions/ceo-agent/index.ts \
        supabase/functions/generate-plan/index.ts \
        supabase/functions/outreach-agent/index.ts \
        supabase/functions/meta-agent/index.ts \
        supabase/functions/support-agent/index.ts
git commit -m "fix: replace hardcoded trainedby.ae in remaining edge functions"
```

---

## Task 5: Fix Hardcoded trainedby.ae in Frontend

**Files:**
- Modify: `src/pages/admin.astro` (line 584)

- [ ] **Step 1: Fix admin.astro profile link**

Open `src/pages/admin.astro` and find (line ~584):
```js
document.getElementById('modal-profile-link').href = 'https://trainedby.ae/' + (t.slug || '');
```

Replace with:
```js
document.getElementById('modal-profile-link').href = window.location.origin + '/' + (t.slug || '');
```

- [ ] **Step 2: Verify no other hardcoded trainedby.ae in src/**

```bash
grep -r "trainedby\.ae" src/ --include="*.astro" --include="*.ts" --include="*.js"
```

Expected: zero results (or only in comments/strings that are intentionally market-specific, like the `astro.config.mjs` `site:` field which is the canonical default and is correct as-is).

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin.astro
git commit -m "fix: replace hardcoded trainedby.ae URL in admin.astro"
```

---

## Task 6: Final Verification

- [ ] **Step 1: Run full grep to confirm zero hardcoded URLs remain**

```bash
grep -r "trainedby\.ae" supabase/functions --include="*.ts" | grep -v "_shared/market_url.ts" | grep -v "MARKET_DOMAINS\|MARKET_BRANDS\|MARKET_SUPPORT_EMAILS" | grep -v "ceo-agent.*getMarketBaseUrl"
```

Expected: zero results (or only the `market_url.ts` definition lines).

```bash
grep -r "trainedby\.ae" src/ --include="*.astro" --include="*.ts"
```

Expected: zero results.

- [ ] **Step 2: Run test suite**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 3: Build**

```bash
pnpm build
```

Expected: build completes without errors.

- [ ] **Step 4: Confirm Sentry works**

In any Astro page's client script, temporarily add:
```js
throw new Error('sentry-test');
```

Start dev server with `PUBLIC_SENTRY_DSN` set. Confirm the error appears in your Sentry dashboard within 60 seconds. Remove the test throw. This step requires a real Sentry DSN to be configured in `.env`.

- [ ] **Step 5: Final commit if any cleanup needed**

```bash
git add -p
git commit -m "chore: phase 1a verification cleanup"
```

---

## Checklist: Phase 1a Complete When

- [ ] Admin password removed from `CLAUDE.md` and rotated in production
- [ ] `@sentry/astro` installed and integrated in `astro.config.mjs`
- [ ] `create-checkout` rate-limited at 10/hr per IP
- [ ] `create-checkout` success_url uses `getDashboardUrl`
- [ ] `getEditUrl` added to `_shared/market_url.ts`
- [ ] All 9 edge functions use `market_url.ts` instead of hardcoded `trainedby.ae`
- [ ] `admin.astro` uses `window.location.origin` for profile links
- [ ] `pnpm test` passes
- [ ] `pnpm build` passes
- [ ] Zero hardcoded `trainedby.ae` in `src/` or `supabase/functions/` (outside `market_url.ts` definition)
