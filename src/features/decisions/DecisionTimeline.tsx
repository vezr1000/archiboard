import { ArrowUpRight, Trash2, TrendingDown } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { DECISION_STATUS_LABELS, DECISION_STATUS_TONE } from '@/domain/labels';
import type { Decision } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';
import { decisionEmphasis, groupByMonth, isBoardReviewDecision, openConditionCount, userDecisionLabel } from './decisionsLogic';
import { ImpactChips } from './ImpactChips';

export interface DecisionTimelineProps {
  decisions: Decision[];
  selectedId: string | null;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

/** Vertical timeline grouped by month (newest first); user proposals are marked „нова · предлог“. */
export function DecisionTimeline({ decisions, selectedId, onOpen, onDelete }: DecisionTimelineProps) {
  const groups = groupByMonth(decisions);
  return (
    <div className="flex flex-col gap-5">
      {groups.map((g) => (
        <section key={g.key} aria-label={g.label}>
          <h4 className="eyebrow mb-2.5 pl-6">{g.label}</h4>
          <ol className="relative ml-1.5 border-l border-line-strong pl-5">
            {g.items.map((d) => {
              const emphasis = decisionEmphasis(d);
              const open = openConditionCount(d);
              const user = Boolean(d.isUserCreated);
              return (
                <li key={d.id} className="relative pb-3 last:pb-0">
                  <span
                    className={cn(
                      'absolute top-4 -left-[1.62rem] size-2.5 rounded-full border-2',
                      emphasis === 'rise' ? 'border-bad bg-bad' : d.status === 'proposed' ? 'border-info bg-surface' : 'border-accent bg-accent',
                    )}
                    aria-hidden
                  />
                  <div
                    className={cn(
                      'min-w-0 rounded-2xl border bg-surface p-3.5 transition-colors',
                      selectedId === d.id ? 'border-accent' : 'border-line hover:border-line-strong',
                      emphasis === 'rise' && 'border-l-[3px] border-l-bad',
                      emphasis === 'fix' && 'border-l-[3px] border-l-info',
                      user && 'border-dashed bg-info-soft/40',
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                      <span>{formatDate(d.date, 'long')}</span>
                      <Badge tone={DECISION_STATUS_TONE[d.status]} size="sm" dot>
                        {DECISION_STATUS_LABELS[d.status]}
                      </Badge>
                      {user && (
                        <Badge tone="info" variant="outline" size="sm">
                          {userDecisionLabel(d)}
                        </Badge>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpen(d.id)}
                      className="mt-1.5 block w-full text-left font-display text-base leading-snug text-ink hover:underline"
                    >
                      {d.title}
                    </button>
                    <div className="mt-2">
                      <ImpactChips decision={d} />
                    </div>
                    {emphasis === 'rise' && (
                      <p className="mt-2 flex items-start gap-1.5 text-xs text-bad">
                        <ArrowUpRight className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                        Значајно повећава уграђени угљеник.
                      </p>
                    )}
                    {emphasis === 'fix' && (
                      <p className="mt-2 flex items-start gap-1.5 text-xs text-info">
                        <TrendingDown className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                        Предлог који смањује уграђени угљеник — чека одлуку одбора.
                      </p>
                    )}
                    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs text-muted">
                        {d.conditions.length === 0
                          ? 'без услова'
                          : open === 0
                            ? `услови: сви испуњени (${d.conditions.length})`
                            : `отворених услова: ${open} од ${d.conditions.length}`}
                      </span>
                      <span className="flex items-center gap-1">
                        {user && !isBoardReviewDecision(d) && (
                          <Button variant="ghost" size="sm" icon={Trash2} onClick={() => onDelete(d.id)}>
                            Обриши
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => onOpen(d.id)}>
                          Детаљи
                        </Button>
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
