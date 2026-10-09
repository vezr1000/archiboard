import { APP } from '@/data/firm';
import { cn } from '@/lib/cn';

/** The АрхиБорд mark: building outline with a leaf, on moss. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-8 shrink-0', className)} aria-hidden>
      <rect width="32" height="32" rx="8" fill="var(--accent)" />
      <path d="M8 25V13l8-5 8 5v12" fill="none" stroke="var(--accent-ink)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 25c0-5 2-8 6-9-1 4-3 7-6 9Z" fill="var(--accent-ink)" opacity="0.75" />
      <path d="M12 25v-6h4" fill="none" stroke="var(--accent-ink)" strokeWidth="2" />
    </svg>
  );
}

/** Mark + serif wordmark „АрхиБорд“. */
export function Logo({ subtitle, className }: { subtitle?: string; className?: string }) {
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-2.5', className)}>
      <LogoMark />
      <span className="min-w-0 leading-tight">
        <span className="block font-display text-[1.2rem] font-semibold tracking-tight text-ink">{APP.name}</span>
        {subtitle && <span className="block truncate text-[0.7rem] text-muted">{subtitle}</span>}
      </span>
    </span>
  );
}
