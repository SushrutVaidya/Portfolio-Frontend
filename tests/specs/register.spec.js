// Registration + card save + score submit — the critical happy paths.
//
// Real landing flow (confirmed from the DOM):
//   1. Click #enter-devquest → modal opens
//   2. Fill #first-name-input, #last-name-input
//   3. Click #modal-start → POST /api/user → navigate to captcha.html

const { test, expect } = require('@playwright/test');

const API = process.env.API || 'http://localhost:8081';

// Wait for the modal to actually be interactable (has a CSS transition).
async function openModal(page) {
  await page.click('#enter-devquest');
  // Modal backdrop has a fade-in — wait for the first input to be usable.
  await page.locator('#first-name-input').waitFor({ state: 'visible', timeout: 5_000 });
}

test.describe('Registration flow', () => {
  test('landing page registers a new user and stores id + token', async ({ page }) => {
    const stamp = Math.floor(Math.random() * 1e9).toString(36);
    const first = 'Pw' + stamp.slice(0, 6);
    const last  = 'Test' + stamp.slice(0, 6);

    await page.goto('/devquest/landing.html');
    await openModal(page);
    await page.fill('#first-name-input', first);
    await page.fill('#last-name-input',  last);
    await page.click('#modal-start');
    await page.waitForURL(/captcha\.html/);

    const stored = await page.evaluate(() => ({
      id:    localStorage.getItem('dq-user-id'),
      token: localStorage.getItem('dq-user-token'),
      first: localStorage.getItem('dq-player-first'),
    }));
    expect(stored.id).toMatch(/^[0-9a-f-]{36}$/i);
    expect(stored.token).not.toBeNull();
    expect(stored.first).toBe(first);
  });

  test('short name keeps the modal open (does NOT submit)', async ({ page }) => {
    await page.goto('/devquest/landing.html');
    await openModal(page);
    await page.fill('#first-name-input', 'X');       // < 2 chars
    await page.fill('#last-name-input',  'Yy');

    // landing.js disables #modal-start until both fields are >= 2 chars.
    // Force-click to bypass the disabled state, then assert we DID NOT navigate.
    await page.locator('#modal-start').click({ force: true }).catch(() => {});
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/landing\.html/);
    await expect(page.locator('#first-name-input')).toBeVisible();
  });
});

test.describe('Score submit path', () => {
  test('POST /api/score without token returns 401', async ({ request }) => {
    const res = await request.post(API + '/api/score', {
      data: {
        userId:   '00000000-0000-0000-0000-000000000000',
        wpm:      50,
        accuracy: 90,
      },
      failOnStatusCode: false,
    });
    expect(res.status()).toBe(401);
  });
});
