import { ATTITUDE_LABELS, ATTITUDE_TONE } from '@/domain/labels';
import type { Stakeholder } from '@/domain/types';
import { Badge, DotScale } from '@/components/ui';
import { toneVar } from '@/components/ui/tone';
import { formatDate, formatRelative } from '@/lib/format';
import { daysFromToday } from '@/lib/dates';
import { cn } from '@/lib/cn';
import type { ParsedDue } from './stakeholdersLogic';

/** Number of a stakeholder on the influence map, coloured by attitude. */
export function MapNumber({ n, attitude, className }: { n: number; attitude: Stakeholder['attitude']; className?: string }) {
  return (
    <span
      className={cn('inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-bold text-paper', className)}
      style={{ background: toneVar(ATTITUDE_TONE[attitude]) }}
      title={`На мапи: ${n}`}
      aria-hidden
    >
      {n}
    </span>
  );
}

export function AttitudeBadge({ attitude, size }: { attitude: Stakeholder['attitude']; size?: 'sm' | 'md' }) {
  return (
    <Badge tone={ATTITUDE_TONE[attitude]} size={size} dot>
      {ATTITUDE_LABELS[attitude]}
    </Badge>
  );
}

/** Influence / interest as two mini dot scales. */
export function InfluenceInterest({ s }: { s: Pick<Stakeholder, 'influence' | 'interest'> }) {
  return (
    <span className="inline-flex flex-col gap-1 text-xs text-muted">
      <span className="inline-flex items-center gap-2">
        <span className="w-14 shrink-0">Утицај</span>
        <DotScale label="Утицај" value={s.influence} />
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="w-14 shrink-0">Интерес</span>
        <DotScale label="Интерес" value={s.interest} />
      </span>
    </span>
  );
}

/** Due-date chip for a parsed next action; overdue is flagged against DEMO_TODAY. */
export function DueChip({ due }: { due?: ParsedDue }) {
  if (!due) return <span className="text-xs text-muted">без рока</span>;
  if (daysFromToday(due.date) < 0) {
    return (
      <Badge tone="bad" size="sm">
        рок истекао {formatRelative(due.date)}
      </Badge>
    );
  }
  const label =
    due.precision === 'month' ? `током ${formatDate(due.date, 'month').replace(/\.$/, '')}` : formatDate(due.date, 'day-month');
  return (
    <span className="inline-flex flex-wrap items-center gap-x-1.5 text-xs text-muted">
      <Badge tone={due.precision === 'exact' ? 'accent' : 'neutral'} size="sm">
        {label}
      </Badge>
      {due.precision !== 'month' && <span>{formatRelative(due.date)}</span>}
    </span>
  );
}
