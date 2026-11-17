import { KAS_T } from '../data/constants';
import { PARTIES, ROLES } from '../data/parties';
import { AGN_NAMES, BB, CASE_ACT, CASE_ACT2, CASE_OBJ, CASE_WHO, MODUS } from '../data/politics';
import { toast } from '../rendering/effects';
import type { CaseDecision, CorruptionCase } from '../types/game';
import { genMin, genName } from './cabinet';
import { nw } from './mediaAndTrips';
import { addKas, apply, checkOver, log, note, recalc } from './stats';
import { render, save, store } from './store';
import { clamp, one, rnd, rp, shuffle } from './utils';

export const amtFmt = (a: number): string => rp(a / 1000);

export const kpkF = (): number => 0.7 + (store.S ? store.S.kpk : 60) / 250;

export function caseDetail(c: CorruptionCase): void {
  const S = store.S;
  if (!S || c.ag) return;
  const w = [0.4 * (0.5 + S.kpk / 100), 0.35, 0.25];
  const t = w[0] + w[1] + w[2];
  const r = Math.random() * t;
  c.ag = r < w[0] ? 'KPK' : r < w[0] + w[1] ? 'Kejaksaan' : 'Polri';
  const M = one(MODUS);
  c.mod = M.n;
  c.flow = M.flow;
  c.pasal = M.pasal;
  c.bb = shuffle(BB.slice()).slice(0, 3);
  c.tl = c.tl || [];
  c.tl.push({ q: S.q, t: AGN_NAMES[c.ag] + ' memulai penyelidikan: dugaan ' + M.n.toLowerCase() + '.' });
}

export function tlAdd(c: CorruptionCase, st: number): void {
  const S = store.S;
  if (!S) return;
  if (!c.tl) c.tl = [];
  const nm = String(c.who).split(',')[0];
  const ag = c.ag || 'KPK';
  if (st === 1) {
    c.tl.push({
      q: S.q,
      t:
        (AGN_NAMES[ag] || ag) +
        ' menetapkan ' +
        nm +
        ' sebagai tersangka (' +
        c.pasal +
        '). Penahanan 20 hari. Aset disita: ' +
        (c.bb || []).join(', ') +
        '.',
    });
  }
  if (st === 2) {
    c.sak = rnd(4, 18);
    c.tut = rnd(6, 16);
    c.tl.push({
      q: S.q,
      t:
        'Sidang Pengadilan Tipikor dimulai. Dakwaan: ' +
        c.mod +
        '. JPU menghadirkan ' +
        c.sak +
        ' saksi dan menuntut ' +
        c.tut +
        ' tahun penjara.',
    });
    if (ag === 'Polri' && c.dec === 'lindungi' && Math.random() < 0.3) {
      c.done = true;
      c.sp3 = true;
      c.qd = S.q;
      c.res = 'Penyidikan dihentikan lewat SP3. Publik menduga ada intervensi dari lingkar kekuasaan.';
      c.tl.push({ q: S.q, t: 'Polri mengeluarkan SP3 (penghentian penyidikan). Pegiat antikorupsi memprotes.' });
      apply({ rak: -3 });
      S.ipk = clamp(S.ipk - 5);
      note('🔥 SP3 kasus ' + nm + ' memicu kecurigaan intervensi. Integritas turun.');
      nw('kritik', 'SP3 Kasus ' + nm + ' Picu Kecurigaan Intervensi Istana', 'Pegiat antikorupsi mendesak KPK mengambil alih.', -1);
    }
  }
  if (st === 3) {
    c.tl.push({
      q: S.q,
      t:
        'Hakim Tipikor membacakan vonis ' +
        c.yrs +
        ' tahun penjara' +
        (c.tut && (c.yrs || 0) < c.tut - 4 ? ' (lebih ringan dari tuntutan ' + c.tut + ' tahun)' : '') +
        '.',
    });
  }
}

export function spawnCase(mi: number | null, title?: string): CorruptionCase {
  const S = store.S!;
  let who = '';
  let pi = -1;
  let t = '';
  let actualMi: number | null = null;
  if (mi != null) {
    const m = S.men[mi];
    m.sus = true;
    m.cs = (m.cs || 0) + 1;
    actualMi = mi;
    who = m.nm + ', ' + ROLES[mi].j;
    pi = m.p;
    t =
      title ||
      one(['Dugaan gratifikasi proyek', 'Dugaan suap pengadaan', 'Dugaan penggelembungan anggaran']) +
        ' di ' +
        ROLES[mi].j;
  } else {
    who = genName(false) + ', ' + one(CASE_WHO);
    pi = rnd(0, PARTIES.length - 1);
    t = Math.random() < 0.55 ? one(CASE_ACT)(one(CASE_OBJ)) : one(CASE_ACT2);
  }
  const amt = Math.round(one([45, 120, 300, 750, 1400, 2800, 5200, 9000, 18000, 45000]) * (0.8 + Math.random() * 0.4));
  const c: CorruptionCase = {
    id: ++S.cid,
    q0: S.q,
    stage: 0,
    dec: null,
    pend: false,
    done: false,
    res: '',
    mi: actualMi,
    who,
    pi,
    t,
    amt,
  };
  S.cases.push(c);
  if (S.kpk !== undefined) caseDetail(c);
  log('⚖️ Komisi Antirasuah selidiki: ' + c.t + ' (' + amtFmt(c.amt) + ')');
  return c;
}

export function decideCase(id: number, ch: CaseDecision): void {
  const S = store.S;
  if (!S) return;
  const c = S.cases.find((x) => x.id === id);
  if (!c || !c.pend || S.over) return;
  c.pend = false;
  c.dec = ch;
  S.stat[ch] = (S.stat[ch] || 0) + 1;
  const pi = c.pi;
  const m = c.mi != null ? S.men[c.mi] : null;
  if (ch === 'dukung') {
    apply({ rak: m ? 6 : 4 });
    S.ipk = clamp(S.ipk + (m ? 4 : 3));
    S.stat.dipl++;
    if (pi >= 0) S.par[pi].s = clamp(S.par[pi].s - (m ? 8 : 5));
    if (m && c.mi != null) {
      S.men[c.mi] = genMin(m.k);
    }
    log('⚖️ Presiden dukung penuh proses hukum: ' + c.who);
    toast(m ? 'Menteri dicopot, proses hukum jalan' : 'Kamu mendukung proses hukum');
  } else if (ch === 'diam') {
    apply({ rak: -1 });
    S.ipk = clamp(S.ipk - 1);
    log('🤐 Presiden memilih tidak berkomentar soal kasus ' + c.who);
    toast('Kamu memilih diam');
  } else {
    apply({ rak: -5 });
    S.ipk = clamp(S.ipk - 6);
    S.stat.otor++;
    if (pi >= 0) S.par[pi].s = clamp(S.par[pi].s + 8);
    apply({ kol: 2 });
    log('🛡️ Dugaan intervensi melindungi ' + c.who);
    toast('Kamu melindungi mereka. Risiko bocor.');
  }
  recalc();
  checkOver();
  save();
  render();
}

export function caseStep(): void {
  const S = store.S;
  if (!S) return;
  const act = S.cases.filter((c) => !c.done);
  act.forEach((c) => {
    if (c.pend) {
      c.pend = false;
      c.dec = 'diam';
      S.stat.diam++;
      S.ipk = clamp(S.ipk - 1);
      apply({ rak: -1 });
      log('🤐 Kasus ' + c.who + ' lewat tanpa sikap Presiden');
    }
    c.stage++;
    const nmx = String(c.who).split(',')[0];
    if (c.stage === 1) {
      c.pend = true;
      const T_ = (((c.amt * rnd(10, 25)) / 100) / 1000) * kpkF();
      addKas('rec', T_ / KAS_T);
      tlAdd(c, 1);
      note('⚖️ ' + nmx + ' resmi tersangka (' + c.t + '). Aset disita awal, kas negara bertambah ' + rp(T_) + '.');
    } else if (c.stage === 2) {
      log('🧑‍⚖️ Sidang perdana kasus ' + c.t);
      tlAdd(c, 2);
      if (c.done) return;
    } else if (c.stage >= 3) {
      c.stage = 3;
      c.done = true;
      c.qd = S.q;
      const yrs = rnd(3, 14);
      const mult = c.dec === 'dukung' ? 1.1 : c.dec === 'lindungi' ? 0.4 : 0.8;
      const T_ = (((c.amt * rnd(15, 45)) / 100) / 1000) * mult;
      addKas('rec', T_ / KAS_T);
      c.yrs = yrs;
      c.recT = T_;
      tlAdd(c, 3);
      if (Math.random() < 0.55) {
        c.kas = { st: 'proses', q0: S.q };
        c.tl = c.tl || [];
        c.tl.push({ q: S.q, t: 'Terdakwa mengajukan kasasi ke Mahkamah Agung.' });
      }
      if (c.dec === 'lindungi' && Math.random() < 0.5) {
        apply({ rak: -5 });
        S.ipk = clamp(S.ipk - 4);
        c.res =
          'Vonis ' +
          yrs +
          ' tahun + uang pengganti ' +
          rp(T_) +
          ' masuk kas. Terungkap upaya perlindungan dari lingkar Istana.';
        note('🔥 Skandal! Upaya melindungi ' + nmx + ' terbongkar saat sidang. Uang pengganti ' + rp(T_) + ' masuk kas.');
      } else {
        S.ipk = clamp(S.ipk + 1);
        c.res = 'Divonis ' + yrs + ' tahun penjara. Denda dan uang pengganti ' + rp(T_) + ' masuk kas negara.';
        note('🔨 ' + nmx + ' divonis ' + yrs + ' tahun. Denda dan uang pengganti ' + rp(T_) + ' masuk kas negara.');
      }
      if (c.mi != null && S.men[c.mi]) S.men[c.mi].sus = false;
    }
  });

  const active = S.cases.filter((c) => !c.done).length;
  const sus = S.men.map((m, i) => [m, i] as const).filter(([m]) => m.i <= 2 && !m.sus);
  if (sus.length && Math.random() < 0.14 * sus.length) {
    spawnCase(sus[rnd(0, sus.length - 1)][1]);
  } else if (active < 4 && Math.random() < 0.45) {
    spawnCase(null);
  }
  if (S.cases.length > 14) {
    S.cases = S.cases.filter((c) => !c.done || S.q - (c.qd || 0) < 4).slice(-14);
  }
}
