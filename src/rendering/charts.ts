import { col } from '../engine/utils';

export function spark(h: readonly number[], strokeCol: string): string {
  if (h.length < 2) return '';
  const mn = Math.min(...h);
  const mx = Math.max(...h);
  const w = 80;
  const hh = 26;
  const pts = h
    .map(
      (v, i) =>
        ((i / (h.length - 1)) * w).toFixed(1) +
        ',' +
        (hh - (mx === mn ? hh / 2 : ((v - mn) / (mx - mn)) * (hh - 4) - 2)).toFixed(1),
    )
    .join(' ');
  return `<svg class="xsp" viewBox="0 0 ${w} ${hh}" width="${w}" height="${hh}"><polyline points="${pts}" fill="none" stroke="${strokeCol}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}

export const barH = (v: number, inv?: boolean): string =>
  `<div class="bar"><div style="width:${Math.round(v)}%;background:${col(v, inv)}"></div></div>`;
