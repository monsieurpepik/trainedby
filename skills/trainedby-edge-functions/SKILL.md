---
name: trainedby-edge-functions
description: Use when creating or modifying Supabase Edge Functions for the TrainedBy platform. Covers auth patterns, webhook handling, Telegram alerts, and deployment verification.
---

# TrainedBy Edge Function Patterns

## Overview

TrainedBy runs 34 Deno edge functions on Supabase. This skill covers the patterns, conventions, and failure modes specific to this codebase.

**Before writing a new function:** Read `skills/writing-plans` and create a plan first.
**Before claiming it works:** Read `skills/verification-before-completion`.

## Authentication Classification

Every function falls into one of two categories. Getting this wrong causes silent production failures.

| Category | `verify_jwt` | Who calls it | Security mechanism |
|---|---|---|---|
| **Webhook** | `false` | External service (Telegram, Stripe, Razorpay) | Payload signature / chat ID check |
| **Internal** | `true` (default) | Frontend app or other functions | Supabase JWT |

**Current webhook functions (must always have `verify_jwt = false`):**
- `ceo-agent` — Telegram
- `stripe-webhook` — Stripe
- `razorpay-webhook` — Razorpay
- `academy-booking-webhook` — Stripe

When adding a new webhook function, add it to **both**:
1. `supabase/config.toml` — `[functions.<name>] verify_jwt = false`
2. `NO_JWT_FUNCTIONS` array in `scripts/deploy_functions.sh`

## Standard Function Structure

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { CORS_HEADERS } from '../_shared/errors.ts';
import { createLogger } from '../_shared/logger.ts';

const log = createLogger('function-name');

Deno.serve(async (req: Request) => {
  // 1. Always handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: CORS_HEADERS });
  }

  // 2. For Telegram webhooks — always return 200 immediately
  // (Telegram retries on non-200; process async if needed)

  // 3. Parse and validate
  // 4. Do the work
  // 5. Return structured response
});
```

## Telegram Alert Pattern

All functions that need to alert the founder use the CEO bot's `/notify` endpoint:

```typescript
async function alertFounder(type: string, data: Record<string, unknown>) {
  await fetch(`${SELF_URL}/ceo-agent/notify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
    },
    body: JSON.stringify({ type, data }),
  });
}
```

Supported alert types: `new_trainer`, `pro_upgrade`, `new_lead`, `cert_submitted`, `cert_approved`, `academy_booking`, `anomaly`, `waitlist`.

## Deployment Verification

After deploying any function:

```bash
SUPABASE_ACCESS_TOKEN=<token> ./scripts/deploy_functions.sh --verify-only
```

If this fails, run:

```bash
SUPABASE_ACCESS_TOKEN=<token> ./scripts/deploy_functions.sh --fix-jwt
```

**Never assume a deployment worked.** The JWT misconfiguration incident (April 2026) caused the CEO bot to silently drop all messages for hours. Verification is mandatory.

## Common Failure Modes

| Symptom | Likely cause | Fix |
|---|---|---|
| Telegram bot not responding | `verify_jwt = true` on `ceo-agent` | Run `--fix-jwt` |
| Stripe webhook not firing | `verify_jwt = true` on `stripe-webhook` | Run `--fix-jwt` |
| Function returns 401 | JWT verification enabled, no auth header | Check function category |
| Function returns 500 | Missing env var | Check Supabase secrets |
| Telegram retrying endlessly | Function returning non-200 on error | Always return `200 ok` for Telegram |
| CORS error in browser | Missing OPTIONS handler | Add OPTIONS preflight handler |
