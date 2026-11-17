import { KAS_T, UTG_T } from '../data/constants';
import {
  EXM,
  IHSG0,
  IMM,
  KOM,
  LOT_T,
  MK_CAP,
  MK_OPS,
  SP_BUY,
  SP_SELL,
  STK,
  STK_CAP,
  STK_LOT,
  TD_MAXCHG,
  TRD0,
  USD0,
} from '../data/markets';
import { toast } from '../rendering/effects';
import type {
  CommodityDef,
  CommodityId,
  CommodityMarketState,
  ExportMode,
  ImportMode,
  StockDef,
  StockMarketState,
  TradePolPair,
  TradeState,
} from '../types/game';
import { menkeu, minOf } from './cabinet';
import { nw, tag } from './mediaAndTrips';
import { addKas, apply, checkOver, log, seed } from './stats';
import { render, save, store } from './store';
import { clamp, fmtN, idr, rp, shuffle } from './utils';

export function mkInit(): CommodityMarketState {
  const o: CommodityMarketState = { p: {}, h: {}, st: {}, cost: {}, tin: 0, tout: 0, ops: 0, log: [], tr: {} };
  KOM.forEach((k) => {
    o.p[k.id] = k.b;
    o.h[k.id] = [k.b];
    o.st[k.id] = 0;
    o.cost[k.id] = 0;
    o.tr[k.id] = 0;
  });
  return o;
}

export function smInit(): StockMarketState {
  const o: StockMarketState = { p: {}, h: {}, hold: {}, cost: {}, usd: USD0, uh: [USD0], ih: [IHSG0], ret: 0, uret: 0 };
  STK.forEach((s) => {
    o.p[s.id] = s.p0;
    o.h[s.id] = [s.p0];
    o.hold[s.id] = 0;
    o.cost[s.id] = 0;
  });
  return o;
}

export function tdInit(): TradeState {
  const td: TradeState = { pol: {}, dem: {}, h: [], chg: 0, rev: 0, cex: 0, cim: 0, lar: {} };
  KOM.forEach((k) => {
    td.pol[k.id] = { ex: 'buka', im: 'buka' };
    td.dem[k.id] = 1;
  });
  return td;
}

export const lotVal = (k: CommodityDef): number => LOT_T * (store.S!.mk.p[k.id] / k.b);

export const komPct = (k: CommodityDef): number => {
  const h = store.S!.mk.h[k.id];
  return h.length < 2 ? 0 : Math.round((h[h.length - 1] / h[h.length - 2] - 1) * 100);
};

export function mkBuyCost(k: CommodityDef, n: number): number {
  return lotVal(k) * n * (1 + SP_BUY);
}

export function mkSellRev(k: CommodityDef, n: number): number {
  const m = minOf(k.role);
  return lotVal(k) * n * (1 - SP_SELL + (m.c - 3) * 0.01);
}

export function mkTrade(id: string, type: 'buy' | 'sell', n: number): void {
  const S = store.S;
  if (!S) return;
  const k = KOM.find((x) => x.id === id);
  if (!k || S.over) return;
  const M = S.mk;
  if (M.ops >= MK_OPS) {
    toast('Kuota transaksi kuartal ini habis (' + MK_OPS + ')');
    return;
  }
  if (type === 'buy') {
    const qty = Math.min(n, MK_CAP - M.st[id]);
    if (qty <= 0) {
      toast('Gudang ' + k.n + ' penuh (maks ' + MK_CAP + ' lot)');
      return;
    }
    const c = mkBuyCost(k, qty);
    if (S.kas - c / KAS_T < 5) {
      toast('Kas tidak cukup. Sisakan cadangan minimal.');
      return;
    }
    addKas('mkt', -c / KAS_T);
    M.tout += c;
    M.cost[id] += c;
    M.st[id] += qty;
    M.ops++;
    M.log.unshift({ q: S.q, id, t: 'buy', n: qty, v: c, pr: 0 });
    toast(k.ic + ' Beli ' + qty + ' lot ' + k.n + ' (' + rp(c) + ')');
  } else {
    const qty = Math.min(n, M.st[id]);
    if (qty <= 0) {
      toast('Stok ' + k.n + ' kosong');
      return;
    }
    const rev = mkSellRev(k, qty);
    const basis = M.cost[id] * (qty / M.st[id]);
    addKas('mkt', rev / KAS_T);
    M.tin += rev;
    M.cost[id] -= basis;
    M.st[id] -= qty;
    M.ops++;
    const pr = rev - basis;
    M.log.unshift({ q: S.q, id, t: 'sell', n: qty, v: rev, pr });
    toast(k.ic + ' Jual ' + qty + ' lot ' + k.n + ' (' + rp(rev) + (pr >= 0 ? ', untung ' : ', rugi ') + rp(Math.abs(pr)) + ')');
    if (Math.abs(pr) >= 8) {
      seed({
        t: 'mkt',
        h: (pr >= 0 ? 'Negara Raup Untung ' : 'Negara Rugi ') + rp(Math.abs(pr)) + ' dari Jual ' + k.n,
        s: pr >= 0 ? 'Penjualan di waktu yang tepat menambah kas.' : 'Pembeli menilai pemerintah salah momen.',
        tn: pr >= 0 ? 1 : -1,
      });
    }
  }
  M.log = M.log.slice(0, 14);
  checkOver();
  save();
  render();
}

export function opPasar(): void {
  const S = store.S;
  if (!S) return;
  const k = KOM[0];
  const M = S.mk;
  if (M.ops >= MK_OPS) {
    toast('Kuota transaksi kuartal ini habis');
    return;
  }
  if (M.st.beras < 1) {
    toast('Stok beras kosong. Beli dulu di Bursa.');
    return;
  }
  const basis = M.cost.beras / M.st.beras;
  const rev = lotVal(k) * 0.5;
  M.st.beras -= 1;
  M.cost.beras -= basis;
  M.ops++;
  addKas('mkt', rev / KAS_T);
  M.tin += rev;
  apply({ hrg: -6, rak: 1 });
  M.log.unshift({ q: S.q, id: 'beras', t: 'op', n: 1, v: rev, pr: rev - basis });
  log('🛒 Operasi pasar beras dari cadangan bursa');
  seed({ t: 'mkt', h: 'Operasi Pasar Beras Digelar, Harga Turun', s: 'Pemerintah melepas cadangan beras untuk menahan harga.', tn: 1 });
  toast('🛒 Operasi pasar: Harga −6, Rakyat +1');
  save();
  render();
}

export function mkShock(): void {
  const S = store.S;
  if (!S || !S.mk) return;
  const ks = shuffle(KOM).slice(0, 2);
  ks.forEach((k) => {
    const s = (Math.random() < 0.5 ? -1 : 1) * (0.08 + Math.random() * 0.1);
    S.mk.p[k.id] = Math.max(k.b * 0.55, Math.min(k.b * 1.9, S.mk.p[k.id] * (1 + s)));
  });
}

export const ihsg = (): number => IHSG0 * STK.reduce((a, s) => a + (s.w * store.S!.sm.p[s.id]) / s.p0, 0);
export const stkLot = (s: StockDef): number => STK_LOT * (store.S!.sm.p[s.id] / s.p0);
export const stkPct = (s: StockDef): number => {
  const h = store.S!.sm.h[s.id];
  return h.length < 2 ? 0 : Math.round((h[h.length - 1] / h[h.length - 2] - 1) * 1000) / 10;
};

export function usdState(u: number): [string, string, string] {
  return u < 16600
    ? ['Stabil', 'up', '🟢']
    : u < 17400
      ? ['Waspada', 'gd', '🟡']
      : u < 18600
        ? ['Tertekan', 'dn', '🟠']
        : ['Krisis', 'dn', '🔴'];
}

export function stkTrade(id: string, type: 'buy' | 'sell'): void {
  const S = store.S;
  if (!S) return;
  const s = STK.find((x) => x.id === id);
  const M = S.mk;
  const sm = S.sm;
  if (!s || S.over) return;
  if (M.ops >= MK_OPS) {
    toast('Kuota transaksi kuartal ini habis (' + MK_OPS + ')');
    return;
  }
  const v = stkLot(s);
  if (type === 'buy') {
    if (sm.hold[id] >= STK_CAP) {
      toast('Porsi ' + id + ' penuh (maks ' + STK_CAP + ' lot)');
      return;
    }
    const c = v * (1 + SP_BUY);
    if (S.kas - c / KAS_T < 5) {
      toast('Kas tidak cukup. Sisakan cadangan minimal.');
      return;
    }
    addKas('mkt', -c / KAS_T);
    M.tout += c;
    sm.cost[id] += c;
    sm.hold[id] += 1;
    M.ops++;
    sm.p[id] *= 1.012;
    M.log.unshift({ q: S.q, id, t: 'buy', n: 1, v: c, pr: 0, stk: 1 });
    toast('📈 Beli 1 lot ' + id + ' (' + rp(c) + ')');
  } else {
    if (sm.hold[id] < 1) {
      toast('Tidak ada saham ' + id);
      return;
    }
    const rev = v * (1 - SP_SELL);
    const basis = sm.cost[id] / sm.hold[id];
    addKas('mkt', rev / KAS_T);
    M.tin += rev;
    sm.cost[id] -= basis;
    sm.hold[id] -= 1;
    M.ops++;
    sm.p[id] *= 0.988;
    const pr = rev - basis;
    M.log.unshift({ q: S.q, id, t: 'sell', n: 1, v: rev, pr, stk: 1 });
    toast('📉 Jual 1 lot ' + id + ' (' + rp(rev) + (pr >= 0 ? ', untung ' : ', rugi ') + rp(Math.abs(pr)) + ')');
  }
  M.log = M.log.slice(0, 14);
  checkOver();
  save();
  render();
}

export function fxShock(): void {
  const S = store.S;
  if (!S || !S.sm) return;
  const s = (Math.random() < 0.6 ? 1 : -1) * (0.012 + Math.random() * 0.03);
  S.sm.usd = Math.max(14500, Math.min(24000, S.sm.usd * (1 + s)));
}

export function stEnd(): void {
  const S = store.S;
  if (!S || !S.sm) return;
  const sm = S.sm;
  const u0 = sm.usd;
  const anchor =
    USD0 *
    (1 +
      (S.utg - 20) / 200 +
      (50 - S.eko) / 300 +
      (S.kas < 25 ? 0.04 : 0) +
      (S.stb < 40 ? 0.02 : 0) +
      (S.rak < 35 ? 0.015 : 0));
  let u = u0 + (anchor - u0) * 0.2 + u0 * ((Math.random() - 0.5) * 0.06);
  u = Math.max(14500, Math.min(24000, u));
  sm.uret = u / u0 - 1;
  sm.usd = u;
  sm.uh.push(u);
  if (sm.uh.length > 9) sm.uh.shift();

  const mkt =
    (S.eko - 50) / 330 +
    (S.stb - 50) / 700 +
    (S.rak - 50) / 700 +
    (S.kas < 20 ? -0.03 : 0) -
    Math.max(0, u / USD0 - 1) * 0.5 +
    (Math.random() + Math.random() + Math.random() - 1.5) * 0.07 +
    (Math.random() < 0.04 ? -0.1 : 0);

  STK.forEach((s) => {
    let r = s.beta * mkt + (Math.random() - 0.5) * 0.07;
    if (s.kom) {
      const h = S.mk.h[s.kom];
      if (h.length > 1) r += (h[h.length - 1] / h[h.length - 2] - 1) * 0.35;
    }
    const p = Math.max(s.p0 * 0.35, Math.min(s.p0 * 2.6, sm.p[s.id] * (1 + r)));
    sm.p[s.id] = p;
    sm.h[s.id].push(p);
    if (sm.h[s.id].length > 9) sm.h[s.id].shift();
  });

  const ih = ihsg();
  const prev = sm.ih[sm.ih.length - 1];
  sm.ret = ih / prev - 1;
  sm.ih.push(ih);
  if (sm.ih.length > 9) sm.ih.shift();

  let div = 0;
  STK.forEach((s) => {
    div += stkLot(s) * sm.hold[s.id] * s.dy;
  });
  if (div > 0) {
    addKas('mkt', div / KAS_T);
    S.mk.tin += div;
  }

  S.hrg = clamp(S.hrg + Math.max(-1, Math.min(5, (u / USD0 - 1) * 15)));
  S.eko = clamp(S.eko + Math.max(-1.5, Math.min(1, sm.ret * 10)));

  if (Math.abs(sm.ret) >= 0.04) {
    seed({
      t: 'mkt',
      h: 'IHSG ' + (sm.ret > 0 ? 'Menguat ' : 'Melemah ') + Math.abs(Math.round(sm.ret * 1000) / 10) + '% ke ' + fmtN(ih),
      s: sm.ret > 0 ? 'Investor asing kembali masuk.' : 'Aksi jual melanda bursa.',
      tn: sm.ret > 0 ? 1 : -1,
    });
  }
  const us = usdState(u);
  if (us[0] === 'Tertekan' || us[0] === 'Krisis') {
    seed({
      t: 'mkt',
      h: 'Rupiah ' + us[0] + ': ' + idr(Math.round(u)) + '/USD',
      s: 'Pasar menunggu langkah Menkeu dan bank sentral.',
      tn: -1,
    });
  }

  S.fxUsed = false;
  S.fxAlert = null;
  if (u >= 17400 || sm.uret >= 0.04) S.fxAlert = { t: 'kurs', q: S.q };
  else if (sm.ret <= -0.09) S.fxAlert = { t: 'ihsg', q: S.q };
}

export interface FxOptDef {
  id: string;
  ic: string;
  t: string;
  d: string;
}

export function fxOpts(t: 'kurs' | 'ihsg'): FxOptDef[] {
  return t === 'ihsg'
    ? [
        {
          id: 'bumn',
          ic: '🏦',
          t: 'Dana negara beli saham BUMN',
          d: 'Rp ' + fmtN(3 * KAS_T) + ' T dari kas. Saham BUMN naik ±4%, IHSG ikut terangkat.',
        },
        {
          id: 'ojk',
          ic: '📣',
          t: 'Minta OJK tenangkan pasar & perketat transaksi',
          d: 'Gratis. IHSG pulih ±2%, hasil bisa meleset.',
        },
        { id: 'diam', ic: '⏳', t: 'Pantau dulu, belum bertindak', d: 'Tidak ada biaya. Pasar menentukan sendiri.' },
      ]
    : [
        {
          id: 'devisa',
          ic: '💵',
          t: 'Intervensi pasar valas (jual cadangan devisa)',
          d: 'Rp ' + fmtN(5 * KAS_T) + ' T dari kas. Rupiah menguat ±3%, lebih ampuh bila Menkeu kompeten.',
        },
        {
          id: 'bunga',
          ic: '🏛️',
          t: 'Dorong bank sentral naikkan suku bunga',
          d: 'Rupiah menguat ±2,5%, tapi Ekonomi −2 dan Rakyat −1.',
        },
        {
          id: 'sbn',
          ic: '📜',
          t: 'Terbitkan SBN valas',
          d: 'Kas +' + rp(4 * KAS_T) + ', utang +' + rp(UTG_T) + '. Rupiah menguat ±1,5%.',
        },
        {
          id: 'pasar',
          ic: '🎤',
          t: 'Konferensi pers: yakinkan pasar',
          d: 'Gratis. 55% berhasil menenangkan pasar (±1%).',
        },
        { id: 'diam', ic: '⏳', t: 'Pantau dulu, belum bertindak', d: 'Tidak ada biaya. Pasar menentukan sendiri.' },
      ];
}

export function fxDo(id: string): void {
  const S = store.S;
  if (!S || S.over) return;
  const sm = S.sm;
  const m = menkeu();
  const mu = 1 + (m.c - 3) * 0.15;
  if (id !== 'diam' && S.fxUsed) {
    toast('Tindak lanjut kuartal ini sudah dipakai');
    return;
  }
  let msg = '';
  if (id === 'devisa') {
    if (S.kas < 5 + 6) {
      toast('Kas tidak cukup untuk intervensi');
      return;
    }
    addKas('mkt', -5);
    sm.usd *= 1 - 0.03 * mu;
    msg = 'Intervensi valas: Rupiah menguat';
  } else if (id === 'bunga') {
    sm.usd *= 1 - 0.025 * mu;
    apply({ eko: -2, rak: -1 });
    msg = 'Suku bunga naik: Rupiah menguat, Ekonomi −2';
  } else if (id === 'sbn') {
    addKas('mkt', 4);
    S.utg += 1;
    sm.usd *= 1 - 0.015 * mu;
    msg = 'SBN valas terbit: kas +' + rp(4 * KAS_T);
  } else if (id === 'pasar') {
    if (Math.random() < 0.55) {
      sm.usd *= 1 - 0.01 * mu;
      msg = 'Pasar tenang kembali';
    } else {
      msg = 'Pasar tidak terlalu percaya';
    }
  } else if (id === 'bumn') {
    if (S.kas < 3 + 6) {
      toast('Kas tidak cukup');
      return;
    }
    addKas('mkt', -3);
    STK.filter((s) => s.bumn).forEach((s) => {
      sm.p[s.id] *= 1 + 0.04 * mu;
    });
    msg = 'Dana negara masuk saham BUMN';
  } else if (id === 'ojk') {
    STK.forEach((s) => {
      sm.p[s.id] *= 1 + (Math.random() < 0.65 ? 0.02 : -0.005);
    });
    msg = 'OJK turun tangan menenangkan pasar';
  } else if (id === 'diam') {
    msg = '';
  }

  sm.usd = Math.max(14500, Math.min(24000, sm.usd));
  sm.uh[sm.uh.length - 1] = sm.usd;
  sm.ih[sm.ih.length - 1] = ihsg();
  if (id !== 'diam') {
    S.fxUsed = true;
    S.stat.dipl = (S.stat.dipl || 0) + 1;
    log('💱 ' + msg);
    seed({
      t: 'mkt',
      h: msg + ' (' + idr(Math.round(sm.usd)) + '/USD)',
      s: 'Langkah pemerintah diumumkan setelah rapat dengan Menkeu.',
      tn: 1,
    });
  }
  S.fxAlert = null;
  if (msg) toast('💱 ' + msg);
  checkOver();
  save();
  render();
}

export function fxClose(): void {
  if (!store.S) return;
  store.S.fxAlert = null;
  save();
  render();
}

export function sdaIdx(): number {
  const S = store.S;
  if (!S || !S.mk) return 1;
  let s = 0;
  let n = 0;
  (['batubara', 'nikel', 'minyak', 'gas', 'sawit'] as CommodityId[]).forEach((i) => {
    const k = KOM.find((x) => x.id === i);
    if (k && S.mk.p[i]) {
      s += S.mk.p[i] / k.b;
      n++;
    }
  });
  return n ? s / n : 1;
}

function ensureTd(): void {
  const S = store.S;
  if (!S || !S.mk) return;
  if (!S.td) {
    S.td = tdInit();
  }
}

export function tdBase(): void {
  const S = store.S;
  if (!S) return;
  ensureTd();
  if (!S.td.base) {
    S.td.base = {};
    KOM.forEach((k) => {
      S.td.base![k.id] = { ex: S.td.pol[k.id].ex, im: S.td.pol[k.id].im };
    });
  }
}

export function tdChg(): number {
  const S = store.S!;
  tdBase();
  let n = 0;
  KOM.forEach((k) => {
    (['ex', 'im'] as const).forEach((x) => {
      if (S.td.pol[k.id][x] !== S.td.base![k.id][x]) n++;
    });
  });
  return n;
}

export function tdCalc(id: CommodityId, pol: TradePolPair, dem?: number): { ex: number; im: number; tax: number } {
  const S = store.S!;
  const k = KOM.find((x) => x.id === id)!;
  const b = TRD0[id];
  const pr = S.mk.p[id] / k.b;
  const lun = 1 + (minOf('lun').c - 3) * 0.04;
  const ex = b.ex * pr * (dem == null ? S.td.dem[id] : dem) * (0.8 + S.eko / 250) * lun * EXM[pol.ex].vol;
  const im = b.im * pr * (0.8 + S.hrg / 150) * IMM[pol.im].vol;
  return { ex, im, tax: ex * EXM[pol.ex].tax + im * IMM[pol.im].tax };
}

export function tdTotal(): { ex: number; im: number; tax: number; net: number } {
  const S = store.S!;
  ensureTd();
  let ex = 0;
  let im = 0;
  let tax = 0;
  KOM.forEach((k) => {
    const c = tdCalc(k.id, S.td.pol[k.id]);
    ex += c.ex;
    im += c.im;
    tax += c.tax;
  });
  return { ex, im, tax, net: ex - im };
}

export function tdSet(id: CommodityId, kind: 'ex' | 'im', v: ExportMode | ImportMode): void {
  const S = store.S;
  if (!S || S.over) return;
  tdBase();
  const T = S.td;
  const P = T.pol[id];
  if (P[kind] === v) return;
  const was = P[kind] !== T.base![id][kind];
  const will = v !== T.base![id][kind];
  const n = tdChg() + (will && !was ? 1 : 0) - (!will && was ? 1 : 0);
  if (n > TD_MAXCHG) {
    T.msg =
      '⚠️ Kuota ganti kebijakan dagang kuartal ini habis (' +
      TD_MAXCHG +
      '). Kembalikan salah satu perubahan ke pilihan awal, atau tunggu kuartal depan.';
    toast('Kuota ganti kebijakan dagang habis');
    render();
    return;
  }
  if (kind === 'ex') {
    P.ex = v as ExportMode;
  } else {
    P.im = v as ImportMode;
  }
  T.msg = '';
  const k = KOM.find((x) => x.id === id)!;
  const modeName = kind === 'ex' ? EXM[v as ExportMode].n : IMM[v as ImportMode].n;
  if (will) {
    log('🚢 Kebijakan ' + (kind === 'ex' ? 'ekspor' : 'impor') + ' ' + k.n + ': ' + modeName);
    if (kind === 'ex' && v === 'larang') {
      nw('garuda', 'Pemerintah Larang Ekspor ' + k.n, 'Eksportir dan mitra dagang bereaksi keras. Harga dalam negeri diharapkan stabil.', -1);
    } else if (kind === 'ex' && v === 'pajak') {
      nw('garuda', 'Bea Ekspor ' + k.n + ' Dinaikkan 7%', 'Pengusaha menilai margin menipis, kas negara berharap tambahan penerimaan.', 0);
    } else if (kind === 'im' && k.id === 'beras' && v === 'buka') {
      nw('kritik', 'Keran Impor Beras Dibuka', 'Petani khawatir harga gabah anjlok.', -1);
    } else if (kind === 'im' && v === 'larang') {
      nw('garuda', 'Impor ' + k.n + ' Dihentikan', 'Pelaku usaha mengingatkan risiko kelangkaan pasokan.', -1);
    }
  }
  T.chg = tdChg();
  toast(
    '🚢 ' +
      k.n +
      ': ' +
      (kind === 'ex' ? 'ekspor' : 'impor') +
      ' → ' +
      modeName +
      ' (' +
      (TD_MAXCHG - T.chg) +
      ' perubahan tersisa)',
  );
  save();
  render();
}

export function tdEnd(): void {
  const S = store.S;
  if (!S) return;
  ensureTd();
  const T = S.td;
  if (!T) return;

  KOM.forEach((k) => {
    T.dem[k.id] = Math.max(0.8, Math.min(1.25, T.dem[k.id] + (Math.random() - 0.5) * 0.16 + (1 - T.dem[k.id]) * 0.2));
  });
  const prev = T.h.length ? T.h[T.h.length - 1] : null;
  let ex = 0;
  let im = 0;
  let tax = 0;
  const d: Record<string, { ex: number; im: number }> = {};

  KOM.forEach((k) => {
    const P = T.pol[k.id];
    const c = tdCalc(k.id, P);
    ex += c.ex;
    im += c.im;
    tax += c.tax;
    d[k.id] = { ex: c.ex, im: c.im };

    if (P.ex === 'larang') {
      T.lar[k.id] = (T.lar[k.id] || 0) + 1;
      apply({ eko: -0.6 });
      if (k.id === 'sawit' || k.id === 'beras') S.hrg = clamp(S.hrg - 0.8);
      if (T.lar[k.id] >= 2 && Math.random() < 0.5) {
        apply({ eko: -1.2 });
        nw('garuda', 'Mitra Dagang Protes Larangan Ekspor ' + k.n, 'Negosiasi dagang memanas, ancaman gugatan ke WTO.', -1);
      }
    } else {
      T.lar[k.id] = 0;
    }
    if (P.ex === 'pajak') apply({ eko: -0.2 });
    if (k.id === 'beras') {
      if (P.im === 'buka') {
        S.hrg = clamp(S.hrg - 0.6);
        apply({ rak: -0.2 });
      } else if (P.im === 'kuota') {
        S.hrg = clamp(S.hrg + 0.4);
      } else if (S.mk.st.beras < 1) {
        S.hrg = clamp(S.hrg + 1.6);
      }
    }
    if (k.id === 'minyak') {
      if (P.im === 'larang') {
        S.hrg = clamp(S.hrg + 3);
        apply({ eko: -1.5, stb: -1 });
        nw('viral', 'BBM Langka, Antrean SPBU Mengular ' + tag('BBMLangka'), 'Warga mengeluh pasokan terhambat.', -1);
      } else if (P.im === 'kuota') {
        S.hrg = clamp(S.hrg + 1);
        apply({ eko: -0.4 });
      }
    }
  });

  const net = ex - im;
  if (tax > 0) addKas('trd', tax / KAS_T);
  T.rev += tax;
  T.cex += ex;
  T.cim += im;
  if (S.sm) {
    S.sm.usd = Math.max(14500, Math.min(24000, S.sm.usd * (1 - ((net - 65) / 65) * 0.008)));
  }
  T.h.push({ q: S.q, ex, im, net, tax, d });
  if (T.h.length > 8) T.h.shift();
  T.chg = 0;

  if (net < 0) nw('garuda', 'Neraca Perdagangan Defisit ' + rp(-net), 'Impor melampaui ekspor, rupiah berpotensi tertekan.', -1);
  else if (net > 110) nw('garuda', 'Surplus Perdagangan Capai ' + rp(net), 'Ekspor komoditas mendorong devisa.', 1);
  if (prev) {
    let best: CommodityDef | null = null;
    let bv = 0;
    KOM.forEach((k) => {
      const a = prev.d[k.id] ? prev.d[k.id].ex : 0;
      const b2 = d[k.id].ex;
      if (a > 3) {
        const r = b2 / a - 1;
        if (Math.abs(r) > Math.abs(bv)) {
          bv = r;
          best = k;
        }
      }
    });
    if (best && Math.abs(bv) >= 0.12) {
      const bestK = best as CommodityDef;
      const b = TRD0[bestK.id];
      const to = b.exTo[0] || 'pasar dunia';
      nw(
        'garuda',
        'Ekspor ' + bestK.n + ' ke ' + to + (bv > 0 ? ' Melonjak ' : ' Merosot ') + Math.abs(Math.round(bv * 100)) + '%',
        bv > 0 ? 'Permintaan dunia dan harga mendukung.' : 'Harga dan permintaan melemah.',
        bv > 0 ? 1 : -1,
      );
    }
  }

  // v3.6 commodity royalty windfall wrapper
  const wf = (sdaIdx() - 1) * 24;
  if (Math.abs(wf) > 0.01) {
    addKas('trd', wf / KAS_T);
    T.rev += Math.max(0, wf);
    if (T.h.length) T.h[T.h.length - 1].wf = wf;
    if (wf > 4) {
      nw('garuda', 'Harga Komoditas Naik, Royalti & PNBP Tambah ' + rp(wf), 'Penerimaan dari sumber daya alam melampaui perkiraan.', 1);
    } else if (wf < -4) {
      nw(
        'garuda',
        'Harga Komoditas Turun, PNBP Sumber Daya Alam Seret ' + rp(-wf),
        'Kas negara kehilangan pemasukan dari royalti tambang dan sawit.',
        -1,
      );
    }
  }
  T.base = null;
  T.chg = 0;
  T.msg = '';
}

export function mkEnd(): void {
  const S = store.S;
  if (!S || !S.mk) return;
  const M = S.mk;
  let stor = 0;
  KOM.forEach((k) => {
    const old = M.p[k.id];
    M.tr[k.id] = M.tr[k.id] * 0.6 + (Math.random() - 0.5) * 0.04;
    let p = old * (1 + M.tr[k.id] + k.v * (Math.random() - 0.5) * 2.4) + (k.b - old) * 0.1;
    p = Math.max(k.b * 0.55, Math.min(k.b * 1.9, p));
    M.p[k.id] = p;
    M.h[k.id].push(p);
    if (M.h[k.id].length > 9) M.h[k.id].shift();
    stor += lotVal(k) * M.st[k.id] * (k.id === 'beras' ? 0.005 : 0.012);
    const ch = p / old - 1;
    if (Math.abs(ch) >= 0.12) {
      seed({
        t: 'mkt',
        h: 'Harga ' + k.n + (ch > 0 ? ' Melonjak ' : ' Anjlok ') + Math.abs(Math.round(ch * 100)) + '%',
        s: ch > 0 ? 'Pelaku pasar berebut stok.' : 'Para eksportir menjerit.',
        tn: 0,
      });
    }
  });
  if (stor > 0) {
    addKas('mkt', -stor / KAS_T);
    M.tout += stor;
  }
  if (M.st.beras > 0) S.hrg = clamp(S.hrg - Math.min(4, 1.2 * M.st.beras));
  M.ops = 0;
  tdEnd();
  stEnd();
}

export interface UnrealizedRow {
  k: CommodityDef;
  st: number;
  val: number;
  cost: number;
  pl: number;
}

export function unrealRows(): UnrealizedRow[] {
  const S = store.S!;
  return KOM.filter((k) => S.mk.st[k.id] > 0).map((k) => {
    const st = S.mk.st[k.id];
    const val = lotVal(k) * st;
    const cost = S.mk.cost[k.id];
    return { k, st, val, cost, pl: val - cost };
  });
}
