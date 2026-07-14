// ============================================================
// Forest Piano — Main / Bootstrap
// ============================================================
(function (F) {
  // ---------- Background thorn vines ----------
  // Daftar gambar duri yang dipakai untuk 4 posisi dekorasi di layar
  // (kiri-bawah, kanan-bawah, kiri-atas, kanan-atas). Baru ada satu
  // file bawaan (spike1.png). KALAU kamu upload gambar duri tambahan,
  // simpan sebagai assets/images/spike2.png, spike3.png, dst, lalu
  // tambahkan baris di array ini — posisi akan otomatis dibagi rata
  // (bergantian) di antara semua gambar yang terdaftar.
  const SPIKE_IMAGES = [
    'assets/images/spike1.png',
    // 'assets/images/spike2.png',
    // 'assets/images/spike3.png',
  ];

  document.querySelectorAll('.spike').forEach((el, i) => {
    el.src = SPIKE_IMAGES[i % SPIKE_IMAGES.length];
  });

  // ---------- Entrance overlay ----------
  const enterOverlay = document.getElementById('enterOverlay');
  const enterBtn = document.getElementById('enterBtn');
  if (enterBtn && enterOverlay) {
    enterBtn.addEventListener('click', () => {
      F.audio.ensureAudio();
      F.ambience.start();
      enterOverlay.classList.add('hidden');
      setTimeout(() => enterOverlay.remove(), 900);
    });
  }
})(window.Forest);
