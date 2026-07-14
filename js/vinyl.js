// ============================================================
// Forest Piano — Vinyl Instrument Selector
// ============================================================
(function (F) {
  const vinylDisc = document.getElementById('vinylDisc');
  const vinylLabel = document.getElementById('vinylLabel');
  const prevInstBtn = document.getElementById('prevInst');
  const nextInstBtn = document.getElementById('nextInst');
  if (!vinylDisc) return;

  function setInstrument(idx){
    const key = F.audio.setInstrument(idx);
    if (vinylLabel) vinylLabel.textContent = F.audio.INSTRUMENTS[key].label;
    vinylDisc.classList.add('switching');
    setTimeout(() => vinylDisc.classList.remove('switching'), 500);

    F.audio.ensureAudio();
    F.audio.playOneShot(F.audio.noteFreq('C4'));
    F.audio.playOneShot(F.audio.noteFreq('E4'), 0.09);
    F.audio.playOneShot(F.audio.noteFreq('G4'), 0.18);
  }

  vinylDisc.addEventListener('click', () => setInstrument(F.audio.instIndex + 1));
  vinylDisc.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setInstrument(F.audio.instIndex + 1); }
  });
  if (prevInstBtn) prevInstBtn.addEventListener('click', () => setInstrument(F.audio.instIndex - 1));
  if (nextInstBtn) nextInstBtn.addEventListener('click', () => setInstrument(F.audio.instIndex + 1));
})(window.Forest);
