// DevQuest Landing — name input + flow

const enterBtn    = document.getElementById('enter-devquest');
const backdrop    = document.getElementById('modal-backdrop');
const cancelBtn   = document.getElementById('modal-cancel');
const startBtn    = document.getElementById('modal-start');
const nameInput   = document.getElementById('name-input');
const nameHint    = document.getElementById('name-hint');

// Open modal
enterBtn.addEventListener('click', () => {
  backdrop.classList.add('visible');
  setTimeout(() => nameInput.focus(), 400);
});

// Close modal
cancelBtn.addEventListener('click', closeModal);
backdrop.addEventListener('click', e => {
  if (e.target === backdrop) closeModal();
});

function closeModal() {
  backdrop.classList.remove('visible');
  nameInput.value = '';
  nameHint.textContent = '';
}

// Validate on input
nameInput.addEventListener('input', () => {
  const val = nameInput.value.trim();
  if (val.length > 0 && val.length < 2) {
    nameHint.textContent = 'at least 2 characters';
    startBtn.disabled = true;
  } else if (val.length > 24) {
    nameHint.textContent = 'max 24 characters';
    startBtn.disabled = true;
  } else {
    nameHint.textContent = '';
    startBtn.disabled = val.length === 0;
  }
});

// Start on Enter key
nameInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !startBtn.disabled) startChallenge();
});

// Start button
startBtn.addEventListener('click', startChallenge);
startBtn.disabled = true;

function startChallenge() {
  const name = nameInput.value.trim();
  if (!name || name.length < 2) return;
  localStorage.setItem('dq-player-name', name);
  window.location.href = 'captcha.html';
}

// If player already has a name, pre-fill
const saved = localStorage.getItem('dq-player-name');
if (saved) {
  nameInput.value = saved;
  startBtn.disabled = false;
}
