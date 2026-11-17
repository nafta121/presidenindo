import { NAV, STAT, SUBN, SUP } from '../data/constants';
import { LATAR } from '../data/parties';
import { PRG } from '../data/programs';
import { JANJI } from '../data/promises';
import { gaya, summary } from '../engine/stats';
import { gz, load, store } from '../engine/store';
import { $, col, esc, kasRp, utgRp } from '../engine/utils';
import { avatar } from '../rendering/avatar';
import { post } from '../rendering/effects';
import { cardModal } from '../rendering/shareCard';
import type { LatarKey, NavGroupKey, OutfitRole } from '../types/game';
import { hudHTML, tickerHTML } from './hud';
import { renderCheatDrawer } from './cheatDrawer';
import { guideHTML, overlays } from './overlays';
import { PANELS } from './panels';

export function statsGrid(): string {
  const S = store.S!;
  return (
    '<div class="grid">' +
    STAT.map(([k, ic, n]) => {
      const v = Math.round(S[k]);
      const inv = k === 'hrg';
      return `<div class="st"><div class="sh"><span>${ic} ${n}</span><b>${k === 'kas' ? kasRp(S.kas) : v}</b></div><div class="bar"><div style="width:${v}%;background:${col(v, inv)}"></div></div></div>`;
    }).join('') +
    '</div>'
  );
}

export function startHTML(): string {
  const saved = load();
  const hasSave = saved && !saved.done && !saved.over;
  const DL = ['😌 Santai', '⚖️ Normal', '🔥 Susah'];
  const LO: Record<LatarKey, OutfitRole> = {
    jenderal: 'seragam',
    gubernur: 'batik',
    pengusaha: 'jas',
    akademisi: 'safari',
    aktivis: 'warga',
  };

  return `<div class="flag"></div>
 <div class="wrap" style="margin-top:.8rem">
  <div class="side">
   <div class="big">🦅</div>
   <h1 class="center">Presiden RI</h1>
   <p class="center">Simulasi 5 tahun memimpin negeri. Setiap keputusan punya harga.</p>
   ${hasSave ? `<button class="btn" data-action="cont">▶ Lanjutkan masa jabatan (Kuartal ${saved.q + 1}/20)</button>` : ''}
   <button class="btn alt" data-action="openGuide" data-page="0">❓ Cara Main</button>
   <h2 style="margin-top:1rem">Nama Presiden</h2>
   <input type="text" id="nm" maxlength="20" placeholder="Nama kamu" value="${esc(store.nm)}">
   <h2 style="margin-top:.8rem">Jenis Kelamin</h2>
   <div class="df"><button class="${store.gen === 'l' ? 'on' : ''}" data-action="setGen" data-gen="l">👨 Laki-laki (Pak Presiden)</button><button class="${store.gen === 'p' ? 'on' : ''}" data-action="setGen" data-gen="p">👩 Perempuan (Bu Presiden)</button></div>
   <h2 style="margin-top:.8rem">Tingkat Kesulitan</h2>
   <div class="df">${DL.map((l, i) => `<button class="${store.dif === i ? 'on' : ''}" data-action="setDif" data-dif="${i}">${l}</button>`).join('')}</div>
   <div class="xdisc">🎭 <b>Game fiksi.</b> Semua partai, tokoh, menteri, kasus, dan angka di sini rekaan. Gambar tokoh hanya ilustrasi. Kemiripan dengan kenyataan adalah kebetulan, dan game ini bukan opini politik.</div>
  </div>
  <div class="main">
   <h2>Latar Belakang Presiden</h2>
   <div class="jg">${LATAR.map((l) => `<button class="jp ${store.latar === l.k ? 'on' : ''}" data-action="setLatar" data-latar="${l.k}">${avatar(l.n, { role: LO[l.k], bg: '#7a1f2b', cls: 's', fem: false })}<div><b>${l.n}</b><br><small>${l.d}</small></div></button>`).join('')}</div>
   <h2 style="margin-top:1rem">Pilih 3 Janji Kampanye</h2>
   <p class="hint">Dipilih ${store.sel.length}/3. Janji dicek di akhir masa jabatan.</p>
   <div class="jg">${JANJI.map((j) => `<button class="jp ${store.sel.includes(j.id) ? 'on' : ''}" data-action="tog" data-id="${j.id}"><span>${j.ic}</span><div><b>${j.n}</b><br><small>${j.d}</small></div></button>`).join('')}</div>
   <button class="btn" style="margin-top:1rem" ${store.sel.length === 3 ? '' : 'disabled'} data-action="newGame">Lantik Saya 🇮🇩</button>
  </div>
 </div><div class="xcred">${SUP}</div>${store.GUIDE !== null ? guideHTML() : ''}`;
}

export function endHTML(): string {
  const S = store.S!;
  const sm = summary();
  const sup = `<div class="xsup" style="text-align:center">${SUP}</div>`;
  const act = `<button class="btn" data-action="openCard">🖼️ Buat Kartu Hasil (PNG)</button><button class="btn alt" data-action="share">📋 Salin Teks Hasil</button><button class="btn alt" data-action="reset">${S.over ? 'Coba Lagi' : 'Main Lagi'}</button>`;
  const pav = `<div style="display:flex;justify-content:center"><span class="xavtap" data-action="tapPresAvatar">${avatar(S.nama, { role: 'pres', fem: S.gen === 'p', bg: '#8a1c26', cls: 'l' })}</span></div>`;

  if (S.over) {
    const bad = S.log
      .slice(-4)
      .reverse()
      .map((x) => `<p>${esc(x)}</p>`)
      .join('');
    return `<div class="flag"></div>${pav}<div class="big" style="margin:.3rem 0 0">${S.over.i}</div><h1 class="center">${S.over.t}</h1>
  <p class="center">${S.over.d}</p><p class="center"><small>${sm.sub}.</small></p>
  <div class="wrap"><div class="side">${statsGrid()}</div><div class="main"><h2>Berita Terakhir</h2><div class="card">${bad}</div>
  <p class="hint">Tips: lihat tren kas di atas layar, jangan abaikan stat yang merah, dan buka tombol ❓ untuk panduan.</p>${act}</div></div>${sup}${store.CARD ? cardModal() : ''}`;
  }

  const jr = S.janji
    .map((id) => {
      const j = JANJI.find((x) => x.id === id)!;
      const ok = j.ok(S);
      return `<div class="card ${ok ? 'good' : 'bad'}"><div class="pt"><b>${j.ic} ${j.n}</b><span>${ok ? '✅ Ditepati' : '❌ Ingkar'}</span></div></div>`;
    })
    .join('');

  const pm = S.pemilu ? `${S.pemilu.win ? '🎉 Penerusmu MENANG' : '😔 Penerusmu KALAH'} (${S.pemilu.pct}% suara)` : '—';

  return `<div class="flag"></div>${pav}<div class="big" style="margin:.3rem 0 0">${sm.i}</div><h1 class="center">${sm.t}</h1>
 <p class="center">Masa jabatan 5 tahun selesai. ${sm.sub.replace(/(\d+)\/100/, '<em>$1/100</em>')}</p>
 <div class="wrap"><div class="side">${statsGrid()}</div><div class="main">
 <div class="card"><b>🗳️ Pemilu Serentak</b><p>${pm}</p><small>Pilkada I: ${S.rep.pil1 || '—'} · Pilkada II: ${S.rep.pil2 || '—'} · Integritas ${Math.round(S.ipk)} · Program selesai ${sm.pd}/${PRG.length}<br>Kas akhir ${kasRp(S.kas)} · Utang ${utgRp(S.utg)} · Gaya kepemimpinan: ${gaya()[1]} ${gaya()[0]}</small></div>
 <h2>Janji Kampanye (${sm.ok}/3)</h2>${jr}${act}</div></div>${sup}${store.CARD ? cardModal() : ''}`;
}

export function gameHTML(): string {
  const S = store.S!;
  const tab = store.tab;
  const panel = PANELS[tab]();
  const pc = S.cases.filter((c) => c.pend).length;
  const grp = NAV.find((n) => n[3].includes(tab))!;
  const badge: Partial<Record<NavGroupKey, boolean | number>> = { ev: !S.res, kas: pc };
  const seg =
    grp[3].length > 1
      ? `<div class="xseg">${grp[3].map((t) => `<button class="${tab === t ? 'on' : ''}" data-action="goSub" data-tab="${t}">${SUBN[t]}</button>`).join('')}</div>`
      : '';

  return `<div class="flag"></div>
 ${tickerHTML()}
 <div class="wrap">
  <div class="side">${hudHTML()}</div>
  <div class="main">
   ${seg}
   <div class="panel" id="panel-${tab}-${S.q}-${S.res ? 1 : 0}">${panel}</div>
  </div>
 </div>
 <div class="xcred">${SUP}</div>
 ${S.res ? `<div class="foot"><button class="btn" data-action="advance">${S.q === 19 ? 'Akhiri Masa Jabatan 🇮🇩' : 'Tutup Kuartal →'}</button></div>` : ''}
 <nav class="xnav">${NAV.map((n) => `<button class="${n === grp ? 'on' : ''}" data-action="go" data-nav="${n[0]}"><span>${n[1]}</span>${n[2]}${badge[n[0]] ? '<u></u>' : ''}</button>`).join('')}</nav>
 ${overlays()}`;
}

export function renderApp(): void {
  const appEl = $('app');
  if (!appEl) return;
  const S = store.S;
  appEl.innerHTML = gz(!S ? startHTML() : S.over || S.done ? endHTML() : gameHTML());
  post();
  renderCheatDrawer();
}
