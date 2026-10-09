/**
 * KPI evaluation helpers shared by Портфолио, Циљеви и KPI, Варијанте and the gate review.
 */
import type { CheckStatus, KpiDirection, Tone } from '@/domain/types';

/**
 * Status of a value against a target.
 * - pass: meets the target
 * - warn: misses by ≤ `tolerancePct` (default 10 %)
 * - fail: misses by more
 */
export function kpiStatus(direction: KpiDirection, current: number, target: number, tolerancePct = 10): CheckStatus {
  const gap = gapPct(direction, current, target);
  if (gap <= 0) return 'pass';
  if (gap <= tolerancePct) return 'warn';
  return 'fail';
}

/**
 * How far `current` is from `target` in % of target, signed so that POSITIVE = WORSE than target.
 * lower-better: 110 vs 100 → +10; higher-better: 90 vs 100 → +10.
 */
export function gapPct(direction: KpiDirection, current: number, target: number): number {
  if (target === 0) return 0;
  const raw = ((current - target) / Math.abs(target)) * 100;
  return direction === 'lower-better' ? raw : -raw;
}

/** Tone of a delta: is a change of `delta` an improvement for this direction? */
export function deltaTone(direction: KpiDirection, delta: number): Tone {
  if (delta === 0) return 'neutral';
  const better = direction === 'lower-better' ? delta < 0 : delta > 0;
  return better ? 'good' : 'bad';
}

/** Clamp helper. */
export const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v));
