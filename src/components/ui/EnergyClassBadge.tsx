import type { EnergyClass } from '@/domain/types';
import { energyClassTone } from '@/domain/labels';
import { cn } from '@/lib/cn';
import { TONE_CLASSES } from './tone';

export interface EnergyClassBadgeProps {
  value: EnergyClass;
  size?: 'sm' | 'md' | 'lg';
  /** Pop animation whenever the class changes (respects reduced motion via the global CSS rule). */
  animate?: boolean;
  className?: string;
}

const SIZE = { sm: 'h-6 min-w-6 px-1 text-xs rounded-md', md: 'h-9 min-w-9 px-1.5 text-base rounded-lg', lg: 'h-14 min-w-14 px-2 text-2xl rounded-xl' } as const;

/**
 * Energy-passport class letter (A+ … G) on its tone colour (A+/A good, B/C warn, D–G bad).
 * @example <EnergyClassBadge value="B" size="lg" animate />
 */
export function EnergyClassBadge({ value, size = 'md', animate, className }: EnergyClassBadgeProps) {
  return (
    <span
      key={animate ? value : undefined}
      className={cn(
        'inline-flex shrink-0 items-center justify-center font-display font-semibold leading-none',
        TONE_CLASSES[energyClassTone(value)].solid,
        SIZE[size],
        animate && 'animate-pop',
        className,
      )}
      aria-label={`Енергетски разред ${value}`}
    >
      {value}
    </span>
  );
}
