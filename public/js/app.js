/**
 * ElevateVoice — SayBriefly Studio Audio Player Engine
 * Manages multilingual audio sample playback (Kannada, Hindi, English) with Play/Pause controls.
 */

// Voice Tracks Configuration
const voiceTracks = {
  en: {
    id: 'en',
    card: document.getElementById('card-en'),
    btn: document.getElementById('btn-play-en'),
    icon: document.getElementById('icon-en'),
    audio: document.getElementById('audio-en'),
    track: document.getElementById('track-en'),
    fill: document.getElementById('fill-en'),
    time: document.getElementById('time-en'),
    status: document.getElementById('status-en'),
    src: '/audio/english.mp3',
    fallbackText: "Hello! This is ElevateBox calling regarding your e-commerce store inquiry. Can you hear me clearly?",
    langCode: 'en-IN',
    durationSec: 8
  },
  hi: {
    id: 'hi',
    card: document.getElementById('card-hi'),
    btn: document.getElementById('btn-play-hi'),
    icon: document.getElementById('icon-hi'),
    audio: document.getElementById('audio-hi'),
    track: document.getElementById('track-hi'),
    fill: document.getElementById('fill-hi'),
    time: document.getElementById('time-hi'),
    status: document.getElementById('status-hi'),
    src: '/audio/hindi.mp3',
    fallbackText: "नमस्ते! मैं एलिवेटबॉक्स से बात कर रहा हूँ। क्या आप अपनी ऑनलाइन वेबसाइट के बारे में चर्चा करने के लिए उपलब्ध हैं?",
    langCode: 'hi-IN',
    durationSec: 9
  },
  kn: {
    id: 'kn',
    card: document.getElementById('card-kn'),
    btn: document.getElementById('btn-play-kn'),
    icon: document.getElementById('icon-kn'),
    audio: document.getElementById('audio-kn'),
    track: document.getElementById('track-kn'),
    fill: document.getElementById('fill-kn'),
    time: document.getElementById('time-kn'),
    status: document.getElementById('status-kn'),
    src: '/audio/kannada.mp3',
    fallbackText: "ನಮಸ್ಕಾರ! ನಾನು ಎಲಿವೇಟ್‌ಬಾಕ್ಸ್‌ನಿಂದ ಕರೆ ಮಾಡುತ್ತಿದ್ದೇನೆ. ನಿಮ್ಮ ಇ-ಕಾಮರ್ಸ್ ವೆಬ್‌ಸೈಟ್ ಅಭಿವೃದ್ಧಿ ಬಗ್ಗೆ ಮಾತನಾಡಬಹುದೇ?",
    langCode: 'kn-IN',
    durationSec: 10
  },
  te: {
    id: 'te',
    card: document.getElementById('card-te'),
    btn: document.getElementById('btn-play-te'),
    icon: document.getElementById('icon-te'),
    audio: document.getElementById('audio-te'),
    track: document.getElementById('track-te'),
    fill: document.getElementById('fill-te'),
    time: document.getElementById('time-te'),
    status: document.getElementById('status-te'),
    src: '/audio/telugu.mp3',
    fallbackText: "నమస్కారం! నేను ఎలివేట్‌బాక్స్ నుండి కాల్ చేస్తున్నాను. మీ ఆన్‌లైన్ స్టోర్ డెవలప్‌మెంట్ గురించి మాట్లాడవచ్చా?",
    langCode: 'te-IN',
    durationSec: 10
  }
};

let currentPlayingKey = null;
let fallbackTimer = null;
let fallbackCurrentTime = 0;

// SVG Icons
const playIconSvg = `<polygon points="5 3 19 12 5 21 5 3"></polygon>`;
const pauseIconSvg = `<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>`;

// Format Seconds to MM:SS
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Stop Any Active Playback
function stopAllPlayback() {
  // Stop HTML5 Audio
  Object.values(voiceTracks).forEach(track => {
    if (track.audio) {
      track.audio.pause();
    }
    setTrackState(track.id, false);
  });

  // Stop Browser Speech Synthesis
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  // Clear Fallback Timer
  if (fallbackTimer) {
    clearInterval(fallbackTimer);
    fallbackTimer = null;
  }

  currentPlayingKey = null;

  // Reset orb state to idle
  window.dispatchEvent(
    new CustomEvent('elevatevoice:orb-state', {
      detail: { state: 'idle', volume: 0 }
    })
  );
  updateOrbStateDisplay('idle');
}

// Update UI State for a Track
function setTrackState(key, isPlaying) {
  const track = voiceTracks[key];
  if (!track) return;

  if (isPlaying) {
    track.card.classList.add('active-playing');
    track.icon.innerHTML = pauseIconSvg;
    track.status.textContent = 'PLAYING';
    track.status.style.color = '#1a3300';
    track.status.style.fontWeight = '600';
  } else {
    track.card.classList.remove('active-playing');
    track.icon.innerHTML = playIconSvg;
    track.status.textContent = 'READY';
    track.status.style.color = '';
    track.status.style.fontWeight = '';
  }
}

// Play / Pause Toggle Handler
function toggleVoicePlayback(key) {
  const track = voiceTracks[key];
  if (!track) return;

  // If already playing this track -> Pause it
  if (currentPlayingKey === key) {
    stopAllPlayback();
    return;
  }

  // Stop previous track
  stopAllPlayback();

  currentPlayingKey = key;
  setTrackState(key, true);

  // Notify orb-ui circle of active voice speaking
  window.dispatchEvent(
    new CustomEvent('elevatevoice:orb-state', {
      detail: { state: 'speaking', volume: 0.85 }
    })
  );
  updateOrbStateDisplay('speaking');

  // Try playing real audio file first
  const audio = track.audio;
  if (audio && audio.src) {
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        // Audio file played successfully
        setupAudioListeners(key);
      }).catch(err => {
        // File not found or blocked -> use SpeechSynthesis / simulated progress fallback
        console.log(`Audio file for ${key} not found (${track.src}), using speech preview fallback.`);
        playFallbackPreview(key);
      });
      return;
    }
  }

  playFallbackPreview(key);
}

// Setup Event Listeners for HTML5 Audio
function setupAudioListeners(key) {
  const track = voiceTracks[key];
  const audio = track.audio;

  audio.ontimeupdate = () => {
    if (currentPlayingKey !== key) return;
    const current = audio.currentTime;
    const total = audio.duration || track.durationSec;
    const pct = (current / total) * 100;
    track.fill.style.width = `${pct}%`;
    track.time.textContent = `${formatTime(current)} / ${formatTime(total)}`;
  };

  audio.onended = () => {
    setTrackState(key, false);
    track.fill.style.width = '0%';
    track.time.textContent = `0:00 / ${formatTime(audio.duration || track.durationSec)}`;
    currentPlayingKey = null;
  };
}

// Fallback Speech Preview (Works before user drops in actual mp3s)
function playFallbackPreview(key) {
  const track = voiceTracks[key];
  fallbackCurrentTime = 0;
  const total = track.durationSec;

  // Browser Speech Synthesis
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(track.fallbackText);
    utterance.lang = track.langCode;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }

  // Smooth Progress Bar Simulation
  fallbackTimer = setInterval(() => {
    fallbackCurrentTime += 0.1;
    const pct = Math.min((fallbackCurrentTime / total) * 100, 100);
    track.fill.style.width = `${pct}%`;
    track.time.textContent = `${formatTime(fallbackCurrentTime)} / ${formatTime(total)}`;

    if (fallbackCurrentTime >= total) {
      clearInterval(fallbackTimer);
      fallbackTimer = null;
      setTrackState(key, false);
      track.fill.style.width = '0%';
      track.time.textContent = `0:00 / ${formatTime(total)}`;
      currentPlayingKey = null;
    }
  }, 100);
}

// Progress Scrubbing / Seeking Click
function setupTrackScrubbing(key) {
  const track = voiceTracks[key];
  if (!track.track) return;

  track.track.onclick = (e) => {
    const rect = track.track.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const pct = Math.max(0, Math.min(clickX / width, 1));

    if (track.audio && track.audio.duration) {
      track.audio.currentTime = pct * track.audio.duration;
    } else {
      fallbackCurrentTime = pct * track.durationSec;
    }

    track.fill.style.width = `${pct * 100}%`;
  };
}

// Outbound Phone Modal & Auth Gating Logic
async function handleMakeCallAction() {
  const isAuth = window.ElevateAuth ? await window.ElevateAuth.isAuthenticated() : false;
  if (!isAuth) {
    // Redirect unauthenticated users directly to login page
    window.location.href = '/login.html?redirect=dialer';
    return;
  }
  const dialerModal = document.getElementById('dialer-modal');
  dialerModal?.classList.add('open');
}

function setupAuthUI() {
  const navAuthContainer = document.getElementById('nav-auth-container');
  if (!navAuthContainer || !window.ElevateAuth) return;

  async function renderState() {
    const session = await window.ElevateAuth.getSession();
    const user = session?.user;

    if (user && user.email) {
      const displayName = user.email.split('@')[0];
      navAuthContainer.innerHTML = `
        <div class="nav-user-chip" title="${user.email}">
          <span class="user-avatar-dot"></span>
          <span class="user-email-text">${displayName}</span>
        </div>
        <button class="btn btn-outline" id="nav-quick-dial-btn" type="button">Make a Call</button>
        <a href="#voices" class="btn btn-primary-compact" id="nav-listen-voices-btn">Listen to Voices →</a>
        <button class="btn btn-outline" id="nav-signout-btn" type="button" style="padding: 6px 12px; font-size: 13px;">Sign Out</button>
      `;

      const signOutBtn = document.getElementById('nav-signout-btn');
      if (signOutBtn) {
        signOutBtn.onclick = () => window.ElevateAuth.signOut();
      }
    } else {
      navAuthContainer.innerHTML = `
        <button class="btn btn-outline" id="nav-quick-dial-btn" type="button">Make a Call</button>
        <a href="#voices" class="btn btn-primary-compact" id="nav-listen-voices-btn">Listen to Voices →</a>
      `;
    }

    const quickDialBtn = document.getElementById('nav-quick-dial-btn');
    if (quickDialBtn) {
      quickDialBtn.onclick = handleMakeCallAction;
    }
  }

  renderState();
  window.ElevateAuth.onAuthStateChange(() => {
    renderState();
  });
}

function setupDialerModal() {
  const dialerModal = document.getElementById('dialer-modal');
  const openDialerBtn = document.getElementById('hero-open-dialer-btn');
  const dialerCloseBtn = document.getElementById('dialer-modal-close');
  const outboundDialForm = document.getElementById('outbound-dial-form');
  const targetPhoneInput = document.getElementById('target-phone-input');
  const dialResultBox = document.getElementById('dial-result-box');

  const closeModal = () => dialerModal?.classList.remove('open');

  if (openDialerBtn) {
    openDialerBtn.onclick = handleMakeCallAction;
  }

  if (dialerCloseBtn) dialerCloseBtn.onclick = closeModal;

  if (dialerModal) {
    dialerModal.onclick = (e) => {
      if (e.target === dialerModal) closeModal();
    };
  }

  // Auto-open dialer if user was redirected from login with ?action=dialer
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('action') === 'dialer' || window.location.hash === '#dialer') {
    if (window.ElevateAuth) {
      window.ElevateAuth.isAuthenticated().then((authed) => {
        if (authed) {
          dialerModal?.classList.add('open');
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      });
    }
  }

  if (outboundDialForm) {
    outboundDialForm.onsubmit = async (e) => {
      e.preventDefault();
      const phone = targetPhoneInput.value.trim();
      if (!phone) return;

      const token = window.ElevateAuth ? await window.ElevateAuth.getAccessToken() : null;
      if (!token) {
        window.location.href = '/login.html?redirect=dialer';
        return;
      }

      dialResultBox.style.display = 'block';
      dialResultBox.innerHTML = `<span style="color: var(--color-forest-ink);">Placing an authenticated call to <strong>${phone}</strong>...</span>`;

      try {
        const res = await fetch('/calls/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ phoneNumber: phone })
        });

        const data = await res.json();
        if (res.ok) {
          dialResultBox.innerHTML = `
            <div style="background: var(--color-sticky-note-mint); border: 1px solid var(--color-forest-ink); padding: 12px; border-radius: 6px; margin-top: 8px;">
              <strong>Call Placed Successfully</strong><br>
              <span>Please answer your phone to talk with the assistant.</span>
            </div>
          `;
        } else if (res.status === 401) {
          dialResultBox.innerHTML = `<div style="color: #c93b3b; margin-top: 8px;">Session expired. Please <a href="/login.html?redirect=dialer">sign in again</a>.</div>`;
        } else {
          dialResultBox.innerHTML = `<div style="color: #c93b3b; margin-top: 8px;">${data.error?.message || 'Could not complete call.'}</div>`;
        }
      } catch (err) {
        dialResultBox.innerHTML = `<div style="color: #c93b3b; margin-top: 8px;">Network connection error.</div>`;
      }
    };
  }
}

// FAQ Accordion
function setupFAQ() {
  document.querySelectorAll('.faq-question').forEach(q => {
    q.onclick = () => {
      const item = q.parentElement;
      item.classList.toggle('active');
    };
  });
}

// Helper to update the state pill badge text for the hero orb-ui circle
function updateOrbStateDisplay(state) {
  const display = document.getElementById('hero-orb-state-display');
  if (!display) return;
  const upper = (state || 'idle').toUpperCase();
  display.textContent = `${upper} — CLICK ORB TO INTERACT`;
}

// Initialize Players & Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Bind Play/Pause Buttons
  Object.keys(voiceTracks).forEach(key => {
    const track = voiceTracks[key];
    if (track.btn) {
      track.btn.onclick = () => toggleVoicePlayback(key);
    }
    setupTrackScrubbing(key);
  });

  // Listen for manual orb clicks from the orb-ui React component
  window.addEventListener('elevatevoice:orb-state-updated', (e) => {
    if (e.detail && e.detail.state) {
      updateOrbStateDisplay(e.detail.state);
    }
  });

  setupAuthUI();
  setupDialerModal();
  setupFAQ();
});

