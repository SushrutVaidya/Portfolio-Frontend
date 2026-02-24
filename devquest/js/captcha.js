// ========================================
// DevQuest Captcha - Drag and Drop Logic
// ========================================

// Track which shapes have been placed in the square hole (array - can hold multiple)
const placedShapes = []; // [shapeId, shapeId, ...]

// Track the shape being dragged
let draggingShape = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

// All shape and hole elements
const shapes = document.querySelectorAll('.shape');
const holes = document.querySelectorAll('.hole');

// The ONLY correct hole
const CORRECT_HOLE = 'hole-square';

// ========================================
// Audio - Generate sounds using Web Audio API
// No external files needed!
// ========================================

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Pickup sound - short soft click
function playPickupSound() {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.setValueAtTime(600, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(900, audioCtx.currentTime + 0.08);
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.1);
}

// Drop/snap sound - satisfying thud
function playDropSound() {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.2);
}

// Wrong sound - short error buzz
function playWrongSound() {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(200, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.2);
}

// Success sound - ascending chime
function playSuccessSound() {
  [500, 700, 900, 1200].forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.1);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime + i * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.1 + 0.3);
    osc.start(audioCtx.currentTime + i * 0.1);
    osc.stop(audioCtx.currentTime + i * 0.1 + 0.3);
  });
}

// ========================================
// Store original positions for reset
// ========================================

const originalPositions = {};

shapes.forEach(shape => {
  originalPositions[shape.id] = {
    top: shape.style.top,
    left: shape.style.left
  };
});

// ========================================
// Drag Start - Mouse and Touch
// ========================================

shapes.forEach(shape => {
  shape.addEventListener('mousedown', startDrag);
  shape.addEventListener('touchstart', startDrag, { passive: false });
});

function startDrag(e) {
  e.preventDefault();

  // Resume audio context on user gesture (browser requirement)
  if (audioCtx.state === 'suspended') audioCtx.resume();

  draggingShape = this;

  // Get click coordinates
  const coords = getCoords(e);

  // Offset = where user clicked within the shape
  const rect = draggingShape.getBoundingClientRect();
  dragOffsetX = coords.x - rect.left;
  dragOffsetY = coords.y - rect.top;

  // Add dragging class for visual feedback
  draggingShape.classList.add('dragging');
  draggingShape.style.zIndex = 1000;
  draggingShape.style.transition = 'none';

  // If shape was snapped to the square hole, free it
  if (placedShapes.includes(draggingShape.id)) {
    placedShapes.splice(placedShapes.indexOf(draggingShape.id), 1);
    draggingShape.classList.remove('snapped');
  }

  playPickupSound();
}

// ========================================
// Dragging - Mouse and Touch
// ========================================

document.addEventListener('mousemove', onDrag);
document.addEventListener('touchmove', onDrag, { passive: false });

function onDrag(e) {
  if (!draggingShape) return;
  e.preventDefault();

  const coords = getCoords(e);

  // Position relative to game area
  const gameArea = document.getElementById('game-area');
  const gameRect = gameArea.getBoundingClientRect();

  const x = coords.x - gameRect.left - dragOffsetX;
  const y = coords.y - gameRect.top - dragOffsetY;

  draggingShape.style.position = 'absolute';
  draggingShape.style.left = x + 'px';
  draggingShape.style.top = y + 'px';

  // Highlight hole under shape
  highlightHoleUnderShape(coords.x, coords.y);
}

// ========================================
// Drag End - Mouse and Touch
// ========================================

document.addEventListener('mouseup', endDrag);
document.addEventListener('touchend', endDrag);

function endDrag(e) {
  if (!draggingShape) return;

  const coords = getCoords(e);

  // Remove dragging class
  draggingShape.classList.remove('dragging');

  // Remove all highlights
  holes.forEach(hole => hole.classList.remove('drag-over'));

  // Check if shape is over a hole
  const targetHole = getHoleUnderShape(coords.x, coords.y);

  if (targetHole) {
    if (targetHole.id === CORRECT_HOLE) {
      // Correct hole - snap it in!
      snapShapeToHole(draggingShape, targetHole);
      playDropSound();
    } else {
      // Wrong hole - reject with shake and bounce back
      rejectShape(draggingShape, targetHole);
    }
  } else {
    // Dropped in empty space - return to original
    returnToOriginal(draggingShape);
  }

  draggingShape.style.zIndex = '';
  draggingShape = null;
}

// ========================================
// Snap Shape to Correct Hole
// ========================================

function snapShapeToHole(shape, hole) {
  // Add shape to placed list (square hole stacks all shapes)
  if (!placedShapes.includes(shape.id)) {
    placedShapes.push(shape.id);
  }

  // Center shape in hole - stack slightly offset so you can see them
  const gameArea = document.getElementById('game-area');
  const gameRect = gameArea.getBoundingClientRect();
  const holeRect = hole.getBoundingClientRect();
  const shapeSize = parseInt(window.getComputedStyle(shape).width);
  const stackOffset = placedShapes.indexOf(shape.id) * 2; // slight stack offset

  const x = holeRect.left - gameRect.left + (holeRect.width / 2) - (shapeSize / 2) + stackOffset;
  const y = holeRect.top - gameRect.top + (holeRect.height / 2) - (shapeSize / 2) + stackOffset;

  // Snappy snap animation
  shape.style.transition = 'left 0.12s cubic-bezier(0.2, 0, 0.2, 1.5), top 0.12s cubic-bezier(0.2, 0, 0.2, 1.5), transform 0.12s ease';
  shape.style.left = x + 'px';
  shape.style.top = y + 'px';
  shape.classList.add('snapped');
}

// ========================================
// Reject Shape - Wrong Hole
// ========================================

function rejectShape(shape, hole) {
  // Shake the hole
  hole.classList.add('wrong');
  setTimeout(() => hole.classList.remove('wrong'), 400);

  // Play wrong sound
  playWrongSound();

  // Bounce shape back to original
  returnToOriginal(shape);
}

// ========================================
// Return Shape to Original Position
// ========================================

function returnToOriginal(shape) {
  // If shape was in the square hole, remove it from list
  if (placedShapes.includes(shape.id)) {
    placedShapes.splice(placedShapes.indexOf(shape.id), 1);
  }
  shape.classList.remove('snapped');
  shape.style.transition = 'left 0.2s cubic-bezier(0.2, 0, 0.2, 1.5), top 0.2s cubic-bezier(0.2, 0, 0.2, 1.5)';
  shape.style.left = originalPositions[shape.id].left;
  shape.style.top = originalPositions[shape.id].top;
}

// ========================================
// Highlight Hole Under Shape
// ========================================

function highlightHoleUnderShape(x, y) {
  holes.forEach(hole => {
    const rect = hole.getBoundingClientRect();
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      hole.classList.add('drag-over');
    } else {
      hole.classList.remove('drag-over');
    }
  });
}

// ========================================
// Get Hole Under Shape
// ========================================

function getHoleUnderShape(x, y) {
  for (const hole of holes) {
    const rect = hole.getBoundingClientRect();
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      return hole;
    }
  }
  return null;
}

// ========================================
// Get Coordinates (Mouse + Touch)
// ========================================

function getCoords(e) {
  if (e.touches && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  } else if (e.changedTouches && e.changedTouches.length > 0) {
    return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  }
  return { x: e.clientX, y: e.clientY };
}

// ========================================
// Reset Button
// ========================================

document.getElementById('reset-btn').addEventListener('click', () => {
  // Clear placed shapes array
  placedShapes.length = 0;

  // Return all shapes to original
  shapes.forEach(shape => {
    shape.classList.remove('snapped', 'dragging');
    shape.style.transition = 'left 0.25s cubic-bezier(0.2, 0, 0.2, 1.5), top 0.25s cubic-bezier(0.2, 0, 0.2, 1.5)';
    shape.style.left = originalPositions[shape.id].left;
    shape.style.top = originalPositions[shape.id].top;
  });

  playWrongSound();
});

// ========================================
// Verify Button - THE TRICK
// All shapes must go in the SQUARE hole
// ========================================

document.getElementById('verify-btn').addEventListener('click', () => {
  const totalShapes = shapes.length;
  const shapesInSquare = Object.entries(placedShapes)
    .filter(([holeId]) => holeId === CORRECT_HOLE).length;

  if (placedShapes.length === totalShapes) {
    // ALL shapes in square - SUCCESS!
    playSuccessSound();
    alert('✅ Verified! You passed the vibe check.');
  } else if (placedShapes.length === 0) {
    alert('Put the shapes in the correct holes first!');
  } else {
    // Some placed but not all in square
    playWrongSound();
    alert(`❌ ${placedShapes.length}/${totalShapes} in square. Try again...`);
  }
});
