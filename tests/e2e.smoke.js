// DevQuest E2E smoke — runs against localhost
// Usage: node /tmp/devquest-e2e/test.js
const { chromium } = require('playwright');

const FRONT = process.env.FRONT || 'http://localhost:8080';
const API = process.env.API || 'http://localhost:8081';

const results = [];
const PASS = (name, detail) => { console.log(`✅ ${name}${detail ? ' — ' + detail : ''}`); results.push({ ok: true, name }); };
const FAIL = (name, err) => { console.log(`❌ ${name} — ${err}`); results.push({ ok: false, name, err }); };

(async () => {
  const browser = await chromium.launchPersistentContext('/tmp/devquest-e2e/chrome-profile', {
    channel: 'chrome',
    headless: true,
    viewport: { width: 1400, height: 900 },
    args: ['--no-sandbox'],
  });
  const ctx = browser; // persistent context IS the context
  const failed404s = [];
  const allRequests = [];
  // Attach BOTH request + response listeners — catch network-level fails too
  ctx.on('page', p => {
    p.on('response', r => { if (r.status() === 404) failed404s.push(r.url()); });
    p.on('requestfailed', r => failed404s.push('REQFAIL: ' + r.url() + ' (' + (r.failure()?.errorText || 'unknown') + ')'));
  });
  const page = await ctx.newPage();

  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push('PAGEERROR: ' + e.message));
  page.on('response', r => {
    allRequests.push(r.status() + ' ' + r.url());
    if (r.status() === 404) failed404s.push(r.url());
  });
  page.on('requestfailed', r => failed404s.push('REQFAIL: ' + r.url() + ' (' + (r.failure()?.errorText || 'unknown') + ')'));

  // ── ABOUT ME PAGE ──────────────────────────────────────
  try {
    await page.goto(`${FRONT}/devquest/test/aboutme.html?skip_intro=1`, { waitUntil: 'networkidle', timeout: 15000 });
    PASS('aboutme.html loads');
  } catch (e) { FAIL('aboutme.html loads', e.message); }

  // 1. Title rendered
  try {
    const title = await page.title();
    if (title && title.toLowerCase().includes('about')) PASS('aboutme title', title);
    else FAIL('aboutme title', `got "${title}"`);
  } catch (e) { FAIL('aboutme title', e.message); }

  // 2. Hero name visible
  try {
    const heroVisible = await page.locator('.gta-hero-name').first().isVisible({ timeout: 5000 });
    if (heroVisible) PASS('hero name visible');
    else FAIL('hero name visible', 'not visible');
  } catch (e) { FAIL('hero name visible', e.message); }

  // 3. Scroll to TV section
  try {
    await page.locator('#tv-screen').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500); // let observers fire
    PASS('TV section scrolled into view');
  } catch (e) { FAIL('TV section scrolled into view', e.message); }

  // 4. TV video has src loaded and is playing
  try {
    const tvInfo = await page.evaluate(() => {
      const v = document.getElementById('tv-video');
      if (!v) return { error: 'no element' };
      return {
        hasSrc: !!v.src,
        srcEnd: v.src.split('/').pop(),
        paused: v.paused,
        ended: v.ended,
        readyState: v.readyState,
        currentTime: v.currentTime,
        muted: v.muted,
        autoplay: v.autoplay,
      };
    });
    if (tvInfo.error) FAIL('TV video element', tvInfo.error);
    else if (!tvInfo.hasSrc) FAIL('TV video src loaded', `paused=${tvInfo.paused}, readyState=${tvInfo.readyState}`);
    else PASS('TV video state', `src=${tvInfo.srcEnd} paused=${tvInfo.paused} muted=${tvInfo.muted} t=${tvInfo.currentTime.toFixed(2)}s`);

    // Wait a beat then check it actually advanced
    if (tvInfo.hasSrc && !tvInfo.paused) {
      const t1 = tvInfo.currentTime;
      await page.waitForTimeout(2000);
      const t2 = await page.evaluate(() => document.getElementById('tv-video').currentTime);
      if (t2 > t1 + 0.5) PASS('TV video is actually playing', `t went ${t1.toFixed(2)} → ${t2.toFixed(2)}`);
      else FAIL('TV video is actually playing', `t stuck at ${t1.toFixed(2)} → ${t2.toFixed(2)}`);
    }
  } catch (e) { FAIL('TV video check', e.message); }

  // 5. Channel knob switches video
  try {
    const before = await page.evaluate(() => document.getElementById('tv-video').src.split('/').pop());
    await page.locator('#tv-prev').click();
    await page.waitForTimeout(1500);
    const after = await page.evaluate(() => document.getElementById('tv-video').src.split('/').pop());
    if (before !== after) PASS('Channel knob switches video', `${before} → ${after}`);
    else FAIL('Channel knob switches video', `still ${before}`);
  } catch (e) { FAIL('Channel knob switches video', e.message); }

  // 6. Jukebox pill exists
  try {
    const jb = await page.locator('#jb-pill').isVisible();
    if (jb) PASS('Jukebox pill visible');
    else FAIL('Jukebox pill visible', 'not visible');
  } catch (e) { FAIL('Jukebox pill visible', e.message); }

  // 7. Click jukebox to expand, click play
  try {
    await page.locator('#jb-pill').click();
    await page.waitForTimeout(500);
    const expanded = await page.locator('#jukebox.expanded').count();
    if (expanded > 0) PASS('Jukebox expands on click');
    else FAIL('Jukebox expands on click', 'no .expanded class');

    // Click play
    await page.locator('#jb-play').click();
    await page.waitForTimeout(1000);
    // Verify audio element exists and has src
    const audioState = await page.evaluate(() => {
      // The audio element is private to initJukebox closure; we can't access directly.
      // Instead check the play button toggled to pause icon
      const btn = document.getElementById('jb-play');
      return { icon: btn?.textContent };
    });
    if (audioState.icon === '⏸') PASS('Jukebox play button toggled to pause');
    else FAIL('Jukebox play button toggled to pause', `icon="${audioState.icon}"`);
  } catch (e) { FAIL('Jukebox interaction', e.message); }

  // ── CARD EXPERIMENTS ─────────────────────────────────
  try {
    await page.goto(`${FRONT}/devquest/test/card-experiments.html`, { waitUntil: 'networkidle', timeout: 15000 });
    PASS('card-experiments.html loads');
  } catch (e) { FAIL('card-experiments.html loads', e.message); }

  // 8. 9 card styles visible
  try {
    await page.waitForSelector('.badge', { timeout: 5000 });
    const count = await page.locator('.badge').count();
    if (count === 9) PASS(`9 card styles render (got ${count})`);
    else FAIL('9 card styles render', `expected 9, got ${count}`);
  } catch (e) { FAIL('9 card styles render', e.message); }

  // 9. OVR badges present on at least one card
  try {
    const ovrCount = await page.locator('[class*="ovr-val"]').count();
    if (ovrCount >= 5) PASS(`OVR badges render across cards (${ovrCount} sites)`);
    else FAIL('OVR badges render', `only ${ovrCount} ovr-val elements found`);
  } catch (e) { FAIL('OVR badges', e.message); }

  // 10. Sticky CTA shows
  try {
    await page.waitForTimeout(2000); // 1.2s reveal + buffer
    const cta = await page.locator('#stickyCTA.visible').count();
    if (cta > 0) PASS('Sticky CTA appears after delay');
    else {
      const exists = await page.locator('#stickyCTA').count();
      FAIL('Sticky CTA appears after delay', `element ${exists ? 'exists but not .visible' : 'missing'}`);
    }
  } catch (e) { FAIL('Sticky CTA', e.message); }

  // 11. Sticky CTA click scrolls to print section
  try {
    await page.locator('#stickyCTA').click();
    await page.waitForTimeout(1200);
    // Use boundingBox + viewport size instead of isInViewport (older Playwright)
    const inView = await page.evaluate(() => {
      const ps = document.getElementById('printSection');
      const r = ps.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0;
    });
    if (inView) PASS('Sticky CTA scrolls to print section');
    else FAIL('Sticky CTA scrolls to print section', 'print section not in viewport');
  } catch (e) { FAIL('Sticky CTA scroll', e.message); }

  // 12. XSS escape — try injecting in classRole, verify it's escaped
  try {
    // First create a fresh user
    const reg = await page.evaluate(async (api) => {
      const r = await fetch(api + '/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: 'XssTest', lastName: 'User' })
      });
      return r.json();
    }, API);

    // PUT malicious classRole
    const put = await page.evaluate(async (args) => {
      const r = await fetch(`${args.api}/api/user/${args.id}/card`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classRole: '<img src=x onerror="window.XSS_FIRED=true">' })
      });
      return r.status;
    }, { api: API, id: reg.id });

    if (put !== 200) { FAIL('XSS payload PUT', 'status ' + put); }
    else {
      // Load card with that data — go via ?id= URL
      await page.goto(`${FRONT}/devquest/test/card-experiments.html?id=${reg.id}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
      const xssFired = await page.evaluate(() => !!window.XSS_FIRED);
      if (xssFired) FAIL('XSS escape', '🚨 XSS PAYLOAD FIRED — escape broken!');
      else PASS('XSS escape — payload neutralized');
    }
  } catch (e) { FAIL('XSS escape test', e.message); }

  // ── LEADERBOARD ─────────────────────────────────────
  try {
    await page.goto(`${FRONT}/devquest/test/leaderboard.html`, { waitUntil: 'networkidle' });
    PASS('leaderboard.html loads');

    await page.waitForTimeout(1500);
    const rows = await page.locator('.lb-row, .podium-item').count();
    if (rows > 0) PASS(`Leaderboard rows render (${rows} total)`);
    else FAIL('Leaderboard rows render', '0 rows');
  } catch (e) { FAIL('Leaderboard load', e.message); }

  // ── BACKEND API SMOKE ───────────────────────────────
  for (const path of ['/api/stats', '/api/leaderboard', '/api/jukebox/tracks', '/api/print-request/count']) {
    try {
      const r = await page.evaluate(async (u) => {
        const res = await fetch(u);
        return { status: res.status, ok: res.ok };
      }, API + path);
      if (r.ok) PASS(`GET ${path}`, `${r.status}`);
      else FAIL(`GET ${path}`, `${r.status}`);
    } catch (e) { FAIL(`GET ${path}`, e.message); }
  }

  // ── CONSOLE NOISE ───────────────────────────────────
  if (consoleErrors.length === 0) PASS('No console errors during run');
  else {
    console.log(`\n⚠️  Console errors during run (${consoleErrors.length}):`);
    consoleErrors.slice(0, 10).forEach(e => console.log('   - ' + e.slice(0, 200)));
  }
  console.log(`\n🔍 404 URLs captured (${failed404s.length}):`);
  if (failed404s.length === 0) {
    console.log('   (none — console error may be from a different source)');
    // Last resort: dump all 4xx/5xx from response log
    const errs = allRequests.filter(r => /^[45]/.test(r));
    if (errs.length) {
      console.log('\n   All 4xx/5xx responses seen:');
      errs.slice(0, 20).forEach(e => console.log('   - ' + e));
    }
  }
  else failed404s.slice(0, 20).forEach(u => console.log('   - ' + u));

  // ── SUMMARY ─────────────────────────────────────────
  const pass = results.filter(r => r.ok).length;
  const fail = results.filter(r => !r.ok).length;
  console.log(`\n${'='.repeat(50)}`);
  console.log(`RESULT: ${pass} PASS, ${fail} FAIL`);
  console.log('='.repeat(50));

  await browser.close();
  process.exit(fail > 0 ? 1 : 0);
})();
