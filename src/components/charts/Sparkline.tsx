import { useId } from 'react';
import type { Tone } from '@/domain/types';
import { toneVar } from '@/components/ui/tone';
import { niceDomain, scaleLinear } from './utils';

export interface SparklineProps {
  values: number[];
  /** Dashed horizontal target line. */
  target?: number;
  tone?: Tone;
  /** Rendered size in px. Default 96 × 28. Use width="100%" to stretch. */
  width?: number | string;
  height?: number;
  /** Soft area under the line. Default true. */
  area?: boolean;
  /** Accessible title. */
  title: string;
}

/**
 * Tiny trend line (KPI tiles, project cards).
 * @example <Sparkline title="Тренд угљеника" values={[305, 330, 358]} target={320} tone="warn" />
 */
export function Sparkline({ values, target, tone = 'accent', width = 96, height = 28, area = true, title }: SparklineProps) {
  const titleId = useId();
  const W = 100;
  const H = 30;
  if (values.length === 0) return null;
  const [d0, d1] = niceDomain(target !== undefined ? [...values, target] : values, 0.15);
  const y = scaleLinear(d0, d1, H - 3, 3);
  const x = (i: number) => (values.length === 1 ? W / 2 : 2 + (i * (W - 4)) / (values.length - 1));
  const pts = values.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const color = toneVar(tone);
  const last = values[values.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width, height }} className="block overflow-visible" role="img" aria-labelledby={titleId}>
      <title id={titleId}>{title}</title>
      {area && values.length > 1 && <polygon points={`${x(0)},${H} ${pts} ${x(values.length - 1)},${H}`} fill={toneVar(tone, true)} opacity="0.7" />}
      {target !== undefined && (
        <line x1="0" x2={W} y1={y(target)} y2={y(target)} stroke="var(--muted)" strokeWidth="1" strokeDasharray="3 2" vectorEffect="non-scaling-stroke" />
      )}
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      {/* zero-length round-capped line = undistorted dot even with preserveAspectRatio="none" */}
      <line x1={x(values.length - 1)} y1={y(last)} x2={x(values.length - 1)} y2={y(last)} stroke={color} strokeWidth="5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
