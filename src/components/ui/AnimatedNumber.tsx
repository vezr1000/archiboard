import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/components/ai/useReducedMotion';
import { formatNumber } from '@/lib/format';

export interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  /** Custom formatter (default formatNumber with `decimals`). */
  format?: (v: number) => string;
  /** Tween duration in ms. Default 450. */
  duration?: number;
  className?: string;
}

/**
 * Number that counts smoothly to its new value (ease-out). Instant with reduced motion.
 * @example <AnimatedNumber value={result.embodiedCarbon} decimals={0} />
 */
export function AnimatedNumber({ value, decimals = 0, format, duration = 450, className }: AnimatedNumberProps) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(value);
  const fromRef = useRef(value);
  const shownRef = useRef(value);

  useEffect(() => {
    if (reduced) {
      shownRef.current = value;
      setShown(value);
      return;
    }
    fromRef.current = shownRef.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      const v = fromRef.current + (value - fromRef.current) * eased;
      shownRef.current = v;
      setShown(v);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, reduced]);

  const text = format ? format(shown) : formatNumber(shown, decimals);
  return (
    <span className={className} aria-label={format ? format(value) : formatNumber(value, decimals)}>
      <span aria-hidden>{text}</span>
    </span>
  );
}
