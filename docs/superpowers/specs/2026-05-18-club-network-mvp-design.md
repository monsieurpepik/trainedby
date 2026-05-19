# TrainedBy Club Network — MVP Design Spec
Date: 2026-05-18
Status: Approved for planning

---

## 1. Product Thesis

TrainedBy pivots from a trainer marketplace to a **creator-led accountability network**. Trainers run structured 30-day transformation clubs. Members commit to daily missions, check in publicly, and build streaks inside a community feed. The core retention engine is social accountability — visibility of who showed up today drives everyone else to show up too.

The marketplace model (find trainer → book session → pay) is replaced entirely. Trainer profiles become creator pages. The product unit is the Club.

---

## 2. What We're Building (MVP)

The minimum viable club loop — end to end:

1. Trainer creates a club with a goal and price
2. AI generates 30 daily missions from the goal (Claude Opus)
3. Trainer reviews, edits tomorrow's mission daily, publishes
4. Club appears on trainer's profile page
5. Member finds club via trainer's profile link, signs in with Google, pays if required
6. Member sees today's mission + activity feed each day
7. Member checks in ("Done") — streak updates, feed updates
8. Trainer sees roster, daily stats, sends shoutouts, edits mission queue

---

## 3. Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Monetization | Hybrid — free or paid per club | Lets trainers run free beta clubs to seed engagement, paid clubs for revenue |
| Member auth | Google OAuth (Supabase) | One-tap sign-in, persistent identity, zero friction |
| Trainer auth | Existing magic link | No change — trainers already onboarded |
| Mission creation | AI draft (Claude Opus) + trainer edits tomorrow daily | Removes 30-mission cold-start burden; trainer stays engaged without full authorship |
| Discovery | Trainer profile page = club landing page | No browse directory for MVP — trainer brings their own audience |
| Daily member UX | Feed-first: mission pinned top, activity feed below | Social accountability is the primary retention mechanic |
| Trainer dashboard | Stats + member roster with streaks + shoutout + mission queue | Combines roster visibility with forward planning |
| Wearable integrations | Schema-ready (`source` field), feature in Phase 2+ | Strava Phase 2, Oura/Whoop Phase 3 |
| Live features | Phase 2 — live drops + live sessions on one stream | `max_members` field on clubs anticipates this in MVP schema |

---

## 4. New Data Model

Five new tables. Nothing existing is deleted — old marketplace tables become dormant.

### `users`
Participants (members). Separate from `trainers`.

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  display_name  TEXT NOT NULL,
  avatar_url    TEXT,
  google_id     TEXT UNIQUE NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `clubs`
The core product unit.

```sql
CREATE TABLE clubs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id       UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  slug             TEXT UNIQUE NOT NULL,
  name             TEXT NOT NULL,
  goal             TEXT NOT NULL,
  duration_days    INT NOT NULL DEFAULT 30,
  is_free          BOOLEAN NOT NULL DEFAULT FALSE,
  price_cents      INT,                          -- NULL if is_free
  stripe_price_id  TEXT,                         -- NULL if is_free
  max_members      INT,                          -- NULL = unlimited; used by live drops (Phase 2)
  starts_at        TIMESTAMPTZ,
  ends_at          TIMESTAMPTZ,
  status           TEXT NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft','active','ended')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `club_members`
Tracks who joined which club.

```sql
CREATE TABLE club_members (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id                UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id                UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  stripe_subscription_id TEXT,                  -- NULL for free clubs
  status                 TEXT NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active','cancelled')),
  UNIQUE (club_id, user_id)
);
```

### `missions`
One row per day per club.

```sql
CREATE TABLE missions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id             UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  day_number          INT NOT NULL CHECK (day_number BETWEEN 1 AND 365),
  title               TEXT NOT NULL,
  description         TEXT,
  type                TEXT NOT NULL
                      CHECK (type IN ('run','workout','nutrition','recovery','mindset','other')),
  ai_draft            BOOLEAN NOT NULL DEFAULT TRUE,
  edited_by_trainer   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (club_id, day_number)
);
```

### `checkins`
One row per member per mission completed.

```sql
CREATE TABLE checkins (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id      UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  mission_id   UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source       TEXT NOT NULL DEFAULT 'manual'
               CHECK (source IN ('manual','strava','oura','whoop')),  -- integrations plug in here
  proof_url    TEXT,
  note         TEXT,
  streak_day   INT NOT NULL DEFAULT 1,
  UNIQUE (mission_id, user_id)
);
```

---

## 5. Core User Flows

### Trainer: Create a Club
1. `/dashboard` → "New Club" button
2. Form: club name, transformation goal, duration (default 30), free/paid toggle, price if paid, optional max members
3. Submit → edge function `create-club` creates club in `draft` status + calls Claude Opus with goal → generates all 30 missions → stores in `missions` table
4. Trainer reviews missions, edits any, sets `starts_at`
5. Publish → status → `active` → club appears on trainer's `/[slug]` profile page

### Trainer: Daily Mission Edit
- Trainer receives email nudge each morning: "Tomorrow is Day X — [AI draft]. Edit before it goes live."
- Clicks link → inline edit on dashboard mission queue
- Sets `edited_by_trainer = true` on save

### Member: Join a Club
1. Visits trainer profile (`/ahmed-hassan`)
2. Sees club card: name, goal, day count, price, member count
3. Clicks "Join" → Google OAuth sign-in (Supabase)
4. If free → `club_members` row created → redirect to club home
5. If paid → Stripe Checkout (subscription) → webhook confirms → `club_members` row created → redirect to club home

### Member: Daily Check-in
1. Opens `/clubs/[slug]` (bookmarked or email link)
2. Sees: today's mission pinned at top + activity feed (who checked in today + their streaks)
3. Taps "Done" → `checkins` row created (source: manual) → streak recalculated → feed updates in real-time (Supabase Realtime)
   - Streak rule: consecutive days with a check-in. Missing one day resets to 0. One streak freeze allowed per 30-day club (not in MVP UI — add in Phase 2).
4. Member's name appears in the feed for all club members

### Trainer: Club Dashboard
- `/dashboard/clubs/[slug]`
- Stats row: today's check-ins / total members, avg completion rate, members at risk (no streak in 3+ days)
- Member roster: display name, current streak, today's status (checked in / pending)
- Shoutout button → posts a feed entry visible to all club members: "Coach Ahmed: keep going! 🔥" — appears in the activity feed exactly like a check-in. No push notification for MVP; members see it next time they open the club page.
- Mission queue: next 7 days, tomorrow highlighted with edit button

---

## 6. AI Mission Generation

**Model:** Claude Opus (highest quality, justified by one-time generation cost)

**Prompt structure:**
- System: Certified fitness coach with 10 years programming experience. You write precise, progressive, behavior-focused daily missions. Each mission is simple, binary (done/not done), and builds toward the stated transformation goal.
- User: Goal: {goal}. Duration: {duration_days} days. Create {duration_days} daily missions. Return JSON array: `[{day, title, description, type}]`. Missions must progress logically — week 1 builds foundation, week 2 increases intensity, week 3 peaks, week 4 consolidates. Never repeat the same mission on consecutive days. Mix types: run/workout/nutrition/recovery/mindset.

**Note:** Fitness level is not collected in the create-club form for MVP — the AI defaults to beginner-friendly progressions that scale naturally. Trainer can edit any mission that feels too advanced.

**Quality bar:** Trainer should feel they're editing a good plan, not fixing a bad one. If the first generation doesn't meet this bar in testing, iterate the prompt before shipping.

---

## 7. Profile Page Update

`/[slug]` trainer profile: packages carousel replaced by clubs section.

**Clubs section shows:**
- Active club cards: name, goal snippet, day X of Y progress, member count, price or "Free", Join button
- Ended clubs: greyed out with "Cohort complete" badge
- If no clubs: "No active clubs" with CTA to trainer's WhatsApp

**Trainer profile data model:** No changes — trainer record stays as-is. Club cards pull from `clubs` table via trainer_id.

---

## 8. Phase 2 — Live Feature (Whatnot Model)

Not in MVP. Schema anticipates it via `max_members` on clubs.

### Live Drop
- Trainer goes live (LiveKit or Daily.co)
- Announces new club with limited seats
- Viewers see real-time seat counter (Supabase Realtime)
- "Claim My Spot" → Stripe payment → seat reserved for 3 minutes
- Sold out clubs create FOMO / waitlist pressure

### Live Session
- Trainer goes live for current club's daily session
- Members join stream and check in during live
- Check-ins appear in real-time feed ("Sarah checked in! 🔥 13 days")
- Members who check in during live get "Live" badge on their feed entry

### One Stream, Two Revenue Moments
- First 10 min: drop for upcoming club → new revenue
- Remaining time: current club daily session → retention + engagement

**Tech stack for Phase 2:** LiveKit (WebRTC, self-hosted or cloud), Supabase Realtime for seat counter, existing Stripe for payments.

---

## 9. Phase 3 — Wearable Integrations

`checkins.source` field is ready. No schema changes needed.

| Integration | Use case | API approach |
|-------------|----------|--------------|
| Strava | Auto-verify run/ride/swim missions | OAuth + webhook |
| Oura | Auto-verify sleep/recovery missions | OAuth + polling |
| Whoop | Auto-verify strain/recovery missions | OAuth + polling |

Member connects integration once from their profile settings. When a mission type matches a tracked activity (run → Strava), check-in fires automatically.

---

## 10. MVP Build Phases

| Phase | Scope | Est. |
|-------|-------|------|
| 1 | Schema (5 tables), Google OAuth, Supabase auth config, users model | 3–4 days |
| 2 | Club creation flow, AI mission generation (Claude Opus), mission review UI | 3–4 days |
| 3 | Member join flow (Google sign-in + Stripe subscription for paid clubs) | 2–3 days |
| 4 | Daily member view: mission + check-in + streak + activity feed (Supabase Realtime) | 4–5 days |
| 5 | Trainer dashboard: stats + roster + shoutout + mission queue + daily edit | 3–4 days |
| 6 | Profile page clubs section, daily email nudge to trainer, end-to-end test | 2 days |
| **Total** | | **~5 weeks** |

---

## 11. Explicit Out of Scope (MVP)

- Club chat / direct messaging
- Push notifications (email only)
- Club discovery browse page
- Multiple simultaneous active clubs per trainer
- Live sessions (Phase 2)
- Wearable integrations (Phase 3)
- Progress certificates / completion badges
- Analytics dashboards
- Native mobile app

---

## 12. Existing Infrastructure Reused

| Asset | How reused |
|-------|-----------|
| Magic link auth | Trainers only — unchanged |
| Stripe payment rails | Reconfigured for subscriptions |
| Trainer profile `/[slug]` | Clubs section replaces packages |
| Astro + React + Supabase | Stack unchanged |
| Edge function infrastructure | New functions added alongside existing |
| Dark glass design system | Member and club UI matches existing aesthetic |
| Claude content agent | Extended for mission generation |

Existing marketplace tables (`bookings`, `session_packages`, `leads`, `session_types`) remain in DB but go dormant. No deletion — clean break on the product surface only.
