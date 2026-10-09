import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react';
import type { Tone } from '@/domain/types';
import { cn } from '@/lib/cn';
import { TONE_CLASSES } from './tone';

export interface CalloutProps {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  icon?: LucideIcon;
  /** Right-side action (button). */
  action?: ReactNode;
  className?: string;
}

const DEFAULT_ICON: Partial<Record<Tone, LucideIcon>> = { good: CircleCheck, warn: TriangleAlert, bad: CircleAlert };

/**
 * Tinted message box for alerts / explanations.
 * @example <Callout tone="warn" title="Уграђени угљеник 12% изнад циља">Након промене фасаде…</Callout>
 */
export function Callout({ tone = 'info', title, children, icon, action, className }: CalloutProps) {
  const Icon = icon ?? DEFAULT_ICON[tone] ?? Info;
  const t = TONE_CLASSES[tone];
  return (
    <div className={cn('flex min-w-0 gap-3 rounded-2xl p-3.5', t.bgSoft, className)}>
      <Icon className={cn('mt-0.5 size-5 shrink-0', t.text)} aria-hidden />
      <div className="min-w-0 flex-1 text-sm text-ink">
        {title !== undefined && <p className="font-semibold">{title}</p>}
        {children !== undefined && <div className={cn(title !== undefined && 'mt-0.5', 'text-ink/85')}>{children}</div>}
      </div>
      {action !== undefined && <div className="shrink-0 self-center">{action}</div>}
    </div>
  );
}
