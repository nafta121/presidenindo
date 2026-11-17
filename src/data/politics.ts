import type { AgencyKey, LawDef } from '../types/game';

export const LAWS: LawDef[] = [
  {
    id: 'naker',
    ic: '👷',
    n: 'UU Ketenagakerjaan & Investasi',
    no: 'UU No. 7/2024',
    d: 'Upah, outsourcing, dan kemudahan investasi.',
    opts: [
      { id: 'a', n: 'Longgarkan aturan (ramah investor)', f: { eko: 4, rak: -4, stb: -1 }, pop: 0.35, ctr: 0.7 },
      { id: 'b', n: 'Perkuat perlindungan buruh', f: { rak: 4, eko: -2, kol: 1 }, pop: 0.65, ctr: 0.3 },
    ],
  },
  {
    id: 'pajak',
    ic: '🧾',
    n: 'UU Harmonisasi Pajak',
    no: 'UU No. 11/2023',
    d: 'Tarif PPN, PPh, dan pajak kekayaan.',
    opts: [
      { id: 'a', n: 'Naikkan tarif PPN', f: { kas: 6, rak: -5, eko: -1, hrg: 2 }, rb: { pajak: 0.25 }, pop: 0.3, ctr: 0.6 },
      { id: 'b', n: 'Pajak kekayaan orang super kaya', f: { kas: 3, rak: 3, eko: -1 }, rb: { pajak: 0.15 }, pop: 0.7, ctr: 0.4 },
    ],
  },
  {
    id: 'siber',
    ic: '💻',
    n: 'UU Informasi & Transaksi Elektronik',
    no: 'UU No. 19/2022',
    d: 'Pasal pencemaran nama baik dan konten digital.',
    opts: [
      { id: 'a', n: 'Perluas pasal (tertibkan medsos)', f: { stb: 3, rak: -4 }, pop: 0.4, ctr: 0.8 },
      { id: 'b', n: 'Hapus pasal karet', f: { rak: 4, stb: -1 }, pop: 0.7, ctr: 0.3 },
    ],
  },
  {
    id: 'kpk',
    ic: '⚖️',
    n: 'UU Komisi Pemberantasan Korupsi',
    no: 'UU No. 30/2021',
    d: 'Kewenangan dan independensi lembaga antirasuah.',
    opts: [
      { id: 'a', n: 'Perkuat KPK (penyadapan & penyitaan lebih luas)', f: { rak: 3, kol: -2 }, kpk: 20, pop: 0.75, ctr: 0.3, ipk: 8 },
      { id: 'b', n: 'Lemahkan KPK (di bawah pemerintah)', f: { kol: 3, rak: -4 }, kpk: -25, pop: 0.2, ctr: 0.9, ipk: -10 },
    ],
  },
  {
    id: 'tni',
    ic: '🎖️',
    n: 'UU Tentara Nasional Indonesia',
    no: 'UU No. 34/2020',
    d: 'Peran dan batas kewenangan TNI.',
    opts: [
      { id: 'a', n: 'Perluas peran TNI di jabatan sipil', f: { stb: 4, rak: -3 }, ap: { tni: { loy: 8 } }, pop: 0.35, ctr: 0.7 },
      { id: 'b', n: 'Batasi TNI ke pertahanan murni', f: { rak: 2, stb: -1 }, ap: { tni: { prof: 6, loy: -6 } }, pop: 0.6, ctr: 0.3 },
    ],
  },
  {
    id: 'polri',
    ic: '👮',
    n: 'UU Kepolisian Negara',
    no: 'UU No. 2/2022',
    d: 'Kewenangan, pengawasan, dan penyidikan Polri.',
    opts: [
      { id: 'a', n: 'Perluas kewenangan penyidikan Polri', f: { stb: 3, rak: -3 }, ap: { pol: { loy: 8 } }, pop: 0.4, ctr: 0.6 },
      { id: 'b', n: 'Reformasi & pengawasan eksternal Polri', f: { rak: 3, stb: -1 }, ap: { pol: { prof: 8, loy: -6 } }, ipk: 3, pop: 0.7, ctr: 0.3 },
    ],
  },
  {
    id: 'minerba',
    ic: '⛏️',
    n: 'UU Mineral & Batubara',
    no: 'UU No. 3/2020',
    d: 'Ekspor mentah, smelter, dan royalti tambang.',
    opts: [
      { id: 'a', n: 'Wajib hilirisasi & smelter lokal', f: { eko: 4, kas: -2, rak: 1 }, rb: { pnbp: 0.2 }, pop: 0.65, ctr: 0.4 },
      { id: 'b', n: 'Buka kembali ekspor mentah', f: { kas: 5, eko: -2, rak: -2 }, pop: 0.3, ctr: 0.6 },
    ],
  },
  {
    id: 'pangan',
    ic: '🌾',
    n: 'UU Pangan',
    no: 'UU No. 18/2012',
    d: 'Impor, swasembada, dan cadangan pangan.',
    opts: [
      { id: 'a', n: 'Swasembada & batasi impor', f: { hrg: 3, rak: 2, eko: -1 }, pop: 0.55, ctr: 0.4 },
      { id: 'b', n: 'Impor dibuka lebih bebas', f: { hrg: -5, rak: 1, eko: 1 }, pop: 0.45, ctr: 0.5 },
    ],
  },
  {
    id: 'pend',
    ic: '🏫',
    n: 'UU Sistem Pendidikan',
    no: 'UU No. 20/2003',
    d: 'Biaya pendidikan dan kurikulum.',
    opts: [
      { id: 'a', n: 'Pendidikan 12 tahun gratis', f: { rak: 5, kas: -5 }, pop: 0.8, ctr: 0.2 },
      { id: 'b', n: 'Otonomi kampus & komersialisasi', f: { kas: 3, rak: -3, eko: 1 }, pop: 0.3, ctr: 0.6 },
    ],
  },
  {
    id: 'data',
    ic: '🔒',
    n: 'UU Pelindungan Data Pribadi',
    no: 'UU No. 27/2022',
    d: 'Privasi data warga dan sanksi kebocoran.',
    opts: [
      { id: 'a', n: 'Perketat sanksi & lembaga pengawas independen', f: { rak: 3, eko: -1 }, pop: 0.7, ctr: 0.2 },
      { id: 'b', n: 'Longgarkan untuk bisnis digital', f: { eko: 3, rak: -3 }, pop: 0.35, ctr: 0.5 },
    ],
  },
  {
    id: 'pemilu',
    ic: '🗳️',
    n: 'UU Pemilihan Umum',
    no: 'UU No. 7/2017',
    d: 'Ambang batas parlemen dan sistem pemilu.',
    opts: [
      { id: 'a', n: 'Naikkan ambang batas parlemen', f: { stb: 2, rak: -2, kol: 3 }, pop: 0.35, ctr: 0.7 },
      { id: 'b', n: 'Turunkan ambang batas (partai kecil masuk)', f: { rak: 2, stb: -2, kol: -2 }, pop: 0.55, ctr: 0.3 },
    ],
  },
  {
    id: 'keuneg',
    ic: '🏦',
    n: 'UU Keuangan Negara',
    no: 'UU No. 17/2003',
    d: 'Batas defisit dan utang negara.',
    opts: [
      { id: 'a', n: 'Longgarkan batas defisit & utang', f: { kas: 7, eko: 2, utg: 2 }, pop: 0.5, ctr: 0.5 },
      { id: 'b', n: 'Perketat disiplin fiskal', f: { kas: -1, eko: -1, utg: -2, rak: -1 }, pop: 0.5, ctr: 0.3 },
    ],
  },
];

export const CASE_OBJ = [
  'bus listrik', 'alat kesehatan', 'satelit desa', 'bibit padi unggul', 'seragam sekolah',
  'laptop sekolah', 'pupuk bersubsidi', 'kapal patroli', 'server pusat data', 'jembatan layang',
  'bendungan', 'bandara perintis', 'gedung pemerintah', 'dermaga', 'jalan tol',
];

export const CASE_ACT: Array<(o: string) => string> = [
  (o) => 'Korupsi pengadaan ' + o,
  (o) => 'Mark-up proyek ' + o,
  (o) => 'Suap izin proyek ' + o,
  (o) => 'Penggelembungan anggaran ' + o,
];

export const CASE_ACT2 = [
  'Pencucian uang dana hibah daerah',
  'Gratifikasi izin tambang',
  'Suap kuota impor pangan',
  'Penyelewengan dana desa',
  'Pungli perizinan pelabuhan',
  'Korupsi dana bansos',
  'Suap vonis perkara',
  'Korupsi dana CSR',
  'Penyalahgunaan dana reses',
];

export const CASE_WHO = [
  'Bupati Kabupaten Sumber Makmur',
  'Wali Kota Bandar Sentosa',
  'Dirut BUMN Karya Nusa Raya',
  'Sekjen Kementerian Pembangunan Wilayah',
  'Anggota DPR Komisi Anggaran',
  'Kepala Dinas PU Provinsi Teluk Harapan',
  'Gubernur Provinsi Pulau Lestari',
  'Ketua Panitia Lelang Badan Logistik Nusantara',
  'Dirut Bank Daerah Cendana',
  'Kepala Kantor Pelabuhan Samudra Timur',
  'Bupati Kabupaten Lembah Subur',
  'Direktur Perusahaan Konstruksi Cakra Abadi',
];

export const STAGE = ['Penyelidikan', 'Tersangka', 'Persidangan', 'Vonis'];

export const AGN_NAMES: Record<AgencyKey, string> = {
  KPK: 'Komisi Pemberantasan Korupsi',
  Kejaksaan: 'Kejaksaan Agung',
  Polri: 'Bareskrim Polri',
};

export interface ModusDef {
  n: string;
  flow: string[];
  pasal: string;
}

export const MODUS: ModusDef[] = [
  { n: 'Mark-up harga pengadaan', flow: ['Rekanan proyek', 'Perusahaan cangkang', 'Rekening kerabat pejabat', 'Properti & kendaraan mewah'], pasal: 'Pasal 2 & 3 UU Tipikor' },
  { n: 'Suap perizinan', flow: ['Pengusaha pemohon izin', 'Perantara/makelar', 'Staf pejabat', 'Rekening keluarga'], pasal: 'Pasal 5 & 12 UU Tipikor' },
  { n: 'Gratifikasi proyek', flow: ['Kontraktor pemenang tender', 'Transfer valas', 'Pihak ketiga', 'Aset kripto & emas batangan'], pasal: 'Pasal 12B UU Tipikor' },
  { n: 'Penggelapan dana hibah/bansos', flow: ['Dana hibah daerah', 'Yayasan fiktif', 'Rekening operasional', 'Kas pribadi & dana kampanye'], pasal: 'Pasal 3 UU Tipikor' },
  { n: 'Pencucian uang hasil korupsi', flow: ['Hasil korupsi', 'Rekening berlapis', 'Pembelian saham & properti', 'Bisnis kerabat di luar negeri'], pasal: 'UU TPPU + Pasal 2 UU Tipikor' },
  { n: 'Pemerasan jabatan', flow: ['Bawahan & rekanan', 'Ajudan/kurir', 'Rekening pribadi', 'Gaya hidup & judi'], pasal: 'Pasal 12e UU Tipikor' },
];

export const BB = [
  'uang tunai miliaran rupiah',
  '3 unit mobil mewah',
  'sertifikat tanah di 4 kota',
  'emas batangan 12 kg',
  'rekening dibekukan',
  'apartemen di Jakarta',
  'koleksi jam tangan',
  'kapal pesiar kecil',
];
