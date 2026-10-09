import { Badge } from '@/components/ui';
import type { Risk } from '@/domain/types';
import { riskScore, riskZone } from './risksLogic';

/** Score (P × I) badge coloured by zone; critical risks are drawn solid. */
export function ScoreBadge({ risk }: { risk: Pick<Risk, 'probability' | 'impact'> }) {
  const score = riskScore(risk);
  const zone = riskZone(score);
  return (
    <Badge tone={zone.tone} variant={zone.solid ? 'solid' : 'soft'} className="min-w-9 justify-center" title={`${zone.label} ризик · ${risk.probability} × ${risk.impact}`}>
      {score}
    </Badge>
  );
}
