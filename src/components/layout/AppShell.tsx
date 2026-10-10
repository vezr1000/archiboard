import { Outlet } from 'react-router';
import { BottomNav } from './BottomNav';
import { RouteSuspense } from './PageFallback';
import { ScrollToTop } from './ScrollToTop';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

/**
 * App frame: sidebar on ≥1024px; top bar + bottom tab bar below. Pages render inside a centred column
 * (max 1200px, 16px gutters on mobile). Pages should NOT add their own outer padding.
 */
export function AppShell() {
  return (
    <div className="min-h-dvh overflow-x-clip bg-paper">
      <ScrollToTop />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        Пређи на садржај
      </a>
      <Sidebar />
      <TopBar />
      <div className="lg:pl-[15.5rem]">
        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1200px] px-4 pt-5 pb-[calc(6rem+env(safe-area-inset-bottom))] outline-none md:px-6 md:pt-8 lg:px-10 lg:pt-10 lg:pb-16">
          <RouteSuspense>
            <Outlet />
          </RouteSuspense>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
