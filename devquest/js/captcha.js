// ========================================
// DevQuest Captcha
// ========================================

const SHAPES = [
  { src: 'assets/cube sprite.png',       name: 'Cube' },
  { src: 'assets/cylinder.png',          name: 'Cylinder' },
  { src: 'assets/Dome shape.png',        name: 'Dome' },
  { src: 'assets/rectangular block.png', name: 'Rectangular Block' },
  { src: 'assets/TetraHedron.png',       name: 'Tetrahedron' },
];

const CORRECT_HOLE   = 'hole-square';
const SHAPE_SIZE     = 160;
const REPEL_RADIUS   = 90;   // px from wrong hole center to start repelling
const REPEL_STRENGTH = 55;   // max px offset applied to shape

// Game state
let currentIndex  = 0;
let lives         = 3;
let streak        = 0;
let isDragging    = false;
let dragOffsetX   = 0;
let dragOffsetY   = 0;
let shapePlaced   = false;
let shuffledShapes = [];

// DOM
const activeShape  = document.getElementById('active-shape');
const holes        = document.querySelectorAll('.hole');
const progressText = document.getElementById('progress-text');
const verifyBtn    = document.getElementById('verify-btn');
const resetBtn     = document.getElementById('reset-btn');
const skipBtn      = document.getElementById('skip-btn');
const gameArea     = document.getElementById('game-area');
const promptText   = document.getElementById('prompt-text');

// ========================================
// Helpers
// ========================================

function centerX() {
  return (gameArea.offsetWidth / 2) - (SHAPE_SIZE / 2);
}

function centerY() {
  const zone = document.getElementById('shape-zone');
  return zone.offsetTop + (zone.offsetHeight / 2) - (SHAPE_SIZE / 2);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ========================================
// Prompt text
// ========================================

function setPrompt(text, cls) {
  promptText.textContent = text;
  promptText.className   = 'prompt ' + (cls || '');
  promptText.classList.remove('hidden');
}

function hidePrompt() {
  promptText.classList.add('hidden');
}

// ========================================
// Streak
// ========================================

const STREAK_MESSAGES = ['', '', '2 in a row!', '3 in a row!', 'On fire! 🔥', 'Unstoppable!', 'Legendary!'];

function showStreakBadge(n) {
  if (n < 2) return;
  const badge = document.getElementById('streak-badge');
  badge.textContent = STREAK_MESSAGES[Math.min(n, STREAK_MESSAGES.length - 1)];
  badge.classList.remove('hidden', 'fade-out');
  void badge.offsetWidth;
  badge.classList.add('pop-in');
  setTimeout(() => {
    badge.classList.add('fade-out');
    setTimeout(() => badge.classList.add('hidden'), 400);
  }, 1200);
}

// ========================================
// Particles
// ========================================

function spawnParticles(hole) {
  const hr = hole.getBoundingClientRect();
  const gr = gameArea.getBoundingClientRect();

  const cx = hr.left - gr.left + hr.width  / 2;
  const cy = hr.top  - gr.top  + hr.height / 2;

  for (let i = 0; i < 16; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    // Random size between 4–9px
    const size = 4 + Math.random() * 5;
    p.style.width  = size + 'px';
    p.style.height = size + 'px';
    p.style.left   = cx + 'px';
    p.style.top    = cy + 'px';

    // Random blue/white palette
    const palette = ['#4a90d9', '#ffffff', '#2a6099', '#7bb8f0', '#1a4070'];
    p.style.background = palette[Math.floor(Math.random() * palette.length)];

    gameArea.appendChild(p);

    // Random angle and distance
    const angle    = Math.random() * 2 * Math.PI;
    const distance = 40 + Math.random() * 60;
    const tx       = Math.cos(angle) * distance;
    const ty       = Math.sin(angle) * distance;

    // Trigger animation via inline keyframe
    p.animate([
      { transform: 'translate(-50%,-50%) scale(1)',   opacity: 1 },
      { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`, opacity: 0 },
    ], {
      duration: 450 + Math.random() * 200,
      easing:   'cubic-bezier(0.2, 0, 0.8, 1)',
      fill:     'forwards',
    }).onfinish = () => p.remove();
  }
}

// ========================================
// Repulsion
// ========================================

let repelOffsetX = 0;
let repelOffsetY = 0;

function applyRepulsion(shapeX, shapeY) {
  // shapeX/Y = center of shape in client coords
  let totalRx = 0;
  let totalRy = 0;

  holes.forEach(hole => {
    if (hole.id === CORRECT_HOLE) return; // no repulsion from correct hole

    const r  = hole.getBoundingClientRect();
    const hx = r.left + r.width  / 2;
    const hy = r.top  + r.height / 2;

    const dx   = shapeX - hx;
    const dy   = shapeY - hy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < REPEL_RADIUS && dist > 0) {
      const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH;
      totalRx += (dx / dist) * force;
      totalRy += (dy / dist) * force;
    }
  });

  repelOffsetX = totalRx;
  repelOffsetY = totalRy;
}

// ========================================
// Skip button troll
// ========================================

function initSkipTroll() {
  const tCmd   = document.getElementById('t-cmd');
  const tCursor = document.getElementById('t-cursor');
  const tError = document.getElementById('t-error');
  const tHint  = document.getElementById('t-hint');
  const CMD    = 'skip --force';
  let termTimer  = null;
  let termActive = false;

  skipBtn.addEventListener('mouseenter', () => {
    termActive = true;
    skipBtn.classList.add('terminal-active');
    tCmd.textContent     = '';
    tError.style.opacity = '0';
    tHint.style.opacity  = '0';
    tCursor.style.display = 'inline-block';

    let i = 0;
    function typeCmd() {
      if (!termActive) return;
      if (i < CMD.length) {
        tCmd.textContent += CMD[i++];
        termTimer = setTimeout(typeCmd, 65 + Math.random() * 45);
      } else {
        tCursor.style.display = 'none';
        setTimeout(() => {
          if (!termActive) return;
          tError.textContent   = 'bash: skip: command not found';
          tError.style.opacity = '1';
          setTimeout(() => {
            if (!termActive) return;
            tHint.textContent   = 'Did you mean: solve?';
            tHint.style.opacity = '1';
          }, 380);
        }, 320);
      }
    }
    setTimeout(typeCmd, 140);
  });

  skipBtn.addEventListener('mouseleave', () => {
    termActive = false;
    clearTimeout(termTimer);
    skipBtn.classList.remove('terminal-active');
    tCmd.textContent      = '';
    tError.style.opacity  = '0';
    tHint.style.opacity   = '0';
    tCursor.style.display = 'inline-block';
  });
}

// ========================================
// Game Logic
// ========================================

function startGame() {
  currentIndex   = 0;
  lives          = 3;
  streak         = 0;
  shapePlaced    = false;
  shuffledShapes = shuffle(SHAPES);
  verifyBtn.classList.add('hidden');
  hidePrompt();
  updateLives();
  loadNextShape();
}

function loadNextShape() {
  if (currentIndex >= shuffledShapes.length) { showSuccess(); return; }

  shapePlaced = false;
  const shape = shuffledShapes[currentIndex];

  progressText.textContent = `Shape ${currentIndex + 1} of ${shuffledShapes.length}`;
  setPrompt(shape.name, 'prompt-name');

  // Set image
  activeShape.src    = shape.src;
  activeShape.alt    = shape.name;

  // Position above game area
  activeShape.style.transition  = 'none';
  activeShape.style.position    = 'absolute';
  activeShape.style.width       = SHAPE_SIZE + 'px';
  activeShape.style.height      = SHAPE_SIZE + 'px';
  activeShape.style.left        = centerX() + 'px';
  activeShape.style.top         = (-SHAPE_SIZE - 20) + 'px';
  activeShape.style.opacity     = '1';
  activeShape.style.display     = 'block';
  activeShape.style.zIndex      = '10';
  activeShape.style.cursor      = 'grab';
  activeShape.style.transform   = '';
  activeShape.style.mixBlendMode = 'multiply';
  activeShape.style.filter      = 'drop-shadow(2px 4px 6px rgba(0,0,0,0.35))';

  void activeShape.offsetWidth;

  activeShape.style.transition = 'top 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  activeShape.style.top        = centerY() + 'px';

  setTimeout(() => {
    setPrompt('Which hole does it fit?', 'prompt-question');
    enableDrag();
  }, 600);
}

function handleCorrectDrop(hole) {
  shapePlaced = true;
  disableDrag();
  snapToHole(hole);
  setPrompt("That's right, into the square hole!", 'prompt-correct');

  streak++;
  showStreakBadge(streak);
  spawnParticles(hole);

  setTimeout(() => {
    activeShape.style.transition = 'transform 0.25s ease, opacity 0.25s ease';
    activeShape.style.transform  = 'scale(0)';
    activeShape.style.opacity    = '0';
    setTimeout(() => {
      activeShape.style.transform = '';
      currentIndex++;
      loadNextShape();
    }, 280);
  }, 600);
}

function handleWrongDrop(hole) {
  hole.classList.add('wrong');
  setTimeout(() => hole.classList.remove('wrong'), 400);

  streak = 0;
  lives--;
  updateLives();
  setPrompt(lives === 0 ? 'Game over!' : 'Not that one...', 'prompt-wrong');

  if (lives === 0) {
    activeShape.style.transition = 'transform 0.45s ease, opacity 0.45s ease';
    activeShape.style.transform  = 'scale(0.3) rotate(540deg) translateY(-150px)';
    activeShape.style.opacity    = '0';
    setTimeout(() => {
      lives        = 3;
      streak       = 0;
      currentIndex = 0;
      activeShape.style.transform = '';
      activeShape.style.opacity   = '1';
      updateLives();
      loadNextShape();
    }, 700);
  } else {
    returnToCenter();
  }
}

function showSuccess() {
  progressText.textContent  = 'All shapes sorted!';
  activeShape.style.display = 'none';
  setPrompt('You passed the vibe check ✓', 'prompt-correct');
  verifyBtn.classList.remove('hidden');
}

function updateLives() {
  for (let i = 1; i <= 3; i++) {
    document.getElementById(`life-${i}`).classList.toggle('lost', i > lives);
  }
}

// ========================================
// Snap / Return
// ========================================

function snapToHole(hole) {
  const gr = gameArea.getBoundingClientRect();
  const hr = hole.getBoundingClientRect();

  activeShape.style.transition = 'left 0.15s cubic-bezier(0.2,0,0.2,1.5), top 0.15s cubic-bezier(0.2,0,0.2,1.5)';
  activeShape.style.left       = (hr.left - gr.left + hr.width  / 2 - SHAPE_SIZE / 2) + 'px';
  activeShape.style.top        = (hr.top  - gr.top  + hr.height / 2 - SHAPE_SIZE / 2) + 'px';
}

function returnToCenter() {
  activeShape.style.transition = 'left 0.22s cubic-bezier(0.2,0,0.2,1.5), top 0.22s cubic-bezier(0.2,0,0.2,1.5)';
  activeShape.style.left       = centerX() + 'px';
  activeShape.style.top        = centerY() + 'px';
}

// ========================================
// Enable / Disable Drag
// ========================================

function enableDrag() {
  activeShape.addEventListener('mousedown',  startDrag);
  activeShape.addEventListener('touchstart', startDrag, { passive: false });
}

function disableDrag() {
  activeShape.removeEventListener('mousedown',  startDrag);
  activeShape.removeEventListener('touchstart', startDrag);
}

// ========================================
// Drag
// ========================================

function startDrag(e) {
  e.preventDefault();
  if (shapePlaced) return;

  isDragging   = true;
  repelOffsetX = 0;
  repelOffsetY = 0;

  const coords = getCoords(e);
  const rect   = activeShape.getBoundingClientRect();
  dragOffsetX  = coords.x - rect.left;
  dragOffsetY  = coords.y - rect.top;

  activeShape.style.transition = 'none';
  activeShape.style.zIndex     = '999';
  activeShape.style.cursor     = 'grabbing';
  activeShape.style.transform  = 'scale(1.12) rotate(3deg)';
  activeShape.style.filter     = 'drop-shadow(4px 8px 12px rgba(0,0,0,0.5))';
}

document.addEventListener('mousemove', onDrag);
document.addEventListener('touchmove', onDrag, { passive: false });

function onDrag(e) {
  if (!isDragging) return;
  e.preventDefault();

  const coords = getCoords(e);
  const gr     = gameArea.getBoundingClientRect();

  // Base position from cursor
  const baseX = coords.x - gr.left - dragOffsetX;
  const baseY = coords.y - gr.top  - dragOffsetY;

  // Shape center in client coords
  const shapeCX = coords.x - dragOffsetX + SHAPE_SIZE / 2;
  const shapeCY = coords.y - dragOffsetY + SHAPE_SIZE / 2;

  applyRepulsion(shapeCX, shapeCY);

  activeShape.style.left = (baseX + repelOffsetX) + 'px';
  activeShape.style.top  = (baseY + repelOffsetY) + 'px';

  holes.forEach(hole => {
    const r = hole.getBoundingClientRect();
    hole.classList.toggle('drag-over',
      coords.x >= r.left && coords.x <= r.right &&
      coords.y >= r.top  && coords.y <= r.bottom
    );
  });
}

document.addEventListener('mouseup',  endDrag);
document.addEventListener('touchend', endDrag);

function endDrag(e) {
  if (!isDragging) return;
  isDragging   = false;
  repelOffsetX = 0;
  repelOffsetY = 0;

  activeShape.style.transform = '';
  activeShape.style.filter    = 'drop-shadow(2px 4px 6px rgba(0,0,0,0.35))';
  activeShape.style.cursor    = 'grab';
  activeShape.style.zIndex    = '10';

  holes.forEach(h => h.classList.remove('drag-over'));

  const coords = getCoords(e);
  const hole   = getHoleAt(coords.x, coords.y);

  if (hole) {
    hole.id === CORRECT_HOLE ? handleCorrectDrop(hole) : handleWrongDrop(hole);
  } else {
    returnToCenter();
  }
}

function getHoleAt(x, y) {
  for (const hole of holes) {
    const r = hole.getBoundingClientRect();
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return hole;
  }
  return null;
}

function getCoords(e) {
  if (e.touches        && e.touches.length        > 0) return { x: e.touches[0].clientX,        y: e.touches[0].clientY        };
  if (e.changedTouches && e.changedTouches.length > 0) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  return { x: e.clientX, y: e.clientY };
}

// ========================================
// Buttons
// ========================================

resetBtn.addEventListener('click', () => {
  disableDrag();
  startGame();
});

verifyBtn.addEventListener('click', () => {
  alert('✅ Verified! You passed the vibe check.');
});

// ========================================
// Start
// ========================================

window.addEventListener('load', () => {
  initSkipTroll();
  startGame();
});
