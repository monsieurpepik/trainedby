# Club Culture Phase 1 — Follower Tier + Seasons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a free follower tier to clubs (public activity feed + leaderboard as social proof), season numbering so clubs persist across cohorts, and a "Start Season 2" flow for coaches.

**Architecture:** Client-side React components handle all three viewer states (public/follower, active member, alumni) via a new `ClubPage` router component. Edge functions handle follow/unfollow and season creation. A single migration adds `club_followers`, `season_number`, `parent_club_id`, and `public_leaderboard` to the existing schema.

**Tech Stack:** Astro SSR + React `client:load`, Supabase (PostgreSQL + Deno Edge Functions), existing `@supabase/supabase-js` client pattern, Stripe (no changes needed in Phase 1).

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `supabase/migrations/20260519_club_culture_phase1.sql` | Create | Adds followers table + season columns |
| `supabase/functions/follow-club/index.ts` | Create | Follow a club (upsert club_followers) |
| `supabase/functions/unfollow-club/index.ts` | Create | Unfollow a club (delete club_followers) |
| `supabase/functions/start-season/index.ts` | Create | Creates Season N+1 as successor to a club |
| `src/components/club/FollowButton.tsx` | Create | Follow/unfollow toggle with optimistic UI |
| `src/components/club/SeasonBadge.tsx` | Create | "S1 ✓", "S2 Active" badge display |
| `src/components/club/ClubPublicView.tsx` | Create | Stranger/follower view: activity feed + leaderboard + CTAs |
| `src/components/club/ClubAlumniView.tsx` | Create | Alumni view: completed season badge + next-season CTA |
| `src/components/club/ClubPage.tsx` | Create | Client-side router: detects viewer state, renders correct view |
| `src/components/club/TrainerClubDashboard.tsx` | Modify | Add follower count + "Start Season 2" button |
| `src/pages/clubs/[slug].astro` | Modify | Render `ClubPage` instead of `ClubMemberView` |

---

## Task 1: Schema Migration

**Files:**
- Create: `supabase/migrations/20260519_club_culture_phase1.sql`

- [ ] **Step 1: Write migration file**

```sql
-- supabase/migrations/20260519_club_culture_phase1.sql

-- Season columns on clubs
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS season_number int NOT NULL DEFAULT 1;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS parent_club_id uuid REFERENCES clubs(id);
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS public_leaderboard boolean NOT NULL DEFAULT true;

-- Season tracking on club_members
ALTER TABLE club_members ADD COLUMN IF NOT EXISTS season_number int NOT NULL DEFAULT 1;

-- Followers table
CREATE TABLE IF NOT EXISTS club_followers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id     uuid REFERENCES clubs(id) ON DELETE CASCADE NOT NULL,
  user_id     uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  followed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(club_id, user_id)
);

ALTER TABLE club_followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "followers visible to all"
  ON club_followers FOR SELECT USING (true);

CREATE POLICY "user manages own follows"
  ON club_followers FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user deletes own follows"
  ON club_followers FOR DELETE USING (auth.uid() = user_id);

-- Index for fast follower lookups
CREATE INDEX IF NOT EXISTS club_followers_club_id_idx ON club_followers(club_id);
CREATE INDEX IF NOT EXISTS club_followers_user_id_idx ON club_followers(user_id);
```

- [ ] **Step 2: Apply migration via Supabase MCP**

Use the Supabase MCP `apply_migration` tool with:
- `name`: `club_culture_phase1`
- `query`: the full SQL above

Do NOT use `supabase db push` — it conflicts with existing migration version numbers in this project.

- [ ] **Step 3: Verify tables exist**

Run via Supabase MCP `execute_sql`:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'clubs' AND column_name IN ('season_number','parent_club_id','public_leaderboard');
```
Expected: 3 rows returned.

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'club_members' AND column_name = 'season_number';
```
Expected: 1 row returned.

```sql
SELECT table_name FROM information_schema.tables WHERE table_name = 'club_followers';
```
Expected: 1 row returned.

- [ ] **Step 4: Commit**

```bash
cd /Users/bobanpepic/trainedby
git add supabase/migrations/20260519_club_culture_phase1.sql
git commit -m "feat: add club followers table + season columns migration"
```

---

## Task 2: `follow-club` Edge Function

**Files:**
- Create: `supabase/functions/follow-club/index.ts`

- [ ] **Step 1: Create function**

```typescript
// supabase/functions/follow-club/index.ts
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
  if (authErr || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  const { club_id } = await req.json();
  if (!club_id) {
    return new Response(JSON.stringify({ error: "club_id required" }), {
      status: 400, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Upsert — idempotent, following twice is safe
  const { error } = await sb
    .from("club_followers")
    .upsert({ club_id, user_id: user.id }, { onConflict: "club_id,user_id" });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ ok: true, following: true }), {
    headers: { ...corsHeaders, "content-type": "application/json" }
  });
});
```

- [ ] **Step 2: Create `unfollow-club` function**

```typescript
// supabase/functions/unfollow-club/index.ts
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
  if (authErr || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  const { club_id } = await req.json();
  if (!club_id) {
    return new Response(JSON.stringify({ error: "club_id required" }), {
      status: 400, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { error } = await sb
    .from("club_followers")
    .delete()
    .eq("club_id", club_id)
    .eq("user_id", user.id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ ok: true, following: false }), {
    headers: { ...corsHeaders, "content-type": "application/json" }
  });
});
```

- [ ] **Step 3: Deploy both functions**

```bash
cd /Users/bobanpepic/trainedby
SUPABASE_ACCESS_TOKEN=$(cat ~/.supabase-token 2>/dev/null || echo $SUPABASE_ACCESS_TOKEN) \
  ./scripts/deploy_functions.sh follow-club

SUPABASE_ACCESS_TOKEN=$(cat ~/.supabase-token 2>/dev/null || echo $SUPABASE_ACCESS_TOKEN) \
  ./scripts/deploy_functions.sh unfollow-club
```

If `deploy_functions.sh` is not available, deploy directly:
```bash
supabase functions deploy follow-club --project-ref mezhtdbfyvkshpuplqqw
supabase functions deploy unfollow-club --project-ref mezhtdbfyvkshpuplqqw
```

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/follow-club/index.ts supabase/functions/unfollow-club/index.ts
git commit -m "feat: add follow-club and unfollow-club edge functions"
```

---

## Task 3: `start-season` Edge Function

**Files:**
- Create: `supabase/functions/start-season/index.ts`

This function creates a new season (club record) as a successor to an existing club. It sets `parent_club_id` to the original club's ID, increments `season_number`, copies the trainer, and triggers mission generation.

- [ ] **Step 1: Create function**

```typescript
// supabase/functions/start-season/index.ts
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
  if (authErr || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  const { parent_club_id, name, goal, price_cents, is_free } = await req.json();
  if (!parent_club_id || !name || !goal) {
    return new Response(JSON.stringify({ error: "parent_club_id, name, and goal required" }), {
      status: 400, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Fetch parent club to verify ownership and get season_number
  const { data: parent, error: parentErr } = await sb
    .from("clubs")
    .select("id, trainer_id, season_number, trainers(auth_id)")
    .eq("id", parent_club_id)
    .single();

  if (parentErr || !parent) {
    return new Response(JSON.stringify({ error: "Parent club not found" }), {
      status: 404, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  // Verify caller is the trainer who owns this club
  if ((parent.trainers as { auth_id: string }).auth_id !== user.id) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  // Generate a unique slug from name + season number
  const newSeasonNumber = parent.season_number + 1;
  const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const slug = `${baseSlug}-s${newSeasonNumber}-${Date.now().toString(36)}`;

  // Create the new season club
  const { data: newClub, error: createErr } = await sb
    .from("clubs")
    .insert({
      trainer_id: parent.trainer_id,
      name,
      slug,
      goal,
      price_cents: is_free ? 0 : (price_cents ?? 4900),
      is_free: is_free ?? false,
      duration_days: 30,
      max_members: 50,
      status: "draft",
      season_number: newSeasonNumber,
      parent_club_id,
    })
    .select("id, slug, season_number")
    .single();

  if (createErr || !newClub) {
    return new Response(JSON.stringify({ error: createErr?.message ?? "Failed to create season" }), {
      status: 500, headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }

  // Kick off mission generation in the background (same pattern as create-club)
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  fetch(`${supabaseUrl}/functions/v1/generate-missions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ club_id: newClub.id, goal }),
  }).catch(() => {});

  return new Response(JSON.stringify({ ok: true, club: newClub }), {
    headers: { ...corsHeaders, "content-type": "application/json" }
  });
});
```

- [ ] **Step 2: Deploy**

```bash
supabase functions deploy start-season --project-ref mezhtdbfyvkshpuplqqw
```

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/start-season/index.ts
git commit -m "feat: add start-season edge function for season continuation"
```

---

## Task 4: `SeasonBadge` Component

**Files:**
- Create: `src/components/club/SeasonBadge.tsx`

- [ ] **Step 1: Create component**

```tsx
// src/components/club/SeasonBadge.tsx

interface Props {
  seasonNumber: number;
  isActive?: boolean;
  isCompleted?: boolean;
  size?: 'sm' | 'md';
}

export function SeasonBadge({ seasonNumber, isActive, isCompleted, size = 'md' }: Props) {
  const fontSize = size === 'sm' ? '10px' : '11px';
  const padding = size === 'sm' ? '3px 8px' : '4px 10px';

  const bg = isActive
    ? 'rgba(249,115,22,0.12)'
    : isCompleted
    ? 'rgba(74,222,128,0.10)'
    : 'rgba(255,255,255,0.06)';

  const border = isActive
    ? '1px solid rgba(249,115,22,0.25)'
    : isCompleted
    ? '1px solid rgba(74,222,128,0.20)'
    : '1px solid rgba(255,255,255,0.10)';

  const color = isActive ? '#f97316' : isCompleted ? '#4ade80' : '#888';

  const label = isCompleted
    ? `S${seasonNumber} ✓`
    : isActive
    ? `Season ${seasonNumber}`
    : `S${seasonNumber}`;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      background: bg,
      border,
      borderRadius: '100px',
      padding,
      fontSize,
      fontWeight: 700,
      color,
      fontFamily: 'Manrope, system-ui, sans-serif',
      letterSpacing: 0,
    }}>
      {label}
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/club/SeasonBadge.tsx
git commit -m "feat: add SeasonBadge component"
```

---

## Task 5: `FollowButton` Component

**Files:**
- Create: `src/components/club/FollowButton.tsx`

- [ ] **Step 1: Create component**

```tsx
// src/components/club/FollowButton.tsx
import { useState } from 'react';

interface Props {
  clubId: string;
  initialFollowing: boolean;
  supabaseUrl: string;
  supabaseAnonKey: string;
  accessToken: string | null;
  onAuthRequired: () => void;
}

export function FollowButton({
  clubId,
  initialFollowing,
  supabaseUrl,
  supabaseAnonKey,
  accessToken,
  onAuthRequired,
}: Props) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!accessToken) {
      onAuthRequired();
      return;
    }
    setLoading(true);
    const fn = following ? 'unfollow-club' : 'follow-club';
    try {
      // Optimistic update
      setFollowing(!following);
      const res = await fetch(`${supabaseUrl}/functions/v1/${fn}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({ club_id: clubId }),
      });
      if (!res.ok) {
        // Revert on failure
        setFollowing(following);
      }
    } catch {
      setFollowing(following);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      style={{
        background: following ? 'rgba(255,255,255,0.08)' : 'transparent',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '100px',
        padding: '10px 20px',
        fontSize: '13px',
        fontWeight: 600,
        color: following ? '#fff' : '#aaa',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: 'Manrope, system-ui, sans-serif',
        opacity: loading ? 0.6 : 1,
        transition: 'all 0.15s',
      }}
    >
      {following ? 'Following ✓' : 'Follow free'}
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/club/FollowButton.tsx
git commit -m "feat: add FollowButton component with optimistic UI"
```

---

## Task 6: `ClubPublicView` Component

**Files:**
- Create: `src/components/club/ClubPublicView.tsx`

This component is shown to strangers and followers. It fetches and displays the public activity feed, leaderboard (with optional name blurring from `public_leaderboard`), and presents two CTAs: Join (paid) and Follow (free).

- [ ] **Step 1: Create component**

```tsx
// src/components/club/ClubPublicView.tsx
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { FollowButton } from './FollowButton';
import { SeasonBadge } from './SeasonBadge';

interface Club {
  id: string;
  name: string;
  slug: string;
  goal: string;
  status: string;
  season_number: number;
  public_leaderboard: boolean;
  price_cents: number;
  is_free: boolean;
  max_members: number;
  starts_at: string | null;
  trainer: { full_name: string; avatar_url: string | null } | null;
}

interface CheckinRow {
  user_id: string;
  streak_day: number;
  completed_at: string;
  user: { full_name: string | null; email: string } | null;
}

interface LeaderboardRow {
  user_id: string;
  display_name: string;
  streak: number;
}

interface Props {
  slug: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

function formatName(name: string | null, email: string, isPublic: boolean): string {
  if (!isPublic) {
    // Blur: show first initial + last name
    const parts = (name ?? email.split('@')[0]).split(' ');
    if (parts.length >= 2) return `${parts[0][0]}. ${parts[parts.length - 1]}`;
    return `${parts[0][0]}.`;
  }
  return name ?? email.split('@')[0];
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function ClubPublicView({ slug, supabaseUrl, supabaseAnonKey }: Props) {
  const [club, setClub] = useState<Club | null>(null);
  const [feed, setFeed] = useState<CheckinRow[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  const sb = createClient(supabaseUrl, supabaseAnonKey);

  useEffect(() => {
    async function load() {
      // Get auth session (null if not signed in — that's fine for public view)
      const { data: { session } } = await sb.auth.getSession();
      const token = session?.access_token ?? null;
      setAccessToken(token);

      // Fetch club
      const { data: clubData, error: clubErr } = await sb
        .from('clubs')
        .select('id,name,slug,goal,status,season_number,public_leaderboard,price_cents,is_free,max_members,starts_at,trainer:trainer_id(full_name,avatar_url)')
        .eq('slug', slug)
        .maybeSingle();

      if (clubErr || !clubData) { setState('error'); return; }
      setClub(clubData as Club);

      // Member count
      const { count: mCount } = await sb
        .from('club_members')
        .select('id', { count: 'exact', head: true })
        .eq('club_id', clubData.id)
        .eq('status', 'active');
      setMemberCount(mCount ?? 0);

      // Follower count
      const { count: fCount } = await sb
        .from('club_followers')
        .select('id', { count: 'exact', head: true })
        .eq('club_id', clubData.id);
      setFollowerCount(fCount ?? 0);

      // Is current user following?
      if (token) {
        const { data: { user } } = await sb.auth.getUser();
        if (user) {
          const { data: followRow } = await sb
            .from('club_followers')
            .select('id')
            .eq('club_id', clubData.id)
            .eq('user_id', user.id)
            .maybeSingle();
          setIsFollowing(!!followRow);
        }
      }

      // Activity feed: latest 8 checkins with user info
      const { data: checkins } = await sb
        .from('checkins')
        .select('user_id,streak_day,completed_at,user:user_id(full_name,email)')
        .eq('club_id', clubData.id)
        .order('completed_at', { ascending: false })
        .limit(8);
      setFeed((checkins ?? []) as CheckinRow[]);

      // Leaderboard: max streak per user, top 10
      const { data: members } = await sb
        .from('club_members')
        .select('user_id,user:user_id(full_name,email)')
        .eq('club_id', clubData.id)
        .eq('status', 'active');

      if (members && members.length > 0) {
        const userIds = members.map((m: { user_id: string }) => m.user_id);
        const { data: streaks } = await sb
          .from('checkins')
          .select('user_id,streak_day')
          .eq('club_id', clubData.id)
          .in('user_id', userIds)
          .order('streak_day', { ascending: false });

        // Max streak per user
        const maxByUser: Record<string, number> = {};
        (streaks ?? []).forEach((c: { user_id: string; streak_day: number }) => {
          if (!maxByUser[c.user_id] || c.streak_day > maxByUser[c.user_id]) {
            maxByUser[c.user_id] = c.streak_day;
          }
        });

        const lb: LeaderboardRow[] = members
          .map((m: { user_id: string; user: { full_name: string | null; email: string } | null }) => ({
            user_id: m.user_id,
            display_name: formatName(
              m.user?.full_name ?? null,
              m.user?.email ?? '',
              clubData.public_leaderboard
            ),
            streak: maxByUser[m.user_id] ?? 0,
          }))
          .sort((a: LeaderboardRow, b: LeaderboardRow) => b.streak - a.streak)
          .slice(0, 10);

        setLeaderboard(lb);
      }

      setState('ready');
    }
    load();
  }, [slug]);

  function goToJoin() {
    window.location.href = `/clubs/join/${slug}`;
  }

  function goToAuth() {
    window.location.href = `/auth/callback?next=/clubs/${slug}`;
  }

  if (state === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontFamily: 'Manrope, system-ui, sans-serif' }}>
        Loading…
      </div>
    );
  }

  if (state === 'error' || !club) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontFamily: 'Manrope, system-ui, sans-serif' }}>
        Club not found.
      </div>
    );
  }

  const isActive = club.status === 'active';
  const spotsLeft = Math.max(0, club.max_members - memberCount);
  const priceDisplay = club.is_free ? 'Free' : `AED ${Math.round(club.price_cents / 100)}`;

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px 80px', fontFamily: 'Manrope, system-ui, sans-serif', color: '#fff' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <SeasonBadge seasonNumber={club.season_number} isActive={isActive} />
          {isActive && spotsLeft <= 10 && spotsLeft > 0 && (
            <span style={{ fontSize: 11, color: '#f97316', fontWeight: 600 }}>{spotsLeft} spots left</span>
          )}
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 6 }}>{club.name}</h1>
        <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>
          {club.trainer?.full_name ?? 'Coach'} · {memberCount} members · {followerCount} following
        </div>
        <p style={{ fontSize: 14, color: '#aaa', lineHeight: 1.6 }}>{club.goal}</p>
      </div>

      {/* Activity feed */}
      {feed.length > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: '#555', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 10 }}>HAPPENING NOW</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {feed.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: '#aaa' }}>
                  🔥 <span style={{ color: '#fff', fontWeight: 600 }}>
                    {formatName(c.user?.full_name ?? null, c.user?.email ?? '', club.public_leaderboard)}
                  </span> · Day {c.streak_day}
                </div>
                <div style={{ fontSize: 11, color: '#555' }}>{timeAgo(c.completed_at)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, color: '#555', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 10 }}>LEADERBOARD</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {leaderboard.map((row, i) => (
              <div key={row.user_id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: i === 0 ? '#f97316' : '#555', fontWeight: 700, width: 18 }}>{i + 1}</div>
                <div style={{ fontSize: 13, color: '#fff', flex: 1 }}>{row.display_name}</div>
                <div style={{ fontSize: 12, color: '#4ade80', fontWeight: 600 }}>🔥 {row.streak}</div>
              </div>
            ))}
            {/* Ghost row for non-member */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px dashed rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: 12, color: '#444', fontWeight: 700, width: 18 }}>—</div>
              <div style={{ fontSize: 13, color: '#444', fontStyle: 'italic', flex: 1 }}>You · join to appear here</div>
            </div>
          </div>
        </div>
      )}

      {/* CTAs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {isActive && (
          <button
            onClick={goToJoin}
            style={{ background: '#7c3aed', border: 'none', borderRadius: 12, padding: '15px 24px', fontSize: 15, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {club.is_free ? 'Join free' : `Join Season ${club.season_number} — ${priceDisplay}`}
            {spotsLeft <= 10 && spotsLeft > 0 ? ` · ${spotsLeft} left` : ''}
          </button>
        )}
        <FollowButton
          clubId={club.id}
          initialFollowing={isFollowing}
          supabaseUrl={supabaseUrl}
          supabaseAnonKey={supabaseAnonKey}
          accessToken={accessToken}
          onAuthRequired={goToAuth}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/club/ClubPublicView.tsx
git commit -m "feat: add ClubPublicView component with activity feed + leaderboard"
```

---

## Task 7: `ClubAlumniView` Component

**Files:**
- Create: `src/components/club/ClubAlumniView.tsx`

Shown to users who completed a past season of this club but are not enrolled in the current one.

- [ ] **Step 1: Create component**

```tsx
// src/components/club/ClubAlumniView.tsx
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { SeasonBadge } from './SeasonBadge';

interface Props {
  slug: string;
  clubId: string;
  seasonNumber: number;
  completedSeasonNumber: number;
  successorSlug: string | null;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export function ClubAlumniView({ slug, clubId, seasonNumber, completedSeasonNumber, successorSlug, supabaseUrl, supabaseAnonKey }: Props) {
  const [stats, setStats] = useState<{ days_completed: number; max_streak: number } | null>(null);

  const sb = createClient(supabaseUrl, supabaseAnonKey);

  useEffect(() => {
    async function loadStats() {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;

      const { data } = await sb
        .from('checkins')
        .select('streak_day')
        .eq('club_id', clubId)
        .eq('user_id', user.id)
        .order('streak_day', { ascending: false });

      if (data && data.length > 0) {
        setStats({
          days_completed: data.length,
          max_streak: data[0].streak_day,
        });
      }
    }
    loadStats();
  }, [clubId]);

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '40px 16px 80px', fontFamily: 'Manrope, system-ui, sans-serif', color: '#fff', textAlign: 'center' }}>
      <div style={{ marginBottom: 24 }}>
        <SeasonBadge seasonNumber={completedSeasonNumber} isCompleted size="md" />
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>You finished Season {completedSeasonNumber}</h2>
      {stats && (
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', margin: '24px 0' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '16px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#4ade80' }}>{stats.days_completed}</div>
            <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>days completed</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '16px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#f97316' }}>🔥 {stats.max_streak}</div>
            <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>longest streak</div>
          </div>
        </div>
      )}
      {successorSlug ? (
        <div>
          <p style={{ fontSize: 14, color: '#aaa', marginBottom: 20 }}>Season {seasonNumber} is open. Join as an alumni.</p>
          <a
            href={`/clubs/join/${successorSlug}`}
            style={{ display: 'block', background: '#7c3aed', borderRadius: 12, padding: '15px 24px', fontSize: 15, fontWeight: 700, color: '#fff', textDecoration: 'none' }}
          >
            Join Season {seasonNumber} →
          </a>
        </div>
      ) : (
        <p style={{ fontSize: 14, color: '#555', marginTop: 16 }}>Season {seasonNumber} hasn't launched yet. You'll be notified when it does.</p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/club/ClubAlumniView.tsx
git commit -m "feat: add ClubAlumniView component with season stats + next-season CTA"
```

---

## Task 8: `ClubPage` Router + Update `clubs/[slug].astro`

**Files:**
- Create: `src/components/club/ClubPage.tsx`
- Modify: `src/pages/clubs/[slug].astro`

`ClubPage` determines the viewer's state and renders the correct view. It replaces the current pattern of rendering `ClubMemberView` directly from the Astro page.

**Viewer states:**
1. **Not signed in OR signed in but not a member and not a follower** → `ClubPublicView` (follow/join CTAs shown)
2. **Signed in, following but not a member** → `ClubPublicView` (same component, `FollowButton` shows "Following ✓")
3. **Signed in, active member** → `ClubMemberView` (existing component, unchanged)
4. **Signed in, completed a past season of this club family (alumni)** → `ClubAlumniView`

- [ ] **Step 1: Create `ClubPage.tsx`**

```tsx
// src/components/club/ClubPage.tsx
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ClubMemberView } from './ClubMemberView';
import { ClubPublicView } from './ClubPublicView';
import { ClubAlumniView } from './ClubAlumniView';

type ViewState = 'loading' | 'public' | 'member' | 'alumni';

interface ClubInfo {
  id: string;
  season_number: number;
  parent_club_id: string | null;
  successor?: { slug: string; season_number: number } | null;
}

interface Props {
  slug: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export function ClubPage({ slug, supabaseUrl, supabaseAnonKey }: Props) {
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [clubInfo, setClubInfo] = useState<ClubInfo | null>(null);
  const [alumniSeasonNumber, setAlumniSeasonNumber] = useState(0);

  const sb = createClient(supabaseUrl, supabaseAnonKey);

  useEffect(() => {
    async function detect() {
      // Fetch club basics
      const { data: club } = await sb
        .from('clubs')
        .select('id,season_number,parent_club_id')
        .eq('slug', slug)
        .maybeSingle();

      if (!club) { setViewState('public'); return; }

      // Fetch successor season if any (club where parent_club_id = this club's id)
      const { data: successor } = await sb
        .from('clubs')
        .select('slug,season_number')
        .eq('parent_club_id', club.id)
        .order('season_number', { ascending: false })
        .limit(1)
        .maybeSingle();

      setClubInfo({ ...club, successor: successor ?? null });

      // Check auth
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { setViewState('public'); return; }

      // Check active membership in THIS club
      const { data: membership } = await sb
        .from('club_members')
        .select('id')
        .eq('club_id', club.id)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (membership) { setViewState('member'); return; }

      // Check if alumni: any completed season in this club's family
      // Get all club IDs in this family (this club + all with same root parent)
      const rootId = club.parent_club_id ?? club.id;
      const { data: familyClubs } = await sb
        .from('clubs')
        .select('id,season_number')
        .or(`id.eq.${rootId},parent_club_id.eq.${rootId}`);

      if (familyClubs && familyClubs.length > 0) {
        const familyIds = familyClubs.map((c: { id: string }) => c.id);
        const { data: pastMembership } = await sb
          .from('club_members')
          .select('club_id,season_number')
          .in('club_id', familyIds)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (pastMembership) {
          const completedSeason = familyClubs.find((c: { id: string }) => c.id === pastMembership.club_id);
          setAlumniSeasonNumber(completedSeason?.season_number ?? 1);
          setViewState('alumni');
          return;
        }
      }

      setViewState('public');
    }
    detect();
  }, [slug]);

  if (viewState === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontFamily: 'Manrope, system-ui, sans-serif' }}>
        Loading…
      </div>
    );
  }

  if (viewState === 'member') {
    return <ClubMemberView slug={slug} supabaseUrl={supabaseUrl} supabaseAnonKey={supabaseAnonKey} />;
  }

  if (viewState === 'alumni' && clubInfo) {
    return (
      <ClubAlumniView
        slug={slug}
        clubId={clubInfo.id}
        seasonNumber={clubInfo.season_number}
        completedSeasonNumber={alumniSeasonNumber}
        successorSlug={clubInfo.successor?.slug ?? null}
        supabaseUrl={supabaseUrl}
        supabaseAnonKey={supabaseAnonKey}
      />
    );
  }

  return <ClubPublicView slug={slug} supabaseUrl={supabaseUrl} supabaseAnonKey={supabaseAnonKey} />;
}
```

- [ ] **Step 2: Update `src/pages/clubs/[slug].astro`**

Replace the current content of `src/pages/clubs/[slug].astro` (which renders `ClubMemberView` directly) with:

```astro
---
import Base from '../../layouts/Base.astro';
import { ClubPage } from '../../components/club/ClubPage';
const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';
const { slug } = Astro.params;
---
<Base title="Club — TrainedBy" description="Join this accountability club">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0f0e0d; color: #fff; font-family: 'Manrope', system-ui, sans-serif; min-height: 100vh; }
</style>
<ClubPage
  client:load
  slug={slug}
  supabaseUrl={SUPABASE_URL}
  supabaseAnonKey={SUPABASE_ANON_KEY}
/>
</Base>
```

- [ ] **Step 3: Run type-check**

```bash
cd /Users/bobanpepic/trainedby && pnpm astro check 2>&1 | grep "clubs/\[slug\]" | head -10
```
Expected: No new errors for `clubs/[slug].astro`.

- [ ] **Step 4: Commit**

```bash
git add src/components/club/ClubPage.tsx src/pages/clubs/[slug].astro
git commit -m "feat: add ClubPage router — public/member/alumni state detection"
```

---

## Task 9: Trainer Dashboard — Follower Count + "Start Season 2"

**Files:**
- Modify: `src/components/club/TrainerClubDashboard.tsx`

Two additions:
1. Show follower count alongside member count in the stats row
2. Show "Start Season 2" button when the club has been active for ≥ 27 days (3 days before 30-day end) or has `status = 'completed'`

- [ ] **Step 1: Read current stats section**

Read `src/components/club/TrainerClubDashboard.tsx` lines 1–80 to find the stats display pattern and the existing state/fetch logic.

- [ ] **Step 2: Add follower count to state + fetch**

Find where `memberCount` is fetched (it's fetched from `club_members` with a count query). Add a parallel query for follower count immediately after:

```typescript
// After the existing member count query, add:
const { count: fCount } = await sb
  .from('club_followers')
  .select('id', { count: 'exact', head: true })
  .eq('club_id', club.id);
setFollowerCount(fCount ?? 0);
```

Add `followerCount` to the component's state:
```typescript
const [followerCount, setFollowerCount] = useState(0);
```

- [ ] **Step 3: Add follower count to stats display**

In the stats grid (find the section that shows member count, completion rate, etc.), add a follower stat cell. The existing stats use a consistent pattern — add a new cell with the same structure:

```tsx
<div style={{ textAlign: 'center' }}>
  <div style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>{followerCount}</div>
  <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>followers</div>
</div>
```

- [ ] **Step 4: Add "Start Season 2" button**

Add `showSeasonButton` computed value after the club data loads:

```typescript
// After club data is loaded, compute:
const dayNumber = club.starts_at
  ? Math.floor((Date.now() - new Date(club.starts_at).getTime()) / 86400000) + 1
  : 0;
const showSeasonButton = club.status === 'active' && dayNumber >= 27;
```

Add state for the new season modal (keep it simple — just a confirm button that calls `start-season`):

```typescript
const [startingSeasonLoading, setStartingSeasonLoading] = useState(false);
```

Add the button to the bottom of the dashboard, below the mission queue:

```tsx
{showSeasonButton && (
  <div style={{ marginTop: 32, padding: '20px', background: 'rgba(124,58,237,0.08)', borderRadius: 12, border: '1px solid rgba(124,58,237,0.2)' }}>
    <div style={{ fontSize: 13, color: '#a78bfa', fontWeight: 700, marginBottom: 8 }}>Season ending soon</div>
    <p style={{ fontSize: 13, color: '#888', marginBottom: 16, lineHeight: 1.6 }}>
      Start Season {(club.season_number ?? 1) + 1} to keep your crew going. AI will generate a fresh 30-day mission set.
    </p>
    <button
      disabled={startingSeasonLoading}
      onClick={async () => {
        setStartingSeasonLoading(true);
        const { data: { session } } = await sb.auth.getSession();
        if (!session) return;
        const res = await fetch(`${supabaseUrl}/functions/v1/start-season`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': supabaseAnonKey,
          },
          body: JSON.stringify({
            parent_club_id: club.id,
            name: club.name,
            goal: club.goal,
            price_cents: club.price_cents,
            is_free: club.is_free,
          }),
        });
        const data = await res.json();
        if (data.ok && data.club) {
          window.location.href = `/dashboard/clubs/${data.club.slug}`;
        }
        setStartingSeasonLoading(false);
      }}
      style={{ background: '#7c3aed', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 13, fontWeight: 700, color: '#fff', cursor: startingSeasonLoading ? 'not-allowed' : 'pointer', opacity: startingSeasonLoading ? 0.6 : 1 }}
    >
      {startingSeasonLoading ? 'Creating Season…' : `Start Season ${(club.season_number ?? 1) + 1} →`}
    </button>
  </div>
)}
```

- [ ] **Step 5: Run type-check**

```bash
cd /Users/bobanpepic/trainedby && pnpm astro check 2>&1 | grep "TrainerClubDashboard" | head -10
```
Expected: No new errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/club/TrainerClubDashboard.tsx
git commit -m "feat: add follower count + Start Season button to trainer club dashboard"
```

---

## Task 10: Build Verification + Deploy

**Files:** All modified/created files above.

- [ ] **Step 1: Full type-check**

```bash
cd /Users/bobanpepic/trainedby && pnpm astro check 2>&1 | tail -10
```
Expected: 0 new errors from Phase 1 files.

- [ ] **Step 2: Production build**

```bash
cd /Users/bobanpepic/trainedby && pnpm astro build 2>&1 | tail -10
```
Expected: Build completes successfully.

- [ ] **Step 3: Verify no old marketplace language crept in**

```bash
cd /Users/bobanpepic/trainedby && grep -rn "book a session\|find a trainer\|marketplace" src/components/club/ --include="*.tsx" | head -10
```
Expected: 0 matches.

- [ ] **Step 4: Smoke-test checklist (manual)**

- Navigate to a club page while logged out → see `ClubPublicView` with activity feed + leaderboard + "Follow free" button
- Click "Follow free" while logged out → redirected to auth
- Log in, return to club page, click "Follow free" → button changes to "Following ✓"
- Log in as a club member → see `ClubMemberView` (unchanged member experience)
- Log in as a trainer on their dashboard → see follower count in stats row
- If club is on day 27+, see "Start Season 2" button

- [ ] **Step 5: Push to main**

```bash
cd /Users/bobanpepic/trainedby && git push origin main
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| `club_followers` table with RLS | Task 1 |
| `season_number`, `parent_club_id`, `public_leaderboard` on clubs | Task 1 |
| `season_number` on club_members | Task 1 |
| `follow-club` edge function (upsert, idempotent) | Task 2 |
| `unfollow-club` edge function | Task 2 |
| `start-season` edge function (creates successor, fires generate-missions) | Task 3 |
| `SeasonBadge` component | Task 4 |
| `FollowButton` with optimistic UI + auth redirect | Task 5 |
| `ClubPublicView` — activity feed, leaderboard, name blurring, ghost row | Task 6 |
| `ClubAlumniView` — season badge, stats, next-season CTA | Task 7 |
| `ClubPage` router — three-state detection client-side | Task 8 |
| clubs/[slug].astro updated | Task 8 |
| Follower count in trainer dashboard | Task 9 |
| "Start Season 2" button with 27-day trigger | Task 9 |
| Build verification + push | Task 10 |
