# Booking Tokens — Design Spec

## Goal

Replace permanent HMAC-based cancel and my-bookings tokens with database-stored random tokens that expire, support one-time use (cancel), and carry no PII in URLs.

## Background

Two token-protected URLs exist in the direct booking flow:

- `/book/cancel?token=` — consumer cancels a confirmed booking
- `/my-bookings?token=` — consumer views their package credit balance

The current implementation has two problems:
1. **Tokens never expire** — a forwarded email gives permanent cancel access
2. **Token pipeline is broken** — `booking-webhook` generates HMAC tokens with a different secret name (`BOOKING_HMAC_SECRET`) and message format (no prefix) than what `cancel-booking` and `my-bookings.astro` verify against (`BOOKING_SECRET`, `cancel:${id}` prefix)

This spec fixes both in one pass by switching to DB-stored random tokens.

## Architecture

A single `booking_tokens` table stores all tokens. Token generation happens in `booking-webhook/index.ts` (the existing DB webhook that fires on booking confirmation). Token verification happens in `cancel-booking/index.ts` (edge function) and `my-bookings.astro` (SSR page) via Supabase service role lookups.

HMAC and `BOOKING_SECRET` are fully removed from both verifiers. No secret is needed on the verification side — a random token is a credential in itself.

## Schema

```sql
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

`consumer_email` and `stripe_payment_intent_id` are stored on `my_bookings` rows so the page can query `package_credits` without requiring those values in the URL.

No RLS is needed — all access is via the service role (edge functions and Astro SSR).

## Token Generation

**Location:** `supabase/functions/booking-webhook/index.ts`

**Token format:** 64 hex characters — `crypto.getRandomValues(new Uint8Array(32))` mapped to hex.

**On booking confirmation**, generate and insert both tokens in a single `insert` call:

```typescript
function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

const cancelToken = generateToken();
const myBookingsToken = generateToken();
const now = new Date();

await sb.from('booking_tokens').insert([
  {
    token: cancelToken,
    token_type: 'cancel',
    booking_id: booking.id,
    expires_at: new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString(),
  },
  {
    token: myBookingsToken,
    token_type: 'my_bookings',
    booking_id: booking.id,
    consumer_email: booking.consumer_email,
    stripe_payment_intent_id: booking.stripe_payment_intent_id,
    expires_at: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
]);
```

Remove all references to `BOOKING_HMAC_SECRET`, `generateHmac`, and the old HMAC-based cancel/my-bookings token logic from `booking-webhook`.

**URL structure after change:**

| URL | Before | After |
|-----|--------|-------|
| Cancel | `/book/cancel?booking_id={id}&token={hmac}` | `/book/cancel?token={random}` |
| My-bookings | `/my-bookings?email={email}&pi={pi}&token={hmac}` | `/my-bookings?token={random}` |

No PII in query strings. Token alone is the credential.

## Expiry Policy

| Token type | Window | Rationale |
|------------|--------|-----------|
| `cancel` | 72 hours | Time-sensitive action; trainer should be contacted directly after |
| `my_bookings` | 30 days | Consumers check credit balances days or weeks after purchase |

## Token Verification

### cancel-booking edge function

Replace HMAC verification with a DB lookup:

1. Read `token` from request body (remove `bookingId` — not needed in URL or body)
2. Query `booking_tokens` where `token = $token` and `token_type = 'cancel'`
3. If not found → 403 Invalid link
4. If `used_at` is not null → return `{ alreadyCancelled: true }` (idempotent)
5. If `expires_at < now()` → 410 Link expired
6. Read `booking_id` from the token row — use this as the authoritative booking ID
7. Proceed with cancellation logic (existing: status check, Stripe refund, DB update)
8. On success, mark token used: `update booking_tokens set used_at = now() where id = $tokenRowId`

Remove: `computeHmac`, `timingSafeEqual`, `BOOKING_SECRET` env var lookup.

### my-bookings.astro SSR page

Replace HMAC verification with a DB lookup:

1. Read only `?token=` from query params (remove `email`, `pi` — not needed in URL)
2. Query `booking_tokens` where `token = $token` and `token_type = 'my_bookings'`
3. If not found → show "Invalid link" error
4. If `expires_at < now()` → show "This link has expired" error
5. Read `consumer_email` and `stripe_payment_intent_id` from the token row
6. Query `package_credits` using those values (existing logic unchanged)
7. Display email as subtitle (still available from token row)

Token is not marked used — consumer can revisit the page within the 30-day window.

Remove: `computeHmac`, `timingSafeEqual`, `BOOKING_SECRET` env var, `email`/`pi` query param reads.

## Error States

| Condition | cancel-booking response | my-bookings display |
|-----------|------------------------|---------------------|
| Token not found | 403 + "Invalid or expired link" | "This link is invalid." |
| Token expired | 410 + "This link has expired" | "This link has expired. Contact your trainer." |
| Token already used | `{ alreadyCancelled: true }` (200) | N/A (not marked used) |
| booking_id mismatch | impossible — token row owns booking_id | N/A |

## Cleanup

No automated cleanup is needed at current volume. When warranted, run:

```sql
delete from booking_tokens where expires_at < now() - interval '7 days';
```

This can be added to a Supabase cron job later.

## Files Changed

| File | Change |
|------|--------|
| `supabase/migrations/YYYYMMDD_booking_tokens.sql` | Create table + indexes |
| `supabase/functions/booking-webhook/index.ts` | Replace HMAC generation with random token insert |
| `supabase/functions/cancel-booking/index.ts` | Replace HMAC verify with DB lookup; mark token used on success |
| `src/pages/my-bookings.astro` | Replace HMAC verify with DB lookup; remove email/pi from URL |
| `src/pages/book/cancel.astro` | Update URL param from `?id=&token=` to `?token=` only |
