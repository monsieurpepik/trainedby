# TrainedBy — Trainer Profile Page Design

**Date:** 2026-05-02  
**Status:** Approved — ready for implementation planning  
**Brainstorm files:** `.superpowers/brainstorm/60803-1777703023/content/` (01–12)

---

## Goal

Design a trainer profile page that feels like a premium native iOS experience — not a fitness app template. The trainer's photo is the product. The UI is a clean, neutral frame that gets out of the way.

Inspired by Hopp (hopp.co): photo owns the atmosphere, one charcoal CTA, everything else neutral.

---

## Design Principles

1. **Photo = presence.** No circle crop, no ring, no frame. The trainer's photo fills the top of the screen. This is what clients are buying.
2. **UI is a neutral tool.** No brand colour imposed on every element. The interface is white + near-black. The photo provides personality.
3. **One action, clearly.** A single charcoal "Book a Session" button. No competing CTAs fighting for attention.
4. **Name is the product.** Large, light-weight, the first thing you read after the photo. No "Verified Professional Trainer" badge above it.
5. **Menu-style hierarchy.** Packages read like a restaurant menu — name, detail, price, hairline separator. No SaaS pricing cards.

---

## Typography

**Font:** DM Sans (Google Fonts, `opsz 9..40`)

| Role | Weight | Size | Letter-spacing |
|---|---|---|---|
| Trainer name (hero) | 200 | 36px | 0.02em |
| Section heading | 600 | 10px | 0.13em, uppercase |
| Body / description | 300 | 13.5px | 0 |
| Package name | 400 | 14px | 0 |
| Package detail | 300 | 11px | 0 |
| Price | 300 | 14px | -0.01em |
| Tag / pill | 500 | 10.5px | 0.07em, uppercase |
| Button | 500 | 14px | 0.04em |
| Stat number | 200 | 22px | -0.02em |
| Stat label | 500 | 9.5px | 0.09em, uppercase |

No Georgia. No serif anywhere.

---

## Colour System

**Palette: Charcoal neutral — no brand colour in the UI chrome**

| Token | Value | Usage |
|---|---|---|
| `--text-primary` | `#111111` | Names, prices, body copy |
| `--text-secondary` | `#6B6460` | Sub-labels, tagline, location |
| `--text-muted` | `#A8A09A` | Section labels, package detail |
| `--text-faint` | `#B8B0AA` | Stat labels, rating count |
| `--bg-white` | `#FFFFFF` | Content area background |
| `--border` | `rgba(0,0,0,0.055)` | Section dividers, package rows |
| `--btn-primary-bg` | `#1A1411` | Book a Session button |
| `--btn-primary-text` | `#FFFFFF` | Button label |
| `--btn-secondary-border` | `rgba(0,0,0,0.10)` | Ghost button border |
| `--btn-secondary-text` | `#7A7068` | Ghost button label |
| `--tag-bg` | `rgba(0,0,0,0.05)` | Specialty pill background |
| `--tag-text` | `#6B6460` | Specialty pill text |
| `--review-card-bg` | `#F8F7F5` | Review card background |

**No terracotta, no orange, no green accent in the trainer profile UI.** The trainer's photo provides all colour.

---

## Page Structure

The page is a single vertical scroll. Sections in order:

### 1. Hero (460px, full-bleed)

- Trainer photo fills the entire width and 460px height. No border radius. No crop. Edge to edge, top to bottom. `object-fit: cover; object-position: top center` — ensures the trainer's face and upper body are always visible regardless of photo orientation.
- **Status bar** lives inside the hero (light text on dark photo). Signal, wifi, battery.
- **Back button** — 36×36px frosted glass circle, top-left (58px from top). Chevron left icon.
- **Share button** — 36×36px frosted glass circle, top-right (58px from top). Share icon.
- **Hero fade** — gradient at the bottom of the photo section: `transparent → white` over 220px. Creates a smooth visual bleed into the white content below.
- **Name block** — positioned at `bottom: 20px, left: 28px`. Trainer first and last name (may wrap to two lines on long names; weight 200, 36px). Specialty + city in weight 300, 13px, `--text-secondary` below.

**Photo source:** `trainer.profile_photo_url` from Supabase. The photo gradient/atmosphere is not generated — it comes entirely from the trainer's real photo.

**Photo fallback:** If `profile_photo_url` is null, render a dark gradient placeholder (`linear-gradient(168deg, #18191C, #272A30)`) with no name overlay visible — trainer must upload a photo to have a public profile. Prompt shown in trainer dashboard.

**Sticky compact header:** When user scrolls past the hero, a sticky header appears at the top: back button (left), trainer name (center, 15px weight 400), share button (right). Frosted glass background. This replaces the hero status context.

---

### 2. Identity Strip

Full-width row below the hero. Contains:
- Specialty tags (pills): up to 4, from `trainer.specialties[]`. Style: `rgba(0,0,0,0.05)` background, `#6B6460` text, 10.5px uppercase 500.
- Location: right-aligned, pin icon + neighbourhood name (e.g. "JLT"). From `trainer.location_district`.
- Bottom border: `1px solid rgba(0,0,0,0.055)`.

---

### 3. Stats Row

4 stats in equal columns, separated by `1px solid rgba(0,0,0,0.06)` vertical hairlines.

| Stat | Source | Format |
|---|---|---|
| Years experience | `trainer.years_experience` | `8` (integer) |
| Goal rate | `trainer.goal_achievement_rate` | `94%` |
| Total clients | `trainer.total_clients` | `340` |
| Average rating | `trainer.average_rating` | `4.9` |

Stat number: weight 200, 22px, `#111`. Label: weight 500, 9.5px, uppercase, `#B8B0AA`.

Do not fabricate these numbers. If a stat is unavailable (null or 0), hide that column entirely — remaining stats share equal width. A trainer with no reviews yet shows 3 stats, not 4.

---

### 4. CTA Block

Padding: 20px 24px 16px.

**Primary button:** "Book a Session"  
- Full width, 52px height, 13px border radius  
- Background: `#1A1411`, text: `#fff`, weight 500  
- Left icon: calendar SVG at 16×16, `rgba(255,255,255,0.65)`  
- Box shadow: `0 4px 20px rgba(0,0,0,0.20)`  

**Secondary button:** "Send a message"  
- Full width, 46px height, 13px border radius  
- Background: transparent, border: `1px solid rgba(0,0,0,0.10)`, text: `#7A7068`, weight 300  

---

### 5. Packages — Carousel Cards

**Layout:** Horizontally scrollable carousel. Cards snap. Overflow hidden on the phone frame, last card peeks to signal scrollability.

**Card spec:**
- Width: 240px, height: auto (~140px)
- Background: `#FFFFFF`, border: `1px solid rgba(0,0,0,0.07)`, border-radius: 14px
- Box shadow: `0 2px 12px rgba(0,0,0,0.06)`
- Padding: 18px 20px

**Card content:**
- Package name: 15px weight 400, `#111`
- Package detail (duration, location): 11px weight 300, `#A8A09A`
- Price: 20px weight 200, `#111`, letter-spacing -0.02em — bottom of card
- "Book" button inside card: 100% width, 36px, `#1A1411` background, `#fff` text, 8px radius, 12px weight 500

**Section header:** "Sessions" label (10px 600 uppercase `#B8B0AA`) + "See all →" link (12px 400 `#9A9290`), above the carousel.

**Data source:** `packages` table filtered by `trainer_id`. Ordered by `price ASC`. Maximum 6 cards in carousel. If trainer has 0 packages, hide the entire Packages section — do not show an empty carousel.

---

### 6. About

- Section label: "About" (uppercase, muted)
- Body text: weight 300, 13.5px, `#4A4440`, line-height 1.68
- Truncated to ~3 lines with "Read more →" in `#9A9290` weight 400
- Source: `trainer.bio`

---

### 7. Reviews

**Rating summary row:**
- Large rating number: weight 200, 32px, `#111`
- 5 stars (filled `#1A1411`) + review count ("from 47 verified clients")

**Review cards:** `#F8F7F5` background, 12px border-radius, 16px 18px padding.  
Each card: stars row → review text (13px weight 300, `#4A4440`, line-height 1.6) → reviewer row (avatar circle + name + date).

Show 2 most recent cards inline. Review count in the "See all" link comes from `COUNT(reviews WHERE trainer_id = X AND booking_id IS NOT NULL)`. If 0 reviews, hide the entire Reviews section.

**Data source:** `reviews` table, `trainer_id`, ordered by `created_at DESC`. Only verified client reviews (booking-linked).

---

### 8. Bottom Navigation

Sticky at bottom, 84px height. Frosted glass (`rgba(255,255,255,0.95)`, blur 12px). Top border `1px solid rgba(0,0,0,0.07)`.

5 items: Discover, Search, Bookings, Messages, Profile.  
Active item: `#1A1411` icon + label. Inactive: `#C8C0BA`.  
Icons: 24×24 Heroicons outline, stroke-width 1.6, stroke-linecap round.

---

## Interaction Patterns

**Hero scroll behaviour:**
- Hero photo stays full-bleed while it's in view
- As user scrolls past hero, sticky compact header fades in (opacity transition, 200ms)
- Photo does not parallax (avoid motion sickness; keep it native-simple)

**Package carousel:**
- Horizontal scroll, `scroll-snap-type: x mandatory`
- Cards snap to left edge
- Last card partially visible (peek: 24px) to signal more
- No dots/pagination indicator — keep it clean

**Book a Session CTA:**
- Taps open the booking flow (date picker → time → confirm)
- During async: button shows loading spinner, stays disabled

**Read more (bio):**
- Inline expand — text unfolds in place, no new screen
- "Read less" appears after expansion

---

## Multi-Market Considerations

- **Currency:** Displayed from `trainer.currency` (AED, EUR, GBP, etc.). Never hardcoded.
- **Language:** All static labels (section headers, button text) come from i18n strings. The profile page exists in all 4 languages (EN, FR, IT, ES).
- **Payment availability:** If `market.paymentEnabled === false`, the "Book a Session" button is replaced by "Request a Session" (waitlist flow). The packages section still shows pricing.
- **Certification body:** Not shown on the profile page — certification is implicit in the TrainedBy verified badge (small checkmark near location, no label text).

---

## What This Is NOT

- Not a circle avatar + ring design
- Not a dark background with orange/terracotta accents
- Not a SaaS pricing grid for packages
- Not cluttered with social proof badges on the hero
- Not a link-in-bio (this is a bookable service page, not a redirect list)

---

## Reference Files

All mockups at `http://localhost:60031/` during brainstorming:

| File | Description |
|---|---|
| `10-hopp.html` | Structural exploration — Hopp pattern |
| `11-accents.html` | Colour system decision — A/B/C test |
| `12-final.html` | ✅ **Approved final design** — above fold + scrolled state |
