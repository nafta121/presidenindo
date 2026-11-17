import type { ProgramDef } from '../types/game';

export const PRG: ProgramDef[] = [
  { id: 'gizi', ic: '🍱', n: 'Makan Bergizi Sekolah', d: 'Jangkauan sekolah penerima di seluruh nusantara.', cost: 6, gain: 9, role: 'kes', mk: 'rak', sg: 1, y: { rak: 0.5 } },
  { id: 'tol', ic: '🛣️', n: 'Tol & Pelabuhan Trans-Nusantara', d: 'Menyambung Sumatera hingga Papua.', cost: 8, gain: 8, role: 'eko', mk: 'eko', sg: 1, y: { eko: 0.6 } },
  { id: 'pangan', ic: '🌾', n: 'Lumbung Pangan Nasional', d: 'Cetak sawah, irigasi, dan gudang cadangan.', cost: 7, gain: 8, role: 'tan', mk: 'hrg', sg: -1, y: { hrg: -0.8 } },
  { id: 'energi', ic: '⚡', n: 'Transisi Energi Bersih', d: 'Surya, panas bumi, dan kendaraan listrik.', cost: 8, gain: 8, role: 'esd', mk: 'eko', sg: 1, y: { eko: 0.4, kas: 0.3 } },
  { id: 'sehat', ic: '🏥', n: 'Puskesmas & RS Merata', d: 'Fasilitas kesehatan hingga pelosok.', cost: 6, gain: 9, role: 'kes', mk: 'rak', sg: 1, y: { rak: 0.5, stb: 0.2 } },
  { id: 'kota', ic: '🏙️', n: 'Kota Pradana (Ibu Kota Baru)', d: 'Kota administrasi baru. Raksasa anggaran.', cost: 10, gain: 7, role: 'eko', mk: 'eko', sg: 1, y: { eko: 0.5, stb: 0.2 } },
  { id: 'digital', ic: '📶', n: 'Internet Desa & Digitalisasi', d: 'Sinyal dan layanan publik online sampai desa.', cost: 5, gain: 10, role: 'pdd', mk: 'eko', sg: 1, y: { eko: 0.4, rak: 0.2 } },
  { id: 'rumah', ic: '🏠', n: '3 Juta Rumah Rakyat', d: 'Rumah layak huni untuk keluarga muda.', cost: 7, gain: 8, role: 'sos', mk: 'rak', sg: 1, y: { rak: 0.6 } },
  // v3.6 additions
  { id: 'swasembada', ic: '🌽', n: 'Swasembada Jagung & Kedelai', d: 'Kurangi impor pakan dan tahu-tempe.', cost: 7, gain: 8, role: 'tan', mk: 'hrg', sg: -1, y: { hrg: -0.6 } },
  { id: 'bendungan', ic: '💧', n: 'Bendungan & Irigasi Nasional', d: 'Air untuk sawah dan listrik pedesaan.', cost: 8, gain: 8, role: 'eko', mk: 'eko', sg: 1, y: { eko: 0.4, hrg: -0.3 } },
  { id: 'sekolahrakyat', ic: '🏫', n: 'Sekolah Rakyat & Sekolah Unggul', d: 'Sekolah berasrama gratis untuk anak keluarga miskin.', cost: 6, gain: 9, role: 'pdd', mk: 'rak', sg: 1, y: { rak: 0.4 } },
  { id: 'kereta', ic: '🚆', n: 'Kereta Cepat & KRL Antarkota', d: 'Jakarta-Surabaya makin dekat.', cost: 10, gain: 7, role: 'eko', mk: 'eko', sg: 1, y: { eko: 0.5, rak: 0.1 } },
  { id: 'tanggul', ic: '🌊', n: 'Tanggul Laut Raksasa Pantura', d: 'Lindungi pesisir dari banjir rob.', cost: 10, gain: 6, role: 'eko', mk: 'stb', sg: 1, y: { stb: 0.3, eko: 0.3 } },
  { id: 'satelit', ic: '🛰️', n: 'Satelit & Pusat Data Nasional', d: 'Data dan layanan digital dalam negeri.', cost: 6, gain: 9, role: 'pdd', mk: 'eko', sg: 1, y: { eko: 0.4, stb: 0.1 } },
  { id: 'alutsista', ic: '🛡️', n: 'Modernisasi Alutsista Nusantara', d: 'Kapal, pesawat, dan radar pertahanan.', cost: 9, gain: 7, role: 'han', mk: 'stb', sg: 1, y: { stb: 0.5 } },
  { id: 'wisataprg', ic: '🏝️', n: 'Destinasi Super Prioritas', d: 'Danau Toba, Labuan Bajo, Mandalika, dan kawan-kawan.', cost: 5, gain: 10, role: 'eko', mk: 'eko', sg: 1, y: { eko: 0.3, kas: 0.3 } },
  { id: 'nelayan', ic: '🐟', n: 'Kampung Nelayan Modern', d: 'Cold storage, kapal, dan pelabuhan ikan.', cost: 5, gain: 9, role: 'tan', mk: 'rak', sg: 1, y: { rak: 0.3, eko: 0.2 } },
  { id: 'baterai', ic: '🔋', n: 'Industri Baterai & Mobil Listrik', d: 'Dari tambang nikel sampai pabrik baterai.', cost: 9, gain: 7, role: 'esd', mk: 'eko', sg: 1, y: { eko: 0.5, kas: 0.2 } },
  { id: 'airbersih', ic: '🚰', n: 'Air Bersih & Sanitasi Desa', d: 'Kran air layak sampai pelosok.', cost: 5, gain: 10, role: 'kes', mk: 'rak', sg: 1, y: { rak: 0.4 } },
];

export const MS = [25, 50, 75, 100] as const;

export const MSV: Record<number, number> = {
  25: 2,
  50: 3,
  75: 3,
  100: 6,
};
