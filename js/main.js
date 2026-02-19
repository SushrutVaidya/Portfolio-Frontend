// ========================================
// API Configuration
// ========================================

// For local development: use full backend URL
// For production: use relative URL (Nginx will proxy)
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8081/api/stats'
  : '/api/stats';

// ========================================
// DOM Elements
// ========================================

const loadingEl = document.getElementById('loading');
const statContentEl = document.getElementById('stat-content');
const currentTimeEl = document.getElementById('current-time');
const locationTextEl = document.getElementById('location-text');
const songNameEl = document.getElementById('song-name');
const gameNameEl = document.getElementById('game-name');
const bookNameEl = document.getElementById('book-name');
const cityOverlayEl = document.getElementById('city-overlay');
const songOverlayEl = document.getElementById('song-overlay');
const gameOverlayEl = document.getElementById('game-overlay');
const bookOverlayEl = document.getElementById('book-overlay');
const instagramOverlayEl = document.getElementById('instagram-overlay');

// ========================================
// Song Audio
// ========================================

let songAudio = null;
let songPreviewUrl = null;

// Instagram thud sound
let instagramThud = null;

// Book audio
let bookAudio = null;

// ========================================
// Fetch Stats from Backend API
// ========================================

async function fetchStats() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Update DOM with data
    locationTextEl.textContent = data.location.toLowerCase();
    songNameEl.textContent = data.songName.toLowerCase();
    gameNameEl.textContent = data.game.toLowerCase();
    bookNameEl.textContent = data.bookName ? data.bookName.toLowerCase() : 'this book';
    songPreviewUrl = data.songURL;

    // Hide loading, show content
    loadingEl.classList.add('hidden');
    statContentEl.style.display = 'block';
    setTimeout(() => {
      statContentEl.classList.add('visible');
    }, 100);

    // Start live clock
    startLiveClock();

  } catch (error) {
    console.error('Error fetching stats:', error);

    // Show default content even if API fails
    locationTextEl.textContent = 'hyderabad';
    songNameEl.textContent = 'your favorite song';
    gameNameEl.textContent = 'counter-strike 2';
    bookNameEl.textContent = 'this book';

    // Hide loading, show content
    loadingEl.classList.add('hidden');
    statContentEl.style.display = 'block';
    setTimeout(() => {
      statContentEl.classList.add('visible');
    }, 100);

    // Start live clock
    startLiveClock();
  }
}

// ========================================
// Live Clock
// ========================================

function formatTime(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';

  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12

  const minutesStr = minutes < 10 ? '0' + minutes : minutes;

  return `${hours}:${minutesStr}${ampm}`;
}

function updateClock() {
  const now = new Date();
  currentTimeEl.textContent = formatTime(now);
}

function startLiveClock() {
  updateClock(); // Update immediately
  setInterval(updateClock, 1000); // Update every second
}

// ========================================
// Hover Effects
// ========================================

// Helper function to hide all overlays
function hideAllOverlays() {
  cityOverlayEl.classList.remove('active');
  songOverlayEl.classList.remove('active');
  gameOverlayEl.classList.remove('active');
  bookOverlayEl.classList.remove('active');
  instagramOverlayEl.classList.remove('active');
}

// City hover
locationTextEl.addEventListener('mouseenter', () => {
  hideAllOverlays();
  cityOverlayEl.classList.add('active');
});

locationTextEl.addEventListener('mouseleave', () => {
  cityOverlayEl.classList.remove('active');
});

// Song hover
songNameEl.addEventListener('mouseenter', () => {
  hideAllOverlays();
  songOverlayEl.classList.add('active');

  // Play or resume audio
  if (songPreviewUrl) {
    if (!songAudio) {
      songAudio = new Audio(API_URL.replace('/api/stats', '') + songPreviewUrl);
      songAudio.volume = 0.5;
    }
    songAudio.play().catch(() => {
      console.log('Click anywhere on the page first to enable audio');
    });
  }
});

songNameEl.addEventListener('mouseleave', () => {
  songOverlayEl.classList.remove('active');

  // Pause audio (keeps position)
  if (songAudio) {
    songAudio.pause();
  }
});

// Game hover
gameNameEl.addEventListener('mouseenter', () => {
  hideAllOverlays();
  gameOverlayEl.classList.add('active');
});

gameNameEl.addEventListener('mouseleave', () => {
  gameOverlayEl.classList.remove('active');
});

// Book hover
bookNameEl.addEventListener('mouseenter', () => {
  hideAllOverlays();
  bookOverlayEl.classList.add('active');

  // Play video
  const bookVideo = bookOverlayEl.querySelector('.media-video');
  if (bookVideo) {
    bookVideo.currentTime = 4.45;
    bookVideo.play().catch(() => {
      console.log('Video autoplay blocked');
    });
  }

  // Play book audio (crickets)
  if (bookAudio) {
    bookAudio.currentTime = 0;
    bookAudio.play().catch(() => {
      console.log('Click anywhere on the page first to enable audio');
    });
  }
});

bookNameEl.addEventListener('mouseleave', () => {
  bookOverlayEl.classList.remove('active');

  // Pause video
  const bookVideo = bookOverlayEl.querySelector('.media-video');
  if (bookVideo) {
    bookVideo.pause();
    bookVideo.currentTime = 0;
  }

  // Stop audio when cursor leaves
  if (bookAudio) {
    bookAudio.pause();
    bookAudio.currentTime = 0;
  }
});

// Preload book audio (crickets)
document.addEventListener('DOMContentLoaded', () => {
  bookAudio = new Audio('img/crickets.mp3');
  bookAudio.volume = 0.5;
  bookAudio.preload = 'auto';
  bookAudio.load();
});

// Instagram hover (in footer)
document.addEventListener('DOMContentLoaded', () => {
  const instagramIcon = document.querySelector('.instagram-hover');

  if (instagramIcon) {
    // Preload audio to eliminate delay
    instagramThud = new Audio('img/thud.mp3');
    instagramThud.volume = 0.5;
    instagramThud.preload = 'auto';
    instagramThud.load();

    instagramIcon.addEventListener('mouseenter', () => {
      hideAllOverlays();
      instagramOverlayEl.classList.add('active');

      // Play thud sound
      instagramThud.currentTime = 0; // Reset to start
      instagramThud.play().catch(() => {
        console.log('Click anywhere on the page first to enable audio');
      });
    });

    instagramIcon.addEventListener('mouseleave', () => {
      instagramOverlayEl.classList.remove('active');

      // Stop audio when cursor leaves
      if (instagramThud) {
        instagramThud.pause();
        instagramThud.currentTime = 0;
      }
    });
  }
});

// ========================================
// Initialize on Page Load
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  fetchStats();
  setupScrollColorTransition();
  setupFadeInAnimations();
  setupMobileTouchSupport();
  setupRickrollCounter();
});

// ========================================
// Smooth Color Transition on Scroll
// ========================================

function setupScrollColorTransition() {
  const sections = [
    { id: 'hero', color: '#0b24fb' },
    { id: 'about', color: '#fc0' },
    { id: 'interests', color: '#ff3838' },
    { id: 'tracking', color: '#2ed573' },
    { id: 'patent', color: '#9b59b6' },
    { id: 'footer', color: '#0b24fb' }
  ];

  // Set initial color
  document.body.style.backgroundColor = sections[0].color;

  // Intersection Observer to detect which section is visible
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5 // Trigger when 50% of section is visible
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.id;
        const section = sections.find(s => s.id === sectionId);
        if (section) {
          document.body.style.backgroundColor = section.color;
        }
      }
    });
  }, observerOptions);

  // Observe all sections
  sections.forEach(section => {
    const element = document.getElementById(section.id);
    if (element) {
      observer.observe(element);
    }
  });
}

// ========================================
// Scroll Fade-In Animations
// ========================================

function setupFadeInAnimations() {
  const fadeElements = document.querySelectorAll('.fade-in');

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  });

  fadeElements.forEach(el => fadeObserver.observe(el));
}

// ========================================
// Mobile Touch Support
// ========================================

function setupMobileTouchSupport() {
  // Check if device supports touch
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  if (isTouchDevice) {
    // Track active overlay for toggle behavior
    let activeOverlay = null;

    const handleTap = (element, overlay, playAudio = false) => {
      element.addEventListener('click', (e) => {
        e.preventDefault();

        if (activeOverlay === overlay) {
          // Tapping same element - hide overlay
          overlay.classList.remove('active');
          activeOverlay = null;
          if (playAudio && songAudio) {
            songAudio.pause();
          }
        } else {
          // Tapping different element - switch overlay
          hideAllOverlays();
          if (songAudio) songAudio.pause();
          overlay.classList.add('active');
          activeOverlay = overlay;

          if (playAudio && songPreviewUrl) {
            if (!songAudio) {
              songAudio = new Audio(API_URL.replace('/api/stats', '') + songPreviewUrl);
              songAudio.volume = 0.5;
            }
            songAudio.play().catch(() => {});
          }
        }
      });
    };

    handleTap(locationTextEl, cityOverlayEl);
    handleTap(songNameEl, songOverlayEl, true);
    handleTap(gameNameEl, gameOverlayEl);

    // Book tap support with audio
    bookNameEl.addEventListener('click', (e) => {
      e.preventDefault();

      if (activeOverlay === bookOverlayEl) {
        // Tapping same element - hide overlay
        bookOverlayEl.classList.remove('active');
        activeOverlay = null;

        // Stop audio (when you add the audio file)
        if (bookAudio) {
          bookAudio.pause();
          bookAudio.currentTime = 0;
        }
      } else {
        // Tapping different element - switch overlay
        hideAllOverlays();
        if (songAudio) songAudio.pause();
        bookOverlayEl.classList.add('active');
        activeOverlay = bookOverlayEl;

        // Play book audio (when you add the audio file)
        if (bookAudio) {
          bookAudio.currentTime = 0;
          bookAudio.play().catch(() => {});
        }
      }
    });

    // Instagram tap support (in footer) with thud sound
    const instagramIcon = document.querySelector('.instagram-hover');
    if (instagramIcon) {
      instagramIcon.addEventListener('click', (e) => {
        e.preventDefault();

        if (activeOverlay === instagramOverlayEl) {
          // Tapping same element - hide overlay
          instagramOverlayEl.classList.remove('active');
          activeOverlay = null;

          // Stop audio
          if (instagramThud) {
            instagramThud.pause();
            instagramThud.currentTime = 0;
          }
        } else {
          // Tapping different element - switch overlay
          hideAllOverlays();
          if (songAudio) songAudio.pause();
          instagramOverlayEl.classList.add('active');
          activeOverlay = instagramOverlayEl;

          // Play thud sound
          if (instagramThud) {
            instagramThud.currentTime = 0;
            instagramThud.play().catch(() => {});
          }
        }
      });
    }

    // Tap anywhere else to close overlay
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.location-hover, .song-hover, .game-hover, .book-hover, .instagram-hover') && activeOverlay) {
        activeOverlay.classList.remove('active');
        activeOverlay = null;
        if (songAudio) songAudio.pause();

        // Stop Instagram audio
        if (instagramThud) {
          instagramThud.pause();
          instagramThud.currentTime = 0;
        }

        // Stop book audio (when you add the audio file)
        if (bookAudio) {
          bookAudio.pause();
          bookAudio.currentTime = 0;
        }
      }
    });
  }
}

// ========================================
// Rickroll Counter
// ========================================

function setupRickrollCounter() {
  const youtubeLink = document.querySelector('a[title="YouTube"]');

  if (youtubeLink) {
    youtubeLink.addEventListener('click', () => {
      // Mark that user clicked the link
      sessionStorage.setItem('rickrolled', 'true');

      // Increment counter on backend
      fetch(API_URL.replace('/api/stats', '/api/rickroll'))
        .catch(() => {});
    });
  }

  // Check on page load
  checkRickrolled();

  // Check when user comes back to tab (without refresh)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkRickrolled();
    }
  });
}

function checkRickrolled() {
  if (sessionStorage.getItem('rickrolled') === 'true') {
    sessionStorage.removeItem('rickrolled');

    // Fetch and display count
    fetch(API_URL.replace('/api/stats', '/api/rickroll/count'))
      .then(res => res.json())
      .then(data => {
        showRickrollMessage(data.count);
      })
      .catch(() => {});
  }
}

function showRickrollMessage(count) {
  const message = document.createElement('div');
  message.className = 'rickroll-message';
  message.innerHTML = `You're rickroll victim #${count}! Never gonna give you up 🎵`;
  document.body.appendChild(message);

  setTimeout(() => {
    message.classList.add('visible');
  }, 100);

  setTimeout(() => {
    message.classList.remove('visible');
    setTimeout(() => message.remove(), 500);
  }, 5000);
}
