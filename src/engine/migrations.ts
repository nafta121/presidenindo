import { ROLES } from '../data/parties';
import { LAWS } from '../data/politics';
import { PRG } from '../data/programs';
import { PV } from '../data/provincesAndTrips';
import type { FlowKey } from '../types/game';
import { genMin, genName } from './cabinet';
import { caseDetail } from './corruption';
import { ledInit } from './fiscal';
import { mkInit, smInit, tdInit } from './market';
import { genMK, pvSpawn } from './politicsV35';
import { store } from './store';
import { shuffle } from './utils';

export function ensure36(): void {
  const S = store.S;
  if (!S) return;
  PRG.forEach((p) => {
    if (S.prg[p.id] === undefined) S.prg[p.id] = 0;
  });
  if (!S.led) S.led = ledInit();
}

export function ensure351(): void {
  const S = store.S;
  if (!S || !S.mk) return;
  if (!S.td) {
    S.td = tdInit();
  }
}

export function ensure35(): void {
  const S = store.S;
  if (!S) return;
  if (!S.pv) {
    S.pv = {};
    PV.forEach((p) => {
      S.pv[p.id] = { puas: Math.round(52 + Math.random() * 16), iss: null, vis: 0 };
    });
    shuffle(PV.slice())
      .slice(0, 2)
      .forEach((p) => pvSpawn(p, true));
  }
  if (!S.law) S.law = {};
  LAWS.forEach((l) => {
    if (!S.law[l.id]) S.law[l.id] = { v: 'asli', q: -99, prev: 'asli' };
  });
  if (S.usedLaw === undefined) S.usedLaw = false;
  if (S.lawq === undefined) S.lawq = null;
  if (!S.votes) S.votes = [];
  if (!S.gug) S.gug = [];
  if (!S.gid) S.gid = 0;
  if (S.mkind === undefined) S.mkind = 70;
  if (S.maind === undefined) S.maind = 65;
  if (S.kpk === undefined) S.kpk = 60;
  if (!S.mkj) S.mkj = genMK();
  if (!S.perppu) S.perppu = null;
  if (!S.ap) {
    S.ap = {
      tni: {
        nm: 'Jenderal TNI ' + genName(true).replace(/^(Dr\.|Drs\.|Ir\.|H\.|Hj\.)\s*/, ''),
        loy: S.lat === 'jenderal' ? 75 : 58,
        prof: 55,
        chg: -99,
      },
      pol: {
        nm: 'Jenderal Pol. ' + genName(true).replace(/^(Dr\.|Drs\.|Ir\.|H\.|Hj\.)\s*/, ''),
        loy: 58,
        prof: 55,
        chg: -99,
      },
      act: 0,
    };
  }
  if (S.pvAct === undefined) S.pvAct = 0;
  if (!S.pvNote) S.pvNote = {};
  (S.cases || []).forEach((c) => {
    if (!c.ag) caseDetail(c);
  });
}

export function ensure34(): void {
  const S = store.S;
  if (!S) return;
  if (!S.gen) S.gen = 'l';
  if (!S.sm) S.sm = smInit();
  if (S.fxAlert === undefined) S.fxAlert = null;
  if (S.fxUsed === undefined) S.fxUsed = false;
  ensure35();
  ensure351();
  ensure36();
}

export function ensure33(): void {
  const S = store.S;
  if (!S) return;
  if (!S.news) S.news = [];
  if (!S.seeds) S.seeds = [];
  if (S.usedTrip === undefined) S.usedTrip = false;
  if (!S.trips) S.trips = [];
  if (!S.stat) S.stat = { dukung: 0, lindungi: 0, diam: 0, dipl: 0, otor: 0 };
  if (!S.stat.trip) S.stat.trip = 0;
  if (!S.fl) S.fl = { pol: 0, prg: 0, evt: 0, rec: 0, trip: 0, mkt: 0, trd: 0 };
  (['pol', 'prg', 'evt', 'rec', 'trip', 'mkt', 'trd'] as FlowKey[]).forEach((k) => {
    if (!S.fl[k]) S.fl[k] = 0;
  });
  while (S.men.length < ROLES.length) {
    S.men.push(genMin(ROLES[S.men.length].k));
  }
  S.men.forEach((m) => {
    if (m.since === undefined) m.since = 0;
    (['fund', 'leak', 'pol', 'cs'] as const).forEach((k) => {
      if (!m[k]) m[k] = 0;
    });
  });
  if (!S.mk) S.mk = mkInit();
  if (S.trip === undefined) S.trip = null;
  if (S.tripRep === undefined) S.tripRep = null;
  S.prof = null;
  ensure34();
}

export const ensureAll = ensure33;
