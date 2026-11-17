import { chooseResh, closeProf, joinPar, lobi, openProf, openResh } from '../engine/cabinet';
import { decideCase } from '../engine/corruption';
import {
  ackAlert,
  advance,
  closeGuide,
  closeModal,
  closeReport,
  cont,
  go,
  goSub,
  guideNav,
  newGame,
  openGuide,
  pick,
  reset,
  setDif,
  setGen,
  setLatar,
  takeOath,
  tog,
} from '../engine/lifecycle';
import { fxClose, fxDo, mkTrade, opPasar, stkTrade, tdSet } from '../engine/market';
import { closeTrip, closeTripRep, goTrip, openTrip } from '../engine/mediaAndTrips';
import { cancelProp, openProp, propChoice, submitProp } from '../engine/policiesAndPrograms';
import {
  aprDo,
  closeLaw,
  lawBack,
  lawLobi,
  lawSubmit,
  mkLobi,
  openLaw,
  pickLawOpt,
  pvHelp,
  pvMin,
  pvVisit,
} from '../engine/politicsV35';
import { render, store, type AppStore } from '../engine/store';
import { toast } from '../rendering/effects';
import { closeCard, dlCard, openCard, share, shCard } from '../rendering/shareCard';
import type {
  CaseDecision,
  CommodityId,
  ExportMode,
  GenderKey,
  ImportMode,
  LatarKey,
  NavGroupKey,
  OathKind,
  TabKey,
} from '../types/game';

const boundRoots = new WeakSet<EventTarget>();

export function bindEvents(root: HTMLElement): void {
  if (boundRoots.has(root)) return;
  boundRoots.add(root);

  root.addEventListener('input', (ev) => {
    const target = ev.target;
    if (target instanceof HTMLInputElement && target.id === 'nm') {
      store.nm = target.value;
    }
  });

  root.addEventListener('click', (ev) => {
    const rawTarget = ev.target;
    if (!(rawTarget instanceof Element)) return;
    const el = rawTarget.closest<HTMLElement>('[data-action]');
    if (!el) return;
    if ((el instanceof HTMLButtonElement && el.disabled) || el.hasAttribute('disabled')) {
      return;
    }

    const action = el.dataset.action;
    switch (action) {
      case 'goSub':
        goSub(el.dataset.tab as TabKey);
        break;
      case 'goSubBtab':
        store.BTAB = el.dataset.btab as AppStore['BTAB'];
        goSub(el.dataset.tab as TabKey);
        break;
      case 'toast':
        toast(el.dataset.msg || '');
        break;
      case 'openGuide':
        openGuide(Number(el.dataset.page || 0));
        break;
      case 'closeGuide':
        closeGuide();
        break;
      case 'guideNav':
        guideNav(Number(el.dataset.dir || 0));
        break;
      case 'go':
        go(el.dataset.nav as NavGroupKey | TabKey);
        break;
      case 'goKerDn':
        store.KFILT = 'dn';
        go('ker');
        break;
      case 'pick':
        pick(Number(el.dataset.idx), ev);
        break;
      case 'openProp':
        openProp(el.dataset.kind as 'pol' | 'prg', el.dataset.id!);
        break;
      case 'cancelProp':
        cancelProp();
        break;
      case 'submitProp':
        submitProp();
        break;
      case 'propChoice':
        propChoice(el.dataset.choice as 'ikuti' | 'rundingan' | 'reshuffle');
        break;
      case 'chooseResh':
        chooseResh(Number(el.dataset.idx));
        break;
      case 'openProf':
        openProf(Number(el.dataset.idx));
        break;
      case 'closeProf':
        closeProf();
        break;
      case 'openResh':
        openResh(Number(el.dataset.idx));
        break;
      case 'profResh':
        if (store.S) store.S.prof = null;
        openResh(Number(el.dataset.idx));
        break;
      case 'lobi':
        lobi(Number(el.dataset.idx));
        break;
      case 'joinPar':
        joinPar(Number(el.dataset.idx));
        break;
      case 'setBtab':
        store.BTAB = el.dataset.btab as AppStore['BTAB'];
        render();
        break;
      case 'mkTrade':
        mkTrade(el.dataset.id!, el.dataset.type as 'buy' | 'sell', Number(el.dataset.qty || 1));
        break;
      case 'opPasar':
        opPasar();
        break;
      case 'tdSet':
        tdSet(
          el.dataset.id as CommodityId,
          el.dataset.kind as 'ex' | 'im',
          el.dataset.val as ExportMode | ImportMode,
        );
        break;
      case 'stkTrade':
        stkTrade(el.dataset.id!, el.dataset.type as 'buy' | 'sell');
        break;
      case 'fxDo':
        fxDo(el.dataset.id!);
        break;
      case 'fxClose':
        fxClose();
        break;
      case 'openLaw':
        openLaw(el.dataset.id!);
        break;
      case 'closeLaw':
        closeLaw();
        break;
      case 'pickLawOpt':
        pickLawOpt(el.dataset.opt!);
        break;
      case 'lawBack':
        lawBack();
        break;
      case 'lawLobi':
        lawLobi();
        break;
      case 'lawSubmit':
        lawSubmit(el.dataset.mode as 'vote' | 'perppu');
        break;
      case 'mkLobi':
        mkLobi(Number(el.dataset.id));
        break;
      case 'aprDo':
        aprDo(el.dataset.branch as 'tni' | 'pol', el.dataset.id!);
        break;
      case 'decideCase':
        decideCase(Number(el.dataset.id), el.dataset.dec as CaseDecision);
        break;
      case 'selectPv':
        store.PSEL = el.dataset.id!;
        render();
        break;
      case 'selectPvTop':
        store.PSEL = el.dataset.id!;
        render();
        try {
          window.scrollTo(0, 0);
        } catch {
          // Ignore
        }
        break;
      case 'pvHelp':
        pvHelp(el.dataset.id!);
        break;
      case 'pvMin':
        pvMin(el.dataset.id!);
        break;
      case 'pvVisit':
        pvVisit(el.dataset.id!);
        break;
      case 'setKfilt':
        store.KFILT = el.dataset.kfilt as AppStore['KFILT'];
        render();
        break;
      case 'openTrip':
        openTrip(el.dataset.id!);
        break;
      case 'closeTrip':
        closeTrip();
        break;
      case 'goTrip':
        goTrip();
        break;
      case 'closeTripRep':
        closeTripRep();
        break;
      case 'takeOath':
        takeOath(el.dataset.kind as OathKind);
        break;
      case 'ackAlert':
        ackAlert();
        break;
      case 'closeReport':
        closeReport();
        break;
      case 'closeModal':
        closeModal();
        break;
      case 'advance':
        advance();
        break;
      case 'cont':
        cont();
        break;
      case 'setGen':
        setGen(el.dataset.gen as GenderKey);
        break;
      case 'setDif':
        setDif(Number(el.dataset.dif));
        break;
      case 'setLatar':
        setLatar(el.dataset.latar as LatarKey);
        break;
      case 'tog':
        tog(el.dataset.id!);
        break;
      case 'newGame':
        newGame(store.nm.trim(), store.sel, store.latar);
        break;
      case 'openCard':
        openCard();
        break;
      case 'closeCard':
        closeCard();
        break;
      case 'dlCard':
        dlCard();
        break;
      case 'shCard':
        shCard();
        break;
      case 'share':
        share();
        break;
      case 'reset':
        reset();
        break;
    }
  });
}
