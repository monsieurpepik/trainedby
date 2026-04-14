# Academy Module: Architecture & Payment Strategy

## Payment Architecture Decision

### The Core Problem
Stripe Connect (the obvious choice) has a critical blocker for the UAE market: **it requires every connected account (i.e., every coach or academy) to hold a valid UAE trade license.** Individual freelance PTs and small academy coaches rarely have one. This is not a technical limitation — it is a regulatory one enforced by the Central Bank of the UAE.

### The Fresha Model (What We Should Copy)
Fresha solved this exact problem brilliantly. Their architecture is:

1. **The platform (Fresha/TrainedBy) is the merchant of record.** The client pays TrainedBy, not the coach.
2. **TrainedBy holds a single merchant account** (one trade license, one Stripe/Telr account).
3. **Coaches receive payouts** from TrainedBy's wallet to their personal bank account on a weekly or monthly schedule — exactly like how Uber pays drivers.
4. **The coach never needs a payment gateway or trade license** to receive money.

This is legally clean, operationally simple, and the model used by every major service marketplace (Uber, Deliveroo, Fresha, Treatwell).

### Recommended Payment Stack

| Layer | Tool | Why |
|---|---|---|
| **Client-facing payments (UAE)** | Stripe (via TrainedBy's single account) | Best developer experience, supports Apple Pay, Google Pay, card. TrainedBy already has Stripe. |
| **Client-facing payments (UK)** | Stripe (same account, GBP) | Stripe handles multi-currency natively. |
| **BNPL / Instalments (UAE)** | Tabby integration via Telr or direct | Parents paying term fees (AED 2,000+) will strongly prefer 4x instalment. Tabby is the UAE standard. |
| **Coach/Academy payouts** | Stripe Payouts (to bank) or Wise Business | Weekly batch payouts from TrainedBy's Stripe balance to coach bank accounts. No KYC burden on coaches. |
| **Platform fee** | 10% on session bookings, 5% on term packages | Taken at point of charge before payout. |

### Implementation Complexity (Revised)
With this "platform as merchant of record" model, complexity drops dramatically:
- **No Stripe Connect needed.** We use standard Stripe Checkout for all client payments.
- **Payouts** are handled via Stripe's Payout API or manual Wise batch transfers — much simpler than Connect.
- **The only KYC** required is TrainedBy's own business verification (already done).

---

## Academy Module Architecture

### Data Model

```
academies
  id, slug, name, sport, logo_url, cover_url
  description, location, google_maps_url
  contact_email, contact_phone, whatsapp
  stripe_customer_id, plan (free|pro|elite)
  verified, created_at

academy_coaches
  id, academy_id, trainer_id (→ trainers.id)
  role (head_coach|assistant|goalkeeper_coach)
  bio, display_order

programs
  id, academy_id, name, sport, age_group
  description, duration_weeks, sessions_per_week
  price_aed, price_gbp, max_capacity
  start_date, end_date, location
  is_active

sessions
  id, program_id, coach_id
  date, start_time, end_time
  location, notes, status (scheduled|completed|cancelled)

bookings
  id, program_id, session_id (null = full program)
  parent_name, parent_email, parent_phone
  child_name, child_dob, child_notes
  amount_paid, currency, stripe_payment_intent_id
  status (pending|confirmed|cancelled|refunded)
  created_at

availability
  id, coach_id, day_of_week (0-6)
  start_time, end_time, is_blocked
```

### User Flows

**Academy Admin Flow:**
1. Academy registers → gets a profile page at `trainedby.ae/academy/[slug]`
2. Admin logs in → creates Programs (e.g., "U10 Football Term 3", "Holiday Camp July")
3. Sets schedule: which days, which coach, what time, max capacity
4. Shares their profile link with parents

**Parent Booking Flow:**
1. Parent visits `trainedby.ae/academy/barca-dubai`
2. Sees academy profile, coaches, active programs
3. Clicks "Enrol Now" on a program
4. Fills in child's details (name, DOB, any notes)
5. Pays via Stripe Checkout (card / Apple Pay / Tabby BNPL)
6. Receives confirmation email + calendar invite
7. Gets automated reminders before each session

**Coach Flow:**
1. Coach sees their weekly schedule in a simple calendar view
2. Can mark sessions as completed, add notes
3. Sees their earnings dashboard (sessions × rate)
4. Receives weekly payout to their bank account

### Pages to Build

| Page | Route | Who sees it |
|---|---|---|
| Academy Profile | `/academy/[slug]` | Public (parents) |
| Academy Admin | `/academy/[slug]/admin` | Academy admin only |
| Parent Booking | `/academy/[slug]/book/[program-id]` | Public |
| Booking Confirmation | `/booking/[id]` | Parent (post-payment) |
| Coach Schedule | `/coach/schedule` | Logged-in coach |

### Edge Functions to Build

| Function | Purpose |
|---|---|
| `create-academy` | Register new academy, create Stripe customer |
| `get-academy` | Public profile data fetch |
| `create-program` | Admin creates a program |
| `create-booking` | Parent submits booking, creates Stripe Checkout session |
| `booking-webhook` | Stripe webhook → confirms booking, sends emails |
| `get-schedule` | Coach's weekly calendar view |
| `send-booking-confirmation` | Email + calendar invite to parent |
| `payout-coaches` | Weekly cron: calculate earnings, initiate bank transfers |
