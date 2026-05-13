# Find Page & Trainer Profile Redesign

**Date:** 2026-05-13
**Goal:** Make the /find page and trainer profile look finished and premium — comparable to hopp.co quality — using real trainer photos and a restrained design language.

---

## Scope

Two pages, two independent changes:

1. **`/find`** — fix FOUC bug, new card design with real photos
2. **`/[slug]`** — full redesign: full-bleed photo background, glass cards, conditional sections, REPs badge

---

## /find Page

### Bug fix: FOUC (skeleton renders as raw text)

`find.astro` line 315 uses JS template literal syntax `${Array(6).fill(0).map(...)}` inside Astro HTML. Astro doesn't process `${}` in templates — it renders as literal text before JS runs. Fix: replace with proper Astro expression `{Array(6).fill(0).map(() => (<div class="skeleton-card">...</div>))}`.

### Page background

`#F0EDE9` warm off-white. White header section at top.

### Header

White background, separated from grid by subtle border.
- Title: "Find a Trainer" — 28px, 700 weight, `#1A1411`
- Search bar: `#F5F4F2` background, rounded 12px, placeholder "Specialty, location…"
- Filter pills below: All / Strength / Running / Yoga / Boxing — active pill is `#1A1411` dark, inactive is white with light border

### Trainer card

Full photo background, face fully visible, gradient only at bottom.

```
card: border-radius 20px, height 230px, overflow hidden
photo: position absolute, inset 0, background-size cover, background-position center top
gradient: linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.55) 75%, rgba(0,0,0,0.82) 100%)
  → face never covered, only bottom strip darkened for text
```

**Card content (minimal):**
- Name: 14px, 600 weight, white — bottom of card
- Specialty + city: 11px, rgba(255,255,255,0.6) — below name
- Nothing else in grid view (no price, no contact button)

**REPs badge:** Top-right corner, only on verified trainers.
```
background: linear-gradient(135deg, #6B2A9A, #2E0A45)
border-radius: 10px, padding: 5px 9px
border: 1px solid rgba(255,255,255,0.12)
box-shadow: 0 2px 12px rgba(80,20,150,0.45)
label: "REPs UAE" — 8px, rgba(255,255,255,0.45)
number: Share Tech Mono font, 10px, e.g. "REP·4821"
  text-shadow: 0 0 6px rgba(200,150,255,0.4)
```
Absent on unverified trainers.

**No photo state:** Colored avatar — circle with initials, color derived from name hash. No photo placeholder.

### Card data

Current fetch uses anon key directly to Supabase REST. Keep as-is — only change is visual. `renderGrid()` builds card HTML from existing trainer data.

---

## Trainer Profile Page (`/[slug].astro`)

### Core principle

Entire page is dark. The trainer's photo IS the page. Glass cards float on top. No separate light body section. Sections only render if they have data.

### Background

```
if avatar_url exists:
  full-bleed photo, position center top, object-fit cover
  overlay: linear-gradient(to bottom,
    rgba(0,0,0,0.15) 0%,
    rgba(0,0,0,0.10) 30%,
    rgba(0,0,0,0.55) 60%,
    rgba(0,0,0,0.88) 100%
  )

if no avatar_url:
  dark gradient: linear-gradient(160deg, #1c2340, #0f1018, #1a1008)
  + radial glows for depth (blue top-left, warm amber bottom-right)
```

### REPs badge — upper right, replaces current small pill

Position: `top: 58px, right: 16px` — next to back button row.

```
background: linear-gradient(145deg, #6B2A9A 0%, #3E0F60 55%, #1E0530 100%)
border-radius: 14px, padding: 8px 12px 7px
border: 1px solid rgba(255,255,255,0.1)
box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 20px rgba(80,20,150,0.5)

Contents:
- Label: "REPs UAE" — 9px, rgba(255,255,255,0.45)
- Number: Share Tech Mono, 17px, e.g. "REP·4821"
  text-shadow: 0 0 8px rgba(200,150,255,0.4)
- Dot row: 5 dots, 3px each, first 3 active (white 65%), last 2 dim (white 22%)
  → represents Level 3 visually
```

Only rendered if `trainer.reps_verified === true`.

### Name block — direct on background, no card

```
font-size: 36px, font-weight: 300, color: #fff
letter-spacing: -0.02em, line-height: 1.05
text-shadow: 0 2px 20px rgba(0,0,0,0.5)
```

Subtitle: `trainer.title + " · " + trainer.city` — 13px, rgba(255,255,255,0.45), 300 weight

Specialty tags: glass pills
```
background: rgba(0,0,0,0.35), backdrop-filter: blur(12px)
border: 1px solid rgba(255,255,255,0.12)
color: rgba(255,255,255,0.7), 11px, padding: 5px 12px, border-radius: 20px
```

### Glass card spec (all cards below use this)

```
background: rgba(255,255,255,0.08)
backdrop-filter: blur(28px)
border: 1px solid rgba(255,255,255,0.12)
border-radius: 18px
```

### Section: WhatsApp CTA (always shown if whatsapp exists)

Full width, 15px padding, centered.
WhatsApp icon + "Message on WhatsApp" — 14px, 400 weight, white.

### Section: Sessions (only if packages_count > 0)

Section label: "SESSIONS" — 10px, 700, rgba(255,255,255,0.3), letter-spacing 0.08em, uppercase.

Per package row:
- Name: 14px, white, 400 weight
- Meta: "60 min · in-person" — 11px, rgba(255,255,255,0.3)
- Price: 15px, white, 500 weight
- Book button: rgba(255,255,255,0.12) bg, border rgba(255,255,255,0.16), 11px, 600 weight

### Section: About (only if bio exists and bio.length > 20)

Section label: "ABOUT" — same spec as Sessions label.
Bio text: 13px, rgba(255,255,255,0.55), line-height 1.7, 300 weight.

### Sections that no longer render

Remove: stats bar (years_experience, clients_trained, avg_rating), gallery, reviews section, bottom nav tabs. These were "features for trainers" that made the page feel like an admin dashboard. The profile is now a client-facing card only.

Keep: back button, share button (top controls), compact header on scroll (existing).

---

## Files Changed

| File | Change |
|------|--------|
| `src/pages/find.astro` | Fix FOUC skeleton bug; new card HTML in `trainerCardHTML()`; page bg `#F0EDE9`; white header; REPs badge on verified |
| `src/pages/[slug].astro` | Full redesign of CSS and HTML: full-bleed bg, glass cards, conditional sections, REPs badge, remove stats/gallery/reviews/nav |

---

## No-Photo Fallbacks

**Find card:** Colored avatar circle (initials, color from name hash). No gray box.

**Profile page:** Dark atmospheric gradient background. Name and tags still render. WhatsApp + sessions + bio show if data exists. Looks intentionally dark, not broken.

---

## Out of Scope

- Search functionality changes
- Pagination / load more
- Review section redesign
- Gallery redesign
- Stats section redesign
- Any backend changes
