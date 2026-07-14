// ============================================================
// Forest Piano — Forest Ambience
//
// Default: angin sintetis (noise + filter) dan nada-nada piano
// yang muncul acak (pentatonik), dibuat langsung lewat Web Audio,
// jadi tetap berbunyi walau belum ada file mp3 apa pun.
//
// Opsional: jika kamu upload musik instrumental (mp3) untuk salah
// satu instrumen di assets/audio/ (lihat nama file di audio-engine.js,
// properti sampleUrl), file itu otomatis dipakai sebagai musik latar
// selama instrumen itu dipilih di piringan hitam — menggantikan
// angin+nada acak. Kalau filenya belum ada, otomatis balik ke mode
// sintetis tanpa error.
// ============================================================
(function (F) {
  const AMBIENT_SCALE = ['C4','D4','E4','G4','A4','C5','D5','E5','G5'];
  const ambienceToggleBtn = document.getElementById('ambienceToggle');
  const ambientTrackEl = document.getElementById('ambientTrack');

  let ambienceOn = false;
  let ambientTimer = null;
  let windNodes = null;
  let usingTrack = false;
  let fadeRaf = null;

  function startWind(){
    if (windNodes) return;
    F.audio.ensureAudio();
    const audioCtx = F.audio.audioCtx;
    const bufferSize = 2 * audioCtx.sampleRate;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 500;
    filter.Q.value = 0.7;

    const windGain = audioCtx.createGain();
    windGain.gain.value = 0.05;

    const lfo = audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.06;
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 260;

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    noise.connect(filter);
    filter.connect(windGain);
    windGain.connect(F.audio.masterGain);

    noise.start();
    lfo.start();
    windNodes = { noise, lfo, filter, windGain };
  }

  function stopWind(){
    if (!windNodes) return;
    try { windNodes.noise.stop(); windNodes.lfo.stop(); } catch (e) {}
    windNodes = null;
  }

  function scheduleAmbientNote(){
    const note = AMBIENT_SCALE[Math.floor(Math.random() * AMBIENT_SCALE.length)];
    F.audio.makeVoice(F.audio.noteFreq(note), { peak: 0.11, decay: 2.4 + Math.random() * 1.6 });
    ambientTimer = setTimeout(scheduleAmbientNote, 2400 + Math.random() * 4200);
  }

  function fadeVolume(el, target, ms, done){
    if (fadeRaf) cancelAnimationFrame(fadeRaf);
    const start = el.volume;
    const t0 = performance.now();
    function step(now){
      const p = Math.min(1, (now - t0) / ms);
      el.volume = start + (target - start) * p;
      if (p < 1) {
        fadeRaf = requestAnimationFrame(step);
      } else if (done) {
        done();
      }
    }
    fadeRaf = requestAnimationFrame(step);
  }

  async function fileExists(url){
    try {
      const res = await fetch(url, { method: 'HEAD' });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  async function startAmbience(){
    F.audio.ensureAudio();
    if (ambienceOn) return;
    ambienceOn = true;
    setToggleLabel();

    const inst = F.audio.INSTRUMENTS[F.audio.currentInstrument];
    const trackUrl = inst && inst.sampleUrl;
    let started = false;

    if (trackUrl && ambientTrackEl) {
      const ok = await fileExists(trackUrl);
      if (ok && ambienceOn) {
        ambientTrackEl.src = trackUrl;
        ambientTrackEl.loop = true;
        ambientTrackEl.volume = 0;
        ambientTrackEl.play().then(() => {
          fadeVolume(ambientTrackEl, 0.4, 1200);
        }).catch(() => {});
        usingTrack = true;
        started = true;
      }
    }

    if (!started) {
      usingTrack = false;
      startWind();
      scheduleAmbientNote();
    }
  }

  function stopAmbience(){
    ambienceOn = false;
    setToggleLabel();
    if (ambientTimer) clearTimeout(ambientTimer);
    stopWind();
    if (usingTrack && ambientTrackEl && !ambientTrackEl.paused) {
      fadeVolume(ambientTrackEl, 0, 600, () => ambientTrackEl.pause());
    }
    usingTrack = false;
  }

  function setToggleLabel(){
    if (!ambienceToggleBtn) return;
    ambienceToggleBtn.textContent = ambienceOn ? '🌿 Suara Hutan: Nyala' : '🌙 Suara Hutan: Mati';
  }

  if (ambienceToggleBtn) {
    ambienceToggleBtn.addEventListener('click', () => {
      F.audio.ensureAudio();
      ambienceOn ? stopAmbience() : startAmbience();
    });
  }

  // When the vinyl instrument changes while ambience is playing,
  // restart it so the ambience track follows the new instrument.
  F.events.on('instrumentChange', () => {
    if (ambienceOn) {
      stopAmbience();
      startAmbience();
    }
  });

  F.ambience = { start: startAmbience, stop: stopAmbience };
})(window.Forest);
