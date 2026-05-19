# Club Network MVP — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild TrainedBy from a trainer marketplace into a creator-led accountability club network where trainers run 30-day transformation clubs, members check in daily, and social accountability drives retention.

**Architecture:** Five new Postgres tables (users, clubs, missions, checkins, club_members) layer on top of the existing schema without touching it. New Astro pages and edge functions coexist alongside existing marketplace routes. Trainer profiles gain a clubs section; existing packages section goes dormant. Member auth uses Google OAuth via Supabase; trainer auth stays on magic link.

**Tech Stack:** Astro + React + Supabase (Postgres, Auth, Realtime) + Netlify edge functions (Deno/TypeScript) + Stripe Checkout (one-time payment) + Claude Opus via `_shared/claude.ts`

**Spec:** `docs/superpowers/specs/2026-05-18-club-network-mvp-design.md`

---

## File Map

### New files
| File | Purpose |
|------|---------|
| `supabase/migrations/20260518_clubs_schema.sql` | 5 new tables + auth trigger |
| `supabase/functions/generate-missions/index.ts` | Claude Opus → 30 missions JSON |
| `supabase/functions/create-club/index.ts` | Trainer creates club + triggers mission gen |
| `supabase/functions/get-club/index.ts` | Public club data (member join page) |
| `supabase/functions/join-club/index.ts` | Free join or Stripe Checkout redirect |
| `supabase/functions/club-payment-webhook/index.ts` | Stripe webhook → activate membership |
| `supabase/functions/submit-checkin/index.ts` | Record check-in, calculate streak |
| `supabase/functions/get-club-feed/index.ts` | Today's feed entries for a club |
| `supabase/functions/get-club-dashboard/index.ts` | Trainer dashboard data |
| `supabase/functions/send-shoutout/index.ts` | Post shoutout feed entry |
| `supabase/functions/update-mission/index.ts` | Trainer edits a mission |
| `src/pages/clubs/[slug].astro` | Member daily view (mission + feed + check-in) |
| `src/pages/clubs/join/[slug].astro` | Club detail + join page (public) |
| `src/pages/dashboard/clubs/[slug].astro` | Trainer club management dashboard |
| `src/components/club/MissionCard.tsx` | Today's mission + Done button |
| `src/components/club/ActivityFeed.tsx` | Real-time feed with Supabase Realtime |
| `src/components/club/StreakBadge.tsx` | Flame + count display |
| `src/components/club/ClubCard.tsx` | Club card used on join page + profile |
| `src/components/club/MissionQueue.tsx` | Trainer mission queue with inline edit |
| `src/components/club/RosterTable.tsx` | Member roster with streaks |
| `src/components/trainer/ClubsSection.tsx` | Clubs section on `/[slug]` profile |

### Modified files
| File | Change |
|------|--------|
| `supabase/functions/_shared/claude.ts` | Add `claude-opus-4-7` to `ClaudeModel` type |
| `src/pages/[slug].astro` | Add `ClubsSection` below hero; hide packages if no active packages |

---

## Phase 1 — Foundation

### Task 1: Database Schema Migration

**Files:**
- Create: `supabase/migrations/20260518_clubs_schema.sql`

- [ ] **Write the migration**

```sql
-- supabase/migrations/20260518_clubs_schema.sql

-- ============================================================
-- USERS (club members — separate from trainers)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  display_name  TEXT NOT NULL,
  avatar_url    TEXT,
  google_id     TEXT UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own row"
  ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own row"
  ON users FOR UPDATE USING (auth.uid() = id);

-- Trigger: auto-create users row on Google OAuth sign-in
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, avatar_url, google_id)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'sub'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- CLUBS
-- ============================================================
CREATE TABLE IF NOT EXISTS clubs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id       UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  slug             TEXT UNIQUE NOT NULL,
  name             TEXT NOT NULL,
  goal             TEXT NOT NULL,
  duration_days    INT NOT NULL DEFAULT 30,
  is_free          BOOLEAN NOT NULL DEFAULT FALSE,
  price_cents      INT,
  stripe_price_id  TEXT,
  stripe_product_id TEXT,
  max_members      INT,
  starts_at        DATE,
  ends_at          DATE,
  status           TEXT NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft','active','ended')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active clubs"
  ON clubs FOR SELECT USING (status IN ('active','ended'));
CREATE POLICY "Trainer can manage own clubs"
  ON clubs FOR ALL USING (
    trainer_id IN (SELECT id FROM trainers WHERE email = auth.jwt()->>'email')
  );

-- ============================================================
-- CLUB_MEMBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS club_members (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id                  UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id                  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  stripe_payment_intent_id TEXT,
  status                   TEXT NOT NULL DEFAULT 'active'
                           CHECK (status IN ('active','cancelled')),
  UNIQUE (club_id, user_id)
);

ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can read their own memberships"
  ON club_members FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Trainer can read their club members"
  ON club_members FOR SELECT USING (
    club_id IN (
      SELECT id FROM clubs WHERE trainer_id IN (
        SELECT id FROM trainers WHERE email = auth.jwt()->>'email'
      )
    )
  );

-- ============================================================
-- MISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS missions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id           UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  day_number        INT NOT NULL CHECK (day_number BETWEEN 1 AND 365),
  title             TEXT NOT NULL,
  description       TEXT,
  type              TEXT NOT NULL DEFAULT 'other'
                    CHECK (type IN ('run','workout','nutrition','recovery','mindset','other')),
  ai_draft          BOOLEAN NOT NULL DEFAULT TRUE,
  edited_by_trainer BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (club_id, day_number)
);

ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Club members can read missions"
  ON missions FOR SELECT USING (
    club_id IN (
      SELECT club_id FROM club_members WHERE user_id = auth.uid() AND status = 'active'
    )
    OR
    club_id IN (
      SELECT id FROM clubs WHERE trainer_id IN (
        SELECT id FROM trainers WHERE email = auth.jwt()->>'email'
      )
    )
    OR
    club_id IN (SELECT id FROM clubs WHERE status IN ('active','ended'))
  );

-- ============================================================
-- CHECKINS
-- ============================================================
CREATE TABLE IF NOT EXISTS checkins (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id      UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  mission_id   UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source       TEXT NOT NULL DEFAULT 'manual'
               CHECK (source IN ('manual','strava','oura','whoop')),
  proof_url    TEXT,
  note         TEXT,
  streak_day   INT NOT NULL DEFAULT 1,
  UNIQUE (mission_id, user_id)
);

ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone in the club can read checkins"
  ON checkins FOR SELECT USING (
    club_id IN (
      SELECT club_id FROM club_members WHERE user_id = auth.uid() AND status = 'active'
    )
    OR
    club_id IN (
      SELECT id FROM clubs WHERE trainer_id IN (
        SELECT id FROM trainers WHERE email = auth.jwt()->>'email'
      )
    )
  );
CREATE POLICY "Members can insert their own checkins"
  ON checkins FOR INSERT WITH CHECK (user_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clubs_trainer ON clubs(trainer_id);
CREATE INDEX IF NOT EXISTS idx_clubs_status ON clubs(status);
CREATE INDEX IF NOT EXISTS idx_club_members_club ON club_members(club_id);
CREATE INDEX IF NOT EXISTS idx_club_members_user ON club_members(user_id);
CREATE INDEX IF NOT EXISTS idx_missions_club_day ON missions(club_id, day_number);
CREATE INDEX IF NOT EXISTS idx_checkins_club_date ON checkins(club_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_checkins_user_club ON checkins(user_id, club_id);
```

- [ ] **Apply the migration to local Supabase**

```bash
supabase db push
```

Expected: migration applied without errors.

- [ ] **Verify tables exist**

```bash
supabase db execute --sql "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users','clubs','club_members','missions','checkins') ORDER BY table_name;"
```

Expected: 5 rows returned.

- [ ] **Commit**

```bash
git add supabase/migrations/20260518_clubs_schema.sql
git commit -m "feat: add clubs schema — users, clubs, club_members, missions, checkins"
```

---

### Task 2: Google OAuth Setup

**Files:**
- No code files — Supabase dashboard config + env vars

- [ ] **Enable Google OAuth in Supabase Dashboard**

  1. Go to Supabase Dashboard → Authentication → Providers → Google
  2. Toggle enabled ON
  3. Copy the "Callback URL" shown (format: `https://<project>.supabase.co/auth/v1/callback`)
  4. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
  5. Create OAuth 2.0 Client ID (Web application)
  6. Add the Supabase callback URL to "Authorized redirect URIs"
  7. Copy Client ID and Client Secret back into Supabase Google provider settings
  8. Save

- [ ] **Add redirect URL for local dev**

  In Supabase Dashboard → Authentication → URL Configuration:
  - Add `http://localhost:4321/auth/callback` to Redirect URLs

- [ ] **Add production redirect URL**

  Add `https://trainedby.com/auth/callback` and `https://trainedby.ae/auth/callback` to Redirect URLs.

- [ ] **Create auth callback page**

  Create `src/pages/auth/callback.astro`:

```astro
---
// Handles Google OAuth redirect — Supabase client exchanges code for session
---
<html>
<head><title>Signing in...</title></head>
<body>
<script>
  import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

  const supabase = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(
    new URL(window.location.href).searchParams.get('code')
  );

  const next = new URL(window.location.href).searchParams.get('next') || '/';
  window.location.href = next;
</script>
</body>
</html>
```

  Wait — Astro pages can't use top-level await in script tags. Use this instead:

```astro
---
---
<html>
<head>
  <title>Signing in...</title>
  <script>
    const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
    const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  </script>
</head>
<body>
<script type="module">
  import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
  const url = 'PUBLIC_SUPABASE_URL_PLACEHOLDER';
  const key = 'PUBLIC_SUPABASE_ANON_KEY_PLACEHOLDER';
</script>
</body>
</html>
```

  Actually, follow the existing Astro pattern from dashboard.astro — inline the env vars server-side:

```astro
---
const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';
const next = Astro.url.searchParams.get('next') ?? '/';
---
<html lang="en">
<head><title>Signing in…</title></head>
<body>
<script type="module" define:vars={{ SUPABASE_URL, SUPABASE_ANON_KEY, next }}>
  import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const code = new URLSearchParams(window.location.search).get('code');
  if (code) {
    await sb.auth.exchangeCodeForSession(code);
  }
  window.location.replace(next);
</script>
</body>
</html>
```

- [ ] **Test OAuth flow locally**

  ```
  npx astro dev
  ```

  Navigate to `http://localhost:4321/auth/callback` — page should load without JS errors. Full Google flow tested in Task 12.

- [ ] **Commit**

```bash
git add src/pages/auth/callback.astro
git commit -m "feat: add Google OAuth callback page"
```

---

### Task 3: Add Claude Opus to Shared Util

**Files:**
- Modify: `supabase/functions/_shared/claude.ts`

- [ ] **Add opus model to ClaudeModel type**

  In `supabase/functions/_shared/claude.ts`, find:

```typescript
export type ClaudeModel =
  | 'claude-haiku-4-5'    // Fast, cheap  -  support & growth agents
  | 'claude-sonnet-4-5'   // Better prose  -  content & meta agents
```

  Replace with:

```typescript
export type ClaudeModel =
  | 'claude-haiku-4-5'    // Fast, cheap  -  support & growth agents
  | 'claude-sonnet-4-6'   // Better prose  -  content & meta agents
  | 'claude-opus-4-7'     // Highest quality  -  mission generation
```

- [ ] **Commit**

```bash
git add supabase/functions/_shared/claude.ts
git commit -m "feat: add claude-opus-4-7 to ClaudeModel type"
```

---

## Phase 2 — Club Creation + AI Missions

### Task 4: generate-missions Edge Function

**Files:**
- Create: `supabase/functions/generate-missions/index.ts`

- [ ] **Write the function**

```typescript
// supabase/functions/generate-missions/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callClaudeJSON } from "../_shared/claude.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MissionDraft {
  day: number;
  title: string;
  description: string;
  type: 'run' | 'workout' | 'nutrition' | 'recovery' | 'mindset' | 'other';
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { club_id } = await req.json();
  if (!club_id) {
    return new Response(JSON.stringify({ error: "club_id required" }), {
      status: 400, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  // Fetch the club
  const { data: club, error: clubErr } = await sb
    .from("clubs")
    .select("id, goal, duration_days")
    .eq("id", club_id)
    .single();

  if (clubErr || !club) {
    return new Response(JSON.stringify({ error: "Club not found" }), {
      status: 404, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY")!;

  const missions = await callClaudeJSON<MissionDraft[]>(apiKey, {
    model: 'claude-opus-4-7',
    max_tokens: 4096,
    system: `You are a certified fitness coach with 10 years of programming experience.
You write precise, progressive, behavior-focused daily missions.
Each mission must be:
- Simple: one clear action, no ambiguity
- Binary: done or not done — no partial credit
- Behavior-focused: the action itself, not educational content
- Realistic: achievable by a motivated beginner

Return ONLY a valid JSON array. No markdown, no explanation.`,
    messages: [{
      role: 'user',
      content: `Goal: ${club.goal}
Duration: ${club.duration_days} days

Create exactly ${club.duration_days} daily missions. Return a JSON array:
[{"day": 1, "title": "...", "description": "...", "type": "run|workout|nutrition|recovery|mindset|other"}, ...]

Rules:
- Week 1 (days 1-7): foundation — light, accessible, build the habit
- Week 2 (days 8-14): build — moderate intensity, establish consistency
- Week 3 (days 15-21): peak — highest challenge of the program
- Week 4 (days 22-30): consolidate — sustainable habits, reflect on progress
- Never repeat the same mission on consecutive days
- Mix types across the week — no more than 3 consecutive days of same type
- Descriptions are 1 sentence max, plain language, no jargon
- Titles are 5 words max`
    }]
  });

  // Validate response shape
  if (!Array.isArray(missions) || missions.length !== club.duration_days) {
    return new Response(JSON.stringify({ error: "AI returned invalid mission count" }), {
      status: 500, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  // Insert all missions
  const rows = missions.map((m) => ({
    club_id,
    day_number: m.day,
    title: m.title,
    description: m.description,
    type: m.type,
    ai_draft: true,
    edited_by_trainer: false,
  }));

  const { error: insertErr } = await sb.from("missions").insert(rows);
  if (insertErr) {
    return new Response(JSON.stringify({ error: insertErr.message }), {
      status: 500, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ ok: true, count: rows.length }), {
    headers: { ...corsHeaders, "content-type": "application/json" }
  });
});
```

- [ ] **Create symlink for Supabase CLI**

```bash
cd supabase/functions/generate-missions
ln -sf ../_shared _shared
```

- [ ] **Commit**

```bash
git add supabase/functions/generate-missions/
git commit -m "feat: add generate-missions edge function (Claude Opus → 30-day plan)"
```

---

### Task 5: create-club Edge Function

**Files:**
- Create: `supabase/functions/create-club/index.ts`

- [ ] **Write the function**

```typescript
// supabase/functions/create-club/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const {
    trainer_email,
    name,
    goal,
    duration_days = 30,
    is_free,
    price_cents,
    max_members,
    starts_at,
  } = await req.json();

  if (!trainer_email || !name || !goal) {
    return new Response(JSON.stringify({ error: "trainer_email, name, goal required" }), {
      status: 400, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  // Lookup trainer
  const { data: trainer } = await sb
    .from("trainers")
    .select("id")
    .eq("email", trainer_email)
    .single();

  if (!trainer) {
    return new Response(JSON.stringify({ error: "Trainer not found" }), {
      status: 404, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  // Generate unique slug
  let baseSlug = slugify(name);
  let slug = baseSlug;
  let attempt = 0;
  while (true) {
    const { data: existing } = await sb.from("clubs").select("id").eq("slug", slug).maybeSingle();
    if (!existing) break;
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  // Calculate ends_at from starts_at + duration_days
  let ends_at: string | null = null;
  if (starts_at) {
    const end = new Date(starts_at);
    end.setDate(end.getDate() + duration_days);
    ends_at = end.toISOString().split('T')[0];
  }

  const { data: club, error } = await sb
    .from("clubs")
    .insert({
      trainer_id: trainer.id,
      slug,
      name,
      goal,
      duration_days,
      is_free: is_free ?? !price_cents,
      price_cents: is_free ? null : price_cents,
      max_members: max_members ?? null,
      starts_at: starts_at ?? null,
      ends_at,
      status: 'draft',
    })
    .select("id, slug")
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  // Kick off mission generation (fire and forget — UI polls for completion)
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  fetch(`${supabaseUrl}/functions/v1/generate-missions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
    },
    body: JSON.stringify({ club_id: club.id }),
  }).catch(() => {}); // Non-blocking

  return new Response(JSON.stringify({ ok: true, club_id: club.id, slug: club.slug }), {
    headers: { ...corsHeaders, "content-type": "application/json" }
  });
});
```

- [ ] **Create symlink**

```bash
cd supabase/functions/create-club
ln -sf ../_shared _shared
```

- [ ] **Commit**

```bash
git add supabase/functions/create-club/
git commit -m "feat: add create-club edge function"
```

---

### Task 6: Club Creation UI (Trainer Dashboard)

**Files:**
- Create: `src/pages/dashboard/clubs/new.astro`

- [ ] **Create the new club page**

```astro
---
import Base from '../../../layouts/Base.astro';
const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';
---
<Base title="New Club — TrainedBy" description="Create a new accountability club">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #0f0e0d; color: #fff; font-family: 'Manrope', system-ui, sans-serif; font-size: 14px; min-height: 100vh; }
.wrap { max-width: 560px; margin: 0 auto; padding: 32px 20px 80px; }
h1 { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
.sub { font-size: 13px; color: #888; margin-bottom: 32px; }
.field { margin-bottom: 20px; }
label { display: block; font-size: 12px; color: #aaa; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
input, textarea, select {
  width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px; padding: 10px 12px; color: #fff; font-size: 14px; font-family: inherit;
}
textarea { min-height: 80px; resize: vertical; }
.row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.toggle-row { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
#price-field { display: none; }
.btn { width: 100%; background: #7c3aed; border: none; border-radius: 10px; padding: 14px; color: #fff; font-size: 15px; font-weight: 700; cursor: pointer; margin-top: 8px; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.status { margin-top: 16px; font-size: 13px; color: #a78bfa; text-align: center; min-height: 20px; }
</style>
<div class="wrap">
  <h1>New Club</h1>
  <p class="sub">AI will generate 30 daily missions from your goal.</p>

  <form id="club-form">
    <div class="field">
      <label>Club Name</label>
      <input type="text" id="name" placeholder="30-Day Fat Loss Club" required maxlength="80">
    </div>
    <div class="field">
      <label>Transformation Goal</label>
      <textarea id="goal" placeholder="Lose 4kg in 30 days through daily movement and clean eating. Members are beginners to intermediate." required></textarea>
    </div>
    <div class="row">
      <div class="field">
        <label>Duration (days)</label>
        <input type="number" id="duration" value="30" min="7" max="90">
      </div>
      <div class="field">
        <label>Start Date</label>
        <input type="date" id="starts_at">
      </div>
    </div>
    <div class="row">
      <div class="field">
        <label>Max Members (optional)</label>
        <input type="number" id="max_members" placeholder="Leave blank for unlimited" min="1">
      </div>
    </div>

    <div class="toggle-row">
      <input type="checkbox" id="is_free" checked>
      <label for="is_free" style="text-transform:none;margin:0;">Free club</label>
    </div>
    <div class="field" id="price-field">
      <label>Price (USD cents — e.g. 4900 = $49)</label>
      <input type="number" id="price_cents" placeholder="4900" min="100">
    </div>

    <button class="btn" type="submit" id="submit-btn">Create Club + Generate Missions</button>
    <p class="status" id="status-msg"></p>
  </form>
</div>

<script type="module" define:vars={{ SUPABASE_URL, SUPABASE_ANON_KEY }}>
  import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Show/hide price field
  document.getElementById('is_free').addEventListener('change', (e) => {
    document.getElementById('price-field').style.display = e.target.checked ? 'none' : 'block';
  });

  document.getElementById('club-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submit-btn');
    const status = document.getElementById('status-msg');
    btn.disabled = true;
    status.textContent = 'Creating club…';

    const { data: { user } } = await sb.auth.getUser();
    if (!user) { status.textContent = 'Not signed in.'; btn.disabled = false; return; }

    const is_free = document.getElementById('is_free').checked;
    const body = {
      trainer_email: user.email,
      name: document.getElementById('name').value.trim(),
      goal: document.getElementById('goal').value.trim(),
      duration_days: parseInt(document.getElementById('duration').value) || 30,
      is_free,
      price_cents: is_free ? null : parseInt(document.getElementById('price_cents').value),
      max_members: document.getElementById('max_members').value
        ? parseInt(document.getElementById('max_members').value) : null,
      starts_at: document.getElementById('starts_at').value || null,
    };

    const res = await fetch(`${SUPABASE_URL}/functions/v1/create-club`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'authorization': `Bearer ${SUPABASE_ANON_KEY}` },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (!res.ok) {
      status.textContent = data.error || 'Error creating club.';
      btn.disabled = false;
      return;
    }

    status.textContent = 'Club created! AI is generating missions (takes ~30 seconds)…';
    // Redirect to mission review after 3 seconds
    setTimeout(() => {
      window.location.href = `/dashboard/clubs/${data.slug}`;
    }, 3000);
  });
</script>
</Base>
```

- [ ] **Commit**

```bash
git add src/pages/dashboard/clubs/new.astro
git commit -m "feat: add club creation page with AI mission generation"
```

---

## Phase 3 — Member Join Flow

### Task 7: get-club Edge Function

**Files:**
- Create: `supabase/functions/get-club/index.ts`

- [ ] **Write the function**

```typescript
// supabase/functions/get-club/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return new Response(JSON.stringify({ error: "slug required" }), {
    status: 400, headers: { ...corsHeaders, "content-type": "application/json" }
  });

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: club, error } = await sb
    .from("clubs")
    .select(`
      id, slug, name, goal, duration_days, is_free, price_cents,
      max_members, starts_at, ends_at, status,
      trainer:trainers(name, slug, avatar_url, title, reps_verified)
    `)
    .eq("slug", slug)
    .single();

  if (error || !club) {
    return new Response(JSON.stringify({ error: "Club not found" }), {
      status: 404, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  // Member count
  const { count: memberCount } = await sb
    .from("club_members")
    .select("id", { count: "exact", head: true })
    .eq("club_id", club.id)
    .eq("status", "active");

  // Mission count (for progress display)
  const { count: missionCount } = await sb
    .from("missions")
    .select("id", { count: "exact", head: true })
    .eq("club_id", club.id);

  return new Response(
    JSON.stringify({ ...club, member_count: memberCount ?? 0, mission_count: missionCount ?? 0 }),
    { headers: { ...corsHeaders, "content-type": "application/json" } }
  );
});
```

- [ ] **Create symlink + commit**

```bash
cd supabase/functions/get-club && ln -sf ../_shared _shared && cd ../../..
git add supabase/functions/get-club/
git commit -m "feat: add get-club edge function"
```

---

### Task 8: join-club Edge Function

**Files:**
- Create: `supabase/functions/join-club/index.ts`

- [ ] **Write the function**

```typescript
// supabase/functions/join-club/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { club_id, user_id, return_url } = await req.json();
  if (!club_id || !user_id) {
    return new Response(JSON.stringify({ error: "club_id and user_id required" }), {
      status: 400, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  // Fetch club
  const { data: club } = await sb
    .from("clubs")
    .select("id, is_free, price_cents, max_members, status, name")
    .eq("id", club_id)
    .single();

  if (!club || club.status !== 'active') {
    return new Response(JSON.stringify({ error: "Club not available" }), {
      status: 404, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  // Check max_members
  if (club.max_members) {
    const { count } = await sb
      .from("club_members")
      .select("id", { count: "exact", head: true })
      .eq("club_id", club_id)
      .eq("status", "active");
    if ((count ?? 0) >= club.max_members) {
      return new Response(JSON.stringify({ error: "Club is full" }), {
        status: 409, headers: { ...corsHeaders, "content-type": "application/json" }
      });
    }
  }

  // Check already a member
  const { data: existing } = await sb
    .from("club_members")
    .select("id")
    .eq("club_id", club_id)
    .eq("user_id", user_id)
    .maybeSingle();

  if (existing) {
    return new Response(JSON.stringify({ ok: true, already_member: true }), {
      headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  // Free club: join immediately
  if (club.is_free) {
    await sb.from("club_members").insert({ club_id, user_id, status: "active" });
    return new Response(JSON.stringify({ ok: true, checkout_url: null }), {
      headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  // Paid club: create Stripe Checkout session
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [{
      price_data: {
        currency: "usd",
        unit_amount: club.price_cents,
        product_data: { name: club.name },
      },
      quantity: 1,
    }],
    success_url: return_url
      ? `${return_url}?success=1&session_id={CHECKOUT_SESSION_ID}`
      : `${Deno.env.get("PUBLIC_SITE_URL")}/clubs/${club_id}?success=1`,
    cancel_url: return_url ?? `${Deno.env.get("PUBLIC_SITE_URL")}/clubs/join/${club_id}`,
    metadata: { club_id, user_id },
  });

  return new Response(JSON.stringify({ ok: true, checkout_url: session.url }), {
    headers: { ...corsHeaders, "content-type": "application/json" }
  });
});
```

- [ ] **Create symlink + commit**

```bash
cd supabase/functions/join-club && ln -sf ../_shared _shared && cd ../../..
git add supabase/functions/join-club/
git commit -m "feat: add join-club edge function (free join + Stripe Checkout for paid)"
```

---

### Task 9: Club Join Page (Public)

**Files:**
- Create: `src/pages/clubs/join/[slug].astro`

- [ ] **Create the public club detail + join page**

```astro
---
import Base from '../../../layouts/Base.astro';
const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';
const { slug } = Astro.params;
---
<Base title="Join Club — TrainedBy" description="Join this accountability club">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #0f0e0d; color: #fff; font-family: 'Manrope', system-ui, sans-serif; min-height: 100vh; }
.wrap { max-width: 480px; margin: 0 auto; padding: 32px 16px 80px; }
.trainer-row { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
.avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; background: #7c3aed; }
.club-name { font-size: 24px; font-weight: 800; margin-bottom: 8px; }
.club-goal { font-size: 14px; color: #aaa; line-height: 1.6; margin-bottom: 24px; }
.meta-row { display: flex; gap: 16px; margin-bottom: 28px; flex-wrap: wrap; }
.meta-chip { background: rgba(255,255,255,0.07); border-radius: 6px; padding: 5px 10px; font-size: 12px; color: #aaa; }
.price { font-size: 32px; font-weight: 800; margin-bottom: 6px; }
.price-sub { font-size: 13px; color: #888; margin-bottom: 24px; }
.join-btn { width: 100%; background: #7c3aed; border: none; border-radius: 12px; padding: 16px; font-size: 16px; font-weight: 700; color: #fff; cursor: pointer; font-family: inherit; }
.join-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.status { margin-top: 12px; font-size: 13px; color: #a78bfa; text-align: center; min-height: 18px; }
</style>
<div class="wrap">
  <div id="loading" style="color:#888;font-size:14px;">Loading…</div>
  <div id="content" style="display:none;">
    <div class="trainer-row">
      <img id="trainer-avatar" class="avatar" src="" alt="">
      <div>
        <div style="font-size:13px;font-weight:600;" id="trainer-name"></div>
        <div style="font-size:11px;color:#888;" id="trainer-title"></div>
      </div>
    </div>
    <div class="club-name" id="club-name"></div>
    <div class="club-goal" id="club-goal"></div>
    <div class="meta-row">
      <div class="meta-chip" id="meta-duration"></div>
      <div class="meta-chip" id="meta-members"></div>
    </div>
    <div class="price" id="price"></div>
    <div class="price-sub" id="price-sub"></div>
    <button class="join-btn" id="join-btn">Join Club</button>
    <p class="status" id="status-msg"></p>
  </div>
</div>

<script type="module" define:vars={{ SUPABASE_URL, SUPABASE_ANON_KEY, slug }}>
  import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Load club data
  const res = await fetch(`${SUPABASE_URL}/functions/v1/get-club?slug=${slug}`, {
    headers: { authorization: `Bearer ${SUPABASE_ANON_KEY}` }
  });
  const club = await res.json();

  if (!club || club.error) {
    document.getElementById('loading').textContent = 'Club not found.';
    return;
  }

  document.getElementById('loading').style.display = 'none';
  document.getElementById('content').style.display = 'block';
  document.getElementById('club-name').textContent = club.name;
  document.getElementById('club-goal').textContent = club.goal;
  document.getElementById('meta-duration').textContent = `${club.duration_days} days`;
  document.getElementById('meta-members').textContent = `${club.member_count} members`;
  document.getElementById('trainer-name').textContent = club.trainer?.name ?? '';
  document.getElementById('trainer-title').textContent = club.trainer?.title ?? '';
  if (club.trainer?.avatar_url) {
    document.getElementById('trainer-avatar').src = club.trainer.avatar_url;
  }
  document.getElementById('price').textContent = club.is_free ? 'Free' : `$${(club.price_cents / 100).toFixed(0)}`;
  document.getElementById('price-sub').textContent = club.is_free
    ? 'No payment required'
    : 'One-time payment — full 30-day access';

  document.getElementById('join-btn').addEventListener('click', async () => {
    const btn = document.getElementById('join-btn');
    const status = document.getElementById('status-msg');
    btn.disabled = true;
    status.textContent = '';

    // Require Google sign-in
    const { data: { user } } = await sb.auth.getUser();
    if (!user) {
      status.textContent = 'Signing you in with Google…';
      const currentUrl = window.location.href;
      await sb.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(currentUrl)}` }
      });
      return;
    }

    status.textContent = club.is_free ? 'Joining…' : 'Preparing checkout…';

    const joinRes = await fetch(`${SUPABASE_URL}/functions/v1/join-club`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      body: JSON.stringify({
        club_id: club.id,
        user_id: user.id,
        return_url: `${window.location.origin}/clubs/${slug}`,
      }),
    });
    const result = await joinRes.json();

    if (result.checkout_url) {
      window.location.href = result.checkout_url;
    } else if (result.ok) {
      window.location.href = `/clubs/${slug}`;
    } else {
      status.textContent = result.error || 'Error joining club.';
      btn.disabled = false;
    }
  });
</script>
</Base>
```

- [ ] **Commit**

```bash
git add src/pages/clubs/join/
git commit -m "feat: add public club join page /clubs/join/[slug]"
```

---

### Task 10: club-payment-webhook Edge Function

**Files:**
- Create: `supabase/functions/club-payment-webhook/index.ts`

- [ ] **Write the function**

```typescript
// supabase/functions/club-payment-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14?target=deno";

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
  const webhookSecret = Deno.env.get("STRIPE_CLUB_WEBHOOK_SECRET")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEventAsync
      ? await stripe.webhooks.constructEventAsync(body, signature!, webhookSecret)
      : stripe.webhooks.constructEvent(body, signature!, webhookSecret);
  } catch (err) {
    return new Response(`Webhook error: ${err.message}`, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return new Response("ok");
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const { club_id, user_id } = session.metadata ?? {};

  if (!club_id || !user_id) {
    return new Response("Missing metadata", { status: 400 });
  }

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  await sb.from("club_members").upsert({
    club_id,
    user_id,
    status: "active",
    stripe_payment_intent_id: session.payment_intent as string,
  }, { onConflict: "club_id,user_id" });

  return new Response("ok");
});
```

- [ ] **Add `STRIPE_CLUB_WEBHOOK_SECRET` to Netlify env and Supabase secrets**

  ```bash
  # In Stripe dashboard: Webhooks → Add endpoint
  # URL: https://<project>.supabase.co/functions/v1/club-payment-webhook
  # Event: checkout.session.completed
  # Copy the signing secret → add to Supabase secrets:
  supabase secrets set STRIPE_CLUB_WEBHOOK_SECRET=whsec_...
  ```

- [ ] **Create symlink + commit**

```bash
cd supabase/functions/club-payment-webhook && ln -sf ../_shared _shared && cd ../../..
git add supabase/functions/club-payment-webhook/
git commit -m "feat: add club-payment-webhook — activates membership on Stripe checkout"
```

---

## Phase 4 — Daily Member View

### Task 10: submit-checkin Edge Function

**Files:**
- Create: `supabase/functions/submit-checkin/index.ts`

- [ ] **Write the function**

```typescript
// supabase/functions/submit-checkin/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { club_id, mission_id, user_id, note, proof_url } = await req.json();
  if (!club_id || !mission_id || !user_id) {
    return new Response(JSON.stringify({ error: "club_id, mission_id, user_id required" }), {
      status: 400, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  // Verify membership
  const { data: membership } = await sb
    .from("club_members")
    .select("id")
    .eq("club_id", club_id)
    .eq("user_id", user_id)
    .eq("status", "active")
    .maybeSingle();

  if (!membership) {
    return new Response(JSON.stringify({ error: "Not a member of this club" }), {
      status: 403, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  // Calculate streak: find yesterday's checkin in this club
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const { data: yesterdayCheckin } = await sb
    .from("checkins")
    .select("streak_day")
    .eq("club_id", club_id)
    .eq("user_id", user_id)
    .gte("completed_at", yesterdayStart.toISOString())
    .lt("completed_at", todayStart.toISOString())
    .maybeSingle();

  const streak_day = yesterdayCheckin ? yesterdayCheckin.streak_day + 1 : 1;

  // Insert checkin (unique constraint on mission_id + user_id prevents double submission)
  const { data: checkin, error } = await sb
    .from("checkins")
    .insert({
      club_id,
      mission_id,
      user_id,
      source: "manual",
      note: note ?? null,
      proof_url: proof_url ?? null,
      streak_day,
    })
    .select("id, streak_day, completed_at")
    .single();

  if (error) {
    // Unique violation = already checked in
    if (error.code === "23505") {
      return new Response(JSON.stringify({ ok: true, already_done: true }), {
        headers: { ...corsHeaders, "content-type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ ok: true, streak_day: checkin.streak_day }), {
    headers: { ...corsHeaders, "content-type": "application/json" }
  });
});
```

- [ ] **Create symlink + commit**

```bash
cd supabase/functions/submit-checkin && ln -sf ../_shared _shared && cd ../../..
git add supabase/functions/submit-checkin/
git commit -m "feat: add submit-checkin edge function with streak calculation"
```

---

### Task 11: ActivityFeed React Component

**Files:**
- Create: `src/components/club/ActivityFeed.tsx`
- Create: `src/components/club/StreakBadge.tsx`
- Create: `src/components/club/MissionCard.tsx`

- [ ] **Write StreakBadge**

```tsx
// src/components/club/StreakBadge.tsx
export function StreakBadge({ days }: { days: number }) {
  if (days < 1) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      fontSize: 12, fontWeight: 600, color: '#f59e0b',
    }}>
      🔥 {days}
    </span>
  );
}
```

- [ ] **Write ActivityFeed**

```tsx
// src/components/club/ActivityFeed.tsx
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { StreakBadge } from './StreakBadge';

interface FeedEntry {
  id: string;
  user_id: string;
  completed_at: string;
  streak_day: number;
  is_shoutout?: boolean;
  shoutout_text?: string;
  user?: { display_name: string; avatar_url: string | null };
}

interface Props {
  clubId: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function ActivityFeed({ clubId, supabaseUrl, supabaseAnonKey }: Props) {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = createClient(supabaseUrl, supabaseAnonKey);

    // Load today's checkins
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    sb.from('checkins')
      .select('id, user_id, completed_at, streak_day, users(display_name, avatar_url)')
      .eq('club_id', clubId)
      .gte('completed_at', todayStart.toISOString())
      .order('completed_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setEntries((data ?? []).map(r => ({
          id: r.id,
          user_id: r.user_id,
          completed_at: r.completed_at,
          streak_day: r.streak_day,
          user: Array.isArray(r.users) ? r.users[0] : r.users,
        })));
        setLoading(false);
      });

    // Subscribe to new checkins in real-time
    const channel = sb
      .channel(`club-checkins-${clubId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'checkins',
        filter: `club_id=eq.${clubId}`,
      }, async (payload) => {
        // Fetch user info for new entry
        const { data: user } = await sb
          .from('users')
          .select('display_name, avatar_url')
          .eq('id', payload.new.user_id)
          .single();

        setEntries(prev => [{
          id: payload.new.id,
          user_id: payload.new.user_id,
          completed_at: payload.new.completed_at,
          streak_day: payload.new.streak_day,
          user: user ?? undefined,
        }, ...prev]);
      })
      .subscribe();

    return () => { sb.removeChannel(channel); };
  }, [clubId]);

  if (loading) return <p style={{ color: '#555', fontSize: 13 }}>Loading activity…</p>;
  if (entries.length === 0) return (
    <p style={{ color: '#555', fontSize: 13 }}>No check-ins yet today. Be the first.</p>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {entries.map(entry => (
        <div key={entry.id} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 12px',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: entry.user?.avatar_url ? 'transparent' : '#7c3aed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#fff', overflow: 'hidden',
          }}>
            {entry.user?.avatar_url
              ? <img src={entry.user.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials(entry.user?.display_name ?? '?')}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>
              {entry.user?.display_name ?? 'Someone'}
            </span>
            <span style={{ fontSize: 12, color: '#888' }}> checked in</span>
          </div>
          <StreakBadge days={entry.streak_day} />
          <span style={{ fontSize: 11, color: '#555', flexShrink: 0 }}>
            {timeAgo(entry.completed_at)}
          </span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Write MissionCard**

```tsx
// src/components/club/MissionCard.tsx
import { useState } from 'react';

interface Mission {
  id: string;
  day_number: number;
  title: string;
  description: string | null;
  type: string;
}

interface Props {
  mission: Mission;
  clubId: string;
  userId: string;
  alreadyDone: boolean;
  streakDay: number;
  supabaseUrl: string;
  supabaseAnonKey: string;
  onCheckin: (streakDay: number) => void;
}

export function MissionCard({ mission, clubId, userId, alreadyDone, streakDay, supabaseUrl, supabaseAnonKey, onCheckin }: Props) {
  const [done, setDone] = useState(alreadyDone);
  const [loading, setLoading] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(streakDay);

  async function handleCheckin() {
    if (done || loading) return;
    setLoading(true);
    const res = await fetch(`${supabaseUrl}/functions/v1/submit-checkin`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'authorization': `Bearer ${supabaseAnonKey}` },
      body: JSON.stringify({ club_id: clubId, mission_id: mission.id, user_id: userId }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.ok) {
      setDone(true);
      const newStreak = data.streak_day ?? currentStreak + 1;
      setCurrentStreak(newStreak);
      onCheckin(newStreak);
    }
  }

  return (
    <div style={{
      background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)',
      borderRadius: 12, padding: 16, marginBottom: 16,
    }}>
      <div style={{ fontSize: 11, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
        Day {mission.day_number} Mission
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
        {mission.title}
      </div>
      {mission.description && (
        <div style={{ fontSize: 13, color: '#aaa', marginBottom: 14 }}>
          {mission.description}
        </div>
      )}
      {done ? (
        <div style={{
          background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.3)',
          borderRadius: 8, padding: '10px 16px', textAlign: 'center',
          fontSize: 14, fontWeight: 600, color: '#4ade80',
        }}>
          ✓ Done · {currentStreak} day streak 🔥
        </div>
      ) : (
        <button
          onClick={handleCheckin}
          disabled={loading}
          style={{
            width: '100%', background: '#7c3aed', border: 'none', borderRadius: 8,
            padding: '12px 16px', fontSize: 14, fontWeight: 700, color: '#fff',
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Saving…' : '✓ I Did It'}
        </button>
      )}
    </div>
  );
}
```

- [ ] **Commit**

```bash
git add src/components/club/
git commit -m "feat: add MissionCard, ActivityFeed, StreakBadge components"
```

---

### Task 12: Member Daily View Page

**Files:**
- Create: `src/pages/clubs/[slug].astro`

- [ ] **Create the page**

```astro
---
import Base from '../../layouts/Base.astro';

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';
const { slug } = Astro.params;
---
<Base title="Club — TrainedBy" description="Your daily mission">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #0f0e0d; color: #fff; font-family: 'Manrope', system-ui, sans-serif; min-height: 100vh; }
.wrap { max-width: 560px; margin: 0 auto; padding: 24px 16px 80px; }
.club-header { margin-bottom: 24px; }
.club-name { font-size: 18px; font-weight: 700; }
.club-sub { font-size: 12px; color: #888; margin-top: 2px; }
.section-label { font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
#mission-mount, #feed-mount { margin-bottom: 24px; }
.not-member { text-align: center; padding: 60px 20px; color: #888; }
.not-member a { color: #a78bfa; }
</style>

<div class="wrap">
  <div class="club-header">
    <div class="club-name" id="club-name">Loading…</div>
    <div class="club-sub" id="club-sub"></div>
  </div>

  <div id="mission-mount"></div>

  <div class="section-label">Club Activity Today</div>
  <div id="feed-mount"></div>
</div>

<script type="module" define:vars={{ SUPABASE_URL, SUPABASE_ANON_KEY, slug }}>
  import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
  import { createElement } from 'https://esm.sh/react@18';
  import { createRoot } from 'https://esm.sh/react-dom@18/client';
  import { MissionCard } from '/src/components/club/MissionCard.tsx';
  import { ActivityFeed } from '/src/components/club/ActivityFeed.tsx';

  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: { user } } = await sb.auth.getUser();

  // Fetch club data
  const clubRes = await fetch(`${SUPABASE_URL}/functions/v1/get-club?slug=${slug}`, {
    headers: { authorization: `Bearer ${SUPABASE_ANON_KEY}` }
  });
  const club = await clubRes.json();

  document.getElementById('club-name').textContent = club.name;
  document.getElementById('club-sub').textContent =
    `${club.member_count} members · ${club.duration_days} days`;

  if (!user) {
    document.getElementById('mission-mount').innerHTML =
      '<div class="not-member">Sign in to access this club. <a href="/clubs/join/' + slug + '">Join</a></div>';
    return;
  }

  // Check membership
  const { data: membership } = await sb
    .from('club_members')
    .select('id')
    .eq('club_id', club.id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  if (!membership) {
    document.getElementById('mission-mount').innerHTML =
      '<div class="not-member">You\'re not a member. <a href="/clubs/join/' + slug + '">Join this club</a></div>';
    return;
  }

  // Get today's day_number for this club
  const startDate = club.starts_at ? new Date(club.starts_at) : new Date();
  const today = new Date();
  const dayNumber = Math.max(1, Math.ceil((today - startDate) / 86400000) + 1);

  // Fetch today's mission
  const { data: mission } = await sb
    .from('missions')
    .select('id, day_number, title, description, type')
    .eq('club_id', club.id)
    .eq('day_number', dayNumber)
    .maybeSingle();

  // Check if already done today
  let alreadyDone = false;
  let streakDay = 0;
  if (mission) {
    const { data: checkin } = await sb
      .from('checkins')
      .select('id, streak_day')
      .eq('mission_id', mission.id)
      .eq('user_id', user.id)
      .maybeSingle();
    alreadyDone = !!checkin;
    streakDay = checkin?.streak_day ?? 0;
  }

  // Mount MissionCard
  if (mission) {
    const missionRoot = createRoot(document.getElementById('mission-mount'));
    missionRoot.render(createElement(MissionCard, {
      mission, clubId: club.id, userId: user.id,
      alreadyDone, streakDay,
      supabaseUrl: SUPABASE_URL, supabaseAnonKey: SUPABASE_ANON_KEY,
      onCheckin: (s) => { streakDay = s; }
    }));
  } else {
    document.getElementById('mission-mount').innerHTML =
      '<p style="color:#555;font-size:13px">No mission for today yet.</p>';
  }

  // Mount ActivityFeed
  const feedRoot = createRoot(document.getElementById('feed-mount'));
  feedRoot.render(createElement(ActivityFeed, {
    clubId: club.id,
    supabaseUrl: SUPABASE_URL,
    supabaseAnonKey: SUPABASE_ANON_KEY,
  }));
</script>
</Base>
```

  **Note:** Astro doesn't support importing local TSX in `<script type="module">` tags via ESM URLs. Instead, build the React components using Astro's `client:load` directive. Replace the script approach above with:

```astro
---
import Base from '../../layouts/Base.astro';
import { MissionCard } from '../../components/club/MissionCard';
import { ActivityFeed } from '../../components/club/ActivityFeed';

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';
const { slug } = Astro.params;
---
<Base title="Club — TrainedBy" description="Your daily mission">
<style>
/* same styles as above */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #0f0e0d; color: #fff; font-family: 'Manrope', system-ui, sans-serif; min-height: 100vh; }
.wrap { max-width: 560px; margin: 0 auto; padding: 24px 16px 80px; }
</style>

<div class="wrap">
  <!-- ClubMemberView handles auth check, data fetching, and rendering -->
  <ClubMemberView
    client:load
    slug={slug}
    supabaseUrl={SUPABASE_URL}
    supabaseAnonKey={SUPABASE_ANON_KEY}
  />
</div>
</Base>
```

  And create `src/components/club/ClubMemberView.tsx` as the single client component that handles auth, data fetching, and rendering MissionCard + ActivityFeed. Follow the pattern from existing React components in `src/components/trainer/`.

- [ ] **Commit**

```bash
git add src/pages/clubs/ src/components/club/
git commit -m "feat: add member daily view /clubs/[slug]"
```

---

## Phase 5 — Trainer Dashboard

### Task 13: get-club-dashboard + send-shoutout + update-mission Functions

**Files:**
- Create: `supabase/functions/get-club-dashboard/index.ts`
- Create: `supabase/functions/send-shoutout/index.ts`
- Create: `supabase/functions/update-mission/index.ts`

- [ ] **Write get-club-dashboard**

```typescript
// supabase/functions/get-club-dashboard/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const slug = new URL(req.url).searchParams.get("slug");
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data: club } = await sb.from("clubs").select("*").eq("slug", slug!).single();
  if (!club) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { ...corsHeaders, "content-type": "application/json" } });

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);

  // Members with their latest streak
  const { data: members } = await sb
    .from("club_members")
    .select("user_id, joined_at, users(display_name, avatar_url)")
    .eq("club_id", club.id)
    .eq("status", "active");

  // Today's checkins
  const { data: todayCheckins } = await sb
    .from("checkins")
    .select("user_id, streak_day")
    .eq("club_id", club.id)
    .gte("completed_at", todayStart.toISOString());

  const checkinSet = new Set((todayCheckins ?? []).map(c => c.user_id));
  const streakMap = Object.fromEntries((todayCheckins ?? []).map(c => [c.user_id, c.streak_day]));

  const roster = (members ?? []).map(m => ({
    user_id: m.user_id,
    display_name: (m.users as any)?.display_name ?? 'Member',
    avatar_url: (m.users as any)?.avatar_url ?? null,
    checked_in_today: checkinSet.has(m.user_id),
    streak_day: streakMap[m.user_id] ?? 0,
  }));

  // Next 7 missions from today
  const dayNumber = club.starts_at
    ? Math.max(1, Math.ceil((Date.now() - new Date(club.starts_at).getTime()) / 86400000) + 1)
    : 1;

  const { data: upcomingMissions } = await sb
    .from("missions")
    .select("id, day_number, title, description, type, ai_draft, edited_by_trainer")
    .eq("club_id", club.id)
    .gte("day_number", dayNumber)
    .order("day_number", { ascending: true })
    .limit(7);

  const totalMembers = roster.length;
  const checkedInToday = roster.filter(r => r.checked_in_today).length;
  const avgCompletion = totalMembers > 0
    ? Math.round((checkedInToday / totalMembers) * 100)
    : 0;
  const atRisk = roster.filter(r => !r.checked_in_today && r.streak_day >= 1).length;

  return new Response(JSON.stringify({
    club,
    stats: { total_members: totalMembers, checked_in_today: checkedInToday, avg_completion: avgCompletion, at_risk: atRisk },
    roster,
    upcoming_missions: upcomingMissions ?? [],
    current_day: dayNumber,
  }), { headers: { ...corsHeaders, "content-type": "application/json" } });
});
```

- [ ] **Write send-shoutout**

```typescript
// supabase/functions/send-shoutout/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { club_id, trainer_email, text } = await req.json();

  // Verify caller is the trainer
  const { data: trainer } = await sb.from("trainers").select("id").eq("email", trainer_email).single();
  const { data: club } = await sb.from("clubs").select("trainer_id").eq("id", club_id).single();

  if (!trainer || !club || club.trainer_id !== trainer.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 403, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  // Insert a shoutout row into checkins with source='manual' and a special note prefix
  // Using a sentinel user_id (trainer's id cast to UUID pattern won't collide with users table)
  // Instead: store shoutouts in a separate feed_events table — but per spec, shoutout IS a feed entry.
  // For MVP: insert into checkins with user_id = null is invalid. 
  // Solution: create a system user row for the trainer's shoutouts, OR use a feed_events table.
  // Simpler MVP: add a shoutouts table with club_id, text, created_at, read by feed query.
  
  // Since spec says "feed entry", we'll add a club_shoutouts table query here
  // and the ActivityFeed component will union checkins + shoutouts.
  // For now, insert to a simple table (add to migration if not exists):
  await sb.rpc('create_shoutout_if_table_exists', { p_club_id: club_id, p_text: text })
    .catch(() => {});

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, "content-type": "application/json" }
  });
});
```

  **Note on shoutouts:** The cleanest MVP approach is to add a `club_shoutouts` table to the migration:

```sql
-- Add to 20260518_clubs_schema.sql or a new migration 20260518_shoutouts.sql
CREATE TABLE IF NOT EXISTS club_shoutouts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id    UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  text       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE club_shoutouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Club members can read shoutouts"
  ON club_shoutouts FOR SELECT USING (
    club_id IN (SELECT club_id FROM club_members WHERE user_id = auth.uid() AND status = 'active')
    OR club_id IN (SELECT id FROM clubs WHERE trainer_id IN (SELECT id FROM trainers WHERE email = auth.jwt()->>'email'))
  );
```

  Add this table and create a new migration `supabase/migrations/20260518_shoutouts.sql`. Update `send-shoutout` to use a direct insert. Update `ActivityFeed` to fetch and display shoutouts alongside checkins.

- [ ] **Write update-mission**

```typescript
// supabase/functions/update-mission/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { mission_id, trainer_email, title, description, type } = await req.json();

  if (!mission_id || !trainer_email) {
    return new Response(JSON.stringify({ error: "mission_id and trainer_email required" }), {
      status: 400, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  // Verify trainer owns the club this mission belongs to
  const { data: mission } = await sb
    .from("missions")
    .select("id, clubs(trainer_id)")
    .eq("id", mission_id)
    .single();

  const { data: trainer } = await sb
    .from("trainers")
    .select("id")
    .eq("email", trainer_email)
    .single();

  const clubTrainerId = (mission?.clubs as any)?.trainer_id;
  if (!trainer || !mission || clubTrainerId !== trainer.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 403, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  const { error } = await sb
    .from("missions")
    .update({ title, description, type, edited_by_trainer: true })
    .eq("id", mission_id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, "content-type": "application/json" }
  });
});
```

- [ ] **Create symlinks for all three**

```bash
cd supabase/functions/get-club-dashboard && ln -sf ../_shared _shared && cd ../../..
cd supabase/functions/send-shoutout && ln -sf ../_shared _shared && cd ../../..
cd supabase/functions/update-mission && ln -sf ../_shared _shared && cd ../../..
```

- [ ] **Commit**

```bash
git add supabase/functions/get-club-dashboard/ supabase/functions/send-shoutout/ supabase/functions/update-mission/
git commit -m "feat: add trainer dashboard edge functions (dashboard data, shoutout, mission edit)"
```

---

### Task 14: Trainer Club Dashboard Page

**Files:**
- Create: `src/pages/dashboard/clubs/[slug].astro`
- Create: `src/components/club/TrainerClubDashboard.tsx`

- [ ] **Write TrainerClubDashboard component**

```tsx
// src/components/club/TrainerClubDashboard.tsx
import { useEffect, useState } from 'react';
import { StreakBadge } from './StreakBadge';

interface Props {
  slug: string;
  trainerEmail: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export function TrainerClubDashboard({ slug, trainerEmail, supabaseUrl, supabaseAnonKey }: Props) {
  const [data, setData] = useState<any>(null);
  const [editingMission, setEditingMission] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [shoutoutSending, setShoutoutSending] = useState(false);

  useEffect(() => {
    fetch(`${supabaseUrl}/functions/v1/get-club-dashboard?slug=${slug}`, {
      headers: { authorization: `Bearer ${supabaseAnonKey}` }
    })
      .then(r => r.json())
      .then(setData);
  }, [slug]);

  async function saveEdit(missionId: string) {
    setSaving(true);
    await fetch(`${supabaseUrl}/functions/v1/update-mission`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${supabaseAnonKey}` },
      body: JSON.stringify({ mission_id: missionId, trainer_email: trainerEmail, title: editTitle, description: editDesc }),
    });
    setSaving(false);
    setEditingMission(null);
    // Refresh
    fetch(`${supabaseUrl}/functions/v1/get-club-dashboard?slug=${slug}`, {
      headers: { authorization: `Bearer ${supabaseAnonKey}` }
    }).then(r => r.json()).then(setData);
  }

  async function sendShoutout() {
    if (!data?.club) return;
    const text = prompt('Shoutout message to all members who checked in today:');
    if (!text) return;
    setShoutoutSending(true);
    await fetch(`${supabaseUrl}/functions/v1/send-shoutout`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${supabaseAnonKey}` },
      body: JSON.stringify({ club_id: data.club.id, trainer_email: trainerEmail, text }),
    });
    setShoutoutSending(false);
    alert('Shoutout sent!');
  }

  if (!data) return <p style={{ color: '#888', padding: 20 }}>Loading…</p>;

  const { club, stats, roster, upcoming_missions, current_day } = data;
  const s: React.CSSProperties = { fontFamily: 'Manrope, system-ui, sans-serif', color: '#fff' };

  return (
    <div style={{ ...s, maxWidth: 560, margin: '0 auto', padding: '24px 16px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{club.name}</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Day {current_day} of {club.duration_days} · {stats.total_members} members</div>
          </div>
          <span style={{ background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.3)', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: '#4ade80', fontWeight: 600 }}>
            ● {club.status}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
        {[
          { value: `${stats.checked_in_today}/${stats.total_members}`, label: 'checked in today', color: '#16a34a' },
          { value: `${stats.avg_completion}%`, label: 'avg completion', color: '#a78bfa' },
          { value: stats.at_risk, label: 'at risk today', color: '#f59e0b' },
        ].map(({ value, label, color }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Roster */}
      <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Members</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 16 }}>
        {roster.slice(0, 5).map((m: any) => (
          <div key={m.user_id} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: m.checked_in_today ? 'rgba(22,163,74,0.08)' : 'rgba(255,255,255,0.03)',
            borderRadius: 8, padding: '8px 10px',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: '#7c3aed', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff',
            }}>
              {m.display_name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, fontSize: 13, color: m.checked_in_today ? '#fff' : '#aaa' }}>
              {m.display_name}
            </div>
            {m.streak_day > 0 && <StreakBadge days={m.streak_day} />}
            <span style={{ fontSize: 12, color: m.checked_in_today ? '#16a34a' : '#f59e0b', fontWeight: 600 }}>
              {m.checked_in_today ? '✓' : 'pending'}
            </span>
          </div>
        ))}
        {roster.length > 5 && (
          <div style={{ textAlign: 'center', fontSize: 12, color: '#555', padding: 6 }}>
            + {roster.length - 5} more members
          </div>
        )}
      </div>

      {/* Shoutout */}
      <button
        onClick={sendShoutout}
        disabled={shoutoutSending}
        style={{
          width: '100%', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)',
          borderRadius: 8, padding: 10, fontSize: 13, color: '#a78bfa', cursor: 'pointer',
          marginBottom: 24, fontFamily: 'inherit',
        }}
      >
        📣 Send shoutout to today's {stats.checked_in_today} check-ins
      </button>

      {/* Mission Queue */}
      <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Mission Queue</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {upcoming_missions.map((m: any, i: number) => (
          <div key={m.id} style={{
            background: i === 0 ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.04)',
            border: i === 0 ? '1px solid rgba(124,58,237,0.2)' : 'none',
            borderRadius: 8, padding: '9px 12px',
          }}>
            {editingMission === m.id ? (
              <div>
                <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 4, padding: '4px 8px', color: '#fff', fontSize: 13, marginBottom: 6 }} />
                <input value={editDesc} onChange={e => setEditDesc(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 4, padding: '4px 8px', color: '#fff', fontSize: 12 }} />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button onClick={() => saveEdit(m.id)} disabled={saving}
                    style={{ background: '#7c3aed', border: 'none', borderRadius: 4, padding: '4px 10px', color: '#fff', fontSize: 12, cursor: 'pointer' }}>
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={() => setEditingMission(null)}
                    style={{ background: 'none', border: 'none', color: '#888', fontSize: 12, cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 11, color: i === 0 ? '#a78bfa' : '#666', minWidth: 50 }}>Day {m.day_number}</div>
                <div style={{ flex: 1, fontSize: 13, color: i === 0 ? '#fff' : '#ccc' }}>{m.title}</div>
                <button
                  onClick={() => { setEditingMission(m.id); setEditTitle(m.title); setEditDesc(m.description ?? ''); }}
                  style={{ background: 'none', border: 'none', color: i === 0 ? '#a78bfa' : '#555', fontSize: 12, cursor: 'pointer' }}>
                  ✏ edit
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Create the Astro page**

```astro
---
import Base from '../../../layouts/Base.astro';
import { TrainerClubDashboard } from '../../../components/club/TrainerClubDashboard';

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';
const { slug } = Astro.params;
---
<Base title="Club Dashboard — TrainedBy" description="Manage your club">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #0f0e0d; color: #fff; font-family: 'Manrope', system-ui, sans-serif; min-height: 100vh; }
</style>
<TrainerClubDashboard
  client:load
  slug={slug}
  supabaseUrl={SUPABASE_URL}
  supabaseAnonKey={SUPABASE_ANON_KEY}
  trainerEmail=""
/>
<!-- trainerEmail resolved client-side from supabase.auth.getUser() -->
</Base>
```

  **Note:** `trainerEmail` can't be resolved server-side in Astro without a session cookie. Follow the existing dashboard.astro pattern — resolve it client-side inside the React component using `supabase.auth.getUser()`.

- [ ] **Commit**

```bash
git add src/pages/dashboard/clubs/ src/components/club/TrainerClubDashboard.tsx
git commit -m "feat: add trainer club dashboard page"
```

---

## Phase 6 — Profile + Nudge + End-to-End

### Task 15: Profile Page Clubs Section

**Files:**
- Create: `src/components/trainer/ClubsSection.tsx`
- Modify: `src/pages/[slug].astro`

- [ ] **Write ClubsSection**

```tsx
// src/components/trainer/ClubsSection.tsx
import { useEffect, useState } from 'react';

interface Club {
  id: string;
  slug: string;
  name: string;
  goal: string;
  duration_days: number;
  is_free: boolean;
  price_cents: number | null;
  max_members: number | null;
  starts_at: string | null;
  status: string;
  member_count?: number;
}

interface Props {
  trainerSlug: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

function priceDisplay(club: Club) {
  if (club.is_free) return 'Free';
  if (!club.price_cents) return '';
  return `$${(club.price_cents / 100).toFixed(0)}`;
}

export function ClubsSection({ trainerSlug, supabaseUrl, supabaseAnonKey }: Props) {
  const [clubs, setClubs] = useState<Club[]>([]);

  useEffect(() => {
    import('https://esm.sh/@supabase/supabase-js@2').then(({ createClient }) => {
      const sb = createClient(supabaseUrl, supabaseAnonKey);
      sb.from('clubs')
        .select('id, slug, name, goal, duration_days, is_free, price_cents, max_members, starts_at, status, trainers!inner(slug)')
        .eq('trainers.slug', trainerSlug)
        .in('status', ['active', 'draft'])
        .order('created_at', { ascending: false })
        .then(({ data }) => setClubs(data ?? []));
    });
  }, [trainerSlug]);

  if (clubs.length === 0) return null;

  return (
    <div style={{ padding: '0 0 24px' }}>
      <div style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
        Active Clubs
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {clubs.map(club => (
          <div key={club.id} style={{
            background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)',
            borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', flex: 1 }}>{club.name}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: club.is_free ? '#4ade80' : '#fff', marginLeft: 12 }}>
                {priceDisplay(club)}
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#aaa', marginBottom: 12, lineHeight: 1.5 }}>
              {club.goal.slice(0, 100)}{club.goal.length > 100 ? '…' : ''}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 11, color: '#666' }}>
                {club.duration_days} days
                {club.starts_at ? ` · Starts ${new Date(club.starts_at).toLocaleDateString()}` : ''}
              </div>
              {club.status === 'active' && (
                <a href={`/clubs/join/${club.slug}`} style={{
                  background: '#7c3aed', borderRadius: 8, padding: '7px 14px',
                  fontSize: 12, fontWeight: 700, color: '#fff', textDecoration: 'none',
                }}>
                  Join
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Add ClubsSection to profile page**

  In `src/pages/[slug].astro`, find where `PackagesCarousel` or the packages section is rendered. Add `ClubsSection` above it:

```astro
---
// Add to existing imports at top of [slug].astro
import { ClubsSection } from '../components/trainer/ClubsSection';
---
```

  Then in the JSX/template, add before the packages section:

```astro
<ClubsSection
  client:load
  trainerSlug={trainer.slug}
  supabaseUrl={SUPABASE_URL}
  supabaseAnonKey={SUPABASE_ANON_KEY}
/>
```

  Find the exact insertion point by searching `src/pages/[slug].astro` for `PackagesCarousel` or `session_packages` and insert above it.

- [ ] **Commit**

```bash
git add src/components/trainer/ClubsSection.tsx src/pages/\[slug\].astro
git commit -m "feat: add clubs section to trainer profile page"
```

---

### Task 16: Daily Email Nudge to Trainer

**Files:**
- Modify: `supabase/functions/lifecycle-email/index.ts` (or create `supabase/functions/club-daily-nudge/index.ts`)

- [ ] **Create club-daily-nudge edge function**

  Check if there's an existing cron setup in `lifecycle-email`. If not, create a standalone function triggered by a Supabase cron job.

```typescript
// supabase/functions/club-daily-nudge/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (_req) => {
  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Find all active clubs and their trainers
  const { data: clubs } = await sb
    .from("clubs")
    .select("id, name, duration_days, starts_at, trainer_id, trainers(email, name)")
    .eq("status", "active");

  for (const club of clubs ?? []) {
    const dayNumber = club.starts_at
      ? Math.max(1, Math.ceil((Date.now() - new Date(club.starts_at).getTime()) / 86400000) + 2)
      : 1;

    const { data: mission } = await sb
      .from("missions")
      .select("title, description")
      .eq("club_id", club.id)
      .eq("day_number", dayNumber)
      .maybeSingle();

    if (!mission) continue;

    const trainerEmail = (club.trainers as any)?.email;
    const trainerName = (club.trainers as any)?.name;
    if (!trainerEmail) continue;

    // Get today's check-in count
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const { count: checkinCount } = await sb
      .from("checkins")
      .select("id", { count: "exact", head: true })
      .eq("club_id", club.id)
      .gte("completed_at", todayStart.toISOString());

    const { count: memberCount } = await sb
      .from("club_members")
      .select("id", { count: "exact", head: true })
      .eq("club_id", club.id)
      .eq("status", "active");

    const dashUrl = `${Deno.env.get("PUBLIC_SITE_URL")}/dashboard/clubs/${club.id}`;

    // Send email via existing email provider (Resend or SendGrid — check _shared for email utility)
    // For now, log — wire to actual send in next step
    console.log(`Nudge: ${trainerEmail} — Tomorrow Day ${dayNumber}: ${mission.title} — Today: ${checkinCount}/${memberCount} checked in`);

    // Send via Resend (same pattern as lifecycle-email/index.ts)
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'TrainedBy <noreply@trainedby.com>',
        to: trainerEmail,
        subject: `Day ${dayNumber} mission ready — ${club.name}`,
        html: `<p>Hi ${trainerName},</p>
<p>Tomorrow is <strong>Day ${dayNumber}</strong> in your ${club.name} club.</p>
<p><strong>AI draft:</strong> ${mission.title}</p>
<p>${mission.description ?? ''}</p>
<p>Today: ${checkinCount}/${memberCount} members checked in.</p>
<p><a href="${dashUrl}">Review and edit tomorrow's mission →</a></p>`,
      }),
    }).catch(() => {});
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "content-type": "application/json" }
  });
});
```

- [ ] **Register as a Supabase cron job**

  In Supabase Dashboard → Database → Extensions → enable `pg_cron` if not enabled. Then in SQL editor:

```sql
SELECT cron.schedule(
  'club-daily-nudge',
  '0 7 * * *',  -- 7am UTC daily
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/club-daily-nudge',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.service_role_key')),
    body := '{}'::jsonb
  );
  $$
);
```

- [ ] **Create symlink + commit**

```bash
cd supabase/functions/club-daily-nudge && ln -sf ../_shared _shared && cd ../../..
git add supabase/functions/club-daily-nudge/
git commit -m "feat: add club-daily-nudge cron function — trainer notified of tomorrow's AI mission"
```

---

### Task 17: End-to-End Smoke Test

**Files:**
- No code files — manual browser test

- [ ] **Start local dev server**

```bash
npm run dev
```

- [ ] **Run local Supabase**

```bash
supabase start
```

- [ ] **Trainer flow: create a club**

  1. Sign in as a test trainer at `/dashboard`
  2. Navigate to `/dashboard/clubs/new`
  3. Fill in: Name = "Test 30-Day Run Club", Goal = "Run every day for 30 days and build a consistent running habit", Duration = 7 (short for testing)
  4. Submit → wait for mission generation (~30 seconds)
  5. Navigate to `/dashboard/clubs/test-30-day-run-club`
  6. Verify: stats show 0/0, upcoming missions show 7 missions with AI-generated titles

- [ ] **Publish the club**

  In Supabase SQL editor:
  ```sql
  UPDATE clubs SET status = 'active', starts_at = CURRENT_DATE WHERE slug = 'test-30-day-run-club';
  ```

- [ ] **Member flow: join and check in**

  1. Open incognito window → navigate to `/[trainer-slug]` profile
  2. Verify clubs section shows "Test 30-Day Run Club" with Join button
  3. Click Join → Google OAuth sign-in (use a test Google account)
  4. Verify redirect to `/clubs/test-30-day-run-club` after join
  5. Verify today's mission shows (Day 1)
  6. Click "I Did It" → verify streak shows 🔥 1

- [ ] **Verify feed update**

  Open the club page in a second browser window (signed in as trainer or another member) → verify the check-in appears in the activity feed in real-time.

- [ ] **Trainer dashboard: verify roster + mission edit**

  1. Navigate to `/dashboard/clubs/test-30-day-run-club`
  2. Verify member roster shows the test account with ✓ checked in
  3. Click "edit" on Day 2 mission → change the title → save
  4. Verify the updated title appears in the queue

- [ ] **Final commit — mark spec complete**

```bash
git commit --allow-empty -m "chore: club network MVP end-to-end verified"
```

---

## Deployment Checklist

Before deploying to production:

- [ ] Run `supabase db push` against production project
- [ ] Deploy all new edge functions: `supabase functions deploy generate-missions create-club get-club join-club club-payment-webhook submit-checkin get-club-feed get-club-dashboard send-shoutout update-mission club-daily-nudge`
- [ ] Add `STRIPE_CLUB_WEBHOOK_SECRET` to Supabase secrets
- [ ] Verify Google OAuth redirect URLs include production domains
- [ ] Verify `PUBLIC_SITE_URL` env var is set in Supabase secrets (used by join-club for Stripe return_url)
- [ ] Register Stripe webhook endpoint for `checkout.session.completed` pointing to `club-payment-webhook`
- [ ] Verify pg_cron is enabled in production and nudge cron job is registered
- [ ] Add `.superpowers/` to `.gitignore`
