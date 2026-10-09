import { useEffect, useState } from 'react';

/** Point on a circle. Angle in degrees, 0 = north (up), clockwise. */
export function polar(cx: number, cy: number, r: number, angleDeg: number): { x: number; y: number } {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

/** SVG path for an annular/pie sector between two angles (degrees, 0 = north, clockwise). */
export function sectorPath(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number): string {
  const large = a1 - a0 > 180 ? 1 : 0;
  const p0 = polar(cx, cy, r1, a0);
  const p1 = polar(cx, cy, r1, a1);
  if (r0 <= 0) return `M${cx},${cy} L${p0.x},${p0.y} A${r1},${r1} 0 ${large} 1 ${p1.x},${p1.y} Z`;
  const q1 = polar(cx, cy, r0, a1);
  const q0 = polar(cx, cy, r0, a0);
  return `M${p0.x},${p0.y} A${r1},${r1} 0 ${large} 1 ${p1.x},${p1.y} L${q1.x},${q1.y} A${r0},${r0} 0 ${large} 0 ${q0.x},${q0.y} Z`;
}

/** A rounded-out [min, max] domain that includes all values, with ~`pad` share of headroom. */
export function niceDomain(values: number[], pad = 0.1, includeZero = false): [number, number] {
  const finite = values.filter(Number.isFinite);
  if (finite.length === 0) return [0, 1];
  let min = Math.min(...finite);
  let max = Math.max(...finite);
  if (includeZero) min = Math.min(0, min);
  if (min === max) {
    min -= Math.abs(min) * 0.1 || 1;
    max += Math.abs(max) * 0.1 || 1;
  }
  const span = max - min;
  const lo = includeZero && min >= 0 ? 0 : min - span * pad;
  const hi = max + span * pad;
  const step = niceStep((hi - lo) / 4);
  return [Math.floor(lo / step) * step, Math.ceil(hi / step) * step];
}

function niceStep(raw: number): number {
  const pow = 10 ** Math.floor(Math.log10(raw || 1));
  const n = raw / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}

/** Linear scale factory. */
export const scaleLinear = (d0: number, d1: number, r0: number, r1: number) => (v: number) =>
  d1 === d0 ? r0 : r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);

/**
 * Returns false on the first render and true right after mount — use to animate from 0 with CSS transitions.
 * Reduced-motion users get transitions shortened by the global CSS rule.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return mounted;
}

/** Truncate a label to `max` characters with an ellipsis (SVG text cannot use CSS truncation). */
export const truncate = (s: string, max: number): string => (s.length > max ? `${s.slice(0, max - 1)}…` : s);
