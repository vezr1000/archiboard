import { useEffect, useMemo, useRef } from 'react';
import { ArrowRight, Calculator, RefreshCw, Replace } from 'lucide-react';
import { AiBadge, ThinkingDots, useScriptedRun } from '@/components/ai';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { paths } from '@/components/layout/navigation';
import { Badge, Button, Callout, Card, EmptyState } from '@/components/ui';
import type { Project } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatCarbon, formatNumber, formatSigned } from '@/lib/format';
import { analyseSwaps, carbonTarget, formatQuantity, positionsCount, type PassportRow, type SwapSuggestion } from './materialsLogic';

interface SwapSuggestionsProps {
  project: Project;
  rows: PassportRow[];
  areaM2: number;
  /** Unit of the per-m² values. */
  unit: string;
  onOpenMaterial: (materialId: string) => void;
}

/** kgCO₂e/m² with one decimal for small values (park), whole numbers otherwise. */
const per = (v: number) => formatNumber(v, v < 50 ? 1 : 0);

const DISCLAIMER = 'Демо: сценарио без стварне анализе — износи су израчунати из количина у пасошу и GWP вредности из EPD библиотеке.';

/** „Предлози замене“: scripted-but-computed smart swaps with a short „thinking“ phase. Starts when first scrolled into view. */
export function SwapSuggestions({ project, rows, areaM2, unit, onOpenMaterial }: SwapSuggestionsProps) {
  const analysis = useMemo(() => analyseSwaps(rows, areaM2, 4), [rows, areaM2]);
  const target = carbonTarget(project.id);
  const run = useScriptedRun({ thinkingMs: 1300, streamingMs: 1 });
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const start = run.start;

  useEffect(() => {
    const el = ref.current;
    if (!el || started.current) return;
    if (typeof IntersectionObserver === 'undefined') {
      started.current = true;
      start();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !started.current) {
          started.current = true;
          start();
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [start]);

  const hasCalculator = project.gfaM2 !== undefined;
  const done = run.state === 'streaming' || run.state === 'done';
  const { suggestions, afterPerM2, currentPerM2, combinedKg } = analysis;
  const afterTone = target === undefined ? 'info' : afterPerM2 <= target ? 'good' : 'warn';

  return (
    <Card
      id="zamene"
      title={
        <span className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span>Предлози замене</span>
          <AiBadge size="sm" />
        </span>
      }
      subtitle="Замене материјала са највећом уштедом угљеника, рангиране по уштеди."
    >
      <div ref={ref}>
        {run.state === 'idle' && (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted">Асистент пролази кроз пасош и упоређује позиције са EPD библиотеком.</p>
            <Button icon={Replace} onClick={run.start}>
              Анализирај пасош
            </Button>
          </div>
        )}

        {run.state === 'thinking' && (
          <div className="flex flex-col gap-3 py-2" aria-live="polite">
            <ThinkingDots label={`Анализирам ${positionsCount(rows.length)} пасоша и EPD библиотеку…`} />
            <div className="grid gap-3 md:grid-cols-2" aria-hidden>
              {[0, 1].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-xl bg-surface-2" />
              ))}
            </div>
          </div>
        )}

        {done && suggestions.length === 0 && (
          <EmptyState
            compact
            icon={Replace}
            title="Нема очигледних замена"
            description="За материјале у пасошу библиотека не нуди функционално замењив материјал са нижим GWP."
          />
        )}

        {done && suggestions.length > 0 && (
          <div className="animate-fade-in flex flex-col gap-4">
            <Callout tone={afterTone} icon={Replace} title={`Укупна уштеда свих ${suggestions.length} предлога: ${formatCarbon(-combinedKg, 'total')}`}>
              <span className="tabular">
                {per(currentPerM2)} → {per(afterPerM2)} {unit}
              </span>
              {target !== undefined && (
                <>
                  , циљ {formatNumber(target, 0)}
                  {afterPerM2 <= target ? ' — циљ би био достигнут.' : ` — још ${per(afterPerM2 - target)} изнад циља.`}
                </>
              )}
            </Callout>
            {project.phase === 'gradnja' && (
              <Callout tone="info">Пројекат је у градњи: предлози се односе само на позиције које још нису изведене или набављене.</Callout>
            )}
            <ol className="grid gap-3 md:grid-cols-2">
              {suggestions.map((s, i) => (
                <SwapCard key={s.id} rank={i + 1} s={s} target={target} unit={unit} projectId={project.id} showCalculator={hasCalculator} onOpenMaterial={onOpenMaterial} />
              ))}
            </ol>
            <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
              <p className="min-w-0 flex-1 text-xs text-muted">{DISCLAIMER}</p>
              <Button size="sm" variant="ghost" icon={RefreshCw} onClick={run.start}>
                Анализирај поново
              </Button>
            </div>
            <FeedbackWidget moduleId="materijali-zamene" compact question="Да ли би вам овакви предлози замене били корисни?" className="mt-0!" />
          </div>
        )}
      </div>
    </Card>
  );
}

function SwapCard({
  rank,
  s,
  target,
  unit,
  projectId,
  showCalculator,
  onOpenMaterial,
}: {
  rank: number;
  s: SwapSuggestion;
  target: number | undefined;
  unit: string;
  projectId: string;
  showCalculator: boolean;
  onOpenMaterial: (id: string) => void;
}) {
  const reaches = target !== undefined && s.afterPerM2 <= target;
  return (
    <li className="flex min-w-0 flex-col rounded-xl border border-line bg-surface p-3.5">
      <div className="flex min-w-0 items-start gap-2.5">
        <span className="tabular mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
          {rank}
        </span>
        <h4 className="min-w-0 font-display text-[1.02rem] leading-snug text-ink">{s.title}</h4>
      </div>

      <p className="mt-2 text-sm text-muted">
        {s.from.map((m, i) => (
          <span key={m.id}>
            {i > 0 && ', '}
            <button type="button" className="text-left text-ink underline-offset-2 hover:underline" onClick={() => onOpenMaterial(m.id)}>
              {m.name}
            </button>
          </span>
        ))}{' '}
        <ArrowRight className="inline size-3.5 align-[-2px]" aria-hidden />{' '}
        <button type="button" className="text-left font-medium text-ink underline-offset-2 hover:underline" onClick={() => onOpenMaterial(s.to.id)}>
          {s.to.name}
        </button>
      </p>
      <p className="mt-1 text-xs text-muted">
        {formatQuantity(s.quantity, s.unit)} · {positionsCount(s.rowCount)}
      </p>

      <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <span className="tabular font-display text-2xl font-semibold text-good">{formatCarbon(-s.savingsKg, 'total')}</span>
        <span className="tabular text-sm font-medium text-good">
          {formatSigned(-s.perM2, 1)} {unit}
        </span>
      </div>
      <p className={cn('tabular mt-1 text-sm', reaches ? 'text-good' : 'text-ink')}>
        Пројекат: {per(s.afterPerM2 + s.perM2)} → <span className="font-medium">{per(s.afterPerM2)}</span> {unit}
        {target !== undefined && <span className="text-muted">, циљ {formatNumber(target, 0)}</span>}
      </p>

      {s.alt && (
        <p className="mt-2 text-xs text-muted">
          <Badge size="sm" tone="info" className="mr-1.5 align-middle">
            Алтернатива
          </Badge>
          {s.alt.label}: {formatSigned(-s.alt.perM2, 1)} {unit} ({s.alt.note}).
        </p>
      )}

      <p className="mt-2.5 border-t border-line pt-2.5 text-xs leading-relaxed text-muted">
        <span className="font-medium text-ink">Цена и изводљивост: </span>
        {s.note}
      </p>

      {showCalculator && (
        <div className="mt-3 flex">
          <Button size="sm" variant="secondary" icon={Calculator} to={paths.project(projectId, 'varijante')}>
            Пренеси у калкулатор
          </Button>
        </div>
      )}
    </li>
  );
}
