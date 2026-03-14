// ==========================================
// DevQuest — Sound System (Web Audio API)
// No files needed — all sounds generated
// ==========================================

const DQSounds = window.DQSounds = (() => {
  let ctx   = null;
  let muted = localStorage.getItem('dq-muted') === 'true';

  // ── Audio context (lazy init + iOS fix) ──
  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }

  // ── Safari AudioContext unlock ──
  // Safari requires AudioContext to be created AND unlocked
  // inside a direct user gesture. Playing a silent buffer does this.
  function unlockAudio() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctx.state === 'suspended') {
      // Play a silent 1-sample buffer — this is the standard Safari unlock
      const buf    = ctx.createBuffer(1, 1, ctx.sampleRate);
      const source = ctx.createBufferSource();
      source.buffer = buf;
      source.connect(ctx.destination);
      source.start(0);
      ctx.resume();
    }
  }

  // Listen on every gesture so Safari doesn't re-suspend silently
  function resumeOnGesture() {
    const events = ['mousedown', 'touchstart', 'pointerdown', 'keydown'];
    events.forEach(e =>
      document.addEventListener(e, unlockAudio, { passive: true })
    );
  }

  // ── Primitives ──

  // Simple tone with attack + exponential decay
  function tone(actx, freq, duration, vol = 0.25, type = 'sine', delay = 0) {
    const osc  = actx.createOscillator();
    const gain = actx.createGain();
    osc.connect(gain);
    gain.connect(actx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, actx.currentTime + delay);
    gain.gain.setValueAtTime(0, actx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(vol, actx.currentTime + delay + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + delay + duration);
    osc.start(actx.currentTime + delay);
    osc.stop(actx.currentTime + delay + duration + 0.02);
  }

  // Frequency sweep (glide from f1 to f2)
  function sweep(actx, f1, f2, duration, vol = 0.18, type = 'sine', delay = 0) {
    const osc  = actx.createOscillator();
    const gain = actx.createGain();
    osc.connect(gain);
    gain.connect(actx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(f1, actx.currentTime + delay);
    osc.frequency.linearRampToValueAtTime(f2, actx.currentTime + delay + duration);
    gain.gain.setValueAtTime(0, actx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(vol, actx.currentTime + delay + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + delay + duration);
    osc.start(actx.currentTime + delay);
    osc.stop(actx.currentTime + delay + duration + 0.02);
  }

  // Noise burst (for thud/grab feel)
  function noise(actx, duration, vol = 0.15, delay = 0) {
    const bufferSize = actx.sampleRate * duration;
    const buffer     = actx.createBuffer(1, bufferSize, actx.sampleRate);
    const data       = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const src    = actx.createBufferSource();
    const filter = actx.createBiquadFilter();
    const gain   = actx.createGain();
    src.buffer = buffer;
    filter.type      = 'lowpass';
    filter.frequency.value = 400;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(actx.destination);
    gain.gain.setValueAtTime(vol, actx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + delay + duration);
    src.start(actx.currentTime + delay);
    src.stop(actx.currentTime + delay + duration + 0.02);
  }

  // ── Auto-duck state ──
  let musicEl      = null;
  let musicBaseVol = 0.2;
  let duckTimer    = null;
  let restoreIntvl = null;

  function duckMusic() {
    if (!musicEl || musicEl.paused) return;
    // Cancel any in-progress restore
    clearTimeout(duckTimer);
    clearInterval(restoreIntvl);
    // Instant duck to 20% of base
    musicEl.volume = 0.04;
    // Smooth restore after SFX settles
    duckTimer = setTimeout(() => {
      restoreIntvl = setInterval(() => {
        if (!musicEl) { clearInterval(restoreIntvl); return; }
        const next = Math.min(musicEl.volume + 0.012, musicBaseVol);
        musicEl.volume = next;
        if (next >= musicBaseVol) clearInterval(restoreIntvl);
      }, 28);
    }, 680);
  }

  // ── Background music removed from Web Audio API ──
  // Handled via <audio> element in captcha.js to avoid
  // breaking AudioContext on Safari

  function play(fn) {
    // SFX always play — mute only controls music
    duckMusic();
    try {
      const actx = getCtx();
      if (actx.state === 'suspended') {
        actx.resume().then(() => fn(actx)).catch(() => {});
      } else {
        fn(actx);
      }
    } catch (e) {}
  }

  // ── Public API ──
  const api = {

    isMuted: () => muted,

    setMusicEl(el) {
      musicEl = el;
      if (el) el.volume = musicBaseVol;
    },

    toggleMute() {
      muted = !muted;
      localStorage.setItem('dq-muted', muted);
      return muted;
    },

    resume() {
      if (ctx && ctx.state === 'suspended') ctx.resume();
    },

    // ────────────────────────────────────────
    // DEVTYPE SOUNDS
    // ────────────────────────────────────────

    // Typewriter intro — plays on page load
    introTypewriter() {
      play(actx => {
        const pitches = [950, 1100, 880, 1020, 960, 1080, 840, 1100, 1000];
        pitches.forEach((freq, i) => {
          tone(actx, freq, 0.022, 0.055, 'square', 0.08 + i * 0.065);
        });
        // Trailing "ding" at the end
        tone(actx, 1400, 0.18, 0.07, 'sine', 0.08 + pitches.length * 0.065 + 0.05);
      });
    },

    // Single keypress — barely audible, satisfying
    keyClick(correct = true) {
      play(actx => {
        if (correct) {
          tone(actx, 1080, 0.022, 0.038, 'square');
        } else {
          tone(actx, 220, 0.05, 0.055, 'sawtooth');
          noise(actx, 0.04, 0.03, 0.01);
        }
      });
    },

    // Word submitted correctly
    wordComplete() {
      play(actx => {
        tone(actx, 880,  0.09, 0.1, 'sine');
        tone(actx, 1100, 0.07, 0.08, 'sine', 0.07);
      });
    },

    // Word submitted wrong
    wordWrong() {
      play(actx => {
        tone(actx, 280, 0.14, 0.1, 'sawtooth');
        tone(actx, 220, 0.1,  0.08, 'sawtooth', 0.1);
      });
    },

    // Autocomplete popup appears
    autocompleteAppear() {
      play(actx => {
        sweep(actx, 550, 850, 0.14, 0.07, 'sine');
      });
    },

    // Tab pressed — wrong autocomplete inserted (troll wah wah)
    tabWrong() {
      play(actx => {
        tone(actx, 380, 0.14, 0.12, 'sawtooth', 0);
        tone(actx, 260, 0.14, 0.12, 'sawtooth', 0.15);
        tone(actx, 190, 0.18, 0.10, 'sawtooth', 0.30);
      });
    },

    // Timer at 10s
    timerWarning() {
      play(actx => {
        tone(actx, 660, 0.07, 0.1, 'sine');
      });
    },

    // Timer at 5s — heartbeat pair
    timerDanger() {
      play(actx => {
        tone(actx, 440, 0.05, 0.12, 'sine', 0);
        tone(actx, 440, 0.05, 0.10, 'sine', 0.09);
      });
    },

    // Game passed — warm ascending chime
    gamePass() {
      play(actx => {
        [523, 659, 784, 1047].forEach((freq, i) => {
          tone(actx, freq, 0.45, 0.14, 'sine', i * 0.13);
        });
      });
    },

    // Game failed — descending mournful tones
    gameFail() {
      play(actx => {
        [392, 330, 262, 220].forEach((freq, i) => {
          tone(actx, freq, 0.4, 0.11, 'sine', i * 0.18);
        });
      });
    },

    // ────────────────────────────────────────
    // CAPTCHA SOUNDS
    // ────────────────────────────────────────

    // Shape picked up to drag
    shapePickup() {
      play(actx => {
        sweep(actx, 350, 580, 0.1, 0.08, 'sine');
        noise(actx, 0.05, 0.04);
      });
    },

    // Dropped in correct hole
    correctDrop() {
      play(actx => {
        tone(actx,  160, 0.18, 0.22, 'sine',   0);      // hollow thunk
        noise(actx, 0.06, 0.08, 0.02);                  // impact noise
        tone(actx, 1000, 0.12, 0.10, 'sine',  0.06);   // satisfying pop
      });
    },

    // Dropped in wrong hole
    wrongHole() {
      play(actx => {
        tone(actx, 220, 0.14, 0.15, 'sawtooth', 0);
        tone(actx, 170, 0.12, 0.12, 'sawtooth', 0.12);
        noise(actx, 0.08, 0.06, 0.01);
      });
    },

    // All shapes sorted — playful fanfare
    allSorted() {
      play(actx => {
        [523, 659, 784, 659, 1047].forEach((freq, i) => {
          tone(actx, freq, 0.35, 0.16, 'sine', i * 0.11);
        });
      });
    },

    // Life lost
    lifeLost() {
      play(actx => {
        sweep(actx, 460, 200, 0.35, 0.14, 'sine');
      });
    },

    // ────────────────────────────────────────
    // SHARED
    // ────────────────────────────────────────

    // ── Skip button terminal sounds (A+E) ──

    // A: mechanical click per character — slight pitch variation per key
    terminalClick() {
      play(actx => {
        const freq = 820 + Math.random() * 320;
        tone(actx, freq, 0.018, 0.042, 'square');
      });
    },

    // E: typewriter ding when typing finishes
    terminalDing() {
      play(actx => {
        tone(actx, 1760, 0.14, 0.08, 'sine', 0);
        tone(actx, 1320, 0.10, 0.06, 'sine', 0.08);
        // Carriage return clunk
        noise(actx, 0.06, 0.06, 0.18);
        tone(actx, 180,  0.08, 0.07, 'sine', 0.18);
      });
    },

    // Error buzz when "command not found" appears
    terminalError() {
      play(actx => {
        tone(actx, 220, 0.18, 0.12, 'sawtooth', 0);
        tone(actx, 175, 0.14, 0.10, 'sawtooth', 0.18);
        tone(actx, 140, 0.12, 0.08, 'sawtooth', 0.34);
      });
    },

    themeToggle(toLight) {
      play(actx => {
        if (toLight) sweep(actx, 700, 1100, 0.14, 0.08, 'sine');
        else         sweep(actx, 550,  280, 0.18, 0.09, 'sine');
      });
    },
  };

  // Start resumeOnGesture immediately
  resumeOnGesture();

  return api;
})();
