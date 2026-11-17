import { KAS_T, SEATS } from '../../data/constants';
import { PARTIES, ROLES } from '../../data/parties';
import { LAWS } from '../../data/politics';
import { coalSeats } from '../../data/promises';
import { setneg, trek } from '../../engine/cabinet';
import { APR_ACT, lawLabel, lawOk } from '../../engine/politicsV35';
import { store } from '../../engine/store';
import { col, esc, rp, thk } from '../../engine/utils';
import { aprAv, avatar, mAv } from '../../rendering/avatar';
import { barH } from '../../rendering/charts';

export function kabPanel(): string {
  const S = store.S!;
  const men = S.men
    .map((m, i) => {
      const r = ROLES[i];
      const pt = m.p >= 0 ? `${PARTIES[m.p].ic} ${PARTIES[m.p].a}` : '🎓 Profesional';
      const dots = Array.from({ length: 5 }, (_, k) => `<i class="${k < m.i ? 'on' : ''}"></i>`).join('');
      return `<div class="card${m.sus ? ' bad' : ''}"><div class="xper xclk" data-action="openProf" data-idx="${i}">${mAv(m)}<div class="xpi"><div class="pt"><b>${r.ic} ${r.j}</b></div><span class="stars">${'★'.repeat(m.c) + '☆'.repeat(5 - m.c)}</span>
  <p style="margin:.2rem 0"><em>${esc(m.nm)}</em><br><small>${pt} · memengaruhi ${r.e}</small></p></div></div>
  <div class="xint"><small>🧼 Integritas</small><span class="xd">${dots}</span></div>
  <small>${m.sus ? '⚠️ Namanya disebut dalam kasus korupsi!' : trek(m.i)}</small>
  <div class="xbtns"><button class="alt" data-action="openProf" data-idx="${i}">👤 Lihat profil</button>
  <button ${S.usedResh ? 'disabled' : ''} data-action="openResh" data-idx="${i}">${S.usedResh ? 'Reshuffle terpakai' : '🔄 Ganti'}</button></div></div>`;
    })
    .join('');
  return `<p class="hint">Ketuk menteri untuk melihat profil dan masa jabatan. ★ = kompetensi, 🧼 = integritas. Reshuffle: hanya 1 menteri per kuartal, pengganti dipilih dari 3 kandidat.</p><div class="pg">${men}</div>`;
}

export function seatBar(): string {
  const S = store.S!;
  const segs = S.par
    .map(
      (p, i) =>
        `<div class="xsg${p.k ? '' : ' op'}" style="width:${(PARTIES[i].seat / SEATS) * 100}%;background:${PARTIES[i].c}" title="${PARTIES[i].a}">${PARTIES[i].a}</div>`,
    )
    .join('');
  const cs = coalSeats(S);
  return `<div class="xseat">${segs}<u></u></div><div class="xrow"><small>Koalisi: <b>${cs}</b> kursi (${Math.round((cs / SEATS) * 100)}%) · terang = koalisi, pudar = oposisi</small><small>Mayoritas: 291</small></div>`;
}

export function parPanel(): string {
  const S = store.S!;
  const cards = S.par
    .map((p, i) => {
      const P = PARTIES[i];
      const mn = S.men.filter((m) => m.p === i).length;
      let btn = '';
      if (p.k) {
        btn = `<button ${S.usedDip ? 'disabled' : ''} data-action="lobi" data-idx="${i}">🤝 Lobi ketua umum (+12 puas, −3 Kas)</button>`;
      } else {
        btn = `<button ${S.usedDip || p.s < 50 ? 'disabled' : ''} data-action="joinPar" data-idx="${i}">${p.s < 50 ? 'Belum mau bergabung (perlu kedekatan ≥ 50)' : '➕ Ajak bergabung koalisi'}</button>`;
      }
      return `<div class="card" style="border-left:4px solid ${P.c}"><div class="xper">${avatar(P.ketum, { bg: P.c })}<div class="xpi"><div class="pt"><b>${P.ic} ${P.a}</b><span class="chip ${p.k ? 'good' : 'bad'}" style="margin:0">${p.k ? 'Koalisi' : 'Oposisi'}</span></div>
  <p style="margin:.2rem 0"><em>${P.n}</em><br><small>${P.ide} · ${P.seat} kursi · ${mn} menteri<br>Ketum: ${P.ketum}</small></p></div></div>
  <div class="xrow"><small>${p.k ? 'Kepuasan' : 'Kedekatan dengan pemerintah'}</small><b>${Math.round(p.s)}</b></div>
  <div class="bar"><div style="width:${p.s}%;background:${col(p.s)}"></div></div>${btn}</div>`;
    })
    .join('');
  return `${seatBar()}
 <details class="xdet"><summary>❓ Apa itu lobi dan koalisi?</summary><p><b>Koalisi</b> = partai-partai pendukung pemerintahmu di DPR. Makin banyak kursi dan makin puas mereka, makin kuat <b>Dukungan DPR</b>-mu.</p>
 <p><b>Kepuasan</b> turun tiap kuartal. Kalau ≤ 22, partai bisa <b>hengkang</b> dan kursimu hilang.</p>
 <p><b>Lobi</b> = ngopi bareng ketua umum dan bagi proyek: kepuasan +12, Kas −3. Partai juga senang kalau kader mereka jadi menteri.</p>
 <p><b>Ajak gabung</b> = oposisi yang cukup dekat (≥ 50) diajak masuk koalisi, kursimu nambah. 1 aksi partai per kuartal.</p></details>
 <p class="hint">${S.usedDip ? 'Aksi partai kuartal ini sudah dipakai.' : 'Kamu punya 1 aksi partai kuartal ini: lobi atau ajak gabung.'}</p><div class="pg">${cards}</div>`;
}

export function hkmPanel(): string {
  const S = store.S!;
  const set = setneg();
  const co = PARTIES.reduce((a, P, i) => a + (S.par[i].k ? P.seat : 0), 0);
  const hd = `<div class="xadv">${mAv(set, 's')}<div class="xsay"><small>📨 Setneg · ${esc(set.nm)}</small><div>Koalisi menguasai <b>${co}</b> dari ${SEATS} kursi DPR (butuh ${Math.floor(SEATS / 2) + 1}). ${S.usedLaw ? 'Usulan UU kuartal ini sudah diajukan.' : 'Kamu bisa mengajukan 1 revisi UU per kuartal.'}${S.perppu ? ' <b>Perppu menunggu pengesahan DPR.</b>' : ''}</div></div></div>`;
  const list = LAWS.map((L) => {
    const ok = lawOk(L.id);
    const lw = S.law[L.id];
    const ch = lw.v !== 'asli';
    return `<div class="card${ch ? ' good' : ''}"><div class="pt"><b>${L.ic} ${L.n}</b><small>${L.no}</small></div><p>${L.d}</p>
  <small class="xlt">Versi berlaku: <b>${lawLabel(L.id)}</b></small>
  <button ${ok[0] ? '' : 'disabled'} data-action="openLaw" data-id="${L.id}">${ok[0] ? 'Ajukan revisi ke DPR' : ok[1]}</button></div>`;
  }).join('');
  const vt = S.votes
    .map((v) => {
      const L = LAWS.find((x) => x.id === v.law)!;
      return `<div class="pt"><span>${v.pass ? '✅' : '❌'} ${L.n}</span><small>${v.yes}/${SEATS} · ${thk(v.q)}</small></div>`;
    })
    .join('');
  return (
    hd +
    (vt ? `<div class="card"><b>Riwayat voting paripurna</b>${vt}</div>` : '') +
    '<div class="pg">' +
    list +
    '</div><p class="hint">Semua UU, nomor, dan isi di game ini fiktif.</p>'
  );
}

export function mhkPanel(): string {
  const S = store.S!;
  const judges = S.mkj
    .map(
      (j) =>
        `<div class="xper">${avatar(j.nm, { role: 'jas', bg: '#4a3a2a', cls: 's' })}<div class="xpi"><b>${esc(j.nm)}</b><br><small>${j.lat} · ${j.ln}</small></div></div>`,
    )
    .join('');
  const gg = S.gug
    .slice()
    .reverse()
    .map((g) => {
      const L = LAWS.find((x) => x.id === g.law)!;
      const o = L.opts.find((x) => x.id === g.opt)!;
      const st =
        g.st === 'sidang'
          ? '⏳ Dalam sidang'
          : g.st === 'dikabulkan'
            ? '❌ Dikabulkan (UU batal)'
            : '✅ Ditolak (UU tetap)';
      return `<div class="card${g.st === 'sidang' ? ' bad' : ''}"><div class="pt"><b>${L.ic} Uji materi ${L.n}</b><small>${st}</small></div><small>Objek: ${o.n} · diajukan ${thk(g.q0)}</small>
  ${g.st === 'sidang' ? `<button ${g.lobi ? 'disabled' : ''} data-action="mkLobi" data-id="${g.id}">🕵️ Lobi hakim diam-diam (${rp(2 * KAS_T)}, berisiko)${g.lobi ? ' ✓' : ''}</button><small class="xlt">Putusan keluar kuartal depan.</small>` : ''}</div>`;
    })
    .join('');
  const ks = S.cases
    .filter((c) => c.kas)
    .slice()
    .reverse()
    .map((c) => {
      const st = {
        proses: '⏳ Kasasi diperiksa',
        ditolak: 'Kasasi ditolak, vonis tetap',
        dikurangi: 'Hukuman dikurangi',
        diperberat: 'Hukuman diperberat',
      }[c.kas!.st];
      return `<div class="pt"><span>${esc(String(c.who).split(',')[0])} · ${c.yrs || '?'} th</span><small>${st}</small></div>`;
    })
    .join('');
  return `<div class="card"><div class="pt"><b>🏛️ Independensi MK</b><b>${Math.round(S.mkind)}</b></div>${barH(S.mkind)}<small>Makin rendah, makin mudah dipengaruhi, tetapi publik curiga bila terbongkar. 9 hakim konstitusi (fiktif).</small></div>
 <h3 class="xqh">Gugatan UU</h3>${gg || '<p class="hint">Belum ada gugatan. Revisi UU yang kontroversial bisa digugat ke MK.</p>'}
 <h3 class="xqh">Mahkamah Agung · kasasi korupsi</h3><div class="card">${ks || '<small>Belum ada perkara kasasi.</small>'}<small class="xlt">MA bisa menolak, mengurangi, atau memperberat vonis.</small></div>
 <h3 class="xqh">Hakim Konstitusi</h3><div class="card">${judges}</div>`;
}

export function aprPanel(): string {
  const S = store.S!;
  const left = 2 - S.ap.act;
  const card = (w: 'tni' | 'pol', ttl: string, ic: string): string => {
    const A = S.ap[w];
    const acts = APR_ACT[w]
      .map(
        (a) =>
          `<button class="ch" ${left <= 0 ? 'disabled' : ''} data-action="aprDo" data-branch="${w}" data-id="${a.id}">${a.ic} ${a.t}<br><small>${a.d}</small></button>`,
      )
      .join('');
    return `<div class="card"><div class="xper">${aprAv(A.nm, w === 'tni' ? '#3a4a2a' : '#2a3550')}<div class="xpi"><b>${ic} ${ttl}</b><br><small>${esc(A.nm)}</small></div></div>
  <div class="pt"><span>Loyalitas</span><b>${Math.round(A.loy)}</b></div>${barH(A.loy)}<div class="pt"><span>Profesionalisme</span><b>${Math.round(A.prof)}</b></div>${barH(A.prof)}
  <div class="xact">${acts}</div></div>`;
  };
  return (
    `<p class="hint">Kuota tindakan aparat kuartal ini: ${left}/2. Loyalitas turun pelan tiap kuartal bila diabaikan. Loyalitas rendah memicu gejolak, profesionalisme rendah memicu kasus oknum.</p>` +
    card('tni', 'Panglima TNI', '🪖') +
    card('pol', 'Kapolri', '👮')
  );
}
