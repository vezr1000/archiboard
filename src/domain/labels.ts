/**
 * Serbian Cyrillic labels for every enum in `types.ts`, plus ordered lists and tone (colour) maps.
 * Use these instead of hard-coding labels in features.
 *
 *   import { PHASE_LABELS, HEALTH_TONE } from '@/domain/labels';
 *   PHASE_LABELS.pgd.short  // „ПГД“
 */
import type {
  Cladding,
  ShadingType,
  WindowGlazing,
  ActivityKind,
  BuildingLayer,
  CertificationScheme,
  CheckStatus,
  Competency,
  ConcreteMix,
  CriterionStatus,
  DecisionStatus,
  Discipline,
  DocumentStatus,
  DocumentType,
  EnergyClass,
  EngagementKind,
  FacadeType,
  FeedbackRating,
  FindingDisposition,
  FindingSeverity,
  GateId,
  Health,
  HeatingSystem,
  Jurisdiction,
  KpiDirection,
  MaterialCategory,
  OptionStatus,
  Phase,
  RegulationKind,
  RequirementCategory,
  RequirementSource,
  RequirementStatus,
  ReusePotential,
  ReviewConditionSource,
  RiskCategory,
  RiskStatus,
  SessionOutcome,
  StakeholderAttitude,
  StructureSystem,
  Tone,
  Typology,
} from './types';

/* ---------- Phases & gates ---------- */

/** Phases in delivery order. */
export const PHASES: Phase[] = ['zadatak', 'idr', 'pgd', 'pzi', 'gradnja', 'pio', 'upotreba'];

export const PHASE_LABELS: Record<Phase, { short: string; long: string }> = {
  zadatak: { short: 'Задатак', long: 'Пројектни задатак' },
  idr: { short: 'ИДР', long: 'Идејно решење' },
  pgd: { short: 'ПГД', long: 'Пројекат за грађевинску дозволу' },
  pzi: { short: 'ПЗИ', long: 'Пројекат за извођење' },
  gradnja: { short: 'Градња', long: 'Градња' },
  pio: { short: 'ПИО', long: 'Пројекат изведеног објекта' },
  upotreba: { short: 'Употреба', long: 'Употреба и праћење' },
};

/** 0-based index of a phase, handy for comparisons (`phaseIndex(a) < phaseIndex(b)`). */
export const phaseIndex = (p: Phase): number => PHASES.indexOf(p);

export const GATES: GateId[] = ['G0', 'G1', 'G2', 'G3', 'G4', 'G5'];

export const GATE_LABELS: Record<GateId, { code: string; name: string; full: string }> = {
  G0: { code: 'Г0', name: 'Покретање', full: 'Г0 Покретање' },
  G1: { code: 'Г1', name: 'Концепт / ИДР', full: 'Г1 Концепт / ИДР' },
  G2: { code: 'Г2', name: 'ПГД', full: 'Г2 ПГД' },
  G3: { code: 'Г3', name: 'ПЗИ', full: 'Г3 ПЗИ' },
  G4: { code: 'Г4', name: 'Градња / технички преглед', full: 'Г4 Градња / технички преглед' },
  G5: { code: 'Г5', name: 'Употреба / POE', full: 'Г5 Употреба / POE' },
};

/** The phase each gate closes (gate sits at the END of this phase). */
export const GATE_CLOSES_PHASE: Record<GateId, Phase> = {
  G0: 'zadatak',
  G1: 'idr',
  G2: 'pgd',
  G3: 'pzi',
  G4: 'gradnja',
  G5: 'upotreba',
};

/* ---------- Health & generic status ---------- */

export const HEALTH_LABELS: Record<Health, { short: string; long: string }> = {
  'on-track': { short: 'У складу', long: 'У складу са циљем' },
  'at-risk': { short: 'Ризик', long: 'Ризик од одступања' },
  'off-track': { short: 'Одступање', long: 'Одступање од циља' },
};
export const HEALTH_TONE: Record<Health, Tone> = { 'on-track': 'good', 'at-risk': 'warn', 'off-track': 'bad' };

export const CHECK_STATUS_LABELS: Record<CheckStatus, string> = {
  pass: 'Испуњено',
  warn: 'Упозорење',
  fail: 'Није испуњено',
};
export const CHECK_STATUS_TONE: Record<CheckStatus, Tone> = { pass: 'good', warn: 'warn', fail: 'bad' };

/* ---------- Projects ---------- */

export const TYPOLOGY_LABELS: Record<Typology, string> = {
  'stambeno-poslovni': 'Стамбено-пословни',
  stambeni: 'Стамбени',
  poslovni: 'Пословни',
  obrazovni: 'Образовни',
  predskolski: 'Предшколски',
  'javni-prostor': 'Јавни простор',
  'adaptivna-prenamena': 'Адаптивна пренамена',
};

export const SCHEME_LABELS: Record<CertificationScheme, string> = {
  DGNB: 'DGNB',
  LEED: 'LEED v4.1',
  BREEAM: 'BREEAM',
  EDGE: 'EDGE',
  WELL: 'WELL',
  Passivhaus: 'Passivhaus',
  none: 'Без сертификације',
};

/* ---------- KPIs ---------- */

export const KPI_DIRECTION_LABELS: Record<KpiDirection, string> = {
  'lower-better': 'мање је боље',
  'higher-better': 'више је боље',
};

export const KPI_BENCHMARK_LABELS = {
  regulatoryMin: 'Пропис (РС)',
  euTaxonomy: 'EU таксономија',
  firmTarget: 'Циљ фирме',
  bestPractice: 'Најбоља пракса',
  projectTarget: 'Циљ пројекта',
} as const;

/** Ambition levels used by the KPI page selector. */
export const AMBITION_LEVELS = [
  { id: 'minimum', label: 'Минимум' },
  { id: 'dobra-praksa', label: 'Добра пракса' },
  { id: 'predvodnik', label: 'Предводник' },
] as const;

export const ENERGY_CLASSES: EnergyClass[] = ['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];
/** Numeric encoding of energy classes for charts: A+ = 1 … G = 8 (lower is better). */
export const ENERGY_CLASS_SCALE: Record<EnergyClass, number> = { 'A+': 1, A: 2, B: 3, C: 4, D: 5, E: 6, F: 7, G: 8 };
export const energyClassFromScale = (n: number): EnergyClass =>
  ENERGY_CLASSES[Math.min(ENERGY_CLASSES.length - 1, Math.max(0, Math.round(n) - 1))];
/** Displayed class label (Latin letter as on the energy passport). */
export const energyClassTone = (c: EnergyClass): Tone =>
  ENERGY_CLASS_SCALE[c] <= 2 ? 'good' : ENERGY_CLASS_SCALE[c] <= 4 ? 'warn' : 'bad';

/* ---------- Site & requirements ---------- */

export const REQUIREMENT_SOURCE_LABELS: Record<RequirementSource, string> = {
  'lokacijski-uslovi': 'Локацијски услови',
  pdr: 'План (ПДР/ПГР)',
  zakon: 'Закон',
  pravilnik: 'Правилник',
  sertifikacija: 'Сертификација',
  'projektni-zadatak': 'Пројектни задатак',
  eu: 'ЕУ',
};

export const REQUIREMENT_STATUS_LABELS: Record<RequirementStatus, string> = {
  compliant: 'Усклађено',
  risk: 'Ризик',
  'non-compliant': 'Неусклађено',
  unchecked: 'Непроверено',
};
export const REQUIREMENT_STATUS_TONE: Record<RequirementStatus, Tone> = {
  compliant: 'good',
  risk: 'warn',
  'non-compliant': 'bad',
  unchecked: 'neutral',
};

export const REQUIREMENT_CATEGORY_LABELS: Record<RequirementCategory, string> = {
  urbanizam: 'Урбанизам',
  energija: 'Енергија',
  konstrukcija: 'Конструкција',
  'zastita-od-pozara': 'Заштита од пожара',
  pristupacnost: 'Приступачност',
  zelenilo: 'Зеленило',
  voda: 'Вода',
  saobracaj: 'Саобраћај и паркирање',
  nasledje: 'Културно наслеђе',
  materijali: 'Материјали',
  ostalo: 'Остало',
};

export const FLOOD_RISK_LABELS = { low: 'Низак', medium: 'Средњи', high: 'Висок' } as const;
export const FLOOD_RISK_TONE: Record<'low' | 'medium' | 'high', Tone> = { low: 'good', medium: 'warn', high: 'bad' };

/** Serbian compass abbreviations (С, СИ, И, ЈИ, Ј, ЈЗ, З, СЗ …). */
export const COMPASS_LABELS: Record<string, string> = {
  N: 'С', NNE: 'ССИ', NE: 'СИ', ENE: 'ИСИ', E: 'И', ESE: 'ИЈИ', SE: 'ЈИ', SSE: 'ЈЈИ',
  S: 'Ј', SSW: 'ЈЈЗ', SW: 'ЈЗ', WSW: 'ЗЈЗ', W: 'З', WNW: 'ЗСЗ', NW: 'СЗ', NNW: 'ССЗ',
};

/* ---------- Regulations ---------- */

export const REGULATION_KIND_LABELS: Record<RegulationKind, string> = {
  zakon: 'Закон',
  pravilnik: 'Правилник',
  standard: 'Стандард',
  sertifikacija: 'Сертификациони систем',
  eu: 'ЕУ пропис',
  'smernica-firme': 'Смерница фирме',
};

export const JURISDICTION_LABELS: Record<Jurisdiction, string> = {
  RS: 'Србија',
  EU: 'Европска унија',
  intl: 'Међународно',
  firm: 'Студио Градина',
};

/* ---------- Design options ---------- */

export const STRUCTURE_LABELS: Record<StructureSystem, string> = {
  'ab-skelet': 'АБ скелет',
  'clt-ab-jezgro': 'CLT + АБ језгро',
  celik: 'Челична конструкција',
  hibrid: 'Хибридна (дрво–бетон)',
  zidani: 'Зидани систем',
  postojeca: 'Постојећа конструкција',
  drvo: 'Дрвени скелет',
};

export const FACADE_LABELS: Record<FacadeType, string> = {
  etics: 'ETICS (контактна)',
  ventilisana: 'Вентилисана фасада',
  'zid-zavesa': 'Зид-завеса',
  drvena: 'Дрвена облога',
  opeka: 'Фасадна опека',
};

export const HEATING_LABELS: Record<HeatingSystem, string> = {
  daljinsko: 'Даљинско грејање',
  'toplotna-pumpa': 'Топлотна пумпа',
  gas: 'Гасни котао',
  biomasa: 'Биомаса',
  'hibrid-tp-daljinsko': 'Топлотна пумпа + даљинско',
};

export const CLADDING_LABELS: Record<Cladding, string> = {
  aluminijum: 'Алуминијумски панели',
  'fiber-cement': 'Фибер-цементне плоче',
  aris: 'Облога од ариша',
  opeka: 'Фасадна опека',
  keramika: 'Керамичке плоче',
};

export const WINDOWS_LABELS: Record<WindowGlazing, string> = {
  dvostruko: 'Двоструко застакљење',
  trostruko: 'Троструко застакљење',
};

export const SHADING_LABELS: Record<ShadingType, string> = {
  bez: 'Без засене',
  unutrasnja: 'Унутрашња',
  spoljna: 'Спољна покретна',
};

export const CONCRETE_MIX_LABELS: Record<ConcreteMix, string> = {
  'cem-i': 'CEM I',
  'cem-ii': 'CEM II',
  'cem-iii': 'CEM III/A',
  niskoklinkerski: 'Нискоклинкерски (LC3)',
};

export const OPTION_STATUS_LABELS: Record<OptionStatus, string> = {
  proposed: 'Предлог',
  selected: 'Изабрана',
  rejected: 'Одбачена',
};
export const OPTION_STATUS_TONE: Record<OptionStatus, Tone> = { proposed: 'info', selected: 'accent', rejected: 'neutral' };

/* ---------- Decisions & board ---------- */

export const DECISION_STATUS_LABELS: Record<DecisionStatus, string> = {
  proposed: 'Предлог',
  approved: 'Усвојено',
  superseded: 'Замењено',
};
export const DECISION_STATUS_TONE: Record<DecisionStatus, Tone> = { proposed: 'info', approved: 'good', superseded: 'neutral' };

export const SESSION_OUTCOME_LABELS: Record<SessionOutcome, string> = {
  approved: 'Одобрено',
  'approved-with-conditions': 'Одобрено уз услове',
  rework: 'Враћено на дораду',
  scheduled: 'Заказано',
};
export const SESSION_OUTCOME_TONE: Record<SessionOutcome, Tone> = {
  approved: 'good',
  'approved-with-conditions': 'warn',
  rework: 'bad',
  scheduled: 'info',
};

export const FINDING_SEVERITY_LABELS: Record<FindingSeverity, string> = {
  info: 'Информација',
  warning: 'Упозорење',
  critical: 'Критично',
};
export const FINDING_SEVERITY_TONE: Record<FindingSeverity, Tone> = { info: 'info', warning: 'warn', critical: 'bad' };

/** Gate review (step 10): what the board did with an AI finding. */
export const FINDING_DISPOSITION_LABELS: Record<FindingDisposition, string> = {
  condition: 'Претвори у услов',
  accepted: 'Прихваћено',
  'not-relevant': 'Није релевантно',
};
/** Past-tense labels for the minutes. */
export const FINDING_DISPOSITION_DONE_LABELS: Record<FindingDisposition, string> = {
  condition: 'претворено у услов',
  accepted: 'прихваћено',
  'not-relevant': 'није релевантно',
};
export const FINDING_DISPOSITION_TONE: Record<FindingDisposition, Tone> = {
  condition: 'clay',
  accepted: 'good',
  'not-relevant': 'neutral',
};

export const REVIEW_CONDITION_SOURCE_LABELS: Record<ReviewConditionSource, string> = {
  carried: 'пренето',
  finding: 'из АИ налаза',
  kpi: 'предложена мера',
  manual: 'ново',
};

/* ---------- Documents ---------- */

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  crtez: 'Цртеж',
  'elaborat-ee': 'Елаборат ЕЕ',
  lca: 'LCA извештај',
  'energetski-model': 'Енергетски модел',
  bim: 'BIM модел',
  geomehanika: 'Геомеханички елаборат',
  'lokacijski-uslovi': 'Локацијски услови',
  saglasnost: 'Сагласност',
  'tehnicki-opis': 'Технички опис',
  proracun: 'Прорачун',
  izvestaj: 'Извештај',
};

export const DISCIPLINE_LABELS: Record<Discipline, string> = {
  arhitektura: 'Архитектура',
  konstrukcija: 'Конструкција',
  masinske: 'Машинске инсталације',
  elektro: 'Електро инсталације',
  vik: 'Хидротехничке инсталације',
  odrzivost: 'Одрживост',
  urbanizam: 'Урбанизам',
  pejzaz: 'Пејзажна архитектура',
  geotehnika: 'Геотехника',
  'zastita-od-pozara': 'Заштита од пожара',
  upravljanje: 'Управљање пројектом',
};

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  draft: 'У изради',
  review: 'На ревизији',
  approved: 'Одобрено',
  superseded: 'Замењено',
};
export const DOCUMENT_STATUS_TONE: Record<DocumentStatus, Tone> = {
  draft: 'neutral',
  review: 'info',
  approved: 'good',
  superseded: 'neutral',
};

/* ---------- Materials ---------- */

export const MATERIAL_CATEGORY_LABELS: Record<MaterialCategory, string> = {
  beton: 'Бетон',
  celik: 'Челик',
  drvo: 'Дрво',
  opeka: 'Опека и блокови',
  izolacija: 'Изолација',
  staklo: 'Стакло',
  aluminijum: 'Алуминијум',
  'zavrsne-obrade': 'Завршне обраде',
  krovni: 'Кровни материјали',
  instalacije: 'Инсталације',
  kamen: 'Камен',
  ostalo: 'Остало',
};

export const REUSE_POTENTIAL_LABELS: Record<ReusePotential, string> = { high: 'Висок', medium: 'Средњи', low: 'Низак' };
export const REUSE_POTENTIAL_TONE: Record<ReusePotential, Tone> = { high: 'good', medium: 'warn', low: 'neutral' };

export const BUILDING_LAYERS: BuildingLayer[] = ['konstrukcija', 'fasada', 'krov', 'unutrasnjost', 'instalacije', 'spoljno'];
export const BUILDING_LAYER_LABELS: Record<BuildingLayer, string> = {
  konstrukcija: 'Конструкција',
  fasada: 'Фасада',
  krov: 'Кров',
  unutrasnjost: 'Унутрашњост',
  instalacije: 'Инсталације',
  spoljno: 'Спољно уређење',
};

/* ---------- Stakeholders ---------- */

export const ATTITUDE_LABELS: Record<StakeholderAttitude, string> = {
  supportive: 'Подржава',
  neutral: 'Неутралан',
  opposed: 'Противи се',
};
export const ATTITUDE_TONE: Record<StakeholderAttitude, Tone> = { supportive: 'good', neutral: 'neutral', opposed: 'bad' };

export const ENGAGEMENT_KIND_LABELS: Record<EngagementKind, string> = {
  sastanak: 'Састанак',
  dopis: 'Допис',
  saglasnost: 'Сагласност',
  'javna-rasprava': 'Јавна расправа',
};

/* ---------- Risks ---------- */

export const RISK_CATEGORY_LABELS: Record<RiskCategory, string> = {
  regulatorni: 'Регулаторни',
  tehnicki: 'Технички',
  troskovni: 'Трошковни',
  vremenski: 'Временски',
  klimatski: 'Климатски',
  'lanac-snabdevanja': 'Ланац снабдевања',
};

export const RISK_STATUS_LABELS: Record<RiskStatus, string> = {
  open: 'Отворен',
  mitigating: 'Ублажава се',
  closed: 'Затворен',
};
export const RISK_STATUS_TONE: Record<RiskStatus, Tone> = { open: 'bad', mitigating: 'warn', closed: 'neutral' };

/** Risk score = probability × impact (1..25) → tone. */
export const riskScoreTone = (score: number): Tone => (score >= 15 ? 'bad' : score >= 8 ? 'warn' : 'good');

/* ---------- Certification ---------- */

export const CRITERION_STATUS_LABELS: Record<CriterionStatus, string> = {
  achieved: 'Остварено',
  'on-track': 'У току',
  'at-risk': 'Угрожено',
  'not-started': 'Није започето',
};
export const CRITERION_STATUS_TONE: Record<CriterionStatus, Tone> = {
  achieved: 'good',
  'on-track': 'info',
  'at-risk': 'warn',
  'not-started': 'neutral',
};

/* ---------- People ---------- */

export const COMPETENCY_LABELS: Record<Competency, string> = {
  lca: 'LCA',
  'energetsko-modelovanje': 'Енергетско моделовање',
  bim: 'BIM',
  'drvene-konstrukcije': 'Дрвене конструкције',
  sertifikacija: 'Сертификација',
  cirkularnost: 'Циркуларност',
  pejzaz: 'Пејзаж',
  nasledje: 'Наслеђе',
};

/* ---------- Activity & feedback ---------- */

export const ACTIVITY_KIND_LABELS: Record<ActivityKind, string> = {
  document: 'Документ',
  decision: 'Одлука',
  kpi: 'KPI',
  comment: 'Коментар',
  gate: 'Одбор',
  risk: 'Ризик',
  stakeholder: 'Заинтересована страна',
  option: 'Варијанта',
};

export const FEEDBACK_RATING_LABELS: Record<FeedbackRating, string> = { up: 'Да', meh: 'Можда', down: 'Не' };
export const FEEDBACK_RATING_TONE: Record<FeedbackRating, Tone> = { up: 'good', meh: 'warn', down: 'bad' };
