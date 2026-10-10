import { useId } from 'react';
import type { CompassDir, WindRoseEntry } from '@/domain/types';
import { COMPASS_LABELS } from '@/domain/labels';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';
import { polar, sectorPath } from './utils';

const DIRS_16: CompassDir[] = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

export interface WindRoseProps {
  /** 8 or 16 entries (any order). Frequency in %. */
  data: WindRoseEntry[];
  /** Directions to emphasise in clay (e.g. ['ESE','SE'] for кошава). */
  highlight?: CompassDir[];
  /** Max rendered width in px. Default 260. */
  size?: number;
  title: string;
  className?: string;
}

/**
 * Wind rose: petal length = frequency, highlighted directions in clay (кошава).
 * @example <WindRose title="Ружа ветрова — Београд" data={site.climate.windRose} highlight={['ESE', 'SE']} />
 */
export function WindRose({ data, highlight = [], size = 260, title, className }: WindRoseProps) {
  const titleId = useId();
  const box = 240;
  const cx = box / 2;
  const cy = box / 2;
  const R = 92;
  const n = data.length >= 16 ? 16 : 8;
  const step = 360 / n;
  const maxFreq = Math.max(1, ...data.map((d) => d.freq));
  const ringMax = Math.ceil(maxFreq / 5) * 5;
  const rings = [0.25, 0.5, 0.75, 1];
  const angleOf = (dir: CompassDir) => DIRS_16.indexOf(dir) * 22.5;

  return (
    <figure className={cn('min-w-0', className)}>
      <svg viewBox={`0 0 ${box} ${box}`} className="mx-auto block w-full" style={{ maxWidth: size }} role="img" aria-labelledby={titleId}>
        <title id={titleId}>{`${title}: ${data.map((d) => `${COMPASS_LABELS[d.dir]} ${formatNumber(d.freq, 0)} %`).join(', ')}`}</title>
        {rings.map((k) => (
          <circle key={k} cx={cx} cy={cy} r={R * k} fill="none" stroke="var(--line)" strokeWidth="1" />
        ))}
        {[0, 90].map((a) => {
          const p0 = polar(cx, cy, R, a);
          const p1 = polar(cx, cy, R, a + 180);
          return <line key={a} x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke="var(--line)" strokeWidth="1" />;
        })}
        {data.map((d) => {
          const a = angleOf(d.dir);
          const r = (R * d.freq) / ringMax;
          const hl = highlight.includes(d.dir);
          return (
            <path
              key={d.dir}
              d={sectorPath(cx, cy, 0, Math.max(2, r), a - step / 2 + 1.5, a + step / 2 - 1.5)}
              fill={hl ? 'var(--clay)' : 'var(--accent)'}
              fillOpacity={hl ? 0.85 : 0.55}
              stroke={hl ? 'var(--clay)' : 'var(--accent)'}
              strokeWidth="1"
            >
              <title>{`${COMPASS_LABELS[d.dir]}: ${formatNumber(d.freq, 1)} %, макс. ${formatNumber(d.maxSpeed, 0)} m/s`}</title>
            </path>
          );
        })}
        {(['N', 'E', 'S', 'W'] as CompassDir[]).map((d) => {
          const p = polar(cx, cy, R + 13, angleOf(d));
          return (
            <text key={d} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="600" fill="var(--ink)">
              {COMPASS_LABELS[d]}
            </text>
          );
        })}
        {[0.5, 1].map((k) => {
          const p = polar(cx, cy, R * k, 202.5); // ring labels in the (usually calm) SSW sector
          return (
            <text key={k} x={p.x - 2} y={p.y + 2} fontSize="8.5" fill="var(--muted)" textAnchor="end" dominantBaseline="hanging">
              {formatNumber(ringMax * k, 0)} %
            </text>
          );
        })}
      </svg>
    </figure>
  );
}
