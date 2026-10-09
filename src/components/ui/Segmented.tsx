import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface SegmentedOption<V extends string> {
  value: V;
  label: string;
  icon?: LucideIcon;
}

export interface SegmentedProps<V extends string> {
  options: SegmentedOption<V>[];
  value: V;
  onChange: (value: V) => void;
  ariaLabel: string;
  size?: 'sm' | 'md';
  /** Stretch segments to fill the width. */
  fullWidth?: boolean;
  className?: string;
}

/**
 * Segmented control (radio group) for 2–4 mutually exclusive choices.
 * @example <Segmented ariaLabel="Ниво амбиције" options={[{value:'min',label:'Минимум'},{value:'top',label:'Предводник'}]} value={v} onChange={setV} />
 */
export function Segmented<V extends string>({ options, value, onChange, ariaLabel, size = 'md', fullWidth, className }: SegmentedProps<V>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn('inline-flex max-w-full rounded-xl border border-line bg-surface-2 p-0.5', fullWidth && 'flex w-full', className)}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'inline-flex min-w-0 items-center justify-center gap-1.5 rounded-[10px] px-1.5 font-medium transition-colors sm:px-3',
              size === 'sm' ? 'min-h-8 py-0.5 text-xs' : 'min-h-9 py-1 text-[0.8125rem] sm:text-sm',
              fullWidth && 'flex-1',
              active ? 'bg-surface text-ink shadow-soft' : 'text-muted hover:text-ink',
            )}
          >
            {o.icon && <o.icon className="size-4 shrink-0" aria-hidden />}
            <span className="min-w-0 text-center leading-tight">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
