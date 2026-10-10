/**
 * What-if carbon & energy model for the Варијанте tab (CONCEPT §6.5).
 *
 * A TRANSPARENT, SIMPLIFIED parametric demo model — not an LCA (EN 15978) and not an energy simulation. It turns the
 * design parameters of an option (`DesignParams`) into the numbers the board looks at: embodied carbon A1–A3 per
 * building element, whole-life carbon A1–C4 (excl. B6), heating need Qh,nd → energy class, primary energy, renewable
 * share, cost delta, certification points, daylight, summer overheating and construction duration, plus two
 * compliance flags (EU Taxonomy, fire rule for combustible cladding above 22 m).
 *
 * How it stays credible
 * 1. Physics-shaped formulas with round, documented coefficients (`COEFFICIENT_TABLE` renders „Како рачунамо“).
 *    Coefficients for the facade/structure come from the flagship material passport (Савски кеј, 358 kgCO₂e/m²).
 * 2. Project calibration: `raw(params)` is shifted by an offset per output so that the project's anchor option (the
 *    selected seed option, or the project's current KPIs when it has no options) is reproduced exactly. Changing a
 *    parameter therefore moves results by the model's physical delta, from the project's real level.
 * 3. Per-option residuals: other seed options are reproduced exactly by carrying their own small residual when they
 *    are loaded as anchor (`calibrate(ctx, option.params, option.results, projectCalibration)`). `npm run check:model`
 *    asserts that every seed option is reproduced and that embodied-carbon residuals stay ≤ 1 kgCO₂e/m², i.e. one
 *    model explains all seed options' carbon; residuals of the other metrics are reported.
 *
 * Pure TypeScript, no runtime imports (Node type stripping runs it in `scripts/check-model.ts`).
 */
import type {
  CertificationScheme,
  Cladding,
  ConcreteMix,
  DesignOption,
  DesignParams,
  DesignResults,
  EnergyClass,
  FacadeType,
  HeatingSystem,
  Project,
  ShadingType,
  StructureSystem,
  Typology,
  WindowGlazing,
} from '@/domain/types';

/* ================================================================================================
 * 1. Coefficients (all per m² БРГП unless stated; carbon = fossil GWP A1–A3, kgCO₂e)
 * ============================================================================================== */

export interface StructureCoef {
  /** Carbon of the load-bearing structure incl. foundations, basements, rebar and screeds, at the reference geometry
   *  (mid-rise, 2 basements; `structureScale` = 1) with CEM II concrete. kgCO₂e/m². */
  carbon: number;
  /** Share of `carbon` in foundation / basement concrete (follows `concreteMix`). */
  foundationShare: number;
  /** Share of `carbon` in cores, transfer slabs and above-ground RC (follows `coreConcreteMix`). */
  coreShare: number;
  /** Extra cost vs AB skeleton, €/m². */
  cost: number;
  /** Duration vs AB skeleton, months (reference project size). */
  months: number;
  /** Thermal mass class (summer overheating). */
  mass: 'light' | 'medium' | 'heavy';
  /** Extra transmission losses through thermal bridges (share of H_T). */
  thermalBridge: number;
}

export const STRUCTURE: Record<StructureSystem, StructureCoef> = {
  'ab-skelet': { carbon: 315.4, foundationShare: 0.34, coreShare: 0.36, cost: 0, months: 0, mass: 'heavy', thermalBridge: 0.15 },
  'clt-ab-jezgro': { carbon: 245, foundationShare: 0.44, coreShare: 0.13, cost: 40, months: -4, mass: 'light', thermalBridge: 0.05 },
  hibrid: { carbon: 276, foundationShare: 0.4, coreShare: 0.26, cost: 60, months: -3.5, mass: 'medium', thermalBridge: 0.1 },
  celik: { carbon: 300, foundationShare: 0.3, coreShare: 0.12, cost: 60, months: -3, mass: 'light', thermalBridge: 0.15 },
  zidani: { carbon: 235, foundationShare: 0.35, coreShare: 0.08, cost: -15, months: 2, mass: 'heavy', thermalBridge: 0.1 },
  drvo: { carbon: 150, foundationShare: 0.4, coreShare: 0, cost: 45, months: -5, mass: 'light', thermalBridge: 0.05 },
  postojeca: { carbon: 120, foundationShare: 0.2, coreShare: 0.3, cost: -150, months: -8, mass: 'heavy', thermalBridge: 0.2 },
};

/** Concrete mix: GWP factor of the concrete relative to CEM II/B-M, extra cost €/m³-equivalent folded into €/m². */
export const CONCRETE: Record<ConcreteMix, { factor: number; cost: number }> = {
  'cem-i': { factor: 1.18, cost: -1 },
  'cem-ii': { factor: 1, cost: 0 },
  'cem-iii': { factor: 0.77, cost: 1 },
  niskoklinkerski: { factor: 0.7, cost: 3 },
};

export interface FacadeCoef {
  /** Wall system carbon per m² of opaque wall, excluding insulation; `null` = taken from the cladding (ventilated). */
  system: number | null;
  /** Insulation carbon per cm and m² of wall. */
  insulationPerCm: number;
  /** Thermal resistance of the wall without the added insulation, m²K/W. */
  rBase: number;
  /** Wall system cost per m² of opaque wall excl. insulation (ventilated: cladding cost is added). */
  cost: number;
  /** Duration vs ETICS, months. */
  months: number;
  /** Heavy outer leaf (helps against overheating). */
  heavy: boolean;
  /** Combustible outer layer (fire rule above 22 m). */
  combustible: boolean;
}

export const FACADE: Record<FacadeType, FacadeCoef> = {
  etics: { system: 22, insulationPerCm: 1.2, rBase: 0.45, cost: 70, months: 0, heavy: true, combustible: false },
  ventilisana: { system: null, insulationPerCm: 0.85, rBase: 0.95, cost: 30, months: 0, heavy: false, combustible: false },
  'zid-zavesa': { system: 150, insulationPerCm: 0.85, rBase: 0.6, cost: 420, months: 0.5, heavy: false, combustible: false },
  drvena: { system: 8, insulationPerCm: 0.6, rBase: 0.6, cost: 150, months: 0.2, heavy: false, combustible: true },
  opeka: { system: 40, insulationPerCm: 1, rBase: 0.55, cost: 160, months: 0.5, heavy: true, combustible: false },
};

/**
 * Ventilated-facade cladding packages per m² of opaque wall: cladding + subframe + accompanying layers.
 * Aluminium = 3 mm panels (78) + aluminium subframe (28,5) + non-combustible board on CLT (2,6) — flagship passport.
 * Larch = boards on timber battens. Fibre-cement and ceramics keep the aluminium subframe (dec-sk-09).
 */
export const CLADDING: Record<Cladding, { carbon: number; cost: number; combustible: boolean; fireClass: string }> = {
  aluminijum: { carbon: 109, cost: 210, combustible: false, fireClass: 'A1' },
  'fiber-cement': { carbon: 42.3, cost: 140, combustible: false, fireClass: 'A2-s1,d0' },
  aris: { carbon: 2, cost: 96, combustible: true, fireClass: 'D-s2,d0' },
  opeka: { carbon: 60, cost: 160, combustible: false, fireClass: 'A1' },
  keramika: { carbon: 53.4, cost: 175, combustible: false, fireClass: 'A1' },
};

/** Windows per m² of glazed area: carbon, U-value W/m²K, solar g-value, light transmittance, cost €/m². */
export const WINDOWS: Record<WindowGlazing, { carbon: number; u: number; gValue: number; lightT: number; cost: number }> = {
  dvostruko: { carbon: 125, u: 1.2, gValue: 0.6, lightT: 0.78, cost: 380 },
  trostruko: { carbon: 145, u: 0.8, gValue: 0.5, lightT: 0.7, cost: 470 },
};

export interface HeatingCoef {
  /** Embodied carbon of the plant, kgCO₂e/m². */
  carbon: number;
  /** Cost €/m². */
  cost: number;
  /** Duration, months. */
  months: number;
  /** Share of heat delivered by heat pumps. */
  heatPumpShare: number;
  /** Share of heat from biomass. */
  biomassShare: number;
  /** Primary energy per kWh of delivered heat (non-heat-pump part). */
  primaryPerKwh: number;
}

/** Heat pump seasonal COP and the primary energy factor of grid electricity (Serbia, coal-heavy grid). */
export const HEAT_PUMP_SCOP = 3.4;
export const FP_ELECTRICITY = 2.5;

export const HEATING: Record<HeatingSystem, HeatingCoef> = {
  daljinsko: { carbon: 0.5, cost: 25, months: 0, heatPumpShare: 0, biomassShare: 0, primaryPerKwh: 1.45 },
  'toplotna-pumpa': { carbon: 3, cost: 70, months: 0.2, heatPumpShare: 1, biomassShare: 0, primaryPerKwh: 0 },
  gas: { carbon: 0.5, cost: 30, months: 0, heatPumpShare: 0, biomassShare: 0, primaryPerKwh: 1.16 },
  biomasa: { carbon: 1.5, cost: 60, months: 0.3, heatPumpShare: 0, biomassShare: 1, primaryPerKwh: 0.24 },
  'hibrid-tp-daljinsko': { carbon: 1.3, cost: 40, months: 0, heatPumpShare: 0.4, biomassShare: 0, primaryPerKwh: 1.45 },
};

/** Shading: overheating multiplier, winter solar-gain multiplier, cost €/m² of glazing. */
export const SHADING: Record<ShadingType, { summer: number; winter: number; cost: number }> = {
  bez: { summer: 1.25, winter: 1, cost: 0 },
  unutrasnja: { summer: 1, winter: 1, cost: 25 },
  spoljna: { summer: 0.55, winter: 0.95, cost: 140 },
};

/** Scalar constants. */
export const K = {
  /** PV modules incl. mounting, kgCO₂e per kWp (flagship passport: 6,2 kg/m² for 120 kWp on 18.400 m²). */
  pvCarbonPerKwp: 950,
  pvCostPerKwp: 900,
  /** Specific PV yield, kWh/kWp·a (Pannonian plain). */
  pvYield: 1200,
  /** Roof build-up (insulation, waterproofing) per m² of roof, and extra per m² of green roof. */
  roofCarbon: 40,
  greenRoofCarbon: 20,
  greenRoofCost: 70,
  /** Thermal conductivity of the added insulation, W/mK. */
  lambda: 0.035,
  /** Insulation cost per cm and m² of wall. */
  insulationCostPerCm: 1.6,
  /** Roof U-value, W/m²K (green roof improves it slightly). */
  roofU: 0.15,
  /** Usable share of free heat gains in the heating season. */
  gainUtilisation: 0.9,
  /** Useful solar radiation on glazing in the heating season, kWh/m² (mixed orientations, frame and obstruction). */
  winterSolar: 75,
  /** Reused / recycled share: −carbon of the structure per % of mass (reused elements ≈ −90 %, recycled content less). */
  reuseEffect: 0.55,
  /** Reuse premium (dismantling, testing, certification) €/m² per %. */
  reuseCost: 0.6,
  /** Whole life: A4–A5 share of A1–A3; B4 replacements over 50 years per element; C1–C4 base + share of structure. */
  a4a5: 0.08,
  replacements: { services: 1, interior: 0.8, openings: 0.5, facade: 0.3, roof: 0.4 },
  endOfLifeBase: 12,
  endOfLifeStructure: 0.06,
  /** Overheating model: hours per unit of (facade ratio × glazing ratio) at reference shading and mass. */
  overheatingPerGlazedArea: 650,
  /** Daylight: DF ≥ 2 % share ≈ k × g × LT / 0,70 (linear in the useful range, capped at 100 %). */
  daylightK: 160,
  /** Mechanical ventilation with heat recovery: plant + ducts carbon, cost €/m², share of ventilation losses
   *  recovered, fan electricity kWh/m²a, duration months. */
  mvhr: { carbon: 5, cost: 100, recovery: 0.6, fanElectricity: 3, months: 0.5 },
  /** PV installation time, months per kWp. */
  pvMonthsPerKwp: 0.002,
  /** Height above which a building is „висока зграда“ for fire protection (floor of the top storey). */
  highRiseM: 22,
} as const;

/** Overheating multipliers by thermal mass. */
export const MASS_FACTOR: Record<StructureCoef['mass'], number> = { light: 1.3, medium: 1.1, heavy: 0.9 };

/**
 * Certification sensitivities per scheme — points (scheme units) per unit change of a result:
 * carbon per −10 kgCO₂e/m², energy per −1 kWh/m²a (Qh,nd), renewables per +1 %, daylight per +1 %,
 * overheating per −10 h, reuse per +1 %, green roof per +10 %.
 */
export const CERT_SENSITIVITY: Record<CertificationScheme, { carbon: number; energy: number; renewables: number; daylight: number; overheating: number; reuse: number; greenRoof: number }> = {
  DGNB: { carbon: 0.45, energy: 0.3, renewables: 0.05, daylight: 0.12, overheating: 0.15, reuse: 0.1, greenRoof: 0.1 },
  BREEAM: { carbon: 0.35, energy: 0.4, renewables: 0.08, daylight: 0.1, overheating: 0.1, reuse: 0.08, greenRoof: 0.1 },
  LEED: { carbon: 0.25, energy: 0.35, renewables: 0.03, daylight: 0.25, overheating: 0.05, reuse: 0.2, greenRoof: 0.1 },
  EDGE: { carbon: 0, energy: 0.8, renewables: 0.15, daylight: 0, overheating: 0, reuse: 0, greenRoof: 0 },
  WELL: { carbon: 0, energy: 0.1, renewables: 0, daylight: 0.4, overheating: 0.3, reuse: 0, greenRoof: 0.1 },
  Passivhaus: { carbon: 0, energy: 4, renewables: 0.2, daylight: 0, overheating: 0.5, reuse: 0, greenRoof: 0 },
  none: { carbon: 0.3, energy: 0.3, renewables: 0.1, daylight: 0.1, overheating: 0.1, reuse: 0.1, greenRoof: 0.1 },
};

/* ================================================================================================
 * 2. Building profiles (geometry + loads) — typology defaults, refined per project
 * ============================================================================================== */

export interface BuildingProfile {
  /** m² of facade wall per m² БРГП. */
  facadeRatio: number;
  /** m² of roof per m² БРГП. */
  roofRatio: number;
  /** Multiplier of the structure coefficients (1 = mid-rise with 2 basements). */
  structureScale: number;
  /** Interior fit-out carbon, kgCO₂e/m². */
  interiorCarbon: number;
  /** Building services (generic factor), kgCO₂e/m². */
  servicesCarbon: number;
  /** Ventilation heat loss coefficient, W/K per m² floor. */
  ventilationLoss: number;
  /** Internal heat gains in the heating season, kWh/m²a. */
  internalGains: number;
  /** Domestic hot water heat, kWh/m²a. */
  dhw: number;
  /** Electricity for aux, ventilation, cooling, lighting (final), kWh/m²a. */
  electricity: number;
  /** Maximum allowed Qh,nd for the typology (class C limit), kWh/m²a. */
  qhMax: number;
  /** Duration scale (months per month of the reference coefficients). */
  durationScale: number;
  /** Retrofit of an existing building: EU Taxonomy 7.2 instead of 7.1. */
  retrofit: boolean;
}

type BuildingTypology = Exclude<Typology, 'javni-prostor'>;

const TYPOLOGY_PROFILE: Record<BuildingTypology, BuildingProfile> = {
  'stambeno-poslovni': { facadeRatio: 0.45, roofRatio: 0.13, structureScale: 1, interiorCarbon: 19.5, servicesCarbon: 40, ventilationLoss: 0.45, internalGains: 10, dhw: 20, electricity: 25, qhMax: 60, durationScale: 1, retrofit: false },
  stambeni: { facadeRatio: 0.45, roofRatio: 0.15, structureScale: 0.9, interiorCarbon: 19.5, servicesCarbon: 40, ventilationLoss: 0.45, internalGains: 10, dhw: 20, electricity: 25, qhMax: 60, durationScale: 0.9, retrofit: false },
  poslovni: { facadeRatio: 0.5, roofRatio: 0.08, structureScale: 0.85, interiorCarbon: 6, servicesCarbon: 45, ventilationLoss: 0.5, internalGains: 18, dhw: 5, electricity: 40, qhMax: 55, durationScale: 1.2, retrofit: false },
  obrazovni: { facadeRatio: 0.6, roofRatio: 0.33, structureScale: 0.15, interiorCarbon: 0, servicesCarbon: 15, ventilationLoss: 0.5, internalGains: 8, dhw: 5, electricity: 18, qhMax: 97, durationScale: 1, retrofit: true },
  predskolski: { facadeRatio: 0.75, roofRatio: 0.55, structureScale: 0.55, interiorCarbon: 13, servicesCarbon: 42, ventilationLoss: 0.5, internalGains: 8, dhw: 10, electricity: 20, qhMax: 65, durationScale: 0.6, retrofit: false },
  'adaptivna-prenamena': { facadeRatio: 0.4, roofRatio: 0.25, structureScale: 0.65, interiorCarbon: 10.7, servicesCarbon: 40, ventilationLoss: 0.45, internalGains: 10, dhw: 15, electricity: 25, qhMax: 90, durationScale: 1, retrofit: false },
};

/**
 * Typology defaults for projects without seed options (calculator starts here and is calibrated to the project's
 * current KPIs). Values follow each project's description / KPI notes.
 */
const PROJECT_DEFAULT_PARAMS: Record<string, DesignParams> = {
  // Блок 42: AB skeleton + curtain wall, CEM II after the contractor's substitution, PV cut to 95 kWp.
  'blok-42': {
    structure: 'ab-skelet', facade: 'zid-zavesa', insulationCm: 16, glazingRatio: 0.55, pvKwp: 95, heating: 'daljinsko',
    reusedPct: 5, concreteMix: 'cem-ii', coreConcreteMix: 'cem-ii', greenRoofPct: 25, windows: 'trostruko', shading: 'spoljna', mvhr: true,
  },
  // Вртић „Бубамара“: timber frame, wood-fibre insulation, Passivhaus envelope, PV on canopies.
  'vrtic-bubamara': {
    structure: 'drvo', facade: 'drvena', insulationCm: 30, glazingRatio: 0.35, pvKwp: 60, heating: 'toplotna-pumpa',
    reusedPct: 8, concreteMix: 'cem-iii', greenRoofPct: 40, windows: 'trostruko', shading: 'spoljna', mvhr: true,
  },
};

const TYPOLOGY_DEFAULT_PARAMS: Record<BuildingTypology, DesignParams> = {
  'stambeno-poslovni': { structure: 'ab-skelet', facade: 'etics', insulationCm: 16, glazingRatio: 0.38, pvKwp: 80, heating: 'daljinsko', reusedPct: 5, concreteMix: 'cem-ii', greenRoofPct: 30 },
  stambeni: { structure: 'ab-skelet', facade: 'etics', insulationCm: 16, glazingRatio: 0.35, pvKwp: 60, heating: 'daljinsko', reusedPct: 5, concreteMix: 'cem-ii', greenRoofPct: 30 },
  poslovni: { structure: 'ab-skelet', facade: 'zid-zavesa', insulationCm: 16, glazingRatio: 0.55, pvKwp: 100, heating: 'toplotna-pumpa', reusedPct: 5, concreteMix: 'cem-ii', greenRoofPct: 20 },
  obrazovni: { structure: 'postojeca', facade: 'etics', insulationCm: 16, glazingRatio: 0.3, pvKwp: 60, heating: 'toplotna-pumpa', reusedPct: 0, concreteMix: 'cem-ii', greenRoofPct: 0 },
  predskolski: { structure: 'drvo', facade: 'drvena', insulationCm: 30, glazingRatio: 0.35, pvKwp: 40, heating: 'toplotna-pumpa', reusedPct: 5, concreteMix: 'cem-iii', greenRoofPct: 30 },
  'adaptivna-prenamena': { structure: 'postojeca', facade: 'opeka', insulationCm: 8, glazingRatio: 0.25, pvKwp: 100, heating: 'daljinsko', reusedPct: 40, concreteMix: 'cem-iii', greenRoofPct: 20 },
};

/** Typical construction duration (months) for projects without options. */
const DEFAULT_MONTHS: Record<BuildingTypology, number> = {
  'stambeno-poslovni': 24, stambeni: 20, poslovni: 30, obrazovni: 5, predskolski: 14, 'adaptivna-prenamena': 20,
};

/* ================================================================================================
 * 3. Context
 * ============================================================================================== */

export interface ModelContext {
  projectId: string;
  gfaM2: number;
  /** Heating degree days of the site. */
  hdd: number;
  profile: BuildingProfile;
  /** Construction cost basis, €/m² (budget / БРГП) — denominator of the cost delta. */
  costBase: number;
  /** Floor level of the top storey above terrain, m (fire rule). */
  topFloorLevelM: number;
  scheme: CertificationScheme;
  taxonomy: {
    activity: '7.1' | '7.2';
    /** 7.1: primary energy limit = NZEB reference − 10 %. */
    pedLimit: number;
    /** 7.2: primary energy of the existing building (≥ 30 % reduction required). */
    existingPed?: number;
    /** Whole-life GWP disclosure required (> 5.000 m²). */
    gwpRequired: boolean;
    /** Project LCA already covers A1–C4 (disclosure condition met). */
    lcaWholeLife: boolean;
  };
}

/** Building projects have a GFA; the park (public space) is not modelled. */
export const isBuildingProject = (project: Pick<Project, 'gfaM2' | 'typology'>): boolean =>
  project.gfaM2 !== undefined && project.typology !== 'javni-prostor';

/**
 * Floor level of the top storey from the storeys label: „2По+П+8+Пс“ → П + 8 + Пс = 10 storeys → 9 × 3,3 + 0,4 = 30,1 m
 * (matches the fire study of the flagship). For „П+3 / П+4“ the higher part counts.
 */
export function topFloorLevel(floors: string | undefined): number {
  if (!floors) return 0;
  const parts = floors.split('/').map((part) => {
    const above = part.split('+').map((s) => s.trim()).filter((s) => !/^\d*\s*По$/.test(s));
    let n = 0;
    for (const s of above) {
      if (/^\d+$/.test(s)) n += Number(s);
      else if (s.startsWith('П')) n += 1; // П (ground) or Пс (recessed top floor)
    }
    return n;
  });
  const storeys = Math.max(...parts);
  return storeys <= 1 ? 0 : (storeys - 1) * 3.3 + 0.4;
}

export interface ContextInput {
  project: Pick<Project, 'id' | 'gfaM2' | 'typology' | 'floors' | 'budgetEur' | 'certification'>;
  hdd: number;
  /** EU Taxonomy primary-energy limit (KPI benchmark), default 90. */
  pedLimit?: number;
  /** Primary energy of the existing building for retrofits (7.2). */
  existingPed?: number;
  lcaWholeLife: boolean;
}

export function buildContext({ project, hdd, pedLimit = 90, existingPed, lcaWholeLife }: ContextInput): ModelContext | null {
  if (!isBuildingProject(project)) return null;
  const typ = project.typology as BuildingTypology;
  const profile = TYPOLOGY_PROFILE[typ];
  const gfa = project.gfaM2!;
  return {
    projectId: project.id,
    gfaM2: gfa,
    hdd,
    profile,
    costBase: project.budgetEur / gfa,
    topFloorLevelM: topFloorLevel(project.floors),
    scheme: project.certification.scheme,
    taxonomy: {
      activity: profile.retrofit ? '7.2' : '7.1',
      pedLimit,
      existingPed,
      gwpRequired: gfa > 5000,
      lcaWholeLife,
    },
  };
}

/** Starting parameters for a project without seed options. */
export function defaultParamsFor(project: Pick<Project, 'id' | 'typology'>): DesignParams | null {
  if (project.typology === 'javni-prostor') return null;
  return PROJECT_DEFAULT_PARAMS[project.id] ?? TYPOLOGY_DEFAULT_PARAMS[project.typology];
}

export const defaultMonthsFor = (typology: Typology): number =>
  typology === 'javni-prostor' ? 0 : DEFAULT_MONTHS[typology];

/** Parameters with every optional field resolved. */
export type FullParams = Required<DesignParams>;

export function resolveParams(p: DesignParams): FullParams {
  return {
    ...p,
    greenRoofPct: p.greenRoofPct ?? 0,
    cladding: p.cladding ?? (p.facade === 'opeka' ? 'opeka' : 'aluminijum'),
    windows: p.windows ?? 'trostruko',
    coreConcreteMix: p.coreConcreteMix ?? p.concreteMix,
    shading: p.shading ?? 'unutrasnja',
    mvhr: p.mvhr ?? false,
  };
}

/* ================================================================================================
 * 4. Raw model
 * ============================================================================================== */

export type ElementId = 'konstrukcija' | 'fasada' | 'krov' | 'otvori' | 'instalacije' | 'unutrasnjost';

export const ELEMENT_LABELS: Record<ElementId, string> = {
  konstrukcija: 'Конструкција',
  fasada: 'Фасада',
  krov: 'Кров',
  otvori: 'Отвори',
  instalacije: 'Инсталације и PV',
  unutrasnjost: 'Унутрашњост',
};

export const ELEMENT_ORDER: ElementId[] = ['konstrukcija', 'fasada', 'otvori', 'krov', 'instalacije', 'unutrasnjost'];

export interface RawResult {
  elements: Record<ElementId, number>;
  embodied: number;
  wholeLife: number;
  qh: number;
  primaryEnergy: number;
  renewablePct: number;
  /** Construction cost index, €/m². */
  cost: number;
  daylight: number;
  overheating: number;
  months: number;
}

const wallU = (rBase: number, insulationCm: number) => 1 / (0.17 + rBase + insulationCm / 100 / K.lambda);

/** Uncalibrated model. */
export function evaluateRaw(params: DesignParams, ctx: ModelContext): RawResult {
  const p = resolveParams(params);
  const prof = ctx.profile;
  const st = STRUCTURE[p.structure];
  const fac = FACADE[p.facade];
  const win = WINDOWS[p.windows];
  const heat = HEATING[p.heating];
  const shade = SHADING[p.shading];
  const g = p.glazingRatio;
  const opaque = prof.facadeRatio * (1 - g); // m² opaque wall / m² GFA
  const glazed = prof.facadeRatio * g; // m² glazing / m² GFA
  const pvPerM2 = p.pvKwp / ctx.gfaM2; // kWp per m² GFA

  /* ---- embodied A1–A3 ---- */
  const mixF = CONCRETE[p.concreteMix].factor;
  const coreF = CONCRETE[p.coreConcreteMix].factor;
  const structureCem =
    st.carbon * (st.foundationShare * mixF + st.coreShare * coreF + (1 - st.foundationShare - st.coreShare));
  const structure = prof.structureScale * structureCem * (1 - (K.reuseEffect * p.reusedPct) / 100);
  const system = fac.system ?? CLADDING[p.cladding].carbon;
  const facade = opaque * (system + fac.insulationPerCm * p.insulationCm);
  const openings = glazed * win.carbon * (p.facade === 'zid-zavesa' ? 1.4 : 1);
  const roof = prof.roofRatio * (K.roofCarbon + (K.greenRoofCarbon * p.greenRoofPct) / 100);
  const services = prof.servicesCarbon + heat.carbon + pvPerM2 * K.pvCarbonPerKwp + (p.mvhr ? K.mvhr.carbon : 0);
  const interior = prof.interiorCarbon;
  const elements: Record<ElementId, number> = {
    konstrukcija: structure,
    fasada: facade,
    otvori: openings,
    krov: roof,
    instalacije: services,
    unutrasnjost: interior,
  };
  const embodied = structure + facade + openings + roof + services + interior;

  /* ---- whole life A1–C4 excl. B6 ---- */
  const r = K.replacements;
  const wholeLife =
    embodied * (1 + K.a4a5) +
    services * r.services +
    interior * r.interior +
    openings * r.openings +
    facade * r.facade +
    roof * r.roof +
    K.endOfLifeBase +
    structure * K.endOfLifeStructure;

  /* ---- heating need Qh,nd (monthly-method shape: losses − utilised gains) ---- */
  const uWin = win.u + (p.facade === 'zid-zavesa' ? 0.2 : 0);
  const uRoof = K.roofU - (0.02 * p.greenRoofPct) / 100;
  const hT = (opaque * wallU(fac.rBase, p.insulationCm) + glazed * uWin + prof.roofRatio * uRoof) * (1 + st.thermalBridge);
  const hV = prof.ventilationLoss * (p.mvhr ? 1 - K.mvhr.recovery : 1);
  const losses = 0.024 * ctx.hdd * (hT + hV);
  const gains = prof.internalGains + glazed * K.winterSolar * win.gValue * shade.winter;
  const qh = Math.max(1, losses - K.gainUtilisation * gains);

  /* ---- primary energy & renewables ---- */
  const heatDelivered = qh + prof.dhw;
  const hpHeat = heatDelivered * heat.heatPumpShare;
  const otherHeat = heatDelivered - hpHeat;
  const hpElectricity = hpHeat / HEAT_PUMP_SCOP;
  const electricity = prof.electricity + (p.mvhr ? K.mvhr.fanElectricity : 0) + hpElectricity;
  const pvYield = pvPerM2 * K.pvYield;
  const pvUsed = Math.min(pvYield, electricity);
  const primaryEnergy = otherHeat * heat.primaryPerKwh + (electricity - pvUsed) * FP_ELECTRICITY;
  const ambient = hpHeat - hpElectricity;
  const renewables = pvUsed + ambient + otherHeat * heat.biomassShare;
  const finalTotal = heatDelivered + electricity - hpElectricity;
  const renewablePct = (renewables / finalTotal) * 100;

  /* ---- cost index €/m² ---- */
  const cost =
    prof.structureScale * (st.cost + 0.25 * (CONCRETE[p.concreteMix].cost + CONCRETE[p.coreConcreteMix].cost)) +
    opaque * (fac.cost + (fac.system === null ? CLADDING[p.cladding].cost : 0) + K.insulationCostPerCm * p.insulationCm) +
    glazed * (win.cost + shade.cost) +
    (prof.roofRatio * K.greenRoofCost * p.greenRoofPct) / 100 +
    pvPerM2 * K.pvCostPerKwp +
    heat.cost +
    (p.mvhr ? K.mvhr.cost : 0) +
    K.reuseCost * p.reusedPct;

  /* ---- comfort ---- */
  const daylight = Math.min(100, (K.daylightK * g * win.lightT) / 0.7);
  const mass = MASS_FACTOR[st.mass] * (fac.heavy ? 0.95 : 1);
  const overheating =
    K.overheatingPerGlazedArea * glazed * (win.gValue / 0.5) * shade.summer * mass * (1 - (0.15 * p.greenRoofPct) / 100);

  /* ---- duration ---- */
  const months =
    prof.durationScale *
    (st.months + fac.months + heat.months + 0.03 * p.insulationCm + K.pvMonthsPerKwp * p.pvKwp + (p.mvhr ? K.mvhr.months : 0));

  return { elements, embodied, wholeLife, qh, primaryEnergy, renewablePct, cost, daylight, overheating, months };
}

/** Certification index of a raw/calibrated result set (scheme units, before the project offset). */
function certIndex(
  scheme: CertificationScheme,
  v: { embodied: number; qh: number; renewablePct: number; daylight: number; overheating: number },
  p: FullParams,
): number {
  const s = CERT_SENSITIVITY[scheme];
  return (
    (-s.carbon * v.embodied) / 10 -
    s.energy * v.qh +
    s.renewables * v.renewablePct +
    s.daylight * v.daylight -
    (s.overheating * v.overheating) / 10 +
    s.reuse * p.reusedPct +
    (s.greenRoof * p.greenRoofPct) / 10
  );
}

/* ================================================================================================
 * 5. Calibration
 * ============================================================================================== */

/** Additive offsets (overheating: multiplicative factor) that pin the model to an anchor. */
export interface Calibration {
  carbon: number;
  wholeLife: number;
  qh: number;
  primaryEnergy: number;
  renewable: number;
  /** Offset of the cost delta in % (anchor's costDeltaPct − raw cost index in %). */
  cost: number;
  cert: number;
  daylight: number;
  overheatingFactor: number;
  months: number;
  /** Energy-class steps added to the class computed from Qh,nd (for anchors whose stated class deviates). */
  classShift: number;
}

/** Values to reproduce. `DesignResults` of an option, plus optional project KPIs for metrics options don't carry. */
export type AnchorValues = DesignResults;

export const ENERGY_CLASS_ORDER: EnergyClass[] = ['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];

/** Energy class bands (Правилник): share of Qh,nd,max — A+ ≤ 15 %, A ≤ 25 %, B ≤ 50 %, C ≤ 100 %, D ≤ 150 %, E ≤ 200 %, F ≤ 250 %. */
export const ENERGY_CLASS_BANDS: Array<{ cls: EnergyClass; maxShare: number }> = [
  { cls: 'A+', maxShare: 0.15 },
  { cls: 'A', maxShare: 0.25 },
  { cls: 'B', maxShare: 0.5 },
  { cls: 'C', maxShare: 1 },
  { cls: 'D', maxShare: 1.5 },
  { cls: 'E', maxShare: 2 },
  { cls: 'F', maxShare: 2.5 },
  { cls: 'G', maxShare: Infinity },
];

/** Class from a (rounded) Qh,nd and the typology maximum. */
export function energyClassFor(qh: number, qhMax: number): EnergyClass {
  return ENERGY_CLASS_BANDS.find((b) => qh <= b.maxShare * qhMax + 1e-9)!.cls;
}

/**
 * Offsets so that `evaluate(params, ctx, result)` reproduces `anchor`. Metrics the anchor does not carry (whole-life,
 * primary energy, renewables, overheating) inherit the offsets of `base` (the project calibration); without a base
 * they stay uncalibrated (offset 0 / factor 1).
 */
export function calibrate(ctx: ModelContext, params: DesignParams, anchor: AnchorValues, base?: Calibration): Calibration {
  const raw = evaluateRaw(params, ctx);
  const p = resolveParams(params);
  const qh = anchor.operationalEnergy;
  const computedClass = energyClassFor(Math.round(qh), ctx.profile.qhMax);
  const embodied = anchor.embodiedCarbon;
  const daylight = anchor.daylightPct;
  const renewable = anchor.renewableSharePct ?? Math.min(100, Math.max(0, raw.renewablePct + (base?.renewable ?? 0)));
  const overheating = anchor.overheatingHours ?? raw.overheating * (base?.overheatingFactor ?? 1);
  return {
    carbon: embodied - raw.embodied,
    wholeLife: anchor.wholeLifeCarbon !== undefined ? anchor.wholeLifeCarbon - (raw.wholeLife + (embodied - raw.embodied) * (1 + K.a4a5)) : (base?.wholeLife ?? 0),
    qh: qh - raw.qh,
    primaryEnergy: anchor.primaryEnergy !== undefined ? anchor.primaryEnergy - raw.primaryEnergy : (base?.primaryEnergy ?? 0),
    renewable: renewable - raw.renewablePct,
    cost: anchor.costDeltaPct - (raw.cost / ctx.costBase) * 100,
    cert: anchor.certPoints - certIndex(ctx.scheme, { embodied, qh, renewablePct: renewable, daylight, overheating }, p),
    daylight: daylight - raw.daylight,
    overheatingFactor: raw.overheating > 0 ? overheating / raw.overheating : 1,
    months: anchor.durationMonths - raw.months,
    classShift:
      ENERGY_CLASS_ORDER.indexOf(anchor.energyClass) - ENERGY_CLASS_ORDER.indexOf(computedClass),
  };
}

/* ================================================================================================
 * 5b. Project setup from seed data (shared by the app and `scripts/check-model.ts`)
 * ============================================================================================== */

/** True unless an open condition still asks for the LCA to be extended to A1–C4 (flagship: cond-sk-g1-01). */
export const lcaCoversWholeLife = (openConditionTexts: string[]): boolean =>
  !openConditionTexts.some((t) => t.includes('A1–C4'));

export interface ProjectModelInput {
  project: Pick<Project, 'id' | 'gfaM2' | 'typology' | 'floors' | 'budgetEur' | 'certification'>;
  /** Heating degree days of the site. */
  hdd: number;
  /** Current KPI values of the project by KPI id, plus the first history value (existing state for retrofits). */
  kpis: Array<{ kpiId: string; current: number; first?: number }>;
  /** EU Taxonomy primary-energy limit (benchmark of the `primary-energy` KPI). */
  pedLimit?: number;
  /** Seed options of the project (never user options). */
  options: DesignOption[];
  /** Texts of the project's open conditions (sessions + decisions). */
  openConditionTexts: string[];
}

export interface ProjectModel {
  ctx: ModelContext;
  /** Parameters of the anchor (selected option, or typology defaults when the project has no options). */
  anchorParams: DesignParams;
  /** Selected seed option, if any. */
  selected?: DesignOption;
  /** Values the anchor reproduces. */
  anchorValues: AnchorValues;
  /** Project calibration (from the anchor). */
  calibration: Calibration;
}

/**
 * Builds the model for a building project: context, anchor and project calibration. Returns null for the park.
 * The anchor is the selected seed option (its results; whole-life, primary energy, renewables and overheating come
 * from the project's current KPIs, which describe the same design), else the typology defaults calibrated to the
 * current KPIs.
 */
export function setupProjectModel(input: ProjectModelInput): ProjectModel | null {
  const kpi = (id: string) => input.kpis.find((k) => k.kpiId === id);
  const retrofit = input.project.typology === 'obrazovni';
  const ctx = buildContext({
    project: input.project,
    hdd: input.hdd,
    pedLimit: input.pedLimit,
    existingPed: retrofit ? kpi('primary-energy')?.first : undefined,
    lcaWholeLife: lcaCoversWholeLife(input.openConditionTexts),
  });
  if (!ctx) return null;
  const extras = {
    wholeLifeCarbon: kpi('embodied-carbon-wlc')?.current,
    primaryEnergy: kpi('primary-energy')?.current,
    renewableSharePct: kpi('renewable-share')?.current,
    overheatingHours: kpi('overheating')?.current,
  };
  const selected = input.options.find((o) => o.status === 'selected');
  let anchorParams: DesignParams;
  let anchorValues: AnchorValues;
  if (selected) {
    anchorParams = selected.params;
    anchorValues = { ...selected.results, ...extras };
  } else {
    anchorParams = defaultParamsFor(input.project as Project)!;
    const raw = evaluateRaw(anchorParams, ctx);
    const qh = kpi('operational-energy')?.current ?? Math.round(raw.qh);
    const cls = kpi('energy-class')?.current;
    anchorValues = {
      embodiedCarbon: kpi('embodied-carbon')?.current ?? Math.round(raw.embodied),
      operationalEnergy: qh,
      energyClass: cls !== undefined ? ENERGY_CLASS_ORDER[Math.round(cls) - 1] : energyClassFor(qh, ctx.profile.qhMax),
      costDeltaPct: 0,
      certPoints: input.project.certification.currentScore,
      daylightPct: kpi('daylight')?.current ?? raw.daylight,
      durationMonths: defaultMonthsFor(input.project.typology),
      ...extras,
    };
  }
  return { ctx, anchorParams, selected, anchorValues, calibration: calibrate(ctx, anchorParams, anchorValues) };
}

/** Calibration that reproduces a given option (seed or user-saved) on top of the project calibration. */
export function optionCalibration(model: ProjectModel, option: Pick<DesignOption, 'id' | 'params' | 'results'>): Calibration {
  if (model.selected && option.id === model.selected.id) return model.calibration;
  return calibrate(model.ctx, option.params, option.results, model.calibration);
}

/* ================================================================================================
 * 6. Calibrated evaluation
 * ============================================================================================== */

export interface TaxonomyCriterion {
  id: 'ped' | 'gwp';
  label: string;
  pass: boolean;
  detail: string;
}

export interface ModelResult {
  params: FullParams;
  embodiedCarbon: number;
  elements: Array<{ id: ElementId; label: string; value: number }>;
  wholeLifeCarbon: number;
  heatingNeed: number;
  energyClass: EnergyClass;
  primaryEnergy: number;
  renewableSharePct: number;
  costDeltaPct: number;
  certPoints: number;
  daylightPct: number;
  overheatingHours: number;
  durationMonths: number;
  taxonomy: { activity: '7.1' | '7.2'; pass: boolean; criteria: TaxonomyCriterion[] };
  fire: { combustibleCladding: boolean; aboveHighRise: boolean; warning: boolean; topFloorLevelM: number };
}

const clampN = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function evaluate(params: DesignParams, ctx: ModelContext, cal: Calibration): ModelResult {
  const p = resolveParams(params);
  const raw = evaluateRaw(p, ctx);
  const embodied = raw.embodied + cal.carbon;
  // The calibration offset is spread over the elements in proportion to their size, so the breakdown sums up.
  const scale = raw.embodied > 0 ? embodied / raw.embodied : 1;
  const elements = ELEMENT_ORDER.map((id) => ({ id, label: ELEMENT_LABELS[id], value: raw.elements[id] * scale }));
  const qh = Math.max(1, raw.qh + cal.qh);
  const classIdx = clampN(ENERGY_CLASS_ORDER.indexOf(energyClassFor(Math.round(qh), ctx.profile.qhMax)) + cal.classShift, 0, 7);
  const renewable = clampN(raw.renewablePct + cal.renewable, 0, 100);
  const daylight = clampN(raw.daylight + cal.daylight, 0, 100);
  const overheating = Math.max(0, raw.overheating * cal.overheatingFactor);
  const primaryEnergy = Math.max(0, raw.primaryEnergy + cal.primaryEnergy);
  const wholeLife = raw.wholeLife + cal.carbon * (1 + K.a4a5) + cal.wholeLife;
  const cert = certIndex(ctx.scheme, { embodied, qh, renewablePct: renewable, daylight, overheating }, p) + cal.cert;

  /* ---- EU Taxonomy ---- */
  const t = ctx.taxonomy;
  const criteria: TaxonomyCriterion[] = [];
  if (t.activity === '7.1') {
    criteria.push({
      id: 'ped',
      label: 'Примарна енергија ≥ 10 % испод nZEB',
      pass: Math.round(primaryEnergy) <= t.pedLimit,
      detail: `${Math.round(primaryEnergy)} / граница ${t.pedLimit} kWh/m²a`,
    });
  } else {
    const existing = t.existingPed ?? primaryEnergy;
    const reduction = existing > 0 ? (1 - primaryEnergy / existing) * 100 : 0;
    criteria.push({
      id: 'ped',
      label: 'Смањење примарне енергије ≥ 30 %',
      pass: reduction >= 30,
      detail: `−${Math.round(reduction)} % у односу на постојеће стање`,
    });
  }
  criteria.push({
    id: 'gwp',
    label: 'Обелодањен GWP у животном циклусу (A1–C4)',
    pass: !t.gwpRequired || t.lcaWholeLife,
    detail: !t.gwpRequired
      ? 'Није обавезно испод 5.000 m²'
      : t.lcaWholeLife
        ? 'LCA обухвата A1–C4'
        : 'LCA још не обухвата модуле C1–C4',
  });

  /* ---- fire ---- */
  const combustible = p.facade === 'ventilisana' ? CLADDING[p.cladding].combustible : FACADE[p.facade].combustible;
  const aboveHighRise = ctx.topFloorLevelM > K.highRiseM;

  return {
    params: p,
    embodiedCarbon: embodied,
    elements,
    wholeLifeCarbon: wholeLife,
    heatingNeed: qh,
    energyClass: ENERGY_CLASS_ORDER[classIdx],
    primaryEnergy,
    renewableSharePct: renewable,
    costDeltaPct: (raw.cost / ctx.costBase) * 100 + cal.cost,
    certPoints: cert,
    daylightPct: daylight,
    overheatingHours: overheating,
    durationMonths: Math.max(1, raw.months + cal.months),
    taxonomy: { activity: t.activity, pass: criteria.every((c) => c.pass), criteria },
    fire: { combustibleCladding: combustible, aboveHighRise, warning: combustible && aboveHighRise, topFloorLevelM: ctx.topFloorLevelM },
  };
}

/** Rounded `DesignResults` (as stored on options) from a model result. */
export function toDesignResults(r: ModelResult): DesignResults {
  return {
    embodiedCarbon: Math.round(r.embodiedCarbon),
    operationalEnergy: Math.round(r.heatingNeed),
    energyClass: r.energyClass,
    costDeltaPct: Math.round(r.costDeltaPct * 10) / 10,
    certPoints: Math.round(r.certPoints),
    daylightPct: Math.round(r.daylightPct),
    durationMonths: Math.round(r.durationMonths),
    wholeLifeCarbon: Math.round(r.wholeLifeCarbon),
    primaryEnergy: Math.round(r.primaryEnergy),
    renewableSharePct: Math.round(r.renewableSharePct),
    overheatingHours: Math.round(r.overheatingHours),
  };
}

/* ================================================================================================
 * 7. Contributions („шта је променило уграђени угљеник“)
 * ============================================================================================== */

export type ParamKey = keyof FullParams;

/** Order in which parameters are switched from the reference to the current design (sequential attribution). */
export const PARAM_ORDER: ParamKey[] = [
  'structure',
  'concreteMix',
  'coreConcreteMix',
  'facade',
  'cladding',
  'insulationCm',
  'glazingRatio',
  'windows',
  'shading',
  'greenRoofPct',
  'pvKwp',
  'mvhr',
  'heating',
  'reusedPct',
];

export const PARAM_LABELS: Record<ParamKey, string> = {
  structure: 'Конструктивни систем',
  concreteMix: 'Бетон — темељи и подземне етаже',
  coreConcreteMix: 'Бетон — језгра и надземни АБ',
  facade: 'Тип фасаде',
  cladding: 'Фасадна облога',
  insulationCm: 'Дебљина изолације',
  glazingRatio: 'Удео застакљења',
  windows: 'Прозори',
  shading: 'Засена',
  greenRoofPct: 'Зелени кров',
  pvKwp: 'PV снага',
  heating: 'Систем грејања',
  mvhr: 'Рекуперација',
  reusedPct: 'Поново употребљени материјали',
};

/**
 * Change of a metric between `from` and `to`, attributed to each parameter by switching parameters one at a time in
 * `PARAM_ORDER` (sums exactly to the total change). Zero contributions are omitted.
 */
export function contributions(
  ctx: ModelContext,
  cal: Calibration,
  from: DesignParams,
  to: DesignParams,
  metric: (r: ModelResult) => number = (r) => r.embodiedCarbon,
): Array<{ key: ParamKey; label: string; delta: number }> {
  let cur: FullParams = resolveParams(from);
  const target = resolveParams(to);
  let prev = metric(evaluate(cur, ctx, cal));
  const out: Array<{ key: ParamKey; label: string; delta: number }> = [];
  for (const key of PARAM_ORDER) {
    if (cur[key] === target[key]) continue;
    cur = { ...cur, [key]: target[key] };
    const next = metric(evaluate(cur, ctx, cal));
    if (Math.abs(next - prev) > 1e-6) out.push({ key, label: PARAM_LABELS[key], delta: next - prev });
    prev = next;
  }
  return out;
}

/** Parameter keys whose values differ between two designs. */
export function changedParams(a: DesignParams, b: DesignParams): ParamKey[] {
  const x = resolveParams(a);
  const y = resolveParams(b);
  return PARAM_ORDER.filter((k) => x[k] !== y[k]);
}

/* ================================================================================================
 * 8. „Како рачунамо“ — coefficient table for the UI
 * ============================================================================================== */

export interface CoefficientRow {
  label: string;
  value: number;
  unit: string;
  note?: string;
}

const STRUCTURE_NAMES: Record<StructureSystem, string> = {
  'ab-skelet': 'АБ скелет',
  'clt-ab-jezgro': 'CLT + АБ језгро',
  celik: 'Челична конструкција',
  hibrid: 'Хибридна (дрво–бетон)',
  zidani: 'Зидани систем',
  postojeca: 'Постојећа конструкција',
  drvo: 'Дрвени скелет',
};
const CLADDING_NAMES: Record<Cladding, string> = {
  aluminijum: 'Алуминијумски панели',
  'fiber-cement': 'Фибер-цементне плоче',
  aris: 'Облога од ариша',
  opeka: 'Фасадна опека',
  keramika: 'Керамичке плоче',
};

export const COEFFICIENT_TABLE: Array<{ group: string; rows: CoefficientRow[] }> = [
  {
    group: 'Конструкција (CEM II, референтна зграда)',
    rows: (Object.keys(STRUCTURE) as StructureSystem[]).map((k) => ({
      label: STRUCTURE_NAMES[k],
      value: STRUCTURE[k].carbon,
      unit: 'kgCO₂e/m²',
      note: `бетон темеља ${Math.round(STRUCTURE[k].foundationShare * 100)} %, језгара ${Math.round(STRUCTURE[k].coreShare * 100)} %`,
    })),
  },
  {
    group: 'Бетон (фактор у односу на CEM II)',
    rows: [
      { label: 'CEM I', value: CONCRETE['cem-i'].factor, unit: '×' },
      { label: 'CEM II/B-M', value: CONCRETE['cem-ii'].factor, unit: '×' },
      { label: 'CEM III/A', value: CONCRETE['cem-iii'].factor, unit: '×' },
      { label: 'Нискоклинкерски (LC3)', value: CONCRETE.niskoklinkerski.factor, unit: '×' },
    ],
  },
  {
    group: 'Облога вентилисане фасаде (по m² зида, са подконструкцијом)',
    rows: (Object.keys(CLADDING) as Cladding[]).map((k) => ({
      label: CLADDING_NAMES[k],
      value: CLADDING[k].carbon,
      unit: 'kgCO₂e/m²',
      note: `реакција на пожар ${CLADDING[k].fireClass}`,
    })),
  },
  {
    group: 'Омотач и отвори',
    rows: [
      { label: 'Изолација, вентилисана фасада', value: FACADE.ventilisana.insulationPerCm, unit: 'kgCO₂e/m²·cm' },
      { label: 'Изолација, ETICS (ламеле камене вуне)', value: FACADE.etics.insulationPerCm, unit: 'kgCO₂e/m²·cm' },
      { label: 'Прозор, троструко застакљење', value: WINDOWS.trostruko.carbon, unit: 'kgCO₂e/m²', note: `Uw ${WINDOWS.trostruko.u}` },
      { label: 'Прозор, двоструко застакљење', value: WINDOWS.dvostruko.carbon, unit: 'kgCO₂e/m²', note: `Uw ${WINDOWS.dvostruko.u}` },
      { label: 'Кровни слојеви / додатак за зелени кров', value: K.roofCarbon, unit: 'kgCO₂e/m²', note: `+${K.greenRoofCarbon} за зелени кров` },
    ],
  },
  {
    group: 'Енергија',
    rows: [
      { label: 'PV модули са подконструкцијом', value: K.pvCarbonPerKwp, unit: 'kgCO₂e/kWp' },
      { label: 'Принос PV', value: K.pvYield, unit: 'kWh/kWp' },
      { label: 'Сезонски COP топлотне пумпе', value: HEAT_PUMP_SCOP, unit: '' },
      { label: 'Фактор примарне енергије, струја', value: FP_ELECTRICITY, unit: '' },
      { label: 'Фактор примарне енергије, даљинско грејање', value: HEATING.daljinsko.primaryPerKwh, unit: '' },
      { label: 'Поновна употреба: умањење угљеника конструкције', value: K.reuseEffect, unit: '% по 1 % удела' },
    ],
  },
];
