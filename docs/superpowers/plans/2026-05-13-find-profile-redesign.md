# Find Page & Profile Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign /find cards (real photo background, minimal text, REPs badge) and trainer profile (full-bleed photo, dark glass design, conditional sections, REPs badge).

**Architecture:** find.astro is self-contained — fix FOUC bug and replace `trainerCardHTML()`. Profile uses a React component tree in `src/components/trainer/` — update CSS in `[slug].astro`, redesign `Hero.tsx`, restyle `CTABlock`/`PackagesCarousel`/`About`, and remove `StatsRow`, `IdentityStrip`, `BottomNav` from `TrainerProfile.tsx`.

**Tech Stack:** Astro SSR, React (client:load island), CSS-in-Astro, Netlify

---

## Files Modified

| File | What changes |
|------|-------------|
| `src/pages/find.astro` | Fix FOUC skeleton; replace card CSS + `trainerCardHTML()` |
| `src/pages/[slug].astro` | Replace profile CSS with dark glass design system |
| `src/components/trainer/types.ts` | Add `reps_number?: string` to `Trainer` interface |
| `src/components/trainer/Hero.tsx` | Full-bleed taller hero, name always visible, REPs badge, specialty tags |
| `src/components/TrainerProfile.tsx` | Remove `StatsRow`, `IdentityStrip`, `BottomNav`, `Reviews` |
| `src/components/trainer/CTABlock.tsx` | Glass card wrapper, dark text theme |
| `src/components/trainer/PackagesCarousel.tsx` | Vertical list layout, glass card styling |
| `src/components/trainer/About.tsx` | Glass card wrapper |

---

## Task 1: find.astro — Fix FOUC skeleton bug

**Files:**
- Modify: `src/pages/find.astro:313-323`

The skeleton HTML at line 315 uses `${Array(6).fill(0).map(...)}` — JS template literal syntax that Astro renders as literal text in the browser before JS runs. Fix: use Astro's `{expression}` syntax.

- [ ] **Step 1: Replace the broken skeleton block**

Open `src/pages/find.astro`. Replace lines 313–324:

```astro
  <div id="trainerGrid" class="trainer-grid">
    <!-- Skeletons while loading -->
    ${Array(6).fill(0).map(() => `
    <div class="skeleton-card">
      <div class="skel skel-cover"></div>
      <div class="skel-body">
        <div class="skel skel-line w80"></div>
        <div class="skel skel-line w60"></div>
        <div class="skel skel-line w40" style="margin-top:12px"></div>
      </div>
    </div>`).join('')}
  </div>
```

With:

```astro
  <div id="trainerGrid" class="trainer-grid">
    {Array(6).fill(0).map((_, i) => (
      <div class="skeleton-card" key={i}>
        <div class="skel skel-cover"></div>
        <div class="skel-body">
          <div class="skel skel-line w80"></div>
          <div class="skel skel-line w60"></div>
        </div>
      </div>
    ))}
  </div>
```

- [ ] **Step 2: Build to verify no syntax errors**

```bash
cd /Users/bobanpepic/trainedby && pnpm build 2>&1 | tail -5
```

Expected: `[build] Complete!`

- [ ] **Step 3: Commit**

```bash
git add src/pages/find.astro
git commit -m "fix: find page FOUC — replace broken JS template literal skeleton with Astro expression"
```

---

## Task 2: find.astro — New card CSS

**Files:**
- Modify: `src/pages/find.astro` (the `<style>` block)

Replace the existing `.trainer-card`, `.tc-avatar-wrap`, `.tc-avatar`, `.tc-verified`, `.tc-body`, `.tc-name`, `.tc-meta`, `.tc-tags`, `.tc-tag`, `.tc-price`, `.tc-wa` CSS rules and the `.skeleton-card` rules with the new photo-card design.

- [ ] **Step 1: Replace card CSS**

In `src/pages/find.astro`, find the `/* TRAINER CARD */` comment at line 178. Replace everything from `.trainer-card {` through `.tc-wa { ... }` (lines 179–241) with:

```css
/* TRAINER CARD — real photo background */
.trainer-card {
  border-radius: 20px;
  height: 230px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}
.trainer-card:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.18); }

/* Photo fills the card — face fully visible */
.tc-photo {
  position: absolute; inset: 0;
  background-size: cover;
  background-position: center top;
}

/* Gradient ONLY at bottom — never covers face */
.tc-grad {
  position: absolute; inset: 0;
  background: linear-gradient(
    to bottom,
    transparent 40%,
    rgba(0,0,0,0.5) 72%,
    rgba(0,0,0,0.82) 100%
  );
}

/* No-photo fallback — colored circle */
.tc-avatar-circle {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
}
.tc-avatar-initials {
  width: 64px; height: 64px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; font-weight: 700; color: #fff;
}

/* REPs badge — top right, purple gradient */
.tc-reps {
  position: absolute; top: 10px; right: 10px;
  background: linear-gradient(135deg, #6B2A9A 0%, #2E0A45 100%);
  border-radius: 10px; padding: 5px 9px;
  border: 1px solid rgba(255,255,255,0.12);
  box-shadow: 0 2px 12px rgba(80,20,150,0.45);
  display: flex; flex-direction: column; gap: 2px;
}
.tc-reps-label { font-size: 8px; color: rgba(255,255,255,0.45); letter-spacing: 0.05em; }
.tc-reps-num { font-size: 10px; color: rgba(255,255,255,0.92); letter-spacing: 0.06em; font-variant-numeric: tabular-nums; }

/* Text at bottom — name + specialty only */
.tc-text {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 12px 14px;
}
.tc-name { font-size: 14px; font-weight: 600; color: #fff; line-height: 1.2; margin-bottom: 2px; }
.tc-spec { font-size: 11px; color: rgba(255,255,255,0.6); }
```

- [ ] **Step 2: Update skeleton card to match new card height**

Also replace `.skeleton-card { ... }` block (around line 253) with:

```css
.skeleton-card {
  height: 230px;
  border-radius: 20px;
  overflow: hidden;
}
.skel { background: linear-gradient(90deg,#E8E5E2 25%,rgba(0,0,0,0.04) 50%,#E8E5E2 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:6px; }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.skel-cover { height:100%; border-radius:20px; }
```

- [ ] **Step 3: Build**

```bash
pnpm build 2>&1 | tail -5
```

Expected: `[build] Complete!`

---

## Task 3: find.astro — Replace trainerCardHTML()

**Files:**
- Modify: `src/pages/find.astro:474-524`

Replace the entire `trainerCardHTML(trainer)` function with the new photo-card implementation.

- [ ] **Step 1: Replace trainerCardHTML()**

Replace the function at line 474 with:

```javascript
// Avatar colors derived from name — each trainer gets a unique color
const AVATAR_COLORS = ['#1a3a5c','#2d4a1e','#4a1a2e','#1a2a4a','#3a2a0e','#1a3a3a','#3a1a0e'];
function nameColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function trainerCardHTML(trainer) {
  const name = esc(trainer.full_name || trainer.name || 'Trainer');
  const initials = (trainer.full_name || trainer.name || '?')
    .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const specialty = esc((trainer.specialties || [])[0] || trainer.title || '');
  const city = esc(trainer.city || trainer.location || '');
  const specCity = [specialty, city].filter(Boolean).join(' · ');
  const slug = esc(trainer.slug || trainer.id);
  const photo = trainer.avatar_url || trainer.profile_photo_url || '';

  const photoEl = photo
    ? `<div class="tc-photo" style="background-image:url('${esc(photo)}')"></div>`
    : `<div class="tc-photo" style="background:${nameColor(name)};"></div>
       <div class="tc-avatar-circle"><div class="tc-avatar-initials" style="background:rgba(255,255,255,0.12);">${initials}</div></div>`;

  const repsEl = trainer.reps_verified
    ? `<div class="tc-reps">
         <div class="tc-reps-label">REPs UAE</div>
         <div class="tc-reps-num">${esc(trainer.reps_number || 'Verified')}</div>
       </div>`
    : '';

  return `
    <div class="trainer-card" role="article" onclick="window.location='/${slug}'" aria-label="${name}">
      ${photoEl}
      <div class="tc-grad"></div>
      ${repsEl}
      <div class="tc-text">
        <div class="tc-name">${name}</div>
        ${specCity ? `<div class="tc-spec">${specCity}</div>` : ''}
      </div>
    </div>`;
}
```

- [ ] **Step 2: Build**

```bash
pnpm build 2>&1 | tail -5
```

Expected: `[build] Complete!`

- [ ] **Step 3: Commit tasks 2 + 3**

```bash
git add src/pages/find.astro
git commit -m "feat: find page redesign — photo cards, REPs badge, no overlay on faces"
```

---

## Task 4: types.ts — Add reps_number to Trainer interface

**Files:**
- Modify: `src/components/trainer/types.ts`

`reps_number` is stored in the DB and returned by `get-trainer` but missing from the type. Hero needs it for the badge.

- [ ] **Step 1: Add reps_number field**

In `src/components/trainer/types.ts`, add `reps_number?: string;` after `reps_verified?: boolean;`:

```typescript
export interface Trainer {
  id: string;
  name?: string;
  full_name?: string;
  avatar_url?: string;
  profile_photo_url?: string;
  specialties?: string[] | string;
  avg_rating?: number | string | null;
  review_count?: number;
  reps_verified?: boolean;
  reps_number?: string;           // ← add this line
  is_verified?: boolean;
  verification_status?: string;
  city?: string;
  country?: string;
  bio?: string;
  instagram?: string;
  instagram_handle?: string;
  whatsapp?: string;
  phone?: string;
  certifications?: string[];
  experience_years?: number;
  years_experience?: number;
  clients_trained?: number;
  total_clients?: number;
  client_count?: number;
  goal_achievement_rate?: number | null;
}
```

- [ ] **Step 2: Build**

```bash
pnpm build 2>&1 | tail -5
```

Expected: `[build] Complete!`

---

## Task 5: [slug].astro — Dark glass CSS design system

**Files:**
- Modify: `src/pages/[slug].astro` (the `<style is:global>` block)

Replace the profile CSS with the dark glass system. The body and `#tb-page` become dark. Sections get glass card treatment.

- [ ] **Step 1: Replace body and tb-page base styles**

In `src/pages/[slug].astro`, find `body:has(#tb-page) {` around line 159. Replace:

```css
body:has(#tb-page) {
  background: var(--bg);
  color: var(--text);
}

#tb-page {
  --font: 'Manrope', system-ui, sans-serif;
  --text-primary:   var(--text);
  --text-secondary: var(--text-muted);
  --bg-white:       var(--bg);
  --border:         var(--border-subtle);
  --btn-primary-bg:       var(--text);
  --btn-primary-text:     var(--text-on-brand);
  --tag-text: var(--text-muted);
  --review-card-bg: var(--surface-2);
  font-family: var(--font);
  background: var(--bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
  overflow-x: hidden;
}
```

With:

```css
body:has(#tb-page) {
  background: #0f0e0d;
  color: #fff;
}

#tb-page {
  --font: 'Manrope', system-ui, sans-serif;
  font-family: var(--font);
  background: #0f0e0d;
  color: #fff;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
  overflow-x: hidden;
}
```

- [ ] **Step 2: Update hero CSS**

Find `.tb-hero {` around line 274. Replace `.tb-hero` through `.tb-hero-tagline {}` with:

```css
.tb-hero {
  position: relative;
  min-height: 65vh;
  overflow: hidden;
  background: linear-gradient(168deg, #1c2340, #0f1018, #1a100a);
}
.tb-hero-img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover; object-position: top center; display: block;
}
.tb-hero-fade {
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 60%;
  background: linear-gradient(to bottom,
    transparent 0%,
    rgba(0,0,0,0.3) 40%,
    rgba(0,0,0,0.75) 75%,
    rgba(0,0,0,0.92) 100%
  );
  pointer-events: none;
}
.tb-hero-controls {
  position: absolute;
  top: max(58px, calc(env(safe-area-inset-top) + 16px));
  left: 0; right: 0;
  display: flex; justify-content: space-between;
  padding: 0 16px; z-index: 10;
}
.tb-hero-btn {
  width: 38px; height: 38px; border-radius: 50%; border: none;
  background: rgba(0,0,0,0.3);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.12);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #fff; flex-shrink: 0;
}

/* REPs badge — upper right, purple gradient */
.tb-reps-badge {
  position: absolute;
  top: max(58px, calc(env(safe-area-inset-top) + 16px));
  right: 16px; z-index: 10;
  background: linear-gradient(145deg, #6B2A9A 0%, #3E0F60 55%, #1E0530 100%);
  border-radius: 14px; padding: 8px 12px 7px;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 20px rgba(80,20,150,0.5);
  min-width: 80px;
}
.tb-reps-badge-label {
  font-size: 9px; font-weight: 500;
  color: rgba(255,255,255,0.45); letter-spacing: 0.06em; display: block; margin-bottom: 3px;
}
.tb-reps-badge-num {
  font-size: 14px; color: rgba(255,255,255,0.92);
  letter-spacing: 0.04em; line-height: 1; margin-bottom: 5px;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 8px rgba(200,150,255,0.4);
}
.tb-reps-dots { display: flex; gap: 3px; }
.tb-reps-dot { width: 3px; height: 3px; border-radius: 50%; background: rgba(255,255,255,0.2); }
.tb-reps-dot--on { background: rgba(255,255,255,0.65); }

.tb-hero-name-block {
  position: absolute; bottom: 24px; left: 20px; right: 20px; z-index: 10;
}
.tb-hero-name {
  font-weight: 300; font-size: 36px;
  letter-spacing: -0.02em; color: #fff;
  text-shadow: 0 2px 20px rgba(0,0,0,0.5); line-height: 1.05; margin-bottom: 6px;
}
.tb-hero-tagline {
  font-weight: 300; font-size: 13px;
  color: rgba(255,255,255,0.45); margin-bottom: 12px;
}
.tb-hero-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.tb-hero-tag {
  background: rgba(0,0,0,0.35);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.7); font-size: 11px; padding: 5px 12px; border-radius: 20px;
}
```

- [ ] **Step 3: Add glass card system + restyle sections**

After the hero CSS block, add or replace the section styles:

```css
/* Glass card — base for all content sections */
.tb-glass {
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 18px;
  margin: 0 16px 12px;
}

/* Section label — all caps, muted */
.tb-section-label {
  font-size: 10px; font-weight: 700;
  color: rgba(255,255,255,0.3); letter-spacing: 0.08em; text-transform: uppercase;
}

/* CTA block */
.tb-cta { padding: 12px 16px 0; display: flex; flex-direction: column; gap: 10px; }
.tb-btn-primary {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; height: 52px; border-radius: 13px; border: none;
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.15);
  color: #fff; font-family: var(--font); font-weight: 500; font-size: 14px;
  cursor: pointer; text-decoration: none;
}
.tb-btn-secondary { display: none; } /* removed from dark design */

/* Sessions */
.tb-sessions { padding: 0 0 12px; }
.tb-sessions-header { padding: 14px 18px 10px; }
.tb-sessions-scroll {
  display: flex; flex-direction: column;
  padding: 0; overflow: visible;
}
.tb-pkg-card {
  flex: none; scroll-snap-align: unset;
  background: transparent; border: none; border-radius: 0;
  border-top: 1px solid rgba(255,255,255,0.07);
  padding: 12px 18px 14px;
  display: flex; flex-direction: row; align-items: center; justify-content: space-between; gap: 12px;
  box-shadow: none;
}
.tb-pkg-name { font-weight: 400; font-size: 14px; color: #fff; }
.tb-pkg-detail { font-weight: 300; font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 2px; }
.tb-pkg-price { font-weight: 500; font-size: 15px; color: #fff; margin-top: 0; }
.tb-pkg-book {
  width: auto; height: auto; border-radius: 10px; border: none;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.18);
  color: #fff; font-family: var(--font); font-weight: 600; font-size: 11px;
  cursor: pointer; padding: 7px 14px; margin-top: 0; flex-shrink: 0;
}

/* About */
.tb-about { padding: 15px 18px; }
.tb-about-text {
  font-weight: 300; font-size: 13px; color: rgba(255,255,255,0.55);
  line-height: 1.7; overflow: hidden;
  display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical;
}
.tb-about-text.expanded { display: block; -webkit-line-clamp: unset; }
.tb-read-more {
  display: inline-block; margin-top: 8px; font-size: 12px; font-weight: 400;
  color: rgba(255,255,255,0.4); background: none; border: none; padding: 0;
  cursor: pointer; font-family: var(--font);
}

/* Profile mount padding — no bottom nav anymore */
#profile-mount { padding-bottom: 32px; }
```

- [ ] **Step 4: Build**

```bash
pnpm build 2>&1 | tail -5
```

Expected: `[build] Complete!`

---

## Task 6: Hero.tsx — Full-bleed, name always visible, REPs badge, specialty tags

**Files:**
- Modify: `src/components/trainer/Hero.tsx`

- [ ] **Step 1: Rewrite Hero.tsx**

Replace the entire file with:

```tsx
import type { Trainer } from './types';
import { getDisplayName, getPhotoUrl, normaliseSpecialties, getLocation } from './utils';

interface HeroProps {
  trainer: Trainer;
  onBack: () => void;
  onShare: () => void;
}

export default function Hero({ trainer, onBack, onShare }: HeroProps) {
  const displayName = getDisplayName(trainer);
  const photoUrl = getPhotoUrl(trainer);
  const specialties = normaliseSpecialties(trainer.specialties as string[] | string | undefined);
  const location = getLocation(trainer);

  const repsLevel = trainer.reps_verified ? 3 : 0; // Level 3 = active REPs UAE

  return (
    <div className="tb-hero">
      {photoUrl && (
        <img
          className="tb-hero-img"
          src={photoUrl}
          alt={displayName}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      )}
      <div className="tb-hero-fade" />

      {/* Back button — left side only, REPs badge occupies right */}
      <div className="tb-hero-controls">
        <button className="tb-hero-btn" onClick={onBack} aria-label="Back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        {/* Share button — only if Web Share API available */}
        {'share' in navigator ? (
          <button className="tb-hero-btn" onClick={onShare} aria-label="Share">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
        ) : <span />}
      </div>

      {/* REPs badge — upper right, absolutely positioned over controls row */}
      {trainer.reps_verified && (
        <div className="tb-reps-badge">
          <span className="tb-reps-badge-label">REPs UAE</span>
          <div className="tb-reps-badge-num">
            {trainer.reps_number ? `REP·${trainer.reps_number}` : 'Verified'}
          </div>
          <div className="tb-reps-dots">
            {[1,2,3,4,5].map(i => (
              <div key={i} className={i <= repsLevel ? 'tb-reps-dot tb-reps-dot--on' : 'tb-reps-dot'} />
            ))}
          </div>
        </div>
      )}

      {/* Name block — always visible, bottom of hero */}
      <div className="tb-hero-name-block">
        <div className="tb-hero-name">{displayName}</div>
        {(specialties[0] || location) && (
          <div className="tb-hero-tagline">
            {specialties[0]}{location ? ` · ${location}` : ''}
          </div>
        )}
        {specialties.length > 0 && (
          <div className="tb-hero-tags">
            {specialties.slice(0, 3).map(s => (
              <span key={s} className="tb-hero-tag">{s}</span>
            ))}
          </div>
        )}
      </div>

      {/* Sentinel — CompactHeader's IntersectionObserver watches this */}
      <div id="hero-sentinel" />
    </div>
  );
}
```

- [ ] **Step 2: Build**

```bash
pnpm build 2>&1 | tail -5
```

Expected: `[build] Complete!`

---

## Task 7: TrainerProfile.tsx — Remove BottomNav, StatsRow, IdentityStrip, Reviews

**Files:**
- Modify: `src/components/TrainerProfile.tsx`

- [ ] **Step 1: Remove unused imports**

In `src/components/TrainerProfile.tsx`, remove these import lines:

```typescript
import StatsRow from './trainer/StatsRow';      // ← remove
import Reviews from './trainer/Reviews';          // ← remove
import BottomNav from './trainer/BottomNav';      // ← remove
import IdentityStrip from './trainer/IdentityStrip'; // ← remove
```

Also remove the `buildStats` import from `./trainer/utils`:

```typescript
import {
  buildTags, dedupePackages,             // remove buildStats
  normaliseSpecialties, getDisplayName,
  getLocation, getContactNumber, isVerifiedTrainer,
} from './trainer/utils';
```

- [ ] **Step 2: Remove unused variables and components from render**

Remove the `stats` variable (it used `buildStats`):
```typescript
const stats = trainer ? buildStats(trainer) : [];  // ← remove this line
```

Remove `tags` and `buildTags` call — identity strip is gone and tags are now in Hero via `normaliseSpecialties`:
```typescript
const tags = trainer ? buildTags(...) : [];  // ← remove
```

Remove the `certificationBody` prop usage since IdentityStrip is gone. Keep the prop in the component signature (it's passed from Astro) but just don't use it.

- [ ] **Step 3: Update the loaded render block**

Replace the `{loadState === 'loaded' && trainer && (` block's inner content (lines 153–178) with:

```tsx
{loadState === 'loaded' && trainer && (
  <div id="profile-mount">
    <Hero trainer={trainer} onBack={handleBack} onShare={handleShare} />
    <div id="tb-content">
      <CTABlock
        paymentEnabled={paymentEnabled}
        whatsappNumber={whatsappNumber}
        displayName={displayName}
      />
      {packages.length > 0 && (
        <PackagesCarousel
          packages={packages}
          currencySymbol={currencySymbol}
          displayName={displayName}
          whatsappNumber={whatsappNumber}
        />
      )}
      <About bio={bio} />
    </div>
  </div>
)}
```

Also remove `<BottomNav />` at the bottom of the return.

- [ ] **Step 4: Build**

```bash
pnpm build 2>&1 | tail -5
```

Expected: `[build] Complete!`

---

## Task 8: CTABlock.tsx — Glass card wrapper

**Files:**
- Modify: `src/components/trainer/CTABlock.tsx`

- [ ] **Step 1: Wrap CTABlock in glass card and remove secondary button**

Replace the entire return value in `CTABlock.tsx`. The component only needs the primary WhatsApp button, wrapped in the glass class:

```tsx
if (!whatsappNumber) return null; // nothing to show if no contact

return (
  <div className="tb-cta">
    <div className="tb-glass" style={{ margin: '12px 16px 0', borderRadius: '18px', overflow: 'hidden' }}>
      <button
        className="tb-btn-primary"
        onClick={() => open(waBookUrl)}
      >
        <WaIcon />
        Message on WhatsApp
      </button>
    </div>
  </div>
);
```

- [ ] **Step 2: Build**

```bash
pnpm build 2>&1 | tail -5
```

Expected: `[build] Complete!`

---

## Task 9: PackagesCarousel.tsx — Vertical glass list

**Files:**
- Modify: `src/components/trainer/PackagesCarousel.tsx`

- [ ] **Step 1: Rewrite PackagesCarousel**

Replace the entire file with:

```tsx
import type { Package } from './types';
import { formatPrice } from './utils';

interface PackagesCarouselProps {
  packages: Package[];
  currencySymbol: string;
  displayName: string;
  whatsappNumber: string;
}

export default function PackagesCarousel({
  packages, currencySymbol, displayName, whatsappNumber,
}: PackagesCarouselProps) {
  if (packages.length === 0) return null;

  function handleBook(pkg: Package) {
    if (!whatsappNumber) return;
    const pkgName = pkg.name || pkg.title || 'package';
    const msg = `Hi ${displayName}, I'm interested in the ${pkgName}.`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  }

  return (
    <div className="tb-sessions">
      <div className="tb-glass" style={{ margin: '0 16px 12px', overflow: 'hidden' }}>
        <div className="tb-sessions-header">
          <span className="tb-section-label">Sessions</span>
        </div>
        <div className="tb-sessions-scroll">
          {packages.map((pkg, i) => {
            const pkgName = pkg.name || pkg.title || 'Package';
            const price = formatPrice(pkg, currencySymbol);
            const meta = pkg.sessions != null
              ? `${pkg.sessions} session${pkg.sessions !== 1 ? 's' : ''}`
              : null;
            return (
              <div key={pkg.id ?? i} className="tb-pkg-card">
                <div>
                  <div className="tb-pkg-name">{pkgName}</div>
                  {meta && <div className="tb-pkg-detail">{meta}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {price && <div className="tb-pkg-price">{price}</div>}
                  {whatsappNumber && (
                    <button className="tb-pkg-book" onClick={() => handleBook(pkg)}>
                      Book
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build**

```bash
pnpm build 2>&1 | tail -5
```

Expected: `[build] Complete!`

---

## Task 10: About.tsx — Glass card wrapper

**Files:**
- Modify: `src/components/trainer/About.tsx`

- [ ] **Step 1: Wrap About in glass card**

Replace the return in `About.tsx` with:

```tsx
return (
  <div className="tb-glass tb-about" style={{ margin: '0 16px 12px' }}>
    <div className="tb-section-label" style={{ marginBottom: '10px' }}>About</div>
    <div
      className={`tb-about-text${expanded ? ' expanded' : ''}`}
    >
      {bio}
    </div>
    {bio.length > 120 && !expanded && (
      <button className="tb-read-more" onClick={() => setExpanded(true)}>
        Read more →
      </button>
    )}
  </div>
);
```

- [ ] **Step 2: Final build**

```bash
pnpm build 2>&1 | tail -5
```

Expected: `[build] Complete!`

- [ ] **Step 3: Commit all profile changes**

```bash
git add src/pages/[slug].astro src/components/trainer/types.ts src/components/trainer/Hero.tsx src/components/TrainerProfile.tsx src/components/trainer/CTABlock.tsx src/components/trainer/PackagesCarousel.tsx src/components/trainer/About.tsx
git commit -m "feat: profile page redesign — full-bleed photo, dark glass cards, REPs badge, conditional sections"
```

---

## Task 11: Push and smoke test

- [ ] **Step 1: Push to main**

```bash
git push origin main
```

Expected: Netlify deploy triggers.

- [ ] **Step 2: Smoke test find page**

Visit `https://trainedby.ae/find`. Verify:
- No raw `${...}` text visible on load — skeleton cards show instead
- After JS loads, trainer cards show with photo backgrounds
- Gradient only darkens the bottom, faces visible in upper portion
- REPs badge (purple, top-right) appears on verified trainers only
- Clicking a card navigates to the trainer profile

- [ ] **Step 3: Smoke test profile page**

Visit a trainer profile (e.g. `https://trainedby.ae/sarah-al-mansoori`). Verify:
- Full-bleed photo as background, page is dark
- Name, specialty, tags rendered at bottom of hero — visible even without photo
- REPs badge top-right if trainer is verified
- WhatsApp glass card renders
- Sessions appear as vertical list inside glass card if trainer has packages
- About renders inside glass card if bio exists
- No stats bar, no bottom nav, no reviews section
- CompactHeader still appears on scroll
