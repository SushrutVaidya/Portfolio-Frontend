(function () {
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    ('ontouchstart' in window && window.innerWidth < 768);
  if (!isMobile) return;
  if (sessionStorage.getItem('dq-desktop-banner-dismissed')) return;

  const style = document.createElement('style');
  style.textContent = `
    #dq-mobile-banner {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      z-index: 999995;
      background: rgba(10,10,10,0.96);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-top: 1px solid rgba(255,102,0,0.3);
      padding: 14px 20px 14px;
      padding-bottom: calc(14px + env(safe-area-inset-bottom, 0px));
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    #dq-mobile-banner-text {
      font: 500 0.72rem/1.4 -apple-system, 'Inter', sans-serif;
      color: rgba(255,255,255,0.7);
      letter-spacing: 0.02em;
    }
    #dq-mobile-banner-text strong {
      color: #ff6600;
      font-weight: 700;
    }
    #dq-mobile-banner-dismiss {
      flex-shrink: 0;
      background: none;
      border: 1px solid rgba(255,255,255,0.15);
      color: rgba(255,255,255,0.5);
      font: 600 0.62rem/1 -apple-system, 'Inter', sans-serif;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 8px 14px;
      border-radius: 100px;
      cursor: pointer;
      transition: border-color 0.2s, color 0.2s;
    }
    #dq-mobile-banner-dismiss:hover { border-color: rgba(255,255,255,0.4); color: #fff; }
  `;
  document.head.appendChild(style);

  function show() {
    const banner = document.createElement('div');
    banner.id = 'dq-mobile-banner';
    banner.innerHTML = `
      <div id="dq-mobile-banner-text">
        <strong>Best on desktop.</strong> Some features are designed for laptop or desktop.
      </div>
      <button id="dq-mobile-banner-dismiss">Got it</button>
    `;
    document.body.appendChild(banner);
    document.getElementById('dq-mobile-banner-dismiss').addEventListener('click', () => {
      banner.remove();
      sessionStorage.setItem('dq-desktop-banner-dismissed', '1');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', show);
  } else {
    show();
  }
})();
