// Direct-link gate for the DevQuest challenge pages.
//
// Loading captcha.html / devtype.html / incident.html directly (via URL bar
// or bookmark) previously skipped landing.html — no name modal, no
// dq-game-path/dq-player-first, but the challenges still ran and could
// even write stats to localStorage from a stateless start. This module
// enforces that the player came through landing (or entered via the
// DEVMODE cheat, which also sets dq-game-path).
//
// Redirects to landing.html if the marker is missing. Include as the
// FIRST script on any challenge page so we bail before per-page JS
// binds handlers to DOM that we're about to unload.
(function () {
  try {
    if (localStorage.getItem('dq-game-path') === 'true') return;
  } catch (_) {
    // Storage disabled (Safari private mode, etc.) — fall through and
    // redirect. Trying to play without storage would break stat handoff
    // anyway.
  }
  // Preserve the intended destination so we could bounce them back after
  // landing later if we ever want; for now landing just starts the flow.
  window.location.replace('landing.html');
})();
