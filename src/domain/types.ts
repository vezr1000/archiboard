/**
 * АрхиБорд domain model — the single source of truth for every entity in the app.
 *
 * Conventions
 * - All ids are stable Latin kebab-case slugs (e.g. `savski-kej`, `p-ana-jovanovic`, `dec-sk-04`).
 * - Dates are ISO strings: `YYYY-MM-DD` for days, full ISO timestamp for events with time (`FeedbackEntry`).
 * - Money in EUR, areas in m², carbon in kgCO₂e (per m² GFA where noted), energy in kWh/m²a.
 * - Human-readable copy inside data is Serbian Cyrillic. Enum *values* are Latin slugs; their labels live in
 *   `src/domain/labels.ts`.
 * - Seed data (`src/data/`) is never mutated. User-created items live in the zustand store (`src/store/`).
 */

/* ------------------------------------------------------------------------------------------------
 * Core enums
 * ---------------------------------------------------------------------------------------------- */

/** Serbian design/delivery phases, in order. See `PHASES` in labels.ts for the ordered list. */
export type Phase =
  | 'zadatak' // Пројектни задатак (brief)
  | 'idr' // Идејно решење
  | 'pgd' // Пројекат за грађевинску дозволу
  | 'pzi' // Пројекат за извођење
  | 'gradnja' // Градња
  | 'pio' // Пројекат изведеног објекта
  | 'upotreba'; // Употреба (operation / POE)

/** Stage gates reviewed by the design board. G0 = kick-off … G5 = post-occupancy evaluation. */
export type GateId = 'G0' | 'G1' | 'G2' | 'G3' | 'G4' | 'G5';

/** Overall project health vs. its sustainability targets. */
export type Health = 'on-track' | 'at-risk' | 'off-track';

export type CertificationScheme = 'DGNB' | 'LEED' | 'BREEAM' | 'EDGE' | 'WELL' | 'Passivhaus' | 'none';

/** Generic RAG-like status used for KPI checks and urban parameters. */
export type CheckStatus = 'pass' | 'warn' | 'fail';

/** Visual tone shared by badges, stats and charts. Maps 1:1 to colour tokens. */
export type Tone = 'neutral' | 'accent' | 'good' | 'warn' | 'bad' | 'info' | 'clay';

/** ISO date `YYYY-MM-DD`. Alias for readability only. */
export type IsoDate = string;

/* ------------------------------------------------------------------------------------------------
 * Projects
 * ---------------------------------------------------------------------------------------------- */

export type Typology =
  | 'stambeno-poslovni'
  | 'stambeni'
  | 'poslovni'
  | 'obrazovni'
  | 'predskolski'
  | 'javni-prostor'
  | 'adaptivna-prenamena';

export interface ProjectCertification {
  scheme: CertificationScheme;
  /** Target award level, e.g. „Gold“, „Excellent“, „Advanced“, „Classic“. Latin, as the scheme names it. */
  targetLevel: string;
  /** Current (predicted) score in scheme points or %, same unit as `targetScore`. */
  currentScore: number;
  targetScore: number;
}

export interface Project {
  id: string;
  /** Full name, e.g. „Савски кеј — блок Ц“. */
  name: string;
  /** Short name for chips / charts, e.g. „Савски кеј“. */
  shortName: string;
  city: string;
  address: string;
  /** Cadastral parcel(s), e.g. „КП 1234/5, КО Савски венац“. */
  parcel: string;
  /** Governing urban plan name (ПДР / ПГР). */
  plan: string;
  typology: Typology;
  /** Typology as free Serbian text for headers, e.g. „Стамбено-пословни, хибридна дрвена конструкција“. */
  typologyLabel: string;
  description: string;
  /** Gross floor area (БРГП) in m². Omitted for non-building projects (use `siteAreaM2`). */
  gfaM2?: number;
  /** Site / intervention area in m² (always given for public space, optional otherwise). */
  siteAreaM2?: number;
  /** Storeys label as used on drawings, e.g. „П+6+Пс“, „2По+П+8“. */
  floors?: string;
  budgetEur: number;
  /** Client / investor organisation. */
  client: string;
  phase: Phase;
  /** Progress within the current phase, 0..1. */
  phaseProgress: number;
  health: Health;
  certification: ProjectCertification;
  /** Person id of the lead (project) architect. */
  leadArchitectId: string;
  teamIds: string[];
  nextGate: { gate: GateId; date: IsoDate };
  /** Hue (0–360) used for the generative cover illustration. */
  coverHue: number;
  /** Optional illustration key for a richer cover (e.g. 'tower', 'school', 'park'). */
  illustration?: 'tower' | 'school' | 'park' | 'office' | 'kindergarten' | 'brewery';
  /** Position on the stylised Serbia map, both axes 0..100 (x → east, y → south). */
  coordinates: { x: number; y: number };
  tags: string[];
  /** Year the project started (for listing / sorting). */
  startYear?: number;
}

/* ------------------------------------------------------------------------------------------------
 * KPIs
 * ---------------------------------------------------------------------------------------------- */

export type KpiId =
  | 'embodied-carbon' // A1–A3, kgCO₂e/m²
  | 'embodied-carbon-wlc' // A1–C4 whole life, kgCO₂e/m²
  | 'operational-energy' // final energy, kWh/m²a
  | 'primary-energy' // kWh/m²a
  | 'energy-class' // energy passport class, encoded as number (see ENERGY_CLASS_SCALE)
  | 'renewable-share' // %
  | 'water' // l/person/day
  | 'stormwater-retention' // % of annual rainfall retained / infiltrated on site
  | 'green-area' // %
  | 'biotope-factor' // 0..1
  | 'daylight' // % of floor area with DF ≥ 2%
  | 'overheating'; // h/year above comfort limit

export type KpiDirection = 'lower-better' | 'higher-better';

export interface KpiBenchmarks {
  /** Serbian regulatory minimum / maximum (Правилник о ЕЕ зграда etc.). */
  regulatoryMin?: number;
  /** EU Taxonomy threshold (climate mitigation, new buildings). */
  euTaxonomy?: number;
  /** Firm-wide target (Студио Градина internal standard). */
  firmTarget?: number;
  /** Best practice / „предводник“ level. */
  bestPractice?: number;
}

export interface KpiDefinition {
  id: KpiId;
  /** Serbian label, e.g. „Уграђени угљеник (A1–A3)“. */
  label: string;
  /** Short label for tight spaces, e.g. „Угљеник“. */
  shortLabel: string;
  /** Unit string (Latin units allowed), e.g. „kgCO₂e/m²“. */
  unit: string;
  direction: KpiDirection;
  /** Decimals used when formatting values. */
  decimals: number;
  benchmarks: KpiBenchmarks;
  description: string;
}

/**
 * Energy class encoded as a number so it can be charted: A+ = 1, A = 2, B = 3, C = 4, D = 5, E = 6, F = 7, G = 8.
 * Lower is better. Use `ENERGY_CLASS_SCALE` in labels.ts to convert.
 */
export type EnergyClass = 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export interface KpiHistoryPoint {
  phase: Phase;
  value: number;
}

export interface ProjectKpi {
  projectId: string;
  kpiId: KpiId;
  /** Project target value (same unit as definition). */
  target: number;
  /** Current (latest) value. */
  current: number;
  /** Values at the end of each completed phase + current. Ordered by phase. */
  history: KpiHistoryPoint[];
  /** Optional explicit status; if absent compute with `kpiStatus()` from lib. */
  status?: CheckStatus;
  note?: string;
}

/* ------------------------------------------------------------------------------------------------
 * Site & constraints
 * ---------------------------------------------------------------------------------------------- */

/** Compass point for wind roses. 8 or 16 directions. */
export type CompassDir =
  | 'N' | 'NNE' | 'NE' | 'ENE' | 'E' | 'ESE' | 'SE' | 'SSE'
  | 'S' | 'SSW' | 'SW' | 'WSW' | 'W' | 'WNW' | 'NW' | 'NNW';

export interface WindRoseEntry {
  dir: CompassDir;
  /** Frequency in % of hours (all entries sum ≈ 100 minus calms). */
  freq: number;
  /** Max recorded gust speed in m/s for the direction. */
  maxSpeed: number;
}

export interface SiteClimate {
  /** Heating degree days (base 20/12 °C). */
  hdd: number;
  /** Cooling degree days. */
  cdd: number;
  /** Annual global horizontal irradiation, kWh/m²a. */
  solarKWhM2a: number;
  /** Design outdoor temperature winter, °C. */
  designTempWinter: number;
  /** Design outdoor temperature summer, °C. */
  designTempSummer: number;
  windRose: WindRoseEntry[];
  /** Prevailing wind note, e.g. „Кошава (ЈИ), зими до 25 m/s“. */
  prevailingWindNote?: string;
  /** Urban heat island intensity, °C above rural reference (summer nights). */
  uhiIntensity: number;
  airQualityNote: string;
}

export interface SiteHazards {
  /** e.g. „Изван зоне плављења (Q100)“ or „Зона Q100 — заштићено насипом“. */
  floodZone: string;
  floodRisk: 'low' | 'medium' | 'high';
  seismic: {
    /** Design ground acceleration a_gR in g (SRPS EN 1998). */
    agG: number;
    /** Macroseismic intensity (MCS), e.g. 8. */
    mcs: number;
  };
  /** Soil description, e.g. „лес и лесоидне наслаге“. */
  soil: string;
  groundwaterDepthM: number;
}

export type UrbanParamComparator = 'max' | 'min';

export interface UrbanParam {
  id: string; // e.g. 'iz', 'ii', 'spratnost', 'visina', 'zelenilo', 'parking'
  /** e.g. „Индекс заузетости“. */
  label: string;
  /** Plan limit. */
  limit: number;
  /** Value in the current design. */
  design: number;
  /** Unit, may be empty for indices. */
  unit: string;
  /** `max` = design must be ≤ limit; `min` = design must be ≥ limit. */
  comparator: UrbanParamComparator;
  /** Optional display override for non-numeric params, e.g. „П+6+Пс“. */
  displayLimit?: string;
  displayDesign?: string;
}

export interface SiteInfo {
  projectId: string;
  climate: SiteClimate;
  hazards: SiteHazards;
  urbanParams: UrbanParam[];
  /** Available utilities, e.g. „Даљинско грејање (Београдске електране)“. */
  utilities: string[];
  /** Short context narrative for the site card. */
  contextNote?: string;
}

export type RequirementSource =
  | 'lokacijski-uslovi'
  | 'pdr'
  | 'zakon'
  | 'pravilnik'
  | 'sertifikacija'
  | 'projektni-zadatak'
  | 'eu';

export type RequirementStatus = 'compliant' | 'risk' | 'non-compliant' | 'unchecked';

export type RequirementCategory =
  | 'urbanizam'
  | 'energija'
  | 'konstrukcija'
  | 'zastita-od-pozara'
  | 'pristupacnost'
  | 'zelenilo'
  | 'voda'
  | 'saobracaj'
  | 'nasledje'
  | 'materijali'
  | 'ostalo';

/** A constraint/requirement that applies to a project. */
export interface Requirement {
  id: string;
  projectId: string;
  source: RequirementSource;
  /** Regulation id (from `regulations`) or document ref, plus page/article, e.g. „ЛУ стр. 4, тач. 3.2“. */
  sourceRef: string;
  /** Optional link to a library entry. */
  regulationId?: string;
  category: RequirementCategory;
  text: string;
  status: RequirementStatus;
  note?: string;
  /** True for items accepted from the AI extraction demo. */
  aiExtracted?: boolean;
}

/* ------------------------------------------------------------------------------------------------
 * Regulations & guidelines library
 * ---------------------------------------------------------------------------------------------- */

export type RegulationKind = 'zakon' | 'pravilnik' | 'standard' | 'sertifikacija' | 'eu' | 'smernica-firme';
export type Jurisdiction = 'RS' | 'EU' | 'intl' | 'firm';

export interface Regulation {
  id: string;
  /** Official code / short ref, e.g. „Сл. гласник РС 40/2021“, „SRPS EN 1998-1“, „DGNB 2023“. */
  code: string;
  title: string;
  kind: RegulationKind;
  jurisdiction: Jurisdiction;
  year: number;
  summary: string;
  keyPoints: string[];
  appliesTo: { typologies?: Typology[]; projectIds?: string[] };
  tags: string[];
}

/* ------------------------------------------------------------------------------------------------
 * Design options (Варијанте) and what-if parameters
 * ---------------------------------------------------------------------------------------------- */

export type StructureSystem = 'ab-skelet' | 'clt-ab-jezgro' | 'celik' | 'hibrid' | 'zidani' | 'postojeca' | 'drvo';
export type FacadeType = 'etics' | 'ventilisana' | 'zid-zavesa' | 'drvena' | 'opeka';
export type HeatingSystem = 'daljinsko' | 'toplotna-pumpa' | 'gas' | 'biomasa' | 'hibrid-tp-daljinsko';
export type ConcreteMix = 'cem-i' | 'cem-ii' | 'cem-iii' | 'niskoklinkerski';
/** Cladding of a ventilated facade (`facade: 'ventilisana'`). 'aris' = larch boards (combustible, class D). */
export type Cladding = 'aluminijum' | 'fiber-cement' | 'aris' | 'opeka' | 'keramika';
/** Window glazing. */
export type WindowGlazing = 'dvostruko' | 'trostruko';
/** Solar shading of the glazed facades (affects summer overheating). */
export type ShadingType = 'bez' | 'unutrasnja' | 'spoljna';

/** Inputs of the what-if model (step 6 builds `src/lib/carbonModel.ts` around this). */
export interface DesignParams {
  structure: StructureSystem;
  facade: FacadeType;
  /** Wall insulation thickness in cm. */
  insulationCm: number;
  /** Window-to-wall ratio 0..1. */
  glazingRatio: number;
  /** Rooftop/facade PV peak power in kWp. */
  pvKwp: number;
  heating: HeatingSystem;
  /** Share of reused / recycled materials by mass, 0..100 %. */
  reusedPct: number;
  concreteMix: ConcreteMix;
  /** Green roof share of roof area, 0..100 %. */
  greenRoofPct?: number;
  /** Ventilated-facade cladding (step 6). Default 'aluminijum' for `ventilisana`; ignored for other facades. */
  cladding?: Cladding;
  /** Window glazing (step 6). Default 'trostruko'. */
  windows?: WindowGlazing;
  /**
   * Concrete mix in cores, transfer slabs and above-ground RC elements (step 6). `concreteMix` then refers to
   * foundations and basements. Default = `concreteMix`.
   */
  coreConcreteMix?: ConcreteMix;
  /** Solar shading (step 6). Default 'unutrasnja'. */
  shading?: ShadingType;
  /** Mechanical ventilation with heat recovery (рекуперација) (step 6). Default false. */
  mvhr?: boolean;
}

export interface DesignResults {
  /** kgCO₂e/m² (A1–A3). */
  embodiedCarbon: number;
  /**
   * kWh/m²a — annual heating need Qh,nd (same basis as KPI 'operational-energy' and the energy-passport class).
   */
  operationalEnergy: number;
  energyClass: EnergyClass;
  /** Cost delta vs baseline option in %. */
  costDeltaPct: number;
  /** Certification points (scheme %) predicted. */
  certPoints: number;
  /** % of floor area with DF ≥ 2 %. */
  daylightPct: number;
  durationMonths: number;
  /** Optional extras saved from the what-if calculator (step 6). Whole-life carbon A1–C4 excl. B6, kgCO₂e/m². */
  wholeLifeCarbon?: number;
  /** Primary energy, kWh/m²a. */
  primaryEnergy?: number;
  /** Renewable share of final energy, %. */
  renewableSharePct?: number;
  /** Summer overheating hours per year. */
  overheatingHours?: number;
}

export type OptionStatus = 'proposed' | 'selected' | 'rejected';

export interface DesignOption {
  id: string;
  projectId: string;
  /** e.g. „Варијанта Б — CLT + АБ језгро“. */
  name: string;
  /** One-letter code for chips, e.g. „А“, „Б“, „В“. */
  code?: string;
  summary: string;
  params: DesignParams;
  results: DesignResults;
  status: OptionStatus;
  createdBy?: string;
  /** ISO date created. */
  createdAt?: IsoDate;
  /** True when saved from the what-if calculator (stored in zustand, not seed). */
  isUserCreated?: boolean;
}

/* ------------------------------------------------------------------------------------------------
 * Decisions, conditions, board sessions
 * ---------------------------------------------------------------------------------------------- */

export interface Condition {
  id: string;
  text: string;
  ownerId: string;
  dueDate: IsoDate;
  done: boolean;
}

export type DecisionStatus = 'proposed' | 'approved' | 'superseded';

export interface DecisionImpact {
  carbonDeltaPct?: number;
  energyDeltaPct?: number;
  costDeltaPct?: number;
}

/** Design Decision Record. */
export interface Decision {
  id: string;
  projectId: string;
  date: IsoDate;
  title: string;
  context: string;
  optionsConsidered: string[];
  decision: string;
  rationale: string;
  impact: DecisionImpact;
  /** Board session that took the decision, if any. */
  sessionId?: string;
  /** Person ids who decided (when not a board session). */
  decidedByIds?: string[];
  conditions: Condition[];
  status: DecisionStatus;
  /** Link to the option the decision selected, if any. */
  optionId?: string;
  isUserCreated?: boolean;
}

export type SessionOutcome = 'approved' | 'approved-with-conditions' | 'rework' | 'scheduled';

export type FindingSeverity = 'info' | 'warning' | 'critical';

/** Scripted AI pre-review finding shown in the gate review. */
export interface AiFinding {
  id: string;
  severity: FindingSeverity;
  title: string;
  detail: string;
  /** Citation, e.g. „ПДР Савски амфитеатар, чл. 12“ or a document id. */
  reference: string;
  /** Optional link to the document the finding is about. */
  documentId?: string;
  /** Optional link to a library entry (regulation / firm guideline). */
  regulationId?: string;
}

export interface BoardSession {
  id: string;
  projectId: string;
  gate: GateId;
  date: IsoDate;
  /** Board member person ids. */
  memberIds: string[];
  agenda: string[];
  /** Document ids required for this gate review. */
  requiredDocumentIds: string[];
  outcome: SessionOutcome;
  conditions: Condition[];
  /** Minutes text (Записник), for past sessions. */
  minutes?: string;
  aiFindings: AiFinding[];
  /** Optional time and place, e.g. „10:00 · сала Дунав“. */
  location?: string;
}

/* ------------------------------------------------------------------------------------------------
 * Gate review (step 10) — user progress through a board session, persisted per session id
 * ---------------------------------------------------------------------------------------------- */

/** A board member's vote = one of the three possible session outcomes. */
export type BoardVote = Exclude<SessionOutcome, 'scheduled'>;

/** What the board did with an AI pre-review finding. */
export type FindingDisposition = 'condition' | 'accepted' | 'not-relevant';

/** Reviewer's mark on a required document. */
export type DocumentReviewMark = 'accepted' | 'missing';

/** Where a condition in the review came from. */
export type ReviewConditionSource = 'carried' | 'finding' | 'kpi' | 'manual';

/** Condition drafted during a gate review (becomes a `Condition` of the board's decision). */
export interface ReviewCondition extends Condition {
  source: ReviewConditionSource;
  /** Original condition id ('carried'), finding id ('finding') or proposed decision id ('kpi'). */
  sourceId?: string;
}

export interface MemberVote {
  vote: BoardVote;
  comment?: string;
}

/** Progress and result of a gate review of one scheduled board session. */
export interface GateReviewState {
  sessionId: string;
  /** Current step index 0..5 (Припрема … Одлука). */
  step: number;
  /** Highest step index reached so far. */
  maxStep: number;
  /** Board members marked present. */
  presentIds: string[];
  /** Checked agenda items (keys: `a<index>` for seed agenda, decision id for user proposals). */
  agendaChecked: string[];
  /** Reviewer marks per required document id. */
  documentMarks: Record<string, DocumentReviewMark>;
  /** KPI ids whose deviation the board has acknowledged. */
  kpiAcknowledged: string[];
  /** The scripted AI pre-review has been run (findings are shown without replay). */
  aiRun: boolean;
  findingDispositions: Record<string, FindingDisposition>;
  conditions: ReviewCondition[];
  /** Votes by person id. */
  votes: Record<string, MemberVote>;
  /** Set when the session is closed („Заврши седницу“). */
  outcome?: BoardVote;
  /** ISO timestamp of closing the session. */
  completedAt?: string;
  /** Id of the decision record created in the store's `userDecisions`. */
  decisionId?: string;
  /** ISO timestamp of the first saved change. */
  startedAt: string;
}

/* ------------------------------------------------------------------------------------------------
 * Documents (artifact register)
 * ---------------------------------------------------------------------------------------------- */

export type DocumentType =
  | 'crtez'
  | 'elaborat-ee'
  | 'lca'
  | 'energetski-model'
  | 'bim'
  | 'geomehanika'
  | 'lokacijski-uslovi'
  | 'saglasnost'
  | 'tehnicki-opis'
  | 'proracun'
  | 'izvestaj';

export type Discipline =
  | 'arhitektura'
  | 'konstrukcija'
  | 'masinske'
  | 'elektro'
  | 'vik'
  | 'odrzivost'
  | 'urbanizam'
  | 'pejzaz'
  | 'geotehnika'
  | 'zastita-od-pozara'
  | 'upravljanje';

export type DocumentStatus = 'draft' | 'review' | 'approved' | 'superseded';

export interface DocumentVersion {
  version: string;
  date: IsoDate;
  note: string;
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  title: string;
  type: DocumentType;
  discipline: Discipline;
  /** Current version label, e.g. „v2.1“ or „Р3“. */
  version: string;
  status: DocumentStatus;
  ownerId: string;
  updated: IsoDate;
  requiredForGates: GateId[];
  history: DocumentVersion[];
}

/* ------------------------------------------------------------------------------------------------
 * Materials (EPD library + project material passport)
 * ---------------------------------------------------------------------------------------------- */

export type MaterialCategory =
  | 'beton'
  | 'celik'
  | 'drvo'
  | 'opeka'
  | 'izolacija'
  | 'staklo'
  | 'aluminijum'
  | 'zavrsne-obrade'
  | 'krovni'
  | 'instalacije'
  | 'kamen'
  | 'ostalo';

export type ReusePotential = 'high' | 'medium' | 'low';

export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  /** Declared unit, e.g. „m³“, „t“, „m²“, „kg“. */
  unit: string;
  /** Global warming potential A1–A3 in kgCO₂e per declared unit. */
  gwpA1A3: number;
  /** EPD source, e.g. „EPD Holcim Србија 2024“, „ÖKOBAUDAT“. */
  epdSource: string;
  /** Production city (for distance), e.g. „Беочин“. */
  originCity: string;
  /** Transport distance to Belgrade, km. */
  distanceKm: number;
  /** Recycled content 0..100 %. */
  recycledPct: number;
  reusePotential: ReusePotential;
  bioBased: boolean;
  /** Optional note, e.g. „са FSC сертификатом“. */
  note?: string;
  /** Fictional supplier / plant, e.g. „Бетон-Кеј д.о.о., погон Сурчин“. */
  supplier?: string;
}

export type BuildingLayer = 'konstrukcija' | 'fasada' | 'krov' | 'unutrasnjost' | 'instalacije' | 'spoljno';

export interface ProjectMaterial {
  projectId: string;
  materialId: string;
  layer: BuildingLayer;
  /** Building element, e.g. „Међуспратне таванице“. */
  element: string;
  /** Quantity in the material's declared unit. */
  quantity: number;
  /** Designed for disassembly. */
  demountable: boolean;
  /** Material is reused (reclaimed on site or from another building) rather than newly produced. */
  reused?: boolean;
  note?: string;
}

/* ------------------------------------------------------------------------------------------------
 * Stakeholders
 * ---------------------------------------------------------------------------------------------- */

export type StakeholderAttitude = 'supportive' | 'neutral' | 'opposed';
export type EngagementKind = 'sastanak' | 'dopis' | 'saglasnost' | 'javna-rasprava';

export interface EngagementLogEntry {
  date: IsoDate;
  kind: EngagementKind;
  summary: string;
  /** Entry added by the user in the demo (stored in the app store, not in seed data). */
  isUserCreated?: boolean;
}

export interface Stakeholder {
  id: string;
  projectId: string;
  /** Contact or group name, e.g. „Станари суседних зграда“. */
  name: string;
  organization: string;
  /** Role in the project, e.g. „Инвеститор“, „Издаје сагласност“. */
  role: string;
  /** 1 (low) – 5 (high). */
  influence: 1 | 2 | 3 | 4 | 5;
  /** 1 (low) – 5 (high). */
  interest: 1 | 2 | 3 | 4 | 5;
  attitude: StakeholderAttitude;
  obligations: string[];
  log: EngagementLogEntry[];
  nextAction?: string;
}

/* ------------------------------------------------------------------------------------------------
 * People
 * ---------------------------------------------------------------------------------------------- */

export interface Allocation {
  projectId: string;
  /** Percentage of FTE, 0..100. */
  pct: number;
}

export interface Person {
  id: string;
  name: string;
  /** Two Cyrillic letters, e.g. „АЈ“. */
  initials: string;
  /** Role in the firm, e.g. „Партнер“, „Водећи архитекта“. */
  role: string;
  discipline: Discipline;
  /** Licences, e.g. „ИКС 300“, „ИКС 381“. */
  licences: string[];
  /** Certifications, e.g. „DGNB Consultant“, „LEED AP BD+C“, „EDGE Expert“. */
  certifications: string[];
  allocations: Allocation[];
  /** Office, e.g. „Београд“ / „Нови Сад“. */
  office?: string;
  /** Member of the design board. */
  boardMember?: boolean;
  /** Competency scores 0..3 by competency key, used in the /tim matrix. */
  competencies?: Partial<Record<Competency, 0 | 1 | 2 | 3>>;
}

export type Competency =
  | 'lca'
  | 'energetsko-modelovanje'
  | 'bim'
  | 'drvene-konstrukcije'
  | 'sertifikacija'
  | 'cirkularnost'
  | 'pejzaz'
  | 'nasledje';

/* ------------------------------------------------------------------------------------------------
 * Risks
 * ---------------------------------------------------------------------------------------------- */

export type RiskCategory = 'regulatorni' | 'tehnicki' | 'troskovni' | 'vremenski' | 'klimatski' | 'lanac-snabdevanja';
export type RiskStatus = 'open' | 'mitigating' | 'closed';

export interface Risk {
  id: string;
  projectId: string;
  title: string;
  category: RiskCategory;
  /** 1 (rare) – 5 (almost certain). */
  probability: 1 | 2 | 3 | 4 | 5;
  /** 1 (negligible) – 5 (severe). */
  impact: 1 | 2 | 3 | 4 | 5;
  ownerId: string;
  mitigation: string;
  status: RiskStatus;
}

/* ------------------------------------------------------------------------------------------------
 * Certification
 * ---------------------------------------------------------------------------------------------- */

export interface CertificationCategoryScore {
  /** e.g. 'ENV', 'ECO', 'SOC', 'TEC', 'PRO', 'SITE' (DGNB) or 'Energy', 'Water' (EDGE). */
  id: string;
  label: string;
  /** Category weight in the total score, % (0..100). */
  weight: number;
  /** Max achievable points. */
  max: number;
  targeted: number;
  achieved: number;
  atRisk: number;
}

/** Award thresholds for the score ring, in % of max, e.g. [{label:'Silver', min:50}, …]. */
export interface CertificationThreshold {
  label: string;
  min: number;
}

export interface CertificationCategory {
  projectId: string;
  scheme: CertificationScheme;
  categories: CertificationCategoryScore[];
  thresholds: CertificationThreshold[];
}

export type CriterionStatus = 'achieved' | 'on-track' | 'at-risk' | 'not-started';

export interface CertificationCriterion {
  id: string;
  projectId: string;
  /** References `CertificationCategoryScore.id`. */
  categoryId: string;
  /** Code + label, e.g. „ENV1.1 Еколошки биланс у животном циклусу“. */
  label: string;
  ownerId: string;
  status: CriterionStatus;
  /** Predicted points (DGNB: criterion points 0..100; LEED/BREEAM: credits; EDGE/Passivhaus: measure value). */
  points?: number;
  /** Max points of the criterion in the same unit as `points`. */
  maxPoints?: number;
  evidenceDocumentId?: string;
}

/* ------------------------------------------------------------------------------------------------
 * Attention items („Захтева пажњу“ on the portfolio and project overview)
 * ---------------------------------------------------------------------------------------------- */

/** Scripted alert shown in „Захтева пажњу“. Tells the same story as KPIs, decisions and risks. */
export interface AttentionItem {
  id: string;
  projectId: string;
  severity: FindingSeverity;
  /** One-line headline, e.g. „Уграђени угљеник 12% изнад циља након промене фасаде“. */
  title: string;
  detail?: string;
  /** Project tab slug the item links to (see `PROJECT_TABS` in navigation.ts), e.g. 'ciljevi'. */
  tab?: string;
  date: IsoDate;
}

/* ------------------------------------------------------------------------------------------------
 * Activity & feedback
 * ---------------------------------------------------------------------------------------------- */

export type ActivityKind = 'document' | 'decision' | 'kpi' | 'comment' | 'gate' | 'risk' | 'stakeholder' | 'option';

export interface ActivityItem {
  id: string;
  projectId: string;
  /** ISO timestamp or date. */
  date: string;
  actorId: string;
  text: string;
  kind: ActivityKind;
}

export type FeedbackRating = 'up' | 'meh' | 'down';

/** One feedback answer from the demo audience. One entry per (moduleId, sessionLabel) — later answers replace. */
export interface FeedbackEntry {
  moduleId: string;
  rating: FeedbackRating;
  note?: string;
  /** Presenter-defined session label, e.g. „Сесија: Студио X“. */
  sessionLabel?: string;
  /** ISO timestamp. */
  timestamp: string;
}
