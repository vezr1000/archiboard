import { useId, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface SelectOption<V extends string> {
  value: V;
  label: string;
}

export interface SelectProps<V extends string> {
  value: V;
  onChange: (value: V) => void;
  options: SelectOption<V>[];
  /** Visible label above. If omitted, pass `ariaLabel`. */
  label?: ReactNode;
  ariaLabel?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
  className?: string;
}

/**
 * Native select, styled (best on mobile).
 * @example <Select label="Фасада" value={f} onChange={setF} options={Object.entries(FACADE_LABELS).map(([value, label]) => ({ value, label }))} />
 */
export function Select<V extends string>({ value, onChange, options, label, ariaLabel, size = 'md', disabled, className }: SelectProps<V>) {
  const id = useId();
  return (
    <div className={cn('min-w-0', className)}>
      {label !== undefined && (
        <label htmlFor={id} className="mb-1 block text-sm text-ink">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          value={value}
          disabled={disabled}
          aria-label={ariaLabel}
          onChange={(e) => onChange(e.target.value as V)}
          className={cn(
            'w-full appearance-none truncate rounded-xl border border-line bg-surface pr-9 pl-3 text-ink focus:border-accent focus:outline-none disabled:opacity-50',
            size === 'sm' ? 'h-9 text-sm' : 'h-11 text-[0.95rem]',
          )}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
      </div>
    </div>
  );
}
