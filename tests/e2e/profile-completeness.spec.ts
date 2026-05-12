// tests/e2e/profile-completeness.spec.ts
import { test, expect } from '@playwright/test';

test('profile completeness widget is visible on dashboard after login', async ({ page }) => {
  await page.goto('/dashboard');

  const url = page.url();
  if (url.includes('/login') || url.includes('/join')) {
    test.skip(true, 'No test session available — run manually with a real trainer account');
    return;
  }

  const widget = page.locator('#profile-completeness');
  await expect(widget).toBeVisible();

  const pctLabel = page.locator('#pc-pct');
  await expect(pctLabel).toBeVisible();
  const pct = await pctLabel.textContent();
  expect(pct).not.toBe('0%');
});
