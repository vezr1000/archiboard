import { cn } from '@/lib/cn';

export interface DotScaleProps {
  value: number;
  /** Number of dots. Default 5. */
  max?: number;
  /** Accessible text, e.g. „Утицај“. Rendered as „Утицај 4 од 5“ for screen readers. */
  label: string;
  /** Dot colour for filled dots (token class). Default accent. */
  filledClassName?: string;
  className?: string;
}

/**
 * Tiny filled/empty dot scale (influence 1–5, competence level 0–3 …).
 * @example <DotScale label="Утицај" value={4} />  <DotScale label="Ниво" value={2} max={3} />
 */
export function DotScale({ value, max = 5, label, filledClassName = 'bg-accent', className }: DotScaleProps) {
  return (
    <span role="img" aria-label={`${label} ${value} од ${max}`} className={cn('inline-flex items-center gap-[3px]', className)}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={cn('size-1.5 rounded-full', i < value ? filledClassName : 'bg-line-strong/70')} aria-hidden />
      ))}
    </span>
  );
}
