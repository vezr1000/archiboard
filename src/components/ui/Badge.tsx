import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { Tone } from '@/domain/types';
import { cn } from '@/lib/cn';
import { TONE_CLASSES } from './tone';

export interface BadgeProps {
  tone?: Tone;
  /** soft (default) = tinted fill; outline = hairline border; solid = filled. */
  variant?: 'soft' | 'outline' | 'solid';
  size?: 'sm' | 'md';
  icon?: LucideIcon;
  /** Leading status dot instead of an icon. */
  dot?: boolean;
  title?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Small rounded label for status/category. `Pill` is an alias.
 * @example <Badge tone="good" dot>Усклађено</Badge>  <Badge tone="info" icon={FileText} variant="outline">v2.1</Badge>
 */
export function Badge({ tone = 'neutral', variant = 'soft', size = 'md', icon: Icon, dot, title, className, children }: BadgeProps) {
  const t = TONE_CLASSES[tone];
  return (
    <span
      title={title}
      className={cn(
        'inline-flex max-w-full shrink-0 items-center gap-1 whitespace-nowrap rounded-full font-medium leading-none',
        size === 'sm' ? 'h-5 px-2 text-[0.7rem]' : 'h-6 px-2.5 text-xs',
        variant === 'soft' && t.soft,
        variant === 'solid' && t.solid,
        variant === 'outline' && cn('border bg-transparent', t.border, tone === 'neutral' ? 'text-ink' : t.text),
        className,
      )}
    >
      {dot && <span className={cn('size-1.5 shrink-0 rounded-full', variant === 'solid' ? 'bg-current' : t.bg)} aria-hidden />}
      {Icon && <Icon className={size === 'sm' ? 'size-3' : 'size-3.5'} aria-hidden />}
      <span className="truncate">{children}</span>
    </span>
  );
}

/** Alias of Badge. */
export const Pill = Badge;
