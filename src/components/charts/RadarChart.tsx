import { useId } from 'react';
import { cn } from '@/lib/cn';
import { seriesColor } from '@/components/ui/tone';
import { Legend } from './Legend';
import { polar, truncate } from './utils';

/** Split a label into ≤ 2 balanced lines at a space (labels longer than 10 chars). */
function splitLabel(label: string): string[] {
  if (label.length <= 10 || !label.includes(' ')) return [label];
  const mid = label.length / 2;
  let best = -1;
  for (let i = 0; i < label.length; i++) if (label[i] === ' ' && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
  return [label.slice(0, best), label.slice(best + 1)];
}

export interface RadarAxis {
  id: string;
  label: string;
}

export interface RadarSeries {
  id: string;
  label: string;
  /** One value per axis, same order as `axes`. */
  values: number[];
  /** CSS colour; default series palette. */
  color?: string;
  /** Dashed outline without fill (e.g. target). */
  dashed?: boolean;
}

export interface RadarChartProps {
  axes: RadarAxis[];
  /** 1–3 series. */
  series: RadarSeries[];
  /** Scale max for all axes. Default 100. */
  max?: number;
  /** Concentric grid levels. Default 4. */
  levels?: number;
  /** Max label length before truncation. Default 14. */
  labelMax?: number;
  title: string;
  showLegend?: boolean;
  className?: string;
}

/**
 * Radar / spider chart for comparing options across normalised criteria (0..max).
 * @example
 * <RadarChart title="Поређење варијанти" max={100}
 *   axes={[{ id: 'c', label: 'Угљеник' }, { id: 'e', label: 'Енергија' }, { id: 'k', label: 'Трошак' }, { id: 'd', label: 'Дневно светло' }, { id: 's', label: 'Сертификација' }]}
 *   series={[{ id: 'a', label: 'Варијанта А', values: [40, 60, 80, 55, 50] }, { id: 'b', label: 'Варијанта Б', values: [80, 70, 55, 65, 75] }]} />
 */
export function RadarChart({ axes, series, max = 100, levels = 4, labelMax = 14, title, showLegend = true, className }: RadarChartProps) {
  const titleId = useId();
  const W = 360;
  const R = 86;
  const H = 2 * R + 80; // extra room below for two-line bottom labels
  const cx = W / 2;
  const cy = R + 30;
  const n = axes.length;
  const angle = (i: number) => (360 * i) / n;
  const ring = (k: number) =>
    axes.map((_, i) => polar(cx, cy, (R * k) / levels, angle(i))).map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <figure className={cn('min-w-0', className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block w-full max-w-[26rem]" role="img" aria-labelledby={titleId}>
        <title id={titleId}>{title}</title>
        {Array.from({ length: levels }, (_, k) => (
          <polygon key={k} points={ring(k + 1)} fill="none" stroke="var(--line)" strokeWidth="1" />
        ))}
        {axes.map((a, i) => {
          const p = polar(cx, cy, R, angle(i));
          return <line key={a.id} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--line)" strokeWidth="1" />;
        })}
        {series.map((s, si) => {
          const color = s.color ?? seriesColor(si);
          const pts = s.values
            .map((v, i) => polar(cx, cy, (R * Math.max(0, Math.min(max, v))) / max, angle(i)))
            .map((p) => `${p.x},${p.y}`)
            .join(' ');
          return (
            <g key={s.id}>
              <polygon
                points={pts}
                fill={s.dashed ? 'none' : color}
                fillOpacity={s.dashed ? 0 : 0.16}
                stroke={color}
                strokeWidth="2"
                strokeDasharray={s.dashed ? '4 3' : undefined}
                strokeLinejoin="round"
              />
              {!s.dashed &&
                s.values.map((v, i) => {
                  const p = polar(cx, cy, (R * Math.max(0, Math.min(max, v))) / max, angle(i));
                  return <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />;
                })}
            </g>
          );
        })}
        {axes.map((a, i) => {
          const ang = angle(i);
          const p = polar(cx, cy, R + 12, ang);
          const anchor = Math.abs(ang) < 1 || Math.abs(ang - 180) < 1 ? 'middle' : ang < 180 ? 'start' : 'end';
          const lines = splitLabel(truncate(a.label, labelMax));
          // Top label sits above the point, bottom label below, others centred vertically.
          const dy0 = ang < 45 || ang > 315 ? -(lines.length - 1) * 12 : ang > 135 && ang < 225 ? 6 : -((lines.length - 1) * 12) / 2;
          return (
            <text key={a.id} x={p.x} y={p.y} fontSize="10.5" fill="var(--muted)" textAnchor={anchor} dominantBaseline="middle">
              <title>{a.label}</title>
              {lines.map((ln, li) => (
                <tspan key={li} x={p.x} dy={li === 0 ? dy0 : 12}>
                  {ln}
                </tspan>
              ))}
            </text>
          );
        })}
      </svg>
      {showLegend && (
        <Legend
          className="mt-2 justify-center"
          items={series.map((s, i) => ({ label: s.label, color: s.color ?? seriesColor(i), shape: s.dashed ? 'dashed' : 'square' }))}
        />
      )}
    </figure>
  );
}
