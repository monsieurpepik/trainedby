# TrainedBy — Product Decisions

Companion to ARCHITECTURE.md. Documents WHY each major product feature exists and was built the way it was.

---

## Profile Completeness — Gamified Widget

**Decision:** Gamified progress ring (0-100%) with per-field point values over passive dashboard nudges.

**Why:** Trainer profile completeness is the single biggest driver of lead conversion. A trainer with no photo, no bio, and no packages gets zero leads — not because of discovery, but because consumers leave. The Strava model (public progress, point values, share milestone) has been shown to drive 40%+ improvement in profile completion vs. simple nudge messages.

**How it works:** The score is computed server-side on every dashboard load from real DB columns (`avatar_url`, `bio`, `instagram_handle`, `session_packages` count, `reps_verified`). Point values: photo (20), bio (20), instagram (15), packages (20), cert (10) = 85 points max. We reserve 15 points for future fields without breaking existing trainers' scores.

**Tradeoff considered:** Client-side computation (fetch trainer data in browser) vs. SSR. We chose SSR — no loading flicker, no extra fetch, and the data is already on the page for other dashboard widgets.

---

## PWA — Progressive Web App

**Decision:** Install-to-home-screen PWA for the trainer dashboard over a native iOS/Android app.

**Why:** Our trainer demographic (personal trainers aged 25-45) checks their dashboard while between client sessions. A home screen app removes the "open browser → remember URL → log in" friction. Native apps require App Store review cycles (3-7 days per release) and developer accounts ($99/year iOS, $25 Android). A PWA ships instantly and is free.

**Tradeoff considered:** Native apps have better push notifications and biometric auth. We accept this — magic link auth means we don't need biometrics, and we use Telegram for high-priority notifications (the CEO bot). We can migrate to Capacitor (web→native wrapper) later if needed.

---

## OG Images — Dynamic Per-Trainer Generation

**Decision:** Dynamic server-generated OG images per trainer profile using Satori + Sharp over static fallback images.

**Why:** When a trainer shares their profile URL on WhatsApp, the preview card is the first impression for potential clients. A generic brand image ("TrainedBy") vs. a card showing "Sarah Al Mansoori — Personal Training" is the difference between a click and a scroll-past.

**How it works:** Astro API route at `/og/[slug].png` queries the trainer's name, specialty, and market, then renders an SVG and converts to PNG. Response is cached for 24 hours via `Cache-Control`.

**Tradeoff considered:** Cloudinary's auto-generated social cards vs. self-hosted. Cloudinary adds an external dependency and per-transformation cost. Our self-hosted implementation adds ~300ms on first load (cached after that) with zero ongoing cost.

---

## Auth — Magic Links

**Decision:** Email magic links over password auth.

**Why:** Our trainers are fitness professionals, not tech workers. Password reuse, forgotten passwords, and "forgot password" flows are the #1 support request for fitness platforms. Magic links have a single happy path: enter email → click link → in. No password to forget, no support ticket.

**Tradeoff considered:** Magic links require email access (problematic if trainer doesn't check email). Mitigated by the Telegram bot (@TrainedByCEO_bot), which gives an alternative notification channel. Sessions are extended on each valid dashboard load (7-day expiry rolling), so frequent users rarely need to re-authenticate.
