import type { EventCategory, EventChoiceTuple, GameEventTuple } from '../types/game';

function mkEv(
  cat: EventCategory,
  ic: string,
  title: string,
  desc: string,
  choices: EventChoiceTuple[],
  followUp?: string,
): GameEventTuple {
  const tuple: GameEventTuple =
    followUp !== undefined
      ? ([ic, title, desc, choices, followUp] as unknown as GameEventTuple)
      : ([ic, title, desc, choices] as unknown as GameEventTuple);
  tuple.cat = cat;
  return tuple;
}

const DN_INITIAL: GameEventTuple[] = [
  mkEv('dn', '🌶️', 'Harga Cabai Meroket', 'Cabai rawit tembus Rp100 ribu per kilo. Ibu-ibu curhat massal di media sosial.', [
    ['Operasi pasar besar-besaran', { hrg: -8, kas: -5, rak: 3 }, 'Antrean mengular, tapi harga turun. Emak-emak lega.'],
    ['Impor cabai', { hrg: -10, rak: -3 }, 'Harga turun, petani cabai demo di depan kantor bupati.', null, 'fu_petani'],
    ['Imbau rakyat tanam di polybag', { hrg: -1, rak: -4 }, 'Netizen langsung roasting habis-habisan.'],
  ]),
  mkEv('dn', '✊', 'Mahasiswa Turun ke Jalan', 'BEM dari puluhan kampus berkumpul di depan gedung DPR membawa tuntutan.', [
    ['Temui perwakilan mahasiswa', { rak: 4, stb: 2, kol: -3 }, 'Dialog berjalan adem. Anggota DPR kurang senang.'],
    ['Kerahkan aparat membubarkan', { stb: 4, rak: -8 }, 'Massa bubar, tapi videonya sudah trending.', { p: 0.3, f: { stb: -8, rak: -6 }, r: 'Bentrok pecah. Gas air mata di mana-mana, stabilitas goyah.' }, 'fu_mhs'],
    ['Biarkan, kirim juru bicara', { rak: -3, stb: -2 }, 'Juru bicara dihujat. Demo makin besar besok.'],
  ]),
  mkEv('dn', '🌊', 'Banjir Besar Pantura', 'Banjir rendam kota pesisir. Ribuan warga mengungsi, jalur pantura lumpuh.', [
    ['Turun langsung + dana darurat', { rak: 6, kas: -8, stb: 2 }, 'Presiden pakai sepatu bot di lokasi. Rakyat terharu.'],
    ['Serahkan ke pemda', { rak: -6, kol: -2 }, 'Dianggap lepas tangan. Kepala daerah protes.'],
    ['Proyek tanggul raksasa', { kas: -12, eko: 3, rak: 3 }, 'Mahal, tapi jangka panjang menjanjikan.'],
  ]),
  mkEv('dn', '💱', 'Rupiah Melemah', 'Rupiah menyentuh level terlemah dalam setahun. Investor asing menarik dana.', [
    ['BI intervensi, pakai cadangan devisa', { kas: -8, eko: 2 }, 'Pasar tenang sementara. Cadangan menipis.'],
    ['Naikkan suku bunga', { eko: -4, kas: 1, rak: -2 }, 'Rupiah menguat, tapi cicilan rakyat naik.'],
    ['Tarik utang, tenangkan pasar', { kas: 12, utg: 3 }, 'Pasar happy. Bunga utang yang akan menagih nanti.', null, 'fu_utang'],
  ]),
  mkEv('dn', '🧵', 'PHK Pabrik Tekstil', 'Ribuan buruh tekstil di-PHK. Pabrik tutup digempur barang impor murah.', [
    ['Bea masuk produk impor', { eko: 3, rak: 3, hrg: 3, kol: -2 }, 'Pabrik bertahan, harga baju naik sedikit.'],
    ['Pelatihan + subsidi upah', { rak: 3, kas: -7 }, 'Buruh lumayan terbantu, anggaran terkuras.'],
    ['Serahkan ke mekanisme pasar', { eko: -3, rak: -6, kas: 1 }, 'Pasar bekerja, rakyat tidak. Serikat buruh marah.'],
  ]),
  mkEv('dn', '🛵', 'Ojol Mogok Massal', 'Ribuan driver ojol matikan aplikasi. Tuntutan: tarif adil dan status pekerja.', [
    ['Atur tarif minimum', { rak: 5, eko: -2, kol: -1 }, 'Driver senang. Aplikator mengeluh soal tarif.'],
    ['Mediasi dengan aplikator', { rak: 2, stb: 2, kas: -2 }, 'Ada titik tengah, walau semua pihak setengah puas.'],
    ['Tolak tuntutan', { rak: -5, stb: -3 }, 'Jalanan Jakarta penuh jaket hijau. Hawanya panas.'],
  ]),
  mkEv('dn', '🕵️', 'Menteri Terjerat Korupsi', 'KPK menetapkan seorang menteri dari partai koalisi sebagai tersangka.', [
    ['Copot dan dukung proses hukum', { rak: 7, kol: -8, stb: 2 }, 'Rakyat angkat jempol. Partai koalisi menggerutu.'],
    ['Lindungi, asas praduga tak bersalah', { rak: -9, kol: 3 }, "Netizen: 'oh begitu ya'. Kepercayaan merosot."],
    ['Reshuffle diam-diam', { rak: -2, kol: -3, stb: 1 }, 'Dikira aman, tapi wartawan sudah tahu.'],
  ]),
  mkEv('dn', '🏚️', 'Gempa Bumi Sulawesi', 'Gempa M6,8 guncang Sulawesi. Ratusan rumah roboh dan jalan terputus.', [
    ['Bantuan darurat + rehabilitasi penuh', { rak: 6, kas: -10, stb: 3 }, 'Distribusi cepat, relawan berdatangan.'],
    ['Buka donasi nasional', { rak: 3, kas: -4, stb: 1 }, 'Rakyat bergotong royong. Pemerintah hemat anggaran.'],
    ['Bantuan seadanya', { rak: -7, stb: -3, kas: -2 }, 'Warga mengeluh bantuan lambat. Berita buruk menyebar.'],
  ]),
  mkEv('dn', '🌫️', 'Kabut Asap Karhutla', 'Asap tebal selimuti Sumatera dan Kalimantan. Negara tetangga protes keras.', [
    ['Water bombing + tindak perusahaan nakal', { rak: 4, kas: -6, eko: -2, kol: -3 }, 'Beberapa korporasi kena sanksi. Lobi mulai bekerja.'],
    ['Minta maaf diplomatis, bantuan terbatas', { rak: -3, stb: -2, kas: -2 }, 'Hujan belum turun, kabut tetap tebal.'],
    ['Cuek, nanti juga hujan', { rak: -6, eko: -2, stb: -2 }, 'Sekolah libur, rumah sakit penuh pasien ISPA.'],
  ]),
  mkEv('dn', '🚗', 'Mudik Lebaran', 'H-7 Lebaran, puluhan juta orang mudik. Tol macet parah dari Cikampek sampai Brebes.', [
    ['Gratiskan tol + contra-flow', { rak: 6, kas: -5, eko: 1 }, 'Arus mudik lancar. Foto Presiden cek jalur viral.'],
    ['Rekayasa lalu lintas biasa', { rak: 1 }, 'Macet, tapi dianggap wajar. Namanya juga mudik.'],
    ['Imbau WFA dan tunda mudik', { rak: -3, eko: 1 }, "Rakyat: 'kapan lagi kumpul sama keluarga, Pak?'"],
  ]),
  mkEv('dn', '🎰', 'Judi Online dan Pinjol', 'Judol dan pinjol jerat jutaan warga. Korban curhat ramai di medsos.', [
    ['Blokir massal + razia', { rak: 5, stb: 2, kas: -3, eko: -1 }, 'Ribuan situs diblokir. Rakyat apresiasi.'],
    ['Edukasi literasi keuangan', { rak: 2, kas: -3, eko: 1 }, 'Dampaknya pelan, tapi sehat.'],
    ['Fokus urusan lain dulu', { rak: -4, stb: -2 }, 'Kasus pinjol makin viral. Presiden dikira cuek.'],
  ]),
  mkEv('dn', '📦', 'Tarif Dagang Global', 'Mitra dagang besar naikkan tarif impor produk Indonesia. Eksportir panik.', [
    ['Negosiasi + buka pasar baru', { eko: 3, kas: -3, kol: -2 }, 'Diplomasi berhasil sebagian. Pasar baru menjanjikan.'],
    ['Balas dengan tarif', { eko: -4, hrg: 4, rak: 1 }, 'Gagah, tapi harga barang impor ikut naik.'],
    ['Insentif untuk eksportir', { eko: 3, kas: -7 }, 'Ekspor tetap jalan, kas sedikit bocor.'],
  ]),
  mkEv('dn', '🧑‍💼', 'Partai Minta Jatah Menteri', 'Ketua umum partai koalisi minta tambahan kursi di kabinet.', [
    ['Penuhi, kabinet makin gemuk', { kol: 10, kas: -4, rak: -3 }, "Koalisi aman. Publik menyindir kabinet 'gemoy'."],
    ['Tolak dengan halus', { kol: -6, stb: 1 }, 'Sang ketua umum mendadak sulit dihubungi.'],
    ['Tawarkan proyek daerah', { kol: 5, kas: -6 }, 'Semua pihak pulang tersenyum, APBN menangis.'],
  ]),
  mkEv('dn', '🏛️', 'Oposisi Gulirkan Hak Angket', 'Oposisi menggalang tanda tangan hak angket soal kebijakan pemerintah.', [
    ['Lobi fraksi + bagi proyek', { kol: 6, kas: -5, rak: -2 }, 'Angket padam di tengah jalan. Publik curiga.'],
    ['Hadapi terbuka di forum DPR', { kol: -2, rak: 4, stb: 1 }, 'Debat panas, tapi publik melihat Presiden berani.'],
    ['Abaikan', { kol: -6, stb: -3 }, 'Dukungan sebagian fraksi mulai goyah.'],
  ]),
  mkEv('dn', '👩‍🏫', 'Guru Honorer Demo', "Ribuan guru honorer menuntut diangkat jadi ASN. Spanduk bertuliskan 'Pahlawan Tanpa Tanda Jasa'.", [
    ['Angkat bertahap', { rak: 6, kas: -8, kol: 2 }, 'Guru bersorak. Kemenkeu pusing.'],
    ['Naikkan tunjangan', { rak: 3, kas: -4 }, 'Solusi tengah. Tuntutan utama belum selesai.'],
    ['Tolak, anggaran terbatas', { rak: -6, stb: -2, kas: 1 }, "Netizen: 'tapi untuk proyek lain ada duit'."],
  ]),
  mkEv('dn', '🍚', 'Harga Beras Pecah Rekor', 'Gagal panen akibat El Niño. Harga beras tembus rekor di seluruh pasar.', [
    ['Impor beras darurat', { hrg: -12, rak: -2, kas: -5 }, 'Harga turun. Petani kesal harga gabah ikut jatuh.', null, 'fu_petani'],
    ['Gelontorkan cadangan beras pemerintah', { hrg: -8, kas: -4, rak: 2 }, 'Bulog sigap. Stok cukup sampai panen berikutnya.'],
    ['Imbau diversifikasi pangan, makan singkong', { hrg: 2, rak: -7 }, 'Tagar #SingkongPresiden trending seminggu.'],
  ]),
  mkEv('dn', '⛏️', 'Investor Smelter Datang', 'Investor asing siap tanam Rp50 triliun untuk smelter, tapi minta keringanan pajak.', [
    ['Terima dengan tax holiday', { eko: 8, kas: -4, rak: -1, stb: -1 }, 'Pabrik dibangun, ribuan lapangan kerja terbuka.', null, 'fu_smelter'],
    ['Negosiasi syarat tenaga kerja lokal', { eko: 4, rak: 3, kas: -1 }, 'Kesepakatan berimbang tercapai.', { p: 0.3, f: { eko: -2 }, r: 'Investor tersinggung dan memilih negara lain.' }],
    ['Tolak', { eko: -2, rak: 2 }, 'Dibilang berdaulat. Investor pindah ke negara tetangga.'],
  ]),
  mkEv('dn', '📱', 'Pejabat Pamer Gaya Hidup', 'Video anak pejabat pamer mobil mewah viral. Tagar sindiran naik ke puncak trending.', [
    ['Tegur dan minta klarifikasi publik', { rak: 3, kol: -3, stb: 1 }, 'Klarifikasinya canggung, tapi publik menghargai.'],
    ['Terbitkan aturan hidup sederhana', { rak: 4, kol: -3 }, 'Jadi bahan meme, tapi niat baik terbaca.'],
    ['Anggap angin lalu', { rak: -5 }, 'Besoknya ada video kedua. Lebih parah.'],
  ]),
  mkEv('dn', '🕳️', 'Jalan Rusak Viral', 'Jalan berlubang di sebuah kabupaten viral di TikTok. Warga menanam pisang di tengah jalan.', [
    ['Anggarkan perbaikan segera', { rak: 5, kas: -6, eko: 1 }, 'Jalan mulus dalam dua minggu. Rakyat kaget.'],
    ['Salahkan pemda', { rak: -3, kol: -1 }, 'Bupati balas lewat media. Drama berlanjut.'],
    ['Kirim Menteri PU turun langsung', { rak: 3, kas: -3 }, 'Menteri main aspal sendiri. Fotonya viral.'],
  ]),
  mkEv('dn', '🌋', 'Gunung Api Erupsi', 'Erupsi besar di Jawa Timur. Ribuan warga harus segera dievakuasi.', [
    ['Evakuasi total + hunian sementara', { rak: 5, kas: -7, stb: 2 }, 'Nyawa terselamatkan. Respons dipuji.'],
    ['Evakuasi seperlunya', { rak: 1, kas: -3 }, 'Sebagian warga bertahan, kondisi tetap tegang.'],
    ['Percayakan ke BNPB', { rak: -2, kas: -1 }, 'BNPB bekerja keras, tapi publik ingin lihat Presiden hadir.'],
  ]),
  mkEv('dn', '⚽', 'Timnas Lolos Piala Dunia!', 'Garuda lolos ke Piala Dunia. Seluruh negeri euforia, warung kopi penuh nobar.', [
    ['Bonus besar untuk para pemain', { rak: 6, kas: -6, stb: 2 }, 'Pemain jadi pahlawan, rakyat bangga.'],
    ['Libur nasional sehari', { rak: 8, eko: -2 }, 'Seluruh Indonesia merayakan. Pengusaha sedikit mengeluh.'],
    ['Cukup pidato dan ucapan selamat', { rak: 3 }, 'Aman dan hemat. Rakyat berharap lebih.'],
  ]),
  mkEv('dn', '🛢️', 'Minyak Goreng Langka', 'Minyak goreng langka, antrean mengular di minimarket. Dugaan ada permainan mafia.', [
    ['Wajibkan DMO + pantau mafia', { hrg: -8, rak: 3, eko: -1, kol: -2 }, 'Stok kembali. Beberapa pengusaha besar kena tegur.'],
    ['Subsidi minyak goreng', { hrg: -6, kas: -6, rak: 2 }, 'Cepat tapi mahal. Mafia tetap ada.'],
    ['Serahkan ke pasar', { hrg: 4, rak: -6 }, 'Harga makin tinggi. Gorengan jadi barang mewah.'],
  ]),
  mkEv('dn', '✈️', 'Undangan KTT Internasional', 'Presiden diundang ke KTT besar. Ada kesempatan melobi investasi.', [
    ['Berangkat, bawa pulang MoU investasi', { eko: 5, kas: 2, rak: -1 }, 'MoU senilai miliaran dolar ditandatangani.'],
    ['Utus wakil presiden', { kol: 2, eko: 1 }, 'Aman, tapi hasilnya biasa saja.'],
    ['Batalkan, fokus urusan dalam negeri', { rak: 2, eko: -2 }, 'Rakyat senang, investor bertanya-tanya.'],
  ]),
  mkEv('dn', '⛽', 'BBM dan Subsidi Bengkak', 'Harga minyak dunia naik. Subsidi BBM membengkak dan kas hampir jebol.', [
    ['Naikkan harga BBM', { kas: 10, rak: -9, hrg: 6, stb: -3 }, 'Kas selamat. Demo kenaikan BBM pecah di banyak kota.', null, 'fu_bbm'],
    ['Tahan harga, tambah subsidi', { kas: -10, rak: 3 }, 'Rakyat tenang, Kemenkeu pucat.'],
    ['Batasi BBM bersubsidi', { kas: 5, rak: -4, stb: -1 }, 'Antrean SPBU makin panjang.'],
  ]),
  mkEv('dn', '🤼', 'Konflik Antar-kelompok', 'Konflik antar-kelompok pecah di sebuah daerah dan merembet ke media sosial.', [
    ['Tegas: aparat + dialog tokoh', { stb: 5, rak: -1, kas: -3 }, 'Situasi terkendali dalam beberapa hari.'],
    ['Pendekatan tokoh adat dan agama', { stb: 4, kas: -1, kol: 1 }, 'Damai lewat musyawarah. Pelan tapi kuat.'],
    ['Serahkan ke Polda setempat', { stb: -5, rak: -2 }, 'Isu terlanjur menyebar. Hoaks bikin runyam.'],
  ]),
  mkEv('dn', '🦄', 'Startup Lokal Jadi Unicorn', 'Startup anak bangsa tembus status unicorn. Pelaku ekonomi digital bersemangat.', [
    ['Dorong ekosistem digital', { eko: 4, kas: -4 }, 'Insentif disambut baik. Investor melirik.'],
    ['Pajaki lebih tinggi', { kas: 5, eko: -3 }, 'Kas terisi, founder pindah ke Singapura.'],
    ['Pamer di medsos saja', { rak: 2, eko: 1 }, 'Gratis dan cukup membanggakan.'],
  ]),
  mkEv('dn', '🧑‍🌾', 'Petani Tuntut Harga Gabah', 'Panen raya, harga gabah anjlok. Petani menumpuk gabah di depan kantor bupati.', [
    ['Naikkan HPP gabah', { rak: 4, kas: -6, hrg: 3 }, 'Petani sujud syukur. Harga beras ikut naik sedikit.'],
    ['Bulog serap gabah besar-besaran', { rak: 3, kas: -7 }, 'Gudang Bulog penuh, petani tenang.'],
    ['Biarkan pasar bekerja', { rak: -6, hrg: -2 }, 'Petani merugi. Tagar #PetaniMenjerit trending.'],
  ]),
  mkEv('dn', '🏝️', 'Bali Overtourism', 'Turis membludak, sampah dan macet di Bali makin parah. Warga lokal bersuara.', [
    ['Batasi kuota turis', { eko: -3, rak: 3 }, 'Pelaku wisata mengeluh, warga lokal tersenyum.'],
    ['Pajak wisatawan dinaikkan', { kas: 6, eko: -1 }, 'Kas bertambah, turis tetap datang.'],
    ['Biarkan, devisa itu penting', { eko: 3, rak: -4 }, 'Devisa mengalir, tapi warga makin kesal.'],
  ]),
  mkEv('dn', '📚', 'Kurikulum Baru Bikin Bingung', 'Guru dan orang tua mengeluh kurikulum baru terlalu sering berubah.', [
    ['Sosialisasi dan pelatihan guru', { rak: 3, kas: -4 }, 'Lebih paham, meski belum semua.'],
    ['Tarik kembali kurikulum', { rak: 1, kol: -2, kas: -2 }, 'Dibilang plin-plan, tapi banyak yang lega.'],
    ['Tetap jalan terus', { rak: -5, eko: 1 }, 'Grup WhatsApp wali murid ramai berdoa.'],
  ]),
  mkEv('dn', '🏥', 'BPJS Kesehatan Defisit', 'BPJS defisit triliunan rupiah. Antrean rumah sakit makin panjang.', [
    ['Naikkan iuran', { kas: 8, rak: -6 }, 'Kas BPJS aman. Warga mengeluh kantong menipis.'],
    ['Suntik dana APBN', { kas: -10, rak: 3 }, 'Layanan lancar, kas negara terkuras.'],
    ['Perketat layanan peserta', { kas: 4, rak: -8, stb: -2 }, 'Pasien ngamuk di media sosial.'],
  ]),
  mkEv('dn', '🔥', 'Pasar Tradisional Terbakar', 'Kebakaran besar melalap pasar tradisional. Ratusan pedagang kehilangan lapak.', [
    ['Bantu modal dan bangun ulang', { rak: 5, kas: -5, eko: 1 }, 'Pedagang terharu. Pasar baru lebih tertata.'],
    ['Relokasi ke pasar modern', { rak: 2, kas: -4, eko: 2 }, 'Pedagang pindah dengan campur aduk perasaan.'],
    ['Selidiki izin bangunan dulu', { rak: -3, stb: 1 }, 'Benar, tapi pedagang butuh makan sekarang.'],
  ]),
  mkEv('dn', '🎓', 'Lulusan Terbaik Kabur ke Luar Negeri', 'Gelombang lulusan terbaik memilih berkarier di luar negeri.', [
    ['Insentif pulang untuk diaspora', { eko: 3, kas: -5 }, 'Beberapa mulai pulang membawa ilmu.'],
    ['Beasiswa dengan ikatan dinas', { eko: 2, kas: -3, rak: 1 }, 'Pipeline talenta lokal terbangun.'],
    ['Anggap hal wajar', { eko: -2, rak: -2 }, "Netizen: 'terus kami harus bagaimana'."],
  ]),
  mkEv('dn', '🚆', 'Kereta Cepat Merugi', 'Proyek kereta cepat merugi dan minta suntikan dana dari negara.', [
    ['Suntik dana negara', { kas: -9, eko: 2, rak: 1 }, 'Kereta tetap melaju. Kas bocor.'],
    ['Restrukturisasi utang proyek', { utg: 2, kas: 3 }, 'Beban digeser ke masa depan.'],
    ['Biarkan merugi', { eko: -3, rak: -2 }, 'Investor bertanya-tanya soal komitmen negara.'],
  ]),
  mkEv('dn', '🏗️', 'Proyek Strategis Nasional Molor', 'Sejumlah proyek strategis nasional molor dan anggarannya membengkak.', [
    ['Lanjutkan dengan tambahan anggaran', { kas: -8, eko: 4 }, 'Proyek rampung, tagihan menumpuk.'],
    ['Hentikan sebagian proyek', { kas: 4, eko: -3, kol: -3 }, 'Hemat, tapi kontraktor dan daerah ngambek.'],
    ['Libatkan swasta (KPBU)', { eko: 2, kas: -1, rak: -2 }, 'Skema rumit, tarif mungkin naik nanti.'],
  ]),
  mkEv('dn', '🧪', 'Hoaks Viral Soal Kebijakan', 'Hoaks soal kebijakan pemerintah menyebar cepat di grup WhatsApp keluarga.', [
    ['Klarifikasi terbuka dengan data', { rak: 2, stb: 1 }, 'Kebenaran menyusul. Pelan tapi efektif.'],
    ['Laporkan pembuat hoaks', { stb: 2, rak: -3 }, 'Dianggap membungkam kritik oleh sebagian orang.'],
    ['Diamkan saja', { rak: -4, stb: -2 }, "Hoaks jadi 'fakta' di grup RT."],
  ]),
  mkEv('dn', '🏘️', 'Warga Tolak Penggusuran Proyek', 'Warga menolak penggusuran lahan untuk proyek pembangunan.', [
    ['Ganti untung yang layak', { rak: 4, kas: -7 }, 'Warga menerima, proyek lanjut.'],
    ['Paksa demi proyek', { stb: -3, rak: -7, eko: 3 }, 'Proyek jalan, luka sosial tertinggal.'],
    ['Dialog dan relokasi bertahap', { rak: 2, kas: -4, eko: 1 }, 'Lambat tapi damai.'],
  ]),
  mkEv('dn', '🥩', 'Harga Daging Jelang Idul Adha', 'Harga daging sapi naik jelang hari raya. Pedagang bakso mengancam mogok.', [
    ['Operasi pasar daging', { hrg: -6, kas: -4 }, 'Harga turun, pedagang bakso batal mogok.'],
    ['Impor sapi dan daging', { hrg: -8, rak: -2 }, 'Peternak lokal kesal.'],
    ['Imbau hemat konsumsi daging', { hrg: 2, rak: -3 }, "Rakyat: 'ya udah, makan tempe lagi'."],
  ]),
  mkEv('dn', '🎤', 'Konser Artis Dunia di Jakarta', 'Artis internasional konser di Jakarta, tiket ludes dalam hitungan menit.', [
    ['Dukung penuh, promosikan pariwisata', { eko: 3, rak: 3, kas: -2 }, 'Hotel dan UMKM sekitar panen rezeki.'],
    ['Kenakan pajak hiburan tinggi', { kas: 4, eko: -1, rak: -1 }, 'Kas dapat, penonton mengeluh.'],
    ['Batasi jam malam konser', { rak: -3, stb: 1 }, 'Fans kecewa, tagar sindiran muncul.'],
  ]),
  mkEv('dn', '🦟', 'Wabah Demam Berdarah', 'Kasus DBD melonjak di banyak kota seiring musim hujan.', [
    ['Fogging massal + 3M Plus', { rak: 3, kas: -5, stb: 1 }, 'Kasus mulai turun.'],
    ['Edukasi lewat influencer', { rak: 1, kas: -2 }, 'Konten viral, kasus perlahan turun.'],
    ['Anggap musiman', { rak: -6, stb: -2 }, 'Rumah sakit penuh, warga marah.'],
  ]),
  mkEv('dn', '⚡', 'Pemadaman Listrik Jawa-Bali', 'Listrik padam berjam-jam di Jawa dan Bali. Aktivitas ekonomi lumpuh sesaat.', [
    ['PLN minta maaf + kompensasi', { rak: 2, kas: -6 }, 'Tagihan dipotong, warga agak reda.'],
    ['Investasi pembangkit baru', { eko: 3, kas: -9 }, 'Jangka panjang bagus, kas tipis.'],
    ['Salahkan cuaca ekstrem', { rak: -5 }, 'Alasan klasik, tidak ada yang percaya.'],
  ]),
  mkEv('dn', '🛢️', 'Cadangan Gas Raksasa Ditemukan', 'Eksplorasi menemukan cadangan gas bumi raksasa di timur Indonesia.', [
    ['Kembangkan sendiri lewat BUMN', { eko: 6, kas: -5 }, 'Investasi besar, potensi pendapatan jangka panjang.'],
    ['Jual hak kelola ke investor', { kas: 10, eko: 1, rak: -2 }, 'Uang masuk cepat, tapi untungnya dibagi.'],
    ['Simpan dulu sebagai cadangan', { eko: 2, kol: -1 }, 'Aman, tapi publik tak sabar.'],
  ]),
  mkEv('dn', '🚢', 'Kapal Asing Masuk Natuna', 'Kapal penangkap ikan asing terpantau di perairan Natuna.', [
    ['Patroli diperkuat + tindak tegas', { rak: 4, stb: 2, kas: -5 }, 'Nelayan bangga, Bakamla sibuk.'],
    ['Nota protes diplomatik', { rak: 1, eko: 1 }, 'Diplomasi berjalan, tapi pelan.'],
    ['Pura-pura tak tahu', { rak: -5, stb: -3 }, 'Nelayan lokal marah, harga diri bangsa dipertanyakan.'],
  ]),
  mkEv('dn', '🧓', 'Iuran Pensiun Baru Memicu Protes', 'Aturan iuran baru bagi pekerja memicu protes serikat buruh.', [
    ['Batalkan aturan', { rak: 5, kas: -4, kol: -2 }, 'Buruh bersorak, ekonom geleng kepala.'],
    ['Tetap berlakukan', { kas: 7, rak: -8 }, 'Kas bertambah, medsos ramai mencaci.'],
    ['Tunda pelaksanaan', { rak: 1, kas: -1 }, 'Masalah ditunda, belum selesai.'],
  ]),
  mkEv('dn', '🎮', 'Timnas Esports Juara Dunia', 'Tim esports Indonesia menjuarai turnamen dunia. Gen Z euforia.', [
    ['Beri bonus dan penghargaan', { rak: 3, kas: -3 }, 'Anak muda merasa dihargai.'],
    ['Dorong industri game lokal', { eko: 3, kas: -4, rak: 1 }, 'Studio game lokal bermunculan.'],
    ['Cukup ucapan selamat di medsos', { rak: 2 }, 'Hemat dan tetap hangat.'],
  ]),
  mkEv('dn', '🏛️', 'Studi Banding DPR Disorot', 'Anggaran studi banding anggota DPR ke luar negeri jadi sorotan publik.', [
    ['Potong anggaran studi banding', { rak: 5, kol: -6 }, 'Rakyat senang, anggota DPR cemberut.'],
    ['Buka transparansi anggaran', { rak: 3, kol: -2 }, 'Dokumen dibuka, beberapa wajah pucat.'],
    ['Biarkan, hak anggota DPR', { rak: -6, kol: 3 }, "Netizen: 'studi bandingnya ke mana, Pak?'"],
  ]),
  mkEv('dn', '🏭', 'Pabrik Asing Relokasi ke Indonesia', 'Produsen elektronik global ingin memindahkan pabriknya ke Indonesia.', [
    ['Insentif lahan dan pajak', { eko: 6, kas: -4 }, 'Pabrik datang, lapangan kerja terbuka.'],
    ['Wajibkan TKDN tinggi', { eko: 3, rak: 2, kas: -1 }, 'Industri lokal ikut tumbuh.'],
    ['Biarkan negosiasi swasta', { eko: 2, kol: -1 }, 'Hasilnya biasa saja.'],
  ]),
  mkEv('dn', '🎖️', 'Peringatan 17 Agustus', 'Hari Kemerdekaan tiba. Merah putih berkibar di mana-mana.', [
    ['Upacara megah di Istana', { rak: 5, kas: -4, stb: 2 }, 'Rakyat merinding, foto-foto viral.'],
    ['Lomba rakyat di seluruh daerah', { rak: 4, kas: -2 }, 'Panjat pinang dan balap karung meriah.'],
    ['Sederhana saja, hemat anggaran', { rak: 1, kas: 1 }, 'Efisien, tapi kurang semarak.'],
  ]),
  mkEv('dn', '🏍️', 'Begal dan Kriminalitas Naik', 'Kasus begal dan kejahatan jalanan meningkat di kota besar.', [
    ['Tambah patroli aparat', { stb: 5, kas: -3 }, 'Jalan lebih aman, warga lebih tenang.'],
    ['Aktifkan siskamling warga', { stb: 3, rak: 1 }, 'Gotong royong jalan, murah meriah.'],
    ['Serahkan ke kepolisian daerah', { stb: -4, rak: -2 }, 'Kasus tak kunjung reda.'],
  ]),
  mkEv('dn', '🤖', 'AI Ancam Lapangan Kerja', 'Otomasi dan AI mulai menggantikan pekerjaan rutin di banyak sektor.', [
    ['Program pelatihan skill digital', { eko: 4, kas: -5, rak: 1 }, 'Pekerja mulai beradaptasi.'],
    ['Kenakan pajak otomasi', { kas: 5, eko: -3 }, 'Investor teknologi mengeluh.'],
    ['Biarkan pasar menyesuaikan', { rak: -4, eko: 1 }, 'Pengangguran terselubung makin terasa.'],
  ]),
  mkEv('dn', '🔥', 'Gas Melon 3 Kg Langka', 'Gas LPG 3 kg langka di banyak kota. Antrean warung makan mengular.', [
    ['Tambah distribusi segera', { hrg: -6, kas: -5, rak: 3 }, 'Antrean mereda, warung kembali buka.'],
    ['Batasi pembelian per KK', { hrg: -2, rak: -4, kas: 2 }, 'Hemat, tapi warga merasa diatur.'],
    ['Subsidi tepat sasaran berbasis NIK', { kas: 6, rak: -5 }, 'Hemat anggaran, urusan administrasi ribet.'],
  ]),
  mkEv('dn', '🗳️', 'Survei Kepuasan Publik Turun', 'Lembaga survei mengumumkan kepuasan publik terhadap pemerintah menurun.', [
    ['Luncurkan program pro-rakyat', { rak: 4, kas: -6 }, 'Angka perlahan naik lagi.'],
    ['Kritik metode survei', { rak: -3, kol: 2 }, 'Dianggap anti-kritik oleh publik.'],
    ['Perbanyak pencitraan di medsos', { rak: 2, kas: -2 }, 'Konten viral, substansi belum berubah.'],
  ]),
  mkEv('dn', '🌾', 'Panen Raya Sukses', 'Cuaca bersahabat, panen raya melimpah di berbagai daerah.', [
    ['Simpan jadi cadangan nasional', { hrg: -5, kas: -3, stb: 1 }, 'Stok aman, harga stabil.'],
    ['Ekspor kelebihan produksi', { kas: 6, hrg: 2 }, 'Devisa masuk, harga lokal sedikit naik.'],
    ['Bagikan ke rakyat', { rak: 5, kas: -4 }, 'Rakyat senang, kas berkurang.'],
  ]),
  mkEv('dn', '🏫', 'Gedung Sekolah Ambruk', 'Atap gedung sekolah ambruk. Tidak ada korban jiwa, tapi viral di media sosial.', [
    ['Renovasi sekolah rusak se-Indonesia', { rak: 6, kas: -8 }, 'Program besar, anggaran besar.'],
    ['Audit semua bangunan sekolah', { rak: 3, kas: -4, stb: 1 }, 'Banyak temuan, perbaikan bertahap.'],
    ['Salahkan kontraktor lokal', { rak: -2, kol: -1 }, 'Cepat, tapi tidak menyelesaikan masalah.'],
  ]),
  mkEv('dn', '🚰', 'Krisis Air Bersih', 'Kemarau panjang bikin krisis air bersih di banyak daerah.', [
    ['Bangun waduk dan jaringan air', { eko: 3, kas: -8, rak: 3 }, 'Investasi besar, manfaat jangka panjang.'],
    ['Distribusi air dengan truk tangki', { rak: 2, kas: -4 }, 'Solusi darurat berjalan.'],
    ['Imbau hemat air', { rak: -4, stb: -1 }, "Warga menjawab: 'airnya mana, Pak?'"],
  ]),
  // Follow-up events
  mkEv('dn', '🚜', 'Petani Mengamuk soal Impor', 'Petani memblokir jalan pantura menolak impor pangan yang menekan harga jual mereka.', [
    ['Naikkan HPP + serap hasil panen', { rak: 4, kas: -8, hrg: 2 }, 'Petani mundur dari jalan, kas menipis.'],
    ['Dialog + subsidi pupuk', { rak: 3, kas: -5 }, 'Disambut hangat, janji harus ditepati.'],
    ['Tindak tegas blokade jalan', { stb: 2, rak: -8 }, 'Jalan terbuka, tapi hati petani tertutup.'],
  ], 'fu_petani'),
  mkEv('dn', '📉', 'Kreditor Menagih', 'Lembaga pemeringkat menurunkan outlook karena utang negara terus naik.', [
    ['Bayar sebagian utang', { kas: -8, utg: -3 }, 'Reputasi dipulihkan, kas berkurang.'],
    ['Reformasi fiskal', { kas: 4, rak: -3, kol: -2 }, 'Disiplin fiskal, tapi tidak populer.'],
    ['Janji manis ke pasar', { stb: -2, eko: -2 }, 'Pasar skeptis, rupiah bergoyang.'],
  ], 'fu_utang'),
  mkEv('dn', '✊', 'Aksi Lanjutan Mahasiswa', 'Ribuan mahasiswa kembali turun ke jalan setelah insiden sebelumnya.', [
    ['Minta maaf secara terbuka', { rak: 5, stb: 2 }, 'Permintaan maaf diterima, situasi mereda.'],
    ['Dialog tertutup dengan BEM', { rak: 2, stb: 1, kol: -2 }, 'Meredam sedikit, tapi publik curiga.'],
    ['Kerahkan aparat lebih besar', { stb: -6, rak: -8 }, 'Eskalasi, tagar bergema di seluruh negeri.'],
  ], 'fu_mhs'),
  mkEv('dn', '🏭', 'Smelter Resmi Beroperasi', 'Smelter pertama beroperasi. Pekerja lokal menikmati gaji layak, tapi limbah mulai dikeluhkan warga.', [
    ['Awasi dampak lingkungan ketat', { eko: 2, rak: 3, kas: -3 }, 'Industri dan warga sama-sama aman.'],
    ['Fokus produksi dulu', { eko: 4, rak: -3, stb: -2 }, 'Pabrik ngebut, warga sekitar resah.'],
    ['Beri CSR besar ke desa sekitar', { rak: 4, kas: -3 }, 'Warga senang, perusahaan juga.'],
  ], 'fu_smelter'),
  mkEv('dn', '⛽', 'Demo BBM Meluas', 'Demo kenaikan BBM meluas ke berbagai kota dan makin besar tiap hari.', [
    ['Bantuan langsung tunai BBM', { rak: 5, kas: -7 }, 'Warga tenang, anggaran terkuras.'],
    ['Turunkan harga sebagian', { kas: -5, rak: 4, stb: 1 }, 'Kompromi diterima, kas tetap bocor.'],
    ['Bertahan dengan kebijakan', { stb: -3, rak: -6 }, 'Demo makin panas, aparat siaga.'],
  ], 'fu_bbm'),
];

const DN2: GameEventTuple[] = [
  mkEv('dn', '🚌', 'Arus Mudik Lebaran', 'Jutaan orang pulang kampung. Tol macet puluhan kilometer dan terminal membludak.', [
    ['Contraflow + one way nasional', { rak: 3, stb: 1, kas: -2 }, 'Macet terurai. Pemudik lega dan sampai kampung.'],
    ['Diskon tarif tol & tiket', { rak: 5, kas: -5 }, 'Mudik hemat. Kas negara tergerus.'],
    ['Cukup imbau mudik lebih awal', { rak: -2, stb: -1 }, "Netizen: 'imbau doang?' Macet tetap parah."],
  ]),
  mkEv('dn', '🎰', 'Judi Online Merajalela', 'Ribuan anak muda terjerat judol. PPATK menemukan jutaan rekening mencurigakan.', [
    ['Blokir massal situs & rekening', { rak: 4, stb: 2, kas: -2 }, 'Ribuan situs ditutup. Muncul lagi dengan nama baru.'],
    ['Razia dan tangkap bandar', { rak: 3, stb: 3, kol: -2, kas: -3 }, 'Beberapa bandar besar ditangkap. Ada oknum yang gerah.'],
    ['Cukup edukasi lewat sosial media', { rak: -3, stb: -2 }, 'Konten edukasi sepi, aplikasi judol makin ramai.'],
  ]),
  mkEv('dn', '📱', 'Pinjol Ilegal Menjerat Warga', 'Korban pinjol ilegal teror debt collector, data kontak disebar ke seluruh keluarga.', [
    ['Satgas pinjol + restrukturisasi korban', { rak: 5, eko: -1, kas: -3 }, 'Korban terbantu. Industri fintech menggerutu.'],
    ['Serahkan ke regulator keuangan', { rak: -2, kol: 1 }, 'Prosesnya lambat. Korban terus berjatuhan.'],
    ['Larang total pinjaman online', { rak: 3, eko: -4, stb: -1 }, 'Pinjol ilegal pindah ke aplikasi gelap.'],
  ]),
  mkEv('dn', '🏫', 'Guru Honorer Demo Nasional', 'Puluhan ribu guru honorer menuntut diangkat jadi ASN dan gaji layak.', [
    ['Angkat bertahap jadi ASN', { rak: 6, kas: -8, kol: 1 }, 'Guru bersorak. Kemenkeu mengelus dada.'],
    ['Beri tunjangan tambahan', { rak: 3, kas: -4 }, 'Lumayan, tapi tuntutan utama belum terjawab.'],
    ['Tunda, anggaran terbatas', { rak: -6, stb: -1 }, 'Foto guru honorer menangis viral di mana-mana.'],
  ]),
  mkEv('dn', '⚡', 'Listrik Padam Massal Jawa-Bali', 'Blackout berjam-jam. Mal, rumah sakit, dan lampu lalu lintas mati total.', [
    ['Audit total + ganti direksi BUMN', { rak: 3, kas: -4, kol: -2 }, 'Direksi dicopot. Rakyat menunggu pembuktian.'],
    ['Beri kompensasi potongan tagihan', { rak: 5, kas: -6 }, 'Warga senang, kas PLN-nya nombok.'],
    ['Minta maaf lewat konferensi pers', { rak: -5, stb: -2 }, 'Maaf dianggap kurang. Meme berseliweran.'],
  ]),
  mkEv('dn', '🚆', 'Kecelakaan Kereta Api', 'Dua kereta bertabrakan di jalur selatan. Puluhan korban jiwa dan luka.', [
    ['Evaluasi total + santunan korban', { rak: 4, kas: -5, stb: 1 }, 'Keluarga korban dirangkul. Anggaran keselamatan naik.'],
    ['Bentuk tim investigasi independen', { rak: 5, kas: -2, kol: -2 }, 'Hasil investigasi menyeret beberapa pejabat.'],
    ["Sebut 'human error' lalu tutup berita", { rak: -5, kol: 1 }, 'Publik menilai pemerintah cuci tangan.'],
  ]),
  mkEv('dn', '🥘', 'Keracunan Massal Kantin Sekolah', 'Ratusan siswa dilarikan ke puskesmas setelah makan siang di sekolah.', [
    ['Hentikan sementara & audit dapur', { rak: 3, kas: -4, stb: 1 }, 'Orang tua lega. Dapur yang bandel ditutup.'],
    ['Lanjut, perketat standar kebersihan', { rak: -1, kas: -3, stb: 1 }, 'Program jalan terus dengan pengawasan baru.'],
    ["Bilang 'kasus terisolasi'", { rak: -7, stb: -1 }, 'Orang tua marah. Tagar trending sepanjang malam.'],
  ]),
  mkEv('dn', '🌋', 'Gunung Berapi Meletus', 'Erupsi besar. Puluhan ribu warga lereng gunung harus segera dievakuasi.', [
    ['Evakuasi total + dapur umum', { rak: 5, kas: -7, stb: 2 }, 'Korban minim. Relawan berdatangan dari mana-mana.'],
    ['Evakuasi bertahap saja', { rak: 1, kas: -3, stb: -1 }, 'Hemat anggaran, tapi menegangkan.', { p: 0.25, f: { rak: -8, stb: -4 }, r: 'Erupsi susulan menjatuhkan korban. Pemerintah dikecam.' }],
    ['Serahkan ke pemerintah daerah', { rak: -4, kol: -1 }, 'Pemda kewalahan. Publik bertanya: pusat ke mana?'],
  ]),
  mkEv('dn', '🧨', 'Kerusuhan Suporter Sepak Bola', 'Bentrok antarsuporter usai laga derbi. Kendaraan dibakar dan korban luka berjatuhan.', [
    ['Sanksi tegas klub & suporter', { stb: 4, rak: -1 }, 'Beberapa klub dilarang bermain. Suporter protes.'],
    ['Dialog dengan tokoh suporter', { stb: 2, rak: 3, kas: -1 }, 'Damai sementara. Kapolres tampak lega.'],
    ['Hentikan liga sementara', { stb: 3, eko: -2, rak: -3 }, 'Aman, tapi pedagang kaki lima stadion jadi korban.'],
  ]),
  mkEv('dn', '📢', 'Hoaks Politik Viral', 'Video editan tokoh nasional menyebar di grup WhatsApp keluarga se-Indonesia.', [
    ['Klarifikasi resmi + patroli siber', { rak: 2, stb: 3, kas: -2 }, 'Hoaks mereda. Netizen tetap curiga.'],
    ['Blokir akun penyebar', { stb: 3, rak: -4 }, 'Dituding membungkam kritik.'],
    ['Abaikan, nanti juga reda', { stb: -3, rak: -2 }, 'Hoaks tambah liar dan makin dipercaya.'],
  ]),
  mkEv('dn', '🌾', 'Petani Gagal Panen', 'Kemarau panjang. Ribuan hektar sawah puso dan harga gabah anjlok.', [
    ['Asuransi tani + bantuan benih', { rak: 5, kas: -6, hrg: -2 }, 'Petani bertahan. Musim depan lebih siap.'],
    ['Impor beras darurat', { hrg: -8, rak: -2, kas: -4 }, 'Harga beras turun. Petani merasa dikhianati.'],
    ['Imbau hemat air saja', { rak: -4, hrg: 3 }, "Petani menjawab: 'airnya aja gak ada, Pak!'"],
  ]),
  mkEv('dn', '🏝️', 'Sengketa Lahan Adat vs Proyek Strategis', 'Proyek strategis nasional menggusur wilayah adat. Warga adat memblokir alat berat.', [
    ['Hentikan sementara, kaji ulang', { rak: 5, eko: -3, kol: -3 }, 'Warga adat menang sementara. Investor cemas.'],
    ['Ganti rugi layak & lanjut', { kas: -6, eko: 3, rak: 2 }, 'Kompromi mahal tapi damai.'],
    ['Lanjut tanpa kompromi', { eko: 3, rak: -7, stb: -3 }, 'Alat berat jalan, citra pemerintah turun.'],
  ]),
  mkEv('dn', '🔓', 'Kebocoran Data Jutaan Warga', 'Data kependudukan dijual bebas di forum gelap. Warga panik dan marah.', [
    ['Audit instansi & jatuhkan sanksi', { rak: 3, kas: -3, stb: 1 }, 'Beberapa instansi ditegur keras.'],
    ['Bentuk badan siber nasional', { rak: 2, kas: -6, stb: 3 }, 'Mahal, tapi pertahanan siber menguat.'],
    ["Bilang 'belum ada bukti kuat'", { rak: -6 }, 'Pakar keamanan siber tertawa getir.'],
  ]),
  mkEv('dn', '⛏️', 'Tambang Ilegal Longsor', 'Puluhan pekerja tambang emas tanpa izin tewas tertimbun longsor.', [
    ['Tutup tambang & tangkap cukongnya', { rak: 4, stb: 2, eko: -2, kol: -4 }, 'Beberapa nama besar tersandung. Elite gerah.'],
    ['Legalkan lewat izin pertambangan rakyat', { eko: 2, rak: 2, stb: -2 }, 'Pekerja lebih aman, pengawasan jadi PR.'],
    ['Cukup imbauan keselamatan', { rak: -4, stb: -1 }, 'Tiga bulan kemudian terulang lagi.'],
  ]),
  mkEv('dn', '🏛️', 'RUU Kontroversial di DPR', 'Sebuah RUU dianggap melemahkan lembaga pengawas. Mahasiswa dan LSM bersuara keras.', [
    ['Minta ditunda, buka uji publik', { rak: 4, kol: -4 }, 'Publik apresiasi. Fraksi pendukung kesal.'],
    ['Dorong segera disahkan', { kol: 5, rak: -7, stb: -2 }, 'Disahkan kilat. Tagar tolak trending seharian.', { p: 0.3, f: { kol: 3, rak: -10, stb: -5 }, r: 'Demo besar pecah di berbagai kota. Kepercayaan merosot.' }],
    ['Serahkan sepenuhnya ke DPR', { kol: 1, rak: -3 }, 'Kamu dianggap lepas tangan.'],
  ]),
  mkEv('dn', '🔥', 'Kebakaran Pasar Tradisional', 'Pasar induk terbakar. Ratusan pedagang kehilangan lapak dan modal.', [
    ['Bangun pasar baru yang modern', { rak: 5, kas: -7, eko: 1 }, 'Pedagang terharu. Peresmian dihadiri ribuan orang.'],
    ['Beri modal usaha ke pedagang', { rak: 4, kas: -4 }, 'Dagang jalan lagi di tenda darurat.'],
    ['Relokasi sementara saja', { rak: 1, kas: -2 }, 'Aman, tapi pedagang resah soal kepastian.'],
  ]),
  mkEv('dn', '🎤', 'Influencer Viral Kritik Pemerintah', 'Video 3 menit seorang influencer dilihat 20 juta kali. Isinya kritik pedas.', [
    ['Ajak ngopi, dengar masukannya', { rak: 4, stb: 1 }, 'Dialog hangat jadi konten baru yang viral.'],
    ['Laporkan lewat UU ITE', { rak: -8, stb: -2 }, 'Efek Streisand: videonya ditonton 80 juta kali.', { p: 0.35, f: { rak: -11, stb: -4, kol: -2 }, r: 'Tagar dukung sang influencer trending global.' }],
    ['Respons lewat juru bicara', { rak: -1 }, 'Jawaban normatif, dibalas komentar sinis.'],
  ]),
  mkEv('dn', '🚦', 'Kemacetan Metropolitan Lumpuh', 'Kerugian akibat macet triliunan rupiah per tahun. Warga habis di jalan.', [
    ['Percepat transportasi publik', { eko: 3, kas: -7, rak: 3 }, 'MRT dan KRL ditambah. Perlahan membaik.'],
    ['Terapkan jalan berbayar elektronik', { rak: -3, eko: 1, kas: 2 }, 'Pemasukan naik, pengendara mengeluh.'],
    ['Dorong kerja dari rumah', { eko: -2, rak: 2 }, 'Jalanan lega. Warung kopi dekat kantor sepi.'],
  ]),
  mkEv('dn', '🧑‍🔧', 'Pungli di Pelabuhan', 'Truk antre berhari-hari karena pungutan liar. Biaya logistik membengkak.', [
    ['Operasi tangkap tangan', { rak: 5, eko: 1, stb: 1, kol: -3 }, 'Puluhan oknum ditangkap. Citra pelabuhan membaik.'],
    ['Digitalisasi layanan pelabuhan', { eko: 2, rak: 2, kas: -4 }, 'Sistem baru bikin pungli sulit bernapas.'],
    ['Pembinaan internal saja', { rak: -3, stb: -1 }, 'Pungli berpindah dengan kode baru.'],
  ]),
  mkEv('dn', '🦟', 'Wabah Demam Berdarah', 'Kasus DBD melonjak di puluhan kota. Rumah sakit penuh sesak.', [
    ['Fogging & vaksinasi massal', { rak: 4, kas: -5 }, 'Kasus menurun. Warga mengantre vaksin.'],
    ['Kampanye 3M di media sosial', { rak: 1, kas: -1, stb: -1 }, 'Efeknya terbatas, tapi murah.'],
    ['Tambah tenaga & tempat tidur RS', { rak: 3, kas: -6, stb: 1 }, 'Layanan lebih siap, anggaran jebol sedikit.'],
  ]),
  mkEv('dn', '🎓', 'Uang Kuliah Naik, Mahasiswa Protes', 'Kenaikan UKT bikin banyak mahasiswa terancam putus kuliah.', [
    ['Batalkan kenaikan', { rak: 5, kas: -5 }, 'Mahasiswa bersorak. Rektor cari dana lain.'],
    ['Subsidi silang untuk yang kurang mampu', { rak: 3, kas: -3, kol: -1 }, 'Skema rumit, tapi adil di atas kertas.'],
    ['Kenaikan tetap berjalan', { rak: -6, stb: -2 }, 'Kampus riuh. Spanduk bertebaran.'],
  ]),
  mkEv('dn', '🔥', 'Gas Melon Langka', 'Elpiji 3 kg langka di berbagai daerah. Ibu-ibu antre berjam-jam.', [
    ['Operasi pasar + pangkalan resmi', { hrg: -6, kas: -4, rak: 3 }, 'Antrean mengecil. Pasokan pulih bertahap.'],
    ['Subsidi tepat sasaran lewat kartu', { kas: 3, rak: -4, hrg: 3 }, 'Hemat anggaran, rakyat bingung cara daftar.'],
    ['Tambah kuota nasional', { hrg: -5, kas: -6 }, 'Langka teratasi, subsidi membengkak.'],
  ]),
  mkEv('dn', '🏅', 'Indonesia Tuan Rumah Pesta Olahraga', 'Kamu ditawari jadi tuan rumah ajang olahraga besar. Gengsi tinggi, biaya juga.', [
    ['Bangun venue megah', { eko: 3, rak: 4, kas: -8 }, 'Venue ikonik berdiri. Rakyat bangga.'],
    ['Pakai venue yang sudah ada', { rak: 2, kas: -3 }, 'Hemat dan tetap meriah.'],
    ['Tolak, fokus kebutuhan rakyat', { rak: -3, kas: 1 }, 'Atlet kecewa, sebagian warga mengapresiasi.'],
  ]),
  mkEv('dn', '🕋', 'Antrean Haji Makin Panjang', 'Calon jemaah harus menunggu puluhan tahun. Biaya dan layanan jadi sorotan.', [
    ['Negosiasi tambah kuota lewat diplomasi', { rak: 5, kas: -3 }, 'Kuota nambah sedikit. Jemaah berterima kasih.'],
    ['Audit & transparansi biaya', { rak: 3, kol: -1 }, 'Ditemukan sejumlah pemborosan.'],
    ['Naikkan biaya, cari penerimaan', { rak: -6, kas: 3 }, 'Calon jemaah protes. Hitungan tak dipercaya.'],
  ]),
];

const LN: GameEventTuple[] = [
  mkEv('ln', '⚔️', 'Perang Tarif Dua Raksasa Ekonomi', 'Dua negara adidaya saling menaikkan tarif impor. Ekspor komoditas kita ikut terseret.', [
    ['Cari pasar ekspor baru', { eko: 3, kas: -4 }, 'Delegasi dagang keliling Afrika dan Timur Tengah.'],
    ['Negosiasi bilateral', { eko: 2, stb: 1, kas: -1 }, 'Dapat kuota khusus untuk beberapa produk.'],
    ['Proteksi industri dalam negeri', { eko: -2, hrg: 3, rak: 2 }, 'Industri lokal aman, harga barang impor naik.'],
  ]),
  mkEv('ln', '🛢️', 'Harga Minyak Dunia Melonjak', 'Ketegangan di kawasan penghasil minyak mengerek harga ke level tertinggi tahun ini.', [
    ['Tambah subsidi BBM', { hrg: -4, kas: -9, rak: 3 }, 'Harga BBM tertahan. APBN menjerit.'],
    ['Naikkan harga BBM', { hrg: 7, rak: -7, kas: 6 }, 'Kas selamat. Rakyat protes dan ojol menjerit.', null, 'fu_bbm'],
    ['Gerakan hemat energi nasional', { eko: -2, rak: -1, kas: -1 }, 'Lampu gedung diredupkan. Dampaknya kecil.'],
  ]),
  mkEv('ln', '🐟', 'Kapal Nelayan Asing di Perairan Perbatasan', 'Puluhan kapal ikan asing mencuri ikan di zona ekonomi eksklusif kita.', [
    ['Kirim kapal patroli & tenggelamkan', { stb: 3, kas: -4, rak: 4 }, 'Tindakan tegas. Nelayan lokal bersorak.'],
    ['Protes diplomatik resmi', { rak: 1, stb: 1 }, 'Nota protes dikirim. Responsnya adem ayem.'],
    ['Pura-pura tidak tahu', { rak: -5, stb: -2 }, 'Nelayan tradisional merasa ditinggalkan.'],
  ]),
  mkEv('ln', '🏦', 'Bank Sentral Adidaya Naikkan Bunga', 'Modal asing mengalir keluar dari negara berkembang, termasuk kita.', [
    ['Naikkan bunga acuan', { eko: -3, kas: 1, rak: -2 }, 'Rupiah stabil, tetapi cicilan naik.'],
    ['Pakai cadangan devisa', { kas: -7, eko: 1 }, 'Rupiah tenang dulu. Amunisi menipis.'],
    ['Biarkan rupiah melemah', { hrg: 5, eko: 1, rak: -3 }, 'Ekspor terbantu. Harga barang impor ikut naik.'],
  ]),
  mkEv('ln', '👷', 'Pekerja Migran Disiksa di Luar Negeri', 'Video penyiksaan pekerja migran asal Indonesia viral. Publik geram.', [
    ['Kirim tim evakuasi + tekan diplomasi', { rak: 6, kas: -4 }, 'Korban dipulangkan. Majikan diproses hukum.'],
    ['Moratorium pengiriman pekerja', { rak: 2, eko: -2 }, 'Tegas, tapi kantong remitansi tipis.'],
    ['Serahkan ke perwakilan setempat', { rak: -6 }, "Keluarga korban teriak: 'Mana negara?'"],
  ]),
  mkEv('ln', '🤝', 'Tawaran Investasi Raksasa dari Luar', 'Konsorsium asing menawarkan investasi puluhan miliar dolar dengan sejumlah syarat.', [
    ['Terima dengan syarat transfer teknologi', { eko: 6, kas: -2, rak: 1 }, 'Pabrik baru, ribuan lapangan kerja, alih teknologi.'],
    ['Terima apa adanya', { eko: 7, rak: -4, kol: -2 }, 'Cepat dan besar. Banyak pasal jadi sorotan.'],
    ['Tolak, takut ketergantungan', { eko: -2, rak: 2 }, 'Nasionalis bangga, pengusaha menyayangkan.'],
  ]),
  mkEv('ln', '🦠', 'Wabah Baru Menyebar di Luar Negeri', 'Varian virus baru menyebar cepat di sejumlah negara. WHO siaga.', [
    ['Skrining ketat di bandara', { stb: 2, eko: -3, rak: 1, kas: -2 }, 'Ketat dan tenang. Pariwisata sedikit lesu.'],
    ['Tutup perbatasan sementara', { eko: -5, stb: 3, rak: -1 }, 'Aman, tapi ekonomi kena pukulan.'],
    ['Pantau saja dulu', { rak: -3, stb: -2 }, 'Hemat biaya, penuh spekulasi.', { p: 0.3, f: { rak: -8, stb: -6, eko: -3 }, r: 'Kasus pertama masuk lewat penumpang pesawat. Panik massal.' }],
  ]),
  mkEv('ln', '🚢', 'Pengungsi Konflik Mendekati Perairan Kita', 'Kapal pengungsi dari wilayah konflik terombang-ambing menuju perairan Indonesia.', [
    ['Beri bantuan kemanusiaan sementara', { rak: -2, kas: -4, stb: 2 }, 'Dunia memuji. Sebagian warga tak setuju.'],
    ['Tolak masuk, dorong ke laut lepas', { stb: 1, rak: -3 }, 'Dikritik lembaga HAM internasional.'],
    ['Koordinasi dengan lembaga pengungsi dunia', { rak: 2, kas: -2 }, 'Bebannya dibagi. Prosesnya makan waktu.'],
  ]),
  mkEv('ln', '🌐', 'Ajakan Bergabung Blok Dagang Besar', 'Sebuah blok dagang besar mengundang kita sebagai anggota baru.', [
    ['Bergabung penuh', { eko: 5, rak: -3, kol: -2 }, 'Pasar terbuka luas. Petani dan UMKM waswas.'],
    ['Pelajari dulu secara mendalam', { eko: 1 }, 'Tim negosiator bekerja. Tak ada keputusan cepat.'],
    ['Tolak, jaga kemandirian', { rak: 2, eko: -2 }, 'Kebijakan bebas-aktif tetap terjaga.'],
  ]),
  mkEv('ln', '⚖️', 'Gugatan Larangan Ekspor Bahan Mentah', 'Lembaga dagang dunia menerima gugatan atas larangan ekspor mineral mentah kita.', [
    ['Lawan dengan tim hukum terbaik', { eko: 3, kas: -4, rak: 2 }, 'Sidang panjang. Semangat nasionalis tinggi.'],
    ['Cabut larangan', { eko: -2, kas: 2, rak: -4, kol: 2 }, 'Gugatan selesai, kebijakan hilirisasi diprotes.'],
    ['Negosiasi hilirisasi bertahap', { eko: 1, stb: 1 }, 'Jalan tengah diterima semua pihak.'],
  ]),
  mkEv('ln', '🌊', 'Tsunami Hantam Negara Tetangga', 'Ribuan korban di negara tetangga. Dunia menunggu aksi nyata.', [
    ['Kirim bantuan besar-besaran', { rak: 3, kas: -6, stb: 1 }, 'Kapal rumah sakit dikirim. Nama Indonesia harum.'],
    ['Kirim bantuan simbolis', { rak: 1, kas: -2 }, 'Dibilang cukup, tapi tak berkesan.'],
    ['Fokus urusan dalam negeri', { rak: -4 }, 'Dikritik kurang solidaritas.'],
  ]),
  mkEv('ln', '⚽', 'Tim Nasional Lolos Turnamen Dunia', 'Kejutan besar! Timnas lolos ke turnamen dunia untuk pertama kalinya.', [
    ['Pesta rakyat + bonus besar pemain', { rak: 6, kas: -4 }, 'Euforia nasional. Warung kopi penuh nobar.'],
    ['Bonus sederhana, fokus persiapan', { rak: 3, kas: -1 }, 'Pemain tetap bersyukur.'],
    ['Tak perlu berlebihan', { rak: -1 }, "Netizen: 'masa gak ada apresiasi?'"],
  ]),
  mkEv('ln', '🌾', 'Negara Pengekspor Setop Ekspor Beras', 'Krisis pangan global. Negara pengekspor utama menutup keran ekspor beras.', [
    ['Cari pasokan alternatif lewat diplomasi', { hrg: -4, kas: -5 }, 'Dapat pasokan dari beberapa negara baru.'],
    ['Lepas cadangan beras nasional', { hrg: -6, kas: -3 }, 'Gudang Bulog kosong tapi harga tertahan.'],
    ['Kampanye diversifikasi pangan', { hrg: 3, rak: -3 }, 'Rakyat disuruh makan sagu. Respon: nyinyir.'],
  ]),
  mkEv('ln', '🖥️', 'Peretas Asing Bobol Situs Pemerintah', 'Sejumlah server pemerintah dibobol. Dokumen internal bocor ke publik.', [
    ['Umumkan & protes secara terbuka', { stb: 1, rak: 2, kas: -2 }, 'Transparan. Hubungan bilateral memanas.'],
    ['Diam-diam perkuat sistem', { stb: 2, kas: -3 }, 'Tenang di permukaan, sibuk di belakang.'],
    ['Bantah ada peretasan', { rak: -6, stb: -1 }, 'Bukti bocor ke media. Bantahan dibantah.'],
  ]),
  mkEv('ln', '🎩', 'Kunjungan Kenegaraan Pemimpin Adidaya', 'Pemimpin negara adidaya datang. Ada tekanan halus agar memilih blok.', [
    ['Politik bebas-aktif, tetap seimbang', { eko: 2, stb: 1, rak: 3 }, 'Disambut hangat, tak ada yang tersinggung.'],
    ['Condong ke satu blok', { eko: 5, rak: -4, stb: -2 }, 'Kesepakatan besar. Blok lain kecewa.'],
    ['Tolak undangan kunjungan balasan', { rak: 1, eko: -3 }, 'Sinyal kemandirian. Investor menahan diri.'],
  ]),
  mkEv('ln', '🏝️', 'Pulau Perbatasan Diklaim Negara Lain', 'Peta baru negara tetangga memasukkan sebuah pulau terluar kita.', [
    ['Tegaskan kedaulatan + patroli', { stb: 3, kas: -4, rak: 5 }, 'Merah putih dikibarkan. Dukungan rakyat bulat.'],
    ['Jalur diplomasi & arbitrase', { stb: 2, kas: -2, rak: 2 }, 'Proses lama tapi terhormat.'],
    ['Diam, hindari ketegangan', { rak: -6, stb: -3 }, 'Dianggap lemah. Oposisi menyerang.'],
  ]),
  mkEv('ln', '🌍', 'Kamu Diminta Jadi Tuan Rumah KTT Regional', 'Pemimpin negara kawasan ingin bertemu di Indonesia untuk bahas krisis bersama.', [
    ['Jadi tuan rumah, pamer budaya', { rak: 3, eko: 2, kas: -6 }, 'KTT sukses. Batik dan gamelan memukau tamu.'],
    ['Kirim wakil saja', { rak: -2 }, 'Aman anggaran, dianggap kurang peduli.'],
    ['Usulkan agenda harga pangan kawasan', { eko: 2, hrg: -2, rak: 2, kas: -3 }, 'Ada komitmen stok pangan bersama.'],
  ]),
];

export const EV: GameEventTuple[] = [...DN_INITIAL, ...DN2, ...LN];
