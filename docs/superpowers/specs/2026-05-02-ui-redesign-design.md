# TrainedBy UI Redesign — Design Spec

**Date:** 2026-05-02
**Scope:** Landing page, Search/Find page, Trainer Dashboard — light theme + desktop layouts
**Approach:** Targeted structure + theme (Approach C) — replace CSS vars, add desktop breakpoints, preserve all JS/business logic

---

## Problem

Three pages (`landing.astro`, `find.astro`, `dashboard.astro`) use the old dark theme (`#0a0a0a` background, orange as general UI accent) and lack proper desktop layouts. The trainer profile page was already updated to a light/clean design; these three pages are now inconsistent with it.

---

## Design Direction: Light & Clean

Matches the trainer profile page already in production. White backgrounds, warm neutral grays, DM Sans typography, dark near-black ink (#1A1411). Orange (#FF5C00) is retained but scoped strictly to trainer-facing touchpoints.

### Design Tokens

```css
--bg:        #FFFFFF;
--surface:   #F5F4F3;        /* card backgrounds, inputs */
--surface-2: #E8E5E2;        /* dividers, borders */
--text:      #1A1411;        /* primary text, warm near-black */
--text-2:    #6B6460;        /* muted labels, secondary */
--border:    rgba(0,0,0,0.07);
--brand:     #FF5C00;        /* orange — trainer-facing only */
--green:     #00C853;        /* verified badges */
```

### Typography

- **Font:** DM Sans throughout (already loaded on trainer profile)
- **Headings:** 800 weight, -0.04em tracking
- **Body:** 400 weight, 1.6 line-height
- **Labels:** 700 weight, uppercase, 1px letter-spacing, muted color

### Orange Usage Rules

Orange (`#FF5C00`) appears ONLY on:
- "For trainers →" nav link
- "Join as trainer →" CTA on landing hero
- Dashboard "View my profile →" link
- Verified trainer badge on search cards (trainer credential — not UI decoration)

Orange does NOT appear on: primary buttons, active filters, tab indicators, stats, headings, or any consumer-facing UI element.

---

## Page Designs

### 1. Landing Page (`landing.astro`)

#### Nav
Horizontal, full-width, 60px tall. Logo (left, bold, dark), nav links (Find trainers, How it works), "For trainers →" in orange, "Sign up" dark pill button.

#### Hero — Split (2 columns, desktop)
**Left column:**
- Eyebrow pill: green dot + dynamic trainer count from DB (e.g. "500+ verified trainers in Dubai")
- H1: `Find your perfect *personal trainer*` — italic serif (`em` tag, Georgia/Times) for the last phrase
- Subheading: certification/background-check trust message
- CTA row: "Find a trainer" (dark pill) + "Join as trainer →" (orange ghost)
- Social proof: avatar stack (3 initials) + dynamic client/booking count from DB

**Right column:**
- 2×2 stats grid: trainer count (dark featured card), avg rating, market count, "100%" Certified & checked
- Note: all numbers pulled from DB or kept as fixed true facts (market count is always 10 — that's a real product fact, not a metric). Do not hardcode session/client counts unless they come from the database.

**Mobile:** Stack — hero left content top, stats grid hidden (simplified for mobile), CTAs full-width.

#### Featured Trainer Strip
Horizontal scroll of trainer cards beneath hero. Light `#FAFAF9` background band. Cards show: avatar initials, name, specialty + location, star rating + price.

#### How It Works
3-column step grid: Search & filter → Review & message → Book & train. Step numbers in circular badges.

#### Footer CTA
Dark (`#1A1411`) band, centered h2, subtext, "Browse trainers →" white pill button.

---

### 2. Search / Find Page (`find.astro`)

#### Top Bar (sticky)
Height ~56px. Logo left. Centered search input (max-width 480px, `#F5F4F3` background, rounded pill). Result count right. "Sign up" dark pill right.

#### Filter Strip
Below top bar, horizontal. Specialty filters as pills — active = dark fill with ✕, inactive = surface fill, "Verified ✓" = orange pill (trainer credential). Result count shown at right end of strip.

#### Trainer Grid — Desktop
4-column grid on desktop (`≥768px`). Each card:
- Avatar/photo placeholder (initials, `#F5F4F3` bg)
- "✓ Verified" green badge (top-right overlay on avatar)
- Name, location · rating
- Specialty tags (pill pills)
- Price (AED X / session)
- WhatsApp contact button (circle icon, dark)

**Mobile:** 2-column grid, filter pills in horizontal scroll. Existing mobile behavior preserved.

---

### 3. Trainer Dashboard (`dashboard.astro`)

#### Top Nav with Tabs
Height 52px. Logo left. Tab row: Overview (active — dark bottom border, bold), Bookings, Messages (with unread count badge), Packages, Profile, Settings. Right: "View my profile →" in orange + trainer avatar initials circle.

No sidebar. Tabs are the primary navigation.

#### Content Area
Greeting: "Good morning, [Name] 👋" + date + session count.

**Stats Row (4 columns):**
1. Revenue this month — dark featured card (white text), delta in green
2. Bookings — white card
3. Avg rating — white card
4. Profile views — white card

**Two-Column Body:**
- **Left:** Today's sessions list + Tomorrow preview (session rows: green dot for upcoming, gray dot for later, time, client name, specialty + duration). "View all →" link.
- **Right:** Messages widget (unread dot, avatar, name, preview, time) + Profile completion widget (progress bar, checklist with done/todo items).

**Mobile:** Bottom nav bar retained (existing behavior). Tabs collapse to icons. Content stacks single-column.

---

## Implementation Approach

**Approach C — Targeted structure + theme.** Do not rewrite pages from scratch. Do not alter JS event handlers, Supabase queries, or business logic.

Changes per page:
1. Replace dark CSS variable definitions at `:root` or inline `<style>` blocks with the light token set
2. Remove any hardcoded dark colors (`#0a0a0a`, `#111111`, `#f0f0f0`) that bypass variables
3. Add `@media (min-width: 768px)` blocks for desktop layout structure (grid columns, nav tabs, filter strip)
4. Adjust component styles to match design system (border-radius 14px cards, pill buttons, DM Sans, spacing)

**Preserve:**
- All `<script>` blocks
- All Supabase fetch/query logic
- All Astro component imports
- All existing mobile CSS that already works
- URL structures and query parameters

---

## Success Criteria

- All three pages display in light theme (no dark backgrounds) on both mobile and desktop
- Desktop layouts render correctly at 960px+ (4-col grid, tab nav, split hero)
- Orange appears only on the defined trainer-facing elements — not on buttons, filters, or headings
- No regressions in search filtering, booking flow, or dashboard data display
- DM Sans loads and applies across all three pages
- Existing mobile layouts continue to work on 375px viewport
