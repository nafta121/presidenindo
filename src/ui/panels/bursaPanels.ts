import {
  EXM,
  IMM,
  KOM,
  LOT_T,
  MK_CAP,
  MK_OPS,
  SHR,
  SP_BUY,
  SP_SELL,
  STK,
  STK_CAP,
  TD_MAXCHG,
  TRD0,
} from '../../data/markets';
import { ROLES } from '../../data/parties';
import { menkeu, minOf } from '../../engine/cabinet';
import {
  fxOpts,
  ihsg,
  komPct,
  lotVal,
  mkBuyCost,
  mkSellRev,
  stkLot,
  stkPct,
  tdBase,
  tdCalc,
  tdChg,
  tdTotal,
  unrealRows,
  usdState,
} from '../../engine/market';
import { roleIdx } from '../../engine/stats';
import { store } from '../../engine/store';
import { esc, fmtN, idr, rp, thk } from '../../engine/utils';
import { mAv } from '../../rendering/avatar';
import { spark } from '../../rendering/charts';
import type { ExportMode, ImportMode, TradeModeDef } from '../../types/game';

export function unrealCard(): string {
  const rows = unrealRows();
  if (!rows.length) {
    return `<div class="card"><b>📦 Nilai stok vs modal</b><small class="xlt">Belum ada stok. Beli komoditas dulu di tab Pasar.</small></div>`;
  }
  const tot = rows.reduce((a, r) => a + r.pl, 0);
  return (
    `<div class="card ${tot >= 0 ? 'good' : 'bad'}"><div class="pt"><b>📦 Untung/rugi belum terealisasi</b><b class="${tot >= 0 ? 'up' : 'dn'}">${tot >= 0 ? '+' : '−'}${rp(Math.abs(tot))}</b></div>` +
    rows
      .map(
        (r) =>
          `<div class="xrow xl2"><span>${r.k.ic} ${r.k.n} · ${Math.round(r.st * 10) / 10} lot</span><b class="${r.pl >= 0 ? 'up' : 'dn'}">${r.pl >= 0 ? '+' : '−'}${rp(Math.abs(r.pl))}</b></div>`,
      )
      .join('') +
    `<small class="xlt">Nilai stok sekarang dibanding modal beli. Baru jadi uang tunai kalau dijual.</small></div>`
  );
}

export function dagangPanel(): string {
  const S = store.S!;
  tdBase();
  const T = S.td;
  const tt = tdTotal();
  const last = T.h.length ? T.h[T.h.length - 1] : null;
  const sp = (v: number): string => `<b class="${v >= 0 ? 'up' : 'dn'}">${v >= 0 ? '+' : '−'}${rp(Math.abs(v))}</b>`;

  const head = `<div class="card"><div class="pt"><b>🚢 Neraca Perdagangan</b><span class="pill">Ganti kebijakan: sisa ${TD_MAXCHG - tdChg()}/${TD_MAXCHG}</span></div>
 ${T.msg ? `<div class="xmk no">${T.msg}</div>` : ''}
 <p class="hint" style="margin:.2rem 0">Perkiraan kuartal ini berdasarkan harga bursa, permintaan dunia, dan kebijakan yang kamu pilih. Hasil nyata dihitung saat kuartal ditutup.</p>
 <div class="xrow xl2"><span>📤 Ekspor (perkiraan)</span><b>${rp(tt.ex)}</b></div>
 <div class="xrow xl2"><span>📥 Impor (perkiraan)</span><b>${rp(tt.im)}</b></div>
 <div class="xrow xl2"><span>${tt.net >= 0 ? '✅ Surplus' : '⚠️ Defisit'}</span>${sp(tt.net)}</div>
 <div class="xrow xl2"><span>🏛️ Bea ekspor-impor ke kas</span><b class="up">+${rp(tt.tax)}</b></div>
 <small class="xlt">Surplus besar menguatkan Rupiah, defisit melemahkannya. Kompetensi Menlu ${minOf('lun').c >= 3 ? 'membantu' : 'kurang membantu'} volume ekspor.</small></div>`;

  const lastC = last
    ? `<div class="card"><b>📊 Kuartal lalu (${thk(last.q)})</b><div class="xrow xl2"><span>Ekspor</span><b>${rp(last.ex)}</b></div><div class="xrow xl2"><span>Impor</span><b>${rp(last.im)}</b></div><div class="xrow xl2"><span>Neraca</span>${sp(last.net)}</div><div class="xrow xl2"><span>Bea diterima</span><b class="up">+${rp(last.tax)}</b></div></div>`
    : '';

  const cards = KOM.map((k) => {
    const P = T.pol[k.id];
    const b = TRD0[k.id];
    const c = tdCalc(k.id, P);
    const L = last && last.d[k.id];
    const dl = (v: number, o: number): string => {
      if (!L || o < 1) return '';
      const r = Math.round((v / o - 1) * 100);
      return ` <small class="${r >= 0 ? 'up' : 'dn'}">${r >= 0 ? '▲' : '▼'}${Math.abs(r)}%</small>`;
    };
    const to = b.exTo.length && b.ex > 0 ? b.exTo.map((n, i) => `${n} ${Math.round(SHR[i] * 100)}%`).join(' · ') : '';
    const fr =
      b.imFrom.length && b.im > 0
        ? b.imFrom.map((n, i) => `${n} ${Math.round([0.5, 0.3, 0.2][i] * 100)}%`).join(' · ')
        : '';
    const seg = <K extends ExportMode | ImportMode>(kind: 'ex' | 'im', M: Record<K, TradeModeDef>, cur: K): string =>
      `<div class="xseg xs3">${(Object.keys(M) as K[])
        .map(
          (v) =>
            `<button class="${cur === v ? 'on' : ''}${S.td.base && S.td.base[k.id][kind] !== cur && cur === v ? ' chgd' : ''}" data-action="tdSet" data-id="${k.id}" data-kind="${kind}" data-val="${v}">${M[v].n}</button>`,
        )
        .join('')}</div><small class="xlt">${M[cur].d}</small>`;

    return `<div class="card xkom"><div class="pt"><b>${k.ic} ${k.n}</b><small>demand dunia ${Math.round(T.dem[k.id] * 100)}%</small></div>
  ${b.ex > 0 ? `<div class="xrow xl2"><span>📤 Ekspor</span><span><b>${rp(c.ex)}</b>${dl(c.ex, L ? L.ex : 0)}</span></div>${to ? `<small class="xlt">Tujuan: ${to}</small>` : ''}` : '<small class="xlt">Bukan komoditas ekspor utama.</small>'}
  ${b.im > 0 ? `<div class="xrow xl2"><span>📥 Impor</span><span><b>${rp(c.im)}</b>${dl(c.im, L ? L.im : 0)}</span></div>${fr ? `<small class="xlt">Asal: ${fr}</small>` : ''}` : ''}
  ${b.ex > 0 ? `<small class="xlt"><b>Kebijakan ekspor</b></small>${seg('ex', EXM, P.ex)}` : ''}
  ${b.im > 0 ? `<small class="xlt"><b>Kebijakan impor</b></small>${seg('im', IMM, P.im)}` : ''}</div>`;
  }).join('');

  const hist = T.h
    .slice()
    .reverse()
    .map((h) => `<div class="xrow xl2"><span>${thk(h.q)} · ekspor ${rp(h.ex)}, impor ${rp(h.im)}</span>${sp(h.net)}</div>`)
    .join('');

  return (
    head +
    lastC +
    '<div class="pg">' +
    cards +
    '</div>' +
    (hist ? `<div class="card"><b>🗓️ Riwayat neraca</b>${hist}<small class="xlt">Total bea diterima sejak awal: ${rp(T.rev)}</small></div>` : '')
  );
}

export function burPanel(): string {
  const S = store.S!;
  const M = S.mk;
  const BTAB = store.BTAB;
  const prof = M.tin - M.tout;
  const stockV = KOM.reduce((a, k) => a + lotVal(k) * M.st[k.id], 0);
  const seg = `<div class="xseg"><button class="${BTAB === 'pasar' ? 'on' : ''}" data-action="setBtab" data-btab="pasar">Pasar</button><button class="${BTAB === 'dagang' ? 'on' : ''}" data-action="setBtab" data-btab="dagang">Ekspor-Impor</button><button class="${BTAB === 'riwayat' ? 'on' : ''}" data-action="setBtab" data-btab="riwayat">Cuan</button></div>`;
  const head = `<div class="card"><div class="pt"><b>📈 Bursa Perdagangan Komoditas</b><span class="pill">Transaksi ${MK_OPS - M.ops}/${MK_OPS}</span></div>
  <p class="hint" style="margin:.2rem 0">Beli saat murah, jual saat mahal. 1 lot ≈ Rp ${LOT_T} T pada harga dasar. Ada selisih beli/jual dan biaya gudang tiap kuartal. Stok beras meredam harga pangan.</p>
  <div class="xrow xl2"><span>Nilai stok negara</span><b>${rp(stockV)}</b></div></div>`;

  if (BTAB === 'dagang') return seg + dagangPanel();
  if (BTAB === 'riwayat') {
    const lg = M.log.length
      ? M.log
          .map((l) => {
            const k = KOM.find((x) => x.id === l.id);
            const itemName = k ? `${k.ic} ${k.n}` : `📈 saham ${l.id}`;
            return `<div class="xrow xl2"><span>${thk(l.q)} · ${l.t === 'buy' ? 'Beli' : l.t === 'sell' ? 'Jual' : 'Operasi pasar'} ${l.n} lot ${itemName}</span><b class="${l.t === 'buy' ? 'dn' : 'up'}">${l.t === 'buy' ? '−' : '+'}${rp(l.v)}</b></div>${l.t !== 'buy' ? `<div class="xrow xl2" style="border:0;padding-top:0"><span></span><small class="${l.pr >= 0 ? 'up' : 'dn'}">${l.pr >= 0 ? 'untung ' : 'rugi '}${rp(Math.abs(l.pr))}</small></div>` : ''}`;
          })
          .join('')
      : '<p class="hint">Belum ada transaksi.</p>';
    return (
      seg +
      head +
      `<div class="xtot"><div class="up"><small>TOTAL DIDAPAT</small><b>${rp(M.tin)}</b></div><div class="dn"><small>TOTAL DIKELUARKAN</small><b>${rp(M.tout)}</b></div></div>
  <div class="card ${prof >= 0 ? 'good' : 'bad'}"><div class="pt"><b>${prof >= 0 ? '💰 Laba bersih (tunai)' : '📉 Rugi bersih (tunai)'}</b><b class="${prof >= 0 ? 'up' : 'dn'}">${rp(Math.abs(prof))}</b></div><small class="xlt">Belum termasuk nilai stok yang masih disimpan (${rp(stockV)}).</small></div>
  ${unrealCard()}<div class="card"><b>🧾 Transaksi terakhir</b>${lg}</div>`
    );
  }

  const cards = KOM.map((k) => {
    const p = M.p[k.id];
    const ch = komPct(k);
    const st = M.st[k.id];
    const m = minOf(k.role);
    const sCol = ch >= 0 ? '#5be39a' : '#ff8a8a';
    const full = st >= MK_CAP;
    const noop = M.ops >= MK_OPS;
    const bc1 = mkBuyCost(k, 1);
    const sr1 = mkSellRev(k, 1);
    const avg = st > 0 ? M.cost[k.id] / st : 0;
    const unreal = st > 0 ? sr1 - avg : 0;
    return `<div class="card xkom"><div class="pt"><b>${k.ic} ${k.n}</b><span class="xchg ${ch >= 0 ? 'up' : 'dn'}">${ch >= 0 ? '▲' : '▼'} ${Math.abs(ch)}%</span></div>
  <div class="xpriceRow"><div><b>Rp ${fmtN(p)}</b><small>/${k.u}</small></div>${spark(M.h[k.id], sCol)}</div>
  <small class="xlt">${k.d}</small>
  <div class="xrow xl2"><span>Stok negara</span><b>${Math.round(st * 10) / 10} / ${MK_CAP} lot${st > 0 ? ' (' + rp(lotVal(k) * st) + ')' : ''}</b></div>
  ${st > 0 ? `<div class="xrow xl2"><span>Jika dijual 1 lot sekarang</span><b class="${unreal >= 0 ? 'up' : 'dn'}">${unreal >= 0 ? '+' : '−'}${rp(Math.abs(unreal))}</b></div>` : ''}
  <small class="xlt">${ROLES[roleIdx(k.role)].ic} ${esc(m.nm)} (${'★'.repeat(m.c)}) memengaruhi harga jual ${m.c >= 3 ? '+' : ''}${m.c - 3}%</small>
  <div class="xbtns"><button ${full || noop ? 'disabled' : ''} data-action="mkTrade" data-id="${k.id}" data-type="buy" data-qty="1">Beli 1 lot<small>${rp(bc1)}</small></button>
  <button class="alt" ${st <= 0 || noop ? 'disabled' : ''} data-action="mkTrade" data-id="${k.id}" data-type="sell" data-qty="1">Jual 1 lot<small>${rp(sr1)}</small></button>
  <button class="alt" ${st <= 0 || noop ? 'disabled' : ''} data-action="mkTrade" data-id="${k.id}" data-type="sell" data-qty="${Math.max(1, Math.floor(st))}">Jual semua</button></div>
  ${k.id === 'beras' ? `<button class="alt" style="margin-top:.4rem;width:100%" ${st < 1 || noop ? 'disabled' : ''} data-action="opPasar">🛒 Operasi pasar (lepas 1 lot: Harga −6, Rakyat +1)</button>` : ''}</div>`;
  }).join('');

  return seg + head + '<div class="pg">' + cards + '</div>';
}

export function fxOptHTML(t: 'kurs' | 'ihsg', disabled: boolean): string {
  return fxOpts(t)
    .map(
      (o) =>
        `<button ${disabled && o.id !== 'diam' ? 'disabled' : ''} data-action="fxDo" data-id="${o.id}">${o.ic} ${o.t}<small>${o.d}</small></button>`,
    )
    .join('');
}

export function menkeuAdvice(t: 'kurs' | 'ihsg'): string {
  const S = store.S!;
  const m = menkeu();
  const mm = mAv(m, 's');
  const txt =
    t === 'kurs'
      ? S.kas >= 22
        ? 'Saran saya: intervensi valas bila tekanan berlanjut. Cadangan kas kita masih cukup.'
        : 'Kas kita tipis, jadi intervensi mahal. Saya sarankan konferensi pers atau SBN valas.'
      : 'Saran saya: beri sinyal lewat dana negara di saham BUMN, atau minta OJK menenangkan pasar.';
  return `<div class="xadv">${mm}<div class="xsay"><small>${ROLES[roleIdx('keu')].j} · ${esc(m.nm)}</small><div>${txt}</div></div></div>`;
}

export function kursPanel(): string {
  const S = store.S!;
  const sm = S.sm;
  const u = sm.usd;
  const us = usdState(u);
  const ch = Math.round(sm.uret * 1000) / 10;
  const sCol = ch <= 0 ? '#1f8a5b' : '#c23b3b';
  const warn = us[0] === 'Tertekan' || us[0] === 'Krisis';
  return `<div class="card ${warn ? 'bad' : ''}"><div class="pt"><b>💱 Kurs Rupiah / US Dollar (fiktif)</b><span class="xchg ${us[1]}">${us[2]} ${us[0]}</span></div>
  <div class="xpriceRow"><div><b style="font-size:1.6rem">${idr(Math.round(u))}</b><small> /USD</small><br><small class="${ch > 0 ? 'dn' : 'up'}">${ch > 0 ? '▲ melemah' : '▼ menguat'} ${Math.abs(ch)}% dari kuartal lalu</small></div>${spark(sm.uh, sCol)}</div>
  <small class="xlt">Kurs dipengaruhi ekonomi, utang, kas negara, stabilitas, dan kepercayaan rakyat. Rupiah lemah → harga pangan naik dan ekonomi tertekan.</small></div>
 ${warn ? `<div class="card bad"><b>⚠️ Peringatan: Rupiah ${us[0].toLowerCase()}</b><p>Segera tindak lanjut dengan Menteri Keuangan.</p></div>` : ''}
 ${menkeuAdvice('kurs')}
 <p class="hint">Tindak lanjut ke Menkeu${S.fxUsed ? ' (sudah dipakai kuartal ini)' : ' (1 langkah per kuartal)'}:</p>
 <div class="xchs">${fxOptHTML('kurs', S.fxUsed)}</div>`;
}

export function sahPanel(): string {
  const S = store.S!;
  const sm = S.sm;
  const ih = ihsg();
  const r = Math.round(sm.ret * 1000) / 10;
  const sCol = r >= 0 ? '#1f8a5b' : '#c23b3b';
  const port = STK.reduce((a, s) => a + stkLot(s) * sm.hold[s.id], 0);
  const needAct = (S.fxAlert && S.fxAlert.t === 'ihsg') || sm.ret <= -0.06;
  const M = S.mk;

  const cards = STK.map((s) => {
    const p = sm.p[s.id];
    const pc = stkPct(s);
    const h = sm.hold[s.id];
    const lv = stkLot(s);
    const noop = M.ops >= MK_OPS;
    const avg = h > 0 ? sm.cost[s.id] / h : 0;
    const un = h > 0 ? lv * (1 - SP_SELL) - avg : 0;
    return `<div class="card xkom"><div class="pt"><b>${s.id}</b><span class="xchg ${pc >= 0 ? 'up' : 'dn'}">${pc >= 0 ? '▲' : '▼'} ${Math.abs(pc)}%</span></div>
  <small>${s.n} · ${s.sec}${s.bumn ? ' · <b class="gd">BUMN</b>' : ''}</small>
  <div class="xpriceRow"><div><b>${idr(Math.round(p))}</b><small>/saham</small></div>${spark(sm.h[s.id], pc >= 0 ? '#1f8a5b' : '#c23b3b')}</div>
  <div class="xrow xl2"><span>1 lot negara</span><b>${rp(lv)}</b></div>
  <div class="xrow xl2"><span>Dimiliki</span><b>${h} / ${STK_CAP} lot${s.dy ? ' · dividen ' + (s.dy * 100).toFixed(1).replace('.', ',') + '%/kuartal' : ''}</b></div>
  ${h > 0 ? `<div class="xrow xl2"><span>Jika dijual 1 lot</span><b class="${un >= 0 ? 'up' : 'dn'}">${un >= 0 ? '+' : '−'}${rp(Math.abs(un))}</b></div>` : ''}
  <div class="xbtns"><button ${h >= STK_CAP || noop ? 'disabled' : ''} data-action="stkTrade" data-id="${s.id}" data-type="buy">Beli 1 lot<small>${rp(lv * (1 + SP_BUY))}</small></button><button class="alt" ${h < 1 || noop ? 'disabled' : ''} data-action="stkTrade" data-id="${s.id}" data-type="sell">Jual 1 lot<small>${rp(lv * (1 - SP_SELL))}</small></button></div></div>`;
  }).join('');

  return `<div class="card ${r <= -6 ? 'bad' : ''}"><div class="pt"><b>📊 Bursa Efek Nusantara · IHSG (fiktif)</b><span class="pill">Transaksi ${MK_OPS - M.ops}/${MK_OPS}</span></div>
  <div class="xpriceRow"><div><b style="font-size:1.6rem">${fmtN(ih)}</b><br><small class="${r >= 0 ? 'up' : 'dn'}">${r >= 0 ? '▲' : '▼'} ${Math.abs(r)}% dari kuartal lalu</small></div>${spark(sm.ih, sCol)}</div>
  <div class="xrow xl2"><span>Nilai portofolio negara</span><b>${rp(port)}</b></div>
  <small class="xlt">Dana negara bisa membeli saham untuk dividen tiap kuartal. Semua emiten dan angka di sini fiktif. Transaksi berbagi kuota dengan Bursa Komoditas.</small></div>
 ${needAct ? `${menkeuAdvice('ihsg')}<p class="hint">Tindak lanjut ke Menkeu${S.fxUsed ? ' (sudah dipakai)' : ''}:</p><div class="xchs">${fxOptHTML('ihsg', S.fxUsed)}</div>` : ''}
 <div class="pg">${cards}</div>`;
}
