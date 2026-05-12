# TrainedBy — Design Audit
**Audited:** 2026-05-01  
**Scope:** 15 consumer-facing pages + shared patterns  
**Basis:** 6-pillar framework (1=Embarrassing → 4=Excellent)

---

## Pillar Scores at a Glance

| Pillar | Score | Verdict |
|--------|-------|---------|
| Copywriting | 2/4 | Strong moments collapsed by generic patterns and emoji pollution |
| Visual Hierarchy | 2/4 | Hero execution sophisticated; below the fold the hierarchy dissolves |
| Color & Contrast | 2/4 | Orange applied to 12+ semantic roles with zero restraint |
| Typography | 2/4 | Two fonts declared, body font flip-flops per page |
| Spacing & Density | 3/4 | Scale exists and is mostly respected; border-radius chaos undermines it |
| Experience Design | 2/4 | Sophisticated loading on marketing pages, hard crashes on transactional flows |

**Overall: 13/24**

---

## Page-by-Page Audit

### index.astro — Embarrassing (1/24)

**Score:** Copywriting 1/4 | Visuals 1/4 | Color 1/4 | Typography 1/4 | Spacing 1/4 | Experience 1/4

The root URL of the product performs a meta-refresh redirect to /landing — AND runs a JS redirect simultaneously. Google sees a redirect page with no canonical content, no `<title>`, no `<meta name="description">`. For a multi-market SEO platform, the root page being a redirect stub is an architectural blocker.

**Fix:** Render landing.astro content at `/` directly. Delete this file.

---

### landing.astro — Solid (17/24)

**Score:** Copywriting 3/4 | Visuals 3/4 | Color 2/4 | Typography 3/4 | Spacing 3/4 | Experience 2/4

**What works:**
- Hero eyebrow: "{certificationBody} Verified Trainers · {cityName}" — market-specific, credibility-building
- Trust strip uses four specific claims, not generic "trusted by thousands"
- Blog tagline: "No generic content. No AI fluff. Real expertise, cited sources." — confident and self-aware
- Shimmer skeleton loaders on featured trainers — premium interaction pattern
- Reveal-on-scroll with staggered delays — adds perceived polish

**AI tells / what to fix:**
- `"Find your perfect trainer"` appears as sidebar CTA title — exact phrase from the AI-tells hall of shame
- Blog card visuals are giant emoji (`🏋️` at 48px) — jarring against an otherwise crafted layout
- Article thumbnails (`🌙`, `🥩`, `🏢`, `🧠`) used as cover images — undermine the "real expertise" brand claim

**BLOCKER — Fabricated social proof:**  
Transformation cards show hardcoded trainer names (Sarah Al Mansoori, Khalid Rashid), stats (14 weeks, 8kg lost), and success stories with no "example" label. CLAUDE.md rule 2 prohibits fake metrics. Remove or source from database.

**Specific copy fix:**  
Before: "Find your perfect trainer"  
After: "Find a {certBody}-Verified Trainer in {cityName}"

---

### for-trainers.astro — Weak (14/24)

**Score:** Copywriting 2/4 | Visuals 2/4 | Color 2/4 | Typography 3/4 | Spacing 3/4 | Experience 2/4

**What works:**
- Hero: "Your link-in-bio. Your booking hub. Your business." — punchy, specific
- Sub-hero names the AI assistant as a concrete benefit

**AI tells / what to fix:**
- Section title: "Everything you need. Nothing you don't." — coined by Basecamp ~2004, now on every SaaS product on earth. Zero differentiation.
- Bottom CTA: "Your expertise. Your profile. Your practice." — triple "Your X" anaphora is an AI generation signature
- FAQ title: "Common questions." — invisible
- Feature icons: `✓ 🤖 📊 ✍️` emoji in `.feature-icon` divs — renders differently across OS, breaks credibility
- Phone mockup has `📱 Book via WhatsApp` — real WhatsApp buttons don't use a phone emoji prefix
- Proof strip trainer count: shows ` - verified trainers` if JS fails or is slow — broken AND fabricated

**Specific copy fixes:**  
Before: "Everything you need. Nothing you don't."  
After: "A profile that books clients. Tools that run your practice."

Before: "Your expertise. Your profile. Your practice."  
After: "You coach. We handle everything else."

Before: "Common questions."  
After: "What trainers ask before signing up"

---

### find.astro — Weak (12/24)

**Score:** Copywriting 1/4 | Visuals 2/4 | Color 1/4 | Typography 3/4 | Spacing 3/4 | Experience 2/4

**What works:**
- Shimmer skeleton loading implemented correctly — premium feel while data loads
- Card cover images with gradient overlays look professional when cover_url exists

**AI tells / what to fix:**
- H1: "Find Your Perfect Personal Trainer" — the single most generic fitness discovery headline possible. Appears on every coach-finder, PT directory, and gym locator built by any AI in 2023-2024.
- Empty state: `🔍` emoji at 40px as illustration, then "No trainers found / Try adjusting your search or filters" with no CTA
- All trainers without cover_url get the SAME Unsplash gym interior photo — if 80% haven't set a cover, the find page looks like the same gym 12 times
- Avatar fallback: `linear-gradient(135deg, #FF5C00, #FF8C42)` for every trainer without a photo — 12 identical orange circles destroys differentiation
- Orange simultaneously on: stars, specialty tags (bg + border + text), verified badge, filter active state, card hover border, WhatsApp hover — six uses, zero hierarchy

**Specific copy fix:**  
Before: "Find Your Perfect Personal Trainer"  
After: "Find a {certBody}-Verified Trainer in {cityName}"

Before: "No trainers found"  
After: "No certified trainers match that search yet — try removing a filter or browse all {cityName} trainers"

**Avatar fallback fix:** Use trainer name initial to seed deterministic color from a palette: `['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']`. Every trainer gets a unique, consistent identity.

---

### find/[city].astro — Weak (11/24)

**Score:** Copywriting 2/4 | Visuals 2/4 | Color 2/4 | Typography 2/4 | Spacing 3/4 | Experience 1/4

**What works:**
- City-specific H1 is SEO-correct and specific

**AI tells / what to fix:**
- Empty state for a city with no trainers: `<p>No trainers listed in {cityName} yet.</p>` — dead end, no CTA, no warmth. This will be the MAJORITY of city pages at current scale.
- Same orange avatar gradient fallback as find.astro
- No Manrope font load visible — headings may fall back to system sans-serif on first visit

**Fix for empty state:** (1) "We're building this market — want to be first?" CTA to /join, (2) "Browse trainers in [nearest city]" fallback, (3) Waitlist capture.

---

### [slug].astro — Trainer Profile — Solid (16/24)

**Score:** Copywriting 3/4 | Visuals 3/4 | Color 2/4 | Typography 3/4 | Spacing 3/4 | Experience 3/4

**What works:**
- Canvas color extraction for ambient bloom — genuinely sophisticated, not generic
- Avatar rotating conic-gradient ring — differentiated
- WhatsApp pulse animation — mobile-native interaction affordance
- Error state: "Trainer not found. They may have updated their profile link." — context-aware, above average
- Type hierarchy: trainer name at 26px/800/letter-spacing -0.02em — the best-executed typography in the product

**AI tells / what to fix:**
- `📅 Book a Session` on the primary booking button on a professional platform
- Default background: same hardcoded Unsplash gym interior as find.astro — all profiles without a cover photo look identical
- Profile section cards at `border-radius: 20px` while find cards are 14px, for-trainers 16px, booking 6-12px — no system
- All content client-rendered via `renderProfile()` — Googlebot sees an empty shell

**Specific copy fix:**  
Before: `📅 Book a Session`  
After: `Book a Session` (or use an SVG calendar icon)

---

### book/[slug].astro — Booking Flow — Embarrassing (8/24)

**Score:** Copywriting 2/4 | Visuals 1/4 | Color 2/4 | Typography 2/4 | Spacing 2/4 | Experience 1/4

This is the most critically broken page. Money changes hands here.

**What works:**
- Step labels are functional

**AI tells / what to fix:**
- **BLOCKER:** Currency hardcoded as `$` throughout — `${(st.price_cents / 100).toFixed(0)}`. A Dubai trainer charging AED shows `$150`. Direct revenue impact.
- Calendar nav buttons: `<button id="cal-prev">←</button>` — unstyled HTML, renders as default grey browser button with text arrow. The most visually regressed element in the product.
- Step indicator shows current step number but no "completed" vs "upcoming" state — users can't orient
- No back link to trainer profile — users who want to reconsider must use browser back
- No loading state visible when payment is submitted
- Four different border-radius values on one page: 6px (inputs), 8px (pay button), 10px (session cards), 12px (booking card)
- Page doesn't use Base.astro — completely outside the design system. Font is Inter, profile page is Manrope. User clicks "Book a Session" and lands in a different visual universe.
- No Stripe error state beyond possible alert() — unverified

**Specific copy fix:**  
Before: "You're booked!"  
After: "Session confirmed. Check your email for details."

After booking success: add trainer name, session date/time, "What's next?" section with WhatsApp contact link.

---

### book/cancel.astro — Weak (12/24)

**Score:** Copywriting 2/4 | Visuals 2/4 | Color 3/4 | Typography 2/4 | Spacing 3/4 | Experience 2/4

**What works:**
- Refunded: "A full refund... will appear within 5–10 business days." — specific, expectation-setting
- Color is clean here — orange only on error button

**AI tells / what to fix:**
- Error h1: "Something went wrong" — appears on 40 million web pages
- State icons: `⚠️` (emoji), `ℹ️` (emoji), `✓` (text character `&#10003;`), `⚠️` again — four states, three different icon systems
- `✓` at 40px renders differently across OS — on some systems it's tiny, on some it's bold
- No post-cancellation navigation — success state is a dead end (no "Find another trainer", no home link)
- **BLOCKER:** Logo hardcoded as `Trained<span>By</span>` — French users on coachepar.fr see wrong brand
- 24h no-refund copy is clinical: "No refund is available as it was within 24 hours"

**Specific copy fix:**  
Before: "Something went wrong"  
After: "We couldn't cancel this booking"

Before: "No refund is available as it was within 24 hours of the session."  
After: "Your session was within our 24-hour cancellation window, so the session fee has been retained per our policy."

---

### my-bookings.astro — Embarrassing (9/24)

**Score:** Copywriting 2/4 | Visuals 1/4 | Color 2/4 | Typography 2/4 | Spacing 2/4 | Experience 2/4

**What works:**
- Status badge color system: green/amber/faded — directionally correct

**AI tells / what to fix:**
- `<h1>⚠️ Invalid link</h1>` — emoji in an h1 on a professional session management page
- Empty state: `<p class="empty">No session credits found for this link.</p>` — four words, no context, no guidance. Users arrive from a purchase email and have no idea what to do.
- "Contact your trainer directly to schedule your remaining sessions" — no contact mechanism provided. No link. No WhatsApp. Nothing.
- **BLOCKER:** Logo hardcoded as `Trained<span>By</span>` — market unaware
- Page completely outside design system — custom styles, no Base.astro, different visual language
- Used sessions have same visual weight as available sessions — no reduced opacity, no retirement treatment (dashboard has `opacity: 0.5` for used items, this page doesn't)

**Specific copy fix:**  
Before: "No session credits found for this link."  
After: "No sessions found. If you purchased a package, it may take a few minutes to appear. Contact your trainer if this persists."

---

### join.astro — Solid (16/24)

**Score:** Copywriting 2/4 | Visuals 3/4 | Color 2/4 | Typography 3/4 | Spacing 3/4 | Experience 3/4

**What works:**
- 6-box OTP with auto-advance and paste handling — premium form interaction
- Step indicator dots with progress bar — clear multi-step orientation
- AI bio generation — genuine differentiator, well-integrated
- Trust row uses SVG icons consistently — the one place this discipline holds

**AI tells / what to fix:**
- "Finish — Go Live 🚀" — the most recognizable AI-generated CTA pattern. Accepted the first ChatGPT output.
- "Verify & Go Live 🚀" — same
- `'Verify &amp; Go Live 🚀'` in JS string — `&amp;` is an HTML entity, wrong in a JS context, renders as literal `&amp;` in some paths
- "Autobuild from Instagram" implies scraping — it extracts a name from the handle string. Expectation mismatch.
- No "I already have an account" path on the join flow

**Specific copy fixes:**  
Before: "Finish — Go Live 🚀"  
After: "Publish My Profile"

Before: "Verify & Go Live 🚀"  
After: "Verify Email"

---

### pricing.astro — Solid (15/24)

**Score:** Copywriting 2/4 | Visuals 3/4 | Color 3/4 | Typography 3/4 | Spacing 3/4 | Experience 2/4

**What works:**
- Gold metallic gradient for Pro card — the most visually distinctive element in the product
- Animated shimmer top line on Pro — crafted
- Annual/monthly toggle — functional, well-executed
- Color discipline here is better than any other page

**AI tells / what to fix:**
- `📊` emoji as the analytics feature icon in the Pro plan features list — on the upsell item that justifies the Pro price
- **BLOCKER:** `alert()` used for checkout errors — browser native alert over premium dark UI is 2005 web development. Replace with toast or inline error.
- No loading state on Upgrade button after click

---

### dashboard.astro — Solid (17/24)

**Score:** Copywriting 2/4 | Visuals 3/4 | Color 3/4 | Typography 3/4 | Spacing 3/4 | Experience 3/4

**What works:**
- Gold Pro upgrade banner treatment — coherent with pricing page
- Indigo (`#6366f1`) for AI features — the only non-orange, non-green accent in the product. Works because the semantic is distinct.
- Three-dot pulse loading animation while auth checks — above average
- AI panel with quick prompt chips — reduces blank-screen paralysis
- Dashboard color semantics: orange (interactive), green (verified/positive), indigo (AI), gold (Pro) — the best semantic structure in the product

**AI tells / what to fix:**
- "Sign In →" button links to `/edit` — confusing. Sign in ≠ profile edit.
- Income stream cards use emoji as icons at 20px
- All primary content is client-rendered — dashboard is a blank shell to crawlers and on slow JS

---

### 404.astro — Solid (18/24)

**Score:** Copywriting 3/4 | Visuals 3/4 | Color 3/4 | Typography 3/4 | Spacing 3/4 | Experience 3/4

**What works:**
- Copy: "The page you're looking for doesn't exist, or the trainer profile may have been removed." — context-aware
- Hint box: explains trainer slug changes specifically — above average guidance copy
- `404` in gradient orange text via `-webkit-background-clip` — distinctive
- Orange used only for: gradient "404" text + primary button — clean

The 404 page is the best-executed utility page in the product.

---

### blog.astro — Solid (15/24)

**Score:** Copywriting 3/4 | Visuals 2/4 | Color 2/4 | Typography 3/4 | Spacing 3/4 | Experience 3/4

**What works:**
- "Fitness advice from trainers who actually train." — specific, credible, implicit jab at generic content
- "No generic content. No AI fluff. Real expertise, cited sources." — bold, if honored, a genuine differentiator
- Green author dot — clever micro-interaction reference to the verified/live pattern
- Category filter with client-side filtering and per-category empty states — functional

**AI tells / what to fix:**
- Claims "No AI fluff" then displays `🌙🥩🏢🧠` as article cover images — direct contradiction visible on the same scroll
- `.blog-visual` is a `div` with `font-size: 48px` containing an emoji — communicates "placeholder" to every user
- All article thumbnails are emoji — replace with real images or a designed illustration system

---

## Cross-Cutting Issues

### 1. Color Semantic Collapse — BLOCKER

Orange (`#FF5C00`) applies to 12+ distinct semantic roles. It currently means: primary CTA, verified badge, rating stars, price labels, specialty tag background/border/text, active nav state, eyebrow text, step numbers, profile URL, dashboard stat accent, referral progress, chart bar active, and feature icon color.

**Orange should ONLY mean:** interactive primary action (buttons, primary CTAs).

**Reassign:**
- Rating stars → `#f59e0b` (amber — internationally recognized)
- Verified badge → consolidate with `#00C853` green (green already means "verified" — REPs badge, live dot, author dot — make it consistent)
- Specialty tag → `rgba(255,255,255,0.06)` background, `rgba(255,255,255,0.6)` text (decorative, not interactive)
- Price labels → `var(--text)` white (informational)
- Section eyebrow text → `rgba(255,255,255,0.45)` (subdued)
- Dashboard URL text → `var(--text)` (it's a display field)

### 2. Border-Radius Anarchy — WARNING

10 distinct border-radius values in production with no documented system:
4px, 6px, 8px, 10px, 12px, 14px, 16px, 20px, 24px, 100px

**4-value system:**
```css
--radius-sm: 6px;    /* inputs, time slots */
--radius: 12px;      /* cards, badges */
--radius-lg: 16px;   /* large cards, panels */
--radius-pill: 100px; /* pills, tags */
```

### 3. Emoji as Product Icons — BLOCKER (by count)

**Critical-path (breaks credibility on conversion moments):**
- `📅` on the primary booking button
- `🚀` on two primary signup CTAs
- `⚠️` on error states in cancel and my-bookings
- `✓` text character as cancellation success icon
- `📊` in Pro plan pricing feature list
- `alert()` dialog (OS emoji rendering)

**Marketing/content (degrades premium positioning):**
- `🤖📊✍️📱` as feature icons in for-trainers
- `🔍` as empty state illustration in find
- `🏋️` as blog featured post visual
- `🌙🥩🏢🧠☀️` as article thumbnails

The profile page, dashboard AI panel, and 404 page use SVGs exclusively. The capability is there. The discipline isn't applied consistently.

### 4. Font System Inconsistency — WARNING

| Page | Body font | Display font |
|------|-----------|--------------|
| profile.astro | Manrope | Manrope |
| for-trainers.astro | Manrope | Manrope |
| dashboard.astro | Manrope | Manrope |
| landing.astro | Inter | Manrope |
| find.astro | Inter | Manrope |
| book/[slug].astro | Inter | **No Manrope** |
| book/cancel.astro | Inter | **No Manrope** |
| my-bookings.astro | Inter | **No Manrope** |
| find/[city].astro | Inter | Unclear |
| 404.astro | Manrope | Manrope |

A user going find → profile → book experiences three distinct font personalities.

### 5. Design System Islands — BLOCKER

Pages outside the design system (no Base.astro, no token system):
- `book/[slug].astro` — hardcoded `$` currency, 4 different border-radius values, wrong font
- `book/cancel.astro` — hardcoded "TrainedBy" brand, wrong font
- `my-bookings.astro` — hardcoded "TrainedBy" brand, wrong font

These are not marketing pages. They are where money changes hands and credits are managed.

### 6. Fabricated Social Proof — BLOCKER (CLAUDE.md violation)

Transformation cards in landing.astro display hardcoded names, stats, and stories without "example" label. CLAUDE.md rule 2: "Never add fake metrics, fake trainer counts, fake income figures, or fake scarcity to any page." Either source from database or remove.

### 7. No Graceful JS Failure — WARNING

find.astro, [slug].astro, book/[slug].astro, dashboard.astro all deliver empty HTML shells without JS. SEO crawlers and slow connections get nothing. For a platform where city-based SEO is the primary acquisition channel, this is significant.

---

## Priority Fix List

### P0 — Fix Before Any Investor or Press Sees This
1. **Currency `$` hardcode** in book/[slug].astro — connect to `market.currency`
2. **`alert()` in pricing.astro** — replace with toast/inline error
3. **Fake transformation cards** in landing.astro — remove or source from DB
4. **Emoji on primary conversion CTAs** — `📅 Book`, `🚀 Go Live` (twice) — replace with text or SVG
5. **Brand hardcode** in cancel.astro and my-bookings.astro — use `market.brandName`

### P1 — Fix in Next Sprint
1. **Orange semantic collapse** — interactive only; stars → amber, prices → white, specialty → neutral
2. **Emoji as UI icons** — replace all product-surface emoji with SVGs (keep editorial emoji in blog content only)
3. **book/[slug].astro → Base.astro** — route through design system
4. **Calendar nav buttons** — style `←` `→` with padding, border, border-radius, hover state
5. **City empty state** — add trainer recruitment CTA and nearest-city fallback
6. **Find page fallback images** — deterministic gradient per trainer slug, not one Unsplash URL repeated
7. **Avatar fallback** — deterministic color from trainer name initial, not universal orange gradient
8. **Find page H1** — "Find Your Perfect Personal Trainer" → "{certBody}-Verified Trainers in {cityName}"
9. **index.astro** — delete redirect stub, render landing content at `/`

### P2 — Polish Pass
1. **Border-radius system** — collapse 10 values to 4 CSS variables
2. **Font consistency** — enforce Manrope display / Inter body through Base.astro across all pages
3. **for-trainers section title** — "Everything you need. Nothing you don't." → specific benefit
4. **Proof strip loading state** — skeleton shimmer, not dash placeholder
5. **Booking success state** — confirmation email mention, next steps, trainer contact
6. **Cancel page post-action nav** — add next steps after all cancellation outcomes
7. **my-bookings** — add trainer contact link, booking link, loading skeleton, explain what credits are
8. **Book flow step indicator** — show completed (✓) vs current vs upcoming states

---

## What's Actually Working (Protect These)

1. **Canvas color extraction → ambient bloom** on profile — genuine premium technique
2. **Avatar rotating ring** (conic-gradient animation) — differentiated from any competitor
3. **Gold metallic Pro treatment** — coherent across pricing + dashboard, semantically distinct from orange
4. **Dashboard color semantics** — orange/green/indigo/gold each owning a distinct meaning. The best design decision in the product.
5. **OTP 6-box auto-advance** in join.astro — premium form interaction
6. **Shimmer skeleton loaders** — correct pattern, well-implemented
7. **Green semantic consistency** — `#00C853` used exclusively for verified/live/certified throughout. This ONE color IS disciplined. Apply the same discipline to orange.
8. **WhatsApp pulse animation** — mobile-native interaction affordance
9. **404 copy** — context-aware, explains trainer slug changes, the best guidance copy in the product
10. **"No AI fluff"** blog claim — confident brand voice worth protecting (and honoring)
