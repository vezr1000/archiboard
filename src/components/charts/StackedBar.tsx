import { useId } from 'react';
import type { Tone } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';
import { seriesColor, toneVar } from '@/components/ui/tone';
import { Legend } from './Legend';
import { useMounted } from './utils';

export interface StackSegment {
  id: string;
  label: string;
  value: number;
  /** Tone or explicit CSS colour; default series palette. */
  tone?: Tone;
  color?: string;
}

export interface StackedBarProps {
  segments: StackSegment[];
  /** Total of the scale. If larger than the sum, the rest is shown as empty track. */
  total?: number;
  /** Marker at this value (e.g. target). */
  marker?: number;
  /** Tone for the part of the bar beyond `marker` (e.g. allocation above 100 %). Only used with `marker`. */
  overMarkerTone?: Tone;
  height?: 'sm' | 'md' | 'lg';
  showLegend?: boolean;
  /** Append value to legend labels. */
  legendValues?: boolean;
  format?: (v: number) => string;
  title: string;
  className?: string;
}

const H = { sm: 8, md: 14, lg: 22 } as const;

/**
 * One horizontal bar split into segments (e.g. certification points: achieved / targeted / at risk).
 * @example
 * <StackedBar title="ENV поени" total={100} marker={70}
 *   segments={[{ id: 'a', label: 'Остварено', value: 42, tone: 'good' }, { id: 't', label: 'Циљано', value: 20, tone: 'accent' }, { id: 'r', label: 'Угрожено', value: 8, tone: 'warn' }]} />
 */
export function StackedBar({ segments, total, marker, overMarkerTone, height = 'md', showLegend = true, legendValues, format = (v) => formatNumber(v), title, className }: StackedBarProps) {
  const titleId = useId();
  const mounted = useMounted();
  const sum = segments.reduce((s, x) => s + Math.max(0, x.value), 0);
  const scale = Math.max(total ?? 0, sum) || 1;
  const colorOf = (s: StackSegment, i: number) => s.color ?? (s.tone ? toneVar(s.tone) : seriesColor(i));
  let acc = 0;
  const h = H[height];
  return (
    <figure className={cn('min-w-0', className)}>
      <svg viewBox={`0 0 100 ${h}`} preserveAspectRatio="none" className="block w-full overflow-visible" style={{ height: h }} role="img" aria-labelledby={titleId}>
        <title id={titleId}>{`${title}: ${segments.map((s) => `${s.label} ${format(s.value)}`).join(', ')}`}</title>
        <defs>
          <clipPath id={`${titleId}-clip`}>
            <rect x="0" y="0" width="100" height={h} rx={h / 2} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${titleId}-clip)`}>
          <rect x="0" y="0" width="100" height={h} fill="var(--surface-2)" />
          {segments.map((s, i) => {
            const x = (acc / scale) * 100;
            const w = (Math.max(0, s.value) / scale) * 100;
            acc += Math.max(0, s.value);
            return (
              <rect
                key={s.id}
                x={mounted ? x : 0}
                y="0"
                width={mounted ? w : 0}
                height={h}
                fill={colorOf(s, i)}
                style={{ transition: 'x 600ms ease, width 600ms ease' }}
              />
            );
          })}
          {marker !== undefined && overMarkerTone && sum > marker && (
            <rect x={(marker / scale) * 100} y="0" width={((sum - marker) / scale) * 100} height={h} fill={toneVar(overMarkerTone)} opacity="0.55" />
          )}
        </g>
        {marker !== undefined && (
          <line x1={(marker / scale) * 100} x2={(marker / scale) * 100} y1={-3} y2={h + 3} stroke="var(--ink)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        )}
      </svg>
      {showLegend && (
        <Legend
          className="mt-2"
          items={[
            ...segments.map((s, i) => ({ label: legendValues ? `${s.label} ${format(s.value)}` : s.label, color: colorOf(s, i) })),
            ...(marker !== undefined ? [{ label: 'Циљ', color: 'var(--ink)', shape: 'line' as const }] : []),
          ]}
        />
      )}
    </figure>
  );
}
