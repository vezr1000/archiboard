import { useId } from 'react';
import type { Tone } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';
import { toneVar } from '@/components/ui/tone';
import { Legend } from './Legend';
import { niceDomain, scaleLinear } from './utils';

export interface StepPoint {
  /** Position on the x axis (any monotonic number, e.g. a timestamp). */
  x: number;
  /** Value reached at `x` (the line jumps here and stays until the next point). */
  y: number;
  /** Text for screen readers / tooltip, e.g. the decision title. */
  label: string;
  /** Dashed step (not yet decided / projected). */
  projected?: boolean;
  /** Dot colour tone. */
  tone?: Tone;
  /** Draw a larger dot with the value printed next to it. */
  highlight?: boolean;
}

export interface StepTick {
  x: number;
  label: string;
}

export interface StepLineProps {
  points: StepPoint[];
  /** Value the line starts from (default 0). */
  startValue?: number;
  /** Right end of the x domain (the last value is held until here). Default: last point. */
  xEnd?: number;
  /** x tick labels along the bottom axis. */
  xTicks?: StepTick[];
  format?: (v: number) => string;
  unit?: string;
  /** Rendered max height in px. Default 190. */
  height?: number;
  title: string;
  showLegend?: boolean;
  className?: string;
}

/**
 * Step line: a value that changes at discrete moments (cumulative effect of decisions over time).
 * Dashed steps = projected / proposed. Zero line is emphasised.
 * @example
 * <StepLine title="Кумулативни утицај" format={(v) => formatPct(v, { signed: true, decimals: 0 })}
 *   points={[{ x: t0, y: -28, label: 'Одлука 1', tone: 'good' }, { x: t1, y: -20, label: 'Одлука 2', tone: 'bad', projected: true }]} />
 */
export function StepLine({
  points,
  startValue = 0,
  xEnd,
  xTicks = [],
  format = (v) => formatNumber(v),
  unit,
  height = 190,
  title,
  showLegend = true,
  className,
}: StepLineProps) {
  const titleId = useId();
  const W = 340;
  const H = 180;
  const left = 40;
  const right = 14;
  const top = 14;
  const bottom = 24;
  const sorted = [...points].sort((a, b) => a.x - b.x);
  const x0 = sorted[0]?.x ?? 0;
  const x1 = Math.max(xEnd ?? 0, sorted[sorted.length - 1]?.x ?? 1);
  const span = Math.max(1, x1 - x0);
  const [d0, d1] = niceDomain([startValue, 0, ...sorted.map((p) => p.y)], 0.18, true);
  const y = scaleLinear(d0, d1, H - bottom, top);
  // Leave a little room before the first step so the starting level is visible.
  const xDomainStart = x0 - span * 0.06;
  const x = scaleLinear(xDomainStart, x1, left, W - right);
  const ticks = [0, 1, 2, 3, 4].map((k) => d0 + ((d1 - d0) * k) / 4);
  const hasProjected = sorted.some((p) => p.projected);

  const segs: Array<{ key: string; x1: number; y1: number; x2: number; y2: number; dashed: boolean }> = [];
  let prevX = xDomainStart;
  let prevY = startValue;
  sorted.forEach((p, i) => {
    segs.push({ key: `h${i}`, x1: x(prevX), y1: y(prevY), x2: x(p.x), y2: y(prevY), dashed: Boolean(p.projected) });
    segs.push({ key: `v${i}`, x1: x(p.x), y1: y(prevY), x2: x(p.x), y2: y(p.y), dashed: Boolean(p.projected) });
    prevX = p.x;
    prevY = p.y;
  });
  segs.push({ key: 'end', x1: x(prevX), y1: y(prevY), x2: x(x1), y2: y(prevY), dashed: Boolean(sorted[sorted.length - 1]?.projected) });

  return (
    <figure className={cn('min-w-0', className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" style={{ maxHeight: height }} role="img" aria-labelledby={titleId}>
        <title id={titleId}>{`${title}: ${sorted.map((p) => `${p.label} ${format(p.y)}`).join(', ')}${unit ? ` ${unit}` : ''}`}</title>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={left} x2={W - right} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth="1" />
            <text x={left - 6} y={y(t)} textAnchor="end" dominantBaseline="central" fontSize="9.5" fill="var(--muted)">
              {format(t)}
            </text>
          </g>
        ))}
        {d0 < 0 && d1 > 0 && <line x1={left} x2={W - right} y1={y(0)} y2={y(0)} stroke="var(--line-strong)" strokeWidth="1.5" />}
        {segs.map((s) => (
          <line
            key={s.key}
            x1={s.x1}
            y1={s.y1}
            x2={s.x2}
            y2={s.y2}
            stroke="var(--accent)"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeDasharray={s.dashed ? '4 4' : undefined}
          />
        ))}
        {sorted.map((p, i) => {
          const rising = p.y > (i === 0 ? startValue : sorted[i - 1].y);
          const cx = x(p.x);
          const cy = y(p.y);
          const labelRight = cx < W * 0.62;
          return (
            <g key={`${p.x}-${i}`}>
              <title>{`${p.label}: ${format(p.y)}${unit ? ` ${unit}` : ''}`}</title>
              <circle
                cx={cx}
                cy={cy}
                r={p.highlight ? 5 : 3.5}
                fill={p.projected ? 'var(--surface)' : toneVar(p.tone ?? 'accent')}
                stroke={toneVar(p.tone ?? 'accent')}
                strokeWidth="2"
              />
              {p.highlight && (
                <text
                  x={labelRight ? cx + 8 : cx - 8}
                  y={rising ? cy - 8 : cy + 15}
                  textAnchor={labelRight ? 'start' : 'end'}
                  fontSize="10.5"
                  fontWeight="600"
                  fill="var(--ink)"
                >
                  {format(p.y)}
                </text>
              )}
            </g>
          );
        })}
        {xTicks.map((t) => {
          const px = Math.min(W - right, Math.max(left, x(t.x)));
          const anchor = px < left + 28 ? 'start' : px > W - right - 28 ? 'end' : 'middle';
          return (
            <text key={`${t.x}-${t.label}`} x={px} y={H - 6} textAnchor={anchor} fontSize="10" fill="var(--muted)">
              {t.label}
            </text>
          );
        })}
      </svg>
      {showLegend && (
        <Legend
          className="mt-1.5"
          items={[
            { label: 'Усвојено', color: 'var(--accent)', shape: 'line' },
            ...(hasProjected ? [{ label: 'Предлог', color: 'var(--accent)', shape: 'dashed' as const }] : []),
          ]}
        />
      )}
    </figure>
  );
}
