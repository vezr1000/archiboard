/**
 * Certification score helpers shared by Портфолио, Преглед and (later) Сертификација.
 * Scores of different schemes live on different scales (see header of `src/data/certification.ts`):
 * LEED counts points out of 110, every other tracker uses a 0–100 scale (%).
 */
import type { RingThreshold } from '@/components/charts';
import type { CertificationCategory, CertificationCategoryScore, CertificationScheme, CertificationThreshold, Tone } from '@/domain/types';
import { formatNumber } from './format';

/** Scale maximum of the score (`ProjectCertification.currentScore` / `targetScore`). */
export const certScoreMax = (scheme: CertificationScheme): number => (scheme === 'LEED' ? 110 : 100);

/** Unit shown after a score. */
export const certScoreUnit = (scheme: CertificationScheme): string => (scheme === 'LEED' ? 'бод.' : '%');

/** „66%“ or „58 бод.“. */
export function formatCertScore(value: number, scheme: CertificationScheme): string {
  const v = formatNumber(value, Number.isInteger(value) ? 0 : 1);
  return scheme === 'LEED' ? `${v} бод.` : `${v} %`;
}

/** Tracker thresholds (stored as % of the scale max) converted to score units, for `RingScore`. */
export function thresholdsInScoreUnits(scheme: CertificationScheme, thresholds: CertificationThreshold[]): RingThreshold[] {
  const max = certScoreMax(scheme);
  return thresholds.map((t) => {
    const v = (t.min * max) / 100;
    // LEED levels are whole points (40 / 50 / 60 / 80); other schemes keep one decimal.
    return { label: t.label, value: scheme === 'LEED' ? Math.round(v) : Math.round(v * 10) / 10 };
  });
}

/** Highest award level already reached by `value` (score units), if any. */
export function achievedLevel(thresholds: RingThreshold[], value: number): RingThreshold | undefined {
  return [...thresholds].filter((t) => value >= t.value).sort((a, b) => b.value - a.value)[0];
}

/** Calm tone for a predicted score vs its target: good when met, otherwise warn (never alarming on its own). */
export const certTone = (current: number, target: number): Tone => (current >= target ? 'good' : 'warn');

/* ------------------------------------------------------------------------------------------------
 * Step 5 — Сертификација helpers
 * ---------------------------------------------------------------------------------------------- */

/** Unit of a score difference: „бод.“ for LEED, „п.п.“ (percentage points) otherwise. */
export const certGapUnit = (scheme: CertificationScheme): string => (scheme === 'LEED' ? 'бод.' : 'п.п.');

/** „1 п.п.“ / „2 бод.“ — absolute difference of two scores in score units. */
export function formatCertGap(value: number, scheme: CertificationScheme): string {
  const v = Math.round(Math.abs(value) * 10) / 10;
  return `${formatNumber(v, Number.isInteger(v) ? 0 : 1)} ${certGapUnit(scheme)}`;
}

/** Unit of a category value: LEED = points, Passivhaus = criteria, the rest = % (index / savings / score). */
export const categoryUnit = (scheme: CertificationScheme): string => (scheme === 'LEED' ? 'бод.' : scheme === 'Passivhaus' ? 'крит.' : '%');

export interface CategoryBreakdown {
  id: string;
  label: string;
  weight: number;
  max: number;
  achieved: number;
  /** Targeted, not reached yet and not flagged at risk. */
  pending: number;
  /** Part of the targeted gap that is at risk. */
  atRisk: number;
  /** Headroom above everything achieved / targeted. */
  remaining: number;
  /** The category target as seen on the scale. */
  targeted: number;
}

/** Splits a category into the four stacked-bar segments (achieved / targeted-not-yet / at risk / remaining). */
export function categoryBreakdown(c: CertificationCategoryScore): CategoryBreakdown {
  const gap = Math.max(0, c.targeted - c.achieved);
  const atRisk = Math.min(c.atRisk, gap);
  const pending = Math.max(0, gap - atRisk);
  const remaining = Math.max(0, c.max - c.achieved - atRisk - pending);
  return { id: c.id, label: c.label, weight: c.weight, max: c.max, achieved: c.achieved, pending, atRisk, remaining, targeted: c.targeted };
}

export type ScoreMode = 'achieved' | 'targeted' | 'atRisk';

/**
 * Scheme score from category values, in score units (same scale as `ProjectCertification.currentScore`):
 * LEED = Σ points; EDGE = energy savings % (the level thresholds are energy savings);
 * every other scheme (and the park scorecard) = Σ weight × value / max.
 * `targeted` = max(targeted, achieved); `atRisk` = the at-risk part of the targeted gap.
 */
export function trackerScore(tracker: CertificationCategory, mode: ScoreMode): number {
  const value = (c: CertificationCategoryScore): number => {
    const b = categoryBreakdown(c);
    return mode === 'achieved' ? b.achieved : mode === 'targeted' ? b.achieved + b.pending + b.atRisk : b.atRisk;
  };
  if (tracker.scheme === 'LEED') return tracker.categories.reduce((s, c) => s + value(c), 0);
  if (tracker.scheme === 'EDGE') {
    const energy = tracker.categories.find((c) => c.id === 'energy') ?? tracker.categories[0];
    return energy ? value(energy) : 0;
  }
  const w = tracker.categories.reduce((s, c) => s + c.weight, 0) || 1;
  return (tracker.categories.reduce((s, c) => s + (c.weight * value(c)) / (c.max || 1), 0) / w) * 100;
}

/** Threshold (score units) of an award level by its label, e.g. „Gold“. */
export const thresholdOf = (thresholds: RingThreshold[], label: string): RingThreshold | undefined =>
  thresholds.find((t) => t.label === label);

/** First threshold strictly above `value`. */
export const nextThreshold = (thresholds: RingThreshold[], value: number): RingThreshold | undefined =>
  [...thresholds].filter((t) => t.value > value).sort((a, b) => a.value - b.value)[0];
