import type { KpiDirection } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';
import { seriesColor } from '@/components/ui/tone';
import { Legend } from './Legend';
import { useMounted } from './utils';

export interface GroupedBarsSeries {
  id: string;
  label: string;
  /** CSS colour; default series palette by index (fixed order — colour follows the series). */
  color?: string;
}

export interface GroupedBarsGroup {
  id: string;
  /** Metric name, e.g. „Уграђени угљеник“. */
  label: string;
  unit?: string;
  /** One value per series (same order). */
  values: number[];
  /** Optional target marker for the group. */
  target?: number;
  /** Shown next to the label, e.g. „мање је боље“. */
  direction?: KpiDirection;
  format?: (v: number) => string;
}

export interface GroupedBarsProps {
  series: GroupedBarsSeries[];
  groups: GroupedBarsGroup[];
  title: string;
  className?: string;
}

/**
 * Small multiples of horizontal bars: one group per metric, one thin bar per series, each group on its own scale
 * (metrics with different units are never forced onto one axis). Values are direct-labelled.
 * @example
 * <GroupedBars title="Поређење" series={[{ id: 'a', label: 'А' }, { id: 'b', label: 'Б' }]}
 *   groups={[{ id: 'ec', label: 'Уграђени угљеник', unit: 'kgCO₂e/m²', values: [432, 358], target: 320, direction: 'lower-better' }]} />
 */
export function GroupedBars({ series, groups, title, className }: GroupedBarsProps) {
  const mounted = useMounted();
  const colorOf = (i: number) => series[i]?.color ?? seriesColor(i);
  return (
    <figure className={cn('min-w-0', className)} aria-label={title}>
      <Legend className="mb-3" items={series.map((s, i) => ({ label: s.label, color: colorOf(i) }))} />
      <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {groups.map((g) => {
          const fmt = g.format ?? ((v: number) => formatNumber(v));
          const max = Math.max(1e-9, ...g.values.map((v) => Math.abs(v)), g.target ?? 0) * 1.08;
          return (
            <div key={g.id} className="min-w-0">
              <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-medium text-ink">{g.label}</span>
                <span className="shrink-0 text-[0.7rem] text-muted">
                  {g.unit}
                  {g.direction && ` · ${g.direction === 'lower-better' ? 'мање је боље' : 'више је боље'}`}
                </span>
              </div>
              <ul className="relative flex flex-col gap-1">
                {g.values.map((v, i) => {
                  const w = Math.min(100, (Math.abs(v) / max) * 100);
                  return (
                    <li key={series[i]?.id ?? i} className="flex items-center gap-2" title={`${series[i]?.label}: ${fmt(v)}${g.unit ? ` ${g.unit}` : ''}`}>
                      <span className="w-6 shrink-0 text-right text-xs text-muted">{series[i]?.label}</span>
                      <span className="relative h-2.5 min-w-0 flex-1">
                        <span
                          className="absolute inset-y-0 left-0 rounded-r-full transition-[width] duration-700 ease-out"
                          style={{ width: mounted ? `${w}%` : 0, background: colorOf(i) }}
                          aria-hidden
                        />
                      </span>
                      <span className="tabular w-12 shrink-0 text-right text-xs text-ink">{fmt(v)}</span>
                    </li>
                  );
                })}
                {g.target !== undefined && (
                  <span
                    className="pointer-events-none absolute -top-0.5 -bottom-0.5 w-0.5 rounded-full bg-ink"
                    style={{ left: `calc(2rem + (100% - 5.5rem) * ${Math.min(1, g.target / max)})` }}
                    title={`Циљ ${fmt(g.target)}`}
                    aria-hidden
                  />
                )}
              </ul>
            </div>
          );
        })}
      </div>
      {groups.some((g) => g.target !== undefined) && (
        <Legend className="mt-3" items={[{ label: 'Циљ пројекта', color: 'var(--ink)', shape: 'line' }]} />
      )}
    </figure>
  );
}
