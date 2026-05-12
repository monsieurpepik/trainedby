# Direct Bookings & Payments — Design Spec

**Date:** 2026-05-01  
**Market:** USA (`trainedby.com`) — first market; architecture is market-agnostic

---

## Goal

Enable consumers to discover a trainer on TrainedBy and book + pay for a session end-to-end without leaving the platform. Trainers get paid directly to their bank via Stripe Connect. TrainedBy takes zero commission (Pro plan feature).

---

## Architecture

### Three actors

| Actor | Role |
|---|---|
| Trainer (Pro plan) | One-time setup: connect bank, define sessions, set availability |
| Consumer | Finds trainer, books a slot, pays |
| Platform (TrainedBy US) | Stripe Atlas entity routes payment to trainer; sends emails; handles refunds |

### Payment model

Stripe Connect Express. Trainer onboards once via Stripe-hosted flow. All booking payments are charged to the consumer and routed directly to the trainer's connected account via `transfer_data`. Platform never holds funds. Zero commission. Trainer keeps 100%.

### Booking page

Dedicated `/book/[slug]` page (not a modal). Clean, distraction-free, shareable URL trainers can send clients directly. Three steps reveal progressively on one page with no full-page reloads:

1. Choose session type
2. Pick a date + time slot
3. Enter details + pay

### Availability model

Weekly recurring schedule (trainer sets which days and hours) plus manual date overrides (block specific dates or ranges — holidays, sick days). No Google Calendar sync in v1. No OAuth dependency.

### Session types supported at launch

- **Single session** — pay once, book one slot
- **Package** — pay upfront for N sessions at a discount; credits stored, scheduled one at a time

Memberships (recurring billing) — planned for v2, infrastructure is compatible.

---

## Data Model

### New tables

#### `session_types`
```sql
id            uuid primary key default gen_random_uuid()
trainer_id    uuid references trainers(id) on delete cascade
name          text not null
duration_min  int not null          -- e.g. 60
price_cents   int not null          -- in USD cents
type          text not null         -- 'single' | 'package'
package_count int                   -- null for single; N for package
is_active     boolean default true
created_at    timestamptz default now()
```

#### `trainer_availability`
Weekly recurring schedule. One row per day-of-week the trainer is available.
```sql
id            uuid primary key default gen_random_uuid()
trainer_id    uuid references trainers(id) on delete cascade
day_of_week   int not null          -- 0=Sun, 1=Mon, ..., 6=Sat
start_time    time not null         -- e.g. 06:00
end_time      time not null         -- e.g. 14:00
```

#### `availability_overrides`
Date-specific blocks (vacations, sick days, one-off additions).
```sql
id            uuid primary key default gen_random_uuid()
trainer_id    uuid references trainers(id) on delete cascade
date          date not null
is_blocked    boolean default true  -- false = one-off open day
note          text
```

#### `bookings`
```sql
id                   uuid primary key default gen_random_uuid()
trainer_id           uuid references trainers(id)
session_type_id      uuid references session_types(id)
consumer_name        text not null
consumer_email       text not null
consumer_phone       text not null
consumer_goal        text
scheduled_at         timestamptz not null
duration_min         int not null
amount_cents         int not null
stripe_payment_intent_id text
stripe_charge_id     text
status               text default 'pending'
  -- 'pending' | 'confirmed' | 'cancelled' | 'refunded' | 'completed'
cancelled_at         timestamptz
refunded_at          timestamptz
package_credit_id    uuid references package_credits(id)
created_at           timestamptz default now()
```

#### `package_credits`
One row per session purchased in a package.
```sql
id                   uuid primary key default gen_random_uuid()
trainer_id           uuid references trainers(id)
session_type_id      uuid references session_types(id)
consumer_email       text not null
consumer_name        text not null
stripe_payment_intent_id text not null
status               text default 'available'
  -- 'available' | 'scheduled' | 'used' | 'cancelled'
booking_id           uuid references bookings(id)
created_at           timestamptz default now()
```

When a consumer buys a 10-session pack: 10 rows inserted into `package_credits` (no `booking_id` yet). One booking is then inserted for the first session, referencing one credit's `id` in `package_credit_id`. That credit's `booking_id` is then updated. The circular FK is intentional and resolved by nullable columns + insert-then-update order. Remaining 9 credits sit as `available` until the consumer schedules them.

### Existing table changes

`trainers` — add two columns:
```sql
stripe_connect_account_id  text       -- null until onboarded
stripe_connect_onboarded   boolean    default false
```

---

## New Edge Functions

| Function | Purpose |
|---|---|
| `connect-stripe` | Creates a Stripe Connect Express account and returns the onboarding URL |
| `connect-stripe-return` | Called when trainer returns from Stripe; verifies onboarding complete, sets `stripe_connect_onboarded = true` |
| `get-trainer-slots` | Returns available booking slots for a trainer for a given date range, given their schedule, overrides, and existing bookings |
| `book-session` | Creates a Stripe PaymentIntent with `transfer_data`, inserts booking record, creates package credits if package |
| `booking-webhook` | Handles `payment_intent.succeeded` from Stripe; confirms booking, sends confirmation email to consumer and notification to trainer |
| `cancel-booking` | Checks 24h window; issues Stripe refund if eligible; updates booking status |
| `send-booking-reminders` | Scheduled cron (runs hourly); finds bookings where `scheduled_at` is 23–25h from now and sends reminder emails to both consumer and trainer |

Note: `booking-webhook` must have `verify_jwt = false` in `config.toml` (per CLAUDE.md webhook convention). Stripe signature is validated inside the function body.

---

## New Pages

### `/book/[slug]`
Public booking page. Astro SSR page, no auth required.

**Step 1 — Choose session type**
- Shows trainer name/photo pulled from `trainers` table
- Lists active session types with name, duration, price
- Package types show "SAVE X%" badge: `((single_price_cents × package_count) - package_price_cents) / (single_price_cents × package_count) × 100`. Only shown if a single-session type of the same duration exists for this trainer. If none exists, no badge.
- Selecting a type reveals Step 2

**Step 2 — Pick a time**
- Calls `get-trainer-slots` edge function
- Monthly calendar highlights available days (derived from weekly schedule + overrides + existing bookings)
- Selecting a day shows hourly slots; booked slots greyed out
- Selecting a slot reveals Step 3

**Step 3 — Your details + pay**
- Booking summary (date, time, duration) locked at top
- Fields: Full name, Email, Phone, Goal (optional free text)
- Order summary: session name + price, total
- "Pay $X · Confirm Booking" button calls `book-session`, handles Stripe.js confirm

**After payment:**
- Consumer sees confirmation screen with session details
- Consumer gets confirmation email (via Resend)
- Trainer gets "New booking" push notification
- For packages: confirmation email includes a link to `/my-bookings?token=<signed-token>` where consumer can see their credit balance and book remaining sessions. The token is HMAC-signed with the consumer's email and payment intent ID — no account required.

### Dashboard — bookings tab
Added to existing trainer dashboard. Lists upcoming and past bookings. Shows: consumer name, session type, date/time, amount, status badge. Cancel button opens confirmation modal with refund eligibility shown.

### Dashboard/Edit — sessions + availability tabs

**Sessions tab:**
- Lists active session types
- "Add session type" form: name, duration (minutes), price (USD), type (single vs package + how many sessions)
- Toggle active/inactive per type

**Availability tab:**
- Day-by-day weekly schedule: toggle day on/off, set start/end time
- "Block specific dates" section: date picker, add blocked date or range, list of blocked dates with remove button

---

## Setup Gating

"Book a Session" button on trainer's public profile `[slug].astro` only renders when all three conditions are true:
1. `trainers.stripe_connect_onboarded = true`
2. At least one row in `session_types` with `is_active = true` for this trainer
3. At least one row in `trainer_availability` for this trainer

If any condition is unmet, the profile shows nothing in that button's place (no tease, no broken state).

In the dashboard, an incomplete setup shows a prominent "Finish setup to accept bookings" card with the remaining steps highlighted.

---

## Cancellation Policy

Platform-wide, not trainer-configurable in v1.

- Cancel 24h+ before session → full refund via Stripe refund API
- Cancel within 24h → no refund
- Enforcement is automatic: `cancel-booking` function checks `scheduled_at - now() > 24h` before issuing refund

---

## Email Flows

All emails sent via Resend from existing `resend-*` pattern.

| Trigger | Recipient | Content |
|---|---|---|
| Booking confirmed | Consumer | Session details, trainer contact, cancellation link |
| Booking confirmed | Trainer | Consumer name, goal note, session date/time |
| Booking cancelled | Consumer | Refund amount (or explanation if within 24h) |
| 24h reminder | Consumer | Session tomorrow, trainer contact |
| 24h reminder | Trainer | Session tomorrow, consumer name |

---

## Stripe Connect Setup Flow (trainer)

1. Trainer clicks "Set up payouts" in dashboard
2. Frontend calls `connect-stripe` edge function
3. Function creates Stripe Connect Express account (or retrieves existing), generates `account_links.url`
4. Trainer is redirected to Stripe-hosted onboarding
5. After completing Stripe flow, Stripe redirects to `/dashboard?stripe=return`
6. Page calls `connect-stripe-return`, which verifies `charges_enabled` on the account, sets `stripe_connect_onboarded = true`
7. Dashboard refreshes setup status — step 1 shows complete

---

## Access Control

- Booking page is fully public (no auth)
- Session types, availability, and booking management are trainer-dashboard-only (existing auth gate)
- Consumer has no account — identity is email address in booking record
- Cancellation link in confirmation email uses a signed token (HMAC of booking ID) — no login required to cancel

---

## Out of Scope (v1)

- Memberships / recurring billing
- Google Calendar sync
- Trainer-configurable cancellation windows
- Multi-trainer gyms / group sessions
- Waitlists
- Consumer accounts / booking history login
- In-app chat between trainer and consumer
- Markets other than `trainedby.com` (architecture is ready, not wired up)
