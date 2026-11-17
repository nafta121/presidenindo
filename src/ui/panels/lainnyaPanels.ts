import { AGN, AGN_T, KAS_T, SEAS } from '../../data/constants';
import { JANJI } from '../../data/promises';
import { ISS, KJN, OUT, PV, REGN } from '../../data/provincesAndTrips';
import { setneg } from '../../engine/cabinet';
import { newsMood, provTrip, tripChance, tripCost, tripOk } from '../../engine/mediaAndTrips';
import { pvAvg, pvCol, pvIssues, pvOf } from '../../engine/politicsV35';
import { store } from '../../engine/store';
import { esc, fmtN, rp, thk } from '../../engine/utils';
import { mAv } from '../../rendering/avatar';
import { barH } from '../../rendering/charts';
import type { NewsItem } from '../../types/game';
import { chips } from '../hud';

export function pvDetail(id: string): string {
  const S = store.S!;
  const p = pvOf(id)!;
  const v = S.pv[id];
  const is = v.iss ? ISS.find((x) => x.id === v.iss!.id) : null;
  const news =
    S.news
      .filter((n) => n.pv === id)
      .slice(0, 4)
      .map(
        (n) =>
          `<div class="xnews"><span class="ob" style="background:${OUT[n.o].c}">${OUT[n.o].ic} ${OUT[n.o].n}</span><b>${esc(n.h)}</b><small>${thk(n.q)}</small></div>`,
      )
      .join('') || '<small>Belum ada berita khusus.</small>';
  const left = 3 - S.pvAct;
  const acts = is
    ? `<div class="xact"><button class="ch" ${left <= 0 ? 'disabled' : ''} data-action="pvHelp" data-id="${id}">🚑 Kirim bantuan pusat (${rp(is.c * KAS_T)})</button>
 <button class="ch" ${left <= 0 ? 'disabled' : ''} data-action="pvMin" data-id="${id}">📋 Tugaskan menteri teknis (gratis, peluang berhasil)</button>
 <button class="ch" ${S.usedTrip ? 'disabled' : ''} data-action="pvVisit" data-id="${id}">✈️ Kunjungi langsung (kunjungan kerja)</button></div>`
    : `<div class="xact"><button class="ch" ${S.usedTrip ? 'disabled' : ''} data-action="pvVisit" data-id="${id}">✈️ Kunjungan kerja ke ${p.ibu}</button></div>`;
  return `<div class="card${is ? ' bad' : ''}"><div class="pt"><b>${p.ic} ${p.n}</b><span>${Math.round(v.puas)}%</span></div>${barH(v.puas)}
 <small>Ibu kota ${p.ibu} · ${REGN[p.r]} · ±${p.pop} juta jiwa · Khas: ${p.kh.join(', ')} · Dikunjungi ${v.vis || 0}×</small>
 ${is ? `<div class="xmk no" style="margin-top:.5rem"><b>${is.ic} ${is.t}</b> — ${is.d} <small>(sejak ${thk(v.iss!.q0)})</small></div>` : '<small class="xlt">✅ Tidak ada masalah besar saat ini.</small>'}
 ${acts}<h3 class="xqh">Berita ${p.n}</h3>${news}</div>`;
}

export function petPanel(): string {
  const S = store.S!;
  const PSEL = store.PSEL;
  const set = setneg();
  const iss = pvIssues();
  const av = Math.round(pvAvg());
  const cells = PV.map((p) => {
    const v = S.pv[p.id];
    const on = PSEL === p.id;
    return `<button class="xpv${on ? ' on' : ''}${v.iss ? ' hasi' : ''}" style="grid-column:${p.c + 1};grid-row:${p.rw + 1};background:${pvCol(v.puas)}" data-action="selectPv" data-id="${p.id}" aria-label="${p.n}">${p.ab}${v.iss ? '<i>!</i>' : ''}</button>`;
  }).join('');

  const legend = (
    [
      ['≥70', '#2e9d68'],
      ['55', '#86bb5f'],
      ['40', '#e3b341'],
      ['25', '#e08a3c'],
      ['<25', '#c23b3b'],
    ] as const
  )
    .map((a) => `<span><i style="background:${a[1]}"></i>${a[0]}</span>`)
    .join('');

  const sel = PSEL
    ? pvDetail(PSEL)
    : `<p class="hint">Ketuk provinsi di peta untuk lihat berita, masalah, dan tindakan. Warna = tingkat kepuasan warga.</p>`;

  const list = iss
    .sort((a, b) => S.pv[a.id].puas - S.pv[b.id].puas)
    .map((p) => {
      const is = ISS.find((x) => x.id === S.pv[p.id].iss!.id)!;
      return `<button class="xpvrow" data-action="selectPvTop" data-id="${p.id}"><span>${is.ic} <b>${p.n}</b> — ${is.t}</span><small>kepuasan ${Math.round(S.pv[p.id].puas)}%</small></button>`;
    })
    .join('');

  return `<div class="xadv">${mAv(set, 's')}<div class="xsay"><small>📨 Setneg · ${esc(set.nm)}</small><div>Laporan 38 provinsi, Pak/Bu Presiden. Rata-rata kepuasan <b>${av}%</b>, ada <b>${iss.length}</b> masalah aktif. Kuota tindakan kuartal ini: ${3 - S.pvAct}/3.</div></div></div>
 <div class="xmap">${cells}</div><div class="xleg2">${legend}</div>${sel}
 <h3 class="xqh">Masalah aktif di daerah</h3>${list || '<p class="hint">Tidak ada masalah besar. Bagus!</p>'}
 <p class="hint">Nama provinsi nyata, tetapi semua kejadian, berita, dan angka di game ini fiktif. Peta berbentuk kartogram ringkas, bukan peta geografis.</p>`;
}

export function medPanel(): string {
  const S = store.S!;
  const set = setneg();
  const mood = newsMood();
  const mt: [string, string] =
    mood >= 3 ? ['😊 Cenderung positif', 'up'] : mood <= -3 ? ['😠 Cenderung negatif', 'dn'] : ['😐 Campur aduk', 'gd'];
  const groups: Record<number, NewsItem[]> = {};
  S.news.forEach((n) => {
    (groups[n.q] = groups[n.q] || []).push(n);
  });
  const qs = Object.keys(groups)
    .map(Number)
    .sort((a, b) => b - a);
  const legend = Object.values(OUT)
    .map((o) => `<span class="ob" style="background:${o.c}" title="${o.t}">${o.ic} ${o.n}</span>`)
    .join('');

  return `<div class="xadv">${mAv(set, 's')}<div class="xsay"><small>📨 Setneg · ${esc(set.nm)}</small><div>Ini rangkuman media yang kami pantau, Pak/Bu Presiden. Nada pemberitaan terakhir: <b class="${mt[1]}">${mt[0]}</b>.</div></div></div>
 <div class="xleg">${legend}</div>
 ${
   qs.length
     ? qs
         .map(
           (q) =>
             `<h3 class="xqh">${thk(q)}</h3>` +
             groups[q]
               .map(
                 (n, i) =>
                   `<div class="card xnews2 xpa" style="--i:${Math.min(i, 8)}"><span class="ob" style="background:${OUT[n.o].c}">${OUT[n.o].ic} ${OUT[n.o].n}</span><b>${esc(n.h)}</b>${n.s ? `<p>${esc(n.s)}</p>` : ''}</div>`,
               )
               .join(''),
         )
         .join('')
     : '<div class="card"><p>Belum ada berita. Tutup kuartal untuk melihat pemberitaan.</p></div>'
 }`;
}

export function kerPanel(): string {
  const S = store.S!;
  const KFILT = store.KFILT;
  const set = setneg();
  const list = KFILT === 'pv' ? PV.map((p) => provTrip(p.id)) : KJN.filter((t) => t.kind === KFILT);
  const seg = `<div class="xseg"><button class="${KFILT === 'dn' ? 'on' : ''}" data-action="setKfilt" data-kfilt="dn">🇮🇩 Dalam negeri</button><button class="${KFILT === 'ln' ? 'on' : ''}" data-action="setKfilt" data-kfilt="ln">🌍 Luar negeri</button><button class="${KFILT === 'pv' ? 'on' : ''}" data-action="setKfilt" data-kfilt="pv">📍 38 Provinsi</button></div>`;
  return (
    `<div class="xadv">${mAv(set, 's')}<div class="xsay"><small>📨 Setneg · ${esc(set.nm)}</small><div>${S.usedTrip ? 'Kunjungan kuartal ini sudah dijadwalkan. Agenda berikutnya kuartal depan.' : 'Berikut draf agenda kunjungan kerja. Maksimal 1 kunjungan per kuartal.'}</div></div></div>${seg}<div class="pg">` +
    list
      .map((t, i) => {
        const ok = tripOk(t);
        const c = tripCost(t);
        const ch = tripChance(t);
        return `<div class="card xpa" style="--i:${Math.min(i, 8)}"><div class="pc"><div class="ic">${t.ic}</div><div class="bd"><b>${t.n}</b><p>${t.reg} · ${t.days} hari</p>
  <div class="xmoney out">💰 Estimasi biaya <b>${rp(c / 1000)}</b></div>
  <div>${chips(t.f)}</div>${t.inv ? `<small class="xlt">💼 Potensi komitmen investasi ±Rp ${fmtN(t.inv)} T</small>` : ''}
  <small class="xlt">🎯 Peluang berhasil: ${ch >= 0.7 ? 'Tinggi' : ch >= 0.5 ? 'Sedang' : 'Rendah'}</small>${ok[0] ? '' : `<small class="xmk no">${ok[1]}</small>`}</div></div>
  <button ${ok[0] ? '' : 'disabled'} data-action="openTrip" data-id="${t.id}">Lihat agenda & jadwalkan</button></div>`;
      })
      .join('') +
    '</div>'
  );
}

export function agnPanel(): string {
  const S = store.S!;
  const sp = Object.keys(AGN)
    .map(Number)
    .sort((a, b) => a - b);
  const nx = sp.find((q) => q >= S.q);
  let rows = '';
  for (let y = 0; y < 5; y++) {
    rows +=
      `<div class="card"><b>Tahun ${y + 1}</b>` +
      [0, 1, 2, 3]
        .map((k) => {
          const q = y * 4 + k;
          const s = SEAS[k];
          const a = AGN[q];
          const st = q < S.q ? 'past' : q === S.q ? 'now' : '';
          let extra = '';
          if (a) {
            const r = S.rep[a];
            extra = `<div class="xagn">🗳️ ${AGN_T[a]}${q < S.q || (q === S.q && S.res) ? (a === 'pemilu' && S.pemilu ? ` — ${S.pemilu.pct}% suara, ${S.pemilu.win ? 'MENANG' : 'KALAH'}` : r ? ` — menang ${r}` : '') : ''}</div>`;
          }
          return `<div class="xtl ${st}"><span>K${k + 1}</span><div><span>${s.ic} ${s.n} <small>· ${s.m}</small></span>${extra}</div>${q === S.q ? '<em class="xnow">sekarang</em>' : ''}</div>`;
        })
        .join('') +
      '</div>';
  }
  const cd =
    nx !== undefined
      ? `<div class="card good"><b>🗳️ Berikutnya: ${AGN_T[AGN[nx]]}</b><p>${nx === S.q ? 'Digelar kuartal ini!' : 'Tinggal ' + (nx - S.q) + ' kuartal lagi (T' + (Math.floor(nx / 4) + 1) + ' K' + ((nx % 4) + 1) + ').'}</p></div>`
      : '';
  return cd + `<div class="pg">${rows}</div>`;
}

export function janjiPanel(): string {
  const S = store.S!;
  return (
    '<p class="hint">Dicek di akhir masa jabatan (kuartal ke-20). Janji ditepati menambah skor akhirmu.</p><div class="pg">' +
    S.janji
      .map((id) => {
        const j = JANJI.find((x) => x.id === id)!;
        const ok = j.ok(S);
        return `<div class="card ${ok ? 'good' : ''}"><div class="pt"><b>${j.ic} ${j.n}</b><span>${ok ? '✅' : '⏳'}</span></div><p>${j.d}</p><small>${j.p(S)}</small></div>`;
      })
      .join('') +
    '</div>'
  );
}
