/**
 * Profile page regression tests.
 *
 * Checks things that have broken in the past:
 *  - --text-on-brand undefined → button text invisible
 *  - certificationBody not passed → wrong badge text
 *  - hero name unreadable (dark text on dark photo)
 *  - stats not rendering (missing avg_rating in edge function select)
 *  - og:image pointing to non-existent /og/slug.png
 *
 * Runs against BASE_URL (defaults to trainedby-ae.netlify.app).
 * Slug must exist in the DB — use a seed trainer.
 */

import { test, expect, type Page } from '@playwright/test';

const SLUG = 'sarah-al-mansoori'; // seed trainer that must always exist
const PROFILE_URL = `/${SLUG}`;

// ─── Helpers ────────────────────────────────────────────────────────────────

async function waitForProfileLoaded(page: Page) {
  // React island is client:load — wait for #profile-mount to be non-empty
  await page.waitForSelector('#profile-mount .tb-hero', { timeout: 12_000 });
}

// ─── Meta & SSR ─────────────────────────────────────────────────────────────

test.describe('Profile meta (SSR, before JS)', () => {
  test('page title includes trainer name', async ({ page }) => {
    await page.goto(PROFILE_URL);
    const title = await page.title();
    expect(title).toMatch(/sarah|trainedby/i);
  });

  test('og:image is a real URL, not /og/*.png', async ({ page }) => {
    await page.goto(PROFILE_URL);
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage).toBeTruthy();
    expect(ogImage).not.toMatch(/^\/og\//); // old broken pattern
    // Should be an absolute URL (Unsplash or Supabase storage)
    expect(ogImage).toMatch(/^https?:\/\//);
  });

  test('og:title and og:description are present', async ({ page }) => {
    await page.goto(PROFILE_URL);
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogDesc = await page.locator('meta[property="og:description"]').getAttribute('content');
    expect(ogTitle).toBeTruthy();
    expect(ogDesc).toBeTruthy();
  });

  test('JSON-LD structured data is LocalBusiness type', async ({ page }) => {
    await page.goto(PROFILE_URL);
    const jsonLd = await page.evaluate(() => {
      const el = document.querySelector('script[type="application/ld+json"]');
      return el ? JSON.parse(el.textContent || '{}') : null;
    });
    expect(jsonLd?.['@type']).toBe('LocalBusiness');
    expect(jsonLd?.name).toBeTruthy();
  });

  test('canonical URL does not include query params', async ({ page }) => {
    await page.goto(PROFILE_URL);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBeTruthy();
    expect(canonical).not.toContain('?');
  });
});

// ─── Hero section ────────────────────────────────────────────────────────────

test.describe('Hero section', () => {
  test('trainer photo loads (img is not broken)', async ({ page }) => {
    await page.goto(PROFILE_URL);
    await waitForProfileLoaded(page);
    const img = page.locator('.tb-hero-img');
    await expect(img).toBeVisible();
    // naturalWidth > 0 means image actually loaded
    const loaded = await img.evaluate((el: HTMLImageElement) => el.naturalWidth > 0);
    expect(loaded).toBe(true);
  });

  test('trainer name is visible in hero', async ({ page }) => {
    await page.goto(PROFILE_URL);
    await waitForProfileLoaded(page);
    const name = page.locator('.tb-hero-name');
    await expect(name).toBeVisible();
    const text = await name.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  test('hero name text is white (not dark on dark photo)', async ({ page }) => {
    await page.goto(PROFILE_URL);
    await waitForProfileLoaded(page);
    const color = await page.locator('.tb-hero-name').evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    // White = rgb(255, 255, 255) — tolerance for near-white is fine
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      const [, r, g, b] = match.map(Number);
      // Sum of RGB should be high (white-ish)
      expect(r + g + b).toBeGreaterThan(600); // pure white = 765
    }
  });

  test('back button is visible and has non-transparent color', async ({ page }) => {
    await page.goto(PROFILE_URL);
    await waitForProfileLoaded(page);
    const backBtn = page.locator('.tb-hero-btn').first();
    await expect(backBtn).toBeVisible();
    const color = await backBtn.evaluate((el) => window.getComputedStyle(el).color);
    expect(color).not.toBe('rgba(0, 0, 0, 0)');
    expect(color).not.toBe('transparent');
  });
});

// ─── CTA buttons ─────────────────────────────────────────────────────────────

test.describe('CTA buttons (the --text-on-brand regression)', () => {
  test('primary CTA button is visible', async ({ page }) => {
    await page.goto(PROFILE_URL);
    await waitForProfileLoaded(page);
    await expect(page.locator('.tb-btn-primary').first()).toBeVisible();
  });

  test('primary CTA button text is visible (white, not transparent)', async ({ page }) => {
    await page.goto(PROFILE_URL);
    await waitForProfileLoaded(page);
    const color = await page.locator('.tb-btn-primary').first().evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    expect(color).not.toBe('rgba(0, 0, 0, 0)');
    expect(color).not.toBe('transparent');
    // Should be white or near-white
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      const [, r, g, b] = match.map(Number);
      expect(r + g + b).toBeGreaterThan(500);
    }
  });

  test('primary CTA button has non-empty label', async ({ page }) => {
    await page.goto(PROFILE_URL);
    await waitForProfileLoaded(page);
    const text = await page.locator('.tb-btn-primary').first().textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  test('secondary CTA button is visible', async ({ page }) => {
    await page.goto(PROFILE_URL);
    await waitForProfileLoaded(page);
    await expect(page.locator('.tb-btn-secondary').first()).toBeVisible();
  });
});

// ─── Identity strip & certification badge ────────────────────────────────────

test.describe('Identity strip & cert badge (the certificationBody regression)', () => {
  test('identity strip renders at least one tag', async ({ page }) => {
    await page.goto(PROFILE_URL);
    await waitForProfileLoaded(page);
    const tags = page.locator('.tb-tag');
    await expect(tags.first()).toBeVisible();
    const count = await tags.count();
    expect(count).toBeGreaterThan(0);
  });

  test('verified badge contains certificationBody text, not bare "Verified"', async ({ page }) => {
    await page.goto(PROFILE_URL);
    await waitForProfileLoaded(page);
    const tags = await page.locator('.tb-tag').allTextContents();
    const verifiedTag = tags.find(t => t.toLowerCase().includes('verified'));
    // Should say "REPs UAE Verified" or similar — not just "Verified"
    if (verifiedTag) {
      expect(verifiedTag.trim()).not.toBe('Verified');
      expect(verifiedTag.length).toBeGreaterThan(8);
    }
  });

  test('location is shown in identity strip', async ({ page }) => {
    await page.goto(PROFILE_URL);
    await waitForProfileLoaded(page);
    const location = page.locator('.tb-location');
    await expect(location).toBeVisible();
    const text = await location.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });
});

// ─── Stats row ───────────────────────────────────────────────────────────────

test.describe('Stats row', () => {
  test('stats row renders with numbers (avg_rating regression)', async ({ page }) => {
    await page.goto(PROFILE_URL);
    await waitForProfileLoaded(page);
    const stats = page.locator('.tb-stat-item');
    const count = await stats.count();
    expect(count).toBeGreaterThan(0);
    // First stat number should be numeric
    const num = await page.locator('.tb-stat-num').first().textContent();
    expect(num?.trim().length).toBeGreaterThan(0);
  });

  test('rating stat shows a number between 1 and 5', async ({ page }) => {
    await page.goto(PROFILE_URL);
    await waitForProfileLoaded(page);
    const nums = await page.locator('.tb-stat-num').allTextContents();
    const ratingNum = nums.find(n => {
      const f = parseFloat(n.replace(/[^0-9.]/g, ''));
      return f >= 1 && f <= 5;
    });
    expect(ratingNum).toBeTruthy();
  });
});

// ─── Packages carousel ───────────────────────────────────────────────────────

test.describe('Packages carousel', () => {
  test('packages section renders at least one package card', async ({ page }) => {
    await page.goto(PROFILE_URL);
    await waitForProfileLoaded(page);
    const cards = page.locator('.tb-pkg-card');
    await expect(cards.first()).toBeVisible({ timeout: 8_000 });
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('package cards show a price', async ({ page }) => {
    await page.goto(PROFILE_URL);
    await waitForProfileLoaded(page);
    await expect(page.locator('.tb-pkg-card').first()).toBeVisible({ timeout: 8_000 });
    const prices = await page.locator('.tb-pkg-price').allTextContents();
    expect(prices.length).toBeGreaterThan(0);
    expect(prices[0].trim().length).toBeGreaterThan(0);
  });

  test('Book button on package card has visible text', async ({ page }) => {
    await page.goto(PROFILE_URL);
    await waitForProfileLoaded(page);
    await expect(page.locator('.tb-pkg-card').first()).toBeVisible({ timeout: 8_000 });
    const bookBtn = page.locator('.tb-pkg-book').first();
    const color = await bookBtn.evaluate((el) => window.getComputedStyle(el).color);
    expect(color).not.toBe('rgba(0, 0, 0, 0)');
    const text = await bookBtn.textContent();
    expect(text?.trim()).toBe('Book');
  });
});

// ─── Console errors ──────────────────────────────────────────────────────────

test.describe('No console errors', () => {
  test('profile page loads without JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto(PROFILE_URL);
    await waitForProfileLoaded(page);
    await page.waitForTimeout(1000);
    const critical = errors.filter(e =>
      !e.includes('ResizeObserver') &&
      !e.includes('Non-Error promise rejection') &&
      !e.includes('Script error') &&
      !e.includes('Loading chunk')
    );
    expect(critical, `JS errors: ${critical.join(', ')}`).toHaveLength(0);
  });
});

// ─── Mobile layout ───────────────────────────────────────────────────────────

test.describe('Mobile layout', () => {
  test('bottom nav is visible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(PROFILE_URL);
    await waitForProfileLoaded(page);
    await expect(page.locator('#tb-bottom-nav')).toBeVisible();
  });

  test('no horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(PROFILE_URL);
    await waitForProfileLoaded(page);
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(395);
  });

  test('compact header hides initially on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(PROFILE_URL);
    await waitForProfileLoaded(page);
    const header = page.locator('#tb-compact-header');
    // Should start hidden (opacity 0 / no .visible class)
    const hasVisible = await header.evaluate((el) => el.classList.contains('visible'));
    expect(hasVisible).toBe(false);
  });
});
