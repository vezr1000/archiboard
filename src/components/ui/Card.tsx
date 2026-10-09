import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Optional header title (serif). */
  title?: ReactNode;
  /** Small uppercase label above the title. */
  eyebrow?: ReactNode;
  /** Muted line under the title. */
  subtitle?: ReactNode;
  /** Right-aligned header content (button, link, badge). */
  action?: ReactNode;
  /** Inner padding. 'none' is useful for edge-to-edge lists. Default 'md'. */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Hover affordance (use when the whole card is clickable). */
  interactive?: boolean;
  /** Rendered element. Default `section`. */
  as?: ElementType;
  children?: ReactNode;
}

const PAD = { none: '', sm: 'p-3', md: 'p-4 md:p-5', lg: 'p-5 md:p-6' } as const;

/**
 * Surface container with optional header.
 * @example <Card title="Уграђени угљеник" subtitle="A1–A3" action={<Button size="sm">Детаљи</Button>}>…</Card>
 */
export function Card({
  title,
  eyebrow,
  subtitle,
  action,
  padding = 'md',
  interactive,
  as: Tag = 'section',
  className,
  children,
  ...rest
}: CardProps) {
  const hasHeader = title !== undefined || eyebrow !== undefined || action !== undefined;
  return (
    <Tag
      className={cn(
        'min-w-0 rounded-2xl border border-line bg-surface',
        interactive && 'transition-colors hover:border-line-strong hover:shadow-soft',
        PAD[padding],
        className,
      )}
      {...rest}
    >
      {hasHeader && (
        <header className={cn('flex min-w-0 items-start justify-between gap-3', children !== undefined && 'mb-3')}>
          <div className="min-w-0">
            {eyebrow !== undefined && <div className="eyebrow mb-0.5">{eyebrow}</div>}
            {title !== undefined && <h3 className="font-display text-lg leading-snug text-ink">{title}</h3>}
            {subtitle !== undefined && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
          </div>
          {action !== undefined && <div className="flex shrink-0 items-center gap-2">{action}</div>}
        </header>
      )}
      {children}
    </Tag>
  );
}
