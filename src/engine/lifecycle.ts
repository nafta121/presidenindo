import { AGN, AGN_T, COALITION0, GUIDE_KEY, KAS_T, KEY, NAV, SEAS } from '../data/constants';
import { EV } from '../data/events';
import { GUIDE_P } from '../data/guide';
import { LATAR, PARTIES, ROLES } from '../data/parties';
import { PRG } from '../data/programs';
import { fx, toast } from '../rendering/effects';
import type {
  AgendaKey,
  EffectMap,
  GameEventTuple,
  GameState,
  GenderKey,
  LatarKey,
  Minister,
  NavGroupKey,
  OathKind,
  RoleKey,
  StatKey,
  TabKey,
} from '../types/game';
import { genName } from './cabinet';
import { caseStep } from './corruption';
import { dFactor, fiscal, kasDelta, ledAdd, ledInit } from './fiscal';
import { mkEnd, mkInit, mkShock, smInit, tdInit } from './market';
import { mkNews, nw, tag } from './mediaAndTrips';
import { ensure33 } from './migrations';
import { v35End } from './politicsV35';
import { apply, applyTrack, checkOver, log, net, note, recalc, scaleLn, seed, snap } from './stats';
import { load, presName, render, save, store } from './store';
import { clamp, one, rnd, shuffle } from './utils';

export function pilWins(total: number, bonus: number): number {
  const S = store.S!;
  const base = Math.min(0.9, Math.max(0.1, 0.3 + (S.rak / 100) * 0.28 + (S.eko / 100) * 0.06 + (S.kol / 100) * 0.12 + bonus));
  let w = 0;
  for (let i = 0; i < total; i++) {
    if (Math.random() < base) w++;
  }
  return w;
}

export function pilEv(key: 'pil1' | 'pil2', total: number, wil: string): GameEventTuple {
  const out = (w: number, ch: { f: EffectMap; r: string }): { f: EffectMap; r: string } => {
    const S = store.S!;
    const half = total / 2;
    const d = (w - half) / total;
    S.rep[key] = w + '/' + total;
    const f = { ...ch.f };
    f.kol = (f.kol || 0) + Math.round(d * 18);
    return { f, r: ch.r + ' Calon koalisi menang di ' + w + ' dari ' + total + ' ' + wil + '.' };
  };
  const ev = [
    '🗳️',
    AGN_T[key],
    'Rakyat memilih kepala daerah di ' + total + ' ' + wil + '. Sikapmu akan menentukan peta politik 5 tahun ke depan.',
    [
      [
        'Turun kampanye untuk calon koalisi',
        () => {
          const w = pilWins(total, 0.07);
          return out(w, { f: { rak: -2, kas: -2 }, r: 'Kamu kampanye keliling. Netralitas dipertanyakan.' });
        },
        '',
      ],
      [
        'Netral, jaga proses demokrasi',
        () => {
          const w = pilWins(total, 0);
          return out(w, { f: { rak: 3, stb: 2, ipk: 2 }, r: 'Pemilu berjalan damai dan dipuji dunia.' });
        },
        '',
      ],
      [
        'Kerahkan mesin birokrasi untuk calon koalisi',
        () => {
          const w = pilWins(total, 0.12);
          if (Math.random() < 0.4) {
            return out(w, { f: { rak: -9, stb: -3, ipk: -6 }, r: 'Terbongkar ASN dikerahkan. Bawaslu bergerak dan publik marah.' });
          }
          return out(w, { f: { rak: -2, ipk: -3 }, r: 'Berhasil, tapi bau-bau pelanggaran menyengat.' });
        },
        '',
      ],
    ],
  ] as unknown as GameEventTuple;
  ev.cat = 'ag';
  return ev;
}

export function pemiluEv(): GameEventTuple {
  const fin = (bonus: number, ch: { f: EffectMap; r: string }): { f: EffectMap; r: string } => {
    const S = store.S!;
    const pct =
      17 + S.rak * 0.22 + S.eko * 0.08 + (100 - S.hrg) * 0.06 + S.kol * 0.05 + S.ipk * 0.04 + bonus + rnd(-4, 4);
    const p = Math.round(pct * 10) / 10;
    S.pemilu = { pct: p, win: p >= 45 };
    return {
      f: { ...ch.f },
      r:
        ch.r +
        (S.pemilu.win
          ? ' Hasil hitung cepat: calon koalisimu meraih ' + p + '% suara dan MENANG.'
          : ' Hasil hitung cepat: calon koalisimu hanya ' + p + '%. KALAH di Pemilu Serentak.'),
    };
  };
  const ev = [
    '🗳️',
    AGN_T.pemilu,
    'Hari pencoblosan tiba. Calon dari koalisimu bertarung menggantikanmu. Apa strategimu?',
    [
      ['Kampanye akbar keliling nusantara', () => fin(4, { f: { kas: -5, rak: -1 }, r: 'Panggung kampanye penuh sesak.' }), ''],
      [
        'Bansos jelang pemilu',
        () => {
          const o = fin(6, { f: { kas: -9, rak: -2, ipk: -3 }, r: 'Bansos digelontorkan dua minggu sebelum coblosan.' });
          if (Math.random() < 0.3) {
            o.f.rak = (o.f.rak || 0) - 5;
            o.r += ' Lembaga pengawas menyebutnya politisasi bansos.';
          }
          return o;
        },
        '',
      ],
      [
        'Netral, fokus kerja & transparansi',
        () => fin(2, { f: { rak: 2, ipk: 2 }, r: 'Kamu menjaga jarak dan fokus bekerja sampai akhir.' }),
        '',
      ],
    ],
  ] as unknown as GameEventTuple;
  ev.cat = 'ag';
  return ev;
}

export const SPEC: Record<AgendaKey, () => GameEventTuple> = {
  pil1: () => pilEv('pil1', 12, 'provinsi'),
  pil2: () => pilEv('pil2', 100, 'daerah'),
  pemilu: pemiluEv,
};

export function curEv(): GameEventTuple {
  const S = store.S!;
  const k = AGN[S.q];
  if (k) {
    const e = SPEC[k]();
    e.cat = 'ag';
    return e;
  }
  return EV[S.deck[S.q]];
}

export function pick(i: number, ev?: { clientX?: number; clientY?: number } | null): void {
  const S = store.S;
  if (!S || S.res || S.over) return;
  const e = curEv();
  const c = e[3][i];
  if (!c) return;
  let f: EffectMap;
  let r: string;
  if (typeof c[1] === 'function') {
    const o = c[1]();
    f = o.f;
    r = o.r;
  } else {
    f = { ...c[1] };
    r = c[2];
    const riskObj = c[3];
    if (riskObj && Math.random() < riskObj.p) {
      f = { ...riskObj.f };
      r = riskObj.r;
    }
  }
  if (e.cat === 'ln') {
    f = scaleLn(f);
    mkShock();
  }
  applyTrack(f, 'evt');
  const n = net(f);
  S.res = { p: c[0], t: r, f, n, ic: e[0], ti: e[1] };
  log(`${e[0]} ${e[1]}: ${c[0]}`);
  seed({ t: 'evt', ti: e[1], p: c[0], n });
  const fu = c[4];
  if (fu && typeof c[1] !== 'function') {
    const fi = EV.findIndex((x) => x[4] === fu);
    let at = S.q + 1;
    while (AGN[at]) at++;
    if (fi >= 0 && at < S.deck.length + 1 && !S.deck.slice(S.q + 1).includes(fi)) {
      S.deck.splice(at, 0, fi);
    }
  }
  checkOver();
  save();
  render();
  fx(n, ev);
}

export function seasonStart(): void {
  const S = store.S!;
  const s = SEAS[S.q % 4];
  S.seas = s;
  applyTrack(s.f, 'evt');
  log(s.ic + ' ' + s.n);
}

export function newGame(nama: string, janji: string[], lt: LatarKey): void {
  const ln = LATAR.find((x) => x.k === lt) || LATAR[1];
  store.usedNames.clear();
  const dn = EV.map((_, i) => i).filter((i) => !EV[i][4] && EV[i].cat === 'dn');
  const lnn = EV.map((_, i) => i).filter((i) => !EV[i][4] && EV[i].cat === 'ln');
  const deck = shuffle([...shuffle(dn).slice(0, 13), ...shuffle(lnn).slice(0, 7)]);

  const initKas = [72, 64, 56][store.dif] ?? 64;
  const S: GameState = {
    nama: nama || 'Presiden',
    gen: store.gen,
    oath: true,
    lat: ln.k,
    q: 0,
    rak: 60,
    eko: 55,
    kas: initKas,
    hrg: 45,
    stb: 60,
    kol: 60,
    utg: 20,
    ipk: 45,
    par: PARTIES.map((_, i) => ({
      k: COALITION0.includes(i),
      s: COALITION0.includes(i) ? rnd(56, 68) : rnd(36, 56),
    })),
    men: [],
    janji: [...janji],
    cnt: {},
    last: {},
    cid: 0,
    cases: [],
    prg: {},
    slots: 2,
    rep: {},
    pemilu: null,
    rb: { pajak: 0, pnbp: 0, bea: 0, hemat: 0 },
    fl: { pol: 0, prg: 0, evt: 0, rec: 0, trip: 0, mkt: 0, trd: 0 },
    notes: [],
    news: [],
    seeds: [],
    usedTrip: false,
    trips: [],
    trip: null,
    tripRep: null,
    mk: mkInit(),
    prop: null,
    qrep: null,
    kasQ: 0,
    usedPol: false,
    usedResh: false,
    usedDip: false,
    usedLaw: false,
    diff: store.dif,
    log: [],
    modal: null,
    deck,
    res: null,
    over: null,
    done: false,
    alert: true,
    prev: { rak: 60, eko: 55, kas: initKas, hrg: 45, stb: 60, kol: 60 },
    stat: { dukung: 0, lindungi: 0, diam: 0, dipl: 0, otor: 0, trip: 0 },
    prof: null,
    sm: smInit(),
    fxAlert: null,
    fxUsed: false,
    pv: undefined as unknown as GameState['pv'],
    law: {},
    lawq: null,
    votes: [],
    gug: [],
    gid: 0,
    mkind: 70,
    maind: 65,
    kpk: 60,
    mkj: undefined as unknown as GameState['mkj'],
    perppu: null,
    ap: undefined as unknown as GameState['ap'],
    pvAct: 0,
    pvNote: {},
    td: tdInit(),
    led: ledInit(),
  };

  store.S = S;
  PRG.forEach((p) => {
    S.prg[p.id] = 0;
  });
  S.men = ROLES.map((r) => ({
    k: r.k,
    nm: genName(true),
    c: rnd(2, 4),
    i: rnd(2, 5),
    p: Math.random() < 0.2 ? -1 : one(COALITION0),
    sus: false,
    since: 0,
    fund: 0,
    leak: 0,
    pol: 0,
    cs: 0,
  }));

  ensure33();
  apply(ln.f);
  recalc();
  S.prev = snap();
  store.tab = 'ev';
  store.LAST = {};
  S.kasQ = S.kas;
  seasonStart();
  log('🇮🇩 ' + S.nama + ' dilantik sebagai Presiden RI (' + ln.n + ')');
  nw('warta', presName() + ' Resmi Dilantik', 'Sidang dihadiri tamu negara. Pidato pertama menekankan kerja, kerja, kerja.', 1);
  nw('viral', tag('PresidenBaru') + ' trending di semua platform', 'Netizen menunggu gebrakan 100 hari pertama.', 0);
  nw('garuda', 'Pasar Menunggu Susunan Kabinet dan Arah Fiskal', 'Indeks bergerak terbatas jelang kebijakan awal.', 0);
  try {
    if (!localStorage.getItem(GUIDE_KEY)) store.GUIDE = 0;
  } catch {
    store.GUIDE = 0;
  }
  save();
  render();
}

export function endQuarter(): void {
  const S = store.S!;
  mkEnd();
  v35End();
  const D = dFactor();
  const m = {} as Record<RoleKey, Minister>;
  S.men.forEach((x) => {
    m[x.k] = x;
  });
  const b = (x: Minister): number => (x.c - 3) * 0.4;
  S.fs = fiscal();
  S.kas += kasDelta();
  S.hrg += (50 - S.hrg) * 0.08 + rnd(-3, 3) - b(m.tan) * 1.5;
  S.eko += (S.stb - 50) / 30 - 1.1 * D + b(m.eko) + b(m.esd) * 0.5;
  S.stb += (S.rak - 50) / 25 - 0.6 + b(m.dag) + b(m.han) * 0.5;
  S.rak +=
    (50 - S.hrg) / 12 +
    (S.eko - 50) / 20 -
    2.1 * D +
    (S.stb < 40 ? -2 : 0) +
    b(m.sos) +
    (b(m.kes) + b(m.pdd)) * 0.5 +
    (S.ipk - 45) / 60;

  PRG.forEach((p) => {
    const pr = S.prg[p.id];
    if (pr > 0) {
      for (const [k, v] of Object.entries(p.y) as Array<[StatKey, number | undefined]>) {
        if (v !== undefined) S[k] += (v * pr) / 100;
      }
    }
  });

  const mc: Record<number, number> = {};
  S.men.forEach((x) => {
    if (x.p >= 0) mc[x.p] = (mc[x.p] || 0) + 1;
  });
  S.par.forEach((p, i) => {
    if (p.k) {
      p.s = clamp(p.s - 1.0 * D + (mc[i] || 0) * 0.8 + (S.rak > 65 ? 0.6 : 0) + rnd(-1, 1));
    } else {
      p.s = clamp(p.s + (45 - p.s) * 0.1 + (mc[i] || 0) * 0.8 + rnd(-1, 1));
    }
  });

  caseStep();
  (['rak', 'eko', 'kas', 'hrg', 'stb', 'ipk'] as const).forEach((k) => {
    S[k] = clamp(S[k]);
  });

  const co = S.par.map((p, i) => (p.k ? i : -1)).filter((i) => i >= 0);
  if (co.length > 2) {
    co.forEach((i) => {
      if (S.par[i].s <= 22 && Math.random() < 0.5 && S.par.filter((p) => p.k).length > 2) {
        S.par[i].k = false;
        note('💔 ' + PARTIES[i].n + ' hengkang dari koalisi!');
        toast('💔 ' + PARTIES[i].a + ' hengkang dari koalisi');
      }
    });
  }
  recalc();
}

export function advance(): void {
  const S = store.S;
  if (!S || !S.res || S.over) return;
  endQuarter();
  if (checkOver()) {
    save();
    render();
    return;
  }
  const op = S.fs!.netT / KAS_T;
  const fl = S.fl;
  const rest = S.kas - S.kasQ - op - fl.pol - fl.prg - fl.evt - fl.rec - (fl.trip || 0) - (fl.mkt || 0) - (fl.trd || 0);
  S.qrep = {
    q: S.q,
    fs: S.fs!,
    kas0: S.kasQ,
    kas1: S.kas,
    pol: fl.pol,
    prg: fl.prg,
    evt: fl.evt,
    rec: fl.rec,
    trip: fl.trip || 0,
    mkt: fl.mkt || 0,
    trd: fl.trd || 0,
    lain: rest,
    notes: S.notes.slice(),
  };
  mkNews();
  ledAdd(S.qrep);
  const yearEnd = (S.q + 1) % 4 === 0 && S.q < 19;
  S.q++;
  if (S.q >= 20) {
    S.done = true;
    S.qrep = null;
    save();
    render();
    return;
  }
  S.res = null;
  S.alert = true;
  S.usedPol = false;
  S.usedResh = false;
  S.usedDip = false;
  S.usedTrip = false;
  S.usedLaw = false;
  S.slots = 2;
  S.prev = snap();
  store.tab = 'ev';
  S.fl = { pol: 0, prg: 0, evt: 0, rec: 0, trip: 0, mkt: 0, trd: 0 };
  S.notes = [];
  S.kasQ = S.kas;
  seasonStart();
  if (yearEnd) S.modal = { y: S.q / 4 };
  save();
  render();
  try {
    window.scrollTo(0, 0);
  } catch {
    // Ignore in headless test envs
  }
}

export function closeModal(): void {
  if (!store.S) return;
  store.S.modal = null;
  save();
  render();
}

export function closeReport(): void {
  if (!store.S) return;
  store.S.qrep = null;
  save();
  render();
}

export function ackAlert(): void {
  if (!store.S) return;
  store.S.alert = false;
  save();
  render();
}

export function openGuide(p = 0): void {
  store.GUIDE = p || 0;
  render();
}

export function guideNav(d: number): void {
  if (store.GUIDE === null) return;
  store.GUIDE = Math.max(0, Math.min(GUIDE_P.length - 1, store.GUIDE + d));
  render();
}

export function closeGuide(): void {
  store.GUIDE = null;
  try {
    localStorage.setItem(GUIDE_KEY, '1');
  } catch {
    // Ignore storage errors
  }
  render();
}

export function takeOath(k: OathKind): void {
  const S = store.S;
  if (!S) return;
  S.oath = false;
  S.oathK = k;
  log('📜 ' + S.nama + ' mengucapkan ' + (k === 'sumpah' ? 'sumpah' : 'janji') + ' jabatan Presiden');
  nw(
    'warta',
    presName() + ' Ucapkan ' + (k === 'sumpah' ? 'Sumpah' : 'Janji') + ' Jabatan di Depan MPR',
    'Sidang paripurna dihadiri tamu undangan dan perwakilan negara sahabat.',
    1,
  );
  save();
  render();
}

export function setGen(g: GenderKey): void {
  store.gen = g;
  render();
}

export function setDif(i: number): void {
  store.dif = i;
  render();
}

export function setLatar(k: LatarKey): void {
  store.latar = k;
  render();
}

export function tog(id: string): void {
  if (store.sel.includes(id)) {
    store.sel = store.sel.filter((x) => x !== id);
  } else if (store.sel.length < 3) {
    store.sel.push(id);
  }
  render();
}

export function cont(): void {
  const loaded = load();
  if (!loaded) return;
  store.S = loaded;
  ensure33();
  store.S.alert = !store.S.res;
  store.LAST = {};
  store.tab = 'ev';
  render();
}

export function reset(): void {
  store.S = null;
  store.sel = [];
  store.LAST = {};
  store.CARD = null;
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Ignore storage errors
  }
  render();
}

export function go(k: NavGroupKey | TabKey): void {
  const g = NAV.find((n) => n[0] === k);
  store.tab = g ? g[3][0] : (k as TabKey);
  render();
  try {
    window.scrollTo(0, 0);
  } catch {
    // Ignore
  }
}

export function goSub(k: TabKey): void {
  store.tab = k;
  render();
  try {
    window.scrollTo(0, 0);
  } catch {
    // Ignore
  }
}
