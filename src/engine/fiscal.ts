import { KAS_T, UTG_BASE, UTG_T } from '../data/constants';
import { NEED_T } from '../data/policies';
import { PRG } from '../data/programs';
import type { FiscalSnapshot, FlowKey, LedgerState, QuarterReport } from '../types/game';
import { menkeu } from './cabinet';
import { sdaIdx, tdTotal } from './market';
import { polCost } from './stats';
import { store } from './store';

export { menkeu, polCost };

export function dFactor(): number {
  const S = store.S!;
  return [0.95, 1.45, 2.0][S.diff === undefined ? 1 : S.diff];
}

export function rbSum(): number {
  const S = store.S!;
  return S.rb.pajak + S.rb.pnbp + S.rb.bea;
}

export function kasDelta(): number {
  const S = store.S!;
  const D = dFactor();
  const m = menkeu();
  const A = 6.0 + (S.eko - 50) / 12 + (m.c - 3) * 0.4 + rbSum();
  const B = 5.6 + 1.6 * D + S.utg * 0.05 - S.rb.hemat;
  return A - B;
}

export function kasTrend(): number {
  const S = store.S!;
  let v = kasDelta();
  PRG.forEach((p) => {
    if (p.y.kas && S.prg[p.id] > 0) v += (p.y.kas * S.prg[p.id]) / 100;
  });
  return v;
}

export const needsMenkeu = (cost: number, debt: number): boolean => cost >= NEED_T || debt > 0;

export function menkeuReserve(): number {
  const m = menkeu();
  return 16 + (m.c - 3) * 4 + Math.max(0, -kasTrend()) * 2;
}

export interface MenkeuReview {
  ok: boolean;
  why?: 'kas' | 'utang';
  reserve: number;
  after: number;
}

export function menkeuView(cost: number, debt: number): MenkeuReview {
  const S = store.S!;
  const reserve = menkeuReserve();
  const after = S.kas - cost;
  if (cost >= NEED_T && after < reserve) return { ok: false, why: 'kas', reserve, after };
  if (debt > 0 && S.utg + debt > 50) return { ok: false, why: 'utang', reserve, after };
  return { ok: true, reserve, after };
}

export function fiscal(): FiscalSnapshot {
  const S = store.S!;
  const rb = S.rb;
  const pend = 740 + (S.eko - 50) * 5;
  const pajak = pend * 0.7 + rb.pajak * KAS_T;
  const bea = pend * 0.09 + rb.bea * KAS_T;
  const pnbp = pend * 0.21 + rb.pnbp * KAS_T;
  const inc = pajak + bea + pnbp;
  const netT = kasTrend() * KAS_T;
  const bel = inc - netT;
  const bunga = ((UTG_BASE + S.utg * UTG_T) * 0.05) / 4;
  const rest = Math.max(0, bel - bunga);
  return {
    pajak,
    bea,
    pnbp,
    inc,
    netT,
    bel,
    bunga,
    pegawai: rest * 0.25,
    subsidi: rest * 0.25,
    transfer: rest * 0.3,
    hankam: rest * 0.12,
    lain: rest * 0.08,
  };
}

export interface FiscalDetailBreakdown {
  f: FiscalSnapshot;
  sda: number;
  tt: { ex: number; im: number; tax: number; net: number };
  pajak: Array<[string, number]>;
  bea: Array<[string, number]>;
  pnbp: Array<[string, number]>;
  dag: Array<[string, number]>;
  bel: Array<[string, number, string]>;
}

export function fiscalDetail(): FiscalDetailBreakdown {
  const f = fiscal();
  const sda = sdaIdx();
  const tt = tdTotal();
  const ws: Array<[string, number]> = [
    ['Migas (lifting minyak & gas)', 0.22 * sda],
    ['Minerba (royalti batu bara & nikel)', 0.26 * sda],
    ['Dividen BUMN', 0.24],
    ['Layanan, BLU, & PNBP lainnya', 0.28],
  ];
  const wsum = ws.reduce((a, b) => a + b[1], 0);
  return {
    f,
    sda,
    tt,
    pajak: [
      ['PPN & PPnBM', f.pajak * 0.46],
      ['PPh Badan (perusahaan)', f.pajak * 0.26],
      ['PPh Orang Pribadi & Pasal 21', f.pajak * 0.16],
      ['PBB, BPHTB & pajak lainnya', f.pajak * 0.12],
    ],
    bea: [
      ['Cukai rokok, minuman manis, alkohol', f.bea * 0.62],
      ['Bea masuk impor rutin', f.bea * 0.38],
    ],
    pnbp: ws.map((w) => [w[0], (f.pnbp * w[1]) / wsum]),
    dag: [
      ['Bea ekspor-impor dari kebijakan dagang', tt.tax],
      ['Windfall / selisih harga komoditas (royalti)', (sda - 1) * 24],
    ],
    bel: [
      ['Gaji & operasional ASN', f.pegawai, 'gaji pokok, tunjangan, operasional kementerian'],
      ['Bunga utang', f.bunga, 'naik bersama total utang'],
      ['Subsidi & perlindungan sosial', f.subsidi, 'BBM, listrik, pupuk, bansos'],
      ['Transfer daerah & dana desa', f.transfer, 'DAU, DAK, dana desa'],
      ['Pertahanan & keamanan', f.hankam, 'TNI, Polri, alutsista'],
      ['Belanja lainnya', f.lain, 'kesehatan, pendidikan, lembaga negara'],
    ],
  };
}

export function ledInit(): LedgerState {
  return { n: 0, pajak: 0, bea: 0, pnbp: 0, bel: 0, pol: 0, prg: 0, evt: 0, rec: 0, trip: 0, mkt: 0, trd: 0 };
}

export function ledAdd(r: QuarterReport): void {
  const S = store.S;
  if (!S) return;
  if (!S.led) S.led = ledInit();
  const L = S.led;
  const f = r.fs;
  L.n++;
  L.pajak += f.pajak;
  L.bea += f.bea;
  L.pnbp += f.pnbp;
  L.bel += f.bel;
  (['pol', 'prg', 'evt', 'rec', 'trip', 'mkt', 'trd'] as FlowKey[]).forEach((k) => {
    L[k] += (r[k] || 0) * KAS_T;
  });
}
