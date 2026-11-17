import { EV } from '../data/events';
import { KOM, STK } from '../data/markets';
import { LAWS } from '../data/politics';
import { PRG } from '../data/programs';
import { toast } from '../rendering/effects';
import type { GameState } from '../types/game';
import { spawnCase } from './corruption';
import { ihsg } from './market';
import { ensure33 } from './migrations';
import { applyLaw } from './politicsV35';
import { checkOver, recalc } from './stats';
import { render, save, store, type CheatTabKey } from './store';
import { clamp } from './utils';

export type EditableCheatStat = 'rak' | 'eko' | 'kas' | 'hrg' | 'stb' | 'utg' | 'ipk';

const TAP_WINDOW_MS = 2000;
const TAP_COUNT_UNLOCK = 5;

export function tapPresAvatar(now: number = Date.now()): boolean {
  store.avatarTaps = store.avatarTaps.filter((t) => now - t <= TAP_WINDOW_MS);
  store.avatarTaps.push(now);
  if (store.avatarTaps.length < TAP_COUNT_UNLOCK) {
    return false;
  }
  store.avatarTaps = [];
  store.cheatOpen = !store.cheatOpen;
  store.cheatMin = false;
  toast(store.cheatOpen ? '🛠️ Panel Debug aktif' : '🛠️ Panel Debug ditutup');
  render();
  return store.cheatOpen;
}

export function closeCheat(): void {
  store.cheatOpen = false;
  store.cheatMin = false;
  render();
}

export function toggleCheatMin(): void {
  store.cheatMin = !store.cheatMin;
  render();
}

export function setCheatTab(tab: CheatTabKey): void {
  store.cheatTab = tab;
  render();
}

export function toggleGodMode(): void {
  store.godMode = !store.godMode;
  if (store.godMode && store.S?.over) {
    store.S.over = null;
  }
  toast(store.godMode ? '🛡️ God Mode AKTIF (Kebal Game Over)' : '🛡️ God Mode NONAKTIF');
  save();
  render();
}

export function cheatSetStat(key: EditableCheatStat, val: number): void {
  const S = store.S;
  if (!S) return;
  S[key] = clamp(Number.isFinite(val) ? val : S[key]);
  recalc();
  checkOver();
  save();
  render();
}

export function cheatAdjustStat(key: EditableCheatStat, delta: number): void {
  const S = store.S;
  if (!S) return;
  cheatSetStat(key, S[key] + delta);
}

export function cheatRefreshQuotas(): void {
  const S = store.S;
  if (!S) return;
  S.usedPol = false;
  S.usedResh = false;
  S.usedDip = false;
  S.usedTrip = false;
  S.usedLaw = false;
  S.fxUsed = false;
  S.slots = 2;
  S.td.chg = 0;
  S.td.msg = '';
  S.ap.act = 0;
  S.pvAct = 0;
  toast('⚡ Semua kuota & aksi kuartal ini disegarkan');
  save();
  render();
}

export function cheatJumpQuarter(q: number): void {
  const S = store.S;
  if (!S) return;
  const target = Math.max(0, Math.min(19, Math.floor(q)));
  S.q = target;
  S.res = null;
  S.alert = false;
  S.qrep = null;
  S.modal = null;
  S.over = null;
  S.done = false;
  while (S.deck.length <= target) {
    S.deck.push(S.deck.length % EV.length);
  }
  toast(`⏩ Lompat ke Kuartal ${target + 1}/20`);
  save();
  render();
}

export function cheatForceEvent(evIdx: number): void {
  const S = store.S;
  if (!S) return;
  const idx = Math.max(0, Math.min(EV.length - 1, Math.floor(evIdx)));
  while (S.deck.length <= S.q) {
    S.deck.push(0);
  }
  S.deck[S.q] = idx;
  S.res = null;
  S.alert = false;
  store.tab = 'ev';
  toast(`🎯 Kejadian #${idx}: ${EV[idx][1]}`);
  save();
  render();
}

export function cheatClearModals(): void {
  const S = store.S;
  store.GUIDE = null;
  store.CARD = null;
  if (!S) {
    render();
    return;
  }
  S.oath = false;
  S.alert = false;
  S.qrep = null;
  S.modal = null;
  S.fxAlert = null;
  S.prof = null;
  S.trip = null;
  S.tripRep = null;
  S.prop = null;
  S.lawq = null;
  save();
  render();
}

export function cheatFinishTerm(): void {
  const S = store.S;
  if (!S) return;
  S.q = 19;
  S.over = null;
  S.done = true;
  if (!S.rep.pil1) S.rep.pil1 = '22/38';
  if (!S.rep.pil2) S.rep.pil2 = '310/514';
  if (!S.pemilu) {
    const pct = Math.round((35 + S.rak * 0.25 + S.eko * 0.1) * 10) / 10;
    S.pemilu = { pct, win: pct >= 50 };
  }
  cheatClearModals();
  toast('🏁 Masa jabatan 20 kuartal diselesaikan');
  save();
  render();
}

export function cheatRevive(): void {
  const S = store.S;
  if (!S) return;
  S.over = null;
  S.done = false;
  S.sh = 0;
  S.cf = 0;
  if (S.q >= 20) S.q = 19;
  S.rak = Math.max(S.rak, 35);
  S.eko = Math.max(S.eko, 35);
  S.kas = Math.max(S.kas, 30);
  S.stb = Math.max(S.stb, 35);
  S.hrg = Math.min(S.hrg, 70);
  S.utg = Math.min(S.utg, 75);
  let activeCount = S.par.filter((p) => p.k).length;
  S.par.forEach((p, idx) => {
    if (!p.k && activeCount < 4 && idx < 5) {
      p.k = true;
      activeCount++;
    }
    if (p.k) p.s = Math.max(p.s, 60);
  });
  recalc();
  toast('🦅 Pemerintahan dipulihkan dari Game Over');
  save();
  render();
}

export function cheatSetCoalition(mode: 'max' | 'min'): void {
  const S = store.S;
  if (!S) return;
  if (mode === 'max') {
    S.par.forEach((p) => {
      p.k = true;
      p.s = 98;
    });
    toast('🏛️ Koalisi DPR 100% (Sapujagat)');
  } else {
    S.par.forEach((p) => {
      p.k = false;
      p.s = 25;
    });
    toast('🔥 Semua partai keluar koalisi (Oposisi Total)');
  }
  recalc();
  checkOver();
  save();
  render();
}

export function cheatMaxCabinet(): void {
  const S = store.S;
  if (!S) return;
  S.men.forEach((m) => {
    m.c = 5;
    m.i = 5;
    m.sus = false;
  });
  toast('👔 Seluruh menteri 5★ Kompetensi & Integritas penuh');
  save();
  render();
}

export function cheatMaxPrograms(): void {
  const S = store.S;
  if (!S) return;
  PRG.forEach((p) => {
    S.prg[p.id] = 100;
  });
  toast('🏗️ Seluruh 19 Program Nasional selesai 100%');
  save();
  render();
}

export function cheatSetFx(usd: number, triggerAlert = false): void {
  const S = store.S;
  if (!S || !S.sm) return;
  const prev = S.sm.usd || 16200;
  const next = Math.max(10000, Math.min(25000, Math.round(usd)));
  S.sm.uret = (next - prev) / prev;
  S.sm.usd = next;
  S.sm.uh.push(next);
  if (S.sm.uh.length > 20) S.sm.uh.shift();
  if (triggerAlert) {
    S.fxUsed = false;
    S.fxAlert = { t: 'kurs', q: S.q };
  }
  toast(`💱 Kurs diatur ke Rp ${next.toLocaleString('id-ID')}/USD`);
  save();
  render();
}

export function cheatShockIhsg(pct: number, triggerAlert = false): void {
  const S = store.S;
  if (!S || !S.sm) return;
  const mult = Math.max(0.3, 1 + pct / 100);
  STK.forEach((st) => {
    const nextPrice = Math.max(100, Math.round((S.sm.p[st.id] || st.p0) * mult));
    S.sm.p[st.id] = nextPrice;
    S.sm.h[st.id].push(nextPrice);
    if (S.sm.h[st.id].length > 20) S.sm.h[st.id].shift();
  });
  S.sm.ret = pct / 100;
  const curIhsg = ihsg();
  S.sm.ih.push(curIhsg);
  if (S.sm.ih.length > 20) S.sm.ih.shift();
  if (triggerAlert) {
    S.fxUsed = false;
    S.fxAlert = { t: 'ihsg', q: S.q };
  }
  toast(`📊 IHSG ${pct >= 0 ? '+' : ''}${pct}% (${curIhsg})`);
  save();
  render();
}

export function cheatFillCommodities(units = 5): void {
  const S = store.S;
  if (!S || !S.mk) return;
  KOM.forEach((k) => {
    S.mk.st[k.id] = (S.mk.st[k.id] || 0) + units;
    if (!S.mk.cost[k.id]) S.mk.cost[k.id] = S.mk.p[k.id];
  });
  toast(`📦 Gudang komoditas ditambah +${units} unit/item`);
  save();
  render();
}

export function cheatSpawnCase(): void {
  const S = store.S;
  if (!S) return;
  const c = spawnCase(null);
  c.stage = Math.max(1, c.stage);
  c.pend = true;
  store.tab = 'kas';
  toast(`⚖️ Kasus korupsi baru muncul: ${c.t}`);
  save();
  render();
}

export function cheatSpawnMkSuit(): void {
  const S = store.S;
  if (!S) return;
  const law = LAWS.find((l) => S.law[l.id]?.v === 'asli') || LAWS[0];
  const opt = law.opts[0];
  if (S.law[law.id].v === 'asli') {
    applyLaw(law.id, opt.id);
  }
  S.gug.push({
    id: ++S.gid,
    law: law.id,
    opt: S.law[law.id].v === 'asli' ? opt.id : S.law[law.id].v,
    q0: S.q,
    st: 'sidang',
    lobi: false,
  });
  store.tab = 'hkm';
  toast(`🏛️ Gugatan uji materi MK didaftarkan: ${law.n}`);
  save();
  render();
}

export function cheatExportSave(): string {
  if (!store.S) return '';
  return JSON.stringify(store.S, null, 2);
}

export function cheatImportSave(raw: string): boolean {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      toast('⚠️ Format JSON save tidak valid');
      return false;
    }
    const candidate = parsed as Partial<GameState>;
    if (typeof candidate.nama !== 'string' || typeof candidate.q !== 'number') {
      toast('⚠️ JSON bukan data save Presiden RI');
      return false;
    }
    store.S = parsed as GameState;
    ensure33();
    recalc();
    save();
    render();
    toast('✅ Save JSON berhasil dimuat');
    return true;
  } catch {
    toast('⚠️ Gagal mengurai JSON save');
    return false;
  }
}
