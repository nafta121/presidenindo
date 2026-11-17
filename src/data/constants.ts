import type {
  AgendaKey,
  AllStatKey,
  EventCategory,
  NavGroupKey,
  SeasonDef,
  StatKey,
  TabKey,
} from '../types/game';

export const KEY = 'presiden_ri_v3';
export const GUIDE_KEY = 'presiden_ri_guide';

export const KAS_T = 8;
export const UTG_T = 30;
export const UTG_BASE = 7400;

export const LBL: Record<AllStatKey, string> = {
  rak: 'Rakyat',
  eko: 'Ekonomi',
  kas: 'Kas',
  hrg: 'Harga',
  stb: 'Stabilitas',
  kol: 'DPR',
  utg: 'Utang',
  ipk: 'Integritas',
};

export const STAT: Array<[StatKey, string, string]> = [
  ['rak', '🙂', 'Kepercayaan Rakyat'],
  ['eko', '📈', 'Ekonomi'],
  ['kas', '🏦', 'Kas Negara'],
  ['hrg', '🍚', 'Tekanan Harga'],
  ['stb', '🛡️', 'Stabilitas'],
  ['kol', '🏛️', 'Dukungan DPR'],
];

export const SEATS = 580;
export const COALITION0 = [0, 1, 2, 6];

export const AGN: Record<number, AgendaKey> = {
  6: 'pil1',
  11: 'pil2',
  18: 'pemilu',
};

export const AGN_T: Record<AgendaKey, string> = {
  pil1: 'Pilkada Serentak I (provinsi)',
  pil2: 'Pilkada Serentak II (kabupaten/kota)',
  pemilu: 'Pemilu Serentak (Pilpres & Pileg)',
};

export const SEAS: SeasonDef[] = [
  { ic: '🎊', n: 'Awal Tahun Anggaran', d: 'Realisasi pajak awal tahun masuk kas.', f: { kas: 3 }, m: 'Jan–Mar' },
  { ic: '🌙', n: 'Idulfitri & Arus Mudik', d: 'THR cair, harga pangan naik, jutaan warga mudik.', f: { hrg: 4, rak: 1, kas: -2 }, m: 'Apr–Jun' },
  { ic: '🇮🇩', n: 'HUT Kemerdekaan & Sidang Tahunan', d: 'Upacara, panjat pinang, semangat nasional.', f: { rak: 2, stb: 1 }, m: 'Jul–Sep' },
  { ic: '🎄', n: 'Natal & Tahun Baru', d: 'Libur panjang, konsumsi naik, harga merangkak.', f: { hrg: 3, eko: 1 }, m: 'Okt–Des' },
];

export const CAT: Record<EventCategory, [string, string]> = {
  dn: ['🇮🇩 DALAM NEGERI', '#e03a3e'],
  ln: ['🌍 LUAR NEGERI', '#2f6fe0'],
  ag: ['🗳️ AGENDA POLITIK', '#8a4fe0'],
};

export const SUP = 'Support by Oktacool';

export const NAV: Array<[NavGroupKey, string, string, TabKey[]]> = [
  ['ev', '📰', 'Kejadian', ['ev']],
  ['kel', '🏗️', 'Kelola', ['pol', 'prg', 'ang']],
  ['bur', '📈', 'Bursa', ['sah', 'kurs', 'bur']],
  ['pel', '🏛️', 'Politik', ['kab', 'par', 'hkm', 'mhk', 'apr']],
  ['kas', '⚖️', 'Kasus', ['kas']],
  ['lain', '📅', 'Lainnya', ['pet', 'med', 'ker', 'agn', 'jan']],
];

export const SUBN: Record<TabKey, string> = {
  bur: 'Komoditas',
  sah: 'Saham',
  kurs: 'Kurs',
  med: 'Media',
  ker: 'Kunjungan',
  ev: 'Kejadian',
  pol: 'Kebijakan',
  prg: 'Program',
  ang: 'Kas & APBN',
  kab: 'Kabinet',
  par: 'Partai',
  kas: 'Kasus',
  pet: 'Peta',
  hkm: 'UU & DPR',
  mhk: 'MK & MA',
  apr: 'TNI/Polri',
  agn: 'Agenda',
  jan: 'Janji',
};

export const SKIN = ['#f4d2b0', '#e6b48a', '#cf9468', '#b27a50', '#8f5d3a'];
export const HAIRC = ['#1b1412', '#2a1d17', '#3b2a20', '#5a4636', '#8c8c8c'];
export const HJC = ['#c0262d', '#2f6b5a', '#7a4a9a', '#d98a2b', '#2f5a9a', '#e0589c'];
export const SHC = ['#7a3b2a', '#2f4a7a', '#1f6b52', '#8a5a2a', '#5a2f6b', '#6b2f3a'];
