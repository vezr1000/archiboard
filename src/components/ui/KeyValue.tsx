import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface KeyValueItem {
  label: ReactNode;
  value: ReactNode;
  /** Muted note under the value. */
  hint?: ReactNode;
}

export interface KeyValueProps {
  items: KeyValueItem[];
  /** 1 = label left / value right rows (default); 2 = two-column grid of stacked pairs on ≥sm. */
  columns?: 1 | 2;
  className?: string;
}

/**
 * Definition list for facts (address, parcel, GFA …).
 * @example <KeyValue items={[{ label: 'Парцела', value: 'КП 1789/3' }, { label: 'БРГП', value: formatArea(18400) }]} />
 */
export function KeyValue({ items, columns = 1, className }: KeyValueProps) {
  if (columns === 2) {
    return (
      <dl className={cn('grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2', className)}>
        {items.map((it, i) => (
          <div key={i} className="min-w-0">
            <dt className="text-xs text-muted">{it.label}</dt>
            <dd className="mt-0.5 break-words text-sm text-ink">{it.value}</dd>
            {it.hint !== undefined && <dd className="text-xs text-muted">{it.hint}</dd>}
          </div>
        ))}
      </dl>
    );
  }
  return (
    <dl className={cn('divide-y divide-line', className)}>
      {items.map((it, i) => (
        <div key={i} className="flex min-w-0 items-baseline justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
          <dt className="shrink-0 text-sm text-muted">{it.label}</dt>
          <dd className="min-w-0 text-right text-sm text-ink">
            <div className="break-words">{it.value}</div>
            {it.hint !== undefined && <div className="text-xs text-muted">{it.hint}</div>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
