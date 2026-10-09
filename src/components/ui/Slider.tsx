import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';

export interface SliderProps {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  /** Value display formatter. Default: formatNumber + unit. */
  format?: (value: number) => string;
  unit?: string;
  /** Muted line under the slider (e.g. min/max hint, explanation). */
  hint?: ReactNode;
  /** Optional min/max end labels. */
  minLabel?: string;
  maxLabel?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Labelled range input with live value.
 * @example <Slider label="Изолација" unit="cm" value={cm} min={10} max={30} step={1} onChange={setCm} />
 */
export function Slider({ label, value, min, max, step = 1, onChange, format, unit, hint, minLabel, maxLabel, disabled, className }: SliderProps) {
  const id = useId();
  const display = format ? format(value) : `${formatNumber(value)}${unit ? ` ${unit}` : ''}`;
  const pct = ((value - min) / (max - min || 1)) * 100;
  return (
    <div className={cn('min-w-0', disabled && 'opacity-50', className)}>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="min-w-0 truncate text-sm text-ink">
          {label}
        </label>
        <output htmlFor={id} className="tabular shrink-0 text-sm font-semibold text-accent">
          {display}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-valuetext={display}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          'h-10 w-full cursor-pointer appearance-none bg-transparent',
          '[&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-[linear-gradient(to_right,var(--accent)_var(--fill),var(--surface-2)_var(--fill))]',
          '[&::-webkit-slider-thumb]:-mt-[7px] [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-surface [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-soft',
          '[&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-surface-2',
          '[&::-moz-range-progress]:h-1.5 [&::-moz-range-progress]:rounded-full [&::-moz-range-progress]:bg-accent',
          '[&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-surface [&::-moz-range-thumb]:bg-accent',
        )}
        style={{
          // WebKit track fill (accent up to the thumb).
          ['--fill' as string]: `${pct}%`,
        }}
      />
      {(minLabel || maxLabel) && (
        <div className="-mt-1 flex justify-between text-[0.7rem] text-muted">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
      {hint !== undefined && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
