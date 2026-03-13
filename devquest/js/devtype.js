// ==========================================
// DevType — Dev-themed typing game
// Features: dev word pool, autocomplete troll,
//           code review comments, legacy pause warning
// ==========================================

// ==========================================
// WORD POOL
// ==========================================

const WORD_POOL = [
  // Short identifiers
  'i', 'j', 'x', 'fn', 'cb', 'err', 'res', 'req', 'ctx', 'tmp',
  'null', 'void', 'bool', 'true', 'NaN', 'self', 'this',
  'node', 'root', 'heap', 'tree', 'hash', 'blob', 'byte', 'enum',

  // Core syntax
  'const', 'async', 'await', 'yield', 'throw', 'catch', 'break',
  'class', 'event', 'scope', 'parse', 'query', 'proxy', 'token',
  'build', 'spawn', 'mutex', 'stdin', 'stdout', 'chmod', 'mkdir',

  // Dev vocabulary
  'debug', 'fetch', 'merge', 'stash', 'blame', 'clone', 'patch',
  'rebase', 'commit', 'branch', 'deploy', 'cache', 'queue', 'stack',

  // Errors & exceptions
  'undefined', 'TypeError', 'SyntaxError', 'ReferenceError',
  'segfault', 'deadlock', 'overflow', 'timeout', 'exception',

  // Tools
  'npm', 'yarn', 'pip', 'git', 'docker', 'nginx', 'redis',
  'webpack', 'eslint', 'prettier', 'gradle', 'cargo', 'kubectl',

  // Legacy / cursed naming
  'tmp2', 'x1', 'res2', 'HACK', 'TODO', 'FIXME',
  'finalFinal', 'doTheThing', 'PLEASE_WORK', 'dontDelete',
  'temp_v2', 'fixLater', 'copy_copy', 'test123', 'oldCode',

  // Long satisfying words
  'localhost', 'callback', 'middleware', 'singleton', 'deprecated',
  'refactor', 'migration', 'injection', 'recursion', 'abstraction',
  'spaghetti', 'bandwidth', 'endpoint', 'boilerplate', 'kubernetes',
  'monkeypatch', 'encapsulation', 'microservice', 'serverless',

  // Humor
  'itDepends', 'notABug', 'hotfix', 'agile', 'scrum',
  'standup', 'sprint', 'synergy', 'pivot', 'leverage',
  'blockchain', 'paradigm', 'disruptive', 'technical', 'debt',
];

// ==========================================
// QUIRK DATA
// ==========================================

// Autocomplete: [what's typed so far, what it "suggests" completing to]
const AC_SUGGESTIONS = [
  ['undefined', ' is not a function'],
  ['null',      'PointerException'],
  ['git',       ' push --force'],
  ['docker',    ' rm -f $(docker ps -aq)'],
  ['localhost', ':3000/api/secret'],
  ['TODO',      ': ask someone else'],
  ['npm',       ' install --save-dev everything'],
  ['async',     ' hell()'],
  ['tmp',       '_final_FINAL_v3'],
  ['deploy',    ' to production (Friday 5pm)'],
  ['fix',       'Later() // famous last words'],
  ['PLEASE',    '_WORK_v2'],
  ['merge',     ' conflict'],
  ['debug',     '("why")'],
  ['callback',  'Hell()'],
  ['technical', 'Debt++'],
];

// Code review comments that pop up
const REVIEW_COMMENTS = [
  '// naming?',
  '// O(n²)?',
  '// really?',
  '// deprecated',
  '// needs tests',
  '// magic number',
  '// side effects?',
  '// why tho',
  '// needs docs',
  '// too clever',
  '// refactor pls',
  '// not your best',
  '// asked ChatGPT?',
  '// ship it anyway',
];

// Legacy warning variants
const LEGACY_COMMENTS = [
  '// written in 2009, don\'t touch',
  '// no one knows what this does',
  '// here be dragons',
  '// if it works don\'t touch it',
];

// Result verdicts by WPM
const VERDICTS = [
  [0,   15, '// still in tutorial mode'],
  [15,  30, '// compiling at runtime'],
  [30,  50, '// acceptable. barely.'],
  [50,  70, '// merge approved (with comments)'],
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

let correctChars = 0;
let totalChars   = 0;
let errorCount   = 0;
let wordsCorrect = 0;

// Quirk state
let acTimer       = null;
let acVisible     = false;
let acCountdown   = 0;

let reviewCount   = 0;
let reviewAt      = 0;

let legacyTimer   = null;
let legacyShown   = false;
let legacyIdx     = 0;

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

function generateWords(n = 100) {
  const pool = shuffle(WORD_POOL);
  const out  = [];
  for (let i = 0; i < n; i++) out.push(pool[i % pool.length]);
  return out;
}

// ==========================================
// RENDER
// ==========================================

function renderWords() {
  wordsEl.innerHTML = '';
  wordEls = [];
  lineHeight = 0;

  words.forEach((word, wi) => {
    const div = document.createElement('div');
    div.className = 'dt-word';
    div.dataset.wi = wi;

    word.split('').forEach(ch => {
      const span = document.createElement('span');
      span.className = 'dt-char pending';
      span.textContent = ch;
      div.appendChild(span);
    });

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

  const chars = wordEl.querySelectorAll('.dt-char:not(.extra)');
  const extras = wordEl.querySelectorAll('.dt-char.extra');
  let left = 0;

  if (currentInput.length > 0) {
    const allChars = [...chars, ...extras];
    const idx = Math.min(currentInput.length, allChars.length) - 1;
    if (allChars[idx]) {
      const charRect = allChars[idx].getBoundingClientRect();
      const wordRect = wordEl.getBoundingClientRect();
      left = charRect.right - wordRect.left;
    }
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

  const top0    = wordEls[0].offsetTop;
  const topCur  = wordEls[currentWordIdx].offsetTop;
  const row     = Math.round((topCur - top0) / lh);

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

  // Remove old extras
  wordEl.querySelectorAll('.dt-char.extra').forEach(e => e.remove());

  chars.forEach((span, i) => {
    span.className = 'dt-char';
    if (i < currentInput.length) {
      span.classList.add(currentInput[i] === word[i] ? 'correct' : 'wrong');
    } else {
      span.classList.add('pending');
    }
  });

  // Extra characters typed beyond word length
  if (currentInput.length > word.length) {
    currentInput.slice(word.length).split('').forEach(ch => {
      const span = document.createElement('span');
      span.className = 'dt-char extra';
      span.textContent = ch;
      wordEl.appendChild(span);
    });
  }

  updateCursor();
}

// ==========================================
// INPUT HANDLING
// ==========================================

inputEl.addEventListener('input', () => {
  if (gameOver) return;

  const val = inputEl.value;

  // Space = submit word
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
  // Tab does nothing (troll: autocomplete doesn't work)
  if (e.key === 'Tab') { e.preventDefault(); return; }

  // Don't backspace to previous word
  if (e.key === 'Backspace' && currentInput === '' && inputEl.value === '') {
    e.preventDefault();
  }
});

function submitWord(typed) {
  if (!gameStarted) startGame();
  if (gameOver) return;

  const word      = words[currentWordIdx];
  const isCorrect = typed === word;

  if (isCorrect) {
    wordsCorrect++;
    correctChars += word.length;
  } else {
    errorCount++;
  }
  totalChars += typed.length;

  // Freeze the done word's character colors
  const wordEl = wordEls[currentWordIdx];
  const chars  = wordEl.querySelectorAll('.dt-char:not(.extra)');
  wordEl.querySelectorAll('.dt-char.extra').forEach(e => e.remove());
  chars.forEach((span, i) => {
    span.className = 'dt-char ' + (typed[i] === word[i] ? 'correct' : 'wrong');
  });
  wordEl.classList.add('done');

  currentWordIdx++;
  currentInput = '';
  inputEl.value = '';

  acCountdown--;
  reviewCount++;

  if (acCountdown <= 0 && !acVisible) maybeAutocomplete();
  if (reviewCount >= reviewAt)         triggerReview();

  setCurrentWord();
  updateLiveStats();
}

// ==========================================
// GAME FLOW
// ==========================================

function startGame() {
  gameStarted = true;
  focusHintEl.classList.add('dt-hidden');
  acCountdown = rand(5, 10);
  reviewAt    = rand(8, 14);

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

  const elapsed  = timerDuration;
  const wpm      = Math.round((wordsCorrect / elapsed) * 60);
  const acc      = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
  const locPerHr = wpm * 12; // inflated — devs always overestimate

  document.getElementById('r-loc').textContent   = locPerHr;
  document.getElementById('r-acc').textContent   = Math.min(acc, 100) + '%';
  document.getElementById('r-bugs').textContent  = errorCount;
  document.getElementById('r-words').textContent = wordsCorrect;

  const verdict = VERDICTS.find(([lo, hi]) => wpm >= lo && wpm < hi);
  document.getElementById('dt-verdict').textContent = verdict ? verdict[2] : '';

  resultsEl.classList.remove('dt-hidden');
}

function resetGame() {
  clearInterval(timerInterval);
  hideAutocomplete(true);
  hideLegacy(true);
  reviewEl.classList.add('dt-hidden');

  gameStarted    = false;
  gameOver       = false;
  timeLeft       = timerDuration;
  currentWordIdx = 0;
  currentInput   = '';
  correctChars   = 0;
  totalChars     = 0;
  errorCount     = 0;
  wordsCorrect   = 0;
  lineHeight     = 0;
  acVisible      = false;
  acCountdown    = 0;
  reviewCount    = 0;
  reviewAt       = 0;

  timerEl.textContent = timerDuration;
  timerEl.className   = '';
  liveWpmEl.textContent = '—';
  liveAccEl.textContent = '—';

  wordsEl.style.transform = '';
  focusHintEl.classList.remove('dt-hidden');
  resultsEl.classList.add('dt-hidden');

  words = generateWords(100);
  renderWords();
  inputEl.value = '';
  inputEl.focus();
}

function updateLiveStats() {
  if (!gameStarted) return;
  const elapsed  = Math.max(timerDuration - timeLeft, 1);
  const wpm      = Math.round((wordsCorrect / elapsed) * 60);
  const acc      = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
  liveWpmEl.textContent = wpm * 12 + '';
  liveAccEl.textContent = Math.min(acc, 100) + '%';
}

// ==========================================
// QUIRK: AUTOCOMPLETE TROLL
// ==========================================

function maybeAutocomplete() {
  if (gameOver || !gameStarted) return;

  const word    = words[currentWordIdx] || '';
  const wordEl  = wordEls[currentWordIdx];
  if (!wordEl) return;

  // Find a matching suggestion or use a generic one
  let typed = '', rest = '';
  const match = AC_SUGGESTIONS.find(([prefix]) =>
    word.toLowerCase().startsWith(prefix.toLowerCase()) || word === prefix
  );

  if (match) {
    typed = match[0];
    rest  = match[1];
  } else {
    typed = word;
    rest  = '_FINAL_v2';
  }

  // Position below the current word
  const wordRect = wordEl.getBoundingClientRect();
  const wrapRect = wordsWrapEl.getBoundingClientRect();
  const left = Math.max(0, wordRect.left - wrapRect.left);
  const top  = wordRect.bottom - wrapRect.top + 5;

  acTypedEl.textContent = typed;
  acRestEl.textContent  = rest;
  acEl.style.left = left + 'px';
  acEl.style.top  = top + 'px';
  acEl.classList.remove('dt-hidden', 'ac-visible');
  void acEl.offsetWidth;
  acEl.classList.add('ac-visible');
  acVisible = true;

  clearTimeout(acTimer);
  acTimer = setTimeout(() => hideAutocomplete(false), 2600);
  acCountdown = rand(6, 11);
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
// QUIRK: CODE REVIEW COMMENT
// ==========================================

function triggerReview() {
  if (gameOver || currentWordIdx < 1) return;

  const prevEl = wordEls[currentWordIdx - 1];
  if (!prevEl) return;

  const comment  = REVIEW_COMMENTS[Math.floor(Math.random() * REVIEW_COMMENTS.length)];
  const wordRect = prevEl.getBoundingClientRect();
  const wrapRect = wordsWrapEl.getBoundingClientRect();

  reviewEl.textContent  = comment;
  reviewEl.style.left   = (wordRect.right - wrapRect.left + 8) + 'px';
  reviewEl.style.top    = (wordRect.top   - wrapRect.top  + 2) + 'px';
  reviewEl.classList.remove('dt-hidden', 'rev-visible');
  void reviewEl.offsetWidth;
  reviewEl.classList.add('rev-visible');

  setTimeout(() => {
    reviewEl.classList.remove('rev-visible');
    setTimeout(() => reviewEl.classList.add('dt-hidden'), 250);
  }, 1500);

  reviewCount = 0;
  reviewAt    = rand(9, 15);
}

// ==========================================
// QUIRK: LEGACY PAUSE WARNING
// ==========================================

function resetLegacyTimer() {
  clearTimeout(legacyTimer);
  if (legacyShown) hideLegacy(false);

  if (!gameStarted || gameOver) return;
  legacyTimer = setTimeout(() => {
    if (gameOver) return;
    legacyEl.textContent = LEGACY_COMMENTS[legacyIdx % LEGACY_COMMENTS.length];
    legacyIdx++;
    legacyEl.classList.remove('dt-hidden');
    void legacyEl.offsetWidth;
    legacyEl.classList.add('leg-visible');
    legacyShown = true;
  }, 1600);
}

function hideLegacy(instant) {
  clearTimeout(legacyTimer);
  legacyShown = false;
  if (instant) {
    legacyEl.classList.add('dt-hidden');
    legacyEl.classList.remove('leg-visible');
  } else {
    legacyEl.classList.remove('leg-visible');
    setTimeout(() => legacyEl.classList.add('dt-hidden'), 300);
  }
}

// ==========================================
// FOCUS MANAGEMENT
// ==========================================

wordsWrapEl.addEventListener('click', () => {
  inputEl.focus();
  focusHintEl.classList.add('dt-hidden');
});

inputEl.addEventListener('focus', () => focusHintEl.classList.add('dt-hidden'));
inputEl.addEventListener('blur',  () => {
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
// UTILITIES
// ==========================================

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ==========================================
// INIT
// ==========================================

window.addEventListener('load', () => {
  words = generateWords(100);
  renderWords();
  inputEl.focus();
});
