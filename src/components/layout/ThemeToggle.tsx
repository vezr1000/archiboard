import { Monitor, Moon, Sun } from 'lucide-react';
import { Segmented } from '@/components/ui/Segmented';
import { cn } from '@/lib/cn';
import { THEME_LABELS, useThemeStore, type ThemePreference } from '@/store/useThemeStore';

const OPTIONS = [
  { value: 'system' as const, label: 'Систем', icon: Monitor },
  { value: 'light' as const, label: 'Светла', icon: Sun },
  { value: 'dark' as const, label: 'Тамна', icon: Moon },
];

/**
 * Theme switch. `compact` = three icon buttons (sidebar); default = labelled segmented control (sheet).
 * @example <ThemeToggle compact />
 */
export function ThemeToggle({ compact, className }: { compact?: boolean; className?: string }) {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  if (!compact) {
    return <Segmented<ThemePreference> ariaLabel="Тема" options={OPTIONS} value={theme} onChange={setTheme} fullWidth className={className} />;
  }
  return (
    <div role="radiogroup" aria-label="Тема" className={cn('inline-flex rounded-xl border border-line bg-surface-2 p-0.5', className)}>
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={theme === o.value}
          aria-label={THEME_LABELS[o.value]}
          title={THEME_LABELS[o.value]}
          onClick={() => setTheme(o.value)}
          className={cn(
            'inline-flex size-8 items-center justify-center rounded-[10px] transition-colors',
            theme === o.value ? 'bg-surface text-ink shadow-soft' : 'text-muted hover:text-ink',
          )}
        >
          <o.icon className="size-4" aria-hidden />
        </button>
      ))}
    </div>
  );
}
