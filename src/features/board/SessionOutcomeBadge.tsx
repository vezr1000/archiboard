import { Badge } from '@/components/ui';
import { SESSION_OUTCOME_LABELS, SESSION_OUTCOME_TONE } from '@/domain/labels';
import { useSessionOutcome, type SessionOutcomeInfo } from '@/store';
import { STEP_COUNT } from './reviewLogic';

/** Badge text/tone for a session's effective state (seed outcome, review in progress, or closed review). */
export function sessionBadgeProps(info: SessionOutcomeInfo): {
  label: string;
  tone: 'info' | 'clay' | 'good' | 'warn' | 'bad' | 'neutral';
} {
  if (info.status === 'in-progress')
    return { label: `у току · корак ${(info.review?.step ?? 0) + 1}/${STEP_COUNT}`, tone: 'clay' };
  if (info.status === 'scheduled') return { label: 'заказано', tone: 'info' };
  return { label: SESSION_OUTCOME_LABELS[info.outcome], tone: SESSION_OUTCOME_TONE[info.outcome] as 'good' | 'warn' | 'bad' };
}

/**
 * Outcome / status of a board session that also reflects a gate review run in this demo
 * („у току · корак 3/6“, or the outcome once „Заврши седницу“ was pressed).
 * @example <SessionOutcomeBadge sessionId={session.id} size="sm" />
 */
export function SessionOutcomeBadge({
  sessionId,
  size = 'sm',
  className,
}: {
  sessionId: string;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const info = useSessionOutcome(sessionId);
  const { label, tone } = sessionBadgeProps(info);
  return (
    <Badge tone={tone} size={size} dot={info.status === 'in-progress'} className={className}>
      {label}
    </Badge>
  );
}
