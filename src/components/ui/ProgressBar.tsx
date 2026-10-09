import type { ReactNode } from 'react';
import type { Tone } from '@/domain/types';
import { cn } from '@/lib/cn';
import { clamp } from '@/lib/kpi';
import { TONE_CLASSES } from './tone';

export interface ProgressBarProps {
  /** Current value (same scale as `max`). */
  value: number;
  /** Scale maximum. Default 1 (value is a ratio). */
  max?: number;
  /** Target marker position (same scale). */
  target?: number;
  tone?: Tone;
  /** Label row above the bar (left). */
  label?: ReactNode;
  /** Value text above the bar (right). */
  valueLabel?: ReactNode;
  size?: 'xs' | 'sm' | 'md';
  /** Accessible name when no visible label. */
  ariaLabel?: string;
  className?: string;
}

const H = { xs: 'h-1', sm: 'h-1.5', md: 'h-2.5' } as const;

/**
 * Horizontal progress bar with optional target marker.
 * @example <ProgressBar label="Г2 спремност" valueLabel="9 / 11" value={9} max={11} tone="accent" />
 * @example <ProgressBar value={358} max={450} target={320} tone="warn" size="sm" />
 */
export function ProgressBar({ value, max = 1, target, tone = 'accent', label, valueLabel, size = 'sm', ariaLabel, className }: ProgressBarProps) {
  const pct = max > 0 ? clamp((value / max) * 100, 0, 100) : 0;
  const targetPct = target !== undefined && max > 0 ? clamp((target / max) * 100, 0, 100) : undefined;
  return (
    <div className={cn('min-w-0', className)}>
      {(label !== undefined || valueLabel !== undefined) && (
        <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
          <span className="min-w-0 truncate text-muted">{label}</span>
          {valueLabel !== undefined && <span className="tabular shrink-0 font-medium text-ink">{valueLabel}</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={ariaLabel ?? (typeof label === 'string' ? label : undefined)}
        className={cn('relative w-full rounded-full bg-surface-2', H[size])}
      >
        <div className={cn('h-full rounded-full transition-[width] duration-500 ease-out', TONE_CLASSES[tone].bg)} style={{ width: `${pct}%` }} />
        {targetPct !== undefined && (
          <div
            className="absolute -top-1 -bottom-1 w-0.5 -translate-x-1/2 rounded-full bg-ink"
            style={{ left: `${targetPct}%` }}
            title="Циљ"
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}
