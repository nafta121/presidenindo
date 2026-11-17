import { AGN, KAS_T } from '../data/constants';
import { NEED_T, POL } from '../data/policies';
import { PRG } from '../data/programs';
import { FAILT, ISS, KJN, PV, REGF, REGN, REGPROJ } from '../data/provincesAndTrips';
import type { EffectMap, OutletKey, TripDef } from '../types/game';
import { minOf } from './cabinet';
import { addKas, apply, checkOver, log, net, polCost, seed } from './stats';
import { render, save, store } from './store';
import { clamp, fmtN, kasRp, one, rp, shuffle, utgRp } from './utils';

export function tag(s: unknown): string {
  return '#' + String(s).replace(/[^A-Za-z0-9]+/g, '').slice(0, 16);
}

export function nw(o: OutletKey, h: string, s?: string, tn?: number, pv?: string | null): void {
  const S = store.S;
  if (!S) return;
  S.news.unshift({ q: S.q, o, h, s: s || '', tn: tn || 0, pv: pv || null });
}

export function provTrip(id: string): TripDef {
  const S = store.S;
  const p = PV.find((x) => x.id === id)!;
  const f = REGF[p.r];
  const ds = p.r === 'jaw' ? 1 : p.r === 'pap' || p.r === 'mal' ? 3 : 2;
  const pj = REGPROJ[p.r];
  const r1 = (x: number): number => Math.round(x * 10) / 10;
  const itin = [
    `Tiba di ${p.ibu}, disambut tokoh adat dan Forkopimda. ${p.kh[0]} jadi hidangan penyambutan`,
    `Meninjau ${pj[0]} dan berdialog dengan warga`,
    `Bertemu pelaku usaha, resmikan ${pj[1]}, kembali ke Jakarta`,
  ].slice(0, ds === 1 ? 2 : ds === 2 ? 2 : 3);
  if (ds === 1) {
    itin[1] = 'Bertemu warga di ' + p.ibu + ', meninjau ' + pj[0] + ', lalu kembali ke Jakarta';
  }
  const iss = S && S.pv && S.pv[p.id] && S.pv[p.id].iss ? ISS.find((x) => x.id === S.pv[p.id].iss!.id) : null;
  const fe: EffectMap = { rak: 3 };
  if (p.r === 'pap' || p.r === 'mal' || p.r === 'kal') fe.stb = 1;
  if (p.r === 'sum' || p.r === 'sul' || p.r === 'jaw') fe.eko = 1;
  return {
    id: 'pv_' + id,
    kind: 'dn',
    pv: id,
    ic: p.ic,
    n: p.ibu + ', ' + p.n,
    reg: REGN[p.r] + ' · ' + p.n,
    days: ds,
    itin,
    cost: {
      'Pesawat kepresidenan & BBM': r1(2.4 * f),
      'Akomodasi rombongan': r1(0.7 * f),
      'Pengamanan Paspampres': r1(1.6 * f),
      'Rombongan menteri & wartawan': r1(1.2 * f),
      'Acara & jamuan': r1(0.7 * f),
    },
    f: fe,
    hi: [
      `Warga ${p.ibu} menyambut hangat, ${p.kh[0]} jadi buah tangan`,
      'Tokoh daerah menyampaikan aspirasi langsung',
      `${pj[2] || pj[0]} jadi sorotan kunjungan`,
      iss ? 'Presiden meninjau langsung lokasi ' + iss.t.toLowerCase() : 'Dialog dengan warga berlangsung cair',
    ],
  };
}

export function findTrip(id: string): TripDef | undefined {
  if (String(id).indexOf('pv_') === 0) return provTrip(String(id).slice(3));
  return KJN.find((x) => x.id === id);
}

export const tripCost = (t: TripDef): number => Object.values(t.cost).reduce((a, b) => a + b, 0);

export function tripOk(t: TripDef): [boolean, string] {
  const S = store.S!;
  if (S.usedTrip) return [false, 'Kunjungan kuartal ini sudah dijadwalkan.'];
  if (t.kind === 'ln') {
    if (AGN[S.q]) return [false, 'Ada agenda politik besar kuartal ini. Setneg menyarankan tidak ke luar negeri.'];
    if (S.stb < 35 || S.rak < 30) return [false, 'Situasi dalam negeri genting. Setneg menyarankan menunda.'];
  }
  if (S.kas - tripCost(t) / 1000 / KAS_T <= 3) return [false, 'Kas tidak cukup untuk biaya perjalanan.'];
  return [true, ''];
}

export function tripChance(t: TripDef): number {
  const S = store.S!;
  const set = minOf('set');
  const base = t.kind === 'ln' ? 0.55 : 0.72;
  return Math.max(0.25, Math.min(0.92, base + (S.kol - 50) / 220 + (S.rak - 50) / 400 + (set.c - 3) * 0.04));
}

export function openTrip(id: string): void {
  if (!store.S) return;
  store.S.trip = { id };
  render();
}

export function closeTrip(): void {
  if (!store.S) return;
  store.S.trip = null;
  render();
}

export function goTrip(): void {
  const S = store.S;
  if (!S) return;
  const t = S.trip && findTrip(S.trip.id);
  if (!t || S.over) return;
  if (!tripOk(t)[0]) return;
  const cost = tripCost(t);
  const good = Math.random() < tripChance(t);
  addKas('trip', -cost / 1000 / KAS_T);
  let f: EffectMap = { ...t.f };
  if (!good) {
    f = t.kind === 'ln' ? { rak: -2 } : { rak: 1 };
  } else if (t.kind === 'ln' && S.rak < 45) {
    f.rak = (f.rak || 0) - 1;
  }
  apply(f);
  S.usedTrip = true;
  S.trips.push(t.id);
  if (t.pv && S.pv && S.pv[t.pv]) {
    const pv = S.pv[t.pv];
    pv.puas = clamp(pv.puas + (good ? 14 : 5));
    pv.vis = (pv.vis || 0) + 1;
    if (good) pv.iss = null;
  }
  S.stat.trip = (S.stat.trip || 0) + 1;
  const hl = good ? one(t.hi) : one(FAILT);
  S.tripRep = { id: t.id, good, cost, f, hl, inv: good ? t.inv || 0 : 0, q: S.q };
  seed({ t: 'trip', id: t.id, good, cost });
  log('✈️ Kunjungan kerja ke ' + t.n + (good ? ' (berhasil)' : ' (kurang berhasil)'));
  S.trip = null;
  checkOver();
  save();
  render();
}

export function closeTripRep(): void {
  if (!store.S) return;
  store.S.tripRep = null;
  save();
  render();
}

export function mkNews(): void {
  const S = store.S;
  if (!S) return;
  const set = minOf('set');
  const before = S.news.length;
  (S.seeds || []).forEach((sd) => {
    if (sd.t === 'pol') {
      const p = POL.find((x) => x.id === sd.id);
      if (!p) return;
      const cost = polCost(p);
      nw('pertiwi', 'Pemerintah Resmi Tetapkan ' + p.n, 'Langkah ini disebut sebagai ikhtiar pemerintah demi kesejahteraan rakyat.', 1);
      if (cost > 0 || net(p.f) < 2) {
        nw(
          'kritik',
          cost > 0 ? p.n + ' Telan ' + rp(cost * KAS_T) + ', Siapa yang Mengawasi?' : p.n + ': Dampaknya ke Rakyat Dipertanyakan',
          'Anggota dewan dan pegiat antikorupsi minta transparansi pelaksanaan.',
          -1,
        );
      }
      if (Math.random() < 0.6) {
        nw('viral', tag(p.n) + ' ramai di linimasa. Netizen terbelah.', 'Ada yang bilang "akhirnya", ada yang bilang "cuma pencitraan".', 0);
      }
      if (cost >= NEED_T) {
        nw('garuda', 'Pasar Cermati ' + p.n + ': Anggaran ' + rp(cost * KAS_T), 'Analis menilai ruang fiskal makin sempit.', cost >= 12 ? -1 : 0);
      }
    } else if (sd.t === 'prg') {
      const p = PRG.find((x) => x.id === sd.id);
      if (!p) return;
      nw('warta', 'Program ' + p.n + ' Berlanjut: Progres ' + Math.round(S.prg[sd.id]) + '%', 'Pendanaan tahap baru dikucurkan kuartal ini.', 1);
      if (sd.leak) {
        nw('kritik', 'Dana ' + p.n + ' Diduga Bocor', 'LSM antikorupsi minta aparat menelusuri aliran dana proyek.', -1);
      } else {
        nw('pertiwi', p.n + ' Mulai Dirasakan Warga', 'Warga di sejumlah daerah menyambut baik progresnya.', 1);
      }
    } else if (sd.t === 'evt') {
      nw('warta', sd.ti + ': Presiden Memilih "' + sd.p + '"', 'Keputusan diumumkan lewat Sekretariat Negara.', sd.n >= 0 ? 1 : -1);
      if (sd.n < -2) {
        nw('kritik', 'Respons Presiden soal "' + sd.ti + '" Dinilai Kurang Tepat', 'Pengamat: langkah itu berisiko menambah masalah baru.', -1);
      } else if (sd.n > 2) {
        nw('pertiwi', 'Sigap! Presiden Tangani "' + sd.ti + '"', 'Kebijakan dinilai cepat dan tepat sasaran.', 1);
      }
    } else if (sd.t === 'trip') {
      const t = findTrip(sd.id);
      if (!t) return;
      if (sd.good) {
        nw('pertiwi', 'Kunjungan ke ' + t.n + ' Sukses, Sambutan Hangat', 'Rombongan Presiden disambut meriah.', 1);
        nw('viral', tag(t.n.split(',')[0]) + ' trending usai kunjungan Presiden', 'Video momen di lapangan ditonton jutaan kali.', 1);
      } else {
        nw('kritik', 'Kunjungan ke ' + t.n + ' Dinilai Boros, Hasil Seadanya', 'Biaya perjalanan sampai ' + rp(sd.cost / 1000) + ' dipertanyakan publik.', -1);
      }
      if (t.kind === 'ln' && sd.good && t.inv) {
        nw(
          'garuda',
          'Komitmen Investasi Rp ' + fmtN(t.inv) + ' T dari Lawatan ke ' + t.n.split(',').pop()!.trim(),
          'Realisasi diperkirakan bertahap dalam beberapa tahun.',
          1,
        );
      }
    } else if (sd.t === 'mkt') {
      nw('garuda', sd.h, sd.s, sd.tn || 0);
    }
  });

  (S.notes || []).forEach((n) => {
    const bad = /korupsi|tersangka|vonis|hengkang|bocor|sidang/i.test(n);
    nw(bad ? 'kritik' : 'warta', n.replace(/^[^\wA-Za-z"]+/, ''), bad ? 'Perkembangan terbaru diikuti publik.' : '', bad ? -1 : 0);
  });

  if (S.rak < 40) nw('kritik', 'Kepercayaan Rakyat Merosot ke ' + Math.round(S.rak), 'Survei: banyak warga merasa janji belum ditepati.', -1);
  else if (S.rak >= 70) nw('pertiwi', 'Survei: Kepuasan Publik Tembus ' + Math.round(S.rak), 'Pemerintah diapresiasi atas kinerjanya.', 1);
  if (S.hrg >= 62) nw('viral', 'Harga Pangan Naik, Emak-Emak Menjerit ' + tag('HargaNaik'), 'Keluhan membanjiri kolom komentar.', -1);
  if (S.kas < 25) nw('garuda', 'Kas Negara Tinggal ' + kasRp(S.kas) + ', Pasar Cemas', 'Investor menunggu langkah disiplin fiskal.', -1);
  else if (S.eko >= 65) nw('garuda', 'Ekonomi Menguat, Indeks Kepercayaan Pasar Naik', 'Analis menilai kebijakan fiskal berjalan on track.', 1);
  if (S.utg >= 45) nw('garuda', 'Utang Negara Tembus ' + utgRp(S.utg), 'Beban bunga jadi sorotan.', -1);
  if (set.c >= 4) nw('pertiwi', 'Setneg: "Pemerintah Terbuka pada Kritik"', 'Mensesneg ' + set.nm + ' memastikan semua laporan sampai ke Presiden.', 1);
  else if (set.c <= 2 && Math.random() < 0.35) nw('viral', 'Rilis Setneg Salah Ketik, Publik Heboh ' + tag('SetnegTypo'), 'Staf Istana buru-buru meralat.', -1);

  const add = S.news.length - before;
  if (add > 7) {
    const keep = S.news.slice(0, add);
    const pick7 = shuffle(keep).slice(0, 7);
    S.news = pick7.concat(S.news.slice(add));
  }
  S.news = S.news.slice(0, 80);
  S.seeds = [];
}

export function newsMood(): number {
  const S = store.S!;
  const cur = S.news.filter((n) => n.q === S.q - (S.res ? 0 : 1));
  const sc = cur.reduce((a, n) => a + n.tn, 0);
  return cur.length ? sc : 0;
}
