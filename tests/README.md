# DevQuest E2E test suite

Two complementary suites live here:

## 1. `e2e.smoke.js` — standalone script

Original hand-rolled Playwright script. Fast, standalone, human-readable
output. Drives real Chrome through the full app.

```bash
cd tests
npm install
node ./e2e.smoke.js
# or
npm run test:smoke
```

Against a deployed env:

```bash
FRONT=https://sushrutvaidya.in API=https://sushrutvaidya.in npm run test:smoke
```

What it covers:

| Section | Checks |
|---|---|
| About page | loads, hero visible, TV scrolled into view |
| TV | video has src loaded, `currentTime` advances (proves not frozen), channel knob switches video |
| Jukebox | pill visible, expands on click, play button toggles |
| Card editor | all 9 styles render, OVR badges present (≥6 sites), sticky CTA appears + scrolls |
| **XSS escape** | injects `<img onerror>` payload via API, verifies it does NOT fire on render |
| Leaderboard | loads, rows render |
| Backend API | stats, leaderboard, jukebox tracks, print count all return 200 |

Last known-good: 2026-06-17 — 22/22 PASS, zero console errors.

## 2. `specs/` — Playwright test-runner suite

`@playwright/test`-driven suite. Runs Chromium + Firefox in parallel
projects, produces an HTML report, integrates cleanly with CI.

```bash
cd tests
npm install
npm run install:browsers        # one-time: fetches chromium + firefox
npm run test:e2e                # run everything cross-browser
npm run test:e2e:headed         # watch it click through
npm run test:e2e:report         # open the HTML report
```

Spec coverage:

| Spec | Covers |
|---|---|
| `register.spec.js` | Landing register → captcha handoff, token+id in localStorage, short-name validation, 401 on unauth POST /api/score |
| `error-handling.spec.js` | Backend outage (500), leaderboard-fetch abort, 429 on card PUT — UI must not crash. Also asserts the FE actually sends `X-DQ-Token` on mutating fetches |
| `mobile.spec.js` | iPhone-13 viewport: no horizontal overflow, ≥44px tap targets, no console errors on aboutme + leaderboard |
| `security.spec.js` | Actuator `/health` doesn't leak component details, X-Request-Id is echoed and log-injection is rejected, `<script>`/`<svg onload>` payloads in card fields are escaped |

## Assumptions

Neither suite starts the backend. Bring the stack up first:

```bash
cd /path/to/Portfolio-Backend
docker compose up -d postgres portfolio-backend portfolio-frontend
```

Override URLs for the nginx-proxy on `:8888`:

```bash
FRONT=http://localhost:8888 API=http://localhost:8888 npm run test:e2e
```

## Screenshot / visual regression

Deliberately NOT included. Pixel-diff tests on a small solo project add
more flakiness than value — every font-loading or DPR quirk becomes a
failing test. If ever needed, wire in Percy or Playwright's built-in
visual comparisons then, with a clear baseline-refresh workflow.

## CI wiring

Not wired to GitHub Actions in this repo. To wire up: workflow that

1. `docker compose up -d --wait` from `Portfolio-Backend/`
2. Wait for `curl http://localhost:8081/actuator/health` returning 200
3. `cd tests && npm install && npm run install:browsers && npm run test:e2e`
4. Upload `playwright-report/` as an artifact
