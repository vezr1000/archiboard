/**
 * Материјали module logic: passport indicators, hotspots, functional alternatives and scripted-but-computed swap suggestions.
 * Pure functions over seed data (no store, no React).
 */
import { getMaterial, getProjectKpi } from '@/data';
import { BUILDING_LAYERS } from '@/domain/labels';
import type { BuildingLayer, Material, Project, ProjectMaterial } from '@/domain/types';
import { formatNumber, formatUnit } from '@/lib/format';

/** Passport row joined with its EPD entry (same shape as `materialsForProject`). */
export type PassportRow = ProjectMaterial & { material: Material; gwpTotalKg: number };

/** Local = produced less than this far from Belgrade. */
export const LOCAL_KM = 300;

/* ------------------------------------------------------------------------------------------------
 * Mass estimate
 * ---------------------------------------------------------------------------------------------- */

/**
 * Approximate mass in kg per declared unit (demo estimate: typical densities / areal weights of the assembly in the
 * EPD library). Circularity shares are weighted by this mass; embodied carbon uses the EPD values directly.
 */
const MASS_KG_PER_UNIT: Record<string, number> = {
  'mat-beton-c3037-cem1': 2400,
  'mat-beton-c3037-cem2': 2400,
  'mat-beton-c3037-cem3': 2400,
  'mat-beton-lc3': 2400,
  'mat-beton-c2530-rec': 2350,
  'mat-cementni-estrih': 2100,
  'mat-betonske-ploce': 190,
  'mat-armatura': 1,
  'mat-celik-profili': 1,
  'mat-celik-reused': 1,
  'mat-clt': 470,
  'mat-glulam': 450,
  'mat-fasada-aris': 17,
  'mat-drvo-bagrem': 700,
  'mat-parket-hrast': 10,
  'mat-opeka-reclaimed': 1700,
  'mat-opeka-puna': 1800,
  'mat-glineni-blok': 175,
  'mat-kamena-vuna': 100,
  'mat-eps-grafit': 17,
  'mat-xps': 33,
  'mat-drvena-vlakna': 110,
  'mat-celuloza': 45,
  'mat-gips-ploce': 11,
  'mat-gips-vlakno': 18,
  'mat-gk-pregradni': 28,
  'mat-keramicke-plocice': 20,
  'mat-prozor-drvo-alu': 35,
  'mat-prozor-pvc': 30,
  'mat-zid-zavesa': 60,
  'mat-zid-zavesa-generic': 60,
  'mat-alu-paneli': 9,
  'mat-alu-paneli-rec': 9,
  'mat-alu-podkonstrukcija': 4,
  'mat-fibercement': 14,
  'mat-keramika-fasada': 25,
  'mat-zk-ekstenzivni': 100,
  'mat-zk-intenzivni': 600,
  'mat-hidroizolacija': 5,
  'mat-pv': 70,
  'mat-toplotna-pumpa': 10,
  'mat-mep-generic': 20,
  'mat-granit': 100,
  'mat-reciklirani-agregat': 1000,
  'mat-propusni-zastor': 150,
  'mat-guma-podloga': 40,
};

const FALLBACK_MASS: Record<string, number> = { kg: 1, t: 1000, 'm³': 1500, 'm²': 30 };

/** Estimated mass per declared unit of a library material, kg. */
export const massKgPerUnit = (m: Pick<Material, 'id' | 'unit'>): number => MASS_KG_PER_UNIT[m.id] ?? FALLBACK_MASS[m.unit] ?? 10;

/** Estimated mass of a passport row, kg. */
export const rowMassKg = (r: Pick<PassportRow, 'materialId' | 'quantity' | 'material'>): number =>
  r.quantity * massKgPerUnit(r.material);

/* ------------------------------------------------------------------------------------------------
 * Reference area and indicators
 * ---------------------------------------------------------------------------------------------- */

/** Basis of kgCO₂e/m²: БРГП for buildings, intervention area for the park. */
export function referenceArea(project: Project): { m2: number; unit: string } {
  if (project.gfaM2) return { m2: project.gfaM2, unit: 'kgCO₂e/m²' };
  return { m2: project.siteAreaM2 ?? 0, unit: 'kgCO₂e/m² површине' };
}

export interface PassportStats {
  totalKg: number;
  perM2: number;
  massKg: number;
  /** Shares of the estimated mass, 0..100. */
  reusedPct: number;
  recycledPct: number;
  bioPct: number;
  localPct: number;
  demountablePct: number;
}

export function passportStats(rows: PassportRow[], areaM2: number): PassportStats {
  let totalKg = 0;
  let mass = 0;
  let reused = 0;
  let recycled = 0;
  let bio = 0;
  let local = 0;
  let demountable = 0;
  for (const r of rows) {
    const m = rowMassKg(r);
    totalKg += r.gwpTotalKg;
    mass += m;
    if (r.reused) reused += m;
    recycled += (m * r.material.recycledPct) / 100;
    if (r.material.bioBased) bio += m;
    if (r.material.distanceKm < LOCAL_KM) local += m;
    if (r.demountable) demountable += m;
  }
  const pct = (x: number) => (mass > 0 ? (x / mass) * 100 : 0);
  return {
    totalKg,
    perM2: areaM2 > 0 ? totalKg / areaM2 : 0,
    massKg: mass,
    reusedPct: pct(reused),
    recycledPct: pct(recycled),
    bioPct: pct(bio),
    localPct: pct(local),
    demountablePct: pct(demountable),
  };
}

/** Embodied carbon (A1–A3) KPI target / current of the project, kgCO₂e/m². */
export const carbonTarget = (projectId: string): number | undefined => getProjectKpi(projectId, 'embodied-carbon')?.target;
export const carbonKpi = (projectId: string): number | undefined => getProjectKpi(projectId, 'embodied-carbon')?.current;

/* ------------------------------------------------------------------------------------------------
 * Hotspots and passport ordering
 * ---------------------------------------------------------------------------------------------- */

export function layerTotals(rows: PassportRow[]): Array<{ layer: BuildingLayer; kg: number }> {
  return BUILDING_LAYERS.map((layer) => ({ layer, kg: rows.filter((r) => r.layer === layer).reduce((s, r) => s + r.gwpTotalKg, 0) }))
    .filter((x) => x.kg > 0)
    .sort((a, b) => b.kg - a.kg);
}

export function topMaterials(rows: PassportRow[], n = 8): Array<{ material: Material; kg: number }> {
  const map = new Map<string, { material: Material; kg: number }>();
  for (const r of rows) {
    const e = map.get(r.materialId) ?? { material: r.material, kg: 0 };
    e.kg += r.gwpTotalKg;
    map.set(r.materialId, e);
  }
  return [...map.values()].sort((a, b) => b.kg - a.kg).slice(0, n);
}

/** Rows ordered by layer (canonical order) and carbon, so DataList groups are contiguous. */
export function sortPassport(rows: PassportRow[]): PassportRow[] {
  return [...rows].sort((a, b) => BUILDING_LAYERS.indexOf(a.layer) - BUILDING_LAYERS.indexOf(b.layer) || b.gwpTotalKg - a.gwpTotalKg);
}

/** Stable key of a passport row. */
export const passportRowKey = (r: PassportRow): string => `${r.layer}|${r.element}|${r.materialId}`;

/* ------------------------------------------------------------------------------------------------
 * Functional alternatives (material detail)
 * ---------------------------------------------------------------------------------------------- */

/** Materials that can serve the same function (curated; a technical check is always required). */
const ALTERNATIVE_GROUPS: Array<{ label: string; ids: string[] }> = [
  { label: 'Конструкцијски бетон', ids: ['mat-beton-c3037-cem1', 'mat-beton-c3037-cem2', 'mat-beton-c3037-cem3', 'mat-beton-lc3', 'mat-beton-c2530-rec'] },
  { label: 'Облоге вентилисаних фасада', ids: ['mat-alu-paneli', 'mat-alu-paneli-rec', 'mat-fibercement', 'mat-keramika-fasada'] },
  { label: 'Топлотна изолација', ids: ['mat-kamena-vuna', 'mat-eps-grafit', 'mat-xps', 'mat-drvena-vlakna', 'mat-celuloza'] },
  { label: 'Прозори', ids: ['mat-prozor-drvo-alu', 'mat-prozor-pvc'] },
  { label: 'Зид-завесе', ids: ['mat-zid-zavesa', 'mat-zid-zavesa-generic'] },
  { label: 'Конструкцијски челик', ids: ['mat-celik-profili', 'mat-celik-reused'] },
  { label: 'Опека', ids: ['mat-opeka-puna', 'mat-opeka-reclaimed'] },
  { label: 'Поплочавање', ids: ['mat-betonske-ploce', 'mat-granit', 'mat-propusni-zastor'] },
  { label: 'Зелени кровови', ids: ['mat-zk-ekstenzivni', 'mat-zk-intenzivni'] },
  { label: 'Гипсане плоче', ids: ['mat-gips-ploce', 'mat-gips-vlakno'] },
];

export interface Alternative {
  material: Material;
  /** GWP per declared unit minus the current material's (negative = better). */
  deltaPerUnit: number;
  deltaPct: number;
  /** Δ of the whole project quantity if swapped, kgCO₂e (only when a project quantity is known). */
  deltaTotalKg?: number;
}

/** Up to 3 lower-GWP functional alternatives with the same declared unit, best first. */
export function alternativesFor(material: Material, projectQuantity?: number): { group?: string; items: Alternative[] } {
  const group = ALTERNATIVE_GROUPS.find((g) => g.ids.includes(material.id));
  if (!group) return { items: [] };
  const items = group.ids
    .filter((id) => id !== material.id)
    .flatMap((id) => {
      const m = getMaterial(id);
      return m && m.unit === material.unit && m.gwpA1A3 < material.gwpA1A3 ? [m] : [];
    })
    .sort((a, b) => a.gwpA1A3 - b.gwpA1A3)
    .slice(0, 3)
    .map<Alternative>((m) => ({
      material: m,
      deltaPerUnit: m.gwpA1A3 - material.gwpA1A3,
      deltaPct: ((m.gwpA1A3 - material.gwpA1A3) / material.gwpA1A3) * 100,
      deltaTotalKg: projectQuantity !== undefined ? (m.gwpA1A3 - material.gwpA1A3) * projectQuantity : undefined,
    }));
  return { group: group.label, items };
}

/* ------------------------------------------------------------------------------------------------
 * Swap suggestions („Предлози замене“)
 * ---------------------------------------------------------------------------------------------- */

interface SwapRule {
  id: string;
  title: string;
  from: string[];
  to: string;
  /** Share of the quantity that can realistically be swapped (default 1). */
  share?: number;
  /** Apply only to passport rows with at least this mass of material (kg) — skips minor uses. */
  minRowKg?: number;
  /** Cost / practicality note (generic, from the library and the firm's experience). */
  note: string;
  /** Alternative target for the same rows, mentioned as a second option. */
  alt?: { to: string; label: string; note: string };
}

const SWAP_RULES: SwapRule[] = [
  {
    id: 'cem3',
    title: 'CEM I/II → CEM III/A бетон',
    from: ['mat-beton-c3037-cem1', 'mat-beton-c3037-cem2'],
    to: 'mat-beton-c3037-cem3',
    note: 'Цена бетона незнатно виша, без утицаја на рок ако се нега предвиди; спорије очвршћавање (нега најмање 7 дана) — проверити клизну оплату језгара са извођачем.',
  },
  {
    id: 'alu-fibercement',
    title: 'Алуминијумски панели → фибер-цемент',
    from: ['mat-alu-paneli'],
    to: 'mat-fibercement',
    note: 'Иста класа реакције на пожар (A2-s1,d0), облога јефтинија од алуминијума; већа маса плоча — проверити подконструкцију. Потребна сагласност инвеститора на изглед.',
    alt: { to: 'mat-alu-paneli-rec', label: 'алуминијум са ≥ 75 % рециклата', note: 'облога скупља око 18 %' },
  },
  {
    id: 'zavesa-epd',
    title: 'Зид-завеса без EPD → систем са EPD-ом',
    from: ['mat-zid-zavesa-generic'],
    to: 'mat-zid-zavesa',
    note: 'Генеричка вредност носи сигурносни фактор 1,2 — прибављање EPD-а добављача (или повратак на ранијег добављача) одмах смањује обрачунати GWP. Проверити уговор са извођачем.',
  },
  {
    id: 'steel-reused',
    title: 'Нови челик → поново употребљени профили (до 50 %)',
    from: ['mat-celik-profili'],
    to: 'mat-celik-reused',
    share: 0.5,
    minRowKg: 150_000,
    note: 'Доступност ограничена: потребно испитивање и сертификација профила (EN 1090) и дужи рок набавке; исплативо само за веће количине.',
  },
  {
    id: 'lc3',
    title: 'CEM III/A → нискоклинкерски бетон (LC3), до 30 %',
    from: ['mat-beton-c3037-cem3'],
    to: 'mat-beton-lc3',
    share: 0.3,
    note: 'Пилот производња — највише 300 m³ месечно, па се примењује само на део количина; потврдити капацитет и цену са произвођачем.',
  },
  {
    id: 'windows-pvc',
    title: 'Прозори дрво-алуминијум → ПВЦ',
    from: ['mat-prozor-drvo-alu'],
    to: 'mat-prozor-pvc',
    note: 'ПВЦ је јефтинији, али краћег века и слабије рециклабилан; није прихватљив уз захтев за дрвеним изгледом или на заштићеним објектима. Проверити сертификат за Passivhaus.',
  },
  {
    id: 'wood-cellulose',
    title: 'Изолација од дрвених влакана → целулоза',
    from: ['mat-drvena-vlakna'],
    to: 'mat-celuloza',
    note: 'Применљиво само где постоје шупљине или влажно наношење; код унутрашње изолације опечних зидова проверити ризик од кондензата (паропропусност).',
  },
  {
    id: 'brick-reclaimed',
    title: 'Нова опека → очишћена опека из рушења',
    from: ['mat-opeka-puna'],
    to: 'mat-opeka-reclaimed',
    note: 'Потребна сортирана залиха из рушења и рок за чишћење; неуједначен изглед се може користити као архитектонски мотив.',
  },
  {
    id: 'paving-permeable',
    title: 'Бетонске плоче → пропусни застор',
    from: ['mat-betonske-ploce'],
    to: 'mat-propusni-zastor',
    note: 'Јефтинији и пропусан (помаже задржавању воде), али за стазе са колицима и инвалидитетом потребна стабилизована подлога; провера приступачности.',
  },
];

export interface SwapSuggestion {
  id: string;
  title: string;
  from: Material[];
  to: Material;
  unit: string;
  /** Swapped quantity in the declared unit and number of passport rows affected. */
  quantity: number;
  rowCount: number;
  savingsKg: number;
  perM2: number;
  /** Project embodied carbon after this swap alone, kgCO₂e/m². */
  afterPerM2: number;
  note: string;
  alt?: { label: string; note: string; perM2: number };
}

export interface SwapAnalysis {
  currentPerM2: number;
  suggestions: SwapSuggestion[];
  combinedKg: number;
  combinedPerM2: number;
  /** Project embodied carbon if all listed swaps are applied, kgCO₂e/m². */
  afterPerM2: number;
}

/**
 * Evaluate the swap rules on a passport: keep rules that save carbon, rank by savings, drop rules that compete for
 * the same source material, return the top `limit`. Everything is computed from passport quantities and EPD values.
 */
export function analyseSwaps(rows: PassportRow[], areaM2: number, limit = 4): SwapAnalysis {
  const currentKg = rows.reduce((s, r) => s + r.gwpTotalKg, 0);
  const per = (kg: number) => (areaM2 > 0 ? kg / areaM2 : 0);
  const evaluated: SwapSuggestion[] = [];

  for (const rule of SWAP_RULES) {
    const to = getMaterial(rule.to);
    if (!to) continue;
    const affected = rows.filter(
      (r) => rule.from.includes(r.materialId) && !r.reused && r.material.unit === to.unit && (rule.minRowKg === undefined || rowMassKg(r) >= rule.minRowKg),
    );
    if (affected.length === 0) continue;
    const share = rule.share ?? 1;
    const quantity = affected.reduce((s, r) => s + r.quantity, 0) * share;
    const savingsKg = affected.reduce((s, r) => s + r.quantity * share * (r.material.gwpA1A3 - to.gwpA1A3), 0);
    if (savingsKg <= 0) continue;
    const altTo = rule.alt ? getMaterial(rule.alt.to) : undefined;
    const altKg = altTo ? affected.reduce((s, r) => s + r.quantity * share * (r.material.gwpA1A3 - altTo.gwpA1A3), 0) : 0;
    evaluated.push({
      id: rule.id,
      title: rule.title,
      from: [...new Map(affected.map((r) => [r.materialId, r.material])).values()],
      to,
      unit: to.unit,
      quantity,
      rowCount: affected.length,
      savingsKg,
      perM2: per(savingsKg),
      afterPerM2: per(currentKg - savingsKg),
      note: rule.note,
      alt: rule.alt && altTo && altKg > 0 ? { label: rule.alt.label, note: rule.alt.note, perM2: per(altKg) } : undefined,
    });
  }

  evaluated.sort((a, b) => b.savingsKg - a.savingsKg);
  const claimed = new Set<string>();
  const suggestions: SwapSuggestion[] = [];
  for (const s of evaluated) {
    if (s.from.some((m) => claimed.has(m.id))) continue;
    s.from.forEach((m) => claimed.add(m.id));
    suggestions.push(s);
    if (suggestions.length === limit) break;
  }
  const combinedKg = suggestions.reduce((sum, s) => sum + s.savingsKg, 0);
  return { currentPerM2: per(currentKg), suggestions, combinedKg, combinedPerM2: per(combinedKg), afterPerM2: per(currentKg - combinedKg) };
}

/* ------------------------------------------------------------------------------------------------
 * Library helpers
 * ---------------------------------------------------------------------------------------------- */

export type OriginRegion = 'srbija' | 'region' | 'eu' | 'ostalo';
export const ORIGIN_LABELS: Record<OriginRegion, string> = { srbija: 'Србија', region: 'Регион', eu: 'ЕУ', ostalo: 'Остали свет' };

/** Origin bucket from the origin text („Зеница, БиХ“ → region; no country → Serbia). */
export function originRegion(m: Pick<Material, 'originCity'>): OriginRegion {
  const t = m.originCity;
  if (/БиХ|Хрватска|Словенија|Црна Гора|Северна Македонија/.test(t)) return 'region';
  if (/Мађарска|Чешка|Немачка|Аустрија|Румунија|Бугарска|Грчка|Италија|Словачка|Пољска/.test(t)) return 'eu';
  if (/Турска|Кина/.test(t)) return 'ostalo';
  return 'srbija';
}

/** Min / max GWP of materials with the same category and declared unit (comparable on one scale). */
export function gwpRange(m: Material, all: Material[]): { min: number; max: number; count: number } {
  const values = all.filter((x) => x.category === m.category && x.unit === m.unit).map((x) => x.gwpA1A3);
  return { min: Math.min(...values), max: Math.max(...values), count: values.length };
}

export const gwpUnit = (m: Pick<Material, 'unit'>): string => `kgCO₂e/${m.unit}`;
export const formatGwp = (m: Pick<Material, 'gwpA1A3' | 'unit'>): string => formatUnit(m.gwpA1A3, gwpUnit(m));
export const formatQuantity = (q: number, unit: string): string => formatUnit(q, unit, q < 10 ? 1 : 0);
export const formatKm = (km: number): string => (km === 0 ? 'на локацији' : `${formatNumber(km, 0)} km`);

/** „1 пројекат“, „3 пројекта“, „6 пројеката“. */
export function projectsCount(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  const word = mod10 === 1 && mod100 !== 11 ? 'пројекат' : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? 'пројекта' : 'пројеката';
  return `${formatNumber(n, 0)} ${word}`;
}

/** „1 позиција“, „3 позиције“, „12 позиција“. */
export function positionsCount(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  const word = mod10 === 1 && mod100 !== 11 ? 'позиција' : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? 'позиције' : 'позиција';
  return `${formatNumber(n, 0)} ${word}`;
}
