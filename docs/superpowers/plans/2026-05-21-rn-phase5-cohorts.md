# Phase 5 Cohorts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a member claims a season drop spot and Stripe confirms payment, they are instantly placed into a private coaching cohort with persistent group chat and a body doubling room (optional trainer HLS stream + presence avatars).

**Architecture:** Four new Supabase tables (`cohorts`, `cohort_members`, `cohort_rooms`, `cohort_messages`) backed by four new edge functions. The existing `stripe-webhook` is modified to detect drop claim payments. The React Native app gains two new screens (`app/cohort/[id].tsx`, `app/cohort/room/[id].tsx`) and modifications to the watch screen and profile tab.

**Tech Stack:** Expo SDK 54, Expo Router v3, TypeScript, Supabase (PostgreSQL + Realtime broadcast), Deno edge functions, Mux HLS (expo-video already installed), React Native Animated

---

## File Map

**Backend — new/modified:**
- Create: `supabase/migrations/20260521_phase5_cohorts.sql`
- Create: `supabase/functions/confirm-cohort-claim/index.ts`
- Create: `supabase/functions/open-cohort-room/index.ts`
- Create: `supabase/functions/close-cohort-room/index.ts`
- Create: `supabase/functions/join-cohort-room/index.ts`
- Modify: `supabase/functions/stripe-webhook/index.ts` (add drop claim branch)

**React Native — new/modified:**
- Create: `trainedby-app/app/cohort/[id].tsx`
- Create: `trainedby-app/app/cohort/room/[id].tsx`
- Modify: `trainedby-app/app/live/[id].tsx` (add cohort welcome card)
- Modify: `trainedby-app/app/(tabs)/profile.tsx` (add My Cohorts section)

---

## Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/20260521_phase5_cohorts.sql`

Context: All schema changes go through migration files. The `trainers` table already exists. `live_sessions` and `live_drop_claims` already exist from Phase 4. Run this against the Supabase project `mezhtdbfyvkshpuplqqw`.

- [ ] **Step 1: Create the migration file**

```sql
-- supabase/migrations/20260521_phase5_cohorts.sql

-- cohorts: one per live_session drop (upserted on conflict)
CREATE TABLE IF NOT EXISTS cohorts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id      uuid REFERENCES trainers(id) ON DELETE CASCADE NOT NULL,
  live_session_id uuid REFERENCES live_sessions(id) ON DELETE CASCADE NOT NULL UNIQUE,
  title           text NOT NULL,
  starts_at       timestamptz NOT NULL DEFAULT now(),
  ends_at         timestamptz NOT NULL,
  status          text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS cohorts_trainer_idx ON cohorts(trainer_id);
CREATE INDEX IF NOT EXISTS cohorts_status_idx ON cohorts(status);

ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cohorts' AND policyname = 'cohorts_select_member') THEN
    CREATE POLICY "cohorts_select_member" ON cohorts FOR SELECT
      USING (
        EXISTS (SELECT 1 FROM cohort_members WHERE cohort_members.cohort_id = cohorts.id AND cohort_members.user_id = auth.uid())
        OR trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid())
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cohorts' AND policyname = 'service role full access to cohorts') THEN
    CREATE POLICY "service role full access to cohorts" ON cohorts FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- cohort_members: one row per member per cohort
CREATE TABLE IF NOT EXISTS cohort_members (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id  uuid REFERENCES cohorts(id) ON DELETE CASCADE NOT NULL,
  user_id    uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  joined_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(cohort_id, user_id)
);
CREATE INDEX IF NOT EXISTS cohort_members_cohort_idx ON cohort_members(cohort_id);
CREATE INDEX IF NOT EXISTS cohort_members_user_idx ON cohort_members(user_id);

ALTER TABLE cohort_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cohort_members' AND policyname = 'cohort_members_select_own') THEN
    CREATE POLICY "cohort_members_select_own" ON cohort_members FOR SELECT
      USING (user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM cohorts WHERE cohorts.id = cohort_members.cohort_id AND cohorts.trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid()))
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cohort_members' AND policyname = 'service role full access to cohort_members') THEN
    CREATE POLICY "service role full access to cohort_members" ON cohort_members FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- cohort_rooms: one active room at a time per cohort
CREATE TABLE IF NOT EXISTS cohort_rooms (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id       uuid REFERENCES cohorts(id) ON DELETE CASCADE NOT NULL,
  mux_playback_id text,
  status          text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  opened_at       timestamptz NOT NULL DEFAULT now(),
  closed_at       timestamptz
);
CREATE INDEX IF NOT EXISTS cohort_rooms_cohort_idx ON cohort_rooms(cohort_id);
CREATE INDEX IF NOT EXISTS cohort_rooms_status_idx ON cohort_rooms(status);

ALTER TABLE cohort_rooms ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cohort_rooms' AND policyname = 'cohort_rooms_select_member') THEN
    CREATE POLICY "cohort_rooms_select_member" ON cohort_rooms FOR SELECT
      USING (
        EXISTS (SELECT 1 FROM cohort_members WHERE cohort_members.cohort_id = cohort_rooms.cohort_id AND cohort_members.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM cohorts JOIN trainers ON cohorts.trainer_id = trainers.id WHERE cohorts.id = cohort_rooms.cohort_id AND trainers.user_id = auth.uid())
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cohort_rooms' AND policyname = 'service role full access to cohort_rooms') THEN
    CREATE POLICY "service role full access to cohort_rooms" ON cohort_rooms FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- cohort_messages: persistent chat (unlike ephemeral live chat)
CREATE TABLE IF NOT EXISTS cohort_messages (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id    uuid REFERENCES cohorts(id) ON DELETE CASCADE NOT NULL,
  user_id      uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  display_name text NOT NULL,
  text         text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS cohort_messages_cohort_idx ON cohort_messages(cohort_id);
CREATE INDEX IF NOT EXISTS cohort_messages_created_idx ON cohort_messages(cohort_id, created_at DESC);

ALTER TABLE cohort_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cohort_messages' AND policyname = 'cohort_messages_select_member') THEN
    CREATE POLICY "cohort_messages_select_member" ON cohort_messages FOR SELECT
      USING (
        EXISTS (SELECT 1 FROM cohort_members WHERE cohort_members.cohort_id = cohort_messages.cohort_id AND cohort_members.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM cohorts JOIN trainers ON cohorts.trainer_id = trainers.id WHERE cohorts.id = cohort_messages.cohort_id AND trainers.user_id = auth.uid())
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cohort_messages' AND policyname = 'cohort_messages_insert_member') THEN
    CREATE POLICY "cohort_messages_insert_member" ON cohort_messages FOR INSERT
      WITH CHECK (
        user_id = auth.uid() AND (
          EXISTS (SELECT 1 FROM cohort_members WHERE cohort_members.cohort_id = cohort_messages.cohort_id AND cohort_members.user_id = auth.uid())
          OR EXISTS (SELECT 1 FROM cohorts JOIN trainers ON cohorts.trainer_id = trainers.id WHERE cohorts.id = cohort_messages.cohort_id AND trainers.user_id = auth.uid())
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cohort_messages' AND policyname = 'service role full access to cohort_messages') THEN
    CREATE POLICY "service role full access to cohort_messages" ON cohort_messages FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- pg_cron: mark cohorts as completed daily when ends_at has passed
SELECT cron.schedule(
  'complete-expired-cohorts',
  '0 3 * * *',
  $$UPDATE cohorts SET status = 'completed' WHERE ends_at < now() AND status = 'active'$$
);
```

- [ ] **Step 2: Apply the migration**

```bash
cd /Users/bobanpepic/trainedby
supabase db push --linked
```

Expected: migration runs without error.

- [ ] **Step 3: Verify tables exist**

```bash
supabase db execute --linked --sql "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('cohorts','cohort_members','cohort_rooms','cohort_messages') ORDER BY table_name;"
```

Expected output: 4 rows — `cohort_members`, `cohort_messages`, `cohort_rooms`, `cohorts`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260521_phase5_cohorts.sql
git commit -m "feat: phase 5 cohorts — db migration (cohorts, members, rooms, messages tables)"
```

---

## Task 2: `confirm-cohort-claim` Edge Function

**Files:**
- Create: `supabase/functions/confirm-cohort-claim/index.ts`

Context: This function is called internally by the Stripe webhook (Task 3) — not directly by the app. It creates/upserts a cohort, adds the member, and broadcasts `cohort_confirmed` on the Realtime channel `cohort-room:{live_session_id}` so the watch screen can show the welcome card. Uses `Deno.serve` pattern (newer style). Uses `CORS_HEADERS`-style inline (not importing from `_shared/errors.ts` because this is an internal function called server-side, not from the app).

Broadcast uses the Supabase Realtime REST API — the only reliable way to fire-and-forget from a short-lived edge function:
```
POST https://{SUPABASE_URL}/realtime/v1/broadcast
Authorization: Bearer {SERVICE_ROLE_KEY}
apikey: {ANON_KEY}
Content-Type: application/json
{ "messages": [{ "topic": "realtime:cohort-room:{id}", "event": "cohort_confirmed", "payload": {...}, "private": false }] }
```

- [ ] **Step 1: Create the function**

```typescript
// supabase/functions/confirm-cohort-claim/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createLogger } from "../_shared/logger.ts";

const logger = createLogger("confirm-cohort-claim");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  let body: {
    live_session_id: string;
    user_id: string;
    tier_price_cents: number;
    stripe_checkout_id: string;
  };

  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { live_session_id, user_id, tier_price_cents, stripe_checkout_id } = body;
  if (!live_session_id || !user_id || !stripe_checkout_id) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

  const sb = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    // 1. Update drop claim to paid
    await sb
      .from("live_drop_claims")
      .update({ status: "paid" })
      .eq("stripe_checkout_id", stripe_checkout_id);

    // 2. Fetch session for title + trainer_id
    const { data: session, error: sessionErr } = await sb
      .from("live_sessions")
      .select("id, title, trainer_id, trainers(name)")
      .eq("id", live_session_id)
      .single();

    if (sessionErr || !session) {
      logger.error("Session not found", { live_session_id });
      return new Response(JSON.stringify({ error: "session_not_found" }), { status: 404 });
    }

    const trainerName = (session.trainers as { name: string } | null)?.name ?? "Your trainer";

    // 3. Upsert cohort (one cohort per live_session_id)
    const endsAt = new Date(Date.now() + 8 * 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: cohort, error: cohortErr } = await sb
      .from("cohorts")
      .upsert(
        {
          trainer_id: session.trainer_id,
          live_session_id,
          title: session.title,
          ends_at: endsAt,
          status: "active",
        },
        { onConflict: "live_session_id" }
      )
      .select()
      .single();

    if (cohortErr || !cohort) {
      logger.error("Failed to upsert cohort", { error: cohortErr?.message });
      return new Response(JSON.stringify({ error: "cohort_create_failed" }), { status: 500 });
    }

    // 4. Insert cohort_member (ignore if already exists)
    await sb
      .from("cohort_members")
      .upsert({ cohort_id: cohort.id, user_id }, { onConflict: "cohort_id,user_id", ignoreDuplicates: true });

    // 5. Broadcast cohort_confirmed on cohort-room:{live_session_id}
    await fetch(`${SUPABASE_URL}/realtime/v1/broadcast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": ANON_KEY,
        "Authorization": `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          {
            topic: `realtime:cohort-room:${live_session_id}`,
            event: "cohort_confirmed",
            payload: {
              cohort_id: cohort.id,
              title: cohort.title,
              trainer_name: trainerName,
              starts_at: cohort.starts_at,
              ends_at: cohort.ends_at,
            },
            private: false,
          },
        ],
      }),
    });

    logger.info("Cohort confirmed", { cohort_id: cohort.id, user_id });
    return new Response(JSON.stringify({ ok: true, cohort_id: cohort.id }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    logger.error("confirm-cohort-claim error", { error: String(err) });
    return new Response(JSON.stringify({ error: "internal_error" }), { status: 500 });
  }
});
```

- [ ] **Step 2: Deploy the function**

```bash
cd /Users/bobanpepic/trainedby
SUPABASE_ACCESS_TOKEN=$(cat ~/.supabase-token) ./scripts/deploy_functions.sh confirm-cohort-claim
```

Expected: Deployed successfully.

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/confirm-cohort-claim/
git commit -m "feat: confirm-cohort-claim edge function — upserts cohort, adds member, broadcasts cohort_confirmed"
```

---

## Task 3: Modify `stripe-webhook` to Handle Drop Claims

**Files:**
- Modify: `supabase/functions/stripe-webhook/index.ts`

Context: The existing `checkout.session.completed` handler checks for `metadata.trainer_id && metadata.plan` (trainer subscription). The `claim-live-drop-spot` function already stores `metadata.live_session_id`, `metadata.user_id`, and `metadata.tier_price_cents` in the Stripe checkout session. We need to add a branch that calls `confirm-cohort-claim` when these are present.

The modification goes inside the `case "checkout.session.completed":` block, after the existing trainer subscription logic. Add an `else if` branch — don't modify the existing trainer logic.

- [ ] **Step 1: Open the file and locate the insertion point**

File: `supabase/functions/stripe-webhook/index.ts`

Find this block (around line 55):
```typescript
case "checkout.session.completed": {
  const session = event.data.object as Stripe.Checkout.Session;
  const trainer_id = session.metadata?.trainer_id;
  const plan = session.metadata?.plan;
  if (trainer_id && plan && session.subscription) {
    // ... existing trainer subscription logic ...
  }
  break;
}
```

- [ ] **Step 2: Add the drop claim branch**

After the closing brace of the `if (trainer_id && plan && session.subscription)` block and before the `break`, add:

```typescript
} else if (session.metadata?.live_session_id && session.metadata?.user_id) {
  const live_session_id = session.metadata.live_session_id;
  const claim_user_id = session.metadata.user_id;
  const tier_price_cents = parseInt(session.metadata.tier_price_cents ?? "0", 10);
  const stripe_checkout_id = session.id;

  const SELF_BASE = `${Deno.env.get("SUPABASE_URL")}/functions/v1`;
  const svcKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  await fetch(`${SELF_BASE}/confirm-cohort-claim`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${svcKey}`,
    },
    body: JSON.stringify({
      live_session_id,
      user_id: claim_user_id,
      tier_price_cents,
      stripe_checkout_id,
    }),
  }).catch((e) => logger.error("confirm-cohort-claim call failed", { error: String(e) }));
}
```

- [ ] **Step 3: Deploy the updated webhook**

```bash
cd /Users/bobanpepic/trainedby
SUPABASE_ACCESS_TOKEN=$(cat ~/.supabase-token) ./scripts/deploy_functions.sh stripe-webhook
```

Expected: Deployed successfully.

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/stripe-webhook/index.ts
git commit -m "feat: stripe-webhook — detect drop claim payments and call confirm-cohort-claim"
```

---

## Task 4: `open-cohort-room` and `close-cohort-room` Edge Functions

**Files:**
- Create: `supabase/functions/open-cohort-room/index.ts`
- Create: `supabase/functions/close-cohort-room/index.ts`

Context: Called from the web dashboard by the trainer. `open-cohort-room` creates a `cohort_rooms` row and broadcasts `room_opened` on `cohort-room:{cohort_id}`. `close-cohort-room` closes the room and broadcasts `room_closed`. Both verify the caller is the trainer of that cohort.

- [ ] **Step 1: Create `open-cohort-room`**

```typescript
// supabase/functions/open-cohort-room/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createLogger } from "../_shared/logger.ts";

const logger = createLogger("open-cohort-room");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const sb = createClient(SUPABASE_URL, SERVICE_KEY);
  const sbAnon = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!);

  const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: { user }, error: authErr } = await sbAnon.auth.getUser(jwt);
  if (authErr || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...CORS, "Content-Type": "application/json" } });
  }

  let body: { cohort_id: string; mux_playback_id?: string };
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });
  }

  const { cohort_id, mux_playback_id } = body;
  if (!cohort_id) {
    return new Response(JSON.stringify({ error: "cohort_id required" }), { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });
  }

  // Verify caller is the trainer of this cohort
  const { data: cohort } = await sb
    .from("cohorts")
    .select("id, title, trainer_id, trainers(user_id)")
    .eq("id", cohort_id)
    .single();

  if (!cohort || (cohort.trainers as { user_id: string }).user_id !== user.id) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...CORS, "Content-Type": "application/json" } });
  }

  // Close any previously open room for this cohort
  await sb
    .from("cohort_rooms")
    .update({ status: "closed", closed_at: new Date().toISOString() })
    .eq("cohort_id", cohort_id)
    .eq("status", "open");

  // Create new room
  const { data: room, error: roomErr } = await sb
    .from("cohort_rooms")
    .insert({ cohort_id, mux_playback_id: mux_playback_id ?? null, status: "open" })
    .select()
    .single();

  if (roomErr || !room) {
    logger.error("Failed to create room", { error: roomErr?.message });
    return new Response(JSON.stringify({ error: "room_create_failed" }), { status: 500, headers: { ...CORS, "Content-Type": "application/json" } });
  }

  // Fetch member count
  const { count } = await sb
    .from("cohort_members")
    .select("*", { count: "exact", head: true })
    .eq("cohort_id", cohort_id);

  // Broadcast room_opened
  await fetch(`${SUPABASE_URL}/realtime/v1/broadcast`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": ANON_KEY,
      "Authorization": `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({
      messages: [{
        topic: `realtime:cohort-room:${cohort_id}`,
        event: "room_opened",
        payload: {
          room_id: room.id,
          cohort_id,
          mux_playback_id: room.mux_playback_id,
          member_count: count ?? 0,
        },
        private: false,
      }],
    }),
  });

  return new Response(JSON.stringify({ ok: true, room_id: room.id }), {
    headers: { ...CORS, "Content-Type": "application/json" },
  });
});
```

- [ ] **Step 2: Create `close-cohort-room`**

```typescript
// supabase/functions/close-cohort-room/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createLogger } from "../_shared/logger.ts";

const logger = createLogger("close-cohort-room");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const sb = createClient(SUPABASE_URL, SERVICE_KEY);
  const sbAnon = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!);

  const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: { user }, error: authErr } = await sbAnon.auth.getUser(jwt);
  if (authErr || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...CORS, "Content-Type": "application/json" } });
  }

  let body: { cohort_id: string };
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });
  }

  if (!body.cohort_id) {
    return new Response(JSON.stringify({ error: "cohort_id required" }), { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });
  }

  // Verify caller is the trainer
  const { data: cohort } = await sb
    .from("cohorts")
    .select("id, trainer_id, trainers(user_id)")
    .eq("id", body.cohort_id)
    .single();

  if (!cohort || (cohort.trainers as { user_id: string }).user_id !== user.id) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...CORS, "Content-Type": "application/json" } });
  }

  await sb
    .from("cohort_rooms")
    .update({ status: "closed", closed_at: new Date().toISOString() })
    .eq("cohort_id", body.cohort_id)
    .eq("status", "open");

  await fetch(`${SUPABASE_URL}/realtime/v1/broadcast`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": ANON_KEY,
      "Authorization": `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({
      messages: [{
        topic: `realtime:cohort-room:${body.cohort_id}`,
        event: "room_closed",
        payload: { cohort_id: body.cohort_id },
        private: false,
      }],
    }),
  });

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...CORS, "Content-Type": "application/json" },
  });
});
```

- [ ] **Step 3: Deploy both functions**

```bash
cd /Users/bobanpepic/trainedby
SUPABASE_ACCESS_TOKEN=$(cat ~/.supabase-token) ./scripts/deploy_functions.sh open-cohort-room
SUPABASE_ACCESS_TOKEN=$(cat ~/.supabase-token) ./scripts/deploy_functions.sh close-cohort-room
```

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/open-cohort-room/ supabase/functions/close-cohort-room/
git commit -m "feat: open-cohort-room and close-cohort-room edge functions"
```

---

## Task 5: `join-cohort-room` Edge Function

**Files:**
- Create: `supabase/functions/join-cohort-room/index.ts`

Context: Called by the RN app when a member taps "Join" on the room status bar. Verifies the caller is a cohort member, returns the signed Mux playback token if trainer is streaming, or null if no stream. Also returns `cohort_id` and `member_count` for the presence display.

Mux JWT signing: reuse the same pattern as `join-live-session` — `SignJWT` from `jose`, signed with `MUX_SIGNING_KEY_ID` + `MUX_SIGNING_PRIVATE_KEY`.

- [ ] **Step 1: Create the function**

```typescript
// supabase/functions/join-cohort-room/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SignJWT, importPKCS8 } from "https://deno.land/x/jose@v4.14.4/index.ts";
import { createLogger } from "../_shared/logger.ts";

const logger = createLogger("join-cohort-room");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function signMuxToken(playbackId: string): Promise<string> {
  const keyId = Deno.env.get("MUX_SIGNING_KEY_ID");
  const privKeyB64 = Deno.env.get("MUX_SIGNING_PRIVATE_KEY");
  if (!keyId || !privKeyB64) throw new Error("MUX signing keys not configured");
  const pem = atob(privKeyB64);
  const key = await importPKCS8(pem, "RS256");
  return await new SignJWT({})
    .setProtectedHeader({ alg: "RS256", kid: keyId })
    .setSubject(playbackId)
    .setAudience("v")
    .setExpirationTime("4h")
    .sign(key);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sb = createClient(SUPABASE_URL, SERVICE_KEY);
  const sbAnon = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!);

  const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: { user }, error: authErr } = await sbAnon.auth.getUser(jwt);
  if (authErr || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...CORS, "Content-Type": "application/json" } });
  }

  let body: { room_id: string };
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });
  }
  if (!body.room_id) {
    return new Response(JSON.stringify({ error: "room_id required" }), { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });
  }

  // Fetch room + cohort
  const { data: room } = await sb
    .from("cohort_rooms")
    .select("id, cohort_id, mux_playback_id, status")
    .eq("id", body.room_id)
    .single();

  if (!room || room.status !== "open") {
    return new Response(JSON.stringify({ error: "room_not_open" }), { status: 404, headers: { ...CORS, "Content-Type": "application/json" } });
  }

  // Verify caller is a member of this cohort
  const { data: membership } = await sb
    .from("cohort_members")
    .select("id")
    .eq("cohort_id", room.cohort_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    return new Response(JSON.stringify({ error: "not_a_member" }), { status: 403, headers: { ...CORS, "Content-Type": "application/json" } });
  }

  // Fetch member count
  const { count } = await sb
    .from("cohort_members")
    .select("*", { count: "exact", head: true })
    .eq("cohort_id", room.cohort_id);

  // Sign Mux token if trainer is streaming
  let playback_token: string | null = null;
  if (room.mux_playback_id) {
    try {
      playback_token = await signMuxToken(room.mux_playback_id);
    } catch (e) {
      logger.error("Mux signing failed", { error: String(e) });
    }
  }

  return new Response(
    JSON.stringify({
      ok: true,
      room_id: room.id,
      cohort_id: room.cohort_id,
      mux_playback_id: room.mux_playback_id,
      playback_token,
      member_count: count ?? 0,
    }),
    { headers: { ...CORS, "Content-Type": "application/json" } }
  );
});
```

- [ ] **Step 2: Deploy**

```bash
cd /Users/bobanpepic/trainedby
SUPABASE_ACCESS_TOKEN=$(cat ~/.supabase-token) ./scripts/deploy_functions.sh join-cohort-room
```

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/join-cohort-room/
git commit -m "feat: join-cohort-room edge function — verifies membership, returns Mux token if streaming"
```

---

## Task 6: Watch Screen — Cohort Welcome Card

**Files:**
- Modify: `trainedby-app/app/live/[id].tsx`

Context: After the member's drop claim payment completes, the Stripe webhook fires `confirm-cohort-claim` which broadcasts `cohort_confirmed` on channel `cohort-room:{live_session_id}`. The watch screen must subscribe to this channel and show a welcome card that slides up when the event arrives. The welcome card replaces the drop bar area (not an overlay — it slides up from the bottom of the screen). The existing `dropChannelRef` already uses `drops:{id}` — the cohort channel is a separate subscription on `cohort-room:{id}`.

The welcome card state:
```ts
type CohortWelcome = {
  cohort_id: string;
  title: string;
  trainer_name: string;
  starts_at: string;
};
```

Welcome card animation: same `Animated.Value` pattern as the drop bar — `translateY` from 300 → 0 over 400ms. No dismiss button — member taps the CTA to navigate.

- [ ] **Step 1: Add cohort welcome state and channel**

In `trainedby-app/app/live/[id].tsx`, add after the existing `dropChannelRef` declaration (around line 48):

```typescript
const [cohortWelcome, setCohortWelcome] = useState<{
  cohort_id: string;
  title: string;
  trainer_name: string;
  starts_at: string;
} | null>(null);
const cohortAnimValue = useRef(new Animated.Value(0)).current;
const cohortChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
```

- [ ] **Step 2: Add cohort Realtime subscription**

Add a new `useEffect` after the drops Realtime effect (after line 152):

```typescript
// Cohort confirmed Realtime
useEffect(() => {
  if (!id) return;

  const channel = supabase
    .channel(`cohort-room:${id}`)
    .on('broadcast', { event: 'cohort_confirmed' }, ({ payload }) => {
      setCohortWelcome({
        cohort_id: payload.cohort_id,
        title: payload.title,
        trainer_name: payload.trainer_name,
        starts_at: payload.starts_at,
      });
      Animated.timing(cohortAnimValue, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    })
    .subscribe();

  cohortChannelRef.current = channel;
  return () => { channel.unsubscribe(); };
}, [id]);
```

- [ ] **Step 3: Add welcome card JSX**

In the main return JSX, after `</KeyboardAvoidingView>` closing tag and after `<LiveDropBar ... />`, add the cohort welcome card as a sibling (wrap both in a `<View style={{ flex: 1 }}>` if needed, but simpler: add as absolute overlay at the bottom):

```typescript
{cohortWelcome && (
  <Animated.View
    style={[
      styles.cohortWelcomeCard,
      {
        transform: [{
          translateY: cohortAnimValue.interpolate({
            inputRange: [0, 1],
            outputRange: [300, 0],
          }),
        }],
      },
    ]}
  >
    <Text style={styles.cohortWelcomeEmoji}>🎉</Text>
    <Text style={styles.cohortWelcomeTitle}>You're in!</Text>
    <Text style={styles.cohortWelcomeSub}>{cohortWelcome.title}</Text>
    <View style={styles.cohortWelcomeTrainer}>
      <Text style={styles.cohortWelcomeTrainerName}>{cohortWelcome.trainer_name}</Text>
      <Text style={styles.cohortWelcomeDate}>
        First session: {new Date(cohortWelcome.starts_at).toLocaleDateString('en-GB', {
          weekday: 'short', day: 'numeric', month: 'short',
        })}
      </Text>
    </View>
    <Pressable
      style={styles.cohortWelcomeBtn}
      onPress={() => {
        // @ts-expect-error cohort route not typed yet
        router.push(`/cohort/${cohortWelcome.cohort_id}`);
      }}
    >
      <Text style={styles.cohortWelcomeBtnText}>Open your cohort →</Text>
    </Pressable>
  </Animated.View>
)}
```

- [ ] **Step 4: Add styles**

In the `StyleSheet.create({})` block, add:

```typescript
cohortWelcomeCard: {
  position: 'absolute',
  bottom: 0, left: 0, right: 0,
  backgroundColor: '#1C1714',
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  padding: 24,
  alignItems: 'center',
  borderTopWidth: 1,
  borderTopColor: 'rgba(255,92,0,0.3)',
},
cohortWelcomeEmoji: { fontSize: 36, marginBottom: 8 },
cohortWelcomeTitle: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 4 },
cohortWelcomeSub: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 16, textAlign: 'center' },
cohortWelcomeTrainer: {
  width: '100%', backgroundColor: 'rgba(255,255,255,0.05)',
  borderRadius: 12, padding: 14, marginBottom: 16,
},
cohortWelcomeTrainerName: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 4 },
cohortWelcomeDate: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
cohortWelcomeBtn: {
  width: '100%', backgroundColor: '#FF5C00',
  borderRadius: 14, padding: 16, alignItems: 'center',
},
cohortWelcomeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
```

- [ ] **Step 5: Add cohort channel to cleanup**

In the existing cleanup `useEffect` (around line 155), add `cohortChannelRef.current?.unsubscribe()`:

```typescript
useEffect(() => {
  return () => {
    player.pause();
    cohortChannelRef.current?.unsubscribe();
  };
}, [player]);
```

- [ ] **Step 6: Manual test**

Run the app: `cd trainedby-app && npx expo start`

Simulate the welcome card by temporarily adding to the join `useEffect` (after the existing `setMeta` call):
```typescript
// TEMP: simulate cohort welcome — remove before commit
setCohortWelcome({ cohort_id: 'test', title: '8-Week Strength Build', trainer_name: 'Ahmed', starts_at: new Date().toISOString() });
Animated.timing(cohortAnimValue, { toValue: 1, duration: 400, useNativeDriver: true }).start();
```

Verify: welcome card slides up from bottom after join. "Open your cohort →" button press attempts navigation. Remove the temporary code.

- [ ] **Step 7: Commit**

```bash
cd /Users/bobanpepic/trainedby-app
git add app/live/[id].tsx
git commit -m "feat: watch screen — cohort welcome card slides up on drop claim confirmed"
```

---

## Task 7: Profile Tab — My Cohorts Section

**Files:**
- Modify: `trainedby-app/app/(tabs)/profile.tsx`

Context: Profile tab currently shows a centered view with email, coach badge, and sign-out. Add a "My Cohorts" section at the top (if the user has active cohorts). Each cohort shows a card with title, trainer, week, and a green "Room open" indicator if there's an active room. Subscribe to `cohort-room:{cohortId}` for each cohort to receive `room_opened` and `room_closed` events.

- [ ] **Step 1: Rewrite profile.tsx**

Replace the entire file with:

```typescript
// app/(tabs)/profile.tsx
import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
  ScrollView, Pressable,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/auth';

type CohortSummary = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  trainer_name: string;
  member_count: number;
  has_open_room: boolean;
  open_room_id: string | null;
};

export default function ProfileScreen() {
  const { session, isCoach, signOut } = useAuth();
  const router = useRouter();

  const [cohorts, setCohorts] = useState<CohortSummary[]>([]);
  const [roomStatus, setRoomStatus] = useState<Record<string, boolean>>({});
  const channelRefs = useRef<ReturnType<typeof supabase.channel>[]>([]);

  async function loadCohorts() {
    if (!session?.user) return;

    const { data } = await supabase
      .from('cohort_members')
      .select(`
        cohort_id,
        cohorts (
          id, title, starts_at, ends_at, status,
          trainers ( name ),
          cohort_members ( count ),
          cohort_rooms ( id, status )
        )
      `)
      .eq('user_id', session.user.id);

    if (!data) return;

    const active = data
      .map((row: any) => {
        const c = row.cohorts;
        if (!c || c.status !== 'active') return null;
        const openRoom = (c.cohort_rooms as any[]).find((r: any) => r.status === 'open');
        return {
          id: c.id,
          title: c.title,
          starts_at: c.starts_at,
          ends_at: c.ends_at,
          trainer_name: c.trainers?.name ?? 'Trainer',
          member_count: (c.cohort_members?.[0] as any)?.count ?? 0,
          has_open_room: !!openRoom,
          open_room_id: openRoom?.id ?? null,
        } as CohortSummary;
      })
      .filter(Boolean) as CohortSummary[];

    setCohorts(active);

    // Unsubscribe existing channels
    channelRefs.current.forEach(ch => ch.unsubscribe());
    channelRefs.current = [];

    // Subscribe to room events for each active cohort
    active.forEach(cohort => {
      const ch = supabase
        .channel(`cohort-room:${cohort.id}`)
        .on('broadcast', { event: 'room_opened' }, ({ payload }) => {
          setRoomStatus(prev => ({ ...prev, [cohort.id]: true }));
        })
        .on('broadcast', { event: 'room_closed' }, () => {
          setRoomStatus(prev => ({ ...prev, [cohort.id]: false }));
        })
        .subscribe();
      channelRefs.current.push(ch);
    });
  }

  useFocusEffect(
    useCallback(() => {
      loadCohorts();
      return () => {
        channelRefs.current.forEach(ch => ch.unsubscribe());
        channelRefs.current = [];
      };
    }, [session])
  );

  function weekNumber(starts_at: string): number {
    return Math.max(1, Math.ceil((Date.now() - new Date(starts_at).getTime()) / (7 * 24 * 60 * 60 * 1000)));
  }

  function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {cohorts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Cohorts</Text>
          {cohorts.map(cohort => {
            const isRoomOpen = roomStatus[cohort.id] ?? cohort.has_open_room;
            return (
              <Pressable
                key={cohort.id}
                // @ts-expect-error cohort route not typed yet
                onPress={() => router.push(`/cohort/${cohort.id}`)}
                style={[styles.cohortCard, isRoomOpen && styles.cohortCardActive]}
              >
                <View style={styles.cohortCardLeft}>
                  {isRoomOpen && (
                    <View style={styles.roomBadge}>
                      <View style={styles.roomDot} />
                      <Text style={styles.roomBadgeText}>Room open</Text>
                    </View>
                  )}
                  <Text style={styles.cohortTitle}>{cohort.title}</Text>
                  <Text style={styles.cohortMeta}>{cohort.trainer_name}</Text>
                  <Text style={styles.cohortMeta}>
                    Week {weekNumber(cohort.starts_at)} · {cohort.member_count} members
                  </Text>
                </View>
                <Text style={styles.cohortArrow}>›</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <Text style={styles.title}>Profile</Text>
      <Text style={styles.email}>{session?.user?.email}</Text>
      {isCoach && <Text style={styles.badge}>Coach account</Text>}
      <TouchableOpacity style={styles.btn} onPress={handleSignOut}>
        <Text style={styles.btnText}>Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0B0A' },
  content: { padding: 24, paddingTop: 60 },
  section: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12,
  },
  cohortCard: {
    backgroundColor: '#1C1714',
    borderRadius: 16, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    flexDirection: 'row', alignItems: 'center',
    borderLeftWidth: 3, borderLeftColor: 'rgba(255,92,0,0.3)',
  },
  cohortCardActive: { borderLeftColor: '#4CAF50' },
  cohortCardLeft: { flex: 1 },
  roomBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6,
  },
  roomDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4CAF50' },
  roomBadgeText: { fontSize: 11, color: '#4CAF50', fontWeight: '700' },
  cohortTitle: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 4 },
  cohortMeta: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 2 },
  cohortArrow: { fontSize: 22, color: 'rgba(255,255,255,0.3)' },
  title: { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 16, textAlign: 'center' },
  email: { fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 8, textAlign: 'center' },
  badge: {
    fontSize: 12, color: '#FF5C00', fontWeight: '700',
    borderWidth: 1, borderColor: 'rgba(255,92,0,0.4)', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4, marginBottom: 16, alignSelf: 'center',
  },
  btn: {
    marginTop: 32, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12,
    padding: 16, paddingHorizontal: 40, alignSelf: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  btnText: { color: '#ff5555', fontSize: 16, fontWeight: '700' },
});
```

- [ ] **Step 2: Manual test**

Run: `npx expo start`. Open Profile tab.

Expected: If user has no active cohorts → existing profile view unchanged. Sign out still works.

- [ ] **Step 3: Commit**

```bash
cd /Users/bobanpepic/trainedby-app
git add app/(tabs)/profile.tsx
git commit -m "feat: profile tab — My Cohorts section with room status and Realtime updates"
```

---

## Task 8: Cohort Screen (`app/cohort/[id].tsx`)

**Files:**
- Create: `trainedby-app/app/cohort/[id].tsx`

Context: Chat-first layout. Room status bar pinned at top — green and tappable when room is open, grey/inactive when not. Chat messages are persisted in `cohort_messages` table (fetch last 200 on load, broadcast+insert on send). Pattern mirrors `app/live/[id].tsx` for channel management and keyboard handling.

- [ ] **Step 1: Create the file**

```typescript
// app/cohort/[id].tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, ActivityIndicator,
  TextInput, FlatList, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase, EDGE_BASE } from '../../lib/supabase';
import { useAuth } from '../../context/auth';

type Cohort = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  status: string;
  trainer_name: string;
};

type CohortMessage = {
  id: string;
  user_id: string;
  display_name: string;
  text: string;
  created_at: string;
};

type ActiveRoom = {
  room_id: string;
  mux_playback_id: string | null;
  member_count: number;
};

export default function CohortScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [messages, setMessages] = useState<CohortMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const inputTextRef = useRef('');
  const chatListRef = useRef<FlatList>(null);
  const chatChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const [activeRoom, setActiveRoom] = useState<ActiveRoom | null>(null);
  const roomChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!id || !session?.user) return;
    let cancelled = false;

    async function load() {
      try {
        const [cohortRes, countRes, messagesRes, roomRes] = await Promise.all([
          supabase
            .from('cohorts')
            .select('id, title, starts_at, ends_at, status, trainers(name)')
            .eq('id', id)
            .single(),
          supabase
            .from('cohort_members')
            .select('*', { count: 'exact', head: true })
            .eq('cohort_id', id),
          supabase
            .from('cohort_messages')
            .select('id, user_id, display_name, text, created_at')
            .eq('cohort_id', id)
            .order('created_at', { ascending: true })
            .limit(200),
          supabase
            .from('cohort_rooms')
            .select('id, mux_playback_id')
            .eq('cohort_id', id)
            .eq('status', 'open')
            .maybeSingle(),
        ]);

        if (cancelled) return;

        if (cohortRes.error || !cohortRes.data) {
          setError('Cohort not found.');
          return;
        }

        const c = cohortRes.data as any;
        setCohort({
          id: c.id,
          title: c.title,
          starts_at: c.starts_at,
          ends_at: c.ends_at,
          status: c.status,
          trainer_name: c.trainers?.name ?? 'Trainer',
        });
        setMemberCount(countRes.count ?? 0);
        setMessages((messagesRes.data ?? []) as CohortMessage[]);

        if (roomRes.data) {
          setActiveRoom({
            room_id: roomRes.data.id,
            mux_playback_id: roomRes.data.mux_playback_id,
            member_count: countRes.count ?? 0,
          });
        }
      } catch {
        if (!cancelled) setError('Could not load cohort.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id, session]);

  // Chat channel
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`cohort-chat:${id}`)
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        setMessages(prev => [...prev, payload as CohortMessage].slice(-200));
        setTimeout(() => chatListRef.current?.scrollToEnd({ animated: true }), 50);
      })
      .subscribe();
    chatChannelRef.current = channel;
    return () => { channel.unsubscribe(); };
  }, [id]);

  // Room status channel
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`cohort-room:${id}`)
      .on('broadcast', { event: 'room_opened' }, ({ payload }) => {
        setActiveRoom({
          room_id: payload.room_id,
          mux_playback_id: payload.mux_playback_id,
          member_count: payload.member_count,
        });
      })
      .on('broadcast', { event: 'room_closed' }, () => {
        setActiveRoom(null);
      })
      .on('broadcast', { event: 'presence_update' }, ({ payload }) => {
        setActiveRoom(prev => prev ? { ...prev, member_count: payload.member_count } : prev);
      })
      .subscribe();
    roomChannelRef.current = channel;
    return () => { channel.unsubscribe(); };
  }, [id]);

  const sendMessage = useCallback(async () => {
    const text = inputTextRef.current.trim();
    if (!text || !session?.user || !chatChannelRef.current) return;

    const msg = {
      id: `${session.user.id}-${Date.now()}`,
      cohort_id: id,
      user_id: session.user.id,
      display_name: session.user.email?.split('@')[0] ?? 'Member',
      text,
      created_at: new Date().toISOString(),
    };

    chatChannelRef.current.send({ type: 'broadcast', event: 'message', payload: msg });
    await supabase.from('cohort_messages').insert({
      cohort_id: id,
      user_id: msg.user_id,
      display_name: msg.display_name,
      text: msg.text,
    });

    setInputText('');
    inputTextRef.current = '';
  }, [id, session]);

  function weekNumber(): number {
    if (!cohort) return 1;
    return Math.max(1, Math.ceil((Date.now() - new Date(cohort.starts_at).getTime()) / (7 * 24 * 60 * 60 * 1000)));
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color="#FF5C00" />
      </View>
    );
  }

  if (error || !cohort) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error ?? 'Not found'}</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={styles.backLink}>← Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{cohort.title}</Text>
          <Text style={styles.headerMeta}>
            {cohort.trainer_name} · Week {weekNumber()} · {memberCount} members
          </Text>
        </View>
      </View>

      {/* Room status bar */}
      <View style={[styles.roomBar, activeRoom && styles.roomBarActive]}>
        <View style={[styles.roomDot, activeRoom && styles.roomDotActive]} />
        <Text style={[styles.roomBarText, activeRoom && styles.roomBarTextActive]}>
          {activeRoom
            ? `Room open · ${activeRoom.member_count} working out`
            : 'No room open'}
        </Text>
        {activeRoom && (
          <Pressable
            style={styles.joinBtn}
            // @ts-expect-error cohort/room route not typed yet
            onPress={() => router.push(`/cohort/room/${activeRoom.room_id}`)}
          >
            <Text style={styles.joinBtnText}>Join</Text>
          </Pressable>
        )}
      </View>

      {/* Chat */}
      <FlatList
        ref={chatListRef}
        data={messages}
        keyExtractor={m => m.id}
        style={styles.chatList}
        contentContainerStyle={{ padding: 12, paddingBottom: 4 }}
        onContentSizeChange={() => chatListRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => {
          const isOwn = item.user_id === session?.user?.id;
          return (
            <View style={[styles.msgRow, isOwn && styles.msgRowOwn]}>
              <Text style={[styles.msgName, isOwn && styles.msgNameOwn]}>
                {item.display_name}
              </Text>
              <Text style={styles.msgText}>{item.text}</Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.chatEmpty}>No messages yet — say hello! 👋</Text>
        }
      />

      {/* Input */}
      <View style={[styles.inputRow, { paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={text => { setInputText(text); inputTextRef.current = text; }}
          placeholder="Type a message..."
          placeholderTextColor="rgba(255,255,255,0.3)"
          onSubmitEditing={sendMessage}
          returnKeyType="send"
          blurOnSubmit={false}
        />
        <Pressable onPress={sendMessage} style={styles.sendBtn}>
          <Text style={styles.sendText}>→</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0B0A' },
  center: { justifyContent: 'center', alignItems: 'center', padding: 32 },
  errorText: { color: 'rgba(255,255,255,0.6)', fontSize: 16, textAlign: 'center' },
  backLink: { color: '#FF5C00', fontSize: 15 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)',
    backgroundColor: '#1C1714',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  backText: { color: '#fff', fontSize: 22, lineHeight: 28 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  headerMeta: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  roomBar: {
    flexDirection: 'row', alignItems: 'center',
    padding: 10, paddingHorizontal: 16, gap: 8,
    backgroundColor: '#161210',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  roomBarActive: { backgroundColor: '#1a2a1a' },
  roomDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  roomDotActive: { backgroundColor: '#4CAF50' },
  roomBarText: { flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.3)' },
  roomBarTextActive: { color: '#4CAF50', fontWeight: '600' },
  joinBtn: {
    backgroundColor: '#4CAF50', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 5,
  },
  joinBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  chatList: { flex: 1 },
  chatEmpty: {
    color: 'rgba(255,255,255,0.25)', textAlign: 'center',
    fontSize: 13, marginTop: 40,
  },
  msgRow: { marginBottom: 10 },
  msgRowOwn: { alignItems: 'flex-end' },
  msgName: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 2 },
  msgNameOwn: { color: '#FF5C00' },
  msgText: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 20 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, paddingTop: 10, gap: 10,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)',
  },
  input: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    color: '#fff', fontSize: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FF5C00',
    justifyContent: 'center', alignItems: 'center',
  },
  sendText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
```

- [ ] **Step 2: Manual test**

Run: `npx expo start`. Navigate to `/cohort/[any-uuid]`. Expected:
- Loading spinner shown
- Error "Cohort not found." shown (no real data yet) with back button
- No crash

- [ ] **Step 3: Commit**

```bash
cd /Users/bobanpepic/trainedby-app
git add app/cohort/[id].tsx
git commit -m "feat: cohort screen — persistent chat, room status bar, Realtime updates"
```

---

## Task 9: Body Doubling Room Screen (`app/cohort/room/[id].tsx`)

**Files:**
- Create: `trainedby-app/app/cohort/room/[id].tsx`

Context: The hybrid screen. On mount, calls `join-cohort-room` with the room ID. If response includes `mux_playback_id` + `playback_token`, shows HLS video (16:9) at top + presence avatars below + chat. If no stream, shows a presence-only view with larger avatars. Same `expo-video` pattern as `app/live/[id].tsx`. Presence avatars are fetched from `cohort_members` joined with users (display_name). Subscribes to `cohort-room:{cohort_id}` for `room_closed` and `presence_update`.

- [ ] **Step 1: Create the file**

```typescript
// app/cohort/room/[id].tsx
import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable, ActivityIndicator,
  Dimensions, TextInput, FlatList, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase, EDGE_BASE } from '../../../lib/supabase';
import { useAuth } from '../../../context/auth';

const SCREEN_WIDTH = Dimensions.get('window').width;
const VIDEO_HEIGHT = Math.round(SCREEN_WIDTH * 9 / 16);

type Member = {
  user_id: string;
  display_name: string;
};

type ChatMessage = {
  id: string;
  user_id: string;
  display_name: string;
  text: string;
  created_at: string;
};

export default function CohortRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [joining, setJoining] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [cohortId, setCohortId] = useState<string | null>(null);
  const [muxPlaybackId, setMuxPlaybackId] = useState<string | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [members, setMembers] = useState<Member[]>([]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const inputTextRef = useRef('');
  const chatListRef = useRef<FlatList>(null);
  const chatChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const roomChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const player = useVideoPlayer(null, () => {});

  useEffect(() => {
    if (!id || !session?.user) return;
    let cancelled = false;

    async function join() {
      try {
        const { data: { session: fresh } } = await supabase.auth.getSession();
        const token = fresh?.access_token;
        if (!token) { setError('Not authenticated'); return; }

        const res = await fetch(`${EDGE_BASE}/join-cohort-room`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ room_id: id }),
        });
        const json = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          setError(json.error === 'not_a_member' ? 'You are not a member of this cohort.' : 'Could not join room.');
          return;
        }

        setCohortId(json.cohort_id);
        setMemberCount(json.member_count);
        setMuxPlaybackId(json.mux_playback_id ?? null);

        if (json.mux_playback_id && json.playback_token) {
          player.replace(
            `https://stream.mux.com/${json.mux_playback_id}.m3u8?token=${json.playback_token}`
          );
          player.play();
        }

        // Load members for presence avatars
        const { data: membersData } = await supabase
          .from('cohort_members')
          .select('user_id, users(email)')
          .eq('cohort_id', json.cohort_id)
          .limit(12);

        if (!cancelled && membersData) {
          setMembers(
            (membersData as any[]).map(m => ({
              user_id: m.user_id,
              display_name: (m.users?.email as string | undefined)?.split('@')[0] ?? 'Member',
            }))
          );
        }

        // Load last 50 messages from cohort_messages
        const { data: msgs } = await supabase
          .from('cohort_messages')
          .select('id, user_id, display_name, text, created_at')
          .eq('cohort_id', json.cohort_id)
          .order('created_at', { ascending: true })
          .limit(50);

        if (!cancelled && msgs) setMessages(msgs as ChatMessage[]);

      } catch {
        if (!cancelled) setError('Could not join room.');
      } finally {
        if (!cancelled) setJoining(false);
      }
    }

    join();
    return () => { cancelled = true; };
  }, [id, session]);

  // Chat channel (only after cohortId is known)
  useEffect(() => {
    if (!cohortId) return;

    const channel = supabase
      .channel(`cohort-chat:${cohortId}`)
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        setMessages(prev => [...prev, payload as ChatMessage].slice(-50));
        setTimeout(() => chatListRef.current?.scrollToEnd({ animated: true }), 50);
      })
      .subscribe();

    chatChannelRef.current = channel;
    return () => { channel.unsubscribe(); };
  }, [cohortId]);

  // Room events channel
  useEffect(() => {
    if (!cohortId) return;

    const channel = supabase
      .channel(`cohort-room:${cohortId}-room-screen`)
      .on('broadcast', { event: 'room_closed' }, () => {
        player.pause();
        router.back();
      })
      .on('broadcast', { event: 'presence_update' }, ({ payload }) => {
        setMemberCount(payload.member_count);
      })
      .subscribe();

    roomChannelRef.current = channel;
    return () => { channel.unsubscribe(); };
  }, [cohortId]);

  // Cleanup
  useEffect(() => {
    return () => {
      player.pause();
      chatChannelRef.current?.unsubscribe();
      roomChannelRef.current?.unsubscribe();
    };
  }, [player]);

  async function sendMessage() {
    const text = inputTextRef.current.trim();
    if (!text || !session?.user || !chatChannelRef.current || !cohortId) return;

    const msg = {
      id: `${session.user.id}-${Date.now()}`,
      cohort_id: cohortId,
      user_id: session.user.id,
      display_name: session.user.email?.split('@')[0] ?? 'Member',
      text,
      created_at: new Date().toISOString(),
    };

    chatChannelRef.current.send({ type: 'broadcast', event: 'message', payload: msg });
    await supabase.from('cohort_messages').insert({
      cohort_id: cohortId,
      user_id: msg.user_id,
      display_name: msg.display_name,
      text: msg.text,
    });

    setInputText('');
    inputTextRef.current = '';
  }

  if (joining) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color="#FF5C00" />
        <Text style={styles.joiningText}>Joining room…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={styles.backLink}>← Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <View style={styles.liveDot} />
        <Text style={styles.headerTitle}>Room open</Text>
      </View>

      {/* Video or presence */}
      {muxPlaybackId ? (
        <View style={styles.videoContainer}>
          <VideoView
            player={player}
            style={styles.video}
            allowsFullscreen
            contentFit="cover"
          />
          <View style={styles.liveLabel}>
            <View style={styles.liveLabelDot} />
            <Text style={styles.liveLabelText}>LIVE</Text>
          </View>
        </View>
      ) : (
        <View style={styles.presenceOnlyContainer}>
          <Text style={styles.presenceHeading}>Working out together</Text>
          <View style={styles.avatarRow}>
            {members.slice(0, 8).map((m, i) => (
              <View key={m.user_id} style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {m.display_name.charAt(0).toUpperCase()}
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.presenceCount}>{memberCount} members in the room</Text>
        </View>
      )}

      {/* Presence row (shown below video when streaming) */}
      {muxPlaybackId && (
        <View style={styles.presenceRow}>
          <Text style={styles.presenceRowLabel}>Working out now</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {members.slice(0, 10).map(m => (
              <View key={m.user_id} style={styles.avatarSmall}>
                <Text style={styles.avatarSmallText}>
                  {m.display_name.charAt(0).toUpperCase()}
                </Text>
              </View>
            ))}
            {memberCount > 10 && (
              <Text style={styles.moreText}>+{memberCount - 10}</Text>
            )}
          </ScrollView>
        </View>
      )}

      {/* Chat */}
      <FlatList
        ref={chatListRef}
        data={messages}
        keyExtractor={m => m.id}
        style={styles.chatList}
        contentContainerStyle={{ padding: 12, paddingBottom: 4 }}
        renderItem={({ item }) => {
          const isOwn = item.user_id === session?.user?.id;
          return (
            <View style={[styles.msgRow, isOwn && styles.msgRowOwn]}>
              <Text style={[styles.msgName, isOwn && styles.msgNameOwn]}>
                {item.display_name}
              </Text>
              <Text style={styles.msgText}>{item.text}</Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.chatEmpty}>Cheer the group on! 💪</Text>
        }
      />

      {/* Input */}
      <View style={[styles.inputRow, { paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={text => { setInputText(text); inputTextRef.current = text; }}
          placeholder="Cheer the group..."
          placeholderTextColor="rgba(255,255,255,0.3)"
          onSubmitEditing={sendMessage}
          returnKeyType="send"
          blurOnSubmit={false}
        />
        <Pressable onPress={sendMessage} style={styles.sendBtn}>
          <Text style={styles.sendText}>→</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0B0A' },
  center: { justifyContent: 'center', alignItems: 'center', padding: 32 },
  joiningText: { color: 'rgba(255,255,255,0.4)', marginTop: 12, fontSize: 14 },
  errorText: { color: 'rgba(255,255,255,0.6)', fontSize: 16, textAlign: 'center' },
  backLink: { color: '#FF5C00', fontSize: 15 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)',
    backgroundColor: '#1C1714',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'center', alignItems: 'center',
  },
  backText: { color: '#fff', fontSize: 22, lineHeight: 28 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50' },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  videoContainer: { width: SCREEN_WIDTH, height: VIDEO_HEIGHT, position: 'relative' },
  video: { width: '100%', height: '100%' },
  liveLabel: {
    position: 'absolute', top: 10, left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
  },
  liveLabelDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4CAF50' },
  liveLabelText: { color: '#4CAF50', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  presenceOnlyContainer: {
    padding: 32, alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  presenceHeading: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 20 },
  avatarRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 16 },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#2a2018', borderWidth: 2, borderColor: '#4CAF50',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  presenceCount: { fontSize: 13, color: 'rgba(255,255,255,0.45)' },
  presenceRow: {
    padding: 12, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  presenceRowLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: '600' },
  avatarSmall: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#2a2018', borderWidth: 2, borderColor: '#4CAF50',
    justifyContent: 'center', alignItems: 'center', marginRight: 6,
  },
  avatarSmallText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  moreText: { color: 'rgba(255,255,255,0.4)', fontSize: 12, alignSelf: 'center', marginLeft: 4 },
  chatList: { flex: 1 },
  chatEmpty: {
    color: 'rgba(255,255,255,0.25)', textAlign: 'center',
    fontSize: 13, marginTop: 20,
  },
  msgRow: { marginBottom: 10 },
  msgRowOwn: { alignItems: 'flex-end' },
  msgName: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 2 },
  msgNameOwn: { color: '#FF5C00' },
  msgText: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 20 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, paddingTop: 10, gap: 10,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)',
  },
  input: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    color: '#fff', fontSize: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FF5C00',
    justifyContent: 'center', alignItems: 'center',
  },
  sendText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
```

- [ ] **Step 2: Manual test**

Run: `npx expo start`. Navigate from cohort screen to `/cohort/room/[any-id]`.

Expected:
- Joining spinner shown briefly
- Error "Could not join room." displayed (no real data yet) with back button
- No crash

- [ ] **Step 3: Commit**

```bash
cd /Users/bobanpepic/trainedby-app
git add app/cohort/room/[id].tsx
git commit -m "feat: cohort room screen — hybrid HLS/presence, group chat, room_closed auto-exit"
```

---

## Self-Review Checklist

- [x] **Spec coverage:**
  - Drop claim → instant activation: Task 2 (confirm-cohort-claim broadcasts cohort_confirmed) + Task 6 (watch screen listens) ✅
  - Profile tab My Cohorts: Task 7 ✅
  - Group chat (persistent): Tasks 8 + 9 (both screens write to cohort_messages) ✅
  - Body doubling room: Task 5 (join-cohort-room) + Task 9 ✅
  - open/close room (trainer): Task 4 ✅
  - RLS gating: Task 1 (migration) ✅
  - pg_cron for cohort completion: Task 1 ✅
  - Stripe webhook wiring: Task 3 ✅

- [x] **No placeholders:** All steps contain complete code

- [x] **Type consistency:**
  - `ActiveRoom.room_id` used in cohort screen Task 8 → `router.push('/cohort/room/' + activeRoom.room_id)` ✅
  - `join-cohort-room` returns `room_id, cohort_id, mux_playback_id, playback_token, member_count` → Task 9 uses all of these ✅
  - `cohort_confirmed` payload: `cohort_id, title, trainer_name, starts_at, ends_at` — Task 2 sends it, Task 6 reads it ✅
  - `room_opened` payload: `room_id, cohort_id, mux_playback_id, member_count` — Task 4 sends, Tasks 7+8 read ✅
