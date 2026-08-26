// Playwright config — DevQuest E2E.
//
// Runs two projects (chromium + firefox) against a running local stack.
// Assumes:
//   FRONT   = http://localhost:8080   (frontend container or python http.server)
//   API     = http://localhost:8081   (Spring backend)
//   or override via env when you're on the nginx-proxy port 8888.
//
// The tests do NOT start the backend automatically — spin the stack up
// with `docker compose up -d` from Portfolio-Backend/ before running.
//
// npm run test:e2e            → run both browsers headless
// npm run test:e2e:headed     → watch it click through
// npm run test:e2e:report     → open the HTML report

const { defineConfig, devices } = require('@playwright/test');

const FRONT = process.env.FRONT || 'http://localhost:8080';
const API   = process.env.API   || 'http://localhost:8081';

module.exports = defineConfig({
  testDir: './specs',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,   // FE has some shared-state operations; serialize
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL: FRONT,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Custom fixture data — every spec pulls FRONT+API from here.
    extraHTTPHeaders: { Accept: 'application/json,text/html' },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      // Mobile viewport smoke — portfolio sites get opened on phones.
      // Uses Pixel 5 (Chromium-based Android emulation) so `npm run
      // install:browsers` covers it — iPhone 13 would need WebKit,
      // which is an extra ~150MB download for one project.
      name: 'mobile-chromium',
      use: { ...devices['Pixel 5'] },
      testMatch: /mobile\.spec\.js$/,   // only mobile-specific tests here
    },
  ],
});

// Expose these for spec files
module.exports.FRONT = FRONT;
module.exports.API   = API;
