// ==========================================
// Production Incident — Game Engine
// ==========================================

// ==========================================
// CODE SNIPPETS — 4 languages × 5 rounds
// bugLine: 0-indexed line containing the bug
// decoyLine: wrong line quirks will point to
// ==========================================

const SNIPPETS = {

  javascript: [
    {
      title: 'Auth Validator',
      file: 'auth.js',
      desc: 'Users can bypass authentication — all ages pass the check',
      bugLine: 1,
      decoyLine: 3,
      soQ: 'Why does my age check always return true in JavaScript?',
      soA: 'The issue is on line 3 — you need to add a return statement before the closing brace.',
      seniorHint: '// looks like line 4 to me',
      code: [
        'function isAdult(age) {',
        '  if (age = 18) {',
        '    return true;',
        '  }',
        '  return false;',
        '}'
      ]
    },
    {
      title: 'Array Summer',
      file: 'utils.js',
      desc: 'sumArray() throws TypeError: Cannot read undefined — crashes on every call',
      bugLine: 2,
      decoyLine: 4,
      soQ: 'JavaScript array sum function throwing undefined error',
      soA: 'Classic mistake — on line 4 you forgot to initialise total before the loop.',
      seniorHint: '// line 4, missing initialisation',
      code: [
        'function sumArray(arr) {',
        '  let total = 0;',
        '  for (let i = 0; i <= arr.length; i++) {',
        '    total += arr[i];',
        '  }',
        '  return total;',
        '}'
      ]
    },
    {
      title: 'User Fetcher',
      file: 'api.js',
      desc: 'fetchUser() returns a Promise object instead of data — frontend shows [object Promise]',
      bugLine: 2,
      decoyLine: 4,
      soQ: 'async function returning Promise instead of resolved value',
      soA: 'You need to add await on line 4 before response.json() — that\'s where the issue is.',
      seniorHint: '// line 4 is missing the await keyword',
      code: [
        'async function fetchUser(id) {',
        '  const response = fetch(`/api/users/${id}`);',
        '  const data = await response.json();',
        '  return data;',
        '}'
      ]
    },
    {
      title: 'Max Finder',
      file: 'search.js',
      desc: 'findMax() always returns arr[0] regardless of array contents',
      bugLine: 3,
      decoyLine: 1,
      soQ: 'findMax function not updating maximum value in loop',
      soA: 'The bug is on line 1 — arr[0] should be Number.NEGATIVE_INFINITY as starting value.',
      seniorHint: '// line 1, wrong initial value imo',
      code: [
        'function findMax(arr) {',
        '  let max = arr[0];',
        '  for (let i = 1; i < arr.length; i++) {',
        '    if (arr[i] > max);',
        '      max = arr[i];',
        '  }',
        '  return max;',
        '}'
      ]
    },
    {
      title: 'User Validator',
      file: 'validator.js',
      desc: 'validateUser() passes users with empty names — security hole in production',
      bugLine: 1,
      decoyLine: 3,
      soQ: 'JavaScript validation always returning true with empty string check',
      soA: 'Line 3 has the issue — change !== to === for the empty string comparison.',
      seniorHint: '// definitely line 3, wrong comparison operator',
      code: [
        'function validateUser(user) {',
        '  if (user.age > 0 || user.name !== \'\') {',
        '    return true;',
        '  }',
        '  return false;',
        '}'
      ]
    }
  ],

  java: [
    {
      title: 'Even Checker',
      file: 'MathUtils.java',
      desc: 'isEven() throws compilation error — build pipeline is broken',
      bugLine: 1,
      decoyLine: 3,
      soQ: 'Java if statement compilation error with modulo operator',
      soA: 'The problem is on line 3 — you\'re missing a cast to int for the return value.',
      seniorHint: '// looks like a return type issue on line 3',
      code: [
        'public boolean isEven(int n) {',
        '  if (n % 2 = 0) {',
        '    return true;',
        '  }',
        '  return false;',
        '}'
      ]
    },
    {
      title: 'Array Summer',
      file: 'ArrayUtils.java',
      desc: 'sumArray() throws ArrayIndexOutOfBoundsException — crashes on all requests',
      bugLine: 2,
      decoyLine: 4,
      soQ: 'Java ArrayIndexOutOfBoundsException in for loop with array',
      soA: 'Check line 4 — you\'re accessing arr[i] but i could be null at that point.',
      seniorHint: '// I think line 4 has a null issue',
      code: [
        'public int sumArray(int[] arr) {',
        '  int total = 0;',
        '  for (int i = 0; i <= arr.length; i++) {',
        '    total += arr[i];',
        '  }',
        '  return total;',
        '}'
      ]
    },
    {
      title: 'String Matcher',
      file: 'StringUtils.java',
      desc: 'contains() always returns false even for matching strings — search is broken',
      bugLine: 1,
      decoyLine: 0,
      soQ: 'Java String comparison always returns false',
      soA: 'You\'re comparing object references on line 0 — the method signature is wrong.',
      seniorHint: '// the method signature on line 0 looks off',
      code: [
        'public boolean contains(String str, String target) {',
        '  return str == target;',
        '}'
      ]
    },
    {
      title: 'Null Handler',
      file: 'UserService.java',
      desc: 'getUsername() throws NullPointerException — 500 errors on 30% of requests',
      bugLine: 2,
      decoyLine: 1,
      soQ: 'NullPointerException when calling method on returned object',
      soA: 'The null check on line 1 is redundant — the issue is actually the return type.',
      seniorHint: '// line 1 has the issue with the null check',
      code: [
        'public String getUsername(int id) {',
        '  User user = userRepository.findById(id);',
        '  String name = user.getName();',
        '  return name.toUpperCase();',
        '}'
      ]
    },
    {
      title: 'Palindrome Check',
      file: 'StringUtils.java',
      desc: 'isPalindrome() throws StringIndexOutOfBoundsException — search service down',
      bugLine: 2,
      decoyLine: 4,
      soQ: 'Java StringIndexOutOfBoundsException in palindrome checker',
      soA: 'The charAt call on line 4 is using the wrong index — should use left not i.',
      seniorHint: '// line 4, charAt index looks off',
      code: [
        'public boolean isPalindrome(String s) {',
        '  int left = 0;',
        '  int right = s.length();',
        '  while (left < right) {',
        '    if (s.charAt(left) != s.charAt(right)) return false;',
        '    left++; right--;',
        '  }',
        '  return true;',
        '}'
      ]
    }
  ],

  python: [
    {
      title: 'Even Checker',
      file: 'utils.py',
      desc: 'is_even() causes SyntaxError — entire module fails to import',
      bugLine: 1,
      decoyLine: 3,
      soQ: 'Python SyntaxError in if statement with modulo',
      soA: 'Line 3 is the problem — you need a colon at the end of the return statement.',
      seniorHint: '# missing colon on line 3 is the issue',
      code: [
        'def is_even(n):',
        '    if n % 2 = 0:',
        '        return True',
        '    return False'
      ]
    },
    {
      title: 'List Summer',
      file: 'math_utils.py',
      desc: 'sum_list() throws IndexError — data pipeline crashes on every run',
      bugLine: 2,
      decoyLine: 1,
      soQ: 'Python list IndexError in range loop',
      soA: 'On line 1, total should be initialised to None instead of 0 for this use case.',
      seniorHint: '# line 1, total should probably start as None',
      code: [
        'def sum_list(nums):',
        '    total = 0',
        '    for i in range(len(nums) + 1):',
        '        total += nums[i]',
        '    return total'
      ]
    },
    {
      title: 'Vowel Counter',
      file: 'string_ops.py',
      desc: 'count_vowels() always returns 0 — search feature completely broken',
      bugLine: 4,
      decoyLine: 2,
      soQ: 'Python counter always returning 0 in for loop',
      soA: 'The vowels string on line 2 is missing some characters — add "AEIOU" for uppercase.',
      seniorHint: '# line 2, vowels string missing uppercase letters',
      code: [
        'def count_vowels(s):',
        '    count = 0',
        '    vowels = \'aeiou\'',
        '    for char in s:',
        '        if char in vowels:',
        '            count =+ 1',
        '    return count'
      ]
    },
    {
      title: 'Max Finder',
      file: 'algorithms.py',
      desc: 'find_max() throws IndexError on empty list — production crashes with empty data',
      bugLine: 3,
      decoyLine: 1,
      soQ: 'Python find max function IndexError with empty input',
      soA: 'Add a None check on line 1 before processing — that will fix the empty list case.',
      seniorHint: '# line 1 needs a None/empty check first',
      code: [
        'def find_max(arr):',
        '    max_val = arr[0]',
        '    for i in range(1, len(arr)):',
        '        if arr[i] > max_val',
        '            max_val = arr[i]',
        '    return max_val'
      ]
    },
    {
      title: 'Divider',
      file: 'calculator.py',
      desc: 'safe_divide() crashes with ZeroDivisionError despite the guard — critical bug',
      bugLine: 1,
      decoyLine: 3,
      soQ: 'Python ZeroDivisionError even with zero check',
      soA: 'The return on line 3 should return 0 instead of None for safe division.',
      seniorHint: '# return value on line 3 should probably be 0',
      code: [
        'def safe_divide(a, b):',
        '    if b = 0:',
        '        return None',
        '    return a / b'
      ]
    }
  ],

  cpp: [
    {
      title: 'Positive Check',
      file: 'utils.cpp',
      desc: 'isPositive() always returns false — comparison logic inverted in production',
      bugLine: 1,
      decoyLine: 3,
      soQ: 'C++ function always returning false with assignment in if statement',
      soA: 'The return type on line 3 should be int, not bool — that\'s causing the issue.',
      seniorHint: '// return type on line 3 looks wrong',
      code: [
        'bool isPositive(int n) {',
        '  if (n = 0) {',
        '    return false;',
        '  }',
        '  return true;',
        '}'
      ]
    },
    {
      title: 'Array Summer',
      file: 'array_ops.cpp',
      desc: 'sumArray() causes segmentation fault — server core dumped',
      bugLine: 2,
      decoyLine: 4,
      soQ: 'C++ segmentation fault in array loop',
      soA: 'The issue is on line 4 — arr[i] should use a pointer dereference instead.',
      seniorHint: '// line 4, should use pointer dereference',
      code: [
        'int sumArray(int arr[], int n) {',
        '  int total = 0;',
        '  for (int i = 0; i <= n; i++) {',
        '    total += arr[i];',
        '  }',
        '  return total;',
        '}'
      ]
    },
    {
      title: 'Null Deref',
      file: 'processor.cpp',
      desc: 'process() segfaults when element not found — crashes 15% of requests',
      bugLine: 6,
      decoyLine: 2,
      soQ: 'C++ segfault when dereferencing return value from search function',
      soA: 'The findElement function on line 2 returns wrong type — should be int** not int*.',
      seniorHint: '// line 2, return type of findElement is wrong',
      code: [
        'int* findEl(int arr[], int n, int t) {',
        '  for (int i = 0; i < n; i++) {',
        '    if (arr[i] == t) return &arr[i];',
        '  }',
        '  return NULL;',
        '}',
        'void process(int arr[], int n) {',
        '  int* ptr = findEl(arr, n, 5);',
        '  cout << *ptr << endl;',
        '}'
      ]
    },
    {
      title: 'String Reverser',
      file: 'strings.cpp',
      desc: 'reverseString() produces garbled output — corrupting user data',
      bugLine: 3,
      decoyLine: 1,
      soQ: 'C++ string reverse function producing wrong output',
      soA: 'The loop bound on line 1 is wrong — n/2 should be (n-1)/2 for odd-length strings.',
      seniorHint: '// line 1, loop bound calculation is off',
      code: [
        'void reverseString(string& s) {',
        '  int n = s.length();',
        '  for (int i = 0; i < n / 2; i++) {',
        '    char tmp = s[i];',
        '    s[i] = s[n - i];',
        '    s[n - i - 1] = tmp;',
        '  }',
        '}'
      ]
    },
    {
      title: 'Palindrome',
      file: 'checker.cpp',
      desc: 'isPalindrome() returns false for all valid palindromes — validation system broken',
      bugLine: 2,
      decoyLine: 4,
      soQ: 'C++ isPalindrome always returns false for correct palindromes',
      soA: 'The comparison on line 4 should use != instead of == — logic is inverted.',
      seniorHint: '// line 4, comparison operator is wrong',
      code: [
        'bool isPalindrome(string s) {',
        '  int left = 0;',
        '  int right = s.length();',
        '  while (left < right) {',
        '    if (s[left] != s[right]) return false;',
        '    left++;',
        '    right--;',
        '  }',
        '  return true;',
        '}'
      ]
    }
  ]
};

const VERDICTS = [
  [0, 2, '// even the interns did better'],
  [2, 3, '// on-call rotation cancelled'],
  [3, 4, '// incident resolved, barely'],
  [4, 5, '// SLA maintained, well done'],
  [5, 6, '// promoted to senior on-call'],
];

const RETRY_TAUNTS = [
  [0, 40, '↻  please take a CS course'],
  [40, 60, '↻  the bugs found you instead'],
  [60, 80, '↻  almost. embarrassingly close.'],
];

const NOTIF_POOL = [
  { icon: '☕', app: 'Calendar',  msg: 'Coffee break in 2 minutes' },
  { icon: '🎮', app: 'CS2',       msg: 'Your team needs you. Clutch round.' },
  { icon: '💬', app: 'Slack',     msg: 'CEO: is the site back up yet??' },
  { icon: '📱', app: 'Mom',       msg: 'Call me when free beta' },
  { icon: '🚨', app: 'PagerDuty', msg: '3 more services just went down' },
  { icon: '☕', app: 'Starbucks', msg: 'Your order is ready for pickup' },
];

const IMSG_POOL = [
  { sender: 'teammate', text: 'omg is it line 4??' },
  { sender: 'teammate', text: 'i think the bug is in the loop' },
  { sender: 'CTO',      text: 'we\'re losing $2k/min' },
  { sender: 'teammate', text: 'pretty sure it\'s the last line' },
  { sender: 'intern',   text: 'have you tried turning it off and on' },
];

// ==========================================
// SYNTAX HIGHLIGHTER
// ==========================================

function highlight(raw, lang) {
  let s = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const rules = {
    javascript: [
      [/(\/\/.*$)/gm,                                             'cm'],
      [/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, 'str'],
      [/\b(function|return|if|else|for|let|const|var|async|await|new|true|false|null|undefined|typeof|this)\b/g, 'kw'],
      [/\b(\d+)\b/g,                                             'num'],
    ],
    java: [
      [/(\/\/.*$)/gm,                                             'cm'],
      [/("(?:[^"\\]|\\.)*")/g,                                   'str'],
      [/\b(public|private|protected|static|void|return|if|else|for|while|new|true|false|null|int|String|boolean|class|this|throw|throws)\b/g, 'kw'],
      [/\b(int|String|boolean|void|long|double|float|char|byte)\b/g, 'typ'],
      [/\b(\d+)\b/g,                                             'num'],
    ],
    python: [
      [/(#.*$)/gm,                                               'cm'],
      [/('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/g,               'str'],
      [/\b(def|return|if|else|elif|for|while|in|not|and|or|True|False|None|import|from|class|self|range|len|print)\b/g, 'kw'],
      [/\b(\d+)\b/g,                                             'num'],
    ],
    cpp: [
      [/(\/\/.*$)/gm,                                             'cm'],
      [/("(?:[^"\\]|\\.)*")/g,                                   'str'],
      [/\b(int|bool|void|return|if|else|for|while|true|false|NULL|nullptr|string|char|double|float|cout|endl|include|using|namespace|std)\b/g, 'kw'],
      [/\b(int|bool|void|string|char|double|float)\b/g,          'typ'],
      [/\b(\d+)\b/g,                                             'num'],
    ],
  };

  (rules[lang] || []).forEach(([re, cls]) => {
    s = s.replace(re, `<span class="${cls}">$1</span>`);
  });

  return s;
}

// ==========================================
// STATE
// ==========================================

let currentLang    = null;
let rounds         = [];
let roundIdx       = 0;
let lives          = 3;
let correctCount   = 0;
let timerInterval  = null;
let timeLeft       = 45;
let roundResults   = [];  // fix 3: track per-round pass/fail
let gameOver       = false;
let currentLineEls = []; // fix 2: cache line elements

// Quirk state
let quirksActive   = false;
let notifTimer     = null;
let imsgTimer      = null;
let ghostTimer     = null;
let seniorTimer    = null;
let soTimer        = null;
let squiggleTimer  = null;
let scrambleTimer  = null;
let notifIdx       = 0;
let imsgIdx        = 0;

// ==========================================
// DOM REFS
// ==========================================

const langScreen    = document.getElementById('lang-screen');
const gameScreen    = document.getElementById('game-screen');
const resultsScreen = document.getElementById('results-screen');
const incCode       = document.getElementById('inc-code');
const incTitle      = document.getElementById('inc-title');
const incDesc       = document.getElementById('inc-desc-text');
const incFilename   = document.getElementById('inc-filename');
const incRoundLabel = document.getElementById('inc-round-label');
const incTimer      = document.getElementById('inc-timer');
const ringFill      = document.getElementById('ring-fill');
const incStatus     = document.getElementById('inc-status');
const ghostCursor   = document.getElementById('ghost-cursor');
const seniorComment = document.getElementById('senior-comment');
const soPopup       = document.getElementById('so-popup');
const imEl          = document.getElementById('inc-imessage');
const notifEl       = document.getElementById('inc-notification');

// ==========================================
// PRE-PROCESS SNIPPETS (fix 1)
// Run highlight() once at load, cache in round.highlighted
// ==========================================

function preprocessSnippets() {
  Object.entries(SNIPPETS).forEach(([lang, langRounds]) => {
    langRounds.forEach(round => {
      round.highlighted = round.code.map(line => highlight(line, lang));
    });
  });
}

// ==========================================
// RENDER ROUND
// ==========================================

function renderRound() {
  const round = rounds[roundIdx];
  incRoundLabel.textContent = `Round ${roundIdx + 1} of 5`;
  incTitle.textContent      = round.title;
  incDesc.textContent       = round.desc;
  incFilename.textContent   = round.file;
  incStatus.textContent     = 'click the line containing the bug';
  incStatus.className       = '';

  incCode.innerHTML = '';
  currentLineEls    = []; // fix 2: reset cache

  round.code.forEach((line, i) => {
    const div     = document.createElement('div');
    div.className = 'code-line';
    div.dataset.line = i;
    // Keyboard/a11y: each line is a focusable button. Tab through them,
    // press Enter/Space to accuse. Matches the click flow so mouse and
    // keyboard players hit the same code path.
    div.setAttribute('role', 'button');
    div.setAttribute('tabindex', '0');
    div.setAttribute('aria-label', `Line ${i + 1}. Press Enter to mark as the bug.`);

    const numSpan = document.createElement('span');
    numSpan.className   = 'line-num';
    numSpan.id          = `ln-${i}`;
    numSpan.textContent = i + 1;

    const codeSpan = document.createElement('span');
    codeSpan.className = 'line-content';
    // fix 1: use pre-highlighted HTML
    codeSpan.innerHTML = round.highlighted ? round.highlighted[i] : highlight(line, currentLang);

    div.appendChild(numSpan);
    div.appendChild(codeSpan);
    div.addEventListener('click', () => handleLineClick(i));
    div.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleLineClick(i);
      }
    });
    incCode.appendChild(div);
    currentLineEls.push(div); // fix 2: cache
  });

  // Focus first line so keyboard users can immediately Arrow/Enter.
  // requestAnimationFrame delays until after DOM paint so focus lands
  // reliably even if the round transition animation is running.
  if (currentLineEls[0]) {
    requestAnimationFrame(() => currentLineEls[0].focus({ preventScroll: true }));
  }
}

// ==========================================
// LINE CLICK
// ==========================================

function revealCorrectLine(callback) {
  const round  = rounds[roundIdx];
  const lineEl = currentLineEls[round.bugLine];
  if (lineEl) lineEl.classList.add('reveal');
  setTimeout(() => {
    if (lineEl) lineEl.classList.remove('reveal');
    callback();
  }, 1400);
}

function handleLineClick(lineIdx) {
  if (gameOver) return;
  const round   = rounds[roundIdx];
  const correct = lineIdx === round.bugLine;
  const lineEl  = currentLineEls[lineIdx];

  clearQuirks();

  if (correct) {
    lineEl.classList.add('correct');
    incStatus.textContent = '✓ Bug found — ' + round.title;
    incStatus.className   = 'correct';
    correctCount++;
    roundResults.push(true);
    clearInterval(timerInterval);
    setTimeout(nextRound, 1200);
  } else {
    lineEl.classList.add('wrong');
    incStatus.textContent = '✗ Wrong line — check again';
    incStatus.className   = 'wrong';
    lives--;
    updateLives();
    setTimeout(() => {
      lineEl.classList.remove('wrong');
      if (lives <= 0) {
        clearInterval(timerInterval);
        roundResults.push(false);
        incStatus.textContent = '✗ Out of lives — showing the bug...';
        revealCorrectLine(nextRound);
      } else {
        incStatus.textContent = 'click the line containing the bug';
        incStatus.className   = '';
      }
    }, 600);
  }
}

// ==========================================
// ROUND FLOW
// ==========================================

function startRound() {
  gameOver     = false;
  timeLeft     = 45;
  quirksActive = true;

  renderRound();
  updateTimer();
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      clearQuirks();
      // Set gameOver BEFORE the reveal setTimeout — otherwise a click
      // in the 1400ms reveal window still runs handleLineClick, pushes
      // a second roundResults entry, and calls nextRound again, which
      // skips a round. gameOver is reset in startRound() for next round.
      gameOver = true;
      roundResults.push(false);
      incStatus.textContent = '⏱ Time\'s up — showing the bug...';
      incStatus.className   = 'wrong';
      lives--;
      updateLives();
      // fix 4: flash editor red + fix 5: reveal correct line
      document.getElementById('inc-editor').classList.add('time-up');
      setTimeout(() => document.getElementById('inc-editor').classList.remove('time-up'), 400);
      revealCorrectLine(nextRound);
    }
  }, 1000);

  scheduleQuirks();
}

function nextRound() {
  roundIdx++;
  if (roundIdx >= 5) {
    endGame();
  } else {
    lives  = 3;
    updateLives();
    startRound();
  }
}

function updateTimer() {
  incTimer.textContent = timeLeft;
  const pct = (timeLeft / 45) * 100;
  const dashOffset = 100 - pct;
  ringFill.style.strokeDashoffset = dashOffset;

  if (timeLeft <= 10) {
    ringFill.className = 'ring-fill warn';
  } else {
    ringFill.className = 'ring-fill safe';
  }
}

function updateLives() {
  for (let i = 1; i <= 3; i++) {
    document.getElementById(`inc-life-${i}`)
      .classList.toggle('lost', i > lives);
  }
}

// ==========================================
// END GAME
// ==========================================

function endGame() {
  gameOver = true;
  clearQuirks();
  gameScreen.classList.add('inc-hidden');
  resultsScreen.classList.remove('inc-hidden');

  const passed = correctCount >= 3;

  document.getElementById('r-correct').textContent = `${correctCount}/5`;
  document.getElementById('r-time').textContent    = lives;
  document.getElementById('r-lives').textContent   = lives;

  // fix 3: round-by-round breakdown
  let breakdown = document.getElementById('inc-round-breakdown');
  if (!breakdown) {
    breakdown = document.createElement('div');
    breakdown.id = 'inc-round-breakdown';
    document.getElementById('inc-results-grid').after(breakdown);
  }
  breakdown.innerHTML = roundResults.map((r, i) =>
    `<span class="rd ${r ? 'rd-pass' : 'rd-fail'}" title="Round ${i+1}">${r ? '✓' : '✗'}</span>`
  ).join('');

  const devStat = Math.round((correctCount / 5) * 100);
  localStorage.setItem('dq-stat-dev', devStat);
  if (typeof showStatUnlocked === 'function') showStatUnlocked('DEV', devStat);

  const badge = document.getElementById('inc-pass-badge');
  badge.textContent = passed ? '✓  incident resolved' : '✗  need 3/5 bugs found to pass';
  badge.className   = passed ? 'pass' : 'fail';

  const verdict = VERDICTS.find(([lo, hi]) => correctCount >= lo && correctCount < hi);
  document.getElementById('inc-verdict').textContent = verdict ? verdict[2] : '// undefined behavior';

  const retryBtn   = document.getElementById('inc-retry-btn');
  const proceedBtn = document.getElementById('inc-proceed-btn');

  if (passed) {
    retryBtn.classList.add('inc-hidden');
    proceedBtn.classList.remove('inc-hidden');
  } else {
    proceedBtn.classList.add('inc-hidden');
    retryBtn.classList.remove('inc-hidden');
    const taunt = RETRY_TAUNTS.find(([lo, hi]) => {
      const pct = (correctCount / 5) * 100;
      return pct >= lo && pct < hi;
    });
    retryBtn.textContent = taunt ? taunt[2] : '↻  have you tried being better?';
  }
}

function resetGame() {
  roundIdx      = 0;
  lives         = 3;
  correctCount  = 0;
  roundResults  = [];
  currentLineEls = [];
  gameOver      = false;

  updateLives();
  resultsScreen.classList.add('inc-hidden');
  gameScreen.classList.remove('inc-hidden');
  startRound();
}

// ==========================================
// QUIRKS SYSTEM
// ==========================================

function scheduleQuirks() {
  const round = rounds[roundIdx];
  const numQuirks = Math.min(roundIdx + 1, 4); // more quirks in later rounds

  // Notification
  notifTimer = setTimeout(() => triggerNotif(), rand(4, 10) * 1000);

  // iMessage
  imsgTimer = setTimeout(() => triggerImsg(), rand(6, 14) * 1000);

  // Senior dev comment (rounds 2+)
  if (roundIdx >= 1) {
    seniorTimer = setTimeout(() => triggerSenior(), rand(3, 8) * 1000);
  }

  // Stack Overflow (rounds 3+)
  if (roundIdx >= 2) {
    soTimer = setTimeout(() => triggerSO(), rand(8, 16) * 1000);
  }

  // Ghost cursor (rounds 2+)
  if (roundIdx >= 1) {
    ghostTimer = setTimeout(() => triggerGhost(), rand(5, 12) * 1000);
  }

  // Squiggle underlines (rounds 3+)
  if (roundIdx >= 2) {
    squiggleTimer = setTimeout(() => triggerSquiggles(), rand(2, 6) * 1000);
  }

  // Line number scramble (round 5)
  if (roundIdx >= 4) {
    scrambleTimer = setTimeout(() => triggerScramble(), rand(10, 20) * 1000);
  }
}

function clearQuirks() {
  quirksActive = false; // fix 7: set false FIRST so any firing timeout exits early
  clearTimeout(notifTimer);
  clearTimeout(imsgTimer);
  clearTimeout(seniorTimer);
  clearTimeout(soTimer);
  clearTimeout(ghostTimer);
  clearTimeout(squiggleTimer);
  clearTimeout(scrambleTimer);

  hideImsg(true);
  hideNotif(true);
  seniorComment.classList.add('inc-hidden');
  soPopup.classList.add('inc-hidden');
  ghostCursor.classList.add('inc-hidden');
  document.querySelectorAll('.line-content.squiggly')
    .forEach(el => el.classList.remove('squiggly'));
  document.querySelectorAll('.line-num.scrambled')
    .forEach(el => el.classList.remove('scrambled'));
}

// Notification
function triggerNotif() {
  if (!quirksActive) return;
  const n = NOTIF_POOL[notifIdx % NOTIF_POOL.length];
  notifIdx++;
  document.getElementById('inc-notif-icon').textContent = n.icon;
  document.getElementById('inc-notif-app').textContent  = n.app;
  document.getElementById('inc-notif-msg').textContent  = n.msg;
  notifEl.classList.remove('inc-hidden');
  void notifEl.offsetWidth;
  notifEl.classList.add('notif-visible');
  setTimeout(() => hideNotif(false), 3200);
}

function hideNotif(instant) {
  if (instant) { notifEl.classList.add('inc-hidden'); notifEl.classList.remove('notif-visible'); }
  else { notifEl.classList.remove('notif-visible'); setTimeout(() => notifEl.classList.add('inc-hidden'), 380); }
}

// iMessage
function triggerImsg() {
  if (!quirksActive) return;
  const m = IMSG_POOL[imsgIdx % IMSG_POOL.length];
  imsgIdx++;
  document.getElementById('inc-im-sender').textContent = m.sender;
  document.getElementById('inc-im-text').textContent   = m.text;
  imEl.classList.remove('inc-hidden');
  void imEl.offsetWidth;
  imEl.classList.add('im-visible');
  setTimeout(() => hideImsg(false), 3000);
}

function hideImsg(instant) {
  if (instant) { imEl.classList.add('inc-hidden'); imEl.classList.remove('im-visible'); }
  else { imEl.classList.remove('im-visible'); setTimeout(() => imEl.classList.add('inc-hidden'), 350); }
}

// Senior dev comment
function triggerSenior() {
  if (!quirksActive) return;
  const round  = rounds[roundIdx];
  const target = currentLineEls[round.decoyLine]; // fix 2
  if (!target) return;

  const rect  = target.getBoundingClientRect();
  const cRect = document.getElementById('inc-editor').getBoundingClientRect();

  seniorComment.textContent = round.seniorHint;
  seniorComment.style.top   = (rect.top - cRect.top + 4) + 'px';
  seniorComment.classList.remove('inc-hidden');
  setTimeout(() => seniorComment.classList.add('inc-hidden'), 4000);
}

function triggerSO() {
  if (!quirksActive) return;
  const round = rounds[roundIdx];
  document.getElementById('so-question').textContent    = round.soQ;
  document.getElementById('so-answer-text').textContent = round.soA;
  soPopup.classList.remove('inc-hidden');
}

document.getElementById('so-close').addEventListener('click', () => {
  soPopup.classList.add('inc-hidden');
});

function triggerGhost() {
  if (!quirksActive) return;
  const round  = rounds[roundIdx];
  const target = currentLineEls[round.decoyLine]; // fix 2
  if (!target) return;

  const rect  = target.getBoundingClientRect();
  const eRect = incCode.getBoundingClientRect();
  ghostCursor.style.top = (rect.top - eRect.top + 4) + 'px';
  ghostCursor.classList.remove('inc-hidden');
  setTimeout(() => ghostCursor.classList.add('inc-hidden'), 3500);
}

function triggerSquiggles() {
  if (!quirksActive) return;
  const round = rounds[roundIdx];
  currentLineEls.forEach((line, i) => { // fix 2
    if (i !== round.bugLine && Math.random() < 0.4) {
      line.querySelector('.line-content').classList.add('squiggly');
    }
  });
  setTimeout(() => {
    currentLineEls.forEach(line => {
      line.querySelector('.line-content')?.classList.remove('squiggly');
    });
  }, 3000);
}

// Line number scramble
function triggerScramble() {
  if (!quirksActive) return;
  const nums = incCode.querySelectorAll('.line-num');
  nums.forEach(n => n.classList.add('scrambled'));
  setTimeout(() => nums.forEach(n => n.classList.remove('scrambled')), 1200);
}

// ==========================================
// LANGUAGE SELECTION
// ==========================================

// fix 1: pre-highlight all snippets once at load
preprocessSnippets();

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentLang = btn.dataset.lang;
    rounds      = SNIPPETS[currentLang];
    langScreen.classList.add('inc-hidden');
    gameScreen.classList.remove('inc-hidden');
    startRound();
  });
});

document.getElementById('inc-retry-btn').addEventListener('click', resetGame);

// ==========================================
// UTILITY
// ==========================================

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

window.dqCheat = () => {
  if (!currentLang) {
    currentLang = 'javascript';
    rounds      = SNIPPETS[currentLang];
  }
  correctCount  = 5;
  roundResults  = [true, true, true, true, true];
  roundIdx      = 5;
  lives         = 3;
  clearInterval(timerInterval);
  clearQuirks();
  endGame();
};
