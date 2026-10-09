import type { Health } from '@/domain/types';
import { HEALTH_LABELS, HEALTH_TONE } from '@/domain/labels';
import { Badge } from './Badge';

export interface HealthBadgeProps {
  health: Health;
  /** Long label („У складу са циљем“) instead of short („У складу“). */
  long?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Project health as a coloured badge with dot.
 * @example <HealthBadge health="at-risk" />
 */
export function HealthBadge({ health, long, size, className }: HealthBadgeProps) {
  const l = HEALTH_LABELS[health];
  return (
    <Badge tone={HEALTH_TONE[health]} dot size={size} className={className} title={l.long}>
      {long ? l.long : l.short}
    </Badge>
  );
}
