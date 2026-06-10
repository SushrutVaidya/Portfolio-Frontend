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
      transition: width 0.15s ease, height 0.15s ease, margin 0.15s ease, background 0.2s ease, opacity 0.2s ease;
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
      transition: width 0.3s cubic-bezier(0.34,1.56,0.64,1), height 0.3s cubic-bezier(0.34,1.56,0.64,1), margin 0.3s cubic-bezier(0.34,1.56,0.64,1), border-color 0.3s ease, opacity 0.2s ease;
      will-change: left, top;
    }

    #dq-cursor-dot.is-hover { width: 10px; height: 10px; margin: -5px 0 0 -5px; background: #c8ff00; }
    #dq-cursor-ring.is-hover { width: 50px; height: 50px; margin: -25px 0 0 -25px; border-color: rgba(200,255,0,0.5); border-width: 2px; }
    #dq-cursor-dot.is-click  { opacity: 0.5; width: 3px; height: 3px; margin: -1.5px 0 0 -1.5px; }
    #dq-cursor-ring.is-click { width: 60px; height: 60px; margin: -30px 0 0 -30px; opacity: 0.1; }

    @keyframes ringIdle {
      0%, 100% { transform: scale(1); opacity: 0.45; }
      50%       { transform: scale(1.12); opacity: 0.25; }
    }
    #dq-cursor-ring.is-idle { animation: ringIdle 2s ease-in-out infinite; }
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
    let lastX  = -100, lastY  = -100;
    let idleTimer = null;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top  = mouseY + 'px';

      // Velocity-based ring stretch
      const vx = mouseX - lastX;
      const vy = mouseY - lastY;
      const speed = Math.sqrt(vx * vx + vy * vy);
      lastX = mouseX; lastY = mouseY;

      // Scale ring on fast movement
      if (!ring.classList.contains('is-hover') && !ring.classList.contains('is-click')) {
        const scale = Math.min(1 + speed * 0.018, 1.6);
        ring.style.transform = `scale(${scale})`;
      }

      // Remove idle animation on move
      ring.classList.remove('is-idle');
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => ring.classList.add('is-idle'), 2000);
    });

    (function loop() {
      ringX += (mouseX - ringX) * 0.07;
      ringY += (mouseY - ringY) * 0.07;
      ring.style.left = Math.round(ringX * 10) / 10 + 'px';
      ring.style.top  = Math.round(ringY * 10) / 10 + 'px';
      requestAnimationFrame(loop);
    })();

    const INTERACTIVE = 'a, button, [onclick], input, textarea, select, label, .wanted-poster, .card-col, .podium-item, .lb-row, .dt-diff-btn, .lang-btn, .style-option, .hero-teaser, [role="button"]';

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(INTERACTIVE)) {
        ring.style.transform = '';
        dot.classList.add('is-hover'); ring.classList.add('is-hover');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(INTERACTIVE)) { dot.classList.remove('is-hover'); ring.classList.remove('is-hover'); }
    });

    document.addEventListener('mousedown', () => {
      ring.style.transform = '';
      dot.classList.add('is-click'); ring.classList.add('is-click');
    });
    document.addEventListener('mouseup', () => { dot.classList.remove('is-click'); ring.classList.remove('is-click'); });
    document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
