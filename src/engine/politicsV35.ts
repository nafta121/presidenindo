import { KAS_T, SEATS } from '../data/constants';
import { PARTIES, ROLES } from '../data/parties';
import { LAWS } from '../data/politics';
import { GOODN, ISS, PV } from '../data/provincesAndTrips';
import { toast } from '../rendering/effects';
import type {
  AllStatKey,
  AparatActionDef,
  DprVoteResult,
  EffectMap,
  LawOptionDef,
  MkJudge,
  ProvinceDef,
  RbKey,
  RoleKey,
} from '../types/game';
import { genName, minOf } from './cabinet';
import { nw, tag } from './mediaAndTrips';
import { addKas, apply, checkOver, log, note, recalc, roleIdx } from './stats';
import { render, save, store } from './store';
import { clamp, one, rnd, rp, shuffle } from './utils';

export function pvOf(id: string): ProvinceDef | undefined {
  return PV.find((x) => x.id === id);
}

export function pvAvg(): number {
  const S = store.S!;
  const v = Object.values(S.pv);
  return v.reduce((a, b) => a + b.puas, 0) / v.length;
}

export function pvIssues(): ProvinceDef[] {
  const S = store.S!;
  return PV.filter((p) => S.pv[p.id] && S.pv[p.id].iss);
}

export function pvCol(v: number): string {
  return v >= 70 ? '#2e9d68' : v >= 55 ? '#86bb5f' : v >= 40 ? '#e3b341' : v >= 25 ? '#e08a3c' : '#c23b3b';
}

export function pvSpawn(p: ProvinceDef, silent?: boolean): void {
  const S = store.S;
  if (!S) return;
  const ok = ISS.filter((i) => !i.rg || i.rg.indexOf(p.r) >= 0);
  const i = one(ok);
  S.pv[p.id].iss = { id: i.id, q0: S.q };
  if (!silent) {
    nw('daerah', i.t + ' di ' + p.n, i.d, -1, p.id);
  }
}

export function genMK(): MkJudge[] {
  const lat = [
    'Guru besar hukum tata negara',
    'Mantan hakim agung',
    'Advokat senior',
    'Mantan anggota DPR',
    'Akademisi konstitusi',
    'Mantan jaksa',
    'Aktivis hukum',
    'Birokrat karier',
    'Pakar hukum internasional',
  ];
  const ln = [
    'Konservatif',
    'Moderat',
    'Progresif',
    'Moderat',
    'Konservatif',
    'Progresif',
    'Moderat',
    'Konservatif',
    'Moderat',
  ];
  return lat.map((l, i) => ({ nm: genName(i % 3 === 2), lat: l, ln: ln[i] }));
}

export function pvHelp(id: string): void {
  const S = store.S;
  if (!S || S.over) return;
  if (S.pvAct >= 3) {
    toast('Kuota tindakan provinsi kuartal ini habis (3)');
    return;
  }
  const p = pvOf(id);
  const pv = S.pv[id];
  if (!p || !pv || !pv.iss) return;
  const is = ISS.find((x) => x.id === pv.iss!.id)!;
  if (S.kas - is.c < 5) {
    toast('Kas tidak cukup');
    return;
  }
  addKas('evt', -is.c);
  S.pvAct++;
  pv.puas = clamp(pv.puas + 12);
  apply({ rak: 1 });
  nw('daerah', 'Bantuan Pusat Tiba di ' + p.n + ': ' + is.t + ' Ditangani', 'Pemerintah pusat menggelontorkan ' + rp(is.c * KAS_T) + '.', 1, id);
  log('🚑 Bantuan pusat ke ' + p.n + ' (' + is.t + ')');
  pv.iss = null;
  toast('🚑 Bantuan ' + rp(is.c * KAS_T) + ' ke ' + p.n);
  save();
  render();
}

const ISSUE_ROLE_MAP: Record<string, RoleKey> = {
  banjir: 'dag',
  kering: 'tan',
  karhutla: 'dag',
  gempa: 'dag',
  longsor: 'dag',
  harga: 'tan',
  stunting: 'kes',
  jalan: 'eko',
  listrik: 'esd',
  demo: 'dag',
  agraria: 'dag',
  aman: 'han',
  korda: 'dag',
  tambang: 'esd',
  rob: 'dag',
  dbd: 'kes',
  sekolah: 'pdd',
};

export function pvMin(id: string): void {
  const S = store.S;
  if (!S || S.over) return;
  if (S.pvAct >= 3) {
    toast('Kuota tindakan provinsi kuartal ini habis (3)');
    return;
  }
  const p = pvOf(id);
  const pv = S.pv[id];
  if (!p || !pv || !pv.iss) return;
  const is = ISS.find((x) => x.id === pv.iss!.id)!;
  const role: RoleKey = ISSUE_ROLE_MAP[is.id] || 'dag';
  const m = minOf(role);
  S.pvAct++;
  if (Math.random() < 0.3 + m.c * 0.12) {
    pv.puas = clamp(pv.puas + 6);
    nw('daerah', ROLES[roleIdx(role)].j + ' Turun ke ' + p.n + ', ' + is.t + ' Teratasi', 'Tim kementerian bekerja bersama pemda.', 1, id);
    pv.iss = null;
    toast('✅ ' + m.nm + ' menangani ' + is.t + ' di ' + p.n);
  } else {
    pv.puas = clamp(pv.puas - 2);
    toast('⚠️ Penanganan belum tuntas, masalah masih berlanjut');
  }
  log('📋 Menteri ditugaskan ke ' + p.n);
  save();
  render();
}

export function pvVisit(id: string): void {
  const S = store.S;
  if (!S) return;
  if (S.usedTrip) {
    toast('Kunjungan kuartal ini sudah dijadwalkan');
    return;
  }
  S.trip = { id: 'pv_' + id };
  render();
}

export const negF = (f: EffectMap): EffectMap => {
  const o: EffectMap = {};
  for (const [k, v] of Object.entries(f) as Array<[AllStatKey, number | undefined]>) {
    if (v !== undefined) o[k] = -v;
  }
  return o;
};

export function revertRb(o: LawOptionDef): void {
  const S = store.S!;
  if (o.rb) {
    for (const [k, v] of Object.entries(o.rb) as Array<[RbKey, number | undefined]>) {
      if (v !== undefined) S.rb[k] = Math.max(0, (S.rb[k] || 0) - v);
    }
  }
  if (o.kpk) S.kpk = Math.max(0, Math.min(100, S.kpk - o.kpk));
}

export function lawLabel(id: string): string {
  const S = store.S!;
  const L = LAWS.find((x) => x.id === id)!;
  const v = S.law[id].v;
  return v === 'asli' ? 'Versi awal' : L.opts.find((o) => o.id === v)!.n;
}

export function lawOk(id: string): [boolean, string] {
  const S = store.S!;
  if (S.usedLaw) return [false, 'Usulan UU kuartal ini sudah diajukan.'];
  if (S.q - S.law[id].q < 6) return [false, 'Baru direvisi. Tunggu ' + (6 - (S.q - S.law[id].q)) + ' kuartal lagi.'];
  return [true, ''];
}

export function dprPr(i: number, o: LawOptionDef, lobi: boolean): number {
  const S = store.S!;
  const p = S.par[i];
  let pr = p.k ? 0.55 + (p.s - 50) / 110 : 0.1 + (p.s - 50) / 220;
  pr += (o.pop - 0.5) * (p.k ? 0.35 : 0.5);
  if (lobi) pr += p.k ? 0.15 : 0.06;
  pr += (S.rak - 50) / 400;
  return Math.max(0.03, Math.min(0.97, pr));
}

export function dprEst(id: string, optId: string, lobi: boolean): number {
  const o = LAWS.find((x) => x.id === id)!.opts.find((x) => x.id === optId)!;
  return PARTIES.reduce((a, P, i) => a + P.seat * dprPr(i, o, lobi), 0);
}

export function dprRun(id: string, optId: string, lobi: boolean): DprVoteResult {
  const o = LAWS.find((x) => x.id === id)!.opts.find((x) => x.id === optId)!;
  const rows = PARTIES.map((P, i) => {
    const pr = dprPr(i, o, lobi);
    return { i, pr, yes: Math.random() < pr, seats: P.seat };
  });
  const yes = rows.reduce((a, r) => a + (r.yes ? r.seats : 0), 0);
  return { rows, yes, pass: yes >= Math.floor(SEATS / 2) + 1 };
}

export function openLaw(id: string): void {
  const S = store.S;
  if (!S) return;
  const ok = lawOk(id);
  if (!ok[0]) {
    toast(ok[1]);
    return;
  }
  S.lawq = { id, opt: null, st: 'pick', lobi: false };
  render();
}

export function closeLaw(): void {
  if (!store.S) return;
  store.S.lawq = null;
  render();
}

export function pickLawOpt(o: string): void {
  const S = store.S;
  if (!S || !S.lawq) return;
  S.lawq.opt = o;
  S.lawq.st = 'prev';
  render();
}

export function lawBack(): void {
  const S = store.S;
  if (!S || !S.lawq) return;
  S.lawq.st = 'pick';
  S.lawq.opt = null;
  render();
}

export function lawLobi(): void {
  const S = store.S;
  if (!S || !S.lawq) return;
  const Q = S.lawq;
  if (Q.lobi) return;
  if (S.kas - 2 < 5) {
    toast('Kas tidak cukup untuk lobi fraksi');
    return;
  }
  addKas('evt', -2);
  Q.lobi = true;
  S.stat.dipl = (S.stat.dipl || 0) + 1;
  toast('🤝 Lobi fraksi: bagi proyek ' + rp(2 * KAS_T));
  render();
}

export function applyLaw(id: string, optId: string): void {
  const S = store.S!;
  const L = LAWS.find((x) => x.id === id)!;
  const o = L.opts.find((x) => x.id === optId)!;
  const lw = S.law[id];
  lw.prev = lw.v;
  lw.v = optId;
  lw.q = S.q;
  apply(o.f);
  if (o.rb) {
    for (const [k, v] of Object.entries(o.rb) as Array<[RbKey, number | undefined]>) {
      if (v !== undefined) S.rb[k] = (S.rb[k] || 0) + v;
    }
  }
  if (o.ipk) S.ipk = clamp(S.ipk + o.ipk);
  if (o.kpk) S.kpk = Math.max(0, Math.min(100, S.kpk + o.kpk));
  if (o.ap) {
    for (const w of ['tni', 'pol'] as const) {
      const branchDelta = o.ap[w];
      if (!branchDelta) continue;
      for (const k of ['loy', 'prof'] as const) {
        const delta = branchDelta[k];
        if (delta !== undefined) S.ap[w][k] = clamp(S.ap[w][k] + delta);
      }
    }
  }
  recalc();
}

export function lawSubmit(mode: 'vote' | 'perppu'): void {
  const S = store.S;
  if (!S || !S.lawq || !S.lawq.opt || S.over) return;
  const Q = S.lawq;
  const optId = Q.opt!;
  const L = LAWS.find((x) => x.id === Q.id)!;
  const o = L.opts.find((x) => x.id === optId)!;
  S.usedLaw = true;
  if (mode === 'perppu') {
    applyLaw(Q.id, optId);
    S.perppu = { law: Q.id, opt: optId, q: S.q };
    S.stat.otor = (S.stat.otor || 0) + 1;
    apply({ rak: -1, kol: -2 });
    Q.st = 'res';
    Q.vote = { perppu: true };
    log('📜 Presiden menerbitkan Perppu: ' + L.n + ' (' + o.n + ')');
    nw('kritik', 'Presiden Terbitkan Perppu ' + L.n, 'Langkah kilat dinilai melangkahi DPR. Parlemen akan menilai kuartal depan.', -1);
    nw('pertiwi', 'Perppu ' + L.n + ' Berlaku, Pemerintah Sebut Mendesak', 'Menteri menyebut kondisi "kegentingan memaksa".', 1);
  } else {
    const v = dprRun(Q.id, optId, Q.lobi);
    Q.vote = v;
    Q.st = 'res';
    S.stat.dipl = (S.stat.dipl || 0) + 1;
    S.votes.unshift({ q: S.q, law: Q.id, opt: optId, yes: v.yes, pass: v.pass });
    S.votes = S.votes.slice(0, 8);
    if (v.pass) {
      applyLaw(Q.id, optId);
      log('🏛️ DPR mengesahkan revisi: ' + L.n);
      nw('warta', 'DPR Sahkan Revisi ' + L.n, 'Voting paripurna: ' + v.yes + ' setuju dari ' + SEATS + ' kursi.', o.pop >= 0.5 ? 1 : -1);
      nw(
        o.pop >= 0.5 ? 'pertiwi' : 'kritik',
        o.pop >= 0.5 ? 'Revisi ' + L.n + ' Disambut Positif' : 'Revisi ' + L.n + ' Tuai Kritik Keras',
        o.n,
        o.pop >= 0.5 ? 1 : -1,
      );
      const pc = Math.max(0.05, Math.min(0.85, o.ctr * 0.7 + (1 - o.pop) * 0.3));
      if (Math.random() < pc) {
        S.gug.push({ id: ++S.gid, law: Q.id, opt: optId, q0: S.q, st: 'sidang', lobi: false });
        Q.gug = true;
        nw('kritik', 'Koalisi Masyarakat Gugat ' + L.n + ' ke Mahkamah Konstitusi', 'Permohonan uji materi didaftarkan. Sidang dimulai.', -1);
      }
    } else {
      apply({ rak: -1 });
      log('🏛️ DPR menolak revisi: ' + L.n);
      nw('kritik', 'DPR Tolak Usulan Revisi ' + L.n, 'Voting: ' + v.yes + ' setuju. Pemerintah gagal meloloskan usul.', -1);
    }
  }
  checkOver();
  save();
  render();
}

export function mkLobi(id: number): void {
  const S = store.S;
  if (!S) return;
  const g = S.gug.find((x) => x.id === id);
  if (!g || g.st !== 'sidang' || g.lobi || S.over) return;
  if (S.kas - 2 < 5) {
    toast('Kas tidak cukup');
    return;
  }
  addKas('evt', -2);
  g.lobi = true;
  S.mkind = Math.max(0, S.mkind - 8);
  if (Math.random() < 0.3) {
    apply({ rak: -4 });
    S.ipk = clamp(S.ipk - 6);
    note('🔍 Upaya melobi hakim MK terbongkar! Publik geram.');
    nw('kritik', 'Skandal: Istana Diduga Lobi Hakim Konstitusi', 'Dewan etik dibentuk. Kredibilitas MK dipertanyakan.', -1);
    toast('Upaya lobi terbongkar! Rakyat marah.');
  } else {
    toast('Lobi hakim berjalan diam-diam (independensi MK turun)');
  }
  save();
  render();
}

export const APR_ACT: Record<'tni' | 'pol', AparatActionDef[]> = {
  tni: [
    {
      id: 'sej',
      ic: '🍚',
      t: 'Naikkan kesejahteraan prajurit',
      d: 'Rp ' + 4 * 8 + ' T. Loyalitas +10, profesionalisme +2.',
      cost: 4,
      f: (a) => {
        a.loy += 10;
        a.prof += 2;
      },
    },
    {
      id: 'alu',
      ic: '🛡️',
      t: 'Modernisasi alutsista',
      d: 'Rp 64 T. Profesionalisme +12, Stabilitas +2.',
      cost: 8,
      f: (a) => {
        a.prof += 12;
        apply({ stb: 2 });
      },
    },
    {
      id: 'ref',
      ic: '📘',
      t: 'Reformasi doktrin & profesionalisme',
      d: 'Gratis. Profesionalisme +7, loyalitas −3, Rakyat +1.',
      cost: 0,
      f: (a) => {
        a.prof += 7;
        a.loy -= 3;
        apply({ rak: 1 });
      },
    },
    {
      id: 'ganti',
      ic: '🔄',
      t: 'Ganti Panglima TNI',
      d: 'Panglima baru. Loyalitas reset, Rakyat −1. Maks 1× per 4 kuartal.',
      cost: 0,
      gt: true,
    },
  ],
  pol: [
    {
      id: 'ops',
      ic: '🚓',
      t: 'Tambah anggaran operasional',
      d: 'Rp 24 T. Loyalitas +8, profesionalisme +3, Stabilitas +1.',
      cost: 3,
      f: (a) => {
        a.loy += 8;
        a.prof += 3;
        apply({ stb: 1 });
      },
    },
    {
      id: 'ref',
      ic: '📘',
      t: 'Reformasi Polri (Propam & pengawasan)',
      d: 'Gratis. Profesionalisme +9, loyalitas −4, Integritas +3.',
      cost: 0,
      f: (a) => {
        a.prof += 9;
        a.loy -= 4;
        if (store.S) store.S.ipk = clamp(store.S.ipk + 3);
      },
    },
    {
      id: 'judol',
      ic: '🎯',
      t: 'Operasi berantas narkoba & judi online',
      d: 'Rp 16 T. Peluang berhasil naik dengan profesionalisme.',
      cost: 2,
      f: (a) => {
        if (Math.random() < 0.4 + a.prof / 200) {
          apply({ rak: 3, stb: 2 });
          toast('✅ Operasi berhasil, rakyat lega');
          nw('pertiwi', 'Polri Bongkar Jaringan Narkoba & Judol', 'Ratusan tersangka diamankan.', 1);
        } else {
          apply({ rak: -1 });
          toast('⚠️ Operasi kurang hasil');
          nw('kritik', 'Operasi Judol Dinilai Tebang Pilih', 'Bandar besar masih lolos.', -1);
        }
      },
    },
    {
      id: 'ganti',
      ic: '🔄',
      t: 'Ganti Kapolri',
      d: 'Kapolri baru. Loyalitas reset, Rakyat −1. Maks 1× per 4 kuartal.',
      cost: 0,
      gt: true,
    },
  ],
};

export function aprDo(w: 'tni' | 'pol', id: string): void {
  const S = store.S;
  if (!S) return;
  const A = S.ap[w];
  const act = APR_ACT[w].find((x) => x.id === id);
  if (S.over || !act) return;
  if (S.ap.act >= 2) {
    toast('Kuota tindakan aparat kuartal ini habis (2)');
    return;
  }
  if (act.gt && S.q - A.chg < 4) {
    toast('Pergantian pimpinan hanya 1× per 4 kuartal');
    return;
  }
  if (act.cost && S.kas - act.cost < 5) {
    toast('Kas tidak cukup');
    return;
  }
  if (act.cost) addKas('evt', -act.cost);
  S.ap.act++;
  if (act.gt) {
    const nm = (w === 'tni' ? 'Jenderal TNI ' : 'Jenderal Pol. ') + genName(true).replace(/^(Dr\.|Drs\.|Ir\.|H\.|Hj\.)\s*/, '');
    A.nm = nm;
    A.loy = rnd(45, 70);
    A.prof = rnd(40, 70);
    A.chg = S.q;
    apply({ rak: -1 });
    log('🔄 ' + (w === 'tni' ? 'Panglima TNI' : 'Kapolri') + ' diganti: ' + nm);
    nw('warta', (w === 'tni' ? 'Presiden Lantik Panglima TNI Baru: ' : 'Presiden Lantik Kapolri Baru: ') + nm, 'Pelantikan digelar di Istana.', 0);
  } else if (act.f) {
    act.f(A);
    log((w === 'tni' ? '🪖 ' : '👮 ') + act.t);
  }
  A.loy = clamp(A.loy);
  A.prof = clamp(A.prof);
  checkOver();
  save();
  render();
}

export function v35End(): void {
  const S = store.S;
  if (!S || !S.pv) return;

  PV.forEach((p) => {
    const v = S.pv[p.id];
    if (v.iss) {
      const age = S.q - v.iss.q0;
      v.puas = clamp(v.puas - 5 - age);
      if (age >= 3) {
        v.iss = null;
        v.puas = clamp(v.puas - 6);
        nw('daerah', 'Warga ' + p.n + ' Bertahan Sendiri, Masalah Mereda', 'Pemerintah pusat dikritik lamban hadir.', -1, p.id);
      }
      if (v.iss && age >= 2 && Math.random() < 0.35) {
        nw(
          'daerah',
          'Isu "' + ISS.find((x) => x.id === v.iss!.id)!.t + '" di ' + p.n + ' Berlarut-larut',
          'Warga menanti kehadiran pemerintah pusat.',
          -1,
          p.id,
        );
      }
    } else {
      v.puas = clamp(v.puas + (40 + S.rak * 0.4 - v.puas) * 0.15);
    }
  });

  const unres = pvIssues().filter((p) => S.q - S.pv[p.id].iss!.q0 >= 1).length;
  apply({ rak: -Math.min(1.2, unres * 0.12) });

  const n = rnd(1, 2);
  shuffle(PV.filter((p) => !S.pv[p.id].iss))
    .slice(0, n)
    .forEach((p) => pvSpawn(p));

  shuffle(PV.filter((p) => !S.pv[p.id].iss))
    .slice(0, 2)
    .forEach((p) => {
      const g = one(GOODN)(p);
      nw('daerah', g[0], g[1], 1, p.id);
      S.pv[p.id].puas = clamp(S.pv[p.id].puas + 3);
    });

  const av = pvAvg();
  apply({ rak: (av - 52) / 90 });
  S.pvAct = 0;

  const ap = S.ap;
  const st = (ap.tni.loy + ap.tni.prof + ap.pol.loy + ap.pol.prof) / 4;
  apply({ stb: (st - 45) / 80 });
  [ap.tni, ap.pol].forEach((a) => {
    a.loy = clamp(a.loy - 0.6);
    a.prof = clamp(a.prof - 0.2);
  });
  if (ap.tni.loy < 30 && Math.random() < 0.3) {
    apply({ stb: -5, rak: -3 });
    note('🪖 Elite TNI menunjukkan sikap tak patuh. Stabilitas terguncang.');
    nw('kritik', 'Loyalitas TNI Dipertanyakan, Pasar Cemas', 'Pengamat menyebut komunikasi Istana-Cilangkap memburuk.', -1);
  }
  if (ap.pol.prof < 30 && Math.random() < 0.35) {
    apply({ rak: -3 });
    S.ipk = clamp(S.ipk - 2);
    note('👮 Kasus oknum polisi viral di medsos. Kepercayaan publik turun.');
    nw('viral', 'Oknum Polisi Viral, Netizen Geram ' + tag('PolisiViral'), 'Desakan reformasi menguat.', -1);
  }
  if (ap.tni.loy > 85 && ap.tni.prof < 45) {
    S.ipk = clamp(S.ipk - 2);
    nw('kritik', 'Kekhawatiran Militerisme: TNI Dinilai Terlalu Dominan', 'Aktivis sipil mendesak batasan peran.', -1);
  }
  ap.act = 0;
  S.news = S.news.slice(0, 120);

  // MK judicial review
  S.gug
    .filter((g) => g.st === 'sidang' && g.q0 < S.q)
    .forEach((g) => {
      const L = LAWS.find((x) => x.id === g.law)!;
      const o = L.opts.find((x) => x.id === g.opt)!;
      const pg = Math.max(0.05, Math.min(0.85, 0.22 + o.ctr * 0.35 + (1 - o.pop) * 0.25 + (S.mkind - 50) / 250 - (g.lobi ? 0.28 : 0)));
      g.st = Math.random() < pg ? 'dikabulkan' : 'ditolak';
      g.qd = S.q;
      const lw = S.law[g.law];
      if (g.st === 'dikabulkan') {
        apply(negF(o.f));
        lw.v = lw.prev;
        revertRb(o);
        apply({ rak: o.pop < 0.5 ? 3 : -2 });
        note('🏛️ MK mengabulkan gugatan: ' + L.n + ' (' + o.n + ') dibatalkan.');
        nw('warta', 'MK Batalkan Revisi ' + L.n, 'Putusan final dan mengikat. Pemerintah diminta menyesuaikan.', o.pop < 0.5 ? 1 : -1);
        nw('kritik', 'Putusan MK: Pukulan bagi Pemerintah', 'Revisi UU dinilai cacat konstitusional.', -1);
      } else {
        apply({ rak: o.pop < 0.5 ? -1 : 1 });
        note('🏛️ MK menolak gugatan atas ' + L.n + '. UU tetap berlaku.');
        nw('pertiwi', 'MK Tolak Gugatan Revisi ' + L.n, 'Pemerintah menyambut baik putusan.', 1);
      }
    });

  // Perppu review by DPR
  if (S.perppu && S.perppu.q < S.q) {
    const pp = S.perppu;
    S.perppu = null;
    const vote = dprRun(pp.law, pp.opt, false);
    const L = LAWS.find((x) => x.id === pp.law)!;
    const o = L.opts.find((x) => x.id === pp.opt)!;
    if (vote.pass) {
      note('📜 DPR menyetujui Perppu ' + L.n + ' menjadi UU.');
      nw('warta', 'DPR Sahkan Perppu ' + L.n, 'Voting: ' + vote.yes + ' setuju dari ' + SEATS + ' kursi.', 1);
    } else {
      apply(negF(o.f));
      S.law[pp.law].v = S.law[pp.law].prev;
      revertRb(o);
      apply({ rak: -3 });
      S.ipk = clamp(S.ipk - 2);
      note('📜 DPR menolak Perppu ' + L.n + '. Aturan dicabut, wibawa Presiden turun.');
      nw('kritik', 'DPR Tolak Perppu ' + L.n, 'Presiden dinilai melangkahi parlemen.', -1);
    }
  }

  // MA cassation
  S.cases
    .filter((c) => c.kas && c.kas.st === 'proses' && c.kas.q0 < S.q)
    .forEach((c) => {
      const nm = String(c.who).split(',')[0];
      const r = Math.random();
      const rec = c.recT || 0;
      const kas = c.kas!;
      if (r < 0.55) {
        kas.st = 'ditolak';
        note('🧑‍⚖️ MA menolak kasasi ' + nm + '. Vonis tetap.');
      } else if (r < 0.8) {
        kas.st = 'dikurangi';
        addKas('rec', (-rec * 0.3) / KAS_T);
        S.ipk = clamp(S.ipk - 1);
        c.yrs = Math.max(1, (c.yrs || 5) - rnd(1, 3));
        note('🧑‍⚖️ MA mengurangi hukuman ' + nm + ' (sisa ' + c.yrs + ' tahun). Uang pengganti dipotong ' + rp(rec * 0.3) + '.');
        nw('kritik', 'MA Korting Hukuman ' + nm, 'Publik mempertanyakan konsistensi pemberantasan korupsi.', -1);
      } else {
        kas.st = 'diperberat';
        addKas('rec', (rec * 0.2) / KAS_T);
        S.ipk = clamp(S.ipk + 2);
        c.yrs = (c.yrs || 5) + rnd(2, 5);
        note('🧑‍⚖️ MA memperberat hukuman ' + nm + ' menjadi ' + c.yrs + ' tahun. Tambahan uang pengganti ' + rp(rec * 0.2) + '.');
        nw('pertiwi', 'MA Perberat Hukuman ' + nm, 'Putusan disambut baik pegiat antikorupsi.', 1);
      }
      kas.qd = S.q;
    });
}
