import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  reporter: 'list',
  projects: [
    { name: 'desktop' },
    {
      name: 'mobile',
      testMatch: /(auth|equipment|catalog|resilience)\.spec\.ts/,
      use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
  ],
  use: {
    actionTimeout: 10000,
    baseURL: process.env.E2E_BASE_URL || 'http://127.0.0.1:5173',
    ...devices['Desktop Chrome'],
    channel: process.env.E2E_BROWSER || 'msedge',
    screenshot: 'off',
    video: 'off',
    trace: 'off',
  },
})
