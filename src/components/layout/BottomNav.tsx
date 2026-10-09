import { useState } from 'react';
import { Ellipsis } from 'lucide-react';
import { NavLink, useLocation } from 'react-router';
import { cn } from '@/lib/cn';
import { MoreSheet } from './MoreSheet';
import { NAV_BOTTOM, NAV_MORE } from './navigation';

const itemCls = (active: boolean) =>
  cn(
    'flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-[0.68rem] font-medium transition-colors',
    active ? 'text-accent' : 'text-muted',
  );

/** Mobile/tablet (<1024px) fixed bottom tab bar: Портфолио · Пројекти · Одбор · Смернице · Више. */
export function BottomNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const { pathname } = useLocation();
  const moreActive = NAV_MORE.some((it) => pathname.startsWith(it.to));
  return (
    <>
      <nav
        aria-label="Главна навигација"
        className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur-md lg:hidden"
      >
        <div className="mx-auto flex h-16 max-w-xl items-stretch px-1">
          {NAV_BOTTOM.map((it) => (
            <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => itemCls(isActive)}>
              {({ isActive }) => (
                <>
                  <span className={cn('inline-flex h-7 w-12 items-center justify-center rounded-full transition-colors', isActive && 'bg-accent-soft')}>
                    <it.icon className="size-5" aria-hidden />
                  </span>
                  <span className="max-w-full truncate">{it.label}</span>
                </>
              )}
            </NavLink>
          ))}
          <button type="button" onClick={() => setMoreOpen(true)} className={itemCls(moreActive)} aria-haspopup="dialog">
            <span className={cn('inline-flex h-7 w-12 items-center justify-center rounded-full', moreActive && 'bg-accent-soft')}>
              <Ellipsis className="size-5" aria-hidden />
            </span>
            <span>Више</span>
          </button>
        </div>
      </nav>
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}
