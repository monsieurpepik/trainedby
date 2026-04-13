# TrainedBy: YC-Readiness Code Evaluation

## The YC Lens

Y Combinator partners do not care if you use a monolithic architecture or microservices. They care about **engineering judgment** — the ability to move fast without building fatal technical debt. They look for code that is secure, readable, and scalable enough to survive the next 12 months of hyper-growth.

For a 2-3 domain architecture, multitenancy is overkill. The focus must be on security fundamentals, data integrity, and removing friction for the next engineer you hire.

Here is the honest evaluation of the TrainedBy codebase against YC standards, and the exact steps to fix it.

---

## 1. Security Fundamentals (High Priority)

YC expects you to not leak user data or get hacked on day one. The current codebase has three red flags that a technical partner would spot immediately.

### The Issues
- **Missing RLS on V2 Tables:** The `002_features.sql` migration creates 6 new tables (`transformations`, `bookings`, `reviews`, `checkins`, `broadcasts`, `availability`) but **fails to enable Row Level Security (RLS)** on any of them. By default, Supabase allows anyone with the `anon` key to read, write, and delete from these tables.
- **XSS Vulnerability in Auth:** The `tb_edit_token` is stored in `localStorage`. If a malicious script is injected via a trainer's bio or a third-party dependency, the attacker can steal the token and hijack the trainer's account.
- **Infinite Loop Risk:** In `register-trainer/index.ts`, the slug generation uses a `while (true)` loop. If the database locks or a race condition occurs, this edge function will hang indefinitely, consuming compute resources and potentially causing a denial of service.

### The Fixes
1. **Enforce RLS Everywhere:** Add `ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;` to all tables in `002_features.sql`. Create strict policies: public can read `reviews` and `transformations`, but only authenticated edge functions (using the service role key) can write to them.
2. **Move to HttpOnly Cookies:** Update the `verify-magic-link` edge function to return the auth token as a `Set-Cookie: tb_edit_token=...; HttpOnly; Secure; SameSite=Strict` header, rather than a JSON payload. Update the frontend to rely on the cookie for authenticated requests.
3. **Bound the Slug Loop:** Change the `while (true)` loop in `register-trainer` to a bounded loop (e.g., `for (let attempt = 0; attempt < 10; attempt++)`). If it fails 10 times, append a random UUID string to guarantee uniqueness and exit.

---

## 2. Code Architecture & Maintainability (Medium Priority)

YC expects you to be able to iterate quickly. The current frontend architecture (9 monolithic HTML files) is a liability for speed.

### The Issues
- **The Copy-Paste Problem:** The navigation bar, footer, and Supabase initialization logic are duplicated across all 9 HTML files. If you need to add a "Pricing" link to the nav, you have to edit 9 files. This guarantees bugs.
- **Global Namespace Pollution:** Variables like `TRAINER` and `IS_DESKTOP` are declared globally in `index.html`. As the application grows, these will inevitably collide with other scripts.
- **No Input Sanitization:** The edge functions (e.g., `submit-lead`) insert user input directly into the database without sanitization. While Supabase/Postgres prevents SQL injection, it does not prevent a user from submitting `<script>alert(1)</script>` as their name, which will execute when rendered on the dashboard.

### The Fixes
1. **Implement a Static Site Generator (SSG):** You do not need React or Next.js. Use a lightweight SSG like **Eleventy (11ty)** or **Astro**. This allows you to create a `_includes/nav.html` component and inject it into every page during the build step. It keeps the output as pure, fast HTML while solving the duplication problem.
2. **Module Scope:** Wrap all frontend JavaScript in Immediately Invoked Function Expressions (IIFEs) or use ES Modules (`<script type="module">`) to keep variables out of the global scope.
3. **Sanitize Inputs:** Add a lightweight sanitization library (like DOMPurify on the frontend, or a simple regex stripper in the edge functions) to clean all text inputs before they hit the database.

---

## 3. Data Integrity & Edge Cases (Medium Priority)

YC expects your product to handle edge cases gracefully, especially when money or reputation is involved.

### The Issues
- **Orphaned Data:** The `001_schema.sql` file lacks `ON DELETE CASCADE` for several foreign keys (e.g., `session_packages.trainer_id`). If a trainer deletes their account, their packages remain in the database, creating orphaned records.
- **Missing Rate Limiting:** The `send-magic-link` and `submit-lead` edge functions have no rate limiting. A malicious actor could spam the `submit-lead` endpoint, exhausting your Supabase database quota and triggering thousands of WhatsApp notifications.

### The Fixes
1. **Enforce Cascading Deletes:** Audit `001_schema.sql` and ensure all foreign keys referencing `trainers(id)` include `ON DELETE CASCADE`.
2. **Implement Rate Limiting:** Add a simple in-memory rate limiter or use Supabase's Redis integration (if available) to limit `submit-lead` to 5 requests per IP per minute, and `send-magic-link` to 3 requests per email per 15 minutes.

---

## Summary

The codebase is a solid V1 prototype, but it is not yet YC-ready. The lack of RLS on the V2 tables is a critical security flaw that must be fixed before onboarding real users. 

**The 48-Hour Action Plan:**
1. Write the missing RLS policies for `002_features.sql`.
2. Bound the `while (true)` loop in the registration function.
3. Add basic rate limiting to the lead submission and auth endpoints.
4. (Optional but recommended) Migrate the 9 HTML files to Astro or Eleventy to solve the component duplication issue.
