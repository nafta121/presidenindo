# Presiden RI — Simulasi 5 Tahun (`v3.6.0` Modular TypeScript)

Pembangunan ulang (*clean-room modular architecture*) dari simulasi strategi pemerintahan **Presiden RI** dengan kesetaraan visual, mekanika, matematika, dataset, dan penyimpanan `localStorage` **100% identik** terhadap edisi `v3.6`.

## Arsitektur & Teknologi

- **Bundler & Dev Server:** Vite (`^8.3.6`), tanpa dependensi *runtime* eksternal (*zero runtime dependencies*).
- **Bahasa:** TypeScript ketat (`strict: true`, `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`).
- **Gaya Visual:** Vanilla CSS modular bertema *Kertas Nusantara* (`src/styles/`).
- **Interaksi DOM:** Delegasi *event* terpusat berbasis atribut `data-action` (`src/ui/eventsDelegation.ts`) tanpa polusi fungsi global `window.*` maupun atribut `onclick` *inline*.
- **Pengujian Otomatis:** Vitest + `jsdom` (`tests/parity.test.ts` & `tests/simulation.test.ts`).

## Struktur Direktori

```text
presidenindo/
├── index.html                  # Kerangka HTML & container #bg, #app, #toast
├── src/
│   ├── main.ts                 # Titik masuk aplikasi & instalasi delegasi event
│   ├── types/
│   │   └── game.ts             # Definisi tipe domain & state penyimpanan penuh
│   ├── styles/                 # 4 modul CSS berurutan sesuai kaskade Kertas Nusantara
│   │   ├── base.css
│   │   ├── components-v3.css
│   │   ├── theme-nusantara.css
│   │   └── features-v35-v36.css
│   ├── data/                   # 11 modul dataset statis tergabung (v3.0–v3.6)
│   │   ├── constants.ts        # Konstanta APBN, kursi DPR, & navigasi 18 panel
│   │   ├── parties.ts          # 8 partai, 5 latar presiden, 11 kursi menteri, nama prosedural
│   │   ├── programs.ts         # 19 program jangka panjang & milestone
│   │   ├── promises.ts         # 13 janji kampanye beserta fungsi evaluator progres
│   │   ├── policies.ts         # 38 kebijakan kuartalan, pemetaan menteri teknis, & bonus rutin
│   │   ├── events.ts           # 100 kejadian DN/LN/tindak lanjut beserta kategori & bobot
│   │   ├── markets.ts          # 8 komoditas strategis, kuota ekspor-impor, & 10 saham BUMN/swasta
│   │   ├── politics.ts         # 12 undang-undang DPR/Perppu/MK & reformasi TNI/Polri
│   │   ├── provincesAndTrips.ts# 38 provinsi, 17 isu daerah, 6 media, & 21 destinasi kunjungan
│   │   └── guide.ts            # 19 halaman panduan interaktif
│   ├── engine/                 # 12 modul mesin simulasi bebas siklus (acyclic DAG)
│   │   ├── utils.ts            # PRNG, format Rupiah/kurs, & helper sanitasi HTML
│   │   ├── store.ts            # State aplikasi, sapaan gender gz(), & localStorage
│   │   ├── stats.ts            # Kalkulasi koalisi, efek non-linear LN, wibawa, & skor akhir
│   │   ├── cabinet.ts          # Generator kabinet prosedural, biografi, & reshuffle
│   │   ├── mediaAndTrips.ts    # Mesin 38 provinsi, berita media, & kunjungan kerja
│   │   ├── market.ts           # Mesin komoditas, ekspor-impor, bursa saham/IHSG, & kurs USD/IDR
│   │   ├── fiscal.ts           # Mesin APBN, utang, suku bunga, & telaah Menteri Keuangan
│   │   ├── corruption.ts       # Mesin kasus korupsi bertahap, kasasi MA, & risiko bocor
│   │   ├── politicsV35.ts      # Mesin lobi partai, paripurna DPR, Perppu, MK, & TNI/Polri
│   │   ├── policiesAndPrograms.ts # Eksekusi kebijakan, program, & gerbang Menkeu
│   │   ├── migrations.ts       # Migrasi kompatibilitas mundur penuh (v3.0 → v3.6)
│   │   └── lifecycle.ts        # Siklus kuartal, Pilkada/Pemilu, & 8 kondisi Game Over
│   ├── rendering/              # Generator grafis deterministik & animasi
│   │   ├── avatar.ts           # Generator potret SVG prosedural 8 busana & aksesori
│   │   ├── charts.ts           # Sparkline SVG & visualisasi tren
│   │   ├── effects.ts          # Animasi count-up, typewriter Setneg, partikel, & confetti
│   │   └── shareCard.ts        # Generator kartu hasil <canvas> PNG 1080×1350
│   └── ui/                     # Lapisan tampilan deklaratif & 18 sub-panel
│       ├── hud.ts              # HUD indikator, bar kas/utang, ticker kurs/IHSG, & berita berjalan
│       ├── overlays.ts         # 11 modal interaktif (Panduan, Sumpah, Menkeu, Setneg, UU, dll.)
│       ├── render.ts           # Layar Awal, Layar Utama, & Layar Akhir Masa Jabatan
│       ├── eventsDelegation.ts # Delegasi klik & input berbasis data-action
│       └── panels/             # 18 sub-panel pemerintahan dalam 6 grup navigasi
└── tests/
    ├── parity.test.ts          # Uji kesetaraan data, rumus matematika, SVG, & CSS
    └── simulation.test.ts      # Uji DOM penuh, 18 sub-panel, migrasi save, & simulasi 20 kuartal
```

## Kompatibilitas Penyimpanan (`localStorage`)

Aplikasi ini menggunakan kunci penyimpanan yang sama persis:
- `presiden_ri_v3` — Menyimpan seluruh progres masa jabatan dan mendukung pemuatan ulang berkas *save* lama dari versi `v3.0` hingga `v3.6` melalui rantai migrasi otomatis (`ensure33` → `ensure36`).
- `presiden_ri_guide` — Menyimpan status penutupan panduan awal.

## Perintah Pengembangan

```bash
# Menjalankan server pengembangan lokal
npm run dev

# Memeriksa tipe TypeScript secara ketat
npm run typecheck

# Menjalankan seluruh rangkaian pengujian otomatis (Vitest)
npm test

# Membangun bundel produksi ke direktori dist/
npm run build
```
