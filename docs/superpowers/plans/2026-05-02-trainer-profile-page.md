# Trainer Profile Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `src/pages/[slug].astro` to implement the approved Hopp-inspired design — full-bleed photo hero, DM Sans, charcoal-neutral palette, package carousel, sticky compact header.

**Architecture:** Single-file rewrite of `[slug].astro`. SSR frontmatter (slug validation, trainer existence check, JSON-LD) is preserved almost unchanged. The entire `<style>` block and client-side `<script>` block are replaced. Market config (`paymentEnabled`, `currency`) is injected server-side via `define:vars` so the client render function can use it without an extra fetch.

**Tech Stack:** Astro SSR, DM Sans (Google Fonts), Heroicons SVG (inline), `IntersectionObserver` API, CSS `scroll-snap`, no new npm dependencies.

**Spec:** `docs/superpowers/specs/2026-05-02-trainer-profile-page-design.md`
**Branch:** Work on `main` directly (solo workflow per project memory).

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Modify | `src/pages/[slug].astro` | Full page rewrite — all HTML, CSS, JS |
| Modify | `src/layouts/Base.astro` | Add DM Sans preload/link to `<head>` |

No new files. No new edge functions. `get-trainer` already returns `{ trainer, packages }` — untouched.

---

## Task 1: Add DM Sans to Base.astro

**Files:**
- Modify: `src/layouts/Base.astro` (the `<head>` font block, lines ~104–109)

- [ ] **Step 1: Read the current font block in Base.astro**

  Read `src/layouts/Base.astro` lines 96–115. Confirm the existing Manrope + Inter `<link rel="preconnect">` and `<link rel="preload">` block location.

- [ ] **Step 2: Add DM Sans preload and link**

  In `src/layouts/Base.astro`, find the line:
  ```html
  <!-- ── Fonts: Manrope (display/headings) + Inter (body/UI) ────────── -->
  ```

  Add DM Sans lines **immediately after** the Inter preload/link group (before the closing `</head>`-adjacent `<body>` tag). The DM Sans URL requests weights 200, 300, 400, 500, 600 at optical sizes 9–40:

  ```html
  <!-- ── DM Sans (trainer profile page) ──────────────────────────────── -->
  <link
    rel="preload"
    as="style"
    href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,200;0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap"
  />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,200;0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap"
  />
  ```

- [ ] **Step 3: Verify font loads**

  Run: `npm run dev` (or `npx astro dev`)

  Open any page in browser. In DevTools → Network → filter "DM+Sans" — confirm the stylesheet request appears and returns 200.

- [ ] **Step 4: Commit**

  ```bash
  git add src/layouts/Base.astro
  git commit -m "feat: add DM Sans font to Base layout for trainer profile redesign"
  ```

---

## Task 2: Replace CSS tokens and page shell

**Files:**
- Modify: `src/pages/[slug].astro` (the `<style>` block and outer HTML markup)

This task removes all dark/glassmorphism tokens and the `#bg` / `#bg-bloom` elements. Replaces them with the charcoal-neutral token system and a white-body page shell.

- [ ] **Step 1: Replace the entire `<style>` block**

  Find the `<style>` opening tag (line 112) through its closing `</style>` tag (line 164). Replace the entire block with:

  ```html
  <style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

  /* ── DM Sans as the only font ───────────────────────────────── */
  :root {
    --font: 'DM Sans', system-ui, sans-serif;

    /* Text scale */
    --text-primary:   #111111;
    --text-secondary: #6B6460;
    --text-muted:     #A8A09A;
    --text-faint:     #B8B0AA;

    /* Surfaces */
    --bg-white:       #FFFFFF;
    --border:         rgba(0,0,0,0.055);

    /* Buttons */
    --btn-primary-bg:       #1A1411;
    --btn-primary-text:     #FFFFFF;
    --btn-secondary-border: rgba(0,0,0,0.10);
    --btn-secondary-text:   #7A7068;

    /* Tags */
    --tag-bg:   rgba(0,0,0,0.05);
    --tag-text: #6B6460;

    /* Reviews */
    --review-card-bg: #F8F7F5;
  }

  html, body {
    height: 100%;
    width: 100%;
    overflow-x: hidden;
  }
  body {
    font-family: var(--font);
    background: #FFFFFF;
    color: var(--text-primary);
    -webkit-font-smoothing: antialiased;
  }

  /* Loading spinner */
  .tb-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }
  .tb-spinner {
    width: 32px; height: 32px;
    border: 2px solid rgba(0,0,0,0.08);
    border-top-color: #1A1411;
    border-radius: 50%;
    animation: tb-spin 0.75s linear infinite;
  }
  @keyframes tb-spin { to { transform: rotate(360deg); } }

  /* Sticky compact header — hidden until scroll */
  #tb-compact-header {
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 56px;
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border-bottom: 1px solid rgba(0,0,0,0.07);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    z-index: 100;
    opacity: 0;
    pointer-events: none;
    transition: opacity 200ms ease;
  }
  #tb-compact-header.visible {
    opacity: 1;
    pointer-events: auto;
  }
  #tb-compact-header .ch-name {
    font-size: 15px;
    font-weight: 400;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: calc(100% - 88px);
  }
  .ch-btn {
    width: 36px; height: 36px;
    border: none; background: none;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: var(--text-primary);
    flex-shrink: 0;
  }

  /* ── Bottom navigation ───────────────────────────────────────── */
  #tb-bottom-nav {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    height: 84px;
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-top: 1px solid rgba(0,0,0,0.07);
    display: flex;
    align-items: flex-start;
    justify-content: space-around;
    padding-top: 12px;
    z-index: 90;
  }
  .nav-item {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    text-decoration: none; font-size: 10px; font-weight: 500;
    letter-spacing: 0.03em; color: #C8C0BA;
    cursor: pointer; border: none; background: none; font-family: var(--font);
  }
  .nav-item.active { color: #1A1411; }
  .nav-item svg { width: 24px; height: 24px; }

  /* ── Profile mount ───────────────────────────────────────────── */
  #profile-mount {
    padding-bottom: max(84px, calc(84px + env(safe-area-inset-bottom)));
  }

  /* ── WhatsApp pulse (kept for message button) ─────────────────── */
  @keyframes wa-pulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(37,211,102,0.4); }
    50%      { box-shadow: 0 0 0 8px rgba(37,211,102,0); }
  }
  </style>
  ```

- [ ] **Step 2: Replace the outer HTML markup**

  Find the block from `<div id="bg"></div>` (around line 166) through `</div>` (the closing root div, around line 173). Replace with:

  ```html
  <!-- Sticky compact header — appears when hero scrolls out of view -->
  <div id="tb-compact-header">
    <button class="ch-btn" id="ch-back" aria-label="Back">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
    </button>
    <span class="ch-name" id="ch-trainer-name"></span>
    <button class="ch-btn" id="ch-share" aria-label="Share">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
    </button>
  </div>

  <!-- Page content -->
  <div id="tb-root">
    <div class="tb-loading" id="tb-loading">
      <div class="tb-spinner"></div>
    </div>
    <div id="profile-mount" style="display:none"></div>
  </div>

  <!-- Sticky bottom nav (always visible) -->
  <nav id="tb-bottom-nav" aria-label="Main navigation">
    <a href="/find" class="nav-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      Discover
    </a>
    <a href="/find" class="nav-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      Search
    </a>
    <a href="/dashboard" class="nav-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      Bookings
    </a>
    <a href="/dashboard/messages" class="nav-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      Messages
    </a>
    <a href="/dashboard" class="nav-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      Profile
    </a>
  </nav>
  ```

- [ ] **Step 3: Verify shell renders**

  `npm run dev`, open `/[any-valid-slug]`. Confirm: white background, spinner shown while loading, bottom nav visible at the bottom, no orange anywhere.

- [ ] **Step 4: Commit**

  ```bash
  git add src/pages/[slug].astro
  git commit -m "feat: replace dark glassmorphism shell with white charcoal-neutral shell"
  ```

---

## Task 3: Inject market config client-side

**Files:**
- Modify: `src/pages/[slug].astro` (frontmatter + `define:vars` block)

The `paymentEnabled` flag and `currencySymbol` must be available to `renderProfile()` without an extra network request. They're injected at SSR time.

- [ ] **Step 1: Extend server-side market extraction**

  In the frontmatter (after the existing `market` / `brandName` lines, around line 11–12), add:

  ```astro
  const paymentEnabled = market.paymentEnabled;
  const currencySymbol = market.currencySymbol;
  ```

- [ ] **Step 2: Inject into client via define:vars**

  Find the existing `<script define:vars={{ slug }}>` block (line 107). Change it to:

  ```astro
  <script define:vars={{ slug, paymentEnabled, currencySymbol }}>
    window.__TRAINER_SLUG__ = slug;
    window.__PAYMENT_ENABLED__ = paymentEnabled;
    window.__CURRENCY_SYMBOL__ = currencySymbol;
  </script>
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add src/pages/[slug].astro
  git commit -m "feat: inject paymentEnabled and currencySymbol from market config to client"
  ```

---

## Task 4: Rewrite renderProfile() — Hero section

**Files:**
- Modify: `src/pages/[slug].astro` (the `renderProfile` function inside `<script>`)

Replace the `renderProfile()` function body with the new design. This task covers the **hero** (460px full-bleed photo, hero fade, back/share buttons, name block).

- [ ] **Step 1: Replace the renderProfile function**

  Find `function renderProfile(t, packages) {` (around line 290) and its closing `}` (around line 544). Replace the entire function with:

  ```javascript
  function renderProfile(t, packages) {
    window.__TRAINER_ID__ = t.id;
    const loading = document.getElementById('tb-loading');
    const mount = document.getElementById('profile-mount');
    if (loading) loading.style.display = 'none';
    if (!mount) return;
    mount.style.display = 'block';

    // ── Data extraction ──────────────────────────────────────────
    const displayName = t.name || t.full_name || '';
    const photoUrl = t.avatar_url || t.profile_photo_url || '';
    const specialties = Array.isArray(t.specialties)
      ? t.specialties.slice(0, 4)
      : (t.specialties ? [t.specialties] : []);
    const district = t.location_district || t.city || '';
    const bio = t.bio || '';
    const yearsExp = t.years_experience || null;
    const goalRate = t.goal_achievement_rate || null;
    const totalClients = t.total_clients || null;
    const avgRating = t.average_rating || t.avg_rating || null;
    const reviewCount = t.review_count || 0;
    const paymentEnabled = window.__PAYMENT_ENABLED__ !== false;
    const currencySymbol = window.__CURRENCY_SYMBOL__ || '';

    // Deduplicate packages by name
    const seenNames = new Set();
    const pkgList = (Array.isArray(packages) ? packages : [])
      .filter(p => { if (seenNames.has(p.name)) return false; seenNames.add(p.name); return true; })
      .sort((a, b) => (a.price || 0) - (b.price || 0))
      .slice(0, 6);

    // Update compact header trainer name
    const chName = document.getElementById('ch-trainer-name');
    if (chName) chName.textContent = displayName;

    // Update page title
    document.title = displayName
      ? `${displayName} — Verified Trainer`
      : 'Trainer Profile';

    // ── Hero HTML ────────────────────────────────────────────────
    const photoFallback = 'linear-gradient(168deg, #18191C, #272A30)';
    const heroStyle = photoUrl
      ? `background: ${photoFallback}; position: relative; height: 460px; overflow: hidden;`
      : `background: ${photoFallback}; position: relative; height: 460px; overflow: hidden;`;

    const heroImg = photoUrl
      ? `<img
           src="${photoUrl}"
           alt="${displayName.replace(/"/g, '&quot;')}"
           style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;z-index:1;"
           onerror="this.style.display='none'"
         />`
      : '';

    // Frosted glass circle button helper
    function glassCircle(content, extraStyle = '') {
      return `<div style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.22);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;cursor:pointer;${extraStyle}">${content}</div>`;
    }

    const backBtn = glassCircle(
      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`
    );
    const shareBtn = glassCircle(
      `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`
    );

    const nameBlock = `
      <div style="position:absolute;bottom:20px;left:28px;z-index:4;right:28px">
        <div style="font-family:'DM Sans',sans-serif;font-size:36px;font-weight:200;letter-spacing:0.02em;color:#fff;line-height:1.1;text-shadow:0 2px 12px rgba(0,0,0,0.35)">${displayName}</div>
        ${(specialties.length > 0 || district) ? `
        <div style="font-family:'DM Sans',sans-serif;font-size:13px;font-weight:300;color:rgba(255,255,255,0.82);margin-top:4px;text-shadow:0 1px 6px rgba(0,0,0,0.4)">
          ${[specialties[0], district].filter(Boolean).join(' · ')}
        </div>` : ''}
      </div>`;

    const heroSection = `
      <!-- Hero sentinel — IntersectionObserver watches this -->
      <div id="tb-hero-sentinel" style="position:absolute;top:420px;left:0;width:1px;height:1px;pointer-events:none"></div>
      <div style="${heroStyle}">
        ${heroImg}
        <!-- Hero fade: transparent → white over 220px -->
        <div style="position:absolute;bottom:0;left:0;right:0;height:220px;background:linear-gradient(to bottom,transparent,#ffffff);z-index:2;pointer-events:none"></div>
        <!-- Status-bar area (top padding) -->
        <!-- Back button -->
        <div onclick="history.back()" style="position:absolute;top:58px;left:20px;z-index:5;">${backBtn}</div>
        <!-- Share button -->
        <div id="hero-share-btn" onclick="shareProfile('${displayName.replace(/'/g, "\\'")}')" style="position:absolute;top:58px;right:20px;z-index:5;">${shareBtn}</div>
        ${nameBlock}
      </div>`;

    // ── Identity strip ───────────────────────────────────────────
    const tagPills = specialties.map(s =>
      `<span style="background:rgba(0,0,0,0.05);color:#6B6460;font-family:'DM Sans',sans-serif;font-size:10.5px;font-weight:500;letter-spacing:0.07em;text-transform:uppercase;padding:5px 10px;border-radius:20px">${s}</span>`
    ).join('');

    const identityStrip = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 24px;border-bottom:1px solid rgba(0,0,0,0.055);flex-wrap:wrap">
        <div style="display:flex;gap:8px;flex-wrap:wrap">${tagPills}</div>
        ${district ? `
        <div style="display:flex;align-items:center;gap:5px;color:#6B6460;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:300;white-space:nowrap">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${district}
        </div>` : ''}
      </div>`;

    // ── Stats row ────────────────────────────────────────────────
    const statsData = [
      { val: yearsExp,     fmt: v => `${v}`,   label: 'YRS EXP' },
      { val: goalRate,     fmt: v => `${v}%`,  label: 'GOAL RATE' },
      { val: totalClients, fmt: v => `${v}`,   label: 'CLIENTS' },
      { val: avgRating,    fmt: v => parseFloat(v).toFixed(1), label: 'RATING' },
    ].filter(s => s.val !== null && s.val !== 0 && s.val !== undefined);

    const statsHtml = statsData.length > 0 ? `
      <div style="display:flex;border-bottom:1px solid rgba(0,0,0,0.055)">
        ${statsData.map((s, i) => `
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;padding:16px 8px;${i < statsData.length - 1 ? 'border-right:1px solid rgba(0,0,0,0.06)' : ''}">
            <div style="font-family:'DM Sans',sans-serif;font-size:22px;font-weight:200;letter-spacing:-0.02em;color:#111">${s.fmt(s.val)}</div>
            <div style="font-family:'DM Sans',sans-serif;font-size:9.5px;font-weight:500;letter-spacing:0.09em;text-transform:uppercase;color:#B8B0AA;margin-top:3px">${s.label}</div>
          </div>`).join('')}
      </div>` : '';

    // ── CTA block ────────────────────────────────────────────────
    const bookLabel = paymentEnabled ? 'Book a Session' : 'Request a Session';
    const ctaBlock = `
      <div style="padding:20px 24px 16px">
        <button id="tb-book-btn" style="display:flex;align-items:center;justify-content:center;gap:10px;width:100%;height:52px;background:#1A1411;color:#fff;border:none;border-radius:13px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;letter-spacing:0.04em;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,0.20)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.65)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          ${bookLabel}
        </button>
        <button style="display:flex;align-items:center;justify-content:center;width:100%;height:46px;margin-top:10px;background:transparent;border:1px solid rgba(0,0,0,0.10);border-radius:13px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:300;color:#7A7068;cursor:pointer">
          Send a message
        </button>
      </div>`;

    // ── Packages carousel ────────────────────────────────────────
    const packageCards = pkgList.map(p => {
      const priceCurr = currencySymbol || p.currency || '';
      const detail = [p.duration ? `${p.duration} min` : '', p.location_type || ''].filter(Boolean).join(' · ');
      return `
        <div style="flex:0 0 240px;background:#fff;border:1px solid rgba(0,0,0,0.07);border-radius:14px;box-shadow:0 2px 12px rgba(0,0,0,0.06);padding:18px 20px;display:flex;flex-direction:column;justify-content:space-between;min-height:140px">
          <div>
            <div style="font-family:'DM Sans',sans-serif;font-size:15px;font-weight:400;color:#111">${p.name || p.title || 'Package'}</div>
            ${detail ? `<div style="font-family:'DM Sans',sans-serif;font-size:11px;font-weight:300;color:#A8A09A;margin-top:4px">${detail}</div>` : ''}
            ${p.description ? `<div style="font-family:'DM Sans',sans-serif;font-size:11px;font-weight:300;color:#A8A09A;margin-top:2px">${p.description}</div>` : ''}
          </div>
          <div style="margin-top:14px">
            <div style="font-family:'DM Sans',sans-serif;font-size:20px;font-weight:200;letter-spacing:-0.02em;color:#111;margin-bottom:10px">${p.price ? `${priceCurr} ${p.price}`.trim() : '—'}</div>
            <button style="width:100%;height:36px;background:#1A1411;color:#fff;border:none;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;cursor:pointer">Book</button>
          </div>
        </div>`;
    }).join('');

    const packagesSection = pkgList.length > 0 ? `
      <div style="padding:20px 0 0">
        <div style="display:flex;align-items:baseline;justify-content:space-between;padding:0 24px;margin-bottom:12px">
          <span style="font-family:'DM Sans',sans-serif;font-size:10px;font-weight:600;letter-spacing:0.13em;text-transform:uppercase;color:#B8B0AA">Sessions</span>
          <span style="font-family:'DM Sans',sans-serif;font-size:12px;font-weight:400;color:#9A9290;cursor:pointer">See all →</span>
        </div>
        <div style="display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;padding:0 24px 20px;scrollbar-width:none">
          ${packageCards}
          <!-- Peek spacer -->
          <div style="flex:0 0 1px"></div>
        </div>
      </div>` : '';

    // ── About section ────────────────────────────────────────────
    const MAX_BIO_CHARS = 160;
    const bioTruncated = bio.length > MAX_BIO_CHARS;
    const bioShort = bioTruncated ? bio.slice(0, MAX_BIO_CHARS).trimEnd() + '…' : bio;

    const aboutSection = bio ? `
      <div style="padding:20px 24px;border-top:1px solid rgba(0,0,0,0.055)">
        <div style="font-family:'DM Sans',sans-serif;font-size:10px;font-weight:600;letter-spacing:0.13em;text-transform:uppercase;color:#B8B0AA;margin-bottom:12px">About</div>
        <div id="tb-bio-short" style="font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:300;color:#4A4440;line-height:1.68">${bioShort}</div>
        ${bioTruncated ? `
        <div id="tb-bio-full" style="font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:300;color:#4A4440;line-height:1.68;display:none">${bio}</div>
        <button id="tb-read-more" onclick="toggleBio()" style="font-family:'DM Sans',sans-serif;font-size:13px;font-weight:400;color:#9A9290;background:none;border:none;padding:6px 0 0;cursor:pointer">Read more →</button>` : ''}
      </div>` : '';

    // ── Reviews section ──────────────────────────────────────────
    // Reviews are loaded async in loadReviews(). Placeholder rendered here.
    const reviewsSection = `
      <div id="tb-reviews-section" style="padding:20px 24px;border-top:1px solid rgba(0,0,0,0.055)">
        <div style="font-family:'DM Sans',sans-serif;font-size:10px;font-weight:600;letter-spacing:0.13em;text-transform:uppercase;color:#B8B0AA;margin-bottom:16px">Reviews</div>
        <div id="tb-reviews-content" style="font-family:'DM Sans',sans-serif;font-size:13px;color:#A8A09A;text-align:center;padding:16px 0">Loading…</div>
      </div>`;

    // ── Assemble page ────────────────────────────────────────────
    mount.innerHTML = `
      <div style="position:relative">
        ${heroSection}
      </div>
      <div style="background:#fff">
        ${identityStrip}
        ${statsHtml}
        ${ctaBlock}
        ${packagesSection}
        ${aboutSection}
        ${reviewsSection}
      </div>`;

    // Wire up compact header back/share buttons
    const chBack = document.getElementById('ch-back');
    const chShare = document.getElementById('ch-share');
    if (chBack) chBack.addEventListener('click', () => history.back());
    if (chShare) chShare.addEventListener('click', () => shareProfile(displayName));

    // Wire up scroll observer
    initStickyHeader();

    // Load reviews
    loadReviews(t.id);
  }
  ```

- [ ] **Step 2: Verify hero renders correctly**

  `npm run dev`, open `/[valid-slug]`. Confirm:
  - Photo fills 460px, edge to edge
  - Trainer name overlaid at bottom-left in weight-200 large text
  - Fade gradient from photo to white content below
  - Frosted-glass back/share circles at top
  - Identity tags row + stats below the fold
  - Charcoal "Book a Session" button
  - No orange anywhere

- [ ] **Step 3: Commit**

  ```bash
  git add src/pages/[slug].astro
  git commit -m "feat: rewrite renderProfile() with new hero, identity, stats, CTA, packages, about, reviews shell"
  ```

---

## Task 5: Wire up interaction behaviors

**Files:**
- Modify: `src/pages/[slug].astro` (add `initStickyHeader()`, `toggleBio()`, update `shareProfile()`, wire carousel scrollbar hide)

- [ ] **Step 1: Add initStickyHeader function**

  Inside the `<script>` block, after `renderProfile()`, add:

  ```javascript
  function initStickyHeader() {
    const sentinel = document.getElementById('tb-hero-sentinel');
    const header = document.getElementById('tb-compact-header');
    if (!sentinel || !header) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        header.classList.toggle('visible', !entry.isIntersecting);
      },
      { threshold: 0 }
    );
    observer.observe(sentinel);
  }
  ```

- [ ] **Step 2: Add toggleBio function**

  ```javascript
  function toggleBio() {
    const short = document.getElementById('tb-bio-short');
    const full = document.getElementById('tb-bio-full');
    const btn = document.getElementById('tb-read-more');
    if (!short || !full || !btn) return;

    const isExpanded = full.style.display !== 'none';
    short.style.display = isExpanded ? 'block' : 'none';
    full.style.display = isExpanded ? 'none' : 'block';
    btn.textContent = isExpanded ? 'Read more →' : 'Read less';
  }
  ```

- [ ] **Step 3: Add carousel scrollbar hide**

  In the `<style>` block, add:

  ```css
  /* Hide carousel scrollbar */
  #profile-mount div[style*="scroll-snap-type"]::-webkit-scrollbar { display: none; }
  ```

- [ ] **Step 4: Update shareProfile function**

  Replace the existing `shareProfile(name)` function with:

  ```javascript
  function shareProfile(name) {
    if (navigator.share) {
      navigator.share({
        title: name + ' — Verified Personal Trainer',
        text: 'Check out ' + name + "'s verified trainer profile",
        url: location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(location.href).then(() => {
        // Brief feedback on share button
        const btn = document.getElementById('hero-share-btn');
        if (btn) {
          const orig = btn.innerHTML;
          btn.innerHTML = '<div style="color:#fff;font-size:11px;font-weight:500;padding:0 4px">Copied!</div>';
          setTimeout(() => { btn.innerHTML = orig; }, 2000);
        }
      });
    }
  }
  ```

- [ ] **Step 5: Verify interactions**

  - Scroll past hero → compact header fades in with trainer name
  - Tap "Read more →" → bio expands; tap "Read less" → collapses
  - Tap back button (compact header) → navigates back
  - Package carousel scrolls horizontally and snaps
  - Share button triggers Web Share API (or clipboard copy on desktop)

- [ ] **Step 6: Commit**

  ```bash
  git add src/pages/[slug].astro
  git commit -m "feat: add sticky header observer, bio toggle, share profile, carousel scrollbar hide"
  ```

---

## Task 6: Rewrite loadReviews() to match new design

**Files:**
- Modify: `src/pages/[slug].astro` (the `loadReviews` function)

The new design shows: rating summary row (large number + 5 stars + count) + 2 most recent review cards in `#F8F7F5` style + "See all →". Hides the entire section if 0 reviews.

- [ ] **Step 1: Replace the loadReviews function**

  Find `async function loadReviews(trainerId) {` through its closing `}` (around lines 564–593). Replace with:

  ```javascript
  async function loadReviews(trainerId) {
    if (!trainerId) {
      hideReviewsSection();
      return;
    }
    try {
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/reviews?trainer_id=eq.${trainerId}&booking_id=not.is.null&order=created_at.desc&limit=2`,
        { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
      );
      const reviews = await r.json();
      const container = document.getElementById('tb-reviews-content');
      const section = document.getElementById('tb-reviews-section');
      if (!container || !section) return;

      if (!Array.isArray(reviews) || reviews.length === 0) {
        hideReviewsSection();
        return;
      }

      const avg = reviews.reduce((a, b) => a + (b.rating || 0), 0) / reviews.length;
      const filled = Math.round(avg);
      const starsFilled = '★'.repeat(filled) + '☆'.repeat(5 - filled);
      const totalCount = reviews.length; // shown as "from N verified clients" — use actual count

      // Fetch total count for "See all" label
      let totalCountFull = totalCount;
      try {
        const countRes = await fetch(
          `${SUPABASE_URL}/rest/v1/reviews?trainer_id=eq.${trainerId}&booking_id=not.is.null&select=id`,
          { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Prefer': 'count=exact', 'Range': '0-0' } }
        );
        const rangeHeader = countRes.headers.get('content-range');
        if (rangeHeader) {
          const match = rangeHeader.match(/\/(\d+)/);
          if (match) totalCountFull = parseInt(match[1], 10);
        }
      } catch (_) {}

      const ratingSummary = `
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">
          <div style="font-family:'DM Sans',sans-serif;font-size:32px;font-weight:200;color:#111">${avg.toFixed(1)}</div>
          <div>
            <div style="font-size:16px;letter-spacing:0.02em;color:#1A1411;margin-bottom:2px">${starsFilled}</div>
            <div style="font-family:'DM Sans',sans-serif;font-size:11px;font-weight:300;color:#B8B0AA">from ${totalCountFull} verified client${totalCountFull !== 1 ? 's' : ''}</div>
          </div>
        </div>`;

      const reviewCards = reviews.map(rv => {
        const name = rv.client_name || 'Client';
        const initials = name.split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2) || '?';
        const rvStars = '★'.repeat(rv.rating || 5) + '☆'.repeat(5 - (rv.rating || 5));
        const dateStr = rv.created_at
          ? new Date(rv.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
          : '';
        return `
          <div style="background:#F8F7F5;border-radius:12px;padding:16px 18px;margin-bottom:10px">
            <div style="font-size:13px;letter-spacing:0.02em;color:#1A1411;margin-bottom:8px">${rvStars}</div>
            <div style="font-family:'DM Sans',sans-serif;font-size:13px;font-weight:300;color:#4A4440;line-height:1.6;margin-bottom:12px">${rv.review_text || ''}</div>
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:28px;height:28px;border-radius:50%;background:rgba(0,0,0,0.07);display:flex;align-items:center;justify-content:center;font-family:'DM Sans',sans-serif;font-size:10px;font-weight:500;color:#6B6460;flex-shrink:0">${initials}</div>
              <div style="font-family:'DM Sans',sans-serif;font-size:12px;font-weight:400;color:#6B6460">${name}</div>
              ${dateStr ? `<div style="font-family:'DM Sans',sans-serif;font-size:11px;font-weight:300;color:#B8B0AA;margin-left:auto">${dateStr}</div>` : ''}
            </div>
          </div>`;
      }).join('');

      const seeAllLink = totalCountFull > 2
        ? `<div style="text-align:right;margin-top:4px"><a href="#" style="font-family:'DM Sans',sans-serif;font-size:12px;font-weight:400;color:#9A9290;text-decoration:none">${totalCountFull} reviews →</a></div>`
        : '';

      container.innerHTML = ratingSummary + reviewCards + seeAllLink;
    } catch (e) {
      hideReviewsSection();
    }
  }

  function hideReviewsSection() {
    const section = document.getElementById('tb-reviews-section');
    if (section) section.style.display = 'none';
  }
  ```

- [ ] **Step 2: Remove old review-related functions**

  Remove the following functions that are no longer used:
  - `setRating(v)` (star picker for write-review form)
  - `submitReview()` (write review form)
  - `showRvMsg(text, color)` (review form message)

  These functions are rendered inside the old `renderProfile()` HTML (the write-review form). Since the new design doesn't include a write-review form on the profile page, remove the functions and their associated HTML (already absent from the new `renderProfile()`).

- [ ] **Step 3: Verify reviews load**

  For a trainer slug with real reviews in the DB: confirm the rating summary, two review cards, and "N reviews →" link appear.

  For a trainer slug with **no** booking-linked reviews: confirm the entire Reviews section is hidden.

- [ ] **Step 4: Commit**

  ```bash
  git add src/pages/[slug].astro
  git commit -m "feat: rewrite loadReviews() with new card design, booking-linked only, hide-if-empty"
  ```

---

## Task 7: Rewrite error state for white background

**Files:**
- Modify: `src/pages/[slug].astro` (the `showErr` function)

The existing 404 error state uses dark background with orange. Replace with white-background neutral style.

- [ ] **Step 1: Replace showErr function**

  Find `function showErr(msg = 'Trainer not found') {` through its closing `}`. Replace with:

  ```javascript
  function showErr(msg = 'Trainer not found') {
    const loading = document.getElementById('tb-loading');
    const mount = document.getElementById('profile-mount');
    if (loading) loading.style.display = 'none';
    if (!mount) return;
    mount.style.display = 'block';
    mount.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:80vh;gap:24px;padding:32px;text-align:center">
        <div style="font-family:'DM Sans',sans-serif;font-size:72px;font-weight:200;letter-spacing:-0.03em;color:#111">404</div>
        <h1 style="font-family:'DM Sans',sans-serif;font-size:22px;font-weight:300;color:#111">Trainer not found</h1>
        <p style="font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:300;color:#6B6460;max-width:320px;line-height:1.7">This trainer profile doesn't exist or may have been removed.</p>
        <a href="/find" style="height:52px;padding:0 32px;background:#1A1411;color:#fff;border-radius:13px;text-decoration:none;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;letter-spacing:0.04em;display:flex;align-items:center">Find a Trainer</a>
      </div>`;
  }
  ```

- [ ] **Step 2: Remove makeAvatarFallback and applyAvatarFallback**

  The new design doesn't use a canvas-generated fallback — it uses the CSS `photoFallback` gradient directly in `renderProfile()`. Remove:
  - `function makeAvatarFallback(name) { … }` (~40 lines)
  - `function applyAvatarFallback(name) { … }` (~10 lines)
  - All `applyAvatarFallback(...)` call-sites

  Remove the colour-bloom extraction block (~20 lines inside `loadTrainer()` that sets `--avatar-color`).

- [ ] **Step 3: Verify 404 state**

  Navigate to `/nonexistent-slug-xyz` — confirm white 404 page with charcoal "Find a Trainer" button.

- [ ] **Step 4: Commit**

  ```bash
  git add src/pages/[slug].astro
  git commit -m "feat: rewrite 404 error state for white background, remove avatar fallback canvas code"
  ```

---

## Task 8: Final polish and cross-browser check

**Files:**
- Modify: `src/pages/[slug].astro` (minor polish items)

- [ ] **Step 1: Add safe-area padding to hero**

  The hero back/share buttons at `top: 58px` need safe-area offset on notched phones. In `renderProfile()`, change the hero buttons' top position to use a CSS env variable.

  Find in the `heroSection` string:
  ```
  style="position:absolute;top:58px;left:20px;z-index:5;"
  ```
  Change to:
  ```
  style="position:absolute;top:calc(58px + env(safe-area-inset-top));left:20px;z-index:5;"
  ```
  Do the same for the share button's `top:58px;right:20px`.

- [ ] **Step 2: Ensure carousel peek is correct**

  In the package carousel `<div style="...overflow-x:auto...padding:0 24px 20px...">`, the cards have `gap:12px` and `padding:0 24px`. On a 390px screen, one card (240px) + 24px left padding + 12px gap = 276px, so the second card peeks at ~114px. This is fine. No change needed.

  Verify on Chrome DevTools → iPhone 14 Pro viewport (393×852).

- [ ] **Step 3: Theme-color meta tag**

  The `Base.astro` has `<meta name="theme-color" content="#0a0a0a">`. The new profile is white. Add a page-level override in `[slug].astro` after the `<Base>` opening tag:

  ```html
  <!-- Override theme-color for profile page (white body) -->
  <meta name="theme-color" content="#ffffff" />
  ```

  Note: Astro slots content into `<body>`, so this `<meta>` will be in the body, which is not ideal. Instead, update the `Base.astro` meta to reference a JS-settable variable or leave it — the visual difference is minor and only affects Safari's address-bar colour. Skip this for now unless explicitly requested.

- [ ] **Step 4: Verify photo fallback**

  For a trainer with no `profile_photo_url`: confirm the hero shows the dark gradient `#18191C → #272A30` and the name block is **not** rendered (per spec: "trainer must upload a photo to have a public profile — Prompt shown in trainer dashboard"). Actually per spec: name overlay is still shown even without photo, just the hero uses the dark gradient. Re-check spec.

  > Spec says: "If `profile_photo_url` is null, render a dark gradient placeholder with **no name overlay visible**"

  Update `renderProfile()` — wrap `nameBlock` in a conditional:

  ```javascript
  const nameBlock = photoUrl ? `
    <div style="position:absolute;bottom:20px;left:28px;z-index:4;right:28px">
      ...
    </div>` : '';
  ```

- [ ] **Step 5: Final visual pass**

  Open three trainer slugs:
  1. One with photo + packages + reviews → full page renders correctly
  2. One with photo + no packages → packages section absent
  3. One with no photo → dark gradient hero, no name overlay

- [ ] **Step 6: Commit**

  ```bash
  git add src/pages/[slug].astro
  git commit -m "feat: polish — safe-area hero buttons, photo-conditional name overlay, final cross-browser check"
  ```

---

## Spec Coverage Self-Review

| Spec requirement | Task |
|---|---|
| DM Sans font, all weights | Task 1 |
| Charcoal-neutral CSS tokens | Task 2 |
| `paymentEnabled` → "Request a Session" | Task 3 |
| Hero 460px, full-bleed, `object-fit: cover; object-position: top center` | Task 4 |
| Photo fallback dark gradient, no name overlay | Task 8 step 4 |
| Back + share frosted-glass circles, `top: 58px` | Task 4 |
| Hero fade 220px transparent→white | Task 4 |
| Name block bottom-20px, weight 200 36px | Task 4 |
| Sticky compact header (IntersectionObserver) | Task 5 |
| Identity strip — specialty tags + location pin | Task 4 |
| Stats row — 4 columns, hide if unavailable | Task 4 |
| CTA block — Book (52px) + Message (46px) | Task 4 |
| Package carousel — 240px snap cards, max 6, hide if 0 | Task 4 |
| Package card — name/detail/price/Book button | Task 4 |
| About — truncated bio + "Read more" inline expand | Task 4 |
| Reviews — booking-linked only, 2 cards, hide if 0 | Task 6 |
| Reviews — rating summary row + "See all →" count | Task 6 |
| Bottom nav — 5 items, sticky frosted glass | Task 2 |
| Error state — white background 404 | Task 7 |
| Currency from `trainer.currency` / market `currencySymbol` | Task 3 |
| No orange, no terracotta anywhere in UI | All tasks |

All spec requirements covered. No gaps found.
