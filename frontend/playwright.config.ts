import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: './tests/results',
  timeout: 15_000,
  retries: 0,
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        launchOptions: {
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
      },
    },
  ],
  use: {
    baseURL: 'http://127.0.0.1:3000',
    screenshot: 'on',
    trace: 'retain-on-failure',
    viewport: { width: 1400, height: 900 },
    actionTimeout: 5000,
    navigationTimeout: 10000,
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 3000',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: true,
    timeout: 20_000,
  },
  reporter: [['list']],
});
