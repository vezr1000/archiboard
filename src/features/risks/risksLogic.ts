import type { Risk, RiskStatus, Tone } from '@/domain/types';

export type RiskZoneId = 'low' | 'medium' | 'high' | 'critical';

/**
 * Four risk zones by score = probability × impact. Colours follow `riskScoreTone` (low = good, medium = warn,
 * high and critical = bad — critical is drawn as a solid badge) so the matrix and the overview agree.
 */
export const RISK_ZONES: Array<{ id: RiskZoneId; label: string; range: string; min: number; tone: Tone; solid?: boolean }> = [
  { id: 'low', label: 'Низак', range: '1–7', min: 1, tone: 'good' },
  { id: 'medium', label: 'Средњи', range: '8–14', min: 8, tone: 'warn' },
  { id: 'high', label: 'Висок', range: '15–19', min: 15, tone: 'bad' },
  { id: 'critical', label: 'Критичан', range: '20–25', min: 20, tone: 'bad', solid: true },
];

export const riskScore = (r: Pick<Risk, 'probability' | 'impact'>): number => r.probability * r.impact;

export function riskZone(score: number) {
  return [...RISK_ZONES].reverse().find((z) => score >= z.min) ?? RISK_ZONES[0];
}

export type RiskSort = 'score' | 'status' | 'category';

export const RISK_SORT_OPTIONS: Array<{ value: RiskSort; label: string }> = [
  { value: 'score', label: 'Резултат (највећи)' },
  { value: 'status', label: 'Статус' },
  { value: 'category', label: 'Категорија' },
];

const STATUS_ORDER: Record<RiskStatus, number> = { open: 0, mitigating: 1, closed: 2 };

export function sortRisks(risks: Risk[], sort: RiskSort): Risk[] {
  const byScore = (a: Risk, b: Risk) => riskScore(b) - riskScore(a) || b.impact - a.impact;
  const list = [...risks];
  if (sort === 'status') return list.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || byScore(a, b));
  if (sort === 'category') return list.sort((a, b) => a.category.localeCompare(b.category) || byScore(a, b));
  return list.sort(byScore);
}
