// About Me — Side Quest Page JS (v4 — Tabs + Gaming Corner + Jukebox)
(() => {
  // ════════════════════════════════════
  //  API CONFIG — Backend Integration
  // ════════════════════════════════════
  const API_BASE = 'http://localhost:8081';

  async function apiFetch(path) {
    const res = await fetch(API_BASE + path);
    if (!res.ok) throw new Error(res.status);
    return res.json();
  }

  // ── Terminal Typing Animation ──
  function initTerminal() {
    const lines = document.querySelectorAll('.am-term-line');
    const cursor = document.querySelector('.am-term-cursor');
    if (!lines.length) return;

    lines.forEach(line => {
      const delay = parseInt(line.dataset.delay, 10) || 0;
      setTimeout(() => line.classList.add('show'), delay);
    });

    if (cursor) {
      const delay = parseInt(cursor.dataset.delay, 10) || 2400;
      setTimeout(() => cursor.classList.add('show'), delay);
    }
  }

  // ── Radar Chart (Apple colors) ──
  function drawRadar() {
    const canvas = document.getElementById('radar-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const cx = w / 2, cy = h / 2, r = 100;

    const labels = ['Curiosity', 'Humor', 'Creativity', 'Discipline', 'Adventure'];
    const values = [88, 92, 85, 70, 78];
    const n = labels.length;
    const step = (Math.PI * 2) / n;
    const startAngle = -Math.PI / 2;

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const gridColor = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';
    const labelColor = isLight ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.45)';
    const fillColor = isLight ? 'rgba(0,122,255,0.12)' : 'rgba(10,132,255,0.18)';
    const strokeColor = isLight ? '#007aff' : '#0a84ff';

    ctx.clearRect(0, 0, w, h);

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
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    for (let i = 0; i < n; i++) {
      const a = startAngle + step * i;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      ctx.strokeStyle = gridColor;
      ctx.stroke();
    }

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
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '11px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < n; i++) {
      const a = startAngle + step * i;
      const v = (values[i] / 100) * r;

      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * v, cy + Math.sin(a) * v, 3, 0, Math.PI * 2);
      ctx.fillStyle = strokeColor;
      ctx.fill();

      const lr = r + 20;
      ctx.fillStyle = labelColor;
      ctx.fillText(labels[i], cx + Math.cos(a) * lr, cy + Math.sin(a) * lr);
    }
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
    const fills = document.querySelectorAll('.am-bar-fill');
    if (!fills.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const val = entry.target.getAttribute('data-val');
          entry.target.style.width = val + '%';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    fills.forEach(el => observer.observe(el));
  }

  // ── Inventory Popup ──
  function initInventory() {
    const slots = document.querySelectorAll('.am-inv-slot');
    const popup = document.getElementById('inv-detail');
    const nameEl = document.getElementById('inv-detail-name');
    const descEl = document.getElementById('inv-detail-desc');
    const rarityEl = document.getElementById('inv-detail-rarity');
    const closeBtn = document.getElementById('inv-detail-close');

    if (!popup || !slots.length) return;

    const rarityColors = {
      legendary: '#ff9f0a',
      epic: '#bf5af2',
      rare: '#0a84ff',
      common: 'rgba(255,255,255,0.4)'
    };

    function openPopup(slot) {
      nameEl.textContent = slot.dataset.name;
      descEl.textContent = slot.dataset.desc;
      const rarity = slot.dataset.rarity;
      rarityEl.textContent = rarity.toUpperCase();
      rarityEl.style.color = rarityColors[rarity] || rarityColors.common;
      popup.classList.add('open');
    }

    function closePopup() {
      popup.classList.remove('open');
    }

    slots.forEach(slot => {
      slot.addEventListener('click', () => openPopup(slot));
    });

    closeBtn.addEventListener('click', closePopup);
    popup.addEventListener('click', (e) => {
      if (e.target === popup) closePopup();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePopup();
    });
  }

  // ── NPC Typewriter Effect ──
  function initTypewriter() {
    const npcs = document.querySelectorAll('.am-npc-text[data-text]');
    if (!npcs.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          typeText(entry.target);
        }
      });
    }, { threshold: 0.5 });

    npcs.forEach(el => observer.observe(el));
  }

  function typeText(el) {
    const text = el.dataset.text;
    if (!text || el.dataset.typed) return;
    el.dataset.typed = '1';

    el.classList.add('typing');
    el.textContent = '';
    let i = 0;

    function tick() {
      if (i < text.length) {
        el.textContent += text[i];
        i++;
        setTimeout(tick, 25 + Math.random() * 20);
      } else {
        el.classList.remove('typing');
      }
    }
    tick();
  }

  // ════════════════════════════════════
  //  TAB SYSTEM
  // ════════════════════════════════════
  function initTabs() {
    const tabs = document.querySelectorAll('.am-tab');
    const indicator = document.querySelector('.am-tab-indicator');
    const panels = {
      me: document.getElementById('panel-me'),
      gaming: document.getElementById('panel-gaming')
    };

    if (!tabs.length || !indicator) return;

    function moveIndicator(tab) {
      indicator.style.left = tab.offsetLeft + 'px';
      indicator.style.width = tab.offsetWidth + 'px';
    }

    function switchTab(tabName) {
      tabs.forEach(t => t.classList.remove('active'));
      const activeTab = document.querySelector('.am-tab[data-tab="' + tabName + '"]');
      if (!activeTab) return;
      activeTab.classList.add('active');
      moveIndicator(activeTab);

      Object.keys(panels).forEach(key => {
        if (panels[key]) {
          panels[key].classList.remove('am-panel-active');
          panels[key].style.display = 'none';
        }
      });

      if (panels[tabName]) {
        panels[tabName].style.display = 'block';
        // Force reflow then add animation class
        panels[tabName].offsetHeight;
        panels[tabName].classList.add('am-panel-active');
      }

      // Re-run reveal for newly visible panel
      initReveal();

      // Update hash without scrolling
      history.replaceState(null, '', '#' + tabName);

      // If switching to gaming, ensure gaming sections are rendered
      if (tabName === 'gaming') {
        renderGamingSections();
      }
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Initial tab from hash
    const hash = window.location.hash.replace('#', '');
    const initialTab = (hash === 'gaming') ? 'gaming' : 'me';
    switchTab(initialTab);

    // Handle browser back/forward
    window.addEventListener('hashchange', () => {
      const h = window.location.hash.replace('#', '');
      switchTab(h === 'gaming' ? 'gaming' : 'me');
    });

    // Reposition indicator on resize
    window.addEventListener('resize', () => {
      const active = document.querySelector('.am-tab.active');
      if (active) moveIndicator(active);
    });
  }

  // ════════════════════════════════════
  //  GAMING CORNER — Data & Renderers
  // ════════════════════════════════════

  let gamingRendered = false;

  // ── Mock Fallbacks (used when backend is unreachable) ──
  const MOCK_GAMES = [
    { title: 'Counter-Strike 2',     xp: 847, played: 'Last week',    color: '#1a472a', emoji: '🔫' },
    { title: 'Elden Ring',            xp: 312, played: '2 weeks ago',  color: '#4a2c0a', emoji: '⚔️' },
    { title: 'Valorant',              xp: 520, played: 'Yesterday',    color: '#ff4655', emoji: '🎯' },
    { title: 'Stardew Valley',        xp: 185, played: 'Last month',   color: '#5c8a49', emoji: '🌾' },
    { title: 'Cyberpunk 2077',        xp: 95,  played: '3 months ago', color: '#fcee09', emoji: '🌃' },
    { title: 'Red Dead Redemption 2', xp: 230, played: 'Last month',   color: '#8b0000', emoji: '🤠' },
    { title: 'Hollow Knight',         xp: 68,  played: '2 months ago', color: '#1a1a2e', emoji: '🦋' },
    { title: 'Hades',                 xp: 142, played: 'Last week',    color: '#8b1a1a', emoji: '🔥' },
    { title: 'Sekiro',                xp: 110, played: '4 months ago', color: '#2d2d2d', emoji: '🗡️' },
    { title: 'Celeste',               xp: 45,  played: '6 months ago', color: '#5b4a8a', emoji: '🏔️' },
  ];

  const MOCK_SPOTLIGHT = {
    title: 'Elden Ring',
    genre: ['Action RPG', 'Soulslike', 'Open World'],
    desc: 'Currently getting absolutely destroyed by Malenia for the 47th time. Send help. Or a summon. Preferably both.',
    emoji: '⚔️',
    color: '#4a2c0a'
  };

  const MOCK_GAMING_STATS = [
    { label: 'Total Hours Lost',    value: 2847, suffix: 'hrs',  color: '#0a84ff' },
    { label: 'Controllers Survived', value: 3,    suffix: '',     color: '#30d158' },
    { label: 'Rage Quits',           value: 156,  suffix: '',     color: '#ff375f' },
    { label: 'Backlog Size',         value: 73,   suffix: 'games',color: '#bf5af2' },
    { label: 'Completion Rate',      value: 12,   suffix: '%',    color: '#ff9f0a' },
  ];

  const MOCK_LEADERBOARD = [
    { rank: 1, name: 'Sushrut',       score: '99,999' },
    { rank: 2, name: 'xX_ProGamer_Xx', score: '45,200' },
    { rank: 3, name: 'ShadowBlade99',  score: '38,750' },
    { rank: 4, name: 'NPC_Steve',      score: '22,100' },
    { rank: 5, name: 'Bot_McBotface',  score: '8,400' },
  ];

  const MOCK_TRACKS = [
    { title: 'Corridors of Time',   game: 'Chrono Trigger',     audioURL: null },
    { title: 'Dragonborn',          game: 'Skyrim',             audioURL: null },
    { title: 'Weight of the World', game: 'NieR: Automata',     audioURL: null },
    { title: 'One-Winged Angel',    game: 'Final Fantasy VII',  audioURL: null },
    { title: 'Megalovania',         game: 'Undertale',          audioURL: null },
    { title: 'To Zanarkand',        game: 'Final Fantasy X',    audioURL: null },
  ];

  // ── Live data holders (populated by fetch or fallback) ──
  let liveGames = null;
  let liveSpotlight = null;
  let liveGamingStats = null;
  let liveLeaderboard = null;
  let liveTracks = null;

  async function fetchGamingData() {
    const results = await Promise.allSettled([
      apiFetch('/api/steam/games'),
      apiFetch('/api/gaming/spotlight'),
      apiFetch('/api/gaming/stats'),
      apiFetch('/api/gaming/leaderboard'),
    ]);

    liveGames        = results[0].status === 'fulfilled' ? results[0].value : MOCK_GAMES;
    liveSpotlight    = results[1].status === 'fulfilled' ? results[1].value : MOCK_SPOTLIGHT;
    liveGamingStats  = results[2].status === 'fulfilled' ? results[2].value : MOCK_GAMING_STATS;
    liveLeaderboard  = results[3].status === 'fulfilled' ? results[3].value : MOCK_LEADERBOARD;
  }

  async function fetchTracks() {
    try {
      liveTracks = await apiFetch('/api/jukebox/tracks');
    } catch {
      liveTracks = MOCK_TRACKS;
    }
  }

  async function renderGamingSections() {
    if (gamingRendered) return;
    gamingRendered = true;

    await fetchGamingData();
    renderSpotlight(liveSpotlight);
    renderGames(liveGames);
    renderGamingStats(liveGamingStats);
    renderLeaderboard(liveLeaderboard);
    initReveal();
  }

  // ── Game of the Month Spotlight ──
  function renderSpotlight(data) {
    const card = document.getElementById('spotlight-card');
    if (!card || card.children.length > 0) return;

    const chips = data.genre
      .map(g => '<span class="am-chip am-chip-blue">' + g + '</span>')
      .join('');

    card.innerHTML =
      '<div class="am-spot-cover" style="background:' + data.color + '">' + data.emoji + '</div>' +
      '<div class="am-spot-info">' +
        '<span class="am-spot-badge">NOW PLAYING</span>' +
        '<h3 class="am-spot-title">' + data.title + '</h3>' +
        '<div class="am-spot-chips">' + chips + '</div>' +
        '<p class="am-spot-desc">' + data.desc + '</p>' +
      '</div>';
  }

  // ── Game Library ──
  function renderGames(games) {
    const grid = document.getElementById('games-grid');
    if (!grid || grid.children.length > 0) return;

    games.forEach(g => {
      const card = document.createElement('div');
      card.className = 'am-game-card reveal';
      card.innerHTML =
        '<div class="am-game-cover" style="background:' + g.color + '">' + g.emoji + '</div>' +
        '<p class="am-game-title">' + g.title + '</p>' +
        '<p class="am-game-xp">XP: ' + g.xp + ' hrs</p>' +
        '<p class="am-game-played">' + g.played + '</p>';
      grid.appendChild(card);
    });
  }

  // ── Gaming Stats with Count-Up ──
  function renderGamingStats(stats) {
    const grid = document.getElementById('gstats-grid');
    if (!grid || grid.children.length > 0) return;

    stats.forEach(stat => {
      const card = document.createElement('div');
      card.className = 'am-gstat-card reveal';
      card.innerHTML =
        '<div class="am-gstat-num" data-target="' + stat.value + '" style="color:' + stat.color + '">' +
          '0' + (stat.suffix ? '<span class="am-gstat-suffix">' + stat.suffix + '</span>' : '') +
        '</div>' +
        '<div class="am-gstat-label">' + stat.label + '</div>';
      grid.appendChild(card);
    });

    // Count-up observer
    const nums = grid.querySelectorAll('.am-gstat-num');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          countUp(entry.target);
        }
      });
    }, { threshold: 0.3 });

    nums.forEach(el => observer.observe(el));
  }

  function countUp(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.querySelector('.am-gstat-suffix');
    const suffixText = suffix ? suffix.textContent : '';
    const duration = 1500;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(ease * target);

      if (suffixText) {
        el.innerHTML = current.toLocaleString() + '<span class="am-gstat-suffix">' + suffixText + '</span>';
      } else {
        el.textContent = current.toLocaleString();
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // ── Leaderboard ──
  function renderLeaderboard(rows) {
    const table = document.getElementById('leaderboard-table');
    if (!table || table.children.length > 0) return;

    rows.forEach(row => {
      const div = document.createElement('div');
      div.className = 'am-lb-row reveal' + (row.rank === 1 ? ' am-lb-row-top' : '');
      div.innerHTML =
        '<span class="am-lb-rank">#' + row.rank + '</span>' +
        '<span class="am-lb-name">' + row.name + '</span>' +
        '<span class="am-lb-score">' + row.score + '</span>';
      table.appendChild(div);
    });
  }

  // ════════════════════════════════════
  //  JUKEBOX — Fetches tracks from API, falls back to mock
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
      // Duplicate text for seamless marquee loop
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
        div.addEventListener('click', function(e) {
          e.stopPropagation();
          selectTrack(i);
        });
        trackList.appendChild(div);
      });
    }

    function selectTrack(index) {
      currentTrack = index;
      updateDisplay();
      renderTracks();
      if (!isPlaying) togglePlay();
    }

    function togglePlay() {
      isPlaying = !isPlaying;
      jukebox.classList.toggle('paused', !isPlaying);
      var icon = isPlaying ? '\u23F8' : '\u25B6';
      playCompact.textContent = icon;
      playBtn.textContent = icon;
    }

    function prevTrack() {
      currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
      updateDisplay();
      renderTracks();
    }

    function nextTrack() {
      currentTrack = (currentTrack + 1) % tracks.length;
      updateDisplay();
      renderTracks();
    }

    pill.addEventListener('click', function(e) {
      if (e.target === playCompact) {
        e.stopPropagation();
        togglePlay();
        return;
      }
      jukebox.classList.add('expanded');
      backdrop.classList.add('active');
    });

    playCompact.addEventListener('click', function(e) {
      e.stopPropagation();
      togglePlay();
    });

    closeBtn.addEventListener('click', function() {
      jukebox.classList.remove('expanded');
      jukebox.classList.remove('expanded-full');
      backdrop.classList.remove('active');
    });

    // ── Backdrop click to close ──
    if (backdrop) {
      backdrop.addEventListener('click', function() {
        jukebox.classList.remove('expanded');
        jukebox.classList.remove('expanded-full');
        backdrop.classList.remove('active');
      });
    }

    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', prevTrack);
    nextBtn.addEventListener('click', nextTrack);

    // ── Tracklist toggle (mobile two-stage) ──
    var tlToggle = document.getElementById('jb-tl-toggle');
    if (tlToggle) {
      tlToggle.addEventListener('click', function() {
        jukebox.classList.toggle('expanded-full');
      });
    }

    volSlider.addEventListener('input', function() {
      volVal.textContent = volSlider.value;
    });

    // ── Keyboard shortcuts (when jukebox is focused/expanded) ──
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && jukebox.classList.contains('expanded')) {
        jukebox.classList.remove('expanded');
        jukebox.classList.remove('expanded-full');
        if (backdrop) backdrop.classList.remove('active');
        return;
      }
      // Only handle shortcuts when expanded
      if (!jukebox.classList.contains('expanded')) return;
      if (e.target.tagName === 'INPUT') return; // don't hijack volume slider

      switch(e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextTrack();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevTrack();
          break;
        case 'ArrowUp':
          e.preventDefault();
          volSlider.value = Math.min(100, parseInt(volSlider.value) + 10);
          volVal.textContent = volSlider.value;
          break;
        case 'ArrowDown':
          e.preventDefault();
          volSlider.value = Math.max(0, parseInt(volSlider.value) - 10);
          volVal.textContent = volSlider.value;
          break;
      }
    });

    // ── Touch swipe on expanded boombox (prev/next track) ──
    var touchStartX = 0;
    var touchStartY = 0;
    var boomboxEl = jukebox.querySelector('.am-jb-boombox');

    if (boomboxEl) {
      boomboxEl.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }, { passive: true });

      boomboxEl.addEventListener('touchend', function(e) {
        var dx = e.changedTouches[0].clientX - touchStartX;
        var dy = e.changedTouches[0].clientY - touchStartY;
        // Only trigger if horizontal swipe is dominant and long enough
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
          if (dx < 0) nextTrack();
          else prevTrack();
        }
      }, { passive: true });
    }

    // ── Tap outside to close on mobile ──
    document.addEventListener('click', function(e) {
      if (jukebox.classList.contains('expanded') && !jukebox.contains(e.target)) {
        jukebox.classList.remove('expanded');
        jukebox.classList.remove('expanded-full');
        if (backdrop) backdrop.classList.remove('active');
      }
    });

    jukebox.classList.add('paused');
    renderTracks();
  }

  // ── Theme change re-draw radar ──
  const themeObserver = new MutationObserver(() => drawRadar());
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // ── Init ──
  function init() {
    initTerminal();
    initTabs();        // sets up panels, renders gaming if #gaming
    initReveal();
    animateStatBars();
    drawRadar();
    initInventory();
    initTypewriter();
    initJukebox();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
