import { KEY } from '../data/constants';
import type { GameState, GenderKey, LatarKey, StatKey, TabKey } from '../types/game';

export type CheatTabKey = 'stat' | 'kuartal' | 'politik' | 'save';

export interface AppStore {
  S: GameState | null;
  tab: TabKey;
  sel: string[];
  nm: string;
  gen: GenderKey;
  dif: number;
  latar: LatarKey;
  LAST: Partial<Record<StatKey, number>>;
  CARD: string | null;
  GUIDE: number | null;
  OVK: string;
  KFILT: 'dn' | 'ln' | 'pv';
  BTAB: 'pasar' | 'dagang' | 'riwayat';
  PSEL: string | null;
  usedNames: Set<string>;
  cheatOpen: boolean;
  cheatMin: boolean;
  cheatTab: CheatTabKey;
  godMode: boolean;
  avatarTaps: number[];
}

export const store: AppStore = {
  S: null,
  tab: 'ev',
  sel: [],
  nm: '',
  gen: 'l',
  dif: 1,
  latar: 'gubernur',
  LAST: {},
  CARD: null,
  GUIDE: null,
  OVK: '',
  KFILT: 'dn',
  BTAB: 'pasar',
  PSEL: null,
  usedNames: new Set<string>(),
  cheatOpen: false,
  cheatMin: false,
  cheatTab: 'stat',
  godMode: false,
  avatarTaps: [],
};

let renderCallback: (() => void) | null = null;

export function registerRenderer(fn: () => void): void {
  renderCallback = fn;
}

export function render(): void {
  if (renderCallback) {
    renderCallback();
  }
}

export function save(): void {
  try {
    if (store.S) {
      localStorage.setItem(KEY, JSON.stringify(store.S));
    }
  } catch {
    // Ignore storage quota or private mode errors
  }
}

export function load(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as GameState) : null;
  } catch {
    return null;
  }
}

export const PB = (): string => (store.S && store.S.gen === 'p' ? 'Bu' : 'Pak');
export const PBF = (): string => (store.S && store.S.gen === 'p' ? 'Ibu' : 'Bapak');

export function gz(s: unknown): string {
  return String(s).replace(/Pak\/Bu/g, PB()).replace(/Bapak\/Ibu/g, PBF());
}

export function presName(): string {
  const nama = store.S ? store.S.nama : store.nm || 'Presiden';
  return /^presiden\b/i.test(nama) ? nama : 'Presiden ' + nama;
}
