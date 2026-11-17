import { SEATS } from '../data/constants';
import { PARTIES, ROLES } from '../data/parties';
import { TECH_MULT } from '../data/policies';
import { coalSeats, JANJI, progDone } from '../data/promises';
import type { AllStatKey, EffectMap, FlowKey, NewsSeed, RoleKey, StatKey } from '../types/game';
import { store } from './store';
import { clamp, rnd, utgRp } from './utils';

export { coalSeats, progDone };

export function snap(): Record<StatKey, number> {
  const S = store.S!;
  return { rak: S.rak, eko: S.eko, kas: S.kas, hrg: S.hrg, stb: S.stb, kol: S.kol };
}

export function getTermQuarter(): { th: number; kw: number } {
  const S = store.S!;
  return { th: Math.floor(S.q / 4) + 1, kw: (S.q % 4) + 1 };
}

export function recalc(): void {
  const S = store.S;
  if (!S) return;
  const co = S.par.filter((p) => p.k);
  const seats = co.reduce((a, p) => a + PARTIES[S.par.indexOf(p)].seat, 0);
  const ws = co.length ? co.reduce((a, p) => a + PARTIES[S.par.indexOf(p)].seat * p.s, 0) / seats : 0;
  S.kol = clamp(ws * Math.min(1.05, Math.max(0.55, seats / SEATS / 0.55)));
}

export function log(t: string): void {
  const S = store.S;
  if (!S) return;
  S.log.push(t);
  if (S.log.length > 30) S.log.shift();
}

export function note(t: string): void {
  const S = store.S;
  if (!S) return;
  S.notes.push(t);
  log(t);
}

export function seed(s: NewsSeed): void {
  const S = store.S;
  if (!S) return;
  if (!S.seeds) S.seeds = [];
  S.seeds.push(s);
}

export const net = (f: EffectMap): number =>
  Object.entries(f).reduce((a, [k, v]) => a + (k === 'hrg' || k === 'utg' ? -(v || 0) : v || 0), 0);

export const polCost = (p: { f: EffectMap }): number => Math.max(0, -(p.f.kas || 0));

export function apply(f: EffectMap): void {
  const S = store.S;
  if (!S) return;
  for (const [k, v] of Object.entries(f) as Array<[AllStatKey, number | undefined]>) {
    if (v === undefined) continue;
    if (k === 'kol') {
      S.par.forEach((p) => {
        if (p.k) p.s = clamp(p.s + v + rnd(-2, 2));
      });
    } else if (k === 'utg') {
      S.utg = Math.max(0, S.utg + v);
    } else {
      S[k] = clamp(S[k] + v);
    }
  }
  recalc();
}

export function applyTrack(f: EffectMap, src: FlowKey): void {
  const S = store.S!;
  const k0 = S.kas;
  apply(f);
  S.fl[src] = (S.fl[src] || 0) + (S.kas - k0);
}

export function addKas(src: FlowKey, pts: number): void {
  const S = store.S!;
  const k0 = S.kas;
  S.kas = clamp(S.kas + pts);
  S.fl[src] = (S.fl[src] || 0) + (S.kas - k0);
}

export function scaleLn(f: EffectMap): EffectMap {
  const S = store.S!;
  const m = S.men.find((x) => x.k === 'lun')!;
  const r = 1 - (m.c - 3) * 0.1;
  const o: EffectMap = {};
  for (const [k, v] of Object.entries(f) as Array<[AllStatKey, number | undefined]>) {
    if (v === undefined) continue;
    const bad = k === 'hrg' || k === 'utg' ? v > 0 : v < 0;
    o[k] = bad ? Math.sign(v) * Math.max(1, Math.round(Math.abs(v) * r)) : v;
  }
  return o;
}

export function scaleF(f: EffectMap, s: number): EffectMap {
  const o: EffectMap = {};
  for (const [k, v] of Object.entries(f) as Array<[AllStatKey, number | undefined]>) {
    if (v === undefined) continue;
    if (s === 1) {
      o[k] = v;
      continue;
    }
    if (k === 'kas' || k === 'utg') {
      o[k] = Math.round(v * s * 10) / 10;
    } else {
      const w = Math.round(v * s);
      o[k] = w === 0 && v !== 0 ? Math.sign(v) : w;
    }
  }
  return o;
}

export const roleIdx = (k: RoleKey): number => ROLES.findIndex((r) => r.k === k);
export const techMult = (c: number): number => TECH_MULT[Math.max(1, Math.min(5, c)) - 1];

export function techF(f: EffectMap, role?: RoleKey): EffectMap {
  if (!role || !store.S) return f;
  const m = store.S.men[roleIdx(role)];
  const mu = techMult(m.c);
  if (mu === 1) return f;
  const o: EffectMap = {};
  for (const [k, v] of Object.entries(f) as Array<[AllStatKey, number | undefined]>) {
    if (v === undefined) continue;
    if (k === 'kas' || k === 'utg' || k === 'kol') {
      o[k] = v;
      continue;
    }
    const good = k === 'hrg' ? v < 0 : v > 0;
    if (good) {
      const w = Math.round(v * mu);
      o[k] = w === 0 ? v : w;
    } else {
      o[k] = v;
    }
  }
  return o;
}

export function checkOver(): boolean {
  const S = store.S;
  if (!S || store.godMode) return false;
  const r: Array<[boolean, string, string, string]> = [
    [S.rak <= 8, 'Dilengserkan Rakyat', '💥', 'Demo besar-besaran mengepung Istana. Kepercayaan rakyat habis dan kamu terpaksa mundur.'],
    [S.kas <= 0, 'Negara Bangkrut', '💸', 'Kas negara kosong (Rp 0). Gaji ASN tertunda, pasar panik, dan krisis fiskal tak terhindarkan.'],
    [S.kol <= 8, 'Dimakzulkan DPR', '📜', 'Koalisi bubar. DPR sepakat memakzulkanmu dalam sidang paripurna.'],
    [S.stb <= 8, 'Negara Darurat', '🚨', 'Kerusuhan meluas. Situasi darurat diumumkan dan kekuasaan berpindah tangan.'],
    [S.hrg >= 96, 'Krisis Pangan', '🍚', 'Harga pangan tak terkendali. Antrean sembako dan kerusuhan di mana-mana.'],
    [S.eko <= 8, 'Resesi Dalam', '📉', 'Ekonomi ambruk. Pabrik tutup, PHK massal, dan rakyat kehilangan harapan.'],
    [S.utg >= 100, 'Gagal Bayar Utang', '🏦', 'Utang mencapai ' + utgRp(S.utg) + ' dan tak sanggup dibayar. Kreditor menyita kepercayaan dunia pada Indonesia.'],
    [coalSeats(S) < SEATS * 0.3, 'Koalisi Runtuh', '🧱', 'Partai-partai pendukung hengkang satu per satu. Pemerintahanmu tak punya kursi untuk bertahan.'],
  ];
  const f = r.find((x) => x[0]);
  if (f) {
    S.over = { t: f[1], i: f[2], d: f[3], q: S.q };
    return true;
  }
  return false;
}

export function gaya(): [string, string] {
  const S = store.S!;
  const d = S.stat.dipl || 0;
  const o = S.stat.otor || 0;
  return o >= d + 2 ? ['Otoriter', '🦁'] : d >= o + 2 ? ['Diplomatis', '🕊️'] : ['Seimbang', '⚖️'];
}

export function score(): { sc: number; ok: number; pd: number } {
  const S = store.S!;
  const base = (S.rak + S.eko + S.kas + (100 - S.hrg) + S.stb + S.kol) / 6;
  const ok = S.janji.filter((id) => JANJI.find((j) => j.id === id)!.ok(S)).length;
  const pd = progDone(S);
  const sc = base + ok * 4 + (S.pemilu && S.pemilu.win ? 6 : 0) + pd * 2 + (S.ipk - 45) * 0.12 - (S.utg > 60 ? 5 : 0);
  return { sc: Math.max(0, Math.min(100, Math.round(sc))), ok, pd };
}

export function gradeOf(sc: number): [string, string] {
  return sc >= 80
    ? ['Bapak/Ibu Pembangunan', '🏆']
    : sc >= 65
      ? ['Presiden Rakyat', '🌟']
      : sc >= 50
        ? ['Presiden Biasa Aja', '😐']
        : ['Alhamdulillah Selesai', '😅'];
}

export interface GameSummary {
  t: string;
  i: string;
  sub: string;
  sc: number | null;
  ok?: number;
  pd?: number;
}

export function summary(): GameSummary {
  const S = store.S!;
  if (S.over) {
    return { t: S.over.t, i: S.over.i, sub: 'Bertahan ' + (S.over.q + 1) + ' dari 20 kuartal', sc: null };
  }
  const r = score();
  const g = gradeOf(r.sc);
  return { t: g[0], i: g[1], sub: 'Skor akhir ' + r.sc + '/100', sc: r.sc, ok: r.ok, pd: r.pd };
}
