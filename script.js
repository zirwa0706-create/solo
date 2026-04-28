// ============================================================
//  SŌLO — Islamic Audio Player
//  Categories: Nasheeds · Quranic · Ambience
// ============================================================

const TRACKS = [
  // ── NASHEEDS (Islamic vocal-only, no instruments) ─────────
  {
    id: 1,
    title: "Tala' al Badru 'Alayna",
    artist: "Madinah Voices",
    category: "nasheed",
    duration: "1:12",
    icon: "◐",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: 2,
    title: "Ya Nabi Salam Alayka",
    artist: "Dawud Mustafa",
    category: "nasheed",
    duration: "1:05",
    icon: "◐",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: 3,
    title: "Allahu Allah",
    artist: "Ibrahim Al Noor",
    category: "nasheed",
    duration: "1:18",
    icon: "◐",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
  },

  // ── VOCALS (Acapella of decent songs, no instruments) ─────
  {
    id: 4,
    title: "Somewhere Only We Know",
    artist: "Acapella Studio",
    category: "vocals",
    duration: "1:10",
    icon: "◉",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3"
  },
  {
    id: 5,
    title: "Fix You",
    artist: "Pure Voices",
    category: "vocals",
    duration: "1:22",
    icon: "◉",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3"
  },

  // ── QURANIC RECITATIONS ───────────────────────────────────
  {
    id: 6,
    title: "Surah Al-Fatiha",
    artist: "Sheikh Abdul Basit",
    category: "quran",
    duration: "0:58",
    icon: "◇",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },
  {
    id: 7,
    title: "Ayatul Kursi",
    artist: "Sheikh Mishary Rashid",
    category: "quran",
    duration: "1:20",
    icon: "◇",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  },
  {
    id: 8,
    title: "Surah Ar-Rahman",
    artist: "Sheikh Saad Al-Ghamdi",
    category: "quran",
    duration: "1:30",
    icon: "◇",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"
  },

  // ── AMBIENCE (Daf, nature, halal sound effects) ───────────
  {
    id: 9,
    title: "Morning Rain & Birds",
    artist: "Nature Sounds",
    category: "ambience",
    duration: "2:00",
    icon: "◌",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3"
  },
  {
    id: 10,
    title: "Daf Rhythm · Soft",
    artist: "Sacred Percussion",
    category: "ambience",
    duration: "1:45",
    icon: "◌",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
  }
];

// ============================================================
//  STATE
// ============================================================
let currentIndex  = -1;   // which track is playing (-1 = none)
let isPlaying     = false;
let activeCategory = "all";
let searchQuery    = "";

// ============================================================
//  DOM REFERENCES
// ============================================================
const audio        = document.getElementById("audio");
const playBtn      = document.getElementById("play-btn");
const prevBtn      = document.getElementById("prev-btn");
const nextBtn      = document.getElementById("next-btn");
const progressBar  = document.getElementById("progress-bar");
const progressFill = document.getElementById("progress-fill");
const progressThumb= document.getElementById("progress-thumb");
const currentTime  = document.getElementById("current-time");
const durationEl   = document.getElementById("duration");
const volumeSlider = document.getElementById("volume");
const volPct       = document.getElementById("vol-pct");
const volIcon      = document.getElementById("vol-icon");
const npTitle      = document.getElementById("np-title");
const npArtist     = document.getElementById("np-artist");
const npThumb      = document.getElementById("np-thumb");
const searchInput  = document.getElementById("search");
const playlistEl   = document.getElementById("playlist");
const catBtns      = document.querySelectorAll(".cat-btn");
const totalCount   = document.getElementById("total-count");

// ============================================================
//  HELPERS
// ============================================================
function formatTime(secs) {
  if (isNaN(secs) || secs < 0) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function filteredTracks() {
  return TRACKS.filter(t => {
    const matchesCat    = activeCategory === "all" || t.category === activeCategory;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery) ||
                          t.artist.toLowerCase().includes(searchQuery);
    return matchesCat && matchesSearch;
  });
}

// ============================================================
//  RENDER PLAYLIST
// ============================================================
function renderPlaylist() {
  const tracks = filteredTracks();
  playlistEl.innerHTML = "";
  totalCount.textContent = tracks.length;

  if (tracks.length === 0) {
    playlistEl.innerHTML = `
      <div class="empty-state">
        <span>🕌</span>
        No tracks found — try a different search or category
      </div>`;
    return;
  }

  tracks.forEach((track, i) => {
    const isActive = (TRACKS.indexOf(track) === currentIndex);
    const row = document.createElement("div");
    row.className = "track-row" + (isActive ? " active" : "");
    row.setAttribute("data-index", i + 1);
    row.innerHTML = `
      <div class="track-name">
        <span class="play-indicator">${isActive && isPlaying ? "▶" : "♫"}</span>
        <span class="track-icon-sym">${track.icon}</span> ${track.title}
      </div>
      <div class="track-artist">${track.artist}</div>
      <div class="track-cat" data-cat="${track.category}">${capitalize(track.category)}</div>
      <div class="track-dur">${track.duration}</div>
    `;
    row.addEventListener("click", () => {
      const globalIdx = TRACKS.indexOf(track);
      playTrack(globalIdx);
    });
    playlistEl.appendChild(row);
  });
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ============================================================
//  PLAY A TRACK
// ============================================================
function playTrack(index) {
  if (index < 0 || index >= TRACKS.length) return;

  currentIndex = index;
  const track = TRACKS[currentIndex];

  // Set audio source
  audio.src = track.src;
  audio.volume = parseFloat(volumeSlider.value);
  audio.play().then(() => {
    isPlaying = true;
    updatePlayBtn();
    updateNowPlaying();
    renderPlaylist();
  }).catch(err => {
    console.warn("Playback error:", err);
  });
}

// ============================================================
//  PLAY / PAUSE TOGGLE
// ============================================================
function togglePlay() {
  if (currentIndex === -1) {
    // Nothing selected — play first visible track
    const first = filteredTracks()[0];
    if (first) playTrack(TRACKS.indexOf(first));
    return;
  }
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
  } else {
    audio.play();
    isPlaying = true;
  }
  updatePlayBtn();
  renderPlaylist();
}

function updatePlayBtn() {
  playBtn.textContent = isPlaying ? "⏸" : "▶";
}

// ============================================================
//  SKIP PREV / NEXT
// ============================================================
function skipNext() {
  const visible = filteredTracks();
  if (visible.length === 0) return;

  let nextGlobal;
  if (currentIndex === -1) {
    nextGlobal = TRACKS.indexOf(visible[0]);
  } else {
    // Find current in visible list
    const visIdx = visible.findIndex(t => TRACKS.indexOf(t) === currentIndex);
    const next   = (visIdx + 1) % visible.length;
    nextGlobal   = TRACKS.indexOf(visible[next]);
  }
  playTrack(nextGlobal);
}

function skipPrev() {
  const visible = filteredTracks();
  if (visible.length === 0) return;

  let prevGlobal;
  if (currentIndex === -1) {
    prevGlobal = TRACKS.indexOf(visible[visible.length - 1]);
  } else {
    const visIdx = visible.findIndex(t => TRACKS.indexOf(t) === currentIndex);
    const prev   = (visIdx - 1 + visible.length) % visible.length;
    prevGlobal   = TRACKS.indexOf(visible[prev]);
  }
  playTrack(prevGlobal);
}

// ============================================================
//  NOW PLAYING INFO
// ============================================================
function updateNowPlaying() {
  if (currentIndex === -1) {
    npTitle.textContent  = "Select a track";
    npArtist.textContent = "—";
    npThumb.textContent  = "◉";
    return;
  }
  const t = TRACKS[currentIndex];
  npTitle.textContent  = t.title;
  npArtist.textContent = t.artist;
  npThumb.textContent  = t.icon;
}

// ============================================================
//  PROGRESS BAR
// ============================================================
audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  progressFill.style.width  = pct + "%";
  progressThumb.style.left  = pct + "%";
  currentTime.textContent   = formatTime(audio.currentTime);
});

audio.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(audio.duration);
});

// Click on progress bar to seek
progressBar.addEventListener("click", (e) => {
  const rect = progressBar.getBoundingClientRect();
  const pct  = (e.clientX - rect.left) / rect.width;
  audio.currentTime = pct * audio.duration;
});

// Auto-play next track when current ends
audio.addEventListener("ended", () => {
  isPlaying = false;
  skipNext();
});

// ============================================================
//  VOLUME
// ============================================================
volumeSlider.addEventListener("input", () => {
  const vol = parseFloat(volumeSlider.value);
  audio.volume = vol;
  volPct.textContent = Math.round(vol * 100) + "%";
  volIcon.textContent = vol === 0 ? "×" : vol < 0.5 ? "◁" : "◀";
});

// Click volume icon to mute/unmute
let lastVol = 0.8;
volIcon.addEventListener("click", () => {
  if (audio.volume > 0) {
    lastVol = audio.volume;
    audio.volume = 0;
    volumeSlider.value = 0;
    volPct.textContent = "0%";
    volIcon.textContent = "×";
  } else {
    audio.volume = lastVol;
    volumeSlider.value = lastVol;
    volPct.textContent = Math.round(lastVol * 100) + "%";
    volIcon.textContent = "◀";
  }
});

// ============================================================
//  CATEGORY FILTER
// ============================================================
catBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    catBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeCategory = btn.getAttribute("data-cat");
    renderPlaylist();
  });
});

// ============================================================
//  SEARCH
// ============================================================
searchInput.addEventListener("input", () => {
  searchQuery = searchInput.value.trim().toLowerCase();
  renderPlaylist();
});

// ============================================================
//  BUTTON EVENTS
// ============================================================
playBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", skipNext);
prevBtn.addEventListener("click", skipPrev);

// ============================================================
//  KEYBOARD SHORTCUTS
// ============================================================
document.addEventListener("keydown", (e) => {
  if (e.target === searchInput) return; // don't interfere with typing
  if (e.code === "Space") { e.preventDefault(); togglePlay(); }
  if (e.code === "ArrowRight") skipNext();
  if (e.code === "ArrowLeft")  skipPrev();
});

// ============================================================
//  INIT
// ============================================================
renderPlaylist();
updateNowPlaying();
