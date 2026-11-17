export type StatKey = 'rak' | 'eko' | 'kas' | 'hrg' | 'stb' | 'kol';
export type AllStatKey = StatKey | 'utg' | 'ipk';

export type EffectMap = Partial<Record<AllStatKey, number>>;

export type GenderKey = 'l' | 'p';
export type OathKind = 'sumpah' | 'janji';

export type LatarKey = 'jenderal' | 'gubernur' | 'pengusaha' | 'akademisi' | 'aktivis';

export type RoleKey =
  | 'keu'
  | 'tan'
  | 'eko'
  | 'dag'
  | 'sos'
  | 'han'
  | 'lun'
  | 'kes'
  | 'pdd'
  | 'esd'
  | 'set';

export type OutfitRole = 'jas' | 'pres' | 'batik' | 'safari' | 'seragam' | 'rompi' | 'reporter' | 'warga';

export type OutletKey = 'warta' | 'pertiwi' | 'kritik' | 'garuda' | 'viral' | 'daerah';

export type RegionKey = 'sum' | 'jaw' | 'nus' | 'kal' | 'sul' | 'mal' | 'pap';

export type AgendaKey = 'pil1' | 'pil2' | 'pemilu';

export type TabKey =
  | 'bur'
  | 'sah'
  | 'kurs'
  | 'med'
  | 'ker'
  | 'ev'
  | 'pol'
  | 'prg'
  | 'ang'
  | 'kab'
  | 'par'
  | 'kas'
  | 'pet'
  | 'hkm'
  | 'mhk'
  | 'apr'
  | 'agn'
  | 'jan';

export type NavGroupKey = 'ev' | 'kel' | 'bur' | 'pel' | 'kas' | 'lain';

export type RbKey = 'pajak' | 'pnbp' | 'bea' | 'hemat';
export type FlowKey = 'pol' | 'prg' | 'evt' | 'rec' | 'trip' | 'mkt' | 'trd';

export interface PartyDef {
  n: string;
  a: string;
  ic: string;
  c: string;
  ide: string;
  ketum: string;
  seat: number;
}

export interface PartyState {
  k: boolean;
  s: number;
}

export interface LatarDef {
  k: LatarKey;
  ic: string;
  n: string;
  d: string;
  f: EffectMap;
}

export interface RoleDef {
  k: RoleKey;
  ic: string;
  j: string;
  e: string;
}

export interface Minister {
  k: RoleKey;
  nm: string;
  c: number;
  i: number;
  p: number;
  sus: boolean;
  since: number;
  fund: number;
  leak: number;
  pol: number;
  cs: number;
  prev?: string;
}

export interface ProgramDef {
  id: string;
  ic: string;
  n: string;
  d: string;
  cost: number;
  gain: number;
  role: RoleKey;
  mk: StatKey;
  sg: 1 | -1;
  y: Partial<Record<StatKey, number>>;
}

export interface SeasonDef {
  ic: string;
  n: string;
  d: string;
  f: EffectMap;
  m: string;
}

export interface PromiseDef {
  id: string;
  ic: string;
  n: string;
  d: string;
  ok: (s: GameState) => boolean;
  p: (s: GameState) => string;
}

export interface PolicyDef {
  id: string;
  ic: string;
  n: string;
  d: string;
  f: EffectMap;
  cd: number;
  tag?: string;
}

export interface EventRisk {
  p: number;
  f: EffectMap;
  r: string;
}

export type DynamicChoiceFn = () => { f: EffectMap; r: string };

export type EventChoiceTuple =
  | [label: string, effect: EffectMap | DynamicChoiceFn, resultText: string]
  | [label: string, effect: EffectMap, resultText: string, risk: EventRisk | null]
  | [label: string, effect: EffectMap, resultText: string, risk: EventRisk | null, followUpId: string];

export type EventCategory = 'dn' | 'ln' | 'ag';

export interface GameEventTuple extends Array<unknown> {
  0: string;
  1: string;
  2: string;
  3: EventChoiceTuple[];
  4?: string;
  cat?: EventCategory;
}

export interface GuidePage {
  ic: string;
  t: string;
  b: string;
}

export interface OutletDef {
  n: string;
  ic: string;
  c: string;
  t: string;
}

export interface NewsItem {
  q: number;
  o: OutletKey;
  h: string;
  s: string;
  tn: number;
  pv?: string | null;
}

export type NewsSeed =
  | { t: 'pol'; id: string }
  | { t: 'prg'; id: string; leak: boolean }
  | { t: 'evt'; ti: string; p: string; n: number }
  | { t: 'trip'; id: string; good: boolean; cost: number }
  | { t: 'mkt'; h: string; s: string; tn?: number };

export interface TripDef {
  id: string;
  kind: 'dn' | 'ln';
  pv?: string;
  ic: string;
  n: string;
  reg: string;
  days: number;
  itin: string[];
  inv?: number;
  cost: Record<string, number>;
  f: EffectMap;
  hi: string[];
}

export interface TripReport {
  id: string;
  good: boolean;
  cost: number;
  f: EffectMap;
  hl: string;
  inv: number;
  q: number;
}

export type CommodityId = 'beras' | 'sawit' | 'nikel' | 'emas' | 'minyak' | 'batubara' | 'gas' | 'kopi';

export interface CommodityDef {
  id: CommodityId;
  ic: string;
  n: string;
  u: string;
  b: number;
  v: number;
  role: RoleKey;
  d: string;
}

export interface MarketLogEntry {
  q: number;
  id: string;
  t: 'buy' | 'sell' | 'op';
  n: number;
  v: number;
  pr: number;
  stk?: number;
}

export interface CommodityMarketState {
  p: Record<string, number>;
  h: Record<string, number[]>;
  st: Record<string, number>;
  cost: Record<string, number>;
  tin: number;
  tout: number;
  ops: number;
  log: MarketLogEntry[];
  tr: Record<string, number>;
}

export interface StockDef {
  id: string;
  n: string;
  sec: string;
  bumn?: number;
  p0: number;
  beta: number;
  dy: number;
  w: number;
  kom?: CommodityId;
}

export interface StockMarketState {
  p: Record<string, number>;
  h: Record<string, number[]>;
  hold: Record<string, number>;
  cost: Record<string, number>;
  usd: number;
  uh: number[];
  ih: number[];
  ret: number;
  uret: number;
}

export type ExportMode = 'buka' | 'pajak' | 'larang';
export type ImportMode = 'buka' | 'kuota' | 'larang';

export interface TradeBaseDef {
  ex: number;
  im: number;
  exTo: string[];
  imFrom: string[];
}

export interface TradeModeDef {
  vol: number;
  tax: number;
  n: string;
  d: string;
}

export interface TradePolPair {
  ex: ExportMode;
  im: ImportMode;
}

export interface TradeHistoryEntry {
  q: number;
  ex: number;
  im: number;
  net: number;
  tax: number;
  d: Record<string, { ex: number; im: number }>;
  wf?: number;
}

export interface TradeState {
  pol: Record<string, TradePolPair>;
  dem: Record<string, number>;
  h: TradeHistoryEntry[];
  chg: number;
  rev: number;
  cex: number;
  cim: number;
  lar: Record<string, number>;
  base?: Record<string, TradePolPair> | null;
  msg?: string;
}

export interface ProvinceDef {
  id: string;
  n: string;
  ibu: string;
  r: RegionKey;
  ab: string;
  c: number;
  rw: number;
  ic: string;
  kh: [string, string];
  pop: number;
}

export interface ProvinceIssueDef {
  id: string;
  ic: string;
  t: string;
  d: string;
  c: number;
  rg: RegionKey[] | null;
}

export interface ProvinceState {
  puas: number;
  iss: { id: string; q0: number } | null;
  vis: number;
}

export interface LawOptionDef {
  id: string;
  n: string;
  f: EffectMap;
  pop: number;
  ctr: number;
  rb?: Partial<Record<RbKey, number>>;
  kpk?: number;
  ipk?: number;
  ap?: Partial<Record<'tni' | 'pol', Partial<Record<'loy' | 'prof', number>>>>;
}

export interface LawDef {
  id: string;
  ic: string;
  n: string;
  no: string;
  d: string;
  opts: LawOptionDef[];
}

export interface LawStateEntry {
  v: string;
  q: number;
  prev: string;
}

export interface DprVoteRow {
  i: number;
  pr: number;
  yes: boolean;
  seats: number;
}

export interface DprVoteResult {
  rows: DprVoteRow[];
  yes: number;
  pass: boolean;
  perppu?: false;
}

export interface LawModalState {
  id: string;
  opt: string | null;
  st: 'pick' | 'prev' | 'res';
  lobi: boolean;
  vote?: DprVoteResult | { perppu: true };
  gug?: boolean;
}

export interface VoteRecord {
  q: number;
  law: string;
  opt: string;
  yes: number;
  pass: boolean;
}

export interface MkSuit {
  id: number;
  law: string;
  opt: string;
  q0: number;
  st: 'sidang' | 'dikabulkan' | 'ditolak';
  lobi: boolean;
  qd?: number;
}

export interface MkJudge {
  nm: string;
  lat: string;
  ln: string;
}

export interface AparatBranch {
  nm: string;
  loy: number;
  prof: number;
  chg: number;
}

export interface AparatState {
  tni: AparatBranch;
  pol: AparatBranch;
  act: number;
}

export interface AparatActionDef {
  id: string;
  ic: string;
  t: string;
  d: string;
  cost: number;
  gt?: boolean;
  f?: (a: AparatBranch) => void;
}

export type AgencyKey = 'KPK' | 'Kejaksaan' | 'Polri';
export type CaseDecision = 'dukung' | 'diam' | 'lindungi';
export type KasasiStatus = 'proses' | 'ditolak' | 'dikurangi' | 'diperberat';

export interface CorruptionCase {
  id: number;
  q0: number;
  stage: number;
  dec: CaseDecision | null;
  pend: boolean;
  done: boolean;
  res: string;
  mi: number | null;
  who: string;
  pi: number;
  t: string;
  amt: number;
  qd?: number;
  yrs?: number;
  recT?: number;
  ag?: AgencyKey;
  mod?: string;
  flow?: string[];
  pasal?: string;
  bb?: string[];
  tl?: Array<{ q: number; t: string }>;
  sak?: number;
  tut?: number;
  sp3?: boolean;
  kas?: { st: KasasiStatus; q0: number; qd?: number };
}

export type ProposalState =
  | {
      kind: 'pol' | 'prg';
      id: string;
      st: 'review' | 'reject';
      neg: boolean;
      msg: string;
      why?: 'kas' | 'utang';
    }
  | {
      kind: 'resh';
      idx: number;
      cands: [Minister, Minister, Minister];
      st?: undefined;
      id?: undefined;
      neg?: undefined;
      msg?: undefined;
    };

export interface FiscalSnapshot {
  pajak: number;
  bea: number;
  pnbp: number;
  inc: number;
  netT: number;
  bel: number;
  bunga: number;
  pegawai: number;
  subsidi: number;
  transfer: number;
  hankam: number;
  lain: number;
}

export interface QuarterReport {
  q: number;
  fs: FiscalSnapshot;
  kas0: number;
  kas1: number;
  pol: number;
  prg: number;
  evt: number;
  rec: number;
  trip: number;
  mkt: number;
  trd: number;
  lain: number;
  notes: string[];
}

export interface LedgerState {
  n: number;
  pajak: number;
  bea: number;
  pnbp: number;
  bel: number;
  pol: number;
  prg: number;
  evt: number;
  rec: number;
  trip: number;
  mkt: number;
  trd: number;
}

export interface EventResolution {
  p: string;
  t: string;
  f: EffectMap;
  n: number;
  ic: string;
  ti: string;
}

export interface GameOverInfo {
  t: string;
  i: string;
  d: string;
  q: number;
}

export interface GameState {
  nama: string;
  gen: GenderKey;
  oath?: boolean;
  oathK?: OathKind;
  lat: LatarKey;
  q: number;
  rak: number;
  eko: number;
  kas: number;
  hrg: number;
  stb: number;
  kol: number;
  utg: number;
  ipk: number;
  par: PartyState[];
  men: Minister[];
  janji: string[];
  cnt: Record<string, number>;
  last: Record<string, number>;
  cid: number;
  cases: CorruptionCase[];
  prg: Record<string, number>;
  slots: number;
  rep: Record<string, string>;
  pemilu: { pct: number; win: boolean } | null;
  rb: Record<RbKey, number>;
  fl: Record<FlowKey, number>;
  notes: string[];
  news: NewsItem[];
  seeds: NewsSeed[];
  usedTrip: boolean;
  trips: string[];
  trip: { id: string } | null;
  tripRep: TripReport | null;
  mk: CommodityMarketState;
  prop: ProposalState | null;
  qrep: QuarterReport | null;
  kasQ: number;
  usedPol: boolean;
  usedResh: boolean;
  usedDip: boolean;
  usedLaw: boolean;
  diff: number;
  log: string[];
  modal: { y: number } | null;
  deck: number[];
  res: EventResolution | null;
  over: GameOverInfo | null;
  done: boolean;
  alert: boolean;
  prev: Record<StatKey, number>;
  stat: {
    dukung: number;
    lindungi: number;
    diam: number;
    dipl: number;
    otor: number;
    fund?: number;
    trip?: number;
  };
  seas?: SeasonDef;
  fs?: FiscalSnapshot;
  cf?: number;
  sh?: number;
  prof: number | null;
  sm: StockMarketState;
  fxAlert: { t: 'kurs' | 'ihsg'; q: number } | null;
  fxUsed: boolean;
  pv: Record<string, ProvinceState>;
  law: Record<string, LawStateEntry>;
  lawq: LawModalState | null;
  votes: VoteRecord[];
  gug: MkSuit[];
  gid: number;
  mkind: number;
  maind: number;
  kpk: number;
  mkj: MkJudge[];
  perppu: { law: string; opt: string; q: number } | null;
  ap: AparatState;
  pvAct: number;
  pvNote: Record<string, unknown>;
  td: TradeState;
  led: LedgerState;
}
