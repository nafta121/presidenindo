import { PARTIES } from '../../data/parties';
import { AGN_NAMES, STAGE } from '../../data/politics';
import { amtFmt, caseDetail } from '../../engine/corruption';
import { store } from '../../engine/store';
import { esc, thk } from '../../engine/utils';
import { avatar } from '../../rendering/avatar';
import { barH } from '../../rendering/charts';

export function kasPanel(): string {
  const S = store.S!;
  const ipk = Math.round(S.ipk);
  const lbl = ipk >= 65 ? 'Bersih' : ipk >= 45 ? 'Sedang' : ipk >= 30 ? 'Rawan' : 'Darurat korupsi';
  const head = `<div class="card"><div class="pt"><b>🧼 Indeks Integritas Pemerintah</b><b>${ipk}</b></div>${barH(ipk)}<small>${lbl} · Dukung proses hukum menaikkan, melindungi tersangka menurunkan.</small>
 <div class="pt" style="margin-top:.4rem"><b>⚖️ Kekuatan KPK</b><b>${Math.round(S.kpk)}</b></div>${barH(S.kpk)}<small>Diatur lewat UU KPK. Makin kuat, makin banyak kasus ditangani KPK dan aset disita.</small></div>`;

  const list = [...S.cases]
    .reverse()
    .map((c) => {
      if (!c.ag) caseDetail(c);
      const steps = STAGE.map(
        (s, i) => `<span class="${i <= c.stage ? 'on' : ''}${i === c.stage && !c.done ? ' cur' : ''}">${s}</span>`,
      ).join('');
      let act = '';
      if (c.pend) {
        const m = c.mi != null;
        act = `<div class="xact"><button class="ch" data-action="decideCase" data-id="${c.id}" data-dec="dukung">⚖️ ${m ? 'Copot menteri & dukung proses hukum' : 'Dukung penuh proses hukum'}</button>
   <button class="ch" data-action="decideCase" data-id="${c.id}" data-dec="diam">🤐 Tidak berkomentar</button>
   <button class="ch" data-action="decideCase" data-id="${c.id}" data-dec="lindungi">🛡️ ${m ? 'Pertahankan menteri' : 'Lindungi lewat lobi politik'} (berisiko)</button></div>`;
      }
      const P = c.pi >= 0 ? `${PARTIES[c.pi].ic} ${PARTIES[c.pi].a}` : '🎓 Profesional';
      const nmn = String(c.who).split(',')[0];
      const flow = (c.flow || []).map((f) => `<span class="xfl">${esc(f)}</span>`).join('<b class="xar">→</b>');
      const tl = (c.tl || []).map((t) => `<div class="xtlc"><small>${thk(t.q)}</small><div>${esc(t.t)}</div></div>`).join('');
      const kas = c.kas
        ? `<p><b>Kasasi MA:</b> ${{ proses: 'sedang diperiksa', ditolak: 'ditolak', dikurangi: 'hukuman dikurangi', diperberat: 'hukuman diperberat' }[c.kas.st]}</p>`
        : '';
      return `<div class="card${c.pend ? ' bad' : ''}"><span class="tag" style="background:${c.done ? '#4a2a30' : '#e03a3e'}">${c.done ? 'PUTUSAN' : c.pend ? 'BUTUH SIKAPMU' : 'KASUS KORUPSI'}</span> <span class="tag" style="background:#2f5d8a">${c.ag}</span>
  <div class="xper" style="margin-top:.5rem">${avatar(nmn, { role: c.stage >= 1 ? 'rompi' : undefined, bg: c.stage >= 1 ? '#6b3a10' : undefined })}<div class="xpi"><h2 style="margin:0">${c.t}</h2><p style="margin:.2rem 0"><em>${esc(c.who)}</em><br><small>${P} · Kerugian negara ${amtFmt(c.amt)}${c.dec ? ' · Sikapmu: ' + { dukung: 'mendukung', diam: 'diam', lindungi: 'melindungi' }[c.dec] : ''}</small></p></div></div>
  <div class="xstep">${steps}</div>${c.done ? `<p style="color:var(--txt)">${c.res}</p>` : ''}${act}
  <details class="xdt"><summary>🔎 Lihat detail kasus</summary>
   <p><b>Modus:</b> ${c.mod}<br><b>Penyidik:</b> ${AGN_NAMES[c.ag!]}<br><b>Jerat hukum:</b> ${c.pasal}</p>
   <p><b>Aliran dana:</b></p><div class="xflow">${flow}</div>
   <p><b>Barang bukti:</b> ${(c.bb || []).join(', ')}</p>
   ${c.tut ? `<p><b>Persidangan:</b> ${c.sak} saksi, tuntutan ${c.tut} tahun${c.yrs ? ', vonis ' + c.yrs + ' tahun' : ''}</p>` : ''}${kas}
   <h3 class="xqh">Kronologi</h3>${tl}</details></div>`;
    })
    .join('');

  return (
    head +
    (list || '<p class="hint">Belum ada kasus. Pantau terus berita.</p>') +
    '<p class="hint">Semua kasus, tokoh, dan lembaga di game ini fiktif. Gambar tokoh adalah ilustrasi, bukan orang sungguhan.</p>'
  );
}
