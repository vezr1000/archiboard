/**
 * Certification score helpers shared by Портфолио, Преглед and (later) Сертификација.
 * Scores of different schemes live on different scales (see header of `src/data/certification.ts`):
 * LEED counts points out of 110, every other tracker uses a 0–100 scale (%).
 */
import type { RingThreshold } from '@/components/charts';
import type { CertificationScheme, CertificationThreshold, Tone } from '@/domain/types';
import { formatNumber } from './format';

/** Scale maximum of the score (`ProjectCertification.currentScore` / `targetScore`). */
export const certScoreMax = (scheme: CertificationScheme): number => (scheme === 'LEED' ? 110 : 100);

/** Unit shown after a score. */
export const certScoreUnit = (scheme: CertificationScheme): string => (scheme === 'LEED' ? 'бод.' : '%');

/** „66%“ or „58 бод.“. */
export function formatCertScore(value: number, scheme: CertificationScheme): string {
  const v = formatNumber(value, Number.isInteger(value) ? 0 : 1);
  return scheme === 'LEED' ? `${v} бод.` : `${v}%`;
}

/** Tracker thresholds (stored as % of the scale max) converted to score units, for `RingScore`. */
export function thresholdsInScoreUnits(scheme: CertificationScheme, thresholds: CertificationThreshold[]): RingThreshold[] {
  const max = certScoreMax(scheme);
  return thresholds.map((t) => ({ label: t.label, value: Math.round(((t.min * max) / 100) * 10) / 10 }));
}

/** Highest award level already reached by `value` (score units), if any. */
export function achievedLevel(thresholds: RingThreshold[], value: number): RingThreshold | undefined {
  return [...thresholds].filter((t) => value >= t.value).sort((a, b) => b.value - a.value)[0];
}

/** Calm tone for a predicted score vs its target: good when met, otherwise warn (never alarming on its own). */
export const certTone = (current: number, target: number): Tone => (current >= target ? 'good' : 'warn');
