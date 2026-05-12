# TrainedBy — Landing Redesign + Launch Gates
**Date:** 2026-05-12  
**Status:** Approved for planning  
**Scope:** Full landing page visual redesign + all 7 remaining launch gates

---

## 1. Context

The current landing page feels unfinished: the hero right panel is empty on desktop, the trainer grid shows only skeleton loaders (no real content), the blog section has emoji placeholders, and the page background is pure white (#FFFFFF) which reads as clinical and generic. The overall aesthetic is "Bootstrap default" — predictable component patterns with no editorial identity.

Reference direction: Linktree's profile cards (full-bleed photo fills entire card, UI overlays on top), Higgsfield AI's glassmorphism (dark glass panels over cinematic imagery), getdesign.md / Nike (no shadows, hairline borders, tight letter-spacing). Aspirational feel: warm, editorial, athletic — not SaaS.

---

## 2. Design Decisions

### 2.1 Page Background
- **Change:** `#FFFFFF` → `#EDECEA` (warm off-white) across all landing page sections
- **Why:** Pure white reads as clinical/generic. The warm tone creates an editorial, premium feel and gives white cards visible definition without borders.
- **Applies to:** `landing.astro` root background, all section backgrounds

### 2.2 Editorial Trainer Card (new component)
This replaces the current card-with-photo-area-on-top layout entirely.

**Structure:**
- Full-bleed photo fills the entire card — no separate "body" section below
- Aspect ratio: `3/4` (hero card), `2/3` (grid cards)
- Border-radius: `22px`
- No border. No box-shadow. The card sits on the warm page background.
- **Layers (bottom to top):**
  1. `<img>` absolute fill — trainer photo, `object-fit: cover`
  2. Gradient overlay: `linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.72) 100%)`
  3. Badge (top-left): frosted glass — `background: rgba(255,255,255,0.16)`, `backdrop-filter: blur(12px)`, `border: 1px solid rgba(255,255,255,0.22)`, pill shape, green dot + "REPs Verified"
  4. Bottom overlay: trainer name (700 weight, -0.03em tracking), specialty + city (muted white), price + "View profile" white pill button

**Fallback (no photo):** Warm gradient placeholder — `linear-gradient(160deg, #2c1810 0%, #8B4513 30%, #c55a1e 60%, #e8824a 85%, #f5a875 100%)`. Never emoji, never initials-only card.

**Hover:** `transform: scale(1.03)` on the inner bg layer only (overflow: hidden on card = clean zoom)

### 2.3 Hero Section
- **Layout:** Split grid `1fr 340px`, `min-height: 88vh`
- **Left:** Eyebrow pill (white bg, hairline border, green dot + "REPs Verified · Dubai"), H1 at `clamp(40px, 5.5vw, 68px)` / 800 weight / -0.04em tracking, sub at 16px / 400 weight, search bar (white bg, hairline border, pill shape, dark search button), quick filter pills (white bg, hairline border), trust strip (green dots, no fabricated numbers — use real counts or remove)
- **Right:** Single editorial card (3/4 ratio), dot indicator below (flat bars: 22px active, 6px inactive)
- **Background of right panel:** The card sits directly on the `#EDECEA` page bg — no extra panel wrapping it
- **Mobile:** Right card hidden, left full-width (existing behaviour preserved)

### 2.4 Featured Trainers Grid
- **Remove:** Skeleton loaders as default state
- **Replace with:** 4-column editorial card grid (2/3 ratio), loaded from Supabase
- **Empty state (no pro trainers):** Show the single sample profile card (sarah-al-mansoori) with a "Be the first verified trainer" CTA alongside it — not skeletons
- **Query:** `plan=eq.pro&is_active=eq.true` — unchanged. If returns empty array, show empty state, not skeletons forever.

### 2.5 Blog Section
- **Remove:** Emoji visuals (`🏋️`), all links pointing to `/blog` with placeholder content
- **Replace with:** 3 static blog preview cards — copy stays from existing i18n strings, only visual treatment changes. Cards use `background: #F5F4F3`, `border: 1px solid #E0DDD9`, `border-radius: 12px`, no emoji in visual area. The image/visual area shows a warm neutral gradient (`#F5F4F3` → `#E8E5E2`) instead of emoji.
- **No new blog infrastructure** — purely CSS/HTML changes to existing static blog cards

### 2.6 "For Trainers" Banner
- **Change:** Current brand-dim orange background → `#1A1411` (near-black)
- **Why:** Creates a strong visual break. Orange on orange is weak. Dark banner with white text + orange CTA reads clearly.
- **CTAs:** Primary = `background: #FF5C00` pill ("Claim your profile"), Ghost = `border: 1px solid rgba(255,255,255,0.2)` ("See how it works")

### 2.7 Navigation
- **Scrolled state:** `background: rgba(237,236,234,0.85)` + `backdrop-filter: blur(20px)` — glass on warm bg (already partially implemented, align colour token)
- **"For trainers" link:** `color: var(--brand)` + `font-weight: 700`

### 2.8 Root Redirect Fix
- **Remove:** `<meta http-equiv="refresh">` + `window.location.replace()` in `src/pages/index.astro`
- **Replace with:** Move all landing page content directly into `index.astro` OR use Astro's `redirect()` in the frontmatter (returns 301, not meta-refresh). A meta-refresh is slow, looks broken in dev, and is SEO-hostile.

### 2.9 Trust Strip
- **Remove:** All hardcoded i18n strings with fabricated numbers ("100+ verified profiles", etc.)
- **Replace with:** Either (a) pull real counts from DB via an edge function or (b) use qualitative trust signals only: "REPs Certified only", "Background checked", "Free to browse" — no numbers until real data exists. CLAUDE.md rule: no fabricated numbers.

---

## 3. Launch Gates (7 remaining)

### Gate 1 — Legal pages render
- **Pages needed:** `/privacy`, `/terms`, `/cookies` (or equivalent Astro routes)
- **Check:** Do they exist? Do they return 200? Do they have real content?
- **Action:** Create if missing. Ensure linked from footer (already in footer design above).

### Gate 2 — Cookie consent banner
- **Required:** Banner on first visit with Accept/Decline. Preference stored in `localStorage`.
- **Implementation:** Lightweight inline script in `Base.astro` — no third-party library. Show banner if `localStorage.getItem('cookie_consent')` is null.
- **Blocks:** Google Analytics, Facebook Pixel should only fire after consent.

### Gate 3 — Consent checkboxes on /join and lead forms
- **Required:** Explicit opt-in checkbox (unchecked by default) on `/join` and any lead capture form.
- **Copy:** "I agree to the [Privacy Policy] and [Terms of Service]"
- **Validation:** Form must not submit if unchecked.

### Gate 4 — Google Rich Results Test passes
- **Required:** Structured data (JSON-LD) on trainer profile pages (`/[slug]`)
- **Schema:** `Person` or `LocalBusiness` with `name`, `description`, `image`, `url`, `priceRange`
- **Check:** `npx structured-data-testing-tool` or manual Rich Results Test

### Gate 5 — WhatsApp OG card shows trainer branding
- **Required:** `og:image`, `og:title`, `og:description` meta tags present and correct on all pages
- **Landing:** `og:image` points to a real 1200×630 static asset in `/public/og-default.png` with TrainedBy branding. Create this image if missing.
- **Trainer pages:** `og:title` = trainer name, `og:description` = specialty + city, `og:image` = trainer avatar URL (or fallback to default OG image if no avatar)
- **No dynamic image generation** — static or avatar URL only. Dynamic OG is a future phase.
- **Check:** Paste URL into https://www.opengraph.xyz or share in WhatsApp and verify card renders

### Gate 6 — Stripe shows correct currency per market
- **Required:** `src/lib/market.ts` currency config drives Stripe `currency` param on checkout
- **Markets:** `ae` → AED, `com` → USD, `fr` → EUR, `it` → EUR, `es` → EUR
- **Check:** Initiate checkout on each market, verify Stripe dashboard shows correct currency

### Gate 7 — Sentry has ≥1 confirmed live event
- **Required:** Sentry DSN wired in both `sentry.client.config.js` and `sentry.server.config.js`
- **Check:** Manually trigger a test error via `Sentry.captureException(new Error('test'))` in browser console on production, verify event appears in Sentry dashboard
- **Env var:** `PUBLIC_SENTRY_DSN` must be set in Netlify env vars

---

## 4. Component Inventory

| Component | File | Change type |
|-----------|------|-------------|
| Editorial trainer card | JS HTML template string in `landing.astro` `<script>` | New (client-side rendered, Supabase fetch) |
| Landing page | `src/pages/landing.astro` | Major redesign |
| Root index | `src/pages/index.astro` | Remove meta-refresh |
| Cookie banner | New inline in `src/layouts/Base.astro` | New |
| Legal pages | `src/pages/privacy.astro`, `terms.astro` | Create if missing |
| Join form | `src/pages/join.astro` | Add consent checkbox |
| Trainer profile | `src/pages/[slug].astro` | Add JSON-LD structured data |
| OG meta | `src/layouts/Base.astro` | Verify/fix dynamic OG tags |
| Sentry config | `sentry.client.config.js`, `sentry.server.config.js` | Verify DSN wired |
| Stripe checkout | Edge function `create-checkout` | Verify currency from market config |

---

## 5. Design Tokens (delta from current)

```css
/* Changed */
--bg: #EDECEA;           /* was #FFFFFF */
--surface: #F7F5F3;      /* warm surface (was #FAFAF9) */

/* Unchanged — confirmed */
--brand: #FF5C00;
--ink: #1A1411;
--hairline: #E0DDD9;
--muted: #9B9490;
--verified: #00C853;
--font: 'DM Sans';
```

---

## 6. What We Are NOT Changing
- Mobile layout of landing page (hero right is already hidden on mobile)
- The `/find` search page
- The trainer profile page design (separate phase)
- The dashboard or `/join` flow beyond adding consent checkbox
- Any edge functions except `create-checkout` currency verification
- Existing i18n strings (copy stays, only visual treatment changes)

---

## 7. Success Criteria
- [ ] Landing page background is `#EDECEA`, not white
- [ ] Hero right panel shows editorial trainer card on desktop
- [ ] Trainer grid shows editorial cards or a real empty state — never infinite skeletons
- [ ] Blog section has no emoji placeholders
- [ ] No meta-refresh on root `/`
- [ ] No fabricated numbers in trust strip
- [ ] All 7 launch gates ✅ (verified in LAUNCH.md)
- [ ] `npm run check` passes
- [ ] Lighthouse score ≥ 90 on landing page
