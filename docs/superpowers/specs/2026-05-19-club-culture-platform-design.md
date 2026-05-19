# Club Culture Platform — Design Spec
Date: 2026-05-19
Status: Approved for planning

---

## 1. Objective

Evolve TrainedBy from a 30-day program tool into a creator-led club culture platform. The model combines three references: OnlyFans (free teaser → paid subscription distribution), BODi (structured 30-day season mechanics), and Whatnot (live drop energy on season launches). Coaches build persistent crews with identity across seasons. Members subscribe for the video library between seasons and join seasonal cohorts for the transformation program.

---

## 2. Product Model

### User journey — four stages

| Stage | Access | Revenue |
|---|---|---|
| **Follower** | Free. Activity feed, leaderboard, coach's free clips. | $0 |
| **Subscriber** | Monthly. Full video library, live session access, early season access. | Coach sets price (AED 15–50/mo). 80% to coach. |
| **Club Member** | One-time per season. Daily missions, check-ins, public streak, accountability. | Coach sets price (AED 49–199). 80% to coach. |
| **Alumni** | Stays subscribed. Season badge, history, next-season early access. | Subscriber revenue continues. |

### The Whatnot moment
Coach goes live to launch a new season. Followers get push notification. Price tiers climb as seats fill. Followers watching in real-time can claim a spot via Stripe modal without leaving the live. This is the primary acquisition mechanic — the launch is the event.

### What the video library solves
Without it, a coach's page goes dead between seasons and subscribers have no reason to stay. The video library is the retention layer. Coaches mark some videos `is_free` as teasers (OnlyFans pattern). Free previews visible to everyone; full library gated to subscribers.

---

## 3. Phase 1 — Follower Tier + Seasons Model

### 3.1 Schema changes

**New table: `club_followers`**
```sql
CREATE TABLE club_followers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id     uuid REFERENCES clubs(id) ON DELETE CASCADE NOT NULL,
  user_id     uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  followed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(club_id, user_id)
);
ALTER TABLE club_followers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "followers visible to all" ON club_followers FOR SELECT USING (true);
CREATE POLICY "user manages own follows" ON club_followers FOR ALL USING (auth.uid() = user_id);
```

**`clubs` table additions:**
```sql
ALTER TABLE clubs ADD COLUMN season_number int NOT NULL DEFAULT 1;
ALTER TABLE clubs ADD COLUMN parent_club_id uuid REFERENCES clubs(id);
ALTER TABLE clubs ADD COLUMN public_leaderboard boolean NOT NULL DEFAULT true;
```
`public_leaderboard = false` blurs member names on the public club page — only first initial + last name shown (e.g. "S. Al-Mansoori"). Coaches can toggle this on club creation or from their dashboard.
`parent_club_id` links Season 2 back to Season 1. Null for the first season of any club.

**`club_members` table addition:**
```sql
ALTER TABLE club_members ADD COLUMN season_number int NOT NULL DEFAULT 1;
```
Populated from `clubs.season_number` at join time.

### 3.2 Club page states

The club page (`/clubs/[slug]`) renders three distinct views based on auth state + membership:

**Stranger / Follower view** (`ClubPublicView`)
- Live activity feed: real member names, check-in timestamps, streak milestones (public by default — coach can set `public_leaderboard: false` on club creation to blur names)
- Leaderboard: top 10 by streak, real names visible
- Ghost row at bottom: "You · follow or join to appear here"
- Season status chip: "Season 3 · Day 18 of 30 · 6 spots left" or "Next season coming soon"
- Two CTAs: "Join Season [N] — [price]" + "Follow free"
- Coach's free video clips (videos where `is_free = true`) embedded inline

**Active member view** (`ClubMemberView`) — already built, minor update:
- Add season number to header: "Season 3 · Day 18"
- Live session banner when coach is broadcasting: "Ahmed is live now → Watch"

**Alumni view** (new state)
- Season finisher badge: "Season 1 Graduate · 28/30 days"
- Stats from completed season
- "Season 2 is open" CTA if successor season exists and they're not enrolled

### 3.3 Season continuation flow

When a 30-day club completes (all missions delivered), the coach sees a "Start Season 2" button in their dashboard. This:
1. Creates a new `clubs` record with `parent_club_id = current club id`, `season_number = current + 1`, `status = 'draft'`
2. Coach edits the goal and price for the new season
3. AI generates 30 new missions
4. Coach publishes — or launches via live drop (Phase 3)

Alumni of Season 1 are notified and offered early access + alumni discount.

### 3.4 New edge functions

**`follow-club`**
- Auth: JWT required
- Input: `{ club_id }`
- Action: upsert `club_followers` record
- Returns: `{ following: true }`

**`unfollow-club`**
- Auth: JWT required
- Input: `{ club_id }`
- Action: delete from `club_followers`

### 3.5 New components

- `src/components/club/ClubPublicView.tsx` — stranger/follower view with activity feed + leaderboard + CTAs
- `src/components/club/SeasonBadge.tsx` — displays season number + completion status (e.g. "S1 ✓", "S2 Active")
- `src/components/club/FollowButton.tsx` — follow/unfollow toggle, optimistic UI
- `src/pages/clubs/[slug].astro` — updated routing: detect auth state + membership + alumni status, render correct view component

### 3.6 Coach dashboard additions

- Follower count displayed separately from paid member count on club dashboard
- "Start Season 2" button appears 3 days before season end and after completion
- Alumni list: members who completed previous seasons, with re-enrol button

---

## 4. Phase 2 — Subscriber Subscription + Video Library

### 4.1 Infrastructure — Mux

All video (VOD and live) runs through **Mux** (mux.com).

- **Upload flow:** TrainedBy backend requests a Mux direct upload URL → coach browser uploads directly to Mux (never through our servers) → Mux transcodes, generates thumbnail → Mux fires webhook to `mux-webhook` edge function → function marks video as ready in DB
- **Playback:** Mux Player (`@mux/mux-player-react`) with `playbackId`. Authenticated playback tokens for subscriber-gated content.
- **Cost estimate:** ~$0.015/min stored + $0.025/min delivered. 50 videos × 30 min avg = $22.50/month storage. 100 subscribers × 5 videos/month × 30 min = $37.50 delivery. ~$60/month at scale for an active coach.
- **Secrets required:** `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET` in Supabase Edge Function secrets.

### 4.2 Schema changes

**`trainers` table additions:**
```sql
ALTER TABLE trainers ADD COLUMN subscription_price_cents int; -- null = no subscription product
ALTER TABLE trainers ADD COLUMN mux_signing_key_id text;
ALTER TABLE trainers ADD COLUMN mux_signing_private_key text; -- stored encrypted
```

**New table: `coach_subscriptions`**
```sql
CREATE TABLE coach_subscriptions (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id              uuid REFERENCES trainers(id) ON DELETE CASCADE NOT NULL,
  subscriber_id           uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id  text NOT NULL UNIQUE,
  stripe_customer_id      text NOT NULL,
  status                  text NOT NULL DEFAULT 'active', -- active | cancelled | past_due
  price_cents             int NOT NULL,
  current_period_end      timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now(),
  UNIQUE(trainer_id, subscriber_id)
);
ALTER TABLE coach_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriber sees own" ON coach_subscriptions FOR SELECT USING (auth.uid() = subscriber_id);
CREATE POLICY "trainer sees their subscribers" ON coach_subscriptions FOR SELECT USING (
  auth.uid() = (SELECT auth_id FROM trainers WHERE id = trainer_id)
);
```

**New table: `videos`**
```sql
CREATE TABLE videos (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id        uuid REFERENCES trainers(id) ON DELETE CASCADE NOT NULL,
  title             text NOT NULL,
  description       text,
  mux_asset_id      text,
  mux_playback_id   text,
  duration_seconds  int,
  thumbnail_url     text,
  is_free           boolean NOT NULL DEFAULT false,
  status            text NOT NULL DEFAULT 'processing', -- processing | ready | errored
  created_at        timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "free videos visible to all" ON videos FOR SELECT USING (is_free = true OR status = 'ready');
```

### 4.3 New pages

**`/{slug}/videos`** — Coach's video library
- Public: shows coach header + free videos playable inline + locked videos as blurred thumbnails with "Subscribe to watch" overlay
- Subscriber: full library, all videos playable
- Subscribe CTA: "Subscribe for [price]/month — access [N] workouts"

**`/dashboard/videos`** — Coach video management
- Grid of uploaded videos (status: processing / ready)
- Upload button → triggers `get-mux-upload-url` → opens Mux UpChunk upload

**`/dashboard/videos/new`** — Upload flow
- Title, description fields
- `is_free` toggle
- File drop zone → direct-to-Mux upload with progress bar

**`/dashboard/subscription`** — Coach sets their subscription price, enables/disables subscription product

### 4.4 New edge functions

**`create-coach-subscription`**
- Auth: JWT required (subscriber)
- Input: `{ trainer_id }`
- Action: creates Stripe Checkout session (mode: subscription) for `trainer.subscription_price_cents`
- Returns: `{ checkout_url }`

**`get-mux-upload-url`**
- Auth: JWT required (trainer only)
- Action: calls Mux API to create a direct upload URL, inserts `videos` record with `status = 'processing'`
- Returns: `{ upload_url, video_id }`

**`mux-webhook`** (`verify_jwt = false`)
- Handles `video.asset.ready`: updates `videos` record with `mux_asset_id`, `mux_playback_id`, `duration_seconds`, `thumbnail_url`, sets `status = 'ready'`
- Handles `video.asset.errored`: sets `status = 'errored'`

**`coach-subscription-webhook`** (`verify_jwt = false`)
- Handles `customer.subscription.created` / `updated` / `deleted`: upserts `coach_subscriptions` record
- Secret: `STRIPE_SUBSCRIPTION_WEBHOOK_SECRET`

**`get-video-token`**
- Auth: JWT required
- Input: `{ video_id }`
- Validates subscriber has active subscription for this trainer
- Returns signed Mux playback token (valid 24h)

### 4.5 New components

- `src/components/video/VideoPlayer.tsx` — Mux player, accepts `playbackId` + optional signed token
- `src/components/video/VideoLibrary.tsx` — grid of video cards, handles locked state
- `src/components/video/VideoCard.tsx` — thumbnail, title, duration, free/locked badge
- `src/components/video/UploadZone.tsx` — drag-and-drop upload with progress, uses Mux UpChunk

---

## 5. Phase 3 — Live Streaming + Live Drops

### 5.1 Live session modes

**Live workout** — coach starts a regular broadcast. All subscribers + active club members can watch. Attending counts as that day's check-in for club members. Session is automatically saved to the video library when the stream ends.

**Live season drop** — coach launches a new season during a live. Price tiers are set upfront. A real-time bar on the live page shows current price tier + spots remaining. Viewers can claim a spot via Stripe modal without leaving the page. Price auto-advances when a tier sells out.

### 5.2 Schema changes

**New table: `live_sessions`**
```sql
CREATE TABLE live_sessions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id        uuid REFERENCES trainers(id) ON DELETE CASCADE NOT NULL,
  club_id           uuid REFERENCES clubs(id), -- nullable; set for season drops
  title             text NOT NULL,
  mux_stream_id     text,
  mux_stream_key    text, -- RTMP key given to coach, never exposed to clients
  mux_playback_id   text,
  mux_asset_id      text, -- set after stream ends and recording is ready
  status            text NOT NULL DEFAULT 'scheduled', -- scheduled | live | ended
  is_season_drop    boolean NOT NULL DEFAULT false,
  drop_tiers        jsonb, -- [{price_cents, total_spots, claimed}]
  starts_at         timestamptz,
  ended_at          timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public can see live sessions" ON live_sessions FOR SELECT USING (true);
```

**New table: `live_attendees`**
```sql
CREATE TABLE live_attendees (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  live_session_id   uuid REFERENCES live_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id           uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  joined_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE(live_session_id, user_id)
);
```

**New table: `live_drop_claims`**
```sql
CREATE TABLE live_drop_claims (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  live_session_id     uuid REFERENCES live_sessions(id) NOT NULL,
  user_id             uuid REFERENCES users(id) NOT NULL,
  stripe_checkout_id  text NOT NULL UNIQUE,
  tier_price_cents    int NOT NULL,
  status              text NOT NULL DEFAULT 'pending', -- pending | completed | expired
  claimed_at          timestamptz NOT NULL DEFAULT now()
);
```

### 5.3 New pages

**`/live/[id]`** — Live watch page
- Mux Live player (HLS, `@mux/mux-player-react`)
- Attendee count (realtime via Supabase channel)
- Drop bar (if `is_season_drop`): current tier price, spots remaining, "Claim spot" button → Stripe modal
- Chat: simple text messages via Supabase Realtime (stored in ephemeral channel, not persisted)
- For club members: "This counts as today's check-in" confirmation shown at join

**`/dashboard/live/new`** — Schedule a live session
- Title, start time, live type (workout / season drop)
- If season drop: set price tiers (up to 4 tiers: spots + price each)
- On save: calls `start-live-session`, shows RTMP URL + stream key to coach

**`/dashboard/live/[id]`** — Coach's broadcast control panel
- Attendee count, drop claim count, current tier
- "End stream" button
- Chat visible

### 5.4 New edge functions

**`start-live-session`**
- Auth: JWT (trainer only)
- Input: `{ title, club_id?, is_season_drop, drop_tiers?, starts_at }`
- Action: calls Mux API to create a live stream → inserts `live_sessions` record → returns RTMP stream key + playback ID
- Note: stream key is stored encrypted server-side, returned once to coach, never re-exposed

**`end-live-session`**
- Auth: JWT (trainer only)
- Input: `{ live_session_id }`
- Action: calls Mux API to disable live stream → updates status to `ended` → Mux will fire `video.asset.ready` webhook when recording is ready → `mux-webhook` creates a `videos` record automatically

**`claim-live-drop-spot`**
- Auth: JWT required
- Input: `{ live_session_id }`
- Validates: session is live + is_season_drop + spots available in current tier
- Atomically decrements current tier `claimed` count (uses Postgres transaction to prevent overselling)
- Creates Stripe Checkout session (payment_intent mode, not subscription)
- Returns: `{ checkout_url }`

**`live-drop-webhook`** (`verify_jwt = false`)
- Handles `checkout.session.completed`
- Creates `club_members` record for the claimed season
- Updates `live_drop_claims.status = 'completed'`
- Broadcasts updated tier state via Supabase Realtime so all viewers see spots decrement in real-time
- Secret: `STRIPE_LIVE_DROP_WEBHOOK_SECRET`

**`join-live-session`**
- Auth: JWT required
- Input: `{ live_session_id }`
- Validates: subscriber or club member (followers get paywall)
- Upserts `live_attendees` record
- If user is active club member: creates check-in for today (same logic as `submit-checkin`)
- Returns: `{ playback_id, token }` (signed Mux token for authenticated playback)

**`mux-live-webhook`** (`verify_jwt = false`)
- Handles `video.live_stream.active`: updates `live_sessions.status = 'live'`, sends push notification to all followers + subscribers
- Handles `video.live_stream.idle`: updates status back to `scheduled` (stream went quiet but not ended)
- Secret: `MUX_WEBHOOK_SECRET`

### 5.5 New components

- `src/components/live/LivePlayer.tsx` — Mux player for live HLS stream
- `src/components/live/LiveDropBar.tsx` — real-time tier price + spots remaining, "Claim" button
- `src/components/live/AttendeeCount.tsx` — live attendee counter via Supabase Realtime
- `src/components/live/LiveChat.tsx` — ephemeral chat via Supabase Realtime channel

### 5.6 Push notifications

When `mux-live-webhook` receives `video.live_stream.active`:
1. Query all followers + subscribers for that trainer who have an email address
2. Send transactional email via Resend (same infrastructure as `club-daily-nudge`)
3. Subject: "[Coach name] is live now" · Body: session title + link to `/live/[id]`

If `is_season_drop = true`: "[Coach name] is dropping Season [N] — [X] spots at founding price"

---

## 6. Design Constraints

- **Existing design system stays** — dark theme, purple accent, orange brand, Manrope font
- **No fake numbers** — follower counts, attendee counts, and spot availability are all live from the database
- **80/20 split throughout** — subscriptions, season joins, live drop claims all use the same revenue share
- **Mux is the only video infrastructure** — no YouTube embeds, no Supabase Storage for video (too slow, no adaptive bitrate)
- **Stripe for all payments** — subscriptions via Stripe Billing, season joins and live drop claims via Stripe Checkout

---

## 7. Build Order

### Phase 1 (ship first — unblocks everything)
`club_followers` schema → `follow-club` edge function → `ClubPublicView` component → season number on clubs → "Start Season 2" coach flow → `SeasonBadge` component → alumni state on club page

### Phase 2 (video library — retention layer)
Mux account setup → `videos` schema → `coach_subscriptions` schema → `get-mux-upload-url` → `mux-webhook` → `VideoPlayer` component → `/[slug]/videos` page → `/dashboard/videos` → `create-coach-subscription` → `coach-subscription-webhook` → `get-video-token`

### Phase 3 (live — Whatnot energy)
`live_sessions` schema → `start-live-session` → `end-live-session` → `join-live-session` → `LivePlayer` component → `/live/[id]` page → `LiveDropBar` component → `claim-live-drop-spot` → `live-drop-webhook` → `mux-live-webhook` → push notifications

---

## 8. Success Criteria

- A stranger landing on a club page understands the activity is real and wants to be part of it within 10 seconds
- A subscriber stays subscribed between seasons because the video library gives them daily value
- A coach can launch a new season live in under 5 minutes and have paying members before the stream ends
- Spot claims during a live drop never oversell (atomic DB transaction prevents race condition)
- All video playback is authenticated — non-subscribers cannot access gated content via direct URL
