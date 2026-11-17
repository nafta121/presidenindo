import { SEATS, STAT, SUP } from '../data/constants';
import { PRG } from '../data/programs';
import { coalSeats, JANJI } from '../data/promises';
import { gaya, summary } from '../engine/stats';
import { presName, render, store } from '../engine/store';
import { kasRp } from '../engine/utils';
import { avatar } from './avatar';
import { toast } from './effects';

let AVIMG: HTMLImageElement | null = null;

export function shareText(): string {
  const S = store.S!;
  const sm = summary();
  return S.over
    ? `Aku gagal jadi Presiden RI: "${sm.t}" di kuartal ${S.over.q + 1}/20. Berani coba? presidenri.vercel.app`
    : `Aku tamat jadi Presiden RI: "${sm.t}", skor ${sm.sc}/100, janji ${sm.ok}/3, pemilu ${S.pemilu && S.pemilu.win ? 'menang' : 'kalah'}. Coba juga! presidenri.vercel.app`;
}

export function share(): void {
  const t = shareText();
  try {
    void navigator.clipboard.writeText(t);
    toast('Hasil disalin');
  } catch {
    toast(t);
  }
}

export function rr(x: CanvasRenderingContext2D, a: number, b: number, w: number, h: number, r: number): void {
  x.beginPath();
  if (typeof x.roundRect === 'function') x.roundRect(a, b, w, h, r);
  else x.rect(a, b, w, h);
}

export function cardCanvas(): HTMLCanvasElement {
  const S = store.S!;
  const W = 1080;
  const H = 1350;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d');
  if (!x) return c;

  const sm = summary();
  const g = x.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#4a1520');
  g.addColorStop(1, '#1a0b0f');
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);
  x.fillStyle = '#e03a3e';
  x.fillRect(0, 0, W, 26);
  x.fillStyle = '#fff';
  x.fillRect(0, 26, W, 26);
  x.textAlign = 'center';
  x.fillStyle = '#d2b3a8';
  x.font = '600 34px system-ui,sans-serif';
  x.fillText('PRESIDEN RI · SIMULASI 5 TAHUN', W / 2, 112);

  if (AVIMG) {
    x.save();
    rr(x, 200, 150, 150, 150, 28);
    x.clip();
    x.drawImage(AVIMG, 200, 150, 150, 150);
    x.restore();
    x.font = '130px system-ui,sans-serif';
    x.fillText(sm.i, 740, 275);
  } else {
    x.font = '150px system-ui,sans-serif';
    x.fillText(sm.i, W / 2, 285);
  }

  x.fillStyle = '#fff';
  x.font = '800 68px system-ui,sans-serif';
  x.fillText(sm.t, W / 2, 380);
  x.fillStyle = '#f2c14e';
  x.font = '600 38px system-ui,sans-serif';
  x.fillText(presName(), W / 2, 435);

  if (sm.sc !== null) {
    x.fillStyle = '#fff';
    x.font = '800 120px system-ui,sans-serif';
    x.fillText(String(sm.sc), W / 2 - 30, 565);
    x.fillStyle = '#d2b3a8';
    x.font = '600 40px system-ui,sans-serif';
    x.textAlign = 'left';
    x.fillText('/100', W / 2 + 75, 565);
    x.textAlign = 'center';
  } else {
    x.fillStyle = '#ff5d5d';
    x.font = '700 44px system-ui,sans-serif';
    x.fillText(sm.sub, W / 2, 545);
  }

  x.textAlign = 'left';
  STAT.forEach(([k, ic, n], i) => {
    const col2 = i % 2;
    const row = Math.floor(i / 2);
    const bx = 70 + col2 * 500;
    const by = 640 + row * 100;
    const v = Math.round(S[k]);
    const inv = k === 'hrg';
    const gd = inv ? 100 - v : v;
    x.fillStyle = '#fff3e4';
    x.font = '600 30px system-ui,sans-serif';
    x.fillText(ic + ' ' + n.replace('Kepercayaan ', '').replace('Tekanan ', ''), bx, by);
    x.textAlign = 'right';
    x.fillText(k === 'kas' ? kasRp(S.kas) : String(v), bx + 440, by);
    x.textAlign = 'left';
    x.fillStyle = '#12070a';
    rr(x, bx, by + 14, 440, 18, 9);
    x.fill();
    x.fillStyle = gd >= 60 ? '#3ecf8e' : gd >= 35 ? '#f2c14e' : '#ff5d5d';
    rr(x, bx, by + 14, Math.max(8, (440 * v) / 100), 18, 9);
    x.fill();
  });

  let y = 960;
  x.fillStyle = '#fff';
  x.font = '700 34px system-ui,sans-serif';
  if (!S.over) {
    const pm = S.pemilu
      ? S.pemilu.win
        ? '🎉 Penerus menang Pemilu (' + S.pemilu.pct + '%)'
        : '😔 Penerus kalah Pemilu (' + S.pemilu.pct + '%)'
      : '';
    x.fillText('Janji Kampanye (' + sm.ok + '/3)', 70, y);
    y += 50;
    x.font = '500 30px system-ui,sans-serif';
    S.janji.forEach((id) => {
      const j = JANJI.find((q) => q.id === id)!;
      const ok = j.ok(S);
      x.fillStyle = ok ? '#3ecf8e' : '#ff5d5d';
      x.fillText((ok ? '✓ ' : '✗ ') + j.n, 70, y);
      y += 46;
    });
    x.fillStyle = '#fff3e4';
    x.fillText(pm, 70, y + 14);
    y += 56;
    x.fillStyle = '#d2b3a8';
    x.font = '500 26px system-ui,sans-serif';
    x.fillText(
      'Integritas ' +
        Math.round(S.ipk) +
        ' · Gaya ' +
        gaya()[0] +
        ' · Program selesai ' +
        sm.pd +
        '/' +
        PRG.length +
        ' · Koalisi ' +
        Math.round((coalSeats(S) / SEATS) * 100) +
        '% kursi',
      70,
      y + 10,
    );
  } else {
    x.fillText('Penyebab', 70, y);
    y += 50;
    x.font = '500 30px system-ui,sans-serif';
    x.fillStyle = '#fff3e4';
    const words = S.over.d.split(' ');
    let line = '';
    words.forEach((w) => {
      if (x.measureText(line + w).width > 930) {
        x.fillText(line, 70, y);
        y += 44;
        line = '';
      }
      line += w + ' ';
    });
    x.fillText(line, 70, y);
  }

  x.textAlign = 'center';
  x.fillStyle = '#f2c14e';
  x.font = '700 36px system-ui,sans-serif';
  x.fillText(SUP, W / 2, 1250);
  x.fillStyle = '#d2b3a8';
  x.font = '500 26px system-ui,sans-serif';
  x.fillText('presidenri.vercel.app · Game fiksi, semua nama & kasus rekaan', W / 2, 1300);
  return c;
}

export function openCard(): void {
  const S = store.S;
  if (!S) return;
  const go2 = (): void => {
    try {
      store.CARD = cardCanvas().toDataURL('image/png');
    } catch {
      toast('Gagal membuat kartu');
      return;
    }
    render();
  };
  try {
    const im = new Image();
    im.onload = () => {
      AVIMG = im;
      go2();
    };
    im.onerror = () => {
      AVIMG = null;
      go2();
    };
    im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(avatar(S.nama, { role: 'pres', fem: S.gen === 'p', bg: '#8a1c26' }));
  } catch {
    AVIMG = null;
    go2();
  }
}

export function closeCard(): void {
  store.CARD = null;
  render();
}

export function cardBlob(cb: (blob: Blob | null) => void): void {
  try {
    cardCanvas().toBlob(cb, 'image/png');
  } catch {
    toast('Gagal');
  }
}

export function dlCard(): void {
  cardBlob((b) => {
    if (!b) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = 'presiden-ri-hasil.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
}

export function shCard(): void {
  cardBlob(async (b) => {
    if (!b) return;
    try {
      const f = new File([b], 'presiden-ri-hasil.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [f] })) {
        await navigator.share({ files: [f], text: shareText() });
      } else if (navigator.share) {
        await navigator.share({ text: shareText() });
      } else {
        await navigator.clipboard.writeText(shareText());
        toast('Teks disalin. Simpan PNG lalu bagikan.');
      }
    } catch {
      // Ignore user cancellation
    }
  });
}

export function cardModal(): string {
  return `<div class="modal"><div class="card"><img src="${store.CARD}" alt="Kartu hasil" style="width:100%;border-radius:.6rem"><p class="hint">Tekan lama gambar untuk menyimpan, atau pakai tombol di bawah.</p>
 <button data-action="dlCard">⬇️ Simpan PNG</button><button class="alt" data-action="shCard">📤 Bagikan</button><button class="alt" data-action="closeCard">Tutup</button></div></div>`;
}
