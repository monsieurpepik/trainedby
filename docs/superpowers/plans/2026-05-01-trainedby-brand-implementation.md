# TrainedBy Premium Brand — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved premium brand system — pure black background, #D4622A orange arc with Banksy-stencil gradient, Georgia italic for trainer names — across the find page and trainer profile page.

**Architecture:** Six self-contained tasks. Tasks 1–2 set global tokens, Tasks 3–5 update find.astro in layers (hero, filters, cards), Task 6 updates [slug].astro. Each task compiles and looks correct on its own; later tasks build on earlier ones.

**Tech Stack:** Astro SSR, inline CSS variables, SVG, vanilla JS template strings. No build step to run — `npm run dev` serves immediately.

**Design reference:** `docs/superpowers/specs/2026-05-01-trainedby-brand-design.md`  
**Approved mockup:** `.superpowers/brainstorm/44809-1777664879/content/arc-final.html`

---

## File Map

| File | Action | What changes |
|---|---|---|
| `tailwind.config.js` | Modify | `brand` token `#FF5C00 → #D4622A`, add `display` font family |
| `src/layouts/Base.astro` | Modify | `--brand: #D4622A` default + all computed dim/border/glow variants |
| `src/components/ArcHeader.astro` | **Create** | Reusable browse-variant arc SVG component |
| `src/pages/find.astro` | Modify (3 tasks) | Hero → ArcHeader, filter chip CSS, rewrite `trainerCardHTML()` |
| `src/pages/[slug].astro` | Modify | Arc SVG in hero, Georgia italic name, #D4622A everywhere |

---

## Task 1: Update Brand Tokens

Update the two sources of truth for the brand color so all downstream `var(--brand)` references pick up the new orange automatically.

**Files:**
- Modify: `tailwind.config.js:13-14`
- Modify: `src/layouts/Base.astro:138-141` (and related dim/border/glow lines)

- [ ] **Step 1: Open tailwind.config.js and update brand token**

Replace lines 13–14:
```js
// BEFORE
brand: '#FF5C00',
'brand-dim': 'rgba(255,92,0,0.15)',
'brand-border': 'rgba(255,92,0,0.3)',

// AFTER
brand: '#D4622A',
'brand-dim': 'rgba(212,98,42,0.15)',
'brand-border': 'rgba(212,98,42,0.3)',
```

Also add a `display` font family below `body`:
```js
fontFamily: {
  heading: ['Manrope', 'sans-serif'],
  body: ['Inter', 'sans-serif'],
  display: ['Georgia', 'Times New Roman', 'serif'],
},
```

- [ ] **Step 2: Open src/layouts/Base.astro and update the default --brand block**

Find the CSS block that reads `--brand: #FF5C00;` (around line 138). It looks like:
```css
--brand: #FF5C00;
--brand-hover: #e05200;
--brand-dim: rgba(255,92,0,0.12);
--brand-border: rgba(255,92,0,0.25);
--brand-glow: rgba(255,92,0,0.4);
```

Replace with:
```css
--brand: #D4622A;
--brand-hover: #c05020;
--brand-dim: rgba(212,98,42,0.12);
--brand-border: rgba(212,98,42,0.25);
--brand-glow: rgba(212,98,42,0.4);
```

Do NOT change the market-specific overrides (the `[data-market="uk"]`, `[data-market="in"]` blocks) — those have their own brand colors (blue, red, gold) that stay as-is. Only change the default block.

- [ ] **Step 3: Start dev server and confirm color change propagates**

```bash
cd /Users/bobanpepic/trainedby && npm run dev
```

Open `localhost:4321/find` in a browser. The nav "Get Your Page →" button and the hero eyebrow badge should now be #D4622A (darker burnt orange) instead of the brighter #FF5C00. If the brand still looks bright orange, check you edited the right block in Base.astro.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.js src/layouts/Base.astro
git commit -m "feat: update brand token #FF5C00 → #D4622A and add display font family"
```

---

## Task 2: Create ArcHeader.astro Component

A zero-JS Astro component that renders the browse-variant arc SVG for use in the find page hero. Pure SVG, no JavaScript, accepts a `brandLabel` string prop.

**Files:**
- Create: `src/components/ArcHeader.astro`

- [ ] **Step 1: Create the file**

Create `src/components/ArcHeader.astro` with this exact content:

```astro
---
/**
 * ArcHeader — Browse variant
 * Premium brand arc: pure black background, orange gradient arc rising
 * bottom-left to top-right, tight burst detonation at peak (top-right).
 *
 * Usage:
 *   <ArcHeader brandLabel="TrainedBy" />
 *
 * The arc SVG fills the container absolutely. Wrap in a positioned element
 * with height set (e.g. position:relative; height:240px; overflow:hidden).
 */
interface Props {
  brandLabel?: string;
}
const { brandLabel = 'TrainedBy' } = Astro.props;
---

<svg
  aria-hidden="true"
  style="position:absolute;inset:0;width:100%;height:100%"
  viewBox="0 0 390 240"
  preserveAspectRatio="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <defs>
    <linearGradient id="arc-browse-mass" x1="-40" y1="240" x2="420" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="rgba(212,98,42,0.0)"/>
      <stop offset="28%"  stop-color="rgba(212,98,42,0.16)"/>
      <stop offset="65%"  stop-color="rgba(212,98,42,0.55)"/>
      <stop offset="100%" stop-color="#D4622A"/>
    </linearGradient>
    <linearGradient id="arc-browse-hair" x1="-40" y1="240" x2="420" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="rgba(212,98,42,0.0)"/>
      <stop offset="32%"  stop-color="rgba(212,98,42,0.42)"/>
      <stop offset="100%" stop-color="rgba(212,98,42,0.88)"/>
    </linearGradient>
    <filter id="arc-browse-coreglow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="arc-browse-midspark" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="2.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Arc layer 1: stencil mass -->
  <path d="M -40 240 Q 120 160 225 90 Q 330 22 420 -5"
        stroke="url(#arc-browse-mass)" stroke-width="60" fill="none" stroke-linecap="butt"/>
  <!-- Arc layer 2: inner dark bite -->
  <path d="M -40 240 Q 120 160 225 90 Q 330 22 420 -5"
        stroke="rgba(10,10,10,0.55)" stroke-width="36" fill="none" stroke-linecap="butt"/>
  <!-- Arc layer 3: hairline -->
  <path d="M -40 240 Q 120 160 225 90 Q 330 22 420 -5"
        stroke="url(#arc-browse-hair)" stroke-width="1.6" fill="none" stroke-linecap="round"/>

  <!-- Burst: core fragments -->
  <g filter="url(#arc-browse-coreglow)">
    <circle cx="380" cy="16"  r="11"  fill="rgba(212,98,42,0.93)"/>
    <circle cx="363" cy="26"  r="8.5" fill="rgba(212,98,42,0.86)"/>
    <circle cx="394" cy="8"   r="7.5" fill="rgba(232,120,52,0.88)"/>
    <circle cx="370" cy="6"   r="6.5" fill="rgba(212,98,42,0.82)"/>
    <circle cx="390" cy="36"  r="5.5" fill="rgba(212,98,42,0.76)"/>
  </g>

  <!-- Burst: mid sparks -->
  <g filter="url(#arc-browse-midspark)">
    <circle cx="348" cy="14"  r="4.5" fill="rgba(212,98,42,0.66)"/>
    <circle cx="365" cy="-4"  r="4"   fill="rgba(212,98,42,0.60)"/>
    <circle cx="345" cy="40"  r="4"   fill="rgba(212,98,42,0.52)"/>
    <circle cx="372" cy="46"  r="3.5" fill="rgba(212,98,42,0.46)"/>
    <circle cx="330" cy="26"  r="3"   fill="rgba(212,98,42,0.42)"/>
    <circle cx="350" cy="56"  r="3"   fill="rgba(212,98,42,0.36)"/>
    <circle cx="380" cy="-14" r="3"   fill="rgba(212,98,42,0.48)"/>
  </g>

  <!-- Burst: outer fragments -->
  <circle cx="314" cy="40"  r="2.5" fill="rgba(212,98,42,0.26)"/>
  <circle cx="325" cy="56"  r="2"   fill="rgba(212,98,42,0.20)"/>
  <circle cx="336" cy="68"  r="1.5" fill="rgba(212,98,42,0.16)"/>
  <circle cx="304" cy="54"  r="1.5" fill="rgba(212,98,42,0.14)"/>
  <circle cx="318" cy="72"  r="1"   fill="rgba(212,98,42,0.10)"/>
  <circle cx="295" cy="66"  r="1"   fill="rgba(212,98,42,0.08)"/>
  <!-- Above-frame sparks -->
  <circle cx="370" cy="-20" r="2"   fill="rgba(212,98,42,0.34)"/>
  <circle cx="382" cy="-30" r="1.5" fill="rgba(212,98,42,0.22)"/>
</svg>
```

Note: the component renders only the SVG. The parent element in find.astro must be `position:relative; overflow:hidden` with the height set.

- [ ] **Step 2: Verify Astro can import it**

In a terminal, check for syntax errors by running the dev server (if not already running):

```bash
cd /Users/bobanpepic/trainedby && npm run dev
```

No compile errors should appear for the new file. If there's a "Props is not defined" error, ensure the frontmatter block (the `---` fences) is correct.

- [ ] **Step 3: Commit**

```bash
git add src/components/ArcHeader.astro
git commit -m "feat: add ArcHeader component — browse variant arc SVG"
```

---

## Task 3: Update find.astro Hero Section

Replace the current `.hero` div (centered title + radial gradient background) with the arc browse header. The search bar stays, moved directly below the arc.

**Files:**
- Modify: `src/pages/find.astro`

The hero block starts at line 242 with `<div class="hero">` and ends at line 249 with `</div>`. The `.hero` CSS class block runs from approximately line 42–56.

- [ ] **Step 1: Add ArcHeader import to the frontmatter**

The frontmatter block at the top of find.astro (lines 1–6) currently reads:
```astro
---
import Base from '../layouts/Base.astro';
import { getMarket } from '../lib/market.ts';
const market = getMarket(Astro.url.hostname);
const brandName = market.brandName;
---
```

Add the ArcHeader import:
```astro
---
import Base from '../layouts/Base.astro';
import ArcHeader from '../components/ArcHeader.astro';
import { getMarket } from '../lib/market.ts';
const market = getMarket(Astro.url.hostname);
const brandName = market.brandName;
---
```

- [ ] **Step 2: Remove the old .hero CSS block**

Find the `.hero` CSS block in the `<style>` tag (around lines 42–56):
```css
/* HERO */
.hero{
  padding:48px 20px 32px;
  text-align:center;
  background:radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,92,0,0.08) 0%, transparent 70%);
}
.hero-eyebrow{
  display:inline-flex;align-items:center;gap:6px;
  background:var(--orange-dim);border:1px solid var(--brand-border, rgba(255,92,0,0.2));
  border-radius:20px;padding:4px 12px;
  font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:var(--brand);
  margin-bottom:16px;
}
.hero h1{font-size:clamp(26px,6vw,40px);font-weight:800;letter-spacing:-0.03em;line-height:1.15;margin-bottom:10px}
.hero p{font-size:15px;color:var(--white-60);max-width:480px;margin:0 auto 28px}
```

Delete this entire block (all 12 lines). Also delete the `.search-wrap` block that follows (approximately lines 59–70) — the search bar will inherit base styles but we'll restyle it below.

Actually: **keep the `.search-wrap` CSS** — only delete the `.hero` and `.hero-eyebrow` and `hero h1` and `.hero p` lines.

- [ ] **Step 3: Add the new arc hero CSS**

After the `/* NAV */` section ends (after the `.nav-cta` closing brace), add this new block:

```css
/* ARC HERO */
.arc-hero{
  position:relative;height:240px;background:#0A0A0A;overflow:hidden;
  margin-bottom:0;
}
.arc-hero-text{
  position:absolute;inset:0;padding:28px 24px;
  display:flex;flex-direction:column;justify-content:flex-end;
  padding-bottom:28px;
}
.arc-hero-brand{
  font-size:9px;letter-spacing:0.2em;text-transform:uppercase;
  color:rgba(255,255,255,0.14);font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;
  font-weight:700;margin-bottom:14px;
}
.arc-hero-title{
  font-size:32px;font-weight:900;color:#FAFAFA;
  font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;
  letter-spacing:-0.03em;line-height:1.1;margin-bottom:8px;
}
.arc-hero-sub{
  font-size:12px;color:rgba(255,255,255,0.25);
  font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;
}
```

- [ ] **Step 4: Replace the hero HTML**

Find the old hero HTML block (lines 242–249):
```html
<div class="hero">
  <div class="hero-eyebrow">
    <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="4"/></svg>
    {market.certificationBody.endsWith('Verified') ? market.certificationBody + ' Trainers' : market.certificationBody + ' Verified Trainers'}
  </div>
  <h1 data-i18n="find.title">Find Your Perfect<br>Personal Trainer</h1>
  <p data-i18n="find.sub">{market.i18nLocale === 'fr' ? 'Parcourez les coachs certifiés...' : ...}</p>
</div>
```

Replace with:
```astro
<div class="arc-hero">
  <ArcHeader brandLabel={brandName} />
  <div class="arc-hero-text">
    <div class="arc-hero-brand">{brandName}</div>
    <div class="arc-hero-title">Find your<br>trainer.</div>
    <div class="arc-hero-sub" id="heroSubCount">Browse verified trainers</div>
  </div>
</div>
```

The `#heroSubCount` element gets its text updated by JavaScript after data loads (Task 5 handles this).

- [ ] **Step 5: Verify the arc hero renders**

With the dev server running, open `localhost:4321/find`. You should see:
- Pure black (#0A0A0A) header area, 240px tall
- Orange arc rising from bottom-left to top-right with burst at top-right
- Left-aligned text: small "TrainedBy" ghost label at top, large "Find your trainer." title
- Below the arc: the search bar and filter chips as before

If the arc doesn't appear, check that `ArcHeader` is imported and the `.arc-hero` has `position:relative; overflow:hidden`.

- [ ] **Step 6: Commit**

```bash
git add src/pages/find.astro
git commit -m "feat: replace find.astro hero with premium arc browse header"
```

---

## Task 4: Update find.astro Filter Chips

Update filter chip styles to match the spec: pill shape (border-radius:100px), uppercase tracking, solid orange active state with black text, ghost inactive state.

**Files:**
- Modify: `src/pages/find.astro` (CSS only, `<style>` block)

The current `.filter-btn` block is approximately lines 78–86.

- [ ] **Step 1: Replace the filter CSS block**

Find:
```css
.filter-btn{
  flex-shrink:0;padding:7px 14px;border-radius:20px;
  border:1px solid var(--glass-border);background:var(--glass);
  color:var(--white-60);font-size:12px;font-weight:600;cursor:pointer;
  transition:all 0.15s;white-space:nowrap;font-family:var(--font);
}
.filter-btn:hover{border-color:var(--brand);color:var(--brand)}
.filter-btn.active{background:var(--orange-dim);border-color:var(--brand-glow, rgba(255,92,0,0.4));color:var(--brand)}
```

Replace with:
```css
.filter-btn{
  flex-shrink:0;padding:8px 16px;border-radius:100px;
  border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.05);
  color:rgba(255,255,255,0.38);font-size:10px;font-weight:600;cursor:pointer;
  transition:all 0.15s;white-space:nowrap;
  font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;
  letter-spacing:0.06em;text-transform:uppercase;
}
.filter-btn:hover{border-color:rgba(212,98,42,0.4);color:rgba(255,255,255,0.65)}
.filter-btn.active{
  background:#D4622A;border-color:#D4622A;
  color:#0A0A0A;font-weight:700;
}
```

- [ ] **Step 2: Update the .filters container padding**

Find:
```css
.filters{
  display:flex;gap:8px;overflow-x:auto;padding:0 20px 4px;
  scrollbar-width:none;-webkit-overflow-scrolling:touch;
  max-width:900px;margin:0 auto 28px;
}
```

Replace with:
```css
.filters{
  display:flex;gap:8px;overflow-x:auto;padding:16px 24px 12px;
  scrollbar-width:none;-webkit-overflow-scrolling:touch;
  max-width:900px;margin:0 auto 0;
}
```

- [ ] **Step 3: Verify chips render correctly**

In the browser at `localhost:4321/find`:
- Filter chips should be pill-shaped (rounded pill, not rounded rectangle)
- Inactive chips: ghost style — nearly invisible background, muted text
- Active chip ("All Trainers"): solid #D4622A fill, black text
- Hover: subtle orange tint on border

- [ ] **Step 4: Commit**

```bash
git add src/pages/find.astro
git commit -m "feat: update find.astro filter chips to premium pill style"
```

---

## Task 5: Rewrite find.astro Trainer Card Design

Replace the existing `trainerCardHTML()` function with the new card design: pure black card, arc SVG in hero, avatar bottom-left, Georgia italic trainer name, 3-column stats grid, pill CTA.

**Files:**
- Modify: `src/pages/find.astro` (CSS + JS `trainerCardHTML()` function)

**SVG ID collision warning:** When multiple cards are on the same page, SVG `<defs>` elements with identical `id` attributes will conflict — only the first definition wins. The gradient IDs must be unique per card. Use the trainer's ID in the gradient IDs: `arc-${t.id}-mass`, `arc-${t.id}-hair`, etc.

- [ ] **Step 1: Replace the trainer card CSS**

Find the block from `.trainer-card` through `.card-wa` (approximately lines 110–177). Delete it entirely and replace with:

```css
/* TRAINER CARD — new premium arc design */
.trainer-card{
  background:#0A0A0A;
  border-radius:24px;
  overflow:hidden;
  cursor:pointer;
  transition:transform 0.15s,box-shadow 0.15s;
  text-decoration:none;
  display:block;
  border:1px solid rgba(255,255,255,0.06);
}
.trainer-card:hover{
  transform:translateY(-2px);
  box-shadow:0 8px 32px rgba(0,0,0,0.6);
}
.tc-hero{position:relative;height:320px;background:#0A0A0A;overflow:hidden}
.tc-brand{
  position:absolute;top:22px;left:22px;
  font-size:9px;letter-spacing:0.2em;text-transform:uppercase;
  color:rgba(255,255,255,0.14);
  font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;
  font-weight:700;
}
.tc-location{
  position:absolute;top:22px;right:22px;
  background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);
  border-radius:100px;padding:5px 13px;backdrop-filter:blur(12px);
  font-size:10px;font-weight:700;color:rgba(255,255,255,0.45);
  letter-spacing:0.08em;text-transform:uppercase;
  font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;
}
.tc-avatar{
  position:absolute;bottom:24px;left:24px;
  width:72px;height:72px;border-radius:50%;
  background:rgba(212,98,42,0.08);border:1.5px solid rgba(212,98,42,0.25);
  display:flex;align-items:center;justify-content:center;
  overflow:hidden;
}
.tc-avatar-initials{
  font-size:22px;font-weight:800;color:#D4622A;
  font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;
}
.tc-avatar img{width:100%;height:100%;object-fit:cover}
.tc-body{padding:24px}
.tc-specialty{
  font-size:10px;letter-spacing:0.16em;text-transform:uppercase;
  color:rgba(255,255,255,0.22);margin-bottom:8px;
  font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;
  font-weight:600;
}
.tc-name{
  font-size:36px;font-weight:700;color:#FAFAFA;
  font-family:Georgia,'Times New Roman',serif;
  letter-spacing:-0.015em;line-height:1.05;
  font-style:italic;margin-bottom:4px;
}
.tc-sep{width:32px;height:1.5px;background:#D4622A;margin:14px 0}
.tc-meta{
  font-size:12px;color:rgba(255,255,255,0.24);
  font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;
  margin-bottom:20px;
}
.tc-stats{
  display:flex;margin-bottom:24px;
  border:1px solid rgba(255,255,255,0.06);border-radius:14px;overflow:hidden;
}
.tc-stat{flex:1;padding:14px 16px;border-right:1px solid rgba(255,255,255,0.06)}
.tc-stat:last-child{border-right:none}
.tc-stat-val{
  font-size:22px;font-weight:800;color:#FAFAFA;
  font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;
  letter-spacing:-0.02em;
}
.tc-stat-val.orange{color:#D4622A}
.tc-stat-lbl{
  font-size:9px;color:rgba(255,255,255,0.22);
  letter-spacing:0.1em;text-transform:uppercase;
  font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;
  margin-top:2px;
}
.tc-cta{
  background:#D4622A;color:#0A0A0A;font-size:12px;font-weight:800;
  text-align:center;padding:16px;border-radius:100px;
  font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;
  letter-spacing:0.1em;text-transform:uppercase;
}
```

Also delete these CSS blocks that are no longer needed (they were part of the old card design):
- `.card-cover`, `.card-cover-overlay`, `.card-mode-tags`, `.card-mode.*` (lines ~128–134)
- `.card-body`, `.card-top`, `.card-avatar`, `.card-info`, `.card-name`, `.card-verified`, `.card-title` (lines ~136–152)
- `.card-tags`, `.card-tag` (lines ~154–155)
- `.card-stats`, `.card-stat`, `.cs-val`, `.cs-lbl` (lines ~157–162)
- `.card-footer`, `.card-price`, `.card-wa` (lines ~163–178)
- `.card-rating`, `.card-stars`, `.cs.f`, `.cs.e`, `.card-rating-score`, `.card-rating-count` (lines ~181–186)

Keep: `.skeleton-card`, `.skel`, `@keyframes shimmer`, `.skel-*` (loading skeletons — unchanged)  
Keep: `.empty-state` (unchanged)  
Keep: `.load-more-wrap`, `.btn-load-more` (unchanged)

- [ ] **Step 2: Rewrite the trainerCardHTML() function**

Find the `function trainerCardHTML(t) {` block (approximately lines 467–521). Replace the entire function body with:

```js
function trainerCardHTML(t) {
  const name = t.full_name || t.name || 'Trainer';
  const firstName = name.split(' ')[0] || name;
  const lastName = name.split(' ').slice(1).join(' ') || '';
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const slug = t.slug || t.id;
  const specialty = (t.specialties || [])[0] || 'Personal Trainer';
  const certStr = (t.certifications || []).slice(0, 2).join(' · ');
  const yearsStr = t.years_experience ? ` · ${t.years_experience} years` : '';
  const metaLine = [certStr, yearsStr].filter(Boolean).join('');
  const rating = t.avg_rating ? parseFloat(t.avg_rating).toFixed(1) + '★' : '—';
  const clients = t.clients_trained || '—';
  const currency = window.__CURRENCY__ || '';
  const price = t.min_price ? `${currency} ${t.min_price.toLocaleString()}`.trim() : '—';
  const city = t.city || '';

  // Unique gradient IDs per card to prevent SVG defs collision
  const uid = t.id || slug;
  const arcMass = `arc-${uid}-mass`;
  const arcHair = `arc-${uid}-hair`;
  const arcGlow = `arc-${uid}-glow`;
  const arcSpark = `arc-${uid}-spark`;

  const avatarContent = t.avatar_url
    ? `<img src="${t.avatar_url}" alt="${name}" loading="lazy">`
    : `<div class="tc-avatar-initials">${initials}</div>`;

  const arc = `
<svg aria-hidden="true" style="position:absolute;inset:0;width:100%;height:100%"
     viewBox="0 0 390 320" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${arcMass}" x1="-30" y1="320" x2="400" y2="10" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="rgba(212,98,42,0.0)"/>
      <stop offset="30%"  stop-color="rgba(212,98,42,0.18)"/>
      <stop offset="65%"  stop-color="rgba(212,98,42,0.58)"/>
      <stop offset="100%" stop-color="#D4622A"/>
    </linearGradient>
    <linearGradient id="${arcHair}" x1="-30" y1="320" x2="400" y2="10" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="rgba(212,98,42,0.0)"/>
      <stop offset="35%"  stop-color="rgba(212,98,42,0.45)"/>
      <stop offset="100%" stop-color="rgba(212,98,42,0.90)"/>
    </linearGradient>
    <filter id="${arcGlow}" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="7" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="${arcSpark}" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <path d="M -30 320 Q 100 240 195 155 Q 295 65 400 18"
        stroke="url(#${arcMass})" stroke-width="64" fill="none" stroke-linecap="butt"/>
  <path d="M -30 320 Q 100 240 195 155 Q 295 65 400 18"
        stroke="rgba(10,10,10,0.58)" stroke-width="38" fill="none" stroke-linecap="butt"/>
  <path d="M -30 320 Q 100 240 195 155 Q 295 65 400 18"
        stroke="url(#${arcHair})" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  <g filter="url(#${arcGlow})">
    <circle cx="372" cy="24" r="12" fill="rgba(212,98,42,0.95)"/>
    <circle cx="354" cy="34" r="9"  fill="rgba(212,98,42,0.88)"/>
    <circle cx="388" cy="14" r="8"  fill="rgba(232,120,52,0.90)"/>
    <circle cx="362" cy="10" r="7"  fill="rgba(212,98,42,0.84)"/>
    <circle cx="385" cy="40" r="6"  fill="rgba(212,98,42,0.78)"/>
  </g>
  <g filter="url(#${arcSpark})">
    <circle cx="342" cy="18" r="5"   fill="rgba(212,98,42,0.68)"/>
    <circle cx="360" cy="2"  r="4.5" fill="rgba(212,98,42,0.62)"/>
    <circle cx="395" cy="26" r="4"   fill="rgba(212,98,42,0.58)"/>
    <circle cx="338" cy="44" r="4"   fill="rgba(212,98,42,0.52)"/>
    <circle cx="370" cy="50" r="3.5" fill="rgba(212,98,42,0.48)"/>
    <circle cx="325" cy="30" r="3"   fill="rgba(212,98,42,0.44)"/>
    <circle cx="348" cy="60" r="3"   fill="rgba(212,98,42,0.38)"/>
    <circle cx="380" cy="-10" r="3"  fill="rgba(212,98,42,0.50)"/>
    <circle cx="400" cy="48" r="2.5" fill="rgba(212,98,42,0.36)"/>
  </g>
  <circle cx="310" cy="42" r="2.5" fill="rgba(212,98,42,0.28)"/>
  <circle cx="325" cy="58" r="2"   fill="rgba(212,98,42,0.22)"/>
  <circle cx="338" cy="72" r="2"   fill="rgba(212,98,42,0.18)"/>
  <circle cx="300" cy="56" r="1.5" fill="rgba(212,98,42,0.16)"/>
  <circle cx="315" cy="74" r="1.5" fill="rgba(212,98,42,0.12)"/>
  <circle cx="368" cy="-16" r="2.5" fill="rgba(212,98,42,0.38)"/>
  <circle cx="382" cy="-28" r="1.5" fill="rgba(212,98,42,0.24)"/>
</svg>`;

  return `
<a href="/${slug}" class="trainer-card">
  <div class="tc-hero">
    ${arc}
    <div class="tc-brand">TrainedBy</div>
    ${city ? `<div class="tc-location">${city}</div>` : ''}
    <div class="tc-avatar">${avatarContent}</div>
  </div>
  <div class="tc-body">
    <div class="tc-specialty">${specialty}</div>
    <div class="tc-name">${firstName}${lastName ? '<br>' + lastName : ''}</div>
    <div class="tc-sep"></div>
    <div class="tc-meta">${metaLine || specialty}</div>
    <div class="tc-stats">
      <div class="tc-stat">
        <div class="tc-stat-val">${clients}</div>
        <div class="tc-stat-lbl">Clients</div>
      </div>
      <div class="tc-stat">
        <div class="tc-stat-val">${rating}</div>
        <div class="tc-stat-lbl">Rating</div>
      </div>
      <div class="tc-stat">
        <div class="tc-stat-val orange">${price}</div>
        <div class="tc-stat-lbl">/ session</div>
      </div>
    </div>
    <div class="tc-cta">Book a session</div>
  </div>
</a>`;
}
```

- [ ] **Step 3: Update the hero subcount text in renderGrid()**

Find this line in `renderGrid()`:
```js
document.getElementById('resultsCount').textContent =
  filtered.length === 0 ? 'No trainers found' :
  `${filtered.length} verified trainer${filtered.length !== 1 ? 's' : ''}`;
```

Add one line directly after it to update the arc hero subtitle:
```js
const heroSub = document.getElementById('heroSubCount');
if (heroSub) heroSub.textContent = filtered.length > 0
  ? `${filtered.length} verified trainer${filtered.length !== 1 ? 's' : ''} near you`
  : 'Browse verified trainers';
```

- [ ] **Step 4: Update the trainer grid CSS**

The current `#trainerGrid` uses `minmax(260px,1fr)`. The new cards are taller (320px hero) so the minimum width should be wider:

Find:
```css
#trainerGrid{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(260px,1fr));
  gap:14px;
}
```

Replace with:
```css
#trainerGrid{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(300px,1fr));
  gap:20px;
}
```

- [ ] **Step 5: Verify trainer cards render correctly**

In the browser at `localhost:4321/find`:
- Each trainer card should be a black rectangle with arc SVG in the upper portion (320px tall hero)
- Avatar circle (72px) sits in the bottom-left of the hero
- Trainer name appears below in Georgia italic at 36px
- Orange 32px separator line
- Stats grid with 3 columns (clients / rating / price)
- Price is #D4622A orange
- "Book a session" pill CTA at bottom, solid orange, black text, border-radius:100px
- Multiple cards on screen should each have their OWN independent arc (check: gradient colors consistent across all cards)

- [ ] **Step 6: Commit**

```bash
git add src/pages/find.astro
git commit -m "feat: rewrite find.astro trainer cards to premium arc card design"
```

---

## Task 6: Update [slug].astro — Arc Hero + Georgia Name + Brand Colors

Add the arc SVG overlay to the profile hero, update the trainer name to Georgia italic, and replace all hardcoded `#FF5C00` with `#D4622A` throughout the page.

**Files:**
- Modify: `src/pages/[slug].astro`

All changes are inside the `<script>` tag — the `renderProfile()`, `showErr()`, and `makeAvatarFallback()` functions generate HTML strings with inline styles.

- [ ] **Step 1: Update makeAvatarFallback() brand color**

Find in `makeAvatarFallback()` (approximately line 239):
```js
const brandColor = getComputedStyle(document.documentElement).getPropertyValue('--brand').trim() || '#FF5C00';
```

The `--brand` CSS variable will now return `#D4622A` after Task 1. The fallback hardcode also needs updating:
```js
const brandColor = getComputedStyle(document.documentElement).getPropertyValue('--brand').trim() || '#D4622A';
```

- [ ] **Step 2: Add arc SVG to renderProfile() hero region**

Find the hero div inside `renderProfile()` (approximately line 377):
```js
<div style="position:relative;height:240px;background:linear-gradient(135deg,#1a1a1a,#0a0a0a)">
  ${photoUrl ? `<img data-hero="1" src="${photoUrl}" ...>` : ''}
  <div style="position:absolute;inset:0;background:linear-gradient(to bottom,transparent 30%,rgba(0,0,0,0.75) 100%)"></div>
```

Change the hero div opening style from `background:linear-gradient(135deg,#1a1a1a,#0a0a0a)` to `background:#0A0A0A`, and add the arc SVG immediately after it (before the photo img). The arc appears as a layer between the black background and the photo overlay gradient:

```js
<div style="position:relative;height:240px;background:#0A0A0A">
  <svg aria-hidden="true" style="position:absolute;inset:0;width:100%;height:100%;z-index:0"
       viewBox="0 0 390 240" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="slug-arc-mass" x1="-40" y1="240" x2="420" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stop-color="rgba(212,98,42,0.0)"/>
        <stop offset="28%"  stop-color="rgba(212,98,42,0.16)"/>
        <stop offset="65%"  stop-color="rgba(212,98,42,0.55)"/>
        <stop offset="100%" stop-color="#D4622A"/>
      </linearGradient>
      <linearGradient id="slug-arc-hair" x1="-40" y1="240" x2="420" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stop-color="rgba(212,98,42,0.0)"/>
        <stop offset="32%"  stop-color="rgba(212,98,42,0.42)"/>
        <stop offset="100%" stop-color="rgba(212,98,42,0.88)"/>
      </linearGradient>
      <filter id="slug-arc-glow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="6" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="slug-arc-spark" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="2.5" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <path d="M -40 240 Q 120 160 225 90 Q 330 22 420 -5"
          stroke="url(#slug-arc-mass)" stroke-width="60" fill="none" stroke-linecap="butt"/>
    <path d="M -40 240 Q 120 160 225 90 Q 330 22 420 -5"
          stroke="rgba(10,10,10,0.55)" stroke-width="36" fill="none" stroke-linecap="butt"/>
    <path d="M -40 240 Q 120 160 225 90 Q 330 22 420 -5"
          stroke="url(#slug-arc-hair)" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <g filter="url(#slug-arc-glow)">
      <circle cx="380" cy="16" r="11" fill="rgba(212,98,42,0.93)"/>
      <circle cx="363" cy="26" r="8.5" fill="rgba(212,98,42,0.86)"/>
      <circle cx="394" cy="8"  r="7.5" fill="rgba(232,120,52,0.88)"/>
      <circle cx="370" cy="6"  r="6.5" fill="rgba(212,98,42,0.82)"/>
      <circle cx="390" cy="36" r="5.5" fill="rgba(212,98,42,0.76)"/>
    </g>
    <g filter="url(#slug-arc-spark)">
      <circle cx="348" cy="14" r="4.5" fill="rgba(212,98,42,0.66)"/>
      <circle cx="365" cy="-4" r="4"   fill="rgba(212,98,42,0.60)"/>
      <circle cx="345" cy="40" r="4"   fill="rgba(212,98,42,0.52)"/>
      <circle cx="372" cy="46" r="3.5" fill="rgba(212,98,42,0.46)"/>
      <circle cx="330" cy="26" r="3"   fill="rgba(212,98,42,0.42)"/>
      <circle cx="350" cy="56" r="3"   fill="rgba(212,98,42,0.36)"/>
      <circle cx="380" cy="-14" r="3"  fill="rgba(212,98,42,0.48)"/>
    </g>
    <circle cx="314" cy="40" r="2.5" fill="rgba(212,98,42,0.26)"/>
    <circle cx="325" cy="56" r="2"   fill="rgba(212,98,42,0.20)"/>
    <circle cx="336" cy="68" r="1.5" fill="rgba(212,98,42,0.16)"/>
    <circle cx="370" cy="-20" r="2"  fill="rgba(212,98,42,0.34)"/>
    <circle cx="382" cy="-30" r="1.5" fill="rgba(212,98,42,0.22)"/>
  </svg>
  ${photoUrl ? `<img data-hero="1" src="${photoUrl}" alt="${displayName}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top;z-index:1;opacity:0.35" onerror="this.style.display='none';applyAvatarFallback('${displayName.replace(/'/g, "\\'")}')">` : ''}
  <div style="position:absolute;inset:0;background:linear-gradient(to bottom,transparent 30%,rgba(0,0,0,0.85) 100%);z-index:2"></div>
```

Note: the photo img gets `opacity:0.35` and `z-index:1` so it shows faintly behind the arc (z-index:0) and gradient (z-index:2). The arc is the dominant visual element; the photo adds texture.

The isVerified and isPro badges need `z-index:3` added to their styles so they appear above the gradient layer. Find those two badge divs (lines ~380–381) and add `z-index:3;` to their inline styles.

- [ ] **Step 3: Update trainer name to Georgia italic**

Find (approximately line 386):
```js
<h1 style="font-family:var(--font-display,'Manrope',sans-serif);font-size:26px;font-weight:900;margin-bottom:4px;letter-spacing:-0.03em">${displayName}</h1>
```

Replace with:
```js
<h1 style="font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:700;font-style:italic;margin-bottom:4px;letter-spacing:-0.015em;line-height:1.05;color:#FAFAFA">${displayName}</h1>
```

- [ ] **Step 4: Replace all #FF5C00 instances in [slug].astro**

There are approximately 8 hardcoded `#FF5C00` instances in the JavaScript functions. Replace all of them:

```
#FF5C00 → #D4622A
rgba(255,92,0,... → rgba(212,98,42,...  (where they appear in inline styles)
```

Specific locations to update:
- `showErr()` — the "404" gradient: `background:linear-gradient(135deg,#FF5C00,#ff8c42)` → `background:linear-gradient(135deg,#D4622A,#e07840)`
- `showErr()` — "Find a Trainer" button: `background:#FF5C00` → `background:#D4622A`
- `renderProfile()` — price display: `color:var(--brand,#FF5C00)` → `color:var(--brand,#D4622A)`
- `renderProfile()` — package prices: `color:var(--brand,#FF5C00)` → `color:var(--brand,#D4622A)`
- `renderProfile()` — Book a Session CTA: `background:#FF5C00` → `background:#D4622A`
- `renderProfile()` — review submit button: `background:#FF5C00` → `background:#D4622A`
- `renderProfile()` — review consent checkbox: `accent-color:#FF5C00` → `accent-color:#D4622A`
- `renderProfile()` — powered-by badge: `background:rgba(255,92,0,0.08)` → `background:rgba(212,98,42,0.08)`, `border:1px solid rgba(255,92,0,0.2)` → `border:1px solid rgba(212,98,42,0.2)`, `background:rgba(255,92,0,0.14)` → `background:rgba(212,98,42,0.14)`, `color:#FF5C00` → `color:#D4622A`

Use a search-and-replace in the file. The easiest way:
```bash
# Count matches first
grep -c "FF5C00\|255,92,0" src/pages/\[slug\].astro
```

Then do a targeted search-and-replace. Be careful NOT to change the `--orange` and `--orange-dim` CSS variable definitions at the top (those reference `var(--brand)` already; the `rgba(255,92,0,...)` in the fallback values should be updated though).

Also update line ~133 in the `<style>` block:
```css
--orange: var(--brand, #FF5C00);  →  --orange: var(--brand, #D4622A);
--orange-dim: var(--brand-dim, rgba(255,92,0,0.15));  →  --orange-dim: var(--brand-dim, rgba(212,98,42,0.15));
```

And the spinner color:
```css
border-top-color:var(--orange);  ← this is fine, uses variable
```

And the `--avatar-color` default:
```css
--avatar-color: 255,92,0;  →  --avatar-color: 212,98,42;
```

- [ ] **Step 5: Verify the profile page**

Open any trainer profile, e.g. `localhost:4321/sarah-al-mansoori` (or any slug from the demo data).

Verify:
- Hero region shows arc SVG overlaid on (potentially) faint photo
- Trainer name is Georgia italic (serif, slanted)  
- Price is orange (#D4622A)
- "Book via WhatsApp" button stays green (unchanged — that's correct)
- "Book a Session" booking button (if present) is now #D4622A
- No #FF5C00 bright orange visible anywhere

- [ ] **Step 6: Commit**

```bash
git add src/pages/\[slug\].astro
git commit -m "feat: update slug profile — arc hero overlay, Georgia name, D4622A brand color"
```

---

## Verification Checklist

After all 6 tasks, do a final visual pass:

**find.astro (localhost:4321/find):**
- [ ] Arc browse header visible (240px, black bg, orange arc top-right burst)
- [ ] "Find your trainer." left-aligned, -apple-system, 32px weight-900
- [ ] Hero sub-count updates when data loads ("34 verified trainers near you")
- [ ] Filter chips are pill-shaped (100px border-radius)
- [ ] Active chip "All Trainers" = solid #D4622A fill, black text
- [ ] Trainer cards: black bg, arc SVG in hero, avatar bottom-left, location top-right
- [ ] Trainer name: Georgia italic, 36px
- [ ] Orange separator line (32×1.5px)
- [ ] Stats grid: 3 columns, price in orange
- [ ] CTA: "Book a session" pill, solid orange, black text
- [ ] Multiple cards each have independent arc (no gradient bleed between cards)
- [ ] Mobile (375px wide): single column, arc still renders

**[slug].astro (localhost:4321/sarah-al-mansoori):**
- [ ] Hero region shows arc SVG (faint photo behind if available)
- [ ] Trainer name is Georgia italic
- [ ] Price, package prices in #D4622A
- [ ] No #FF5C00 orange visible (all orange should be the darker burnt tone)
- [ ] WhatsApp button still green (#25D366)
- [ ] "Browse all trainers" link still works
