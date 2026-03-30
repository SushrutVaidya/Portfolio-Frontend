# DevQuest — Interview Concepts & Learnings

> Auto-updated every 5 commits. Last updated: commit `430d5fa`

---

## Table of Contents

1. [Web Audio API](#1-web-audio-api)
2. [CSS — Advanced Techniques](#2-css--advanced-techniques)
3. [JavaScript — Patterns & Performance](#3-javascript--patterns--performance)
4. [Browser Performance Optimisation](#4-browser-performance-optimisation)
5. [Mobile & Cross-Browser Compatibility](#5-mobile--cross-browser-compatibility)
6. [Game Development Concepts](#6-game-development-concepts)
7. [UI/UX Design Systems](#7-uiux-design-systems)
8. [Backend — Spring Boot + Redis](#8-backend--spring-boot--redis)
9. [Git & Project Structure](#9-git--project-structure)

---

## 1. Web Audio API

### What it is
The Web Audio API is a browser-native system for generating, processing and playing audio programmatically — no audio files needed.

### What we built
A complete sound system (`sounds.js`) with:
- Mechanical keyboard clicks
- Typewriter ding + carriage return
- Auto-ducking background music
- Game pass/fail chimes
- Terminal error buzz

### Key concepts

**AudioContext & the lifecycle**
```js
const ctx = new (window.AudioContext || window.webkitAudioContext)();
// Context starts suspended — must be resumed after a user gesture
ctx.resume();
```
> **Interview angle:** "Why does AudioContext start suspended?" — Browser autoplay policy. Audio APIs are blocked until the user interacts with the page to prevent unwanted sound. This is why you always need a user gesture before playing audio on the web.

**Oscillator + GainNode (the building blocks)**
```js
const osc  = ctx.createOscillator(); // generates a waveform
const gain = ctx.createGain();       // controls volume
osc.connect(gain);
gain.connect(ctx.destination);       // destination = speakers
osc.type = 'square'; // sine | square | sawtooth | triangle
osc.frequency.setValueAtTime(880, ctx.currentTime);
gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
osc.start(); osc.stop(ctx.currentTime + 0.3);
```

**Noise generation**
```js
// White noise — fill a buffer with random values
const buf  = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
const data = buf.getChannelData(0);
for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
```

**Auto-ducking (music + SFX mixing)**
> When an SFX fires, instantly lower music volume to 20% of base, then smoothly restore after 680ms.
```js
function duckMusic() {
  musicEl.volume = 0.04; // instant duck
  duckTimer = setTimeout(() => {
    restoreIntvl = setInterval(() => {
      musicEl.volume = Math.min(musicEl.volume + 0.012, 0.2);
    }, 28);
  }, 680);
}
```
> **Interview angle:** "How do games handle music + SFX mixing?" This is exactly how professional audio engines work — ducking is used everywhere from Spotify to game engines like Unity.

**Safari AudioContext unlock (the gotcha)**
Safari requires a silent 1-sample buffer played inside a user gesture to fully unlock audio:
```js
ctx.resume().then(() => {
  const buf = ctx.createBuffer(1, 1, ctx.sampleRate);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.connect(ctx.destination);
  src.start(0); // silent buffer — unlocks Safari
});
```

---

## 2. CSS — Advanced Techniques

### Glassmorphism
```css
background: rgba(28, 28, 30, 0.75);
backdrop-filter: blur(40px) saturate(1.8);
border: 0.5px solid rgba(255, 255, 255, 0.1);
```
> **Interview angle:** `backdrop-filter` applies a visual effect to whatever is *behind* the element. Creates stacking contexts — important to know this when debugging z-index issues.

### CSS Custom Properties for theming
```css
#devtype-container { --accent: #30d158; }
.dt-word.current::before { background: var(--accent); }
```
JS can update it: `containerEl.style.setProperty('--accent', '#ff453a')`
> **Interview angle:** CSS custom properties are live — changing them via JS immediately re-renders everything using that variable. Much more efficient than updating each element individually.

### clip-path for shape masking
```css
#hole-triangle  { clip-path: polygon(50% 8%, 4% 92%, 96% 92%); }
#hole-semicircle { border-radius: 76px 76px 0 0; }
```
> **Interview angle:** `clip-path` masks the visual output of an element to any shape. Importantly: `box-shadow` is also clipped, so use `filter: drop-shadow()` instead for shadows on clipped elements.

### Animated mesh gradient (Apple-style background)
```css
body::before {
  background:
    radial-gradient(ellipse 70% 55% at 15% 25%, rgba(94,92,230,0.22) 0%, transparent 65%),
    radial-gradient(ellipse 55% 70% at 85% 55%, rgba(10,132,255,0.18) 0%, transparent 65%);
  animation: meshShift 20s ease-in-out infinite alternate;
}
```

### Stacking contexts — the z-index gotcha
> Elements with `backdrop-filter`, `transform`, `filter`, or `opacity < 1` create new stacking contexts. This is why z-index between siblings sometimes doesn't work as expected.

**Example from this project:** `#captcha-container` had `backdrop-filter` which created a stacking context. `#box-container` and `#active-shape` inside it compete for z-index within that context — not the global one.

### Spring animations with cubic-bezier
```css
transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
```
The `1.56` overshoot value makes the element "spring" past its target before settling — this is Apple's signature feel.

---

## 3. JavaScript — Patterns & Performance

### IIFE (Immediately Invoked Function Expression) for encapsulation
```js
const DQSounds = window.DQSounds = (() => {
  let ctx = null; // private state
  // ...
  return { /* public API */ };
})();
```
> **Interview angle:** IIFEs create a closure, keeping internal state private while exposing a clean public API. The module pattern — predecessor to ES Modules.

**Why `window.DQSounds` not just `const DQSounds`?**
`const` at the top level of a `<script>` tag does NOT attach to `window`. It's block-scoped to the script. If another script needs to access it, it has to be `window.DQSounds = ...` explicitly.

### DOM caching — avoid repeated queries
```js
// Bad — queries DOM on every game end
document.getElementById('r-loc').textContent = locPerHr;

// Good — cache once at module level
const rLocEl = document.getElementById('r-loc');
rLocEl.textContent = locPerHr;
```
> **Interview angle:** `getElementById` traverses the DOM each time. For elements accessed frequently (especially in game loops or on each keypress), caching avoids unnecessary reflows.

### Avoiding full-document querySelectorAll in hot paths
```js
// Bad — scans entire document on every keypress
document.querySelectorAll('.dt-char.current-char').forEach(el => el.classList.remove('current-char'));

// Good — track previous element
let lastHighlightedChar = null;
function highlightCurrentChar() {
  if (lastHighlightedChar) lastHighlightedChar.classList.remove('current-char');
  // ... find new char, assign to lastHighlightedChar
}
```

### `defer` vs script position
- `<script defer>` in `<head>` — downloads in parallel, executes after HTML is parsed, before `DOMContentLoaded`
- `<script>` at bottom of `<body>` — effectively the same but without parallel download
- Deferred scripts execute in document order — useful for dependency ordering

### localStorage for persistent state
```js
localStorage.setItem('dq-theme', 'dark');
localStorage.getItem('dq-muted') === 'true';
```
> Simple key-value storage that persists across page reloads. Synchronous — don't store large data here.

---

## 4. Browser Performance Optimisation

### Image optimisation — biggest wins
**Before:** 7 × PNG images at 1536×1024px = ~10.5MB total
**After:** Resized to 320×320px = ~280KB total (**37× reduction**)

> **Interview angle:** Always size images to their display size × device pixel ratio. A 160px image at 2× DPR = 320px. Serving 1536px for a 160px display wastes 90% of the data.

### `will-change` for GPU acceleration
```css
#dt-words { will-change: transform; }
```
> Hints to the browser to move this element to its own compositor layer. Avoids triggering layout/paint on transform animations.

### `defer` scripts prevent render blocking
Scripts in `<head>` without `defer` block HTML parsing. The browser stops reading HTML until the script downloads AND executes.

### Preload vs prefetch
```html
<link rel="preload" href="asset.png" as="image">  <!-- critical, needed soon -->
<link rel="prefetch" href="next-page.js">          <!-- nice to have, idle time -->
```
> We removed preloads for shape images because they're randomly shuffled — preloading all 5 when only 1 is shown first is wasteful and triggers browser warnings.

---

## 5. Mobile & Cross-Browser Compatibility

### Touch events vs pointer events
```js
// Desktop only
el.addEventListener('mouseenter', handler);

// Mobile (touch)
el.addEventListener('touchstart', handler, { passive: true });

// Universal
el.addEventListener('pointerdown', handler);
```
> `{ passive: true }` tells the browser the handler won't call `preventDefault()` — allows smoother scrolling.

### iOS Safari AudioContext quirks
1. Context starts suspended — must call `resume()` after user gesture
2. Playing a silent buffer fully "unlocks" audio (just `resume()` alone isn't enough on older iOS)
3. `DOMContentLoaded` fires AFTER deferred scripts — listeners registered in deferred scripts still work

### Detecting touch device
```js
const isTouchDevice = 'ontouchstart' in window;
```

### Responsive design breakpoints (Apple-style)
- `≤480px` — phone
- `≤768px` — tablet
- `≤1100px` — small laptop

---

## 6. Game Development Concepts

### Game loop & state machine
```
states: idle → playing → game_over
```
Each state determines what user input is accepted and what renders.

### Drag and drop — hit detection
```js
function getHoleAt(x, y) {
  for (const hole of holes) {
    const r = hole.getBoundingClientRect();
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return hole;
  }
  return null;
}
```
> `getBoundingClientRect()` returns viewport-relative coordinates — correct for comparing with mouse/touch event coordinates.

### Repulsion force (physics)
```js
const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH;
totalRx += (dx / dist) * force;
```
> Linear falloff — force decreases proportionally with distance. The `(dx/dist)` normalises direction into a unit vector.

### WPM calculation (standard)
```js
const wpm = Math.round((correctChars / 5) / (elapsedSeconds / 60));
```
> Standard convention: 5 characters = 1 "word". Monkeytype, Typeracer all use this.

### SVG path animation (WPM graph)
```js
const lineEl = svg.querySelector('.graph-line');
const len    = lineEl.getTotalLength();
lineEl.style.strokeDasharray  = len;
lineEl.style.strokeDashoffset = len;
lineEl.style.animation        = 'drawLine 0.9s ease forwards';
// CSS: @keyframes drawLine { to { stroke-dashoffset: 0; } }
```
> The "draw-on" effect: set `dasharray` = full length, `dashoffset` = full length (invisible), animate offset to 0 (fully visible).

---

## 7. UI/UX Design Systems

### Apple design principles applied
- **SF Pro font stack:** `-apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif`
- **System colours:** `#30d158` (green), `#0a84ff` (blue), `#ff453a` (red)
- **Hairline borders:** `0.5px solid rgba(255,255,255,0.1)` — invisible at 1px but adds depth
- **Spring curves:** `cubic-bezier(0.34, 1.56, 0.64, 1)` — overshoots then settles

### iOS segmented control (difficulty slider)
```css
#dt-diff-slider {
  background: rgba(118, 118, 128, 0.18); /* iOS systemFill */
  backdrop-filter: blur(20px);
}
#dt-diff-thumb {
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 2px 8px rgba(0,0,0,0.35);
}
```
> `rgba(118,118,128,0.18)` is Apple's exact `systemFill` colour used for segmented controls and input backgrounds.

### Dark/light theme toggle
- `data-theme="light"` on `<html>` element
- All overrides scoped to `[data-theme="light"] selector`
- Preference saved to `localStorage`
- Theme applied immediately via IIFE before DOM renders (prevents flash)

---

## 8. Backend — Spring Boot + Redis

### Redis as a global counter (rickroll counter)
```java
// Increment atomically — safe across multiple instances
redisTemplate.opsForValue().increment("rickroll:count");
```
> `INCREMENT` is atomic in Redis — no race conditions even under concurrent load.

### Graceful fallback pattern
```java
try {
    return redisTemplate.opsForValue().get("key");
} catch (Exception e) {
    log.warn("Redis unavailable, using in-memory fallback");
    return inMemoryCounter.get();
}
```
> **Interview angle:** Always design for failure. If a dependency (Redis, external API) is down, degrade gracefully rather than crashing.

### Upstash Redis (serverless Redis)
- Free tier: 10,000 commands/day
- **Gotcha:** Pauses after 7 days of inactivity
- **Fix:** Cron job to ping every 3 days: `0 0 */3 * * curl http://localhost:8081/api/rickroll/count`

### Spring Boot Actuator health checks
```properties
management.endpoints.web.exposure.include=health,info
management.endpoint.health.show-details=always
management.health.redis.enabled=false  # don't fail health if Redis is down
```

---

## 9. Git & Project Structure

### Feature branch workflow
```
main                    ← production
  └── feature/devquest-games  ← all game development
```
> Keep features isolated. Merge to main only when stable. This protects production.

### Commit message conventions
```
Short imperative summary (max 72 chars)

- Bullet point detail
- Another detail
```
> Imperative mood ("Add", "Fix", "Update") matches how Git describes its own commits. Makes `git log --oneline` readable.

### Why not commit secrets/env vars
`.env` files, API keys, database passwords — never commit these. Use environment variables injected at runtime (Docker `-e`, EC2 instance profile, GitHub Secrets for CI).

---

## Quick Interview Cheat Sheet

| Concept | One-liner |
|---|---|
| AudioContext suspended | Browser requires user gesture before audio — autoplay policy |
| `backdrop-filter` creates stacking context | Elements behind it bleed into frosted glass |
| `clip-path` vs `border-radius` | clip-path = any polygon; border-radius = curves only |
| `will-change: transform` | Promotes to GPU layer, avoids paint on animation |
| `defer` vs async | defer = ordered, after parse; async = unordered, immediately |
| `const` vs `window.x` | `const` at top-level script is NOT on window — use `window.x` for cross-script globals |
| WPM = chars/5/minutes | Industry standard — 5 chars per "word" |
| Redis INCR is atomic | Safe for counters under concurrent load |
| Spring graceful degradation | Catch Redis exceptions, fall back to in-memory |
| Image optimisation | Always size to display size × DPR |

---

*Updated at commit `430d5fa` — next update at commit 5 from here*
