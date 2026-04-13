/**
 * TrainedBy Edge Function Test Suite
 * 
 * Tests all Supabase edge functions for:
 * - Happy path responses
 * - Input validation and sanitization
 * - Rate limiting behaviour
 * - Error handling
 * - Security boundaries (RLS, auth)
 * 
 * Run with: deno test --allow-net --allow-env tests/edge-functions.test.ts
 * Or via CI: pnpm test
 */

// ─── Config ──────────────────────────────────────────────────────────────────

const BASE_URL = Deno.env.get("SUPABASE_FUNCTIONS_URL") ||
  "https://YOUR_PROJECT_REF.supabase.co/functions/v1";

const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_KEY") || "";

const headers = (extra: Record<string, string> = {}) => ({
  "Content-Type": "application/json",
  "apikey": ANON_KEY,
  "Authorization": `Bearer ${ANON_KEY}`,
  ...extra,
});

async function post(fn: string, body: unknown, extraHeaders: Record<string, string> = {}) {
  const res = await fetch(`${BASE_URL}/${fn}`, {
    method: "POST",
    headers: headers(extraHeaders),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function get(fn: string, params: Record<string, string> = {}) {
  const url = new URL(`${BASE_URL}/${fn}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { headers: headers() });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

// ─── Test Helpers ─────────────────────────────────────────────────────────────

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

function assertStatus(actual: number, expected: number, context: string) {
  assert(actual === expected, `${context} — expected status ${expected}, got ${actual}`);
}

function assertHasField(obj: Record<string, unknown>, field: string, context: string) {
  assert(field in obj, `${context} — expected field "${field}" in response`);
}

// ─── register-trainer Tests ───────────────────────────────────────────────────

Deno.test("register-trainer: rejects missing required fields", async () => {
  const { status, data } = await post("register-trainer", {});
  assertStatus(status, 400, "register-trainer missing fields");
  assertHasField(data, "error", "register-trainer missing fields");
});

Deno.test("register-trainer: rejects invalid email format", async () => {
  const { status, data } = await post("register-trainer", {
    name: "Test Trainer",
    email: "not-an-email",
    whatsapp: "+971501234567",
    reps_number: "PT12345",
    specialties: ["Strength"],
    title: "Personal Trainer",
  });
  assertStatus(status, 400, "register-trainer invalid email");
  assert(data.error?.includes("email") || data.error?.includes("invalid"), 
    "register-trainer invalid email — error should mention email");
});

Deno.test("register-trainer: strips HTML from name field", async () => {
  const { status, data } = await post("register-trainer", {
    name: "<script>alert('xss')</script>Test Trainer",
    email: `test_${Date.now()}@example.com`,
    whatsapp: "+971501234567",
    reps_number: "PT12345",
    specialties: ["Strength"],
    title: "Personal Trainer",
  });
  // Either succeeds with sanitized name or rejects — both are acceptable
  if (status === 200 || status === 201) {
    assert(!JSON.stringify(data).includes("<script>"), 
      "register-trainer XSS — script tag should be stripped from response");
  }
});

Deno.test("register-trainer: rejects empty name", async () => {
  const { status } = await post("register-trainer", {
    name: "",
    email: `test_${Date.now()}@example.com`,
    whatsapp: "+971501234567",
    reps_number: "PT12345",
    specialties: ["Strength"],
    title: "Personal Trainer",
  });
  assertStatus(status, 400, "register-trainer empty name");
});

// ─── get-trainer Tests ────────────────────────────────────────────────────────

Deno.test("get-trainer: returns 404 for non-existent slug", async () => {
  const { status } = await get("get-trainer", { slug: "this-trainer-does-not-exist-xyz123" });
  assertStatus(status, 404, "get-trainer non-existent slug");
});

Deno.test("get-trainer: returns 400 for missing slug param", async () => {
  const { status } = await get("get-trainer", {});
  assertStatus(status, 400, "get-trainer missing slug");
});

Deno.test("get-trainer: returns trainer data for valid slug", async () => {
  const { status, data } = await get("get-trainer", { slug: "sarah" });
  // sarah is the demo trainer — if she exists, check the shape
  if (status === 200) {
    assertHasField(data, "name", "get-trainer valid slug — name");
    assertHasField(data, "slug", "get-trainer valid slug — slug");
    assertHasField(data, "specialties", "get-trainer valid slug — specialties");
    // Ensure no sensitive fields are leaked
    assert(!("magic_link_token" in data), "get-trainer — must not leak magic_link_token");
    assert(!("service_role" in data), "get-trainer — must not leak service_role");
  }
});

Deno.test("get-trainer: does not return private fields", async () => {
  const { status, data } = await get("get-trainer", { slug: "sarah" });
  if (status === 200) {
    const sensitiveFields = ["magic_link_token", "raw_token", "service_key", "password"];
    sensitiveFields.forEach(field => {
      assert(!(field in data), `get-trainer — must not expose ${field}`);
    });
  }
});

// ─── submit-lead Tests ────────────────────────────────────────────────────────

Deno.test("submit-lead: rejects missing trainer_id", async () => {
  const { status, data } = await post("submit-lead", {
    name: "Test Client",
    whatsapp: "+971501234567",
    goal: "Weight loss",
  });
  assertStatus(status, 400, "submit-lead missing trainer_id");
  assertHasField(data, "error", "submit-lead missing trainer_id");
});

Deno.test("submit-lead: rejects invalid UUID for trainer_id", async () => {
  const { status, data } = await post("submit-lead", {
    trainer_id: "not-a-uuid",
    name: "Test Client",
    whatsapp: "+971501234567",
    goal: "Weight loss",
  });
  assertStatus(status, 400, "submit-lead invalid UUID");
  assert(data.error?.toLowerCase().includes("uuid") || data.error?.toLowerCase().includes("invalid"),
    "submit-lead invalid UUID — error should mention UUID or invalid");
});

Deno.test("submit-lead: rejects missing name", async () => {
  const { status } = await post("submit-lead", {
    trainer_id: "00000000-0000-0000-0000-000000000000",
    whatsapp: "+971501234567",
    goal: "Weight loss",
  });
  assertStatus(status, 400, "submit-lead missing name");
});

Deno.test("submit-lead: strips XSS from name field", async () => {
  const { status, data } = await post("submit-lead", {
    trainer_id: "00000000-0000-0000-0000-000000000000",
    name: "<img src=x onerror=alert(1)>Ahmed",
    whatsapp: "+971501234567",
    goal: "Weight loss",
  });
  // Should either succeed with sanitized name or fail with 404 (trainer not found)
  assert(status !== 500, "submit-lead XSS — should not 500 on XSS input");
  if (status === 200 || status === 201) {
    assert(!JSON.stringify(data).includes("onerror="), 
      "submit-lead XSS — onerror should be stripped");
  }
});

// ─── send-magic-link Tests ────────────────────────────────────────────────────

Deno.test("send-magic-link: rejects missing email", async () => {
  const { status, data } = await post("send-magic-link", {});
  assertStatus(status, 400, "send-magic-link missing email");
  assertHasField(data, "error", "send-magic-link missing email");
});

Deno.test("send-magic-link: rejects invalid email format", async () => {
  const { status } = await post("send-magic-link", { email: "not-valid" });
  assertStatus(status, 400, "send-magic-link invalid email");
});

Deno.test("send-magic-link: rejects disallowed redirect URL", async () => {
  const { status, data } = await post("send-magic-link", {
    email: "test@example.com",
    redirect_to: "https://evil.com/steal-token",
  });
  assertStatus(status, 400, "send-magic-link disallowed redirect");
  assert(data.error?.toLowerCase().includes("redirect") || data.error?.toLowerCase().includes("url"),
    "send-magic-link disallowed redirect — error should mention redirect or URL");
});

Deno.test("send-magic-link: accepts valid email (may fail in sandbox without Resend key)", async () => {
  const { status } = await post("send-magic-link", {
    email: "test@example.com",
    redirect_to: "https://trainedby-ae.netlify.app/dashboard",
  });
  // 200 = sent, 500 = Resend not configured (acceptable in sandbox), 429 = rate limited
  assert([200, 500, 429].includes(status), 
    `send-magic-link valid email — unexpected status ${status}`);
});

// ─── verify-magic-link Tests ──────────────────────────────────────────────────

Deno.test("verify-magic-link: rejects missing token", async () => {
  const { status, data } = await post("verify-magic-link", {});
  assertStatus(status, 400, "verify-magic-link missing token");
  assertHasField(data, "error", "verify-magic-link missing token");
});

Deno.test("verify-magic-link: rejects expired/invalid token", async () => {
  const { status } = await post("verify-magic-link", {
    token: "totally-invalid-token-that-does-not-exist",
  });
  assert([400, 401, 404].includes(status), 
    `verify-magic-link invalid token — expected 400/401/404, got ${status}`);
});

Deno.test("verify-magic-link: does not leak sensitive data on failure", async () => {
  const { data } = await post("verify-magic-link", {
    token: "invalid-token",
  });
  const responseStr = JSON.stringify(data);
  assert(!responseStr.includes("service_role"), "verify-magic-link — must not leak service_role");
  assert(!responseStr.includes("postgres"), "verify-magic-link — must not leak DB connection info");
});

// ─── update-trainer Tests ─────────────────────────────────────────────────────

Deno.test("update-trainer: rejects request without Authorization header", async () => {
  const res = await fetch(`${BASE_URL}/update-trainer`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": ANON_KEY },
    body: JSON.stringify({ bio: "Updated bio" }),
  });
  assert([400, 401, 403].includes(res.status), 
    `update-trainer no auth — expected 400/401/403, got ${res.status}`);
});

Deno.test("update-trainer: rejects invalid Bearer token", async () => {
  const { status } = await post("update-trainer", 
    { bio: "Updated bio" },
    { "Authorization": "Bearer invalid-token-xyz" }
  );
  assert([400, 401, 403].includes(status), 
    `update-trainer invalid token — expected 400/401/403, got ${status}`);
});

// ─── CORS Tests ───────────────────────────────────────────────────────────────

Deno.test("CORS: all functions respond to OPTIONS preflight", async () => {
  const functions = ["register-trainer", "get-trainer", "submit-lead", "send-magic-link"];
  for (const fn of functions) {
    const res = await fetch(`${BASE_URL}/${fn}`, {
      method: "OPTIONS",
      headers: {
        "Origin": "https://trainedby-ae.netlify.app",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
      },
    });
    assert(res.status === 200 || res.status === 204, 
      `CORS preflight ${fn} — expected 200/204, got ${res.status}`);
  }
});

// ─── Rate Limiting Tests ──────────────────────────────────────────────────────

Deno.test("rate-limiting: submit-lead enforces per-IP limit", async () => {
  // Send 6 rapid requests (limit is 5/min)
  const results = await Promise.all(
    Array.from({ length: 6 }, () => post("submit-lead", {
      trainer_id: "00000000-0000-0000-0000-000000000000",
      name: "Rate Test",
      whatsapp: "+971501234567",
      goal: "Rate limit test",
    }))
  );
  const statuses = results.map(r => r.status);
  // At least one should be 429 (rate limited) or 400 (validation fails first)
  const hasRateLimit = statuses.some(s => s === 429);
  const allValidationFail = statuses.every(s => s === 400);
  assert(hasRateLimit || allValidationFail, 
    `Rate limiting submit-lead — expected 429 or all 400, got: ${statuses.join(', ')}`);
});

console.log("\n✅ TrainedBy Edge Function Test Suite loaded.");
console.log("Run: deno test --allow-net --allow-env tests/edge-functions.test.ts\n");
