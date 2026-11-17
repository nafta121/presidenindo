import { EV } from '../data/events';
import { cheatExportSave, type EditableCheatStat } from '../engine/cheat';
import { store, type CheatTabKey } from '../engine/store';
import { $, esc, idr, kasRp, utgRp } from '../engine/utils';

const CHEAT_STATS: ReadonlyArray<[EditableCheatStat, string, (v: number) => string]> = [
  ['rak', '😊 Rakyat', (v) => String(Math.round(v))],
  ['eko', '📈 Ekonomi', (v) => String(Math.round(v))],
  ['kas', '🏦 Kas', (v) => kasRp(v)],
  ['hrg', '🍚 Harga', (v) => String(Math.round(v))],
  ['stb', '🛡️ Stabil', (v) => String(Math.round(v))],
  ['utg', '📜 Utang', (v) => utgRp(v)],
  ['ipk', '🧼 Integritas', (v) => String(Math.round(v))],
];

function statTabHTML(): string {
  const S = store.S!;
  const sliders = CHEAT_STATS.map(
    ([k, label, fmt]) => `<div class="xcheat-st">
      <span>${label}</span>
      <input type="range" min="0" max="100" step="1" value="${Math.round(S[k])}" data-action="cheatStatRange" data-key="${k}">
      <b>${fmt(S[k])}</b>
    </div>`,
  ).join('');

  return `<div class="xcheat-sec">
    <div class="xcheat-grid">
      <button class="cb ${store.godMode ? 'ok' : ''}" data-action="cheatGod">🛡️ God Mode: ${store.godMode ? 'ON' : 'OFF'}</button>
      <button class="cb pri" data-action="cheatRefresh">⚡ Reset Kuota Kuartal</button>
    </div>
    <div class="xcheat-grid">
      <button class="cb" data-action="cheatStatAdj" data-key="kas" data-delta="12.5">💰 +Rp 100 T Kas</button>
      <button class="cb" data-action="cheatStatSet" data-key="kas" data-val="100">🏦 Kas Maks (Rp 800T)</button>
      <button class="cb" data-action="cheatStatSet" data-key="kas" data-val="1">⚠️ Kas Kritis (Rp 8T)</button>
      <button class="cb" data-action="cheatStatSet" data-key="utg" data-val="0">📜 Lunas Utang (Rp 0)</button>
    </div>
  </div>
  <div class="xcheat-sec">
    <small>Geser indikator secara langsung (DPR diatur lewat tab Politik):</small>
    ${sliders}
  </div>`;
}

function kuartalTabHTML(): string {
  const S = store.S!;
  const qOpts = Array.from({ length: 20 }, (_, i) => {
    const th = Math.floor(i / 4) + 1;
    const kw = (i % 4) + 1;
    const tag = i === 6 ? ' · Pilkada I' : i === 14 ? ' · Pilkada II' : i === 18 ? ' · Pemilu' : '';
    return `<option value="${i}" ${S.q === i ? 'selected' : ''}>Q${i + 1} (T${th}.K${kw})${tag}</option>`;
  }).join('');

  const curDeckEv = S.deck[S.q] ?? 0;
  const evOpts = EV.map(
    (e, idx) =>
      `<option value="${idx}" ${curDeckEv === idx ? 'selected' : ''}>#${idx} [${(e.cat || 'dn').toUpperCase()}] ${esc(e[1])}</option>`,
  ).join('');

  return `<div class="xcheat-sec">
    <small>Pintasan lompat kuartal & agenda nasional (saat ini: Q${S.q + 1}/20):</small>
    <div class="xcheat-grid">
      <button class="cb" data-action="cheatJumpQ" data-q="0">⏮️ Q1 Awal</button>
      <button class="cb" data-action="cheatJumpQ" data-q="6">🗳️ Pilkada I (Q7)</button>
      <button class="cb" data-action="cheatJumpQ" data-q="14">🗳️ Pilkada II (Q15)</button>
      <button class="cb" data-action="cheatJumpQ" data-q="18">🗳️ Pemilu (Q19)</button>
    </div>
    <div style="display:flex;gap:.3rem">
      <select id="cheat-q-sel">${qOpts}</select>
      <button class="cb pri" style="white-space:nowrap" data-action="cheatJumpFromSel">Lompat</button>
    </div>
  </div>
  <div class="xcheat-sec">
    <small>Paksa kejadian tertentu ke kuartal aktif:</small>
    <select id="cheat-ev-sel">${evOpts}</select>
    <button class="cb pri" data-action="cheatForceEvFromSel">🎯 Pasang Kejadian Ini</button>
  </div>
  <div class="xcheat-sec">
    <div class="xcheat-grid">
      <button class="cb" data-action="cheatClearModals">🧹 Tutup Semua Modal</button>
      <button class="cb ok" data-action="cheatRevive">🦅 Bangkit Game Over</button>
    </div>
    <button class="cb warn" data-action="cheatFinish">🏁 Tamatkan 20 Kuartal Sekarang</button>
  </div>`;
}

function politikTabHTML(): string {
  const S = store.S!;
  const curUsd = S.sm ? idr(Math.round(S.sm.usd)) : 'Rp 16.200';
  return `<div class="xcheat-sec">
    <small>Parlemen, Kabinet, & Program Nasional (DPR saat ini: ${Math.round(S.kol)}%):</small>
    <div class="xcheat-grid">
      <button class="cb ok" data-action="cheatCoal" data-mode="max">🏛️ Koalisi DPR 100%</button>
      <button class="cb warn" data-action="cheatCoal" data-mode="min">🔥 Oposisi Total</button>
      <button class="cb" data-action="cheatMaxCab">👔 Kabinet 5★ Penuh</button>
      <button class="cb" data-action="cheatMaxPrg">🏗️ 19 Program 100%</button>
    </div>
  </div>
  <div class="xcheat-sec">
    <small>Pasar Keuangan, Kurs (${curUsd}/USD), & Komoditas:</small>
    <div class="xcheat-grid">
      <button class="cb" data-action="cheatFx" data-usd="14500">💱 Kurs Kuat 14.500</button>
      <button class="cb warn" data-action="cheatFx" data-usd="18500" data-alert="1">🚨 Krisis Kurs 18.500</button>
      <button class="cb" data-action="cheatIhsg" data-pct="10">📈 IHSG +10%</button>
      <button class="cb warn" data-action="cheatIhsg" data-pct="-12" data-alert="1">📉 Crash IHSG −12%</button>
    </div>
    <button class="cb" data-action="cheatFillKom">📦 Tambah +5 Semua Stok Komoditas</button>
  </div>
  <div class="xcheat-sec">
    <small>Pemicu Hukum & Krisis Politik:</small>
    <div class="xcheat-grid">
      <button class="cb" data-action="cheatSpawnCase">⚖️ Buat Kasus Korupsi</button>
      <button class="cb" data-action="cheatSpawnMk">🏛️ Buat Gugatan MK</button>
    </div>
  </div>`;
}

function saveTabHTML(): string {
  return `<div class="xcheat-sec">
    <small>JSON State (<code>presiden_ri_v3</code>) — ubah lalu klik Muat JSON:</small>
    <textarea id="cheat-save-json" spellcheck="false">${esc(cheatExportSave())}</textarea>
    <div class="xcheat-grid">
      <button class="cb" data-action="cheatCopySave">📋 Salin JSON</button>
      <button class="cb pri" data-action="cheatLoadSave">📥 Muat JSON Ini</button>
    </div>
  </div>
  <div class="xcheat-sec">
    <button class="cb warn" data-action="cheatHardReset">🗑️ Hapus Save & Kembali ke Awal</button>
  </div>`;
}

export function cheatDrawerHTML(): string {
  if (!store.cheatOpen) return '';
  if (store.cheatMin) {
    return `<button class="xcheat-pill" data-action="cheatMin" aria-label="Buka Panel Debug">🛠️ Debug${store.godMode ? ' · 🛡️' : ''}</button>`;
  }

  const tabs: ReadonlyArray<[CheatTabKey, string]> = [
    ['stat', 'Stat'],
    ['kuartal', 'Kuartal'],
    ['politik', 'Politik'],
    ['save', 'Save'],
  ];

  let body: string;
  if (!store.S) {
    body = `<div class="xcheat-sec">
      <small>Permainan belum dimulai. Mulai masa jabatan untuk mengaktifkan kontrol penuh.</small>
      <button class="cb pri" data-action="cheatQuickStart">🚀 Mulai Cepat (3 Janji Otomatis)</button>
    </div>`;
  } else if (store.cheatTab === 'kuartal') {
    body = kuartalTabHTML();
  } else if (store.cheatTab === 'politik') {
    body = politikTabHTML();
  } else if (store.cheatTab === 'save') {
    body = saveTabHTML();
  } else {
    body = statTabHTML();
  }

  return `<aside class="xcheat" aria-label="Panel Debug dan Cheat">
    <div class="xcheat-hd">
      <b>🛠️ DEBUG & CHEAT ${store.godMode ? '<span class="xcheat-god">GOD</span>' : ''}</b>
      <div class="xcheat-hc">
        <button data-action="cheatMin" title="Ciutkan" aria-label="Ciutkan">—</button>
        <button data-action="cheatClose" title="Tutup" aria-label="Tutup">✕</button>
      </div>
    </div>
    ${
      store.S
        ? `<div class="xcheat-tabs">${tabs
            .map(
              ([k, lbl]) =>
                `<button class="${store.cheatTab === k ? 'on' : ''}" data-action="cheatTab" data-tab="${k}">${lbl}</button>`,
            )
            .join('')}</div>`
        : ''
    }
    <div class="xcheat-bd">${body}</div>
  </aside>`;
}

export function renderCheatDrawer(force = false): void {
  const cheatEl = $('cheat');
  if (!cheatEl) return;
  if (!store.cheatOpen) {
    if (cheatEl.innerHTML !== '') cheatEl.innerHTML = '';
    return;
  }
  if (!force && typeof document !== 'undefined') {
    const active = document.activeElement;
    if (
      active &&
      cheatEl.contains(active) &&
      (active.tagName === 'TEXTAREA' ||
        active.tagName === 'SELECT' ||
        (active instanceof HTMLInputElement && active.type !== 'range'))
    ) {
      return;
    }
  }
  cheatEl.innerHTML = cheatDrawerHTML();
}
