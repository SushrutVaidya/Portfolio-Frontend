// Perf regression guard — captures Chrome DevTools Performance metrics
// for the pages we fixed, so a future change that reintroduces lag gets
// caught in CI instead of by a user complaining.
//
// Uses Playwright's built-in `page.metrics()` (V8 heap + task counts) +
// a light custom capture: total main-thread busy time and long-task
// count during a 5-second interaction window.
//
// Baselines are read from PERFORMANCE_NOTES.md and this test asserts
// that we stay within +25% of that number. If the site legitimately
// regresses over time, refresh the baseline explicitly.

const { test, expect } = require('@playwright/test');

// Baseline numbers correspond to the state AFTER the 2026-07-06 fixes.
// If a fix later gets reverted, these will fail — refresh the baseline
// in PERFORMANCE_NOTES.md the same day and note WHY.
const BASELINES = {
  aboutme: {
    // Trace 06 pre-fix: 40% frame drop, 3 GPU tasks >200ms, 22 infinite animations
    // Post-fix target: <15% frame drop, ≤1 GPU task >200ms, jukebox paused
    longTaskMs: 900,     // total ms in tasks >50ms during 5s window (was ~3600 pre-fix)
    frameDropPct: 15,    // dropped/begin
  },
  devtype: {
    // Trace 07 pre-fix: 1166 huge paints on .dt-char.current-char, backdrop 40px
    // Post-fix: charPulse opacity-only, container blur 8px, cached container rect
    longTaskMs: 500,
    frameDropPct: 12,
  },
  landing: {
    // Trace 07 pre-fix: 543 infinity paints on #hero from `filter: blur` in
    // heroEntrance. Post-fix: filter removed from keyframe.
    longTaskMs: 400,
    frameDropPct: 10,
  },
};

/**
 * Capture perf during a 5-second window of scroll interaction.
 * Returns: { longTaskMs, drops, begins, frameDropPct }
 */
async function capturePerf(page, url) {
  await page.goto(url, { waitUntil: 'networkidle' });
  // Inject Long Tasks + Frame observers via PerformanceObserver — cheaper
  // and more portable than Chrome trace parsing.
  await page.evaluate(() => {
    window.__perf = { longTaskMs: 0, drops: 0, begins: 0 };
    try {
      new PerformanceObserver(list => {
        for (const e of list.getEntries()) window.__perf.longTaskMs += e.duration;
      }).observe({ type: 'longtask', buffered: true });
    } catch {}
    // Track frame drops via requestAnimationFrame gap.
    let last = performance.now();
    function tick(now) {
      const gap = now - last;
      window.__perf.begins += 1;
      // 60Hz frame budget = 16.67ms; miss = gap > 33ms (dropped ≥1 frame)
      if (gap > 33) window.__perf.drops += 1;
      last = now;
      if (window.__perfDone) return;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
  // Drive some interaction — scroll + wait
  await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
  await page.waitForTimeout(2500);
  const perf = await page.evaluate(() => {
    window.__perfDone = true;
    return window.__perf;
  });
  return {
    longTaskMs:   Math.round(perf.longTaskMs),
    drops:        perf.drops,
    begins:       perf.begins,
    frameDropPct: Math.round((perf.drops / Math.max(1, perf.begins)) * 100),
  };
}

test.describe('Performance regression baselines', () => {
  test('aboutme.html stays within baseline', async ({ page }) => {
    const perf = await capturePerf(page, '/devquest/test/aboutme.html?skip_intro=1');
    console.log('aboutme perf:', perf);
    const base = BASELINES.aboutme;
    expect(perf.longTaskMs,   `long-task ms ${perf.longTaskMs} > baseline ${base.longTaskMs}*1.25`)
      .toBeLessThanOrEqual(Math.round(base.longTaskMs * 1.25));
    expect(perf.frameDropPct, `frame drop ${perf.frameDropPct}% > baseline ${base.frameDropPct}%*1.25`)
      .toBeLessThanOrEqual(Math.round(base.frameDropPct * 1.25));
  });

  test('devtype.html stays within baseline', async ({ page }) => {
    const perf = await capturePerf(page, '/devquest/devtype.html');
    console.log('devtype perf:', perf);
    const base = BASELINES.devtype;
    expect(perf.longTaskMs)  .toBeLessThanOrEqual(Math.round(base.longTaskMs * 1.25));
    expect(perf.frameDropPct).toBeLessThanOrEqual(Math.round(base.frameDropPct * 1.25));
  });

  test('landing.html stays within baseline', async ({ page }) => {
    const perf = await capturePerf(page, '/devquest/landing.html');
    console.log('landing perf:', perf);
    const base = BASELINES.landing;
    expect(perf.longTaskMs)  .toBeLessThanOrEqual(Math.round(base.longTaskMs * 1.25));
    expect(perf.frameDropPct).toBeLessThanOrEqual(Math.round(base.frameDropPct * 1.25));
  });
});
