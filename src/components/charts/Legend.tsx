import { cn } from '@/lib/cn';

export interface LegendItem {
  label: string;
  /** CSS colour, e.g. toneVar('good') or seriesColor(0). */
  color: string;
  /** Line swatch (dashed target etc.) instead of a square. */
  shape?: 'square' | 'line' | 'dashed' | 'dot';
}

/**
 * Small chart legend.
 * @example <Legend items={[{ label: 'Тренутно', color: seriesColor(0) }, { label: 'Циљ', color: 'var(--ink)', shape: 'dashed' }]} />
 */
export function Legend({ items, className }: { items: LegendItem[]; className?: string }) {
  return (
    <ul className={cn('flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted', className)}>
      {items.map((it) => (
        <li key={it.label} className="inline-flex items-center gap-1.5">
          {it.shape === 'line' || it.shape === 'dashed' ? (
            <svg width="16" height="8" aria-hidden>
              <line x1="0" y1="4" x2="16" y2="4" stroke={it.color} strokeWidth="2" strokeDasharray={it.shape === 'dashed' ? '3 2' : undefined} />
            </svg>
          ) : (
            <span
              className={cn('inline-block size-2.5', it.shape === 'dot' ? 'rounded-full' : 'rounded-[3px]')}
              style={{ background: it.color }}
              aria-hidden
            />
          )}
          {it.label}
        </li>
      ))}
    </ul>
  );
}
