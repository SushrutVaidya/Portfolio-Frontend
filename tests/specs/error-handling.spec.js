// Form validation + graceful error handling under simulated backend failure.

const { test, expect } = require('@playwright/test');

const API = process.env.API || 'http://localhost:8081';

async function openModal(page) {
  await page.click('#enter-devquest');
  await page.locator('#first-name-input').waitFor({ state: 'visible', timeout: 5_000 });
}

test.describe('Backend outage handling', () => {
  test('landing page does NOT crash if register POST fails', async ({ page, context }) => {
    // Intercept POST /api/user and return 500.
    await context.route(/\/api\/user(\?|$)/, r => r.fulfill({
      status: 500, contentType: 'application/json',
      body: JSON.stringify({ error: 'simulated outage' })
    }));

    const stamp = Math.floor(Math.random() * 1e9).toString(36);
    await page.goto('/devquest/landing.html');
    await openModal(page);
    await page.fill('#first-name-input', 'Fail' + stamp.slice(0, 4));
    await page.fill('#last-name-input',  'TestUser');

    const errors = [];
    page.on('pageerror', e => errors.push(e.message));

    // landing.js treats register as non-blocking — even on 500 it navigates.
    // The important assertion is that we don't crash the JS runtime.
    await page.click('#modal-start');
    await page.waitForURL(/captcha\.html/, { timeout: 5_000 });
    expect(errors).toHaveLength(0);
  });

  test('leaderboard renders when API is down (no UI crash)', async ({ page, context }) => {
    await context.route(/\/api\/leaderboard/, r => r.abort('failed'));

    const errors = [];
    page.on('pageerror', e => errors.push(e.message));

    await page.goto('/devquest/test/leaderboard.html');
    await page.waitForTimeout(1500);
    // The page shell must render even if leaderboard fetch failed.
    await expect(page.locator('#register-btn')).toBeVisible();
    expect(errors).toHaveLength(0);
  });

  test('card-experiments handles a 429 gracefully', async ({ page, context }) => {
    await context.route(/\/api\/user\/[^/]+\/card/, r => r.fulfill({
      status: 429, contentType: 'application/json',
      body: JSON.stringify({ message: 'slow down' }),
    }));

    const errors = [];
    page.on('pageerror', e => errors.push(e.message));

    await page.goto('/devquest/test/card-experiments.html');
    await page.waitForTimeout(1500);
    expect(errors).toHaveLength(0);
  });
});

test.describe('Auth token flow — X-DQ-Token header', () => {
  test('mutating fetches include X-DQ-Token', async ({ page }) => {
    // Seed a fresh user via direct API to get id+token.
    const stamp = Math.floor(Math.random() * 1e9).toString(36);
    const reg = await page.request.post(API + '/api/user', {
      data: { firstName: 'Hdr' + stamp.slice(0, 4), lastName: 'TestU' + stamp.slice(0, 4) },
    });
    const body = await reg.json();
    expect(body.token).toBeTruthy();

    const sentTokens = [];
    page.on('request', req => {
      const h = req.headers();
      if (h['x-dq-token']) sentTokens.push({ url: req.url(), token: h['x-dq-token'] });
    });

    // Seed localStorage BEFORE FE JS runs then reload so init() sees it.
    await page.goto('/devquest/test/card-experiments.html');
    await page.evaluate(seed => {
      localStorage.setItem('dq-user-id',      seed.id);
      localStorage.setItem('dq-user-token',   seed.token);
      localStorage.setItem('dq-player-first', seed.firstName);
      localStorage.setItem('dq-player-last',  seed.lastName);
    }, body);
    await page.reload();

    // Card-experiments.html has an editor panel that overlaps the button
    // stack when collapsed. Force-click bypasses the pointer-events
    // intercept — we still trigger the same onclick handler.
    const btnSave = page.locator('#btnSave');
    if (!(await btnSave.count())) test.skip(true, 'save button not found');
    await btnSave.click({ force: true });
    await page.waitForTimeout(1500);

    const put = sentTokens.find(t => t.url.includes('/card') && t.token === body.token);
    expect(put, 'PUT /card should send X-DQ-Token equal to the stored token').toBeTruthy();
  });
});
