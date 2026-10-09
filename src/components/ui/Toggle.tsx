import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
}

/**
 * On/off switch with label (role="switch").
 * @example <Toggle label="Само демонтажни елементи" checked={only} onChange={setOnly} />
 */
export function Toggle({ checked, onChange, label, description, disabled, className }: ToggleProps) {
  const id = useId();
  return (
    <div className={cn('flex min-w-0 items-center justify-between gap-3', disabled && 'opacity-50', className)}>
      <label htmlFor={id} className="min-w-0 cursor-pointer">
        <span className="block text-sm text-ink">{label}</span>
        {description !== undefined && <span className="block text-xs text-muted">{description}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className="inline-flex h-10 shrink-0 items-center"
      >
        <span className={cn('relative inline-flex h-6 w-10 rounded-full transition-colors', checked ? 'bg-accent' : 'bg-line-strong')}>
          <span
            className={cn(
              'absolute top-0.5 left-0.5 size-5 rounded-full bg-surface shadow-soft transition-transform',
              checked && 'translate-x-4',
            )}
          />
        </span>
      </button>
    </div>
  );
}
