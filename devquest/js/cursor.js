// Custom cursor — the trace-2 (2026-07-06) profile showed .is-hover
// transitions on this element accounted for 31 % frame drops on landing
// because the previous version was mutating `left`, `top`, `width`,
// `height`, and `margin` — every one of those is layout-triggering. The
// `will-change: left, top` hint was a lie; Chrome doesn't composite
// left/top animations.
//
// Rewrite runs everything through `transform: translate3d(x, y, 0) scale(s)`
// — pure compositor path, zero layout cost. Smoothing is done in a
// single rAF loop that lerps position (for the trailing ring) and scale
// (for smooth hover/click state changes). No CSS transitions.
(function () {
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

  const style = document.createElement('style');
  style.textContent = `
    body, *, *::before, *::after { cursor: none !important; }

    /* Both cursor elements are fixed at 0,0 with a single transform doing
       position + scale. Base scale is 1; hover/click change scale, JS
       eases it in the rAF loop. No width/height/margin transitions =
       zero layout thrash.
       - No 'will-change: transform': on position:fixed elements Chrome
         reserves a max-texture-size compositor layer (16k x 16k = ~1GB
         GPU memory each). translate3d already auto-composites without
         this cost.
       - 'contain: layout paint style' scopes the compositor bounds to
         the element's actual box and prevents its paint from
         invalidating siblings. */
    #dq-cursor-dot,
    #dq-cursor-ring {
      position: fixed;
      top: 0; left: 0;
      pointer-events: none;
      transform: translate3d(-100px, -100px, 0);
      contain: layout paint style;
      /* Only color/opacity transitions here — both are compositor-cheap
         on small (≤50px) elements. */
      transition: background 0.2s ease, border-color 0.3s ease, opacity 0.2s ease;
    }

    #dq-cursor-dot {
      width: 6px; height: 6px;
      margin: -3px 0 0 -3px;
      border-radius: 50%;
      background: #ff6600;
      z-index: 999999;
    }

    #dq-cursor-ring {
      width: 32px; height: 32px;
      margin: -16px 0 0 -16px;
      border-radius: 50%;
      /* Border-width is FIXED at 2px — previously the .is-hover state
         changed it 1.5px→2px, but border-width changes are layout-
         triggering (they reflow the box model). Which contradicts the
         whole point of this rewrite. Now only color animates on hover;
         the 0.5px "thickness gain" is imperceptible on a 32px ring and
         not worth the layout cost. */
      border: 2px solid rgba(255,102,0,0.45);
      z-index: 999998;
    }

    /* Color-only state transitions — layout unaffected. Size is driven
       from JS via scale in the rAF loop. */
    #dq-cursor-dot.is-hover  { background: #c8ff00; }
    #dq-cursor-ring.is-hover { border-color: rgba(200,255,0,0.5); }
    #dq-cursor-dot.is-click  { opacity: 0.5; }
    #dq-cursor-ring.is-click { opacity: 0.1; }
  `;
  document.head.appendChild(style);

  function init() {
    const dot  = document.createElement('div');
    const ring = document.createElement('div');
    dot.id  = 'dq-cursor-dot';
    ring.id = 'dq-cursor-ring';
    // Attach to whichever container is available RIGHT NOW so the cursor
    // starts drawing on the very next frame — previous version waited
    // for DOMContentLoaded which could be 2-3s on animation-heavy pages.
    const anchor = document.body || document.documentElement;
    anchor.appendChild(dot);
    anchor.appendChild(ring);

    // If we attached to <html> (script in <head>, body doesn't exist yet),
    // reparent to <body> once it's created. Prevents cursor being
    // sibling-of-body which some CSS resets can hide.
    if (anchor !== document.body) {
      const reparent = () => {
        if (document.body) {
          document.body.appendChild(dot);
          document.body.appendChild(ring);
        }
      };
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', reparent, { once: true });
      }
    }

    // Position — dot follows exactly, ring lerps behind for trailing feel.
    let mouseX = -100, mouseY = -100;
    let ringX  = -100, ringY  = -100;

    // Scale — driven by hover/click state. Target-vs-current so the rAF
    // loop can ease between them (75ms feel with 0.25 lerp factor at 60fps).
    // Ratios preserve the previous visual: dot 6→10 (=1.67), ring 32→50 (=1.56)
    // on hover; dot 6→3 (=0.5), ring 32→60 (=1.87) on click.
    let dotScaleT = 1,   dotScaleC = 1;
    let ringScaleT = 1,  ringScaleC = 1;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    // rAF driver that self-pauses when the tab is hidden. Browsers
    // already throttle rAF to ~1Hz in background tabs, but with this
    // guard we skip the whole loop body (transform writes + easing math)
    // and hold the last frame. When the tab becomes visible again,
    // visibilitychange re-arms the loop.
    let rafId = null;
    function loop() {
      // Ring trails smoothly behind pointer
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      // Scale eases toward target
      dotScaleC  += (dotScaleT  - dotScaleC)  * 0.25;
      ringScaleC += (ringScaleT - ringScaleC) * 0.25;
      // Round position to tenths to reduce sub-pixel raster churn
      const rx = Math.round(ringX * 10) / 10;
      const ry = Math.round(ringY * 10) / 10;
      dot.style.transform  = `translate3d(${mouseX}px, ${mouseY}px, 0) scale(${dotScaleC.toFixed(3)})`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) scale(${ringScaleC.toFixed(3)})`;
      rafId = requestAnimationFrame(loop);
    }
    function startLoop() {
      if (rafId === null) rafId = requestAnimationFrame(loop);
    }
    function stopLoop() {
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    }
    document.addEventListener('visibilitychange', () => {
      document.hidden ? stopLoop() : startLoop();
    });
    startLoop();

    const INTERACTIVE = 'a, button, [onclick], input, textarea, select, label, .wanted-poster, .card-col, .podium-item, .lb-row, .dt-diff-btn, .lang-btn, .style-option, .hero-teaser, [role="button"]';

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(INTERACTIVE)) {
        dot.classList.add('is-hover');
        ring.classList.add('is-hover');
        dotScaleT  = 1.67;   // 10 / 6
        ringScaleT = 1.56;   // 50 / 32
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(INTERACTIVE)) {
        dot.classList.remove('is-hover');
        ring.classList.remove('is-hover');
        dotScaleT  = 1;
        ringScaleT = 1;
      }
    });

    document.addEventListener('mousedown', () => {
      dot.classList.add('is-click');
      ring.classList.add('is-click');
      dotScaleT  = 0.5;    // 3 / 6
      ringScaleT = 1.87;   // 60 / 32
    });
    document.addEventListener('mouseup', () => {
      dot.classList.remove('is-click');
      ring.classList.remove('is-click');
      // Return to hover-appropriate scale
      const hovering = ring.classList.contains('is-hover');
      dotScaleT  = hovering ? 1.67 : 1;
      ringScaleT = hovering ? 1.56 : 1;
    });

    document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
  }

  // Run immediately. Elements attach to documentElement if body doesn't
  // exist yet (script loaded in <head>), reparent to body when it does.
  // Trade-off is minor: 1-2 events accepted before body exists = harmless.
  init();
})();
