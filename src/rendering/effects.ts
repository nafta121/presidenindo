import { STAT } from '../data/constants';
import { gz, save, store } from '../engine/store';
import { $, rnd, rp } from '../engine/utils';

export function toast(t: string): void {
  try {
    const e = $('toast');
    if (!e) return;
    e.textContent = gz(t);
    e.classList.add('show');
    setTimeout(() => e.classList.remove('show'), 2600);
  } catch {
    // Ignore DOM errors in headless environments
  }
}

export function burst(list: readonly string[], n: number, x: number, y: number): void {
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    s.className = 'pf';
    s.textContent = list[i % list.length];
    s.style.left = x + 'px';
    s.style.top = y + 'px';
    s.style.setProperty('--dx', rnd(-150, 150) + 'px');
    s.style.setProperty('--dy', rnd(-240, -60) + 'px');
    s.style.animationDelay = i * 25 + 'ms';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1500);
  }
}

export function confetti(): void {
  const L = ['🎉', '🇮🇩', '✨', '🎊', '🏆', '🦅'];
  for (let i = 0; i < 60; i++) {
    const s = document.createElement('span');
    s.className = 'cf';
    s.textContent = L[i % L.length];
    s.style.left = rnd(0, 100) + 'vw';
    s.style.fontSize = rnd(14, 30) / 10 + 'rem';
    s.style.animationDuration = rnd(25, 55) / 10 + 's';
    s.style.animationDelay = rnd(0, 15) / 10 + 's';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 7500);
  }
}

export function shake(): void {
  try {
    document.body.classList.add('shake');
    setTimeout(() => document.body.classList.remove('shake'), 550);
  } catch {
    // Ignore
  }
}

export function fx(n: number, ev?: { clientX?: number; clientY?: number } | null): void {
  try {
    const x = (ev && ev.clientX) || innerWidth / 2;
    const y = (ev && ev.clientY) || innerHeight / 2;
    burst(n >= 0 ? ['🎉', '✨', '👏', '🇮🇩'] : ['💥', '😱', '📉', '🔥'], 12, x, y);
    if (n < -4) shake();
  } catch {
    // Ignore
  }
}

export function initBg(): void {
  try {
    const bgEl = $('bg');
    if (!bgEl) return;
    const L = ['🦅', '🌾', '🏝️', '🚩', '🌋', '🐘', '🛵', '🥥', '🌴', '☕'];
    bgEl.innerHTML = L.map(
      (e, i) =>
        `<span style="left:${i * 10 + rnd(0, 6)}%;animation-duration:${rnd(28, 50)}s;animation-delay:-${rnd(0, 40)}s">${e}</span>`,
    ).join('');
  } catch {
    // Ignore
  }
}

export function animMod(): void {
  if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }
  document.querySelectorAll<HTMLElement>('.modal.fresh .cu').forEach((el) => {
    const v = parseFloat(el.dataset.v || '0') || 0;
    const pre = el.dataset.pre || '';
    const d = +(el.dataset.d || '0') || 0;
    const t0 = performance.now();
    const step = (t: number): void => {
      const k = Math.min(1, (t - t0 - d) / 900);
      if (k < 0) {
        el.textContent = pre + rp(0);
        requestAnimationFrame(step);
        return;
      }
      el.textContent = pre + rp(v * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
      else el.textContent = pre + rp(v);
    };
    el.textContent = pre + rp(0);
    requestAnimationFrame(step);
  });

  document.querySelectorAll<HTMLElement>('.modal.fresh .tw').forEach((el) => {
    const full = el.dataset.t || '';
    let i = 0;
    el.textContent = '';
    const iv = setInterval(() => {
      i += 2;
      el.textContent = full.slice(0, i);
      if (i >= full.length) {
        el.textContent = full;
        clearInterval(iv);
      }
    }, 24);
  });
}

export function post(): void {
  try {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() =>
        document.querySelectorAll<HTMLElement>('[data-w]').forEach((e) => {
          e.style.width = (e.dataset.w || '0') + '%';
        }),
      );
    }
  } catch {
    // Ignore
  }
  const S = store.S;
  if (S) {
    STAT.forEach(([k]) => {
      store.LAST[k] = Math.round(S[k]);
    });
    if (S.done && !S.cf) {
      S.cf = 1;
      save();
      setTimeout(() => {
        try {
          confetti();
        } catch {
          // Ignore
        }
      }, 300);
    }
    if (S.over && !S.sh) {
      S.sh = 1;
      save();
      shake();
    }
  }
  try {
    animMod();
  } catch {
    // Ignore
  }
}
