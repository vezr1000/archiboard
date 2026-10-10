import { X } from 'lucide-react';
import { Link } from 'react-router';
import { paths } from '@/components/layout/navigation';
import { cn } from '@/lib/cn';
import { useDemoGuideStore } from '@/store/useDemoGuideStore';

interface GuideStep {
  title: string;
  hint: string;
  /** Undefined = the current page. */
  to?: string;
}

/** Suggested 5-minute presenter path (Савски кеј is the flagship project, ses-sk-g2 the deep gate review). */
export const DEMO_STEPS: GuideStep[] = [
  { title: 'Портфолио', hint: 'овде сте' },
  { title: 'Савски кеј', hint: 'Преглед', to: paths.project('savski-kej', 'pregled') },
  { title: 'Локација', hint: 'АИ услови', to: paths.project('savski-kej', 'lokacija') },
  { title: 'Варијанте', hint: 'калкулатор', to: paths.project('savski-kej', 'varijante') },
  { title: 'Одбор', hint: 'Г2 ревизија', to: paths.session('ses-sk-g2') },
  { title: 'Смернице', hint: 'Питај АрхиБорд', to: paths.guidelines() },
  { title: 'Повратне информације', hint: 'резиме и извоз', to: paths.feedback() },
];

/** Small dismissible „Демо пут“ card at the top of the portfolio: a suggested 5-minute walk-through with links. */
export function DemoGuideCard() {
  const dismissed = useDemoGuideStore((s) => s.dismissed);
  const dismiss = useDemoGuideStore((s) => s.dismiss);
  if (dismissed) return null;

  return (
    <section aria-labelledby="demo-guide-title" className="mb-6 rounded-2xl border border-line bg-surface-2/60 p-3 md:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="demo-guide-title" className="font-sans text-sm font-semibold text-ink">
            Демо пут · 5 минута
          </h2>
          <p className="text-xs text-muted">Предлог редоследа за представљање. Тапните корак да скочите на њега.</p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Сакриј водич кроз демо"
          className="-mt-1 -mr-1 inline-flex size-10 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
      <ol className="scrollbar-none -mx-3 mt-2 flex snap-x gap-2 overflow-x-auto px-3 pb-1 md:-mx-4 md:px-4 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
        {DEMO_STEPS.map((step, i) => {
          const body = (
            <>
              <span
                className={cn(
                  'tabular inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-semibold',
                  step.to ? 'bg-surface-2 text-accent' : 'bg-accent text-accent-ink',
                )}
              >
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-ink lg:overflow-visible lg:whitespace-normal">{step.title}</span>
                <span className="block truncate text-xs text-muted lg:overflow-visible lg:whitespace-normal">{step.hint}</span>
              </span>
            </>
          );
          const cls = 'flex min-h-14 w-full items-center gap-2 rounded-xl border px-2.5 text-left';
          return (
            <li key={step.title} className="w-[9.5rem] shrink-0 snap-start lg:w-auto">
              {step.to ? (
                <Link to={step.to} className={cn(cls, 'border-line bg-surface transition-colors hover:border-line-strong')}>
                  {body}
                </Link>
              ) : (
                <div className={cn(cls, 'border-accent/40 bg-accent-soft')} aria-current="page">
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
