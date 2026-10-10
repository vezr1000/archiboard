import { Route as RouteIcon } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router';
import { useDemoGuideStore } from '@/store/useDemoGuideStore';
import { FIRM } from '@/data/firm';
import { cn } from '@/lib/cn';
import { Logo } from './Logo';
import { NAV_DEMO, NAV_MAIN, type NavItem } from './navigation';
import { ResetDemoButton } from './ResetDemoButton';
import { ThemeToggle } from './ThemeToggle';

function SideLink({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          'flex h-10 items-center gap-3 rounded-xl px-3 text-sm transition-colors',
          isActive ? 'bg-accent-soft font-medium text-accent' : 'text-muted hover:bg-surface-2 hover:text-ink',
        )
      }
    >
      <item.icon className="size-[1.1rem] shrink-0" aria-hidden />
      <span className="truncate">{item.label}</span>
    </NavLink>
  );
}

/** Desktop (≥1024px) left sidebar. */
export function Sidebar() {
  const navigate = useNavigate();
  const reopenGuide = useDemoGuideStore((s) => s.reopen);
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[15.5rem] flex-col border-r border-line bg-paper px-3 py-5 lg:flex">
      <div className="px-2 pb-6">
        <Logo subtitle={FIRM.name} />
      </div>
      <nav aria-label="Главна навигација" className="flex flex-col gap-0.5">
        {NAV_MAIN.map((it) => (
          <SideLink key={it.to} item={it} />
        ))}
      </nav>
      <div className="mt-6 px-3 pb-1 text-[0.68rem] font-semibold tracking-wider text-muted uppercase">Демо</div>
      <nav aria-label="Демо" className="flex flex-col gap-0.5">
        {NAV_DEMO.map((it) => (
          <SideLink key={it.to} item={it} />
        ))}
        <button
          type="button"
          onClick={() => {
            reopenGuide();
            navigate('/');
          }}
          className="flex h-10 items-center gap-3 rounded-xl px-3 text-left text-sm text-muted transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <RouteIcon className="size-[1.1rem] shrink-0" aria-hidden />
          <span className="truncate">Водич кроз демо</span>
        </button>
      </nav>
      <div className="mt-auto flex flex-col gap-3 border-t border-line px-2 pt-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted">Тема</span>
          <ThemeToggle compact />
        </div>
        <ResetDemoButton fullWidth />
      </div>
    </aside>
  );
}
