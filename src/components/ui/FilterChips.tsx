import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface FilterChipOption<V extends string> {
  value: V;
  label: string;
  count?: number;
}

interface BaseProps<V extends string> {
  options: FilterChipOption<V>[];
  ariaLabel: string;
  /** Horizontal scroll in one row (default) vs wrap onto several rows. */
  wrap?: boolean;
  className?: string;
}

export type FilterChipsProps<V extends string> = BaseProps<V> &
  (
    | { multiple: true; value: V[]; onChange: (value: V[]) => void }
    | { multiple?: false; value: V | null; onChange: (value: V | null) => void }
  );

/**
 * Toggleable filter chips. Single-select (click again to clear) or `multiple`.
 * @example <FilterChips ariaLabel="Статус" options={[{value:'open',label:'Отворени',count:4}]} value={status} onChange={setStatus} />
 * @example <FilterChips multiple ariaLabel="Врста" options={opts} value={kinds} onChange={setKinds} />
 */
export function FilterChips<V extends string>(props: FilterChipsProps<V>) {
  const { options, ariaLabel, wrap, className } = props;
  const isActive = (v: V) => (props.multiple ? props.value.includes(v) : props.value === v);
  const toggle = (v: V) => {
    if (props.multiple) {
      props.onChange(props.value.includes(v) ? props.value.filter((x) => x !== v) : [...props.value, v]);
    } else {
      props.onChange(props.value === v ? null : v);
    }
  };
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        'flex min-w-0 gap-1.5',
        wrap ? 'flex-wrap' : 'scrollbar-none -mx-4 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0',
        className,
      )}
    >
      {options.map((o) => {
        const active = isActive(o.value);
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(o.value)}
            className={cn(
              'inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-sm transition-colors',
              active ? 'border-accent bg-accent-soft font-medium text-accent' : 'border-line bg-surface text-muted hover:text-ink',
            )}
          >
            {active && <Check className="size-3.5" aria-hidden />}
            {o.label}
            {o.count !== undefined && <span className="tabular text-xs opacity-70">{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
