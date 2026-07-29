# PERFORMANCE_NOTES

Root causes + fixes + before/after numbers for perf work on the DevQuest
frontend. Baselines here are the numbers `tests/specs/perf.spec.js`
asserts against; refresh them alongside any deliberate perf change.

---

## Method

Two-source measurement:

1. **Chrome DevTools Performance trace** — recorded manually via `Cmd-E`
   with the page under real interaction (scroll / typing / hover), then
   the JSON trace analyzed via `jq` for:
   - main-thread CPU busy %
   - GPU tasks > 200ms (compositor stalls)
   - `DroppedFrame` count vs `BeginFrame` count
   - `Paint` events with clip rects at `16777215×16777215` (Chrome's
     infinity marker — usually `filter: drop-shadow` or `filter: blur`
     inflating layer bounds)
   - top repaint-target nodes

2. **In-page Playwright harness** — `tests/specs/perf.spec.js` uses a
   `PerformanceObserver` to count `longtask` entries + a rAF loop to
   count frame drops. Runs during a 5-second scroll window per page.
   Not as precise as a full trace but reliable enough to fail CI when
   things regress by more than 25 %.

---

## Findings + fixes (2026-07-06)

### F1 — `aboutme.html` :: `@keyframes vhsSweep` animated `top` instead of `transform`

- **File:** `devquest/test/css/aboutme-v2.css:1991-1995`
- **Trace 06 evidence:** 1358 full-document paints @ 75/sec inside the
  breadcrumb window. `top` is a layout-triggering property; every
  frame of the 8s infinite loop invalidated style + layout across the
  frame's dirty-rect union.
- **Fix:** Anchor element to `top: 0`, swap the keyframe to
  `transform: translateY(-5px → 0 → var(--vhs-sweep-h, 100vh))`.
  Transform runs on the compositor thread with no layout cost.
- **Expected delta:** ~40 % reduction in full-doc paints during idle
  on this page.

### F2 — `devtype.html` :: `.dt-char.current-char` pulse + container blur

- **Files:** `devquest/css/devtype.css:21-26` (container),
  `devquest/css/devtype.css:528-537` (char animation)
- **Trace 07 evidence:** 1166 paints on `SPAN.dt-char.pending.current-char`
  clipped at 18k×17k (~317 MP each). Root cause was two-fold:
  1. `@keyframes charPulse` animated `border-color` → paint pass every
     frame per character.
  2. `#devtype-container { backdrop-filter: blur(40px) saturate(1.8) }`
     — the 40px per-pixel blur was re-run whenever anything below it
     changed, including the char pulse.
- **Fix:** Animate `opacity` only in `charPulse` (composite-only, no
  paint). Reduce container backdrop-filter to `blur(8px)`. Add
  `will-change: opacity` to the current-char so it gets its own tiny
  compositor layer.
- **Expected delta:** GPU tasks > 200 ms on this page drop close to zero
  during typing.

### F3 — `aboutme.html` :: 5 jukebox animations running always

- **File:** `devquest/test/aboutme.html:652`
- **Trace 06 evidence:** the jukebox widget rendered without `.paused`
  class, so `vinylSpin`, `pillMarquee`, `eqPixel` (× N bars),
  `marqueeScroll`, and the mini-eq animations all ran continuously
  even when audio wasn't playing. Every one contributed to the
  dirty-rect union that drove the 75 full-doc paints/sec.
- **Fix:** Default the jukebox to `class="am-jukebox paused"` in the
  HTML. Existing `.am-jukebox.paused .am-jb-* { animation-play-state:
  paused }` rules in `aboutme-v2.css:2872–2945` now match on first
  paint. JS still toggles `.paused` on play/pause events.
- **Expected delta:** Idle-scroll paints roughly halve — jukebox
  contribution to full-doc dirty rect is gone until user hits play.

### F4 — `landing.html` :: `filter: blur` inside `heroEntrance` keyframe

- **File:** `devquest/css/landing.css:169-172`
- **Trace 07 evidence:** 543 Paint events on `#hero` with clip
  `16777215×16777215` across three landing visits in the trace.
  `filter: blur(6px)` in the entrance keyframe activated the filter
  compositor path, which reports unbounded paint region.
- **Fix:** Removed the filter from the keyframe. `translateY +
  opacity` alone still reads as a soft entrance.
- **Expected delta:** infinity-paint count on `#hero` at load drops
  to 0.

### F5 — `devtype.js` :: `containerEl.getBoundingClientRect()` twice per keystroke

- **File:** `devquest/js/devtype.js` (autocomplete + floating review
  handlers)
- **Static audit evidence:** four call sites, all in hot per-keystroke
  code paths. Each `getBoundingClientRect()` after any style write
  triggers a synchronous layout pass.
- **Fix:** Introduced `getContRect()` — caches the container rect,
  invalidates on `scroll` / `resize`. Autocomplete + floating review
  both use the cache. Word rect is still re-measured per call (its
  position genuinely changes as the game scrolls the word list).
- **Expected delta:** minor per-keystroke latency drop, especially
  under fast typing. Not visible in the traces we captured, but
  removes an anti-pattern.

---

## Baselines the CI test asserts

The Playwright perf test (`tests/specs/perf.spec.js`) captures
`longtask` totals + frame-drop percentages over a 5-second interaction
window. Baselines below allow up to +25 % headroom before failing —
enough for CI noise, tight enough to catch a real regression.

| Page | Long-task ms baseline | Frame-drop % baseline |
|---|---|---|
| `aboutme.html?skip_intro=1` | 900 | 15 |
| `devtype.html` | 500 | 12 |
| `landing.html` | 400 | 10 |

**Refresh procedure:** if the perf test starts failing after an
intentional feature addition:
1. Re-record a Chrome trace to confirm the new number is legit.
2. Update the value in `BASELINES` at the top of `perf.spec.js`.
3. Add a row under "Findings + fixes" here explaining why.

---

## Backend timing (not audited in this pass — sandbox lacked `curl`)

To close the loop server-side, run these on the host and paste the
results back:

```bash
for path in /api/stats /api/leaderboard /api/jukebox/tracks /api/steam/games /api/print-request/count; do
  printf "%-30s " "$path"
  for i in 1 2 3; do curl -so /dev/null -w "%{time_total}s " "http://localhost:8081$path"; done
  echo
done
```

Anything over 200 ms (excluding first-hit warmup) is suspicious. Steam
call is legitimately network-bound (2 s connect / 5 s read timeout,
cached 1 h via `AtomicReference<CacheEntry>` in `SteamService.java`).

**Result of backend-timing sweep on 2026-07-06** (post-SteamService fix):

| Endpoint | Cold | Warm | OK? |
|---|---|---|---|
| `/api/stats` | ~13 ms | ~2 ms | ✓ |
| `/api/leaderboard` | ~27 ms | ~3 ms | ✓ (JPA first-query warmup on cold) |
| `/api/jukebox/tracks` | ~2 ms | ~2 ms | ✓ (static list) |
| `/api/steam/games` | ~600 ms | ~3 ms | ✓ (was 400ms every call — cache-on-failure fix) |
| `/api/print-request/count` | ~7 ms | ~3 ms | ✓ |

Backend fully passes the "no endpoint over 200ms warm" bar.

---

## Bug-audit pass fixes (2026-07-06, branch `bug-audit-2026-07-06`)

Additional frontend perf fixes beyond the F1-F5 batch above:

### Cursor (`js/cursor.js`, applied to landing/captcha/devtype/incident/index)

- **Before:** `left/top`/`width`/`height`/`margin` transitions on `.is-hover` + rAF loop writing `.style.left/.top`. Trace-1 showed 173 paints at 18k×18k on `.is-hover` cursor elements.
- **After:** All position + scale via `transform: translate3d + scale`. Init runs immediately at script parse (was `DOMContentLoaded` — 2-3s delay on heavy pages).
- **Measured:** Trace-2 → 42 paints, Trace-3 → 22 paints. Total 87% reduction.
- **User complaint:** "3-second cursor lag on page open" → resolved.

### Landing nav-crash (`css/landing.css`)

- **Before:** Trace `20260706T220421` caught 5 GPU tasks 366-392ms in a
  550ms window during `LocalFrame::Navigate`. Peak GPU memory 290MB in the
  tab renderer. Cause: 5 max-texture compositor layers on landing (3 orbs
  with `filter: blur(40)`, header with `backdrop-filter: blur(24)`, plus
  auto-promoted elements) → nav teardown couldn't drain in time.
- **After:** Removed `filter: blur` from orbs entirely (radial-gradient
  stops at transparent — already visually soft). Header backdrop 24→8.
- **User-confirmed:** "works v good" on the exact nav flow that
  previously crashed. Tab now survives every navigation off landing.

### DevType word cursor (`css/devtype.css`)

- **Before:** `.dt-word.current::before { left: var(--cur, 0px) }` — JS
  set `--cur` via `.style.setProperty` on every keystroke, `left` on a
  positioned element triggers layout per input.
- **After:** `left: 0` anchor + `transform: translateX(var(--cur))`.
  Composite-only. Zero visible change, no layout per keystroke.
- **Measured:** Not FPS-verified in isolation (needs a fresh typing-trace
  from user side). Expected impact: reduces the per-input layout pass to
  zero, primarily helps fast typers on lower-end machines.

### Backdrop-filter reductions across the stack

Applied the "high-opacity bg + big blur = wasted shader" pattern to 3
more sites. Summary table:

| Site | Before | After | User-verified? |
|---|---|---|---|
| Captcha container | blur(40) | blur(12) | ✓ (frame drops eliminated on holeAccept) |
| Landing header | blur(24) | blur(8) | ✓ (nav crash gone) |
| Aboutme nav (v2) | blur(14) | blur(8) | ✓ |
| Aboutme prod tab-bar | blur(20) | blur(8) | pending |
| Incident container | blur(40) | blur(10) | pending |
| Incident toast | blur(24) | blur(8) | pending |

Pattern is consistent enough that "backdrop-filter blur >= 20px on a
>= 70% opaque background" should be treated as a code smell.

---

## Motion inconsistency (deferred item, documented for future)

Audit summary — the codebase currently has:
- **148 uses of `ease`** (browser default, generic feel)
- **44 uses of `cubic-bezier(0.16, 1, 0.3, 1)`** (elegant ease-out)
- Duration values scattered: `0.15s / 0.2s / 0.25s / 0.3s / 0.35s / 0.4s / 0.5s` all in circulation

Proposed system (to formalize into `css/tokens.css` when someone picks this up):

```css
:root {
  /* durations */
  --dur-micro:    180ms;   /* hover, active, small feedback */
  --dur-standard: 320ms;   /* cards, modals, page-level  */
  --dur-feature:  480ms;   /* flips, hero reveals, drama */

  /* easings */
  --ease-out:      cubic-bezier(0.16, 1, 0.3, 1);      /* default for most transitions */
  --ease-micro:    cubic-bezier(0.4, 0, 0.2, 1);       /* material-ish, snappy    */
  --ease-spring:   cubic-bezier(0.34, 1.2, 0.64, 1);   /* delightful/feature      */
  /* keep `linear` for infinite marquees/spins */
}
```

Rollout would touch ~200 rules across 8 CSS files. Deferred this pass —
zero measurable perf impact, no user complaint, and the current
inconsistency is invisible unless someone A/B tests two pages side by
side. Pick up if we do a design-system pass later.

