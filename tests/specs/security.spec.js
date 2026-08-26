// Security surface: XSS escape, security headers, actuator lock-down.

const { test, expect } = require('@playwright/test');

const API   = process.env.API || 'http://localhost:8081';
const FRONT = process.env.FRONT || 'http://localhost:8080';

test.describe('Security headers', () => {
  test('actuator/health does NOT leak component details', async ({ request }) => {
    const res = await request.get(API + '/actuator/health');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('UP');
    // show-details=when-authorized → unauth should NOT see `components`.
    expect(body.components).toBeUndefined();
  });

  test('backend echoes X-Request-Id on every response', async ({ request }) => {
    const res = await request.get(API + '/api/leaderboard');
    const rid = res.headers()['x-request-id'];
    expect(rid).toMatch(/^[A-Za-z0-9._-]{1,64}$/);
  });

  test('unsafe X-Request-Id is rejected and a fresh one issued', async ({ request }) => {
    // Playwright's HTTP client refuses to SEND a header containing raw
    // newlines/quotes (correctly — it protects against header injection
    // upstream). So we exercise the filter's whitelist with a payload
    // that IS sendable but still fails the [A-Za-z0-9._-] pattern.
    // Any of these characters would corrupt a JSON log envelope: spaces,
    // parens, semicolons.
    const unsafe = 'evil id;drop table game_user';
    const res = await request.get(API + '/api/leaderboard', {
      headers: { 'X-Request-Id': unsafe },
    });
    const rid = res.headers()['x-request-id'];
    expect(rid).not.toBe(unsafe);
    expect(rid).toMatch(/^[A-Za-z0-9._-]{1,64}$/);
  });
});

test.describe('XSS escape', () => {
  test('classRole with <script> payload does not execute', async ({ page, request }) => {
    const stamp = Math.floor(Math.random() * 1e9).toString(36);
    const reg = await request.post(API + '/api/user', {
      data: { firstName: 'Xss' + stamp.slice(0, 4), lastName: 'Tst' + stamp.slice(0, 4) },
    });
    const body = await reg.json();

    await request.put(API + '/api/user/' + body.id + '/card', {
      headers: { 'X-DQ-Token': body.token, 'Content-Type': 'application/json' },
      data: {
        classRole: '<img src=x onerror="window.XSS_FIRED=true">',
        bio: '<svg onload="window.XSS_FIRED=true"/>',
      },
    });

    await page.goto(FRONT + '/devquest/test/card-experiments.html?id=' + body.id);
    await page.waitForTimeout(1500);
    const fired = await page.evaluate(() => !!window.XSS_FIRED);
    expect(fired, 'XSS payload should be escaped, not executed').toBe(false);
  });
});
