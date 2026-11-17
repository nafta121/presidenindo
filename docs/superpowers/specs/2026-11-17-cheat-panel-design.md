# Desain Singkat: Panel Cheat & Debugging Melayang (`#cheat`)

**Tanggal:** 2026-11-17
**Ukuran Pekerjaan:** Perubahan kecil terisolasi (*small change*)

## 1. Tujuan & Alasan
Menyediakan alat bantu *debugging* dan pengujian skenario langsung di dalam aplikasi `presidenindo` tanpa mengganggu pengalaman pemain biasa atau merusak kesetaraan 100% dari tampilan, konstanta `NAV`/`SUBN`, maupun skema penyimpanan `presiden_ri_v3`.

## 2. Sasaran, Non-Sasaran, & Batasan
- **Sasaran:** Memungkinkan penguji memanipulasi seluruh indikator utama, kuota aksi kuartalan, lompatan kuartal/kejadian, koalisi DPR, pasar saham/kurs/komoditas, kasus korupsi/MK, *God Mode*, serta pemulihan dari *Game Over* secara *real-time* sambil tetap berinteraksi dengan layar permainan di belakangnya.
- **Non-Sasaran:** Bukan fitur *gameplay* permanen untuk pemain umum dan tidak mengubah aturan matematika simulasi ketika tidak digunakan.
- **Anti-Sasaran (Kegagalan Desain):** Panel menutupi navigasi bawah `.xnav` di layar sempit tanpa bisa diciutkan, mengubah hasil `tests/parity.test.ts`, atau meninggalkan *cheat* terbuka secara bawaan saat halaman pertama kali dibuka.

## 3. Pendekatan yang Dipertimbangkan & Dipilih
1. **Modal Overlay Bertab via `overlays()`** — Mudah disatukan dengan modal lain, tetapi memblokir interaksi langsung dengan layar permainan di belakangnya.
2. **Panel Melayang (*Floating Mini-Drawer*) di Luar `#app` *(Dipilih oleh Pengguna)*** — Dirender pada container khusus `#cheat` di `index.html` yang tersinkronisasi setiap kali `renderApp()` dipanggil. Memiliki mode **ciut (*minimized pill* `🛠️`)** dan mode **terbuka (*compact tabbed drawer*)** agar tetap nyaman di layar *mobile* maupun *desktop* tanpa menghalangi `.xnav` atau tombol kejadian.
3. **Sub-Tab ke-19 di Menu `Lainnya`** — Ditolak karena mengubah konstanta `NAV`/`SUBN` dan tidak dapat diakses pada layar *Game Over* / *End Screen*.

## 4. Spesifikasi Teknis & Perilaku
1. **Pemicu Rahasia (5x Ketuk Avatar Presiden):**
   - Menambahkan pembungkus pemicu `data-action="tapPresAvatar"` pada avatar Presiden di `hudHTML()` (`src/ui/hud.ts`) dan `endHTML()` (`src/ui/render.ts`).
   - Mengetuk **5 kali dalam jendela `2.000 ms`** mengaktifkan `store.cheatOpen = true` (`store.cheatMin = false`) dengan notifikasi `toast('🛠️ Panel Debug aktif')`. Ketuk 5x lagi atau klik tombol tutup `✕` menyembunyikan panel sepenuhnya; tombol `—` menciutkannya menjadi pil melayang kecil `🛠️ Debug`.
2. **Sinkronisasi DOM di Luar `#app`:**
   - Menambahkan `<div id="cheat"></div>` di `index.html` (sejajar dengan `#bg`, `#app`, `#toast`), dipasang delegasi klik/perubahan di `bootApp()` (`src/main.ts`), dan diperbarui otomatis di akhir `renderApp()` (`src/ui/render.ts`) — tetapi **tanpa mengubah nilai `input`/`select` yang sedang difokuskan** bila pengguna sedang mengetik.
3. **4 Tab Ringkas di Dalam Laci `#cheat`:**
   - **`Stat`:** Toggle **God Mode (Kebal Game Over)** (`store.godMode`, dicek di awal `checkOver()`), tombol cepat & kontrol presisi untuk `rak`, `eko`, `kas` (`+Rp 100 T`, `Maks Rp 800 T`, `Kritis Rp 8 T`), `hrg`, `stb`, `utg` (`Lunas Rp 0`, `+Rp 1.000 T`), dan `ipk`, ditambah tombol **Segarkan Semua Kuota Kuartal Ini** (`usedPol`, `usedResh`, `usedTrip`, `usedLaw`, `fxUsed`, `slots`, `td.chg`, `ap.act`, `pvAct`, `res`).
   - **`Kuartal`:** Lompat ke kuartal mana pun (`Q1`–`Q20`, termasuk pintasan langsung ke **Pilkada I `Q7`**, **Pilkada II `Q15`**, **Pemilu `Q19`**), pilih & paksa kejadian spesifik (`#0`–`#99` dari `EV`) ke antrean saat ini, lewati semua modal antrean (`oath`, `alert`, `qrep`, `modal`, `fxAlert`), atau langsung picu layar **Tamat 20 Kuartal** / **Bangkit dari Game Over**.
   - **`Politik & Pasar`:** Koalisi DPR 100% (semua 8 partai masuk koalisi & kepuasan `95` + `recalc()`), Oposisi Total (uji krisis parlemen), Kompetensi & Integritas Kabinet `5★`, Selesaikan Semua `19` Program (`100%`), Kurs USD (`Rp 14.500` Menguat / `Rp 16.200` Stabil / `Rp 18.500` Krisis + picu `fxAlert`), Guncang IHSG (`+10%` / `-12%`), Penuhi Stok Komoditas (`+5` semua item), Munculkan Kasus Korupsi baru (`spawnCase`), dan Munculkan Gugatan MK.
   - **`Save`:** Salin JSON `store.S` ke *clipboard*, impor/timpa JSON `store.S` secara langsung (dengan validasi & migrasi `ensure33`), atau hapus bersih `localStorage`.
4. **Berkas yang Disentuh / Dibuat:**
   - Baru: `src/engine/cheat.ts`, `src/ui/cheatDrawer.ts`, `src/styles/cheat.css`, `tests/cheat.test.ts`.
   - Diperbarui ringan: `index.html`, `src/main.ts`, `src/engine/store.ts`, `src/engine/stats.ts` (`checkOver` menghormati `store.godMode`), `src/ui/hud.ts`, `src/ui/render.ts`, `src/ui/eventsDelegation.ts`.
