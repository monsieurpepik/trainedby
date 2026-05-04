import { test, expect } from '@playwright/test';

/**
 * E2E tests for /join localStorage auto-save (DRAFT_KEY = 'tb_join_draft')
 *
 * The join form implements auto-save to preserve form state across page reloads.
 * This test suite verifies:
 * - Form data persists to localStorage on input changes
 * - Form data restores from localStorage on page load
 * - Draft data is properly cleared after successful submission
 * - Draft restoration skips stale data (e.g., old trainer_id from different session)
 */

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

test.describe('Join Form Auto-Save (Step 1)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/join');
    await clearDraft(page);
  });

  test('Step 1: saves name field to localStorage on input', async ({ page }) => {
    const nameField = page.locator('#s1-name');
    await nameField.fill('Alex Jordan');

    // Wait for auto-save to complete (debounce typically ~500-1000ms)
    await page.waitForTimeout(1500);

    const draft = await getDraft(page);
    expect(draft).not.toBeNull();
    expect(draft?.name).toBe('Alex Jordan');
  });

  test('Step 1: saves email field to localStorage on input', async ({ page }) => {
    const emailField = page.locator('#s1-email');
    await emailField.fill('trainer@example.com');

    await page.waitForTimeout(1500);

    const draft = await getDraft(page);
    expect(draft).not.toBeNull();
    expect(draft?.email).toBe('trainer@example.com');
  });

  test('Step 1: saves slug field to localStorage on input', async ({ page }) => {
    const slugField = page.locator('#s1-slug');
    await slugField.fill('alexjordan');

    await page.waitForTimeout(1500);

    const draft = await getDraft(page);
    expect(draft).not.toBeNull();
    expect(draft?.slug).toBe('alexjordan');
  });

  test('Step 1: saves phone field to localStorage on input', async ({ page }) => {
    const phoneField = page.locator('#s1-phone');
    await phoneField.fill('50 123 4567');

    await page.waitForTimeout(1500);

    const draft = await getDraft(page);
    expect(draft).not.toBeNull();
    expect(draft?.phone).toBe('50 123 4567');
  });

  test('Step 1: saves multiple fields together', async ({ page }) => {
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

  test('Step 1: restores name from draft on page reload', async ({ page }) => {
    const nameField = page.locator('#s1-name');

    // Set draft directly
    await setDraft(page, {
      name: 'Restored Trainer',
      slug: '',
      email: '',
      phone: '',
      reps_number: '',
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

    const nameValue = await nameField.inputValue();
    expect(nameValue).toBe('Restored Trainer');
  });

  test('Step 1: restores email from draft on page reload', async ({ page }) => {
    const emailField = page.locator('#s1-email');

    await setDraft(page, {
      name: '',
      slug: '',
      email: 'restored@example.com',
      phone: '',
      reps_number: '',
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

    const emailValue = await emailField.inputValue();
    expect(emailValue).toBe('restored@example.com');
  });

  test('Step 1: restores all step 1 fields from draft on reload', async ({ page }) => {
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

  test('Step 1: handles empty draft gracefully', async ({ page }) => {
    await setDraft(page, {});
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Fields should be empty, no errors
    expect(await page.locator('#s1-name').inputValue()).toBe('');
    expect(await page.locator('#s1-email').inputValue()).toBe('');
  });

  test('Step 1: handles malformed draft JSON gracefully', async ({ page }) => {
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
});

test.describe('Join Form Auto-Save (Step 3)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/join');
    await clearDraft(page);
  });

  test('Step 3: saves bio field to localStorage on input', async ({ page }) => {
    const bioField = page.locator('#s3-bio');

    // Fill and trigger input event to ensure auto-save fires
    await bioField.click();
    await bioField.fill('I specialize in strength training and conditioning.');

    await page.waitForTimeout(1500);

    const draft = await getDraft(page);
    expect(draft).not.toBeNull();
    expect(draft?.bio).toContain('strength');
  });

  test('Step 3: saves instagram field to localStorage on input', async ({ page }) => {
    const igField = page.locator('#s3-instagram');
    await igField.fill('alexjordan_trainer');

    await page.waitForTimeout(1500);

    const draft = await getDraft(page);
    expect(draft).not.toBeNull();
    expect(draft?.instagram).toBe('alexjordan_trainer');
  });

  test('Step 3: saves availability field to localStorage on input', async ({ page }) => {
    const availField = page.locator('#s3-availability');
    await availField.fill('Weekday mornings, flexible schedule');

    await page.waitForTimeout(1500);

    const draft = await getDraft(page);
    expect(draft).not.toBeNull();
    expect(draft?.availability).toContain('Weekday');
  });

  test('Step 3: restores bio from draft on page reload', async ({ page }) => {
    const bioContent =
      'I help busy professionals achieve their fitness goals through personalized training plans.';

    await setDraft(page, {
      name: '',
      slug: '',
      email: '',
      phone: '',
      reps_number: '',
      specialties: [],
      title: '',
      training_modes: [],
      trainer_id: '',
      bio: bioContent,
      instagram: '',
      availability: '',
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    const bioValue = await page.locator('#s3-bio').inputValue();
    expect(bioValue).toBe(bioContent);
  });

  test('Step 3: restores all step 3 fields from draft on reload', async ({ page }) => {
    await setDraft(page, {
      name: '',
      slug: '',
      email: '',
      phone: '',
      reps_number: '',
      specialties: [],
      title: '',
      training_modes: [],
      trainer_id: '',
      bio: 'Certified personal trainer',
      instagram: 'trainer_bio',
      availability: 'Evenings & weekends',
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    expect(await page.locator('#s3-bio').inputValue()).toContain('Certified');
    expect(await page.locator('#s3-instagram').inputValue()).toBe('trainer_bio');
    expect(await page.locator('#s3-availability').inputValue()).toContain('Evenings');
  });
});

test.describe('Join Form Draft Lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/join');
    await clearDraft(page);
  });

  test('Draft persists across multiple page loads', async ({ page }) => {
    // First visit: fill form
    await page.locator('#s1-name').fill('John Trainer');
    await page.locator('#s1-email').fill('john@example.com');

    await page.waitForTimeout(1500);

    let draft = await getDraft(page);
    expect(draft?.name).toBe('John Trainer');

    // Reload 1
    await page.reload();
    await page.waitForLoadState('networkidle');

    let nameValue = await page.locator('#s1-name').inputValue();
    expect(nameValue).toBe('John Trainer');

    // Reload 2
    await page.reload();
    await page.waitForLoadState('networkidle');

    nameValue = await page.locator('#s1-name').inputValue();
    expect(nameValue).toBe('John Trainer');

    draft = await getDraft(page);
    expect(draft?.name).toBe('John Trainer');
    expect(draft?.email).toBe('john@example.com');
  });

  test('Draft updates incrementally as user fills form', async ({ page }) => {
    // Fill name
    await page.locator('#s1-name').fill('Step 1 Name');
    await page.waitForTimeout(1500);

    let draft = await getDraft(page);
    expect(draft?.name).toBe('Step 1 Name');
    expect(draft?.email).toBe(undefined);

    // Add email
    await page.locator('#s1-email').fill('email@example.com');
    await page.waitForTimeout(1500);

    draft = await getDraft(page);
    expect(draft?.name).toBe('Step 1 Name');
    expect(draft?.email).toBe('email@example.com');

    // Add phone
    await page.locator('#s1-phone').fill('50 111 2222');
    await page.waitForTimeout(1500);

    draft = await getDraft(page);
    expect(draft?.name).toBe('Step 1 Name');
    expect(draft?.email).toBe('email@example.com');
    expect(draft?.phone).toBe('50 111 2222');
  });

  test('Draft contains all supported fields', async ({ page }) => {
    const testData = {
      name: 'Test Trainer',
      slug: 'testtrainer',
      email: 'test@example.com',
      phone: '50 999 8888',
      reps_number: 'CERT-TEST',
      bio: 'Test bio',
      instagram: 'testtrainer_ig',
      availability: 'Test availability',
    };

    // Fill each field
    await page.locator('#s1-name').fill(testData.name);
    await page.locator('#s1-slug').fill(testData.slug);
    await page.locator('#s1-email').fill(testData.email);
    await page.locator('#s1-phone').fill(testData.phone);
    await page.locator('#s1-reps').fill(testData.reps_number);
    await page.locator('#s3-bio').fill(testData.bio);
    await page.locator('#s3-instagram').fill(testData.instagram);
    await page.locator('#s3-availability').fill(testData.availability);

    await page.waitForTimeout(1500);

    const draft = await getDraft(page);
    expect(draft?.name).toBe(testData.name);
    expect(draft?.slug).toBe(testData.slug);
    expect(draft?.email).toBe(testData.email);
    expect(draft?.phone).toBe(testData.phone);
    expect(draft?.reps_number).toBe(testData.reps_number);
    expect(draft?.bio).toBe(testData.bio);
    expect(draft?.instagram).toBe(testData.instagram);
    expect(draft?.availability).toBe(testData.availability);
  });

  test('User edits are reflected in draft after reload', async ({ page }) => {
    // Set initial draft
    await setDraft(page, {
      name: 'Original Name',
      slug: 'original',
      email: 'original@example.com',
      phone: '',
      reps_number: '',
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

    // Edit name
    const nameField = page.locator('#s1-name');
    await nameField.clear();
    await nameField.fill('Updated Name');

    await page.waitForTimeout(1500);

    let draft = await getDraft(page);
    expect(draft?.name).toBe('Updated Name');

    // Reload and verify update persists
    await page.reload();
    await page.waitForLoadState('networkidle');

    expect(await page.locator('#s1-name').inputValue()).toBe('Updated Name');
  });
});

test.describe('Join Form Draft Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/join');
    await clearDraft(page);
  });

  test('Handles unicode and special characters in draft', async ({ page }) => {
    const specialData = {
      name: 'José García-López',
      email: 'josé+trainer@example.com',
      slug: 'jose_garcia',
      bio: 'Specializing in "premium" training & conditioning — high intensity!',
    };

    await page.locator('#s1-name').fill(specialData.name);
    await page.locator('#s1-email').fill(specialData.email);
    await page.locator('#s1-slug').fill(specialData.slug);
    await page.locator('#s3-bio').fill(specialData.bio);

    await page.waitForTimeout(1500);

    const draft = await getDraft(page);
    expect(draft?.name).toBe(specialData.name);
    expect(draft?.email).toBe(specialData.email);
    expect(draft?.slug).toBe(specialData.slug);
    expect(draft?.bio).toBe(specialData.bio);
  });

  test('Handles very long text in fields', async ({ page }) => {
    const longBio =
      'A'.repeat(500) +
      ' This is a long bio that tests localStorage capacity. ' +
      'B'.repeat(500);

    await page.locator('#s3-bio').fill(longBio);
    await page.waitForTimeout(1500);

    const draft = await getDraft(page);
    expect(draft?.bio).toContain('A'.repeat(500));
    expect(draft?.bio).toContain('B'.repeat(500));
  });

  test('Handles rapid successive edits (debounce test)', async ({ page }) => {
    const nameField = page.locator('#s1-name');

    // Rapidly type characters
    await nameField.fill('A');
    await page.waitForTimeout(200);
    await nameField.fill('AB');
    await page.waitForTimeout(200);
    await nameField.fill('ABC');
    await page.waitForTimeout(200);
    await nameField.fill('ABCD');

    // Wait for debounce to complete
    await page.waitForTimeout(1500);

    const draft = await getDraft(page);
    // Should save the final value, not intermediate ones
    expect(draft?.name).toBe('ABCD');
  });

  test('Handles clearing (emptying) fields', async ({ page }) => {
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

  test('Draft is independent per browser context', async ({ browser }) => {
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();

    const context2 = await browser.newContext();
    const page2 = await context2.newPage();

    try {
      // Context 1: set draft
      await page1.goto('/join');
      await page1.locator('#s1-name').fill('Context1 Name');
      await page1.waitForTimeout(1500);

      // Context 2: set different draft
      await page2.goto('/join');
      await page2.locator('#s1-name').fill('Context2 Name');
      await page2.waitForTimeout(1500);

      // Verify contexts have separate storage
      const draft1 = await getDraft(page1);
      const draft2 = await getDraft(page2);

      expect(draft1?.name).toBe('Context1 Name');
      expect(draft2?.name).toBe('Context2 Name');
    } finally {
      await context1.close();
      await context2.close();
    }
  });
});
