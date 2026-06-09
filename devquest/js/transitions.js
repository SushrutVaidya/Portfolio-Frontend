(function () {
  const style = document.createElement('style');
  style.textContent = `
    #dq-page-overlay {
      position: fixed;
      inset: 0;
      background: #0a0a0a;
      z-index: 99990;
      pointer-events: none;
      opacity: 1;
      transition: opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1);
    }
    #dq-page-overlay.is-out  { opacity: 0; }
    #dq-page-overlay.is-exit { opacity: 1; pointer-events: all; transition: opacity 0.28s ease; }
  `;
  document.head.appendChild(style);

  // Append overlay as early as possible
  const overlay = document.createElement('div');
  overlay.id = 'dq-page-overlay';

  function attachOverlay() {
    (document.body || document.documentElement).appendChild(overlay);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { overlay.classList.add('is-out'); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachOverlay);
  } else {
    attachOverlay();
  }

  window.pageTransition = function (href) {
    if (!href) return;
    overlay.classList.remove('is-out');
    overlay.classList.add('is-exit');
    setTimeout(() => { window.location.href = href; }, 290);
  };

  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('http') ||
        link.target === '_blank' ||
        link.hasAttribute('download')) return;
    e.preventDefault();
    window.pageTransition(href);
  }, true);
})();
