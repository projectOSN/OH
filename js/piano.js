// ============================================================
// Forest Piano — Piano Keys
// ============================================================
(function (F) {
  const WHITE_NOTES = [
    { note:'C4', freq:261.63, key:'a' },
    { note:'D4', freq:293.66, key:'s' },
    { note:'E4', freq:329.63, key:'d' },
    { note:'F4', freq:349.23, key:'f' },
    { note:'G4', freq:392.00, key:'g' },
    { note:'A4', freq:440.00, key:'h' },
    { note:'B4', freq:493.88, key:'j' },
    { note:'C5', freq:523.25, key:'k' },
    { note:'D5', freq:587.33, key:'l' },
    { note:'E5', freq:659.25, key:';' },
    { note:'F5', freq:698.46, key:"'" },
  ];
  // 'after' = index of white note this black key sits right after
  const BLACK_NOTES = [
    { note:'C#4', freq:277.18, key:'w', after:0 },
    { note:'D#4', freq:311.13, key:'e', after:1 },
    { note:'F#4', freq:369.99, key:'t', after:3 },
    { note:'G#4', freq:415.30, key:'y', after:4 },
    { note:'A#4', freq:466.16, key:'u', after:5 },
    { note:'C#5', freq:554.37, key:'o', after:7 },
    { note:'D#5', freq:622.25, key:'p', after:8 },
  ];

  const whiteContainer = document.getElementById('whiteKeys');
  const blackContainer = document.getElementById('blackKeys');
  const thornRow = document.getElementById('thornRow');
  if (!whiteContainer || !blackContainer) return;

  const keyLookup = {}; // computer key -> {note, freq, el}

  WHITE_NOTES.forEach(n => {
    const btn = document.createElement('button');
    btn.className = 'key white';
    btn.type = 'button';
    btn.dataset.note = n.note;
    btn.dataset.freq = n.freq;
    btn.setAttribute('aria-label', 'Nada ' + n.note);
    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = n.key.toUpperCase();
    btn.appendChild(label);
    whiteContainer.appendChild(btn);
    keyLookup[n.key] = { note:n.note, freq:n.freq, el:btn };
  });

  const whiteWidthPct = 100 / WHITE_NOTES.length;
  const blackWidthPct = whiteWidthPct * 0.62;
  BLACK_NOTES.forEach(n => {
    const btn = document.createElement('button');
    btn.className = 'key black';
    btn.type = 'button';
    btn.dataset.note = n.note;
    btn.dataset.freq = n.freq;
    btn.setAttribute('aria-label', 'Nada ' + n.note);
    const leftPct = (n.after + 1) * whiteWidthPct - (blackWidthPct / 2);
    btn.style.left = leftPct + '%';
    btn.style.width = blackWidthPct + '%';
    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = n.key.toUpperCase();
    btn.appendChild(label);
    blackContainer.appendChild(btn);
    keyLookup[n.key] = { note:n.note, freq:n.freq, el:btn };
  });

  // Decorative thorns along the top edge of the piano frame
  if (thornRow) {
    const THORN_COUNT = 18;
    for (let i = 0; i < THORN_COUNT; i++) {
      const t = document.createElement('i');
      const h = 14 + Math.round(8 * Math.abs(Math.sin(i * 1.7)));
      const rot = (Math.sin(i * 2.3) * 6).toFixed(1);
      t.style.borderBottomWidth = h + 'px';
      t.style.transform = 'rotate(' + rot + 'deg)';
      thornRow.appendChild(t);
    }
  }

  let pointerDown = false;
  document.addEventListener('pointerdown', () => { pointerDown = true; });
  document.addEventListener('pointerup', () => { pointerDown = false; });
  document.addEventListener('pointercancel', () => { pointerDown = false; });

  function bindKeyEl(el){
    const note = el.dataset.note;
    const freq = parseFloat(el.dataset.freq);

    const start = (e) => {
      e.preventDefault();
      pointerDown = true;
      F.audio.noteOn(note, freq);
      el.classList.add('active');
    };
    const stop = () => {
      F.audio.noteOff(note);
      el.classList.remove('active');
    };

    el.addEventListener('pointerdown', start);
    el.addEventListener('pointerup', stop);
    el.addEventListener('pointerleave', stop);
    el.addEventListener('pointercancel', stop);
    el.addEventListener('pointerenter', (e) => {
      if (pointerDown && e.buttons === 1) {
        F.audio.noteOn(note, freq);
        el.classList.add('active');
      }
    });
  }

  document.querySelectorAll('.key').forEach(bindKeyEl);

  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    const k = keyLookup[e.key.toLowerCase()];
    if (!k) return;
    F.audio.noteOn(k.note, k.freq);
    k.el.classList.add('active');
  });

  window.addEventListener('keyup', (e) => {
    const k = keyLookup[e.key.toLowerCase()];
    if (!k) return;
    F.audio.noteOff(k.note);
    k.el.classList.remove('active');
  });

  window.addEventListener('blur', () => {
    document.querySelectorAll('.key.active').forEach(el => el.classList.remove('active'));
  });

  F.piano = { keyLookup, WHITE_NOTES, BLACK_NOTES };
})(window.Forest);
