import type { Tone } from '@/domain/types';
import { cn } from '@/lib/cn';
import { TONE_CLASSES } from './tone';

export interface StatusDotProps {
  tone: Tone;
  /** Visible text next to the dot. If omitted, pass `srLabel` for screen readers. */
  label?: string;
  srLabel?: string;
  /** Soft pulsing halo (e.g. live / attention). */
  pulse?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Coloured dot with optional label.
 * @example <StatusDot tone="warn" label="Ризик" />
 */
export function StatusDot({ tone, label, srLabel, pulse, size = 'md', className }: StatusDotProps) {
  const t = TONE_CLASSES[tone];
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-1.5', className)}>
      <span className={cn('relative inline-flex shrink-0', size === 'sm' ? 'size-2' : 'size-2.5')} aria-hidden>
        {pulse && <span className={cn('absolute inset-0 animate-ping rounded-full opacity-50', t.bg)} />}
        <span className={cn('relative inline-flex size-full rounded-full', t.bg)} />
      </span>
      {label ? <span className="truncate text-sm text-ink">{label}</span> : srLabel ? <span className="sr-only">{srLabel}</span> : null}
    </span>
  );
}
