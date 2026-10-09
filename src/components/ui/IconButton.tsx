import type { ButtonHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: LucideIcon;
  /** Required accessible label (also used as tooltip). */
  label: string;
  variant?: 'ghost' | 'secondary' | 'primary';
  size?: 'sm' | 'md';
}

/**
 * Square icon-only button (40px default tap target).
 * @example <IconButton icon={X} label="Затвори" onClick={close} />
 */
export function IconButton({ icon: Icon, label, variant = 'ghost', size = 'md', className, type, ...rest }: IconButtonProps) {
  return (
    <button
      type={type ?? 'button'}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-xl transition-colors disabled:pointer-events-none disabled:opacity-45',
        size === 'sm' ? 'size-9' : 'size-10',
        variant === 'ghost' && 'text-muted hover:bg-surface-2 hover:text-ink',
        variant === 'secondary' && 'border border-line-strong bg-surface text-ink hover:bg-surface-2',
        variant === 'primary' && 'bg-accent text-accent-ink hover:opacity-90',
        className,
      )}
      {...rest}
    >
      <Icon className={size === 'sm' ? 'size-4' : 'size-[1.15rem]'} aria-hidden />
    </button>
  );
}
