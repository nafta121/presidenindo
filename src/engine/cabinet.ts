import { KAS_T } from '../data/constants';
import { AWARD, CAR, FF, FN, KOTA, LNM, PARTIES, ROLES, TTL, UNIV, UNIVLN } from '../data/parties';
import { toast } from '../rendering/effects';
import type { Minister, PartyDef, RoleDef, RoleKey } from '../types/game';
import { checkOver, log, recalc, roleIdx } from './stats';
import { render, save, store } from './store';
import { clamp, mk, one, rnd, rp, shuffle } from './utils';

export function genName(title?: boolean): string {
  for (let k = 0; k < 30; k++) {
    const f = Math.random() < 0.5;
    const n = (title ? one(TTL) : '') + (f ? one(FF) : one(FN)) + ' ' + one(LNM);
    if (!store.usedNames.has(n)) {
      store.usedNames.add(n);
      return n;
    }
  }
  return one(FN) + ' ' + one(LNM) + ' ' + rnd(2, 9);
}

export const trek = (i: number): string =>
  i <= 1
    ? 'Rekam jejak dikabarkan dekat dengan para pemburu rente.'
    : i === 2
      ? 'Beberapa kali disebut dalam laporan LSM antikorupsi.'
      : i === 3
        ? 'Rekam jejak biasa saja.'
        : i === 4
          ? 'Dikenal bersih dan disiplin anggaran.'
          : 'Dijuluki "Pak/Bu Anti Suap" oleh stafnya.';

export function genMin(role: RoleKey): Minister {
  const S = store.S!;
  const cands = S.par.map((p, k) => (p.k ? k : -9)).filter((k) => k >= 0);
  cands.push(-1);
  return {
    k: role,
    nm: genName(true),
    c: rnd(1, 5),
    i: rnd(1, 5),
    p: one(cands),
    sus: false,
    since: S.q,
    fund: 0,
    leak: 0,
    pol: 0,
    cs: 0,
  };
}

export const minOf = (k: RoleKey): Minister => store.S!.men[roleIdx(k)];
export const menkeu = (): Minister => store.S!.men.find((x) => x.k === 'keu')!;
export const setneg = (): Minister => minOf('set');

export interface MinisterProfile {
  m: Minister;
  r: RoleDef;
  umur: number;
  asal: string;
  s1: string;
  s2: string;
  car: string[];
  th: number;
  kw: number;
  dur: number;
  par: PartyDef | null;
  caps: string[];
  kin: [string, string];
  gaya: string;
  award: string | null;
}

export function profile(i: number): MinisterProfile {
  const S = store.S!;
  const m = S.men[i];
  const r = ROLES[i];
  const g = mk(m.nm + 'prof');
  const pk = <T>(a: readonly T[]): T => a[Math.floor(g() * a.length)];
  const umur = 44 + Math.floor(g() * 23);
  const car = shuffle(CAR[m.k] || ['Birokrat karier']).slice(0, 3);
  const th = Math.floor(m.since / 4) + 1;
  const kw = (m.since % 4) + 1;
  const dur = S.q - m.since + (S.res ? 1 : 0);
  const par = m.p >= 0 ? PARTIES[m.p] : null;
  const caps: string[] = [];
  if (m.fund) caps.push(`Mendanai ${m.fund} tahap program pemerintah`);
  if (m.pol) caps.push(`Menjalankan ${m.pol} kebijakan di bidangnya`);
  if (m.leak) caps.push(`⚠️ ${m.leak}× dana proyek diduga bocor`);
  if (m.cs) caps.push(`⚖️ Terseret ${m.cs} kasus korupsi`);
  if (!caps.length) caps.push('Belum ada capaian atau catatan khusus selama menjabat');
  const sc = m.c * 10 + m.i * 7 + m.fund * 3 + m.pol * 2 - m.leak * 8 - (m.sus ? 15 : 0);
  const kin: [string, string] =
    sc >= 70 ? ['Sangat baik', 'up'] : sc >= 50 ? ['Baik', 'up'] : sc >= 35 ? ['Cukup', 'gd'] : ['Buruk', 'dn'];
  const gaya =
    m.c >= 4 && m.i >= 4
      ? 'Teknokrat bersih, rapat dimulai tepat waktu dan laporannya rapi.'
      : m.c >= 4
        ? 'Cerdas dan gesit, tapi pengawasan di bawahnya longgar.'
        : m.i >= 4
          ? 'Jujur dan hati-hati, hanya saja eksekusinya sering lambat.'
          : m.c <= 2 && m.i <= 2
            ? 'Dikenal lebih piawai bersosialisasi daripada bekerja. Staf senior yang menjalankan.'
            : 'Pekerja biasa. Tidak menonjol, tapi tidak bikin masalah.';
  return {
    m,
    r,
    umur,
    asal: pk(KOTA),
    s1: pk(UNIV),
    s2: pk(UNIVLN),
    car,
    th,
    kw,
    dur: Math.max(1, dur),
    par,
    caps,
    kin,
    gaya,
    award: g() < 0.55 ? pk(AWARD) : null,
  };
}

export function openProf(i: number): void {
  if (!store.S) return;
  store.S.prof = i;
  render();
}

export function closeProf(): void {
  if (!store.S) return;
  store.S.prof = null;
  render();
}

export function openResh(i: number): void {
  const S = store.S;
  if (!S || S.usedResh || S.over) return;
  const role = S.men[i].k;
  S.prop = { kind: 'resh', idx: i, cands: [genMin(role), genMin(role), genMin(role)] };
  render();
}

export function chooseResh(k: number): void {
  const S = store.S;
  if (!S) return;
  const P = S.prop;
  if (!P || P.kind !== 'resh' || S.usedResh) return;
  const i = P.idx;
  const old = S.men[i];
  const nu = P.cands[k];
  if (!nu) return;
  if (old.p >= 0) S.par[old.p].s = clamp(S.par[old.p].s - 6);
  if (nu.p >= 0) S.par[nu.p].s = clamp(S.par[nu.p].s + 5);
  nu.prev = old.nm;
  S.men[i] = nu;
  S.usedResh = true;
  S.prop = null;
  recalc();
  log(`👔 Reshuffle: ${old.nm} diganti ${nu.nm} sebagai ${ROLES[i].j}`);
  toast(`${ROLES[i].j} baru: ${nu.nm}`);
  checkOver();
  save();
  render();
}

export function lobi(i: number): void {
  const S = store.S;
  if (!S) return;
  const p = S.par[i];
  if (S.usedDip || S.over || !p.k) return;
  p.s = clamp(p.s + 12);
  S.kas = clamp(S.kas - 3);
  S.usedDip = true;
  recalc();
  S.stat.dipl++;
  log('🤝 Lobi ketua umum ' + PARTIES[i].a);
  toast('Lobi ' + PARTIES[i].a + ' berhasil (+12 puas, −' + rp(3 * KAS_T) + ')');
  checkOver();
  save();
  render();
}

export function joinPar(i: number): void {
  const S = store.S;
  if (!S) return;
  const p = S.par[i];
  if (S.usedDip || S.over || p.k || p.s < 50) return;
  p.k = true;
  p.s = clamp(p.s + 8);
  S.kas = clamp(S.kas - 2);
  S.rak = clamp(S.rak - 1);
  S.usedDip = true;
  recalc();
  S.stat.dipl++;
  log('🤝 ' + PARTIES[i].n + ' bergabung ke koalisi');
  toast(PARTIES[i].a + ' bergabung ke koalisi!');
  checkOver();
  save();
  render();
}

export function advice(): [RoleKey, string] | null {
  const S = store.S;
  if (!S) return null;
  const co = S.par
    .map((p, i) => [p, i] as const)
    .filter(([p]) => p.k)
    .sort((a, b) => a[0].s - b[0].s)[0];
  if (S.kas < 25) {
    return [
      'keu',
      'Kas tinggal ' +
        rp(S.kas * KAS_T) +
        '. Tahan dulu program dan kebijakan mahal, atau Menkeu akan keberatan. Reformasi Pajak atau Pajak Digital bisa menambah pemasukan.',
    ];
  }
  if (co && co[0].s < 32) {
    return [
      'dag',
      PARTIES[co[1]].n +
        ' mulai kecewa (kepuasan ' +
        Math.round(co[0].s) +
        '). Buka tab Politik → Partai dan lobi ketua umumnya sebelum hengkang.',
    ];
  }
  if (S.cases.some((c) => c.pend)) {
    return ['dag', 'Ada kasus korupsi yang menunggu sikapmu. Buka tab Kasus.'];
  }
  if (S.rak < 38) {
    return ['sos', 'Kepercayaan rakyat rendah. Blusukan, bansos, atau operasi pasar murah bisa membantu.'];
  }
  if (S.stb < 38) {
    return ['dag', 'Stabilitas rawan. Perkuat aparat, atau dengarkan tuntutan warga.'];
  }
  if (S.eko < 38) {
    return ['eko', 'Ekonomi lesu. Infrastruktur, UMKM digital, atau hilirisasi bisa mendongkrak.'];
  }
  if (S.hrg > 68) {
    return ['tan', 'Harga pangan tinggi. Operasi pasar atau subsidi bisa meredam.'];
  }
  if (S.q === 0) {
    return [
      'eko',
      'Selamat bertugas! Putuskan kejadian pertama, lalu cek tab Kelola (Kebijakan, Program, Anggaran) sebelum tutup kuartal.',
    ];
  }
  return null;
}
