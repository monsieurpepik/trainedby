# UI Redesign — Light Theme + Desktop Layouts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dark theme on `landing.astro`, `find.astro`, and `dashboard.astro` with the approved light design system and add proper desktop layouts — without touching any JS, Supabase queries, or business logic.

**Architecture:** Approach C (targeted structure + theme). Replace CSS variable definitions with the light token set, add `@media (min-width: 768px)` blocks for desktop layouts, update structural HTML only where needed (hero split, sticky top bar, tab nav). All `<script>` blocks, Astro frontmatter, and component imports are preserved exactly as-is.

**Tech Stack:** Astro, inline `<style>` blocks, DM Sans (Google Fonts), CSS custom properties, Supabase REST (preserved).

**Design tokens (reference for all tasks):**
```css
--bg:        #FFFFFF;
--surface:   #F5F4F3;
--surface-2: #E8E5E2;
--text:      #1A1411;
--text-2:    #6B6460;
--border:    rgba(0,0,0,0.07);
--brand:     #FF5C00;   /* trainer-facing only */
--green:     #00C853;
```

**Orange usage rule:** `#FF5C00` only on: "For trainers →" nav link, "Join as trainer →" ghost CTA, dashboard "View my profile →" link, and "✓ Verified" trainer badge on search cards. Nowhere else.

---

## File Map

| File | Change type |
|---|---|
| `src/pages/landing.astro` | CSS vars + DM Sans + hero 2-col desktop + orange scope |
| `src/pages/find.astro` | CSS vars + DM Sans + sticky top bar + card redesign + 4-col grid |
| `src/pages/dashboard.astro` | CSS vars + DM Sans + desktop tab nav + wider container |

---

## Task 1: Create feature branch

**Files:** none (git only)

- [ ] **Step 1: Ensure on staging and create feat branch**

```bash
git fetch origin
git checkout staging
git checkout -b feat/ui-redesign-light-theme
```

Expected: You are now on branch `feat/ui-redesign-light-theme` based off `staging`.

- [ ] **Step 2: Verify branch**

```bash
git branch --show-current
```

Expected output: `feat/ui-redesign-light-theme`

---

## Task 2: Landing page — light theme + DM Sans + desktop hero

**Files:**
- Modify: `src/pages/landing.astro`

The current page uses `#0a0a0a` dark backgrounds, Inter/Manrope fonts, and a single-column hero. We need: light CSS vars, DM Sans throughout, a 2-column hero at `≥768px`, and orange scoped to trainer touchpoints only.

### Step-by-step

- [ ] **Step 1: Locate the `<style>` block in landing.astro**

Open `src/pages/landing.astro`. Find the `<style>` tag (inside the `<head>` or after frontmatter). Look for lines that define `:root` with dark variables and `body { background: var(--bg, #0a0a0a) ... font-family: var(--font-body, 'Inter', sans-serif) }`.

- [ ] **Step 2: Replace the `:root` dark variable definitions with the light token set**

Find the `:root { ... }` block (approximately lines 20-60 of the style block). Replace the dark fallback values:

```css
/* REPLACE entire :root block with: */
:root {
  --bg:        #FFFFFF;
  --surface:   #F5F4F3;
  --surface-2: #E8E5E2;
  --text:      #1A1411;
  --text-2:    #6B6460;
  --border:    rgba(0,0,0,0.07);
  --brand:     #FF5C00;
  --green:     #00C853;
  --danger:    #E53935;
  --reps:      #00C853;
  --reps-dim:  rgba(0,200,83,0.1);
  --danger-dim: rgba(229,57,53,0.1);
  --text-muted: #6B6460;
  --text-faint: rgba(26,20,17,0.4);
}
```

- [ ] **Step 3: Update body font and background**

Find the `body { ... }` rule. Replace the font-family and background:

```css
body {
  background: var(--bg, #FFFFFF);
  color: var(--text, #1A1411);
  font-family: 'DM Sans', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 4: Add DM Sans font import**

At the very top of the `<style>` block (before `:root`), add:

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');
```

- [ ] **Step 5: Remove hardcoded dark colors**

Search the `<style>` block for any hardcoded dark values and replace:
- `#0a0a0a` → `#FFFFFF` (for backgrounds) or `#1A1411` (for text/ink)
- `#111111` or `#111` → `#F5F4F3`
- `#1a1a1a` → `#F5F4F3`
- `rgba(255,255,255,0.08)` used as a border → `rgba(0,0,0,0.07)`
- `rgba(255,255,255,0.55)` used as muted text → `#6B6460`
- `#f0f0f0` (old light text on dark) → `#1A1411`
- `color: #FF5C00` on nav logo, section eyebrows, search button → `color: #1A1411`
- `background: #FF5C00` on primary buttons → `background: #1A1411`
- Orange active filter pill background → `background: #1A1411; color: #fff`

**Key orange items to keep as orange:**
- `.nav-link.trainer` (the "For trainers →" link)
- The "Join as trainer →" ghost CTA button
- These should remain `color: #FF5C00` or `border-color: rgba(255,92,0,0.25)`

- [ ] **Step 6: Update the nav styles**

Find the `.nav` or `.site-nav` rule. Ensure:

```css
.nav {
  background: #FFFFFF;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 40px;
  gap: 32px;
}
.nav-logo {
  font-weight: 800;
  font-size: 17px;
  color: #1A1411;
  letter-spacing: -0.03em;
  margin-right: auto;
  text-decoration: none;
}
.nav-link {
  font-size: 13px;
  color: #6B6460;
  font-weight: 500;
  text-decoration: none;
}
.nav-link.trainer { color: #FF5C00; font-weight: 700; } /* orange — trainer-facing */
.nav-cta {
  background: #1A1411;
  color: #fff;
  padding: 8px 18px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
}
```

- [ ] **Step 7: Add desktop hero split layout**

Find the hero section in the HTML. The current hero is likely a full-width centered block. Add a desktop wrapper class. Locate the hero HTML — it will have a search input, eyebrow pill, H1, subheading, and CTA buttons.

Restructure the hero HTML to wrap left/right content:

```html
<!-- Replace current hero markup with this structure (preserve all dynamic Astro expressions inside) -->
<section class="hero">
  <!-- LEFT COLUMN -->
  <div class="hero-left">
    <div class="hero-eyebrow">
      <span class="hero-eyebrow-dot"></span>
      <!-- Keep existing dynamic trainer count expression here -->
      <span id="trainer-count-label">Verified trainers</span>
    </div>
    <h1 class="hero-h1">Find your perfect<br/><em>personal trainer</em></h1>
    <p class="hero-sub">Every trainer is certified, background-checked, and reviewed by real clients. No guesswork.</p>
    <div class="hero-actions">
      <a href="/find" class="btn-dark">Find a trainer</a>
      <a href="/join" class="btn-ghost-orange">Join as trainer →</a>
    </div>
    <div class="hero-social" id="hero-social">
      <div class="avatar-stack">
        <div class="avatar-init" style="background:#8B7E75;">AK</div>
        <div class="avatar-init" style="background:#6B5E55;">SL</div>
        <div class="avatar-init" style="background:#4A3D35;">MR</div>
      </div>
      <span class="hero-social-text" id="social-proof-label">Clients trained this month</span>
    </div>
  </div>
  <!-- RIGHT COLUMN: Stats grid -->
  <div class="hero-right">
    <div class="stats-grid">
      <div class="stat-card featured">
        <div class="stat-val" id="stat-trainer-count">—</div>
        <div class="stat-label">Verified trainers</div>
      </div>
      <div class="stat-card">
        <div class="stat-val" id="stat-avg-rating">4.9★</div>
        <div class="stat-label">Average rating</div>
      </div>
      <div class="stat-card">
        <div class="stat-val">10</div>
        <div class="stat-label">Markets worldwide</div>
      </div>
      <div class="stat-card">
        <div class="stat-val">100%</div>
        <div class="stat-label">Certified & checked</div>
      </div>
    </div>
  </div>
</section>
```

**Important:** The `id="stat-trainer-count"` element should be populated from the existing Supabase fetch that already runs on this page (the featured trainer loader already fetches trainer data). If there's no existing count fetch, add it to the existing async script — do NOT hardcode a number.

- [ ] **Step 8: Add hero CSS (mobile-first, then desktop)**

Add to the `<style>` block:

```css
/* Hero — mobile first */
.hero {
  padding: 48px 24px;
  background: #FFFFFF;
}
.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 100px;
  background: #F5F4F3;
  font-size: 11px;
  font-weight: 700;
  color: #6B6460;
  margin-bottom: 20px;
}
.hero-eyebrow-dot {
  width: 6px; height: 6px; border-radius: 50%; background: #00C853;
}
.hero-h1 {
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.05;
  color: #1A1411;
  margin-bottom: 16px;
  font-family: 'DM Sans', system-ui, sans-serif;
}
.hero-h1 em {
  font-style: italic;
  font-family: Georgia, 'Times New Roman', serif;
  font-weight: 400;
}
.hero-sub {
  font-size: 15px;
  color: #6B6460;
  line-height: 1.65;
  margin-bottom: 28px;
  max-width: 420px;
}
.hero-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 28px;
}
.btn-dark {
  background: #1A1411;
  color: #fff;
  padding: 12px 22px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  display: inline-block;
}
.btn-ghost-orange {
  color: #FF5C00;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  padding: 12px 4px;
}
.hero-social {
  display: flex;
  align-items: center;
  gap: 10px;
}
.avatar-stack { display: flex; }
.avatar-init {
  width: 30px; height: 30px; border-radius: 50%;
  border: 2px solid #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 800; color: #fff;
  margin-left: -8px;
}
.avatar-init:first-child { margin-left: 0; }
.hero-social-text { font-size: 12px; color: #6B6460; font-weight: 500; }
.hero-right { display: none; } /* hidden on mobile */

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.stat-card {
  background: #F5F4F3;
  border-radius: 14px;
  padding: 20px;
}
.stat-card.featured { background: #1A1411; }
.stat-val {
  font-size: 30px;
  font-weight: 800;
  color: #1A1411;
  letter-spacing: -0.05em;
  line-height: 1;
  margin-bottom: 4px;
}
.stat-card.featured .stat-val { color: #fff; }
.stat-label { font-size: 12px; color: #6B6460; font-weight: 500; }
.stat-card.featured .stat-label { color: rgba(255,255,255,0.55); }

/* Desktop hero split — 2 columns */
@media (min-width: 768px) {
  .hero {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    align-items: center;
    padding: 72px 40px 64px;
    max-width: 1000px;
    margin: 0 auto;
  }
  .hero-right { display: block; } /* show right column on desktop */
  .hero-h1 { font-size: 48px; }
}
```

- [ ] **Step 9: Update featured trainer strip to light design**

Find the `.trainer-card` or featured trainer section in the style block. Ensure:

```css
.trainer-strip {
  background: #FAFAF9;
  border-top: 1px solid rgba(0,0,0,0.06);
  padding: 40px;
}
.trainer-strip-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #6B6460;
  margin-bottom: 20px;
}
.t-card {
  background: #fff;
  border: 1px solid rgba(0,0,0,0.07);
  border-radius: 14px;
  padding: 14px;
  min-width: 160px;
}
.t-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  background: #F5F4F3;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 800; color: #1A1411;
  margin-bottom: 8px;
}
.t-name { font-weight: 700; font-size: 13px; color: #1A1411; margin-bottom: 2px; }
.t-spec { font-size: 11px; color: #6B6460; margin-bottom: 6px; }
.t-rating { font-size: 11px; color: #1A1411; font-weight: 600; }
```

- [ ] **Step 10: Update footer CTA section**

Find the footer CTA section (dark band). Keep it dark (this is intentional per design):

```css
.footer-cta {
  background: #1A1411;
  padding: 56px 40px;
  text-align: center;
}
.footer-cta h2 { font-size: 32px; font-weight: 800; color: #fff; letter-spacing: -0.04em; margin-bottom: 12px; }
.footer-cta p { font-size: 14px; color: rgba(255,255,255,0.5); margin-bottom: 24px; }
/* Browse trainers button uses white pill on dark bg */
.btn-white-pill {
  background: #fff;
  color: #1A1411;
  padding: 12px 24px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  display: inline-block;
}
```

- [ ] **Step 11: Update existing JS to populate stats from DB**

In the existing `<script>` block that loads featured trainers (the `async function` that fetches from Supabase), after getting the trainer list, add a count update:

```javascript
// After fetching trainers, update the count display
const countEl = document.getElementById('stat-trainer-count');
if (countEl && data && data.length) {
  // Use the total count if available in response, otherwise show length
  countEl.textContent = (data.length >= 10 ? data.length + '+' : data.length);
}
```

Do NOT hardcode `500+` or any other number. If the existing fetch already populates a count element, leave it unchanged.

- [ ] **Step 12: Verify landing page changes**

Open the page in a browser or check with a dev server. Confirm:
- White background, no dark backgrounds visible
- DM Sans font loading (check Network tab or inspect body font-family)
- Hero shows 2 columns at window width ≥ 768px, stacks on mobile
- "For trainers →" is orange, all other nav items are dark/muted
- "Join as trainer →" is orange ghost, "Find a trainer" is dark pill
- No orange on section eyebrows, search buttons, or filter pills

```bash
# If running locally:
npm run dev
# Open http://localhost:4321 in browser
```

- [ ] **Step 13: Commit landing page changes**

```bash
git add src/pages/landing.astro
git commit -m "feat: landing page — light theme, DM Sans, desktop split hero"
```

---

## Task 3: Find/Search page — light theme + sticky top bar + redesigned trainer cards

**Files:**
- Modify: `src/pages/find.astro`

The current page has a dark arc-hero banner, orange active filters, and complex dark card SVGs. We need: light CSS, sticky top bar (replacing the arc-hero), dark active filter pills, and clean light trainer cards via `trainerCardHTML()`.

- [ ] **Step 1: Replace CSS variables and font in find.astro**

Open `src/pages/find.astro`. Find the `<style>` block. Replace the dark root vars:

```css
:root {
  --surface:   #FFFFFF;
  --surface2:  #F5F4F3;
  --surface3:  #E8E5E2;
  --text:      #1A1411;
  --text-muted: #6B6460;
  --text-faint: rgba(26,20,17,0.4);
  --border:    rgba(0,0,0,0.07);
  --brand:     #FF5C00;
  --green:     #00C853;
}

body {
  background: #F5F4F3;
  color: #1A1411;
  font-family: 'DM Sans', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

At top of `<style>` block, add:

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');
```

- [ ] **Step 2: Remove or replace the arc-hero section**

In the HTML, find the arc-hero section. This is typically an element with class like `arc-hero`, `page-hero`, or uses the `<ArcHeader>` component. Look for a dark, full-width header block (~200-240px tall) with the orange arc SVG and page title.

**Remove** the entire arc-hero HTML element and any `<ArcHeader ... />` Astro component import at the top of the file.

**Replace** with the sticky top bar:

```html
<!-- Sticky top bar — replaces arc-hero -->
<div class="top-bar">
  <a href="/" class="top-bar-logo">TrainedBy</a>
  <div class="top-bar-search">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    <input type="text" id="search-input" placeholder="Search trainers…" />
  </div>
  <span class="top-bar-count" id="result-count">Loading…</span>
  <a href="/join" class="top-bar-cta">Sign up</a>
</div>
```

**Add top bar CSS:**

```css
.top-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  border-bottom: 1px solid rgba(0,0,0,0.07);
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
}
.top-bar-logo {
  font-weight: 800;
  font-size: 15px;
  color: #1A1411;
  letter-spacing: -0.03em;
  text-decoration: none;
  flex-shrink: 0;
}
.top-bar-search {
  flex: 1;
  max-width: 480px;
  margin: 0 auto;
  background: #F5F4F3;
  border-radius: 100px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  height: 36px;
  border: 1px solid transparent;
}
.top-bar-search:focus-within { border-color: rgba(0,0,0,0.12); }
.top-bar-search input {
  border: none;
  background: transparent;
  font-size: 13px;
  color: #1A1411;
  font-family: 'DM Sans', system-ui, sans-serif;
  flex: 1;
  outline: none;
}
.top-bar-search input::placeholder { color: #999; }
.top-bar-count {
  font-size: 12px;
  color: #6B6460;
  white-space: nowrap;
  flex-shrink: 0;
}
.top-bar-cta {
  background: #1A1411;
  color: #fff;
  padding: 7px 16px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  flex-shrink: 0;
}
```

- [ ] **Step 3: Wire the top bar search input to the existing search logic**

In the `<script>` block, find the existing search input event listener. It currently listens to an element by ID (likely `search-input` or similar). If the ID has changed, update the listener to use `document.getElementById('search-input')`. Do NOT change the logic — only the element ID reference if needed.

Also update the result count display to reference `result-count`:

```javascript
// Find the line that updates the result count display and ensure it targets:
document.getElementById('result-count').textContent = `${count} trainers`;
// (Only change the element ID if it's referencing the old arc-hero count element)
```

- [ ] **Step 4: Replace filter strip styles**

Find the filter pills section (specialty filters: Strength, Yoga, etc.). Update:

```css
.filter-strip {
  padding: 12px 20px;
  background: #fff;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  align-items: center;
}
.filter-strip::-webkit-scrollbar { display: none; }

/* Filter pills */
.filter-pill {
  padding: 6px 14px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  border: 1px solid rgba(0,0,0,0.1);
  background: #F5F4F3;
  color: #6B6460;
  transition: background 0.15s, color 0.15s;
}
/* Active filter: dark fill, NOT orange */
.filter-pill.active {
  background: #1A1411;
  color: #fff;
  border-color: #1A1411;
}
/* Verified pill: orange (trainer credential badge) */
.filter-pill.verified {
  background: rgba(255,92,0,0.08);
  color: #FF5C00;
  border-color: rgba(255,92,0,0.2);
}
.filter-pill.verified.active {
  background: #FF5C00;
  color: #fff;
  border-color: #FF5C00;
}
```

- [ ] **Step 5: Update trainer grid to 4-column at desktop**

Find the trainer grid container styles (likely `.trainer-grid` or similar). Replace:

```css
/* Mobile: 2-column grid */
.trainer-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 16px 16px 80px;
}

/* Desktop: 4-column grid */
@media (min-width: 768px) {
  .trainer-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    padding: 20px 24px 40px;
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

- [ ] **Step 6: Redesign trainer cards via `trainerCardHTML()`**

In the `<script>` block, find the `trainerCardHTML(trainer)` function. It currently returns dark card HTML with orange arc SVGs. Replace its entire `return` string with the light card design:

```javascript
function trainerCardHTML(trainer) {
  const initials = (trainer.name || '??')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const rating = trainer.avg_rating
    ? `★ ${parseFloat(trainer.avg_rating).toFixed(1)}`
    : '★ —';

  const price = trainer.session_price
    ? `${trainer.currency || 'AED'} ${trainer.session_price}`
    : '';

  const location = trainer.location ? ` · ${trainer.location}` : '';

  const specialties = (trainer.specialties || [])
    .slice(0, 2)
    .map(s => `<span class="tc-tag">${s}</span>`)
    .join('');

  const verified = trainer.reps_verified
    ? `<span class="tc-verified">✓ Verified</span>`
    : '';

  const waHref = trainer.whatsapp
    ? `https://wa.me/${trainer.whatsapp.replace(/\D/g, '')}`
    : `/${trainer.slug}`;

  return `
    <a href="/${trainer.slug}" class="trainer-card" style="text-decoration:none;display:block;">
      <div class="tc-avatar-wrap">
        <div class="tc-avatar">${initials}</div>
        ${verified}
      </div>
      <div class="tc-body">
        <div class="tc-name">${trainer.name || 'Trainer'}</div>
        <div class="tc-meta">${location.replace(' · ', '')}${location ? ' · ' : ''}${rating}</div>
        <div class="tc-tags">${specialties}</div>
        ${price ? `<div class="tc-price">${price} <span>/ session</span></div>` : ''}
        <a href="${waHref}" class="tc-wa" onclick="event.stopPropagation();" target="_blank" rel="noopener">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Contact
        </a>
      </div>
    </a>`;
}
```

**Add trainer card CSS:**

```css
.trainer-card {
  background: #fff;
  border: 1px solid rgba(0,0,0,0.07);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.15s;
}
.trainer-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); }

.tc-avatar-wrap {
  position: relative;
  background: #F5F4F3;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tc-avatar {
  font-size: 28px;
  font-weight: 800;
  color: #1A1411;
  letter-spacing: -0.03em;
}
.tc-verified {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0,200,83,0.1);
  border: 1px solid rgba(0,200,83,0.25);
  color: #00C853;
  font-size: 9px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 20px;
}
.tc-body { padding: 12px; }
.tc-name { font-weight: 700; font-size: 13px; color: #1A1411; margin-bottom: 2px; }
.tc-meta { font-size: 11px; color: #6B6460; margin-bottom: 8px; }
.tc-tags { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 8px; }
.tc-tag {
  background: #F5F4F3;
  color: #6B6460;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 100px;
}
.tc-price { font-weight: 700; font-size: 13px; color: #1A1411; margin-bottom: 10px; }
.tc-price span { font-size: 10px; font-weight: 400; color: #6B6460; }
.tc-wa {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #1A1411;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 100px;
  text-decoration: none;
  cursor: pointer;
}
```

- [ ] **Step 7: Remove hardcoded dark colors from style block**

Scan the remaining CSS for any `#0a0a0a`, `#111`, `#1a1a1a`, `rgba(255,255,255,...)` that aren't part of the intentional dark footer or orange brand elements. Replace each with its light equivalent (`#F5F4F3`, `#1A1411`, `rgba(0,0,0,...)`).

- [ ] **Step 8: Verify find page**

With dev server running, open `/find`. Confirm:
- White/light-gray background, no dark backgrounds
- Sticky top bar at top (no arc-hero)
- Filter pills: gray by default, dark fill when active, orange only for "Verified" badge
- Trainer cards show as light cards with initials avatar and green verified badge
- 2-column on mobile (375px), 4-column on desktop (≥768px)
- Filtering and search still work (JS unchanged except `trainerCardHTML`)

- [ ] **Step 9: Commit find page changes**

```bash
git add src/pages/find.astro
git commit -m "feat: find page — light theme, sticky top bar, redesigned trainer cards, 4-col desktop grid"
```

---

## Task 4: Dashboard — light theme + DM Sans + desktop tab nav

**Files:**
- Modify: `src/pages/dashboard.astro`

The current dashboard is mobile-only (`max-width: 480px`), dark theme, Manrope/Inter fonts. We add a desktop tab nav, expand the container to full-width at desktop, update CSS vars, and preserve all Supabase/auth/AI logic intact.

- [ ] **Step 1: Replace CSS variables in dashboard.astro**

Find the `<style>` block in `dashboard.astro`. Replace the root dark vars:

```css
:root {
  --bg:         #FFFFFF;
  --surface:    #FAFAF9;
  --surface-2:  #F5F4F3;
  --surface-3:  #E8E5E2;
  --surface-4:  #E0DDD9;
  --text:       #1A1411;
  --text-muted: #6B6460;
  --text-faint: rgba(26,20,17,0.4);
  --border:     rgba(0,0,0,0.07);
  --brand:      #FF5C00;
  --green:      #00C853;
  --reps:       #00C853;
  --reps-dim:   rgba(0,200,83,0.1);
  --danger:     #E53935;
  --danger-dim: rgba(229,57,53,0.1);
}

body {
  background: var(--surface, #FAFAF9);
  color: var(--text, #1A1411);
  font-family: 'DM Sans', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

Add DM Sans import at top of `<style>`:

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');
```

- [ ] **Step 2: Update dash-wrap container for desktop**

Find the `.dash-wrap` rule. Currently it's `max-width: 480px; margin: 0 auto`. Change to:

```css
.dash-wrap {
  max-width: 480px;
  margin: 0 auto;
  padding-bottom: 80px; /* space for bottom nav on mobile */
}

@media (min-width: 768px) {
  .dash-wrap {
    max-width: 960px;
    padding-bottom: 32px;
  }
}
```

- [ ] **Step 3: Update the orange logo SVG in dash-header**

Find this HTML in the `dash-header`:

```html
<svg width="26" height="26" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#FF5C00"/><text ...>TB</text></svg>
```

Replace with a dark version:

```html
<svg width="26" height="26" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#1A1411"/><text x="16" y="23" font-family="DM Sans,Arial,sans-serif" font-size="14" font-weight="800" text-anchor="middle" fill="white">TB</text></svg>
```

- [ ] **Step 4: Update dash-header CSS for mobile**

Find `.dash-header` styles. Update to light theme:

```css
.dash-header {
  background: #fff;
  border-bottom: 1px solid rgba(0,0,0,0.07);
  padding: 0 20px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 50;
}
.dash-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  font-size: 15px;
  color: #1A1411;
  text-decoration: none;
  letter-spacing: -0.03em;
}
.nav-edit, .nav-view {
  font-size: 13px;
  color: #6B6460;
  font-weight: 500;
  text-decoration: none;
}
.nav-view { color: #FF5C00; font-weight: 700; } /* orange — trainer-facing */
```

- [ ] **Step 5: Add desktop tab nav (visible only at ≥768px)**

After the existing `.dash-header` div in the HTML (around line 618), add a new tab nav element:

```html
<!-- Desktop tab nav — hidden on mobile, shown via CSS at ≥768px -->
<nav class="dash-tabs" id="dash-tabs">
  <div class="dash-tabs-inner">
    <a href="/" class="tabs-logo">TrainedBy</a>
    <div class="tabs-list">
      <a href="/dashboard" class="tab-item active">Overview</a>
      <a href="/edit" class="tab-item">Profile</a>
      <a href="/pricing" class="tab-item">Upgrade</a>
    </div>
    <div class="tabs-right">
      <a id="tab-view-link" href="#" class="tab-view-profile">View my profile →</a>
      <div class="tabs-avatar" id="tab-avatar-initials">TB</div>
    </div>
  </div>
</nav>
```

**Add desktop tab nav CSS:**

```css
/* Desktop tab nav — hidden by default on mobile */
.dash-tabs { display: none; }

@media (min-width: 768px) {
  /* Hide mobile header, show desktop tabs */
  .dash-header { display: none; }
  .dash-tabs { display: block; }
  .bottom-nav { display: none !important; } /* hide mobile bottom nav */
  
  .dash-tabs {
    background: #fff;
    border-bottom: 1px solid rgba(0,0,0,0.07);
    position: sticky;
    top: 0;
    z-index: 50;
  }
  .dash-tabs-inner {
    max-width: 960px;
    margin: 0 auto;
    height: 52px;
    display: flex;
    align-items: center;
    padding: 0 32px;
    gap: 0;
  }
  .tabs-logo {
    font-weight: 800;
    font-size: 15px;
    color: #1A1411;
    letter-spacing: -0.03em;
    text-decoration: none;
    margin-right: 32px;
    flex-shrink: 0;
  }
  .tabs-list {
    display: flex;
    gap: 0;
    flex: 1;
    height: 52px;
  }
  .tab-item {
    padding: 0 16px;
    font-size: 13px;
    font-weight: 500;
    color: #6B6460;
    text-decoration: none;
    display: flex;
    align-items: center;
    border-bottom: 2px solid transparent;
    white-space: nowrap;
    transition: color 0.15s;
  }
  .tab-item:hover { color: #1A1411; }
  .tab-item.active {
    color: #1A1411;
    font-weight: 700;
    border-bottom-color: #1A1411;
  }
  .tabs-right {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }
  .tab-view-profile {
    font-size: 12px;
    color: #FF5C00; /* orange — trainer-facing */
    font-weight: 700;
    text-decoration: none;
  }
  .tabs-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #F5F4F3;
    border: 1px solid rgba(0,0,0,0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 800;
    color: #1A1411;
  }
}
```

- [ ] **Step 6: Wire desktop tab nav to trainer data in JS**

In the existing `populateDash(trainer)` function (around line 1046), after setting `document.getElementById('view-link').href`, add:

```javascript
// Update desktop tab nav links
const tabViewLink = document.getElementById('tab-view-link');
if (tabViewLink) tabViewLink.href = '/' + t.slug;

// Update desktop avatar initials
const tabAvatar = document.getElementById('tab-avatar-initials');
if (tabAvatar) {
  const initials = (t.name || 'TB').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  tabAvatar.textContent = initials;
}
```

- [ ] **Step 7: Update stats layout for desktop**

Find `.stats-grid` in the dashboard CSS (the 2-col grid). Add desktop override:

```css
/* Mobile: 2-col */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
}

/* Desktop: 4-col */
@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

- [ ] **Step 8: Update stat cards to light design**

Find `.stat-card` styles. Replace:

```css
.stat-card {
  background: #fff;
  border: 1px solid rgba(0,0,0,0.07);
  border-radius: 14px;
  padding: 18px;
}
.stat-card.brand-card {
  background: #1A1411;
  border-color: #1A1411;
}
.stat-card-icon { color: #6B6460; margin-bottom: 8px; }
.stat-card.brand-card .stat-card-icon { color: rgba(255,255,255,0.5); }
.stat-card-value {
  font-size: 26px;
  font-weight: 800;
  color: #1A1411;
  letter-spacing: -0.04em;
  line-height: 1;
  margin-bottom: 4px;
}
.stat-card.brand-card .stat-card-value { color: #fff; }
.stat-card-label {
  font-size: 11px;
  font-weight: 600;
  color: #6B6460;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}
.stat-card.brand-card .stat-card-label { color: rgba(255,255,255,0.5); }
.stat-card-change { font-size: 11px; color: #00C853; font-weight: 600; }
.stat-card-change.down { color: #E53935; }
```

- [ ] **Step 9: Update bottom-nav to light style (mobile only)**

Find `.bottom-nav` styles. Update for light:

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid rgba(0,0,0,0.08);
  display: flex;
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom, 0);
}
.bottom-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 10px 0;
  font-size: 10px;
  font-weight: 600;
  color: #6B6460;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'DM Sans', system-ui, sans-serif;
}
.bottom-nav-item.active {
  color: #1A1411;
}
.bottom-nav-item svg {
  stroke: currentColor;
}
```

- [ ] **Step 10: Update loading dots from orange to neutral**

Find the loading dots in HTML (around line 625):
```html
<div style="...background:var(--brand);animation:pulse...">
```
These use `var(--brand)` which is now `#FF5C00`. Since these are internal UI loading indicators (not trainer-facing), change to `#1A1411`:

```html
<div style="...background:#1A1411;animation:pulse...">
```
(Update all 3 loading dot divs.)

- [ ] **Step 11: Remove hardcoded dark colors from dashboard style block**

Scan the `<style>` block for:
- `#0a0a0a` → replace with `#FFFFFF` or `#FAFAF9` depending on context
- `rgba(255,255,255,0.05)` used as card bg → `#F5F4F3`
- `rgba(255,255,255,0.08)` used as border → `rgba(0,0,0,0.07)`
- `rgba(255,255,255,0.5)` used as muted text → `#6B6460`
- `rgba(255,255,255,0.9)` used as primary text → `#1A1411`
- `color: #fff` used for general text on dark bg → change to `color: #1A1411`
- `background: rgba(255,255,255,0.05)` on input fields → `background: #F5F4F3`
- Keep `#fff` on `.stat-card.brand-card` and `.dash-tabs.brand-card` (white text on dark card is correct)

**Note on the support chatbot widget (lines 1440-1465):** The chatbot has dark styling injected via JS (`background:#111`, `#0a0a0a`, `rgba(255,255,255,...)`). Since it's a floating support overlay (not the main page), leave it as-is — it's separate from the page theme.

- [ ] **Step 12: Update booking setup card to light theme**

Find the booking setup card HTML (around lines 661-681). It currently uses `rgba(255,92,0,0.06)` background which is acceptable (trainer-facing setup card). Update the text colors from `rgba(255,255,255,0.9)` to `#1A1411` and `rgba(255,255,255,0.45)` to `#6B6460`:

```html
<!-- Update these inline styles on the booking setup card -->
<div style="...font-weight:700;color:#1A1411;...">Finish setup to accept bookings</div>
<div style="...color:#6B6460;...">Complete these steps to go live.</div>
```

And for step items: `rgba(255,255,255,0.85)` → `#1A1411`, `rgba(255,255,255,0.4)` → `#6B6460`, `rgba(255,255,255,0.5)` (step numbers) → `#6B6460`.

- [ ] **Step 13: Update insight banner to light theme**

Find the insight banner HTML (around line 723). Update inline text colors:
- `rgba(255,255,255,0.85)` → `#1A1411`

The orange insight banner itself (`rgba(255,92,0,0.10)` bg, orange border) is acceptable — it's trainer-facing.

- [ ] **Step 14: Update chart, leads, and checklist to light**

Find `.chart-section`, `.leads-section`, `.checklist-section` styles. Ensure:

```css
.chart-section, .leads-section, .checklist-section, .income-section {
  background: #fff;
  border: 1px solid rgba(0,0,0,0.07);
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 16px;
}
.chart-title, .leads-title, .checklist-title, .stats-section-title {
  font-size: 13px;
  font-weight: 700;
  color: #1A1411;
}
.chart-bar { background: #E8E5E2; border-radius: 4px 4px 0 0; }
.chart-bar.today { background: #1A1411; }
.chart-label { font-size: 10px; color: #6B6460; }
```

Lead items and checklist items — replace `rgba(255,255,255,...)` colors with dark equivalents throughout.

- [ ] **Step 15: Verify dashboard on mobile and desktop**

```bash
# Dev server should be running
# Check at http://localhost:4321/dashboard
```

On **mobile (375px viewport)**:
- Bottom nav visible (5 items)
- `dash-header` visible (logo + edit/view links)
- `dash-tabs` NOT visible
- Content stacks in single column

On **desktop (960px+ viewport)**:
- `dash-tabs` visible (TrainedBy logo, Overview/Profile/Upgrade tabs, View my profile → orange, avatar initials)
- `dash-header` NOT visible (hidden by media query)
- `bottom-nav` NOT visible (hidden by media query)
- Stats in 4-column row
- Content in full-width layout

- [ ] **Step 16: Commit dashboard changes**

```bash
git add src/pages/dashboard.astro
git commit -m "feat: dashboard — light theme, DM Sans, desktop tab nav, wider container"
```

---

## Task 5: Final verification and PR

**Files:** none (verification + git)

- [ ] **Step 1: Run a full check across all 3 pages**

With dev server running (`npm run dev`), check each page at 375px (mobile) and 960px+ (desktop):

| Check | landing | find | dashboard |
|---|---|---|---|
| White/light background | ✓ | ✓ | ✓ |
| DM Sans font applied | ✓ | ✓ | ✓ |
| No dark backgrounds | ✓ | ✓ | ✓ |
| Orange only on trainer elements | ✓ | ✓ | ✓ |
| Desktop layout at 960px | 2-col hero | 4-col grid | tab nav |
| Mobile layout at 375px | stacked | 2-col | bottom nav |
| JS/search/filter works | ✓ | ✓ | ✓ |
| Auth/Supabase intact | — | — | ✓ |

- [ ] **Step 2: Check for any remaining orange violations**

Search across all 3 modified files for `#FF5C00` or `#D4622A` or `orange` in the CSS. Verify each instance is one of the allowed trainer-facing touchpoints:
- "For trainers →" nav link ✓
- "Join as trainer →" CTA ✓
- Dashboard "View my profile →" ✓
- Verified trainer badge ✓
- Trainer onboarding/insight banners ✓

If orange appears anywhere else (primary buttons, active filters, headings, eyebrows), change to `#1A1411`.

- [ ] **Step 3: Astro build check**

```bash
npm run build
```

Expected: Build completes with 0 errors. Warnings about missing fonts or unused CSS are acceptable.

- [ ] **Step 4: Push and open PR against staging**

```bash
git push -u origin feat/ui-redesign-light-theme
gh pr create \
  --title "UI Redesign: light theme + desktop layouts (landing, find, dashboard)" \
  --base staging \
  --body "$(cat <<'EOF'
## Summary
- Replaced dark theme (#0a0a0a) with light design system (#FFFFFF / #F5F4F3) on landing, find, and dashboard pages
- Added DM Sans throughout, replacing Inter/Manrope mix
- Added desktop layouts: 2-col split hero (landing), 4-col trainer grid (find), tab nav + wider container (dashboard)
- Scoped orange (#FF5C00) strictly to trainer-facing touchpoints — removed from buttons, filters, headings
- Preserved all JS, Supabase queries, auth logic, and business logic intact

## Test Plan
- [ ] Verify light backgrounds on all 3 pages at 375px and 960px+
- [ ] Confirm DM Sans loading in browser Network tab
- [ ] Test trainer search/filter on /find — results load and filter correctly
- [ ] Test dashboard auth — login flow and stat loading work
- [ ] Check orange appears only on: "For trainers →", "Join as trainer →", "View my profile →", verified badges
- [ ] Confirm mobile bottom nav still works on /dashboard (375px)
- [ ] Confirm desktop tab nav appears at 768px+ on /dashboard

🤖 Generated with Claude Code
EOF
)"
```

---

## Success Criteria (from spec)

- [ ] All three pages display in light theme (no dark backgrounds) on mobile and desktop
- [ ] Desktop layouts render at 960px+ (4-col grid, tab nav, split hero)
- [ ] Orange appears only on the defined trainer-facing elements
- [ ] No regressions in search filtering, booking flow, or dashboard data display
- [ ] DM Sans loads and applies across all three pages
- [ ] Existing mobile layouts continue to work at 375px viewport
