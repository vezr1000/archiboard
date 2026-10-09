import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  /** Compact version for inside cards. */
  compact?: boolean;
  className?: string;
}

/**
 * Placeholder for empty lists / no results.
 * @example <EmptyState icon={Search} title="Нема резултата" description="Промените филтере." />
 */
export function EmptyState({ icon: Icon = Inbox, title, description, action, compact, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center text-center', compact ? 'gap-2 py-6' : 'gap-3 py-12', className)}>
      <div className={cn('flex items-center justify-center rounded-2xl bg-surface-2 text-muted', compact ? 'size-10' : 'size-12')}>
        <Icon className={compact ? 'size-5' : 'size-6'} aria-hidden />
      </div>
      <div className="max-w-sm">
        <p className="font-display text-lg text-ink">{title}</p>
        {description !== undefined && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action !== undefined && <div className="mt-1">{action}</div>}
    </div>
  );
}
