/**
 * Varijante module helpers: option naming, change descriptions, proposal (decision) builder, radar normalisation.
 */
import {
  CLADDING_LABELS,
  CONCRETE_MIX_LABELS,
  FACADE_LABELS,
  HEATING_LABELS,
  SHADING_LABELS,
  STRUCTURE_LABELS,
  WINDOWS_LABELS,
} from '@/domain/labels';
import type { BoardSession, Decision, DesignOption, DesignParams } from '@/domain/types';
import { changedParams, resolveParams, type FullParams, type ModelResult, type ParamKey } from '@/lib/carbonModel';
import { DEMO_TODAY } from '@/lib/dates';
import { formatNumber, formatPct, formatSigned } from '@/lib/format';

/** Option letters in Serbian Cyrillic alphabet order. */
const CODES = ['А', 'Б', 'В', 'Г', 'Д', 'Ђ', 'Е', 'Ж', 'З', 'И', 'Ј', 'К', 'Л', 'Љ', 'М', 'Н', 'Њ', 'О', 'П', 'Р', 'С', 'Т'];

export function nextOptionCode(options: DesignOption[]): string {
  const used = new Set(options.map((o) => o.code));
  return CODES.find((c) => !used.has(c)) ?? String(options.length + 1);
}

/** „Варијанта Б — CLT + АБ језгро“ → „CLT + АБ језгро“. */
export const optionShortName = (o: Pick<DesignOption, 'name'>): string => o.name.split(' — ').slice(1).join(' — ') || o.name;

/** Human value of a parameter. */
export function paramValueLabel(key: ParamKey, p: FullParams): string {
  switch (key) {
    case 'structure':
      return STRUCTURE_LABELS[p.structure];
    case 'facade':
      return FACADE_LABELS[p.facade];
    case 'cladding':
      return CLADDING_LABELS[p.cladding];
    case 'concreteMix':
      return CONCRETE_MIX_LABELS[p.concreteMix];
    case 'coreConcreteMix':
      return CONCRETE_MIX_LABELS[p.coreConcreteMix];
    case 'heating':
      return HEATING_LABELS[p.heating];
    case 'windows':
      return WINDOWS_LABELS[p.windows];
    case 'shading':
      return SHADING_LABELS[p.shading];
    case 'mvhr':
      return p.mvhr ? 'да' : 'не';
    case 'insulationCm':
      return `${formatNumber(p.insulationCm, 0)} cm`;
    case 'glazingRatio':
      return formatPct(p.glazingRatio, { ratio: true, decimals: 0 });
    case 'pvKwp':
      return `${formatNumber(p.pvKwp, 0)} kWp`;
    case 'greenRoofPct':
      return formatPct(p.greenRoofPct, { decimals: 0 });
    case 'reusedPct':
      return formatPct(p.reusedPct, { decimals: 0 });
  }
}

/** Short fragment for an auto-generated option name. */
function nameFragment(key: ParamKey, p: FullParams): string {
  switch (key) {
    case 'cladding':
      return CLADDING_LABELS[p.cladding].toLowerCase();
    case 'coreConcreteMix':
      return `${CONCRETE_MIX_LABELS[p.coreConcreteMix]} у језгрима`;
    case 'concreteMix':
      return `${CONCRETE_MIX_LABELS[p.concreteMix]} у темељима`;
    case 'insulationCm':
      return `изолација ${paramValueLabel(key, p)}`;
    case 'glazingRatio':
      return `застакљење ${paramValueLabel(key, p)}`;
    case 'pvKwp':
      return `PV ${paramValueLabel(key, p)}`;
    case 'greenRoofPct':
      return `зелени кров ${paramValueLabel(key, p)}`;
    case 'reusedPct':
      return `поновна употреба ${paramValueLabel(key, p)}`;
    case 'shading':
      return p.shading === 'spoljna' ? 'спољна засена' : `засена: ${SHADING_LABELS[p.shading].toLowerCase()}`;
    case 'mvhr':
      return p.mvhr ? 'рекуперација' : 'без рекуперације';
    default:
      return paramValueLabel(key, p);
  }
}

/** „фибер-цементне плоче + CEM III/A у језгрима“ — the changes vs the reference, for names. */
export function changeSummary(ref: DesignParams, params: DesignParams, max = 3, order?: ParamKey[]): string {
  const p = resolveParams(params);
  const changed = changedParams(ref, params);
  // Most influential changes first when an order is given (e.g. by carbon contribution).
  const keys = order ? [...order.filter((k) => changed.includes(k)), ...changed.filter((k) => !order.includes(k))] : changed;
  if (keys.length === 0) return 'без измена';
  const parts = keys.slice(0, max).map((k) => nameFragment(k, p));
  return parts.join(' + ') + (keys.length > max ? ` (+${keys.length - max})` : '');
}

/** „Фасадна облога: Алуминијумски панели → Фибер-цементне плоче“ lines. */
export function changeLines(ref: DesignParams, params: DesignParams, labels: Record<ParamKey, string>): string[] {
  const a = resolveParams(ref);
  const b = resolveParams(params);
  return changedParams(ref, params).map((k) => `${labels[k]}: ${paramValueLabel(k, a)} → ${paramValueLabel(k, b)}`);
}

export const paramsEqual = (a: DesignParams, b: DesignParams): boolean => changedParams(a, b).length === 0;

const pctDelta = (v: number, ref: number) => (ref === 0 ? 0 : Math.round(((v - ref) / ref) * 1000) / 10);

/** Draft decision for „Предложи одбору“. */
export function buildProposal(input: {
  projectId: string;
  title: string;
  optionName: string;
  referenceName: string;
  /** „варијанту Б“ — accusative form for sentences. */
  referenceLabel: string;
  refParams: DesignParams;
  params: DesignParams;
  result: ModelResult;
  reference: ModelResult;
  carbonTarget?: number;
  contributions: Array<{ label: string; delta: number }>;
  paramLabels: Record<ParamKey, string>;
  session?: BoardSession;
  optionId?: string;
}): Decision {
  const { result: r, reference: ref } = input;
  const ec = Math.round(r.embodiedCarbon);
  const carbonDelta = pctDelta(r.embodiedCarbon, ref.embodiedCarbon);
  const energyDelta = pctDelta(Math.round(r.heatingNeed), Math.round(ref.heatingNeed));
  const costDelta = Math.round((r.costDeltaPct - ref.costDeltaPct) * 10) / 10;
  const targetText =
    input.carbonTarget !== undefined
      ? ec <= input.carbonTarget
        ? `, испод циља од ${formatNumber(input.carbonTarget, 0)}`
        : `, ${formatPct(pctDelta(ec, input.carbonTarget), { decimals: 0 })} изнад циља од ${formatNumber(input.carbonTarget, 0)}`
      : '';
  const drivers = [...input.contributions]
    .sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta))
    .filter((c) => Math.abs(c.delta) >= 0.5)
    .map((c) => `${c.label} ${formatSigned(c.delta, Math.abs(c.delta) < 10 ? 1 : 0)}`)
    .join(', ');
  const context =
    `Прорачун у калкулатору варијанти (поједностављени модел калибрисан на пројекат): уграђени угљеник ${ec} kgCO₂e/m² ` +
    `(${formatPct(carbonDelta, { signed: true, decimals: 1 })} у односу на ${input.referenceLabel}${targetText}). ` +
    `Qh,nd ${Math.round(r.heatingNeed)} kWh/m²a (разред ${r.energyClass}), примарна енергија ${Math.round(r.primaryEnergy)} kWh/m²a, ` +
    `трошак ${formatSigned(costDelta, 1)} п.п.` +
    (drivers ? ` Утицај измена (kgCO₂e/m²): ${drivers}.` : '');
  const changes = changeLines(input.refParams, input.params, input.paramLabels);
  return {
    id: `dec-user-${Date.now().toString(36)}`,
    projectId: input.projectId,
    date: DEMO_TODAY,
    title: input.title,
    context,
    optionsConsidered: [input.referenceName, input.optionName],
    decision: changes.length ? `Предлаже се: ${changes.join('; ')}.` : `Предлаже се ${input.optionName}.`,
    rationale:
      `Промена уграђеног угљеника ${formatPct(carbonDelta, { signed: true, decimals: 1 })}` +
      (r.taxonomy.pass ? '; EU таксономија испуњена.' : `; EU таксономија није испуњена (${r.taxonomy.criteria.filter((c) => !c.pass).map((c) => c.label).join('; ')}).`) +
      (r.fire.warning ? ' Пажња: горива фасадна облога изнад 22 m.' : '') +
      ' Пре одлуке потврдити LCA и енергетски прорачун.',
    impact: { carbonDeltaPct: carbonDelta, energyDeltaPct: energyDelta, costDeltaPct: costDelta },
    sessionId: input.session?.id,
    conditions: [],
    status: 'proposed',
    optionId: input.optionId,
    isUserCreated: true,
  };
}

/**
 * Radar scores 0–100 per axis across the compared options: best option = 100, worst = 35 (never collapses to the
 * centre), equal values = 100.
 */
export function radarScore(values: number[], lowerBetter: boolean): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max - min < 1e-9) return values.map(() => 100);
  return values.map((v) => {
    const good = lowerBetter ? (max - v) / (max - min) : (v - min) / (max - min);
    return 35 + 65 * good;
  });
}
