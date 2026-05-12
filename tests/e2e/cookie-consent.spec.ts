import { test, expect } from '@playwright/test';

test('cookie consent banner appears on first visit', async ({ page, context }) => {
  await context.clearCookies();
  await page.goto('/landing');
  // Clear localStorage to simulate first visit
  await page.evaluate(() => localStorage.removeItem('cookie_consent'));
  await page.reload();
  const banner = page.locator('#cookie-banner');
  await expect(banner).toBeVisible({ timeout: 3000 });
});

test('cookie consent banner disappears after accepting', async ({ page, context }) => {
  await context.clearCookies();
  await page.goto('/landing');
  await page.evaluate(() => localStorage.removeItem('cookie_consent'));
  await page.reload();
  await page.locator('#cookie-accept').click();
  const banner = page.locator('#cookie-banner');
  await expect(banner).not.toBeVisible();
  const consent = await page.evaluate(() => localStorage.getItem('cookie_consent'));
  expect(consent).toBe('accepted');
});

test('cookie banner hidden when consent already given', async ({ page }) => {
  await page.goto('/landing');
  await page.evaluate(() => localStorage.setItem('cookie_consent', 'accepted'));
  await page.reload();
  const banner = page.locator('#cookie-banner');
  await expect(banner).not.toBeVisible();
});
