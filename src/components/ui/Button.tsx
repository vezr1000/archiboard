import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Leading icon. */
  icon?: LucideIcon;
  /** Trailing icon. */
  iconRight?: LucideIcon;
  /** Render as a router link instead of a button. */
  to?: string;
  fullWidth?: boolean;
  children?: ReactNode;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-ink hover:opacity-90 active:opacity-80',
  secondary: 'border border-line-strong bg-surface text-ink hover:bg-surface-2',
  ghost: 'text-ink hover:bg-surface-2',
  danger: 'border border-bad/40 bg-bad-soft text-bad hover:border-bad',
};

// Heights keep tap targets ≥ 40px except 'sm' (36px) which is meant for dense desktop toolbars / inside cards.
const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 gap-1.5 px-3 text-sm',
  md: 'h-10 gap-2 px-4 text-sm',
  lg: 'h-12 gap-2 px-5 text-base',
};

export const buttonClasses = (variant: ButtonVariant = 'primary', size: ButtonSize = 'md', fullWidth?: boolean) =>
  cn(
    'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-xl font-medium transition-[background-color,opacity,border-color]',
    'disabled:pointer-events-none disabled:opacity-45',
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full',
  );

/**
 * Button (or router link with `to`).
 * @example <Button icon={Plus} onClick={add}>Сачувај као варијанту</Button>
 * @example <Button variant="secondary" to="/odbor">Сви састанци</Button>
 */
export function Button({ variant = 'primary', size = 'md', icon: Icon, iconRight: IconRight, to, fullWidth, className, children, type, ...rest }: ButtonProps) {
  const iconSize = size === 'lg' ? 'size-5' : 'size-4';
  const content = (
    <>
      {Icon && <Icon className={iconSize} aria-hidden />}
      {children}
      {IconRight && <IconRight className={iconSize} aria-hidden />}
    </>
  );
  const classes = cn(buttonClasses(variant, size, fullWidth), className);
  if (to !== undefined) {
    return (
      <Link to={to} className={classes} aria-label={rest['aria-label']} title={rest.title}>
        {content}
      </Link>
    );
  }
  return (
    <button type={type ?? 'button'} className={classes} {...rest}>
      {content}
    </button>
  );
}
