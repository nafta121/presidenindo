import { kasRp, utgRp } from '../engine/utils';
import type { GameState, PromiseDef } from '../types/game';
import { SEATS } from './constants';
import { PARTIES } from './parties';
import { PRG } from './programs';

export function coalSeats(s: Pick<GameState, 'par'>): number {
  return s.par.reduce((a, p, i) => a + (p.k ? PARTIES[i].seat : 0), 0);
}

export function progDone(s: Pick<GameState, 'prg'>): number {
  return PRG.filter((p) => s.prg[p.id] >= 100).length;
}

export const JANJI: PromiseDef[] = [
  { id: 'j1', ic: '🍚', n: 'Harga pangan terkendali', d: 'Tekanan harga ≤ 45 di akhir masa jabatan', ok: (s) => s.hrg <= 45, p: (s) => 'Sekarang ' + Math.round(s.hrg) },
  { id: 'j2', ic: '📈', n: 'Ekonomi tumbuh kuat', d: 'Ekonomi ≥ 65', ok: (s) => s.eko >= 65, p: (s) => 'Sekarang ' + Math.round(s.eko) },
  { id: 'j3', ic: '📜', n: 'Utang terkendali', d: 'Total utang ≤ Rp 8.300 T', ok: (s) => s.utg <= 30, p: (s) => 'Sekarang ' + utgRp(s.utg) },
  { id: 'j4', ic: '🙂', n: 'Rakyat sejahtera', d: 'Kepercayaan rakyat ≥ 65', ok: (s) => s.rak >= 65, p: (s) => 'Sekarang ' + Math.round(s.rak) },
  { id: 'j5', ic: '🛡️', n: 'Negara aman dan stabil', d: 'Stabilitas ≥ 65', ok: (s) => s.stb >= 65, p: (s) => 'Sekarang ' + Math.round(s.stb) },
  { id: 'j6', ic: '🍱', n: 'Makan bergizi gratis', d: 'Jalankan kebijakan MBG minimal 3 kali', ok: (s) => (s.cnt.mbg || 0) >= 3, p: (s) => (s.cnt.mbg || 0) + '/3 kali' },
  { id: 'j7', ic: '⛏️', n: 'Hilirisasi industri', d: 'Jalankan hilirisasi minimal 3 kali', ok: (s) => (s.cnt.hilir || 0) >= 3, p: (s) => (s.cnt.hilir || 0) + '/3 kali' },
  { id: 'j8', ic: '⚖️', n: 'Pemerintahan bersih', d: 'Berantas korupsi minimal 3 kali', ok: (s) => (s.cnt.korupsi || 0) >= 3, p: (s) => (s.cnt.korupsi || 0) + '/3 kali' },
  { id: 'j9', ic: '🏦', n: 'Kas negara sehat', d: 'Kas negara ≥ Rp 440 T', ok: (s) => s.kas >= 55, p: (s) => 'Sekarang ' + kasRp(s.kas) },
  { id: 'j10', ic: '🧼', n: 'Indeks antikorupsi naik', d: 'Integritas ≥ 55', ok: (s) => s.ipk >= 55, p: (s) => 'Sekarang ' + Math.round(s.ipk) },
  { id: 'j11', ic: '🏗️', n: 'Tuntaskan program nasional', d: 'Selesaikan minimal 1 program pemerintah (100%)', ok: (s) => PRG.filter((p) => s.prg[p.id] >= 100).length >= 1, p: (s) => PRG.filter((p) => s.prg[p.id] >= 100).length + '/1 program' },
  { id: 'j12', ic: '🗳️', n: 'Penerus menang pemilu', d: 'Calon koalisimu menang Pemilu Serentak', ok: (s) => !!(s.pemilu && s.pemilu.win), p: (s) => (s.pemilu ? 'Suara ' + s.pemilu.pct + '%' : 'Belum digelar') },
  { id: 'j13', ic: '🤝', n: 'Koalisi gemuk', d: 'Kursi koalisi di DPR ≥ 65%', ok: (s) => coalSeats(s) / SEATS >= 0.65, p: (s) => Math.round((coalSeats(s) / SEATS) * 100) + '% kursi' },
];
