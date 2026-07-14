// ============================================================
// Forest Piano — Team "Animated Testimonials"
// Terinspirasi dari komponen Animated Testimonials Aceternity
// (https://21st.dev/@aceternity/components/animated-testimonials),
// ditulis ulang dengan HTML/CSS/JS biasa (tanpa React/Framer Motion)
// supaya cocok dipakai di halaman statis ini.
// ============================================================
(function () {
  const mediaEl = document.getElementById('testiMedia');
  const roleEl = document.getElementById('testiRole');
  const nameEl = document.getElementById('testiName');
  const quoteEl = document.getElementById('testiQuote');
  const prevBtn = document.getElementById('testiPrev');
  const nextBtn = document.getElementById('testiNext');
  const dotsEl = document.getElementById('testiDots');
  if (!mediaEl) return;

  // Ganti "img" dengan foto staf asli kapan pun siap.
  // "quote" ditulis sebagai kutipan orang pertama, sesuai gaya "testimonial".
  const PROFILES = [
    { name:'Asisten Afdeling', role:'Pimpinan Afdeling',
      quote:'“Tugas saya memastikan seluruh operasional kebun berjalan sesuai target, mulai dari panen sampai perawatan tanaman.”',
      img:'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop' },
    { name:'Mandor 1', role:'Kepala Mandor',
      quote:'“Saya mengoordinasikan seluruh mandor lapangan supaya kerja di setiap blok berjalan selaras dan tepat waktu.”',
      img:'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop' },
    { name:'Mandor Panen 1', role:'Mandor Panen',
      quote:'“Saya memastikan setiap tandan yang dipanen sudah benar-benar matang, tidak kurang dan tidak lewat masak.”',
      img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop' },
    { name:'Mandor Panen 2', role:'Mandor Panen',
      quote:'“Rotasi panen di blok saya saya jaga ketat, supaya buah sampai ke pabrik dalam kondisi terbaik.”',
      img:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop' },
    { name:'Mandor Panen 3', role:'Mandor Panen',
      quote:'“Saya turun langsung mengecek hasil panen pemanen, memastikan tidak ada brondolan yang tertinggal.”',
      img:'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop' },
    { name:'Mandor Panen 4', role:'Mandor Panen',
      quote:'“Target panen harian selalu saya pantau, supaya capaian blok tetap sesuai rencana kerja.”',
      img:'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?q=80&w=800&auto=format&fit=crop' },
    { name:'Mandor Rawat 1', role:'Mandor Rawat',
      quote:'“Saya menjaga kebersihan piringan dan gawangan supaya tanaman tumbuh optimal.”',
      img:'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&auto=format&fit=crop' },
    { name:'Mandor Rawat 2', role:'Mandor Rawat',
      quote:'“Jadwal pemupukan di blok saya saya awasi ketat, dosis dan waktunya harus tepat.”',
      img:'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=800&auto=format&fit=crop' },
    { name:'Mandor Rawat 3', role:'Mandor Rawat',
      quote:'“Pengendalian gulma dan hama jadi perhatian utama saya setiap hari di lapangan.”',
      img:'https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=800&auto=format&fit=crop' },
    { name:'Mandor Rawat 4', role:'Mandor Rawat',
      quote:'“Kesehatan tanaman di blok saya adalah prioritas — makin terawat, makin baik hasil panennya.”',
      img:'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=800&auto=format&fit=crop' },
    { name:'Mandor Transport 1', role:'Mandor Transport',
      quote:'“Saya pastikan TBS sampai ke pabrik secepat mungkin, supaya mutu buahnya tetap terjaga.”',
      img:'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=800&auto=format&fit=crop' },
    { name:'Mandor Transport 2', role:'Mandor Transport',
      quote:'“Jadwal armada saya atur supaya tidak ada TBS yang menumpuk lama di TPH.”',
      img:'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop' },
    { name:'Mandor Transport 3', role:'Mandor Transport',
      quote:'“Kondisi jalan dan kendaraan angkut selalu saya cek, keselamatan kerja nomor satu.”',
      img:'https://images.unsplash.com/photo-1463453091185-61582044d556?q=80&w=800&auto=format&fit=crop' },
    { name:'Mandor Transport 4', role:'Mandor Transport',
      quote:'“Koordinasi dengan mandor panen saya jaga erat, supaya angkutan selalu siap saat buah turun.”',
      img:'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?q=80&w=800&auto=format&fit=crop' },
    { name:'Krani Afdeling', role:'Administrasi',
      quote:'“Semua catatan produksi dan administrasi harian afdeling saya kelola supaya datanya rapi dan akurat.”',
      img:'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=800&auto=format&fit=crop' },
  ];

  let activeIndex = 0;
  let autoplayTimer = null;
  const AUTOPLAY_MS = 5000;

  // Jarak melingkar terpendek antara dua indeks (untuk efek tumpukan foto)
  function circularOffset(i, active, total){
    let d = i - active;
    if (d > total / 2) d -= total;
    if (d < -total / 2) d += total;
    return d;
  }

  function buildMedia(){
    PROFILES.forEach((p, i) => {
      const img = document.createElement('img');
      img.src = p.img;
      img.alt = p.name;
      img.loading = 'lazy';
      img.dataset.index = i;
      img.addEventListener('error', () => {
        img.onerror = null;
        img.src = 'https://placehold.co/500x500/2a1d11/e8ddc4?text=Foto';
      });
      mediaEl.appendChild(img);
    });
  }

  function buildDots(){
    if (!dotsEl) return;
    PROFILES.forEach((p, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Lihat ' + p.name);
      dot.addEventListener('click', () => goTo(i, true));
      dotsEl.appendChild(dot);
    });
  }

  function updateMedia(){
    const total = PROFILES.length;
    const imgs = mediaEl.querySelectorAll('img');
    imgs.forEach((img) => {
      const i = parseInt(img.dataset.index, 10);
      const off = circularOffset(i, activeIndex, total);
      const abs = Math.abs(off);

      if (abs > 2) {
        img.style.opacity = '0';
        img.style.zIndex = '0';
        img.style.transform = 'translateX(0) scale(0.85) rotate(0deg)';
        return;
      }
      const sign = off === 0 ? 0 : (off > 0 ? 1 : -1);
      const scale = 1 - abs * 0.08;
      const translate = sign * abs * 10; // %
      const rotate = sign * abs * 6; // deg
      const opacity = abs === 0 ? 1 : (abs === 1 ? 0.65 : 0.35);

      img.style.zIndex = String(30 - abs);
      img.style.opacity = String(opacity);
      img.style.transform =
        'translateX(' + translate + '%) scale(' + scale + ') rotate(' + rotate + 'deg)';
    });
  }

  function retrigger(el){
    el.classList.remove('in');
    void el.offsetWidth; // paksa reflow supaya transisi mengulang
    el.classList.add('in');
  }

  function updateText(){
    const p = PROFILES[activeIndex];
    roleEl.textContent = p.role;
    nameEl.textContent = p.name;
    quoteEl.textContent = p.quote;
    retrigger(roleEl);
    retrigger(nameEl);
    retrigger(quoteEl);
  }

  function updateDots(){
    if (!dotsEl) return;
    dotsEl.querySelectorAll('.testi-dot').forEach((d, i) => {
      d.classList.toggle('active', i === activeIndex);
    });
  }

  function goTo(index, userTriggered){
    const total = PROFILES.length;
    activeIndex = ((index % total) + total) % total;
    updateMedia();
    updateText();
    updateDots();
    if (userTriggered) restartAutoplay();
  }

  function next(){ goTo(activeIndex + 1); }
  function prev(){ goTo(activeIndex - 1); }

  function restartAutoplay(){
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = setInterval(next, AUTOPLAY_MS);
  }

  if (nextBtn) nextBtn.addEventListener('click', () => { next(); restartAutoplay(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); restartAutoplay(); });

  const card = mediaEl.closest('.testimonial');
  if (card) {
    card.addEventListener('mouseenter', () => { if (autoplayTimer) clearInterval(autoplayTimer); });
    card.addEventListener('mouseleave', restartAutoplay);
  }

  buildMedia();
  buildDots();
  updateMedia();
  updateText();
  restartAutoplay();
})();
