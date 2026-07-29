// Shared stat-unlock toast — shown after each game challenge

(function () {
  const CSS = `
    #dq-stat-toast {
      position: fixed;
      bottom: auto;
      top: 72px;
      left: 50%;
      transform: translateX(-50%) translateY(-40px) scale(0.9);
      opacity: 0;
      z-index: 9999;
      min-width: 280px;
      max-width: min(360px, calc(100vw - 32px));
      padding: 18px 24px 16px;
      background: #0f0f0f;
      border: 1.5px solid #c8ff00;
      border-radius: 12px;
      box-shadow: 0 0 32px rgba(200,255,0,0.12), 0 8px 24px rgba(0,0,0,0.4);
      transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease;
      pointer-events: none;
    }
    #dq-stat-toast.toast-visible {
      transform: translateX(-50%) translateY(0) scale(1);
      opacity: 1;
    }
    #dq-stat-toast.toast-out {
      transform: translateX(-50%) translateY(-20px) scale(0.95);
      opacity: 0;
      transition: transform 0.3s ease, opacity 0.3s ease;
    }
    .toast-header {
      font: 700 0.58rem/1 'Inter', -apple-system, sans-serif;
      letter-spacing: 0.32em;
      text-transform: uppercase;
      color: #c8ff00;
      margin-bottom: 10px;
    }
    .toast-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
    }
    .toast-badge {
      font: 800 0.78rem/1 'Inter', -apple-system, sans-serif;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      background: #c8ff00;
      color: #0f0f0f;
      padding: 5px 14px;
      border-radius: 6px;
    }
    .toast-value {
      font: 900 2rem/1 'Inter', -apple-system, sans-serif;
      color: #ff6600;
    }
    .toast-bar-track {
      height: 4px;
      background: rgba(200,255,0,0.1);
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 8px;
    }
    .toast-bar-fill {
      height: 100%;
      width: 0%;
      background: #c8ff00;
      border-radius: 2px;
      transition: width 0.6s cubic-bezier(0.22,1,0.36,1);
    }
    .toast-sub {
      font: 400 0.62rem/1.4 'Inter', -apple-system, sans-serif;
      color: rgba(255,255,255,0.35);
    }
  `;

  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  window.showStatUnlocked = function (statName, value, subtext) {
    const old = document.getElementById('dq-stat-toast');
    if (old) { old.remove(); }

    // Build toast via createElement + textContent so the caller-supplied
    // statName/value/subtext render as text even if they contain HTML.
    // All callers today pass literal strings, but a defensive shape here
    // means a future caller can't accidentally introduce XSS.
    const toast = document.createElement('div');
    toast.id = 'dq-stat-toast';

    const header = document.createElement('div');
    header.className = 'toast-header';
    header.textContent = 'Stat Unlocked';

    const row = document.createElement('div');
    row.className = 'toast-row';
    const badge = document.createElement('div');
    badge.className = 'toast-badge';
    badge.textContent = statName;
    const val = document.createElement('div');
    val.className = 'toast-value';
    val.textContent = value;
    row.append(badge, val);

    const barTrack = document.createElement('div');
    barTrack.className = 'toast-bar-track';
    const barFill = document.createElement('div');
    barFill.className = 'toast-bar-fill';
    barFill.id = 'dq-toast-bar';
    barTrack.appendChild(barFill);

    const sub = document.createElement('div');
    sub.className = 'toast-sub';
    sub.textContent = subtext || 'earned in the challenge';

    toast.append(header, row, barTrack, sub);
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('toast-visible');
      setTimeout(() => {
        const bar = document.getElementById('dq-toast-bar');
        if (bar) bar.style.width = Math.min(100, value) + '%';
      }, 80);
    });

    setTimeout(() => {
      toast.classList.remove('toast-visible');
      toast.classList.add('toast-out');
      setTimeout(() => { if (toast.parentNode) toast.remove(); }, 350);
    }, 3500);
  };
})();
