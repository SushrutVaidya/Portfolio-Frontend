// DevQuest cheat code — type "DEVMODE" anywhere (not in an input) to skip current challenge
(function () {
  const CODE = 'DEVMODE';
  let typed = '';

  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    typed += e.key.toUpperCase();
    if (typed.length > CODE.length) typed = typed.slice(-CODE.length);

    if (typed === CODE) {
      typed = '';
      activate();
    }
  });

  function activate() {
    // Set all stat keys to solid values so card editor gets earned stats
    localStorage.setItem('dq-game-path',   'true');
    localStorage.setItem('dq-stat-design', '82');
    localStorage.setItem('dq-stat-grind',  '75');
    localStorage.setItem('dq-stat-brain',  '88');
    localStorage.setItem('dq-stat-dev',    '80');
    localStorage.setItem('dq-stat-social', '70');

    // Show toast
    showCheatToast();

    // Call page-specific cheat if registered
    setTimeout(() => {
      if (typeof window.dqCheat === 'function') {
        window.dqCheat();
      }
    }, 800);
  }

  function showCheatToast() {
    const t = document.createElement('div');
    t.style.cssText = [
      'position:fixed', 'top:20px', 'left:50%',
      'transform:translateX(-50%)',
      'background:#0f0f0f',
      'border:1.5px solid #c8ff00',
      'color:#c8ff00',
      'font:700 0.72rem/1 Inter,-apple-system,sans-serif',
      'letter-spacing:0.2em',
      'text-transform:uppercase',
      'padding:12px 24px',
      'border-radius:8px',
      'z-index:999999',
      'box-shadow:0 0 24px rgba(200,255,0,0.2)',
      'transition:opacity 0.4s ease',
    ].join(';');
    t.textContent = '⚡ DEVMODE ACTIVATED';
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 400); }, 2000);
  }
})();
