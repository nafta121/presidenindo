import type { TabKey } from '../../types/game';
import { burPanel, kursPanel, sahPanel } from './bursaPanels';
import { evPanel } from './evPanel';
import { kasPanel } from './kasusPanel';
import { angPanel, polPanel, prgPanel } from './kelolaPanels';
import { agnPanel, janjiPanel, kerPanel, medPanel, petPanel } from './lainnyaPanels';
import { aprPanel, hkmPanel, kabPanel, mhkPanel, parPanel } from './politikPanels';

export const PANELS: Record<TabKey, () => string> = {
  bur: burPanel,
  sah: sahPanel,
  kurs: kursPanel,
  med: medPanel,
  ker: kerPanel,
  ev: evPanel,
  pol: polPanel,
  prg: prgPanel,
  ang: angPanel,
  kab: kabPanel,
  par: parPanel,
  kas: kasPanel,
  pet: petPanel,
  hkm: hkmPanel,
  mhk: mhkPanel,
  apr: aprPanel,
  agn: agnPanel,
  jan: janjiPanel,
};
