import type { Condition, Decision, Tone } from '@/domain/types';
import { DEMO_TODAY } from '@/lib/dates';
import { formatDate } from '@/lib/format';

export type ImpactKind = 'carbon' | 'energy' | 'cost';

export const IMPACT_LABELS: Record<ImpactKind, { short: string; long: string }> = {
  carbon: { short: 'Δ угљеник', long: 'Уграђени угљеник' },
  energy: { short: 'Δ енергија', long: 'Енергија за грејање' },
  cost: { short: 'Δ цена', long: 'Инвестициони трошак' },
};

export const impactValue = (d: Decision, kind: ImpactKind): number | undefined =>
  kind === 'carbon' ? d.impact.carbonDeltaPct : kind === 'energy' ? d.impact.energyDeltaPct : d.impact.costDeltaPct;

/** Carbon and energy: lower is better. Cost: an increase is only a warning, a saving is informational. */
export function impactTone(kind: ImpactKind, value: number): Tone {
  if (value === 0) return 'neutral';
  if (kind === 'cost') return value < 0 ? 'info' : 'warn';
  return value < 0 ? 'good' : 'bad';
}

/**
 * Decisions that deserve emphasis in the timeline:
 * - `rise`: the decision pushed embodied carbon up noticeably (≥ +5 %) — e.g. the facade change;
 * - `fix`: a proposal that cuts embodied carbon (≤ −3 %) and is still to be decided — e.g. the fibre-cement proposal.
 */
export function decisionEmphasis(d: Decision): 'rise' | 'fix' | null {
  const c = d.impact.carbonDeltaPct;
  if (c !== undefined && c >= 5) return 'rise';
  if (d.status === 'proposed' && c !== undefined && c <= -3) return 'fix';
  return null;
}

export const isOverdue = (c: Condition): boolean => !c.done && c.dueDate < DEMO_TODAY;

export const openConditionCount = (d: Decision): number => d.conditions.filter((c) => !c.done).length;

/** Newest first → groups by month label („јун 2026.“). */
export function groupByMonth(decisions: Decision[]): Array<{ key: string; label: string; items: Decision[] }> {
  const groups: Array<{ key: string; label: string; items: Decision[] }> = [];
  for (const d of decisions) {
    const key = d.date.slice(0, 7);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(d);
    else groups.push({ key, label: formatDate(d.date, 'month'), items: [d] });
  }
  return groups;
}

export interface CumulativePoint {
  decision: Decision;
  /** Cumulative embodied-carbon effect in % vs. the state before the first decision (multiplicative). */
  cumulativePct: number;
  /** Only proposed decisions so far? (the step is projected) */
  projected: boolean;
}

/**
 * Cumulative effect of decisions on embodied carbon. Every decision's Δ is relative to the design state just before
 * it, so the effects are compounded: Π(1 + Δᵢ) − 1. A proposal makes this step and all later ones projected.
 * Not an absolute KPI value — it only describes what the decisions did.
 */
export function cumulativeCarbon(decisions: Decision[]): CumulativePoint[] {
  const asc = decisions
    .filter((d) => d.impact.carbonDeltaPct !== undefined)
    .sort((a, b) => a.date.localeCompare(b.date));
  let factor = 1;
  let projected = false;
  return asc.map((decision) => {
    factor *= 1 + (decision.impact.carbonDeltaPct ?? 0) / 100;
    projected = projected || decision.status === 'proposed';
    return { decision, cumulativePct: (factor - 1) * 100, projected };
  });
}

/** Decision recorded by a gate review closed in this demo (step 10) — removed only by resetting that review. */
export const isBoardReviewDecision = (d: Decision): boolean => Boolean(d.isUserCreated && d.sessionId && d.status === 'approved');

/** Badge text for user-created decisions. */
export const userDecisionLabel = (d: Decision): string => (isBoardReviewDecision(d) ? 'нова · седница одбора' : 'нова · предлог');
