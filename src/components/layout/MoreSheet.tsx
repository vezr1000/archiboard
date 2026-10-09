import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { Sheet } from '@/components/ui/Sheet';
import { NAV_MORE } from './navigation';
import { ResetDemoButton } from './ResetDemoButton';
import { ThemeToggle } from './ThemeToggle';

/** Mobile „Више“ sheet: secondary pages, theme, demo reset. */
export function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title="Више">
      <nav aria-label="Остале странице">
        <ul className="-mx-1 flex flex-col">
          {NAV_MORE.map((it) => (
            <li key={it.to}>
              <Link to={it.to} onClick={onClose} className="flex h-12 items-center gap-3 rounded-xl px-2 text-ink hover:bg-surface-2">
                <span className="inline-flex size-9 items-center justify-center rounded-xl bg-surface-2 text-accent">
                  <it.icon className="size-[1.1rem]" aria-hidden />
                </span>
                <span className="min-w-0 flex-1 truncate">{it.label}</span>
                <ChevronRight className="size-4 text-muted" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-5 border-t border-line pt-4">
        <div className="mb-2 text-sm font-medium text-ink">Тема</div>
        <ThemeToggle />
      </div>
      <div className="mt-5 border-t border-line pt-4">
        <div className="mb-1 text-sm font-medium text-ink">Демо</div>
        <p className="mb-3 text-xs text-muted">Враћа апликацију у почетно стање пре новог представљања.</p>
        <ResetDemoButton fullWidth onDone={onClose} />
      </div>
    </Sheet>
  );
}
