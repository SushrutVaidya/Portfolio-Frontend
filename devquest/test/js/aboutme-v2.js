// About Me v2 — GTA V Light + Bold
(() => {
  const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8081'
    : '';

  if (!localStorage.getItem('dq-stat-social')) {
    localStorage.setItem('dq-stat-social', '70');
  }

  async function apiFetch(path) {
    const res = await fetch(API_BASE + path);
    if (!res.ok) throw new Error(res.status);
    return res.json();
  }

  // ════════════════════════════════════
  //  INTRO SEQUENCE — GTA Loading Screen
  // ════════════════════════════════════
  const INTRO_TIPS = [
    "Loading profile data...",
    "Analyzing character stats...",
    "Compiling wanted posters...",
    "Calibrating spice tolerance...",
    "Syncing Steam backlog...",
    "Buffering Gintama quotes...",
    "Profile loaded."
  ];

  function runIntro() {
    const overlay = document.getElementById('intro-overlay');
    const fill = document.getElementById('intro-fill');
    const tipEl = document.getElementById('intro-tip');
    const flash = document.getElementById('intro-flash');
    const body = document.body;

    if (!overlay) { body.classList.remove('loading'); return; }

    let progress = 0;
    let tipIdx = 0;
    const totalDuration = 2800; // ms
    const stepTime = 50;
    const steps = totalDuration / stepTime;
    const increment = 100 / steps;

    const tipInterval = setInterval(() => {
      tipIdx++;
      if (tipIdx < INTRO_TIPS.length) {
        tipEl.style.opacity = '0';
        setTimeout(() => {
          tipEl.textContent = INTRO_TIPS[tipIdx];
          tipEl.style.opacity = '1';
        }, 150);
      }
    }, 400);

    const progressInterval = setInterval(() => {
      progress += increment + (Math.random() * increment * 0.5);
      if (progress >= 100) progress = 100;
      fill.style.width = progress + '%';

      if (progress >= 100) {
        clearInterval(progressInterval);
        clearInterval(tipInterval);

        // Flash + reveal
        setTimeout(() => {
          tipEl.textContent = INTRO_TIPS[INTRO_TIPS.length - 1];
          flash.classList.add('active');

          setTimeout(() => {
            overlay.classList.add('done');
            body.classList.remove('loading');

            // Stagger in hero elements
            const heroInner = document.querySelector('.gta-hero-inner');
            if (heroInner) {
              heroInner.style.animation = 'heroSlideIn 0.8s cubic-bezier(0.16,1,0.3,1) both';
            }

            // Remove overlay from DOM after transition
            setTimeout(() => overlay.remove(), 800);
          }, 400);
        }, 300);
      }
    }, stepTime);
  }

  // ════════════════════════════════════
  //  SCROLL PROGRESS BAR
  // ════════════════════════════════════
  function initScrollProgress() {
    const fill = document.getElementById('scroll-fill');
    if (!fill) return;

    function update() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      fill.style.width = progress + '%';
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // ════════════════════════════════════
  //  LOADING TIPS — rotate through them
  // ════════════════════════════════════
  const TIPS = [
    "Sushrut has never successfully made round rotis. The irregularity adds character.",
    "If he's quiet, he's either debugging or rewatching Gintama. There is no third option.",
    "His Steam backlog has 73 games. He has completed 12% of them.",
    "Approach with biryani for +100 friendship points. Hyderabadi only.",
    "His cooking is either a 10/10 or a health hazard. There is no in-between.",
    "He once spent 3 hours debugging a missing semicolon. He does not talk about it.",
    "Don't ask him about Gintama unless you have 3 hours to spare.",
    "If you hear Bollywood music at 2am, that's just Sushrut 'unwinding'.",
    "His spice tolerance is classified as a public safety concern.",
    "He calls gym 'character development'. The arc is ongoing.",
    "Sucker for craft beers and good food. Weekend plans are mandatory."
  ];

  function initTips() {
    const tipEl = document.getElementById('gta-tip');
    if (!tipEl) return;
    let idx = 0;
    tipEl.textContent = TIPS[0];
    setInterval(() => {
      idx = (idx + 1) % TIPS.length;
      tipEl.style.opacity = '0';
      setTimeout(() => {
        tipEl.textContent = TIPS[idx];
        tipEl.style.opacity = '1';
      }, 400);
    }, 5000);
    tipEl.style.transition = 'opacity 0.4s ease';
  }

  // ════════════════════════════════════
  //  CHARACTER SWITCH WHEEL
  // ════════════════════════════════════
  function initWheel() {
    const trigger = document.getElementById('wheel-trigger');
    const overlay = document.getElementById('wheel-overlay');
    const segments = document.querySelectorAll('.gta-wheel-seg');
    if (!trigger || !overlay) return;

    trigger.addEventListener('click', () => {
      overlay.classList.add('active');
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('active');
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') overlay.classList.remove('active');
    });

    segments.forEach(seg => {
      seg.addEventListener('click', () => {
        const section = seg.dataset.section;
        const target = document.getElementById(section);
        if (target) {
          overlay.classList.remove('active');
          setTimeout(() => {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 200);
        }
      });
    });
  }

  // ════════════════════════════════════
  //  GTA STAT PENTAGON (animated draw)
  // ════════════════════════════════════
  function initStatPentagon() {
    const canvas = document.getElementById('gta-stat-pentagon');
    if (!canvas) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          animatePentagon(canvas);
        }
      });
    }, { threshold: 0.3 });
    observer.observe(canvas);
  }

  function animatePentagon(canvas) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const cx = w / 2, cy = h / 2, r = 120;

    const labels = ['Dev', 'Design', 'Brain', 'Social', 'Grind'];
    const values = [88, 85, 92, 70, 95];
    const colors = ['#c8ff00', '#ff375f', '#ff6600', '#0a84ff', '#bf5af2'];
    const n = labels.length;
    const step = (Math.PI * 2) / n;
    const startAngle = -Math.PI / 2;

    // Draw static final frame
    ctx.clearRect(0, 0, w, h);

    // Grid rings
    for (let ring = 1; ring <= 4; ring++) {
      const rr = (r / 4) * ring;
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const a = startAngle + step * i;
        const x = cx + Math.cos(a) * rr;
        const y = cy + Math.sin(a) * rr;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Axis lines
    for (let i = 0; i < n; i++) {
      const a = startAngle + step * i;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.stroke();
    }

    // Data polygon — STATIC (no animation for now)
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const idx = i % n;
      const a = startAngle + step * idx;
      const v = (values[idx] / 100) * r;
      const x = cx + Math.cos(a) * v;
      const y = cy + Math.sin(a) * v;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();

    ctx.fillStyle = 'rgba(255,102,0,0.35)';
    ctx.fill();
    ctx.strokeStyle = '#ff6600';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Data points
    for (let i = 0; i < n; i++) {
      const a = startAngle + step * i;
      const v = (values[i] / 100) * r;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * v, cy + Math.sin(a) * v, 6, 0, Math.PI * 2);
      ctx.fillStyle = colors[i];
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      const lr = r + 28;
      const lx = cx + Math.cos(a) * lr;
      const ly = cy + Math.sin(a) * lr;
      ctx.font = '700 11px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillText(labels[i], lx, ly);

      // Value — stacked below label
      ctx.font = '800 10px -apple-system, sans-serif';
      ctx.fillStyle = colors[i];
      ctx.fillText(values[i], lx, ly + 14);
    }

    canvas.classList.add('glow');
    const wrap = canvas.closest('.stats-pentagon-wrap');
    if (wrap) wrap.classList.add('pulse');
  }

  // ════════════════════════════════════
  //  WANTED POSTER REVEAL
  // ════════════════════════════════════
  function initWantedPosters() {
    const posters = document.querySelectorAll('.wanted-poster');
    if (!posters.length) return;

    posters.forEach(poster => {
      const front = poster.querySelector('.wanted-front');
      const reveal = poster.querySelector('.wanted-reveal');
      const closeBtn = reveal ? reveal.querySelector('.wanted-close') : null;

      // Click poster to reveal
      front.addEventListener('click', () => {
        openPoster(poster, reveal);
      });

      // Close button
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          closePoster(poster, reveal);
        });
      }

      // Click backdrop to close
      if (reveal) {
        reveal.addEventListener('click', (e) => {
          if (e.target === reveal) closePoster(poster, reveal);
        });
      }
    });

    // Escape key closes any open poster
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const activeReveal = document.querySelector('.wanted-reveal.active');
        if (activeReveal) {
          const posterId = activeReveal.dataset.posterOwner;
          const poster = document.querySelector(`.wanted-poster[data-persona="${posterId}"]`);
          closePoster(poster, activeReveal);
        }
      }
    });
  }

  function openPoster(poster, reveal) {
    if (!reveal) return;
    // Move reveal to body so position:fixed works
    reveal.dataset.posterOwner = poster.dataset.persona;
    document.body.appendChild(reveal);
    poster.classList.add('revealed');
    document.body.style.overflow = 'hidden';
    // Trigger reflow then activate
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        reveal.classList.add('active');
      });
    });
  }

  function closePoster(poster, reveal) {
    if (!reveal) return;
    reveal.classList.remove('active');
    document.body.style.overflow = '';
    // Wait for transition then move reveal back
    setTimeout(() => {
      if (poster) {
        poster.classList.remove('revealed');
        poster.appendChild(reveal);
      }
    }, 450);
  }

  // ── Scroll Reveal ──
  function initReveal() {
    const els = document.querySelectorAll('.reveal:not(.visible)');
    if (!els.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    els.forEach(el => observer.observe(el));
  }

  // ── Stat Bars Animation ──
  function animateStatBars() {
    // Dossier card entrance
    const statsCard = document.querySelector('.stats-card');
    if (statsCard) {
      const cardObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            cardObs.unobserve(entry.target);
            entry.target.classList.add('in-view');
          }
        });
      }, { threshold: 0.15 });
      cardObs.observe(statsCard);
    }

    // Staggered row reveals + bar animation
    const rows = document.querySelectorAll('.gta-stat-row');
    if (!rows.length) return;

    const rowObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          rowObs.unobserve(entry.target);
          // Trigger slide-in (CSS handles delay per nth-child)
          entry.target.classList.add('in-view');

          const fill = entry.target.querySelector('.gta-stat-fill');
          const valEl = entry.target.querySelector('.gta-stat-val');
          const target = parseInt(fill.getAttribute('data-val'), 10);

          // Animate bar after row slides in
          setTimeout(() => {
            fill.style.width = target + '%';
          }, 100);

          // Count up value
          if (valEl) {
            const delay = 150;
            setTimeout(() => {
              valEl.classList.add('visible');
              const duration = 1400;
              const start = performance.now();
              function tick(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const ease = 1 - Math.pow(1 - progress, 3);
                valEl.textContent = Math.round(ease * target);
                if (progress < 1) {
                  requestAnimationFrame(tick);
                } else {
                  // Flash when done
                  valEl.classList.add('flash');
                }
              }
              requestAnimationFrame(tick);
            }, delay);
          }
        }
      });
    }, { threshold: 0.2 });

    rows.forEach(el => rowObs.observe(el));
  }

  // ── Wanted Stars — stagger animation ──
  function animateWantedStars() {
    const wanted = document.getElementById('wanted-level');
    if (!wanted) return;
    const stars = wanted.querySelectorAll('.wanted-badge-stars .gta-star');
    const activeCount = 4; // 4 out of 5 stars

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          stars.forEach((star, i) => {
            if (i < activeCount) {
              setTimeout(() => {
                star.classList.add('active');
              }, 200 + i * 250);
            }
          });
        }
      });
    }, { threshold: 0.5 });
    observer.observe(wanted);
  }

  // ── Lore: Typewriter (kept for reuse) ──
  function typeInto(el, text, speed) {
    el.textContent = '';
    let i = 0;
    const s = speed || 25;
    return new Promise(resolve => {
      function tick() {
        if (i < text.length) {
          el.textContent += text[i++];
          setTimeout(tick, s + Math.random() * 15);
        } else { resolve(); }
      }
      tick();
    });
  }

  // ════════════════════════════════════
  //  LORE ZONE 1: Phone Thread
  // ════════════════════════════════════
  const PHONE_MESSAGES = [
    { side: 'left', label: 'PETER', text: 'hey sushrut you know what really grinds my gears' },
    { side: 'right', label: '', text: 'peter it\'s 2 AM' },
    { side: 'left', label: 'PETER', text: 'people who play valorant' },
    { side: 'right', label: '', text: 'okay actually based. 1500 hours in CS2 and i still don\'t understand why people need abilities to aim' },
    { side: 'left', label: 'PETER', text: 'holy crap thats a lot of hours. what else do you do' },
    { side: 'right', label: '', text: 'cook mostly. just made biryani from scratch last night. also wiring up arduino circuits on a breadboard' },
    { side: 'left', label: 'PETER', text: 'arduino? is that like a pasta' },
    { side: 'right', label: '', text: '...it\'s a microcontroller peter' },
    { side: 'left', label: 'PETER', text: 'sounds like a pasta. anyway lois says hi. also your friend said you spent 3 hours debugging a semicolon' },
    { side: 'right', label: '', text: 'that friend is dead to me. also tell lois i said hi' },
    { side: 'left', label: 'PETER', text: 'hehehehehe' },
  ];

  function initPhoneThread() {
    const chat = document.getElementById('lore-chat');
    const phone = document.getElementById('lore-phone');
    if (!chat || !phone) return;

    // Set real time
    const timeEl = document.getElementById('lore-phone-time');
    if (timeEl) {
      const now = new Date();
      timeEl.textContent = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
    }

    let msgIdx = 0;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          dropMessages();
        }
      });
    }, { threshold: 0.3 });
    observer.observe(phone);

    function dropMessages() {
      if (msgIdx >= PHONE_MESSAGES.length) return;

      // Show typing indicator for left messages
      const msg = PHONE_MESSAGES[msgIdx];
      const isLeft = msg.side === 'left';

      if (isLeft) {
        const typing = document.createElement('div');
        typing.className = 'lore-typing';
        typing.innerHTML = '<span class="lore-typing-dot"></span><span class="lore-typing-dot"></span><span class="lore-typing-dot"></span>';
        chat.appendChild(typing);
        chat.scrollTop = chat.scrollHeight;

        setTimeout(() => {
          typing.remove();
          addBubble(msg);
          msgIdx++;
          setTimeout(dropMessages, 400 + Math.random() * 300);
        }, 600 + Math.random() * 400);
      } else {
        setTimeout(() => {
          addBubble(msg);
          msgIdx++;
          setTimeout(dropMessages, 300 + Math.random() * 300);
        }, 200);
      }
    }

    function addBubble(msg) {
      const div = document.createElement('div');
      div.className = 'lore-msg lore-msg-' + msg.side;
      div.style.animationDelay = '0s';
      if (msg.label) div.innerHTML = '<span class="lore-msg-label">' + msg.label + '</span>' + msg.text;
      else div.textContent = msg.text;
      chat.appendChild(div);
      requestAnimationFrame(() => { chat.scrollTop = chat.scrollHeight; });
    }
  }

  // ════════════════════════════════════
  //  LORE ZONE 2: Classified File
  // ════════════════════════════════════
  // ════════════════════════════════════
  //  RETRO TV (The Channel)
  // ════════════════════════════════════
  const TV_CHANNELS = [
    { show: 'FAMILY GUY', emoji: '📺', quote: "I've watched every episode. Multiple times. Peter Griffin is a lifestyle. Giggity.", clips: [API_BASE + '/clips/familyguy1.mp4', API_BASE + '/clips/familyguy2.mp4'] },
    { show: 'GINTAMA', emoji: '🎌', quote: "The anime that made me realize a show about a lazy samurai could have the best fight scenes AND the best toilet humor.", clips: [API_BASE + '/clips/gintama1.mp4', API_BASE + '/clips/gintama2.mp4'] },
    { show: 'DOOM ETERNAL', emoji: '💀', quote: "This isn't a game. It's a lifestyle. Rip and tear until you forget what day it is.", clips: [API_BASE + '/clips/doom1.mp4', API_BASE + '/clips/doom2.mp4'] },
    { show: 'GTA V', emoji: '🚗', quote: "The reason this whole portfolio exists. Los Santos never gets old.", clips: [API_BASE + '/clips/gtav1.mp4', API_BASE + '/clips/gtav2.mp4'] },
    { show: 'COUNTER-STRIKE 2', emoji: '💣', quote: "1500 hours. PS4 controller. Zero regrets. Valorant players can look away.", clips: [API_BASE + '/clips/cs21.mp4', API_BASE + '/clips/cs22.mp4'] },
    { show: 'SPACE MARINE 2', emoji: '⚔️', quote: "For the Emperor. No notes.", clips: [API_BASE + '/clips/sm21.mp4', API_BASE + '/clips/sm22.mp4'] },
  ];

  function initTV() {
    const screen = document.getElementById('tv-screen');
    const content = document.getElementById('tv-content');
    const staticEl = document.getElementById('tv-static');
    const channelEl = document.getElementById('tv-channel');
    const showEl = document.getElementById('tv-show');
    const emojiEl = document.getElementById('tv-emoji');
    const quoteEl = document.getElementById('tv-quote');
    const videoEl = document.getElementById('tv-video');
    const muteBtn = document.getElementById('tv-mute');
    const chKnob = document.getElementById('tv-prev');
    const volKnob = document.getElementById('tv-vol');
    const chFlash = document.getElementById('tv-ch-flash');

    if (!screen || !chKnob) return;

    let currentCh = 0;
    let switching = false;
    let warmedUp = false;

    // Volume levels: 0=mute, 0.33=low, 0.66=med, 1=high
    const VOL_STEPS = [0, 0.33, 0.66, 1];
    const VOL_ICONS = ['\u{1F507}', '\u{1F508}', '\u{1F509}', '\u{1F50A}'];
    let volIdx = 0; // start muted

    const clipLoaded = {};   // keyed by URL
    const channelClipIdx = {}; // tracks which clip to play next per channel

    function tryLoadClip(url) {
      if (!url || clipLoaded[url] !== undefined) return;
      const tester = document.createElement('video');
      tester.src = url;
      tester.addEventListener('canplaythrough', () => { clipLoaded[url] = true; }, { once: true });
      tester.addEventListener('error', () => { clipLoaded[url] = false; }, { once: true });
      tester.load();
    }

    function getNextClip(chIdx) {
      const clips = TV_CHANNELS[chIdx].clips || [];
      if (!clips.length) return null;
      if (channelClipIdx[chIdx] === undefined) channelClipIdx[chIdx] = 0;
      const url = clips[channelClipIdx[chIdx]];
      channelClipIdx[chIdx] = (channelClipIdx[chIdx] + 1) % clips.length;
      return url;
    }

    function applyVolume() {
      if (videoEl) {
        videoEl.muted = volIdx === 0;
        videoEl.volume = VOL_STEPS[volIdx];
      }
      if (muteBtn) muteBtn.textContent = VOL_ICONS[volIdx];
    }

    function display(idx) {
      const ch = TV_CHANNELS[idx];
      channelEl.textContent = 'CH ' + String(idx + 1).padStart(2, '0');
      if (emojiEl) emojiEl.textContent = ch.emoji;
      showEl.textContent = ch.show;
      if (quoteEl) quoteEl.textContent = ch.quote;

      const clipUrl = getNextClip(idx);
      if (clipUrl && clipLoaded[clipUrl] === true && videoEl) {
        videoEl.src = clipUrl;
        applyVolume();
        videoEl.classList.add('active');
        videoEl.play().catch(() => {});
        // Pause jukebox while TV is playing
        if (window._dqJukeboxAudio && !window._dqJukeboxAudio.paused) {
          window._dqJukeboxAudio.pause();
          window._tvPausedJukebox = true;
        }
      } else {
        if (videoEl) {
          videoEl.classList.remove('active');
          videoEl.pause();
          videoEl.removeAttribute('src');
          // Resume jukebox if TV paused it
          if (window._tvPausedJukebox && window._dqJukeboxAudio) {
            window._dqJukeboxAudio.play().catch(() => {});
            window._tvPausedJukebox = false;
          }
        }
      }
    }

    // Big channel number flash
    function flashChannel(idx) {
      if (!chFlash) return;
      chFlash.textContent = String(idx + 1).padStart(2, '0');
      chFlash.classList.remove('active');
      void chFlash.offsetWidth;
      chFlash.classList.add('active');
      setTimeout(() => chFlash.classList.remove('active'), 600);
    }

    // Knob rotation — cumulative, tracks position
    let knobAngle = { ch: 0, vol: 0 };

    function animateKnobEl(knob, key, dir) {
      var step = 30 * dir;
      knobAngle[key] += step;
      knob.classList.add('turning');
      knob.style.transform = 'rotate(' + (knobAngle[key] + (step * 0.4)) + 'deg)';
      setTimeout(() => {
        knob.style.transform = 'rotate(' + knobAngle[key] + 'deg)';
      }, 150);
    }

    function switchChannel() {
      if (switching) return;
      switching = true;

      if (videoEl) {
        videoEl.pause();
        videoEl.classList.remove('active');
      }

      animateKnobEl(chKnob, 'ch', 1);

      staticEl.classList.add('active');
      content.classList.add('switching');

      var nextCh = (currentCh + 1) % TV_CHANNELS.length;
      flashChannel(nextCh);

      setTimeout(() => {
        currentCh = nextCh;
        display(currentCh);
        staticEl.classList.remove('active');
        content.classList.remove('switching');
        switching = false;
      }, 400);
    }

    function cycleVolume() {
      volIdx = (volIdx + 1) % VOL_STEPS.length;
      animateKnobEl(volKnob, 'vol', 1);
      applyVolume();
    }

    // CH knob — cycles channels
    chKnob.addEventListener('click', switchChannel);

    // VOL knob — cycles volume levels
    if (volKnob) volKnob.addEventListener('click', cycleVolume);

    // Mute button also toggles mute
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        volIdx = volIdx === 0 ? 2 : 0; // toggle between mute and medium
        applyVolume();
        if (volKnob) {
          animateKnobEl(volKnob, 'vol', volIdx === 0 ? -1 : 1);
        }
      });
    }

    // CRT warm-up on first scroll into view
    var tvObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !warmedUp) {
          warmedUp = true;
          screen.classList.add('warming-up');
        }
        // Pause video when TV is off screen, resume when back
        // Also coordinate with jukebox
        if (videoEl) {
          if (e.isIntersecting) {
            videoEl.play().catch(() => {});
            // Pause jukebox when TV section is in view
            if (window._dqJukeboxAudio && !window._dqJukeboxAudio.paused) {
              window._dqJukeboxAudio.pause();
              window._tvPausedJukebox = true;
            }
          } else {
            videoEl.pause();
            // Resume jukebox when TV scrolls out of view
            if (window._tvPausedJukebox && window._dqJukeboxAudio) {
              window._dqJukeboxAudio.play().catch(() => {});
              window._tvPausedJukebox = false;
            }
          }
        }
      });
    }, { threshold: 0, rootMargin: '0px' });
    tvObs.observe(screen);

    // Also pause TV when card section comes into view
    var cardgenEl = document.getElementById('cardgen');
    if (cardgenEl) {
      var cardObs = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
          if (e.isIntersecting && videoEl) {
            videoEl.pause();
            if (window._tvPausedJukebox && window._dqJukeboxAudio) {
              window._dqJukeboxAudio.play().catch(function() {});
              window._tvPausedJukebox = false;
            }
          }
        });
      }, { threshold: 0.1 });
      cardObs.observe(cardgenEl);
    }

    TV_CHANNELS.forEach(ch => ch.clips.forEach(url => tryLoadClip(url)));
    display(0);
  }

  // ════════════════════════════════════
  //  LORE INIT (replaces old initTypewriter)
  // ════════════════════════════════════
  function initLore() {
    initPhoneThread();
    initTV();
  }

  // ════════════════════════════════════
  //  THE KITCHEN — Polaroid Wall
  // ════════════════════════════════════

  const MOCK_DISHES = [
    {
      name: 'Hyderabadi Biryani',
      photo: API_BASE + '/kitchen/biryani.jpg',
      spice: 5,
      tag: 'SIGNATURE DISH',
      story: 'Dum method. Foil seal, wet cloth, full patience. The cashews and mint on top mean it\'s done — not plated, done. Neighbours two floors down have opinions about when I make this.'
    },
    {
      name: 'The White Bowl',
      photo: API_BASE + '/kitchen/murgh-malai.jpg',
      photoPosition: 'center 70%',
      spice: 2,
      tag: 'WEEKNIGHT FLEX',
      story: 'Herby fried rice, cheese sauce with mushrooms and zucchini, pan-fried paneer on top. A cat showed up, rated it 4/5 without being asked, and received nothing in return.'
    },
    {
      name: 'Chilli Oil Noodles',
      photo: API_BASE + '/kitchen/chilli-noodles.jpg',
      spice: 4,
      tag: 'MIDNIGHT SPECIAL',
      story: 'Master Chow 2x spicy chilli oil + udon + 8 minutes. The bottle costs more than the noodles and that is the correct order of priorities. No notes.'
    },
    {
      name: 'Paneer Fried Rice',
      photo: API_BASE + '/kitchen/paneer-fried-rice.jpg',
      spice: 3,
      tag: 'TUESDAY AT 12AM',
      story: 'Indo-Chinese fried rice with paneer. Made this on a Tuesday midnight for no reason. The map placemat adds nothing. The rice adds everything. This is a vibe meal, not a recipe.'
    },
    {
      name: 'Fusilli Arrabbiata',
      photo: API_BASE + '/kitchen/penne.jpg',
      spice: 3,
      tag: 'NO JAR SAUCE',
      story: 'Crushed tomatoes, garlic, red chilli, olive oil. That\'s it. That\'s the whole recipe and the whole personality. Anyone using jar sauce can leave.'
    },
    {
      name: 'BBQ Night',
      photo: API_BASE + '/kitchen/bbq-night.jpg',
      spice: 4,
      tag: 'CHARCOAL CERTIFIED',
      story: 'Paneer tikka and tangdi on live charcoal. Old Monk was present in an advisory capacity. The grill was a ₹400 Amazon purchase. It cooked exactly as well as a tandoor. It did not.'
    },
    {
      name: 'The Spread',
      photo: API_BASE + '/kitchen/the-spread.jpg',
      spice: 3,
      tag: 'FULL SEND',
      story: 'Paneer, pav, green chutney, fried stuff, charcoal grill going. No recipe. No plan. Just vibes and questionable decisions made at speed. Everyone ate well.'
    },
    {
      name: 'Ramen',
      photo: API_BASE + '/kitchen/ramen.jpg',
      spice: 4,
      tag: 'BUILT FROM SCRATCH',
      story: 'Broth, tofu, mushrooms, noodles — all in. Not instant. Not a shortcut. The kind of bowl you make when you want to feel like you have your life together. Debatable.'
    },
    {
      name: 'Black Bean Noodles',
      photo: API_BASE + '/kitchen/black-bean-noodles.jpg',
      spice: 3,
      tag: 'CHAOS BUILD',
      story: 'Black bean sauce, baby corn, mushrooms, and whatever else survived the fridge audit. Hakka style. No measurements. Turned out better than it had any right to.'
    },
    {
      name: 'American Chopsuey',
      photo: API_BASE + '/kitchen/american-chopsuey.jpg',
      spice: 2,
      tag: 'NOT AMERICAN. NOT CHINESE.',
      story: 'Crispy noodles, sweet tangy sauce, caramelised onions. A dish that belongs to no country and every Indian household. Made it from memory. Memory was correct.'
    },
    {
      name: 'Kung Pao Paneer',
      photo: API_BASE + '/kitchen/kungpao-paneer.jpg',
      spice: 4,
      tag: 'INDO-CHINESE',
      story: 'Paneer cubes, bell peppers, dried chillies, soy sauce. The wok was screaming. The kitchen smelled incredible. Went hard on the chilli. Zero regrets.'
    },
    {
      name: 'Mango Cheesecake',
      photo: API_BASE + '/kitchen/mango-cheesecake.jpg',
      spice: 0,
      tag: 'NO BAKE. ALL FLEX.',
      story: 'Mango glaze on top, biscuit base, cream cheese filling. No oven. Just patience and a fridge. Took it out and held it like it was the World Cup. It was.'
    },
    {
      name: 'Chilli Oil Dan Dan',
      photo: API_BASE + '/kitchen/restaurant-noodles.jpg',
      spice: 4,
      tag: 'RESTAURANT RECON',
      story: 'Ordered this at a restaurant just to reverse engineer it at home. White noodles, crispy chilli oil, vegetables, spring onion. Notes were taken. Mission ongoing.'
    },
  ];

  // Random tilt angles for each card — set once
  const TILT_ANGLES = MOCK_DISHES.map(() => (Math.random() - 0.5) * 6);

  function renderKitchen() {
    const wall = document.getElementById('kitchen-wall');
    if (!wall || wall.children.length > 0) return;

    MOCK_DISHES.forEach((dish, i) => {
      const angle = TILT_ANGLES[i];
      const spiceIcons = dish.spice > 0
        ? '🌶️'.repeat(dish.spice) + '<span style="opacity:0.2">' + '🌶️'.repeat(5 - dish.spice) + '</span>'
        : '🍫';

      const card = document.createElement('div');
      card.className = 'kitchen-polaroid reveal';
      card.innerHTML =
        '<div class="kitchen-polaroid-inner" style="transform:rotate(' + angle + 'deg)">' +
          '<div class="kitchen-pol-front">' +
            '<div class="kitchen-tape"></div>' +
            '<img class="kitchen-pol-photo" src="' + dish.photo + '" alt="' + dish.name + '" loading="lazy"' + (dish.photoPosition ? ' style="object-position:' + dish.photoPosition + '"' : '') + '>' +
            '<div class="kitchen-pol-bottom">' +
              '<div class="kitchen-pol-name">' + dish.name + '</div>' +
              '<div class="kitchen-pol-spice">' + spiceIcons + '</div>' +
              '<div class="kitchen-pol-tag">' + dish.tag + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="kitchen-pol-back">' +
            '<div class="kitchen-pol-back-title">' + dish.name + '</div>' +
            '<p class="kitchen-pol-back-story">' + dish.story + '</p>' +
            '<div class="kitchen-pol-back-hint">TAP AGAIN TO FLIP BACK</div>' +
          '</div>' +
        '</div>';

      card.addEventListener('click', () => {
        card.classList.toggle('flipped');
      });

      wall.appendChild(card);
    });
  }

  // ════════════════════════════════════
  //  GAMING DATA — Cover Flow
  // ════════════════════════════════════

  const MOCK_GAMES = [
    { title: 'Counter-Strike 2', xp: 1500, played: 'Recently', color: '#de9b35', emoji: '💣', appid: 730 },
    { title: 'DOOM Eternal', xp: 210, played: 'A while ago', color: '#8b0000', emoji: '🔥', appid: 782330 },
    { title: 'Halo Infinite', xp: 195, played: 'A while ago', color: '#3d6b3d', emoji: '🪖', appid: 1240440 },
    { title: 'DOOM (2016)', xp: 145, played: 'A while ago', color: '#a30000', emoji: '💀', appid: 379720 },
    { title: 'Detroit: Become Human', xp: 35, played: 'A while ago', color: '#1a73e8', emoji: '🤖', appid: 1222140 },
  ];

  // Non-Steam games — always merged with API results
  // appid used only for Steam CDN header images (game exists on Steam store even if owned on Epic)
  const EPIC_GAMES = [
    { title: 'Marvel\'s Guardians of the Galaxy', xp: 200, played: 'Completed', color: '#1e90ff', emoji: '🚀', appid: 1088850 },
    { title: 'GTA V', xp: 195, played: 'Completed', color: '#2d5a27', emoji: '🚗', appid: 271590 },
    { title: 'Death Stranding', xp: 143, played: 'Completed', color: '#2c3e50', emoji: '📦', appid: 1190460 },
    { title: 'Control', xp: 50, played: 'Completed', color: '#c0392b', emoji: '🔺', appid: 870780 },
    { title: 'Warhammer 40K: Space Marine 2', xp: 0, played: 'Completed', color: '#7b2d26', emoji: '⚔️', appid: 2183900 },
    { title: 'Hitman', xp: 25, played: 'Completed', color: '#2c3e50', emoji: '🎯', appid: 236870 },
    { title: 'Watch Dogs 2', xp: 20, played: 'Completed', color: '#e67e22', emoji: '📱', appid: 447040 },
    { title: 'Wolfenstein: The New Order', xp: 0, played: 'Completed', color: '#4a4a4a', emoji: '🔫', appid: 202140 },
    { title: 'Wolfenstein: The New Colossus', xp: 0, played: 'Completed', color: '#4a4a4a', emoji: '🔫', appid: 612880 },
    { title: 'Wolfenstein: The Old Blood', xp: 0, played: 'Completed', color: '#4a4a4a', emoji: '🔫', appid: 350080 },
  ];

  const GAME_META = {
    730:     { emoji: '💣', color: '#de9b35' },
    782330:  { emoji: '👹', color: '#8b0000' },
    379720:  { emoji: '💀', color: '#a30000' },
    271590:  { emoji: '🚗', color: '#2d5a27' },
    1222140: { emoji: '🤖', color: '#1a73e8' },
    1190460: { emoji: '📦', color: '#2c3e50' },
    976730:  { emoji: '🎯', color: '#4a7c59' },
    2183900: { emoji: '⚔️', color: '#7b2d26' },
  };
  const DEFAULT_META = { emoji: '🎮', color: '#666' };

  function enrichGames(games) {
    return games.map(g => {
      const meta = GAME_META[g.appid] || DEFAULT_META;
      return { ...g, emoji: meta.emoji, color: meta.color };
    });
  }

  let liveGames = null, liveTracks = null;

  async function fetchGamingData() {
    let steamGames;
    try {
      const res = await apiFetch('/api/steam/games');
      steamGames = enrichGames(res);
    } catch {
      steamGames = MOCK_GAMES;
    }
    // Merge Steam + Epic, sort by hours descending (completed games with 0 hrs go last)
    liveGames = [...steamGames, ...EPIC_GAMES]
      .sort((a, b) => b.xp - a.xp);
  }

  const MOCK_TRACKS = [
    { title: 'BFG Division', game: 'DOOM (2016)', audioURL: null },
    { title: 'The Only Thing They Fear', game: 'DOOM Eternal', audioURL: null },
    { title: 'Main Theme', game: 'Halo', audioURL: null },
    { title: 'Welcome to Los Santos', game: 'GTA V', audioURL: null },
    { title: 'BB\'s Theme', game: 'Death Stranding', audioURL: null },
    { title: 'Kainé — Salvation', game: 'NieR', audioURL: null },
  ];

  async function fetchTracks() {
    try { liveTracks = await apiFetch('/api/jukebox/tracks'); }
    catch { liveTracks = MOCK_TRACKS; }
  }

  async function renderGamingSections() {
    await fetchGamingData();
    renderCoverFlow(liveGames);
    initReveal();
  }

  function renderCoverFlow(games) {
    const container = document.getElementById('cover-flow');
    if (!container || container.children.length > 0) return;
    if (!games || games.length === 0) return;

    let activeIdx = 0;
    let isAnimating = false;
    const maxXp = Math.max(...games.map(g => g.xp));
    const totalHrs = games.reduce((sum, g) => sum + g.xp, 0);

    // Build shell
    container.innerHTML =
      '<div class="cf-viewport">' +
        '<div class="cf-stage" id="cf-stage"></div>' +
        '<div class="cf-reflection" id="cf-reflection"></div>' +
      '</div>' +
      '<div class="cf-info-wrap">' +
        '<div class="cf-info" id="cf-info"></div>' +
      '</div>' +
      '<div class="cf-controls">' +
        '<button class="cf-btn" id="cf-prev" aria-label="Previous">&#9664;</button>' +
        '<div class="cf-dots" id="cf-dots"></div>' +
        '<button class="cf-btn" id="cf-next" aria-label="Next">&#9654;</button>' +
      '</div>' +
      '<div class="cf-footer">' +
        '<span>' + games.length + ' GAMES</span>' +
        '<span class="cf-footer-hrs">' + totalHrs.toLocaleString() + ' TOTAL HRS</span>' +
        '<span class="cf-api-badge"><span class="cf-api-dot"></span>STEAM API LIVE</span>' +
      '</div>';

    const stage = document.getElementById('cf-stage');
    const reflection = document.getElementById('cf-reflection');
    const infoEl = document.getElementById('cf-info');
    const dotsEl = document.getElementById('cf-dots');

    // Create cards + reflections
    games.forEach((g, i) => {
      const imgUrl = g.appid ? 'https://cdn.cloudflare.steamstatic.com/steam/apps/' + g.appid + '/header.jpg' : '';

      // Main card
      const card = document.createElement('div');
      card.className = 'cf-card';
      card.dataset.idx = i;
      card.innerHTML = imgUrl
        ? '<img src="' + imgUrl + '" alt="' + g.title + '" draggable="false" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
          '<div class="cf-card-fallback" style="display:none;background:' + g.color + '"><span>' + g.emoji + '</span></div>'
        : '<div class="cf-card-fallback" style="background:' + g.color + '"><span>' + g.emoji + '</span></div>';
      card.addEventListener('click', () => { if (i !== activeIdx) goTo(i); });
      stage.appendChild(card);

      // Reflection card (mirror)
      const ref = document.createElement('div');
      ref.className = 'cf-card cf-card-ref';
      ref.dataset.idx = i;
      ref.innerHTML = card.innerHTML;
      reflection.appendChild(ref);

      // Dot
      const dot = document.createElement('button');
      dot.className = 'cf-dot';
      dot.setAttribute('aria-label', g.title);
      dot.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(dot);
    });

    const cards = stage.querySelectorAll('.cf-card');
    const refCards = reflection.querySelectorAll('.cf-card');
    const dots = dotsEl.querySelectorAll('.cf-dot');

    function layoutCards() {
      const SPACING = 180;
      const DEPTH = 200;
      const ANGLE = 45;

      cards.forEach((card, i) => {
        const offset = i - activeIdx;
        const absOff = Math.abs(offset);
        let tx, tz, ry, op, scale;

        if (offset === 0) {
          tx = 0; tz = 0; ry = 0; op = 1; scale = 1;
        } else {
          const dir = offset > 0 ? 1 : -1;
          tx = dir * (SPACING + (absOff - 1) * 100);
          tz = -DEPTH - (absOff - 1) * 40;
          ry = -dir * ANGLE;
          op = absOff > 3 ? 0 : Math.max(0.25, 0.7 - (absOff - 1) * 0.15);
          scale = absOff > 3 ? 0.6 : Math.max(0.7, 0.85 - (absOff - 1) * 0.05);
        }

        card.style.transform = 'translate3d(' + tx + 'px, 0, ' + tz + 'px) rotateY(' + ry + 'deg) scale(' + scale + ')';
        card.style.opacity = op;
        card.style.zIndex = 10 - absOff;
        card.classList.toggle('cf-active', offset === 0);

        // Mirror reflection
        const rc = refCards[i];
        rc.style.transform = 'translate3d(' + tx + 'px, 0, ' + tz + 'px) rotateY(' + ry + 'deg) rotateX(180deg) scale(' + scale + ')';
        rc.style.opacity = op * 0.2;
        rc.style.zIndex = 10 - absOff;
      });

      dots.forEach((d, i) => d.classList.toggle('cf-dot-active', i === activeIdx));
    }

    function updateInfo() {
      const g = games[activeIdx];
      const pct = Math.round((g.xp / maxXp) * 100);

      // Crossfade: fade out, swap, fade in
      infoEl.classList.add('cf-info-out');
      setTimeout(() => {
        infoEl.innerHTML =
          '<h3 class="cf-title">' + g.emoji + ' ' + g.title + '</h3>' +
          '<div class="cf-bar-wrap">' +
            '<div class="cf-bar"><div class="cf-bar-fill" style="width:0%;background:' + g.color + '"></div></div>' +
            '<span class="cf-hrs">' + (g.xp > 0 ? g.xp.toLocaleString() + ' HRS' : 'COMPLETED') + '</span>' +
          '</div>' +
          '<span class="cf-status ' + (g.played === 'Recently' ? 'cf-recent' : g.played === 'Completed' ? 'cf-completed' : '') + '">' + g.played.toUpperCase() + '</span>';
        infoEl.classList.remove('cf-info-out');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const bar = infoEl.querySelector('.cf-bar-fill');
            if (bar) bar.style.width = pct + '%';
          });
        });
      }, 120);
    }

    function goTo(idx) {
      if (isAnimating || idx === activeIdx) return;
      isAnimating = true;
      activeIdx = idx;
      layoutCards();
      updateInfo();
      setTimeout(() => { isAnimating = false; }, 280);
    }

    function navigate(dir) {
      goTo((activeIdx + dir + games.length) % games.length);
    }

    // Button nav
    document.getElementById('cf-prev').addEventListener('click', () => navigate(-1));
    document.getElementById('cf-next').addEventListener('click', () => navigate(1));

    // Keyboard nav (only when section is visible)
    document.addEventListener('keydown', (e) => {
      const rect = container.getBoundingClientRect();
      if (rect.top > window.innerHeight || rect.bottom < 0) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); navigate(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); navigate(1); }
    });

    // Touch / swipe
    let touchStartX = 0, touchStartY = 0, swiping = false;
    container.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      swiping = true;
    }, { passive: true });
    container.addEventListener('touchend', (e) => {
      if (!swiping) return;
      swiping = false;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        navigate(dx < 0 ? 1 : -1);
      }
    }, { passive: true });

    // Initial render
    layoutCards();
    updateInfo();
    // Trigger initial bar animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const bar = infoEl.querySelector('.cf-bar-fill');
        if (bar) bar.style.width = Math.round((games[0].xp / maxXp) * 100) + '%';
      });
    });
  }

  // ════════════════════════════════════
  //  JUKEBOX (copied as-is)
  // ════════════════════════════════════

  async function initJukebox() {
    await fetchTracks();
    const tracks = liveTracks;
    const jukebox = document.getElementById('jukebox');
    const pill = document.getElementById('jb-pill');
    const closeBtn = document.getElementById('jb-close');
    const trackList = document.getElementById('jb-tracklist');
    const trackNameEl = document.getElementById('jb-track-name-inner');
    const marqueeText = document.getElementById('jb-marquee-text');
    const playCompact = document.getElementById('jb-play-compact');
    const playBtn = document.getElementById('jb-play');
    const prevBtn = document.getElementById('jb-prev');
    const nextBtn = document.getElementById('jb-next');
    const volSlider = document.getElementById('jb-volume');
    const volVal = document.getElementById('jb-vol-val');
    const backdrop = document.getElementById('jb-backdrop');

    if (!jukebox || !pill || !tracks.length) return;

    let currentTrack = 0;
    let isPlaying = false;
    var SEP = '  \u00b7  ';

    // Resume track from bulb-loading or previous page
    const savedTrack  = sessionStorage.getItem('dq-jb-track');
    const shouldPlay  = sessionStorage.getItem('dq-jb-autoplay');
    if (savedTrack !== null) {
      currentTrack = Math.min(parseInt(savedTrack) || 0, tracks.length - 1);
    }
    if (shouldPlay === '1') {
      sessionStorage.removeItem('dq-jb-autoplay');
    }

    function updateDisplay() {
      var t = tracks[currentTrack];
      var label = t.title + ' \u2014 ' + t.game;
      trackNameEl.textContent = label + SEP + label + SEP;
      marqueeText.textContent = label;
    }
    updateDisplay();

    function renderTracks() {
      trackList.innerHTML = '';
      tracks.forEach((track, i) => {
        const div = document.createElement('div');
        div.className = 'am-jb-track' + (i === currentTrack ? ' active' : '');
        div.innerHTML =
          '<div class="am-jb-track-info">' +
            '<span class="am-jb-track-title">' + track.title + '</span>' +
            '<span class="am-jb-track-game">' + track.game + '</span>' +
          '</div>';
        div.addEventListener('click', function(e) { e.stopPropagation(); selectTrack(i); });
        trackList.appendChild(div);
      });
    }

    function selectTrack(index) {
      currentTrack = index;
      updateDisplay(); renderTracks();
      var t = tracks[index];
      if (t && t.audioURL) {
        audio.src = t.audioURL.startsWith('http') ? t.audioURL : API_BASE + t.audioURL;
        audio.load();
        isPlaying = true;
        audio.play().catch(function() {});
        jukebox.classList.toggle('paused', false);
        playCompact.textContent = '\u23F8';
        playBtn.textContent = '\u23F8';
      }
    }

    // Audio playback
    var audio = new Audio();
    audio.volume = 0.3; // low volume for autoplay
    var _trackLoading = false;
    window._dqJukeboxAudio = audio; // expose for TV mute coordination

    // No auto-play — user discovers jukebox naturally

    function loadTrack(index) {
      var t = tracks[index];
      if (!t || !t.audioURL) return;
      var wasPlaying = isPlaying;
      _trackLoading = true;
      audio.src = t.audioURL.startsWith('http') ? t.audioURL : API_BASE + t.audioURL;
      audio.load();
      _trackLoading = false;
      if (wasPlaying) audio.play().catch(function() {});
    }

    audio.addEventListener('ended', function() {
      if (_trackLoading) return;
      currentTrack = (currentTrack + 1) % tracks.length;
      updateDisplay(); renderTracks(); loadTrack(currentTrack);
    });

    function togglePlay() {
      if (!tracks[currentTrack] || !tracks[currentTrack].audioURL) return;
      if (!audio.src || audio.src === window.location.href) loadTrack(currentTrack);
      isPlaying = !isPlaying;
      isPlaying ? audio.play().catch(function() {}) : audio.pause();
      jukebox.classList.toggle('paused', !isPlaying);
      var icon = isPlaying ? '\u23F8' : '\u25B6';
      playCompact.textContent = icon;
      playBtn.textContent = icon;
    }

    function prevTrack() { currentTrack = (currentTrack - 1 + tracks.length) % tracks.length; updateDisplay(); renderTracks(); loadTrack(currentTrack); }
    function nextTrack() { currentTrack = (currentTrack + 1) % tracks.length; updateDisplay(); renderTracks(); loadTrack(currentTrack); }

    pill.addEventListener('click', function(e) {
      if (e.target === playCompact) { e.stopPropagation(); togglePlay(); return; }
      jukebox.classList.add('expanded'); backdrop.classList.add('active'); document.body.style.overflow = 'hidden';
    });
    playCompact.addEventListener('click', function(e) { e.stopPropagation(); togglePlay(); });
    closeBtn.addEventListener('click', function() { jukebox.classList.remove('expanded'); jukebox.classList.remove('expanded-full'); backdrop.classList.remove('active'); document.body.style.overflow = ''; });
    if (backdrop) { backdrop.addEventListener('click', function() { jukebox.classList.remove('expanded'); jukebox.classList.remove('expanded-full'); backdrop.classList.remove('active'); document.body.style.overflow = ''; }); }
    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', prevTrack);
    nextBtn.addEventListener('click', nextTrack);

    var tlToggle = document.getElementById('jb-tl-toggle');
    if (tlToggle) { tlToggle.addEventListener('click', function() { jukebox.classList.toggle('expanded-full'); }); }
    volSlider.addEventListener('input', function(e) { e.stopPropagation(); audio.volume = volSlider.value / 100; volVal.textContent = volSlider.value; });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && jukebox.classList.contains('expanded')) {
        jukebox.classList.remove('expanded'); jukebox.classList.remove('expanded-full');
        if (backdrop) backdrop.classList.remove('active'); document.body.style.overflow = ''; return;
      }
      if (!jukebox.classList.contains('expanded')) return;
      if (e.target.tagName === 'INPUT') return;
      switch(e.key) {
        case ' ': e.preventDefault(); togglePlay(); break;
        case 'ArrowRight': e.preventDefault(); nextTrack(); break;
        case 'ArrowLeft': e.preventDefault(); prevTrack(); break;
        case 'ArrowUp': e.preventDefault(); volSlider.value = Math.min(100, parseInt(volSlider.value) + 10); volVal.textContent = volSlider.value; break;
        case 'ArrowDown': e.preventDefault(); volSlider.value = Math.max(0, parseInt(volSlider.value) - 10); volVal.textContent = volSlider.value; break;
      }
    });

    var touchStartX = 0, touchStartY = 0;
    var boomboxEl = jukebox.querySelector('.am-jb-boombox');
    if (boomboxEl) {
      boomboxEl.addEventListener('touchstart', function(e) { touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; }, { passive: true });
      boomboxEl.addEventListener('touchend', function(e) {
        var dx = e.changedTouches[0].clientX - touchStartX;
        var dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) { if (dx < 0) nextTrack(); else prevTrack(); }
      }, { passive: true });
    }

    document.addEventListener('click', function(e) {
      if (jukebox.classList.contains('expanded') && !jukebox.contains(e.target)) {
        jukebox.classList.remove('expanded'); jukebox.classList.remove('expanded-full');
        if (backdrop) backdrop.classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    jukebox.classList.add('paused');
    renderTracks();

    // Auto-resume if coming from bulb-loading
    if (savedTrack !== null) {
      setTimeout(function() {
        loadTrack(currentTrack);
        isPlaying = true;
        audio.play().catch(function() {});
        jukebox.classList.remove('paused');
        playCompact.textContent = '⏸';
        playBtn.textContent = '⏸';
        // Save state so card editor also resumes
        sessionStorage.setItem('dq-jb-track', currentTrack);
      }, 400);
    }
  }

  // ════════════════════════════════════
  //  PLAYER CARD — FIFA UNBOXING + 3D TILT
  // ════════════════════════════════════
  function initCardTilt() {
    const wrap = document.getElementById('card-wrap');
    const card = document.getElementById('example-card');
    const overlay = document.getElementById('unboxOverlay');
    const stage = document.getElementById('unboxStage');
    const raysContainer = document.getElementById('unboxRays');
    const particlesContainer = document.getElementById('unboxParticles');
    if (!wrap || !card || !overlay) return;

    // 3D tilt on the in-page card
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateY = ((x - centerX) / centerX) * 12;
      const rotateX = ((centerY - y) / centerY) * 8;
      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      card.style.transition = 'transform 0.1s ease-out';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
    });

    // Build light rays once
    function buildRays() {
      raysContainer.innerHTML = '';
      const count = 16;
      for (let i = 0; i < count; i++) {
        const ray = document.createElement('div');
        ray.className = 'unbox-ray';
        const angle = (360 / count) * i;
        const width = 2 + Math.random() * 3;
        ray.style.transform = 'rotate(' + angle + 'deg)';
        ray.style.width = width + 'px';
        ray.style.opacity = 0.3 + Math.random() * 0.5;
        raysContainer.appendChild(ray);
      }
    }

    // Build floating particles
    function buildParticles() {
      particlesContainer.innerHTML = '';
      const colors = ['#ff6600', '#ff9f0a', '#bf5af2', '#0a84ff', '#ffcc00', '#fff'];
      for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'unbox-particle';
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = 2 + Math.random() * 5;
        const x = 10 + Math.random() * 80;
        const startY = 50 + Math.random() * 40;
        const travel = -(100 + Math.random() * 300);
        const dur = 2 + Math.random() * 2;
        const delay = Math.random() * 1.2;
        p.style.cssText =
          'left:' + x + '%;' +
          'top:' + startY + '%;' +
          'width:' + size + 'px;' +
          'height:' + size + 'px;' +
          'background:' + color + ';' +
          'box-shadow:0 0 ' + (size * 2) + 'px ' + color + ';' +
          '--travel:' + travel + 'px;' +
          '--dur:' + dur + 's;' +
          '--delay:' + delay + 's;';
        particlesContainer.appendChild(p);
      }
    }

    // Open unboxing overlay
    function openUnbox() {
      buildRays();
      buildParticles();

      // Clone the card into the stage
      stage.innerHTML = '';
      const clone = card.cloneNode(true);
      clone.removeAttribute('id');
      clone.style.transform = '';
      clone.style.transition = '';
      stage.appendChild(clone);

      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';

      // After rays appear, start pulsing
      setTimeout(() => {
        raysContainer.style.animation = 'raysPulse 3s ease-in-out infinite';
      }, 1200);
    }

    // Close overlay
    function closeUnbox() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      raysContainer.style.animation = '';
    }

    // Click card → open unboxing
    wrap.addEventListener('click', openUnbox);

    // Click overlay → close
    overlay.addEventListener('click', closeUnbox);

    // Escape to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        closeUnbox();
      }
    });
  }

  // ── Init ──
  async function fetchCurrently() {
    try {
      const data = await apiFetch('/api/stats');
      const playing  = document.getElementById('currently-playing');
      const learning = document.getElementById('currently-learning');
      if (playing  && data.game)     playing.textContent  = data.game;
      if (learning && data.bookName) learning.textContent = data.bookName;
    } catch { /* keep hardcoded fallback values */ }
  }

  function fixMediaUrls() {
    if (!API_BASE) return; // production — relative URLs work via Nginx
    const prefixes = ['/kitchen/', '/social/', '/gamer/', '/clips/'];
    document.querySelectorAll('img[src], video[src]').forEach(el => {
      const src = el.getAttribute('src');
      if (src && prefixes.some(p => src.startsWith(p))) {
        el.setAttribute('src', API_BASE + src);
      }
    });
  }

  function init() {
    const skipIntro = new URLSearchParams(window.location.search).get('skip_intro');
    if (skipIntro) {
      const overlay = document.getElementById('intro-overlay');
      if (overlay) overlay.style.display = 'none';
      document.body.classList.remove('loading');
      // Fade in smoothly from black, then clear inline styles so fixed positioning works normally
      requestAnimationFrame(() => {
        document.documentElement.style.transition = 'opacity 1s ease';
        requestAnimationFrame(() => {
          document.documentElement.style.opacity = '1';
          setTimeout(() => {
            document.documentElement.style.cssText = '';
          }, 1100);
        });
      });
    } else {
      runIntro();
    }
    try { fixMediaUrls(); }         catch(e) { console.error('fixMediaUrls failed:', e); }
    try { initScrollProgress(); } catch(e) { console.error('initScrollProgress failed:', e); }
    try { initTips(); } catch(e) { console.error('initTips failed:', e); }
    try { initWheel(); } catch(e) { console.error('initWheel failed:', e); }
    try { initStatPentagon(); } catch(e) { console.error('initStatPentagon failed:', e); }
    try { initReveal(); } catch(e) { console.error('initReveal failed:', e); }
    try { animateStatBars(); } catch(e) { console.error('animateStatBars failed:', e); }
    try { animateWantedStars(); } catch(e) { console.error('animateWantedStars failed:', e); }
    try { initLore(); } catch(e) { console.error('initLore failed:', e); }
    try { initWantedPosters(); } catch(e) { console.error('initWantedPosters failed:', e); }
    try { initCardTilt(); } catch(e) { console.error('initCardTilt failed:', e); }
    try { initJukebox(); } catch(e) { console.error('initJukebox failed:', e); }
    try { renderKitchen(); } catch(e) { console.error('renderKitchen failed:', e); }
    try { renderGamingSections(); } catch(e) { console.error('renderGamingSections failed:', e); }
    try { fetchCurrently(); }       catch(e) { console.error('fetchCurrently failed:', e); }
    try { initKonami(); }           catch(e) { console.error('initKonami failed:', e); }
    try { initCardCTA(); }          catch(e) { console.error('initCardCTA failed:', e); }
    try { fetchSuspectCount(); }    catch(e) { /* silent */ }
  }

  function showToast(html) {
    const t = document.createElement('div');
    t.setAttribute('style', [
      'position:fixed',
      'bottom:24px',
      'left:50%',
      'transform:translateX(-50%)',
      'background:#0f0f0f',
      'color:#fff',
      'border:1.5px solid #c8ff00',
      'padding:12px 20px',
      'border-radius:4px',
      'z-index:2147483647',
      'font-size:clamp(0.6rem,2.5vw,0.72rem)',
      'letter-spacing:0.1em',
      'text-transform:uppercase',
      'box-shadow:0 4px 20px rgba(0,0,0,0.6)',
      'white-space:normal',
      'max-width:88vw',
      'text-align:center',
      'line-height:1.5',
      'display:block',
      'opacity:1',
      'visibility:visible'
    ].join(';'));
    t.innerHTML = html;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity='0'; t.style.transition='opacity 0.5s'; setTimeout(()=>t.remove(),500); }, 7000);
  }

  function initCardCTA() {
    const cta = document.querySelector('.cardgen-cta');
    if (!cta) return;

    const isGamePath = localStorage.getItem('dq-game-path') === 'true';
    const btn     = cta.querySelector('.cardgen-btn');
    const btnText = cta.querySelector('.cardgen-btn-text');
    const title   = cta.querySelector('.cardgen-cta-title');
    const desc    = cta.querySelector('.cardgen-cta-desc');

    if (isGamePath) {
      const earned = {
        DEV:    localStorage.getItem('dq-stat-dev')    || '—',
        DESIGN: localStorage.getItem('dq-stat-design') || '—',
        BRAIN:  localStorage.getItem('dq-stat-brain')  || '—',
        GRIND:  localStorage.getItem('dq-stat-grind')  || '—',
        SOCIAL: localStorage.getItem('dq-stat-social') || '70',
      };

      if (title) title.textContent = 'Your stats are ready.';
      if (desc)  desc.textContent  = 'You earned these in the challenges. Choose a card style and claim yours.';

      const pills = document.createElement('div');
      pills.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin:14px 0 4px;';
      pills.innerHTML = Object.entries(earned).map(([k, v]) =>
        `<span style="font:700 0.66rem/1 Inter,sans-serif;letter-spacing:.08em;padding:4px 10px;border-radius:6px;background:rgba(0,0,0,0.06);color:#1a1a1a;border:1px solid rgba(0,0,0,0.1);">${k} <span style="color:#ff6600;">${v}</span></span>`
      ).join('');
      if (btn) btn.before(pills);

      if (btnText) btnText.textContent = 'BUILD YOUR CARD →';

    } else {
      const nudge = document.createElement('p');
      nudge.style.cssText = 'font-size:0.65rem;color:rgba(0,0,0,0.38);margin-top:14px;line-height:1.5;';
      nudge.innerHTML = 'Or <a href="../landing.html" style="color:#ff6600;text-decoration:none;font-weight:600;">play DevQuest →</a> to earn your real stats.';
      if (btn) btn.after(nudge);
    }
  }

  async function fetchSuspectCount() {
    const el = document.getElementById('cardgen-suspect-count');
    if (!el) return;
    try {
      const data = await apiFetch('/api/leaderboard');
      el.textContent = data.length + (data.length !== 1 ? ' suspects' : ' suspect');
    } catch { /* keep placeholder */ }
  }

  function initKonami() {
    const CODE = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let pos = 0;
    document.addEventListener('keydown', (e) => {
      if (e.key === CODE[pos]) {
        pos++;
        if (pos === CODE.length) {
          pos = 0;
          apiFetch('/api/rickroll').catch(() => {});
          // Play a quick descending "game over" tone then rickroll in new tab
          try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const notes = [523, 415, 330, 262];
            notes.forEach((freq, i) => {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain); gain.connect(ctx.destination);
              osc.frequency.value = freq;
              osc.type = 'square';
              gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.1);
              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.09);
              osc.start(ctx.currentTime + i * 0.1);
              osc.stop(ctx.currentTime + i * 0.1 + 0.1);
            });
          } catch {}
          setTimeout(async () => {
            showToast('🎵 you got rickrolled');
            try {
              const data = await apiFetch('/api/rickroll/count');
              if (data && data.count) showToast(`🎵 you got rickrolled — <b style="color:#c8ff00">${data.count}</b> people have fallen for this`);
            } catch {}
            window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
          }, 500);
        }
      } else {
        pos = e.key === CODE[0] ? 1 : 0;
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
