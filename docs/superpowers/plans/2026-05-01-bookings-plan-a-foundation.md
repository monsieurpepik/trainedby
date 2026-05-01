# Direct Bookings — Plan A: Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trainers can complete three-step booking setup (Stripe Connect → session types → availability) so the "Book a Session" button can go live — no consumer-facing booking yet.

**Architecture:** DB schema first (5 new tables + 2 trainers columns), then three edge functions for Stripe Connect, then two edge functions for managing session types and availability, then dashboard and edit.astro UI additions. Every edge function uses the shared `_shared/errors.ts` + `_shared/logger.ts` pattern.

**Tech Stack:** Supabase PostgreSQL (migrations), Deno edge functions, Stripe 14.21.0 Connect Express, Astro SSR (inline JS pattern)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `supabase/migrations/20260501_bookings_schema.sql` | Create | All 5 booking tables + trainers columns |
| `supabase/functions/connect-stripe/index.ts` | Create | Creates Connect Express account, returns onboarding URL |
| `supabase/functions/connect-stripe-return/index.ts` | Create | Verifies onboarding complete, sets `stripe_connect_onboarded = true` |
| `supabase/functions/manage-session-types/index.ts` | Create | CRUD for trainer session types (trainer-auth required) |
| `supabase/functions/manage-availability/index.ts` | Create | CRUD for weekly schedule + date overrides (trainer-auth required) |
| `supabase/functions/get-trainer-slots/index.ts` | Create | Returns available booking slots for a date range (public, no auth) |
| `supabase/config.toml` | Modify | Add `verify_jwt = false` entries for upcoming webhook + cron functions |
| `src/pages/dashboard.astro` | Modify | Add setup gating card (SSR reads 3 setup conditions, shows steps card) |
| `src/pages/edit.astro` | Modify | Add Sessions tab and Availability tab sections |

---

## Task 1: DB Migration

**Files:**
- Create: `supabase/migrations/20260501_bookings_schema.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- supabase/migrations/20260501_bookings_schema.sql

-- ── Trainers: add Stripe Connect columns ─────────────────────────────────────
ALTER TABLE trainers
  ADD COLUMN IF NOT EXISTS stripe_connect_account_id TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS stripe_connect_onboarded   BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN trainers.stripe_connect_account_id IS 'Stripe Connect Express account ID (acct_xxx)';
COMMENT ON COLUMN trainers.stripe_connect_onboarded IS 'True once trainer completes Stripe onboarding and charges_enabled = true';

-- ── session_types ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS session_types (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id    UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  duration_min  INT  NOT NULL CHECK (duration_min > 0),
  price_cents   INT  NOT NULL CHECK (price_cents > 0),
  type          TEXT NOT NULL CHECK (type IN ('single', 'package')),
  package_count INT  CHECK (
    (type = 'package' AND package_count > 1) OR
    (type = 'single'  AND package_count IS NULL)
  ),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_types_trainer ON session_types (trainer_id) WHERE is_active = TRUE;

-- ── trainer_availability ──────────────────────────────────────────────────────
-- One row per available day-of-week per trainer.
-- day_of_week: 0=Sunday … 6=Saturday
CREATE TABLE IF NOT EXISTS trainer_availability (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id   UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  day_of_week  INT  NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL CHECK (end_time > start_time),
  UNIQUE (trainer_id, day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_trainer_avail_trainer ON trainer_availability (trainer_id);

-- ── availability_overrides ────────────────────────────────────────────────────
-- Date-specific exceptions: block a date (is_blocked = true) or force-open one.
CREATE TABLE IF NOT EXISTS availability_overrides (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id  UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  is_blocked  BOOLEAN NOT NULL DEFAULT TRUE,
  note        TEXT,
  UNIQUE (trainer_id, date)
);

CREATE INDEX IF NOT EXISTS idx_avail_overrides_trainer_date ON availability_overrides (trainer_id, date);

-- ── bookings ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id                UUID NOT NULL REFERENCES trainers(id),
  session_type_id           UUID NOT NULL REFERENCES session_types(id),
  consumer_name             TEXT NOT NULL,
  consumer_email            TEXT NOT NULL,
  consumer_phone            TEXT NOT NULL,
  consumer_goal             TEXT,
  scheduled_at              TIMESTAMPTZ NOT NULL,
  duration_min              INT  NOT NULL,
  amount_cents              INT  NOT NULL,
  stripe_payment_intent_id  TEXT,
  stripe_charge_id          TEXT,
  status                    TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','cancelled','refunded','completed')),
  cancelled_at              TIMESTAMPTZ,
  refunded_at               TIMESTAMPTZ,
  package_credit_id         UUID,  -- FK added after package_credits table (see below)
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_trainer_status ON bookings (trainer_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled ON bookings (scheduled_at) WHERE status IN ('pending','confirmed');

-- ── package_credits ───────────────────────────────────────────────────────────
-- One row per session credit in a package purchase.
CREATE TABLE IF NOT EXISTS package_credits (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id                UUID NOT NULL REFERENCES trainers(id),
  session_type_id           UUID NOT NULL REFERENCES session_types(id),
  consumer_email            TEXT NOT NULL,
  consumer_name             TEXT NOT NULL,
  stripe_payment_intent_id  TEXT NOT NULL,
  status                    TEXT NOT NULL DEFAULT 'available'
    CHECK (status IN ('available','scheduled','used','cancelled')),
  booking_id                UUID REFERENCES bookings(id),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_package_credits_consumer ON package_credits (consumer_email, trainer_id);

-- ── Add deferred FK from bookings → package_credits ──────────────────────────
-- bookings.package_credit_id can point to a credit (for package bookings).
-- This is a nullable FK; insertion order is: credits first, then booking,
-- then UPDATE credit.booking_id.
ALTER TABLE bookings
  ADD CONSTRAINT fk_bookings_package_credit
  FOREIGN KEY (package_credit_id) REFERENCES package_credits(id);

-- ── RLS: keep tables trainer-private by default ───────────────────────────────
-- Edge functions use service role key, so RLS doesn't apply to them.
-- Enabling RLS prevents accidental anon key leaks.
ALTER TABLE session_types          ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_availability   ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings               ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_credits        ENABLE ROW LEVEL SECURITY;
```

- [ ] **Step 2: Apply the migration to local Supabase**

```bash
supabase db push
```

Expected: migration applies cleanly, no errors. If you see "already exists" errors, the migration was partially applied — check `supabase/migrations/` for a conflicting file.

- [ ] **Step 3: Verify tables exist**

```bash
supabase db query "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('session_types','trainer_availability','availability_overrides','bookings','package_credits') ORDER BY table_name;"
```

Expected output (5 rows):
```
availability_overrides
bookings
package_credits
session_types
trainer_availability
```

Also verify trainers got the new columns:
```bash
supabase db query "SELECT column_name FROM information_schema.columns WHERE table_name = 'trainers' AND column_name IN ('stripe_connect_account_id','stripe_connect_onboarded');"
```

Expected: 2 rows.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260501_bookings_schema.sql
git commit -m "feat: add bookings schema (session_types, availability, bookings, package_credits)"
```

---

## Task 2: `connect-stripe` Edge Function

Creates or retrieves a Stripe Connect Express account for a trainer and returns the hosted onboarding URL.

**Files:**
- Create: `supabase/functions/connect-stripe/index.ts`

- [ ] **Step 1: Create the function**

```typescript
// supabase/functions/connect-stripe/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { CORS_HEADERS, jsonResponse, errorResponse, unauthorizedError } from "../_shared/errors.ts";
import { createLogger } from "../_shared/logger.ts";

const logger = createLogger("connect-stripe");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });

  const start = Date.now();

  try {
    // Auth: accept Authorization Bearer token (same session token as dashboard uses)
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return unauthorizedError();

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
    });

    // Validate session token against magic_links
    const { data: link } = await sb
      .from("magic_links")
      .select("trainer_id")
      .eq("token", token)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .single();
    if (!link?.trainer_id) return unauthorizedError();

    const { data: trainer } = await sb
      .from("trainers")
      .select("email, name, stripe_connect_account_id")
      .eq("id", link.trainer_id)
      .single();
    if (!trainer) return errorResponse("Trainer not found", 404, "NOT_FOUND");

    const appUrl = Deno.env.get("APP_URL") ?? "https://trainedby.com";

    // Create or retrieve Connect Express account
    let accountId = trainer.stripe_connect_account_id;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: trainer.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: { trainer_id: link.trainer_id },
      });
      accountId = account.id;
      await sb
        .from("trainers")
        .update({ stripe_connect_account_id: accountId })
        .eq("id", link.trainer_id);
    }

    // Generate a fresh onboarding link (expires after ~10 minutes)
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/dashboard?stripe=refresh`,
      return_url: `${appUrl}/dashboard?stripe=return`,
      type: "account_onboarding",
    });

    logger.info("connect_link_created", {
      trainer_id: link.trainer_id,
      account_id: accountId,
      duration_ms: Date.now() - start,
    });

    return jsonResponse({ url: accountLink.url });
  } catch (e) {
    logger.exception(e, { fn: "connect-stripe" });
    return errorResponse("Internal server error", 500);
  }
});
```

- [ ] **Step 2: Deploy and verify**

```bash
SUPABASE_ACCESS_TOKEN=<token> ./scripts/deploy_functions.sh connect-stripe
```

Then verify (replace `<session_token>` with a valid trainer session from `magic_links`):

```bash
curl -s -X POST \
  "https://mezhtdbfyvkshpuplqqw.supabase.co/functions/v1/connect-stripe" \
  -H "Authorization: Bearer <session_token>" \
  -H "Content-Type: application/json"
```

Expected: `{"url":"https://connect.stripe.com/setup/e/..."}` (a real Stripe-hosted URL).

Missing `STRIPE_SECRET_KEY` or `APP_URL` env vars will cause 500 — set them in Supabase dashboard → Edge Functions → Secrets.

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/connect-stripe/
git commit -m "feat: connect-stripe edge function — creates Stripe Connect Express account"
```

---

## Task 3: `connect-stripe-return` Edge Function

Called after the trainer completes (or re-visits) the Stripe onboarding flow. Verifies `charges_enabled` on the Stripe account and sets `stripe_connect_onboarded = true`.

**Files:**
- Create: `supabase/functions/connect-stripe-return/index.ts`

- [ ] **Step 1: Create the function**

```typescript
// supabase/functions/connect-stripe-return/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { CORS_HEADERS, jsonResponse, errorResponse, unauthorizedError } from "../_shared/errors.ts";
import { createLogger } from "../_shared/logger.ts";

const logger = createLogger("connect-stripe-return");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });

  const start = Date.now();

  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return unauthorizedError();

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
    });

    const { data: link } = await sb
      .from("magic_links")
      .select("trainer_id")
      .eq("token", token)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .single();
    if (!link?.trainer_id) return unauthorizedError();

    const { data: trainer } = await sb
      .from("trainers")
      .select("stripe_connect_account_id, stripe_connect_onboarded")
      .eq("id", link.trainer_id)
      .single();

    if (!trainer?.stripe_connect_account_id) {
      return errorResponse("No Connect account found. Start onboarding first.", 400, "NO_ACCOUNT");
    }

    // If already onboarded, short-circuit
    if (trainer.stripe_connect_onboarded) {
      return jsonResponse({ onboarded: true, charges_enabled: true });
    }

    // Check with Stripe whether the account is ready to charge
    const account = await stripe.accounts.retrieve(trainer.stripe_connect_account_id);
    const onboarded = account.charges_enabled && account.details_submitted;

    if (onboarded) {
      await sb
        .from("trainers")
        .update({ stripe_connect_onboarded: true })
        .eq("id", link.trainer_id);
    }

    logger.info("connect_return_checked", {
      trainer_id: link.trainer_id,
      onboarded,
      charges_enabled: account.charges_enabled,
      details_submitted: account.details_submitted,
      duration_ms: Date.now() - start,
    });

    return jsonResponse({
      onboarded,
      charges_enabled: account.charges_enabled,
    });
  } catch (e) {
    logger.exception(e, { fn: "connect-stripe-return" });
    return errorResponse("Internal server error", 500);
  }
});
```

- [ ] **Step 2: Deploy**

```bash
SUPABASE_ACCESS_TOKEN=<token> ./scripts/deploy_functions.sh connect-stripe-return
```

- [ ] **Step 3: Test (without real Stripe account)**

With a trainer that has no Connect account yet:
```bash
curl -s -X POST \
  "https://mezhtdbfyvkshpuplqqw.supabase.co/functions/v1/connect-stripe-return" \
  -H "Authorization: Bearer <session_token>"
```
Expected: `{"error":"No Connect account found. Start onboarding first.","code":"NO_ACCOUNT","status":400}`

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/connect-stripe-return/
git commit -m "feat: connect-stripe-return edge function — verifies Stripe onboarding complete"
```

---

## Task 4: `manage-session-types` Edge Function

CRUD for a trainer's session types. Trainer-auth required for all operations.

- `GET /manage-session-types` — list all session types for the authenticated trainer
- `POST /manage-session-types` — create a new session type
- `PUT /manage-session-types` — update or toggle `is_active` on an existing session type

**Files:**
- Create: `supabase/functions/manage-session-types/index.ts`

- [ ] **Step 1: Create the function**

```typescript
// supabase/functions/manage-session-types/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  CORS_HEADERS,
  jsonResponse,
  errorResponse,
  validationError,
  unauthorizedError,
  sanitize,
} from "../_shared/errors.ts";
import { createLogger } from "../_shared/logger.ts";

const logger = createLogger("manage-session-types");

async function resolveTrainer(req: Request, sb: ReturnType<typeof createClient>) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const { data: link } = await sb
    .from("magic_links")
    .select("trainer_id")
    .eq("token", token)
    .eq("used", false)
    .gt("expires_at", new Date().toISOString())
    .single();
  return link?.trainer_id ?? null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const trainerId = await resolveTrainer(req, sb);
  if (!trainerId) return unauthorizedError();

  // ── GET: list session types ──────────────────────────────────────────────────
  if (req.method === "GET") {
    const { data, error } = await sb
      .from("session_types")
      .select("id, name, duration_min, price_cents, type, package_count, is_active, created_at")
      .eq("trainer_id", trainerId)
      .order("created_at", { ascending: true });
    if (error) return errorResponse("Failed to load session types", 500);
    return jsonResponse({ session_types: data });
  }

  // ── POST: create session type ────────────────────────────────────────────────
  if (req.method === "POST") {
    const body = await req.json().catch(() => null);
    if (!body) return errorResponse("Invalid JSON", 400);

    const name = sanitize(body.name);
    const duration_min = parseInt(body.duration_min);
    const price_cents = parseInt(body.price_cents);
    const type = body.type;
    const package_count = body.package_count ? parseInt(body.package_count) : null;

    if (!name) return validationError("name", "Name is required");
    if (!duration_min || duration_min < 15) return validationError("duration_min", "Duration must be at least 15 minutes");
    if (!price_cents || price_cents < 100) return validationError("price_cents", "Price must be at least $1.00");
    if (!["single", "package"].includes(type)) return validationError("type", "Type must be 'single' or 'package'");
    if (type === "package" && (!package_count || package_count < 2)) {
      return validationError("package_count", "Package must include at least 2 sessions");
    }

    const { data, error } = await sb
      .from("session_types")
      .insert({ trainer_id: trainerId, name, duration_min, price_cents, type, package_count })
      .select()
      .single();
    if (error) {
      logger.error("create_session_type_failed", { error: error.message, trainer_id: trainerId });
      return errorResponse("Failed to create session type", 500);
    }

    logger.info("session_type_created", { id: data.id, trainer_id: trainerId, type });
    return jsonResponse({ session_type: data }, 201);
  }

  // ── PUT: update / toggle active ──────────────────────────────────────────────
  if (req.method === "PUT") {
    const body = await req.json().catch(() => null);
    if (!body?.id) return validationError("id", "Session type ID is required");

    // Confirm ownership
    const { data: existing } = await sb
      .from("session_types")
      .select("id")
      .eq("id", body.id)
      .eq("trainer_id", trainerId)
      .single();
    if (!existing) return errorResponse("Session type not found", 404, "NOT_FOUND");

    // Build update payload — only allow safe fields
    const updates: Record<string, unknown> = {};
    if (body.name !== undefined)          updates.name          = sanitize(body.name);
    if (body.duration_min !== undefined)  updates.duration_min  = parseInt(body.duration_min);
    if (body.price_cents !== undefined)   updates.price_cents   = parseInt(body.price_cents);
    if (body.is_active !== undefined)     updates.is_active     = Boolean(body.is_active);

    if (Object.keys(updates).length === 0) return errorResponse("No fields to update", 400);

    const { data, error } = await sb
      .from("session_types")
      .update(updates)
      .eq("id", body.id)
      .select()
      .single();
    if (error) return errorResponse("Failed to update session type", 500);

    return jsonResponse({ session_type: data });
  }

  return errorResponse("Method not allowed", 405);
});
```

- [ ] **Step 2: Deploy**

```bash
SUPABASE_ACCESS_TOKEN=<token> ./scripts/deploy_functions.sh manage-session-types
```

- [ ] **Step 3: Test create**

```bash
curl -s -X POST \
  "https://mezhtdbfyvkshpuplqqw.supabase.co/functions/v1/manage-session-types" \
  -H "Authorization: Bearer <session_token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"60-min PT Session","duration_min":60,"price_cents":8000,"type":"single"}'
```

Expected: `{"session_type":{"id":"...","name":"60-min PT Session","duration_min":60,"price_cents":8000,"type":"single","package_count":null,"is_active":true,...}}`

- [ ] **Step 4: Test GET**

```bash
curl -s "https://mezhtdbfyvkshpuplqqw.supabase.co/functions/v1/manage-session-types" \
  -H "Authorization: Bearer <session_token>"
```

Expected: `{"session_types":[{"id":"...","name":"60-min PT Session",...}]}`

- [ ] **Step 5: Test toggle**

```bash
curl -s -X PUT \
  "https://mezhtdbfyvkshpuplqqw.supabase.co/functions/v1/manage-session-types" \
  -H "Authorization: Bearer <session_token>" \
  -H "Content-Type: application/json" \
  -d '{"id":"<session_type_id>","is_active":false}'
```

Expected: `{"session_type":{...,"is_active":false}}`

- [ ] **Step 6: Commit**

```bash
git add supabase/functions/manage-session-types/
git commit -m "feat: manage-session-types edge function — CRUD for trainer session types"
```

---

## Task 5: `manage-availability` Edge Function

Manages a trainer's weekly schedule and date-specific overrides.

- `GET /manage-availability` — returns weekly schedule + all overrides
- `PUT /manage-availability` — replaces the full weekly schedule (array of day objects)
- `POST /manage-availability/override` — adds a date override (blocked date or range)
- `DELETE /manage-availability/override` — removes a date override

Differentiate operations via query param `?op=schedule|override` and method.

**Files:**
- Create: `supabase/functions/manage-availability/index.ts`

- [ ] **Step 1: Create the function**

```typescript
// supabase/functions/manage-availability/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  CORS_HEADERS,
  jsonResponse,
  errorResponse,
  validationError,
  unauthorizedError,
  sanitize,
} from "../_shared/errors.ts";
import { createLogger } from "../_shared/logger.ts";

const logger = createLogger("manage-availability");

async function resolveTrainer(req: Request, sb: ReturnType<typeof createClient>) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const { data: link } = await sb
    .from("magic_links")
    .select("trainer_id")
    .eq("token", token)
    .eq("used", false)
    .gt("expires_at", new Date().toISOString())
    .single();
  return link?.trainer_id ?? null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });

  const url = new URL(req.url);
  const op = url.searchParams.get("op") ?? "schedule";

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const trainerId = await resolveTrainer(req, sb);
  if (!trainerId) return unauthorizedError();

  // ── GET: return schedule + overrides ────────────────────────────────────────
  if (req.method === "GET") {
    const [{ data: schedule }, { data: overrides }] = await Promise.all([
      sb.from("trainer_availability")
        .select("id, day_of_week, start_time, end_time")
        .eq("trainer_id", trainerId)
        .order("day_of_week"),
      sb.from("availability_overrides")
        .select("id, date, is_blocked, note")
        .eq("trainer_id", trainerId)
        .gte("date", new Date().toISOString().substring(0, 10))
        .order("date"),
    ]);
    return jsonResponse({ schedule: schedule ?? [], overrides: overrides ?? [] });
  }

  // ── PUT: replace full weekly schedule ────────────────────────────────────────
  // Body: { days: [{ day_of_week: 1, start_time: "06:00", end_time: "14:00" }, ...] }
  if (req.method === "PUT" && op === "schedule") {
    const body = await req.json().catch(() => null);
    if (!Array.isArray(body?.days)) return validationError("days", "days must be an array");

    for (const d of body.days) {
      if (d.day_of_week < 0 || d.day_of_week > 6) {
        return validationError("day_of_week", "day_of_week must be 0–6");
      }
      if (!/^\d{2}:\d{2}$/.test(d.start_time) || !/^\d{2}:\d{2}$/.test(d.end_time)) {
        return validationError("time", "start_time and end_time must be HH:MM");
      }
      if (d.start_time >= d.end_time) {
        return validationError("time", "end_time must be after start_time");
      }
    }

    // Delete existing then insert new (simpler than upsert for replace-all)
    await sb.from("trainer_availability").delete().eq("trainer_id", trainerId);

    if (body.days.length > 0) {
      const rows = body.days.map((d: { day_of_week: number; start_time: string; end_time: string }) => ({
        trainer_id: trainerId,
        day_of_week: d.day_of_week,
        start_time: d.start_time,
        end_time: d.end_time,
      }));
      const { error } = await sb.from("trainer_availability").insert(rows);
      if (error) return errorResponse("Failed to save schedule", 500);
    }

    logger.info("schedule_updated", { trainer_id: trainerId, days_count: body.days.length });
    return jsonResponse({ ok: true, days_saved: body.days.length });
  }

  // ── POST: add override ───────────────────────────────────────────────────────
  // Body: { date: "YYYY-MM-DD", is_blocked: true, note?: "holiday" }
  if (req.method === "POST" && op === "override") {
    const body = await req.json().catch(() => null);
    if (!body?.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
      return validationError("date", "date must be YYYY-MM-DD");
    }

    const { error } = await sb.from("availability_overrides").upsert({
      trainer_id: trainerId,
      date: body.date,
      is_blocked: body.is_blocked !== false, // default true
      note: body.note ? sanitize(body.note) : null,
    }, { onConflict: "trainer_id,date" });

    if (error) return errorResponse("Failed to save override", 500);
    logger.info("override_added", { trainer_id: trainerId, date: body.date });
    return jsonResponse({ ok: true });
  }

  // ── DELETE: remove override ──────────────────────────────────────────────────
  // Body: { date: "YYYY-MM-DD" }
  if (req.method === "DELETE" && op === "override") {
    const body = await req.json().catch(() => null);
    if (!body?.date) return validationError("date", "date is required");

    await sb.from("availability_overrides")
      .delete()
      .eq("trainer_id", trainerId)
      .eq("date", body.date);

    return jsonResponse({ ok: true });
  }

  return errorResponse("Method not allowed", 405);
});
```

- [ ] **Step 2: Deploy**

```bash
SUPABASE_ACCESS_TOKEN=<token> ./scripts/deploy_functions.sh manage-availability
```

- [ ] **Step 3: Test — set schedule (Mon, Tue, Thu 6am–2pm)**

```bash
curl -s -X PUT \
  "https://mezhtdbfyvkshpuplqqw.supabase.co/functions/v1/manage-availability?op=schedule" \
  -H "Authorization: Bearer <session_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "days": [
      {"day_of_week":1,"start_time":"06:00","end_time":"14:00"},
      {"day_of_week":2,"start_time":"06:00","end_time":"14:00"},
      {"day_of_week":4,"start_time":"07:00","end_time":"12:00"}
    ]
  }'
```

Expected: `{"ok":true,"days_saved":3}`

- [ ] **Step 4: Test — block a date**

```bash
curl -s -X POST \
  "https://mezhtdbfyvkshpuplqqw.supabase.co/functions/v1/manage-availability?op=override" \
  -H "Authorization: Bearer <session_token>" \
  -H "Content-Type: application/json" \
  -d '{"date":"2026-05-26","is_blocked":true,"note":"Bank holiday"}'
```

Expected: `{"ok":true}`

- [ ] **Step 5: Test — GET schedule back**

```bash
curl -s "https://mezhtdbfyvkshpuplqqw.supabase.co/functions/v1/manage-availability" \
  -H "Authorization: Bearer <session_token>"
```

Expected: `{"schedule":[{"day_of_week":1,...},...],"overrides":[{"date":"2026-05-26","is_blocked":true,...}]}`

- [ ] **Step 6: Commit**

```bash
git add supabase/functions/manage-availability/
git commit -m "feat: manage-availability edge function — weekly schedule + date overrides"
```

---

## Task 6: `get-trainer-slots` Edge Function

Public (no auth) endpoint. Returns available booking slots for a trainer over a date range, factoring in their weekly schedule, overrides, and existing bookings.

**Files:**
- Create: `supabase/functions/get-trainer-slots/index.ts`

- [ ] **Step 1: Create the function**

```typescript
// supabase/functions/get-trainer-slots/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CORS_HEADERS, jsonResponse, errorResponse } from "../_shared/errors.ts";
import { createLogger } from "../_shared/logger.ts";

const logger = createLogger("get-trainer-slots");

// Returns slots as { date: "YYYY-MM-DD", time: "HH:MM", available: boolean }[]
function generateSlots(
  startDate: string,
  endDate: string,
  schedule: { day_of_week: number; start_time: string; end_time: string }[],
  blockedDates: Set<string>,
  bookedSlots: Set<string>,  // "YYYY-MM-DDTHH:MM"
  durationMin: number
) {
  const scheduleMap = new Map(schedule.map((s) => [s.day_of_week, s]));
  const slots: { date: string; time: string; available: boolean }[] = [];

  const current = new Date(startDate + "T00:00:00Z");
  const end = new Date(endDate + "T23:59:59Z");

  while (current <= end) {
    const dateStr = current.toISOString().substring(0, 10);
    const dayOfWeek = current.getUTCDay();

    if (!blockedDates.has(dateStr)) {
      const day = scheduleMap.get(dayOfWeek);
      if (day) {
        const [startH] = day.start_time.split(":").map(Number);
        const [endH, endM] = day.end_time.split(":").map(Number);
        const endMinutes = endH * 60 + endM;

        for (let h = startH; h * 60 + durationMin <= endMinutes; h++) {
          const timeStr = `${String(h).padStart(2, "0")}:00`;
          const slotKey = `${dateStr}T${timeStr}`;
          slots.push({ date: dateStr, time: timeStr, available: !bookedSlots.has(slotKey) });
        }
      }
    }

    current.setUTCDate(current.getUTCDate() + 1);
  }

  return slots;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });

  const start = Date.now();
  const url = new URL(req.url);

  const trainerId = url.searchParams.get("trainer_id");
  const startDate = url.searchParams.get("start");  // YYYY-MM-DD
  const endDate   = url.searchParams.get("end");    // YYYY-MM-DD
  const durationMin = parseInt(url.searchParams.get("duration") ?? "60");

  if (!trainerId || !startDate || !endDate) {
    return errorResponse("trainer_id, start, and end are required", 400);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    return errorResponse("start and end must be YYYY-MM-DD", 400);
  }
  // Cap range at 60 days to prevent abuse
  const rangeDays = (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000;
  if (rangeDays > 60 || rangeDays < 0) return errorResponse("Date range must be 1–60 days", 400);

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const [
    { data: schedule },
    { data: overrides },
    { data: bookings },
  ] = await Promise.all([
    sb.from("trainer_availability")
      .select("day_of_week, start_time, end_time")
      .eq("trainer_id", trainerId),
    sb.from("availability_overrides")
      .select("date, is_blocked")
      .eq("trainer_id", trainerId)
      .gte("date", startDate)
      .lte("date", endDate),
    sb.from("bookings")
      .select("scheduled_at, duration_min")
      .eq("trainer_id", trainerId)
      .in("status", ["confirmed", "pending"])
      .gte("scheduled_at", startDate + "T00:00:00Z")
      .lte("scheduled_at", endDate + "T23:59:59Z"),
  ]);

  const blockedDates = new Set(
    (overrides ?? []).filter((o) => o.is_blocked).map((o) => o.date as string)
  );
  const bookedSlots = new Set(
    (bookings ?? []).map((b) => (b.scheduled_at as string).substring(0, 16))
  );

  const slots = generateSlots(
    startDate,
    endDate,
    schedule ?? [],
    blockedDates,
    bookedSlots,
    durationMin
  );

  logger.info("slots_generated", {
    trainer_id: trainerId,
    start: startDate,
    end: endDate,
    total: slots.length,
    available: slots.filter((s) => s.available).length,
    duration_ms: Date.now() - start,
  });

  return jsonResponse({ slots });
});
```

- [ ] **Step 2: Deploy**

```bash
SUPABASE_ACCESS_TOKEN=<token> ./scripts/deploy_functions.sh get-trainer-slots
```

- [ ] **Step 3: Test (public — no auth needed)**

```bash
curl -s "https://mezhtdbfyvkshpuplqqw.supabase.co/functions/v1/get-trainer-slots?trainer_id=<uuid>&start=2026-05-05&end=2026-05-11&duration=60"
```

Expected: array of slots for the trainer's schedule. Days with no schedule entries return no slots. The blocked date (2026-05-26) should produce no slots if you query around that date.

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/get-trainer-slots/
git commit -m "feat: get-trainer-slots edge function — returns available booking slots (public)"
```

---

## Task 7: `config.toml` — Register Upcoming Webhook and Cron Functions

Plan B will add `booking-webhook` and `send-booking-reminders` functions. Pre-register them in config now so their `verify_jwt = false` entries exist when they're deployed.

**Files:**
- Modify: `supabase/config.toml`

- [ ] **Step 1: Add entries to config.toml**

Read the existing `supabase/config.toml` and append to the `[functions.*]` section:

```toml
[functions.booking-webhook]
# Receives Stripe webhook POSTs for booking payment_intent events — no JWT, secured by Stripe-Signature header
verify_jwt = false

[functions.send-booking-reminders]
# Called by external cron trigger every hour — no JWT, secured by x-cron-secret header
verify_jwt = false

[functions.connect-stripe-return]
# Called from dashboard after Stripe Connect redirect — trainer auth via session token in body
verify_jwt = false
```

Note: `connect-stripe-return` gets `verify_jwt = false` because the trainer lands on the dashboard via a browser redirect from Stripe (no Authorization header in that request). Auth is handled by the session token passed in the POST body from the dashboard JS.

- [ ] **Step 2: Verify config is valid**

```bash
supabase functions list
```

Expected: shows all functions including the new ones (they'll show as "not deployed" until Plan B). No parse errors.

- [ ] **Step 3: Commit**

```bash
git add supabase/config.toml
git commit -m "config: register booking-webhook, send-booking-reminders, connect-stripe-return in config.toml"
```

---

## Task 8: Dashboard — Setup Gating Card

Add a "Finish setup to accept bookings" card to `dashboard.astro`. It reads the three setup conditions server-side and shows which steps are done/pending.

**Files:**
- Modify: `src/pages/dashboard.astro`

- [ ] **Step 1: Add SSR data fetch for booking setup status**

In the SSR frontmatter of `dashboard.astro`, after the existing `if (link?.trainer_id)` block where trainer data is fetched, add the booking setup check. The existing block fetches trainer data — extend it:

Find the existing `const [{ data: trainer }, { count: pkgCount }] = await Promise.all([...])` block and add a third parallel query:

```typescript
// Add inside the existing if (link?.trainer_id) { ... } block
// alongside the existing parallel queries:

const [
  { data: trainer },
  { count: pkgCount },
  { data: bookingSetup },  // ADD THIS
] = await Promise.all([
  svc.from('trainers')
    .select('avatar_url, bio, instagram_handle, reps_verified, verification_status, plan, slug, stripe_connect_onboarded')
    .eq('id', link.trainer_id)
    .single(),
  svc.from('session_packages').select('id', { count: 'exact', head: true }).eq('trainer_id', link.trainer_id),
  // ADD THIS — booking setup check:
  svc.rpc('check_booking_setup', { p_trainer_id: link.trainer_id })
    .single()
    .then(r => r)
    .catch(() => ({ data: null })),
]);
```

Actually, calling a stored procedure here adds complexity. Simpler: do three parallel selects.

Replace the parallel fetch with:

```typescript
const [
  { data: trainer },
  { count: pkgCount },
  { count: sessionTypeCount },
  { count: availabilityCount },
] = await Promise.all([
  svc.from('trainers')
    .select('avatar_url, bio, instagram_handle, reps_verified, verification_status, plan, slug, stripe_connect_onboarded, stripe_connect_account_id')
    .eq('id', link.trainer_id)
    .single(),
  svc.from('session_packages').select('id', { count: 'exact', head: true }).eq('trainer_id', link.trainer_id),
  svc.from('session_types').select('id', { count: 'exact', head: true }).eq('trainer_id', link.trainer_id).eq('is_active', true),
  svc.from('trainer_availability').select('id', { count: 'exact', head: true }).eq('trainer_id', link.trainer_id),
]);
```

Then derive setup status:

```typescript
// After the parallel fetches, inside if (trainer) { ... }:
const bookingSetupSteps = {
  stripeConnected: trainer.stripe_connect_onboarded === true,
  hasSessionType: (sessionTypeCount ?? 0) >= 1,
  hasAvailability: (availabilityCount ?? 0) >= 1,
};
const bookingReady = bookingSetupSteps.stripeConnected && bookingSetupSteps.hasSessionType && bookingSetupSteps.hasAvailability;
```

Expose to template as `ssrBookingSetup` and `ssrBookingReady`:

```typescript
// Outside the if block, declare these at the top of the frontmatter:
let ssrBookingSetup = { stripeConnected: false, hasSessionType: false, hasAvailability: false };
let ssrBookingReady = false;

// Then inside if (trainer) { ... }:
ssrBookingSetup = bookingSetupSteps;
ssrBookingReady = bookingReady;
```

- [ ] **Step 2: Add the setup card HTML**

In the dashboard HTML, add this card. Find the location where the dashboard content sections begin (after the header). Insert it at the top of the `.dash-wrap` content area, before the existing lead/analytics sections, but only show when `!ssrBookingReady && ssrPlan === 'pro'` (or show for all plans to encourage upgrade):

```html
<!-- Booking Setup Card — shown when setup incomplete (plan === pro and not all steps done) -->
{!ssrBookingReady && (
<div class="setup-card" id="setup-card">
  <div class="setup-card-header">
    <div class="setup-card-title">Accept bookings in 3 steps</div>
    <div class="setup-card-sub">Complete setup to show the "Book a Session" button on your profile</div>
  </div>
  <div class="setup-steps">
    <a href="/dashboard?stripe=start" class={`setup-step ${ssrBookingSetup.stripeConnected ? 'done' : 'pending'}`} id="stripe-step">
      <div class="step-check">{ssrBookingSetup.stripeConnected ? '✓' : '1'}</div>
      <div class="step-body">
        <div class="step-name">Connect your bank</div>
        <div class="step-desc">{ssrBookingSetup.stripeConnected ? 'Stripe connected' : 'Get paid automatically via Stripe'}</div>
      </div>
      {!ssrBookingSetup.stripeConnected && <div class="step-arrow">→</div>}
    </a>
    <a href="/edit?tab=sessions" class={`setup-step ${ssrBookingSetup.hasSessionType ? 'done' : ssrBookingSetup.stripeConnected ? 'pending' : 'locked'}`}>
      <div class="step-check">{ssrBookingSetup.hasSessionType ? '✓' : '2'}</div>
      <div class="step-body">
        <div class="step-name">Add a session type</div>
        <div class="step-desc">{ssrBookingSetup.hasSessionType ? 'Session types ready' : 'Set your price and session length'}</div>
      </div>
      {!ssrBookingSetup.hasSessionType && ssrBookingSetup.stripeConnected && <div class="step-arrow">→</div>}
    </a>
    <a href="/edit?tab=availability" class={`setup-step ${ssrBookingSetup.hasAvailability ? 'done' : ssrBookingSetup.hasSessionType ? 'pending' : 'locked'}`}>
      <div class="step-check">{ssrBookingSetup.hasAvailability ? '✓' : '3'}</div>
      <div class="step-body">
        <div class="step-name">Set your availability</div>
        <div class="step-desc">{ssrBookingSetup.hasAvailability ? 'Schedule live' : 'Choose your working days and hours'}</div>
      </div>
      {!ssrBookingSetup.hasAvailability && ssrBookingSetup.hasSessionType && <div class="step-arrow">→</div>}
    </a>
  </div>
</div>
)}
```

- [ ] **Step 3: Add setup card styles**

Add to the `<style>` block in dashboard.astro:

```css
/* ── Booking Setup Card ── */
.setup-card {
  background: #111;
  border: 1px solid rgba(255,92,0,0.2);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
}
.setup-card-header { margin-bottom: 16px; }
.setup-card-title {
  font-family: 'Manrope', sans-serif;
  font-size: 15px; font-weight: 800; color: #fff; margin-bottom: 4px;
}
.setup-card-sub { font-size: 12px; color: rgba(255,255,255,0.45); line-height: 1.5; }
.setup-steps { display: flex; flex-direction: column; gap: 8px; }
.setup-step {
  display: flex; align-items: center; gap: 12px;
  background: #1a1a1a; border-radius: 10px; padding: 12px;
  text-decoration: none; transition: background 0.15s;
  border: 1px solid transparent;
}
.setup-step.pending { border-color: rgba(255,92,0,0.25); cursor: pointer; }
.setup-step.pending:hover { background: #1e1e1e; border-color: rgba(255,92,0,0.5); }
.setup-step.done { opacity: 0.6; cursor: default; }
.setup-step.locked { opacity: 0.35; cursor: not-allowed; pointer-events: none; }
.step-check {
  width: 28px; height: 28px; border-radius: 50%;
  background: #FF5C00; color: #fff;
  font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.setup-step.done .step-check { background: #4CAF50; }
.setup-step.locked .step-check { background: #333; }
.step-body { flex: 1; }
.step-name { font-size: 13px; font-weight: 600; color: #fff; }
.step-desc { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 2px; }
.step-arrow { font-size: 14px; color: #FF5C00; flex-shrink: 0; }
```

- [ ] **Step 4: Add Stripe Connect initiation JS**

In dashboard.astro's `<script>` block, handle the `?stripe=start` and `?stripe=return` URL params:

```javascript
// Handle Stripe Connect flow
const params = new URLSearchParams(window.location.search);

if (params.get('stripe') === 'start') {
  const token = getCookie('tb_session');
  if (token) {
    fetch('/api/connect-stripe', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    .then(r => r.json())
    .then(data => {
      if (data.url) window.location.href = data.url;
    })
    .catch(() => showToast('Failed to start Stripe setup. Try again.'));
  }
}

if (params.get('stripe') === 'return') {
  const token = getCookie('tb_session');
  if (token) {
    fetch('/api/connect-stripe-return', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    .then(r => r.json())
    .then(data => {
      if (data.onboarded) {
        // Reload to refresh setup card state
        window.history.replaceState({}, '', '/dashboard');
        window.location.reload();
      } else {
        showToast('Stripe setup incomplete — please finish the onboarding form.');
      }
    });
  }
}

// getCookie helper (may already exist in dashboard.astro — check before adding)
function getCookie(name) {
  return document.cookie.split('; ').find(r => r.startsWith(name + '='))?.split('=')[1];
}
```

Note: The fetch calls use `/api/` prefix. Supabase edge functions are called directly at their full URL. Replace `/api/connect-stripe` with the actual function URL: `https://mezhtdbfyvkshpuplqqw.supabase.co/functions/v1/connect-stripe`. Check `dashboard.astro` for the existing pattern — it likely stores the Supabase URL in a constant.

- [ ] **Step 5: Verify in browser**

Visit `/dashboard` as a trainer. Expected: setup card appears at top showing three steps with correct done/pending state. Clicking "Connect your bank" redirects to Stripe. After completing Stripe flow and returning, card refreshes to show step 1 done.

- [ ] **Step 6: Commit**

```bash
git add src/pages/dashboard.astro
git commit -m "feat: dashboard — booking setup gating card with 3-step progress"
```

---

## Task 9: `edit.astro` — Sessions Tab

Add a "Sessions" tab to the edit page where trainers can add and toggle session types.

**Files:**
- Modify: `src/pages/edit.astro`

- [ ] **Step 1: Find the tab navigation in edit.astro and add the Sessions tab**

Find where the existing section navigation/tabs are defined (look for tab buttons or a section list). Add two new tabs: Sessions and Availability. The edit page currently has sections for Profile, Packages, etc. Add:

```html
<!-- In the tab nav (find existing tab markup and follow its pattern) -->
<button class="tab-btn" data-tab="sessions" onclick="switchTab('sessions')">Sessions</button>
<button class="tab-btn" data-tab="availability" onclick="switchTab('availability')">Availability</button>
```

- [ ] **Step 2: Add the Sessions tab content panel**

```html
<!-- Sessions tab panel — add after existing section panels -->
<div id="tab-sessions" class="tab-panel" style="display:none;">
  <div class="edit-section">
    <div class="section-heading">Session Types</div>
    <div class="section-sub">Define what you offer and at what price. Active types appear on your booking page.</div>

    <div id="session-types-list" style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">
      <!-- Populated by JS -->
    </div>

    <div class="section-heading" style="margin-top:24px;margin-bottom:12px;">Add Session Type</div>
    <div class="field">
      <label>Name</label>
      <input type="text" id="st-name" placeholder="e.g. 60-min PT Session" maxlength="80">
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      <div class="field">
        <label>Duration (minutes)</label>
        <input type="number" id="st-duration" value="60" min="15" max="480" step="15">
      </div>
      <div class="field">
        <label>Price (USD)</label>
        <input type="number" id="st-price" placeholder="80" min="1" step="1">
      </div>
    </div>
    <div class="field">
      <label>Type</label>
      <select id="st-type" onchange="togglePackageCount()">
        <option value="single">Single session</option>
        <option value="package">Package (multi-session)</option>
      </select>
    </div>
    <div class="field" id="st-package-count-wrap" style="display:none;">
      <label>Number of sessions in package</label>
      <input type="number" id="st-package-count" value="10" min="2" max="100">
    </div>
    <button class="header-btn header-btn-brand" onclick="addSessionType()" style="width:100%;padding:14px;border-radius:12px;font-size:14px;">
      Add Session Type
    </button>
  </div>
</div>
```

- [ ] **Step 3: Add Sessions tab JavaScript**

```javascript
// In the <script> block of edit.astro

const SUPABASE_FUNCTIONS_URL = 'https://mezhtdbfyvkshpuplqqw.supabase.co/functions/v1';

async function loadSessionTypes() {
  const token = getCookie('tb_session');
  if (!token) return;
  const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/manage-session-types`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) return;
  const { session_types } = await res.json();
  renderSessionTypes(session_types);
}

function renderSessionTypes(types) {
  const list = document.getElementById('session-types-list');
  if (!list) return;
  if (!types || types.length === 0) {
    list.innerHTML = '<div style="text-align:center;padding:20px;font-size:13px;color:rgba(255,255,255,0.3);">No session types yet. Add one below.</div>';
    return;
  }
  list.innerHTML = types.map(st => `
    <div style="background:#1a1a1a;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:12px;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-size:13px;font-weight:600;color:#fff;">${st.name}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:2px;">
          ${st.type === 'package' ? `Package · ${st.package_count} × ` : 'Single · '}${st.duration_min} min · $${(st.price_cents/100).toFixed(0)}
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:4px;
          ${st.is_active ? 'color:#4CAF50;background:rgba(76,175,80,0.1)' : 'color:rgba(255,255,255,0.3);background:#222'}">
          ${st.is_active ? 'LIVE' : 'OFF'}
        </span>
        <button onclick="toggleSessionType('${st.id}', ${!st.is_active})"
          style="background:#222;border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:5px 10px;font-size:11px;color:rgba(255,255,255,0.6);cursor:pointer;">
          ${st.is_active ? 'Pause' : 'Activate'}
        </button>
      </div>
    </div>
  `).join('');
}

async function addSessionType() {
  const token = getCookie('tb_session');
  if (!token) return;

  const name = document.getElementById('st-name').value.trim();
  const duration_min = parseInt(document.getElementById('st-duration').value);
  const price = parseFloat(document.getElementById('st-price').value);
  const type = document.getElementById('st-type').value;
  const package_count = type === 'package' ? parseInt(document.getElementById('st-package-count').value) : undefined;

  if (!name) { showToast('Name is required'); return; }
  if (!price || price < 1) { showToast('Price must be at least $1'); return; }

  const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/manage-session-types`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, duration_min, price_cents: Math.round(price * 100), type, package_count }),
  });

  if (res.ok) {
    showToast('Session type added');
    document.getElementById('st-name').value = '';
    document.getElementById('st-price').value = '';
    loadSessionTypes();
  } else {
    const err = await res.json();
    showToast(err.error || 'Failed to add session type');
  }
}

async function toggleSessionType(id, is_active) {
  const token = getCookie('tb_session');
  if (!token) return;
  await fetch(`${SUPABASE_FUNCTIONS_URL}/manage-session-types`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, is_active }),
  });
  loadSessionTypes();
}

function togglePackageCount() {
  const type = document.getElementById('st-type').value;
  document.getElementById('st-package-count-wrap').style.display = type === 'package' ? 'block' : 'none';
}

// Load session types when tab activates
// Add to the switchTab function (or tab click handler — check existing pattern)
// When tab === 'sessions': loadSessionTypes();
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/edit.astro
git commit -m "feat: edit.astro — sessions tab for managing session types"
```

---

## Task 10: `edit.astro` — Availability Tab

Add a weekly schedule editor and blocked-dates manager.

**Files:**
- Modify: `src/pages/edit.astro`

- [ ] **Step 1: Add availability tab HTML panel**

```html
<div id="tab-availability" class="tab-panel" style="display:none;">
  <div class="edit-section">
    <div class="section-heading">Weekly Schedule</div>
    <div class="section-sub">Set which days and hours you're available each week.</div>

    <div id="availability-days" style="display:flex;flex-direction:column;gap:8px;margin:16px 0;">
      <!-- Rendered by JS — one row per day -->
    </div>

    <button class="header-btn header-btn-brand" onclick="saveSchedule()" style="width:100%;padding:14px;border-radius:12px;font-size:14px;">
      Save Schedule
    </button>
  </div>

  <div class="edit-section">
    <div class="section-heading">Blocked Dates</div>
    <div class="section-sub">Block specific dates (holidays, sick days). Consumers won't see slots on these days.</div>

    <div id="blocked-dates-list" style="display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 16px;">
      <!-- Populated by JS -->
    </div>

    <div style="display:grid;grid-template-columns:1fr auto;gap:8px;">
      <input type="date" id="block-date-input"
        style="background:#1a1a1a;border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;color:#fff;font-family:inherit;font-size:13px;">
      <button onclick="blockDate()" class="header-btn header-btn-brand" style="padding:10px 16px;border-radius:10px;">
        Block
      </button>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Add availability JavaScript**

```javascript
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// State
let scheduleState = {}; // { dayOfWeek: { enabled, start, end } }
let overridesState = [];

async function loadAvailability() {
  const token = getCookie('tb_session');
  if (!token) return;
  const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/manage-availability`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) return;
  const { schedule, overrides } = await res.json();

  // Build state
  scheduleState = {};
  for (let d = 0; d < 7; d++) {
    const found = schedule.find(s => s.day_of_week === d);
    scheduleState[d] = found
      ? { enabled: true, start: found.start_time.substring(0, 5), end: found.end_time.substring(0, 5) }
      : { enabled: false, start: '06:00', end: '14:00' };
  }
  overridesState = overrides;

  renderSchedule();
  renderOverrides();
}

function renderSchedule() {
  const container = document.getElementById('availability-days');
  if (!container) return;
  container.innerHTML = DAYS.map((day, i) => {
    const s = scheduleState[i];
    return `
      <div style="display:flex;align-items:center;gap:10px;">
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;width:52px;flex-shrink:0;">
          <input type="checkbox" ${s.enabled ? 'checked' : ''} onchange="toggleDay(${i})"
            style="accent-color:#FF5C00;width:16px;height:16px;">
          <span style="font-size:12px;color:${s.enabled ? '#fff' : 'rgba(255,255,255,0.35)'}">${day}</span>
        </label>
        <div style="flex:1;display:flex;gap:6px;${s.enabled ? '' : 'opacity:0.3;pointer-events:none;'}">
          <input type="time" value="${s.start}" onchange="scheduleState[${i}].start=this.value"
            style="flex:1;background:#1a1a1a;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:7px 8px;color:#fff;font-family:inherit;font-size:12px;">
          <span style="color:rgba(255,255,255,0.3);align-self:center;font-size:11px;">to</span>
          <input type="time" value="${s.end}" onchange="scheduleState[${i}].end=this.value"
            style="flex:1;background:#1a1a1a;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:7px 8px;color:#fff;font-family:inherit;font-size:12px;">
        </div>
      </div>
    `;
  }).join('');
}

function toggleDay(dayIndex) {
  scheduleState[dayIndex].enabled = !scheduleState[dayIndex].enabled;
  renderSchedule();
}

async function saveSchedule() {
  const token = getCookie('tb_session');
  if (!token) return;

  const days = Object.entries(scheduleState)
    .filter(([, s]) => s.enabled)
    .map(([d, s]) => ({ day_of_week: parseInt(d), start_time: s.start, end_time: s.end }));

  const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/manage-availability?op=schedule`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ days }),
  });

  if (res.ok) {
    showToast('Schedule saved');
  } else {
    showToast('Failed to save schedule');
  }
}

function renderOverrides() {
  const list = document.getElementById('blocked-dates-list');
  if (!list) return;
  if (!overridesState.length) {
    list.innerHTML = '<span style="font-size:12px;color:rgba(255,255,255,0.3);">No dates blocked</span>';
    return;
  }
  list.innerHTML = overridesState.map(o => `
    <div style="background:#1a1a1a;border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:5px 10px;font-size:12px;color:rgba(255,255,255,0.6);display:flex;align-items:center;gap:6px;">
      ${o.date}
      <button onclick="unblockDate('${o.date}')"
        style="background:none;border:none;color:rgba(255,255,255,0.4);cursor:pointer;font-size:14px;padding:0;line-height:1;">✕</button>
    </div>
  `).join('');
}

async function blockDate() {
  const token = getCookie('tb_session');
  const date = document.getElementById('block-date-input').value;
  if (!token || !date) return;

  const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/manage-availability?op=override`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, is_blocked: true }),
  });

  if (res.ok) {
    document.getElementById('block-date-input').value = '';
    loadAvailability();
  } else {
    showToast('Failed to block date');
  }
}

async function unblockDate(date) {
  const token = getCookie('tb_session');
  if (!token) return;

  await fetch(`${SUPABASE_FUNCTIONS_URL}/manage-availability?op=override`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ date }),
  });
  loadAvailability();
}

// Load availability when tab activates:
// In switchTab function — when tab === 'availability': loadAvailability();
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/edit.astro
git commit -m "feat: edit.astro — availability tab with weekly schedule and date blocking"
```

---

## Task 11: Slug Profile — Add "Book a Session" Button (Gated)

Add the "Book a Session" button to the trainer's public profile page. The button only renders when all three setup conditions are met — checked server-side at page load.

**Files:**
- Modify: `src/pages/[slug].astro`

- [ ] **Step 1: Add SSR booking readiness check**

In the SSR frontmatter of `[slug].astro`, extend the trainer fetch to include booking setup columns:

Find:
```typescript
const res = await fetch(
  `${SUPABASE_URL}/rest/v1/trainers?slug=eq.${encodeURIComponent(slug)}&select=name,specialties,avatar_url,avg_rating,review_count,certifications&limit=1`,
```

Change the `select` to also include booking setup fields:
```typescript
const res = await fetch(
  `${SUPABASE_URL}/rest/v1/trainers?slug=eq.${encodeURIComponent(slug)}&select=id,name,specialties,avatar_url,avg_rating,review_count,certifications,stripe_connect_onboarded&limit=1`,
```

Then add two more checks in the success path:

```typescript
// After extracting trainer fields:
const trainerId = data[0].id || '';
const stripeOnboarded = data[0].stripe_connect_onboarded === true;

// Check session types and availability counts
let bookingReady = false;
if (stripeOnboarded && trainerId) {
  const [stRes, avRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/session_types?trainer_id=eq.${trainerId}&is_active=eq.true&select=id&limit=1`, {
      headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` },
    }),
    fetch(`${SUPABASE_URL}/rest/v1/trainer_availability?trainer_id=eq.${trainerId}&select=id&limit=1`, {
      headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` },
    }),
  ]);
  const [stData, avData] = await Promise.all([stRes.json(), avRes.json()]);
  bookingReady = Array.isArray(stData) && stData.length > 0 && Array.isArray(avData) && avData.length > 0;
}
```

- [ ] **Step 2: Render the button**

In the HTML section of `[slug].astro`, find where the CTA buttons are rendered (look for "Book" or contact buttons). Add:

```html
{bookingReady && (
  <a href={`/book/${slug}`} class="book-btn">Book a Session</a>
)}
```

Add to the page styles:
```css
.book-btn {
  display: block;
  background: #FF5C00;
  color: #fff;
  text-align: center;
  text-decoration: none;
  padding: 15px 24px;
  border-radius: 12px;
  font-family: 'Manrope', sans-serif;
  font-size: 15px;
  font-weight: 700;
  margin-top: 16px;
  transition: background 0.2s;
}
.book-btn:hover { background: #e05200; }
```

- [ ] **Step 3: Verify**

Load a trainer profile for a trainer with `stripe_connect_onboarded = false` — no button shown. Set `stripe_connect_onboarded = true` + add a session type + add availability row for that trainer in the DB — button appears.

```bash
# Quick test: set onboarded true in DB for a test trainer
supabase db query "UPDATE trainers SET stripe_connect_onboarded = true WHERE slug = 'test-trainer';"
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/[slug].astro
git commit -m "feat: [slug].astro — show Book a Session button when trainer setup is complete"
```

---

## Plan A Complete

After all tasks: trainers can connect Stripe, define session types, set their weekly availability, and the Book a Session button becomes visible on their public profile. No consumer can actually book yet (Plan B).

**Verify end-to-end:**
1. Log into dashboard as a Pro trainer
2. See the 3-step setup card
3. Click "Connect your bank" → Stripe Connect Express flow → return to dashboard → step 1 goes green
4. Go to Edit → Sessions tab → add a 60-min session at $80
5. Go to Edit → Availability tab → enable Mon/Tue/Thu 6am–2pm → save
6. Visit `/[slug]` → see "Book a Session" button
7. Curl `get-trainer-slots` with the trainer's ID → see time slots

**Next:** Plan B — `/book/[slug]` booking page, Stripe PaymentIntent, booking webhook, dashboard bookings tab, confirmation emails.
