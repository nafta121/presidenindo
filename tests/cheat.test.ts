import { beforeEach, describe, expect, it } from 'vitest';
import { EV } from '../src/data/events';
import { PRG } from '../src/data/programs';
import {
  cheatAdjustStat,
  cheatClearModals,
  cheatExportSave,
  cheatFillCommodities,
  cheatFinishTerm,
  cheatForceEvent,
  cheatImportSave,
  cheatJumpQuarter,
  cheatMaxCabinet,
  cheatMaxPrograms,
  cheatRefreshQuotas,
  cheatRevive,
  cheatSetCoalition,
  cheatSetFx,
  cheatSetStat,
  cheatShockIhsg,
  cheatSpawnCase,
  cheatSpawnMkSuit,
  closeCheat,
  setCheatTab,
  tapPresAvatar,
  toggleCheatMin,
  toggleGodMode,
} from '../src/engine/cheat';
import { curEv, newGame } from '../src/engine/lifecycle';
import { checkOver } from '../src/engine/stats';
import { store } from '../src/engine/store';
import { bootApp } from '../src/main';
import { renderApp } from '../src/ui/render';

describe('Task 1: Cheat Engine, 5x Tap Unlock, God Mode, & State Mutations', () => {
  beforeEach(() => {
    window.scrollTo = () => {};
    localStorage.clear();
    store.S = null;
    store.cheatOpen = false;
    store.cheatMin = false;
    store.cheatTab = 'stat';
    store.godMode = false;
    store.avatarTaps = [];
    newGame('Penguji', ['j1', 'j2', 'j4'], 'gubernur');
  });

  it('requires 5 taps within 2000ms to unlock #cheat and ignores slow taps > 2000ms', () => {
    expect(store.cheatOpen).toBe(false);

    // Slow taps spread across 2500ms should NOT unlock
    tapPresAvatar(1000);
    tapPresAvatar(1600);
    tapPresAvatar(2200);
    tapPresAvatar(2800);
    expect(tapPresAvatar(3500)).toBe(false);
    expect(store.cheatOpen).toBe(false);

    // 5 crisp taps within 1200ms unlock #cheat
    tapPresAvatar(5000);
    tapPresAvatar(5200);
    tapPresAvatar(5400);
    tapPresAvatar(5600);
    expect(tapPresAvatar(5800)).toBe(true);
    expect(store.cheatOpen).toBe(true);
    expect(store.cheatMin).toBe(false);

    // Minimize & switch tab & close
    toggleCheatMin();
    expect(store.cheatMin).toBe(true);
    setCheatTab('politik');
    expect(store.cheatTab).toBe('politik');
    closeCheat();
    expect(store.cheatOpen).toBe(false);
  });

  it('prevents Game Over under God Mode and revives cleanly from lethal Game Over states', () => {
    toggleGodMode();
    expect(store.godMode).toBe(true);

    cheatSetStat('kas', 0);
    cheatSetStat('rak', 0);
    expect(checkOver()).toBe(false);
    expect(store.S!.over).toBeNull();

    // Turning God Mode off and checking lethal stats triggers Game Over
    toggleGodMode();
    expect(store.godMode).toBe(false);
    expect(checkOver()).toBe(true);
    expect(store.S!.over).not.toBeNull();

    // Revive restores safe minimum stats and clears over/done
    cheatRevive();
    expect(store.S!.over).toBeNull();
    expect(store.S!.done).toBe(false);
    expect(store.S!.kas).toBeGreaterThanOrEqual(20);
    expect(store.S!.rak).toBeGreaterThanOrEqual(25);
    expect(checkOver()).toBe(false);
  });

  it('adjusts stats, refreshes all quarterly quotas, jumps quarters/agendas, forces events, and finishes term', () => {
    const S = store.S!;
    cheatSetStat('kas', 50);
    cheatAdjustStat('kas', 12.5);
    expect(S.kas).toBe(62.5);

    S.usedPol = true;
    S.usedResh = true;
    S.usedTrip = true;
    S.usedLaw = true;
    S.fxUsed = true;
    S.slots = 0;
    S.td.chg = 3;
    S.ap.act = 1;
    S.pvAct = 2;

    cheatRefreshQuotas();
    expect(S.usedPol).toBe(false);
    expect(S.usedResh).toBe(false);
    expect(S.usedTrip).toBe(false);
    expect(S.usedLaw).toBe(false);
    expect(S.fxUsed).toBe(false);
    expect(S.slots).toBe(2);
    expect(S.td.chg).toBe(0);
    expect(S.ap.act).toBe(0);
    expect(S.pvAct).toBe(0);

    // Jump to Pilkada I (q = 6 -> Q7)
    cheatJumpQuarter(6);
    expect(S.q).toBe(6);
    expect(S.res).toBeNull();
    expect(S.alert).toBe(false);
    expect(curEv()[1]).toContain('Pilkada');

    // Jump to normal quarter (q = 3) and force event #42
    cheatJumpQuarter(3);
    cheatForceEvent(42);
    expect(S.deck[3]).toBe(42);
    expect(curEv()[1]).toBe(EV[42][1]);

    // Clear active modals
    S.oath = true;
    S.alert = true;
    S.modal = { y: 1 };
    cheatClearModals();
    expect(S.oath).toBe(false);
    expect(S.alert).toBe(false);
    expect(S.modal).toBeNull();

    // Instant finish 20-quarter term
    cheatFinishTerm();
    expect(S.done).toBe(true);
    expect(S.over).toBeNull();
    expect(S.pemilu).not.toBeNull();
  });

  it('manipulates DPR coalition, 5-star cabinet, 19 programs, FX/IHSG/commodities, corruption cases, MK suits, and JSON save import/export', () => {
    const S = store.S!;

    cheatSetCoalition('max');
    expect(S.par.every((p) => p.k && p.s >= 95)).toBe(true);
    expect(S.kol).toBeGreaterThanOrEqual(90);

    toggleGodMode(); // avoid coalition collapse game-over while testing opposition
    cheatSetCoalition('min');
    expect(S.par.every((p) => !p.k)).toBe(true);
    cheatSetCoalition('max');

    cheatMaxCabinet();
    expect(S.men.every((m) => m.c === 5 && m.i === 5 && !m.sus)).toBe(true);

    cheatMaxPrograms();
    expect(PRG.every((p) => S.prg[p.id] === 100)).toBe(true);

    cheatSetFx(18500, true);
    expect(S.sm.usd).toBe(18500);
    expect(S.fxAlert?.t).toBe('kurs');

    cheatShockIhsg(-12, true);
    expect(S.fxAlert?.t).toBe('ihsg');

    cheatFillCommodities(5);
    expect(S.mk.st.beras).toBeGreaterThanOrEqual(5);

    const prevCases = S.cases.length;
    cheatSpawnCase();
    expect(S.cases.length).toBe(prevCases + 1);
    expect(S.cases[S.cases.length - 1].pend).toBe(true);

    const prevGug = S.gug.length;
    cheatSpawnMkSuit();
    expect(S.gug.length).toBe(prevGug + 1);
    expect(S.gug[S.gug.length - 1].st).toBe('sidang');

    // Export & Import JSON save (including malformed JSON guard)
    const exported = cheatExportSave();
    expect(exported).toContain('"Penguji"');
    expect(cheatImportSave('{broken json')).toBe(false);
    expect(cheatImportSave('123')).toBe(false);

    const parsed = JSON.parse(exported);
    parsed.nama = 'Presiden Hasil Impor';
    expect(cheatImportSave(JSON.stringify(parsed))).toBe(true);
    expect(store.S!.nama).toBe('Presiden Hasil Impor');
  });
});

describe('Task 2: Floating #cheat Mini-Drawer DOM Outside #app & Event Delegation', () => {
  function click(sel: string): HTMLElement {
    const el = document.querySelector<HTMLElement>(sel);
    expect(el, `Expected element matching ${sel}`).not.toBeNull();
    el!.click();
    return el!;
  }

  beforeEach(() => {
    window.scrollTo = () => {};
    localStorage.clear();
    document.body.innerHTML =
      '<div class="bg" id="bg"></div><div id="app"></div><div id="cheat"></div><div id="toast"></div>';
    store.S = null;
    store.sel = [];
    store.GUIDE = null;
    store.cheatOpen = false;
    store.cheatMin = false;
    store.cheatTab = 'stat';
    store.godMode = false;
    store.avatarTaps = [];
    bootApp();
    click('[data-action="closeGuide"]');
    click('[data-action="tog"][data-id="j1"]');
    click('[data-action="tog"][data-id="j2"]');
    click('[data-action="tog"][data-id="j4"]');
    click('[data-action="newGame"]');
    click('[data-action="takeOath"][data-kind="sumpah"]');
    click('[data-action="ackAlert"]');
  });

  it('keeps #cheat empty until 5x avatar tap, renders outside #app, minimizes to pill, and syncs live across all 4 tabs', () => {
    const cheatRoot = document.getElementById('cheat')!;
    const appRoot = document.getElementById('app')!;
    expect(cheatRoot.innerHTML).toBe('');
    expect(appRoot.querySelector('.xcheat')).toBeNull();

    // Tap President's avatar 5 times in HUD
    for (let i = 0; i < 5; i++) {
      click('#app [data-action="tapPresAvatar"]');
    }

    expect(store.cheatOpen).toBe(true);
    expect(cheatRoot.querySelector('.xcheat')).not.toBeNull();
    expect(appRoot.querySelector('.xcheat')).toBeNull();

    // Minimize into compact floating pill and expand back
    click('#cheat [data-action="cheatMin"]');
    expect(store.cheatMin).toBe(true);
    expect(cheatRoot.querySelector('.xcheat-pill')).not.toBeNull();
    click('#cheat [data-action="cheatMin"]');
    expect(store.cheatMin).toBe(false);
    expect(cheatRoot.querySelector('.xcheat')).not.toBeNull();

    // Toggle God Mode & add +Rp 100 T Kas (+12.5 kas) from #cheat -> updates #app HUD live!
    click('#cheat [data-action="cheatGod"]');
    expect(store.godMode).toBe(true);
    const kas0 = store.S!.kas;
    click('#cheat [data-action="cheatStatAdj"][data-key="kas"][data-delta="12.5"]');
    expect(store.S!.kas).toBe(kas0 + 12.5);
    expect(appRoot.querySelector('.xhud')?.textContent).toContain('Rp636T');

    // Switch across Kuartal, Politik, and Save tabs
    click('#cheat [data-action="cheatTab"][data-tab="kuartal"]');
    expect(store.cheatTab).toBe('kuartal');
    click('#cheat [data-action="cheatJumpQ"][data-q="6"]');
    expect(store.S!.q).toBe(6);
    expect(appRoot.textContent).toContain('Pilkada Serentak I');

    click('#cheat [data-action="cheatTab"][data-tab="politik"]');
    click('#cheat [data-action="cheatCoal"][data-mode="max"]');
    expect(store.S!.kol).toBeGreaterThanOrEqual(90);

    click('#cheat [data-action="cheatTab"][data-tab="save"]');
    const ta = cheatRoot.querySelector<HTMLTextAreaElement>('#cheat-save-json')!;
    expect(ta).not.toBeNull();

    // Review Focus #3: focused textarea/input inside #cheat must NOT be clobbered by background renderApp()
    ta.focus();
    ta.value = '{"custom":"typing"}';
    renderApp();
    expect(cheatRoot.querySelector<HTMLTextAreaElement>('#cheat-save-json')?.value).toBe('{"custom":"typing"}');
    ta.blur();

    // Close #cheat
    click('#cheat [data-action="cheatClose"]');
    expect(store.cheatOpen).toBe(false);
    expect(cheatRoot.innerHTML).toBe('');
  });

  it('allows unlocking #cheat via 5x avatar tap on the Game Over screen and reviving into active play', () => {
    store.S!.over = { t: 'Negara Bangkrut', i: '💸', d: 'Kas habis.', q: 2 };
    store.S!.kas = 0;
    renderApp();
    expect(document.getElementById('app')!.textContent).toContain('Negara Bangkrut');

    for (let i = 0; i < 5; i++) {
      click('#app [data-action="tapPresAvatar"]');
    }
    expect(store.cheatOpen).toBe(true);

    click('#cheat [data-action="cheatTab"][data-tab="kuartal"]');
    click('#cheat [data-action="cheatRevive"]');
    expect(store.S!.over).toBeNull();
    expect(document.querySelector('.xhud')).not.toBeNull();
  });
});
