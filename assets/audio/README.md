# Folder musik instrumen (opsional)

Folder ini boleh kosong — situs tetap jalan normal dengan suara sintesis
bawaan (dibuat langsung oleh browser, tanpa file apa pun).

Kalau kamu punya musik instrumental (mp3) yang ingin dipakai sebagai suara
latar hutan untuk instrumen tertentu, upload dengan **nama persis** berikut:

| Instrumen (di piringan hitam) | Nama file yang dicari |
|---|---|
| Piano Akar   | `piano.mp3`    |
| Kotak Musik  | `musicbox.mp3` |
| Organ Akar   | `organ.mp3`    |
| Harpa Duri   | `harpa.mp3`    |

Cara kerja:
- Saat tombol "Suara Hutan" dinyalakan, situs akan mengecek apakah file
  dengan nama di atas ada di folder ini (sesuai instrumen yang sedang
  dipilih di piringan hitam).
- Kalau ada → file itu diputar berulang (loop) sebagai musik latar.
- Kalau belum ada → otomatis kembali ke suara angin + nada piano acak
  bawaan, tidak ada error yang muncul ke pengunjung.

Catatan: fitur cek file ini pakai `fetch()`, yang butuh situs diakses lewat
server (misalnya GitHub Pages) — kalau dibuka langsung dari file di
komputer (`file://...`), pengecekan bisa gagal dan situs akan otomatis
memakai suara sintesis bawaan.
