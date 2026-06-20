# DevQuest E2E Smoke Test

Playwright-based smoke test that drives a real Chrome browser through the app.
Catches things curl/static analysis can't — TV video actually playing, jukebox
audio loading, sticky CTA visibility, live XSS payload neutralized, etc.

## Run locally

```bash
# One-time setup
cd tests
npm install playwright
```

Make sure local backend (8081) + frontend (8080) are both running, then:

```bash
node tests/e2e.smoke.js
```

Expected output: `22 PASS, 0 FAIL`.

## Run against deployed environment

```bash
FRONT=https://sushrutvaidya.in API=https://sushrutvaidya.in node tests/e2e.smoke.js
```

## What it tests

| Section | Checks |
|---|---|
| About page | loads, hero visible, TV scrolled into view |
| TV | video has src loaded, currentTime advances (proves not frozen), channel knob switches video |
| Jukebox | pill visible, expands on click, play button toggles |
| Card editor | all 9 styles render, OVR badges present (≥6 sites), sticky CTA appears + scrolls |
| **XSS escape** | injects `<img onerror>` payload via API, verifies it does NOT fire on render |
| Leaderboard | loads, rows render |
| Backend API | stats, leaderboard, jukebox tracks, print count all return 200 |

## When it last passed

2026-06-17 — `22/22 PASS`, zero console errors.
