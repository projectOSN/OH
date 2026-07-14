// ============================================================
// Forest Piano — Chord Game
// ============================================================
(function (F) {
  const songPicker = document.getElementById('songPicker');
  const gameStage = document.getElementById('gameStage');
  const gameResult = document.getElementById('gameResult');
  const restartBtn = document.getElementById('restartBtn');
  const hudScore = document.getElementById('hudScore');
  const hudCombo = document.getElementById('hudCombo');
  const hudAcc = document.getElementById('hudAcc');
  if (!songPicker || !gameStage) return;

  // Simplified triad voicings used for the game (facts about basic
  // harmony, not a note-for-note transcription of any recording).
  const CHORDS = {
    'Am':  ['A3','C4','E4'],
    'F':   ['F3','A3','C4'],
    'C':   ['C4','E4','G4'],
    'G':   ['G3','B3','D4'],
    'D':   ['D4','F#4','A4'],
    'A':   ['A3','C#4','E4'],
    'Bm':  ['B3','D4','F#4'],
    'F#m': ['F#3','A3','C#4'],
  };

  // Approximate, simplified chord loops for practice purposes.
  const SONGS = {
    faded: {
      title: 'Faded',
      bpm: 90,
      beatsPerChord: 4,
      progression: ['Am','F','C','G','Am','F','C','G','Am','F','C','G']
    },
    canon: {
      title: 'Canon Rock',
      bpm: 100,
      beatsPerChord: 2,
      progression: ['D','A','Bm','F#m','G','D','G','A','D','A','Bm','F#m','G','D','G','A']
    },
    gundul: {
      title: 'Gundul-Gundul Pacul',
      bpm: 96,
      beatsPerChord: 4,
      progression: ['C','F','C','G','C','F','G','C']
    }
  };

  function playChord(chordName){
    const tones = CHORDS[chordName];
    if (!tones) return;
    tones.forEach((nm, i) => F.audio.playOneShot(F.audio.noteFreq(nm), i * 0.015));
  }

  const TRAVEL = 2.2;      // seconds a tile takes to fall to the hit line
  const HIT_WINDOW = 0.32; // seconds of tolerance around the hit time

  let rafId = null;
  let currentSongKey = null;
  let events = [];
  let laneList = [];
  let startPerf = 0;
  let running = false;
  let score = 0, combo = 0, maxCombo = 0, hits = 0, misses = 0;

  function uniqueInOrder(arr){
    const seen = new Set(); const out = [];
    arr.forEach(x => { if (!seen.has(x)) { seen.add(x); out.push(x); } });
    return out;
  }

  function updateHud(){
    hudScore.textContent = score;
    hudCombo.textContent = combo;
    const total = hits + misses;
    hudAcc.textContent = (total ? Math.round((hits/total)*100) : 100) + '%';
  }

  function stopGame(){
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function buildGame(songKey){
    stopGame();
    currentSongKey = songKey;
    const song = SONGS[songKey];
    score = 0; combo = 0; maxCombo = 0; hits = 0; misses = 0;
    updateHud();
    gameResult.textContent = '';
    restartBtn.hidden = false;

    document.querySelectorAll('.song-btn').forEach(b => {
      b.classList.toggle('selected', b.dataset.song === songKey);
    });

    laneList = uniqueInOrder(song.progression);

    const dur = song.beatsPerChord * 60 / song.bpm;
    let cursor = 0;
    events = song.progression.map(chord => {
      const ev = { chord, hitTime: cursor + TRAVEL, spawnTime: cursor, judged: false, el: null };
      cursor += dur;
      return ev;
    });
    const songDuration = cursor + TRAVEL + 1.2;

    gameStage.innerHTML = '';
    const lanesEl = document.createElement('div');
    lanesEl.className = 'lanes';
    const laneTracks = {};
    laneList.forEach((chord, idx) => {
      const lane = document.createElement('div');
      lane.className = 'lane';

      const track = document.createElement('div');
      track.className = 'lane-track';
      const hitLine = document.createElement('div');
      hitLine.className = 'hit-line';
      track.appendChild(hitLine);
      lane.appendChild(track);
      laneTracks[chord] = track;

      const pad = document.createElement('button');
      pad.type = 'button';
      pad.className = 'lane-pad';
      pad.innerHTML = chord + '<small>tombol ' + (idx+1) + '</small>';
      pad.addEventListener('click', () => tryHit(idx));
      lane.appendChild(pad);

      lanesEl.appendChild(lane);
    });
    gameStage.appendChild(lanesEl);

    events.forEach(ev => {
      const tile = document.createElement('div');
      tile.className = 'tile';
      laneTracks[ev.chord].appendChild(tile);
      ev.el = tile;
    });

    running = true;
    startPerf = performance.now();

    function tick(now){
      if (!running) return;
      const t = (now - startPerf) / 1000;

      events.forEach(ev => {
        if (ev.judged) return;
        const progress = Math.max(0, Math.min(1, (t - ev.spawnTime) / TRAVEL));
        ev.el.style.top = (progress * 100) + '%';
        if (t > ev.hitTime + HIT_WINDOW) {
          judgeMiss(ev);
        }
      });

      if (t > songDuration) {
        endGame(song);
        return;
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
  }

  function judgeMiss(ev){
    ev.judged = true;
    ev.el.classList.add('missed');
    combo = 0;
    misses++;
    updateHud();
  }

  function tryHit(laneIdx){
    const chordName = laneList[laneIdx];
    playChord(chordName);

    const pads = gameStage.querySelectorAll('.lane-pad');
    if (pads[laneIdx]) {
      pads[laneIdx].classList.add('pressed');
      setTimeout(() => pads[laneIdx].classList.remove('pressed'), 120);
    }
    if (!running) return;

    const t = (performance.now() - startPerf) / 1000;
    const candidate = events.find(ev =>
      !ev.judged && ev.chord === chordName && Math.abs(t - ev.hitTime) <= HIT_WINDOW
    );
    if (candidate) {
      candidate.judged = true;
      candidate.el.classList.add('hit');
      const closeness = 1 - (Math.abs(t - candidate.hitTime) / HIT_WINDOW);
      score += Math.round(80 + closeness * 40);
      combo++;
      maxCombo = Math.max(maxCombo, combo);
      hits++;
      updateHud();
    }
  }

  function endGame(song){
    stopGame();
    const total = hits + misses;
    const acc = total ? Math.round((hits/total)*100) : 100;
    gameResult.textContent = 'Selesai memainkan "' + song.title + '" — Skor ' + score +
      ' • Akurasi ' + acc + '% • Kombo maksimum ' + maxCombo + '.';
  }

  songPicker.addEventListener('click', (e) => {
    const btn = e.target.closest('.song-btn');
    if (!btn) return;
    F.audio.ensureAudio();
    buildGame(btn.dataset.song);
  });

  restartBtn.addEventListener('click', () => {
    if (currentSongKey) buildGame(currentSongKey);
  });

  window.addEventListener('keydown', (e) => {
    if (!running) return;
    const idx = parseInt(e.key, 10) - 1;
    if (idx >= 0 && idx < laneList.length) tryHit(idx);
  });
})(window.Forest);
