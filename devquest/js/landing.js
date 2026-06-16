// DevQuest Landing — name input + user registration + flow

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8081'
  : '';

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
  const firstName = firstInput.value.trim();
  const lastName = lastInput.value.trim();
  if (!firstName || firstName.length < 2 || !lastName || lastName.length < 2) return;

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
      localStorage.setItem('dq-user-id', data.id);
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
