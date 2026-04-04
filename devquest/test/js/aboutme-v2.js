// About Me v2 — GTA V Light + Bold
(() => {
  const API_BASE = 'http://localhost:8081';

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

    const labels = ['Curiosity', 'Humor', 'Creativity', 'Discipline', 'Adventure', 'Spice'];
    const values = [88, 92, 85, 70, 78, 95];
    const colors = ['#c8ff00', '#ff6600', '#ff375f', '#0a84ff', '#bf5af2', '#ff9f0a'];
    const n = labels.length;
    const step = (Math.PI * 2) / n;
    const startAngle = -Math.PI / 2;

    const duration = 1200;
    const start = performance.now();

    function draw(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      ctx.clearRect(0, 0, w, h);

      // Grid rings (draw immediately)
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
        ctx.strokeStyle = 'rgba(0,0,0,0.06)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Axis lines
      for (let i = 0; i < n; i++) {
        const a = startAngle + step * i;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        ctx.strokeStyle = 'rgba(0,0,0,0.06)';
        ctx.stroke();
      }

      // Data polygon — animated
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const idx = i % n;
        const a = startAngle + step * idx;
        const v = (values[idx] / 100) * r * ease;
        const x = cx + Math.cos(a) * v;
        const y = cy + Math.sin(a) * v;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, 'rgba(255,102,0,0.25)');
      grad.addColorStop(1, 'rgba(255,102,0,0.05)');
      ctx.fillStyle = grad;
      ctx.globalAlpha = ease;
      ctx.fill();
      ctx.strokeStyle = '#ff6600';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Data points + labels
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let i = 0; i < n; i++) {
        const a = startAngle + step * i;
        const v = (values[i] / 100) * r * ease;

        // Point
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * v, cy + Math.sin(a) * v, 5 * ease, 0, Math.PI * 2);
        ctx.fillStyle = colors[i];
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Glow
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * v, cy + Math.sin(a) * v, 8, 0, Math.PI * 2);
        ctx.fillStyle = colors[i] + '20';
        ctx.fill();

        // Label (always at full position)
        const lr = r + 24;
        ctx.font = '700 11px -apple-system, sans-serif';
        ctx.fillStyle = `rgba(0,0,0,${0.45 * ease})`;
        ctx.fillText(labels[i], cx + Math.cos(a) * lr, cy + Math.sin(a) * lr);

        // Value at vertex (fades in during last 30% of animation)
        const valFade = Math.max(0, (progress - 0.7) / 0.3);
        if (valFade > 0) {
          const vr = r + 38;
          ctx.font = '800 10px -apple-system, sans-serif';
          ctx.fillStyle = colors[i] + Math.round(valFade * 200).toString(16).padStart(2, '0');
          ctx.fillText(Math.round(values[i] * ease), cx + Math.cos(a) * vr, cy + Math.sin(a) * vr);
        }
      }

      if (progress < 1) requestAnimationFrame(draw);
      else {
        // Glow pulse when pentagon finishes drawing
        canvas.classList.add('glow');
        const wrap = canvas.closest('.stats-pentagon-wrap');
        if (wrap) wrap.classList.add('pulse');
      }
    }
    requestAnimationFrame(draw);
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
      chat.scrollTop = chat.scrollHeight;
    }
  }

  // ════════════════════════════════════
  //  LORE ZONE 2: Classified File
  // ════════════════════════════════════
  const CLASSIFIED_ENTRIES = [
    {
      label: 'SUBJECT ASSESSMENT',
      text: 'Subject demonstrates <span class="lore-redacted">dangerously high</span> levels of curiosity. Known to pursue <span class="lore-redacted">multiple side projects simultaneously</span>. Approach with caution.'
    },
    {
      label: 'KNOWN AFFILIATIONS',
      text: 'Counter-Strike 2 — 1500+ hours logged. Estimated inventory value: <span class="lore-redacted">$40,000</span>. Plays on a <span class="lore-redacted">PS4 controller</span>. Subject has expressed <span class="lore-redacted">open hostility</span> towards Valorant.'
    },
    {
      label: 'THREAT ASSESSMENT',
      text: 'Will argue about biryani preparation methods for <span class="lore-redacted">unlimited duration</span>. Has been observed cooking at <span class="lore-redacted">2 AM</span>. Kitchen fire count: <span class="lore-redacted">classified</span>.'
    },
    {
      label: 'RECENT ACTIVITY',
      text: 'Subject has been acquiring <span class="lore-redacted">Arduino boards</span> and <span class="lore-redacted">breadboard circuits</span>. Purpose: <span class="lore-redacted">unknown but probably cool</span>. Security clearance pending.'
    },
  ];

  function initClassifiedFile() {
    const container = document.getElementById('lore-entries');
    if (!container || container.children.length > 0) return;

    CLASSIFIED_ENTRIES.forEach(entry => {
      const div = document.createElement('div');
      div.className = 'lore-file-entry';
      div.innerHTML =
        '<div class="lore-file-entry-label">' + entry.label + '</div>' +
        '<div class="lore-file-entry-text">' + entry.text + '</div>';
      container.appendChild(div);
    });

    // Click to reveal redacted text
    container.querySelectorAll('.lore-redacted').forEach(el => {
      el.addEventListener('click', () => el.classList.toggle('revealed'));
    });
  }

  // ════════════════════════════════════
  //  LORE ZONE 3: Retro TV
  // ════════════════════════════════════
  const TV_CHANNELS = [
    { show: 'FAMILY GUY', emoji: '📺', quote: "I've watched every episode. Multiple times. Peter Griffin is a lifestyle. Giggity.", clip: API_BASE + '/clips/familyguy.mp4' },
    { show: 'GINTAMA', emoji: '🎌', quote: "The anime that made me realize a show about a lazy samurai could have the best fight scenes AND the best toilet humor.", clip: API_BASE + '/clips/gintama.mp4' },
    { show: 'SOUTH PARK', emoji: '🏔️', quote: "Respect it. Don't worship it. But when Cartman has a plan, you listen. Or don't. Probably don't.", clip: API_BASE + '/clips/southpark.mp4' },
    { show: 'DOOM ETERNAL', emoji: '💀', quote: "This isn't a game. It's a lifestyle. Rip and tear until you forget what day it is.", clip: API_BASE + '/clips/doom.mp4' },
    { show: 'DETROIT: BECOME HUMAN', emoji: '🤖', quote: "28 STAB WOUNDS. I just wanted to see what happens. The game judged me. I judged it back.", clip: API_BASE + '/clips/detroit.mp4' },
  ];

  function initTV() {
    const screen = document.getElementById('tv-screen');
    const content = document.getElementById('tv-content');
    const staticEl = document.getElementById('tv-static');
    const channelEl = document.getElementById('tv-channel');
    const showEl = document.getElementById('tv-show');
    const quoteEl = document.getElementById('tv-quote');
    const videoEl = document.getElementById('tv-video');
    const muteBtn = document.getElementById('tv-mute');
    const prevBtn = document.getElementById('tv-prev');
    const nextBtn = document.getElementById('tv-next');

    if (!screen || !prevBtn || !nextBtn) return;

    let currentCh = 0;
    let switching = false;
    let isMuted = true;

    // Track which clips loaded successfully
    const clipLoaded = {};

    function tryLoadClip(idx) {
      if (clipLoaded[idx] !== undefined) return; // already tried
      const ch = TV_CHANNELS[idx];
      if (!ch.clip) { clipLoaded[idx] = false; return; }

      // Test if video loads
      const tester = document.createElement('video');
      tester.src = ch.clip;
      tester.addEventListener('canplaythrough', () => { clipLoaded[idx] = true; }, { once: true });
      tester.addEventListener('error', () => { clipLoaded[idx] = false; }, { once: true });
      tester.load();
    }

    function display(idx) {
      const ch = TV_CHANNELS[idx];
      channelEl.textContent = 'CH ' + String(idx + 1).padStart(2, '0');
      showEl.innerHTML = '<span class="lore-tv-emoji">' + ch.emoji + '</span>' + ch.show;
      quoteEl.textContent = ch.quote;

      // Video handling
      if (clipLoaded[idx] === true && videoEl) {
        videoEl.src = ch.clip;
        videoEl.muted = isMuted;
        videoEl.classList.add('active');
        videoEl.play().catch(() => {});
      } else {
        if (videoEl) {
          videoEl.classList.remove('active');
          videoEl.pause();
          videoEl.removeAttribute('src');
        }
      }
    }

    function switchChannel(dir) {
      if (switching) return;
      switching = true;

      // Pause current video
      if (videoEl) {
        videoEl.pause();
        videoEl.classList.remove('active');
      }

      // Static flash
      staticEl.classList.add('active');
      content.classList.add('switching');

      setTimeout(() => {
        currentCh = (currentCh + dir + TV_CHANNELS.length) % TV_CHANNELS.length;
        display(currentCh);
        staticEl.classList.remove('active');
        content.classList.remove('switching');
        switching = false;
      }, 300);
    }

    // Mute/unmute
    if (muteBtn && videoEl) {
      muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        videoEl.muted = isMuted;
        muteBtn.textContent = isMuted ? '🔇' : '🔊';
      });
    }

    prevBtn.addEventListener('click', () => switchChannel(-1));
    nextBtn.addEventListener('click', () => switchChannel(1));

    // Auto-rotate every 6s (longer for video)
    let autoTimer = setInterval(() => switchChannel(1), 6000);
    screen.addEventListener('mouseenter', () => clearInterval(autoTimer));
    screen.addEventListener('mouseleave', () => {
      autoTimer = setInterval(() => switchChannel(1), 6000);
    });

    // Preload check all clips
    TV_CHANNELS.forEach((_, i) => tryLoadClip(i));

    display(0);
  }

  // ════════════════════════════════════
  //  LORE INIT (replaces old initTypewriter)
  // ════════════════════════════════════
  function initLore() {
    initPhoneThread();
    initClassifiedFile();
    initTV();
  }

  // ════════════════════════════════════
  //  THE KITCHEN — Polaroid Wall
  // ════════════════════════════════════

  const MOCK_DISHES = [
    {
      name: 'Hyderabadi Biryani',
      photo: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f4?w=400&h=300&fit=crop',
      spice: 4,
      tag: 'SIGNATURE DISH',
      story: 'The one dish that took 47 failed attempts to get right. Dum method, whole spices, zero shortcuts. The neighbours know when biryani day hits.'
    },
    {
      name: 'Fresh Pasta Aglio e Olio',
      photo: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop',
      spice: 2,
      tag: 'CURRENT OBSESSION',
      story: 'Hand-rolled, no machine. Just flour, eggs, and main character energy. The key is toasting the garlic low and slow until it whispers back at you.'
    },
    {
      name: 'Butter Chicken',
      photo: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop',
      spice: 3,
      tag: 'CROWD PLEASER',
      story: 'The "play it safe" pick that never fails. Overnight marinade, cashew paste, stupid amounts of butter. Tastes like a warm hug from a desi auntie.'
    },
    {
      name: 'Spicy Ramen',
      photo: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
      spice: 5,
      tag: 'LATE NIGHT FUEL',
      story: 'Tonkotsu base simmered for 8 hours. Chili oil homemade. Soft-boiled egg with the perfect jammy center. Anime-accurate slurping is mandatory.'
    },
    {
      name: 'Chocolate Lava Cake',
      photo: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop',
      spice: 0,
      tag: 'DESSERT BOSS',
      story: 'The timing is everything — 12 minutes, not 11, not 13. Pull it out and flip it with unearned confidence. The molten center is either perfect or a crime scene.'
    },
    {
      name: 'Chicken Tikka Tacos',
      photo: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop',
      spice: 3,
      tag: 'FUSION EXPERIMENT',
      story: 'Desi meets Mexican in the most chaotic crossover episode. Tikka-marinated chicken, pickled onions, mint chutney, flour tortilla. Geneva Convention pending.'
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
            '<img class="kitchen-pol-photo" src="' + dish.photo + '" alt="' + dish.name + '" loading="lazy">' +
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
  //  GAMING DATA
  // ════════════════════════════════════

  const MOCK_GAMES = [
    { title: 'Counter-Strike 2', xp: 1500, played: 'Today', color: '#de9b35', emoji: '💣' },
    { title: 'Warhammer 40K: Space Marine 2', xp: 180, played: 'Last week', color: '#1a3a7a', emoji: '⚔️' },
    { title: 'DOOM Eternal', xp: 210, played: '2 weeks ago', color: '#8b0000', emoji: '🔥' },
    { title: 'DOOM (2016)', xp: 145, played: '3 months ago', color: '#a30000', emoji: '💀' },
    { title: 'GTA V', xp: 420, played: 'Last month', color: '#2d5a27', emoji: '🚗' },
    { title: 'Detroit: Become Human', xp: 35, played: 'Yesterday', color: '#2a4a6b', emoji: '🤖' },
    { title: 'Death Stranding', xp: 62, played: 'This week', color: '#1a1a2e', emoji: '📦' },
    { title: 'Halo Infinite', xp: 195, played: 'Last month', color: '#3d6b3d', emoji: '🪖' },
    { title: 'Valorant', xp: 12, played: 'Never again', color: '#ff4655', emoji: '🗑️' },
  ];

  const MOCK_SPOTLIGHT = {
    title: 'Counter-Strike 2',
    genre: ['FPS', 'Tactical Shooter', 'Competitive'],
    desc: '1500 hours deep. ~$40K inventory. If you peek mid, that\'s on you. Controller gang — yes, I play CS2 on a PS4 controller. Yes, I still win.',
    emoji: '💣',
    color: '#de9b35'
  };

  const MOCK_GAMING_STATS = [
    { label: 'CS2 Hours', value: 1500, suffix: 'hrs', color: '#de9b35' },
    { label: 'Inventory Value', value: 40, suffix: 'K', color: '#30d158' },
    { label: 'Demons Ripped', value: 999, suffix: '+', color: '#ff375f' },
    { label: 'PS4 Controllers', value: 2, suffix: '', color: '#0a84ff' },
    { label: 'Valo Tolerance', value: 0, suffix: '%', color: '#bf5af2' },
  ];

  const MOCK_LEADERBOARD = [
    { rank: 1, name: 'Sushrut', score: '$40,000 inv' },
    { rank: 2, name: 'Doom Slayer', score: '999 kills' },
    { rank: 3, name: 'Space Marine', score: 'FOR THE EMPEROR' },
    { rank: 4, name: 'Connor (RK800)', score: '28 STAB WOUNDS' },
    { rank: 5, name: 'Sam Bridges', score: '📦📦📦' },
  ];

  const MOCK_TRACKS = [
    { title: 'BFG Division', game: 'DOOM (2016)', audioURL: null },
    { title: 'The Only Thing They Fear', game: 'DOOM Eternal', audioURL: null },
    { title: 'Main Theme', game: 'Halo', audioURL: null },
    { title: 'Welcome to Los Santos', game: 'GTA V', audioURL: null },
    { title: 'BB\'s Theme', game: 'Death Stranding', audioURL: null },
    { title: 'Kainé — Salvation', game: 'NieR', audioURL: null },
  ];

  let liveGames = null, liveSpotlight = null, liveGamingStats = null, liveLeaderboard = null, liveTracks = null;

  async function fetchGamingData() {
    const results = await Promise.allSettled([
      apiFetch('/api/steam/games'),
      apiFetch('/api/gaming/spotlight'),
      apiFetch('/api/gaming/stats'),
      apiFetch('/api/gaming/leaderboard'),
    ]);
    liveGames = results[0].status === 'fulfilled' ? results[0].value : MOCK_GAMES;
    liveSpotlight = results[1].status === 'fulfilled' ? results[1].value : MOCK_SPOTLIGHT;
    liveGamingStats = results[2].status === 'fulfilled' ? results[2].value : MOCK_GAMING_STATS;
    liveLeaderboard = results[3].status === 'fulfilled' ? results[3].value : MOCK_LEADERBOARD;
  }

  async function fetchTracks() {
    try { liveTracks = await apiFetch('/api/jukebox/tracks'); }
    catch { liveTracks = MOCK_TRACKS; }
  }

  async function renderGamingSections() {
    await fetchGamingData();
    renderSpotlight(liveSpotlight);
    renderGames(liveGames);
    renderGamingStats(liveGamingStats);
    renderLeaderboard(liveLeaderboard);
    initReveal();
  }

  function renderSpotlight(data) {
    const card = document.getElementById('spotlight-card');
    if (!card || card.children.length > 0) return;
    const chips = data.genre.map(g => '<span class="gc-spot-chip">' + g + '</span>').join('');
    card.innerHTML =
      '<div class="gc-spot-bg" style="background:' + data.color + '"></div>' +
      '<div class="gc-spot-content">' +
        '<div class="gc-spot-cover" style="background:' + data.color + '">' + data.emoji + '</div>' +
        '<div class="gc-spot-info">' +
          '<div class="gc-spot-live"><span class="gc-spot-live-dot"></span><span class="gc-spot-live-text">NOW PLAYING</span></div>' +
          '<h3 class="gc-spot-title">' + data.title + '</h3>' +
          '<div class="gc-spot-chips">' + chips + '</div>' +
          '<p class="gc-spot-desc">' + data.desc + '</p>' +
          '<p class="gc-spot-hours">1,500+ hrs | PS4 Controller | $40K Inventory</p>' +
        '</div>' +
      '</div>';
  }

  function renderGames(games) {
    const grid = document.getElementById('games-grid');
    if (!grid || grid.children.length > 0) return;
    const maxXp = Math.max(...games.map(g => g.xp));
    games.forEach(g => {
      const card = document.createElement('div');
      card.className = 'gc-game-card reveal';
      const pct = Math.round((g.xp / maxXp) * 100);
      card.innerHTML =
        '<div class="gc-game-cover" style="background:' + g.color + '">' + g.emoji + '</div>' +
        '<div class="gc-game-body">' +
          '<p class="gc-game-title">' + g.title + '</p>' +
          '<div class="gc-game-meta">' +
            '<span class="gc-game-xp">' + g.xp + ' hrs</span>' +
            '<span class="gc-game-played">' + g.played + '</span>' +
          '</div>' +
          '<div class="gc-game-bar"><div class="gc-game-bar-fill" style="width:' + pct + '%;background:' + g.color + '"></div></div>' +
        '</div>';
      grid.appendChild(card);
    });
  }

  const STAT_ICONS = ['💣', '💰', '👹', '🎮', '🚫'];

  function renderGamingStats(stats) {
    const grid = document.getElementById('gstats-grid');
    if (!grid || grid.children.length > 0) return;
    stats.forEach((stat, i) => {
      const card = document.createElement('div');
      card.className = 'gc-stat-card reveal';
      card.style.setProperty('--stat-color', stat.color);
      card.innerHTML =
        '<div class="gc-stat-icon">' + (STAT_ICONS[i] || '📊') + '</div>' +
        '<div class="gc-stat-num" data-target="' + stat.value + '" style="color:' + stat.color + '">' +
          '0' + (stat.suffix ? '<span class="gc-stat-suffix">' + stat.suffix + '</span>' : '') +
        '</div>' +
        '<div class="gc-stat-label">' + stat.label + '</div>';
      grid.appendChild(card);
    });
    const nums = grid.querySelectorAll('.gc-stat-num');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { observer.unobserve(entry.target); countUp(entry.target); }
      });
    }, { threshold: 0.3 });
    nums.forEach(el => observer.observe(el));
  }

  function countUp(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.querySelector('.gc-stat-suffix');
    const suffixText = suffix ? suffix.textContent : '';
    const duration = 1500;
    const start = performance.now();
    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(ease * target);
      if (suffixText) el.innerHTML = current.toLocaleString() + '<span class="gc-stat-suffix">' + suffixText + '</span>';
      else el.textContent = current.toLocaleString();
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  function renderLeaderboard(rows) {
    const table = document.getElementById('leaderboard-table');
    if (!table || table.children.length > 0) return;

    // Header row
    const header = document.createElement('div');
    header.className = 'gc-lb-header';
    header.innerHTML =
      '<span class="gc-lb-header-icon">🏆</span>' +
      '<span class="gc-lb-header-text">LEADERBOARD</span>' +
      '<span class="gc-lb-header-icon">🏆</span>';
    table.appendChild(header);

    const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
    rows.forEach(row => {
      const div = document.createElement('div');
      const rankClass = row.rank <= 3 ? ' gc-lb-row-' + row.rank : '';
      div.className = 'gc-lb-row reveal' + rankClass;
      div.innerHTML =
        '<span class="gc-lb-rank">#' + row.rank + '</span>' +
        (medals[row.rank] ? '<span class="gc-lb-medal">' + medals[row.rank] + '</span>' : '') +
        '<span class="gc-lb-name">' + row.name + '</span>' +
        '<span class="gc-lb-score">' + row.score + '</span>';
      table.appendChild(div);
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

    function selectTrack(index) { currentTrack = index; updateDisplay(); renderTracks(); if (!isPlaying) togglePlay(); }

    function togglePlay() {
      isPlaying = !isPlaying;
      jukebox.classList.toggle('paused', !isPlaying);
      var icon = isPlaying ? '\u23F8' : '\u25B6';
      playCompact.textContent = icon;
      playBtn.textContent = icon;
    }

    function prevTrack() { currentTrack = (currentTrack - 1 + tracks.length) % tracks.length; updateDisplay(); renderTracks(); }
    function nextTrack() { currentTrack = (currentTrack + 1) % tracks.length; updateDisplay(); renderTracks(); }

    pill.addEventListener('click', function(e) {
      if (e.target === playCompact) { e.stopPropagation(); togglePlay(); return; }
      jukebox.classList.add('expanded'); backdrop.classList.add('active');
    });
    playCompact.addEventListener('click', function(e) { e.stopPropagation(); togglePlay(); });
    closeBtn.addEventListener('click', function() { jukebox.classList.remove('expanded'); jukebox.classList.remove('expanded-full'); backdrop.classList.remove('active'); });
    if (backdrop) { backdrop.addEventListener('click', function() { jukebox.classList.remove('expanded'); jukebox.classList.remove('expanded-full'); backdrop.classList.remove('active'); }); }
    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', prevTrack);
    nextBtn.addEventListener('click', nextTrack);

    var tlToggle = document.getElementById('jb-tl-toggle');
    if (tlToggle) { tlToggle.addEventListener('click', function() { jukebox.classList.toggle('expanded-full'); }); }
    volSlider.addEventListener('input', function() { volVal.textContent = volSlider.value; });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && jukebox.classList.contains('expanded')) {
        jukebox.classList.remove('expanded'); jukebox.classList.remove('expanded-full');
        if (backdrop) backdrop.classList.remove('active'); return;
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
      }
    });

    jukebox.classList.add('paused');
    renderTracks();
  }

  // ════════════════════════════════════
  //  PLAYER CARD 3D TILT
  // ════════════════════════════════════
  function initCardTilt() {
    const card = document.getElementById('example-card');
    if (!card) return;

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
  }

  // ── Init ──
  function init() {
    runIntro();
    initScrollProgress();
    initTips();
    initWheel();
    initStatPentagon();
    initReveal();
    animateStatBars();
    animateWantedStars();
    initLore();
    initWantedPosters();
    initCardTilt();
    initJukebox();
    renderKitchen();
    renderGamingSections();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
