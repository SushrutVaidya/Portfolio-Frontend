import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

/**
 * Screenshot harness — the feedback loop.
 *
 * I (Claude) can't open a browser in my sandbox: bind() is blocked, so headless
 * Chrome can't create its process-singleton socket and Playwright can't download
 * its own chromium. But you have Google Chrome installed, and Playwright will
 * drive it directly via channel:'chrome' — no download needed.
 *
 * So you run this in your own terminal, it drops PNGs in tests/shots/, and I
 * read them. One run replaces the manual screenshot-and-paste loop and covers
 * the states I keep asking about: each chapter, mobile, the case study, and the
 * nav overlay open.
 *
 * Usage (dev server must be running on 5173):
 *   cd tests && node shots.mjs
 *   cd tests && node shots.mjs http://localhost:4173     # against a prod preview
 */

const BASE = process.argv[2] ?? 'http://localhost:5173'
const OUT = new URL('./shots/', import.meta.url).pathname

// The chapters, in order. Ids match content/chapters.ts + the intro/project frames.
const SECTIONS = ['intro', 'now', 'work', 'playground', 'practice', 'stack', 'patent', 'contact']

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch({ channel: 'chrome' })

async function shoot(label, { width, height, path, actions }) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2, // retina, so type rendering is judged at real fidelity
  })
  const page = await ctx.newPage()
  // domcontentloaded, not networkidle: the page has a looping animation (the
  // Forge ritual) and lazy GIFs, so the network never goes fully idle and
  // networkidle would time out. The fixed wait below covers settle.
  await page.goto(path, { waitUntil: 'domcontentloaded' })
  // Let the preloader (1.2s) clear and entrance animations settle.
  await page.waitForTimeout(2600)
  if (actions) await actions(page)
  await page.screenshot({ path: `${OUT}${label}.png`, fullPage: !actions })
  console.log(`  ${label}.png`)
  await ctx.close()
}

console.log(`Shooting ${BASE} …`)

// Full desktop page, top to bottom.
await shoot('desktop-full', { width: 1512, height: 945, path: BASE })

// Each chapter, framed on its own at desktop size.
for (const id of SECTIONS) {
  await shoot(`desktop-${id}`, {
    width: 1512,
    height: 945,
    path: `${BASE}/#${id}`,
    actions: async (page) => {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded()
      await page.waitForTimeout(700)
    },
  })
}

// Nav overlay open — the chapter register.
await shoot('desktop-nav-open', {
  width: 1512,
  height: 945,
  path: BASE,
  actions: async (page) => {
    await page.getByRole('button', { name: /index/i }).click()
    await page.waitForTimeout(900)
  },
})

// Hover overlay — hover the "hyderabad" trigger in the Now frame and hold, so I
// can finally see the plate sized and placed against real text.
await shoot('desktop-hover', {
  width: 1512,
  height: 945,
  path: `${BASE}/#now`,
  actions: async (page) => {
    await page.locator('#now').scrollIntoViewIfNeeded()
    await page.waitForTimeout(600)
    const trigger = page.locator('#now [data-hover-trigger]').first()
    await trigger.hover()
    await page.waitForTimeout(1200)
  },
})

// A case study, on the same primitives as home.
await shoot('desktop-case-study', { width: 1512, height: 945, path: `${BASE}/work/devquest` })

// The loglens product page (long, full-page capture).
await shoot('desktop-loglens', { width: 1512, height: 945, path: `${BASE}/loglens` })

// The About Me page (long, full-page capture).
await shoot('desktop-about', { width: 1512, height: 945, path: `${BASE}/about` })
await shoot('mobile-about', { width: 390, height: 844, path: `${BASE}/about` })

// Mobile: full page + the two frames most likely to break at 390px.
await shoot('mobile-full', { width: 390, height: 844, path: BASE })
for (const id of ['intro', 'now', 'contact']) {
  await shoot(`mobile-${id}`, {
    width: 390,
    height: 844,
    path: `${BASE}/#${id}`,
    actions: async (page) => {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded()
      await page.waitForTimeout(700)
    },
  })
}

await browser.close()
console.log(`\nDone → tests/shots/  — tell Claude to read them.`)
