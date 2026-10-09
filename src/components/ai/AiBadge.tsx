import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface AiBadgeProps {
  /** Default „АИ асистент · демо“. */
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Mandatory label for every scripted AI feature.
 * @example <AiBadge />
 */
export function AiBadge({ label = 'АИ асистент · демо', size = 'md', className }: AiBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-info/30 bg-info-soft font-medium text-info',
        size === 'sm' ? 'h-5 px-2 text-[0.68rem]' : 'h-6 px-2.5 text-xs',
        className,
      )}
      title="Сценарио за демонстрацију — нема стварне анализе"
    >
      <Sparkles className={size === 'sm' ? 'size-3' : 'size-3.5'} aria-hidden />
      {label}
    </span>
  );
}
