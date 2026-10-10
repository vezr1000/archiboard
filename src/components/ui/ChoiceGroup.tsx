import type { LucideIcon } from 'lucide-react';
import type { Tone } from '@/domain/types';
import { cn } from '@/lib/cn';
import { TONE_CLASSES } from './tone';

export interface ChoiceOption<V extends string> {
  value: V;
  label: string;
  icon?: LucideIcon;
  /** Colour of the selected state (default accent). */
  tone?: Tone;
}

export interface ChoiceGroupProps<V extends string> {
  options: ChoiceOption<V>[];
  /** Selected value; `undefined`/`null` = nothing chosen yet. */
  value: V | undefined | null;
  onChange: (value: V) => void;
  ariaLabel: string;
  /** Equal-width columns (default = number of options). On phones icons stack above the label when ≥ 3 columns. */
  columns?: 1 | 2 | 3 | 4;
  size?: 'sm' | 'md';
  disabled?: boolean;
  className?: string;
}

const COLS = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' } as const;

/**
 * Row of large, tone-coloured choice buttons (radio group) for decisions that matter: votes, dispositions,
 * accept / reject marks. Unlike `Segmented`, nothing needs to be selected and each option carries its own tone.
 * @example
 * <ChoiceGroup ariaLabel="Глас" value={vote} onChange={setVote} options={[
 *   { value: 'yes', label: 'Одобрено', icon: CircleCheck, tone: 'good' },
 *   { value: 'no', label: 'Враћено', icon: Undo2, tone: 'bad' },
 * ]} />
 */
export function ChoiceGroup<V extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  columns,
  size = 'md',
  disabled,
  className,
}: ChoiceGroupProps<V>) {
  const cols = columns ?? (Math.min(4, Math.max(1, options.length)) as 1 | 2 | 3 | 4);
  const stackOnPhone = cols >= 3;
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={cn('grid gap-1.5', COLS[cols], className)}>
      {options.map((o) => {
        const active = o.value === value;
        const t = TONE_CLASSES[o.tone ?? 'accent'];
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(o.value)}
            className={cn(
              'inline-flex min-w-0 items-center justify-center gap-1.5 rounded-xl border px-2 text-center font-medium leading-tight transition-colors disabled:pointer-events-none disabled:opacity-50',
              size === 'sm' ? 'min-h-10 py-1.5 text-[0.8rem]' : 'min-h-11 py-2 text-sm',
              stackOnPhone && 'flex-col sm:flex-row',
              active ? cn(t.soft, t.border) : 'border-line bg-surface text-ink hover:border-line-strong hover:bg-surface-2/60',
            )}
          >
            {o.icon && <o.icon className="size-4 shrink-0" aria-hidden />}
            <span className="min-w-0">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
