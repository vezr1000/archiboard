import type { Tone } from '@/domain/types';
import { cn } from '@/lib/cn';
import { clamp } from '@/lib/kpi';
import { TONE_CLASSES } from './tone';

export interface RangeBarProps {
  value: number;
  /** Lowest and highest value of the comparison group (the bar's ends). */
  min: number;
  max: number;
  /** Which end is good. Default 'lower-better' (e.g. GWP): lowest third green, highest third red. */
  direction?: 'lower-better' | 'higher-better';
  /** Force the marker tone. */
  tone?: Tone;
  /** Accessible description, e.g. „GWP у односу на исту категорију“. */
  ariaLabel: string;
  className?: string;
}

/**
 * Thin track with a marker showing where a value sits between the min and max of its comparison group.
 * Renders nothing when the group has no spread (min = max).
 * @example <RangeBar value={205} min={180} max={310} ariaLabel="GWP у оквиру категорије" />
 */
export function RangeBar({ value, min, max, direction = 'lower-better', tone, ariaLabel, className }: RangeBarProps) {
  if (!(max > min)) return null;
  const pos = clamp((value - min) / (max - min), 0, 1);
  const goodness = direction === 'lower-better' ? 1 - pos : pos;
  const t: Tone = tone ?? (goodness >= 2 / 3 ? 'good' : goodness >= 1 / 3 ? 'warn' : 'bad');
  return (
    <div
      role="img"
      aria-label={ariaLabel}
      title={ariaLabel}
      className={cn('relative h-2.5 w-full min-w-12 rounded-full bg-surface-2', className)}
    >
      <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-line-strong" aria-hidden />
      <span
        className={cn('absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-surface', TONE_CLASSES[t].bg)}
        style={{ left: `${pos * 100}%` }}
        aria-hidden
      />
    </div>
  );
}
