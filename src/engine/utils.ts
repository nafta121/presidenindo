import { KAS_T, UTG_BASE, UTG_T } from '../data/constants';

export const $ = (id: string): HTMLElement | null => document.getElementById(id);

export const clamp = (v: number): number => Math.max(0, Math.min(100, v));

export const rnd = (a: number, b: number): number => Math.floor(Math.random() * (b - a + 1)) + a;

export const one = <T>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

export function shuffle<T>(input: readonly T[]): T[] {
  const a = [...input];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rnd(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const ESC_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export const esc = (s: unknown): string =>
  String(s).replace(/[&<>"']/g, (c) => ESC_MAP[c] ?? c);

export const fmtN = (n: number): string =>
  String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export function rp(T: number): string {
  const a = Math.abs(T);
  if (a >= 10) return 'Rp ' + fmtN(a) + ' T';
  if (a >= 1) return 'Rp ' + a.toFixed(1).replace('.', ',') + ' T';
  if (a >= 0.001) return 'Rp ' + fmtN(a * 1000) + ' miliar';
  if (a > 0) return 'Rp ' + fmtN(a * 1e6) + ' juta';
  return 'Rp 0';
}

export const kasRp = (v: number): string => rp(v * KAS_T);

export const utgRp = (u: number): string => rp(UTG_BASE + u * UTG_T);

export const idr = (n: number): string => 'Rp ' + fmtN(n);

export const sgn = (v: number): string => (v > 0 ? '+' : v < 0 ? '−' : '');

export function hs(str: string): number {
  let h = 2166136261;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mk(seed: string): () => number {
  let s = hs(seed) || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s >>>= 0;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

export const col = (v: number, inv?: boolean): string => {
  const g = inv ? 100 - v : v;
  return g >= 60 ? 'var(--good)' : g >= 35 ? 'var(--gold)' : 'var(--bad)';
};

export const thk = (q: number): string => 'T' + (Math.floor(q / 4) + 1) + ' K' + ((q % 4) + 1);
