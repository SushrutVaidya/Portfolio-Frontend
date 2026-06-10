/**
 * Jukebox Widget — drop into any page with one script tag.
 * Skips init if jukebox already exists (e.g. aboutme-v2.js already ran).
 */
(function () {
  if (document.getElementById('jukebox')) return;

  const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8081' : '';

  const GRN = '#c8ff00';

  // ── Inject CSS ──────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    .am-jukebox { position:fixed; bottom:24px; right:24px; z-index:300; font-family:'SF Mono','Courier New',monospace; }
    .am-jb-pill { all:unset; box-sizing:border-box; display:flex; align-items:center; gap:12px; padding:10px 18px; min-width:240px; background:#1a1a2e; border:2px solid ${GRN}; border-radius:8px; cursor:pointer; transform-origin:bottom right; transition:opacity .3s,transform .3s cubic-bezier(.16,1,.3,1),box-shadow .2s; box-shadow:0 0 12px rgba(200,255,0,.2),0 4px 20px rgba(0,0,0,.5); }
    .am-jb-pill:hover { transform:translateY(-2px); box-shadow:0 0 20px rgba(200,255,0,.4),0 8px 28px rgba(0,0,0,.6); }
    .am-jukebox.expanded .am-jb-pill { opacity:0; transform:scale(.9); pointer-events:none; }
    .am-jb-vinyl { width:30px; height:30px; border-radius:50%; flex-shrink:0; position:relative; background:radial-gradient(circle at center,${GRN} 0%,${GRN} 18%,#1a1a1a 18%,#1a1a1a 22%,#2a2a2a 22%,#2a2a2a 36%,#1a1a1a 36%,#1a1a1a 40%,#2a2a2a 40%,#2a2a2a 55%,#1a1a1a 55%,#1a1a1a 60%,#2a2a2a 60%,#2a2a2a 75%,#1a1a1a 75%,#1a1a1a 80%,#2a2a2a 80%,#2a2a2a 100%); animation:vinylSpin 1.8s linear infinite; box-shadow:0 0 8px rgba(200,255,0,.3); }
    .am-jb-vinyl::after { content:''; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:6px; height:6px; border-radius:50%; background:#0f0f0f; border:1.5px solid rgba(200,255,0,.5); }
    @keyframes vinylSpin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
    .am-jukebox.paused .am-jb-vinyl { animation-play-state:paused; box-shadow:none; }
    .am-jb-track-name { flex:1; overflow:hidden; position:relative; height:1.1em; }
    .am-jb-track-name-inner { display:inline-block; font:600 .68rem/1.1 'SF Mono',monospace; color:${GRN}; letter-spacing:.5px; white-space:nowrap; animation:pillMarquee 8s linear infinite; }
    .am-jukebox.paused .am-jb-track-name-inner { animation-play-state:paused; }
    @keyframes pillMarquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
    .am-jb-play-btn { font-size:.7rem; color:${GRN}; flex-shrink:0; transition:color .2s; }
    .am-jb-pill:hover .am-jb-play-btn { color:#deff66; }
    .am-jb-expanded { width:300px; position:absolute; bottom:0; right:0; transform-origin:bottom right; opacity:0; transform:scale(.92) translateY(8px); pointer-events:none; transition:opacity .3s,transform .3s cubic-bezier(.16,1,.3,1); }
    .am-jukebox.expanded .am-jb-expanded { opacity:1; transform:scale(1) translateY(0); pointer-events:auto; }
    .am-jb-boombox { background:#12121a; border:2px solid rgba(200,255,0,.1); border-radius:16px; overflow-y:auto; max-height:calc(100vh - 60px); box-shadow:0 0 20px rgba(200,255,0,.1),0 16px 48px rgba(0,0,0,.6); }
    .am-jb-close-row { display:flex; justify-content:flex-start; padding:14px 16px 0; }
    .am-jb-close { all:unset; width:18px; height:18px; background:#ff5f57; border-radius:50%; cursor:pointer; position:relative; transition:background .15s,transform .15s; }
    .am-jb-close::before,.am-jb-close::after { content:''; position:absolute; top:50%; left:50%; width:10px; height:1.5px; background:rgba(80,0,0,.55); border-radius:1px; }
    .am-jb-close::before { transform:translate(-50%,-50%) rotate(45deg); }
    .am-jb-close::after  { transform:translate(-50%,-50%) rotate(-45deg); }
    .am-jb-close:hover { background:#ff3b30; transform:scale(1.15); }
    .am-jb-backdrop { position:fixed; inset:0; background:rgba(0,0,0,.5); backdrop-filter:blur(10px); opacity:0; pointer-events:none; transition:opacity .3s; z-index:299; }
    .am-jb-backdrop.active { opacity:1; pointer-events:auto; }
    .am-jb-top-row { display:flex; align-items:center; padding:14px 12px 10px; gap:8px; background:linear-gradient(180deg,#1a1a2e,#12121a); }
    .am-jb-speaker { width:48px; height:48px; background:#0a0a14; border:2px solid rgba(255,255,255,.06); border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .am-jb-speaker-grill { display:flex; flex-direction:column; gap:3px; align-items:center; }
    .am-jb-speaker-grill span { display:block; height:2px; border-radius:1px; background:rgba(255,255,255,.08); }
    .am-jb-speaker-grill span:nth-child(1){width:12px} .am-jb-speaker-grill span:nth-child(2){width:20px} .am-jb-speaker-grill span:nth-child(3){width:24px} .am-jb-speaker-grill span:nth-child(4){width:20px} .am-jb-speaker-grill span:nth-child(5){width:12px}
    .am-jb-eq-display { flex:1; height:48px; background:#0a0a14; border:1px solid rgba(255,255,255,.06); border-radius:4px; display:flex; align-items:flex-end; justify-content:center; padding:4px 6px; gap:3px; overflow:hidden; }
    .am-jb-eq-bars { display:flex; align-items:flex-end; gap:3px; height:100%; }
    .am-jb-eq-bars span { display:block; width:4px; border-radius:0; animation:eqPixel .5s ease-in-out infinite alternate; }
    .am-jb-eq-bars span:nth-child(1){background:#c8ff00;animation-delay:.00s} .am-jb-eq-bars span:nth-child(2){background:#c8ff00;animation-delay:.08s} .am-jb-eq-bars span:nth-child(3){background:#0a84ff;animation-delay:.16s} .am-jb-eq-bars span:nth-child(4){background:#0a84ff;animation-delay:.24s} .am-jb-eq-bars span:nth-child(5){background:#ff9f0a;animation-delay:.32s} .am-jb-eq-bars span:nth-child(6){background:#ff9f0a;animation-delay:.12s} .am-jb-eq-bars span:nth-child(7){background:#ff375f;animation-delay:.20s} .am-jb-eq-bars span:nth-child(8){background:#ff375f;animation-delay:.28s} .am-jb-eq-bars span:nth-child(9){background:#bf5af2;animation-delay:.04s} .am-jb-eq-bars span:nth-child(10){background:#bf5af2;animation-delay:.36s}
    .am-jukebox.paused .am-jb-eq-bars span { animation-play-state:paused; }
    @keyframes eqPixel { 0%{height:3px} 50%{height:28px} 100%{height:10px} }
    .am-jb-cassette { margin:0 12px; background:#0a0a14; border:1px solid rgba(255,255,255,.06); border-radius:6px; padding:6px 10px; overflow:hidden; }
    .am-jb-cassette-inner { display:flex; align-items:center; height:20px; overflow:hidden; }
    .am-jb-marquee { white-space:nowrap; animation:marqueeScroll 12s linear infinite; }
    .am-jb-marquee-text { font:700 .6rem/1 'SF Mono',monospace; color:${GRN}; letter-spacing:1.5px; text-transform:uppercase; padding-right:60px; }
    @keyframes marqueeScroll { 0%{transform:translateX(100%)} 100%{transform:translateX(-100%)} }
    .am-jukebox.paused .am-jb-marquee { animation-play-state:paused; }
    .am-jb-tracklist { max-height:150px; overflow-y:auto; padding:6px 0; margin:6px 0; }
    .am-jb-track { display:flex; align-items:center; gap:8px; padding:6px 14px; cursor:pointer; transition:background .15s; }
    .am-jb-track:hover { background:rgba(255,255,255,.03); }
    .am-jb-track::before { content:''; font:700 .6rem/1 'SF Mono',monospace; color:rgba(255,255,255,.15); min-width:12px; }
    .am-jb-track.active::before { content:'>'; color:${GRN}; }
    .am-jb-track-info { display:flex; flex-direction:column; gap:1px; }
    .am-jb-track-title { font:600 .62rem/1.2 'SF Mono',monospace; color:rgba(255,255,255,.55); }
    .am-jb-track.active .am-jb-track-title { color:${GRN}; }
    .am-jb-track-game { font:400 .5rem/1 'SF Mono',monospace; color:rgba(255,255,255,.2); }
    .am-jb-controls { display:flex; justify-content:center; align-items:center; gap:12px; padding:8px 14px; }
    .am-jb-ctrl { all:unset; width:32px; height:32px; display:flex; align-items:center; justify-content:center; font-size:.8rem; color:rgba(255,255,255,.4); background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06); border-radius:8px; cursor:pointer; transition:all .15s; }
    .am-jb-ctrl:hover { color:#fff; background:rgba(255,255,255,.06); }
    .am-jb-ctrl-play { width:40px; height:40px; background:${GRN}; border-color:${GRN}; color:#000; border-radius:50%; font-size:.9rem; box-shadow:0 0 12px rgba(200,255,0,.3); }
    .am-jb-ctrl-play:hover { background:#deff66; }
    .am-jb-tl-toggle { all:unset; box-sizing:border-box; display:flex; align-items:center; justify-content:center; gap:8px; width:100%; padding:10px 14px; cursor:pointer; background:rgba(200,255,0,.04); border-top:1px solid rgba(200,255,0,.1); border-bottom:1px solid rgba(200,255,0,.06); transition:background .15s; }
    .am-jb-tl-chevron { font-size:.7rem; color:${GRN}; transition:transform .3s; display:inline-block; }
    .am-jb-tl-label { font:700 .55rem/1 'SF Mono',monospace; letter-spacing:1.5px; text-transform:uppercase; color:${GRN}; }
    .am-jb-volume-row { display:flex; align-items:center; gap:8px; padding:4px 14px 8px; }
    .am-jb-vol-label { font:700 .5rem/1 'SF Mono',monospace; color:rgba(255,255,255,.2); letter-spacing:1px; }
    .am-jb-vol-slider { flex:1; height:6px; -webkit-appearance:none; appearance:none; background:rgba(255,255,255,.12); border-radius:3px; outline:none; }
    .am-jb-vol-slider::-webkit-slider-thumb { -webkit-appearance:none; width:16px; height:16px; background:${GRN}; border-radius:50%; cursor:pointer; box-shadow:0 0 8px rgba(200,255,0,.3); }
    .am-jb-vol-val { font:700 .5rem/1 'SF Mono',monospace; color:rgba(255,255,255,.3); min-width:18px; text-align:right; }
    .am-jb-footer { display:flex; justify-content:center; padding:8px 14px 10px; border-top:1px solid rgba(255,255,255,.04); }
    .am-jb-footer span { font:600 .45rem/1 'SF Mono',monospace; letter-spacing:2px; color:rgba(200,255,0,.15); animation:insertCoin 2s ease-in-out infinite; }
    @keyframes insertCoin { 0%,100%{opacity:.3} 50%{opacity:.8} }
    @media(max-width:600px){ .am-jukebox{bottom:80px;right:16px;} .am-jb-pill{min-width:180px;padding:8px 12px;} }
  `;
  document.head.appendChild(style);

  // ── Inject HTML ──────────────────────────────────────────────
  const backdrop = document.createElement('div');
  backdrop.className = 'am-jb-backdrop';
  backdrop.id = 'jb-backdrop';

  const jukebox = document.createElement('div');
  jukebox.className = 'am-jukebox paused';
  jukebox.id = 'jukebox';
  jukebox.innerHTML = `
    <button class="am-jb-pill" id="jb-pill">
      <div class="am-jb-vinyl" id="jb-vinyl"></div>
      <div class="am-jb-track-name" id="jb-track-name">
        <span class="am-jb-track-name-inner" id="jb-track-name-inner">Loading tracks...</span>
      </div>
      <span class="am-jb-play-btn" id="jb-play-compact">&#9654;</span>
    </button>
    <div class="am-jb-expanded" id="jb-expanded">
      <div class="am-jb-boombox">
        <div class="am-jb-close-row"><button class="am-jb-close" id="jb-close" aria-label="Close"></button></div>
        <div class="am-jb-top-row">
          <div class="am-jb-speaker"><div class="am-jb-speaker-grill"><span></span><span></span><span></span><span></span><span></span></div></div>
          <div class="am-jb-eq-display"><div class="am-jb-eq-bars" id="jb-eq-bars"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div></div>
          <div class="am-jb-speaker"><div class="am-jb-speaker-grill"><span></span><span></span><span></span><span></span><span></span></div></div>
        </div>
        <div class="am-jb-cassette"><div class="am-jb-cassette-inner"><div class="am-jb-marquee" id="jb-marquee"><span class="am-jb-marquee-text" id="jb-marquee-text">—</span></div></div></div>
        <div class="am-jb-controls">
          <button class="am-jb-ctrl" id="jb-prev" aria-label="Previous">&#9198;</button>
          <button class="am-jb-ctrl am-jb-ctrl-play" id="jb-play" aria-label="Play/Pause">&#9654;</button>
          <button class="am-jb-ctrl" id="jb-next" aria-label="Next">&#9197;</button>
        </div>
        <button class="am-jb-tl-toggle" id="jb-tl-toggle">
          <span class="am-jb-tl-chevron" id="jb-tl-chevron">&#9662;</span>
          <span class="am-jb-tl-label">Tracklist</span>
        </button>
        <div class="am-jb-tracklist" id="jb-tracklist"></div>
        <div class="am-jb-volume-row">
          <span class="am-jb-vol-label">VOL</span>
          <input type="range" class="am-jb-vol-slider" id="jb-volume" min="0" max="100" value="70">
          <span class="am-jb-vol-val" id="jb-vol-val">70</span>
        </div>
        <div class="am-jb-footer"><span>INSERT COIN TO PLAY</span></div>
      </div>
    </div>`;

  function mount() {
    document.body.appendChild(backdrop);
    document.body.appendChild(jukebox);
    initJukebox();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

  // ── Jukebox Logic ────────────────────────────────────────────
  function initJukebox() {
    var tracks = [];
    var currentTrack = 0;
    var isPlaying = false;
    var _trackLoading = false;

    var audio = new Audio();
    audio.volume = 0.7;
    window._dqJukeboxAudio = audio;

    var pill       = document.getElementById('jb-pill');
    var closeBtn   = document.getElementById('jb-close');
    var trackNameEl= document.getElementById('jb-track-name-inner');
    var marqueeText= document.getElementById('jb-marquee-text');
    var playCompact= document.getElementById('jb-play-compact');
    var playBtn    = document.getElementById('jb-play');
    var prevBtn    = document.getElementById('jb-prev');
    var nextBtn    = document.getElementById('jb-next');
    var volSlider  = document.getElementById('jb-volume');
    var volVal     = document.getElementById('jb-vol-val');
    var tlToggle   = document.getElementById('jb-tl-toggle');
    var tlList     = document.getElementById('jb-tracklist');
    var SEP = '  ·  ';

    // Fetch tracks
    fetch(API_BASE + '/api/jukebox/tracks')
      .then(function(r){ return r.json(); })
      .then(function(data){
        tracks = data;
        // Resume previously playing track if user navigated from another page
        var savedTrack = sessionStorage.getItem('dq-jb-track');
        if (savedTrack !== null) {
          currentTrack = Math.min(parseInt(savedTrack) || 0, tracks.length - 1);
          setTimeout(function() {
            loadTrack(currentTrack);
            isPlaying = true;
            audio.play().catch(function(){});
            setPlayState(true);
          }, 300);
        }
        updateDisplay();
        renderTracks();
      })
      .catch(function(){ trackNameEl.textContent = 'Jukebox'; });

    function updateDisplay() {
      if (!tracks.length) return;
      var t = tracks[currentTrack];
      var label = t.title + ' — ' + t.game;
      trackNameEl.textContent = label + SEP + label + SEP;
      marqueeText.textContent = label;
    }

    function renderTracks() {
      tlList.innerHTML = '';
      tracks.forEach(function(t, i) {
        var div = document.createElement('div');
        div.className = 'am-jb-track' + (i === currentTrack ? ' active' : '');
        div.innerHTML = '<div class="am-jb-track-info"><span class="am-jb-track-title">' + t.title + '</span><span class="am-jb-track-game">' + t.game + '</span></div>';
        div.addEventListener('click', function(e){ e.stopPropagation(); selectTrack(i); });
        tlList.appendChild(div);
      });
    }

    function loadTrack(index) {
      var t = tracks[index];
      if (!t || !t.audioURL) return;
      var wasPlaying = isPlaying;
      _trackLoading = true;
      audio.src = t.audioURL.startsWith('http') ? t.audioURL : API_BASE + t.audioURL;
      audio.load();
      _trackLoading = false;
      if (wasPlaying) audio.play().catch(function(){});
    }

    audio.addEventListener('ended', function() {
      if (_trackLoading) return;
      currentTrack = (currentTrack + 1) % tracks.length;
      updateDisplay(); renderTracks(); loadTrack(currentTrack);
    });

    function setPlayState(playing) {
      isPlaying = playing;
      var icon = playing ? '⏸' : '▶';
      playCompact.textContent = icon;
      playBtn.textContent = icon;
      jukebox.classList.toggle('paused', !playing);
      // Persist track state across page navigations
      if (playing) sessionStorage.setItem('dq-jb-track', currentTrack);
      else sessionStorage.removeItem('dq-jb-track');
    }

    function togglePlay() {
      if (!tracks.length) return;
      if (!audio.src || audio.src === window.location.href) loadTrack(currentTrack);
      isPlaying ? audio.pause() : audio.play().catch(function(){});
      setPlayState(!isPlaying);
    }

    function selectTrack(index) {
      currentTrack = index;
      updateDisplay(); renderTracks();
      var t = tracks[index];
      if (t && t.audioURL) {
        _trackLoading = true;
        audio.src = t.audioURL.startsWith('http') ? t.audioURL : API_BASE + t.audioURL;
        audio.load();
        _trackLoading = false;
        isPlaying = true;
        audio.play().catch(function(){});
        setPlayState(true);
      }
    }

    pill.addEventListener('click', function(e) {
      if (e.target === playCompact) { e.stopPropagation(); togglePlay(); return; }
      jukebox.classList.add('expanded');
      backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
    playCompact.addEventListener('click', function(e){ e.stopPropagation(); togglePlay(); });
    closeBtn.addEventListener('click', function(){ jukebox.classList.remove('expanded'); backdrop.classList.remove('active'); document.body.style.overflow = ''; });
    backdrop.addEventListener('click', function(){ jukebox.classList.remove('expanded'); backdrop.classList.remove('active'); document.body.style.overflow = ''; });
    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', function(){ currentTrack = (currentTrack - 1 + tracks.length) % tracks.length; updateDisplay(); renderTracks(); loadTrack(currentTrack); });
    nextBtn.addEventListener('click', function(){ currentTrack = (currentTrack + 1) % tracks.length; updateDisplay(); renderTracks(); loadTrack(currentTrack); });
    volSlider.addEventListener('input', function(e){ e.stopPropagation(); audio.volume = volSlider.value / 100; volVal.textContent = volSlider.value; });
    tlToggle.addEventListener('click', function(){ jukebox.classList.toggle('expanded-full'); });
  }
})();
