import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface SectionHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Right-aligned content (link, button, filter). */
  action?: ReactNode;
  /** Heading level. Default h2. */
  as?: 'h2' | 'h3';
  className?: string;
}

/**
 * Heading for a page section (between cards).
 * @example <SectionHeader title="Захтева пажњу" subtitle="3 ставке" action={<Button variant="ghost" size="sm">Све</Button>} />
 */
export function SectionHeader({ title, subtitle, action, as: H = 'h2', className }: SectionHeaderProps) {
  return (
    <div className={cn('mb-3 flex min-w-0 items-end justify-between gap-3', className)}>
      <div className="min-w-0">
        <H className={cn('font-display text-ink', H === 'h2' ? 'text-xl' : 'text-lg')}>{title}</H>
        {subtitle !== undefined && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {action !== undefined && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}
