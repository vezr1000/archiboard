import type { Phase } from '@/domain/types';
import { PHASE_LABELS } from '@/domain/labels';
import { Badge } from './Badge';

export interface PhasePillProps {
  phase: Phase;
  /** Show the long name („Пројекат за грађевинску дозволу“). */
  long?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Current design phase label.
 * @example <PhasePill phase="pgd" />  → „ПГД“
 */
export function PhasePill({ phase, long, size, className }: PhasePillProps) {
  const l = PHASE_LABELS[phase];
  return (
    <Badge tone="neutral" variant="outline" size={size} className={className} title={l.long}>
      {long ? l.long : l.short}
    </Badge>
  );
}
