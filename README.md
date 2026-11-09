# AksiWarga
Platform Smart City berbasis web untuk transparansi layanan publik, pemantauan SLA, dan pelaporan warga.

## Menjalankan aplikasi

Aplikasi memakai React UMD tanpa proses build dan server Node.js bawaan tanpa dependency tambahan. Dari direktori repository, jalankan:

```powershell
node server.js
```

Buka `http://127.0.0.1:3000`. Jangan gunakan Live Server atau membuka HTML dengan double-click untuk alur akun: keduanya tidak dapat mengakses API yang menulis data akun ke JSON.

## Akun pengguna

- Buat akun melalui `react/sign_up.html`. Nama, email, dan hash kata sandi disimpan di `data/accounts.json`; kata sandi tidak disimpan dalam teks biasa.
- Login melalui `react/login.html` memverifikasi akun tersebut. Sesi server dipakai untuk menampilkan nama akun di navbar dan bertahan setelah halaman dimuat ulang.
- Sesi disimpan dalam memori server, jadi seluruh sesi berakhir ketika server dimulai ulang. Berkas akun tetap tersimpan.
- `react/auth-context.js` memuat sesi dari API, sedangkan `react/protected-route.js` membatasi rute yang perlu login.
- Tombol **Sign in** mengarah ke halaman login. Pendaftaran otomatis membuat sesi dan mengarahkan pengguna ke beranda.
- Menu hamburger berisi empat navigasi utama (Laporan, Peta, Statistik, FAQ) dengan tautan turunan seperti Buat Laporan, Cek Laporan, dan Transparansi Anggaran.

Server ini ditujukan untuk pengembangan lokal, bukan deployment produksi.
