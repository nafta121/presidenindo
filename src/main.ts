import './styles/base.css';
import './styles/components-v3.css';
import './styles/theme-nusantara.css';
import './styles/features-v35-v36.css';

import { GUIDE_KEY } from './data/constants';
import { load, registerRenderer, render, store } from './engine/store';
import { $ } from './engine/utils';
import { initBg } from './rendering/effects';
import { bindEvents } from './ui/eventsDelegation';
import { renderApp } from './ui/render';

export function bootApp(): void {
  registerRenderer(renderApp);
  const appEl = $('app');
  if (appEl) {
    bindEvents(appEl);
  }
  try {
    if (!store.S && !load() && !localStorage.getItem(GUIDE_KEY)) {
      store.GUIDE = 0;
    }
  } catch {
    // Ignore storage errors
  }
  initBg();
  render();
}

bootApp();
