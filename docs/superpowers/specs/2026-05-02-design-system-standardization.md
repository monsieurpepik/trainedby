# Design System Standardization — TrainedBy

**Date:** 2026-05-02  
**Status:** Approved  

---

## Goal

Establish a single, consistent design language across every page of TrainedBy. Eliminate hardcoded hex values, duplicate token definitions, theme contradictions, and font inconsistencies. Pages should feel like one product, not a patchwork of independent implementations.

---

## Context & Problem

The codebase has accumulated significant design debt:

- **Two brand oranges:** `#FF5C00` (intentional) and `#D4622A` (accidental Base.astro default) coexist
- **Theme flip mid-funnel:** Landing is light; for-trainers, join, pricing, and blog are dark — a jarring break in the user journey
- **Standalone pages:** `my-bookings` and `book/[slug]` emit raw `<!DOCTYPE html>` — no shared layout, missing fonts, meta tags, OG, and view transitions
- **Nav fragmentation:** `Nav.astro` exists with 3 variants but most pages ignore it and write their own inline nav — 6+ files to update for any nav change
- **Semantically inverted tokens:** Several pages set `--surface: #0a0a0a` (darker than `--bg`) — the token name means the opposite of what it does
- **Hardcoded hex everywhere:** Token system exists but is bypassed on most pages

---

## Decisions

| Question | Answer |
|---|---|
| Trainer funnel theme (for-trainers, join, pricing) | Light |
| Blog theme | Light |
| Canonical brand orange | `#FF5C00` |
| Standalone pages layout | New `BaseMinimal.astro` (head-only, no nav) |
| Navigation strategy | Consolidate into `Nav.astro` variants |
| Profile page (`[slug].astro`) | Light/white (confirmed) |

---

## Design System Tokens

### Dark theme (Base.astro `:root` defaults — unchanged for app pages)
```css
:root {
  --bg: #0a0a0a;
  --surface: #111111;
  --surface-2: #1a1a1a;
  --surface-3: #222222;
  --text: #f0f0f0;
  --text-muted: rgba(240,240,240,0.5);
  --border: rgba(255,255,255,0.08);
  --brand: #FF5C00;  /* FIXED: was #D4622A */
  --green: #22c55e;
  --font-display: 'DM Sans', sans-serif;
  --font-body: 'DM Sans', sans-serif;
}
```

### Light theme override (injected via `<Fragment slot="head">` on marketing/consumer pages)
```css
:root {
  --bg: #FFFFFF;
  --surface: #FAFAF9;
  --surface-2: #F5F4F3;
  --surface-3: #E8E5E2;
  --text: #1A1411;
  --text-muted: #6B6460;
  --border: rgba(0,0,0,0.07);
  --brand: #FF5C00;
}
```

### Rules
- No hardcoded hex colors in component or page styles. Everything goes through the token system.
- If a color isn't in the token set, it doesn't exist.
- Local `:root` overrides that duplicate Base.astro values are deleted.

---

## Architecture

### Phase 1: Foundation

**`src/layouts/Base.astro`**
- Fix `--brand` default: `#D4622A` → `#FF5C00`
- Ensure all other dark tokens match the table above
- No other structural changes

**`src/layouts/BaseMinimal.astro`** (new file)
- Identical `<head>` to Base.astro: DM Sans font preload, meta charset/viewport, OG tags, view transitions, cookie consent
- No `<nav>`, no `<footer>`, no cookie banner in `<body>`
- Single `<slot />` for page content
- Accepts `title` and `description` props

**`src/components/Nav.astro`** (extend existing)
- `variant="landing"` — logo + links (Find / Stories / Community / For Trainers) + "Create your profile →" CTA. Used by: for-trainers, join, pricing.
- `variant="consumer"` — same links + "Find Your Trainer →" CTA. Used by: landing, blog, find, find/[city].
- `variant="minimal"` — logo only, no links. Used by: my-bookings, book/[slug] (if a header is needed).
- `variant="app"` — existing header (Edit / View Profile links). Used by: edit.
- Scroll behavior (`.scrolled` class on scroll > 20px) applies to all variants that render `<nav id="nav">`.
- Light/dark nav background: `.nav-sticky { background: color-mix(in srgb, var(--bg, #0a0a0a) 85%, transparent) }` — already implemented, carries forward.

---

### Phase 2: Marketing Funnel Pages

All pages in this phase:
- Inject light theme tokens via `<Fragment slot="head"><style>:root{...}</style></Fragment>`
- Use `Nav.astro` (variant specified per page below)
- Replace all hardcoded hex values with token variables
- Delete any local `:root` overrides that fight Base.astro

| Page | Nav variant | Notes |
|---|---|---|
| `/for-trainers` | `landing` | Dark-pill CTAs (`background: var(--text); color: var(--bg)`) |
| `/join` | `landing` | Form inputs: `background: var(--surface-2); border: 1px solid var(--border)` |
| `/pricing` | `landing` | Delete inverted local tokens. Recommended tier: `--brand` accent |
| `/blog` | `consumer` | Article cards on `--surface-2` |
| `/find` | `consumer` | Fix `--surface2` typo → `--surface-2` |
| `/find/[city]` | `consumer` | Align to light tokens, same as `/find` |

---

### Phase 3: App Pages

App pages stay dark. Goal: token consistency, not theme change.

| Page | Changes |
|---|---|
| `/edit` | Delete local `--surface: #0a0a0a` override (inverted). Inherit Base.astro defaults. |
| `/dashboard` | Replace hardcoded hex with tokens. No structural change. |
| `/admin` | Delete local `--brand: #FF5C00` override (now redundant). Inherit Base.astro. |
| `/superadmin` | Same as admin. |
| `/404` | Currently zero tokens. Full token migration to dark theme. Keep Base.astro layout. |

### Phase 3b: Profile Pages (Light/White)

| Page | Changes |
|---|---|
| `/profile` (`[slug].astro`) | Replace hardcoded hex (`#1A1411`, `#6B6460`, `#FF5C00`) with token equivalents (`--text`, `--text-muted`, `--brand`). Inject light tokens. Already light structurally. |
| `profile.astro` | Align to light tokens. |

---

### Phase 4: Standalone Pages

Both pages migrate from raw `<!DOCTYPE html>` to `BaseMinimal.astro`.

| Page | Theme | Header | Notes |
|---|---|---|---|
| `/my-bookings` | Light | None (magic-link arrival, no nav needed) | Replace all hardcoded dark hex with light tokens |
| `/book/[slug]` | Light | Logo only (`Nav.astro variant="minimal"`) | Client is mid-purchase — no nav links |

---

## Component Inventory

### What gets created
- `src/layouts/BaseMinimal.astro` — focused layout for checkout/booking flows

### What gets extended
- `src/components/Nav.astro` — add `minimal` variant, verify `landing` and `consumer` variants match spec

### What gets cleaned up
- `src/layouts/Base.astro` — fix `--brand` token
- All pages — remove local `:root` overrides that duplicate or contradict Base.astro

### What stays unchanged
- `src/components/trainer/BottomNav.tsx` — already fixed, correct
- `src/components/ProfileCompleteness.astro` — already fixed, correct
- `[slug].astro` React island component structure — CSS tokens only, no structural change

---

## Rules for Implementation

1. **Token-only colors.** No `color: #FF5C00` directly in any style rule. Use `color: var(--brand)`.
2. **Light pages opt in.** Dark is the Base.astro default. Light pages inject the override block. Never change Base.astro defaults to light.
3. **Delete don't comment.** Stale local `:root` overrides get deleted, not commented out.
4. **Nav.astro is the nav.** No new inline navs. If a page needs a nav shape that doesn't exist, add a variant to Nav.astro.
5. **BaseMinimal.astro for focused flows.** Any page where the user should not be distracted by navigation uses BaseMinimal.
6. **Phase order is mandatory.** Phase 2 depends on Phase 1 being done. Don't touch page styles before the token foundation is correct.

---

## Success Criteria

- [ ] Every page loads without a white-flash or theme flip
- [ ] `#D4622A` appears nowhere in the codebase
- [ ] `Nav.astro` is the only nav component for marketing/consumer pages
- [ ] `my-bookings` and `book/[slug]` render DM Sans and proper meta tags
- [ ] All trainer funnel pages (for-trainers → join → pricing) feel visually continuous with landing
- [ ] Blog matches the visual language of the landing page's Stories section
- [ ] Profile page (`[slug].astro`) remains white/light throughout
- [ ] No hardcoded hex values remain in page `<style>` blocks (token system only)
- [ ] `npm run build` passes with zero errors
