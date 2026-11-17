import { KAS_T, LBL } from '../data/constants';
import { ROLES } from '../data/parties';
import { POL, POL_RB, POL_ROLE, RB_LBL } from '../data/policies';
import { MS, MSV, PRG } from '../data/programs';
import { toast } from '../rendering/effects';
import type { EffectMap, Minister, PolicyDef, ProgramDef, RbKey, StatKey } from '../types/game';
import { genMin, menkeu, minOf } from './cabinet';
import { spawnCase } from './corruption';
import { menkeuView, needsMenkeu, polCost } from './fiscal';
import { addKas, apply, applyTrack, checkOver, log, scaleF, seed, techF } from './stats';
import { render, save, store } from './store';
import { clamp, one, rnd, rp } from './utils';

export type PropSpecResult =
  | { kind: 'pol'; p: PolicyDef; cost: number; debt: number }
  | { kind: 'prg'; p: ProgramDef; cost: number; debt: number };

export function propSpec(P: { kind: 'pol' | 'prg'; id: string }): PropSpecResult {
  if (P.kind === 'pol') {
    const p = POL.find((x) => x.id === P.id)!;
    return { kind: 'pol', p, cost: polCost(p), debt: (p.f.utg || 0) > 0 ? p.f.utg! : 0 };
  }
  const p = PRG.find((x) => x.id === P.id)!;
  return { kind: 'prg', p, cost: p.cost, debt: 0 };
}

export function openProp(kind: 'pol' | 'prg', id: string): void {
  const S = store.S;
  if (!S || S.over) return;
  if (kind === 'pol') {
    const p = POL.find((x) => x.id === id);
    if (!p) return;
    const wait = p.cd - (S.q - (S.last[p.id] === undefined ? -99 : S.last[p.id]));
    if (S.usedPol || wait > 0) return;
  } else {
    const p = PRG.find((x) => x.id === id);
    if (!p || S.slots <= 0 || S.prg[id] >= 100) return;
  }
  const sp0 = propSpec({ kind, id });
  if (!needsMenkeu(sp0.cost, sp0.debt)) {
    if (kind === 'pol') execPol(id, 1);
    else execPrg(id, 1);
    return;
  }
  S.prop = { kind, id, st: 'review', neg: false, msg: '' };
  render();
}

export function cancelProp(): void {
  if (!store.S) return;
  store.S.prop = null;
  render();
}

export function execProp(scale: number, msg?: string): void {
  const S = store.S;
  if (!S || !S.prop || S.prop.kind === 'resh') return;
  const P = S.prop;
  S.prop = null;
  if (P.kind === 'pol') execPol(P.id, scale);
  else execPrg(P.id, scale);
  if (msg) toast(msg);
}

export function submitProp(): void {
  const S = store.S;
  if (!S) return;
  const P = S.prop;
  if (!P || P.kind === 'resh' || S.over) return;
  const sp = propSpec(P);
  const v = menkeuView(sp.cost, sp.debt);
  if (v.ok) {
    execProp(1, 'Menkeu & menteri teknis: disetujui ✅');
    return;
  }
  P.st = 'reject';
  P.why = v.why;
  save();
  render();
}

export function propChoice(c: 'ikuti' | 'rundingan' | 'reshuffle'): void {
  const S = store.S;
  if (!S) return;
  const P = S.prop;
  if (!P || P.kind === 'resh' || P.st !== 'reject') return;
  const sp = propSpec(P);
  const nmx = sp.p.n;
  if (c === 'ikuti') {
    S.prop = null;
    apply({ eko: 1 });
    S.stat.dipl++;
    log('🧾 Presiden mengikuti nasihat Menkeu: "' + nmx + '" dibatalkan');
    toast('Kamu ikut nasihat Menkeu. Pasar menilai disiplin fiskal (+1 Ekonomi)');
    save();
    render();
  } else if (c === 'rundingan') {
    if (P.neg) return;
    P.neg = true;
    const m = menkeu();
    const pn = Math.min(0.8, Math.max(0.15, 0.4 + (S.kol - 50) / 150 + (S.rak - 50) / 300 - (m.c - 3) * 0.05));
    if (Math.random() < pn) {
      S.stat.dipl++;
      log('🤝 Berunding berhasil: Menkeu setuju dengan anggaran dipangkas 25%');
      execProp(0.75, 'Menkeu setuju, anggaran dipangkas 25%');
    } else {
      P.msg = 'Menkeu tetap bertahan: "Maaf, hitungan saya tidak berubah, Pak/Bu Presiden."';
      save();
      render();
    }
  } else if (c === 'reshuffle') {
    if (S.usedResh) return;
    const i = S.men.findIndex((x) => x.k === 'keu');
    const old = S.men[i];
    const cands = S.par.map((p, k) => (p.k ? k : -9)).filter((k) => k >= 0);
    cands.push(-1);
    S.men[i] = Object.assign(genMin('keu'), { c: rnd(1, 4), i: rnd(1, 4), p: one(cands), prev: old.nm });
    S.usedResh = true;
    S.stat.otor++;
    if (old.p >= 0) S.par[old.p].s = clamp(S.par[old.p].s - 8);
    if (S.men[i].p >= 0) S.par[S.men[i].p].s = clamp(S.par[S.men[i].p].s + 5);
    apply({ eko: -3, rak: -1 });
    log('🔄 Menkeu ' + old.nm + ' dicopot setelah menolak, diganti ' + S.men[i].nm);
    execProp(1, 'Menkeu baru: ' + S.men[i].nm + ' menyetujui. Pasar kaget (−3 Ekonomi)');
  }
}

export function execPol(id: string, scale = 1): void {
  const S = store.S;
  if (!S || S.usedPol || S.over) return;
  const p = POL.find((x) => x.id === id);
  if (!p) return;
  const s = scale || 1;
  const tr = POL_ROLE[id];
  const f = techF(scaleF(p.f, s), tr);
  if (S.kas + (f.kas || 0) <= 0) return;
  if (tr) {
    minOf(tr).pol++;
  }
  seed({ t: 'pol', id });
  applyTrack(f, 'pol');
  const rb = POL_RB[id];
  if (rb) {
    for (const [k, v] of Object.entries(rb) as Array<[RbKey, number | undefined]>) {
      if (v !== undefined) S.rb[k] += v;
    }
  }
  const key = p.tag || p.id;
  S.cnt[key] = (S.cnt[key] || 0) + 1;
  S.last[p.id] = S.q;
  S.usedPol = true;
  log(`📋 Pemerintah menetapkan: ${p.n}`);
  toast(p.ic + ' ' + p.n + ' ditetapkan' + (S.kas < 15 ? ' — ⚠️ kas tipis!' : ''));
  checkOver();
  save();
  render();
}

export function leakRisk(m: Minister): number {
  return 0.03 + 0.055 * (5 - m.i);
}

export function risk(m: Minister): [string, string] {
  const r = leakRisk(m);
  return r < 0.1 ? ['Rendah', 'up'] : r < 0.18 ? ['Sedang', 'gd'] : ['Tinggi', 'dn'];
}

export function prgTotal(p: ProgramDef): number {
  return p.cost * KAS_T * (100 / (p.gain * 1.5));
}

export function prgBenefit(p: ProgramDef): string {
  return (Object.entries(p.y) as Array<[StatKey, number | undefined]>)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => {
      if (k === 'kas') return `kas +${rp(v! * KAS_T)}/kuartal`;
      return `${v! > 0 ? '+' : ''}${v} ${LBL[k]}/kuartal`;
    })
    .join(', ');
}

export function rbText(p: PolicyDef): string {
  const rb = POL_RB[p.id];
  if (!rb) return '';
  return (Object.entries(rb) as Array<[RbKey, number | undefined]>)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${RB_LBL[k]} ${k === 'hemat' ? 'hemat ' : '+'}${rp(v! * KAS_T)}/kuartal`)
    .join(', ');
}

export function execPrg(id: string, scale = 1): void {
  const S = store.S;
  if (!S) return;
  const p = PRG.find((x) => x.id === id);
  const s = scale || 1;
  if (!p) return;
  const cost = p.cost * s;
  if (S.over || S.slots <= 0 || S.prg[id] >= 100 || S.kas - cost <= 0) return;
  const mi = S.men.findIndex((x) => x.k === p.role);
  const m = S.men[mi];
  addKas('prg', -cost);
  S.slots--;
  m.fund++;
  let gain = (p.gain + (m.c - 3) * 1.5 + rnd(-2, 2)) * 1.5 * s;
  let msg = p.ic + ' ' + p.n + ' didanai ' + rp(cost * KAS_T);
  if (Math.random() < leakRisk(m)) {
    gain *= 0.4;
    m.leak++;
    msg = '💸 Dana ' + p.n + ' bocor!';
    log('💸 Dana proyek "' + p.n + '" diduga bocor di ' + ROLES[mi].j);
    if (!m.sus) spawnCase(mi, 'Dugaan penyelewengan dana proyek ' + p.n);
  }
  const before = S.prg[id];
  S.prg[id] = Math.min(100, before + Math.max(2, gain));
  MS.forEach((x) => {
    if (before < x && S.prg[id] >= x) {
      const f: EffectMap = {};
      f[p.mk] = MSV[x] * p.sg;
      if (x === 100) f.rak = (f.rak || 0) + 2;
      apply(f);
      log('🏗️ ' + p.n + ' capai ' + x + '%' + (x === 100 ? ' — SELESAI!' : ''));
      toast('🏗️ ' + p.n + ' capai ' + x + '%');
    }
  });
  S.stat.fund = (S.stat.fund || 0) + 1;
  seed({ t: 'prg', id, leak: msg.indexOf('💸') === 0 });
  toast(msg + (S.kas < 15 ? ' — ⚠️ kas tipis!' : ''));
  checkOver();
  save();
  render();
}
