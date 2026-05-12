# Landing Design Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the 7 amateur signals from the landing page — font inconsistency, UPPERCASE eyebrows, fake social proof, nav clutter, empty blog placeholder, inconsistent radii, and translateY hover — to reach a Nike/Apple-caliber level of restraint.

**Architecture:** All changes are in `src/pages/landing.astro` (CSS + HTML) with one minor change to `src/layouts/Base.astro`. No new files. No JS changes. Pure visual/CSS polish — each task is independently shippable and visually verifiable with `npm run dev`.

**Tech Stack:** Astro SSR, plain CSS, DM Sans removed → Manrope (already loaded by Base.astro)

---

## File Map

| File | What changes |
|------|-------------|
| `src/pages/landing.astro` | All CSS + HTML edits (Tasks 1–6) |
| `src/layouts/Base.astro` | No change needed — Manrope already loaded here |

---

## Task 1: Font Unification — Remove DM Sans, use Manrope

**Files:**
- Modify: `src/pages/landing.astro` (head Fragment + CSS font-family declarations)

**Why:** DM Sans is loaded as an extra font request only on landing. Manrope is already loaded globally by Base.astro. Two fonts = performance tax + inconsistency with every other page.

- [ ] **Step 1: Remove DM Sans link from head**

In `src/pages/landing.astro`, find the `<Fragment slot="head">` block (lines ~12–16) and replace it:

```astro
<Fragment slot="head">
</Fragment>
```

(The DM Sans `<link rel="preconnect">` and `<link href="https://fonts.googleapis.com/css2?family=DM+Sans...">` lines are removed entirely.)

- [ ] **Step 2: Replace all DM Sans font-family references in the `<style>` block**

Find every occurrence of `'DM Sans'` in the `<style>` block and replace with `'Manrope'`. There are ~10 occurrences:

```
'DM Sans', system-ui, sans-serif  →  'Manrope', system-ui, sans-serif
'DM Sans', system-ui              →  'Manrope', system-ui
```

Affected properties: `body`, `.hero-h1`, `.section-title`, `.transform-title`, `.transform-avatar`, `.transform-stat-val`, `.blog-title`, `.footer-logo`, `.trainer-banner-title`, `.ecard-cta`.

- [ ] **Step 3: Update body font-family declaration**

In the `body` rule:
```css
body {
  background: #EDECEA !important;
  color: #1A1411 !important;
  font-family: 'Manrope', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}
```

- [ ] **Step 4: Verify build**

```bash
cd /Users/bobanpepic/trainedby && npm run dev
```

Open http://localhost:4321/landing — font should look identical to other pages. Check Network tab: only one Google Fonts request (Manrope), no DM Sans.

- [ ] **Step 5: Commit**

```bash
cd /Users/bobanpepic/trainedby
git add src/pages/landing.astro
git commit -m "design: unify font to Manrope, remove DM Sans"
```

---

## Task 2: Nav Simplification

**Files:**
- Modify: `src/pages/landing.astro` (nav HTML, ~lines 398–406)

**Why:** Nav has 5 links. "Community" links to an unbuilt page. Apple/Nike nav: logo + 2–3 links + one CTA. Also add a mobile rule to hide middle links below 640px.

- [ ] **Step 1: Remove Community link, reorder nav**

Replace the entire `<nav class="nav">` block with:

```html
<nav class="nav" id="nav">
  <a href="/landing" class="nav-logo" data-i18n="brand">{brandName}</a>
  <a href="/find" class="nav-link" data-i18n="nav_find">Find a Trainer</a>
  <a href="/blog" class="nav-link" data-i18n="nav_blog">Stories</a>
  <a href="/for-trainers" class="nav-link trainer" data-i18n="nav_for_trainers">For Trainers →</a>
  <a href="/find" class="nav-cta" data-i18n="nav_cta_find">Find Your Trainer →</a>
</nav>
```

- [ ] **Step 2: Add mobile rule to hide middle nav links**

In the CSS, find the existing mobile nav rule (`@media (max-width: 640px) { .nav { padding: 0 20px; } }`) and replace with:

```css
@media (max-width: 640px) {
  .nav { padding: 0 20px; }
  .nav-link:not(.trainer) { display: none; }
}
```

This keeps the "For Trainers →" orange link visible on mobile (it's the trainer acquisition CTA) and hides the two text nav links that overflow.

- [ ] **Step 3: Verify**

```bash
npm run dev
```

Open http://localhost:4321/landing. Resize to 375px width — nav should show: logo | For Trainers → | Find Your Trainer →.

- [ ] **Step 4: Commit**

```bash
git add src/pages/landing.astro
git commit -m "design: simplify nav to 3 links, hide middle links on mobile"
```

---

## Task 3: Section Eyebrows + Remove translateY Hover

**Files:**
- Modify: `src/pages/landing.astro` (CSS)

**Why:** `text-transform: uppercase; letter-spacing: 1.5px` on section labels is a 2015 Bootstrap SaaS pattern. Nike/Apple use small, plainly-weighted labels. `transform: translateY(-2px)` on card hover is dated — replace with a subtle border-color shift.

- [ ] **Step 1: Rewrite `.section-eyebrow`**

Find:
```css
.section-eyebrow { font-size: 11px; font-weight: 700; color: var(--text); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 14px; }
```

Replace with:
```css
.section-eyebrow { font-size: 11px; font-weight: 600; color: var(--text-2); letter-spacing: 0; margin-bottom: 14px; }
```

- [ ] **Step 2: Rewrite `.trainer-banner-eyebrow`**

Find:
```css
.trainer-banner-eyebrow { font-size: 11px; font-weight: 700; color: var(--brand); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; }
```

Replace with:
```css
.trainer-banner-eyebrow { font-size: 11px; font-weight: 600; color: var(--brand); letter-spacing: 0; margin-bottom: 12px; }
```

- [ ] **Step 3: Remove translateY from blog card hover**

Find:
```css
.blog-card:hover { border-color: rgba(0,0,0,0.12); transform: translateY(-2px); }
```

Replace with:
```css
.blog-card:hover { border-color: rgba(0,0,0,0.14); }
```

- [ ] **Step 4: Remove translateY from btn-primary and btn-ghost hover**

Find:
```css
.btn-primary:hover { background: #e05200; transform: translateY(-2px); }
.btn-ghost:hover { border-color: rgba(255,255,255,0.45); transform: translateY(-2px); }
```

Replace with:
```css
.btn-primary:hover { background: #e05200; }
.btn-ghost:hover { border-color: rgba(255,255,255,0.45); }
```

- [ ] **Step 5: Fix `.transform-stat-label` uppercase**

Find:
```css
.transform-stat-label { font-size: 10px; color: var(--text-2); margin-top: 2px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
```

Replace with:
```css
.transform-stat-label { font-size: 10px; color: var(--text-2); margin-top: 2px; font-weight: 600; }
```

- [ ] **Step 6: Verify**

```bash
npm run dev
```

Open http://localhost:4321/landing. Confirm section labels like "Verified Trainers" and "Real Results" are lowercase sentence case, not UPPERCASE. Hover blog cards — no lift.

- [ ] **Step 7: Commit**

```bash
git add src/pages/landing.astro
git commit -m "design: remove uppercase eyebrows, remove translateY hover"
```

---

## Task 4: Hero — Remove Fake Social Proof, Reduce Filter Pills

**Files:**
- Modify: `src/pages/landing.astro` (HTML, ~lines 422–456)

**Why:** The AK/SL/MR initial avatars are fabricated data. Apple/Nike never show placeholder content as if it's real. Also, 7 filter pills in the hero is too many — reduce to 4 most-searched categories.

- [ ] **Step 1: Remove the hero-social block entirely**

Find and delete this entire block (~lines 422–429):
```html
<div class="hero-social" id="hero-social">
  <div class="avatar-stack">
    <div class="avatar-init" style="background:#8B7E75;">AK</div>
    <div class="avatar-init" style="background:#6B5E55;">SL</div>
    <div class="avatar-init" style="background:#4A3D35;">MR</div>
  </div>
  <span class="hero-social-text" id="social-proof-label">Clients trained this month</span>
</div>
```

- [ ] **Step 2: Remove the dead CSS classes**

Remove these rules from the `<style>` block (they're only used by the deleted block):

```css
.hero-social { ... }
.avatar-stack { ... }
.avatar-init { ... }
.hero-social-text { ... }
```

- [ ] **Step 3: Reduce filter pills from 7 to 4**

Find the `.quick-filters` block (~lines 448–456):
```html
<div class="quick-filters" style="justify-content:flex-start;">
  <a href="/find?specialty=weight-loss" class="qf-pill" data-i18n="filter_weight_loss">Weight Loss</a>
  <a href="/find?specialty=strength" class="qf-pill" data-i18n="filter_strength">Strength</a>
  <a href="/find?specialty=hiit" class="qf-pill">HIIT</a>
  <a href="/find?specialty=nutrition" class="qf-pill" data-i18n="filter_nutrition">Nutrition</a>
  <a href="/find?specialty=yoga" class="qf-pill">Yoga</a>
  <a href="/find?specialty=running" class="qf-pill" data-i18n="filter_running">Running</a>
  <a href="/find?specialty=boxing" class="qf-pill">Boxing</a>
</div>
```

Replace with:
```html
<div class="quick-filters" style="justify-content:flex-start;">
  <a href="/find?specialty=weight-loss" class="qf-pill" data-i18n="filter_weight_loss">Weight Loss</a>
  <a href="/find?specialty=strength" class="qf-pill" data-i18n="filter_strength">Strength</a>
  <a href="/find?specialty=hiit" class="qf-pill">HIIT</a>
  <a href="/find?specialty=nutrition" class="qf-pill" data-i18n="filter_nutrition">Nutrition</a>
</div>
```

- [ ] **Step 4: Verify**

```bash
npm run dev
```

Open http://localhost:4321/landing. Hero left column should have: eyebrow → h1 → subtitle → CTAs → search → 4 pills → trust strip. No fake avatars.

- [ ] **Step 5: Commit**

```bash
git add src/pages/landing.astro
git commit -m "design: remove fake social proof avatars, trim hero to 4 filter pills"
```

---

## Task 5: Blog Featured Card — Remove Empty Visual

**Files:**
- Modify: `src/pages/landing.astro` (blog HTML + CSS, ~lines 594–626)

**Why:** The featured blog card has a `.blog-visual` div that renders as an empty warm-gray rectangle. It exists to fill a 2-column grid layout but adds no information. Nike/Apple let type carry the weight. Remove the div and make the featured card single-column.

- [ ] **Step 1: Remove `.blog-visual` div from featured card**

Find in the `<a href="/blog" class="blog-card featured">` block:
```html
<div class="blog-visual" style="background:linear-gradient(135deg,#F5F4F3 0%,#E8E5E2 100%)" aria-hidden="true"></div>
```

Delete that line entirely.

- [ ] **Step 2: Change featured card to single-column layout**

Find:
```css
.blog-card.featured { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: center; }
```

Replace with:
```css
.blog-card.featured { display: block; }
```

- [ ] **Step 3: Remove .blog-visual CSS rule**

Find and delete:
```css
.blog-visual { background: var(--surface-2); border-radius: 12px; aspect-ratio: 4/3; display: flex; align-items: center; justify-content: center; }
```

- [ ] **Step 4: Remove the mobile override for featured grid**

Find:
```css
@media (max-width: 720px) { .blog-grid { grid-template-columns: 1fr; } .blog-card.featured { grid-template-columns: 1fr; } }
```

Replace with (keep blog-grid mobile rule, drop the redundant featured override):
```css
@media (max-width: 720px) { .blog-grid { grid-template-columns: 1fr; } }
```

- [ ] **Step 5: Make featured card title larger to carry more visual weight**

Find:
```css
.blog-title { font-family: 'Manrope', system-ui, sans-serif; font-weight: 800; font-size: 20px; letter-spacing: -0.5px; line-height: 1.25; margin-bottom: 10px; }
```

Replace with:
```css
.blog-title { font-family: 'Manrope', system-ui, sans-serif; font-weight: 800; font-size: 20px; letter-spacing: -0.03em; line-height: 1.25; margin-bottom: 10px; }
.blog-card.featured .blog-title { font-size: 26px; }
```

- [ ] **Step 6: Verify**

```bash
npm run dev
```

Open http://localhost:4321/landing. The featured blog card should be full-width text only — no gray box. The title should be visually heavier than the 2 smaller cards.

- [ ] **Step 7: Commit**

```bash
git add src/pages/landing.astro
git commit -m "design: remove empty blog visual, let type carry featured card"
```

---

## Task 6: Unify Card Radii + Fix Invisible Dot Bug

**Files:**
- Modify: `src/pages/landing.astro` (CSS)

**Why:** Landing has 22px (ecard), 16px (transform, blog), 14px (stat, t-card), 12px (blog-visual, transform-avatar) — 4 different card radii. Standardize to 16px for all cards. Also fix: `.card-dot-off` uses `var(--surface-3)` which is not defined in landing.astro's `:root`, making off-dots invisible.

- [ ] **Step 1: Fix ecard radius (22px → 16px)**

Find:
```css
.ecard {
  border-radius: 22px;
```

Replace with:
```css
.ecard {
  border-radius: 16px;
```

- [ ] **Step 2: Unify stat-card and t-card radius**

Find:
```css
.stat-card {
  background: var(--surface);
  border-radius: 14px;
```

Replace with:
```css
.stat-card {
  background: var(--surface);
  border-radius: 16px;
```

Find:
```css
.t-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 14px;
```

Replace with:
```css
.t-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 16px;
```

- [ ] **Step 3: Fix invisible card-dot-off**

Find in the `:root` block in `landing.astro`:
```css
:root {
  --bg:        #EDECEA;
  --surface:   #F7F5F3;
  --surface-2: #E8E5E2;
```

Add `--surface-3` after `--surface-2`:
```css
:root {
  --bg:        #EDECEA;
  --surface:   #F7F5F3;
  --surface-2: #E8E5E2;
  --surface-3: #D5D1CE;
```

- [ ] **Step 4: Verify**

```bash
npm run dev
```

Open http://localhost:4321/landing. The hero trainer card corners should be 16px (slightly less curved than before). Scroll down — stat cards, t-cards, blog cards, transform cards all feel visually unified. The hero slide dots should be visible: one wide dark dot + two small gray dots.

- [ ] **Step 5: Push to main**

```bash
git add src/pages/landing.astro
git commit -m "design: unify card radii to 16px, fix invisible slide indicator dots"
git push origin main
```

---

## Self-Review

**Spec coverage check:**
- [x] Font inconsistency (DM Sans → Manrope) — Task 1
- [x] UPPERCASE eyebrows — Task 3
- [x] Fake social proof (AK/SL/MR avatars) — Task 4
- [x] Nav clutter (Community removed) — Task 2
- [x] Empty blog placeholder — Task 5
- [x] Inconsistent radii — Task 6
- [x] translateY hover — Task 3

**Placeholder scan:** No TBDs or incomplete steps. Every step has explicit before/after code.

**Consistency check:** All references to `'DM Sans'` → `'Manrope'` happen in Task 1 before any other task uses font-family. `--surface-3` is added in Task 6 Step 3 before it's referenced anywhere. No cross-task naming mismatches.
