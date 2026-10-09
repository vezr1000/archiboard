import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router';
import { cn } from '@/lib/cn';

export interface PageHeaderProps {
  /** Small uppercase label above the title (module / context). */
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Buttons on the right (wrap under the title on mobile). */
  actions?: ReactNode;
  /** Extra row under the subtitle (badges, meta). */
  meta?: ReactNode;
  /** Back link shown above the eyebrow. */
  back?: { to: string; label: string };
  className?: string;
}

/**
 * Page title block. Every routed page starts with one.
 * @example <PageHeader eyebrow="Портфолио" title="Добро јутро, Јелена" subtitle="6 активних пројеката" actions={<Button>Нови</Button>} />
 */
export function PageHeader({ eyebrow, title, subtitle, actions, meta, back, className }: PageHeaderProps) {
  return (
    <header className={cn('mb-6 min-w-0 md:mb-8', className)}>
      {back && (
        <Link
          to={back.to}
          className="-ml-1 mb-2 inline-flex min-h-10 items-center gap-1 rounded-lg px-1 text-sm text-muted hover:text-ink"
        >
          <ChevronLeft className="size-4" aria-hidden />
          {back.label}
        </Link>
      )}
      <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          {eyebrow !== undefined && <div className="eyebrow mb-1">{eyebrow}</div>}
          <h1 className="font-display text-[1.75rem] leading-tight text-ink md:text-4xl">{title}</h1>
          {subtitle !== undefined && <p className="mt-1.5 max-w-2xl text-[0.95rem] text-muted">{subtitle}</p>}
          {meta !== undefined && <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div>}
        </div>
        {actions !== undefined && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
