import type { KpiDirection, Tone } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';
import { kpiStatus } from '@/lib/kpi';
import { CHECK_STATUS_TONE } from '@/domain/labels';
import { toneVar } from '@/components/ui/tone';
import { Legend } from './Legend';
import { useMounted } from './utils';

export interface BarDatum {
  id: string;
  label: string;
  value: number;
  /** Target marker for this bar. */
  target?: number;
  /** Force colour. Otherwise derived from target + direction (pass/warn/fail), else accent. */
  tone?: Tone;
  /** Muted text under the label (e.g. city). */
  sublabel?: string;
  /** Override the formatted value text. */
  valueLabel?: string;
}

export interface BarChartProps {
  data: BarDatum[];
  /** Scale max. Default: max of values and targets × 1.1. */
  max?: number;
  /** Value formatter (default formatNumber). */
  format?: (v: number) => string;
  /** Unit appended to values. */
  unit?: string;
  /** Used to colour bars vs target. Default 'lower-better'. */
  direction?: KpiDirection;
  /** Accessible title. */
  title: string;
  /** Show the legend for target marker. Default true when any target exists. */
  showLegend?: boolean;
  onBarClick?: (d: BarDatum) => void;
  className?: string;
}

/**
 * Horizontal bar chart with a per-bar target marker (e.g. carbon budget per project).
 * @example
 * <BarChart title="Уграђени угљеник по пројекту" unit="kgCO₂e/m²" direction="lower-better"
 *   data={[{ id: 'sk', label: 'Савски кеј', value: 358, target: 320 }, { id: 'os', label: 'ОШ Ново насеље', value: 190, target: 220 }]} />
 */
export function BarChart({ data, max, format = (v) => formatNumber(v), unit, direction = 'lower-better', title, showLegend, onBarClick, className }: BarChartProps) {
  const mounted = useMounted();
  const scaleMax = max ?? Math.max(1, ...data.flatMap((d) => [d.value, d.target ?? 0])) * 1.1;
  const hasTargets = data.some((d) => d.target !== undefined);
  return (
    <figure className={cn('min-w-0', className)} aria-label={title}>
      <ul className="flex flex-col gap-3.5">
        {data.map((d) => {
          const tone: Tone = d.tone ?? (d.target !== undefined ? CHECK_STATUS_TONE[kpiStatus(direction, d.value, d.target)] : 'accent');
          const w = Math.max(0, Math.min(100, (d.value / scaleMax) * 100));
          const t = d.target !== undefined ? Math.max(0, Math.min(100, (d.target / scaleMax) * 100)) : undefined;
          const Row = onBarClick ? 'button' : 'div';
          return (
            <li key={d.id}>
              <Row
                {...(onBarClick ? { type: 'button' as const, onClick: () => onBarClick(d) } : {})}
                className={cn('block w-full text-left', onBarClick && 'rounded-lg hover:opacity-80')}
              >
                <div className="mb-1 flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate text-sm text-ink">
                    {d.label}
                    {d.sublabel && <span className="ml-1.5 text-xs text-muted">{d.sublabel}</span>}
                  </span>
                  <span className="tabular shrink-0 text-sm font-medium text-ink">
                    {d.valueLabel ?? format(d.value)}
                    {unit && <span className="ml-1 text-xs font-normal text-muted">{unit}</span>}
                  </span>
                </div>
                <svg viewBox="0 0 100 12" preserveAspectRatio="none" className="block h-3 w-full overflow-visible" aria-hidden>
                  <rect x="0" y="2" width="100" height="8" rx="4" fill="var(--surface-2)" />
                  <rect
                    x="0"
                    y="2"
                    width={mounted ? w : 0}
                    height="8"
                    rx="4"
                    fill={toneVar(tone)}
                    style={{ transition: 'width 600ms cubic-bezier(.2,.8,.2,1)' }}
                  />
                  {t !== undefined && (
                    <line x1={t} x2={t} y1="0" y2="12" stroke="var(--ink)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  )}
                </svg>
              </Row>
            </li>
          );
        })}
      </ul>
      {(showLegend ?? hasTargets) && (
        <Legend
          className="mt-3"
          items={[
            { label: 'У оквиру циља', color: toneVar('good') },
            { label: 'До 10 % одступања', color: toneVar('warn') },
            { label: 'Изнад 10 %', color: toneVar('bad') },
            { label: 'Циљ', color: 'var(--ink)', shape: 'line' },
          ]}
        />
      )}
      <figcaption className="sr-only">{title}</figcaption>
    </figure>
  );
}
