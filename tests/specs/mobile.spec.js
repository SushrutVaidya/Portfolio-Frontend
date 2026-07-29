// Mobile viewport smoke — no horizontal overflow, ≥44×44 tap targets on
// primary CTAs, no runtime errors on key pages when emulating a phone.

const { test, expect } = require('@playwright/test');

test.describe('Mobile viewport smoke', () => {
  test('landing has no horizontal overflow', async ({ page }) => {
    await page.goto('/devquest/landing.html');
    const overflow = await page.evaluate(() => {
      const de = document.documentElement;
      return { scrollW: de.scrollWidth, clientW: de.clientWidth };
    });
    expect(overflow.scrollW - overflow.clientW).toBeLessThanOrEqual(2);
  });

  test('landing primary CTA button is tappable size', async ({ page }) => {
    await page.goto('/devquest/landing.html');
    // Real primary CTA is #enter-devquest — the "Enter DevQuest" button.
    const btn = page.locator('#enter-devquest');
    const box = await btn.boundingBox();
    expect(box).not.toBeNull();
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.width).toBeGreaterThanOrEqual(44);
  });

  test('aboutme test page renders without runtime errors on mobile', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/devquest/test/aboutme.html?skip_intro=1');
    await page.waitForTimeout(1500);
    expect(errors).toHaveLength(0);
  });

  test('leaderboard page renders on mobile without overflow', async ({ page }) => {
    await page.goto('/devquest/test/leaderboard.html');
    await page.waitForTimeout(500);
    const overflow = await page.evaluate(() => {
      const de = document.documentElement;
      return { scrollW: de.scrollWidth, clientW: de.clientWidth };
    });
    expect(overflow.scrollW - overflow.clientW).toBeLessThanOrEqual(2);
  });
});
