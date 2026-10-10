import { useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronDown, Gavel } from 'lucide-react';
import { Button, Sheet } from '@/components/ui';
import { boardChair } from '@/data';
import type { BoardSession, Project } from '@/domain/types';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/store';
import {
  REVIEW_STEPS,
  STEP_COUNT,
  buildBoardDecision,
  computeVotes,
  kpiChecks,
  quorumFor,
  sessionDocuments,
  stepStates,
  type StepState,
} from './reviewLogic';
import { AiStep } from './steps/AiStep';
import { ConditionsStep } from './steps/ConditionsStep';
import { DecisionStep } from './steps/DecisionStep';
import { DocsStep } from './steps/DocsStep';
import { KpiStep } from './steps/KpiStep';
import { PrepStep, useAgendaItems } from './steps/PrepStep';
import { useReview } from './useReview';

function StepList({ current, states, onSelect }: { current: number; states: StepState[]; onSelect: (i: number) => void }) {
  return (
    <ol className="flex flex-col gap-1">
      {REVIEW_STEPS.map((s, i) => {
        const active = i === current;
        const done = states[i].done;
        return (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onSelect(i)}
              aria-current={active ? 'step' : undefined}
              className={cn(
                'flex min-h-14 w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors',
                active ? 'bg-surface shadow-soft ring-1 ring-line' : 'hover:bg-surface-2/70',
              )}
            >
              <span
                className={cn(
                  'tabular flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold',
                  active
                    ? 'border-accent bg-accent text-accent-ink'
                    : done
                      ? 'border-good/40 bg-good-soft text-good'
                      : 'border-line-strong text-muted',
                )}
              >
                {done && !active ? <Check className="size-4" aria-hidden /> : i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn('block text-sm font-medium', active ? 'text-ink' : 'text-ink/90')}>{s.title}</span>
                <span className="block truncate text-xs text-muted">{states[i].label}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/** Six-step gate review: sticky progress header + fixed prev/next bar on mobile, vertical step list on desktop. */
export function ReviewStepper({ session, project }: { session: BoardSession; project: Project }) {
  const { review, update } = useReview(session);
  const addUserDecision = useAppStore((s) => s.addUserDecision);
  const [stepsOpen, setStepsOpen] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const docs = useMemo(() => sessionDocuments(session), [session]);
  const checks = useMemo(() => kpiChecks(session.projectId), [session.projectId]);
  const agenda = useAgendaItems(session);
  const states = stepStates(review, session, docs, checks, agenda.length);
  const step = Math.min(Math.max(review.step, 0), STEP_COUNT - 1);
  const meta = REVIEW_STEPS[step];

  const chairId = boardChair()?.id;
  const votes = computeVotes(review.votes, review.presentIds, chairId);
  const quorumOk = review.presentIds.length >= quorumFor(session.memberIds.length);
  const canClose = quorumOk && votes.complete && Boolean(votes.outcome);

  const goTo = (i: number) => {
    const next = Math.min(Math.max(i, 0), STEP_COUNT - 1);
    update((r) => ({ ...r, step: next, maxStep: Math.max(r.maxStep, next) }));
    setStepsOpen(false);
    const el = topRef.current;
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 72;
      if (window.scrollY > y) window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  };

  const close = () => {
    if (!canClose || !votes.outcome) return;
    const decision = buildBoardDecision(review, session, votes.outcome, votes);
    addUserDecision(decision);
    update((r) => ({ ...r, outcome: votes.outcome, completedAt: new Date().toISOString(), decisionId: decision.id }));
    window.scrollTo({ top: 0 });
  };

  const isLast = step === STEP_COUNT - 1;
  const nextLabel = isLast ? 'Заврши седницу' : `Даље: ${REVIEW_STEPS[step + 1].title}`;
  const onNext = isLast ? close : () => goTo(step + 1);
  const nextDisabled = isLast && !canClose;

  const content = (() => {
    switch (meta.id) {
      case 'priprema':
        return <PrepStep session={session} project={project} review={review} update={update} />;
      case 'dokumentacija':
        return <DocsStep session={session} project={project} review={review} update={update} docs={docs} />;
      case 'kpi':
        return <KpiStep session={session} project={project} review={review} update={update} checks={checks} />;
      case 'ai':
        return <AiStep session={session} project={project} review={review} update={update} docs={docs} goTo={goTo} />;
      case 'uslovi':
        return <ConditionsStep session={session} project={project} review={review} update={update} />;
      default:
        return (
          <DecisionStep
            session={session}
            review={review}
            update={update}
            states={states}
            votes={votes}
            canClose={canClose}
            quorumOk={quorumOk}
            onClose={close}
            goTo={goTo}
          />
        );
    }
  })();

  return (
    <div ref={topRef} className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8">
      {/* Desktop: vertical step list */}
      <aside className="hidden lg:block" aria-label="Кораци ревизије">
        <div className="sticky top-8">
          <p className="eyebrow mb-2 px-2.5">Ревизија капије</p>
          <StepList current={step} states={states} onSelect={goTo} />
        </div>
      </aside>

      <div className="min-w-0">
        {/* Mobile / tablet: sticky compact progress header under the top bar */}
        <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-20 -mx-4 mb-4 border-b border-line bg-paper/95 px-4 pt-2 pb-2.5 backdrop-blur-md md:-mx-6 md:px-6 lg:hidden">
          <button
            type="button"
            onClick={() => setStepsOpen(true)}
            className="flex min-h-10 w-full items-center gap-2 text-left"
            aria-haspopup="dialog"
          >
            <span className="eyebrow tabular shrink-0">
              Корак {step + 1}/{STEP_COUNT}
            </span>
            <span className="min-w-0 flex-1 truncate font-display text-base font-semibold text-ink">{meta.title}</span>
            <span className="shrink-0 text-xs text-muted">кораци</span>
            <ChevronDown className="size-4 shrink-0 text-muted" aria-hidden />
          </button>
          <div className="mt-1 grid grid-cols-6 gap-1" aria-hidden>
            {REVIEW_STEPS.map((s, i) => (
              <span
                key={s.id}
                className={cn(
                  'h-1 rounded-full',
                  i === step ? 'bg-accent' : states[i].done ? 'bg-good/70' : i < step ? 'bg-line-strong' : 'bg-line',
                )}
              />
            ))}
          </div>
        </div>

        <div className="mb-4 hidden lg:block">
          <p className="eyebrow">
            Корак {step + 1} од {STEP_COUNT}
          </p>
          <h2 className="font-display text-2xl text-ink">{meta.title}</h2>
          <p className="text-sm text-muted">{meta.hint}</p>
        </div>

        <div key={step} className="animate-fade-in">
          {content}
        </div>

        {/* Desktop / tablet inline navigation */}
        <div className="mt-6 hidden items-center justify-between gap-3 border-t border-line pt-4 lg:flex">
          <Button variant="secondary" icon={ArrowLeft} onClick={() => goTo(step - 1)} disabled={step === 0}>
            Назад
          </Button>
          <Button
            onClick={onNext}
            disabled={nextDisabled}
            icon={isLast ? Gavel : undefined}
            iconRight={isLast ? undefined : ArrowRight}
          >
            {nextLabel}
          </Button>
        </div>
        {/* Spacer so the fixed mobile bar never covers content */}
        <div className="h-16 lg:hidden" aria-hidden />
      </div>

      {/* Mobile: fixed prev / next above the bottom navigation */}
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 border-t border-line bg-surface/95 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-[1200px] items-center gap-2 px-4 py-2 md:px-6">
          <Button
            variant="secondary"
            icon={ArrowLeft}
            onClick={() => goTo(step - 1)}
            disabled={step === 0}
            aria-label="Претходни корак"
          >
            <span className="sr-only sm:not-sr-only">Назад</span>
          </Button>
          <Button
            onClick={onNext}
            disabled={nextDisabled}
            icon={isLast ? Gavel : undefined}
            iconRight={isLast ? undefined : ArrowRight}
            className="min-w-0 flex-1"
          >
            <span className="truncate">{nextLabel}</span>
          </Button>
        </div>
      </div>

      <Sheet
        open={stepsOpen}
        onClose={() => setStepsOpen(false)}
        title="Кораци ревизије"
        subtitle={`Корак ${step + 1} од ${STEP_COUNT}`}
        width="sm"
      >
        <StepList current={step} states={states} onSelect={goTo} />
      </Sheet>
    </div>
  );
}
