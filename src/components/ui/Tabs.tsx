import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { NavLink, useLocation } from 'react-router';
import { cn } from '@/lib/cn';

/*
 * Two tab bars with identical visuals:
 *  - <RouteTabs>  — each tab is a route (NavLink). Used by the project cockpit.
 *  - <Tabs>       — local state (value/onChange), ARIA tablist.
 * Mobile (<768px): horizontally scrollable chips (active chip scrolls into view).
 * ≥768px: underline tabs on a hairline. Use `variant="chips" | "underline"` to force one style.
 */

export type TabsVariant = 'auto' | 'chips' | 'underline';

const listClasses = (variant: TabsVariant) =>
  cn(
    'scrollbar-none relative flex min-w-0 gap-1.5 overflow-x-auto',
    variant === 'auto' && '-mx-4 px-4 md:mx-0 md:gap-5 md:border-b md:border-line md:px-0',
    variant === 'chips' && '',
    variant === 'underline' && 'gap-5 border-b border-line',
  );

const tabClasses = (variant: TabsVariant, active: boolean) =>
  cn(
    'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-medium transition-colors',
    // chip look
    (variant === 'auto' || variant === 'chips') && 'h-10 rounded-full border px-3.5',
    (variant === 'auto' || variant === 'chips') &&
      (active ? 'border-accent bg-accent text-accent-ink' : 'border-line bg-surface text-muted hover:text-ink'),
    // underline look (auto switches at md)
    variant === 'auto' &&
      'md:-mb-px md:h-11 md:rounded-none md:border-0 md:border-b-2 md:bg-transparent md:px-0.5',
    variant === 'auto' && (active ? 'md:border-accent md:text-ink' : 'md:border-transparent md:text-muted'),
    variant === 'underline' && '-mb-px h-11 border-b-2 px-0.5',
    variant === 'underline' && (active ? 'border-accent text-ink' : 'border-transparent text-muted hover:text-ink'),
  );

function Count({ n, active }: { n: number; active: boolean }) {
  return (
    <span
      className={cn(
        'tabular rounded-full px-1.5 text-[0.7rem] leading-4',
        active ? 'bg-accent-ink/20 md:bg-accent-soft md:text-accent' : 'bg-surface-2 text-muted',
      )}
    >
      {n}
    </span>
  );
}

/** Scroll the active tab into view inside its own scroller (never scrolls the page vertically). */
function useScrollActiveIntoView(dep: unknown, selector: string) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const list = ref.current;
    const active = list?.querySelector<HTMLElement>(selector);
    if (!list || !active) return;
    const left = active.offsetLeft - list.clientWidth / 2 + active.clientWidth / 2;
    list.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  }, [dep, selector]);
  return ref;
}

export interface RouteTabItem {
  /** Absolute or relative path. */
  to: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
  /** Match exactly (NavLink `end`). Default true. */
  end?: boolean;
}

/**
 * Route-driven tab bar.
 * @example <RouteTabs ariaLabel="Модули пројекта" items={[{ to: 'pregled', label: 'Преглед' }, { to: 'lokacija', label: 'Локација' }]} />
 */
export function RouteTabs({ items, ariaLabel, variant = 'auto', className }: { items: RouteTabItem[]; ariaLabel: string; variant?: TabsVariant; className?: string }) {
  const { pathname } = useLocation();
  const ref = useScrollActiveIntoView(pathname, 'a[aria-current="page"]');
  return (
    <nav aria-label={ariaLabel} className={cn('min-w-0', className)}>
      <div ref={ref} className={listClasses(variant)}>
        {items.map((it) => (
          <NavLink key={it.to} to={it.to} end={it.end ?? true} className={({ isActive }) => tabClasses(variant, isActive)}>
            {({ isActive }) => (
              <>
                {it.icon && <it.icon className="size-4" aria-hidden />}
                {it.label}
                {it.count !== undefined && <Count n={it.count} active={isActive} />}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export interface TabItem<V extends string = string> {
  id: V;
  label: ReactNode;
  icon?: LucideIcon;
  count?: number;
}

export interface TabsProps<V extends string> {
  items: TabItem<V>[];
  value: V;
  onChange: (value: V) => void;
  ariaLabel: string;
  variant?: TabsVariant;
  /** id prefix for aria-controls; panels should use id `${idPrefix}-panel-${id}`. */
  idPrefix?: string;
  className?: string;
}

/**
 * Local-state tab bar (arrow keys move between tabs).
 * @example <Tabs ariaLabel="Приказ" items={[{id:'lista',label:'Листа'},{id:'mapa',label:'Мапа'}]} value={v} onChange={setV} />
 */
export function Tabs<V extends string>({ items, value, onChange, ariaLabel, variant = 'auto', idPrefix = 'tabs', className }: TabsProps<V>) {
  const ref = useScrollActiveIntoView(value, '[aria-selected="true"]');
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const i = items.findIndex((t) => t.id === value);
    const next = items[(i + (e.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length];
    onChange(next.id);
    ref.current?.querySelector<HTMLElement>(`[data-id="${next.id}"]`)?.focus();
  };
  return (
    <div className={cn('min-w-0', className)}>
      <div ref={ref} role="tablist" aria-label={ariaLabel} className={listClasses(variant)} onKeyDown={onKeyDown}>
        {items.map((it) => {
          const active = it.id === value;
          return (
            <button
              key={it.id}
              type="button"
              role="tab"
              id={`${idPrefix}-tab-${it.id}`}
              aria-selected={active}
              aria-controls={`${idPrefix}-panel-${it.id}`}
              tabIndex={active ? 0 : -1}
              data-id={it.id}
              onClick={() => onChange(it.id)}
              className={tabClasses(variant, active)}
            >
              {it.icon && <it.icon className="size-4" aria-hidden />}
              {it.label}
              {it.count !== undefined && <Count n={it.count} active={active} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
