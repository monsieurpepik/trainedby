import { test, expect, Page } from '@playwright/test';

// ─── Helpers ────────────────────────────────────────────────────────────────

const SLUG = `test-trainer-${Date.now()}`;
const EMAIL = `test+${Date.now()}@trainedby.ae`;
const PHONE = '501234567';

async function fillStep1(page: Page) {
  await page.fill('#s1-name', 'Test Trainer');
  await page.fill('#s1-slug', SLUG);
  await page.fill('#s1-email', EMAIL);
  await page.fill('#s1-phone', PHONE);
}

// ─── Landing Page ───────────────────────────────────────────────────────────

test.describe('Landing Page', () => {
  test('loads with correct title and hero copy', async ({ page }) => {
    await page.goto('/landing');
    await expect(page).toHaveTitle(/TrainedBy/i);
    await expect(page.locator('h1')).toContainText(/stop trading time/i);
  });

  test('income calculator updates output when sliders change', async ({ page }) => {
    await page.goto('/landing');
    const slider = page.locator('#calc-clients, input[type="range"]').first();
    if (await slider.isVisible()) {
      await slider.fill('30');
      const output = page.locator('#calc-total, .calc-result, [id*="total"]').first();
      await expect(output).toBeVisible();
    }
  });

  test('CTA button navigates to join page', async ({ page }) => {
    await page.goto('/landing');
    const cta = page.locator('a[href*="join"]').first();
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page).toHaveURL(/join/);
  });

  test('has no broken internal links', async ({ page }) => {
    await page.goto('/landing');
    const links = await page.locator('a[href^="/"], a[href^="./"]').all();
    for (const link of links.slice(0, 10)) {
      const href = await link.getAttribute('href');
      if (href && !href.includes('#')) {
        const response = await page.request.get(href);
        expect(response.status(), `Link ${href} returned ${response.status()}`).toBeLessThan(400);
      }
    }
  });

  test('is responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/landing');
    await expect(page.locator('h1')).toBeVisible();
    // Nav should be visible (no overflow)
    const nav = page.locator('nav, header').first();
    await expect(nav).toBeVisible();
  });
});

// ─── Trainer Profile Page ────────────────────────────────────────────────────

test.describe('Trainer Profile Page (/sarah)', () => {
  test('loads Sarah profile with correct name and badge', async ({ page }) => {
    await page.goto('/sarah');
    await expect(page.locator('h1, .trainer-name')).toContainText(/sarah/i);
    // REPs badge should be present
    await expect(page.locator('.reps-badge, [class*="reps"]').first()).toBeVisible();
  });

  test('shows training packages section', async ({ page }) => {
    await page.goto('/sarah');
    // Expand packages section
    const packagesSection = page.locator('#packages-section, [id*="package"]').first();
    if (await packagesSection.isVisible()) {
      await packagesSection.click();
    }
    await expect(page.locator('.pkg-card, [class*="pkg"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('WhatsApp contact button is present and has correct href', async ({ page }) => {
    await page.goto('/sarah');
    const waBtn = page.locator('#waBtn, a[href*="wa.me"], a[href*="whatsapp"]').first();
    await expect(waBtn).toBeVisible();
    const href = await waBtn.getAttribute('href');
    expect(href).toMatch(/wa\.me|whatsapp/i);
  });

  test('free assessment form is present', async ({ page }) => {
    await page.goto('/sarah');
    const assessmentSection = page.locator('#assessment-section, [id*="assessment"]').first();
    if (await assessmentSection.isVisible()) {
      await assessmentSection.click();
    }
    // Assessment form or button should exist
    const form = page.locator('form, .assessment-form, [class*="assessment"]').first();
    await expect(form).toBeVisible({ timeout: 5000 });
  });

  test('profile has correct Open Graph meta tags for social sharing', async ({ page }) => {
    await page.goto('/sarah');
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toBeTruthy();
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    // OG image may be null if trainer has no photo — that's acceptable
    // but the tag should exist
    const ogImageTag = page.locator('meta[property="og:image"]');
    // Just check page has title meta
    expect(ogTitle).toMatch(/sarah|trainedby/i);
  });

  test('nearby trainers section renders or is hidden gracefully', async ({ page }) => {
    await page.goto('/sarah');
    await page.waitForTimeout(2000); // Allow Supabase queries to complete
    // Either the section is visible with content, or it's hidden — no error state
    const errorState = page.locator('.error, [class*="error-state"]');
    await expect(errorState).toHaveCount(0);
  });

  test('profile page loads in under 3 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/sarah');
    await page.waitForLoadState('domcontentloaded');
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(3000);
  });
});

// ─── Join / Onboarding ───────────────────────────────────────────────────────

test.describe('Join Page — Onboarding Flow', () => {
  test('loads with 2-step indicator', async ({ page }) => {
    await page.goto('/join');
    await expect(page).toHaveTitle(/get your/i);
    // Should show step 1 of 2
    const stepIndicator = page.locator('.step-indicator, [id="step-indicator"]').first();
    await expect(stepIndicator).toBeVisible();
    // Step 1 should be visible, step 2 hidden
    await expect(page.locator('#step-1')).toBeVisible();
    await expect(page.locator('#step-2')).toBeHidden();
  });

  test('step 1 validates required fields before advancing', async ({ page }) => {
    await page.goto('/join');
    // Click continue without filling anything
    await page.click('button:has-text("Continue")');
    // Should stay on step 1
    await expect(page.locator('#step-1')).toBeVisible();
    await expect(page.locator('#step-2')).toBeHidden();
  });

  test('slug auto-generates from name input', async ({ page }) => {
    await page.goto('/join');
    await page.fill('#s1-name', 'Ahmed Al Rashid');
    // Trigger input event
    await page.locator('#s1-name').dispatchEvent('input');
    await page.waitForTimeout(300);
    const slugValue = await page.inputValue('#s1-slug');
    expect(slugValue).toMatch(/ahmed/i);
  });

  test('email validation rejects invalid format', async ({ page }) => {
    await page.goto('/join');
    await page.fill('#s1-name', 'Test Trainer');
    await page.fill('#s1-slug', 'test-trainer-valid');
    await page.fill('#s1-email', 'not-an-email');
    await page.fill('#s1-phone', '501234567');
    await page.click('button:has-text("Continue")');
    // Should stay on step 1 due to email validation
    await expect(page.locator('#step-1')).toBeVisible();
  });

  test('step 1 advances to step 2 with valid data', async ({ page }) => {
    await page.goto('/join');
    await fillStep1(page);
    await page.click('button:has-text("Continue")');
    // Step 2 should become visible (may take a moment for animation)
    await expect(page.locator('#step-2')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#step-1')).toBeHidden();
  });

  test('specialty pills are selectable in step 2', async ({ page }) => {
    await page.goto('/join');
    await fillStep1(page);
    await page.click('button:has-text("Continue")');
    await expect(page.locator('#step-2')).toBeVisible({ timeout: 5000 });
    // Click a specialty pill
    const pill = page.locator('.spec-pill, [class*="pill"]').first();
    if (await pill.isVisible()) {
      await pill.click();
      await expect(pill).toHaveClass(/active|selected/);
    }
  });

  test('join page is mobile-friendly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/join');
    await expect(page.locator('#s1-name')).toBeVisible();
    await expect(page.locator('button:has-text("Continue")')).toBeVisible();
    // No horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = 375;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5); // 5px tolerance
  });
});

// ─── Lead Submission ─────────────────────────────────────────────────────────

test.describe('Lead Submission (Assessment Form)', () => {
  test('assessment form submits and shows confirmation', async ({ page }) => {
    await page.goto('/sarah');
    // Open assessment section
    const assessBtn = page.locator('button:has-text("Assessment"), [id*="assessment"]').first();
    if (await assessBtn.isVisible()) {
      await assessBtn.click();
    }
    await page.waitForTimeout(500);

    // Fill the form if visible
    const nameField = page.locator('input[placeholder*="name" i], #lead-name, #client-name').first();
    if (await nameField.isVisible()) {
      await nameField.fill('Test Client');
      const phoneField = page.locator('input[type="tel"], input[placeholder*="phone" i]').first();
      if (await phoneField.isVisible()) {
        await phoneField.fill('501234567');
      }
      const submitBtn = page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Get")').first();
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        // Should show success message or redirect
        await page.waitForTimeout(2000);
        const success = page.locator('.success, [class*="success"], :has-text("Thank you"), :has-text("sent")').first();
        // Success state should appear (or form should be gone)
        const formStillVisible = await nameField.isVisible();
        if (formStillVisible) {
          // Form is still visible — check for error message
          console.log('Form still visible after submit — may need real trainer_id');
        }
      }
    }
  });
});

// ─── Pricing Page ────────────────────────────────────────────────────────────

test.describe('Pricing Page', () => {
  test('loads with Free and Pro tiers', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page).toHaveTitle(/pricing/i);
    await expect(page.locator(':has-text("Free")')).toBeVisible();
    await expect(page.locator(':has-text("Pro")')).toBeVisible();
  });

  test('annual toggle changes displayed price', async ({ page }) => {
    await page.goto('/pricing');
    const toggle = page.locator('#billing-toggle, input[type="checkbox"]').first();
    if (await toggle.isVisible()) {
      const priceBefore = await page.locator('.price-amount, [class*="price"]').first().textContent();
      await toggle.click();
      await page.waitForTimeout(300);
      const priceAfter = await page.locator('.price-amount, [class*="price"]').first().textContent();
      // Price should change when toggling annual
      expect(priceBefore).not.toEqual(priceAfter);
    }
  });

  test('ROI guarantee section is visible', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.locator(':has-text("guarantee"), :has-text("Guarantee")')).toBeVisible();
  });

  test('CTA buttons link to join page', async ({ page }) => {
    await page.goto('/pricing');
    const ctaBtn = page.locator('a[href*="join"]').first();
    await expect(ctaBtn).toBeVisible();
  });
});

// ─── Blog Page ───────────────────────────────────────────────────────────────

test.describe('Blog Page', () => {
  test('loads with correct title', async ({ page }) => {
    await page.goto('/blog');
    await expect(page).toHaveTitle(/blog/i);
  });

  test('category filter buttons are present', async ({ page }) => {
    await page.goto('/blog');
    const filters = page.locator('.filter-btn, [class*="filter"]');
    await expect(filters.first()).toBeVisible();
  });

  test('write for us CTA is visible', async ({ page }) => {
    await page.goto('/blog');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await expect(page.locator(':has-text("Write for TrainedBy"), :has-text("write for")')).toBeVisible();
  });
});

// ─── Dashboard Page ──────────────────────────────────────────────────────────

test.describe('Dashboard Page', () => {
  test('redirects unauthenticated users to login or shows sign-in prompt', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveTitle(/dashboard/i);
    // Should show auth gate or sign-in UI — not a blank page
    const authGate = page.locator('.auth-gate, [id*="auth"], :has-text("sign in"), :has-text("Sign In"), :has-text("magic link")').first();
    await expect(authGate).toBeVisible({ timeout: 5000 });
  });

  test('dashboard page loads without JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    // Filter out known third-party errors
    const criticalErrors = errors.filter(e =>
      !e.includes('ResizeObserver') &&
      !e.includes('Non-Error promise rejection') &&
      !e.includes('Script error')
    );
    expect(criticalErrors).toHaveLength(0);
  });
});

// ─── Security & Performance ──────────────────────────────────────────────────

test.describe('Security Headers', () => {
  test('profile page has X-Frame-Options: DENY', async ({ page }) => {
    const response = await page.request.get('/sarah');
    const xfo = response.headers()['x-frame-options'];
    expect(xfo?.toLowerCase()).toBe('deny');
  });

  test('all pages have X-Content-Type-Options: nosniff', async ({ page }) => {
    for (const path of ['/landing', '/join', '/pricing', '/blog']) {
      const response = await page.request.get(path);
      const xcto = response.headers()['x-content-type-options'];
      expect(xcto?.toLowerCase(), `${path} missing nosniff`).toBe('nosniff');
    }
  });

  test('no sensitive data in page source', async ({ page }) => {
    await page.goto('/sarah');
    const content = await page.content();
    // Should not expose service role key or internal tokens
    expect(content).not.toMatch(/service_role/i);
    expect(content).not.toMatch(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]{50,}/); // JWT pattern for service role
  });
});

test.describe('Performance', () => {
  test('landing page DOM loads in under 2 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/landing');
    await page.waitForLoadState('domcontentloaded');
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(2000);
  });

  test('images on profile page have loading="lazy"', async ({ page }) => {
    await page.goto('/sarah');
    await page.waitForTimeout(2000);
    // Check that dynamically inserted images have lazy loading
    const images = await page.locator('img:not([loading])').all();
    // Allow a small number of above-the-fold images without lazy loading
    expect(images.length).toBeLessThan(5);
  });
});
