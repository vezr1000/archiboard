import { Check, Diamond } from 'lucide-react';
import type { GateId, Phase } from '@/domain/types';
import { GATE_CLOSES_PHASE, GATE_LABELS, GATES, PHASE_LABELS, PHASES, phaseIndex } from '@/domain/labels';
import { cn } from '@/lib/cn';
import { formatDate, formatPct } from '@/lib/format';

export type GateState = 'passed' | 'next' | 'future' | 'failed';

export interface PhaseTimelineProps {
  /** Current phase. */
  current: Phase;
  /** Progress inside the current phase, 0..1. */
  progress?: number;
  /** Optional per-gate dates / state overrides. Default state: gates before current = passed, current phase's gate = next. */
  gates?: Partial<Record<GateId, { date?: string; state?: GateState }>>;
  /**
   * 'auto' (default): vertical list on phones (<640px), horizontal track on wider screens.
   * 'compact': single segmented bar + caption (project cards).
   */
  variant?: 'auto' | 'compact';
  className?: string;
}

/** Gate that sits at the end of a phase, if any. */
const gateAfter = (p: Phase): GateId | undefined => GATES.find((g) => GATE_CLOSES_PHASE[g] === p);

function gateState(g: GateId, current: Phase, override?: GateState): GateState {
  if (override) return override;
  const gi = phaseIndex(GATE_CLOSES_PHASE[g]);
  const ci = phaseIndex(current);
  return gi < ci ? 'passed' : gi === ci ? 'next' : 'future';
}

function GateMark({ state, code }: { state: GateState; code: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-5 shrink-0 items-center gap-0.5 rounded-md px-1 text-[0.65rem] font-semibold',
        state === 'passed' && 'bg-accent-soft text-accent',
        state === 'next' && 'bg-clay text-paper',
        state === 'failed' && 'bg-bad-soft text-bad',
        state === 'future' && 'border border-line text-muted',
      )}
    >
      {state === 'passed' ? <Check className="size-3" aria-hidden /> : <Diamond className="size-2.5" aria-hidden />}
      {code}
    </span>
  );
}

/**
 * Serbian delivery phases (Задатак → ИДР → ПГД → ПЗИ → Градња → ПИО → Употреба) with gates Г0–Г5.
 * @example <PhaseTimeline current="pgd" progress={0.7} gates={{ G2: { date: '2026-10-22' } }} />
 * @example <PhaseTimeline current="idr" progress={0.4} variant="compact" />
 */
export function PhaseTimeline({ current, progress = 0, gates = {}, variant = 'auto', className }: PhaseTimelineProps) {
  const ci = phaseIndex(current);
  const p = Math.max(0, Math.min(1, progress));
  const fillOf = (i: number) => (i < ci ? 1 : i === ci ? p : 0);
  const aria = `Тренутна фаза: ${PHASE_LABELS[current].long}, ${formatPct(p, { ratio: true, decimals: 0 })}`;

  if (variant === 'compact') {
    const next = gateAfter(current);
    return (
      <div className={cn('min-w-0', className)} role="img" aria-label={aria}>
        <div className="flex gap-0.5">
          {PHASES.map((ph, i) => (
            <div key={ph} className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2" title={PHASE_LABELS[ph].long}>
              <div className={cn('h-full rounded-full', i === ci ? 'bg-clay' : 'bg-accent')} style={{ width: `${fillOf(i) * 100}%` }} />
            </div>
          ))}
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-muted">
          <span className="truncate">
            <span className="font-medium text-ink">{PHASE_LABELS[current].short}</span> · {ci + 1}/{PHASES.length}
          </span>
          {next && (
            <span className="shrink-0">
              {GATE_LABELS[next].code}
              {gates[next]?.date && ` · ${formatDate(gates[next]!.date!, 'short')}`}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('min-w-0', className)} aria-label={aria} role="group">
      {/* Phones: vertical */}
      <ol className="flex flex-col sm:hidden">
        {PHASES.map((ph, i) => {
          const g = gateAfter(ph);
          const state = i < ci ? 'done' : i === ci ? 'current' : 'future';
          const gs = g ? gateState(g, current, gates[g]?.state) : undefined;
          return (
            <li key={ph} className="relative flex gap-3 pb-3 last:pb-0">
              {i < PHASES.length - 1 && (
                <span className={cn('absolute top-5 bottom-0 left-[9px] w-0.5', i < ci ? 'bg-accent' : 'bg-line')} aria-hidden />
              )}
              <span
                className={cn(
                  'relative z-10 mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full border-2',
                  state === 'done' && 'border-accent bg-accent text-accent-ink',
                  state === 'current' && 'border-clay bg-surface',
                  state === 'future' && 'border-line-strong bg-surface',
                )}
                aria-hidden
              >
                {state === 'done' && <Check className="size-3" />}
                {state === 'current' && <span className="size-2 rounded-full bg-clay" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className={cn('text-sm', state === 'current' ? 'font-semibold text-ink' : state === 'done' ? 'text-ink' : 'text-muted')}>
                    {PHASE_LABELS[ph].short}
                  </span>
                  {state === 'current' && (
                    <span className="tabular text-xs text-clay">{formatPct(p, { ratio: true, decimals: 0 })}</span>
                  )}
                  {g && gs && (
                    <span className="ml-auto flex items-center gap-1.5">
                      {gates[g]?.date && <span className="text-xs text-muted">{formatDate(gates[g]!.date!, 'short')}</span>}
                      <GateMark state={gs} code={GATE_LABELS[g].code} />
                    </span>
                  )}
                </div>
                {state === 'current' && (
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full bg-clay" style={{ width: `${p * 100}%` }} />
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* ≥640px: horizontal */}
      <div className="hidden sm:block">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${PHASES.length}, minmax(0, 1fr))` }}>
          {PHASES.map((ph, i) => {
            const g = gateAfter(ph);
            const gs = g ? gateState(g, current, gates[g]?.state) : undefined;
            return (
              <div key={ph} className="min-w-0">
                {/* gate row: marker right-aligned at phase end */}
                <div className="flex h-6 items-end justify-end pr-0.5">{g && gs && <GateMark state={gs} code={GATE_LABELS[g].code} />}</div>
                <div className="relative mt-1.5 h-2 bg-surface-2" style={{ borderRadius: i === 0 ? '999px 0 0 999px' : i === PHASES.length - 1 ? '0 999px 999px 0' : undefined }}>
                  <div className={cn('h-full', i === ci ? 'bg-clay' : 'bg-accent')} style={{ width: `${fillOf(i) * 100}%`, borderRadius: 'inherit' }} />
                  {g && <span className="absolute top-[-3px] right-0 h-[14px] w-0.5 bg-surface" aria-hidden />}
                </div>
                <div className="mt-2 pr-1">
                  <div className={cn('truncate text-xs', i === ci ? 'font-semibold text-ink' : i < ci ? 'text-ink' : 'text-muted')} title={PHASE_LABELS[ph].long}>
                    {PHASE_LABELS[ph].short}
                  </div>
                  {g && gates[g]?.date && <div className="truncate text-[0.68rem] text-muted">{formatDate(gates[g]!.date!, 'short')}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
