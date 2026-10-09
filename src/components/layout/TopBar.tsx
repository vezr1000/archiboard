import { Link } from 'react-router';
import { FIRM } from '@/data/firm';
import { Logo } from './Logo';

/** Mobile/tablet (<1024px) sticky top bar. */
export function TopBar() {
  return (
    <header className="pt-safe sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-3 px-4">
        <Link to="/" aria-label="АрхиБорд — почетна" className="min-w-0">
          <Logo />
        </Link>
        <span className="truncate text-xs text-muted">{FIRM.name}</span>
      </div>
    </header>
  );
}
