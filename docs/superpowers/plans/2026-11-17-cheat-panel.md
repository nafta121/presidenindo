# Floating Cheat & Debug Mini-Drawer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a secret 5x-avatar-tap floating mini-drawer (`#cheat`, outside `#app`) for real-time debugging and scenario testing without altering normal gameplay UI, `NAV`/`SUBN`, or `presiden_ri_v3` parity.

**Architecture:** Isolate all cheat state mutations in `src/engine/cheat.ts` and render a collapsible/tabbed floating drawer into `<div id="cheat"></div>` via `src/ui/cheatDrawer.ts` synced at the tail of `renderApp()`. Delegate click/change events on `#cheat` through `bindEvents()` in `src/ui/eventsDelegation.ts`.

**Tech Stack:** Vite `^8.3.6`, Strict TypeScript `~7.0.2`, Vanilla CSS (`src/styles/cheat.css`), Vitest + `jsdom`.

**Spec:** `docs/superpowers/specs/2026-11-17-cheat-panel-design.md`

## Global Constraints

- Zero runtime dependencies; strict TypeScript (`erasableSyntaxOnly: true`, `noUnusedLocals: true`, `noUnusedParameters: true`).
- `NAV`, `SUBN`, and all assertions in `tests/parity.test.ts` and `tests/simulation.test.ts` must remain 100% unchanged and green.
- `#cheat` must stay empty (`innerHTML === ''`) until unlocked by 5 taps on `[data-action="tapPresAvatar"]` within `2000ms`.
- Updating `#app` via `renderApp()` must synchronize `#cheat` without clobbering an actively focused `<input>`, `<select>`, or `<textarea>` inside `#cheat`.

## Review Focus

1. **Slow taps > 2000ms:** 5 taps spread across more than `2000ms` must not open `#cheat`.
2. **Lethal stats under God Mode vs non-God Mode:** Setting `kas = 0` or `rak = 0` while `store.godMode === true` must not set `S.over`, and `cheatRevive()` must restore lethal stats above `checkOver()` thresholds (`rak/eko/stb/kol >= 25`, `kas >= 20`, `hrg <= 75`, `utg <= 80`, coalition seats `>= 35%`) before clearing `S.over`.
3. **Focused input preservation in `#cheat`:** Calling `renderApp()` while `document.activeElement` is inside `#cheat` (`INPUT`, `SELECT`, `TEXTAREA`) must skip overwriting `#cheat.innerHTML`.
4. **Jumping to Agenda Quarters (`Q7`, `Q15`, `Q19`) or forcing an Event `#0–#99`:** Must clear `S.res` and `S.alert` so the newly active event is immediately playable in `evPanel`.
5. **Malformed JSON in Save Import:** Invalid JSON or non-object payloads in `cheatImportSave()` must fail safely with a toast message and return `false` without corrupting `store.S`.

---

### Task 1: Store Fields, `godMode` Guard, & Cheat Engine (`src/engine/cheat.ts`)

**Files:**
- Modify: `src/engine/store.ts`
- Modify: `src/engine/stats.ts`
- Modify: `src/engine/politicsV35.ts` (export `applyLaw`)
- Create: `src/engine/cheat.ts`
- Create: `tests/cheat.test.ts`

**Interfaces:**
- Produces in `src/engine/store.ts`:
  - `CheatTabKey = 'stat' | 'kuartal' | 'politik' | 'save'`
  - `store.cheatOpen: boolean`, `store.cheatMin: boolean`, `store.cheatTab: CheatTabKey`, `store.godMode: boolean`, `store.avatarTaps: number[]`
- Produces in `src/engine/cheat.ts`:
  - `tapPresAvatar(now?: number): boolean`
  - `closeCheat(): void`, `toggleCheatMin(): void`, `setCheatTab(tab: CheatTabKey): void`
  - `toggleGodMode(): void`
  - `cheatSetStat(key: 'rak' | 'eko' | 'kas' | 'hrg' | 'stb' | 'utg' | 'ipk', val: number): void`
  - `cheatAdjustStat(key: 'rak' | 'eko' | 'kas' | 'hrg' | 'stb' | 'utg' | 'ipk', delta: number): void`
  - `cheatRefreshQuotas(): void`
  - `cheatJumpQuarter(q: number): void`
  - `cheatForceEvent(evIdx: number): void`
  - `cheatClearModals(): void`
  - `cheatFinishTerm(): void`
  - `cheatRevive(): void`
  - `cheatSetCoalition(mode: 'max' | 'min'): void`
  - `cheatMaxCabinet(): void`
  - `cheatMaxPrograms(): void`
  - `cheatSetFx(usd: number, triggerAlert?: boolean): void`
  - `cheatShockIhsg(pct: number, triggerAlert?: boolean): void`
  - `cheatFillCommodities(units?: number): void`
  - `cheatSpawnCase(): void`
  - `cheatSpawnMkSuit(): void`
  - `cheatExportSave(): string`
  - `cheatImportSave(raw: string): boolean`

- [x] **Step 1: Write failing unit tests in `tests/cheat.test.ts` for all Task 1 functions and Review Focus cases 1, 2, 4, 5**
- [x] **Step 2: Run `npx vitest run tests/cheat.test.ts` and verify RED failure**
- [x] **Step 3: Implement `store` additions, `checkOver()` `godMode` guard, `applyLaw` export, and `src/engine/cheat.ts`**
- [x] **Step 4: Run `npx vitest run tests/cheat.test.ts` and verify GREEN**

---

### Task 2: Floating `#cheat` Mini-Drawer UI, CSS, & Event Delegation

**Files:**
- Modify: `index.html`
- Create: `src/styles/cheat.css`
- Create: `src/ui/cheatDrawer.ts`
- Modify: `src/ui/hud.ts`
- Modify: `src/ui/render.ts`
- Modify: `src/ui/eventsDelegation.ts`
- Modify: `src/main.ts`
- Modify: `tests/cheat.test.ts`

**Interfaces:**
- Consumes: Task 1 exports from `src/engine/cheat.ts` and `src/engine/store.ts`
- Produces in `src/ui/cheatDrawer.ts`:
  - `cheatDrawerHTML(): string`
  - `renderCheatDrawer(force?: boolean): void`

- [x] **Step 1: Extend `tests/cheat.test.ts` with failing DOM tests for 5x avatar tap in HUD & End Screen, `#cheat` rendering outside `#app`, minimize pill, 4-tab switching, live dual-DOM sync, and Review Focus case 3 (focused input preservation)**
- [x] **Step 2: Run `npx vitest run tests/cheat.test.ts` and verify RED failure**
- [x] **Step 3: Implement `<div id="cheat"></div>`, `cheat.css`, `cheatDrawer.ts`, `tapPresAvatar` wrappers in `hud.ts`/`render.ts`, event delegation actions, and `bootApp()` binding**
- [x] **Step 4: Run `npm run typecheck && npm test && npm run build` and verify full suite GREEN + zero errors**
- [x] **Step 5: Verify live in headless Chromium on `http://127.0.0.1:5173` and capture verification screenshot**
