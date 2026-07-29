// DevQuest — Theme Toggle + Sound Toggle
(function () {
  const html  = document.documentElement;
  const saved = localStorage.getItem('dq-theme') || 'dark';
  html.setAttribute('data-theme', saved);
})();

window.addEventListener('DOMContentLoaded', () => {
  const html      = document.documentElement;
  const themeBtn  = document.getElementById('dq-theme-toggle');
  const soundBtn  = document.getElementById('dq-sound-toggle');

  // ── Theme toggle ──
  if (themeBtn) {
    const iconEl  = themeBtn.querySelector('.dq-toggle-icon');
    const labelEl = themeBtn.querySelector('.dq-toggle-label');

    function updateThemeBtn(theme) {
      const isLight = theme === 'light';
      if (iconEl)  iconEl.textContent  = isLight ? '☽' : '☀';
      if (labelEl) labelEl.textContent = isLight ? 'Dark' : 'Light';
      themeBtn.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
    }

    updateThemeBtn(html.getAttribute('data-theme') || 'dark');

    themeBtn.addEventListener('click', () => {
      if (iconEl) {
        iconEl.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        iconEl.style.transform  = 'rotate(360deg) scale(1.25)';
        setTimeout(() => { iconEl.style.transition = ''; iconEl.style.transform = ''; }, 420);
      }

      const current = html.getAttribute('data-theme') || 'dark';
      const next    = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('dq-theme', next);
      updateThemeBtn(next);

      // Play toggle sound
      if (typeof DQSounds !== 'undefined') {
        DQSounds.resume();
        DQSounds.themeToggle(next === 'light');
      }
    });
  }

  // ── Sound toggle ──
  // Button controls both background music (only on captcha) AND UI SFX
  // (all pages). aria-label was previously "Mute music" which was
  // misleading on pages without <audio id="dq-music">. Now says "sound"
  // generically and reflects state via aria-pressed for screen readers.
  if (soundBtn) {
    const iconEl = soundBtn.querySelector('.dq-sound-icon');
    const hasMusic = !!document.getElementById('dq-music');
    const noun = hasMusic ? 'music and sound effects' : 'sound effects';

    function updateSoundBtn() {
      if (typeof DQSounds === 'undefined') return;
      const muted = DQSounds.isMuted();
      soundBtn.classList.toggle('muted', muted);
      if (iconEl) iconEl.textContent = muted ? '♪' : '♫';
      soundBtn.setAttribute('aria-label', (muted ? 'Unmute ' : 'Mute ') + noun);
      soundBtn.setAttribute('aria-pressed', muted ? 'true' : 'false');
      soundBtn.title = (muted ? 'Unmute ' : 'Mute ') + noun;
    }

    updateSoundBtn();

    soundBtn.addEventListener('click', () => {
      if (typeof DQSounds === 'undefined') return;
      DQSounds.resume();
      const nowMuted = DQSounds.toggleMute();
      updateSoundBtn();
      // Play a confirmation ping when unmuting
      if (!nowMuted) DQSounds.themeToggle(false);
    });
  }
});
