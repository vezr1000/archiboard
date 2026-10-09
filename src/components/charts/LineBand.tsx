import { useId } from 'react';
import type { KpiDirection } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';
import { Legend } from './Legend';
import { niceDomain, scaleLinear } from './utils';

export interface LinePoint {
  /** X label, e.g. phase short label „ИДР“. */
  label: string;
  value: number;
  /** Mark as projected (dashed segment into this point). */
  projected?: boolean;
}

export interface LineBandProps {
  points: LinePoint[];
  /** Dashed target line. */
  target?: number;
  /** Acceptable range shaded in green (e.g. between firm target and best practice). */
  band?: { from: number; to: number; label?: string };
  /** Second dotted comparison line (e.g. the benchmark of the selected ambition level). */
  reference?: { value: number; label: string };
  /** Only used to label the band legend („мање је боље“). */
  direction?: KpiDirection;
  unit?: string;
  format?: (v: number) => string;
  /** Rendered height in px. Default 180. */
  height?: number;
  title: string;
  showLegend?: boolean;
  className?: string;
}

/**
 * KPI value across phases vs target line and acceptable band.
 * @example
 * <LineBand title="Уграђени угљеник по фазама" unit="kgCO₂e/m²" target={320} band={{ from: 250, to: 320, label: 'Циљни опсег' }}
 *   points={[{ label: 'ИДР', value: 305 }, { label: 'ПГД', value: 358 }, { label: 'ПЗИ', value: 340, projected: true }]} />
 */
export function LineBand({ points, target, band, reference, unit, format = (v) => formatNumber(v), height = 180, title, showLegend = true, className }: LineBandProps) {
  const titleId = useId();
  const W = 340;
  const H = 170;
  const left = 38;
  const right = 12;
  const top = 12;
  const bottom = 24;
  const vals = [...points.map((p) => p.value), ...(target !== undefined ? [target] : []), ...(band ? [band.from, band.to] : []), ...(reference ? [reference.value] : [])];
  const [d0, d1] = niceDomain(vals, 0.12);
  const y = scaleLinear(d0, d1, H - bottom, top);
  const x = (i: number) => (points.length <= 1 ? left + (W - left - right) / 2 : left + (i * (W - left - right)) / (points.length - 1));
  const ticks = [0, 1, 2, 3, 4].map((k) => d0 + ((d1 - d0) * k) / 4);

  return (
    <figure className={cn('min-w-0', className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" style={{ maxHeight: height }} role="img" aria-labelledby={titleId}>
        <title id={titleId}>{`${title}: ${points.map((p) => `${p.label} ${format(p.value)}`).join(', ')}${unit ? ` ${unit}` : ''}`}</title>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={left} x2={W - right} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth="1" />
            <text x={left - 6} y={y(t)} textAnchor="end" dominantBaseline="central" fontSize="9.5" fill="var(--muted)">
              {format(t)}
            </text>
          </g>
        ))}
        {band && (
          <rect
            x={left}
            width={W - left - right}
            y={y(Math.max(band.from, band.to))}
            height={Math.abs(y(band.from) - y(band.to))}
            fill="var(--good-soft)"
            opacity="0.9"
          />
        )}
        {target !== undefined && (
          <line x1={left} x2={W - right} y1={y(target)} y2={y(target)} stroke="var(--ink)" strokeWidth="1.5" strokeDasharray="5 4" />
        )}
        {reference && (
          <line x1={left} x2={W - right} y1={y(reference.value)} y2={y(reference.value)} stroke="var(--clay)" strokeWidth="1.5" strokeDasharray="1.5 3.5" strokeLinecap="round" />
        )}
        {points.slice(1).map((p, i) => (
          <line
            key={`seg-${i}`}
            x1={x(i)}
            y1={y(points[i].value)}
            x2={x(i + 1)}
            y2={y(p.value)}
            stroke="var(--accent)"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeDasharray={p.projected ? '4 4' : undefined}
          />
        ))}
        {points.map((p, i) => (
          <g key={`${p.label}-${i}`}>
            <circle cx={x(i)} cy={y(p.value)} r="4" fill={p.projected ? 'var(--surface)' : 'var(--accent)'} stroke="var(--accent)" strokeWidth="2" />
            <text x={x(i)} y={H - 6} textAnchor="middle" fontSize="10.5" fill="var(--muted)">
              {p.label}
            </text>
            {i === points.length - 1 && (
              <text x={x(i)} y={y(p.value) - 9} textAnchor={points.length > 1 ? 'end' : 'middle'} fontSize="10.5" fontWeight="600" fill="var(--ink)">
                {format(p.value)}
              </text>
            )}
          </g>
        ))}
      </svg>
      {showLegend && (target !== undefined || band || reference) && (
        <Legend
          className="mt-1.5"
          items={[
            { label: 'Вредност', color: 'var(--accent)', shape: 'line' },
            ...(target !== undefined ? [{ label: 'Циљ', color: 'var(--ink)', shape: 'dashed' as const }] : []),
            ...(band ? [{ label: band.label ?? 'Прихватљив опсег', color: 'var(--good-soft)' }] : []),
            ...(reference ? [{ label: reference.label, color: 'var(--clay)', shape: 'dashed' as const }] : []),
          ]}
        />
      )}
    </figure>
  );
}
