import type {
  CommodityDef,
  CommodityId,
  ExportMode,
  ImportMode,
  StockDef,
  TradeBaseDef,
  TradeModeDef,
} from '../types/game';

export const KOM: CommodityDef[] = [
  { id: 'beras', ic: '🍚', n: 'Beras', u: 'kg', b: 12500, v: 0.04, role: 'tan', d: 'Cadangan pangan. Stok beras meredam harga di pasar.' },
  { id: 'sawit', ic: '🌴', n: 'Sawit (CPO)', u: 'kg', b: 14800, v: 0.08, role: 'tan', d: 'Andalan ekspor perkebunan.' },
  { id: 'nikel', ic: '🪨', n: 'Nikel', u: 'ton', b: 280000000, v: 0.09, role: 'esd', d: 'Bahan baku baterai. Permintaan dunia tinggi.' },
  { id: 'emas', ic: '🥇', n: 'Emas', u: 'gram', b: 1450000, v: 0.06, role: 'keu', d: 'Safe haven. Naik saat dunia tak pasti.' },
  { id: 'minyak', ic: '🛢️', n: 'Minyak Mentah', u: 'barel', b: 1250000, v: 0.1, role: 'esd', d: 'Sangat bergejolak mengikuti geopolitik.' },
  { id: 'batubara', ic: '⚫', n: 'Batu Bara', u: 'ton', b: 1600000, v: 0.08, role: 'esd', d: 'Ekspor energi, harga musiman.' },
  { id: 'gas', ic: '🔥', n: 'Gas Alam', u: 'MMBtu', b: 95000, v: 0.09, role: 'esd', d: 'Energi bersih transisi.' },
  { id: 'kopi', ic: '☕', n: 'Kopi', u: 'kg', b: 62000, v: 0.08, role: 'tan', d: 'Ekspor khas Nusantara.' },
];

export const LOT_T = 10;
export const MK_CAP = 6;
export const MK_OPS = 4;
export const SP_BUY = 0.03;
export const SP_SELL = 0.04;

export const USD0 = 16200;
export const IHSG0 = 7000;
export const STK_LOT = 5;
export const STK_CAP = 6;

export const STK: StockDef[] = [
  { id: 'BNPK', n: 'Bank Nusantara Perkasa', sec: 'Perbankan', bumn: 1, p0: 5200, beta: 1.0, dy: 0.012, w: 0.18 },
  { id: 'BRGA', n: 'Bank Rakyat Garuda', sec: 'Perbankan', bumn: 1, p0: 4100, beta: 1.1, dy: 0.013, w: 0.14 },
  { id: 'TLNK', n: 'Telekomunikasi Nusa Link', sec: 'Telekomunikasi', bumn: 1, p0: 3300, beta: 0.7, dy: 0.015, w: 0.1 },
  { id: 'TMBR', n: 'Tambang Bumi Raya', sec: 'Pertambangan', p0: 2700, beta: 1.4, dy: 0.01, w: 0.1, kom: 'batubara' },
  { id: 'ENKR', n: 'Energi Khatulistiwa Raya', sec: 'Energi', bumn: 1, p0: 1850, beta: 1.2, dy: 0.011, w: 0.09, kom: 'minyak' },
  { id: 'ICMN', n: 'Indo Consumer Mart', sec: 'Konsumer', p0: 8900, beta: 0.6, dy: 0.01, w: 0.1 },
  { id: 'PLTM', n: 'Perkebunan Lestari Makmur', sec: 'Perkebunan', p0: 1450, beta: 1.0, dy: 0.008, w: 0.07, kom: 'sawit' },
  { id: 'KRBN', n: 'Karya Beton Nusantara', sec: 'Infrastruktur', bumn: 1, p0: 1120, beta: 1.3, dy: 0.006, w: 0.06 },
  { id: 'PHSB', n: 'Pharma Sehat Bangsa', sec: 'Kesehatan', p0: 2400, beta: 0.5, dy: 0.009, w: 0.06 },
  { id: 'TKNO', n: 'Teknologi Nusa Online', sec: 'Teknologi', p0: 340, beta: 1.7, dy: 0, w: 0.1 },
];

export const TRD0: Record<CommodityId, TradeBaseDef> = {
  beras: { ex: 0, im: 6, exTo: [], imFrom: ['Thailand', 'Vietnam', 'India'] },
  sawit: { ex: 26, im: 0, exTo: ['India', 'Tiongkok', 'Uni Eropa', 'Pakistan'], imFrom: [] },
  nikel: { ex: 22, im: 0, exTo: ['Tiongkok', 'Korea Selatan', 'Jepang'], imFrom: [] },
  emas: { ex: 8, im: 2, exTo: ['Swiss', 'Singapura', 'India'], imFrom: ['Australia'] },
  minyak: { ex: 5, im: 20, exTo: ['Jepang'], imFrom: ['Arab Saudi', 'Singapura', 'Nigeria'] },
  batubara: { ex: 30, im: 0, exTo: ['India', 'Tiongkok', 'Filipina', 'Vietnam'], imFrom: [] },
  gas: { ex: 12, im: 3, exTo: ['Jepang', 'Korea Selatan', 'Tiongkok'], imFrom: ['Qatar'] },
  kopi: { ex: 5, im: 0, exTo: ['Amerika Serikat', 'Jerman', 'Jepang'], imFrom: [] },
};

export const SHR = [0.42, 0.3, 0.18, 0.1] as const;

export const EXM: Record<ExportMode, TradeModeDef> = {
  buka: { vol: 1, tax: 0.015, n: 'Buka', d: 'Ekspor bebas, bea 1,5%' },
  pajak: { vol: 0.75, tax: 0.07, n: 'Pajak ekspor', d: 'Bea 7%, volume ekspor turun ±25%' },
  larang: { vol: 0.12, tax: 0, n: 'Larang', d: 'Ekspor nyaris berhenti, harga dalam negeri tertahan' },
};

export const IMM: Record<ImportMode, TradeModeDef> = {
  buka: { vol: 1, tax: 0.03, n: 'Buka', d: 'Impor bebas, bea 3%' },
  kuota: { vol: 0.5, tax: 0.03, n: 'Kuota', d: 'Impor dibatasi separuh' },
  larang: { vol: 0, tax: 0, n: 'Larang', d: 'Impor dihentikan' },
};

export const TD_MAXCHG = 3;
