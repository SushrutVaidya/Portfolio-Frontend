// ==========================================
// DevType — Dev-themed typing game
// Option A: dev word pool (phrases, tokens, cursed names)
// Option B: mid-word autocomplete that gets more aggressive
// Option C: senior dev rejects completed words → forced retype
// ==========================================

// ==========================================
// WORD POOL — authentic dev vocabulary
// ==========================================

const WORD_POOL = [
  // Terminal / CLI
  'git-push', 'git-blame', 'git-stash', 'git-rebase', 'git-cherry-pick',
  'npm-install', 'npm-audit', 'npm-ci', 'yarn-add', 'pip-install',
  'docker-ps', 'docker-build', 'kubectl-get', 'chmod-755', 'sudo!!',
  'ls-la', 'grep-rn', 'rm-rf', 'cd..', 'cat-EOF',

  // Code expressions (dot notation feels like real code)
  'console.log', 'console.error', 'console.warn',
  'process.env', 'process.exit', 'JSON.parse', 'JSON.stringify',
  'Object.keys', 'Array.from', 'Promise.all', 'Promise.reject',
  'Math.random', 'Date.now',

  // Paths / URLs
  'localhost:3000', 'localhost:8080', '127.0.0.1', '/dev/null',
  '/api/v1', '/api/v2', '/health', 'undefined:1',

  // Variables (legit and cursed)
  'undefined', 'null', 'NaN', 'Infinity', 'void_0',
  'finalFinal', 'tmp2', 'PLEASE_WORK', 'doTheThing', 'x1',
  'dontDelete', 'oldCode', 'temp_v2', 'copy_copy', 'test123',

  // Keywords
  'async', 'await', 'yield', 'const', 'typeof', 'instanceof',
  'try-catch', 'throw-new', 'break-continue',

  // Errors
  'TypeError', 'SyntaxError', 'ReferenceError', 'RangeError',
  'segfault', 'deadlock', 'overflow', 'OutOfMemory', 'SIGKILL',

  // Dev culture
  'TODO', 'FIXME', 'HACK', 'NOTE', 'XXX',
  'hotfix', 'refactor', 'deprecated', 'legacy', 'technical-debt',
  'spaghetti', 'rubber-duck', 'yak-shaving', 'bikeshedding',

  // Tools / ecosystem
  'webpack', 'eslint', 'prettier', 'docker', 'nginx', 'redis',
  'kubernetes', 'terraform', 'ansible', 'grafana', 'prometheus',

  // Patterns
  'singleton', 'middleware', 'callback-hell', 'race-condition',
  'deadcode', 'monkeypatch', 'boilerplate', 'microservice',

  // Short satisfying
  'null', 'bool', 'enum', 'heap', 'mutex', 'spawn', 'stdin',
  'stdout', 'stderr', 'cron', 'blob', 'hash', 'diff', 'patch',
];

// ==========================================
// OPTION B — Autocomplete suggestions
// [prefix to match, wrong completion to suggest]
// ==========================================

const AC_SUGGESTIONS = [
  ['console',    '.log("here")'],
  ['undefined',  ' is not a function'],
  ['null',       'PointerException'],
  ['git',        ' push --force origin main'],
  ['docker',     ' rm -f $(docker ps -aq)'],
  ['localhost',  ':3000/admin/secret'],
  ['TODO',       ': ask someone else later'],
  ['npm',        ' install --save-dev everything'],
  ['async',      ' function callback(callback)'],
  ['tmp',        '_FINAL_FINAL_v3_real'],
  ['deploy',     ' to prod on Friday 5pm'],
  ['fix',        'Later() // famous last words'],
  ['PLEASE',     '_WORK_for_the_love_of_god'],
  ['process',    '.exit(1) // just give up'],
  ['Promise',    '.reject("my life choices")'],
  ['Object',     '.assign({}, mess, moreMess)'],
];

// ==========================================
// OPTION C — Code review comments
// ==========================================

const REVIEW_COMMENTS = [
  '// naming?',
  '// O(n²)?',
  '// really?',
  '// deprecated since forever',
  '// needs unit tests',
  '// magic number',
  '// side effects?',
  '// why tho',
  '// needs docs',
  '// too clever by half',
  '// refactor in next sprint (never)',
  '// asked ChatGPT?',
  '// ship it and pray',
  '// i wrote this at 2am',
];

// ==========================================
// LEGACY pause comments
// ==========================================

const LEGACY_COMMENTS = [
  '// written in 2009, don\'t touch',
  '// no one knows what this does',
  '// here be dragons',
  '// if it works, don\'t touch it',
  '// the original dev left the company',
];

// ==========================================
// RESULT VERDICTS (by real WPM)
// ==========================================

const VERDICTS = [
  [0,   15, '// still in tutorial mode'],
  [15,  30, '// compiling at runtime'],
  [30,  50, '// acceptable. barely.'],
  [50,  70, '// merge approved (with 12 comments)'],
  [70,  90, '// senior dev energy'],
  [90, 999, '// git blame shows only your name'],
];

// ==========================================
// STATE
// ==========================================

let words        = [];
let wordEls      = [];
let lineHeight   = 0;

let currentWordIdx = 0;
let currentInput   = '';
let gameStarted    = false;
let gameOver       = false;
let timerDuration  = 30;
let timeLeft       = 30;
let timerInterval  = null;

// Accuracy tracking (standard: correct chars / total chars)
let correctChars   = 0;
let totalChars     = 0;
let errorCount     = 0;
let wordsCorrect   = 0;

// Option B — autocomplete aggression
let acTimer        = null;
let acVisible      = false;
let acWordCooldown = 0;   // words to wait before next AC trigger
let correctStreak  = 0;   // consecutive correct words → lowers cooldown

// Option C — code review retype
let reviewWordCooldown = 0;
let reviewPending      = false; // true while user is retyping a review word

// Legacy pause
let legacyTimer  = null;
let legacyIdx    = 0;

// ==========================================
// DOM REFS
// ==========================================

const containerEl  = document.getElementById('devtype-container');
const wordsWrapEl  = document.getElementById('dt-words-wrap');
const wordsEl      = document.getElementById('dt-words');
const inputEl      = document.getElementById('dt-input');
const timerEl      = document.getElementById('dt-timer');
const liveWpmEl    = document.getElementById('dt-live-wpm');
const liveAccEl    = document.getElementById('dt-live-acc');
const focusHintEl  = document.getElementById('dt-focus-hint');
const resultsEl    = document.getElementById('dt-results');
const acEl         = document.getElementById('dt-autocomplete');
const acTypedEl    = document.getElementById('dt-ac-typed');
const acRestEl     = document.getElementById('dt-ac-rest');
const reviewEl     = document.getElementById('dt-review');
const legacyEl     = document.getElementById('dt-legacy');

// ==========================================
// HELPERS
// ==========================================

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateWords(n = 120) {
  const pool = shuffle(WORD_POOL);
  const out  = [];
  for (let i = 0; i < n; i++) out.push(pool[i % pool.length]);
  return out;
}

// ==========================================
// RENDER
// ==========================================

function createWordEl(word, isReview = false) {
  const div = document.createElement('div');
  div.className = 'dt-word' + (isReview ? ' review-pending' : '');
  word.split('').forEach(ch => {
    const span = document.createElement('span');
    span.className = 'dt-char pending';
    span.textContent = ch;
    div.appendChild(span);
  });
  return div;
}

function renderWords() {
  wordsEl.innerHTML = '';
  wordEls = [];
  lineHeight = 0;

  words.forEach((word, wi) => {
    const div = createWordEl(word);
    div.dataset.wi = wi;
    wordsEl.appendChild(div);
    wordEls.push(div);
  });

  setCurrentWord();
}

function setCurrentWord() {
  wordEls.forEach((el, i) => {
    el.classList.remove('current', 'done');
    if (i < currentWordIdx) el.classList.add('done');
    if (i === currentWordIdx) el.classList.add('current');
  });
  updateCursor();
  scrollWords();
}

// ==========================================
// CURSOR
// ==========================================

function updateCursor() {
  const wordEl = wordEls[currentWordIdx];
  if (!wordEl) return;

  const regularChars = [...wordEl.querySelectorAll('.dt-char:not(.extra)')];
  const extraChars   = [...wordEl.querySelectorAll('.dt-char.extra')];
  const allChars     = [...regularChars, ...extraChars];
  let left = 0;

  if (currentInput.length > 0 && allChars.length > 0) {
    const idx     = Math.min(currentInput.length, allChars.length) - 1;
    const charRect = allChars[idx].getBoundingClientRect();
    const wordRect = wordEl.getBoundingClientRect();
    left = charRect.right - wordRect.left;
  }

  wordEl.style.setProperty('--cur', left + 'px');
}

// ==========================================
// SCROLL
// ==========================================

function getLineHeight() {
  if (lineHeight > 0) return lineHeight;
  if (wordEls.length < 2) return 0;
  const top0 = wordEls[0].offsetTop;
  for (let i = 1; i < wordEls.length; i++) {
    if (wordEls[i].offsetTop > top0) {
      lineHeight = wordEls[i].offsetTop - top0;
      return lineHeight;
    }
  }
  return 0;
}

function scrollWords() {
  const lh = getLineHeight();
  if (!lh || !wordEls[currentWordIdx]) return;

  const top0   = wordEls[0].offsetTop;
  const topCur = wordEls[currentWordIdx].offsetTop;
  const row    = Math.round((topCur - top0) / lh);

  if (row >= 2) {
    wordsEl.style.transform = `translateY(-${(row - 1) * lh}px)`;
  }
}

// ==========================================
// COLORING
// ==========================================

function colorCurrentWord() {
  const wordEl = wordEls[currentWordIdx];
  if (!wordEl) return;

  const word  = words[currentWordIdx];
  const chars = wordEl.querySelectorAll('.dt-char:not(.extra)');

  wordEl.querySelectorAll('.dt-char.extra').forEach(e => e.remove());

  chars.forEach((span, i) => {
    span.className = 'dt-char';
    if (i < currentInput.length) {
      span.classList.add(currentInput[i] === word[i] ? 'correct' : 'wrong');
    } else {
      span.classList.add('pending');
    }
  });

  if (currentInput.length > word.length) {
    currentInput.slice(word.length).split('').forEach(ch => {
      const span = document.createElement('span');
      span.className = 'dt-char extra';
      span.textContent = ch;
      wordEl.appendChild(span);
    });
  }

  updateCursor();

  // Option B: check mid-word autocomplete on each keypress
  checkMidWordAutocomplete();
}

// ==========================================
// INPUT HANDLING
// ==========================================

inputEl.addEventListener('input', () => {
  if (gameOver) return;

  const val = inputEl.value;

  if (val.endsWith(' ')) {
    submitWord(val.trimEnd());
    return;
  }

  if (!gameStarted && val.length > 0) startGame();

  currentInput = val;
  colorCurrentWord();
  resetLegacyTimer();
  updateLiveStats();
});

inputEl.addEventListener('keydown', e => {
  if (e.key === 'Tab') { e.preventDefault(); return; }
  if (e.key === 'Backspace' && currentInput === '' && inputEl.value === '') {
    e.preventDefault();
  }
});

function submitWord(typed) {
  if (!gameStarted) startGame();
  if (gameOver) return;

  const word      = words[currentWordIdx];
  const isCorrect = typed === word;
  const isReview  = wordEls[currentWordIdx]?.classList.contains('review-pending');

  if (isCorrect) {
    wordsCorrect++;
    correctChars += word.length;
    if (!isReview) {
      correctStreak++;
      // Option B: increase autocomplete aggression on correct streak
      if (correctStreak > 0 && correctStreak % 3 === 0) {
        acWordCooldown = Math.max(2, acWordCooldown - 1);
      }
    }
  } else {
    errorCount++;
    correctStreak = 0;
  }
  totalChars += typed.length;

  // Freeze word visuals
  const wordEl = wordEls[currentWordIdx];
  wordEl.querySelectorAll('.dt-char.extra').forEach(e => e.remove());
  wordEl.querySelectorAll('.dt-char:not(.extra)').forEach((span, i) => {
    span.className = 'dt-char ' + (typed[i] === word[i] ? 'correct' : 'wrong');
  });
  wordEl.classList.add('done');

  if (isReview) {
    // Clear the rejected styling from the source word
    reviewPending = false;
    wordEls.forEach(el => el.classList.remove('rejected'));
  }

  currentWordIdx++;
  currentInput = '';
  inputEl.value = '';

  // Option B: count down autocomplete cooldown
  if (!isReview) {
    acWordCooldown--;
  }

  // Option C: trigger code review on non-review words
  if (!isReview) {
    reviewWordCooldown--;
    if (reviewWordCooldown <= 0 && !reviewPending) {
      triggerCodeReview();
    }
  }

  setCurrentWord();
  updateLiveStats();
}

// ==========================================
// GAME FLOW
// ==========================================

function startGame() {
  gameStarted        = true;
  acWordCooldown     = rand(5, 9);
  reviewWordCooldown = rand(8, 14);
  focusHintEl.classList.add('dt-hidden');

  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;

    if (timeLeft <= 5)       timerEl.className = 'danger';
    else if (timeLeft <= 10) timerEl.className = 'warn';

    updateLiveStats();
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function endGame() {
  gameOver = true;
  clearInterval(timerInterval);
  hideAutocomplete(true);
  hideLegacy(true);
  reviewEl.classList.add('dt-hidden');

  // Standard WPM: (correct chars / 5) / minutes
  const minutes  = timerDuration / 60;
  const wpm      = Math.round((correctChars / 5) / minutes);
  const acc      = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
  // LOC/hr: roughly WPM * 8 (avg 40 chars/line, WPM*5 chars/min * 60 / 40)
  const locPerHr = Math.round(wpm * 8);

  document.getElementById('r-loc').textContent   = locPerHr;
  document.getElementById('r-acc').textContent   = Math.min(acc, 100) + '%';
  document.getElementById('r-bugs').textContent  = errorCount;
  document.getElementById('r-words').textContent = wordsCorrect;

  const verdict = VERDICTS.find(([lo, hi]) => wpm >= lo && wpm < hi);
  document.getElementById('dt-verdict').textContent = verdict ? verdict[2] : '// undefined behavior';

  resultsEl.classList.remove('dt-hidden');
}

function resetGame() {
  clearInterval(timerInterval);
  hideAutocomplete(true);
  hideLegacy(true);
  reviewEl.classList.add('dt-hidden');

  gameStarted        = false;
  gameOver           = false;
  timeLeft           = timerDuration;
  currentWordIdx     = 0;
  currentInput       = '';
  correctChars       = 0;
  totalChars         = 0;
  errorCount         = 0;
  wordsCorrect       = 0;
  lineHeight         = 0;
  acVisible          = false;
  acWordCooldown     = 0;
  correctStreak      = 0;
  reviewWordCooldown = 0;
  reviewPending      = false;

  timerEl.textContent = timerDuration;
  timerEl.className   = '';
  liveWpmEl.textContent = '—';
  liveAccEl.textContent = '—';

  wordsEl.style.transform = '';
  focusHintEl.classList.remove('dt-hidden');
  resultsEl.classList.add('dt-hidden');

  words = generateWords(120);
  renderWords();
  inputEl.value = '';
  inputEl.focus();
}

function updateLiveStats() {
  if (!gameStarted) return;
  const elapsed  = Math.max(timerDuration - timeLeft, 1);
  const minutes  = elapsed / 60;
  const wpm      = Math.round((correctChars / 5) / minutes);
  const acc      = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
  liveWpmEl.textContent = Math.round(wpm * 8) + '';
  liveAccEl.textContent = Math.min(acc, 100) + '%';
}

// ==========================================
// OPTION B — Autocomplete (mid-word + aggression)
// ==========================================

function checkMidWordAutocomplete() {
  if (!gameStarted || gameOver || acVisible || acWordCooldown > 0) return;
  if (currentInput.length < 3) return;

  // Find a suggestion that matches what's being typed
  const match = AC_SUGGESTIONS.find(([prefix]) =>
    prefix.toLowerCase().startsWith(currentInput.toLowerCase()) ||
    currentInput.toLowerCase().startsWith(prefix.toLowerCase().slice(0, currentInput.length))
  );

  // Trigger with some probability (more often the higher the streak)
  const chance = 0.25 + Math.min(correctStreak * 0.04, 0.45);
  if (match && Math.random() < chance) {
    showAutocomplete(match[0], match[1]);
  }
}

function showAutocomplete(typed, rest) {
  const wordEl = wordEls[currentWordIdx];
  if (!wordEl) return;

  const wordRect = wordEl.getBoundingClientRect();
  const contRect = containerEl.getBoundingClientRect();
  const left = Math.max(4, wordRect.left - contRect.left);
  const top  = wordRect.bottom - contRect.top + 6;

  acTypedEl.textContent = typed;
  acRestEl.textContent  = rest;
  acEl.style.left = left + 'px';
  acEl.style.top  = top  + 'px';
  acEl.classList.remove('dt-hidden', 'ac-visible');
  void acEl.offsetWidth;
  acEl.classList.add('ac-visible');
  acVisible = true;

  clearTimeout(acTimer);
  // More aggressive = shorter display time + faster return
  const displayMs = Math.max(1400, 2600 - correctStreak * 80);
  acTimer = setTimeout(() => hideAutocomplete(false), displayMs);

  // Aggression: next cooldown shrinks with streak
  acWordCooldown = Math.max(2, 7 - Math.floor(correctStreak / 4));
}

function hideAutocomplete(instant) {
  clearTimeout(acTimer);
  if (instant) {
    acEl.classList.add('dt-hidden');
    acEl.classList.remove('ac-visible');
  } else {
    acEl.classList.remove('ac-visible');
    setTimeout(() => acEl.classList.add('dt-hidden'), 200);
  }
  acVisible = false;
}

// ==========================================
// OPTION C — Code Review: retype rejected words
// ==========================================

function triggerCodeReview() {
  if (gameOver || currentWordIdx < 2 || reviewPending) return;

  // Pick the most recently completed word as the victim
  const srcIdx    = currentWordIdx - 1;
  const srcWord   = words[srcIdx];
  const comment   = REVIEW_COMMENTS[Math.floor(Math.random() * REVIEW_COMMENTS.length)];

  // Mark the completed word with strikethrough
  wordEls[srcIdx].classList.add('rejected');

  // Show floating review comment next to it
  showFloatingReview(wordEls[srcIdx], comment);

  // Inject the word back into the queue at current position
  words.splice(currentWordIdx, 0, srcWord);
  const reviewEl_word = createWordEl(srcWord, true);
  const refEl = wordEls[currentWordIdx];
  wordsEl.insertBefore(reviewEl_word, refEl);
  wordEls.splice(currentWordIdx, 0, reviewEl_word);
  lineHeight = 0; // recalculate after DOM change

  reviewPending      = true;
  reviewWordCooldown = rand(10, 16);

  setCurrentWord();
}

function showFloatingReview(wordEl, comment) {
  const wordRect = wordEl.getBoundingClientRect();
  const contRect = containerEl.getBoundingClientRect();

  reviewEl.textContent = comment;
  reviewEl.style.left  = (wordRect.right - contRect.left + 8) + 'px';
  reviewEl.style.top   = (wordRect.top   - contRect.top  + 2) + 'px';
  reviewEl.classList.remove('dt-hidden', 'rev-visible');
  void reviewEl.offsetWidth;
  reviewEl.classList.add('rev-visible');

  setTimeout(() => {
    reviewEl.classList.remove('rev-visible');
    setTimeout(() => reviewEl.classList.add('dt-hidden'), 250);
  }, 2000);
}

// ==========================================
// LEGACY PAUSE WARNING
// ==========================================

function resetLegacyTimer() {
  clearTimeout(legacyTimer);
  hideLegacy(false);
  if (!gameStarted || gameOver) return;

  legacyTimer = setTimeout(() => {
    if (gameOver) return;
    legacyEl.textContent = LEGACY_COMMENTS[legacyIdx % LEGACY_COMMENTS.length];
    legacyIdx++;
    legacyEl.classList.remove('dt-hidden');
    void legacyEl.offsetWidth;
    legacyEl.classList.add('leg-visible');
  }, 1600);
}

function hideLegacy(instant) {
  clearTimeout(legacyTimer);
  if (instant) {
    legacyEl.classList.add('dt-hidden');
    legacyEl.classList.remove('leg-visible');
  } else {
    legacyEl.classList.remove('leg-visible');
    setTimeout(() => legacyEl.classList.add('dt-hidden'), 300);
  }
}

// ==========================================
// FOCUS
// ==========================================

wordsWrapEl.addEventListener('click', () => {
  inputEl.focus();
  focusHintEl.classList.add('dt-hidden');
});

inputEl.addEventListener('focus', () => focusHintEl.classList.add('dt-hidden'));
inputEl.addEventListener('blur', () => {
  if (!gameStarted) focusHintEl.classList.remove('dt-hidden');
});

// ==========================================
// CONTROLS
// ==========================================

document.getElementById('dt-reset-btn').addEventListener('click', resetGame);
document.getElementById('dt-restart-btn').addEventListener('click', resetGame);

document.querySelectorAll('.dt-time-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.dt-time-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    timerDuration = parseInt(btn.dataset.time);
    resetGame();
  });
});

// ==========================================
// INIT
// ==========================================

window.addEventListener('load', () => {
  words = generateWords(120);
  renderWords();
  inputEl.focus();
});
