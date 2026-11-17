import { KAS_T, LBL, SEAS, STAT, UTG_T } from '../data/constants';
import { setneg } from '../engine/cabinet';
import { kasTrend } from '../engine/fiscal';
import { ihsg, usdState } from '../engine/market';
import { getTermQuarter } from '../engine/stats';
import { presName, store } from '../engine/store';
import { col, esc, fmtN, idr, kasRp, rp, sgn, utgRp } from '../engine/utils';
import { avatar, mAv } from '../rendering/avatar';
import type { AllStatKey, EffectMap } from '../types/game';

export function chips(f: EffectMap): string {
  return (Object.entries(f) as Array<[AllStatKey, number | undefined]>)
    .filter(([, v]) => v)
    .map(([k, v], i) => {
      const val = v!;
      const bad = k === 'hrg' || k === 'utg' ? val > 0 : val < 0;
      let lab: string;
      if (k === 'kas') lab = sgn(val) + rp(Math.abs(val) * KAS_T) + ' Kas';
      else if (k === 'utg') lab = sgn(val) + rp(Math.abs(val) * UTG_T) + ' Utang';
      else lab = (val > 0 ? '+' : '') + val + ' ' + LBL[k];
      return `<span class="chip ${bad ? 'bad' : 'good'}" style="animation-delay:${i * 70}ms">${lab}</span>`;
    })
    .join('');
}

export const cuB = (v: number, pre?: string, d?: number): string =>
  `<b class="cu ${pre === '−' ? 'dn' : pre === '+' ? 'up' : ''}" data-v="${Math.abs(v)}" data-pre="${pre || ''}" data-d="${d || 0}">${pre || ''}${rp(Math.abs(v))}</b>`;

export function setHead(line: string, label?: string): string {
  const s = setneg();
  return `<div class="xsetn xa" style="--i:0">${mAv(s, 's')}<div class="xsay"><small><span class="xenv">📨</span> ${label || 'Menteri Sekretaris Negara'} · ${esc(s.nm)}</small><div class="tw" data-t="${esc(line)}">${esc(line)}</div></div></div>`;
}

export function chainHTML(steps: ReadonlyArray<[string, string, string]>): string {
  return `<div class="xchain">${steps
    .map((s, i) => `<div class="xcs ${s[2]} xa" style="--i:${i * 2 + 1}"><span>${s[0]}</span><small>${s[1]}</small></div>`)
    .join('<i class="xar">›</i>')}</div>`;
}

export function hudHTML(): string {
  const S = store.S!;
  const { th, kw } = getTermQuarter();
  const tiles = STAT.map(([k, ic, n]) => {
    const v = Math.round(S[k]);
    const inv = k === 'hrg';
    const pv = store.LAST[k] === undefined ? v : store.LAST[k]!;
    const isK = k === 'kas';
    const dv = isK ? S.kas - S.prev.kas : v - Math.round(S.prev[k]);
    const shown = Math.round(Math.abs(dv) * (isK ? KAS_T : 1));
    const disp = isK ? '<span class="xrp">Rp</span>' + fmtN(S.kas * KAS_T) + '<span class="xrp">T</span>' : v;
    const good = inv ? dv < 0 : dv > 0;
    const dc = shown === 0 ? '<i></i>' : `<i class="${good ? 'up' : 'dn'}">${dv > 0 ? '▲' : '▼'}${shown}${isK ? 'T' : ''}</i>`;
    const tip = isK ? n + ': ' + kasRp(S.kas) : n + ': ' + v;
    const actionAttrs = isK ? `data-action="goSub" data-tab="ang"` : `data-action="toast" data-msg="${esc(tip)}"`;
    return `<div class="xst" ${actionAttrs}><div class="xh"><span class="e">${ic}</span><span class="xl">${n}</span></div><b class="${isK ? 'k' : ''}${pv !== v ? ' pop' : ''}">${disp}</b>${dc}<div class="bar"><div data-w="${v}" style="width:${pv}%;background:${col(v, inv)}"></div></div></div>`;
  }).join('');

  const kd = kasTrend() * KAS_T;
  const low = S.kas < 25;
  let fxChip = '';
  if (S.sm) {
    const us = usdState(S.sm.usd);
    const ih = ihsg();
    const r = S.sm.ret;
    fxChip = `<div class="xfxl" data-action="go" data-nav="kurs"><span>💱 ${idr(Math.round(S.sm.usd))}/USD <b class="${us[1]}">${us[2]} ${us[0]}</b></span><span>📊 IHSG ${fmtN(ih)} <b class="${r >= 0 ? 'up' : 'dn'}">${r >= 0 ? '▲' : '▼'}${Math.abs(Math.round(r * 1000) / 10)}%</b></span></div>`;
  }

  return `<div class="xhud">
  <div class="xtop"><span class="xavtap" data-action="tapPresAvatar">${avatar(S.nama, { role: 'pres', fem: S.gen === 'p', bg: '#8a1c26', cls: 's' })}</span>
   <div class="xtt"><b>${esc(presName())}</b><small>Tahun ${th} · Kuartal ${kw} · ${SEAS[S.q % 4].m}</small></div>
   <div class="xr"><button class="xhelp" data-action="openGuide" data-page="0" aria-label="Cara main">❓</button></div></div>
  <div class="prog"><div style="width:${((S.q + (S.res ? 1 : 0)) / 20) * 100}%"></div></div>
  <div class="xst6">${tiles}</div>
  <div class="xkas${low ? ' low' : ''}"><span>💰 Kas <b>${kasRp(S.kas)}</b> · ${kd >= 0 ? '+' : '−'}${rp(Math.abs(kd))}/kuartal${low ? ' · ⚠️ tipis!' : ''}</span><span>📜 Utang <b>${utgRp(S.utg)}</b> · ${S.q + 1}/20</span></div>${fxChip}</div>`;
}

export function tickerHTML(): string {
  const S = store.S!;
  const tk = (S.log.length ? S.log : ['🇮🇩 Selamat bertugas, Presiden!']).slice(-8).map(esc).join('   •   ');
  return `<div class="ticker"><div class="lv"><i></i>LIVE</div><div class="tkw"><div class="tk"><span>${tk}</span><span>${tk}</span></div></div></div>`;
}
