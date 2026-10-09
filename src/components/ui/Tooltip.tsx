import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface TooltipProps {
  /** Tooltip text (native title attribute — works everywhere, no positioning logic). */
  content: string;
  children: ReactNode;
  /** Dotted underline to hint that there is a tooltip. */
  underline?: boolean;
  className?: string;
}

/**
 * Tooltip-lite: wraps content in a span with a native `title`.
 * @example <Tooltip content="Индекс заузетости = површина под објектом / површина парцеле" underline>ИЗ</Tooltip>
 */
export function Tooltip({ content, children, underline, className }: TooltipProps) {
  return (
    <span title={content} className={cn(underline && 'cursor-help underline decoration-line-strong decoration-dotted underline-offset-4', className)}>
      {children}
    </span>
  );
}
