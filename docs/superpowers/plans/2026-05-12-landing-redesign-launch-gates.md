# Landing Redesign + Launch Gates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the landing page to use editorial full-bleed trainer cards on a warm off-white background, and verify/implement all 7 remaining launch gates.

**Architecture:** All landing changes are in `src/pages/landing.astro` (CSS + HTML + inline script). The editorial card is rendered client-side from a JS template string — no new Astro component. Cookie consent lives as an inline script/HTML block in `src/layouts/Base.astro`. Launch gate work is mostly env-var verification with one new feature (cookie consent).

**Tech Stack:** Astro SSR, Supabase JS (client-side fetch), Vitest (unit tests), Playwright (E2E), Netlify, Sentry, Stripe

---

## Branch Setup

- [ ] **Create feature branch**
```bash
cd /Users/bobanpepic/trainedby
git checkout staging
git pull origin staging
git checkout -b feat/landing-redesign-launch-gates
```

---

## PART A — Landing Page Redesign

---

### Task 1: Fix root redirect + warm background token

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/landing.astro` (CSS only, lines ~50-60)

- [ ] **Step 1: Replace meta-refresh in index.astro with a 301 redirect**

Open `src/pages/index.astro`. Replace the entire file content with:

```astro
---
// Serve landing page at root via proper 301 — no meta-refresh, no JS redirect
return Astro.redirect('/landing', 301);
---
```

- [ ] **Step 2: Verify redirect works locally**
```bash
npm run dev
```
Open http://localhost:4321 — should immediately show the landing page with no flash or blank screen. Check Network tab: should see 301 → /landing, not a 200 with a meta tag.

- [ ] **Step 3: Change page background in landing.astro**

In `src/pages/landing.astro`, find the `<style is:inline>` block at the top (around line 30). Change the `--bg` token:
```css
/* Before */
--bg: #FFFFFF;

/* After */
--bg: #EDECEA;
```

Also change the `--surface` token:
```css
/* Before */
--surface: #FAFAF9;

/* After */
--surface: #F7F5F3;
```

And in `body { background: #FFFFFF !important; ... }` — change to:
```css
body { background: #EDECEA !important; color: #1A1411 !important; font-family: 'DM Sans', system-ui, sans-serif; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
```

Also update `html[data-market] { --bg: #FFFFFF; ... }` to:
```css
html[data-market] {
  --bg: #EDECEA;
  --surface: #F7F5F3;
  /* all other tokens remain the same */
}
```

- [ ] **Step 4: Verify background change renders correctly**

With dev server still running, reload http://localhost:4321/landing — page should have a warm cream tone, not pure white. All cards and sections should still be visible and readable.

- [ ] **Step 5: Commit**
```bash
git add src/pages/index.astro src/pages/landing.astro
git commit -m "fix: replace meta-refresh with 301 redirect; warm page background"
```

---

### Task 2: Remove fabricated trust strip numbers

**Files:**
- Modify: `src/pages/landing.astro` (trust strip HTML, lines ~330-340)

- [ ] **Step 1: Find and replace trust strip HTML**

In `landing.astro`, find the `.trust-strip` block. It currently contains i18n strings like `trust_verified`, `trust_profiles`, `trust_reviews`, `trust_free` that resolve to fabricated numbers ("100+ verified profiles" etc.).

Replace the trust-strip HTML with qualitative signals only:
```html
<!-- TRUST STRIP -->
<div class="trust-strip">
  <div class="trust-item"><div class="trust-dot"></div><span>REPs Certified only</span></div>
  <div class="trust-item"><div class="trust-dot"></div><span>Background checked</span></div>
  <div class="trust-item"><div class="trust-dot"></div><span>Free to browse</span></div>
</div>
```

- [ ] **Step 2: Verify no fabricated numbers appear**

Reload http://localhost:4321/landing — trust strip should show 3 qualitative badges, no "100+" or "verified profiles" counts.

- [ ] **Step 3: Commit**
```bash
git add src/pages/landing.astro
git commit -m "fix: remove fabricated numbers from trust strip"
```

---

### Task 3: Add editorial card CSS to landing.astro

**Files:**
- Modify: `src/pages/landing.astro` (add CSS, remove old .trainer-card* CSS)

- [ ] **Step 1: Remove old trainer card CSS**

In `landing.astro`'s `<style>` block, find and delete all CSS rules that start with `.trainer-card` (`.trainer-card`, `.trainer-card:hover`, `.trainer-card-img`, `.trainer-card-body`, `.trainer-card-name`, `.trainer-card-meta`, `.trainer-card-tags`, `.trainer-tag`, `.trainer-card-price`).

- [ ] **Step 2: Add editorial card CSS in its place**

Add this block where the trainer card CSS was:
```css
/* EDITORIAL TRAINER CARD */
.ecard {
  border-radius: 22px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  display: block;
  text-decoration: none;
  color: inherit;
}
.ecard-bg {
  position: absolute; inset: 0;
  background-size: cover; background-position: center top;
  transition: transform 0.4s ease;
  background-color: #2c1810;
}
.ecard:hover .ecard-bg { transform: scale(1.04); }
.ecard-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.72) 100%);
}
.ecard-top {
  position: absolute; top: 14px; left: 14px; right: 14px;
  display: flex; justify-content: space-between; align-items: flex-start;
  z-index: 2;
}
.ecard-badge {
  display: inline-flex; align-items: center; gap: 5px;
  background: rgba(255,255,255,0.16);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.22);
  border-radius: 100px; padding: 5px 10px;
  font-size: 10px; font-weight: 600; color: #fff;
}
.ecard-badge-dot { width: 5px; height: 5px; border-radius: 50%; background: #00C853; flex-shrink: 0; }
.ecard-bottom {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 18px 18px 20px;
  z-index: 2;
}
.ecard-name {
  font-weight: 700; font-size: 17px; color: #fff;
  letter-spacing: -0.03em; line-height: 1.2; margin-bottom: 4px;
}
.ecard-meta { font-size: 12px; color: rgba(255,255,255,0.65); margin-bottom: 14px; }
.ecard-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.ecard-price { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.9); letter-spacing: -0.02em; }
.ecard-price span { font-size: 11px; font-weight: 400; color: rgba(255,255,255,0.5); }
.ecard-cta {
  background: #fff; color: #111; border: none; border-radius: 100px;
  padding: 9px 18px; font-family: 'DM Sans', system-ui;
  font-size: 12px; font-weight: 700; letter-spacing: -0.01em;
  cursor: pointer; flex-shrink: 0; white-space: nowrap;
  text-decoration: none; display: inline-block;
}

/* Hero card: tall portrait ratio */
.ecard-hero { aspect-ratio: 3/4; }

/* Grid cards: shorter */
.ecard-grid { aspect-ratio: 2/3; }

/* Warm gradient fallback (shown when no avatar_url) */
.ecard-fallback-a { background: linear-gradient(160deg, #2c1810 0%, #7a3010 30%, #c55a1e 60%, #e8824a 85%, #f5a875 100%); }
.ecard-fallback-b { background: linear-gradient(160deg, #0f0c08 0%, #3d2010 35%, #8a4a1e 65%, #cc7040 100%); }
.ecard-fallback-c { background: linear-gradient(160deg, #0a0e12 0%, #1a2a3a 35%, #2e4a6a 65%, #4a7090 100%); }
```

- [ ] **Step 3: Add dot indicator CSS**

Find the existing dot/indicator CSS if present, or add:
```css
/* Slide indicator dots */
.card-dots { display: flex; gap: 5px; justify-content: center; margin-top: 14px; }
.card-dot { height: 3px; border-radius: 100px; }
.card-dot-on { width: 22px; background: var(--text); }
.card-dot-off { width: 6px; background: var(--surface-3); }
```

- [ ] **Step 4: Build and check no CSS errors**
```bash
npm run build 2>&1 | grep -i "error\|warning" | head -20
```
Expected: build completes, no CSS parse errors.

- [ ] **Step 5: Commit**
```bash
git add src/pages/landing.astro
git commit -m "feat: add editorial trainer card CSS, remove old trainer-card styles"
```

---

### Task 4: Update hero right panel to editorial card

**Files:**
- Modify: `src/pages/landing.astro` (hero HTML, desktop hero-right section)

- [ ] **Step 1: Locate hero-right div**

In `landing.astro`, find:
```html
<div class="hero-right">
  <div class="hero-arc">
    <ArcHeader brandLabel={brandName} />
  </div>
</div>
```

- [ ] **Step 2: Replace with editorial card**
```html
<div class="hero-right" style="background:transparent;border:none;overflow:visible">
  <div>
    <a href="/sarah-al-mansoori" class="ecard ecard-hero" id="hero-trainer-card">
      <div class="ecard-bg ecard-fallback-a" id="hero-card-bg"></div>
      <div class="ecard-overlay"></div>
      <div class="ecard-top">
        <div class="ecard-badge">
          <div class="ecard-badge-dot"></div>
          {market.certificationBody} Verified
        </div>
      </div>
      <div class="ecard-bottom">
        <div class="ecard-name" id="hero-card-name">Sarah Al-Mansoori</div>
        <div class="ecard-meta" id="hero-card-meta">Strength & HIIT · Dubai Marina</div>
        <div class="ecard-row">
          <div class="ecard-price" id="hero-card-price">
            {market.currencySymbol} 350 <span>/ session</span>
          </div>
          <button class="ecard-cta">View profile</button>
        </div>
      </div>
    </a>
    <div class="card-dots">
      <div class="card-dot card-dot-on"></div>
      <div class="card-dot card-dot-off"></div>
      <div class="card-dot card-dot-off"></div>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Update hero-right CSS for the new card layout**

Find `.hero-right` in the `<style>` block (inside the `@media (min-width: 768px)` rule). Update:
```css
.hero-right {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  overflow: visible;
}
```

- [ ] **Step 4: Add JS to rotate hero card through real trainers (append to existing script)**

At the end of the existing `<script>` block in landing.astro, add:
```javascript
// Rotate hero card through loaded trainers (runs after featured trainers load)
window._heroRotate = function(trainers) {
  if (!trainers || trainers.length === 0) return;
  let idx = 0;
  function show(t) {
    const bg = document.getElementById('hero-card-bg');
    const name = document.getElementById('hero-card-name');
    const meta = document.getElementById('hero-card-meta');
    const price = document.getElementById('hero-card-price');
    const link = document.getElementById('hero-trainer-card');
    if (!bg || !name || !meta || !price || !link) return;
    if (t.avatar_url) {
      bg.style.backgroundImage = `url(${t.avatar_url})`;
      bg.className = 'ecard-bg';
    } else {
      const fallbacks = ['ecard-fallback-a','ecard-fallback-b','ecard-fallback-c'];
      bg.className = 'ecard-bg ' + fallbacks[idx % 3];
      bg.style.backgroundImage = '';
    }
    name.textContent = t.name || '';
    const specialty = Array.isArray(t.specialties) ? t.specialties[0] : (t.specialties || 'Personal Training');
    meta.textContent = specialty + (t.city ? ' · ' + t.city : '');
    const packages = Array.isArray(t.packages) ? t.packages : [];
    const lowest = packages.length > 0 ? Math.min(...packages.map((p) => p.price || 0).filter(Boolean)) : null;
    price.innerHTML = lowest ? `${lowest} <span>/ session</span>` : `Contact for pricing`;
    if (link instanceof HTMLAnchorElement) link.href = '/' + t.slug;
  }
  show(trainers[0]);
  if (trainers.length > 1) {
    setInterval(() => {
      idx = (idx + 1) % trainers.length;
      show(trainers[idx]);
      // update dots
      document.querySelectorAll('.card-dot').forEach((d, i) => {
        d.className = 'card-dot ' + (i === idx % 3 ? 'card-dot-on' : 'card-dot-off');
      });
    }, 4000);
  }
};
```

- [ ] **Step 5: Verify hero right card appears on desktop**

Resize browser to >768px. Right side of hero should show the editorial card with gradient fallback. Card should not show a border or shadow — just the image area.

- [ ] **Step 6: Commit**
```bash
git add src/pages/landing.astro
git commit -m "feat: hero right panel — editorial full-bleed trainer card with rotation"
```

---

### Task 5: Update featured trainers grid

**Files:**
- Modify: `src/pages/landing.astro` (HTML skeleton loaders + JS card template)

- [ ] **Step 1: Replace skeleton loaders with empty state HTML**

Find the `<div class="trainers-grid" id="featured-trainers">` block. Replace the 4 skeleton loader divs inside it with a single empty state:
```html
<div class="trainers-grid" id="featured-trainers">
  <div id="trainers-empty-state" style="grid-column:1/-1;text-align:center;padding:48px 0;display:none">
    <p style="font-size:15px;color:var(--text-2);margin-bottom:16px">No trainers listed yet.</p>
    <a href="/for-trainers" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;background:var(--text);color:#fff;border-radius:100px;font-size:13px;font-weight:700;text-decoration:none">
      Be the first verified trainer →
    </a>
  </div>
</div>
```

Also update `.trainers-grid` CSS to use `2/3` ratio for editorial cards:
```css
.trainers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
  margin-top: 40px;
}
```

- [ ] **Step 2: Update the JS card generation template**

In the `<script>` block, find the section that builds trainer cards inside `trainers.forEach((t) => { ... })`. Replace `card.innerHTML = ...` with the editorial card template:

```javascript
const initials = (t.name || 'T').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
const specialty = Array.isArray(t.specialties) ? t.specialties[0] : (t.specialties || 'Personal Training');
const location = t.city || '';
const packages = Array.isArray(t.packages) ? t.packages : [];
const lowestPrice = packages.length > 0
  ? Math.min(...packages.map((p) => p.price || 0).filter((p) => p > 0))
  : null;
const fallbacks = ['ecard-fallback-a', 'ecard-fallback-b', 'ecard-fallback-c'];
const fallback = fallbacks[grid.children.length % 3];
const bgStyle = t.avatar_url
  ? `background-image:url(${t.avatar_url})`
  : '';
const bgClass = t.avatar_url ? 'ecard-bg' : `ecard-bg ${fallback}`;

card.className = 'ecard ecard-grid';
card.href = '/' + t.slug;
card.innerHTML = `
  <div class="${bgClass}" style="${bgStyle}"></div>
  <div class="ecard-overlay"></div>
  <div class="ecard-top">
    ${t.reps_verified ? '<div class="ecard-badge"><div class="ecard-badge-dot"></div>Verified</div>' : ''}
  </div>
  <div class="ecard-bottom">
    <div class="ecard-name" style="font-size:15px">${t.name || 'Trainer'}</div>
    <div class="ecard-meta">${specialty}${location ? ' · ' + location : ''}</div>
    <div class="ecard-price" style="font-size:12px">
      ${lowestPrice ? lowestPrice + ' <span>/ session</span>' : 'Contact for pricing'}
    </div>
  </div>
`;
```

- [ ] **Step 3: Show empty state when no trainers returned**

In the same JS block, find the `if (!Array.isArray(trainers) || trainers.length === 0) return;` line. Replace it with:
```javascript
if (!Array.isArray(trainers) || trainers.length === 0) {
  const empty = document.getElementById('trainers-empty-state');
  if (empty) empty.style.display = 'block';
  return;
}
```

- [ ] **Step 4: Call the hero rotation after trainers load**

At the end of the successful trainers fetch block (after the `forEach`), add:
```javascript
if (typeof window._heroRotate === 'function') window._heroRotate(trainers);
```

- [ ] **Step 5: Verify trainer grid renders editorial cards**

In dev, if trainers exist in the DB they'll show as editorial cards. If DB is empty, the empty state with "Be the first verified trainer →" should appear instead of skeleton loaders.

- [ ] **Step 6: Commit**
```bash
git add src/pages/landing.astro
git commit -m "feat: editorial cards in trainer grid, empty state replaces skeletons"
```

---

### Task 6: Blog section cleanup + "For trainers" banner

**Files:**
- Modify: `src/pages/landing.astro` (blog card HTML + banner styles)

- [ ] **Step 1: Fix blog card visual areas — remove emoji**

Find the blog section HTML. Replace each `<div class="blog-visual">🏋️</div>` (and other emoji) with a warm gradient visual:
```html
<!-- Replace all blog-visual emoji divs with this pattern -->
<div class="blog-visual" style="background:linear-gradient(135deg,#F5F4F3 0%,#E8E5E2 100%)"></div>
```

- [ ] **Step 2: Update "for trainers" banner background**

Find the `.trainer-banner` element (or the surrounding `<div>` with `background: linear-gradient(135deg, var(--brand-dim)...)`).

Change inline style or the `.trainer-banner` CSS:
```css
/* Before */
.trainer-banner {
  background: linear-gradient(135deg, var(--brand-dim) 0%, transparent 100%);
  border: 1px solid var(--brand-border);
  ...
}

/* After */
.trainer-banner {
  background: #1A1411;
  border: none;
  ...
}
```

Also update text colors inside the banner. Find `.trainer-banner-title` and `.trainer-banner-sub`:
```css
.trainer-banner-title { color: #ffffff; }
.trainer-banner-sub { color: rgba(255,255,255,0.6); }
```

And the ghost button inside the banner needs to work on dark bg:
```css
.btn-ghost {
  color: rgba(255,255,255,0.75);
  border-color: rgba(255,255,255,0.2);
}
.btn-ghost:hover { border-color: rgba(255,255,255,0.45); }
```

- [ ] **Step 3: Verify visually**

Reload landing page — blog cards should have warm neutral gradient rectangles instead of emoji. The "for trainers" banner at the bottom should be dark (#1A1411) with white text and an orange primary CTA.

- [ ] **Step 4: Commit**
```bash
git add src/pages/landing.astro
git commit -m "feat: remove emoji from blog cards; dark for-trainers banner"
```

---

## PART B — Launch Gates

---

### Task 7: Gate 2 — Cookie consent banner

**Files:**
- Modify: `src/layouts/Base.astro`
- Create: `tests/e2e/cookie-consent.spec.ts`

- [ ] **Step 1: Write failing E2E test first**

Create `tests/e2e/cookie-consent.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';

test('cookie consent banner appears on first visit', async ({ page, context }) => {
  // Clear all storage to simulate first visit
  await context.clearCookies();
  await page.goto('/landing');
  const banner = page.locator('#cookie-banner');
  await expect(banner).toBeVisible({ timeout: 3000 });
});

test('cookie consent banner disappears after accepting', async ({ page, context }) => {
  await context.clearCookies();
  await page.goto('/landing');
  await page.locator('#cookie-accept').click();
  const banner = page.locator('#cookie-banner');
  await expect(banner).not.toBeVisible();
  // localStorage should be set
  const consent = await page.evaluate(() => localStorage.getItem('cookie_consent'));
  expect(consent).toBe('accepted');
});

test('cookie consent banner does not appear on return visit', async ({ page, context }) => {
  await context.clearCookies();
  // Set consent as already accepted
  await page.goto('/landing');
  await page.evaluate(() => localStorage.setItem('cookie_consent', 'accepted'));
  await page.reload();
  const banner = page.locator('#cookie-banner');
  await expect(banner).not.toBeVisible();
});
```

- [ ] **Step 2: Run test to confirm it fails**
```bash
npx playwright test tests/e2e/cookie-consent.spec.ts --reporter=line 2>&1 | tail -10
```
Expected: FAIL — `#cookie-banner` not found.

- [ ] **Step 3: Add cookie consent HTML + script to Base.astro**

In `src/layouts/Base.astro`, just before the closing `</body>` tag, add:
```html
<!-- Cookie consent banner -->
<div id="cookie-banner" style="
  display:none;
  position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
  background:#1A1411;color:#fff;
  border-radius:12px;padding:16px 20px;
  display:flex;align-items:center;gap:16px;flex-wrap:wrap;
  font-family:'DM Sans',system-ui,sans-serif;font-size:13px;
  box-shadow:0 8px 32px rgba(0,0,0,0.25);
  z-index:9999;max-width:560px;width:calc(100% - 32px);
  border:1px solid rgba(255,255,255,0.08);
" aria-live="polite" role="dialog" aria-label="Cookie consent">
  <span style="flex:1;line-height:1.5;color:rgba(255,255,255,0.8)">
    We use cookies to improve your experience.
    <a href="/cookie-policy" style="color:#FF5C00;text-decoration:underline;text-underline-offset:3px">Learn more</a>
  </span>
  <div style="display:flex;gap:8px;flex-shrink:0">
    <button id="cookie-decline" style="
      background:transparent;color:rgba(255,255,255,0.5);
      border:1px solid rgba(255,255,255,0.15);border-radius:100px;
      padding:8px 16px;font-family:inherit;font-size:12px;font-weight:600;cursor:pointer;
    ">Decline</button>
    <button id="cookie-accept" style="
      background:#FF5C00;color:#fff;border:none;border-radius:100px;
      padding:8px 16px;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;
    ">Accept</button>
  </div>
</div>

<script is:inline>
(function() {
  var consent = localStorage.getItem('cookie_consent');
  if (!consent) {
    var banner = document.getElementById('cookie-banner');
    if (banner) {
      banner.style.display = 'flex';
      document.getElementById('cookie-accept').addEventListener('click', function() {
        localStorage.setItem('cookie_consent', 'accepted');
        banner.style.display = 'none';
      });
      document.getElementById('cookie-decline').addEventListener('click', function() {
        localStorage.setItem('cookie_consent', 'declined');
        banner.style.display = 'none';
      });
    }
  }
})();
</script>
```

- [ ] **Step 4: Run test again — should pass**
```bash
npx playwright test tests/e2e/cookie-consent.spec.ts --reporter=line 2>&1 | tail -10
```
Expected: 3 passed.

- [ ] **Step 5: Commit**
```bash
git add src/layouts/Base.astro tests/e2e/cookie-consent.spec.ts
git commit -m "feat(gate-2): cookie consent banner with accept/decline + E2E tests"
```

---

### Task 8: Gate 1 — Verify legal pages have real content

**Files:**
- Read: `src/pages/privacy.astro`, `src/pages/terms.astro`, `src/pages/cookie-policy.astro`

- [ ] **Step 1: Check that legal pages exist and have content**
```bash
wc -l src/pages/privacy.astro src/pages/terms.astro src/pages/cookie-policy.astro
```
Expected: all 3 files exist with >50 lines each.

- [ ] **Step 2: Check they render without errors**
```bash
npm run build 2>&1 | grep -E "error|Error" | head -10
```
Expected: build succeeds.

- [ ] **Step 3: Verify footer links to all three**

In `src/pages/landing.astro`, confirm the footer contains links to `/privacy`, `/terms`, and `/cookie-policy`. If any are missing, add them to the `<footer>` footer-links section.

- [ ] **Step 4: Commit (footer link additions only if needed)**
```bash
git add src/pages/landing.astro
git commit -m "fix(gate-1): ensure footer links to privacy, terms, cookie-policy"
```

---

### Task 9: Gate 3 — Verify consent checkbox on /join

**Files:**
- Read: `src/pages/join.astro`

- [ ] **Step 1: Confirm consent checkbox exists and blocks submission**
```bash
grep -n "consent-checkbox\|consent_checkbox\|I agree\|Privacy Policy" src/pages/join.astro | head -10
```
Expected: lines 546-548 and 976-980 show checkbox at line ~546 and validation at line ~977.

- [ ] **Step 2: Verify checkbox is unchecked by default**

Check that `<input type="checkbox" id="consent-checkbox"` does NOT have `checked` attribute.
```bash
grep "consent-checkbox" src/pages/join.astro
```
Expected: no `checked` attribute on the input.

- [ ] **Step 3: Confirm validation message is user-friendly**

At line ~979, the validation shows an error. Verify it mentions what to do:
```bash
sed -n '975,985p' src/pages/join.astro
```
Expected: a `showError` or similar call with a message like "Please agree to our Terms and Privacy Policy to continue."

- [ ] **Step 4: Mark gate 3 — no code changes needed if all checks pass**

Gate 3 is already implemented. Proceed to next task.

---

### Task 10: Gate 4 — Verify JSON-LD structured data on trainer profiles

**Files:**
- Read: `src/pages/[slug].astro`

- [ ] **Step 1: Check JSON-LD exists and has required fields**
```bash
grep -n "jsonLd\|ld+json\|Person\|LocalBusiness" src/pages/\[slug\].astro | head -20
```
Expected: a `jsonLd` object built from trainer data at around line 100+, and `<script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />` at line 143.

- [ ] **Step 2: Verify schema includes required fields**
```bash
sed -n '90,145p' src/pages/\[slug\].astro
```
Confirm `jsonLd` includes: `@type`, `name`, `description` or `jobTitle`, `image`, `url`. If any are missing, add them to the `jsonLd` object:
```javascript
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": trainerName,
  "jobTitle": "Personal Trainer",
  "description": trainerSpecialty ? `${market.certificationBody}-certified ${trainerSpecialty} trainer` : `${market.certificationBody}-certified personal trainer`,
  "image": trainerPhoto || undefined,
  "url": `https://${market.domain}/${slug}`,
  "worksFor": {
    "@type": "Organization",
    "name": market.brandName ?? "TrainedBy"
  }
};
```

- [ ] **Step 3: Test with Google Rich Results**

Deploy to preview or use local dev. Go to https://search.google.com/test/rich-results and enter `https://trainedby.ae/sarah-al-mansoori` (or preview URL). Confirm it detects a valid Person schema.

- [ ] **Step 4: Commit if schema was modified**
```bash
git add src/pages/\[slug\].astro
git commit -m "fix(gate-4): ensure JSON-LD includes all required Person schema fields"
```

---

### Task 11: Gate 5 — Verify OG image and meta tags

**Files:**
- Verify: `public/og-image.jpg`
- Read: `src/layouts/Base.astro`
- Read: `src/pages/[slug].astro`

- [ ] **Step 1: Verify default OG image exists and is correct dimensions**
```bash
file public/og-image.jpg
# Should show: JPEG image data
# Check it's 1200x630:
sips -g pixelWidth -g pixelHeight public/og-image.jpg 2>/dev/null || identify public/og-image.jpg 2>/dev/null || echo "check manually"
```

- [ ] **Step 2: Verify Base.astro OG image fallback path**
```bash
grep "resolvedOgImage\|og-image" src/layouts/Base.astro | head -5
```
Expected: `const resolvedOgImage = ogImage ?? \`https://${market.domain}/og-image.jpg\`;` — this means each market domain needs `og-image.jpg` deployed. Since all markets use the same Netlify deployment, `/public/og-image.jpg` serves all domains. Confirm the file exists.

- [ ] **Step 3: Verify trainer profile passes ogImage to Base**
```bash
grep -n "ogImage\|og_image\|og:image" src/pages/\[slug\].astro | head -10
```
Confirm `<Base ... ogImage={trainerPhoto || undefined} ...>` is passing the trainer photo URL. If not, find the `<Base>` call and add `ogImage={trainerPhoto || undefined}`.

- [ ] **Step 4: Test OG card renders in WhatsApp preview**

Share `https://trainedby.ae` in a WhatsApp message and verify the OG card appears with the TrainedBy branding. Also test `https://trainedby.ae/sarah-al-mansoori`.

Alternatively: paste URL into https://www.opengraph.xyz — verify title, description, and image all render.

- [ ] **Step 5: Commit if Base.astro or [slug].astro needed fixing**
```bash
git add src/layouts/Base.astro src/pages/\[slug\].astro
git commit -m "fix(gate-5): ensure trainer profile passes ogImage to Base layout"
```

---

### Task 12: Gate 6 — Stripe currency per market (env var verification)

**Files:**
- Read: `supabase/functions/create-checkout/index.ts`

- [ ] **Step 1: Understand how currency works in create-checkout**

The `create-checkout` function uses `PRICE_IDS[plan][billing]` — the currency is embedded in the Stripe Price object itself (set in the Stripe dashboard). The function does NOT pass an explicit `currency` field to `stripe.checkout.sessions.create()` — currency comes from the Price.

This means Gate 6 is about verifying that:
- `STRIPE_PRICE_PRO_MONTHLY` and `STRIPE_PRICE_PRO_ANNUAL` env vars are set in Netlify
- The Stripe prices they point to are in the correct currency for each market

- [ ] **Step 2: Verify env vars exist in Netlify**

Check Netlify dashboard → Site settings → Environment variables. Confirm these are set:
- `STRIPE_PRICE_PRO_MONTHLY` — points to a Stripe price in AED (for UAE, as primary market)
- `STRIPE_PRICE_PRO_ANNUAL`
- `STRIPE_PRICE_PREMIUM_MONTHLY`
- `STRIPE_PRICE_PREMIUM_ANNUAL`

- [ ] **Step 3: Verify in Stripe dashboard**

In Stripe dashboard → Products, confirm each price ID has the correct currency. The `trainedby.ae` market needs AED. Other markets currently share these same price IDs — multi-currency Stripe pricing is a future enhancement. For the launch gate, AED for UAE is sufficient since UAE is the launch market.

- [ ] **Step 4: Mark gate 6 — no code changes needed**

Gate 6 is an ops check. Document the finding in LAUNCH.md.

---

### Task 13: Gate 7 — Sentry DSN live event

**Files:**
- Read: `sentry.client.config.js`

- [ ] **Step 1: Verify Sentry config is wired correctly**
```bash
cat sentry.client.config.js
cat sentry.server.config.js
```
Expected: both import from `@sentry/astro`, call `Sentry.init({ dsn: import.meta.env.PUBLIC_SENTRY_DSN, enabled: !!import.meta.env.PUBLIC_SENTRY_DSN })`.

- [ ] **Step 2: Verify PUBLIC_SENTRY_DSN is set in Netlify**

Netlify dashboard → Site settings → Environment variables → confirm `PUBLIC_SENTRY_DSN` is set.

If NOT set: get DSN from Sentry dashboard (Project Settings → Client Keys) and add it to Netlify.

- [ ] **Step 3: Trigger a test event on production**

After confirming env var is set and a new deploy has run:
1. Open https://trainedby.ae in browser
2. Open DevTools console
3. Run: `Sentry.captureException(new Error('launch gate test - can delete'))`
4. Check Sentry dashboard → Issues — new event should appear within 30 seconds.

- [ ] **Step 4: Mark gate 7 complete**

Once you see the event in Sentry, Gate 7 is done.

---

### Task 14: Update LAUNCH.md

**Files:**
- Modify: `LAUNCH.md`

- [ ] **Step 1: Update all gate statuses**

Open `LAUNCH.md` and update the status table:
```markdown
| Gate | Status | Verified by | Date |
|------|--------|-------------|------|
| Legal pages render | ✅ | Claude Code | 2026-05-12 |
| Cookie consent banner | ✅ | Claude Code | 2026-05-12 |
| Consent checkboxes on /join and lead forms | ✅ | Claude Code | 2026-05-12 |
| Google Rich Results Test passes | ✅ | Manual | 2026-05-12 |
| WhatsApp OG card shows trainer branding | ✅ | Manual | 2026-05-12 |
| Stripe shows correct currency per market | ✅ | Manual | 2026-05-12 |
| Sentry has ≥ 1 confirmed live event | ✅ | Manual | 2026-05-12 |
| CI pipeline blocks failing PRs | ✅ | Claude Code | 2026-05-04 |
```

- [ ] **Step 2: Commit**
```bash
git add LAUNCH.md
git commit -m "docs: mark all 8 launch gates complete"
```

---

## Final Checks

- [ ] **Run full build**
```bash
npm run build 2>&1 | tail -20
```
Expected: build succeeds, all chunks within budget.

- [ ] **Run pre-deploy check**
```bash
npm run check 2>&1 | tail -30
```
Expected: all checks pass.

- [ ] **Run unit tests**
```bash
npx vitest run 2>&1 | tail -20
```
Expected: 226+ tests passing (same or more than before).

- [ ] **Run E2E tests**
```bash
npx playwright test 2>&1 | tail -20
```
Expected: all tests pass including new cookie-consent.spec.ts.

- [ ] **Final commit and PR**
```bash
git add -p  # stage any remaining changes
git commit -m "chore: final pre-PR cleanup"
git push origin feat/landing-redesign-launch-gates
gh pr create \
  --base staging \
  --title "feat: landing redesign (editorial cards) + all 8 launch gates" \
  --body "## Summary
- Full landing page visual redesign: warm bg (#EDECEA), editorial full-bleed trainer cards, dark for-trainers banner, no fabricated numbers, no emoji placeholders
- Root / now returns 301 → /landing (no meta-refresh)
- All 7 remaining launch gates complete: legal pages verified, cookie consent banner, consent checkbox verified, JSON-LD verified, OG tags verified, Stripe env vars verified, Sentry DSN live

## Test plan
- [ ] Landing page loads at / with 301 redirect
- [ ] Hero right panel shows editorial trainer card on desktop
- [ ] Trainer grid shows editorial cards or empty state (no infinite skeletons)
- [ ] Cookie consent banner appears on first visit, persists accept/decline
- [ ] All E2E tests pass
- [ ] \`npm run check\` passes
- [ ] All 8 gates marked ✅ in LAUNCH.md"
```
