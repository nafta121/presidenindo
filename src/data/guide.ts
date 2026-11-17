import type { GuidePage } from '../types/game';

export const GUIDE_P: GuidePage[] = [
  {
    ic: '🎯',
    t: 'Tujuanmu',
    b: `<p>Kamu jadi <b>Presiden RI</b>. Masa jabatan <b>5 tahun = 20 kuartal</b>. Tiap kuartal ada kejadian yang harus kamu putuskan.</p>
<p>Targetmu: <b>selesaikan 20 kuartal tanpa Game Over</b>, tepati janji kampanye, dan menangkan Pemilu lewat penerusmu.</p>
<p><b>Game Over</b> kalau: Kas ≤ 0, Rakyat/Ekonomi/Stabilitas/DPR ≤ 8, Harga ≥ 96, atau Utang ≥ 100.</p>`,
  },
  {
    ic: '🔁',
    t: 'Alur tiap kuartal',
    b: `<p><b>1.</b> Muncul bubble 🚨 kejadian → pilih satu jawaban. Efek tiap jawaban <i>tidak ditampilkan dulu</i>, jadi pakai insting dan saran penasihat.</p>
<p><b>2.</b> Opsional sebelum tutup kuartal: tetapkan <b>Kebijakan</b>, danai <b>Program</b>, <b>Lobi partai</b>, reshuffle menteri, atau sikapi <b>Kasus</b>.</p>
<p><b>3.</b> Tekan <b>Tutup Kuartal →</b>. Waktu berjalan, angka bergeser sendiri, kuartal berikutnya mulai.</p>`,
  },
  {
    ic: '🏦',
    t: 'Kas, utang & pemasukan negara',
    b: `<p>Semua angka uang memakai <b>Rupiah</b>. <b>Kas</b> = uang tunai negara (miliar/triliun). <b>Utang</b> = total pinjaman negara.</p>
<p><b>Pemasukan</b> tiap kuartal datang dari: <b>pajak</b> (PPh, PPN), <b>bea & cukai</b>, dan <b>PNBP</b> (SDA, dividen BUMN). Besarnya mengikuti ekonomi. Kebijakan seperti Reformasi Pajak, Pajak Digital, dan Hilirisasi menambah pemasukan permanen.</p>
<p><b>Belanja wajib</b> (gaji ASN, bunga utang, subsidi, transfer daerah, pertahanan) selalu dipotong dulu. Rinciannya ada di tab <b>Kelola → Anggaran</b>.</p>
<p>Pemasukan tambahan lain: <b>penyitaan aset dan denda dari tersangka korupsi</b>, atau menarik utang baru. Kas ≤ Rp 0 = <b>Negara Bangkrut</b>.</p>`,
  },
  {
    ic: '🧾',
    t: 'Persetujuan Menteri Keuangan',
    b: `<p>Setiap <b>kebijakan</b> dan <b>pendanaan program</b> yang berbiaya besar harus diajukan ke <b>Menteri Keuangan</b>. Sebelum mengajukan, kamu melihat rincian anggaran, utang, dan kas yang tersisa.</p>
<p>Menkeu menolak kalau kas setelahnya di bawah <b>cadangan aman</b>, atau kalau utang sudah terlalu tinggi. Kalau menolak, kamu punya 3 pilihan:</p>
<p>🕊️ <b>Ikuti nasihat</b>: dibatalkan, pasar menilai disiplin fiskal (+1 Ekonomi).<br>🤝 <b>Terus berunding</b>: peluang berhasil bergantung dukungan DPR dan rakyat. Kalau berhasil, anggaran dipangkas 25%.<br>🔄 <b>Reshuffle Menkeu</b>: Menkeu dicopot dan kebijakan langsung jalan, tapi pasar kaget (−3 Ekonomi) dan partainya kesal.</p>
<p>Gaya memimpinmu (diplomatis atau otoriter) dicatat dan muncul di akhir permainan.</p>`,
  },
  {
    ic: '🔗',
    t: 'Persetujuan lintas kementerian',
    b: `<p>Kebijakan dan program punya <b>menteri teknis</b>. Contoh: Makan Bergizi → <b>Menteri Kesehatan</b>, Subsidi Pangan → <b>Menteri Pangan</b>, Hilirisasi → <b>Menteri Energi</b>.</p>
<p>Biaya <b>kecil</b> (di bawah Rp 64 T) langsung ditetapkan. Biaya <b>besar</b> atau yang menambah utang harus lewat jalur: <b>Setneg → menteri teknis → Menkeu → Presiden</b>.</p>
<p>Menteri teknis yang kompeten membuat efek kebijakan lebih besar (sampai +15%). Menteri yang lemah membuat hasilnya di bawah target.</p>`,
  },
  {
    ic: '📨',
    t: 'Setneg, media & kunjungan kerja',
    b: `<p><b>Menteri Sekretaris Negara</b> menyusun semua laporan untuk Presiden: laporan keuangan, kejadian, akhir tahun, dan kunjungan kerja.</p>
<p>Tab <b>Lainnya → Media</b> berisi berita dari 5 media fiktif (pro-pemerintah, kritis, ekonomi, sampai netizen).</p>
<p>Tab <b>Lainnya → Kunjungan</b>: pilih kota atau negara tujuan, lihat rincian biaya perjalanan, lalu jadwalkan. Maksimal 1 kali per kuartal. Kunjungan luar negeri bisa membawa komitmen investasi, tapi mahal.</p>`,
  },
  {
    ic: '📈',
    t: 'Bursa komoditas',
    b: `<p>Tab <b>Bursa</b>: beli dan jual 8 komoditas (beras, sawit, nikel, emas, minyak, batu bara, gas, kopi). Harga naik-turun tiap kuartal.</p>
<p>Beli saat murah, jual saat mahal. Ada selisih beli/jual dan biaya gudang. Maksimal 4 transaksi per kuartal (dibagi dengan saham).</p>
<p>Stok <b>beras</b> menahan harga pangan, dan bisa dilepas lewat <b>Operasi pasar</b>. Menteri teknis yang kompeten memberi harga jual lebih baik.</p>`,
  },
  {
    ic: '📊',
    t: 'Saham, IHSG & kurs Rupiah',
    b: `<p>Tab <b>Bursa → Saham</b>: IHSG fiktif dan 10 emiten fiktif. Dana negara bisa membeli saham untuk dapat <b>dividen</b> tiap kuartal.</p>
<p>Tab <b>Bursa → Kurs</b>: kurs Rupiah/USD fiktif. Kalau ekonomi, kas, dan kepercayaan rakyat lemah, Rupiah melemah dan harga pangan ikut naik.</p>
<p>Saat Rupiah <b>tertekan</b> atau IHSG anjlok, muncul <b>peringatan</b>. Menkeu meminta arahanmu: intervensi valas, naikkan suku bunga, terbitkan SBN, atau konferensi pers.</p>`,
  },
  {
    ic: '📋',
    t: 'Kebijakan & Program',
    b: `<p><b>Kebijakan</b> (tab Kelola): 1 per kuartal, efek langsung, ada waktu tunggu sebelum bisa dipakai lagi.</p>
<p><b>Program</b>: proyek jangka panjang dengan bar progres. Danai tiap kuartal (maks 2 slot) sampai 100%. Tiap milestone memberi bonus, dan program yang jalan memberi manfaat tiap kuartal.</p>
<p>Menteri berintegritas rendah bikin dana program <b>bocor</b>.</p>`,
  },
  {
    ic: '🤝',
    t: 'DPR, koalisi & lobi partai',
    b: `<p>DPR punya <b>580 kursi</b> dari 8 partai fiktif. Awalnya 4 partai di <b>koalisi</b>-mu, 4 lainnya <b>oposisi</b>.</p>
<p><b>Dukungan DPR</b> = seberapa puas partai koalisimu × seberapa banyak kursimu. Kepuasan partai turun tiap kuartal. Kalau ≤ 22, partai bisa <b>hengkang</b> dan kursimu berkurang.</p>
<p><b>Lobi</b> = ngopi bareng ketua umum + bagi-bagi proyek: kepuasan <b>+12</b>, Kas <b>−Rp 24 T</b>.</p>
<p><b>Ajak Gabung</b>: oposisi yang kedekatannya ≥ 50 bisa diajak masuk koalisi, jadi kursimu nambah. Hanya 1 aksi partai per kuartal.</p>`,
  },
  {
    ic: '👔',
    t: 'Kabinet',
    b: `<p>11 menteri membantu mengurus negara (termasuk Mensesneg). Ketuk menteri untuk melihat profilnya. <b>★ Bintang</b> = kompetensi (membantu stat terkait). <b>🧼 Integritas</b> = bersih atau tidak.</p>
<p>Integritas rendah → rawan <b>kasus korupsi</b> dan dana program <b>bocor</b>. Menteri dari partai koalisi juga bikin partainya senang.</p>
<p><b>Reshuffle</b> hanya <b>1 menteri per kuartal</b>, dan kamu memilih penggantinya dari 3 kandidat.</p>`,
  },
  {
    ic: '⚖️',
    t: 'Kasus korupsi',
    b: `<p>Tiap kuartal bisa muncul kasus (semua fiktif). Saat tersangka ditetapkan, kamu harus bersikap:</p>
<p>⚖️ <b>Dukung proses hukum</b>: Integritas naik, partai pelaku kesal.<br>🤐 <b>Diam</b>: aman tapi biasa saja.<br>🛡️ <b>Lindungi</b>: partainya senang, tapi bisa kebongkar saat sidang dan merusak citramu.</p>
<p>Integritas tinggi membuat rakyat makin percaya.</p>`,
  },
  {
    ic: '🗳️',
    t: 'Agenda & janji',
    b: `<p>Cek tab <b>Agenda</b>: ada <b>Pilkada Serentak</b> (Tahun 2 dan 3) dan <b>Pemilu Serentak</b> (Tahun 5). Hasilnya dipengaruhi kepercayaan rakyat, ekonomi, dan dukungan DPR-mu.</p>
<p><b>Janji kampanye</b> (3 yang kamu pilih) dicek di akhir. Tiap janji yang ditepati menambah skor.</p>
<p>Tombol <b>❓</b> di pojok atas bisa dibuka kapan saja. Selamat memimpin, Presiden! 🇮🇩</p>`,
  },
  // v3.5 additions
  {
    ic: '🗺️',
    t: 'Peta 38 provinsi',
    b: `<p>Tab <b>Lainnya → Peta</b> menampilkan 38 provinsi nyata (Aceh sampai Papua Selatan) berbentuk kartogram. Warna = kepuasan warga. Tanda <b>!</b> = ada masalah (banjir, karhutla, harga pangan, dan lain-lain).</p><p>Ketuk provinsi untuk baca beritanya. Per kuartal ada <b>3 tindakan</b>: <b>kirim bantuan</b> (pakai kas, pasti beres), <b>tugaskan menteri teknis</b> (gratis, tergantung kompetensi), atau <b>kunjungi langsung</b> (memakai jatah kunjungan kerja). Masalah dibiarkan akan menurunkan kepuasan dan Rakyat. Semua kejadian fiktif.</p>`,
  },
  {
    ic: '🏛️',
    t: 'UU, DPR, MK & MA',
    b: `<p><b>Politik → UU & DPR</b>: ajukan revisi UU fiktif (1 per kuartal). DPR memutuskan lewat voting per fraksi, butuh lebih dari separuh kursi. Bisa <b>lobi fraksi</b> atau terbitkan <b>Perppu</b> (langsung berlaku, tapi DPR menilai kuartal depan, kalau ditolak wibawamu turun).</p><p>UU kontroversial bisa digugat ke <b>Mahkamah Konstitusi</b> dan dibatalkan. Kamu bisa melobi hakim, tetapi berisiko terbongkar. <b>Mahkamah Agung</b> memeriksa kasasi koruptor: vonis bisa ditolak, dikurangi, atau diperberat.</p>`,
  },
  {
    ic: '🪖',
    t: 'TNI & Polri',
    b: `<p><b>Politik → TNI/Polri</b>: jaga <b>loyalitas</b> dan <b>profesionalisme</b> Panglima dan Kapolri. Loyalitas rendah mengancam stabilitas, profesionalisme rendah memicu kasus oknum yang viral. Maksimal 2 tindakan per kuartal.</p>`,
  },
  {
    ic: '🔎',
    t: 'Korupsi detail',
    b: `<p>Tiap kasus ditangani <b>KPK, Kejaksaan, atau Polri</b>. Ketuk <b>Lihat detail kasus</b> untuk modus, aliran dana, barang bukti, saksi, tuntutan, dan kronologi. Kekuatan KPK ditentukan UU KPK. Kasus yang kamu lindungi bisa di-SP3 dan memicu kecurigaan publik.</p>`,
  },
  // v3.5.1 addition
  {
    ic: '🚢',
    t: 'Ekspor-Impor',
    b: `<p>Di <b>Bursa → Ekspor-Impor</b> kamu lihat <b>neraca perdagangan</b>: nilai ekspor dan impor tiap komoditas, negara tujuan/asal, dan bea yang masuk kas. Kamu bisa ubah kebijakan (maks 2 perubahan per kuartal): ekspor <b>buka / pajak / larang</b>, impor <b>buka / kuota / larang</b>.</p><p>Larang ekspor menahan harga dalam negeri tapi menekan ekonomi dan memancing protes mitra dagang. Impor beras dibuka menurunkan harga tapi petani kecewa. Larang impor minyak bikin BBM langka. Surplus perdagangan menguatkan Rupiah, defisit melemahkannya. Tab <b>Cuan</b> kini menampilkan untung/rugi stok yang belum dijual.</p>`,
  },
  // v3.6 addition
  {
    ic: '🏦',
    t: 'Dari mana kas negara?',
    b: `<p>Ketuk <b>kotak Kas</b> di atas, atau buka <b>Kelola → Kas & APBN</b>. Di sana ada rincian pemasukan rutin per kuartal (PPN, PPh, cukai, bea masuk, migas, minerba, dividen BUMN, bea ekspor), belanja wajib (gaji, bunga, subsidi, transfer daerah, pertahanan), dan uang tambahan dari keputusanmu.</p><p>Kas juga naik dari penyitaan koruptor dan harga komoditas yang tinggi (royalti). Kas turun karena kebijakan, program, bencana, dan kunjungan. Sekarang ada 38 kebijakan dan 19 program untuk dipilih.</p>`,
  },
];
