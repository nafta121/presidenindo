import { HAIRC, HJC, SHC, SKIN } from '../data/constants';
import { FEM, OUTFIT, PARTIES } from '../data/parties';
import { mk } from '../engine/utils';
import type { Minister, OutfitRole } from '../types/game';

export interface AvatarOptions {
  salt?: string;
  fem?: boolean;
  bg?: string;
  role?: OutfitRole;
  hijab?: boolean;
  cls?: string;
}

export function isFem(name: string): boolean {
  const t = String(name)
    .replace(/^((Dr|Prof|Ir|H|Hj|Drs|KH|Ust)\.\s*)+/, '')
    .split(/[ ,]/)[0];
  return FEM.has(t);
}

const DEFAULT_BGS = ['#7a1f2b', '#1f4d6b', '#2f6b3a', '#6b4a1f', '#4a2a6b'] as const;
const DEFAULT_ROLES: readonly OutfitRole[] = ['jas', 'batik', 'batik', 'safari', 'jas'];
const BATIK_DOTS: ReadonlyArray<[number, number]> = [
  [28, 84], [40, 90], [52, 84], [64, 90], [76, 84],
  [34, 96], [58, 97], [70, 97], [46, 78], [60, 76],
];

export function avatar(name: string, o?: AvatarOptions): string {
  const opts = o || {};
  const r = mk(name + (opts.salt || ''));
  const pi = <T>(a: readonly T[]): T => a[Math.floor(r() * a.length)];
  const fem = opts.fem !== undefined ? opts.fem : isFem(name);
  const skin = pi(SKIN);
  const hc = pi(HAIRC);
  const bg = opts.bg || pi(DEFAULT_BGS);
  const role = opts.role || pi(DEFAULT_ROLES);
  const sh = pi(SHC);
  const hj = pi(HJC);

  let body = '';
  const bodyBase = 'M8 100 Q10 72 50 68 Q90 72 92 100Z';
  if (role === 'jas' || role === 'pres') {
    body =
      `<path d="${bodyBase}" fill="${fem ? sh : '#22252f'}"/>` +
      (fem
        ? `<path d="M38 70 Q50 84 62 70 L58 68 Q50 76 42 68Z" fill="#fff3e4"/>`
        : `<path d="M41 69 L50 88 L59 69Z" fill="#fff"/><path d="M48 73h4l1.5 15-3.5 4-3.5-4z" fill="#c0262d"/>`);
    if (role === 'pres') {
      body += `<path d="M22 74 L36 70 L84 100 L66 100Z" fill="#e03a3e"/><path d="M36 70 L40 69 L90 100 L84 100Z" fill="#fff"/>`;
    }
  } else if (role === 'batik') {
    body =
      `<path d="${bodyBase}" fill="#6b3f1f"/>` +
      BATIK_DOTS.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="2.2" fill="#e8b84a"/>`).join('') +
      `<path d="M38 69 L50 80 L62 69" stroke="#e8b84a" stroke-width="2" fill="none"/>`;
  } else if (role === 'safari') {
    body = `<path d="${bodyBase}" fill="#b7a06a"/><path d="M40 69 L50 82 L60 69" stroke="#8a7a4a" stroke-width="2" fill="none"/><rect x="24" y="84" width="14" height="10" rx="2" fill="none" stroke="#8a7a4a" stroke-width="1.5"/><rect x="62" y="84" width="14" height="10" rx="2" fill="none" stroke="#8a7a4a" stroke-width="1.5"/>`;
  } else if (role === 'seragam') {
    body = `<path d="${bodyBase}" fill="#4b5a2f"/><rect x="18" y="74" width="14" height="5" rx="1" fill="#e8b84a"/><rect x="68" y="74" width="14" height="5" rx="1" fill="#e8b84a"/><path d="M40 69 L50 80 L60 69" stroke="#2f3a1c" stroke-width="2" fill="none"/><circle cx="34" cy="90" r="3" fill="#e8b84a"/><circle cx="42" cy="92" r="3" fill="#c0262d"/>`;
  } else if (role === 'rompi') {
    body = `<path d="${bodyBase}" fill="#f4f1ea"/><path d="M14 100 Q16 74 40 70 L50 100Z" fill="#f08a1c"/><path d="M86 100 Q84 74 60 70 L50 100Z" fill="#f08a1c"/><path d="M38 70 L50 82 L62 70" stroke="#c96b0c" stroke-width="2" fill="none"/>`;
  } else if (role === 'reporter') {
    body = `<path d="${bodyBase}" fill="#2f5a9a"/><path d="M40 69 L50 80 L60 69" stroke="#fff" stroke-width="2" fill="none"/><rect x="70" y="58" width="6" height="16" rx="3" fill="#222"/><circle cx="73" cy="55" r="5" fill="#999"/>`;
  } else {
    body = `<path d="${bodyBase}" fill="${sh}"/><path d="M40 69 L50 79 L60 69" stroke="rgba(255,255,255,.5)" stroke-width="2" fill="none"/>`;
  }

  const neck = `<rect x="43" y="54" width="14" height="18" rx="5" fill="${skin}"/><path d="M43 66 Q50 72 57 66 L57 70 Q50 76 43 70Z" fill="rgba(0,0,0,.15)"/>`;
  let hairBack = '';
  let hairFront = '';
  const style = Math.floor(r() * 4);
  const hijab = fem && (opts.hijab !== undefined ? opts.hijab : r() < 0.45);

  if (fem) {
    if (hijab) {
      hairBack = `<path d="M22 56 Q16 14 50 13 Q84 14 78 56 Q84 76 72 90 L28 90 Q16 76 22 56Z" fill="${hj}"/>`;
      hairFront = `<path d="M31 36 Q50 18 69 36 Q60 28 50 28 Q40 28 31 36Z" fill="${hj}"/>`;
    } else if (style === 0) {
      hairBack = `<path d="M26 54 Q20 16 50 15 Q80 16 74 54 L78 82 Q50 92 22 82Z" fill="${hc}"/>`;
      hairFront = `<path d="M31 38 Q34 20 50 20 Q66 20 69 38 Q60 28 50 28 Q40 28 31 38Z" fill="${hc}"/>`;
    } else if (style === 1) {
      hairBack = `<circle cx="50" cy="14" r="9" fill="${hc}"/>`;
      hairFront = `<path d="M30 40 Q30 18 50 18 Q70 18 70 40 Q62 28 50 27 Q38 28 30 40Z" fill="${hc}"/>`;
    } else {
      hairBack = `<path d="M28 52 Q24 18 50 17 Q76 18 72 52 Q72 64 66 64 L34 64 Q28 64 28 52Z" fill="${hc}"/>`;
      hairFront = `<path d="M32 36 Q40 22 52 24 Q64 24 68 38 Q58 30 46 31 Q38 32 32 36Z" fill="${hc}"/>`;
    }
  } else {
    if (style === 0) {
      hairFront = `<path d="M31 38 Q31 17 50 17 Q69 17 69 38 Q63 27 50 26 Q37 27 31 38Z" fill="${hc}"/>`;
    } else if (style === 1) {
      hairFront = `<path d="M31 38 Q31 18 52 17 Q70 18 69 38 Q64 28 54 27 Q40 26 31 38Z" fill="${hc}"/><path d="M52 17 Q44 26 31 30" stroke="rgba(255,255,255,.18)" stroke-width="2" fill="none"/>`;
    } else if (style !== 2) {
      hairFront = `<path d="M31 38 Q31 17 50 17 Q69 17 69 38 Q63 27 50 26 Q37 27 31 38Z" fill="#9a9a9a"/>`;
    }
    if (role === 'pres' || role === 'batik' || (role === 'jas' && r() < 0.3)) {
      hairFront = `<path d="M30 33 Q50 12 70 33 L70 37 Q50 27 30 37Z" fill="#151515"/><rect x="30" y="35" width="40" height="3" fill="#2a2a2a"/>`;
    }
    if (role === 'seragam') {
      hairFront = `<path d="M29 34 Q50 10 71 34 L71 38 Q50 28 29 38Z" fill="#3b4724"/><rect x="29" y="36" width="42" height="3" fill="#e8b84a"/>`;
    }
  }

  const ears = hijab ? '' : `<ellipse cx="31" cy="44" rx="3" ry="5" fill="${skin}"/><ellipse cx="69" cy="44" rx="3" ry="5" fill="${skin}"/>`;
  const head = `<ellipse cx="50" cy="43" rx="19" ry="22" fill="${skin}"/>`;
  const brow = hijab || fem ? '#2a1d17' : hc;
  const face =
    `<path d="M36 38 Q41 35 46 38" stroke="${brow}" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M54 38 Q59 35 64 38" stroke="${brow}" stroke-width="2" fill="none" stroke-linecap="round"/>` +
    `<ellipse cx="41" cy="44" rx="2.2" ry="2.7" fill="#1a1a1a"/><ellipse cx="59" cy="44" rx="2.2" ry="2.7" fill="#1a1a1a"/>` +
    `<circle cx="41.8" cy="43" r=".8" fill="#fff"/><circle cx="59.8" cy="43" r=".8" fill="#fff"/>` +
    `<path d="M50 46 Q47 52 51 53" stroke="rgba(0,0,0,.25)" stroke-width="1.6" fill="none" stroke-linecap="round"/>` +
    `<path d="M43 58 Q50 63 57 58" stroke="${fem ? '#b3262d' : '#7a2a2a'}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;

  let acc = '';
  if (!fem && r() < 0.3) {
    acc += `<path d="M42 56 Q50 52 58 56 Q50 59 42 56Z" fill="${hc}"/>`;
  }
  if (r() < 0.3) {
    acc += `<circle cx="41" cy="44" r="6.5" fill="none" stroke="#222" stroke-width="1.6"/><circle cx="59" cy="44" r="6.5" fill="none" stroke="#222" stroke-width="1.6"/><path d="M47.5 44h5" stroke="#222" stroke-width="1.6"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" class="av${opts.cls ? ' ' + opts.cls : ''}" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" fill="${bg}"/><circle cx="50" cy="40" r="46" fill="rgba(255,255,255,.12)"/>${hairBack}${body}${neck}${ears}${head}${hairFront}${face}${acc}</svg>`;
}

export const mAv = (m: Minister, cls?: string): string =>
  avatar(m.nm, { role: OUTFIT[m.k] || 'jas', bg: m.p >= 0 ? PARTIES[m.p].c : '#555', cls });

export const aprAv = (nm: string, bg?: string): string =>
  avatar(nm, { role: 'seragam', bg: bg || '#3a4a2a', cls: 's' });
