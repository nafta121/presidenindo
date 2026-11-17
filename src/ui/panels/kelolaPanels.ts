import { KAS_T, LBL, UTG_T } from '../../data/constants';
import { ROLES } from '../../data/parties';
import { NEED_T, POL, POL_ROLE } from '../../data/policies';
import { MS, MSV, PRG } from '../../data/programs';
import { fiscalDetail, menkeuView, needsMenkeu, polCost } from '../../engine/fiscal';
import { ensure36 } from '../../engine/migrations';
import { prgBenefit, prgTotal, rbText, risk } from '../../engine/policiesAndPrograms';
import { roleIdx, techMult } from '../../engine/stats';
import { store } from '../../engine/store';
import { esc, kasRp, rp, utgRp } from '../../engine/utils';
import type { QuarterReport, RoleKey } from '../../types/game';
import { chips, cuB } from '../hud';

export function roleLine(role?: RoleKey): string {
  if (!role || !store.S) return '';
  const i = roleIdx(role);
  const m = store.S.men[i];
  return `<small class="xlt">${ROLES[i].ic} Menteri teknis: ${esc(m.nm)} · ${'★'.repeat(m.c)}${role === 'keu' ? '' : ' · efek ' + (techMult(m.c) >= 1 ? '+' : '') + Math.round((techMult(m.c) - 1) * 100) + '%'}</small>`;
}

export function menkeuHint(cost: number, debt: number): string {
  if (!needsMenkeu(cost, debt)) return '';
  const v = menkeuView(cost, debt);
  return v.ok
    ? `<small class="xmk ok">🧾 Menkeu: kemungkinan <b>setuju</b> (kas sisa ${kasRp(v.after)}, cadangan aman ${kasRp(v.reserve)})</small>`
    : `<small class="xmk no">🧾 Menkeu: kemungkinan <b>keberatan</b> (kas sisa ${kasRp(v.after)} &lt; cadangan aman ${kasRp(v.reserve)})</small>`;
}

export function polPanel(): string {
  const S = store.S!;
  return (
    `<p class="hint">${S.usedPol ? 'Slot kebijakan kuartal ini sudah dipakai.' : '1 kebijakan per kuartal. Biaya kecil langsung ditetapkan. Biaya besar (mulai ' + rp(NEED_T * KAS_T) + ') atau yang menambah utang harus lewat menteri teknis dan Menkeu.'}</p><div class="pg">` +
    POL.map((p) => {
      const wait = p.cd - (S.q - (S.last[p.id] === undefined ? -99 : S.last[p.id]));
      const cost = polCost(p);
      const short = S.kas - cost <= 0;
      const utgVal = p.f.utg || 0;
      const debt = utgVal > 0 ? utgVal : 0;
      const nd = needsMenkeu(cost, debt);
      const dis = S.usedPol || wait > 0 || short;
      const note =
        wait > 0 ? `Siap ${wait} kuartal lagi` : short ? 'Kas tidak cukup' : nd ? 'Lihat rincian & ajukan' : '✅ Tetapkan';
      const kasVal = p.f.kas || 0;
      const money =
        cost > 0
          ? `<div class="xmoney out">💰 Anggaran <b>${rp(cost * KAS_T)}</b></div>`
          : kasVal > 0
            ? `<div class="xmoney in">💵 Penerimaan <b>+${rp(kasVal * KAS_T)}</b></div>`
            : '';
      const dbt =
        utgVal !== 0
          ? `<div class="xmoney ${utgVal > 0 ? 'out' : 'in'}">📜 Utang ${utgVal > 0 ? 'bertambah' : 'berkurang'} <b>${rp(Math.abs(utgVal) * UTG_T)}</b></div>`
          : '';
      const lt = rbText(p);
      const apv = nd
        ? `<small class="xlt">🧾 Perlu persetujuan: ${POL_ROLE[p.id] ? ROLES[roleIdx(POL_ROLE[p.id])].j + ' + ' : ''}Menkeu</small>`
        : `<small class="xlt">✔️ Di bawah ambang ${rp(NEED_T * KAS_T)}: tidak perlu persetujuan Menkeu</small>`;
      return `<div class="card"><div class="pc"><div class="ic">${p.ic}</div><div class="bd"><b>${p.n}</b><p>${p.d}</p>${money}${dbt}<div>${chips(p.f)}</div>${lt ? `<small class="xlt">📈 Jangka panjang: ${lt}</small>` : ''}${roleLine(POL_ROLE[p.id])}${apv}${nd ? menkeuHint(cost, debt) : ''}</div></div><button ${dis ? 'disabled' : ''} data-action="openProp" data-kind="pol" data-id="${p.id}">${note}</button></div>`;
    }).join('') +
    '</div>'
  );
}

export function prgPanel(): string {
  const S = store.S!;
  return (
    `<div class="xrow"><p class="hint" style="margin:0">Proyek jangka panjang. Tiap pendanaan menaikkan progres. Pendanaan besar (mulai ${rp(NEED_T * KAS_T)}) harus melewati menteri teknis dan Menkeu.</p><span class="pill">Slot ${S.slots}/2</span></div><div class="pg">` +
    PRG.map((p) => {
      const v = Math.round(S.prg[p.id]);
      const mi = roleIdx(p.role);
      const m = S.men[mi];
      const done = v >= 100;
      const dis = done || S.slots <= 0 || S.kas - p.cost <= 0;
      const rk = risk(m);
      const nd = needsMenkeu(p.cost, 0);
      const ticks = MS.slice(0, 3)
        .map((x) => `<i style="left:${x}%"></i>`)
        .join('');
      const tot = prgTotal(p);
      const sisa = (tot * (100 - v)) / 100;
      const ms = MS.map((x) => `${x}% → +${MSV[x]} ${LBL[p.mk]}${x === 100 ? ' (+2 Rakyat)' : ''}`).join(' · ');
      return `<div class="card${done ? ' good' : ''}"><div class="pc"><div class="ic">${p.ic}</div><div class="bd"><b>${p.n}</b><p>${p.d}</p>
  <div class="xmoney out">💰 Per tahap <b>${rp(p.cost * KAS_T)}</b> · estimasi total ±${rp(tot)}${done ? '' : ' · sisa ±' + rp(sisa)}</div>
  <small class="xlt">📈 Manfaat saat berjalan: ${prgBenefit(p)} (sebanding progres)</small>
  <small class="xlt">🎁 Hadiah milestone: ${ms}</small>
  <small class="xlt">🔗 Pelaksana: ${ROLES[mi].ic} ${ROLES[mi].j}${nd ? ' → disetujui Menkeu' : ' (tanpa persetujuan Menkeu)'}</small></div></div>
  <div class="xpb"><div style="width:${v}%"></div>${ticks}<span>${v}%</span></div>
  <small>${ROLES[mi].ic} ${esc(m.nm)} · ${'★'.repeat(m.c)} · Risiko bocor: <b class="${rk[1]}">${rk[0]}</b></small>
  ${done || !nd ? '' : menkeuHint(p.cost, 0)}
  <button ${dis ? 'disabled' : ''} data-action="openProp" data-kind="prg" data-id="${p.id}">${done ? '✅ Selesai' : S.kas - p.cost <= 0 ? 'Kas tidak cukup' : nd ? 'Lihat rincian & danai' : '✅ Danai tahap ini'}</button></div>`;
    }).join('') +
    '</div>'
  );
}

export function repLines(r: QuarterReport): string {
  let n = 0;
  const row = (a: string, v: number): string =>
    `<div class="xrow xl2 xa" style="--i:${n++}"><span>${a}</span>${cuB(v * KAS_T, v >= 0 ? '+' : '−', n * 90)}</div>`;
  return `<div class="xrow xl2 xa" style="--i:${n++}"><span>Kas awal kuartal</span><b>${kasRp(r.kas0)}</b></div>
 ${row('Pemasukan rutin (pajak, bea, PNBP)', r.fs.inc / KAS_T)}${row('Belanja wajib (gaji, bunga, subsidi, dll)', -r.fs.bel / KAS_T)}${row('Kebijakan', r.pol)}${row('Program', r.prg)}${row('Kejadian & musim', r.evt)}${row('Penyitaan & denda korupsi', r.rec)}${Math.abs(r.trip || 0) > 0.00005 ? row('Kunjungan kerja', r.trip) : ''}${Math.abs(r.mkt || 0) > 0.00005 ? row('Bursa & pasar keuangan', r.mkt) : ''}${Math.abs(r.trd || 0) > 0.00005 ? row('Bea ekspor-impor & royalti komoditas', r.trd) : ''}${Math.abs(r.lain) > 0.05 ? row('Lainnya (lobi, dsb)', r.lain) : ''}
 <div class="xrow xl2 tot xa" style="--i:${n++}"><span>Kas akhir kuartal</span><b>${kasRp(r.kas1)}</b></div>`;
}

export function angPanel(): string {
  const S = store.S!;
  ensure36();
  const D = fiscalDetail();
  const f = D.f;
  const r = S.qrep;
  const L = S.led;
  const fl = S.fl;
  const row = (a: string, b: string, cls?: string, sub?: string): string =>
    `<div class="xrow xl2 ${cls || ''}"><span>${a}${sub ? `<br><small class="xlt">${sub}</small>` : ''}</span><b>${b}</b></div>`;
  const lines = (arr: ReadonlyArray<[string, number]>, tot: number, g?: boolean): string =>
    arr
      .map(
        (a) =>
          `${row(a[0], (a[1] >= 0 ? '+' : '−') + rp(Math.abs(a[1])))}<div class="xbarl ${g ? 'g' : ''}"><i style="width:${Math.max(0, Math.min(100, (Math.abs(a[1]) / tot) * 100))}%"></i></div>`,
      )
      .join('');

  const dagTot = D.dag[0][1] + D.dag[1][1];
  const incTot = f.inc + dagTot;
  const live: Array<[string, number]> = (
    [
      ['Kebijakan', fl.pol],
      ['Program', fl.prg],
      ['Kejadian, musim & bantuan daerah', fl.evt],
      ['Penyitaan & denda korupsi', fl.rec],
      ['Kunjungan kerja', fl.trip || 0],
      ['Bursa & pasar keuangan', fl.mkt || 0],
      ['Bea ekspor-impor & royalti', fl.trd || 0],
    ] as Array<[string, number]>
  ).filter((a) => Math.abs(a[1]) > 0.00005);

  const liveRows = live
    .map(
      (a) =>
        `<div class="xrow xl2"><span>${a[0]}</span><b class="${a[1] >= 0 ? 'up' : 'dn'}">${a[1] >= 0 ? '+' : '−'}${rp(Math.abs(a[1]) * KAS_T)}</b></div>`,
    )
    .join('');

  const projNet = f.netT + dagTot;
  const led =
    L.n > 0
      ? `<div class="card"><b>📚 Total sejak dilantik (${L.n} kuartal)</b>
  ${row('Pajak', ' +' + rp(L.pajak))}${row('Bea & cukai', '+' + rp(L.bea))}${row('PNBP (SDA, dividen BUMN)', '+' + rp(L.pnbp))}
  ${row('Bea ekspor-impor & royalti', '+' + rp(L.trd))}${row('Penyitaan & denda korupsi', '+' + rp(L.rec))}
  ${row('Belanja wajib', '−' + rp(L.bel))}${row('Kebijakan (net)', (L.pol >= 0 ? '+' : '−') + rp(Math.abs(L.pol)))}${row('Program', (L.prg >= 0 ? '+' : '−') + rp(Math.abs(L.prg)))}
  ${row('Kejadian, musim & lainnya', (L.evt >= 0 ? '+' : '−') + rp(Math.abs(L.evt)))}
  <small class="xlt">Angka pemasukan rutin dan belanja wajib dihitung per kuartal. Kebijakan, program, dan kejadian adalah uang tambahan yang masuk atau keluar karena keputusanmu.</small></div>`
      : '';

  return `<div class="card"><div class="pt"><b>🏦 Kas Negara</b><b>${kasRp(S.kas)}</b></div>
  <div class="pt"><span>📜 Total utang</span><b>${utgRp(S.utg)}</b></div>
  <small>Proyeksi kuartal depan jika tanpa keputusan baru: ${projNet >= 0 ? 'surplus' : 'defisit'} <b>${rp(Math.abs(projNet))}</b>.</small></div>
 <div class="card"><b>❓ Dari mana kas negara?</b>
  <p class="hint" style="margin:.3rem 0"><b>Masuk:</b> pajak, bea & cukai, PNBP (royalti tambang, migas, dividen BUMN), bea ekspor-impor, penyitaan koruptor, hasil bursa, dan utang baru.<br><b>Keluar:</b> belanja wajib (gaji, bunga utang, subsidi, transfer daerah, pertahanan), lalu kebijakan, program, kunjungan, bantuan bencana, dan lobi yang kamu pilih.<br>Tiap kuartal, kas bertambah atau berkurang sebesar selisih pemasukan dan belanja wajib, ditambah keputusanmu.</p></div>
 <div class="card good"><b>⬇️ Pemasukan rutin per kuartal (perkiraan)</b>
  <div class="xrow xl2"><span><b>Pajak</b></span><b>+${rp(f.pajak)}</b></div>${lines(D.pajak, f.pajak, true)}
  <div class="xrow xl2"><span><b>Bea & cukai</b></span><b>+${rp(f.bea)}</b></div>${lines(D.bea, f.bea, true)}
  <div class="xrow xl2"><span><b>PNBP</b> (sumber daya alam, dividen BUMN)</span><b>+${rp(f.pnbp)}</b></div>${lines(D.pnbp, f.pnbp, true)}
  <div class="xrow xl2"><span><b>Perdagangan & komoditas</b></span><b class="${dagTot >= 0 ? 'up' : 'dn'}">${dagTot >= 0 ? '+' : '−'}${rp(Math.abs(dagTot))}</b></div>${lines(D.dag, Math.max(1, Math.abs(D.dag[0][1]) + Math.abs(D.dag[1][1])), true)}
  ${row('Total pemasukan rutin', '+' + rp(incTot), 'tot')}
  <small class="xlt">Harga komoditas saat ini ${Math.round(D.sda * 100)}% dari normal. Kalau harga batu bara, nikel, minyak, gas, dan sawit naik, royalti dan PNBP naik. Kebijakan dagang di Bursa → Ekspor-Impor juga menambah bea.</small></div>
 <div class="card bad"><b>⬆️ Belanja wajib per kuartal</b><p class="hint" style="margin:.2rem 0 .4rem">Harus dibayar sebelum kebijakan atau program baru apa pun.</p>
  ${D.bel.map((a) => row(a[0], '−' + rp(a[1]), '', a[2])).join('')}
  ${row('Total belanja wajib', '−' + rp(f.bel), 'tot')}</div>
 <div class="card"><b>⏳ Kuartal ini sejauh ini</b>${liveRows || '<small class="xlt">Belum ada keputusan yang menggerakkan kas kuartal ini.</small>'}<small class="xlt">Dihitung dari keputusanmu: kebijakan, program, kejadian, penyitaan, perdagangan.</small></div>
 ${r ? `<div class="card"><b>🧾 Laporan kuartal lalu</b>${repLines(r)}</div>` : ''}
 ${led}
 <div class="card"><b>💡 Cara menambah kas</b><div class="xlev">
  <button data-action="goSub" data-tab="pol">🧾 Reformasi pajak, pajak digital, cukai, amnesti</button>
  <button data-action="goSub" data-tab="pol">🏢 Rapikan BUMN, hilirisasi</button>
  <button data-action="goSubBtab" data-btab="dagang" data-tab="bur">🚢 Pajak ekspor & kebijakan dagang</button>
  <button data-action="goSub" data-tab="kas">⚖️ Berantas korupsi (penyitaan aset)</button>
  <button data-action="goSub" data-tab="bur">📈 Dagang di bursa komoditas & saham</button>
  <button data-action="goSub" data-tab="pol">📜 Tarik utang (bunga naik)</button></div></div>`;
}
