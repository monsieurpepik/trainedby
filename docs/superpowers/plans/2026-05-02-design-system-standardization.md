# Design System Standardization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a single consistent design language across every page — one token system, one brand orange, correct light/dark themes, and Nav.astro as the only nav component.

**Architecture:** Infrastructure-first (Phase 1 builds the foundation), then marketing funnel pages go light (Phase 2), app pages get token cleanup (Phase 3), and standalone pages migrate to BaseMinimal.astro (Phase 4). Each phase depends on the previous being complete.

**Tech Stack:** Astro 4, CSS custom properties (token system), DM Sans font, Base.astro layout, new BaseMinimal.astro layout, Nav.astro component

**Spec:** `docs/superpowers/specs/2026-05-02-design-system-standardization.md`

---

## Standard Light Theme Injection Block

Every light page injects this via `<Fragment slot="head">`. Reference only — not a task itself.

```astro
<Fragment slot="head">
  <meta name="color-scheme" content="light">
  <meta name="theme-color" content="#FFFFFF">
  <style>
    :root {
      --bg: #FFFFFF;
      --surface: #FAFAF9;
      --surface-2: #F5F4F3;
      --surface-3: #E8E5E2;
      --surface-4: #D4D1CE;
      --text: #1A1411;
      --text-2: #6B6460;
      --text-3: #9B9490;
      --text-muted: #6B6460;
      --text-faint: rgba(26,20,17,0.35);
      --border: rgba(0,0,0,0.07);
      --border-hover: rgba(0,0,0,0.14);
      --border-strong: rgba(0,0,0,0.2);
      --brand: #FF5C00;
      --brand-hover: #e05200;
      --brand-dim: rgba(255,92,0,0.08);
      --brand-border: rgba(255,92,0,0.2);
      --brand-glow: rgba(255,92,0,0.3);
      --shadow: 0 4px 24px rgba(0,0,0,0.08);
      --shadow-lg: 0 8px 48px rgba(0,0,0,0.12);
    }
    body { background: var(--bg); color: var(--text); }
  </style>
</Fragment>
```

---

## Task 1: Fix Base.astro Brand Tokens

**Files:**
- Modify: `src/layouts/Base.astro` (lines 139–143)

The canonical brand orange is `#FF5C00`. Base.astro line 139 has the accidental value `#D4622A`. Fix all five brand token values.

- [ ] **Step 1: Edit the brand token block**

In `src/layouts/Base.astro`, replace the five brand lines:

```css
/* FROM (lines 139-143): */
--brand: #D4622A;
--brand-hover: #c05020;
--brand-dim: rgba(212,98,42,0.12);
--brand-border: rgba(212,98,42,0.25);
--brand-glow: rgba(212,98,42,0.4);

/* TO: */
--brand: #FF5C00;
--brand-hover: #e05200;
--brand-dim: rgba(255,92,0,0.10);
--brand-border: rgba(255,92,0,0.25);
--brand-glow: rgba(255,92,0,0.4);
```

- [ ] **Step 2: Verify no other `#D4622A` remains**

```bash
grep -r '#D4622A\|#d4622a' src/
```

Expected: zero matches.

- [ ] **Step 3: Build**

```bash
cd /Users/bobanpepic/trainedby && npm run build 2>&1 | tail -20
```

Expected: `Build complete` with zero errors.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/Base.astro
git commit -m "fix: correct brand orange token from #D4622A to #FF5C00 in Base.astro"
```

---

## Task 2: Create BaseMinimal.astro

**Files:**
- Create: `src/layouts/BaseMinimal.astro`

A focused layout for checkout and booking flows. Full `<head>` infrastructure (identical to Base.astro) but no nav, footer, or cookie banner in body. Used by `my-bookings` and `book/[slug]`.

- [ ] **Step 1: Create the file**

Create `src/layouts/BaseMinimal.astro` with this exact content:

```astro
---
interface Props {
  title: string;
  description?: string;
  ogImage?: string;
  canonical?: string;
  noIndex?: boolean;
}

const {
  title,
  description,
  ogImage,
  canonical,
  noIndex = false,
} = Astro.props;

import { getMarket } from '../lib/market.ts';
import { getLocale, BRAND } from '../lib/i18n.ts';
import { ClientRouter } from 'astro:transitions';

const market = getMarket(Astro.url.hostname);
const locale = getLocale(Astro.request);

const marketCanonicalBase = canonical ?? `https://${market.domain}${Astro.url.pathname}`;
const marketOgLocale = market.locale.replace('-', '_');
const resolvedDescription = description ?? market.metaDescription;
const resolvedOgImage = ogImage ?? `https://${market.domain}/og-image.jpg`;
---

<!doctype html>
<html lang={market.locale.split('-')[0]} dir="ltr" data-market={market.market}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />

    <title>{title}</title>
    <meta name="description" content={resolvedDescription} />
    <link rel="canonical" href={marketCanonicalBase} />
    {noIndex && <meta name="robots" content="noindex,nofollow" />}
    <meta name="theme-color" content="#FFFFFF" />
    <meta name="color-scheme" content="light" />

    <meta property="og:title" content={title} />
    <meta property="og:description" content={resolvedDescription} />
    <meta property="og:image" content={resolvedOgImage} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content={marketCanonicalBase} />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content={market.brandName ?? 'TrainedBy'} />
    <meta property="og:locale" content={marketOgLocale} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={resolvedDescription} />
    <meta name="twitter:image" content={resolvedOgImage} />

    <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
    <link rel="dns-prefetch" href="https://mezhtdbfyvkshpuplqqw.supabase.co" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preconnect" href="https://mezhtdbfyvkshpuplqqw.supabase.co" />

    <link
      rel="preload"
      as="style"
      crossorigin
      href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,200;0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900&display=swap"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,200;0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900&display=swap"
      rel="stylesheet"
    />

    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

    <ClientRouter fallback="none" />

    <!-- Light theme tokens (BaseMinimal pages are always light) -->
    <style is:global>
      :root {
        --bg: #FFFFFF;
        --surface: #FAFAF9;
        --surface-2: #F5F4F3;
        --surface-3: #E8E5E2;
        --surface-4: #D4D1CE;
        --text: #1A1411;
        --text-2: #6B6460;
        --text-muted: #6B6460;
        --text-faint: rgba(26,20,17,0.35);
        --border: rgba(0,0,0,0.07);
        --border-hover: rgba(0,0,0,0.14);
        --brand: #FF5C00;
        --brand-hover: #e05200;
        --brand-dim: rgba(255,92,0,0.08);
        --brand-border: rgba(255,92,0,0.2);
        --brand-glow: rgba(255,92,0,0.3);
        --radius: 12px;
        --radius-lg: 20px;
        --radius-xl: 28px;
        --shadow: 0 4px 24px rgba(0,0,0,0.08);
        --shadow-lg: 0 8px 48px rgba(0,0,0,0.12);
        --transition: 0.18s ease;
        --font-display: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        --font-body: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        background: var(--bg);
        color: var(--text);
        font-family: var(--font-body);
        -webkit-font-smoothing: antialiased;
      }
    </style>

    <!-- Per-page head overrides -->
    <slot name="head" />
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 2: Build**

```bash
cd /Users/bobanpepic/trainedby && npm run build 2>&1 | tail -20
```

Expected: `Build complete` with zero errors. (BaseMinimal is unused yet, so no page-level impact.)

- [ ] **Step 3: Commit**

```bash
git add src/layouts/BaseMinimal.astro
git commit -m "feat: add BaseMinimal.astro layout for focused checkout/booking flows"
```

---

## Task 3: Add Minimal Variant to Nav.astro

**Files:**
- Modify: `src/components/Nav.astro` (lines 1–6 for Props, insert before line 9)

The `minimal` variant renders logo-only — no links, no CTA. Used by `book/[slug]` where the user is mid-purchase.

- [ ] **Step 1: Update the Props interface and add the minimal branch**

In `src/components/Nav.astro`, change line 3 and add the minimal variant HTML:

```astro
---
interface Props {
  variant?: 'landing' | 'app' | 'consumer' | 'minimal';
  activePage?: string;
}
const { variant = 'landing', activePage = '' } = Astro.props;
---

{variant === 'minimal' ? (
  <header class="minimal-header">
    <a href="/" class="nav-logo" aria-label="Home">
      <span style="font-family:'DM Sans',sans-serif;font-weight:900;font-size:20px;text-decoration:none;color:var(--text);">
        Trained<span style="color:var(--brand)">By</span><span
          style="display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--brand);margin-left:2px;vertical-align:middle;margin-bottom:3px"
        ></span>
      </span>
    </a>
  </header>
) : variant === 'consumer' ? (
```

Then leave the rest of the file unchanged (consumer, landing, app variants stay exactly as they are).

After the app closing paren `)}`, add the new style rule:

```css
  .minimal-header {
    padding: 16px 24px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--border);
  }
```

(Add inside the existing `<style>` block at the bottom of Nav.astro.)

- [ ] **Step 2: Build**

```bash
cd /Users/bobanpepic/trainedby && npm run build 2>&1 | tail -20
```

Expected: `Build complete` with zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/Nav.astro
git commit -m "feat: add minimal variant to Nav.astro (logo-only, for booking flows)"
```

---

## Task 4: Convert for-trainers.astro to Light Theme

**Files:**
- Modify: `src/pages/for-trainers.astro`

This page is a dark trainer marketing funnel page. Goal: switch to light, remove the custom inline nav, wire up Nav.astro `landing` variant. The page content (hero, features, steps, testimonials, CTA) stays structurally intact — only theme and nav change.

- [ ] **Step 1: Add Nav.astro import to the frontmatter**

At the top of `src/pages/for-trainers.astro`, in the `---` frontmatter block, add:

```astro
import Nav from '../components/Nav.astro';
```

- [ ] **Step 2: Add light theme Fragment slot**

Immediately after the `<Base ...>` opening tag (before the first `<style>` tag), add:

```astro
  <Fragment slot="head">
    <meta name="color-scheme" content="light">
    <meta name="theme-color" content="#FFFFFF">
    <style>
      :root {
        --bg: #FFFFFF;
        --surface: #FAFAF9;
        --surface-2: #F5F4F3;
        --surface-3: #E8E5E2;
        --surface-4: #D4D1CE;
        --text: #1A1411;
        --text-2: #6B6460;
        --text-3: #9B9490;
        --text-muted: #6B6460;
        --text-faint: rgba(26,20,17,0.35);
        --border: rgba(0,0,0,0.07);
        --border-2: rgba(0,0,0,0.12);
        --border-hover: rgba(0,0,0,0.14);
        --border-strong: rgba(0,0,0,0.2);
        --brand: #FF5C00;
        --brand-hover: #e05200;
        --brand-dim: rgba(255,92,0,0.08);
        --brand-border: rgba(255,92,0,0.2);
        --brand-glow: rgba(255,92,0,0.3);
        --reps: #00C853;
        --reps-dim: rgba(0,200,83,0.08);
        --reps-border: rgba(0,200,83,0.2);
        --max: 1100px;
        --shadow: 0 4px 24px rgba(0,0,0,0.08);
        --shadow-lg: 0 8px 48px rgba(0,0,0,0.12);
      }
      body { background: var(--bg); color: var(--text); }
    </style>
  </Fragment>
```

- [ ] **Step 3: Delete the inverted local `:root` block from the page `<style>` tag**

In the `<style>` tag, delete the entire `:root { ... }` block (currently lines ~16–31):

```css
/* DELETE THIS ENTIRE BLOCK: */
:root {
  --brand: #FF5C00;
  --brand-dim: rgba(255,92,0,0.10);
  --brand-border: rgba(255,92,0,0.25);
  --reps: #00C853;
  --surface: #0a0a0a;
  --surface-2: #111111;
  --surface-3: #1a1a1a;
  --surface-4: #222222;
  --border: rgba(255,255,255,0.07);
  --border-2: rgba(255,255,255,0.12);
  --text: #f2f2f2;
  --text-2: #888888;
  --text-3: #555555;
  --max: 1100px;
}
```

- [ ] **Step 4: Delete the nav CSS rules from `<style>` and the nav HTML**

Remove the `/* NAV */` CSS block (`.nav`, `.nav.scrolled`, `.nav-logo`, `.nav-links`, `.nav-links a`, `.nav-cta`, `.nav-cta:hover`, the `@media (max-width: 640px)` nav rule).

Find the inline nav HTML in the template (a `<nav class="nav" id="nav">...</nav>` block near the top of the body) and replace it with:

```astro
<Nav variant="landing" />
```

- [ ] **Step 5: Fix body background and dark-pill CTAs**

Change the `body` rule in `<style>`:

```css
/* FROM: */
body { background: var(--surface); color: var(--text); ... }

/* TO: */
body { background: var(--bg); color: var(--text); ... }
```

Any CTA button with `background: var(--text); color: var(--bg)` is already correct for dark-pill CTAs in light mode (dark text becomes `#1A1411`, bg becomes `#FFFFFF`). The primary CTA (`background: var(--brand); color: #fff`) needs no change.

- [ ] **Step 6: Fix `.nav.scrolled` reference in inline script**

The existing scroll script (`window.addEventListener('scroll', ...)`) targets `#nav`. Since Nav.astro already has this scroll script built in, search for any inline scroll script block in for-trainers.astro and delete it if present:

```js
/* DELETE if present: */
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}
```

- [ ] **Step 7: Build and check for regressions**

```bash
cd /Users/bobanpepic/trainedby && npm run build 2>&1 | tail -30
```

Expected: `Build complete` with zero errors.

- [ ] **Step 8: Commit**

```bash
git add src/pages/for-trainers.astro
git commit -m "feat: switch for-trainers.astro to light theme, replace inline nav with Nav.astro landing variant"
```

---

## Task 5: Convert join.astro to Light Theme

**Files:**
- Modify: `src/pages/join.astro`

join.astro is a focused form page (signup flow). It has a custom `.join-header` (not a full nav), which is fine to keep as a simplified logo+link header. Goal: switch to light, delete inverted `:root`, replace hardcoded dark colors with tokens.

- [ ] **Step 1: Add Nav.astro import to frontmatter**

In the `---` frontmatter block:

```astro
import Nav from '../components/Nav.astro';
```

- [ ] **Step 2: Add light theme Fragment slot after `<Base ...>`**

```astro
  <Fragment slot="head">
    <meta name="color-scheme" content="light">
    <meta name="theme-color" content="#FFFFFF">
    <style>
      :root {
        --bg: #FFFFFF;
        --surface: #FAFAF9;
        --surface-2: #F5F4F3;
        --surface-3: #E8E5E2;
        --text: #1A1411;
        --text-2: #6B6460;
        --text-muted: #6B6460;
        --text-faint: rgba(26,20,17,0.35);
        --border: rgba(0,0,0,0.07);
        --border-hover: rgba(0,0,0,0.14);
        --brand: #FF5C00;
        --brand-hover: #e05200;
        --brand-dim: rgba(255,92,0,0.08);
        --brand-border: rgba(255,92,0,0.2);
        --reps: #00C853;
        --reps-dim: rgba(0,200,83,0.08);
        --reps-border: rgba(0,200,83,0.2);
      }
      body { background: var(--bg); color: var(--text); }
    </style>
  </Fragment>
```

- [ ] **Step 3: Delete the inverted local `:root` block**

In the `<style>` tag, delete:

```css
/* DELETE: */
:root {
  --reps: #00C853; --reps-dim: rgba(0,200,83,0.08); --reps-border: rgba(0,200,83,0.2);
  --surface: #0a0a0a; --surface-2: #111; --surface-3: #1c1c1c;
  --border: rgba(255,255,255,0.08); --text: #fff;
  --text-muted: rgba(255,255,255,0.5); --text-faint: rgba(255,255,255,0.25);
}
```

- [ ] **Step 4: Fix body background**

```css
/* FROM: */
body { background: var(--surface); ... }

/* TO: */
body { background: var(--bg); ... }
```

- [ ] **Step 5: Update form input styles for light theme**

Form inputs need to look right on white. Find `.input`, `input`, `select`, `textarea` style rules and ensure they use:

```css
background: var(--surface-2);
border: 1px solid var(--border);
color: var(--text);
```

Replace any `background: rgba(255,255,255,0.06)` or `background: #111` values with `var(--surface-2)`.

- [ ] **Step 6: Update `.join-header` logo color**

The join-header logo likely uses `color: var(--brand)` or a hardcoded `#FF5C00`. Ensure it uses `var(--brand)`. The "Sign in" or back link should use `color: var(--text-muted)`.

- [ ] **Step 7: Build**

```bash
cd /Users/bobanpepic/trainedby && npm run build 2>&1 | tail -20
```

Expected: `Build complete` with zero errors.

- [ ] **Step 8: Commit**

```bash
git add src/pages/join.astro
git commit -m "feat: switch join.astro to light theme, delete inverted dark tokens"
```

---

## Task 6: Convert pricing.astro to Light Theme

**Files:**
- Modify: `src/pages/pricing.astro`

pricing.astro has a custom inline nav and self-referential (broken) local `:root` aliases like `--surface: var(--bg, #0a0a0a)` and `--surface-3: var(--surface-3, #1c1c1c)` (circular). Delete all of them.

- [ ] **Step 1: Add Nav.astro import to frontmatter**

```astro
import Nav from '../components/Nav.astro';
```

- [ ] **Step 2: Add light theme Fragment slot after `<Base ...>`**

```astro
  <Fragment slot="head">
    <meta name="color-scheme" content="light">
    <meta name="theme-color" content="#FFFFFF">
    <style>
      :root {
        --bg: #FFFFFF;
        --surface: #FAFAF9;
        --surface-2: #F5F4F3;
        --surface-3: #E8E5E2;
        --text: #1A1411;
        --text-2: #6B6460;
        --text-muted: #6B6460;
        --text-faint: rgba(26,20,17,0.35);
        --border: rgba(0,0,0,0.07);
        --border-hover: rgba(0,0,0,0.14);
        --brand: #FF5C00;
        --brand-hover: #e05200;
        --brand-dim: rgba(255,92,0,0.08);
        --brand-border: rgba(255,92,0,0.2);
        --reps: #00C853;
        --reps-dim: rgba(0,200,83,0.08);
        --reps-border: rgba(0,200,83,0.2);
      }
      body { background: var(--bg); color: var(--text); }
    </style>
  </Fragment>
```

- [ ] **Step 3: Delete the broken local `:root` block entirely**

Delete the entire `:root { ... }` block in the `<style>` tag:

```css
/* DELETE THIS ENTIRE BLOCK: */
:root {
  --reps: var(--green, #00C853);
  --reps-dim: var(--green-dim, rgba(0,200,83,0.08));
  --reps-border: var(--green-border, rgba(0,200,83,0.2));
  --surface: var(--bg, #0a0a0a);
  --surface-2: var(--surface, #111);
  --surface-3: var(--surface-3, #1c1c1c);
  --text-muted: var(--text-2, rgba(255,255,255,0.55));
  --text-faint: var(--text-faint, rgba(255,255,255,0.25));
}
```

- [ ] **Step 4: Delete the inline nav CSS and HTML, replace with Nav.astro**

Delete the `nav` CSS block:

```css
/* DELETE: */
nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  background: rgba(10,10,10,0.9); backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}
.nav-inner { ... }
.nav-logo { ... }
/* ...any other .nav-* rules */
```

Delete the inline `<nav>...</nav>` HTML in the template and replace with:

```astro
<Nav variant="landing" />
```

- [ ] **Step 5: Fix body background**

```css
/* FROM: */
body { background: var(--bg, #0a0a0a); ... }

/* TO: */
body { background: var(--bg); color: var(--text); ... }
```

- [ ] **Step 6: Build**

```bash
cd /Users/bobanpepic/trainedby && npm run build 2>&1 | tail -20
```

Expected: `Build complete` with zero errors.

- [ ] **Step 7: Commit**

```bash
git add src/pages/pricing.astro
git commit -m "feat: switch pricing.astro to light theme, remove broken local tokens and inline nav"
```

---

## Task 7: Convert blog.astro to Light Theme

**Files:**
- Modify: `src/pages/blog.astro`

blog.astro is currently dark by default (no light override). It has a custom inline nav. Adding the light Fragment and Nav.astro consumer variant makes it match the landing page's Stories section.

- [ ] **Step 1: Add Nav.astro import to frontmatter**

```astro
import Nav from '../components/Nav.astro';
```

- [ ] **Step 2: Add light theme Fragment slot after `<Base ...>`**

```astro
  <Fragment slot="head">
    <meta name="color-scheme" content="light">
    <meta name="theme-color" content="#FFFFFF">
    <style>
      :root {
        --bg: #FFFFFF;
        --surface: #FAFAF9;
        --surface-2: #F5F4F3;
        --surface-3: #E8E5E2;
        --text: #1A1411;
        --text-2: #6B6460;
        --text-muted: #6B6460;
        --text-faint: rgba(26,20,17,0.35);
        --border: rgba(0,0,0,0.07);
        --border-hover: rgba(0,0,0,0.14);
        --brand: #FF5C00;
        --brand-hover: #e05200;
        --brand-dim: rgba(255,92,0,0.08);
        --brand-border: rgba(255,92,0,0.2);
      }
      body { background: var(--bg); color: var(--text); }
    </style>
  </Fragment>
```

- [ ] **Step 3: Remove the inline nav CSS rules and HTML, replace with Nav.astro**

Find any nav-related CSS (`.nav`, `.nav-logo`, `.nav-links`, `.nav-cta` etc.) in the `<style>` block and delete those rules.

Find the `<nav>...</nav>` HTML near the top of the template and replace with:

```astro
<Nav variant="consumer" />
```

- [ ] **Step 4: Delete any local `:root` override block**

If blog.astro has a local `:root` block, delete it entirely. The Fragment slot above handles the light theme.

- [ ] **Step 5: Fix body background**

```css
/* Ensure: */
body { background: var(--bg); color: var(--text); ... }
```

- [ ] **Step 6: Replace hardcoded hex in blog card/layout rules**

Find any remaining dark hardcoded values and replace with tokens:
- `#0a0a0a` → `var(--bg)`
- `#111` or `#111111` → `var(--surface)`
- `#1a1a1a` → `var(--surface-2)`
- `#f0f0f0` or `#fff` as text color → `var(--text)`
- `rgba(255,255,255,0.5)` → `var(--text-muted)`
- `rgba(255,255,255,0.07)` → `var(--border)`
- `#FF5C00` → `var(--brand)`

- [ ] **Step 7: Build**

```bash
cd /Users/bobanpepic/trainedby && npm run build 2>&1 | tail -20
```

Expected: `Build complete` with zero errors.

- [ ] **Step 8: Commit**

```bash
git add src/pages/blog.astro
git commit -m "feat: switch blog.astro to light theme, replace inline nav with Nav.astro consumer variant"
```

---

## Task 8: Fix find.astro

**Files:**
- Modify: `src/pages/find.astro` (lines 42–60 — the redundant local `:root` block)

find.astro already has the correct light theme in its `<Fragment slot="head">`. The problem is a duplicate `:root` block in the `<style>` tag (lines 43–59) that uses `--surface2` (no hyphen — typo) instead of `--surface-2`. Delete the duplicate; the Fragment slot already wins.

- [ ] **Step 1: Delete the redundant local `:root` block from `<style>`**

In `src/pages/find.astro`, inside the `<style>` tag, delete:

```css
/* DELETE THIS ENTIRE BLOCK (the redundant local :root): */
:root{
  --bg:#FFFFFF;
  --surface:#FAFAF9;
  --surface2:#F5F4F3;
  --surface3:#E8E5E2;
  --text:#1A1411;
  --text-muted:#6B6460;
  --border:rgba(0,0,0,0.07);
  --border-hover:rgba(0,0,0,0.14);
  --brand:#FF5C00;
  --brand-dim:rgba(255,92,0,0.08);
  --brand-border:rgba(255,92,0,0.2);
  --green:#00C853;
  --radius:14px;
  --font:'DM Sans',system-ui,sans-serif;
}
```

- [ ] **Step 2: Fix any `--surface2` or `--surface3` references in the file**

```bash
grep -n 'surface2\|surface3' src/pages/find.astro
```

Replace each occurrence with the hyphenated versions:
- `var(--surface2)` → `var(--surface-2)`
- `var(--surface3)` → `var(--surface-3)`

- [ ] **Step 3: Replace the sticky top-bar nav with Nav.astro consumer variant**

find.astro has a `.top-bar` / `.top-bar-inner` nav-like element at the top. This should be replaced with `<Nav variant="consumer" />`.

Import Nav in frontmatter:
```astro
import Nav from '../components/Nav.astro';
```

Replace the `.top-bar` HTML block with:
```astro
<Nav variant="consumer" />
```

Delete the `.top-bar`, `.top-bar-inner` CSS rules from `<style>`.

- [ ] **Step 4: Build**

```bash
cd /Users/bobanpepic/trainedby && npm run build 2>&1 | tail -20
```

Expected: `Build complete` with zero errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/find.astro
git commit -m "fix: delete redundant local :root in find.astro, fix --surface2 typo, use Nav.astro consumer"
```

---

## Task 9: Add Light Theme to find/[city].astro

**Files:**
- Modify: `src/pages/find/[city].astro`

[city].astro is currently dark (no light override), inconsistent with `/find`. Add light theme and Nav.astro consumer variant.

- [ ] **Step 1: Add Nav.astro import to frontmatter**

```astro
import Nav from '../../components/Nav.astro';
```

- [ ] **Step 2: Add light theme Fragment slot after `<Base ...>`**

```astro
  <Fragment slot="head">
    <meta name="color-scheme" content="light">
    <meta name="theme-color" content="#FFFFFF">
    <style>
      :root {
        --bg: #FFFFFF;
        --surface: #FAFAF9;
        --surface-2: #F5F4F3;
        --surface-3: #E8E5E2;
        --text: #1A1411;
        --text-2: #6B6460;
        --text-muted: #6B6460;
        --text-faint: rgba(26,20,17,0.35);
        --border: rgba(0,0,0,0.07);
        --border-hover: rgba(0,0,0,0.14);
        --brand: #FF5C00;
        --brand-hover: #e05200;
        --brand-dim: rgba(255,92,0,0.08);
        --brand-border: rgba(255,92,0,0.2);
      }
      body { background: var(--bg); color: var(--text); }
    </style>
  </Fragment>
```

- [ ] **Step 3: Replace inline nav HTML with Nav.astro**

Find any inline `<nav>` or header element and replace with:

```astro
<Nav variant="consumer" />
```

Delete the corresponding nav CSS rules.

- [ ] **Step 4: Replace hardcoded hex with tokens**

```bash
grep -n '#0a0a0a\|#111111\|#f0f0f0\|rgba(255,255,255' src/pages/find/\[city\].astro
```

Replace each:
- `#0a0a0a` → `var(--bg)` (now white)
- `#111111` → `var(--surface)`
- `#f0f0f0` → `var(--text)`
- `rgba(255,255,255,0.5)` → `var(--text-muted)`
- `rgba(255,255,255,0.07)` → `var(--border)`
- `#FF5C00` → `var(--brand)`

- [ ] **Step 5: Build**

```bash
cd /Users/bobanpepic/trainedby && npm run build 2>&1 | tail -20
```

Expected: `Build complete` with zero errors.

- [ ] **Step 6: Commit**

```bash
git add "src/pages/find/[city].astro"
git commit -m "feat: add light theme to find/[city].astro, replace inline nav with Nav.astro consumer"
```

---

## Task 10: Clean Up App Pages (Dark, Token Only)

**Files:**
- Modify: `src/pages/edit.astro`
- Modify: `src/pages/admin.astro` (if exists)
- Modify: `src/pages/superadmin.astro` (if exists)

App pages stay dark. Goal: delete incorrect local `:root` overrides that fight Base.astro. No theme change.

- [ ] **Step 1: Fix edit.astro — delete the inverted surface override**

In `src/pages/edit.astro`, find the local `:root` block and delete the inverted line:

```css
/* DELETE this specific line inside whatever :root block exists: */
--surface: #0a0a0a;
```

The value `#0a0a0a` is the same as `--bg` — that's the semantic inversion bug. With this line deleted, `--surface` inherits `#111111` from Base.astro, which is correct (slightly lighter than bg).

If the entire `:root` block only contains this one rule, delete the whole block.

- [ ] **Step 2: Fix admin.astro — delete redundant --brand override**

In `src/pages/admin.astro`, find and delete:

```css
/* DELETE: */
--brand: #FF5C00;
```

This is now redundant since Base.astro has the correct value after Task 1.

- [ ] **Step 3: Fix superadmin.astro — same as admin**

In `src/pages/superadmin.astro`, delete any local `--brand: #FF5C00;` override.

- [ ] **Step 4: Build**

```bash
cd /Users/bobanpepic/trainedby && npm run build 2>&1 | tail -20
```

Expected: `Build complete` with zero errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/edit.astro src/pages/admin.astro src/pages/superadmin.astro
git commit -m "fix: delete inverted --surface override in edit.astro, redundant --brand in admin/superadmin"
```

---

## Task 11: Token Migration for 404.astro

**Files:**
- Modify: `src/pages/404.astro`

404.astro uses zero design tokens — all hardcoded hex. This task replaces every hardcoded color with the appropriate token.

- [ ] **Step 1: Add `<Fragment slot="head">` with dark meta (404 stays dark)**

After the `<Base ...>` opening tag:

```astro
  <Fragment slot="head">
    <meta name="color-scheme" content="dark">
    <meta name="theme-color" content="#0a0a0a">
  </Fragment>
```

- [ ] **Step 2: Replace all hardcoded colors with tokens**

Find:
```bash
grep -n '#0a0a0a\|#fff\|#ffffff\|#FF5C00\|rgba(255,255,255' src/pages/404.astro
```

Replace each occurrence:
- `background: #0a0a0a` → `background: var(--bg)`
- `color: #fff` → `color: var(--text)`
- `color: #ffffff` → `color: var(--text)`
- `background: #FF5C00` → `background: var(--brand)`
- `color: #FF5C00` → `color: var(--brand)`
- `color: rgba(255,255,255,0.55)` → `color: var(--text-muted)`
- `color: rgba(255,255,255,0.5)` → `color: var(--text-muted)`
- `border: 1px solid rgba(255,255,255,0.1)` → `border: 1px solid var(--border)`

- [ ] **Step 3: Build**

```bash
cd /Users/bobanpepic/trainedby && npm run build 2>&1 | tail -20
```

Expected: `Build complete` with zero errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/404.astro
git commit -m "fix: migrate 404.astro from hardcoded hex to design token system"
```

---

## Task 12: Fix Profile Pages ([slug].astro and profile.astro)

**Files:**
- Modify: `src/pages/[slug].astro`
- Modify: `src/pages/profile.astro`

Both profile pages are light/white. [slug].astro currently uses a `body:has(#tb-page)` hack to force white. profile.astro uses completely non-standard token names (`--orange`, `--white`, `--glass`, etc.). Both need to adopt the standard light token system.

### [slug].astro

- [ ] **Step 1: Add light theme Fragment slot**

In `src/pages/[slug].astro`, after the `<Base ...>` opening tag add:

```astro
  <Fragment slot="head">
    <meta name="color-scheme" content="light">
    <meta name="theme-color" content="#FFFFFF">
    <style>
      :root {
        --bg: #FFFFFF;
        --surface: #FAFAF9;
        --surface-2: #F5F4F3;
        --surface-3: #E8E5E2;
        --text: #1A1411;
        --text-2: #6B6460;
        --text-muted: #6B6460;
        --text-faint: rgba(26,20,17,0.35);
        --border: rgba(0,0,0,0.07);
        --border-hover: rgba(0,0,0,0.14);
        --brand: #FF5C00;
        --brand-hover: #e05200;
        --brand-dim: rgba(255,92,0,0.08);
        --brand-border: rgba(255,92,0,0.2);
      }
      body { background: var(--bg); color: var(--text); }
    </style>
  </Fragment>
```

- [ ] **Step 2: Replace the body:has hack with token-based rule**

Find in the `<style is:global>` block:

```css
/* FROM: */
body:has(#tb-page) {
  background: #FFFFFF;
  color: #111111;
}

/* TO: */
body:has(#tb-page) {
  background: var(--bg);
  color: var(--text);
}
```

- [ ] **Step 3: Replace remaining hardcoded hex in the style block**

```bash
grep -n '#1A1411\|#6B6460\|#FF5C00\|#FFFFFF\|#ffffff\|#111111' src/pages/\[slug\].astro
```

Replace each:
- `#1A1411` → `var(--text)`
- `#6B6460` → `var(--text-muted)`
- `#FF5C00` → `var(--brand)`
- `#FFFFFF` or `#ffffff` (as background) → `var(--bg)`
- `#111111` (as foreground text) → `var(--text)`

### profile.astro

- [ ] **Step 4: Add light theme Fragment slot to profile.astro**

After `<Base ...>`:

```astro
  <Fragment slot="head">
    <meta name="color-scheme" content="light">
    <meta name="theme-color" content="#FFFFFF">
    <style>
      :root {
        --bg: #FFFFFF;
        --surface: #FAFAF9;
        --surface-2: #F5F4F3;
        --surface-3: #E8E5E2;
        --text: #1A1411;
        --text-2: #6B6460;
        --text-muted: #6B6460;
        --text-faint: rgba(26,20,17,0.35);
        --border: rgba(0,0,0,0.07);
        --border-hover: rgba(0,0,0,0.14);
        --brand: #FF5C00;
        --brand-hover: #e05200;
        --brand-dim: rgba(255,92,0,0.08);
        --brand-border: rgba(255,92,0,0.2);
        --glass: rgba(255,255,255,0.8);
        --glass-border: rgba(0,0,0,0.08);
      }
      body { background: var(--bg); color: var(--text); }
    </style>
  </Fragment>
```

- [ ] **Step 5: Replace non-standard token names in profile.astro**

Find and replace in the `<style>` block:

```bash
grep -n '\-\-orange\|\-\-white\b\|\-\-white-60\|\-\-white-30' src/pages/profile.astro
```

Replace:
- `var(--orange)` → `var(--brand)`
- `var(--white)` → `var(--bg)` (or `var(--text)` where it's used as text on dark backgrounds — read context)
- `var(--white-60)` → `var(--text-muted)`
- `var(--white-30)` → `var(--text-faint)`
- `var(--glass)` → now defined in Fragment slot above
- `var(--glass-border)` → now defined in Fragment slot above

Delete the old local `:root` block in profile.astro that defined these non-standard names.

Replace `background: #0a0a0a` with `background: var(--bg)`.

- [ ] **Step 6: Build**

```bash
cd /Users/bobanpepic/trainedby && npm run build 2>&1 | tail -20
```

Expected: `Build complete` with zero errors.

- [ ] **Step 7: Commit**

```bash
git add "src/pages/[slug].astro" src/pages/profile.astro
git commit -m "fix: migrate [slug].astro and profile.astro to light token system, remove hacks and non-standard names"
```

---

## Task 13: Migrate my-bookings.astro to BaseMinimal.astro

**Files:**
- Modify: `src/pages/my-bookings.astro`

my-bookings.astro currently emits raw `<!DOCTYPE html>` with no shared layout. Migrating to BaseMinimal.astro gives it DM Sans, correct meta tags, OG data, and the light token system.

- [ ] **Step 1: Update the frontmatter import**

Change the top of `src/pages/my-bookings.astro`:

```astro
---
/* FROM (likely has no layout import or an ad-hoc one): */
import { getMarket } from '../lib/market.ts';

/* TO: add BaseMinimal import */
import BaseMinimal from '../layouts/BaseMinimal.astro';
import { getMarket } from '../lib/market.ts';
---
```

- [ ] **Step 2: Replace the raw HTML structure with BaseMinimal**

The file currently has:

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- hand-rolled head -->
  </head>
  <body>
    <!-- page content -->
  </body>
</html>
```

Transform it to:

```astro
<BaseMinimal
  title={`My Bookings | ${market.brandName}`}
  description="View and manage your training session bookings."
>
  <!-- paste ONLY the body content here (no <html>, no <head>, no <body> tags) -->
</BaseMinimal>
```

Delete the entire hand-rolled `<html>`, `<head>`, `<body>` structure. Keep only the body content between `<BaseMinimal>` and `</BaseMinimal>`.

- [ ] **Step 3: Replace dark hardcoded hex with light tokens**

The page uses dark hardcoded colors. Replace:
- `background: #0a0a0a` → `background: var(--bg)`
- `background: #111` or `#111111` → `background: var(--surface)`
- `background: #1a1a1a` → `background: var(--surface-2)`
- `color: #fff` or `#ffffff` → `color: var(--text)`
- `color: rgba(255,255,255,0.4)` → `color: var(--text-muted)`
- `border: 1px solid rgba(255,255,255,0.1)` → `border: 1px solid var(--border)`
- `#FF5C00` → `var(--brand)`

- [ ] **Step 4: Delete any hand-rolled font loading**

The page may have its own `<link>` to Google Fonts. Delete it — BaseMinimal.astro handles fonts.

- [ ] **Step 5: Build**

```bash
cd /Users/bobanpepic/trainedby && npm run build 2>&1 | tail -20
```

Expected: `Build complete` with zero errors.

- [ ] **Step 6: Commit**

```bash
git add src/pages/my-bookings.astro
git commit -m "feat: migrate my-bookings.astro from raw HTML to BaseMinimal.astro with light token system"
```

---

## Task 14: Migrate book/[slug].astro to BaseMinimal.astro

**Files:**
- Modify: `src/pages/book/[slug].astro`

book/[slug].astro is standalone (no layout). Migrating to BaseMinimal.astro + adding Nav.astro minimal variant gives it DM Sans, meta tags, and a branded logo header without nav links (user is mid-purchase).

- [ ] **Step 1: Update the frontmatter imports**

```astro
---
/* ADD: */
import BaseMinimal from '../../layouts/BaseMinimal.astro';
import Nav from '../../components/Nav.astro';
/* keep existing imports: */
import { getMarket } from '../../lib/market.ts';
/* ...rest of frontmatter */
---
```

- [ ] **Step 2: Replace the raw HTML structure with BaseMinimal**

```astro
<BaseMinimal
  title={`Book a Session | ${market.brandName}`}
  description="Book a personal training session."
>
  <Nav variant="minimal" />
  <!-- paste ONLY the body content here -->
</BaseMinimal>
```

Delete the `<!DOCTYPE html>`, `<html>`, `<head>`, `<body>` wrappers. Keep body content only.

- [ ] **Step 3: Replace dark hardcoded hex with light tokens**

Same pattern as Task 13. Find dark hex and replace with light token equivalents:
- `#0a0a0a` → `var(--bg)` (now white)
- `#111` → `var(--surface)`
- `#fff` as background → `var(--bg)`
- `#fff` as text on dark → delete (will be `var(--text)` = dark on light)
- `rgba(255,255,255,...)` borders/muted text → `var(--border)` / `var(--text-muted)`
- `#FF5C00` → `var(--brand)`

Pay attention to any payment form elements — ensure inputs use `background: var(--surface-2); border: 1px solid var(--border); color: var(--text)`.

- [ ] **Step 4: Delete any hand-rolled font loading**

BaseMinimal handles DM Sans. Delete any duplicate `<link>` to Google Fonts that was in the hand-rolled head.

- [ ] **Step 5: Build**

```bash
cd /Users/bobanpepic/trainedby && npm run build 2>&1 | tail -20
```

Expected: `Build complete` with zero errors.

- [ ] **Step 6: Commit**

```bash
git add "src/pages/book/[slug].astro"
git commit -m "feat: migrate book/[slug].astro to BaseMinimal.astro with Nav.astro minimal variant"
```

---

## Task 15: Final Verification and Clean-Up

**Files:**
- Read: all modified files (spot check)

- [ ] **Step 1: Scan for remaining `#D4622A`**

```bash
grep -r '#D4622A\|#d4622a' src/
```

Expected: zero matches.

- [ ] **Step 2: Scan for remaining hardcoded hex in page `<style>` blocks**

```bash
grep -rn '#[0-9a-fA-F]\{6\}\|#[0-9a-fA-F]\{3\}' src/pages/ | grep -v '\.astro:[0-9]*:.*<!--' | grep '<style' -A 200 | head -80
```

(Manual spot check — look for color hex values outside of token definitions. Some are legitimate, e.g., in gradient fallbacks inside `var()` calls. Target: no raw hex for bg, surface, text, border, or brand.)

- [ ] **Step 3: Scan for duplicate `:root` overrides that fight the Fragment slot**

```bash
grep -n ':root' src/pages/for-trainers.astro src/pages/join.astro src/pages/pricing.astro src/pages/blog.astro src/pages/find.astro
```

Expected: zero matches (all local `:root` blocks should have been deleted).

- [ ] **Step 4: Scan for inline nav remnants**

```bash
grep -n 'nav-logo\|nav-links\|nav-cta\|join-header\|.nav {' src/pages/for-trainers.astro src/pages/join.astro src/pages/pricing.astro src/pages/blog.astro src/pages/find.astro
```

Expected: zero matches.

- [ ] **Step 5: Confirm standalone pages are no longer raw HTML**

```bash
grep -n '<!DOCTYPE\|<!doctype' src/pages/my-bookings.astro src/pages/book/\[slug\].astro
```

Expected: zero matches (BaseMinimal.astro handles the doctype).

- [ ] **Step 6: Full build**

```bash
cd /Users/bobanpepic/trainedby && npm run build 2>&1
```

Expected: `Build complete` with zero errors. Note and fix any TypeScript or Astro errors before proceeding.

- [ ] **Step 7: Final commit**

```bash
git add -A
git status
```

If there are any uncommitted changes from the verification pass, commit them:

```bash
git commit -m "fix: design system standardization — final cleanup pass"
```

- [ ] **Step 8: Push**

```bash
git push
```

---

## Success Criteria (from spec)

- [ ] Every page loads without a white-flash or theme flip
- [ ] `#D4622A` appears nowhere in the codebase
- [ ] `Nav.astro` is the only nav component for marketing/consumer pages
- [ ] `my-bookings` and `book/[slug]` render DM Sans and proper meta tags
- [ ] All trainer funnel pages (for-trainers → join → pricing) feel visually continuous with landing
- [ ] Blog matches the visual language of the landing page's Stories section
- [ ] Profile page (`[slug].astro`) remains white/light throughout
- [ ] No hardcoded hex values remain in page `<style>` blocks (token system only)
- [ ] `npm run build` passes with zero errors
