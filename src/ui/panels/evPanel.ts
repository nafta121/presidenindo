import { AGN, AGN_T, CAT, SEAS } from '../../data/constants';
import { MK_OPS } from '../../data/markets';
import { OUTFIT, PARTIES, ROLES } from '../../data/parties';
import { advice } from '../../engine/cabinet';
import { curEv } from '../../engine/lifecycle';
import { store } from '../../engine/store';
import { esc } from '../../engine/utils';
import { avatar } from '../../rendering/avatar';
import { chips } from '../hud';

export function pendHints(): string {
  const S = store.S!;
  const h: string[] = [];
  const pc = S.cases.filter((c) => c.pend).length;
  if (pc) h.push(`<button class="xhint" data-action="go" data-nav="kas">⚖️ ${pc} kasus menunggu sikapmu</button>`);
  if (S.slots > 0) h.push(`<button class="xhint" data-action="go" data-nav="prg">🏗️ ${S.slots} slot program belum dipakai</button>`);
  if (!S.usedPol) h.push(`<button class="xhint" data-action="go" data-nav="pol">📋 Kebijakan belum ditetapkan</button>`);
  if (!S.usedTrip) h.push(`<button class="xhint" data-action="goKerDn">✈️ Setneg menyiapkan agenda kunjungan kerja</button>`);
  if (S.mk && S.mk.ops < MK_OPS) {
    h.push(`<button class="xhint" data-action="goSub" data-tab="bur">📈 Bursa terbuka (${MK_OPS - S.mk.ops} transaksi)</button>`);
  }
  if (!S.usedDip) h.push(`<button class="xhint" data-action="go" data-nav="par">🤝 Lobi partai tersedia</button>`);
  return h.length ? `<p class="hint" style="margin:.6rem 0 .3rem">Opsional sebelum tutup kuartal:</p><div class="xhints">${h.join('')}</div>` : '';
}

export function seasBanner(): string {
  const S = store.S!;
  const s = SEAS[S.q % 4];
  const nxt = Object.keys(AGN)
    .map(Number)
    .filter((q) => q >= S.q)
    .sort((a, b) => a - b)[0];
  const nx =
    nxt !== undefined
      ? `<br><small>🗳️ ${AGN_T[AGN[nxt]]}: ${nxt === S.q ? 'kuartal ini!' : 'dalam ' + (nxt - S.q) + ' kuartal'}</small>`
      : '';
  return `<div class="xseas"><span class="e">${s.ic}</span><div><b>${s.n}</b><br><small>${s.d}</small>${nx}</div></div>`;
}

export function adviceHTML(): string {
  const S = store.S!;
  const a = advice();
  if (!a) return '';
  const mi = S.men.findIndex((x) => x.k === a[0]);
  const m = S.men[mi];
  const r = ROLES[mi];
  return `<div class="xadv">${avatar(m.nm, { role: OUTFIT[m.k], bg: m.p >= 0 ? PARTIES[m.p].c : '#444', cls: 's' })}<div class="xsay"><small>${r.j} · ${esc(m.nm)}</small><div>${a[1]}</div></div></div>`;
}

export function evPanel(): string {
  const S = store.S!;
  const e = curEv();
  const ct = CAT[e.cat || 'dn'];
  if (!S.res) {
    return (
      adviceHTML() +
      seasBanner() +
      `<div class="card xev"><span class="tag" style="background:${ct[1]}"><i></i>${ct[0]}</span><div class="eic">${e[0]}</div><h2>${e[1]}</h2><p>${e[2]}</p>` +
      e[3].map((c, i) => `<button class="ch" data-action="pick" data-idx="${i}">${c[0]}</button>`).join('') +
      '</div>'
    );
  }
  const cls = S.res.n >= 0 ? 'good' : 'bad';
  return `<div class="card ${cls}"><span class="tag" style="background:#4a2a30">KEPUTUSAN</span><div class="eic">${S.res.ic}</div><h2>${e[1]}</h2>
  <p>Kamu memilih: <em>${S.res.p}</em></p><p style="color:var(--txt)">${S.res.t}</p><div>${chips(S.res.f)}</div></div>${adviceHTML()}${pendHints()}`;
}
