# React Profile Island Migration

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 350-line vanilla JS `renderProfile()` in `src/pages/[slug].astro` with a typed React 18 island that renders the trainer profile page via composable TSX sub-components.

**Architecture:** A single `TrainerProfile` React island (`client:load`) receives `slug`, `paymentEnabled`, and `currencySymbol` as props from the Astro server. On mount it fetches from the `get-trainer` Supabase edge function and renders a tree of focused sub-components. The `<style is:global>` CSS block in `[slug].astro` is kept — components reference the existing `.tb-*` classNames via `className`. The Astro page becomes a thin SEO + routing shell.

**Tech Stack:** React 18, @astrojs/react, TypeScript strict, existing `.tb-*` global CSS, Supabase REST (reviews only), `get-trainer` edge function (trainer + packages).

---

## File Structure

```
Create:
  src/components/trainer/types.ts            — Trainer, Package, Review TypeScript interfaces
  src/components/trainer/utils.ts            — esc(), formatPrice(), buildStats(), buildTags() pure fns
  src/components/trainer/Hero.tsx            — Full-bleed 460px hero photo + name block + controls
  src/components/trainer/IdentityStrip.tsx   — Specialty tag pills + location row
  src/components/trainer/StatsRow.tsx        — Responsive stats grid (hides null columns)
  src/components/trainer/CTABlock.tsx        — Primary CTA + message secondary button
  src/components/trainer/PackagesCarousel.tsx — Horizontal scroll snap package cards
  src/components/trainer/About.tsx           — Bio with expand/collapse toggle
  src/components/trainer/Reviews.tsx         — Rating summary + 2 review cards (fetches own data)
  src/components/trainer/CompactHeader.tsx   — Fixed sticky header (IntersectionObserver on sentinel)
  src/components/trainer/BottomNav.tsx       — Fixed bottom navigation bar
  src/components/TrainerProfile.tsx          — Root island: fetch, orchestrate, render tree
  tests/trainer-profile-utils.test.js        — Unit tests for all pure utility functions

Modify:
  astro.config.mjs          — @astrojs/react added (done by npx astro add react)
  src/pages/[slug].astro    — Replace <script> + static HTML shell with <TrainerProfile client:load />
```

---

## Task 1: Install React integration

**Files:**
- Modify: `astro.config.mjs` (auto-updated by astro CLI)
- Modify: `package.json` (auto-updated by astro CLI)

- [ ] **Step 1: Run the Astro React integration installer**

```bash
cd /Users/bobanpepic/trainedby
npx astro add react
```

When prompted "Continue?" type `y` for all three questions (install deps, update package.json, update astro.config.mjs).

- [ ] **Step 2: Verify astro.config.mjs now includes the React integration**

```bash
grep -n "react" astro.config.mjs
```

Expected output contains: `import react from '@astrojs/react'` and `react()` in the integrations array.

- [ ] **Step 3: Verify packages installed**

```bash
grep -E "@astrojs/react|react-dom" package.json
```

Expected: both `@astrojs/react` and `react-dom` appear as dependencies.

- [ ] **Step 4: Verify the dev server still starts**

```bash
npx astro check 2>&1 | tail -20
```

Expected: `0 errors` (warnings are OK).

- [ ] **Step 5: Commit**

```bash
git add astro.config.mjs package.json pnpm-lock.yaml
git commit -m "feat: add @astrojs/react integration for profile island migration"
```

---

## Task 2: TypeScript types, utilities, and unit tests

**Files:**
- Create: `src/components/trainer/types.ts`
- Create: `src/components/trainer/utils.ts`
- Create: `tests/trainer-profile-utils.test.js`

- [ ] **Step 1: Write the failing tests first**

Create `tests/trainer-profile-utils.test.js`:

```js
import { esc, formatPrice, buildStats, buildTags } from '../src/components/trainer/utils.ts';

describe('esc()', () => {
  test('escapes HTML special characters', () => {
    expect(esc('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
  });
  test('handles null/undefined gracefully', () => {
    expect(esc(null)).toBe('');
    expect(esc(undefined)).toBe('');
  });
  test('handles normal string', () => {
    expect(esc('Sarah Al-Mansoori')).toBe('Sarah Al-Mansoori');
  });
});

describe('formatPrice()', () => {
  test('formats price with currency symbol', () => {
    expect(formatPrice({ price: 500 }, 'AED')).toBe('AED 500');
  });
  test('uses package currency as fallback', () => {
    expect(formatPrice({ price: 200, currency: 'GBP' }, '')).toBe('GBP 200');
  });
  test('returns empty string when no price', () => {
    expect(formatPrice({ price: null }, 'AED')).toBe('');
  });
});

describe('buildStats()', () => {
  test('includes rating and review count when both present', () => {
    const stats = buildStats({ avg_rating: 4.9, review_count: 47 });
    expect(stats.find(s => s.label === 'Rating')).toBeTruthy();
    expect(stats.find(s => s.label === 'Reviews')).toBeTruthy();
  });
  test('omits rating when review_count is 0', () => {
    const stats = buildStats({ avg_rating: 4.9, review_count: 0 });
    expect(stats.find(s => s.label === 'Rating')).toBeFalsy();
  });
  test('includes experience when present', () => {
    const stats = buildStats({ experience_years: 8 });
    expect(stats.find(s => s.label === 'Experience')).toBeTruthy();
  });
  test('includes goal_achievement_rate when present', () => {
    const stats = buildStats({ goal_achievement_rate: 94 });
    expect(stats.find(s => s.label === 'Goal Rate')).toBeTruthy();
  });
  test('omits null/zero fields', () => {
    const stats = buildStats({ avg_rating: null, review_count: 0, experience_years: null });
    expect(stats).toHaveLength(0);
  });
});

describe('buildTags()', () => {
  test('prepends Verified tag when trainer is verified', () => {
    const tags = buildTags(['Strength', 'Yoga'], true, []);
    expect(tags[0]).toBe('Verified');
  });
  test('caps at 4 tags', () => {
    const tags = buildTags(['A', 'B', 'C', 'D', 'E'], false, []);
    expect(tags).toHaveLength(4);
  });
  test('deduplicates tags', () => {
    const tags = buildTags(['Yoga', 'Yoga'], false, []);
    expect(tags).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
pnpm test -- --testPathPatterns=tests/trainer-profile-utils 2>&1 | tail -20
```

Expected: `Cannot find module '../src/components/trainer/utils.ts'`

- [ ] **Step 3: Create `src/components/trainer/types.ts`**

```ts
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
  total_clients?: number;
  client_count?: number;
  goal_achievement_rate?: number | null;
}

export interface Package {
  id?: string;
  name?: string;
  title?: string;
  description?: string;
  price?: number | string | null;
  currency?: string;
  sessions?: number;
}

export interface Review {
  id?: string;
  rating?: number;
  review_text?: string;
  client_name?: string;
  created_at?: string;
}

export interface StatItem {
  num: string;
  label: string;
}

export interface TrainerProfileProps {
  slug: string;
  paymentEnabled: boolean;
  currencySymbol: string;
}
```

- [ ] **Step 4: Create `src/components/trainer/utils.ts`**

```ts
import type { Trainer, Package, StatItem } from './types';

export function esc(s: unknown): string {
  return String(s == null ? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatPrice(pkg: Package, currencySymbol: string): string {
  if (!pkg.price) return '';
  const sym = currencySymbol || pkg.currency || '';
  return sym ? `${sym} ${pkg.price}` : String(pkg.price);
}

export function buildStats(t: Partial<Trainer>): StatItem[] {
  const items: StatItem[] = [];
  const rating = t.avg_rating != null ? parseFloat(String(t.avg_rating)) : null;
  const reviewCount = t.review_count ?? 0;

  if (rating !== null && reviewCount > 0) {
    items.push({ num: rating.toFixed(1), label: 'Rating' });
    items.push({ num: String(reviewCount), label: reviewCount === 1 ? 'Review' : 'Reviews' });
  }

  const experience = t.experience_years || t.years_experience || null;
  if (experience) items.push({ num: `${experience}y`, label: 'Experience' });

  const goalRate = t.goal_achievement_rate ?? null;
  if (goalRate) items.push({ num: `${goalRate}%`, label: 'Goal Rate' });

  const clients = t.total_clients || t.client_count || null;
  if (clients) items.push({ num: `${clients}+`, label: 'Clients' });

  return items;
}

export function buildTags(
  specialties: string[],
  isVerified: boolean,
  certifications: string[],
): string[] {
  const raw = [...specialties.slice(0, 3)];
  if (isVerified) raw.unshift('Verified');
  if (certifications.length > 0 && raw.length < 4) raw.push(certifications[0]);
  return [...new Set(raw)].slice(0, 4);
}

export function normaliseSpecialties(raw: string[] | string | undefined): string[] {
  if (!raw) return ['Personal Trainer'];
  if (Array.isArray(raw)) return raw.length > 0 ? raw : ['Personal Trainer'];
  return [raw];
}

export function getDisplayName(t: Trainer): string {
  return t.name || t.full_name || '';
}

export function getPhotoUrl(t: Trainer): string {
  return t.avatar_url || t.profile_photo_url || '';
}

export function getLocation(t: Trainer): string {
  return [t.city, t.country].filter(Boolean).join(', ');
}

export function getContactNumber(t: Trainer): string {
  return (t.whatsapp || t.phone || '').replace(/\D/g, '');
}

export function isVerifiedTrainer(t: Trainer): boolean {
  return !!(t.reps_verified || t.is_verified || t.verification_status === 'verified');
}

export function dedupePackages(packages: Package[]): Package[] {
  const seen = new Set<string>();
  return packages.filter(p => {
    const key = p.name || p.title || '';
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
```

- [ ] **Step 5: Run tests again — should pass**

```bash
pnpm test -- --testPathPatterns=tests/trainer-profile-utils 2>&1 | tail -20
```

Expected: `Tests: 11 passed, 11 total`

- [ ] **Step 6: Commit**

```bash
git add src/components/trainer/types.ts src/components/trainer/utils.ts tests/trainer-profile-utils.test.js
git commit -m "feat: add trainer profile TypeScript types and pure utility functions with tests"
```

---

## Task 3: Hero, IdentityStrip, and StatsRow components

**Files:**
- Create: `src/components/trainer/Hero.tsx`
- Create: `src/components/trainer/IdentityStrip.tsx`
- Create: `src/components/trainer/StatsRow.tsx`

These are pure presentational components — no state, no side effects.

- [ ] **Step 1: Create `src/components/trainer/Hero.tsx`**

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
      <div className="tb-hero-controls">
        <button className="tb-hero-btn" onClick={onBack} aria-label="Back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
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
      {photoUrl && (
        <div className="tb-hero-name-block">
          <div className="tb-hero-name">{displayName}</div>
          {specialties[0] && (
            <div className="tb-hero-tagline">
              {specialties[0]}{location ? ` · ${location}` : ''}
            </div>
          )}
        </div>
      )}
      {/* Sentinel element — CompactHeader's IntersectionObserver watches this */}
      <div id="hero-sentinel" />
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/trainer/IdentityStrip.tsx`**

```tsx
interface IdentityStripProps {
  tags: string[];
  location: string;
}

export default function IdentityStrip({ tags, location }: IdentityStripProps) {
  return (
    <div className="tb-identity">
      {tags.map((tag) => (
        <span key={tag} className="tb-tag">{tag}</span>
      ))}
      {location && (
        <span className="tb-location">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {location}
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create `src/components/trainer/StatsRow.tsx`**

```tsx
import type { StatItem } from './types';

interface StatsRowProps {
  stats: StatItem[];
}

export default function StatsRow({ stats }: StatsRowProps) {
  if (stats.length === 0) return null;

  return (
    <div
      className="tb-stats"
      style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}
    >
      {stats.map((s) => (
        <div key={s.label} className="tb-stat-item">
          <div className="tb-stat-num">{s.num}</div>
          <div className="tb-stat-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Verify TypeScript compiles cleanly**

```bash
npx astro check 2>&1 | grep -E "error|Error" | head -20
```

Expected: no errors related to the three new files.

- [ ] **Step 5: Commit**

```bash
git add src/components/trainer/Hero.tsx src/components/trainer/IdentityStrip.tsx src/components/trainer/StatsRow.tsx
git commit -m "feat: add Hero, IdentityStrip, StatsRow presenter components"
```

---

## Task 4: CTABlock and PackagesCarousel components

**Files:**
- Create: `src/components/trainer/CTABlock.tsx`
- Create: `src/components/trainer/PackagesCarousel.tsx`

- [ ] **Step 1: Create `src/components/trainer/CTABlock.tsx`**

```tsx
interface CTABlockProps {
  paymentEnabled: boolean;
  whatsappNumber: string;       // digits only, e.g. "971501234567"
  displayName: string;
}

export default function CTABlock({ paymentEnabled, whatsappNumber, displayName }: CTABlockProps) {
  const ctaLabel = paymentEnabled ? 'Book a Session' : 'Request a Session';

  const bookingUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        `Hi ${displayName}, I found your profile on TrainedBy and I'd like to book a session.`
      )}`
    : null;

  const messageUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi, I'd like to get in touch.")}`
    : null;

  function handleBookClick() {
    if (bookingUrl) {
      window.open(bookingUrl, '_blank', 'noopener');
    } else {
      alert('Booking coming soon!');
    }
  }

  function handleMessageClick() {
    if (messageUrl) {
      window.open(messageUrl, '_blank', 'noopener');
    } else {
      alert('Contact coming soon!');
    }
  }

  return (
    <div className="tb-cta">
      <button
        className="tb-btn-primary"
        onClick={handleBookClick}
        style={whatsappNumber ? { animation: 'wa-pulse 2s ease infinite' } : undefined}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        {ctaLabel}
      </button>
      <button className="tb-btn-secondary" onClick={handleMessageClick}>
        Send a message
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/trainer/PackagesCarousel.tsx`**

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
  packages,
  currencySymbol,
  displayName,
  whatsappNumber,
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
      <div className="tb-sessions-header">
        <span className="tb-section-label">Sessions</span>
        <a href="javascript:void(0)" className="tb-see-all">See all →</a>
      </div>
      <div className="tb-sessions-scroll">
        {packages.map((pkg, i) => {
          const pkgName = pkg.name || pkg.title || 'Package';
          const price = formatPrice(pkg, currencySymbol);
          return (
            <div key={pkg.id ?? i} className="tb-pkg-card">
              <div className="tb-pkg-name">{pkgName}</div>
              {pkg.sessions != null && (
                <div className="tb-pkg-detail">
                  {pkg.sessions} session{pkg.sessions !== 1 ? 's' : ''}
                </div>
              )}
              {pkg.description && (
                <div className="tb-pkg-detail">{pkg.description}</div>
              )}
              {price && <div className="tb-pkg-price">{price}</div>}
              {whatsappNumber && (
                <button className="tb-pkg-book" onClick={() => handleBook(pkg)}>
                  Book
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles cleanly**

```bash
npx astro check 2>&1 | grep -E "error|Error" | head -20
```

Expected: no errors related to the two new files.

- [ ] **Step 4: Commit**

```bash
git add src/components/trainer/CTABlock.tsx src/components/trainer/PackagesCarousel.tsx
git commit -m "feat: add CTABlock and PackagesCarousel components"
```

---

## Task 5: About and Reviews components

**Files:**
- Create: `src/components/trainer/About.tsx`
- Create: `src/components/trainer/Reviews.tsx`

Reviews fetches its own data (separate Supabase REST call) — isolates the async concern.

- [ ] **Step 1: Create `src/components/trainer/About.tsx`**

```tsx
import { useState } from 'react';

interface AboutProps {
  bio: string;
}

export default function About({ bio }: AboutProps) {
  const [expanded, setExpanded] = useState(false);

  if (!bio) return null;

  return (
    <div className="tb-about">
      <div className="tb-section-label" style={{ marginBottom: '12px' }}>About</div>
      <div
        className={`tb-about-text${expanded ? ' expanded' : ''}`}
        id="tb-about-text"
      >
        {bio}
      </div>
      <button
        className="tb-read-more"
        onClick={() => setExpanded((prev) => !prev)}
      >
        {expanded ? 'Read less' : 'Read more →'}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/trainer/Reviews.tsx`**

```tsx
import { useState, useEffect } from 'react';
import type { Review } from './types';

const SUPABASE_URL = 'https://mezhtdbfyvkshpuplqqw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lemh0ZGJmeXZrc2hwdXBscXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE4NDIsImV4cCI6MjA5MDUwNzg0Mn0.zJG9xodJS70Wl2IJWiLxk2bSL7eukg5uUbLfF7jvQAo';

const STAR_FILLED = '#1A1411';
const STAR_EMPTY = 'rgba(0,0,0,0.12)';

interface ReviewsProps {
  trainerId: string;
}

interface ReviewsState {
  loading: boolean;
  reviews: Review[];
  total: number;
  error: boolean;
}

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= Math.round(rating) ? STAR_FILLED : STAR_EMPTY, fontSize: size }}>
          ★
        </span>
      ))}
    </span>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const name = review.client_name || 'Client';
  const initials = name.substring(0, 2).toUpperCase();
  const dateStr = review.created_at
    ? new Date(review.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    : '';

  return (
    <div style={{ background: '#F8F7F5', borderRadius: '12px', padding: '16px 18px', marginBottom: '10px' }}>
      <div style={{ marginBottom: '10px' }}>
        <Stars rating={review.rating ?? 0} size={12} />
      </div>
      {review.review_text && (
        <div style={{ fontSize: '13px', fontWeight: 300, color: '#4A4440', lineHeight: 1.6, marginBottom: '12px' }}>
          {review.review_text}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '11px', fontWeight: 600,
          color: 'var(--text-secondary)', flexShrink: 0,
        }}>
          {initials}
        </div>
        <div style={{ fontSize: '13px', fontWeight: 400, color: '#111111' }}>{name}</div>
        {dateStr && (
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>{dateStr}</div>
        )}
      </div>
    </div>
  );
}

export default function Reviews({ trainerId }: ReviewsProps) {
  const [state, setState] = useState<ReviewsState>({
    loading: true,
    reviews: [],
    total: 0,
    error: false,
  });

  useEffect(() => {
    if (!trainerId) return;

    async function fetchReviews() {
      try {
        const r = await fetch(
          `${SUPABASE_URL}/rest/v1/reviews?trainer_id=eq.${trainerId}&booking_id=not.is.null&order=created_at.desc&limit=2`,
          {
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
              Prefer: 'count=exact',
            },
          }
        );
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const rawTotal = parseInt(r.headers.get('content-range')?.split('/')[1] ?? '0', 10);
        const total = isNaN(rawTotal) ? 0 : rawTotal;
        const reviews: Review[] = await r.json();
        setState({ loading: false, reviews, total, error: false });
      } catch {
        setState({ loading: false, reviews: [], total: 0, error: true });
      }
    }

    fetchReviews();
  }, [trainerId]);

  if (state.loading) {
    return (
      <div className="tb-reviews">
        <div className="tb-section-label" style={{ marginBottom: '12px' }}>Reviews</div>
        <div className="tb-reviews-loading">Loading reviews...</div>
      </div>
    );
  }

  // Hide section entirely if no reviews (spec requirement)
  if (state.reviews.length === 0 || state.total === 0) return null;

  const avg = state.reviews.reduce((a, b) => a + (b.rating ?? 0), 0) / state.reviews.length;

  return (
    <div className="tb-reviews">
      <div className="tb-section-label" style={{ marginBottom: '12px' }}>Reviews</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <div style={{ fontSize: '32px', fontWeight: 200, letterSpacing: '-0.02em', color: '#111111', lineHeight: 1 }}>
          {avg.toFixed(1)}
        </div>
        <div>
          <div style={{ display: 'flex', gap: '2px', marginBottom: '3px' }}>
            <Stars rating={avg} />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            from {state.total} verified client{state.total !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
      {state.reviews.map((rv, i) => (
        <ReviewCard key={rv.id ?? i} review={rv} />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles cleanly**

```bash
npx astro check 2>&1 | grep -E "error|Error" | head -20
```

Expected: no errors related to the two new files.

- [ ] **Step 4: Commit**

```bash
git add src/components/trainer/About.tsx src/components/trainer/Reviews.tsx
git commit -m "feat: add About (expand/collapse) and Reviews (self-fetching) components"
```

---

## Task 6: CompactHeader and BottomNav components

**Files:**
- Create: `src/components/trainer/CompactHeader.tsx`
- Create: `src/components/trainer/BottomNav.tsx`

- [ ] **Step 1: Create `src/components/trainer/CompactHeader.tsx`**

The IntersectionObserver watches `#hero-sentinel` (rendered by Hero). When the sentinel exits the viewport, the header becomes visible.

```tsx
import { useState, useEffect } from 'react';

interface CompactHeaderProps {
  trainerName: string;
  onBack: () => void;
  onShare: () => void;
}

export default function CompactHeader({ trainerName, onBack, onShare }: CompactHeaderProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById('hero-sentinel');
    if (!sentinel) return;

    const obs = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, []);

  return (
    <div id="tb-compact-header" className={visible ? 'visible' : ''}>
      <button className="ch-btn" onClick={onBack} aria-label="Back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <span className="ch-name">{trainerName}</span>
      <button className="ch-btn" onClick={onShare} aria-label="Share">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/trainer/BottomNav.tsx`**

```tsx
export default function BottomNav() {
  return (
    <nav id="tb-bottom-nav" aria-label="Main navigation">
      <a href="/" className="nav-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        Discover
      </a>
      <a href="/find" className="nav-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        Search
      </a>
      <a href="/dashboard" className="nav-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        Bookings
      </a>
      <a href="/dashboard/messages" className="nav-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Messages
      </a>
      <a href="/dashboard" className="nav-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
        Profile
      </a>
    </nav>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles cleanly**

```bash
npx astro check 2>&1 | grep -E "error|Error" | head -20
```

Expected: no errors from the two new files.

- [ ] **Step 4: Commit**

```bash
git add src/components/trainer/CompactHeader.tsx src/components/trainer/BottomNav.tsx
git commit -m "feat: add CompactHeader (IntersectionObserver) and BottomNav components"
```

---

## Task 7: TrainerProfile root island

**Files:**
- Create: `src/components/TrainerProfile.tsx`

This is the only `client:load` island. It owns the data fetch and renders the entire profile tree.

- [ ] **Step 1: Create `src/components/TrainerProfile.tsx`**

```tsx
import { useState, useEffect, useCallback } from 'react';
import type { Trainer, Package, TrainerProfileProps } from './trainer/types';
import {
  buildStats, buildTags, dedupePackages,
  normaliseSpecialties, getDisplayName, getPhotoUrl,
  getLocation, getContactNumber, isVerifiedTrainer,
} from './trainer/utils';

import Hero from './trainer/Hero';
import IdentityStrip from './trainer/IdentityStrip';
import StatsRow from './trainer/StatsRow';
import CTABlock from './trainer/CTABlock';
import PackagesCarousel from './trainer/PackagesCarousel';
import About from './trainer/About';
import Reviews from './trainer/Reviews';
import CompactHeader from './trainer/CompactHeader';
import BottomNav from './trainer/BottomNav';

const SUPABASE_URL = 'https://mezhtdbfyvkshpuplqqw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lemh0ZGJmeXZrc2hwdXBscXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE4NDIsImV4cCI6MjA5MDUwNzg0Mn0.zJG9xodJS70Wl2IJWiLxk2bSL7eukg5uUbLfF7jvQAo';

type LoadState = 'loading' | 'loaded' | 'error';

function LoadingSpinner() {
  return (
    <div className="tb-loading">
      <div className="tb-spinner" />
    </div>
  );
}

function ErrorState() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '80vh', gap: '24px',
      padding: '32px', textAlign: 'center',
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <div style={{ fontSize: '64px', fontWeight: 200, letterSpacing: '-0.02em', color: '#111111', lineHeight: 1 }}>404</div>
      <h1 style={{ fontSize: '22px', fontWeight: 300, color: '#111111' }}>Trainer not found</h1>
      <p style={{ color: '#6B6460', maxWidth: '360px', lineHeight: 1.6, fontSize: '13.5px', fontWeight: 300 }}>
        This trainer profile doesn't exist or may have been removed.
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <a href="/find" style={{ background: '#1A1411', color: '#fff', padding: '12px 28px', borderRadius: '13px', textDecoration: 'none', fontWeight: 500, fontSize: '14px', letterSpacing: '0.04em' }}>
          Find a Trainer
        </a>
        <a href="/" style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.10)', color: '#7A7068', padding: '12px 28px', borderRadius: '13px', textDecoration: 'none', fontWeight: 300, fontSize: '14px' }}>
          Go Home
        </a>
      </div>
    </div>
  );
}

export default function TrainerProfile({ slug, paymentEnabled, currencySymbol }: TrainerProfileProps) {
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);

  useEffect(() => {
    if (!slug) { setLoadState('error'); return; }

    async function fetchTrainer() {
      try {
        const r = await fetch(
          `${SUPABASE_URL}/functions/v1/get-trainer?slug=${encodeURIComponent(slug)}`,
          { headers: { Authorization: `Bearer ${SUPABASE_KEY}`, apikey: SUPABASE_KEY } }
        );
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const resp = await r.json();
        if (!resp || resp.error) throw new Error('Trainer not found');
        const trainerData: Trainer = resp.trainer || resp;
        const pkgData: Package[] = resp.packages || [];
        setTrainer(trainerData);
        setPackages(dedupePackages(pkgData));
        setLoadState('loaded');
      } catch {
        setLoadState('error');
      }
    }

    fetchTrainer();
  }, [slug]);

  const handleBack = useCallback(() => {
    if (history.length > 1) history.back();
    else location.href = '/find';
  }, []);

  const handleShare = useCallback(() => {
    const name = trainer ? getDisplayName(trainer) : '';
    if (navigator.share) {
      navigator.share({
        title: `${name} - Verified Personal Trainer`,
        text: `Check out ${name}'s verified trainer profile`,
        url: location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(location.href).catch(() => {});
    }
  }, [trainer]);

  const displayName = trainer ? getDisplayName(trainer) : '';
  const specialties = trainer ? normaliseSpecialties(trainer.specialties as string[] | string | undefined) : [];
  const tags = trainer
    ? buildTags(
        specialties,
        isVerifiedTrainer(trainer),
        Array.isArray(trainer.certifications) ? trainer.certifications : [],
      )
    : [];
  const stats = trainer ? buildStats(trainer) : [];
  const location = trainer ? getLocation(trainer) : '';
  const whatsappNumber = trainer ? getContactNumber(trainer) : '';
  const bio = trainer?.bio ?? '';

  return (
    <div id="tb-page">
      <CompactHeader
        trainerName={displayName}
        onBack={handleBack}
        onShare={handleShare}
      />

      <div id="tb-root">
        {loadState === 'loading' && <LoadingSpinner />}
        {loadState === 'error' && <ErrorState />}
        {loadState === 'loaded' && trainer && (
          <div id="profile-mount">
            <Hero trainer={trainer} onBack={handleBack} onShare={handleShare} />
            <IdentityStrip tags={tags} location={location} />
            <StatsRow stats={stats} />
            <CTABlock
              paymentEnabled={paymentEnabled}
              whatsappNumber={whatsappNumber}
              displayName={displayName}
            />
            <PackagesCarousel
              packages={packages}
              currencySymbol={currencySymbol}
              displayName={displayName}
              whatsappNumber={whatsappNumber}
            />
            <About bio={bio} />
            <Reviews trainerId={trainer.id} />
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx astro check 2>&1 | grep -E "error|Error" | head -20
```

Expected: 0 errors in `TrainerProfile.tsx` or any trainer sub-component.

- [ ] **Step 3: Commit**

```bash
git add src/components/TrainerProfile.tsx
git commit -m "feat: add TrainerProfile root React island with full component tree"
```

---

## Task 8: Wire [slug].astro to the React island

This is the cutover. We replace the static HTML shell + `<script>` block with `<TrainerProfile client:load />`. The `<style is:global>` CSS stays — React components use the `.tb-*` classNames.

**Files:**
- Modify: `src/pages/[slug].astro`

- [ ] **Step 1: Add the React import at the top of the frontmatter**

In `src/pages/[slug].astro`, after the existing imports (around line 9), add:

```astro
import TrainerProfile from "../components/TrainerProfile";
```

The full import block becomes:
```astro
import Base from "../layouts/Base.astro";
import { getMarket } from "../lib/market.ts";
import TrainerProfile from "../components/TrainerProfile";
```

- [ ] **Step 2: Replace the `define:vars` script + entire HTML shell + `<script>` block**

The current template block in `[slug].astro` (lines 108–985) is:

```astro
<script define:vars={{ slug, paymentEnabled, currencySymbol }}>
  window.__TRAINER_SLUG__ = slug;
  ...
</script>

<style is:global>
  ... (all CSS)
</style>

<div id="tb-page">
  <div id="tb-compact-header">...</div>
  <div id="tb-root">
    <div class="tb-loading" id="tb-loading">...</div>
    <div id="profile-mount" style="display:none"></div>
  </div>
  <nav id="tb-bottom-nav">...</nav>
</div>

<script>
  ... (all JS — getSlug, loadTrainer, renderProfile, etc.)
</script>
```

Replace **everything after** the `<script type="application/ld+json">` line (i.e., replace from the `define:vars` script through the end of `</Base>`) with:

```astro
  <!-- CSS: global so .tb-* classes match React-rendered HTML -->
  <style is:global>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

body:has(#tb-page) {
  background: #FFFFFF;
  color: #111111;
}

#tb-page {
  --font: 'DM Sans', system-ui, sans-serif;
  --text-primary:   #111111;
  --text-secondary: #6B6460;
  --text-muted:     #A8A09A;
  --text-faint:     #B8B0AA;
  --bg-white:       #FFFFFF;
  --border:         rgba(0,0,0,0.055);
  --btn-primary-bg:       #1A1411;
  --btn-primary-text:     #FFFFFF;
  --btn-secondary-border: rgba(0,0,0,0.10);
  --btn-secondary-text:   #7A7068;
  --tag-bg:   rgba(0,0,0,0.05);
  --tag-text: #6B6460;
  --review-card-bg: #F8F7F5;
  font-family: var(--font);
  background: #FFFFFF;
  color: #111111;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
  overflow-x: hidden;
}

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

#tb-compact-header {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: calc(56px + env(safe-area-inset-top));
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(0,0,0,0.07);
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: env(safe-area-inset-top) 20px 0;
  padding-bottom: 0;
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
  width: 44px; height: 44px;
  border: none; background: none; border-radius: 50%;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-primary);
  flex-shrink: 0;
  transition: background 150ms ease;
}
.ch-btn:hover  { background: rgba(0,0,0,0.05); }
.ch-btn:active { background: rgba(0,0,0,0.10); }
#tb-compact-header .ch-btn { margin-bottom: 6px; }
#tb-compact-header .ch-name { margin-bottom: 8px; }

#tb-bottom-nav {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: calc(84px + env(safe-area-inset-bottom));
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
  letter-spacing: 0.03em; color: #6B6460;
  cursor: pointer; border: none; background: none; font-family: var(--font);
}
.nav-item.active { color: #1A1411; }
.nav-item svg { width: 24px; height: 24px; }

#profile-mount {
  padding-bottom: max(84px, calc(84px + env(safe-area-inset-bottom)));
}

@keyframes wa-pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(37,211,102,0.4); }
  50%      { box-shadow: 0 0 0 8px rgba(37,211,102,0); }
}

.tb-hero {
  position: relative;
  height: 460px;
  overflow: hidden;
  background: linear-gradient(168deg, #18191C, #272A30);
}
.tb-hero-img {
  position: absolute;
  inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  object-position: top center;
  display: block;
}
.tb-hero-fade {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 220px;
  background: linear-gradient(to bottom, transparent, #FFFFFF);
  pointer-events: none;
}
.tb-hero-controls {
  position: absolute;
  top: max(58px, calc(env(safe-area-inset-top) + 16px));
  left: 0; right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 10;
}
.tb-hero-btn {
  width: 36px; height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.22);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: #ffffff;
  flex-shrink: 0;
}
.tb-hero-name-block {
  position: absolute;
  bottom: 20px; left: 28px;
  z-index: 10;
}
.tb-hero-name {
  font-weight: 200; font-size: 36px;
  letter-spacing: 0.02em; color: #111111; line-height: 1.15;
}
.tb-hero-tagline {
  font-weight: 300; font-size: 13px;
  color: var(--text-secondary); margin-top: 4px;
}

.tb-identity {
  display: flex; align-items: center; gap: 8px;
  flex-wrap: wrap;
  padding: 12px 20px;
  border-bottom: 1px solid var(--border);
}
.tb-tag {
  background: var(--tag-bg); color: var(--tag-text);
  font-weight: 500; font-size: 10.5px;
  letter-spacing: 0.07em; text-transform: uppercase;
  padding: 5px 10px; border-radius: 20px;
}
.tb-location {
  margin-left: auto;
  display: flex; align-items: center; gap: 4px;
  font-size: 12px; color: var(--text-secondary); font-weight: 300;
}

.tb-stats {
  display: grid;
  border-bottom: 1px solid var(--border);
}
.tb-stat-item {
  padding: 16px 12px; text-align: center;
  border-right: 1px solid rgba(0,0,0,0.06);
}
.tb-stat-item:last-child { border-right: none; }
.tb-stat-num { font-weight: 200; font-size: 22px; letter-spacing: -0.02em; color: var(--text-primary); line-height: 1; }
.tb-stat-label { font-weight: 500; font-size: 9.5px; letter-spacing: 0.09em; text-transform: uppercase; color: var(--text-faint); margin-top: 4px; }

.tb-cta { padding: 20px 24px 16px; display: flex; flex-direction: column; gap: 10px; }
.tb-btn-primary {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; height: 52px; border-radius: 13px; border: none;
  background: var(--btn-primary-bg); color: var(--btn-primary-text);
  font-family: var(--font); font-weight: 500; font-size: 14px;
  letter-spacing: 0.04em; cursor: pointer;
  box-shadow: 0 4px 20px rgba(0,0,0,0.20); text-decoration: none;
}
.tb-btn-secondary {
  display: flex; align-items: center; justify-content: center;
  width: 100%; height: 46px; border-radius: 13px;
  border: 1px solid var(--btn-secondary-border);
  background: transparent; color: var(--btn-secondary-text);
  font-family: var(--font); font-weight: 300; font-size: 14px;
  cursor: pointer; text-decoration: none;
}

.tb-sessions { padding: 20px 0 20px; }
.tb-sessions-header { display: flex; align-items: center; justify-content: space-between; padding: 0 20px 12px; }
.tb-section-label { font-weight: 600; font-size: 10px; letter-spacing: 0.13em; text-transform: uppercase; color: var(--text-faint); }
.tb-see-all { font-size: 12px; font-weight: 400; color: #9A9290; text-decoration: none; }
.tb-sessions-scroll {
  display: flex; gap: 12px; overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 4px 20px 12px;
  -webkit-overflow-scrolling: touch;
}
.tb-sessions-scroll::-webkit-scrollbar { display: none; }
.tb-sessions-scroll { -ms-overflow-style: none; scrollbar-width: none; }
.tb-pkg-card {
  flex: 0 0 240px; scroll-snap-align: start;
  background: #FFFFFF; border: 1px solid rgba(0,0,0,0.07);
  border-radius: 14px; box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  padding: 18px 20px; display: flex; flex-direction: column; gap: 6px;
}
.tb-pkg-name { font-weight: 400; font-size: 15px; color: var(--text-primary); }
.tb-pkg-detail { font-weight: 300; font-size: 11px; color: var(--text-muted); }
.tb-pkg-price { font-weight: 200; font-size: 20px; letter-spacing: -0.02em; color: var(--text-primary); margin-top: auto; }
.tb-pkg-book {
  width: 100%; height: 36px; border-radius: 8px; border: none;
  background: var(--btn-primary-bg); color: #fff;
  font-family: var(--font); font-weight: 500; font-size: 12px;
  cursor: pointer; margin-top: 8px;
}

.tb-about { padding: 20px; border-top: 1px solid var(--border); }
.tb-about-text {
  font-weight: 300; font-size: 13.5px; color: #4A4440; line-height: 1.68;
  overflow: hidden; display: -webkit-box;
  -webkit-line-clamp: 3; -webkit-box-orient: vertical;
}
.tb-about-text.expanded { display: block; -webkit-line-clamp: unset; }
.tb-read-more {
  display: inline-block; margin-top: 8px;
  font-size: 13px; font-weight: 400; color: #9A9290;
  background: none; border: none; padding: 0; cursor: pointer;
  font-family: var(--font);
}

.tb-reviews { padding: 20px; border-top: 1px solid var(--border); }
.tb-reviews-loading { color: var(--text-muted); font-size: 13px; text-align: center; padding: 20px 0; }
  </style>

  <TrainerProfile
    client:load
    slug={slug}
    paymentEnabled={paymentEnabled}
    currencySymbol={currencySymbol}
  />
</Base>
```

- [ ] **Step 3: Run Astro type check**

```bash
npx astro check 2>&1 | tail -20
```

Expected: `0 errors`

- [ ] **Step 4: Start dev server and manually verify the profile page**

```bash
npx astro dev &
```

Open: `http://localhost:4321/sarah-al-mansoori`

Manual checklist:
- [ ] Hero photo loads, name visible at bottom
- [ ] Identity strip shows specialty tags + location
- [ ] Stats row shows rating, reviews, experience
- [ ] "Book a Session" and "Send a message" buttons visible
- [ ] Packages carousel scrolls horizontally
- [ ] About bio truncated with "Read more →" — click expands
- [ ] Reviews section loads (or hides if no reviews)
- [ ] Scroll past hero → compact sticky header fades in
- [ ] Bottom nav visible and fixed
- [ ] Navigate away and back — no CSS bleed to other pages (dark theme intact on homepage)

- [ ] **Step 5: Kill dev server and run e2e smoke test**

```bash
kill %1
pnpm test:e2e -- --grep "profile" 2>&1 | tail -30
```

If no e2e test exists for the profile page, create a quick smoke test `tests/e2e/trainer-profile.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('trainer profile page renders core sections', async ({ page }) => {
  await page.goto('/sarah-al-mansoori');
  // Hero: trainer name exists
  await expect(page.locator('.tb-hero-name')).toBeVisible({ timeout: 10000 });
  // CTA: book button
  await expect(page.locator('.tb-btn-primary')).toBeVisible();
  // Bottom nav
  await expect(page.locator('#tb-bottom-nav')).toBeVisible();
});

test('compact header appears on scroll', async ({ page }) => {
  await page.goto('/sarah-al-mansoori');
  await page.waitForSelector('.tb-hero-name', { timeout: 10000 });
  // Header starts hidden
  const header = page.locator('#tb-compact-header');
  await expect(header).not.toHaveClass(/visible/);
  // Scroll past hero
  await page.evaluate(() => window.scrollBy(0, 600));
  await expect(header).toHaveClass(/visible/);
});
```

Run: `pnpm test:e2e -- tests/e2e/trainer-profile.spec.ts`

Expected: `2 passed`

- [ ] **Step 6: Commit**

```bash
git add src/pages/[slug].astro tests/e2e/trainer-profile.spec.ts
git commit -m "feat: migrate trainer profile to React island — replace renderProfile() vanilla JS

- TrainerProfile client:load island owns data fetch and render
- 8 focused TSX sub-components replace 350-line innerHTML string
- CSS vars scoped to #tb-page prevent View Transitions leakage
- All unit tests passing, e2e smoke tests passing"
```

---

## Post-Migration Checklist

After all 8 tasks complete, verify:

- [ ] `pnpm test` — all unit tests pass (including trainer-profile-utils)
- [ ] `pnpm test:e2e` — e2e smoke tests pass
- [ ] `npx astro check` — 0 TypeScript errors
- [ ] Live page `https://trainedby.ae/sarah-al-mansoori` renders identically to pre-migration
- [ ] Landing page dark theme (`https://trainedby.ae/`) still intact — no CSS bleed
- [ ] `src/pages/[slug].astro` has no `<script>` block (only `<style is:global>`, `<TrainerProfile>`, and SEO boilerplate)
