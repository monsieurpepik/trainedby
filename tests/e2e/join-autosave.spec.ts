import { test, expect } from '@playwright/test';

const DRAFT_KEY = 'tb_join_draft';

// Helper to clear draft from localStorage
async function clearDraft(page: typeof test['_draftPage']) {
  await page.evaluate((key) => {
    localStorage.removeItem(key);
  }, DRAFT_KEY);
}

// Helper to get current draft from localStorage
async function getDraft(page: typeof test['_draftPage']) {
  return await page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }, DRAFT_KEY);
}

// Helper to set draft in localStorage directly
async function setDraft(page: typeof test['_draftPage'], data: Record<string, any>) {
  await page.evaluate(([key, data]) => {
    localStorage.setItem(key, JSON.stringify(data));
  }, [DRAFT_KEY, data]);
}

test.describe('Join Form Auto-Save', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/join');
    await clearDraft(page);
  });

  test('saves multiple fields to localStorage on input', async ({ page }) => {
    await page.locator('#s1-name').fill('Alex Jordan');
    await page.locator('#s1-email').fill('alex@example.com');
    await page.locator('#s1-slug').fill('alexjordan');
    await page.locator('#s1-phone').fill('50 555 1234');

    await page.waitForTimeout(1500);

    const draft = await getDraft(page);
    expect(draft).not.toBeNull();
    expect(draft?.name).toBe('Alex Jordan');
    expect(draft?.email).toBe('alex@example.com');
    expect(draft?.slug).toBe('alexjordan');
    expect(draft?.phone).toBe('50 555 1234');
  });

  test('restores all step 1 fields from draft on reload', async ({ page }) => {
    await setDraft(page, {
      name: 'Sara Smith',
      slug: 'sarasmith',
      email: 'sara@example.com',
      phone: '50 666 7890',
      reps_number: 'CERT-12345',
      specialties: [],
      title: '',
      training_modes: [],
      trainer_id: '',
      bio: '',
      instagram: '',
      availability: '',
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    expect(await page.locator('#s1-name').inputValue()).toBe('Sara Smith');
    expect(await page.locator('#s1-slug').inputValue()).toBe('sarasmith');
    expect(await page.locator('#s1-email').inputValue()).toBe('sara@example.com');
    expect(await page.locator('#s1-phone').inputValue()).toBe('50 666 7890');
    expect(await page.locator('#s1-reps').inputValue()).toBe('CERT-12345');
  });

  test('handles malformed draft JSON gracefully', async ({ page }) => {
    await page.evaluate((key) => {
      localStorage.setItem(key, 'invalid-json{');
    }, DRAFT_KEY);

    // Should not throw on reload
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Fields should be functional
    const nameField = page.locator('#s1-name');
    await nameField.fill('Test Name');
    expect(await nameField.inputValue()).toBe('Test Name');
  });

  test('handles clearing (emptying) fields', async ({ page }) => {
    // Fill initial data
    await page.locator('#s1-name').fill('Test Name');
    await page.locator('#s1-email').fill('test@example.com');

    await page.waitForTimeout(1500);

    let draft = await getDraft(page);
    expect(draft?.name).toBe('Test Name');

    // Clear name field
    await page.locator('#s1-name').clear();
    await page.waitForTimeout(1500);

    draft = await getDraft(page);
    // Should save empty string after clearing
    expect(draft?.name).toBe('');
    expect(draft?.email).toBe('test@example.com');
  });
});
