import { defineConfig, devices } from '@playwright/test';

/**
 * TrainedBy — Playwright E2E Test Configuration
 * Tests run against the live Netlify deployment by default.
 * Set BASE_URL env var to test against a local dev server.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://trainedby-ae.netlify.app',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
  ],
  // Local dev server (used when BASE_URL is localhost)
  // webServer: {
  //   command: 'pnpm dev',
  //   url: 'http://localhost:4321',
  //   reuseExistingServer: !process.env.CI,
  // },
});
