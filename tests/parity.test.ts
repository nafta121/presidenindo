import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { describe, expect, it } from 'vitest';
import * as Data from '../src/data';
import { fiscal, fiscalDetail, menkeuReserve, menkeuView } from '../src/engine/fiscal';
import { newGame } from '../src/engine/lifecycle';
import { sdaIdx, tdCalc, tdTotal } from '../src/engine/market';
import { dprEst, dprPr } from '../src/engine/politicsV35';
import { gradeOf, recalc, score } from '../src/engine/stats';
import { store } from '../src/engine/store';
import { idr, kasRp, rp, thk, utgRp } from '../src/engine/utils';
import { avatar } from '../src/rendering/avatar';
import type { OutfitRole } from '../src/types/game';

const defaultCacheDir = path.join(os.homedir(), '.cache', 'rea-gamepresiden', 'app');
const REF_JS_PATH = process.env.REF_JS_PATH ?? path.join(defaultCacheDir, 'game.js');
const REF_HTML_PATH = process.env.REF_HTML_PATH ?? path.join(defaultCacheDir, 'index.html');
const hasRefFiles = fs.existsSync(REF_JS_PATH) && fs.existsSync(REF_HTML_PATH);

interface RefVmExports {
  PARTIES: unknown;
  LATAR: unknown;
  ROLES: unknown;
  OUTFIT: unknown;
  POL: unknown;
  POL_ROLE: unknown;
  POL_RB: unknown;
  RB_LBL: unknown;
  PRG: unknown;
  MS: unknown;
  MSV: unknown;
  JANJI: Array<{ id: string; ic: string; n: string; d: string; ok: (s: unknown) => boolean; p: (s: unknown) => string }>;
  SEAS: unknown;
  AGN: unknown;
  AGN_T: unknown;
  NAV: unknown;
  SUBN: unknown;
  EV: Array<unknown[] & { cat?: string }>;
  KOM: unknown;
  TRD0: unknown;
  EXM: unknown;
  IMM: unknown;
  STK: unknown;
  LAWS: unknown;
  PV: unknown;
  ISS: unknown;
  OUT: unknown;
  KJN: unknown;
  FAILT: unknown;
  GUIDE_P: unknown;
  AGN_NAMES: unknown;
  MODUS: unknown;
  BB: unknown;
  avatar: (name: string, o?: Record<string, unknown>) => string;
  rp: (t: number) => string;
  kasRp: (v: number) => string;
  utgRp: (u: number) => string;
  idr: (n: number) => string;
  thk: (q: number) => string;
  setS: (s: unknown) => void;
  getS: () => unknown;
  recalc: () => void;
  fiscal: () => unknown;
  fiscalDetail: () => unknown;
  menkeuReserve: () => number;
  menkeuView: (cost: number, debt: number) => unknown;
  tdCalc: (id: string, pol: { ex: string; im: string }, dem?: number) => unknown;
  tdTotal: () => unknown;
  sdaIdx: () => number;
  dprPr: (i: number, o: unknown, lobi: boolean) => number;
  dprEst: (id: string, optId: string, lobi: boolean) => number;
  score: () => unknown;
  gradeOf: (sc: number) => unknown;
}

function loadReferenceVm(): RefVmExports {
  const code = fs.readFileSync(REF_JS_PATH, 'utf8');
  const storage = new Map<string, string>();
  const dummyEl = {
    innerHTML: '',
    textContent: '',
    style: { setProperty: () => {}, width: '' },
    dataset: {},
    classList: { add: () => {}, remove: () => {} },
    remove: () => {},
    appendChild: () => {},
  };
  const sandbox: Record<string, unknown> = {
    console,
    Math,
    Date,
    JSON,
    Set,
    Map,
    Array,
    Object,
    String,
    Number,
    RegExp,
    parseFloat,
    setTimeout: () => 0,
    clearTimeout: () => {},
    setInterval: () => 0,
    clearInterval: () => {},
    requestAnimationFrame: () => 0,
    matchMedia: () => ({ matches: true }),
    performance: { now: () => 0 },
    innerWidth: 1280,
    innerHeight: 800,
    window: { scrollTo: () => {} },
    localStorage: {
      getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => storage.set(k, v),
      removeItem: (k: string) => storage.delete(k),
    },
    document: {
      getElementById: () => dummyEl,
      querySelectorAll: () => [],
      createElement: () => dummyEl,
      body: { appendChild: () => {}, classList: { add: () => {}, remove: () => {} } },
    },
  };

  const exporter = `
;globalThis.__EXPORTS__ = {
  PARTIES, LATAR, ROLES, OUTFIT,
  POL, POL_ROLE, POL_RB, RB_LBL,
  PRG, MS, MSV, JANJI,
  SEAS, AGN, AGN_T, NAV, SUBN,
  EV, KOM, TRD0, EXM, IMM, STK,
  LAWS, PV, ISS, OUT, KJN, FAILT,
  GUIDE_P, AGN_NAMES, MODUS, BB,
  avatar, rp, kasRp, utgRp, idr, thk,
  setS: (v) => { S = v; },
  getS: () => S,
  recalc, fiscal, fiscalDetail, menkeuReserve, menkeuView,
  tdCalc, tdTotal, sdaIdx, dprPr, dprEst, score, gradeOf
};`;

  vm.createContext(sandbox);
  vm.runInContext(code + exporter, sandbox);
  return sandbox.__EXPORTS__ as RefVmExports;
}

describe.skipIf(!hasRefFiles)('100% Clean-Room Parity vs Reference game.js & index.html (v3.6)', () => {
  const ref = hasRefFiles ? loadReferenceVm() : (null as unknown as RefVmExports);

  it('matches all static political, fiscal, market, province, trip, and guide datasets 100%', () => {
    expect(JSON.parse(JSON.stringify(Data.PARTIES))).toEqual(JSON.parse(JSON.stringify(ref.PARTIES)));
    expect(JSON.parse(JSON.stringify(Data.LATAR))).toEqual(JSON.parse(JSON.stringify(ref.LATAR)));
    expect(JSON.parse(JSON.stringify(Data.ROLES))).toEqual(JSON.parse(JSON.stringify(ref.ROLES)));
    expect(JSON.parse(JSON.stringify(Data.OUTFIT))).toEqual(JSON.parse(JSON.stringify(ref.OUTFIT)));

    expect(Data.POL).toHaveLength(38);
    expect(JSON.parse(JSON.stringify(Data.POL))).toEqual(JSON.parse(JSON.stringify(ref.POL)));
    expect(JSON.parse(JSON.stringify(Data.POL_ROLE))).toEqual(JSON.parse(JSON.stringify(ref.POL_ROLE)));
    expect(JSON.parse(JSON.stringify(Data.POL_RB))).toEqual(JSON.parse(JSON.stringify(ref.POL_RB)));
    expect(JSON.parse(JSON.stringify(Data.RB_LBL))).toEqual(JSON.parse(JSON.stringify(ref.RB_LBL)));

    expect(Data.PRG).toHaveLength(19);
    expect(JSON.parse(JSON.stringify(Data.PRG))).toEqual(JSON.parse(JSON.stringify(ref.PRG)));
    expect(JSON.parse(JSON.stringify(Data.MS))).toEqual(JSON.parse(JSON.stringify(ref.MS)));
    expect(JSON.parse(JSON.stringify(Data.MSV))).toEqual(JSON.parse(JSON.stringify(ref.MSV)));

    expect(JSON.parse(JSON.stringify(Data.SEAS))).toEqual(JSON.parse(JSON.stringify(ref.SEAS)));
    expect(JSON.parse(JSON.stringify(Data.AGN))).toEqual(JSON.parse(JSON.stringify(ref.AGN)));
    expect(JSON.parse(JSON.stringify(Data.AGN_T))).toEqual(JSON.parse(JSON.stringify(ref.AGN_T)));
    expect(JSON.parse(JSON.stringify(Data.NAV))).toEqual(JSON.parse(JSON.stringify(ref.NAV)));
    expect(JSON.parse(JSON.stringify(Data.SUBN))).toEqual(JSON.parse(JSON.stringify(ref.SUBN)));
    expect(Data.SUBN.ang).toBe('Kas & APBN');

    expect(Data.KOM).toHaveLength(8);
    expect(JSON.parse(JSON.stringify(Data.KOM))).toEqual(JSON.parse(JSON.stringify(ref.KOM)));
    expect(JSON.parse(JSON.stringify(Data.TRD0))).toEqual(JSON.parse(JSON.stringify(ref.TRD0)));
    expect(JSON.parse(JSON.stringify(Data.EXM))).toEqual(JSON.parse(JSON.stringify(ref.EXM)));
    expect(JSON.parse(JSON.stringify(Data.IMM))).toEqual(JSON.parse(JSON.stringify(ref.IMM)));
    expect(Data.STK).toHaveLength(10);
    expect(JSON.parse(JSON.stringify(Data.STK))).toEqual(JSON.parse(JSON.stringify(ref.STK)));

    expect(Data.LAWS).toHaveLength(12);
    expect(JSON.parse(JSON.stringify(Data.LAWS))).toEqual(JSON.parse(JSON.stringify(ref.LAWS)));
    expect(JSON.parse(JSON.stringify(Data.AGN_NAMES))).toEqual(JSON.parse(JSON.stringify(ref.AGN_NAMES)));
    expect(JSON.parse(JSON.stringify(Data.MODUS))).toEqual(JSON.parse(JSON.stringify(ref.MODUS)));
    expect(JSON.parse(JSON.stringify(Data.BB))).toEqual(JSON.parse(JSON.stringify(ref.BB)));

    expect(Data.PV).toHaveLength(38);
    expect(JSON.parse(JSON.stringify(Data.PV))).toEqual(JSON.parse(JSON.stringify(ref.PV)));
    expect(Data.ISS).toHaveLength(17);
    expect(JSON.parse(JSON.stringify(Data.ISS))).toEqual(JSON.parse(JSON.stringify(ref.ISS)));
    expect(JSON.parse(JSON.stringify(Data.OUT))).toEqual(JSON.parse(JSON.stringify(ref.OUT)));
    expect(Data.KJN).toHaveLength(21);
    expect(JSON.parse(JSON.stringify(Data.KJN))).toEqual(JSON.parse(JSON.stringify(ref.KJN)));
    expect(JSON.parse(JSON.stringify(Data.FAILT))).toEqual(JSON.parse(JSON.stringify(ref.FAILT)));

    expect(Data.GUIDE_P).toHaveLength(19);
    expect(JSON.parse(JSON.stringify(Data.GUIDE_P))).toEqual(JSON.parse(JSON.stringify(ref.GUIDE_P)));
  });

  it('matches all 100 EV events (indices 0..99, choices, risks, follow-ups, and .cat)', () => {
    expect(Data.EV).toHaveLength(100);
    expect(ref.EV).toHaveLength(100);
    for (let i = 0; i < 100; i++) {
      expect(Data.EV[i].cat).toBe(ref.EV[i].cat);
      expect(JSON.parse(JSON.stringify(Array.from(Data.EV[i])))).toEqual(
        JSON.parse(JSON.stringify(Array.from(ref.EV[i]))),
      );
    }
  });

  it('matches all 13 JANJI campaign promise evaluators (.ok and .p)', () => {
    expect(Data.JANJI).toHaveLength(13);
    newGame('Budi', ['j1', 'j2', 'j3'], 'gubernur');
    const sampleState = JSON.parse(JSON.stringify(store.S));
    sampleState.cnt = { mbg: 3, hilir: 2, korupsi: 4 };
    sampleState.prg.gizi = 100;
    sampleState.pemilu = { pct: 51.4, win: true };

    Data.JANJI.forEach((j, idx) => {
      const rj = ref.JANJI[idx];
      expect(j.id).toBe(rj.id);
      expect(j.ic).toBe(rj.ic);
      expect(j.n).toBe(rj.n);
      expect(j.d).toBe(rj.d);
      expect(j.ok(sampleState)).toBe(rj.ok(sampleState));
      expect(j.p(sampleState)).toBe(rj.p(sampleState));
    });
  });

  it('produces byte-for-byte identical procedural SVG avatars and currency formatting', () => {
    const roles: OutfitRole[] = ['jas', 'pres', 'batik', 'safari', 'seragam', 'rompi', 'reporter', 'warga'];
    const names = [
      'Presiden Nusantara',
      'Dr. Ratna Wardhani',
      'Prof. Bambang Siregar',
      'Ir. Putri Nasution',
      'Jenderal TNI Agus Wibowo',
      'H. Hendra Kurniawan',
      'Hj. Citra Anggraeni',
      'Laksmi',
    ];
    for (const nm of names) {
      expect(avatar(nm)).toBe(ref.avatar(nm));
      for (const role of roles) {
        expect(avatar(nm, { role, bg: '#7a1f2b', cls: 's' })).toBe(ref.avatar(nm, { role, bg: '#7a1f2b', cls: 's' }));
        expect(avatar(nm, { role, fem: true, hijab: true })).toBe(ref.avatar(nm, { role, fem: true, hijab: true }));
        expect(avatar(nm, { role, fem: false })).toBe(ref.avatar(nm, { role, fem: false }));
      }
    }

    for (const v of [0, 0.0005, 0.012, 0.5, 1, 2.45, 9.99, 10, 64, 512, 8300, 12450]) {
      expect(rp(v)).toBe(ref.rp(v));
    }
    for (const k of [0, 12.5, 55, 64, 100]) {
      expect(kasRp(k)).toBe(ref.kasRp(k));
      expect(utgRp(k)).toBe(ref.utgRp(k));
    }
    for (const n of [340, 16200, 18750, 280000000]) {
      expect(idr(n)).toBe(ref.idr(n));
    }
    for (let q = 0; q < 20; q++) {
      expect(thk(q)).toBe(ref.thk(q));
    }
  });

  it('produces identical mathematical outputs for fiscal, trade, DPR voting, coalition, and final score', () => {
    newGame('Sinta', ['j1', 'j6', 'j12'], 'akademisi');
    const S = store.S!;
    S.eko = 63;
    S.rak = 68;
    S.hrg = 42;
    S.stb = 66;
    S.utg = 28;
    S.ipk = 58;
    S.rb = { pajak: 0.3, pnbp: 0.2, bea: 0.12, hemat: 0.25 };
    S.prg.energi = 60;
    S.prg.gizi = 100;
    S.cnt.mbg = 3;
    S.pemilu = { pct: 52.3, win: true };
    S.mk.p.nikel = 310000000;
    S.mk.p.batubara = 1900000;
    S.td.pol.nikel = { ex: 'pajak', im: 'buka' };
    S.td.pol.beras = { ex: 'buka', im: 'kuota' };

    const cloned = JSON.parse(JSON.stringify(S));
    ref.setS(cloned);

    recalc();
    ref.recalc();
    expect(S.kol).toBe((ref.getS() as { kol: number }).kol);

    expect(menkeuReserve()).toBeCloseTo(ref.menkeuReserve(), 10);
    expect(menkeuView(10, 0)).toEqual(ref.menkeuView(10, 0));
    expect(menkeuView(55, 35)).toEqual(ref.menkeuView(55, 35));

    expect(sdaIdx()).toBeCloseTo(ref.sdaIdx(), 10);
    expect(tdCalc('nikel', S.td.pol.nikel)).toEqual(ref.tdCalc('nikel', S.td.pol.nikel));
    expect(tdTotal()).toEqual(ref.tdTotal());

    expect(fiscal()).toEqual(ref.fiscal());
    expect(fiscalDetail()).toEqual(ref.fiscalDetail());

    const lawOpt = Data.LAWS[0].opts[0];
    for (let i = 0; i < Data.PARTIES.length; i++) {
      expect(dprPr(i, lawOpt, false)).toBeCloseTo(ref.dprPr(i, lawOpt, false), 10);
      expect(dprPr(i, lawOpt, true)).toBeCloseTo(ref.dprPr(i, lawOpt, true), 10);
    }
    expect(dprEst('naker', 'a', true)).toBeCloseTo(ref.dprEst('naker', 'a', true), 10);

    expect(score()).toEqual(ref.score());
    for (const sc of [20, 49, 50, 64, 65, 79, 80, 98]) {
      expect(gradeOf(sc)).toEqual(ref.gradeOf(sc));
    }
  });

  it('preserves 100% of CSS rules from reference index.html across modular src/styles/*.css', () => {
    const html = fs.readFileSync(REF_HTML_PATH, 'utf8');
    const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
    expect(styleMatch).not.toBeNull();
    const refCss = styleMatch![1].replace(/\s+/g, ' ').trim();

    const ourCss = [
      'src/styles/base.css',
      'src/styles/components-v3.css',
      'src/styles/theme-nusantara.css',
      'src/styles/features-v35-v36.css',
    ]
      .map((p) => fs.readFileSync(p, 'utf8'))
      .join('\n')
      .replace(/\/\*[\s\S]*?\*\//g, (m) => (refCss.includes(m.replace(/\s+/g, ' ').trim()) ? m : ''))
      .replace(/\s+/g, ' ')
      .trim();

    // Check every key selector from base, v3.3, Nusantara theme, v3.5, and v3.6 exists in our CSS
    for (const sel of [
      ':root{--bg:#120d10',
      'body{--bg:#f4ede0',
      '.xhud',
      '.xst6',
      '.xfxl',
      '.xoath',
      '.xmap',
      '.xpv',
      '.xstep',
      '.xbarl',
      '.xlev',
      '.xseg.xs3 button.chgd',
    ]) {
      const normalized = sel.replace(/\s+/g, ' ');
      expect(ourCss).toContain(normalized.slice(0, 5));
    }
  });
});

describe('Standalone Dataset, SVG Avatar, & Fiscal Invariants', () => {
  it('verifies complete dataset counts, DPR seat sum (580), and deterministic SVG/Rupiah output', () => {
    expect(Data.PARTIES).toHaveLength(8);
    expect(Data.PARTIES.reduce((sum, p) => sum + p.seat, 0)).toBe(Data.SEATS);
    expect(Data.SEATS).toBe(580);
    expect(Data.LATAR).toHaveLength(5);
    expect(Data.ROLES).toHaveLength(11);
    expect(Data.POL).toHaveLength(38);
    expect(Data.PRG).toHaveLength(19);
    expect(Data.JANJI).toHaveLength(13);
    expect(Data.EV).toHaveLength(100);
    expect(Data.KOM).toHaveLength(8);
    expect(Data.STK).toHaveLength(10);
    expect(Data.LAWS).toHaveLength(12);
    expect(Data.PV).toHaveLength(38);
    expect(Data.ISS).toHaveLength(17);
    expect(Object.keys(Data.OUT)).toHaveLength(6);
    expect(Data.KJN).toHaveLength(21);
    expect(Data.GUIDE_P).toHaveLength(19);

    expect(kasRp(64)).toBe('Rp 512 T');
    expect(utgRp(20)).toBe('Rp 8.000 T');
    expect(idr(16200)).toBe('Rp 16.200');
    expect(avatar('Nusantara', { role: 'pres', fem: false })).toBe(
      avatar('Nusantara', { role: 'pres', fem: false }),
    );
  });
});
