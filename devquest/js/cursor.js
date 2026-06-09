(function () {
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

  const style = document.createElement('style');
  style.textContent = `
    body, *, *::before, *::after { cursor: none !important; }

    #dq-cursor-dot {
      position: fixed;
      width: 6px; height: 6px;
      margin: -3px 0 0 -3px;
      border-radius: 50%;
      background: #ff6600;
      pointer-events: none;
      z-index: 999999;
      transition: width 0.18s ease, height 0.18s ease, margin 0.18s ease, background 0.18s ease, opacity 0.2s ease;
      will-change: left, top;
    }

    #dq-cursor-ring {
      position: fixed;
      width: 32px; height: 32px;
      margin: -16px 0 0 -16px;
      border-radius: 50%;
      border: 1.5px solid rgba(255,102,0,0.45);
      pointer-events: none;
      z-index: 999998;
      transition: width 0.22s ease, height 0.22s ease, margin 0.22s ease, border-color 0.22s ease, opacity 0.2s ease;
      will-change: left, top;
    }

    #dq-cursor-dot.is-hover { width: 10px; height: 10px; margin: -5px 0 0 -5px; background: #c8ff00; }
    #dq-cursor-ring.is-hover { width: 46px; height: 46px; margin: -23px 0 0 -23px; border-color: rgba(200,255,0,0.45); }
    #dq-cursor-dot.is-click  { opacity: 0.5; width: 4px; height: 4px; margin: -2px 0 0 -2px; }
    #dq-cursor-ring.is-click { width: 54px; height: 54px; margin: -27px 0 0 -27px; opacity: 0.15; }
  `;
  document.head.appendChild(style);

  function init() {
    const dot  = document.createElement('div');
    const ring = document.createElement('div');
    dot.id  = 'dq-cursor-dot';
    ring.id = 'dq-cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mouseX = -100, mouseY = -100;
    let ringX  = -100, ringY  = -100;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top  = mouseY + 'px';
    });

    (function loop() {
      ringX += (mouseX - ringX) * 0.1;
      ringY += (mouseY - ringY) * 0.1;
      ring.style.left = Math.round(ringX * 10) / 10 + 'px';
      ring.style.top  = Math.round(ringY * 10) / 10 + 'px';
      requestAnimationFrame(loop);
    })();

    const INTERACTIVE = 'a, button, [onclick], input, textarea, select, label, .wanted-poster, .card-col, .podium-item, .lb-row, .dt-diff-btn, .lang-btn, .style-option, .hero-teaser, [role="button"]';

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(INTERACTIVE)) { dot.classList.add('is-hover'); ring.classList.add('is-hover'); }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(INTERACTIVE)) { dot.classList.remove('is-hover'); ring.classList.remove('is-hover'); }
    });

    document.addEventListener('mousedown', () => { dot.classList.add('is-click');    ring.classList.add('is-click'); });
    document.addEventListener('mouseup',   () => { dot.classList.remove('is-click'); ring.classList.remove('is-click'); });
    document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
