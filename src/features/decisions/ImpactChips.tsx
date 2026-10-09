import { Badge } from '@/components/ui';
import type { Decision } from '@/domain/types';
import { formatPct } from '@/lib/format';
import { IMPACT_LABELS, impactTone, impactValue, type ImpactKind } from './decisionsLogic';

const KINDS: ImpactKind[] = ['carbon', 'energy', 'cost'];

/** Δ угљеник / Δ енергија / Δ цена chips, coloured by direction (lower carbon and energy = good). */
export function ImpactChips({ decision }: { decision: Decision }) {
  const items = KINDS.flatMap((k) => {
    const v = impactValue(decision, k);
    return v === undefined ? [] : [{ k, v }];
  });
  if (items.length === 0) return <span className="text-xs text-muted">утицај није процењен</span>;
  return (
    <span className="flex flex-wrap gap-1.5">
      {items.map(({ k, v }) => (
        <Badge key={k} tone={impactTone(k, v)} size="sm">
          {IMPACT_LABELS[k].short} {formatPct(v, { signed: true })}
        </Badge>
      ))}
    </span>
  );
}
