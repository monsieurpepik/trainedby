# Booking Tokens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the broken HMAC-based cancel/my-bookings token pipeline with database-stored random tokens that expire, support one-time use for cancel, and carry no PII in URLs.

**Architecture:** A new `booking_tokens` table stores all tokens. `booking-webhook` generates tokens on booking confirmation and inserts them. `cancel-booking` and `my-bookings.astro` verify by looking up the token row — no secret required on the verification side.

**Tech Stack:** Supabase (PostgreSQL migration, Deno edge functions), Astro SSR page, Supabase JS client v2

---

## Files Changed

| File | Action |
|------|--------|
| `supabase/migrations/20260501_booking_tokens.sql` | CREATE — new table + indexes |
| `supabase/functions/booking-webhook/index.ts` | MODIFY — replace `generateHmac` + HMAC token URLs with random token insert |
| `supabase/functions/cancel-booking/index.ts` | MODIFY — replace HMAC verification with DB lookup; mark token used on success |
| `src/pages/book/cancel.astro` | MODIFY — drop `?id=` param, send only `token` in POST body |
| `src/pages/my-bookings.astro` | MODIFY — drop `?email=`/`?pi=`, replace HMAC verify with DB lookup |

---

## Task 1: Create booking_tokens migration

**Files:**
- Create: `supabase/migrations/20260501_booking_tokens.sql`

- [ ] **Step 1: Write the migration file**

```sql
-- supabase/migrations/20260501_booking_tokens.sql

create table booking_tokens (
  id            uuid        primary key default gen_random_uuid(),
  token         text        not null unique,
  token_type    text        not null check (token_type in ('cancel', 'my_bookings')),
  booking_id    uuid        references bookings(id) on delete cascade,
  consumer_email            text,
  stripe_payment_intent_id  text,
  expires_at    timestamptz not null,
  used_at       timestamptz,
  created_at    timestamptz not null default now()
);

create index booking_tokens_token_idx      on booking_tokens(token);
create index booking_tokens_booking_id_idx on booking_tokens(booking_id);
```

- [ ] **Step 2: Apply the migration via Supabase MCP**

Use the `mcp__96e53d03-76ac-47dd-b5f1-2ef8aa653478__apply_migration` tool with:
- `name`: `20260501_booking_tokens`
- `query`: the SQL above

If MCP is unavailable, apply via Supabase dashboard SQL editor.

- [ ] **Step 3: Verify the table exists**

Use `mcp__96e53d03-76ac-47dd-b5f1-2ef8aa653478__execute_sql` to run:
```sql
select column_name, data_type, is_nullable
from information_schema.columns
where table_name = 'booking_tokens'
order by ordinal_position;
```

Expected: 9 rows (id, token, token_type, booking_id, consumer_email, stripe_payment_intent_id, expires_at, used_at, created_at).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260501_booking_tokens.sql
git commit -m "feat: add booking_tokens table for random expiring tokens"
```

---

## Task 2: Update booking-webhook — replace HMAC with random token insert

**Files:**
- Modify: `supabase/functions/booking-webhook/index.ts`

**Context:** Current file (180 lines) uses `generateHmac()` at line 154, called at lines 83–84 to produce cancel and my-bookings tokens. Cancel URL at line 86 uses `?booking_id=` (wrong param name vs cancel.astro which reads `?id=`). My-bookings URL at line 87 uses `?email=` but no `?pi=` (so my-bookings HMAC verifier could never match). All of this is replaced.

- [ ] **Step 1: Remove the `generateHmac` function and add `generateToken`**

Replace the entire `generateHmac` function (lines 154–164):
```typescript
// REMOVE THIS:
async function generateHmac(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, "0")).join("");
}
```

Add this instead (place before the `sendEmail` function):
```typescript
function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}
```

- [ ] **Step 2: Replace the HMAC token block with random token insert**

Remove these lines (79–87):
```typescript
  // Generate HMAC tokens for cancel link and my-bookings link
  const hmacSecret = Deno.env.get("BOOKING_HMAC_SECRET") || "trainedby_booking_secret";
  const appUrl = Deno.env.get("APP_URL") || "https://trainedby.com";

  const cancelToken = await generateHmac(booking.id, hmacSecret);
  const myBookingsToken = await generateHmac(`${booking.consumer_email}:${booking.id}`, hmacSecret);

  const cancelUrl = `${appUrl}/book/cancel?booking_id=${booking.id}&token=${cancelToken}`;
  const myBookingsUrl = `${appUrl}/my-bookings?email=${encodeURIComponent(booking.consumer_email)}&token=${myBookingsToken}`;
```

Replace with:
```typescript
  // Generate and store random tokens in booking_tokens table
  const appUrl = Deno.env.get("APP_URL") || "https://trainedby.com";

  const cancelToken = generateToken();
  const myBookingsToken = generateToken();
  const now = new Date();

  const { error: tokenError } = await sb.from("booking_tokens").insert([
    {
      token: cancelToken,
      token_type: "cancel",
      booking_id: booking.id,
      expires_at: new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString(),
    },
    {
      token: myBookingsToken,
      token_type: "my_bookings",
      booking_id: booking.id,
      consumer_email: booking.consumer_email,
      stripe_payment_intent_id: pi.id,
      expires_at: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  if (tokenError) {
    console.error("Failed to insert booking tokens:", tokenError);
    // Non-fatal — booking confirmed; email links will be broken but booking stands
  }

  const cancelUrl = `${appUrl}/book/cancel?token=${cancelToken}`;
  const myBookingsUrl = `${appUrl}/my-bookings?token=${myBookingsToken}`;
```

- [ ] **Step 3: Verify the final file has no HMAC references**

```bash
grep -n "hmac\|HMAC\|generateHmac\|BOOKING_HMAC_SECRET" supabase/functions/booking-webhook/index.ts
```

Expected: no output.

- [ ] **Step 4: Verify URLs use only `?token=`**

```bash
grep -n "cancelUrl\|myBookingsUrl" supabase/functions/booking-webhook/index.ts
```

Expected output:
```
  const cancelUrl = `${appUrl}/book/cancel?token=${cancelToken}`;
  const myBookingsUrl = `${appUrl}/my-bookings?token=${myBookingsToken}`;
```

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/booking-webhook/index.ts
git commit -m "feat: booking-webhook — replace HMAC tokens with DB-stored random tokens"
```

---

## Task 3: Update cancel-booking — replace HMAC verify with DB lookup

**Files:**
- Modify: `supabase/functions/cancel-booking/index.ts`

**Context:** Current file (147 lines) has `computeHmac` (lines 10–15) and `timingSafeEqual` (lines 17–27) functions, reads `bookingId` from request body, and verifies against `BOOKING_SECRET`. All of this is replaced with a single `booking_tokens` table lookup.

- [ ] **Step 1: Write the new cancel-booking/index.ts**

Full replacement — the entire file:

```typescript
// supabase/functions/cancel-booking/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { CORS_HEADERS, jsonResponse, errorResponse, validationError, notFoundError, serverError } from '../_shared/errors.ts';
import { createLogger } from '../_shared/logger.ts';

const log = createLogger('cancel-booking');
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';

async function sendEmail(to: string, subject: string, html: string, from = 'TrainedBy <noreply@trainedby.com>'): Promise<void> {
  if (!RESEND_API_KEY) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, html }),
  });
}

function emailBase(content: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  body{margin:0;padding:0;background:#0a0a0a;font-family:'Inter',-apple-system,sans-serif}
  .wrap{max-width:560px;margin:0 auto;padding:40px 20px}
  .logo{font-family:'Manrope',sans-serif;font-size:20px;font-weight:800;color:#fff;margin-bottom:32px}
  .logo span{color:#FF5C00}
  .card{background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:28px}
  h1{font-family:'Manrope',sans-serif;font-size:22px;font-weight:800;color:#fff;margin:0 0 12px}
  p{font-size:14px;color:rgba(255,255,255,0.7);line-height:1.7;margin:0 0 16px}
  .footer{font-size:11px;color:rgba(255,255,255,0.25);margin-top:24px;line-height:1.6}
</style></head><body>
<div class="wrap">
  <div class="logo">Trained<span>By</span></div>
  <div class="card">${content}</div>
  <div class="footer">TrainedBy · trainedby.com</div>
</div></body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });

  try {
    const { token } = await req.json();
    if (!token) return validationError('token', 'token is required');

    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // Look up token in booking_tokens table
    const { data: tokenRow, error: tokenErr } = await sb
      .from('booking_tokens')
      .select('id, booking_id, used_at, expires_at')
      .eq('token', token)
      .eq('token_type', 'cancel')
      .single();

    if (tokenErr || !tokenRow) {
      log.warn('Invalid cancel token');
      return errorResponse('Invalid or expired cancellation link', 403);
    }

    // Idempotent: already used
    if (tokenRow.used_at) {
      return jsonResponse({ cancelled: true, refunded: false, alreadyCancelled: true });
    }

    // Expired
    if (new Date(tokenRow.expires_at) < new Date()) {
      return errorResponse('This link has expired', 410);
    }

    const bookingId = tokenRow.booking_id;
    const tokenRowId = tokenRow.id;

    const { data: booking, error: bErr } = await sb
      .from('bookings')
      .select('id, trainer_id, consumer_name, consumer_email, scheduled_at, duration_min, amount_cents, stripe_payment_intent_id, stripe_charge_id, status')
      .eq('id', bookingId)
      .single();

    if (bErr || !booking) return notFoundError('Booking');

    if (booking.status === 'cancelled') return jsonResponse({ cancelled: true, refunded: false, alreadyCancelled: true });
    if (booking.status === 'refunded') return jsonResponse({ cancelled: true, refunded: true, alreadyCancelled: true });
    if (booking.status !== 'confirmed') return errorResponse('Booking cannot be cancelled in its current state', 400);

    const now = new Date();
    const scheduledAt = new Date(booking.scheduled_at);
    const hoursUntil = (scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60);
    const refundEligible = hoursUntil >= 24;

    let refunded = false;

    if (refundEligible && booking.stripe_payment_intent_id) {
      const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' });
      try {
        await stripe.refunds.create({ payment_intent: booking.stripe_payment_intent_id });
        refunded = true;
        log.info('Refund issued', { bookingId, paymentIntentId: booking.stripe_payment_intent_id });
      } catch (stripeErr) {
        log.error('Stripe refund failed', { bookingId, stripeErr });
        return serverError('Refund failed — please contact support');
      }
    }

    const { error: updateError, count } = await sb.from('bookings').update({
      status: refunded ? 'refunded' : 'cancelled',
      cancelled_at: new Date().toISOString(),
      refunded_at: refunded ? new Date().toISOString() : null,
    }).eq('id', bookingId).eq('status', 'confirmed').select('id', { count: 'exact', head: true });

    // count === 0 means the row was already updated by a concurrent request (race condition)
    if (!updateError && count === 0) {
      return jsonResponse({ cancelled: true, refunded: false, alreadyCancelled: true });
    }

    if (updateError) {
      log.error('Failed to update booking status', { bookingId, refunded, updateError });
      if (refunded) {
        log.error('CRITICAL: Stripe refund issued but booking not marked — needs manual reconciliation', { bookingId });
      }
      return serverError('Failed to update booking status');
    }

    // Mark token as used (one-time use)
    await sb.from('booking_tokens').update({ used_at: new Date().toISOString() }).eq('id', tokenRowId);

    const refundMsg = refunded
      ? `A full refund of $${(booking.amount_cents / 100).toFixed(2)} has been issued and will appear within 5–10 business days.`
      : `Your session was within 24 hours, so no refund is available per our cancellation policy.`;

    const html = emailBase(`
      <h1>Booking cancelled</h1>
      <p>Hi ${booking.consumer_name}, your session on ${new Date(booking.scheduled_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} has been cancelled.</p>
      <p>${refundMsg}</p>`);

    await sendEmail(booking.consumer_email, 'Your booking has been cancelled — TrainedBy', html);

    return jsonResponse({ cancelled: true, refunded });
  } catch (err) {
    log.exception(err, { function: 'cancel-booking' });
    return serverError('Internal error');
  }
});
```

- [ ] **Step 2: Verify HMAC removal**

```bash
grep -n "computeHmac\|timingSafeEqual\|BOOKING_SECRET\|bookingId" supabase/functions/cancel-booking/index.ts
```

Expected: no output.

- [ ] **Step 3: Verify token lookup is present**

```bash
grep -n "booking_tokens" supabase/functions/cancel-booking/index.ts
```

Expected output: lines referencing `.from('booking_tokens')` for select and update.

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/cancel-booking/index.ts
git commit -m "feat: cancel-booking — replace HMAC verify with booking_tokens DB lookup"
```

---

## Task 4: Update cancel.astro — drop bookingId, send only token

**Files:**
- Modify: `src/pages/book/cancel.astro`

**Context:** Current file reads `?id=` and `?token=` from URL (lines 3–4), validates both are present (line 14), and POSTs `{ bookingId, token }` (line 22). New flow: read only `?token=`, POST only `{ token }`.

- [ ] **Step 1: Update the frontmatter of cancel.astro**

Replace the entire frontmatter (lines 1–28 between the `---` delimiters):

```typescript
---
// src/pages/book/cancel.astro
const token = Astro.url.searchParams.get('token');

const SUPABASE_URL = import.meta.env.SUPABASE_URL as string;
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

let result: { cancelled?: boolean; refunded?: boolean; alreadyCancelled?: boolean; error?: string } = {};
let errorMsg = '';

if (!SUPABASE_URL) {
  errorMsg = 'Server configuration error. Please contact support.';
} else if (!token) {
  errorMsg = 'Invalid cancellation link.';
} else {
  try {
    const res = await fetch(`${FUNCTIONS_URL}/cancel-booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    result = await res.json();
    if (!res.ok) errorMsg = result.error ?? 'Cancellation failed.';
  } catch {
    errorMsg = 'Could not process cancellation. Please try again.';
  }
}
---
```

The HTML template below the frontmatter (lines 30–82) is unchanged.

- [ ] **Step 2: Verify no bookingId reference remains**

```bash
grep -n "bookingId\|booking_id\|searchParams.get('id')" src/pages/book/cancel.astro
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/pages/book/cancel.astro
git commit -m "feat: cancel.astro — drop bookingId param, token-only cancel flow"
```

---

## Task 5: Update my-bookings.astro — drop HMAC, DB token lookup

**Files:**
- Modify: `src/pages/my-bookings.astro`

**Context:** Current file (163 lines) reads `token`, `email`, `pi` from URL (lines 3–5), uses `BOOKING_SECRET` env var (line 9), has `computeHmac` and `timingSafeEqual` functions (lines 12–30), and queries `package_credits` with the URL's `email` and `pi`. New flow: read only `?token=`, look up in `booking_tokens`, get `consumer_email` and `stripe_payment_intent_id` from the token row.

- [ ] **Step 1: Replace the entire frontmatter**

Replace everything between the opening `---` and closing `---` (lines 1–67):

```typescript
---
// src/pages/my-bookings.astro
const token = Astro.url.searchParams.get('token');

const SUPABASE_URL = import.meta.env.SUPABASE_URL as string;
const SERVICE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY as string;

let credits: any[] = [];
let errorMsg = '';
let email = '';

if (!SUPABASE_URL || !SERVICE_KEY) {
  errorMsg = 'Server configuration error. Please contact support.';
} else if (!token) {
  errorMsg = 'Invalid link.';
} else {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const sb = createClient(SUPABASE_URL, SERVICE_KEY);

    // Look up token in booking_tokens
    const { data: tokenRow, error: tokenErr } = await sb
      .from('booking_tokens')
      .select('consumer_email, stripe_payment_intent_id, expires_at')
      .eq('token', token)
      .eq('token_type', 'my_bookings')
      .single();

    if (tokenErr || !tokenRow) {
      errorMsg = 'This link is invalid.';
    } else if (new Date(tokenRow.expires_at) < new Date()) {
      errorMsg = 'This link has expired. Contact your trainer.';
    } else {
      email = tokenRow.consumer_email ?? '';
      const pi = tokenRow.stripe_payment_intent_id ?? '';

      const { data } = await sb
        .from('package_credits')
        .select('id, status, session_type:session_types(name, duration_min), created_at')
        .eq('consumer_email', email)
        .eq('stripe_payment_intent_id', pi)
        .order('created_at', { ascending: true });
      credits = data ?? [];
    }
  } catch {
    errorMsg = 'Could not load your sessions. Please try again.';
  }
}

const available = credits.filter(c => c.status === 'available');
const scheduled = credits.filter(c => c.status === 'scheduled');
const used = credits.filter(c => c.status === 'used');
---
```

- [ ] **Step 2: Update the email subtitle in the HTML**

The current HTML uses `{email}` at line 108 (the `<p class="sub">` element). Because `email` is now a local variable declared in the frontmatter above (not a URL param), the reference is unchanged. Confirm it reads:

```astro
<p class="sub">{email}</p>
```

No change needed there.

- [ ] **Step 3: Verify no HMAC or URL-param references remain**

```bash
grep -n "computeHmac\|timingSafeEqual\|BOOKING_SECRET\|searchParams.get('email')\|searchParams.get('pi')" src/pages/my-bookings.astro
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src/pages/my-bookings.astro
git commit -m "feat: my-bookings — replace HMAC verify with booking_tokens DB lookup"
```

---

## Task 6: Deploy edge functions and smoke-test

**Files:** No file changes — deploy and verify.

- [ ] **Step 1: Deploy booking-webhook**

```bash
SUPABASE_ACCESS_TOKEN=<token> ./scripts/deploy_functions.sh booking-webhook
```

Expected: `Deployed booking-webhook successfully` (or equivalent success output).

- [ ] **Step 2: Deploy cancel-booking**

```bash
SUPABASE_ACCESS_TOKEN=<token> ./scripts/deploy_functions.sh cancel-booking
```

Expected: deployed successfully.

- [ ] **Step 3: Verify cancel-booking has verify_jwt = false**

```bash
grep -A2 "\[functions.cancel-booking\]" supabase/config.toml
```

Expected output includes `verify_jwt = false`. If missing, add:
```toml
[functions.cancel-booking]
verify_jwt = false
```
And redeploy.

- [ ] **Step 4: Smoke-test with invalid token → expect 403**

```bash
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"token":"deadbeef"}' \
  https://mezhtdbfyvkshpuplqqw.supabase.co/functions/v1/cancel-booking | jq .
```

Expected: `{"error":"Invalid or expired cancellation link"}` with status 403.

- [ ] **Step 5: Verify booking_tokens table is clean (no HMAC rows)**

In Supabase dashboard SQL editor:
```sql
select count(*) from booking_tokens;
```

Expected: 0 (no rows yet — tokens are inserted by booking-webhook on next confirmed booking).

- [ ] **Step 6: Final commit for any config changes**

```bash
git add supabase/config.toml  # only if verify_jwt was missing
git commit -m "chore: confirm cancel-booking verify_jwt = false in config"
```

(Skip this commit if no changes were needed.)

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Task 1 — `booking_tokens` table with all columns from spec
- ✅ Task 2 — random token generation, dual insert (cancel + my_bookings), URL simplification
- ✅ Task 3 — DB lookup, used_at idempotency, expires_at check, mark used on success, HMAC removal
- ✅ Task 4 — cancel.astro drops bookingId, token-only POST
- ✅ Task 5 — my-bookings drops email/pi params, DB lookup, email from token row
- ✅ Task 6 — deployment + smoke test

**Error states from spec:**
- ✅ Token not found → 403 (cancel) / "This link is invalid." (my-bookings)
- ✅ Token expired → 410 (cancel) / "This link has expired." (my-bookings)
- ✅ Token already used → `{ alreadyCancelled: true }` 200 (cancel) / N/A (my-bookings — not marked used)
- ✅ `booking_id` mismatch → impossible (token row owns booking_id)

**Placeholder scan:** None found.

**Type consistency:** `tokenRow.id`, `tokenRow.booking_id`, `tokenRow.used_at`, `tokenRow.expires_at` used consistently in Task 3. `tokenRow.consumer_email`, `tokenRow.stripe_payment_intent_id` in Task 5.
