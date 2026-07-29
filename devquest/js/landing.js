// DevQuest Landing — name input + user registration + flow

// API base:
//   - Prod (any non-loopback host): '' (same-origin, nginx routes /api).
//   - Local via nginx-proxy on port 8888: '' (same-origin, proxy routes /api).
//   - Local direct (python http.server / frontend container on 8080): backend on :8081.
const API_BASE = (() => {
  const h = window.location.hostname, p = window.location.port;
  if (h !== 'localhost' && h !== '127.0.0.1') return '';
  if (p === '8888') return '';
  return 'http://localhost:8081';
})();

const enterBtn    = document.getElementById('enter-devquest');
const backdrop    = document.getElementById('modal-backdrop');
const cancelBtn   = document.getElementById('modal-cancel');
const startBtn    = document.getElementById('modal-start');
const firstInput  = document.getElementById('first-name-input');
const lastInput   = document.getElementById('last-name-input');
const nameHint    = document.getElementById('name-hint');

// Open modal
enterBtn.addEventListener('click', () => {
  backdrop.classList.add('visible');
  setTimeout(() => firstInput.focus(), 400);
});

// Close modal
cancelBtn.addEventListener('click', closeModal);
backdrop.addEventListener('click', e => {
  if (e.target === backdrop) closeModal();
});

function closeModal() {
  backdrop.classList.remove('visible');
  firstInput.value = '';
  lastInput.value = '';
  nameHint.textContent = '';
}

// Validate both fields
function validate() {
  const first = firstInput.value.trim();
  const last = lastInput.value.trim();

  if (first.length > 0 && first.length < 2) {
    nameHint.textContent = 'first name — at least 2 characters';
    startBtn.disabled = true;
    return false;
  }
  if (last.length > 0 && last.length < 2) {
    nameHint.textContent = 'last name — at least 2 characters';
    startBtn.disabled = true;
    return false;
  }

  nameHint.textContent = '';
  startBtn.disabled = first.length < 2 || last.length < 2;
  return first.length >= 2 && last.length >= 2;
}

firstInput.addEventListener('input', validate);
lastInput.addEventListener('input', validate);

// Start on Enter key from either field
firstInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    if (firstInput.value.trim().length >= 2) lastInput.focus();
  }
});
lastInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !startBtn.disabled) startChallenge();
});

// Start button
startBtn.addEventListener('click', startChallenge);
startBtn.disabled = true;

async function startChallenge() {
  // Idempotency guard — prevents double-registration on rapid double-click
  // or Enter-mash. Without this, two POSTs race and can create dup rows
  // (backend has a unique constraint now, but still wastes a request).
  if (startBtn.disabled || startBtn.dataset.submitting === '1') return;
  const firstName = firstInput.value.trim();
  const lastName = lastInput.value.trim();
  if (!firstName || firstName.length < 2 || !lastName || lastName.length < 2) return;

  startBtn.dataset.submitting = '1';
  startBtn.disabled = true;

  // Save to localStorage (display name + full name for API)
  localStorage.setItem('dq-player-name', firstName);
  localStorage.setItem('dq-player-first', firstName);
  localStorage.setItem('dq-player-last', lastName);
  localStorage.setItem('dq-game-path', 'true');

  // Register with backend (non-blocking — don't prevent game start if backend is down)
  try {
    const res = await fetch(API_BASE + '/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.id) {
        localStorage.setItem('dq-user-id', data.id);
        // HMAC token — sent as X-DQ-Token on mutating requests
        if (data.token) localStorage.setItem('dq-user-token', data.token);
      }
    }
  } catch {
    // Backend unreachable — continue anyway, scores saved locally
  }

  window.location.href = 'captcha.html';
}

// If player already has a name, pre-fill
const savedFirst = localStorage.getItem('dq-player-first');
const savedLast = localStorage.getItem('dq-player-last');
if (savedFirst) {
  firstInput.value = savedFirst;
  if (savedLast) lastInput.value = savedLast;
  validate();
}

// Card teaser — live suspect count
(async function initTeaser() {
  const countEl = document.getElementById('teaser-count');
  if (countEl) {
    try {
      const res  = await fetch(API_BASE + '/api/leaderboard');
      const data = await res.json();
      if (data.length > 0) {
        countEl.textContent = `${data.length} suspect${data.length !== 1 ? 's' : ''} identified`;
      }
    } catch { /* keep placeholder */ }
  }
})();
