import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import type { KpiDirection, Tone } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatNumber, formatSigned } from '@/lib/format';
import { deltaTone } from '@/lib/kpi';
import { TONE_CLASSES } from './tone';

export interface StatProps {
  label: ReactNode;
  /** Number (formatted with `decimals`) or preformatted string/node. */
  value: number | string | ReactNode;
  unit?: string;
  decimals?: number;
  /** Change vs reference (e.g. vs target or previous phase). Sign is shown. */
  delta?: number;
  /** Unit of the delta, default '%'. Use '' for absolute values. */
  deltaUnit?: string;
  /** Text after the delta, e.g. „у односу на циљ“. */
  deltaLabel?: string;
  /** KPI direction decides delta colour (lower-better: negative = good). Default 'higher-better'. */
  direction?: KpiDirection;
  /** Force the delta tone. */
  deltaToneOverride?: Tone;
  /** Small muted line under the value. */
  hint?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** Optional trailing visual (sparkline, ring). */
  aside?: ReactNode;
  className?: string;
}

const VALUE_SIZE = { sm: 'text-xl', md: 'text-[1.7rem]', lg: 'text-4xl' } as const;

/**
 * Big number with label, unit and coloured delta.
 * @example <Stat label="Уграђени угљеник" value={358} unit="kgCO₂e/m²" delta={11.9} direction="lower-better" deltaLabel="изнад циља" />
 */
export function Stat({
  label,
  value,
  unit,
  decimals,
  delta,
  deltaUnit = ' %',
  deltaLabel,
  direction = 'higher-better',
  deltaToneOverride,
  hint,
  size = 'md',
  aside,
  className,
}: StatProps) {
  const tone = delta === undefined ? 'neutral' : (deltaToneOverride ?? deltaTone(direction, delta));
  const DeltaIcon = delta === undefined || delta === 0 ? Minus : delta > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <div className={cn('flex min-w-0 items-end justify-between gap-3', className)}>
      <div className="min-w-0">
        <div className="truncate text-[0.8rem] text-muted">{label}</div>
        <div className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5">
          <span className={cn('tabular font-display font-semibold leading-tight text-ink', VALUE_SIZE[size])}>
            {typeof value === 'number' ? formatNumber(value, decimals) : value}
          </span>
          {unit && <span className="text-sm text-muted">{unit}</span>}
        </div>
        {delta !== undefined && (
          <div className={cn('mt-1 flex items-center gap-1 text-xs font-medium', TONE_CLASSES[tone].text)}>
            <DeltaIcon className="size-3.5" aria-hidden />
            <span className="tabular">
              {formatSigned(delta, Number.isInteger(delta) || Math.abs(delta) >= 10 ? 0 : 1)}
              {deltaUnit}
            </span>
            {deltaLabel && <span className="font-normal text-muted">{deltaLabel}</span>}
          </div>
        )}
        {hint !== undefined && <div className="mt-1 text-xs text-muted">{hint}</div>}
      </div>
      {aside !== undefined && <div className="shrink-0">{aside}</div>}
    </div>
  );
}
