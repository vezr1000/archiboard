/**
 * Tone → token class/colour maps. Every coloured primitive and chart uses these, so a tone always looks the same.
 *
 *   TONE_CLASSES.good.soft   // 'bg-good-soft text-good'
 *   toneVar('warn')          // 'var(--warn)'  (for SVG fill/stroke)
 */
import type { Tone } from '@/domain/types';

export interface ToneClassSet {
  /** Soft tinted background + coloured text (badges, chips). */
  soft: string;
  /** Solid background + contrasting text. */
  solid: string;
  /** Text colour only. */
  text: string;
  /** Background only (dots, bars). */
  bg: string;
  /** Soft background only. */
  bgSoft: string;
  /** Border colour. */
  border: string;
}

export const TONE_CLASSES: Record<Tone, ToneClassSet> = {
  neutral: {
    soft: 'bg-surface-2 text-muted',
    solid: 'bg-ink text-paper',
    text: 'text-muted',
    bg: 'bg-muted',
    bgSoft: 'bg-surface-2',
    border: 'border-line-strong',
  },
  accent: {
    soft: 'bg-accent-soft text-accent',
    solid: 'bg-accent text-accent-ink',
    text: 'text-accent',
    bg: 'bg-accent',
    bgSoft: 'bg-accent-soft',
    border: 'border-accent',
  },
  good: {
    soft: 'bg-good-soft text-good',
    solid: 'bg-good text-paper',
    text: 'text-good',
    bg: 'bg-good',
    bgSoft: 'bg-good-soft',
    border: 'border-good',
  },
  warn: {
    soft: 'bg-warn-soft text-warn',
    solid: 'bg-warn text-paper',
    text: 'text-warn',
    bg: 'bg-warn',
    bgSoft: 'bg-warn-soft',
    border: 'border-warn',
  },
  bad: {
    soft: 'bg-bad-soft text-bad',
    solid: 'bg-bad text-paper',
    text: 'text-bad',
    bg: 'bg-bad',
    bgSoft: 'bg-bad-soft',
    border: 'border-bad',
  },
  info: {
    soft: 'bg-info-soft text-info',
    solid: 'bg-info text-paper',
    text: 'text-info',
    bg: 'bg-info',
    bgSoft: 'bg-info-soft',
    border: 'border-info',
  },
  clay: {
    soft: 'bg-clay-soft text-clay',
    solid: 'bg-clay text-paper',
    text: 'text-clay',
    bg: 'bg-clay',
    bgSoft: 'bg-clay-soft',
    border: 'border-clay',
  },
};

/** CSS colour value for a tone (for SVG fill/stroke or inline style). */
export function toneVar(tone: Tone, soft = false): string {
  if (tone === 'neutral') return soft ? 'var(--surface-2)' : 'var(--muted)';
  return soft ? `var(--${tone}-soft)` : `var(--${tone})`;
}

/** Categorical series colours (theme-aware), in order. `seriesColor(i)` cycles. */
export const SERIES_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];
export const seriesColor = (i: number): string => SERIES_COLORS[((i % SERIES_COLORS.length) + SERIES_COLORS.length) % SERIES_COLORS.length];
