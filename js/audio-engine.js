// ============================================================
// Forest Piano — Audio Engine
// Mesin suara dasar. File lain (piano.js, game.js, ambience.js,
// vinyl.js) memakai window.Forest.audio yang diekspos di sini.
// ============================================================
window.Forest = window.Forest || {};

(function (F) {
  let audioCtx = null;
  let masterGain = null;
  let delayNode = null;
  const activeNotes = new Map();

  // Preset timbre. "shotDecay" dipakai untuk nada pendek (game/ambience),
  // "attack/decayTo/release" dipakai untuk nada yang ditahan (tuts piano).
  // sampleUrl = file mp3 opsional untuk instrumen ini (lihat ambience.js).
  const INSTRUMENTS = {
    piano:    { label:'Piano Akar',   wave1:'triangle', wave2:'sine',     sub:0.35, attack:0.012, decayTo:0.24, release:0.40, shotDecay:0.9,  sampleUrl:'assets/audio/piano.mp3'    },
    musicbox: { label:'Kotak Musik',  wave1:'sine',     wave2:'triangle', sub:0.18, attack:0.004, decayTo:0.16, release:0.55, shotDecay:1.3,  sampleUrl:'assets/audio/musicbox.mp3'  },
    organ:    { label:'Organ Akar',   wave1:'square',   wave2:'sine',     sub:0.40, attack:0.02,  decayTo:0.32, release:0.16, shotDecay:1.1,  sampleUrl:'assets/audio/organ.mp3'     },
    harpa:    { label:'Harpa Duri',   wave1:'triangle', wave2:'triangle', sub:0.22, attack:0.002, decayTo:0.05, release:0.12, shotDecay:0.55, sampleUrl:'assets/audio/harpa.mp3'     },
  };
  const INSTRUMENT_KEYS = Object.keys(INSTRUMENTS);
  let instIndex = 0;
  let currentInstrument = INSTRUMENT_KEYS[0];

  // Small pub/sub so modules can react to instrument changes
  // without needing to import each other directly.
  const listeners = {};
  const events = {
    on(name, fn){ (listeners[name] = listeners[name] || []).push(fn); },
    emit(name, payload){ (listeners[name] || []).forEach(fn => fn(payload)); }
  };

  function ensureAudio(){
    if (audioCtx) {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      return;
    }
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.9;

    delayNode = audioCtx.createDelay(1.0);
    delayNode.delayTime.value = 0.22;
    const feedback = audioCtx.createGain();
    feedback.gain.value = 0.16;
    const delayWet = audioCtx.createGain();
    delayWet.gain.value = 0.18;

    masterGain.connect(delayNode);
    delayNode.connect(feedback);
    feedback.connect(delayNode);
    delayNode.connect(delayWet);
    delayWet.connect(audioCtx.destination);
    masterGain.connect(audioCtx.destination);
  }

  const SEMITONES = { C:0,'C#':1,D:2,'D#':3,E:4,F:5,'F#':6,G:7,'G#':8,A:9,'A#':10,B:11 };
  function noteFreq(name){
    const m = name.match(/^([A-G]#?)(\d)$/);
    const midi = (parseInt(m[2], 10) + 1) * 12 + SEMITONES[m[1]];
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function noteOn(noteName, freq){
    if (!freq || activeNotes.has(noteName)) return;
    ensureAudio();
    const inst = INSTRUMENTS[currentInstrument];
    const now = audioCtx.currentTime;

    const noteGain = audioCtx.createGain();
    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(0.5, now + inst.attack);
    noteGain.gain.exponentialRampToValueAtTime(inst.decayTo, now + inst.attack + 0.16);

    const osc1 = audioCtx.createOscillator();
    osc1.type = inst.wave1;
    osc1.frequency.value = freq;

    const osc2 = audioCtx.createOscillator();
    osc2.type = inst.wave2;
    osc2.frequency.value = freq / 2;
    const osc2Gain = audioCtx.createGain();
    osc2Gain.gain.value = inst.sub;

    osc1.connect(noteGain);
    osc2.connect(osc2Gain);
    osc2Gain.connect(noteGain);
    noteGain.connect(masterGain);

    osc1.start(now);
    osc2.start(now);

    activeNotes.set(noteName, { osc1, osc2, gain:noteGain, release:inst.release });
  }

  function noteOff(noteName){
    const n = activeNotes.get(noteName);
    if (!n) return;
    const now = audioCtx.currentTime;
    const rel = n.release || 0.4;
    n.gain.gain.cancelScheduledValues(now);
    n.gain.gain.setValueAtTime(Math.max(n.gain.gain.value, 0.0001), now);
    n.gain.gain.exponentialRampToValueAtTime(0.0001, now + rel);
    n.osc1.stop(now + rel + 0.02);
    n.osc2.stop(now + rel + 0.02);
    activeNotes.delete(noteName);
  }

  // Generic short synth voice, used by the chord game and the
  // ambience generator (a single pluck/bell/etc, not held down).
  function makeVoice(freq, opts){
    opts = opts || {};
    ensureAudio();
    const inst = INSTRUMENTS[currentInstrument];
    const t0 = audioCtx.currentTime + (opts.delay || 0);
    const peak = opts.peak != null ? opts.peak : 0.35;
    const decay = opts.decay != null ? opts.decay : inst.shotDecay;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + inst.attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + decay);
    const o1 = audioCtx.createOscillator(); o1.type = inst.wave1; o1.frequency.value = freq;
    const o2 = audioCtx.createOscillator(); o2.type = inst.wave2; o2.frequency.value = freq / 2;
    const g2 = audioCtx.createGain(); g2.gain.value = inst.sub;
    o1.connect(g); o2.connect(g2); g2.connect(g);
    g.connect(masterGain);
    o1.start(t0); o2.start(t0);
    o1.stop(t0 + decay + 0.05); o2.stop(t0 + decay + 0.05);
  }

  function playOneShot(freq, delay){
    makeVoice(freq, { delay: delay, peak: 0.35 });
  }

  function setInstrument(idx){
    instIndex = ((idx % INSTRUMENT_KEYS.length) + INSTRUMENT_KEYS.length) % INSTRUMENT_KEYS.length;
    currentInstrument = INSTRUMENT_KEYS[instIndex];
    events.emit('instrumentChange', currentInstrument);
    return currentInstrument;
  }

  F.events = events;
  F.audio = {
    ensureAudio, noteFreq, noteOn, noteOff, makeVoice, playOneShot, setInstrument,
    get audioCtx(){ return audioCtx; },
    get masterGain(){ return masterGain; },
    get currentInstrument(){ return currentInstrument; },
    get instIndex(){ return instIndex; },
    INSTRUMENTS, INSTRUMENT_KEYS,
  };
})(window.Forest);
