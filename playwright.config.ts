import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 10000,
  outputDir: 'test-results',
  use: {
    baseURL: 'https://danielherdenez-site.vercel.app',
    browserName: 'chromium',
    screenshot: 'only-on-failure',
    viewport: { width: 1280, height: 800 },
  },
});
