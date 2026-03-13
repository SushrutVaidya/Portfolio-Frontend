// ==========================================
// DevType — difficulty-aware typing game
// Easy:   bio text + iMessage + notification quirks
// Medium: dev word pool + autocomplete + legacy
// Hard:   SHA values + all quirks + SHA fade
// ==========================================

// ==========================================
// DIFFICULTY CONFIG
// ==========================================

const DIFF_CONFIG = {
  easy: {
    timer:    60,
    passAcc:  70,
    accent:   '#a6e3a1',
    subtitle: '60 seconds · 70% accuracy to pass',
    quirks:   ['imessage', 'notification'],
  },
  medium: {
    timer:    60,
    passAcc:  80,
    accent:   '#89b4fa',
    subtitle: '60 seconds · 80% accuracy to pass',
    quirks:   ['autocomplete', 'review', 'legacy'],
  },
  hard: {
    timer:    45,
    passAcc:  95,
    accent:   '#f38ba8',
    subtitle: '45 seconds · 95% accuracy · good luck',
    quirks:   ['autocomplete', 'review', 'legacy', 'sha-fade'],
  },
};

let currentDifficulty = 'easy';

// ==========================================
// WORD POOLS
// ==========================================

// Easy — Sushrut's bio (ordered, not shuffled)
const EASY_TEXT = [
  'Hi', 'I', 'am', 'Sushrut', 'a', 'backend', 'developer', 'from', 'Hyderabad',
  'I', 'spend', 'my', 'days', 'writing', 'Java', 'and', 'my', 'nights', 'losing', 'in', 'CS2',
  'I', 'built', 'DevQuest', 'to', 'gatekeep', 'my', 'portfolio', 'from', 'the', 'normies',
  'My', 'stack', 'includes', 'Spring', 'Boot', 'Redis', 'Docker', 'and', 'questionable', 'decisions',
  'I', 'enjoy', 'rickrolling', 'unsuspecting', 'visitors', 'and', 'shipping', 'hotfixes', 'at', '2am',
  'If', 'you', 'made', 'it', 'this', 'far', 'you', 'are', 'probably', 'a', 'developer',
  'or', 'very', 'very', 'lost', 'either', 'way', 'welcome', 'to', 'my', 'portfolio',
];

// Medium — dev / cli word pool
const MEDIUM_POOL = [
  'git-push', 'git-blame', 'git-stash', 'git-rebase', 'git-cherry-pick',
  'npm-install', 'npm-audit', 'npm-ci', 'yarn-add', 'pip-install',
  'docker-ps', 'docker-build', 'kubectl-get', 'chmod-755', 'sudo!!',
  'ls-la', 'grep-rn', 'rm-rf', 'cd..', 'cat-EOF',
  'console.log', 'console.error', 'console.warn',
  'process.env', 'process.exit', 'JSON.parse', 'JSON.stringify',
  'Object.keys', 'Array.from', 'Promise.all', 'Promise.reject',
  'localhost:3000', 'localhost:8080', '127.0.0.1', '/dev/null',
  'undefined', 'null', 'NaN', 'Infinity', 'void_0',
  'finalFinal', 'tmp2', 'PLEASE_WORK', 'doTheThing', 'x1',
  'dontDelete', 'oldCode', 'temp_v2', 'copy_copy', 'test123',
  'async', 'await', 'yield', 'const', 'typeof', 'instanceof',
  'TypeError', 'SyntaxError', 'ReferenceError', 'RangeError',
  'segfault', 'deadlock', 'overflow', 'OutOfMemory', 'SIGKILL',
  'TODO', 'FIXME', 'HACK', 'NOTE', 'XXX',
  'hotfix', 'refactor', 'deprecated', 'legacy', 'technical-debt',
  'webpack', 'eslint', 'prettier', 'docker', 'nginx', 'redis',
  'kubernetes', 'terraform', 'ansible', 'grafana', 'prometheus',
  'singleton', 'middleware', 'callback-hell', 'race-condition',
  'monkeypatch', 'boilerplate', 'microservice', 'deadcode',
];

// Hard — git short SHAs (8-char hex)
const SHA_POOL = [
  'a3f2b1c8', 'd9e4f5a6', 'b7c8d9e0', 'f1a2b3c4', 'e5d6c7b8',
  'a9b0c1d2', 'e3f4a5b6', 'c7d8e9f0', '1a2b3c4d', '5e6f7a8b',
  '9c0d1e2f', '3a4b5c6d', '7e8f9a0b', '1c2d3e4f', '5a6b7c8d',
  '9e0f1a2b', '3c4d5e6f', '7a8b9c0d', '1e2f3a4b', '5c6d7e8f',
  '0a1b2c3d', '4e5f6a7b', '8c9d0e1f', '2a3b4c5d', '6e7f8a9b',
  'fe3a91b2', 'c084d5e6', '7f2a3b4c', 'd1e2f3a4', 'b5c6d7e8',
  '2f3a4b5c', '6d7e8f9a', '0b1c2d3e', '4f5a6b7c', '8e9f0a1b',
  'dead1234', 'cafe5678', 'f00dface', 'b00b1e5c', '1337c0de',
];

// ==========================================
// QUIRK DATA
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
  ['PLEASE',     '_WORK_for_the_love_of_god'],
  ['process',    '.exit(1) // just give up'],
  ['Promise',    '.reject("my life choices")'],
];

const REVIEW_COMMENTS = [
  '// naming?', '// O(n²)?', '// really?', '// deprecated since forever',
  '// needs unit tests', '// magic number', '// side effects?', '// why tho',
  '// needs docs', '// too clever by half', '// refactor in next sprint (never)',
  '// asked ChatGPT?', '// ship it and pray', '// i wrote this at 2am',
];

const LEGACY_COMMENTS = [
  '// written in 2009, don\'t touch',
  '// no one knows what this does',
  '// here be dragons',
  '// if it works, don\'t touch it',
  '// the original dev left the company',
];

// Easy quirk data
const IMESSAGE_POOL = [
  { sender: 'Sushrut',  text: 'bro you there?' },
  { sender: 'Sushrut',  text: '??' },
  { sender: 'teammate', text: 'are you even trying lol' },
  { sender: 'Mom',      text: 'call me when free beta' },
  { sender: 'Sushrut',  text: 'stop playing games' },
  { sender: '',         text: '✓✓ seen 11:42 PM' },
  { sender: 'teammate', text: 'we lost because of you' },
  { sender: 'Sushrut',  text: 'touch grass bro' },
];

const NOTIFICATION_POOL = [
  { icon: '🎮', app: 'CS2',      msg: 'Your team is losing. Join now?' },
  { icon: '🐙', app: 'GitHub',   msg: '1 new comment: "why tho"' },
  { icon: '💼', app: 'LinkedIn', msg: 'A recruiter viewed your profile' },
  { icon: '💬', app: 'Slack',    msg: 'Standup in 2 minutes ⏰' },
  { icon: '▲',  app: 'Vercel',   msg: 'Deployment failed (again)' },
  { icon: '📅', app: 'Calendar', msg: 'Sprint planning: now' },
  { icon: '📱', app: 'Mom',      msg: 'Call me when free beta' },
  { icon: '🐙', app: 'GitHub',   msg: 'Build failed: 42 errors' },
  { icon: '🎮', app: 'CS2',      msg: 'New match found. Teammates waiting.' },
  { icon: '💬', app: 'Slack',    msg: 'You have 14 unread messages' },
];

// Mocking retry labels on fail by accuracy range
const RETRY_TAUNTS = [
  [0,  50, 'git reset --hard HEAD'],
  [50, 65, 'sudo apt-get fix-skills'],
  [65, 80, 'npm run try-harder --force'],
  [80, 95, '↻  so close. embarrassing really.'],
];

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
let timeLeft       = 90;
let timerInterval  = null;

let correctChars = 0;
let totalChars   = 0;
let errorCount   = 0;
let wordsCorrect = 0;

// Quirk counters
let acWordCooldown     = 0;
let correctStreak      = 0;
let reviewWordCooldown = 0;
let reviewPending      = false;
let legacyTimer        = null;
let legacyIdx          = 0;
let acTimer            = null;
let acVisible          = false;

// Easy quirks
let imessageCountdown  = 0;
let notifCountdown     = 0;
let imIdx              = 0;
let notifIdx           = 0;
let imTimer            = null;
let notifTimer         = null;

// Hard quirk
let shaFadeTimer = null;

// ==========================================
// DOM REFS
// ==========================================

const containerEl = document.getElementById('devtype-container');
const wordsWrapEl = document.getElementById('dt-words-wrap');
const wordsEl     = document.getElementById('dt-words');
const inputEl     = document.getElementById('dt-input');
const timerEl     = document.getElementById('dt-progress');
const liveWpmEl   = document.getElementById('dt-live-wpm');
const liveAccEl   = document.getElementById('dt-live-acc');
const focusHintEl = document.getElementById('dt-focus-hint');
const resultsEl   = document.getElementById('dt-results');
const acEl        = document.getElementById('dt-autocomplete');
const acTypedEl   = document.getElementById('dt-ac-typed');
const acRestEl    = document.getElementById('dt-ac-rest');
const reviewEl    = document.getElementById('dt-review');
const legacyEl    = document.getElementById('dt-legacy');
const imEl        = document.getElementById('dt-imessage');
const imSenderEl  = document.getElementById('im-sender');
const imTextEl    = document.getElementById('im-text');
const notifEl     = document.getElementById('dt-notification');
const notifIconEl = document.getElementById('notif-icon');
const notifAppEl  = document.getElementById('notif-app');
const notifMsgEl  = document.getElementById('notif-msg');

// Extra state for new features
let wpmSamples    = [];
let sampleInterval = null;

const accBarEl      = document.getElementById('dt-acc-bar');
const accThreshEl   = document.getElementById('dt-acc-threshold');

// ==========================================
// STREAK BADGE
// ==========================================

// ==========================================
// PER-CHARACTER HIGHLIGHT
// ==========================================

function highlightCurrentChar() {
  document.querySelectorAll('.dt-char.current-char')
    .forEach(el => el.classList.remove('current-char'));

  const wordEl = wordEls[currentWordIdx];
  if (!wordEl) return;
  const chars = wordEl.querySelectorAll('.dt-char:not(.extra)');
  const pos   = currentInput.length;
  if (chars[pos]) chars[pos].classList.add('current-char');
}

// ==========================================
// ACCURACY BAR
// ==========================================

function updateAccBar() {
  if (!gameStarted) return;
  const acc      = totalChars > 0 ? (correctChars / totalChars) * 100 : 100;
  const passAcc  = DIFF_CONFIG[currentDifficulty].passAcc;
  const accent   = DIFF_CONFIG[currentDifficulty].accent;

  accBarEl.style.width = Math.min(acc, 100) + '%';

  // Color: accent when passing, amber when close, red when failing
  if (acc >= passAcc)          accBarEl.style.background = accent;
  else if (acc >= passAcc - 10) accBarEl.style.background = '#fab387';
  else                          accBarEl.style.background = '#f38ba8';

  // Threshold pip position
  accThreshEl.style.left              = passAcc + '%';
  accThreshEl.dataset.label           = passAcc + '%';
}

function resetAccBar() {
  accBarEl.style.width      = '0%';
  accBarEl.style.background = DIFF_CONFIG[currentDifficulty].accent;
  accThreshEl.style.left    = DIFF_CONFIG[currentDifficulty].passAcc + '%';
  accThreshEl.dataset.label = DIFF_CONFIG[currentDifficulty].passAcc + '%';
}

// ==========================================
// WPM GRAPH
// ==========================================

function startWpmSampling() {
  wpmSamples = [];
  clearInterval(sampleInterval);
  sampleInterval = setInterval(() => {
    const elapsed = DIFF_CONFIG[currentDifficulty].timer - timeLeft;
    const wpm     = Math.round((correctChars / 5) / Math.max(elapsed / 60, 0.01));
    wpmSamples.push({ time: elapsed, wpm });
  }, 5000);
}

function smoothPath(pts) {
  if (pts.length < 2) return pts.length === 1 ? `M ${pts[0].x} ${pts[0].y}` : '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p0  = pts[i - 1], p1 = pts[i];
    const cpx = (p0.x + p1.x) / 2;
    d += ` C ${cpx} ${p0.y} ${cpx} ${p1.y} ${p1.x} ${p1.y}`;
  }
  return d;
}

function drawWpmGraph() {
  const svg       = document.getElementById('dt-graph-svg');
  const emptyEl   = document.getElementById('dt-graph-empty');
  const config    = DIFF_CONFIG[currentDifficulty];
  const accent    = config.accent;
  const W = 560, H = 80, pad = { t: 8, r: 8, b: 12, l: 8 };

  document.getElementById('dt-graph-xn').textContent = config.timer + 's';

  if (wpmSamples.length < 2) {
    emptyEl.classList.remove('dt-hidden');
    svg.style.display = 'none';
    return;
  }

  emptyEl.classList.add('dt-hidden');
  svg.style.display = '';

  const maxWpm  = Math.max(...wpmSamples.map(s => s.wpm), 10);
  const maxTime = config.timer;
  const toX     = t => pad.l + (t / maxTime) * (W - pad.l - pad.r);
  const toY     = w => H - pad.b - (w / maxWpm) * (H - pad.t - pad.b);

  const pts      = wpmSamples.map(s => ({ x: toX(s.time), y: toY(s.wpm), wpm: s.wpm }));
  const linePath = smoothPath(pts);
  const fillPath = `${linePath} L ${pts[pts.length - 1].x} ${H - pad.b} L ${pts[0].x} ${H - pad.b} Z`;

  svg.innerHTML = `
    <defs>
      <linearGradient id="wpm-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="${accent}" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
      </linearGradient>
      <filter id="line-glow" x="-20%" y="-50%" width="140%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    <!-- Subtle mid grid line -->
    <line x1="${pad.l}" y1="${H / 2}" x2="${W - pad.r}" y2="${H / 2}"
          stroke="rgba(255,255,255,0.04)" stroke-width="1"/>

    <!-- Gradient fill -->
    <path d="${fillPath}" fill="url(#wpm-grad)"/>

    <!-- Animated line -->
    <path class="graph-line" d="${linePath}"
          stroke="${accent}" stroke-width="2" fill="none"
          stroke-linecap="round" stroke-linejoin="round"
          filter="url(#line-glow)"/>

    <!-- Dots with staggered pop animation -->
    ${pts.map((p, i) => `
      <circle cx="${p.x}" cy="${p.y}" r="3" fill="${accent}"
              style="animation: dotPop 0.4s cubic-bezier(0.34,1.56,0.64,1) ${i * 80}ms both">
        <title>${p.wpm} WPM at ${wpmSamples[i].time}s</title>
      </circle>
    `).join('')}
  `;

  // Animate the line drawing
  const lineEl = svg.querySelector('.graph-line');
  const len    = lineEl.getTotalLength();
  lineEl.style.strokeDasharray  = len;
  lineEl.style.strokeDashoffset = len;
  lineEl.style.animation        = 'drawLine 0.9s ease forwards 0.1s';
}

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

function hasQuirk(name) {
  return DIFF_CONFIG[currentDifficulty].quirks.includes(name);
}

function generateWords() {
  if (currentDifficulty === 'easy') {
    return [...EASY_TEXT]; // ordered bio text
  } else if (currentDifficulty === 'hard') {
    const pool = shuffle([...SHA_POOL, ...SHA_POOL, ...SHA_POOL]);
    return pool.slice(0, 80);
  } else {
    return shuffle([...MEDIUM_POOL, ...MEDIUM_POOL]).slice(0, 120);
  }
}

// ==========================================
// DIFFICULTY SYSTEM
// ==========================================

function setDifficulty(diff) {
  currentDifficulty = diff;
  const config = DIFF_CONFIG[diff];

  // Update accent CSS variable
  containerEl.style.setProperty('--accent', config.accent);

  // Update subtitle
  document.getElementById('dt-subtitle').textContent = config.subtitle;

  // Slide the thumb
  const thumbPositions = { easy: '3px', medium: 'calc(33.33% + 1px)', hard: 'calc(66.66% + 1px)' };
  document.getElementById('dt-diff-thumb').style.left = thumbPositions[diff];

  // Update active button
  document.querySelectorAll('.dt-diff-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.diff === diff);
  });

  resetGame();
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
  words.forEach(word => {
    const div = createWordEl(word);
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
  highlightCurrentChar();
  scrollWords();
  if (hasQuirk('sha-fade')) startSHAFade();
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
    const idx      = Math.min(currentInput.length, allChars.length) - 1;
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
    if (wordEls[i].offsetTop > top0) { lineHeight = wordEls[i].offsetTop - top0; return lineHeight; }
  }
  return 0;
}

function scrollWords() {
  const lh = getLineHeight();
  if (!lh || !wordEls[currentWordIdx]) return;
  const top0   = wordEls[0].offsetTop;
  const topCur = wordEls[currentWordIdx].offsetTop;
  const row    = Math.round((topCur - top0) / lh);
  if (row >= 2) wordsEl.style.transform = `translateY(-${(row - 1) * lh}px)`;
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
    span.classList.add(i < currentInput.length ? (currentInput[i] === word[i] ? 'correct' : 'wrong') : 'pending');
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
  highlightCurrentChar();
  if (hasQuirk('autocomplete')) checkMidWordAutocomplete();
}

// ==========================================
// INPUT HANDLING
// ==========================================

inputEl.addEventListener('input', () => {
  if (gameOver) return;
  const val = inputEl.value;
  if (val.endsWith(' ')) { submitWord(val.trimEnd()); return; }
  if (!gameStarted && val.length > 0) startGame();
  currentInput = val;
  colorCurrentWord();
  resetLegacyTimer();
  updateLiveStats();
});

inputEl.addEventListener('keydown', e => {
  if (e.key === 'Tab') {
    e.preventDefault();
    if (acVisible) {
      const wrong = acTypedEl.textContent + acRestEl.textContent;
      inputEl.value = wrong;
      currentInput  = wrong;
      colorCurrentWord();
      hideAutocomplete(false);
      resetLegacyTimer();
      updateLiveStats();
    }
    return;
  }
  if (e.key === 'Backspace' && currentInput === '' && inputEl.value === '') e.preventDefault();
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
      if (correctStreak % 3 === 0) acWordCooldown = Math.max(2, acWordCooldown - 1);
    }
  } else {
    errorCount++;
    correctStreak = 0;
  }
  totalChars += typed.length;
  updateAccBar();

  // Freeze word visuals
  const wordEl = wordEls[currentWordIdx];
  wordEl.querySelectorAll('.dt-char.extra').forEach(e => e.remove());
  wordEl.querySelectorAll('.dt-char:not(.extra)').forEach((span, i) => {
    span.className = 'dt-char ' + (typed[i] === word[i] ? 'correct' : 'wrong');
  });
  wordEl.classList.add('done');

  if (isReview) {
    reviewPending = false;
    wordEls.forEach(el => el.classList.remove('rejected'));
  }

  currentWordIdx++;
  currentInput = '';
  inputEl.value = '';

  // Quirk countdowns (only for original words)
  if (!isReview) {
    acWordCooldown--;
    reviewWordCooldown--;
    imessageCountdown--;
    notifCountdown--;

    if (hasQuirk('review') && reviewWordCooldown <= 0 && !reviewPending) triggerCodeReview();
    if (hasQuirk('imessage') && imessageCountdown <= 0) triggerIMessage();
    if (hasQuirk('notification') && notifCountdown <= 0) triggerNotification();
  }

  clearTimeout(shaFadeTimer);
  setCurrentWord();
  updateLiveStats();
}

// ==========================================
// GAME FLOW
// ==========================================

function startGame() {
  gameStarted        = true;
  const config       = DIFF_CONFIG[currentDifficulty];
  acWordCooldown     = rand(5, 9);
  reviewWordCooldown = rand(8, 14);
  imessageCountdown  = rand(8, 14);
  notifCountdown     = rand(12, 18);
  focusHintEl.classList.add('dt-hidden');
  resetAccBar();
  startWpmSampling();

  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.innerHTML = `${timeLeft} <span class="dt-prog-total">s</span>`;
    if (timeLeft <= 5)       timerEl.className = 'dt-stat-val danger';
    else if (timeLeft <= 10) timerEl.className = 'dt-stat-val warn';
    updateLiveStats();
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function endGame() {
  gameOver = true;
  clearInterval(timerInterval);
  clearInterval(sampleInterval);
  clearTimeout(shaFadeTimer);
  hideAutocomplete(true);
  hideLegacy(true);
  hideIMessage(true);
  hideNotification(true);
  reviewEl.classList.add('dt-hidden');

  const config   = DIFF_CONFIG[currentDifficulty];
  const minutes  = config.timer / 60;
  const wpm      = Math.round((correctChars / 5) / minutes);
  const acc      = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
  const locPerHr = Math.round(wpm * 8);
  const passed   = acc >= config.passAcc;

  document.getElementById('r-loc').textContent  = locPerHr;
  document.getElementById('r-time').textContent = wordsCorrect;
  document.getElementById('r-acc').textContent  = Math.min(acc, 100) + '%';
  document.getElementById('r-bugs').textContent = errorCount;

  const badge = document.getElementById('dt-pass-badge');
  badge.textContent = passed
    ? '✓  challenge passed'
    : `✗  need ${config.passAcc}% accuracy to pass`;
  badge.className = passed ? 'pass' : 'fail';

  const verdict = VERDICTS.find(([lo, hi]) => wpm >= lo && wpm < hi);
  document.getElementById('dt-verdict').textContent = verdict ? verdict[2] : '// undefined behavior';

  const retryBtn   = document.getElementById('dt-restart-btn');
  const proceedBtn = document.getElementById('dt-proceed-btn');

  if (passed) {
    retryBtn.classList.add('dt-hidden');
    proceedBtn.classList.remove('dt-hidden');
  } else {
    proceedBtn.classList.add('dt-hidden');
    retryBtn.classList.remove('dt-hidden');
    const taunt = RETRY_TAUNTS.find(([lo, hi]) => acc >= lo && acc < hi);
    retryBtn.textContent = taunt ? taunt[2] : '↻  have you tried being better?';
  }

  resultsEl.classList.remove('dt-hidden');
  drawWpmGraph();
}

function resetGame() {
  clearInterval(timerInterval);
  clearTimeout(shaFadeTimer);
  hideAutocomplete(true);
  hideLegacy(true);
  hideIMessage(true);
  hideNotification(true);
  reviewEl.classList.add('dt-hidden');

  const config   = DIFF_CONFIG[currentDifficulty];
  gameStarted    = false;
  gameOver       = false;
  timeLeft       = config.timer;
  currentWordIdx = 0;
  currentInput   = '';
  correctChars   = 0;
  totalChars     = 0;
  errorCount     = 0;
  wordsCorrect   = 0;
  lineHeight     = 0;
  acVisible      = false;
  acWordCooldown = 0;
  correctStreak  = 0;
  reviewWordCooldown = 0;
  reviewPending  = false;
  wpmSamples     = [];
  clearInterval(sampleInterval);
  resetAccBar();

  timerEl.innerHTML = `${config.timer} <span class="dt-prog-total">s</span>`;
  timerEl.className = 'dt-stat-val';
  liveWpmEl.textContent = '—';
  liveAccEl.textContent = '—';

  document.getElementById('dt-restart-btn').classList.add('dt-hidden');
  document.getElementById('dt-proceed-btn').classList.add('dt-hidden');

  wordsEl.style.transform = '';
  focusHintEl.classList.remove('dt-hidden');
  resultsEl.classList.add('dt-hidden');

  words = generateWords();
  renderWords();
  inputEl.value = '';
  inputEl.focus();
}

function updateLiveStats() {
  if (!gameStarted) return;
  const config   = DIFF_CONFIG[currentDifficulty];
  const elapsed  = Math.max(config.timer - timeLeft, 1);
  const wpm      = Math.round((correctChars / 5) / (elapsed / 60));
  const acc      = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
  liveWpmEl.textContent = Math.round(wpm * 8) + '';
  liveAccEl.textContent = Math.min(acc, 100) + '%';
}

// ==========================================
// QUIRK: AUTOCOMPLETE (medium + hard)
// ==========================================

function checkMidWordAutocomplete() {
  if (!gameStarted || gameOver || acVisible || acWordCooldown > 0) return;
  if (currentInput.length < 3) return;
  const match = AC_SUGGESTIONS.find(([prefix]) =>
    prefix.toLowerCase().startsWith(currentInput.toLowerCase()) ||
    currentInput.toLowerCase().startsWith(prefix.toLowerCase().slice(0, currentInput.length))
  );
  const chance = 0.25 + Math.min(correctStreak * 0.04, 0.45);
  if (match && Math.random() < chance) showAutocomplete(match[0], match[1]);
}

function showAutocomplete(typed, rest) {
  const wordEl = wordEls[currentWordIdx];
  if (!wordEl) return;
  const wordRect = wordEl.getBoundingClientRect();
  const contRect = containerEl.getBoundingClientRect();
  acTypedEl.textContent = typed;
  acRestEl.textContent  = rest;
  acEl.style.left = Math.max(4, wordRect.left - contRect.left) + 'px';
  acEl.style.top  = (wordRect.bottom - contRect.top + 6) + 'px';
  acEl.classList.remove('dt-hidden', 'ac-visible');
  void acEl.offsetWidth;
  acEl.classList.add('ac-visible');
  acVisible = true;
  clearTimeout(acTimer);
  acTimer = setTimeout(() => hideAutocomplete(false), Math.max(1400, 2600 - correctStreak * 80));
  acWordCooldown = Math.max(2, 7 - Math.floor(correctStreak / 4));
}

function hideAutocomplete(instant) {
  clearTimeout(acTimer);
  if (instant) { acEl.classList.add('dt-hidden'); acEl.classList.remove('ac-visible'); }
  else { acEl.classList.remove('ac-visible'); setTimeout(() => acEl.classList.add('dt-hidden'), 200); }
  acVisible = false;
}

// ==========================================
// QUIRK: CODE REVIEW (medium + hard)
// ==========================================

function triggerCodeReview() {
  if (gameOver || currentWordIdx < 1 || reviewPending) return;
  const srcIdx  = currentWordIdx - 1;
  const srcWord = words[srcIdx];
  const comment = REVIEW_COMMENTS[Math.floor(Math.random() * REVIEW_COMMENTS.length)];

  wordEls[srcIdx].classList.add('rejected');
  showFloatingReview(wordEls[srcIdx], comment);

  words.splice(currentWordIdx, 0, srcWord);
  const newEl = createWordEl(srcWord, true);
  wordsEl.insertBefore(newEl, wordEls[currentWordIdx]);
  wordEls.splice(currentWordIdx, 0, newEl);
  lineHeight    = 0;
  reviewPending = true;
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
// QUIRK: LEGACY PAUSE (medium + hard)
// ==========================================

function resetLegacyTimer() {
  clearTimeout(legacyTimer);
  hideLegacy(false);
  if (!gameStarted || gameOver || !hasQuirk('legacy')) return;
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
  if (instant) { legacyEl.classList.add('dt-hidden'); legacyEl.classList.remove('leg-visible'); }
  else { legacyEl.classList.remove('leg-visible'); setTimeout(() => legacyEl.classList.add('dt-hidden'), 300); }
}

// ==========================================
// QUIRK: SHA FADE (hard only)
// ==========================================

function startSHAFade() {
  clearTimeout(shaFadeTimer);
  const wordEl = wordEls[currentWordIdx];
  if (!wordEl) return;
  wordEl.classList.remove('sha-fading');
  shaFadeTimer = setTimeout(() => {
    if (wordEls[currentWordIdx] === wordEl) wordEl.classList.add('sha-fading');
  }, 2000);
}

// ==========================================
// EASY QUIRK: iMESSAGE BUBBLE
// ==========================================

function triggerIMessage() {
  const msg = IMESSAGE_POOL[imIdx % IMESSAGE_POOL.length];
  imIdx++;
  imSenderEl.textContent = msg.sender;
  imTextEl.textContent   = msg.text;
  imEl.classList.remove('dt-hidden');
  void imEl.offsetWidth;
  imEl.classList.add('im-visible');

  clearTimeout(imTimer);
  imTimer = setTimeout(() => hideIMessage(false), 2800);
  imessageCountdown = rand(10, 16);
}

function hideIMessage(instant) {
  clearTimeout(imTimer);
  if (instant) { imEl.classList.add('dt-hidden'); imEl.classList.remove('im-visible'); }
  else { imEl.classList.remove('im-visible'); setTimeout(() => imEl.classList.add('dt-hidden'), 350); }
}

// ==========================================
// EASY QUIRK: macOS NOTIFICATION
// ==========================================

function triggerNotification() {
  const n = NOTIFICATION_POOL[notifIdx % NOTIFICATION_POOL.length];
  notifIdx++;
  notifIconEl.textContent = n.icon;
  notifAppEl.textContent  = n.app;
  notifMsgEl.textContent  = n.msg;
  notifEl.classList.remove('dt-hidden');
  void notifEl.offsetWidth;
  notifEl.classList.add('notif-visible');

  clearTimeout(notifTimer);
  notifTimer = setTimeout(() => hideNotification(false), 3200);
  notifCountdown = rand(12, 20);
}

function hideNotification(instant) {
  clearTimeout(notifTimer);
  if (instant) { notifEl.classList.add('dt-hidden'); notifEl.classList.remove('notif-visible'); }
  else { notifEl.classList.remove('notif-visible'); setTimeout(() => notifEl.classList.add('dt-hidden'), 380); }
}

// ==========================================
// FOCUS
// ==========================================

wordsWrapEl.addEventListener('click', () => { inputEl.focus(); focusHintEl.classList.add('dt-hidden'); });
inputEl.addEventListener('focus', () => focusHintEl.classList.add('dt-hidden'));
inputEl.addEventListener('blur',  () => { if (!gameStarted) focusHintEl.classList.remove('dt-hidden'); });

// ==========================================
// CONTROLS
// ==========================================

document.getElementById('dt-reset-btn').addEventListener('click', resetGame);
document.getElementById('dt-restart-btn').addEventListener('click', resetGame);

document.querySelectorAll('.dt-diff-btn').forEach(btn => {
  btn.addEventListener('click', () => setDifficulty(btn.dataset.diff));
});

// ==========================================
// INIT
// ==========================================

window.addEventListener('load', () => {
  setDifficulty('easy');
  inputEl.focus();
});
