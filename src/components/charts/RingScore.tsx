import { useId, type ReactNode } from 'react';
import type { Tone } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';
import { toneVar } from '@/components/ui/tone';
import { polar, useMounted } from './utils';

export interface RingThreshold {
  value: number;
  label: string;
}

export interface RingScoreProps {
  value: number;
  /** Scale max. Default 100. */
  max?: number;
  /** Tick marks on the ring (e.g. Silver 50 / Gold 65 / Platinum 80). */
  thresholds?: RingThreshold[];
  /** Show threshold labels as a small legend under the ring. Default true. */
  showThresholdLabels?: boolean;
  /** Optional target marker (dot on the ring). */
  target?: number;
  tone?: Tone;
  /** Rendered width in px (height ≈ 0.9 × size). Default 160. */
  size?: number;
  /** Center text. Default: formatted value. */
  label?: ReactNode;
  /** Small text under the center value (unit, award). */
  sublabel?: ReactNode;
  /** Accessible title. */
  title: string;
  className?: string;
}

const START = -135; // degrees (0 = north), 270° sweep
const SWEEP = 270;

/**
 * 270° gauge ring that animates to its value, with threshold ticks.
 * @example
 * <RingScore title="DGNB резултат" value={66} max={100} sublabel="Gold (циљ 70)"
 *   thresholds={[{ value: 50, label: 'Silver' }, { value: 65, label: 'Gold' }, { value: 80, label: 'Platinum' }]} />
 */
export function RingScore({
  value,
  max = 100,
  thresholds = [],
  showThresholdLabels = true,
  target,
  tone = 'accent',
  size = 160,
  label,
  sublabel,
  title,
  className,
}: RingScoreProps) {
  const mounted = useMounted();
  const titleId = useId();
  const pad = 6;
  const r = 60;
  const sw = 11;
  const c = 2 * Math.PI * r;
  const arc = (c * SWEEP) / 360;
  const frac = Math.max(0, Math.min(1, value / max));
  const box = (r + sw / 2 + pad) * 2;
  const cx = box / 2;
  const cy = box / 2;
  const angleOf = (v: number) => START + (SWEEP * Math.max(0, Math.min(max, v))) / max;
  // Crop the empty bottom of the 270° ring.
  const vbHeight = cy + Math.cos((45 * Math.PI) / 180) * (r + sw / 2) + pad * 0.6;

  return (
    <div className={cn('inline-block max-w-full', className)} style={{ width: size }}>
      <div className="relative">
      <svg viewBox={`0 0 ${box} ${vbHeight}`} className="block w-full" role="img" aria-labelledby={titleId}>
        <title id={titleId}>{`${title}: ${formatNumber(value)} / ${formatNumber(max)}`}</title>
        <g transform={`rotate(${START - 90 + 360} ${cx} ${cy})`}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={sw} strokeLinecap="round" strokeDasharray={`${arc} ${c}`} />
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={toneVar(tone)}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeDasharray={`${arc} ${c}`}
            strokeDashoffset={mounted ? arc * (1 - frac) : arc}
            style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(.2,.8,.2,1)' }}
          />
        </g>
        {thresholds.map((t) => {
          const a = angleOf(t.value);
          const p0 = polar(cx, cy, r - sw / 2 - 2, a);
          const p1 = polar(cx, cy, r + sw / 2 + 2, a);
          return (
            <line key={t.label} x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke="var(--ink)" strokeWidth="1.5" opacity="0.55">
              <title>{`${t.label}: ${formatNumber(t.value)}`}</title>
            </line>
          );
        })}
        {target !== undefined &&
          (() => {
            const p = polar(cx, cy, r, angleOf(target));
            return <circle cx={p.x} cy={p.y} r="4" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />;
          })()}
      </svg>
      <div className="pointer-events-none absolute inset-x-0 flex flex-col items-center text-center" style={{ top: `${(cy / vbHeight) * 100}%`, transform: 'translateY(-50%)' }}>
        <span className="tabular font-display leading-none font-semibold text-ink" style={{ fontSize: size * 0.17 }}>
          {label ?? formatNumber(value)}
        </span>
        {sublabel !== undefined && <span className="mt-1 max-w-[62%] text-xs leading-tight text-muted">{sublabel}</span>}
      </div>
      </div>
      {showThresholdLabels && thresholds.length > 0 && (
        <div className="mt-1 flex flex-wrap justify-center gap-x-2 text-[0.68rem] text-muted">
          {thresholds.map((t) => (
            <span key={t.label} className={cn('tabular whitespace-nowrap', value >= t.value && 'font-semibold text-ink')}>
              {t.label} {formatNumber(t.value)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
