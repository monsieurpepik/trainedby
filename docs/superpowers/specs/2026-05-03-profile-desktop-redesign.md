# Profile Page — Desktop Redesign

> **Problem:** The desktop layout of `src/pages/profile.astro` feels like a stretched mobile page. The two-column sticky sidebar approach (360–400px left col, flex-right col) never achieves native desktop proportions — content is narrow, whitespace is wrong, and the photo background is wasted as a texture.

**Goal:** Replace the desktop layout with a full-bleed hero + content grid that feels native to wide screens without changing the mobile layout at all.

**Scope:** CSS-only changes inside `src/pages/profile.astro`. No new components, no data model changes, no mobile changes.

---

## Design

### Hero Banner (desktop only, `min-width: 768px`)

- **Height:** 300px
- **Background:** the existing fixed `#bg` element (full-bleed gym photo + scrim) provides the atmosphere — the hero panel itself is transparent, letting `#bg` show through
- **Layout:** `position: relative`, `display: flex`, `align-items: flex-end`, `justify-content: space-between`, `padding: 0 48px 36px`
- **Left anchor — trainer identity:**
  - Avatar: 88px circle, `border: 3px solid rgba(255,255,255,0.4)`, `border-radius: 50%`
  - Trainer name: 32px, weight 800, white, `letter-spacing: -0.5px`
  - Cert badge + "Verified" tick: existing badge component, white-tinted variant
  - Meta row: location · years experience — 13px, `rgba(255,255,255,0.65)`
- **Right anchor — CTAs:**
  - Vertical stack, min-width 190px
  - Primary: "Book a Session" — `var(--brand)` background, white text, 13px bold
  - Secondary: "Message [name]" — `rgba(255,255,255,0.15)` background, white text, 1px white/20 border
- **Transition to white:** a short gradient at the bottom of the hero (`rgba(255,255,255,0)` → `var(--bg)`) bridges the dark photo into the white content area below

### Content Shelf (desktop only, `min-width: 768px`)

- **Background:** `var(--bg)` (white) — no longer dark
- **Padding:** `40px 48px 64px`
- **Layout:** CSS Grid, `grid-template-columns: 1fr 1fr 1fr`, `gap: 20px`
- **Card style:** same as current — `var(--surface)` background, `var(--border)` border, `border-radius: 10px`, `padding: 20px`
- **Column spans:**
  | Card | Span |
  |------|------|
  | Packages | 2 columns |
  | Specialties | 1 column |
  | About / Bio | 2 columns |
  | Certifications | 1 column |
- Packages go first (primary conversion element). Bio and certifications follow.
- Within the Packages card, packages render as a 2-col inner grid (same as current mobile card, just inside a wider container)

### Mobile (unchanged)

The existing mobile layout (`< 768px`) is untouched. The centered hero, stacked CTAs, and accordion sections remain exactly as they are.

### What gets removed

The current `@media (min-width: 768px)` two-column sticky sidebar rules:
```css
/* REMOVED */
#page { flex-direction: row; max-width: 1120px; }
#left-col { width: 360px; position: sticky; top: 80px; }
#right-col { flex: 1; padding-left: 40px; }
```

These are replaced entirely by the hero + grid approach above.

---

## HTML Structure Changes

The current HTML has:
```html
<div id="page">
  <div id="left-col"><!-- hero + CTAs + socials --></div>
  <div id="right-col"><!-- sections accordion --></div>
</div>
```

On desktop, `#left-col` and `#right-col` become meaningless wrappers. The new structure promotes the hero to its own full-width element and the sections into the grid:

```html
<div id="profile-hero">           <!-- full-width hero banner, desktop only -->
  <div id="hero-identity">        <!-- left: avatar + name + cert + meta -->
  <div id="hero-ctas">            <!-- right: Book + Message buttons -->
</div>
<div id="profile-grid">           <!-- 3-col CSS grid on desktop, 1-col on mobile -->
  <!-- individual section cards -->
</div>
```

The existing `#left-col` / `#right-col` / `#page` wrapper IDs are removed. Mobile layout is driven by `#profile-grid` defaulting to single-column.

---

## Success Criteria

- [ ] Desktop (≥768px): hero banner is full-width, 300px tall, with identity bottom-left and CTAs bottom-right
- [ ] Desktop: content below hero uses 3-column grid with correct card spans
- [ ] Desktop: content area background is white (`var(--bg)`), cards use `var(--surface)` — no dark theme
- [ ] Desktop: transition from dark photo hero to white content area is smooth (gradient bridge)
- [ ] Mobile (<768px): layout is pixel-identical to before — no regression
- [ ] Zero JS changes — CSS only
- [ ] No new files — all changes in `src/pages/profile.astro`
