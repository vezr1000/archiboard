import type { Tone } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatSigned } from '@/lib/format';
import { toneVar } from '@/components/ui/tone';

export interface DivergingDatum {
  id: string;
  label: string;
  /** Signed value; bars grow left (negative) or right (positive) from a zero axis. */
  value: number;
  /** Optional muted note under the label (e.g. „алуминијум → фибер-цемент“). */
  sublabel?: string;
}

export interface DivergingBarsProps {
  data: DivergingDatum[];
  /** Tone of positive / negative bars. Default: positive = bad, negative = good (lower-better metric). */
  positiveTone?: Tone;
  negativeTone?: Tone;
  /** Unit after values. */
  unit?: string;
  /** Value formatter (default signed, 1 decimal under 10). */
  format?: (v: number) => string;
  /** Symmetric scale max (absolute). Default: largest |value|. */
  max?: number;
  /** Optional total row under the bars. */
  total?: { label: string; value: number };
  title: string;
  className?: string;
}

const fmtDefault = (v: number) => formatSigned(v, Math.abs(v) < 10 ? 1 : 0);

/**
 * Horizontal diverging bars around zero — „what changed the result“ (contribution of each parameter).
 * Labels sit above each bar so long Serbian labels never collide with the bars on a phone.
 * @example
 * <DivergingBars title="Допринос промена" unit="kgCO₂e/m²"
 *   data={[{ id: 'cladding', label: 'Фасадна облога', value: -18 }, { id: 'pv', label: 'PV снага', value: 4.2 }]}
 *   total={{ label: 'Укупно', value: -13.8 }} />
 */
export function DivergingBars({
  data,
  positiveTone = 'bad',
  negativeTone = 'good',
  unit,
  format = fmtDefault,
  max,
  total,
  title,
  className,
}: DivergingBarsProps) {
  const scale = max ?? Math.max(1e-9, ...data.map((d) => Math.abs(d.value)), total ? Math.abs(total.value) : 0);
  const pct = (v: number) => Math.min(50, (Math.abs(v) / scale) * 50);
  const unitText = unit ? ` ${unit}` : '';
  return (
    <figure className={cn('min-w-0', className)} aria-label={title}>
      <ul className="flex flex-col gap-2.5">
        {data.map((d) => {
          const tone = d.value >= 0 ? positiveTone : negativeTone;
          return (
            <li key={d.id} className="min-w-0" title={`${d.label}: ${format(d.value)}${unitText}`}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate text-ink">{d.label}</span>
                <span className="tabular shrink-0 font-semibold text-ink">
                  {format(d.value)}
                  <span className="font-normal text-muted">{unitText}</span>
                </span>
              </div>
              {d.sublabel && <div className="truncate text-xs text-muted">{d.sublabel}</div>}
              <div className="relative mt-1 h-2.5 rounded-full bg-surface-2">
                <span className="absolute inset-y-[-3px] left-1/2 w-px bg-line-strong" aria-hidden />
                <span
                  className="absolute inset-y-0 rounded-full transition-[width,left] duration-500 ease-out"
                  style={{
                    background: toneVar(tone),
                    width: `${pct(d.value)}%`,
                    left: d.value >= 0 ? '50%' : `${50 - pct(d.value)}%`,
                  }}
                  aria-hidden
                />
              </div>
            </li>
          );
        })}
      </ul>
      {total && (
        <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-line pt-2.5 text-sm">
          <span className="font-medium text-ink">{total.label}</span>
          <span className="tabular font-semibold text-ink">
            {format(total.value)}
            <span className="font-normal text-muted">{unitText}</span>
          </span>
        </div>
      )}
      <figcaption className="mt-2 flex justify-between text-[0.7rem] text-muted">
        <span>← смањује</span>
        <span>повећава →</span>
      </figcaption>
    </figure>
  );
}
