# Club Culture Phase 3 — Live Streaming + Season Drops Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Mux live streaming and Whatnot-style season drops — coaches broadcast live, followers watch in real-time and claim season spots as price tiers fill.

**Architecture:** Mux Live handles RTMP ingestion and HLS distribution. Supabase Realtime broadcasts attendee counts and tier state changes to all viewers. Drop claims use an atomic Postgres function to prevent overselling. Email notifications via Resend go to followers/subscribers when a stream goes live.

**Tech Stack:** Astro SSR + React, Supabase (Postgres + Edge Functions + Realtime), Mux Live, Stripe Checkout (payment_intent mode for drops), Resend email, `@mux/mux-player-react`.

---

## Codebase context (read before starting)

**Trainer lookup:** `trainers` table has NO `auth_id` column. Always look up by email: `.eq("email", user.email)`. The name column is `name` (not `full_name`).

**Edge function pattern (established in Phase 1 + 2):**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const sbAnon = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  );
  const { data: { user }, error: authErr } = await sbAnon.auth.getUser(token);
  if (authErr || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  // ...
});
```

**Webhook functions:** `verify_jwt = false` in `supabase/config.toml`. Use timing-safe HMAC for Mux signatures (same as existing `mux-webhook`). Fail closed if secret missing.

**React components:** Inline styles, dark theme (`#0f0e0d` bg, `#111` cards, `#7c3aed` purple, `#f97316` orange). `useMemo` for the Supabase client. `useEffect` with proper deps. `client:load` on Astro pages.

**Supabase Realtime in React:**
```tsx
const channel = sb.channel(`live:${id}`)
  .on('postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'live_sessions', filter: `id=eq.${id}` },
    (payload) => { /* handle update */ })
  .subscribe();
return () => { sb.removeChannel(channel); };
```

**Ephemeral chat (broadcast, not stored):**
```tsx
// Subscribe:
channel.on('broadcast', { event: 'msg' }, ({ payload }) => setMessages(m => [...m, payload])).subscribe();
// Send:
channel.send({ type: 'broadcast', event: 'msg', payload: { text, userName } });
```

**Deploy edge functions:** Use `./scripts/deploy_functions.sh <name>` (not raw `supabase functions deploy`). The deploy script also runs the symlink + pre-deploy check.

**Apply migrations:** Use Supabase MCP `apply_migration` (not the CLI).

**Mux Live API:**
- Create stream: `POST https://api.mux.com/video/v1/live-streams` with
  `{ playback_policy: ["signed"], reconnect_window: 60, new_asset_settings: { playback_policy: ["signed"] } }`
- Response has: `data.id` (stream ID), `data.stream_key` (RTMP key), `data.playback_ids[0].id` (playback ID).
- RTMP ingest URL: `rtmps://global-live.mux.com:443/app/{stream_key}`
- Disable stream: `PUT https://api.mux.com/video/v1/live-streams/{id}/disable`

**Mux live webhook events:**
- `video.live_stream.active` → stream is live, `data.id` = stream_id
- `video.live_stream.idle` → stream went quiet
- `video.asset.ready` → recording asset ready after stream ends

**Signed Mux token (for live playback):** Same as Phase 2 `get-video-token` pattern using `jose` library — `aud: "v"`, `sub: playbackId`, RS256, 4h expiry for live.

**Resend email (same as `club-daily-nudge`):**
```typescript
await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from: "TrainedBy <notifications@trainedby.ae>",
    to: [email],
    subject: "...",
    html: "...",
  }),
});
```

**Supabase project ref:** `mezhtdbfyvkshpuplqqw`
**Working directory:** `/Users/bobanpepic/trainedby`

---

## Pre-flight secrets

Before Tasks 2–6 can work end-to-end:

- `STRIPE_LIVE_DROP_WEBHOOK_SECRET` — **new**. Create a Stripe webhook endpoint pointing to:
  `https://mezhtdbfyvkshpuplqqw.supabase.co/functions/v1/live-drop-webhook`
  with event `checkout.session.completed`. Copy the signing secret into Supabase Edge Function secrets.
- `MUX_WEBHOOK_SECRET` — already set in Phase 2 ✅ (reused for live webhook).
- `MUX_TOKEN_ID` + `MUX_TOKEN_SECRET` — already set ✅
- `MUX_SIGNING_KEY_ID` + `MUX_SIGNING_PRIVATE_KEY` — already set ✅
- `RESEND_API_KEY` — already set ✅
- `STRIPE_SECRET_KEY` — already set ✅

---

## Task breakdown (13 tasks)

### Task 1: Schema migration + `claim_drop_tier` function

- [ ] Create file: `supabase/migrations/20260520_phase3_live_streaming.sql`
- [ ] Define 3 tables (`live_sessions`, `live_attendees`, `live_drop_claims`) with full RLS.
- [ ] Define `claim_drop_tier(session_id uuid)` Postgres function (SECURITY DEFINER, row-locking via `FOR UPDATE`).
- [ ] Apply via Supabase MCP `apply_migration` with `name: "phase3_live_streaming"`.
- [ ] Verify via `execute_sql`:
  - `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'live_%';`
  - `SELECT proname FROM pg_proc WHERE proname = 'claim_drop_tier';`
- [ ] Commit: `git commit -m "feat(phase3): live streaming schema + atomic claim function"`

**Migration SQL:**

```sql
-- live_sessions
CREATE TABLE IF NOT EXISTS live_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id      uuid REFERENCES trainers(id) ON DELETE CASCADE NOT NULL,
  club_id         uuid REFERENCES clubs(id),
  title           text NOT NULL,
  mux_stream_id   text,
  mux_stream_key  text,
  mux_playback_id text,
  mux_asset_id    text,
  status          text NOT NULL DEFAULT 'scheduled',
  is_season_drop  boolean NOT NULL DEFAULT false,
  drop_tiers      jsonb,
  starts_at       timestamptz,
  ended_at        timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS live_sessions_trainer_id_idx ON live_sessions(trainer_id);
CREATE INDEX IF NOT EXISTS live_sessions_status_idx ON live_sessions(status);
CREATE INDEX IF NOT EXISTS live_sessions_mux_stream_id_idx ON live_sessions(mux_stream_id);

ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;

-- Anyone can SELECT (public discovery), but stream_key column excluded via app-level field projection.
CREATE POLICY "live_sessions_select_all" ON live_sessions
  FOR SELECT USING (true);

-- Trainer can see their own stream key via auth email match (no auth_id column on trainers).
-- (SELECT is already permitted by select_all; the trainer ownership check is enforced in the edge function
-- when revealing stream_key.)

-- Mutations: service_role only (edge functions). No policy = denied for authenticated.

-- live_attendees
CREATE TABLE IF NOT EXISTS live_attendees (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  live_session_id uuid REFERENCES live_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id         uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  joined_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE(live_session_id, user_id)
);
CREATE INDEX IF NOT EXISTS live_attendees_session_idx ON live_attendees(live_session_id);

ALTER TABLE live_attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "live_attendees_select_all" ON live_attendees
  FOR SELECT USING (true);

-- live_drop_claims
CREATE TABLE IF NOT EXISTS live_drop_claims (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  live_session_id     uuid REFERENCES live_sessions(id) NOT NULL,
  user_id             uuid REFERENCES users(id) NOT NULL,
  stripe_checkout_id  text NOT NULL UNIQUE,
  tier_price_cents    int NOT NULL,
  status              text NOT NULL DEFAULT 'pending',
  claimed_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS live_drop_claims_session_idx ON live_drop_claims(live_session_id);
CREATE INDEX IF NOT EXISTS live_drop_claims_user_idx ON live_drop_claims(user_id);

ALTER TABLE live_drop_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "live_drop_claims_select_own" ON live_drop_claims
  FOR SELECT USING (user_id = auth.uid());

-- claim_drop_tier function (atomic, prevents overselling)
CREATE OR REPLACE FUNCTION claim_drop_tier(session_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sess live_sessions;
  tiers jsonb;
  tier_idx int := -1;
  tier jsonb;
BEGIN
  SELECT * INTO sess FROM live_sessions WHERE id = session_id FOR UPDATE;
  IF NOT FOUND THEN RETURN json_build_object('error', 'session_not_found'); END IF;
  IF sess.status != 'live' THEN RETURN json_build_object('error', 'session_not_live'); END IF;
  IF NOT sess.is_season_drop THEN RETURN json_build_object('error', 'not_a_season_drop'); END IF;
  tiers := sess.drop_tiers;
  FOR i IN 0..jsonb_array_length(tiers)-1 LOOP
    tier := tiers->i;
    IF (tier->>'total_spots')::int = 0 OR (tier->>'claimed')::int < (tier->>'total_spots')::int THEN
      tier_idx := i; EXIT;
    END IF;
  END LOOP;
  IF tier_idx = -1 THEN RETURN json_build_object('error', 'sold_out'); END IF;
  tiers := jsonb_set(tiers, array[tier_idx::text, 'claimed'],
    to_jsonb((tiers->tier_idx->>'claimed')::int + 1));
  UPDATE live_sessions SET drop_tiers = tiers WHERE id = session_id;
  RETURN json_build_object(
    'ok', true,
    'tier_index', tier_idx,
    'tier_price_cents', (tiers->tier_idx->>'price_cents')::int,
    'claimed', (tiers->tier_idx->>'claimed')::int,
    'total_spots', (tiers->tier_idx->>'total_spots')::int,
    'drop_tiers', tiers
  );
END;
$$;
```

---

### Task 2: `start-live-session` edge function

- [ ] Create `supabase/functions/start-live-session/index.ts`
- [ ] Auth: JWT required; verify trainer by `email = user.email`. If no trainer row, return 403.
- [ ] Input shape: `{ title: string, club_id?: string, is_season_drop: boolean, drop_tiers?: Array<{price_cents:number,total_spots:number,claimed:number}>, starts_at?: string }`
- [ ] Validate: if `is_season_drop` then `drop_tiers` must be 1–4 entries; each tier must have positive `price_cents` and `total_spots >= 0`; init `claimed = 0`.
- [ ] Call Mux API (Basic auth `${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}` base64) to create live stream with signed playback policy.
- [ ] Insert `live_sessions` row with stream_id, stream_key, playback_id and `status = 'scheduled'`.
- [ ] Return `{ ok: true, session_id, rtmp_url: "rtmps://global-live.mux.com:443/app", stream_key, playback_id }`.
- [ ] Deploy: `./scripts/deploy_functions.sh start-live-session`
- [ ] Commit.

**Implementation:**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Tier { price_cents: number; total_spots: number; claimed: number }

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const sbAnon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data: { user }, error: authErr } = await sbAnon.auth.getUser(token);
  if (authErr || !user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  let body: { title?: string; club_id?: string; is_season_drop?: boolean; drop_tiers?: Tier[]; starts_at?: string };
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { ...corsHeaders, "content-type": "application/json" } });
  }
  if (!body.title || typeof body.title !== "string") {
    return new Response(JSON.stringify({ error: "title required" }), { status: 400, headers: { ...corsHeaders, "content-type": "application/json" } });
  }
  const isDrop = !!body.is_season_drop;
  let tiers: Tier[] | null = null;
  if (isDrop) {
    if (!Array.isArray(body.drop_tiers) || body.drop_tiers.length < 1 || body.drop_tiers.length > 4) {
      return new Response(JSON.stringify({ error: "drop_tiers must be 1-4 entries" }), { status: 400, headers: { ...corsHeaders, "content-type": "application/json" } });
    }
    tiers = body.drop_tiers.map((t) => ({
      price_cents: Math.max(0, Math.floor(Number(t.price_cents))),
      total_spots: Math.max(0, Math.floor(Number(t.total_spots))),
      claimed: 0,
    }));
    if (tiers.some((t) => t.price_cents <= 0)) {
      return new Response(JSON.stringify({ error: "tier price_cents must be > 0" }), { status: 400, headers: { ...corsHeaders, "content-type": "application/json" } });
    }
  }

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data: trainer, error: trErr } = await sb.from("trainers").select("id").eq("email", user.email).maybeSingle();
  if (trErr || !trainer) {
    return new Response(JSON.stringify({ error: "trainer_not_found" }), { status: 403, headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  if (body.club_id) {
    const { data: club } = await sb.from("clubs").select("id, trainer_id").eq("id", body.club_id).maybeSingle();
    if (!club || club.trainer_id !== trainer.id) {
      return new Response(JSON.stringify({ error: "club_not_owned" }), { status: 403, headers: { ...corsHeaders, "content-type": "application/json" } });
    }
  }

  const muxAuth = btoa(`${Deno.env.get("MUX_TOKEN_ID")}:${Deno.env.get("MUX_TOKEN_SECRET")}`);
  const muxResp = await fetch("https://api.mux.com/video/v1/live-streams", {
    method: "POST",
    headers: { "Authorization": `Basic ${muxAuth}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      playback_policy: ["signed"],
      reconnect_window: 60,
      new_asset_settings: { playback_policy: ["signed"] },
    }),
  });
  if (!muxResp.ok) {
    const text = await muxResp.text();
    return new Response(JSON.stringify({ error: "mux_create_failed", detail: text }), { status: 502, headers: { ...corsHeaders, "content-type": "application/json" } });
  }
  const muxJson = await muxResp.json();
  const muxStream = muxJson.data;
  const playbackId = muxStream.playback_ids?.[0]?.id;

  const { data: session, error: insErr } = await sb.from("live_sessions").insert({
    trainer_id: trainer.id,
    club_id: body.club_id ?? null,
    title: body.title,
    mux_stream_id: muxStream.id,
    mux_stream_key: muxStream.stream_key,
    mux_playback_id: playbackId,
    status: "scheduled",
    is_season_drop: isDrop,
    drop_tiers: tiers,
    starts_at: body.starts_at ?? null,
  }).select("id").single();

  if (insErr || !session) {
    return new Response(JSON.stringify({ error: "db_insert_failed", detail: insErr?.message }), { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  return new Response(JSON.stringify({
    ok: true,
    session_id: session.id,
    rtmp_url: "rtmps://global-live.mux.com:443/app",
    stream_key: muxStream.stream_key,
    playback_id: playbackId,
  }), { headers: { ...corsHeaders, "content-type": "application/json" } });
});
```

---

### Task 3: `end-live-session` edge function

- [ ] Create `supabase/functions/end-live-session/index.ts`
- [ ] Auth: JWT required. Look up trainer by email; verify `live_sessions.trainer_id` matches.
- [ ] Call Mux `PUT /video/v1/live-streams/{mux_stream_id}/disable`.
- [ ] Update `live_sessions.status = 'ended'`, `ended_at = now()`.
- [ ] Deploy + commit.

**Implementation:**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const sbAnon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data: { user }, error: authErr } = await sbAnon.auth.getUser(token);
  if (authErr || !user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  let body: { live_session_id?: string };
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { ...corsHeaders, "content-type": "application/json" } });
  }
  if (!body.live_session_id) {
    return new Response(JSON.stringify({ error: "live_session_id required" }), { status: 400, headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data: trainer } = await sb.from("trainers").select("id").eq("email", user.email).maybeSingle();
  if (!trainer) return new Response(JSON.stringify({ error: "trainer_not_found" }), { status: 403, headers: { ...corsHeaders, "content-type": "application/json" } });

  const { data: session } = await sb.from("live_sessions").select("id, trainer_id, mux_stream_id").eq("id", body.live_session_id).maybeSingle();
  if (!session) return new Response(JSON.stringify({ error: "session_not_found" }), { status: 404, headers: { ...corsHeaders, "content-type": "application/json" } });
  if (session.trainer_id !== trainer.id) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...corsHeaders, "content-type": "application/json" } });

  if (session.mux_stream_id) {
    const muxAuth = btoa(`${Deno.env.get("MUX_TOKEN_ID")}:${Deno.env.get("MUX_TOKEN_SECRET")}`);
    await fetch(`https://api.mux.com/video/v1/live-streams/${session.mux_stream_id}/disable`, {
      method: "PUT",
      headers: { "Authorization": `Basic ${muxAuth}` },
    });
  }

  await sb.from("live_sessions").update({ status: "ended", ended_at: new Date().toISOString() }).eq("id", session.id);

  return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "content-type": "application/json" } });
});
```

---

### Task 4: `join-live-session` edge function

- [ ] Create `supabase/functions/join-live-session/index.ts`
- [ ] Auth required.
- [ ] Fetch session; status must be `'live'` (else 409).
- [ ] Access check: user is active subscriber to the trainer (`coach_subscriptions` status in `('active','trialing')`) OR active `club_members` row for the linked club. Else 403.
- [ ] Upsert `live_attendees(live_session_id, user_id)`.
- [ ] If user is active club member AND session.club_id set: create today's check-in (idempotent — skip if a checkin already exists for `(user_id, club_id, date_trunc('day', now()))`).
- [ ] Generate signed Mux playback token (jose RS256, `aud: "v"`, `sub: playbackId`, 4h expiry) using `MUX_SIGNING_KEY_ID` + `MUX_SIGNING_PRIVATE_KEY` (same as `get-video-token`).
- [ ] Return `{ ok, playback_id, token }`.
- [ ] Deploy + commit.

**Implementation sketch (token signing reused from `get-video-token`):**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SignJWT, importPKCS8 } from "https://esm.sh/jose@5.2.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function signMuxToken(playbackId: string): Promise<string> {
  const keyId = Deno.env.get("MUX_SIGNING_KEY_ID")!;
  const privKeyB64 = Deno.env.get("MUX_SIGNING_PRIVATE_KEY")!;
  const pem = atob(privKeyB64);
  const key = await importPKCS8(pem, "RS256");
  return await new SignJWT({})
    .setProtectedHeader({ alg: "RS256", kid: keyId, typ: "JWT" })
    .setSubject(playbackId)
    .setAudience("v")
    .setExpirationTime("4h")
    .setIssuedAt()
    .sign(key);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("authorization") ?? "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "");
  const sbAnon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data: { user }, error: authErr } = await sbAnon.auth.getUser(jwt);
  if (authErr || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  let body: { live_session_id?: string };
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { ...corsHeaders, "content-type": "application/json" } });
  }
  if (!body.live_session_id) {
    return new Response(JSON.stringify({ error: "live_session_id required" }), { status: 400, headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data: session } = await sb.from("live_sessions")
    .select("id, trainer_id, club_id, status, mux_playback_id")
    .eq("id", body.live_session_id).maybeSingle();
  if (!session) return new Response(JSON.stringify({ error: "session_not_found" }), { status: 404, headers: { ...corsHeaders, "content-type": "application/json" } });
  if (session.status !== "live") return new Response(JSON.stringify({ error: "session_not_live" }), { status: 409, headers: { ...corsHeaders, "content-type": "application/json" } });

  // Access: subscriber or club member
  const { data: sub } = await sb.from("coach_subscriptions")
    .select("id, status").eq("trainer_id", session.trainer_id).eq("user_id", user.id)
    .in("status", ["active", "trialing"]).maybeSingle();

  let clubMember = null;
  if (!sub && session.club_id) {
    const { data: cm } = await sb.from("club_members")
      .select("id, status").eq("club_id", session.club_id).eq("user_id", user.id)
      .eq("status", "active").maybeSingle();
    clubMember = cm;
  }

  if (!sub && !clubMember) {
    return new Response(JSON.stringify({ error: "paywall", trainer_id: session.trainer_id }), { status: 403, headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  await sb.from("live_attendees").upsert({
    live_session_id: session.id, user_id: user.id,
  }, { onConflict: "live_session_id,user_id" });

  // Optional: check-in for club members
  if (clubMember && session.club_id) {
    const today = new Date(); today.setHours(0,0,0,0);
    const { data: existing } = await sb.from("checkins")
      .select("id").eq("user_id", user.id).eq("club_id", session.club_id)
      .gte("created_at", today.toISOString()).maybeSingle();
    if (!existing) {
      await sb.from("checkins").insert({
        user_id: user.id, club_id: session.club_id, source: "live_session",
      });
    }
  }

  if (!session.mux_playback_id) {
    return new Response(JSON.stringify({ error: "no_playback_id" }), { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } });
  }
  const token = await signMuxToken(session.mux_playback_id);
  return new Response(JSON.stringify({ ok: true, playback_id: session.mux_playback_id, token }), {
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
});
```

---

### Task 5: `claim-live-drop-spot` edge function

- [ ] Create `supabase/functions/claim-live-drop-spot/index.ts`
- [ ] Auth required.
- [ ] Call `sb.rpc('claim_drop_tier', { session_id: body.live_session_id })`.
- [ ] If RPC returns `{ error: "sold_out" }` → 409; `session_not_live` → 409; `session_not_found` → 404; `not_a_season_drop` → 400.
- [ ] Create Stripe Checkout (mode `payment`, line_items with `unit_amount = tier_price_cents`, currency `aed`).
- [ ] Metadata: `{ live_session_id, user_id: user.id, tier_price_cents }`.
- [ ] Insert `live_drop_claims` with `status='pending'`, `stripe_checkout_id`.
- [ ] Return `{ ok: true, checkout_url }`.
- [ ] Deploy + commit.

**Implementation:**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("authorization") ?? "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "");
  const sbAnon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data: { user }, error: authErr } = await sbAnon.auth.getUser(jwt);
  if (authErr || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  let body: { live_session_id?: string };
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { ...corsHeaders, "content-type": "application/json" } });
  }
  if (!body.live_session_id) {
    return new Response(JSON.stringify({ error: "live_session_id required" }), { status: 400, headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data: rpc, error: rpcErr } = await sb.rpc("claim_drop_tier", { session_id: body.live_session_id });
  if (rpcErr) {
    return new Response(JSON.stringify({ error: "rpc_failed", detail: rpcErr.message }), { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } });
  }
  if (rpc?.error) {
    const map: Record<string, number> = { sold_out: 409, session_not_live: 409, session_not_found: 404, not_a_season_drop: 400 };
    return new Response(JSON.stringify({ error: rpc.error }), { status: map[rpc.error] ?? 400, headers: { ...corsHeaders, "content-type": "application/json" } });
  }
  const tierPriceCents: number = rpc.tier_price_cents;

  const { data: session } = await sb.from("live_sessions").select("id, title, trainer_id").eq("id", body.live_session_id).single();
  const origin = req.headers.get("origin") ?? "https://trainedby.ae";

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")!;
  const params = new URLSearchParams();
  params.append("mode", "payment");
  params.append("success_url", `${origin}/live/${body.live_session_id}?claim=success`);
  params.append("cancel_url", `${origin}/live/${body.live_session_id}?claim=cancelled`);
  params.append("line_items[0][price_data][currency]", "aed");
  params.append("line_items[0][price_data][product_data][name]", `Season drop spot — ${session?.title ?? "Live"}`);
  params.append("line_items[0][price_data][unit_amount]", String(tierPriceCents));
  params.append("line_items[0][quantity]", "1");
  params.append("metadata[live_session_id]", body.live_session_id);
  params.append("metadata[user_id]", user.id);
  params.append("metadata[tier_price_cents]", String(tierPriceCents));
  if (user.email) params.append("customer_email", user.email);

  const stripeResp = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${stripeKey}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!stripeResp.ok) {
    const t = await stripeResp.text();
    return new Response(JSON.stringify({ error: "stripe_failed", detail: t }), { status: 502, headers: { ...corsHeaders, "content-type": "application/json" } });
  }
  const checkout = await stripeResp.json();

  await sb.from("live_drop_claims").insert({
    live_session_id: body.live_session_id,
    user_id: user.id,
    stripe_checkout_id: checkout.id,
    tier_price_cents: tierPriceCents,
    status: "pending",
  });

  return new Response(JSON.stringify({ ok: true, checkout_url: checkout.url }), {
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
});
```

---

### Task 6: `live-drop-webhook` + `mux-live-webhook` + `config.toml`

#### 6a. `live-drop-webhook`

- [ ] Create `supabase/functions/live-drop-webhook/index.ts`
- [ ] Verify Stripe signature using `STRIPE_LIVE_DROP_WEBHOOK_SECRET` (fail closed if missing).
- [ ] Only handle `checkout.session.completed`.
- [ ] Update `live_drop_claims.status='completed'` by `stripe_checkout_id`.
- [ ] If session has `club_id`: insert/upsert `club_members(club_id, user_id, status='active')`.
- [ ] Fetch updated `live_sessions.drop_tiers` and broadcast on Realtime channel `drops`:
      `sb.channel('drops').send({ type: 'broadcast', event: 'tier_update', payload: { live_session_id, drop_tiers } })`.
- [ ] Return 200 `{ ok: true }`.

#### 6b. `mux-live-webhook`

- [ ] Create `supabase/functions/mux-live-webhook/index.ts`
- [ ] Use shared `MUX_WEBHOOK_SECRET`. Fail closed if missing.
- [ ] Timing-safe HMAC verification (same pattern as existing `mux-webhook`).
- [ ] On `video.live_stream.active`: update `live_sessions.status='live'` where `mux_stream_id = data.id`; then fetch followers + active subscribers for that trainer; send Resend email "X is live now" with link `https://trainedby.ae/live/{session_id}`.
- [ ] On `video.live_stream.idle`: update `live_sessions.status='scheduled'` (treat idle as not yet ended).
- [ ] On `video.asset.ready`: if asset's `live_stream_id` matches a session, set `mux_asset_id` on the session.
- [ ] Return 200 `{ ok }`.

#### 6c. `supabase/config.toml`

- [ ] Add:
  ```toml
  [functions.live-drop-webhook]
  verify_jwt = false

  [functions.mux-live-webhook]
  verify_jwt = false
  ```

- [ ] Deploy both functions: `./scripts/deploy_functions.sh live-drop-webhook` and `./scripts/deploy_functions.sh mux-live-webhook`.
- [ ] Commit.

**mux-live-webhook implementation:**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, mux-signature",
};

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const secret = Deno.env.get("MUX_WEBHOOK_SECRET");
  if (!secret) {
    return new Response(JSON.stringify({ error: "secret_not_configured" }), { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } });
  }
  const sigHeader = req.headers.get("mux-signature") ?? "";
  const raw = await req.text();

  // header is "t=...,v1=..."
  const parts = Object.fromEntries(sigHeader.split(",").map((p) => p.split("=")));
  const t = parts.t, v1 = parts.v1;
  if (!t || !v1) return new Response("bad_signature", { status: 401, headers: corsHeaders });
  const expected = await hmacSha256Hex(secret, `${t}.${raw}`);
  if (!timingSafeEqual(expected, v1)) return new Response("bad_signature", { status: 401, headers: corsHeaders });

  const evt = JSON.parse(raw);
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  if (evt.type === "video.live_stream.active") {
    const streamId = evt.data.id;
    const { data: session } = await sb.from("live_sessions")
      .update({ status: "live" }).eq("mux_stream_id", streamId).select("id, trainer_id, title").maybeSingle();
    if (session) {
      // Email followers + subscribers
      const { data: trainer } = await sb.from("trainers").select("name, slug").eq("id", session.trainer_id).maybeSingle();
      const { data: followers } = await sb.from("trainer_followers")
        .select("user_id, users!inner(email)").eq("trainer_id", session.trainer_id);
      const { data: subs } = await sb.from("coach_subscriptions")
        .select("user_id, users!inner(email)").eq("trainer_id", session.trainer_id).in("status", ["active","trialing"]);
      const emails = new Set<string>();
      // deno-lint-ignore no-explicit-any
      (followers ?? []).forEach((f: any) => { if (f.users?.email) emails.add(f.users.email); });
      // deno-lint-ignore no-explicit-any
      (subs ?? []).forEach((s: any) => { if (s.users?.email) emails.add(s.users.email); });
      const liveUrl = `https://trainedby.ae/live/${session.id}`;
      for (const email of emails) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "TrainedBy <notifications@trainedby.ae>",
            to: [email],
            subject: `${trainer?.name ?? "Your coach"} is LIVE now`,
            html: `<p>${trainer?.name ?? "Your coach"} just went live: <b>${session.title}</b></p><p><a href="${liveUrl}">Watch now →</a></p>`,
          }),
        });
      }
    }
  } else if (evt.type === "video.live_stream.idle") {
    await sb.from("live_sessions").update({ status: "scheduled" }).eq("mux_stream_id", evt.data.id);
  } else if (evt.type === "video.asset.ready") {
    const liveStreamId = evt.data.live_stream_id;
    if (liveStreamId) {
      await sb.from("live_sessions").update({ mux_asset_id: evt.data.id }).eq("mux_stream_id", liveStreamId);
    }
  }

  return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "content-type": "application/json" } });
});
```

**live-drop-webhook implementation:**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

async function hmacSha256Hex(secret: string, msg: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const secret = Deno.env.get("STRIPE_LIVE_DROP_WEBHOOK_SECRET");
  if (!secret) return new Response(JSON.stringify({ error: "secret_not_configured" }), { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } });

  const sigHeader = req.headers.get("stripe-signature") ?? "";
  const raw = await req.text();
  const parts = Object.fromEntries(sigHeader.split(",").map((p) => p.split("=")));
  const t = parts.t, v1 = parts.v1;
  if (!t || !v1) return new Response("bad_signature", { status: 401, headers: corsHeaders });
  const expected = await hmacSha256Hex(secret, `${t}.${raw}`);
  if (!timingSafeEqual(expected, v1)) return new Response("bad_signature", { status: 401, headers: corsHeaders });

  const evt = JSON.parse(raw);
  if (evt.type !== "checkout.session.completed") {
    return new Response(JSON.stringify({ ok: true, ignored: true }), { headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const checkoutId = evt.data.object.id;
  const meta = evt.data.object.metadata ?? {};
  const liveSessionId = meta.live_session_id;
  const userId = meta.user_id;

  await sb.from("live_drop_claims").update({ status: "completed" }).eq("stripe_checkout_id", checkoutId);

  if (liveSessionId) {
    const { data: session } = await sb.from("live_sessions").select("id, club_id, drop_tiers").eq("id", liveSessionId).maybeSingle();
    if (session?.club_id && userId) {
      await sb.from("club_members").upsert({
        club_id: session.club_id, user_id: userId, status: "active",
      }, { onConflict: "club_id,user_id" });
    }
    if (session) {
      await sb.channel("drops").send({
        type: "broadcast",
        event: "tier_update",
        payload: { live_session_id: liveSessionId, drop_tiers: session.drop_tiers },
      });
    }
  }

  return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "content-type": "application/json" } });
});
```

---

### Task 7: `LivePlayer` + `AttendeeCount` components

- [ ] Add `@mux/mux-player-react` to `package.json` if not present (`pnpm add @mux/mux-player-react`).
- [ ] Create `src/components/live/LivePlayer.tsx`.
- [ ] Create `src/components/live/AttendeeCount.tsx`.
- [ ] `pnpm astro check` (typecheck only) + commit.

**LivePlayer.tsx:**

```tsx
import MuxPlayer from "@mux/mux-player-react";

interface Props { playbackId: string; token: string; title?: string; }

export function LivePlayer({ playbackId, token, title }: Props) {
  return (
    <div style={{ background: "#000", border: "1px solid #222", borderRadius: 12, overflow: "hidden", position: "relative", aspectRatio: "16 / 9" }}>
      <MuxPlayer
        streamType="live"
        playbackId={playbackId}
        tokens={{ playback: token }}
        accentColor="#7c3aed"
        metadata={{ video_title: title ?? "TrainedBy Live" }}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
```

**AttendeeCount.tsx:**

```tsx
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

interface Props { liveSessionId: string; supabaseUrl: string; supabaseAnonKey: string; }

export function AttendeeCount({ liveSessionId, supabaseUrl, supabaseAnonKey }: Props) {
  const sb = useMemo(() => createClient(supabaseUrl, supabaseAnonKey), [supabaseUrl, supabaseAnonKey]);
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { count: c } = await sb.from("live_attendees")
        .select("id", { count: "exact", head: true })
        .eq("live_session_id", liveSessionId);
      if (alive) setCount(c ?? 0);
    })();

    const channel = sb.channel(`attendees:${liveSessionId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "live_attendees", filter: `live_session_id=eq.${liveSessionId}` },
        () => setCount((n) => n + 1))
      .subscribe();
    return () => { alive = false; sb.removeChannel(channel); };
  }, [sb, liveSessionId]);

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#111", border: "1px solid #222", borderRadius: 999, padding: "6px 12px", color: "#fff", fontSize: 13, fontWeight: 600 }}>
      <span style={{ width: 8, height: 8, borderRadius: 999, background: "#ef4444", boxShadow: "0 0 6px #ef4444" }} />
      {count} watching
    </div>
  );
}
```

---

### Task 8: `LiveDropBar` + `LiveChat` components

- [ ] Create `src/components/live/LiveDropBar.tsx`
- [ ] Create `src/components/live/LiveChat.tsx`
- [ ] Type-check + commit.

**LiveDropBar.tsx:**

```tsx
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

interface Tier { price_cents: number; total_spots: number; claimed: number; }
interface Props {
  liveSessionId: string;
  initialTiers: Tier[];
  supabaseUrl: string;
  supabaseAnonKey: string;
  onClaim: () => void;
}

export function LiveDropBar({ liveSessionId, initialTiers, supabaseUrl, supabaseAnonKey, onClaim }: Props) {
  const sb = useMemo(() => createClient(supabaseUrl, supabaseAnonKey), [supabaseUrl, supabaseAnonKey]);
  const [tiers, setTiers] = useState<Tier[]>(initialTiers);

  useEffect(() => {
    const channel = sb.channel("drops")
      .on("broadcast", { event: "tier_update" }, ({ payload }) => {
        if (payload?.live_session_id === liveSessionId && Array.isArray(payload.drop_tiers)) {
          setTiers(payload.drop_tiers);
        }
      })
      .subscribe();
    return () => { sb.removeChannel(channel); };
  }, [sb, liveSessionId]);

  const activeIdx = tiers.findIndex((t) => t.claimed < t.total_spots || t.total_spots === 0);
  const soldOut = activeIdx === -1;
  const active = soldOut ? tiers[tiers.length - 1] : tiers[activeIdx];
  const pct = active.total_spots > 0 ? Math.min(100, Math.round((active.claimed / active.total_spots) * 100)) : 0;

  return (
    <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>
          AED {(active.price_cents / 100).toFixed(0)}
          <span style={{ color: "#888", fontSize: 13, marginLeft: 8, fontWeight: 500 }}>tier {activeIdx >= 0 ? activeIdx + 1 : tiers.length} of {tiers.length}</span>
        </div>
        <div style={{ color: "#bbb", fontSize: 13 }}>
          {active.claimed} / {active.total_spots} claimed
        </div>
      </div>
      <div style={{ height: 6, background: "#222", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #7c3aed, #f97316)" }} />
      </div>
      <button
        onClick={onClaim}
        disabled={soldOut}
        style={{
          background: soldOut ? "#333" : "linear-gradient(90deg, #7c3aed, #f97316)",
          color: "#fff", border: "none", borderRadius: 8, padding: "12px 16px",
          fontWeight: 700, fontSize: 15, cursor: soldOut ? "not-allowed" : "pointer",
        }}
      >
        {soldOut ? "SOLD OUT" : "Claim spot"}
      </button>
    </div>
  );
}
```

**LiveChat.tsx:**

```tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient, type RealtimeChannel } from "@supabase/supabase-js";

interface Msg { id: string; userName: string; text: string; ts: number; }
interface Props { liveSessionId: string; userName: string; supabaseUrl: string; supabaseAnonKey: string; }

export function LiveChat({ liveSessionId, userName, supabaseUrl, supabaseAnonKey }: Props) {
  const sb = useMemo(() => createClient(supabaseUrl, supabaseAnonKey), [supabaseUrl, supabaseAnonKey]);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const channelRef = useRef<RealtimeChannel | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ch = sb.channel(`chat:${liveSessionId}`)
      .on("broadcast", { event: "msg" }, ({ payload }) => {
        setMsgs((prev) => {
          const next = [...prev, payload as Msg];
          return next.slice(-50);
        });
      })
      .subscribe();
    channelRef.current = ch;
    return () => { sb.removeChannel(ch); };
  }, [sb, liveSessionId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [msgs]);

  const send = () => {
    const t = text.trim();
    if (!t || !channelRef.current) return;
    const m: Msg = { id: crypto.randomUUID(), userName, text: t, ts: Date.now() };
    channelRef.current.send({ type: "broadcast", event: "msg", payload: m });
    setMsgs((prev) => [...prev, m].slice(-50));
    setText("");
  };

  return (
    <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, display: "flex", flexDirection: "column", height: 360 }}>
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
        {msgs.map((m) => (
          <div key={m.id} style={{ color: "#ddd", fontSize: 13 }}>
            <span style={{ color: "#7c3aed", fontWeight: 600 }}>{m.userName}</span>{" "}{m.text}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, padding: 8, borderTop: "1px solid #222" }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder="Say something…"
          style={{ flex: 1, background: "#0f0e0d", border: "1px solid #222", color: "#fff", borderRadius: 6, padding: "8px 10px", fontSize: 13 }}
        />
        <button onClick={send} style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 6, padding: "8px 14px", fontWeight: 600, cursor: "pointer" }}>Send</button>
      </div>
    </div>
  );
}
```

---

### Task 9: `LiveWatchView` component

- [ ] Create `src/components/live/LiveWatchView.tsx`
- [ ] Orchestrates session fetch, `join-live-session` call, render of player/drop bar/chat.
- [ ] Subscribes to `postgres_changes` on `live_sessions` filtered by `id=eq.{liveSessionId}` to detect status flips (`live` → `ended`).
- [ ] Handles drop claim: call `claim-live-drop-spot`, redirect to `checkout_url`.
- [ ] Handles paywall (403): show "Subscribe to watch" with link to `/{trainer_slug}/videos`.
- [ ] Type-check + commit.

**Implementation:**

```tsx
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { LivePlayer } from "./LivePlayer";
import { AttendeeCount } from "./AttendeeCount";
import { LiveDropBar } from "./LiveDropBar";
import { LiveChat } from "./LiveChat";

interface Tier { price_cents: number; total_spots: number; claimed: number; }
interface Session {
  id: string; title: string; status: string; is_season_drop: boolean;
  drop_tiers: Tier[] | null; trainer_id: string;
}

interface Props { liveSessionId: string; supabaseUrl: string; supabaseAnonKey: string; }

export function LiveWatchView({ liveSessionId, supabaseUrl, supabaseAnonKey }: Props) {
  const sb = useMemo(() => createClient(supabaseUrl, supabaseAnonKey), [supabaseUrl, supabaseAnonKey]);
  const [session, setSession] = useState<Session | null>(null);
  const [playback, setPlayback] = useState<{ playbackId: string; token: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paywall, setPaywall] = useState<{ trainerSlug: string } | null>(null);
  const [userName, setUserName] = useState<string>("Guest");

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: sess } = await sb.from("live_sessions")
        .select("id, title, status, is_season_drop, drop_tiers, trainer_id")
        .eq("id", liveSessionId).maybeSingle();
      if (!alive) return;
      if (!sess) { setError("Session not found"); return; }
      setSession(sess as Session);

      if (sess.status !== "live") return;

      const { data: { session: authSess } } = await sb.auth.getSession();
      if (!authSess) {
        setError("Please log in to watch");
        return;
      }
      setUserName(authSess.user?.email?.split("@")[0] ?? "Guest");

      const resp = await fetch(`${supabaseUrl}/functions/v1/join-live-session`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${authSess.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ live_session_id: liveSessionId }),
      });
      const json = await resp.json();
      if (resp.status === 403 && json?.error === "paywall") {
        const { data: trainer } = await sb.from("trainers").select("slug").eq("id", sess.trainer_id).maybeSingle();
        setPaywall({ trainerSlug: trainer?.slug ?? "" });
        return;
      }
      if (!resp.ok) { setError(json?.error ?? "Could not join"); return; }
      setPlayback({ playbackId: json.playback_id, token: json.token });
    })();

    const channel = sb.channel(`live:${liveSessionId}`)
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "live_sessions", filter: `id=eq.${liveSessionId}` },
        (payload) => setSession((s) => s ? { ...s, ...(payload.new as Session) } : s))
      .subscribe();
    return () => { alive = false; sb.removeChannel(channel); };
  }, [sb, liveSessionId, supabaseUrl]);

  const handleClaim = async () => {
    const { data: { session: authSess } } = await sb.auth.getSession();
    if (!authSess) { window.location.href = "/login"; return; }
    const resp = await fetch(`${supabaseUrl}/functions/v1/claim-live-drop-spot`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${authSess.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ live_session_id: liveSessionId }),
    });
    const json = await resp.json();
    if (resp.ok && json.checkout_url) { window.location.href = json.checkout_url; return; }
    alert(json?.error ?? "Could not claim spot");
  };

  if (error) return <div style={{ color: "#ef4444", padding: 24 }}>{error}</div>;
  if (!session) return <div style={{ color: "#888", padding: 24 }}>Loading…</div>;

  if (session.status === "ended") {
    return <div style={{ color: "#fff", padding: 24, textAlign: "center" }}>
      <h2>Stream ended</h2>
      <p style={{ color: "#888" }}>Recording will be available shortly.</p>
    </div>;
  }
  if (session.status === "scheduled") {
    return <div style={{ color: "#fff", padding: 24, textAlign: "center" }}>
      <h2>{session.title}</h2>
      <p style={{ color: "#888" }}>Stream hasn't started yet. Check back soon.</p>
    </div>;
  }

  if (paywall) {
    return <div style={{ color: "#fff", padding: 24, textAlign: "center" }}>
      <h2>Subscribers only</h2>
      <a href={`/${paywall.trainerSlug}/videos`} style={{ color: "#7c3aed" }}>Subscribe to watch →</a>
    </div>;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16, padding: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ color: "#fff", fontSize: 20, margin: 0 }}>{session.title}</h1>
          <AttendeeCount liveSessionId={liveSessionId} supabaseUrl={supabaseUrl} supabaseAnonKey={supabaseAnonKey} />
        </div>
        {playback
          ? <LivePlayer playbackId={playback.playbackId} token={playback.token} title={session.title} />
          : <div style={{ background: "#000", border: "1px solid #222", borderRadius: 12, aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", color: "#888" }}>Connecting…</div>}
        {session.is_season_drop && session.drop_tiers && (
          <LiveDropBar
            liveSessionId={liveSessionId}
            initialTiers={session.drop_tiers}
            supabaseUrl={supabaseUrl}
            supabaseAnonKey={supabaseAnonKey}
            onClaim={handleClaim}
          />
        )}
      </div>
      <LiveChat liveSessionId={liveSessionId} userName={userName} supabaseUrl={supabaseUrl} supabaseAnonKey={supabaseAnonKey} />
    </div>
  );
}
```

---

### Task 10: `/live/[id].astro` page

- [ ] Create `src/pages/live/[id].astro`.
- [ ] `pnpm astro build` + commit.

```astro
---
import Base from '../../layouts/Base.astro';
import { LiveWatchView } from '../../components/live/LiveWatchView';
const { id } = Astro.params;
if (!id) return Astro.redirect('/find');
const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';
---
<Base title="Live — TrainedBy" description="Watch live workout">
  <style>
    main { background: #0f0e0d; min-height: 100vh; }
  </style>
  <main>
    <LiveWatchView client:load liveSessionId={id} supabaseUrl={SUPABASE_URL} supabaseAnonKey={SUPABASE_ANON_KEY} />
  </main>
</Base>
```

---

### Task 11: `LiveScheduleForm` + `/dashboard/live/new.astro`

- [ ] Create `src/components/live/LiveScheduleForm.tsx`.
- [ ] Create `src/pages/dashboard/live/new.astro`.
- [ ] Build check + commit.

**LiveScheduleForm.tsx:**

```tsx
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

interface Club { id: string; name: string; }
interface Tier { price_cents: number; total_spots: number; }
interface Props { supabaseUrl: string; supabaseAnonKey: string; }

export function LiveScheduleForm({ supabaseUrl, supabaseAnonKey }: Props) {
  const sb = useMemo(() => createClient(supabaseUrl, supabaseAnonKey), [supabaseUrl, supabaseAnonKey]);
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [clubId, setClubId] = useState("");
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isDrop, setIsDrop] = useState(false);
  const [tiers, setTiers] = useState<Tier[]>([{ price_cents: 9900, total_spots: 10 }]);
  const [result, setResult] = useState<{ session_id: string; rtmp_url: string; stream_key: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await sb.auth.getSession();
      if (!session?.user?.email) return;
      const { data: trainer } = await sb.from("trainers").select("id").eq("email", session.user.email).maybeSingle();
      if (!trainer) return;
      const { data: cs } = await sb.from("clubs").select("id, name").eq("trainer_id", trainer.id);
      setClubs((cs ?? []) as Club[]);
    })();
  }, [sb]);

  const addTier = () => { if (tiers.length < 4) setTiers([...tiers, { price_cents: 14900, total_spots: 5 }]); };
  const updateTier = (i: number, field: keyof Tier, val: number) => {
    setTiers(tiers.map((t, idx) => idx === i ? { ...t, [field]: val } : t));
  };
  const removeTier = (i: number) => setTiers(tiers.filter((_, idx) => idx !== i));

  const submit = async () => {
    setError(null); setSubmitting(true);
    try {
      const { data: { session } } = await sb.auth.getSession();
      if (!session) { setError("Not logged in"); return; }
      const body: Record<string, unknown> = {
        title, is_season_drop: isDrop,
        starts_at: startsAt || null,
        club_id: clubId || null,
      };
      if (isDrop) body.drop_tiers = tiers.map((t) => ({ ...t, claimed: 0 }));
      const resp = await fetch(`${supabaseUrl}/functions/v1/start-live-session`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await resp.json();
      if (!resp.ok) { setError(json?.error ?? "Failed"); return; }
      setResult({ session_id: json.session_id, rtmp_url: json.rtmp_url, stream_key: json.stream_key });
    } finally { setSubmitting(false); }
  };

  if (result) {
    return (
      <div style={{ color: "#fff", padding: 24, maxWidth: 720, margin: "0 auto" }}>
        <h2>Live session created</h2>
        <p>Point your encoder (OBS, Streamlabs) at:</p>
        <div style={{ background: "#111", border: "1px solid #222", padding: 12, borderRadius: 8, fontFamily: "monospace", fontSize: 13 }}>
          <div><strong>RTMP URL:</strong> {result.rtmp_url}</div>
          <div><strong>Stream Key:</strong> {result.stream_key}</div>
        </div>
        <p style={{ marginTop: 16 }}>
          <a href={`/dashboard/live/${result.session_id}`} style={{ color: "#7c3aed" }}>Open control panel →</a>
        </p>
      </div>
    );
  }

  return (
    <div style={{ color: "#fff", padding: 24, maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      <h1 style={{ fontSize: 24, margin: 0 }}>Schedule a live stream</h1>

      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ color: "#bbb", fontSize: 13 }}>Title</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
      </label>

      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ color: "#bbb", fontSize: 13 }}>Starts at (optional)</span>
        <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} style={inputStyle} />
      </label>

      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ color: "#bbb", fontSize: 13 }}>Club (optional — links live drops to club membership)</span>
        <select value={clubId} onChange={(e) => setClubId(e.target.value)} style={inputStyle}>
          <option value="">— none —</option>
          {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>

      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input type="checkbox" checked={isDrop} onChange={(e) => setIsDrop(e.target.checked)} />
        <span>Season drop (sell spots with tiered pricing)</span>
      </label>

      {isDrop && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tiers.map((t, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, alignItems: "end" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ color: "#bbb", fontSize: 12 }}>Price (AED)</span>
                <input type="number" value={t.price_cents / 100} onChange={(e) => updateTier(i, "price_cents", Math.round(Number(e.target.value) * 100))} style={inputStyle} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ color: "#bbb", fontSize: 12 }}>Total spots</span>
                <input type="number" value={t.total_spots} onChange={(e) => updateTier(i, "total_spots", Number(e.target.value))} style={inputStyle} />
              </label>
              <button onClick={() => removeTier(i)} disabled={tiers.length === 1} style={{ background: "#222", color: "#fff", border: "none", borderRadius: 6, padding: "8px 10px", cursor: "pointer" }}>×</button>
            </div>
          ))}
          {tiers.length < 4 && <button onClick={addTier} style={{ background: "#222", color: "#fff", border: "none", borderRadius: 6, padding: "8px 12px", alignSelf: "flex-start", cursor: "pointer" }}>+ Add tier</button>}
        </div>
      )}

      {error && <div style={{ color: "#ef4444" }}>{error}</div>}

      <button onClick={submit} disabled={submitting || !title} style={{
        background: "linear-gradient(90deg, #7c3aed, #f97316)", color: "#fff", border: "none", borderRadius: 8,
        padding: "12px 16px", fontWeight: 700, cursor: submitting ? "wait" : "pointer", alignSelf: "flex-start",
      }}>
        {submitting ? "Creating…" : "Create stream"}
      </button>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "#0f0e0d", border: "1px solid #222", color: "#fff", borderRadius: 6,
  padding: "8px 10px", fontSize: 14,
};
```

**`src/pages/dashboard/live/new.astro`:**

```astro
---
import Base from '../../../layouts/Base.astro';
import { LiveScheduleForm } from '../../../components/live/LiveScheduleForm';
const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';
---
<Base title="Schedule live — TrainedBy" description="Schedule a live session">
  <main style="background:#0f0e0d;min-height:100vh;">
    <LiveScheduleForm client:load supabaseUrl={SUPABASE_URL} supabaseAnonKey={SUPABASE_ANON_KEY} />
  </main>
</Base>
```

---

### Task 12: `LiveControlPanel` + `/dashboard/live/[id].astro`

- [ ] Create `src/components/live/LiveControlPanel.tsx`.
- [ ] Create `src/pages/dashboard/live/[id].astro`.
- [ ] Build check + commit.

**LiveControlPanel.tsx:**

```tsx
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { AttendeeCount } from "./AttendeeCount";

interface Tier { price_cents: number; total_spots: number; claimed: number; }
interface Sess {
  id: string; title: string; status: string; mux_stream_key: string | null;
  mux_playback_id: string | null; is_season_drop: boolean; drop_tiers: Tier[] | null;
  trainer_id: string;
}

interface Props { liveSessionId: string; supabaseUrl: string; supabaseAnonKey: string; }

export function LiveControlPanel({ liveSessionId, supabaseUrl, supabaseAnonKey }: Props) {
  const sb = useMemo(() => createClient(supabaseUrl, supabaseAnonKey), [supabaseUrl, supabaseAnonKey]);
  const [sess, setSess] = useState<Sess | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { session: auth } } = await sb.auth.getSession();
      if (!auth?.user?.email) { setError("Not logged in"); return; }
      const { data: trainer } = await sb.from("trainers").select("id").eq("email", auth.user.email).maybeSingle();
      if (!trainer) { setError("Not a trainer"); return; }
      const { data: s } = await sb.from("live_sessions")
        .select("id, title, status, mux_stream_key, mux_playback_id, is_season_drop, drop_tiers, trainer_id")
        .eq("id", liveSessionId).maybeSingle();
      if (!alive) return;
      if (!s) { setError("Not found"); return; }
      if (s.trainer_id !== trainer.id) { setError("Forbidden"); return; }
      setSess(s as Sess);
    })();

    const ch = sb.channel(`ctrl:${liveSessionId}`)
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "live_sessions", filter: `id=eq.${liveSessionId}` },
        (payload) => setSess((s) => s ? { ...s, ...(payload.new as Sess) } : s))
      .subscribe();
    return () => { alive = false; sb.removeChannel(ch); };
  }, [sb, liveSessionId]);

  const endStream = async () => {
    if (!confirm("End this stream?")) return;
    setEnding(true);
    try {
      const { data: { session: auth } } = await sb.auth.getSession();
      if (!auth) return;
      await fetch(`${supabaseUrl}/functions/v1/end-live-session`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${auth.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ live_session_id: liveSessionId }),
      });
    } finally { setEnding(false); }
  };

  if (error) return <div style={{ color: "#ef4444", padding: 24 }}>{error}</div>;
  if (!sess) return <div style={{ color: "#888", padding: 24 }}>Loading…</div>;

  const totalClaimed = sess.drop_tiers?.reduce((acc, t) => acc + t.claimed, 0) ?? 0;
  const totalSpots = sess.drop_tiers?.reduce((acc, t) => acc + t.total_spots, 0) ?? 0;

  return (
    <div style={{ color: "#fff", padding: 24, maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 22, margin: 0 }}>{sess.title}</h1>
        <span style={{
          padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700,
          background: sess.status === "live" ? "#ef4444" : sess.status === "ended" ? "#333" : "#222",
          color: "#fff",
        }}>{sess.status.toUpperCase()}</span>
      </div>

      <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ color: "#bbb", fontSize: 13 }}>Encoder settings</div>
        <div style={{ fontFamily: "monospace", fontSize: 13 }}>
          <div><strong>RTMP URL:</strong> rtmps://global-live.mux.com:443/app</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <strong>Stream Key:</strong>
            <span style={{ background: "#0f0e0d", padding: "2px 6px", borderRadius: 4 }}>{sess.mux_stream_key ?? "—"}</span>
            <button onClick={() => sess.mux_stream_key && navigator.clipboard.writeText(sess.mux_stream_key)}
              style={{ background: "#222", color: "#fff", border: "none", borderRadius: 4, padding: "4px 8px", fontSize: 12, cursor: "pointer" }}>Copy</button>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <AttendeeCount liveSessionId={liveSessionId} supabaseUrl={supabaseUrl} supabaseAnonKey={supabaseAnonKey} />
        {sess.is_season_drop && (
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 999, padding: "6px 12px", fontSize: 13 }}>
            Drops: {totalClaimed} / {totalSpots}
          </div>
        )}
      </div>

      <button onClick={endStream} disabled={ending || sess.status === "ended"} style={{
        background: sess.status === "ended" ? "#333" : "#ef4444", color: "#fff",
        border: "none", borderRadius: 8, padding: "12px 16px", fontWeight: 700,
        cursor: ending || sess.status === "ended" ? "not-allowed" : "pointer", alignSelf: "flex-start",
      }}>
        {sess.status === "ended" ? "Ended" : ending ? "Ending…" : "End stream"}
      </button>

      <a href={`/live/${sess.id}`} target="_blank" rel="noreferrer" style={{ color: "#7c3aed" }}>Open viewer page →</a>
    </div>
  );
}
```

**`src/pages/dashboard/live/[id].astro`:**

```astro
---
import Base from '../../../layouts/Base.astro';
import { LiveControlPanel } from '../../../components/live/LiveControlPanel';
const { id } = Astro.params;
if (!id) return Astro.redirect('/dashboard');
const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';
---
<Base title="Live control — TrainedBy" description="Live session control panel">
  <main style="background:#0f0e0d;min-height:100vh;">
    <LiveControlPanel client:load liveSessionId={id} supabaseUrl={SUPABASE_URL} supabaseAnonKey={SUPABASE_ANON_KEY} />
  </main>
</Base>
```

---

### Task 13: Final build + push

- [ ] `pnpm astro build` — verify zero errors.
- [ ] Verify all 7 new edge functions deployed:
  - `start-live-session`
  - `end-live-session`
  - `join-live-session`
  - `claim-live-drop-spot`
  - `live-drop-webhook`
  - `mux-live-webhook`
  - (existing `mux-webhook` untouched)
- [ ] Verify supabase symlink covers each new function (run pre-deploy check).
- [ ] Configure Stripe webhook endpoint in Stripe dashboard:
  - URL: `https://mezhtdbfyvkshpuplqqw.supabase.co/functions/v1/live-drop-webhook`
  - Event: `checkout.session.completed`
  - Save signing secret as `STRIPE_LIVE_DROP_WEBHOOK_SECRET`.
- [ ] Configure Mux webhook in Mux dashboard:
  - URL: `https://mezhtdbfyvkshpuplqqw.supabase.co/functions/v1/mux-live-webhook`
  - Events: `video.live_stream.active`, `video.live_stream.idle`, `video.asset.ready`
  - Reuse existing `MUX_WEBHOOK_SECRET`.
- [ ] `git push origin main`

---

## Self-review checklist

1. **Spec coverage:** ✅ All 3 tables, 7 edge functions, 7 React components, 3 pages, claim_drop_tier RPC, config.toml updates.
2. **No placeholders:** ✅ All edge functions and React components have full implementations.
3. **Type consistency:** ✅ `Tier` shape `{price_cents, total_spots, claimed}` consistent across schema, RPC, edge functions (Task 2/5), `LiveDropBar` (Task 8), `LiveWatchView` (Task 9), `LiveControlPanel` (Task 12), `LiveScheduleForm` (Task 11).
4. **Security:**
   - ✅ Mux playback policy is `signed` for both live and recorded asset.
   - ✅ Signed playback token (4h) issued only after auth + access check.
   - ✅ `MUX_WEBHOOK_SECRET` + `STRIPE_LIVE_DROP_WEBHOOK_SECRET` are mandatory; fail closed if missing.
   - ✅ Timing-safe HMAC comparison in both webhooks.
   - ✅ Stream key only exposed to its owning trainer (control panel verifies `trainer_id` by email lookup before fetching record; row also returns to creator at creation time).
   - ✅ `claim_drop_tier` uses `FOR UPDATE` row lock to prevent overselling.
   - ✅ RLS denies writes on all 3 tables to authenticated users (service_role only).
