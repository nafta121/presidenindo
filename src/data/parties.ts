import type { LatarDef, OutfitRole, PartyDef, RoleDef, RoleKey } from '../types/game';

export const PARTIES: PartyDef[] = [
  { n: 'Partai Elang Raya', a: 'PER', ic: '🦅', c: '#e03a3e', ide: 'Nasionalis', ketum: 'H. Bambang Wiryawan', seat: 118 },
  { n: 'Partai Bintang Hijau', a: 'PBH', ic: '⭐', c: '#2fbf71', ide: 'Religius moderat', ketum: 'KH. Mahfudin Arifin', seat: 96 },
  { n: 'Partai Karya Bangsa Sejahtera', a: 'KBS', ic: '🏗️', c: '#f2c14e', ide: 'Pembangunan', ketum: 'Ir. Hartono Salim', seat: 84 },
  { n: 'Partai Nusantara Baru', a: 'NUBA', ic: '🌅', c: '#ff8a4c', ide: 'Progresif', ketum: 'Dr. Larasati Prameswari', seat: 72 },
  { n: 'Partai Suara Pertiwi', a: 'PSP', ic: '🌺', c: '#e0589c', ide: 'Kerakyatan', ketum: 'Ratna Kencana, S.H.', seat: 64 },
  { n: 'Partai Cahaya Madani', a: 'PCM', ic: '🕯️', c: '#6aa7ff', ide: 'Konservatif religius', ketum: 'Ust. Zainal Abidin', seat: 58 },
  { n: 'Partai Tani Makmur', a: 'PTM', ic: '🌾', c: '#b58b4a', ide: 'Agraris', ketum: 'Sutrisno Adiwijaya', seat: 48 },
  { n: 'Partai Pelita Muda', a: 'PPM', ic: '🌱', c: '#9b7bff', ide: 'Anak muda', ketum: 'Dimas Aryo Pamungkas', seat: 40 },
];

export const LATAR: LatarDef[] = [
  { k: 'jenderal', ic: '🎖️', n: 'Purnawirawan Jenderal', d: 'Tegas & disegani. Rakyat agak segan.', f: { stb: 8, rak: -3 } },
  { k: 'gubernur', ic: '🏛️', n: 'Mantan Gubernur', d: 'Dekat rakyat, paham birokrasi.', f: { rak: 5, eko: 2 } },
  { k: 'pengusaha', ic: '💼', n: 'Pengusaha', d: 'Jago ekonomi, dicurigai pro-konglomerat.', f: { eko: 6, kas: 5, rak: -4 } },
  { k: 'akademisi', ic: '🎓', n: 'Akademisi', d: 'Cerdas, tapi kurang lobi politik.', f: { eko: 3, rak: 2, kol: -6 } },
  { k: 'aktivis', ic: '📢', n: 'Aktivis', d: 'Dicintai rakyat, dibenci elite partai.', f: { rak: 8, kol: -8, stb: -2 } },
];

export const ROLES: RoleDef[] = [
  { k: 'keu', ic: '💰', j: 'Menteri Keuangan', e: 'Kas negara' },
  { k: 'tan', ic: '🌾', j: 'Menteri Pangan', e: 'Harga pangan' },
  { k: 'eko', ic: '📊', j: 'Menko Perekonomian', e: 'Ekonomi' },
  { k: 'dag', ic: '🏠', j: 'Menteri Dalam Negeri', e: 'Stabilitas' },
  { k: 'sos', ic: '🤝', j: 'Menteri Sosial', e: 'Kepercayaan rakyat' },
  { k: 'han', ic: '🛡️', j: 'Menteri Pertahanan', e: 'Stabilitas' },
  { k: 'lun', ic: '🌍', j: 'Menteri Luar Negeri', e: 'Dampak krisis luar negeri' },
  { k: 'kes', ic: '🏥', j: 'Menteri Kesehatan', e: 'Gizi & kesehatan' },
  { k: 'pdd', ic: '🎓', j: 'Menteri Pendidikan', e: 'Kepercayaan rakyat' },
  { k: 'esd', ic: '⚡', j: 'Menteri Energi', e: 'Ekonomi & energi' },
  { k: 'set', ic: '📨', j: 'Menteri Sekretaris Negara', e: 'Laporan, agenda & kunjungan kerja' },
];

export const OUTFIT: Record<RoleKey, OutfitRole> = {
  han: 'seragam',
  dag: 'safari',
  keu: 'jas',
  eko: 'jas',
  lun: 'jas',
  tan: 'safari',
  sos: 'batik',
  kes: 'jas',
  pdd: 'batik',
  esd: 'safari',
  set: 'jas',
};

export const FN = [
  'Agus', 'Bambang', 'Cahyo', 'Darmawan', 'Eko', 'Fadli', 'Gunawan', 'Hartono',
  'Irfan', 'Joko', 'Kusnadi', 'Lukman', 'Mulyadi', 'Nurdin', 'Oscar', 'Priyo',
  'Rahmat', 'Slamet', 'Taufik', 'Udin', 'Wahyu', 'Yusuf', 'Zulkifli', 'Andi',
  'Budi', 'Dedi', 'Rizal', 'Hendra',
];

export const FF = [
  'Ani', 'Bunga', 'Citra', 'Diah', 'Endang', 'Fitri', 'Gita', 'Hesti',
  'Intan', 'Juwita', 'Kartika', 'Lina', 'Mega', 'Novi', 'Putri', 'Rosa',
  'Sinta', 'Tari', 'Utami', 'Vina', 'Wulan', 'Yuni', 'Laksmi', 'Ratih',
];

export const LNM = [
  'Wibowo', 'Santoso', 'Hidayat', 'Pratama', 'Saputra', 'Siregar', 'Lubis', 'Nasution',
  'Tampubolon', 'Manurung', 'Sitompul', 'Wahyudi', 'Kurniawan', 'Hakim', 'Rahman', 'Setiawan',
  'Susanto', 'Purnomo', 'Simanjuntak', 'Gultom', 'Maulana', 'Firmansyah', 'Ginting', 'Daulay',
  'Pasaribu', 'Syahputra', 'Mappasessu', 'Sudiarta', 'Wardhani', 'Anggraeni',
];

export const TTL = ['', '', '', 'Dr. ', 'Prof. ', 'Ir. ', 'H. ', 'Drs. '];

export const FEM = new Set<string>([...FF, 'Ratna', 'Larasati', 'Laksmi']);

export const KOTA = [
  'Medan', 'Makassar', 'Surakarta', 'Bandung', 'Palembang', 'Banjarmasin', 'Manado', 'Kupang',
  'Pontianak', 'Padang', 'Malang', 'Denpasar', 'Jayapura', 'Mataram', 'Ambon', 'Pekanbaru',
  'Yogyakarta', 'Samarinda', 'Semarang', 'Pematangsiantar',
];

export const UNIV = [
  'Universitas Nusantara',
  'Institut Teknologi Pertiwi',
  'Universitas Garuda Jaya',
  'Universitas Bumi Raya',
  'Sekolah Tinggi Kebijakan Negara',
  'Universitas Samudra Timur',
];

export const UNIVLN = [
  'Universitas Westbridge (Inggris)',
  'Institut Tenggara Singapura',
  'Universitas Tohoku Utara (Jepang)',
  'Universitas Rhein-Maas (Jerman)',
  'Universitas Pasifik Barat (AS)',
];

export const CAR: Record<RoleKey, string[]> = {
  keu: ['Dirjen Anggaran', 'Komisaris utama bank BUMN', 'Peneliti senior lembaga riset ekonomi', 'Direktur bank pembangunan daerah'],
  tan: ['Guru besar pertanian', 'Dirut BUMN pangan', 'Kepala badan logistik', 'Bupati penggerak lumbung desa'],
  eko: ['Ekonom lembaga keuangan internasional', 'Wakil ketua kamar dagang', 'Kepala badan perencanaan pembangunan', 'Dekan fakultas ekonomi'],
  dag: ['Gubernur dua periode', 'Sekjen kementerian', 'Bupati berprestasi', 'Anggota DPR komisi pemerintahan'],
  sos: ['Aktivis lembaga kemanusiaan', 'Kepala dinas sosial provinsi', 'Ketua yayasan panti asuhan', 'Anggota DPR komisi sosial'],
  han: ['Purnawirawan jenderal bintang tiga', 'Panglima komando wilayah', 'Atase pertahanan', 'Wakil kepala staf angkatan darat'],
  lun: ['Duta besar di tiga negara', 'Dirjen kerja sama multilateral', 'Juru runding perdagangan', 'Dosen hubungan internasional'],
  kes: ['Dokter spesialis & direktur RS', 'Dekan fakultas kedokteran', 'Kepala dinas kesehatan provinsi', 'Peneliti epidemiologi'],
  pdd: ['Rektor universitas negeri', 'Kepala dinas pendidikan', 'Pendiri sekolah vokasi', 'Guru besar pedagogi'],
  esd: ['Direktur utama BUMN energi', 'Insinyur perminyakan', 'Kepala badan energi daerah', 'Peneliti energi terbarukan'],
  set: ['Sekretaris kabinet', 'Kepala biro protokol Istana', 'Birokrat karier tiga pemerintahan', 'Juru bicara kepresidenan'],
};

export const AWARD = [
  'Penghargaan Tata Kelola Terbaik',
  'Tokoh Inspiratif Nusantara',
  'Bintang Jasa Utama',
  'Alumni Berprestasi',
  'Penghargaan Inovasi Pelayanan Publik',
  'Pegiat Reformasi Birokrasi',
];
