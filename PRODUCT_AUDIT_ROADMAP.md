# TrainedBy Product Audit & Scaling Roadmap

**Date:** April 15, 2026
**Framework:** Get Shit Done (GSD) + Superpowers

This document provides a comprehensive audit of the TrainedBy platform across three dimensions: Engineering Quality, User Experience (UX), and Multi-Domain Scaling. It concludes with a prioritised GSD roadmap to elevate the product to a serious level of engineering and global scale.

---

## 1. Engineering Quality Audit

The current codebase is functional but exhibits "MVP debt" that will break under multi-country scale.

### Strengths
- **Edge Function Architecture:** The use of Deno edge functions with shared utilities (`_shared/errors.ts`, `_shared/logger.ts`) is a solid foundation.
- **JWT Security:** The recent GSD integration fixed the critical webhook JWT vulnerability.
- **Database Schema:** The `multi_domain` migration correctly implements a tenant-aware structure (`market_configs`, `funnel_events.market`).

### Critical Gaps
- **No Automated Testing:** The `tests/` directory exists but is largely empty. There is no CI/CD pipeline blocking deployments on test failure. This violates the GSD Nyquist validation principle.
- **Hardcoded URLs:** Edge functions (e.g., `lifecycle-email`) and frontend components (`dashboard.astro`, `join.astro`) contain hardcoded `trainedby.ae` strings. This breaks the multi-domain architecture.
- **Missing Idempotency:** Payment webhooks (`stripe-webhook`, `razorpay-webhook`) lack idempotency keys, risking double-processing if Stripe/Razorpay retries a webhook.
- **No Error Monitoring:** There is no Sentry, Datadog, or structured error alerting. The `_shared/logger.ts` logs to stdout, but nobody is paged when a function fails.
- **Rate Limiting:** Only 4 out of 34 edge functions have rate limiting implemented. The `create-checkout` and `create-razorpay-order` functions are vulnerable to abuse.

---

## 2. User Experience (UX) Audit

The design is clean (Astro + Tailwind), but the conversion funnel lacks the gamification and polish seen in top-tier platforms like Strava or Airbnb.

### Strengths
- **Performance:** Astro's static generation makes the landing pages incredibly fast.
- **Clean UI:** The use of CSS variables and a consistent design system creates a professional look.

### Critical Gaps
- **Profile Completeness (Linktree/Strava pattern):** The dashboard lacks a "Profile Completeness" progress bar. Trainers are not incentivised to add bios, photos, or Instagram links. Strava uses gamification to drive a 40% increase in profile completion [1].
- **Onboarding Friction:** The `/join` flow is a single long form. Best practices for 2025/2026 dictate multi-step, conversational onboarding to reduce cognitive load and increase conversion [2].
- **Missing SEO/Structured Data:** The `Base.astro` layout lacks Open Graph (OG) tags for social sharing and `schema.org` JSON-LD for local business SEO. When a trainer shares their profile on WhatsApp, it looks generic.
- **No PWA/Offline Support:** There is no `manifest.json` or service worker. Trainers cannot "Install to Home Screen" to use the dashboard like a native app.

---

## 3. Multi-Domain & Country Scaling Audit

The vision is 700 domains sharing one backend. The current implementation is halfway there.

### Strengths
- **`market.ts` Router:** The domain detection logic correctly routes `coachepar.fr`, `allenaticon.it`, etc., to the right locale.
- **i18n Dictionary:** The translation dictionary is well-structured and supports EN, FR, IT, ES.

### Critical Gaps
- **Payment Localization:** The `create-checkout` function assumes Stripe is available everywhere. The `create-razorpay-order` function is hardcoded for India. There is no unified payment gateway router that selects the right provider based on the `market_configs` table.
- **Content Localization:** The `astro.config.mjs` uses a single sitemap for all domains. Search engines will penalise this. Each domain needs its own `robots.txt` and `sitemap.xml` to rank locally.
- **Currency Formatting:** The frontend does not dynamically format currencies based on the user's locale (e.g., €19 vs 19 €).

---

## 4. The GSD Execution Roadmap

To reach a "serious level of engineering," we will execute this roadmap using the GSD framework. Each phase represents a `/gsd-plan-phase` and `/gsd-execute-phase` cycle.

### Phase 1: The Foundation (Engineering Quality)
**Goal:** Stop the bleeding and ensure the platform is observable and safe.
- **Task 1.1:** Implement Sentry across all Astro pages and Deno edge functions.
- **Task 1.2:** Add idempotency keys to all payment webhooks (`stripe-webhook`, `razorpay-webhook`).
- **Task 1.3:** Implement global rate limiting middleware for all authenticated edge functions.
- **Task 1.4:** Replace all hardcoded `trainedby.ae` strings with dynamic `Astro.url.origin` (frontend) and `Deno.env.get('PUBLIC_URL')` (backend).

### Phase 2: The Multi-Domain Engine (Scaling)
**Goal:** Make the platform truly tenant-agnostic so adding a new country takes 5 minutes.
- **Task 2.1:** Build a unified Payment Router edge function that reads `market_configs.payment_provider` (Stripe vs Razorpay) and handles the checkout flow dynamically.
- **Task 2.2:** Implement dynamic `sitemap.xml` and `robots.txt` generation per domain.
- **Task 2.3:** Add `schema.org` LocalBusiness JSON-LD to trainer profiles, dynamically populated with their specific market data.
- **Task 2.4:** Add dynamic Open Graph (OG) image generation for trainer profiles (e.g., "CoachéPar: [Trainer Name]").

### Phase 3: The Growth Engine (UX & Conversion)
**Goal:** Apply Strava/Airbnb UX patterns to drive activation and retention.
- **Task 3.1:** Refactor `/join` into a 3-step conversational onboarding flow.
- **Task 3.2:** Build a "Profile Completeness" gamification widget on the dashboard (e.g., "You are 80% complete. Add your Instagram to reach 100%").
- **Task 3.3:** Implement a PWA `manifest.json` and service worker so trainers can install the dashboard on their phones.

---

## Next Steps for the CEO

To begin execution, run this command in the CEO bot:

`/directive Execute Phase 1 of the Product Audit Roadmap: The Foundation. Focus on Sentry, idempotency, and removing hardcoded URLs.`

The CEO bot will use GSD to plan the phase, assign the tasks, and enforce TDD and verification.

---
### References
[1] Trophy.so, "How Strava Uses Gamification to Improve Retention and Engagement," March 2026.
[2] Guidejar, "7 User Onboarding Best Practices That Actually Work in 2025," September 2025.
