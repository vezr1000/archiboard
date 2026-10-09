import { cn } from '@/lib/cn';

export interface ThinkingDotsProps {
  /** Text after the dots, e.g. „Анализирам локацијске услове“. */
  label?: string;
  className?: string;
}

/**
 * Animated „thinking“ indicator (three pulsing dots).
 * @example <ThinkingDots label="Читам документ…" />
 */
export function ThinkingDots({ label, className }: ThinkingDotsProps) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-sm text-muted', className)} role="status" aria-live="polite">
      <span className="inline-flex items-center gap-1" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-1.5 animate-pulse-dot rounded-full bg-info" style={{ animationDelay: `${i * 160}ms` }} />
        ))}
      </span>
      {label && <span>{label}</span>}
      {!label && <span className="sr-only">Обрађујем…</span>}
    </span>
  );
}
