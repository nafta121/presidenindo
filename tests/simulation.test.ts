import { beforeEach, describe, expect, it } from 'vitest';
import { GUIDE_KEY, KEY, SUBN } from '../src/data/constants';
import { spawnCase } from '../src/engine/corruption';
import { cont, reset } from '../src/engine/lifecycle';
import { store } from '../src/engine/store';
import { bootApp } from '../src/main';
import { cardCanvas } from '../src/rendering/shareCard';
import type { TabKey } from '../src/types/game';
import { renderApp } from '../src/ui/render';

function clickSelector(selector: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(selector);
  expect(el, `Expected element matching ${selector}`).not.toBeNull();
  el!.click();
  return el!;
}

describe('Full DOM, Event Delegation, All 18 Panels, & 20-Quarter Playthrough', () => {
  beforeEach(() => {
    window.scrollTo = () => {};
    localStorage.clear();
    document.body.innerHTML = '<div class="bg" id="bg"></div><div id="app"></div><div id="toast"></div>';
    store.S = null;
    store.sel = [];
    store.nm = '';
    store.gen = 'l';
    store.dif = 1;
    store.latar = 'gubernur';
    store.LAST = {};
    store.CARD = null;
    store.GUIDE = null;
    store.OVK = '';
    store.KFILT = 'dn';
    store.BTAB = 'pasar';
    store.PSEL = null;
    bootApp();
  });

  it('opens 19-page Guide on first visit, navigates pages, and initializes Start Screen with disabled Lantik Saya until 3 promises selected', () => {
    expect(store.GUIDE).toBe(0);
    expect(document.querySelector('.xguide')?.textContent).toContain('CARA MAIN · 1/19');

    // Navigate forward and back
    clickSelector('[data-action="guideNav"][data-dir="1"]');
    expect(store.GUIDE).toBe(1);
    expect(document.querySelector('.xguide')?.textContent).toContain('CARA MAIN · 2/19');

    clickSelector('[data-action="closeGuide"]');
    expect(store.GUIDE).toBeNull();
    expect(localStorage.getItem(GUIDE_KEY)).toBe('1');

    // Verify Lantik Saya button is disabled with < 3 promises, and clicking disabled button does nothing
    const lantikBtn = document.querySelector<HTMLButtonElement>('[data-action="newGame"]')!;
    expect(lantikBtn.disabled).toBe(true);
    lantikBtn.click();
    expect(store.S).toBeNull();

    // Set female gender, name, background, and 3 promises via DOM delegation
    const nmInput = document.querySelector<HTMLInputElement>('#nm')!;
    nmInput.value = 'Kartini';
    nmInput.dispatchEvent(new Event('input', { bubbles: true }));
    expect(store.nm).toBe('Kartini');

    clickSelector('[data-action="setGen"][data-gen="p"]');
    clickSelector('[data-action="setDif"][data-dif="0"]');
    clickSelector('[data-action="setLatar"][data-latar="akademisi"]');
    clickSelector('[data-action="tog"][data-id="j1"]');
    clickSelector('[data-action="tog"][data-id="j2"]');
    clickSelector('[data-action="tog"][data-id="j4"]');

    const enabledBtn = document.querySelector<HTMLButtonElement>('[data-action="newGame"]')!;
    expect(enabledBtn.disabled).toBe(false);
    enabledBtn.click();

    // Game starts with Oath modal & female greeting replacement ("Ibu Presiden")
    expect(store.S).not.toBeNull();
    expect(store.S!.oath).toBe(true);
    expect(document.querySelector('.xoath')?.textContent).toContain('SURAT SUMPAH / JANJI PRESIDEN');
    expect(document.querySelector('.xoath')?.textContent).toContain('Ibu Presiden Republik Indonesia');

    clickSelector('[data-action="takeOath"][data-kind="sumpah"]');
    expect(store.S!.oath).toBe(false);

    // Urgent event Setneg bubble appears with "Bu Presiden" via gz() & typewriter data-t
    expect(store.S!.alert).toBe(true);
    expect(document.querySelector<HTMLElement>('.xalert .tw')?.dataset.t).toContain('Bu Presiden');

    clickSelector('[data-action="ackAlert"]');
    expect(store.S!.alert).toBe(false);
  });

  it('renders all 18 sub-panels cleanly and handles market, trade, cabinet, law, map, trip, Menkeu, and corruption interactions', () => {
    clickSelector('[data-action="closeGuide"]');
    clickSelector('[data-action="tog"][data-id="j1"]');
    clickSelector('[data-action="tog"][data-id="j6"]');
    clickSelector('[data-action="tog"][data-id="j9"]');
    clickSelector('[data-action="newGame"]');
    clickSelector('[data-action="takeOath"][data-kind="janji"]');
    clickSelector('[data-action="ackAlert"]');

    // Verify Q1 initial Kas math: Normal (64) + Gubernur (+0 kas) -> prev=64 -> Awal Tahun Anggaran (+3 kas = +24T) -> 67 (Rp 536 T)
    expect(store.S!.kas).toBe(67);
    expect(document.querySelector('.xhud')?.textContent).toContain('Rp536T');
    expect(document.querySelector('.xfxl')?.textContent).toContain('IHSG');

    // Visit every single one of the 18 tabs and assert non-empty rendering
    const allTabs = Object.keys(SUBN) as TabKey[];
    expect(allTabs).toHaveLength(18);
    for (const t of allTabs) {
      store.tab = t;
      renderApp();
      const app = document.getElementById('app')!;
      expect(app.innerHTML.length, `Panel ${t} rendered empty`).toBeGreaterThan(200);
    }

    // TestStock buy + Commodity buy + Cuan tab (verifies no crash when stock log entry is rendered in Cuan!)
    clickSelector('[data-action="go"][data-nav="bur"]'); // opens 'sah'
    clickSelector('[data-action="stkTrade"][data-id="BNPK"][data-type="buy"]');
    expect(store.S!.sm.hold.BNPK).toBe(1);

    clickSelector('[data-action="goSub"][data-tab="bur"]');
    clickSelector('[data-action="mkTrade"][data-id="beras"][data-type="buy"]');
    expect(store.S!.mk.st.beras).toBe(1);

    clickSelector('[data-action="opPasar"]');
    expect(store.S!.mk.st.beras).toBe(0);

    clickSelector('[data-action="setBtab"][data-btab="riwayat"]');
    expect(document.getElementById('app')!.textContent).toContain('saham BNPK');

    // Test Export-Import quota (max 3 changes, reversible!)
    clickSelector('[data-action="setBtab"][data-btab="dagang"]');
    clickSelector('[data-action="tdSet"][data-id="sawit"][data-kind="ex"][data-val="pajak"]');
    clickSelector('[data-action="tdSet"][data-id="nikel"][data-kind="ex"][data-val="pajak"]');
    clickSelector('[data-action="tdSet"][data-id="batubara"][data-kind="ex"][data-val="pajak"]');
    expect(store.S!.td.chg).toBe(3);
    // 4th change blocked
    clickSelector('[data-action="tdSet"][data-id="kopi"][data-kind="ex"][data-val="pajak"]');
    expect(store.S!.td.pol.kopi.ex).toBe('buka');
    expect(store.S!.td.msg).toContain('habis');
    // Reverting sawit back to 'buka' frees 1 quota!
    clickSelector('[data-action="tdSet"][data-id="sawit"][data-kind="ex"][data-val="buka"]');
    expect(store.S!.td.chg).toBe(2);

    // Test Menkeu cross-ministry review & rejection flow
    store.S!.kas = 20; // low kas triggers Menkeu rejection on expensive policy (mbg costs 11)
    clickSelector('[data-action="go"][data-nav="kel"]');
    clickSelector('[data-action="openProp"][data-kind="pol"][data-id="mbg"]');
    expect(store.S!.prop).not.toBeNull();
    clickSelector('[data-action="submitProp"]');
    expect(store.S!.prop?.st).toBe('reject');
    clickSelector('[data-action="propChoice"][data-choice="ikuti"]');
    expect(store.S!.prop).toBeNull();
    store.S!.kas = 70;

    // Test Cabinet profile & reshuffle
    clickSelector('[data-action="go"][data-nav="pel"]');
    clickSelector('[data-action="openProf"][data-idx="0"]');
    expect(document.querySelector('.xprof')).not.toBeNull();
    clickSelector('[data-action="profResh"][data-idx="0"]');
    expect(store.S!.prop?.kind).toBe('resh');
    clickSelector('[data-action="chooseResh"][data-idx="1"]');
    expect(store.S!.usedResh).toBe(true);

    // Test DPR Law Perppu
    clickSelector('[data-action="goSub"][data-tab="hkm"]');
    clickSelector('[data-action="openLaw"][data-id="pajak"]');
    clickSelector('[data-action="pickLawOpt"][data-opt="b"]');
    clickSelector('[data-action="lawSubmit"][data-mode="perppu"]');
    expect(store.S!.perppu?.law).toBe('pajak');
    clickSelector('[data-action="closeLaw"]');

    // Test TNI/Polri action
    clickSelector('[data-action="goSub"][data-tab="apr"]');
    clickSelector('[data-action="aprDo"][data-branch="pol"][data-id="ref"]');
    expect(store.S!.ap.act).toBe(1);

    // Test 38-Province Map & State Trip
    clickSelector('[data-action="go"][data-nav="lain"]');
    clickSelector('[data-action="selectPv"][data-id="aceh"]');
    expect(store.PSEL).toBe('aceh');
    clickSelector('[data-action="pvVisit"][data-id="aceh"]');
    expect(store.S!.trip?.id).toBe('pv_aceh');
    clickSelector('[data-action="goTrip"]');
    expect(store.S!.tripRep).not.toBeNull();
    clickSelector('[data-action="closeTripRep"]');

    // Test Corruption case decision
    const c = spawnCase(null);
    c.stage = 1;
    c.pend = true;
    clickSelector('[data-action="go"][data-nav="kas"]');
    clickSelector(`[data-action="decideCase"][data-id="${c.id}"][data-dec="dukung"]`);
    expect(c.dec).toBe('dukung');
  });

  it('migrates legacy v3.0 save files seamlessly via cont() and persists to presiden_ri_v3', () => {
    const legacySave = {
      nama: 'Soekarno Hatta Fiktif',
      lat: 'aktivis',
      q: 4,
      rak: 62,
      eko: 58,
      kas: 54,
      hrg: 44,
      stb: 61,
      kol: 60,
      utg: 22,
      ipk: 50,
      par: Array.from({ length: 8 }, (_, i) => ({ k: i < 4, s: 60 })),
      men: [],
      janji: ['j1', 'j2', 'j4'],
      cnt: {},
      last: {},
      cid: 0,
      cases: [],
      prg: { gizi: 30 },
      slots: 2,
      rep: {},
      pemilu: null,
      rb: { pajak: 0, pnbp: 0, bea: 0, hemat: 0 },
      notes: [],
      kasQ: 54,
      usedPol: false,
      usedResh: false,
      usedDip: false,
      diff: 1,
      log: ['Kuartal lama'],
      modal: null,
      deck: Array.from({ length: 20 }, (_, i) => i),
      res: null,
      over: null,
      done: false,
      alert: true,
      prev: { rak: 62, eko: 58, kas: 54, hrg: 44, stb: 61, kol: 60 },
      stat: { dukung: 0, lindungi: 0, diam: 0, dipl: 0, otor: 0 },
    };
    clickSelector('[data-action="closeGuide"]');
    localStorage.setItem(KEY, JSON.stringify(legacySave));

    cont();
    expect(store.S).not.toBeNull();
    expect(store.S!.men).toHaveLength(11);
    expect(Object.keys(store.S!.pv)).toHaveLength(38);
    expect(Object.keys(store.S!.prg)).toHaveLength(19);
    expect(store.S!.prg.gizi).toBe(30);
    expect(store.S!.prg.airbersih).toBe(0);
    expect(store.S!.sm.usd).toBe(16200);
    expect(store.S!.td.pol.nikel.ex).toBe('buka');
    expect(store.S!.led).toBeDefined();
  });

  it('completes a full 20-quarter presidential term through Pilkada I, Pilkada II, Pemilu, End Screen, and 1080x1350 Share Card', () => {
    clickSelector('[data-action="closeGuide"]');
    clickSelector('[data-action="setDif"][data-dif="0"]'); // Santai
    clickSelector('[data-action="tog"][data-id="j1"]');
    clickSelector('[data-action="tog"][data-id="j2"]');
    clickSelector('[data-action="tog"][data-id="j4"]');
    clickSelector('[data-action="newGame"]');
    clickSelector('[data-action="takeOath"][data-kind="sumpah"]');

    for (let q = 0; q < 20; q++) {
      expect(store.S!.q).toBe(q);
      // Dismiss any active overlays before picking event
      if (store.S!.qrep) clickSelector('[data-action="closeReport"]');
      if (store.S!.fxAlert) clickSelector('[data-action="fxClose"]');
      if (store.S!.modal) clickSelector('[data-action="closeModal"]');
      if (store.S!.alert) clickSelector('[data-action="ackAlert"]');

      // Keep stats healthy so we reach quarter 20 cleanly
      store.S!.kas = Math.max(store.S!.kas, 65);
      store.S!.rak = Math.max(store.S!.rak, 68);
      store.S!.eko = Math.max(store.S!.eko, 68);
      store.S!.stb = Math.max(store.S!.stb, 68);
      store.S!.hrg = Math.min(store.S!.hrg, 40);
      store.S!.par.forEach((p, idx) => {
        if (idx < 5) {
          p.k = true;
          p.s = 75;
        }
      });

      // Pick choice 1 (neutral/safe option in Pilkada & Pemilu too)
      clickSelector('[data-action="pick"][data-idx="1"]');
      expect(store.S!.res).not.toBeNull();

      // Advance quarter
      clickSelector('[data-action="advance"]');
    }

    expect(store.S!.done).toBe(true);
    expect(store.S!.over).toBeNull();
    expect(store.S!.rep.pil1).toBeDefined();
    expect(store.S!.rep.pil2).toBeDefined();
    expect(store.S!.pemilu).not.toBeNull();
    expect(document.getElementById('app')!.textContent).toContain('Masa jabatan 5 tahun selesai');

    const canvas = cardCanvas();
    expect(canvas.width).toBe(1080);
    expect(canvas.height).toBe(1350);

    reset();
    expect(store.S).toBeNull();
    expect(localStorage.getItem(KEY)).toBeNull();
  });
});
