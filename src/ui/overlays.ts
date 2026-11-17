import { CAT, KAS_T, SEATS, UTG_T } from '../data/constants';
import { GUIDE_P } from '../data/guide';
import { OUTFIT, PARTIES, ROLES } from '../data/parties';
import { POL_ROLE, TECH_TXT } from '../data/policies';
import { LAWS } from '../data/politics';
import { PRG } from '../data/programs';
import { coalSeats, JANJI, progDone } from '../data/promises';
import { OUT } from '../data/provincesAndTrips';
import { menkeu, profile, setneg } from '../engine/cabinet';
import { menkeuView } from '../engine/fiscal';
import { curEv } from '../engine/lifecycle';
import { ihsg, usdState } from '../engine/market';
import { findTrip, tripChance, tripCost, tripOk } from '../engine/mediaAndTrips';
import { prgBenefit, prgTotal, propSpec, rbText } from '../engine/policiesAndPrograms';
import { dprEst, dprPr, lawLabel } from '../engine/politicsV35';
import { roleIdx, techMult } from '../engine/stats';
import { store } from '../engine/store';
import { col, esc, fmtN, idr, kasRp, rp, thk, utgRp } from '../engine/utils';
import { avatar, mAv } from '../rendering/avatar';
import type { DprVoteResult, EffectMap } from '../types/game';
import { chainHTML, chips, cuB, setHead } from './hud';
import { fxOptHTML, menkeuAdvice } from './panels/bursaPanels';
import { repLines } from './panels/kelolaPanels';

export function guideHTML(): string {
  const idx = store.GUIDE!;
  const g = GUIDE_P[idx];
  const last = idx === GUIDE_P.length - 1;
  return `<div class="modal xguide"><div class="card"><div class="xgh"><span class="tag">CARA MAIN · ${idx + 1}/${GUIDE_P.length}</span><button class="xcl" data-action="closeGuide" aria-label="Tutup">✕</button></div>
  <div class="eic">${g.ic}</div><h2>${g.t}</h2><div class="xgb">${g.b}</div>
  <div class="xdots">${GUIDE_P.map((_, i) => `<i class="${i === idx ? 'on' : ''}"></i>`).join('')}</div>
  <div class="xgn"><button class="alt" ${idx === 0 ? 'disabled' : ''} data-action="guideNav" data-dir="-1">← Kembali</button><button ${last ? 'data-action="closeGuide"' : 'data-action="guideNav" data-dir="1"'}>${last ? 'Mulai Main 🇮🇩' : 'Lanjut →'}</button></div></div></div>`;
}

export function oathHTML(): string {
  const S = store.S!;
  const t = new Date();
  const bln = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  const tgl = t.getDate() + ' ' + bln[t.getMonth()] + ' ' + t.getFullYear();
  return `<div class="modal"><div class="card xprop xoath">
  <div class="xoh xa" style="--i:0"><div class="xgar">🦅</div><small>REPUBLIK INDONESIA</small><b>SURAT SUMPAH / JANJI PRESIDEN</b></div>
  <p class="xa" style="--i:2"><b>Dengan ini saya, ${esc(S.nama)},</b> yang dilantik sebagai Presiden Republik Indonesia untuk masa jabatan 5 tahun (20 kuartal), menyatakan:</p>
  <p class="xoq xa" style="--i:4">“Demi Tuhan Yang Maha Esa, saya bersumpah / berjanji akan memenuhi kewajiban Presiden Republik Indonesia dengan sebaik-baiknya dan seadil-adilnya, memegang teguh Undang-Undang Dasar dan menjalankan segala undang-undang dan peraturannya dengan selurus-lurusnya, serta berbakti kepada nusa dan bangsa.”</p>
  <p class="xa" style="--i:6"><small>Jakarta, ${tgl}</small></p>
  <div class="xsig xa" style="--i:7"><span>${esc(S.nama)}</span><small>${S.gen === 'p' ? 'Ibu' : 'Bapak'} Presiden Republik Indonesia</small></div>
  <div class="xchs xa" style="--i:9"><button data-action="takeOath" data-kind="sumpah">🤚 Mengucapkan Sumpah</button><button class="alt" data-action="takeOath" data-kind="janji">🙏 Mengucapkan Janji</button></div></div></div>`;
}

export function profHTML(): string {
  const S = store.S!;
  const i = S.prof!;
  const P = profile(i);
  const m = P.m;
  const r = P.r;
  const dots = Array.from({ length: 5 }, (_, k) => `<i class="${k < m.i ? 'on' : ''}"></i>`).join('');
  const row = (a: string, b: string, n: number): string =>
    `<div class="xpr xa" style="--i:${n}"><span>${a}</span><div>${b}</div></div>`;
  const par = P.par
    ? `${P.par.ic} ${P.par.n}<br><small>Ketum ${esc(P.par.ketum)} · ${P.par.ide}${S.par[m.p].k ? ' · koalisi' : ' · oposisi'}</small>`
    : '🎓 Profesional (non-partai)';
  return `<div class="modal"><div class="card xprop xprof"><div class="xgh"><span class="tag">PROFIL MENTERI</span><button class="xcl" data-action="closeProf" aria-label="Tutup">✕</button></div>
  <div class="xph xa" style="--i:0"><div class="xpav">${mAv(m)}</div><div><h2 style="margin:0">${esc(m.nm)}</h2><b>${r.ic} ${r.j}</b><br><span class="stars">${'★'.repeat(m.c) + '☆'.repeat(5 - m.c)}</span> <small>kompetensi</small></div></div>
  <div class="xbox">
  ${row('Kinerja', `<b class="${P.kin[1]}">${P.kin[0]}</b> · 🧼 <span class="xd">${dots}</span>`, 1)}
  ${row('Partai', par, 2)}
  ${row('Usia & asal', `${P.umur} tahun · ${P.asal}`, 3)}
  ${row('Pendidikan', `S1 ${P.s1}<br><small>S2/S3 ${P.s2}</small>`, 4)}
  ${row('Karier', P.car.map((c) => '• ' + c).join('<br>'), 5)}
  ${row(
    'Masa jabatan',
    `Dilantik ${thk(m.since)} · ${P.dur} kuartal menjabat${m.prev ? `<br><small>Menggantikan ${esc(m.prev)}</small>` : '<br><small>Anggota kabinet awal</small>'}`,
    6,
  )}
  ${row('Capaian', P.caps.map((c) => '• ' + c).join('<br>'), 7)}
  ${row('Gaya kerja', P.gaya, 8)}
  ${P.award ? row('Penghargaan', P.award, 9) : ''}
  ${m.sus ? row('Status', '<b class="dn">⚠️ Disebut dalam kasus korupsi</b>', 10) : ''}
  </div>
  <div class="xchs"><button data-action="closeProf">Tutup</button>${S.usedResh ? '' : `<button data-action="profResh" data-idx="${i}">🔄 Ganti menteri ini<small>Pilih dari 3 kandidat</small></button>`}</div></div></div>`;
}

export function tripHTML(): string {
  const S = store.S!;
  const t = findTrip(S.trip!.id)!;
  const ok = tripOk(t);
  const c = tripCost(t);
  const itin = t.itin
    .map((x, i) => `<div class="xpr xa" style="--i:${i + 2}"><span>Hari ${i + 1}</span><div>${x}</div></div>`)
    .join('');
  const rows = Object.entries(t.cost)
    .filter(([, v]) => v > 0)
    .map(([k, v], i) => `<div class="xrow xl2 xa" style="--i:${i + 4}"><span>${k}</span>${cuB(v / 1000, '−', i * 120)}</div>`)
    .join('');
  const ch = tripChance(t);
  return `<div class="modal"><div class="card xprop"><div class="xgh"><span class="tag">DRAF AGENDA SETNEG</span><button class="xcl" data-action="closeTrip" aria-label="Tutup">✕</button></div>
  ${setHead('Pak/Bu Presiden, ini draf agenda kunjungan kerja ke ' + t.n + ' selama ' + t.days + ' hari.')}
  <div class="xper xa" style="margin:.5rem 0;--i:1"><div class="eic" style="margin:0">${t.ic}</div><div class="xpi"><h2 style="margin:0">${t.n}</h2><small>${t.kind === 'ln' ? 'Kunjungan kenegaraan' : 'Kunjungan kerja'} · ${t.reg} · ${t.days} hari</small></div></div>
  <div class="xbox">${itin}</div>
  <b class="xa" style="--i:3">💰 Rincian biaya perjalanan</b>
  <div class="xbox">${rows}<div class="xrow xl2 tot xa" style="--i:9"><span>Total biaya (dari kas negara)</span>${cuB(c / 1000, '−', 700)}</div></div>
  <div class="xeff xa" style="--i:10">${chips(t.f)}</div>
  ${t.inv ? `<small class="xlt">💼 Potensi komitmen investasi ±Rp ${fmtN(t.inv)} T (bila berhasil)</small>` : ''}
  <small class="xlt">🎯 Peluang berhasil: ${Math.round(ch * 100)}% (dipengaruhi DPR, rakyat, dan kinerja Setneg)</small>
  ${ok[0] ? '' : `<small class="xmk no">${ok[1]}</small>`}
  <div class="xchs"><button ${ok[0] ? '' : 'disabled'} data-action="goTrip">✈️ Setujui & Berangkat</button><button class="alt" data-action="closeTrip">Batal</button></div></div></div>`;
}

export function tripRepHTML(): string {
  const S = store.S!;
  const R = S.tripRep!;
  const t = findTrip(R.id)!;
  return `<div class="modal"><div class="card xprop"><span class="tag"><i></i>LAPORAN KUNJUNGAN KERJA</span>
  ${setHead('Kunjungan ke ' + t.n + ' selesai, Pak/Bu Presiden. Berikut laporannya.')}
  <div class="xstamp ${R.good ? 'ok' : 'no'}">${R.good ? 'BERHASIL' : 'KURANG BERHASIL'}</div>
  <div class="xper xa" style="margin:.3rem 0;--i:2"><div class="eic" style="margin:0">${t.ic}</div><div class="xpi"><h2 style="margin:0">${t.n}</h2><small>${R.good ? '✅' : '⚠️'} ${esc(R.hl)}</small></div></div>
  <div class="xbox"><div class="xrow xl2 xa" style="--i:3"><span>Biaya perjalanan</span>${cuB(R.cost / 1000, '−', 300)}</div></div>
  <div class="xeff xa" style="--i:4">${chips(R.f)}</div>
  ${R.inv ? `<div class="xnote xa" style="--i:5">💼 Komitmen investasi tercatat ±Rp ${fmtN(R.inv)} T (realisasi bertahap).</div>` : ''}
  <button data-action="closeTripRep">Lanjut →</button></div></div>`;
}

export function lawHTML(): string {
  const S = store.S!;
  const Q = S.lawq!;
  const L = LAWS.find((x) => x.id === Q.id)!;
  const hd = `<div class="xgh"><span class="tag">${Q.st === 'res' ? 'HASIL' : 'REVISI UU'}</span><button class="xcl" data-action="closeLaw" aria-label="Tutup">✕</button></div><h2>${L.ic} ${L.n}</h2>`;

  if (Q.st === 'pick') {
    return (
      `<div class="modal"><div class="card xprop">${hd}<small>${L.no} · versi berlaku: ${lawLabel(L.id)}</small><p>${L.d}</p>` +
      L.opts
        .map(
          (o) =>
            `<div class="card"><b>${o.n}</b><div>${chips(o.f)}</div><small class="xlt">Dukungan publik: ${o.pop >= 0.6 ? 'Tinggi' : o.pop >= 0.45 ? 'Terbelah' : 'Rendah'} · Risiko digugat ke MK: ${o.ctr >= 0.6 ? 'Tinggi' : o.ctr >= 0.4 ? 'Sedang' : 'Rendah'}</small><button data-action="pickLawOpt" data-opt="${o.id}">Pilih opsi ini</button></div>`,
        )
        .join('') +
      `</div></div>`
    );
  }

  const o = L.opts.find((x) => x.id === Q.opt)!;
  if (Q.st === 'prev') {
    const est = Math.round(dprEst(Q.id, Q.opt!, Q.lobi));
    const need = Math.floor(SEATS / 2) + 1;
    const rows = PARTIES.map((P, i) => {
      const pr = dprPr(i, o, Q.lobi);
      return `<div class="pt"><span>${P.ic} ${P.a} ${S.par[i].k ? '<small>(koalisi)</small>' : ''} · ${P.seat} kursi</span><b style="color:${col(pr * 100)}">${Math.round(pr * 100)}%</b></div>`;
    }).join('');
    return `<div class="modal"><div class="card xprop">${hd}<p><b>${o.n}</b></p><div>${chips(o.f)}</div>
  <h3 class="xqh">Perkiraan dukungan DPR</h3><p>Taksiran suara setuju ±<b>${est}</b> dari ${SEATS} kursi (perlu ${need}). <span class="${est >= need + 30 ? 'up' : est >= need - 30 ? 'gd' : 'dn'}">${est >= need + 30 ? 'Peluang besar' : est >= need - 30 ? 'Tipis, bisa lolos bisa tidak' : 'Sulit lolos'}</span></p>${rows}
  <div class="xact"><button class="ch" ${Q.lobi ? 'disabled' : ''} data-action="lawLobi">🤝 Lobi fraksi (${rp(2 * KAS_T)})${Q.lobi ? ' ✓' : ''}</button>
  <button class="ch" data-action="lawSubmit" data-mode="vote">🏛️ Ajukan ke paripurna DPR</button>
  <button class="ch" ${S.perppu ? 'disabled' : ''} data-action="lawSubmit" data-mode="perppu">📜 Terbitkan Perppu (langsung berlaku, DPR menilai kuartal depan, wibawa turun)</button>
  <button class="alt" data-action="lawBack">← Ganti opsi</button></div></div></div>`;
  }

  const v = Q.vote!;
  if ('perppu' in v && v.perppu) {
    return `<div class="modal"><div class="card xprop">${hd}<div class="eic">📜</div><h2>Perppu Terbit</h2><p>${o.n} langsung berlaku. DPR akan menilai kuartal depan. Jika ditolak, aturan dicabut dan wibawamu turun.</p><button data-action="closeLaw">Tutup</button></div></div>`;
  }

  const vr = v as DprVoteResult;
  const rows = vr.rows
    .map(
      (r) =>
        `<div class="pt"><span>${PARTIES[r.i].ic} ${PARTIES[r.i].a} (${r.seats})</span><b>${r.yes ? '✅ Setuju' : '❌ Tolak'}</b></div>`,
    )
    .join('');
  return `<div class="modal"><div class="card xprop">${hd}<div class="eic">${vr.pass ? '✅' : '❌'}</div><h2>${vr.pass ? 'DPR Mengesahkan' : 'DPR Menolak'}</h2><p>Setuju ${vr.yes} dari ${SEATS} kursi (perlu ${Math.floor(SEATS / 2) + 1}).</p>${rows}
 ${vr.pass && Q.gug ? '<p class="xmk no">⚠️ Koalisi masyarakat langsung menggugat revisi ini ke Mahkamah Konstitusi.</p>' : ''}<button data-action="closeLaw">Tutup</button></div></div>`;
}

export function propHTML(): string {
  const S = store.S!;
  const P = S.prop!;
  if (P.kind === 'resh') {
    const i = P.idx;
    const m = S.men[i];
    const r = ROLES[i];
    const cands = P.cands
      .map(
        (c, k) =>
          `<div class="xcand"><div class="xper">${avatar(c.nm, { role: OUTFIT[c.k], bg: c.p >= 0 ? PARTIES[c.p].c : '#555' })}<div class="xpi"><b>${esc(c.nm)}</b><br><small>${c.p >= 0 ? PARTIES[c.p].ic + ' ' + PARTIES[c.p].n : '🎓 Profesional (non-partai)'}</small><br><span class="stars">${'★'.repeat(c.c) + '☆'.repeat(5 - c.c)}</span> <small>· 🧼 integritas: belum diketahui</small></div></div><button data-action="chooseResh" data-idx="${k}">Lantik sebagai menteri</button></div>`,
      )
      .join('');
    return `<div class="modal"><div class="card xprop"><div class="xgh"><span class="tag">RESHUFFLE KABINET</span><button class="xcl" data-action="cancelProp" aria-label="Tutup">✕</button></div>
   <h2>Ganti ${r.ic} ${r.j}?</h2><p>Menteri saat ini: <b>${esc(m.nm)}</b> (${'★'.repeat(m.c)}, integritas ${m.i}/5). Pilih satu pengganti. Hanya <b>1 menteri per kuartal</b> yang bisa diganti.</p>
   <p class="hint">Partai menteri lama kecewa (−6 kepuasan), partai penggantinya senang (+5).</p>${cands}
   <button class="alt" data-action="cancelProp">Batal</button></div></div>`;
  }

  const sp = propSpec(P);
  const p = sp.p;
  const isP = sp.kind === 'pol';
  const role = sp.kind === 'pol' ? POL_ROLE[sp.p.id] : sp.p.role;
  const tmi = role && role !== 'keu' ? roleIdx(role) : -1;
  const tm = tmi >= 0 ? S.men[tmi] : null;
  const m = menkeu();
  const mi = roleIdx('keu');
  const v = menkeuView(sp.cost, sp.debt);
  const cost = sp.cost * KAS_T;
  const lines: string[] = [];
  lines.push(`<div class="xrow xl2"><span>Kas sekarang</span><b>${kasRp(S.kas)}</b></div>`);

  if (sp.kind === 'pol') {
    const kasVal = sp.p.f.kas || 0;
    const utgVal = sp.p.f.utg || 0;
    if (sp.cost > 0) lines.push(`<div class="xrow xl2"><span>Anggaran kebijakan</span><b class="dn">−${rp(cost)}</b></div>`);
    else if (kasVal > 0) lines.push(`<div class="xrow xl2"><span>Penerimaan</span><b class="up">+${rp(kasVal * KAS_T)}</b></div>`);
    if (utgVal !== 0) {
      lines.push(
        `<div class="xrow xl2"><span>Utang ${utgVal > 0 ? 'bertambah' : 'berkurang'}</span><b class="${utgVal > 0 ? 'dn' : 'up'}">${utgVal > 0 ? '+' : '−'}${rp(Math.abs(utgVal) * UTG_T)}</b></div>`,
      );
    }
  } else {
    lines.push(`<div class="xrow xl2"><span>Pendanaan tahap ini</span><b class="dn">−${rp(cost)}</b></div>`);
    lines.push(`<div class="xrow xl2"><span>Progres saat ini</span><b>${Math.round(S.prg[sp.p.id])}%</b></div>`);
  }

  const after = S.kas + (sp.kind === 'pol' ? sp.p.f.kas || 0 : -sp.p.cost);
  lines.push(`<div class="xrow xl2 tot"><span>Kas setelahnya</span><b>${kasRp(after)}</b></div>`);

  const eff =
    sp.kind === 'pol'
      ? `<div class="xeff">${chips(Object.fromEntries(Object.entries(sp.p.f).filter(([k]) => k !== 'kas' && k !== 'utg')) as EffectMap)}</div>${rbText(sp.p) ? `<small class="xlt">📈 Jangka panjang: ${rbText(sp.p)}</small>` : ''}`
      : `<small class="xlt">📈 Manfaat saat berjalan: ${prgBenefit(sp.p)}</small><small class="xlt">⏳ Estimasi total ±${rp(prgTotal(sp.p))}</small>`;

  const rev = P.st === 'review';
  const steps: Array<[string, string, string]> = [['📨', 'Setneg', 'ok']];
  if (tm) steps.push([ROLES[tmi].ic, ROLES[tmi].j.replace('Menteri ', 'Men. '), 'ok']);
  steps.push(['💰', 'Menkeu', rev ? 'wait' : 'no']);
  steps.push(['🏛️', 'Presiden', 'wait']);

  const sline = `Pak/Bu Presiden, usulan "${p.n}" sudah saya disposisikan ke ${tm ? ROLES[tmi].j + ' dan ' : ''}Menteri Keuangan.`;
  const tech = tm
    ? `<div class="xadv xa" style="--i:4;margin:.4rem 0">${mAv(tm, 's')}<div class="xsay"><small>${ROLES[tmi].j} · ${esc(tm.nm)} · ${'★'.repeat(tm.c)}</small><div>${TECH_TXT[tm.c - 1]}</div><small>Efek kebijakan ${techMult(tm.c) >= 1 ? '+' : ''}${Math.round((techMult(tm.c) - 1) * 100)}% menurut kesiapan kementerian.${tm.i <= 2 ? ' ⚠️ Integritas menteri ini diragukan, dana rawan bocor.' : ''}</small></div></div>`
    : '';
  const mav = mAv(m, 's');

  let body: string;
  let btns: string;
  if (rev) {
    body = `${setHead(sline)}${chainHTML(steps)}${tech}<div class="xadv xa" style="--i:6">${mav}<div class="xsay"><small>${ROLES[mi].j} · ${esc(m.nm)}</small><div>Saya akan menelaah dari sisi kas, Pak/Bu Presiden.</div></div></div>`;
    btns = `<button data-action="submitProp">📨 Ajukan ke Menkeu${tm ? ' (setelah menteri teknis)' : ''}</button><button class="alt" data-action="cancelProp">Batal</button>`;
  } else {
    const why =
      P.why === 'utang'
        ? `"Utang kita sudah ${utgRp(S.utg)}. Menambah utang lagi membebani APBN lewat bunga. Saya tidak bisa menyetujui."`
        : `"Kas kita tinggal ${kasRp(S.kas)}. Anggaran ${rp(cost)} akan menyisakan ${kasRp(v.after)}, di bawah cadangan aman ${kasRp(v.reserve)}. Saya keberatan, Pak/Bu Presiden."`;
    body = `${chainHTML(steps)}<div class="xstamp no">KEBERATAN</div>${tech}<div class="xadv xa" style="--i:3">${mav}<div class="xsay no"><small>⛔ ${ROLES[mi].j} KEBERATAN · ${esc(m.nm)}</small><div>${why}</div>${P.msg ? `<div style="margin-top:.4rem;color:#a11">${P.msg}</div>` : ''}</div></div>`;
    btns = `<button data-action="propChoice" data-choice="ikuti">🕊️ Ikuti nasihat<small>Batalkan. Pasar menilai disiplin fiskal (+1 Ekonomi).</small></button>
   <button ${P.neg ? 'disabled' : ''} data-action="propChoice" data-choice="rundingan">🤝 Terus berunding<small>${P.neg ? 'Sudah dicoba kuartal ini.' : 'Peluang tergantung dukungan DPR & rakyat. Jika berhasil, anggaran dipangkas 25%.'}</small></button>
   <button ${S.usedResh ? 'disabled' : ''} data-action="propChoice" data-choice="reshuffle">🔄 Reshuffle Menkeu<small>${S.usedResh ? 'Reshuffle kuartal ini sudah dipakai.' : 'Copot Menkeu, kebijakan langsung jalan. Pasar kaget (−3 Ekonomi), partai Menkeu lama kesal.'}</small></button>`;
  }

  return `<div class="modal"><div class="card xprop"><div class="xgh"><span class="tag">${isP ? 'PENGAJUAN KEBIJAKAN' : 'PENDANAAN PROGRAM'}</span><button class="xcl" data-action="cancelProp" aria-label="Tutup">✕</button></div>
  <div class="xper" style="margin:.5rem 0"><div class="eic" style="margin:0">${p.ic}</div><div class="xpi"><h2 style="margin:0">${p.n}</h2><small>${p.d}</small></div></div>
  <div class="xbox">${lines.join('')}</div>${eff}${body}<div class="xchs">${btns}</div></div></div>`;
}

export function reportHTML(): string {
  const S = store.S!;
  const r = S.qrep!;
  const fs = r.fs;
  const th = Math.floor(r.q / 4) + 1;
  const kw = (r.q % 4) + 1;
  const notes = r.notes.length
    ? `<h2 style="margin-top:.7rem;--i:12" class="xa">🔔 Kabar penting</h2>${r.notes.map((n, i) => `<div class="xnote xa" style="--i:${13 + i}">${esc(n)}</div>`).join('')}`
    : '';
  const md = S.news.filter((n) => n.q === r.q).slice(0, 3);
  const med = md.length
    ? `<h2 style="margin-top:.7rem;--i:16" class="xa">📰 Pantauan media</h2>${md.map((n, i) => `<div class="xnews xa" style="--i:${17 + i}"><span class="ob" style="background:${OUT[n.o].c}">${OUT[n.o].ic} ${OUT[n.o].n}</span><b>${esc(n.h)}</b></div>`).join('')}`
    : '';
  return `<div class="modal"><div class="card xprop"><span class="tag"><i></i>LAPORAN SETNEG · KEUANGAN T${th} K${kw}</span>
  ${setHead('Pak/Bu Presiden, ini laporan keuangan negara kuartal ' + th + '.' + kw + ' dari Sekretariat Negara.')}
  <h2 style="margin-top:.5rem;--i:1" class="xa">🧾 Neraca kuartal</h2>
  <div class="xbox xa" style="--i:2"><div class="xrow xl2"><span>⬇️ Pemasukan (pajak, bea cukai, PNBP)</span>${cuB(fs.inc, '+', 100)}</div>
  <div class="xrow xl2"><span>⬆️ Belanja wajib (gaji, bunga, subsidi, transfer)</span>${cuB(fs.bel, '−', 250)}</div></div>
  <div class="xbox">${repLines(r)}</div>${notes}${med}
  <button data-action="closeReport">Lanjut →</button></div></div>`;
}

export function fxAlertHTML(): string {
  const S = store.S!;
  const A = S.fxAlert!;
  const sm = S.sm;
  const us = usdState(sm.usd);
  const t = A.t === 'kurs';
  const line = t
    ? `Pak/Bu Presiden, Rupiah ${us[0].toLowerCase()} di ${idr(Math.round(sm.usd))} per USD. Menteri Keuangan meminta arahan.`
    : `Pak/Bu Presiden, IHSG anjlok ${Math.abs(Math.round(sm.ret * 1000) / 10)}% ke ${fmtN(ihsg())}. Menteri Keuangan meminta arahan.`;
  return `<div class="modal"><div class="card xprop"><span class="tag"><i></i>PERINGATAN PASAR</span>
  ${setHead(line)}
  <div class="eic xa" style="--i:2;text-align:center">${t ? '💱' : '📉'}</div>
  ${menkeuAdvice(A.t)}
  <p class="hint xa" style="--i:4">Pilih tindak lanjut ke Menkeu (1 langkah per kuartal):</p>
  <div class="xchs">${fxOptHTML(A.t, false)}<button class="alt" data-action="fxClose">Bahas nanti di tab Bursa</button></div></div></div>`;
}

export function modalHTML(): string {
  const S = store.S!;
  const y = S.modal!.y;
  const sv = Math.round(S.rak * 0.7 + S.stb * 0.15 + S.eko * 0.15);
  const mood = sv >= 70 ? '🎉 Rakyat puas' : sv >= 50 ? '😐 Biasa saja' : '😠 Rakyat gelisah';
  const jr = S.janji
    .map((id, i) => {
      const j = JANJI.find((x) => x.id === id)!;
      return `<div class="pt xa" style="--i:${5 + i};margin:.2rem 0"><span>${j.ic} ${j.n}</span><span>${j.ok(S) ? '✅' : '⏳'}</span></div>`;
    })
    .join('');
  const hl =
    S.news
      .slice(0, 3)
      .map(
        (n, i) =>
          `<div class="xnews xa" style="--i:${9 + i}"><span class="ob" style="background:${OUT[n.o].c}">${OUT[n.o].ic} ${OUT[n.o].n}</span><b>${esc(n.h)}</b></div>`,
      )
      .join('') ||
    S.log
      .slice(-3)
      .reverse()
      .map((x) => `<p>${esc(x)}</p>`)
      .join('');

  return `<div class="modal"><div class="card"><span class="tag"><i></i>LAPORAN AKHIR TAHUN ${y}</span>
  ${setHead('Pak/Bu Presiden, Sekretariat Negara menyampaikan laporan akhir tahun ' + y + '.')}
  <div class="eic xa" style="--i:1">📊</div><h2 class="xa" style="--i:2">Survei Kepuasan Publik: ${sv}%</h2><p class="xa" style="--i:3">${mood}. Ekonomi ${Math.round(S.eko)}, Kas ${kasRp(S.kas)}, Utang ${utgRp(S.utg)}, Integritas ${Math.round(S.ipk)}.</p>
  <p class="xa" style="--i:4">Program berjalan: ${PRG.filter((p) => S.prg[p.id] > 0 && S.prg[p.id] < 100).length} · selesai: ${progDone(S)}/${PRG.length} · Koalisi: ${Math.round((coalSeats(S) / SEATS) * 100)}% kursi DPR · Kunjungan kerja: ${S.stat.trip || 0}</p>
  <h2 style="margin-top:.8rem;--i:5" class="xa">Janji Kampanye</h2>${jr}<h2 style="margin-top:.8rem;--i:8" class="xa">Berita Terakhir</h2>${hl}
  <button data-action="closeModal">Lanjut ke Tahun ${y + 1} →</button></div></div>`;
}

export function alertHTML(): string {
  const S = store.S!;
  const e = curEv();
  const k = e.cat || 'dn';
  const ct = CAT[k];
  const s = setneg();
  const line = {
    dn: 'Pak/Bu Presiden, ada kejadian mendesak!',
    ln: 'Pak/Bu Presiden, ada kabar dari luar negeri!',
    ag: 'Pak/Bu Presiden, hari penting sudah tiba!',
  }[k];
  const mn = S.news.filter((n) => n.q === S.q - 1).length;
  return `<div class="modal xalert"><div class="xbub"><span class="tag" style="background:${ct[1]}"><i></i>${ct[0]}</span>
  <div class="xrep xa" style="--i:0">${mAv(s)}<div class="xsay"><small>📨 Setneg · ${esc(s.nm)}</small><div class="tw" data-t="${esc(line)}">${line}</div><b>"${e[1]}"</b><br><small>Wah, ada kejadian apa nih? 👀${mn ? ' Media sudah memberitakan ' + mn + ' topik kuartal lalu.' : ''}</small></div></div>
  <div class="eic xa" style="text-align:center;--i:3">${e[0]}</div>
  <button class="btn xa" style="--i:4" data-action="ackAlert">Lihat Kejadian →</button></div></div>`;
}

export function overlays(): string {
  const S = store.S;
  let h = '';
  let key = '';
  if (store.GUIDE !== null) {
    h = guideHTML();
    key = 'g' + store.GUIDE;
  } else if (S && S.oath) {
    h = oathHTML();
    key = 'oath';
  } else if (S && S.prof != null) {
    h = profHTML();
    key = 'p' + S.prof;
  } else if (S && S.trip) {
    h = tripHTML();
    key = 't' + S.trip.id;
  } else if (S && S.lawq) {
    h = lawHTML();
    key = 'l' + S.lawq.id + S.lawq.st + (S.lawq.lobi ? 1 : 0);
  } else if (S && S.prop) {
    h = propHTML();
    key =
      'r' +
      S.prop.kind +
      (S.prop.kind === 'resh' ? S.prop.idx : S.prop.id) +
      (S.prop.st || '') +
      (S.prop.neg ? 1 : 0) +
      (S.prop.msg ? 1 : 0);
  } else if (S && S.tripRep) {
    h = tripRepHTML();
    key = 'tr' + S.tripRep.q;
  } else if (S && S.qrep && !S.over && !S.done) {
    h = reportHTML();
    key = 'q' + S.qrep.q;
  } else if (S && S.fxAlert && !S.over && !S.done) {
    h = fxAlertHTML();
    key = 'fx' + S.fxAlert.q + S.fxAlert.t;
  } else if (S && S.modal) {
    h = modalHTML();
    key = 'm' + S.modal.y;
  } else if (S && S.alert && !S.res && !S.over && !S.done) {
    h = alertHTML();
    key = 'a' + S.q;
  }

  if (!h) {
    store.OVK = '';
    return '';
  }
  const fresh = key !== store.OVK;
  store.OVK = key;
  return fresh ? h.replace('class="modal', 'class="modal fresh') : h;
}
