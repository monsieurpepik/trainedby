# TrainedBy Visual Identity — Premium Brand Redesign

**Approved:** 2026-05-01  
**Direction:** Equinox / Net-a-Porter / Nike tier — restraint as luxury  
**Design lock:** The arc-final.html mockup is the canonical reference

---

## Design Philosophy

Premium is silence. The brand statement is a single orange arc that rises from nothing, builds in intensity, and detonates at its peak — then everything else is quiet. The black earns the orange. Nothing competes with the arc.

**The rule:** if you're adding something, ask whether it earns its place against the silence. Most things don't. Remove them.

---

## Color Tokens

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#0A0A0A` | All backgrounds. Never deviate. |
| `--color-accent` | `#D4622A` | Arc, burst, separator line, price, active chip, CTA background |
| `--color-text-primary` | `#FAFAFA` | Trainer names, stat values, headline copy |
| `--color-text-muted` | `rgba(255,255,255,0.22)` | Certifications, stat labels, secondary copy |
| `--color-text-ghost` | `rgba(255,255,255,0.14)` | Brand wordmark, overline labels |
| `--color-surface-card` | `rgba(255,255,255,0.04)` | List row cards in browse |
| `--color-border-card` | `rgba(255,255,255,0.07)` | Card borders |
| `--color-border-subtle` | `rgba(255,255,255,0.06)` | Stats grid dividers |
| `--color-avatar-bg` | `rgba(212,98,42,0.08)` | Avatar circle fill (card view) |
| `--color-avatar-border` | `rgba(212,98,42,0.25)` | Avatar circle border (card view) |
| `--color-avatar-bg-list` | `rgba(212,98,42,0.10)` | Avatar circle fill (list view) |
| `--color-avatar-border-list` | `rgba(212,98,42,0.28)` | Avatar circle border (list view) |
| `--color-chip-bg` | `rgba(255,255,255,0.05)` | Inactive filter chip background |
| `--color-chip-border` | `rgba(255,255,255,0.08)` | Inactive filter chip border |
| `--color-chip-text` | `rgba(255,255,255,0.38)` | Inactive filter chip text |
| `--color-location-bg` | `rgba(255,255,255,0.05)` | Location pill background |
| `--color-location-border` | `rgba(255,255,255,0.09)` | Location pill border |
| `--color-location-text` | `rgba(255,255,255,0.45)` | Location pill text |
| `--color-inner-bite` | `rgba(10,10,10,0.58)` | Arc inner bite stroke (trainer card) |
| `--color-inner-bite-browse` | `rgba(10,10,10,0.55)` | Arc inner bite stroke (browse header) |

### Tailwind Config Change Required

Current `brand: '#FF5C00'` must be updated to `#D4622A`.

### Where orange appears — exhaustive list

- Arc gradient (building from transparent to full orange)
- Burst detonation circles
- 32px horizontal separator line under trainer name
- Price stat value in the 3-column stats grid
- Active filter chip: background `#D4622A`, text `#0A0A0A`
- CTA button: background `#D4622A`, text `#0A0A0A`
- CTA arrow circle in list rows: background `#D4622A`
- Avatar initials text color
- Avatar circle border (low opacity)

### Where orange never appears

Never as a page background (except CTA pill and active chip). Never as a text color on dark backgrounds except avatar initials. Never in gradients unrelated to the arc. No orange glow behind cards. No orange shadows on typography.

---

## Typography

### Display / Trainer Names

```css
font-family: Georgia, 'Times New Roman', serif;
font-style: italic;
font-weight: 700;
letter-spacing: -0.015em;
line-height: 1.05;
color: #FAFAFA;
```

**Usage:** Trainer names only — the large display on cards, and the 16px inline name in list rows. The serif italic is the premium brand signal for human names. It is NOT used for UI labels, headlines, or navigation.

**Font size — trainer card:** `36px` (card view name)  
**Font size — list row:** `16px`

### UI / All Other Text

```css
font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
```

Used for: overlines, stats, certifications, CTAs, filter chips, location pills, page headlines, subheads. Everything except trainer names.

### Typography Scale

| Element | Size | Weight | Transform | Color |
|---|---|---|---|---|
| Brand wordmark | 9px | 700 | uppercase, 0.2em spacing | `rgba(255,255,255,0.14)` |
| Overline / specialty | 10px | 600 | uppercase, 0.16em spacing | `rgba(255,255,255,0.22)` |
| Certifications / meta | 12px | 400 | none | `rgba(255,255,255,0.24)` |
| Stat value | 22px | 800 | none, -0.02em tracking | `#FAFAFA` (price: `#D4622A`) |
| Stat label | 9px | 400 | uppercase, 0.1em spacing | `rgba(255,255,255,0.22)` |
| Page headline | 32px | 900 | none, -0.03em tracking | `#FAFAFA` |
| Page subhead | 12px | 400 | none | `rgba(255,255,255,0.25)` |
| Filter chip | 10px | 700 (active) / 600 (inactive) | uppercase, 0.06em spacing | see chip tokens |
| CTA button | 12px | 800 | uppercase, 0.1em spacing | `#0A0A0A` |
| Location pill | 10px | 700 | uppercase, 0.08em spacing | `rgba(255,255,255,0.45)` |
| List row secondary | 10px | 400 | none | `rgba(255,255,255,0.24)` |

---

## The Arc Component

The arc is the sole brand element. It appears as an SVG overlay on any dark-background hero region. It has exactly one form: starts invisible at the bottom-left, builds in intensity diagonally, detonates in a tight orange burst at the top-right.

### Arc — Trainer Card (390×320 viewBox)

**Geometry:**
```
M -30 320 Q 100 240 195 155 Q 295 65 400 18
```

**Four-layer stack (render in this order):**

```xml
<!-- Layer 1: Stencil mass — gradient invisible → full orange -->
<path d="M -30 320 Q 100 240 195 155 Q 295 65 400 18"
      stroke="url(#arc-gradient)"
      stroke-width="64"
      fill="none"
      stroke-linecap="butt"/>

<!-- Layer 2: Inner dark bite — carves hollow through the stencil -->
<path d="M -30 320 Q 100 240 195 155 Q 295 65 400 18"
      stroke="rgba(10,10,10,0.58)"
      stroke-width="38"
      fill="none"
      stroke-linecap="butt"/>

<!-- Layer 3: Hairline — surgical precision edge -->
<path d="M -30 320 Q 100 240 195 155 Q 295 65 400 18"
      stroke="url(#arc-hairline)"
      stroke-width="1.6"
      fill="none"
      stroke-linecap="round"/>

<!-- Layer 4: Burst detonation — see burst spec below -->
```

**Gradient — stencil mass:**
```xml
<linearGradient id="arc-gradient" x1="-30" y1="320" x2="400" y2="10"
                gradientUnits="userSpaceOnUse">
  <stop offset="0%"   stop-color="rgba(212,98,42,0.0)"/>
  <stop offset="30%"  stop-color="rgba(212,98,42,0.18)"/>
  <stop offset="65%"  stop-color="rgba(212,98,42,0.58)"/>
  <stop offset="100%" stop-color="#D4622A"/>
</linearGradient>
```

**Gradient — hairline:**
```xml
<linearGradient id="arc-hairline" x1="-30" y1="320" x2="400" y2="10"
                gradientUnits="userSpaceOnUse">
  <stop offset="0%"   stop-color="rgba(212,98,42,0.0)"/>
  <stop offset="35%"  stop-color="rgba(212,98,42,0.45)"/>
  <stop offset="100%" stop-color="rgba(212,98,42,0.90)"/>
</linearGradient>
```

**Critical:** `gradientUnits="userSpaceOnUse"` is required. Percentage-based gradients do not work on stroked paths — they reference the bounding box and produce incorrect results. The x1/y1/x2/y2 coordinates must match the start and approximate end of the path.

### Arc — Browse Header (390×240 viewBox)

**Geometry:**
```
M -40 240 Q 120 160 225 90 Q 330 22 420 -5
```

Proportionally the same arc, scaled for the shorter hero. Stroke widths: mass=60, bite=36 (`rgba(10,10,10,0.55)`), hairline=1.6. Gradient stops same as trainer card but adjusted endpoint: `x2="420" y2="0"`.

---

## Burst Detonation

The burst is a tight controlled explosion from the arc's endpoint at the top-right. Three rings of fragments — core, mid, outer — fade progressively into black. A few sparks escape above the frame edge.

**Detonation point (trainer card):** approximately cx≈372 cy≈24  
**Detonation point (browse):** approximately cx≈380 cy≈16

### Filters

```xml
<filter id="coreglow" x="-100%" y="-100%" width="300%" height="300%">
  <feGaussianBlur stdDeviation="7" result="blur"/>
  <feMerge>
    <feMergeNode in="blur"/>
    <feMergeNode in="SourceGraphic"/>
  </feMerge>
</filter>

<filter id="midspark" x="-80%" y="-80%" width="260%" height="260%">
  <feGaussianBlur stdDeviation="3" result="blur"/>
  <feMerge>
    <feMergeNode in="blur"/>
    <feMergeNode in="SourceGraphic"/>
  </feMerge>
</filter>
```

Browse uses `stdDeviation="6"` and `stdDeviation="2.5"` respectively (slightly tighter).

### Core fragments (filter: coreglow) — 5 circles

```xml
<g filter="url(#coreglow)">
  <circle cx="372" cy="24"  r="12" fill="rgba(212,98,42,0.95)"/>
  <circle cx="354" cy="34"  r="9"  fill="rgba(212,98,42,0.88)"/>
  <circle cx="388" cy="14"  r="8"  fill="rgba(232,120,52,0.90)"/>
  <circle cx="362" cy="10"  r="7"  fill="rgba(212,98,42,0.84)"/>
  <circle cx="385" cy="40"  r="6"  fill="rgba(212,98,42,0.78)"/>
</g>
```

Note: the third fragment uses `rgba(232,120,52,...)` — a warmer, slightly lighter orange — to add luminosity variation at the core.

### Mid sparks (filter: midspark) — 9 circles

```xml
<g filter="url(#midspark)">
  <circle cx="342" cy="18"  r="5"   fill="rgba(212,98,42,0.68)"/>
  <circle cx="360" cy="2"   r="4.5" fill="rgba(212,98,42,0.62)"/>
  <circle cx="395" cy="26"  r="4"   fill="rgba(212,98,42,0.58)"/>
  <circle cx="338" cy="44"  r="4"   fill="rgba(212,98,42,0.52)"/>
  <circle cx="370" cy="50"  r="3.5" fill="rgba(212,98,42,0.48)"/>
  <circle cx="325" cy="30"  r="3"   fill="rgba(212,98,42,0.44)"/>
  <circle cx="348" cy="60"  r="3"   fill="rgba(212,98,42,0.38)"/>
  <circle cx="380" cy="-10" r="3"   fill="rgba(212,98,42,0.50)"/>
  <circle cx="400" cy="48"  r="2.5" fill="rgba(212,98,42,0.36)"/>
</g>
```

### Outer fragments (no filter) — 8 circles fading to black

```xml
<circle cx="310" cy="42" r="2.5" fill="rgba(212,98,42,0.28)"/>
<circle cx="325" cy="58" r="2"   fill="rgba(212,98,42,0.22)"/>
<circle cx="338" cy="72" r="2"   fill="rgba(212,98,42,0.18)"/>
<circle cx="300" cy="56" r="1.5" fill="rgba(212,98,42,0.16)"/>
<circle cx="315" cy="74" r="1.5" fill="rgba(212,98,42,0.12)"/>
<circle cx="292" cy="70" r="1.5" fill="rgba(212,98,42,0.10)"/>
<circle cx="330" cy="86" r="1"   fill="rgba(212,98,42,0.09)"/>
<circle cx="280" cy="80" r="1"   fill="rgba(212,98,42,0.07)"/>
```

### Above-frame sparks — 3 circles

```xml
<circle cx="368" cy="-16" r="2.5" fill="rgba(212,98,42,0.38)"/>
<circle cx="382" cy="-28" r="1.5" fill="rgba(212,98,42,0.24)"/>
<circle cx="355" cy="-24" r="1.5" fill="rgba(212,98,42,0.18)"/>
```

These bleed past the `overflow:hidden` boundary into true off-screen territory, making the burst feel larger than the containing element.

---

## Component Anatomy

### Trainer Card

Container: `background:#0A0A0A; border-radius:24px; overflow:hidden`

**Hero region** (320px tall):
- `position:relative; height:320px; background:#0A0A0A; overflow:hidden`
- Arc SVG: `position:absolute; inset:0; width:100%; height:100%`
- Avatar: `position:absolute; bottom:24px; left:24px` — 72px circle, rgba(212,98,42,0.08) fill, rgba(212,98,42,0.25) 1.5px border. Initials in #D4622A at 22px weight-800
- Brand wordmark: `position:absolute; top:22px; left:22px` — "TrainedBy" in ghost text
- Location pill: `position:absolute; top:22px; right:22px` — glass pill with backdrop-filter:blur(12px)

**Content region** (padding:24px):
- Specialty overline → trainer name (Georgia italic 36px) → 32×1.5px orange separator line → certifications/years
- Stats grid: 3-col, `border:1px solid rgba(255,255,255,0.06); border-radius:14px; overflow:hidden`. Each cell `border-right:1px solid rgba(255,255,255,0.06)`. Price cell: no right border.
- CTA: `background:#D4622A; color:#0A0A0A; border-radius:100px; padding:16px; font-weight:800; letter-spacing:0.1em; text-transform:uppercase`

### Browse Header

Container: `position:relative; height:240px; background:#0A0A0A; overflow:hidden`

- Arc SVG: `position:absolute; inset:0`
- Text overlay: `position:absolute; inset:0; padding:28px 24px`
  - Brand line: "TrainedBy · Dubai" in ghost text
  - Headline: "Find your trainer." — 32px weight-900 -apple-system
  - Subhead: trainer count in muted text

### Filter Chips

```
Active:   background:#D4622A, color:#0A0A0A, font-weight:700
Inactive: background:rgba(255,255,255,0.05), border:1px solid rgba(255,255,255,0.08),
          color:rgba(255,255,255,0.38), font-weight:600
Both:     border-radius:100px; padding:8px 16px; font-size:10px;
          letter-spacing:0.06em; text-transform:uppercase; font-family:-apple-system
```

### List Row (Browse)

```
background:rgba(255,255,255,0.04)
border:1px solid rgba(255,255,255,0.07)
border-radius:16px
padding:16px
display:flex; gap:14px; align-items:center
```

- Avatar: 48px circle, rgba(212,98,42,0.10) fill, rgba(212,98,42,0.28) 1.5px border, initials in #D4622A weight-800 14px
- Name: Georgia italic 16px -0.01em tracking, #FAFAFA
- Secondary: "Strength · 4.9★ · AED 350" — 10px rgba(255,255,255,0.24)
- Chevron button: 34px circle, background:#D4622A, chevron SVG `stroke:#0A0A0A stroke-width:2.5`

---

## Implementation Changes

### 1. Tailwind config (`tailwind.config.js`)

- Update `brand: '#FF5C00'` → `brand: '#D4622A'`
- Add Georgia to the font stack. Add a `display` font key:
  ```js
  fontFamily: {
    display: ['Georgia', 'Times New Roman', 'serif'],
    // ... existing fonts
  }
  ```

### 2. ArcHeader Astro component (`src/components/ArcHeader.astro`)

New reusable component. Props:
- `variant: 'card' | 'browse'` — controls viewBox, path geometry, and burst coordinates
- `class?: string` — passthrough for positioning

Renders the full SVG (defs + paths + burst circles) in a `position:absolute inset-0 w-full h-full` wrapper. No JavaScript. Pure SVG.

### 3. find.astro — Browse page

Replace current hero region with ArcHeader variant="browse". Update:
- Filter chips to new chip spec
- Trainer list rows to new list row spec
- All color values to new tokens

### 4. [slug].astro — Trainer profile

The SSR profile page renders trainer data server-side. Update the hero region to use ArcHeader variant="card". Update:
- Avatar to new spec (orange border, initials style)
- Trainer name to Georgia italic
- Stats grid to new spec
- CTA to new pill spec

---

## What Does Not Change

- Astro SSR architecture — no structural changes
- Supabase data fetching — no changes to queries or edge functions
- `surface: '#0a0a0a'` Tailwind token — already correct
- Market config — no changes
- All data remains real from database (no fake numbers)

---

## Anti-Patterns

These are explicitly prohibited by this design system:

- Starfields, particle systems, or random dot patterns on any background
- Radial gradients spreading orange across the background
- Glow halos behind cards or sections
- Orange text on dark backgrounds (except avatar initials and price stat)
- Orange borders on non-avatar elements
- Arc appearing on any surface other than hero regions
- Multiple arc elements on the same page
- Scale transforms on hover (layout shift)
- Emoji used as icons anywhere in the UI
