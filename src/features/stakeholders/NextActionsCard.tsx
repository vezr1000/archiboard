import { useState } from 'react';
import { Button, Card } from '@/components/ui';
import type { NextActionItem } from './stakeholdersLogic';
import { DueChip, MapNumber } from './StakeholderBits';

const INITIAL = 4;

export interface NextActionsCardProps {
  items: NextActionItem[];
  numbers: Map<string, number>;
  onOpen: (id: string) => void;
}

/** „Следеће обавезе“ — next actions across stakeholders, overdue first, then by due date. */
export function NextActionsCard({ items, numbers, onOpen }: NextActionsCardProps) {
  const [all, setAll] = useState(false);
  const shown = all ? items : items.slice(0, INITIAL);
  const overdue = items.filter((i) => i.overdue).length;
  return (
    <Card title="Следеће обавезе" subtitle={overdue > 0 ? `${items.length} корака · ${overdue} са истеклим роком` : `${items.length} корака · сортирано по року`}>
      {items.length === 0 ? (
        <p className="text-sm text-muted">Нема договорених наредних корака.</p>
      ) : (
        <ul className="divide-y divide-line">
          {shown.map((i) => (
            <li key={i.stakeholder.id} className="flex items-start gap-2.5 py-2.5 first:pt-0 last:pb-0">
              <MapNumber n={numbers.get(i.stakeholder.id) ?? 0} attitude={i.stakeholder.attitude} className="mt-0.5" />
              <div className="min-w-0 flex-1">
                <button type="button" onClick={() => onOpen(i.stakeholder.id)} className="block min-h-6 max-w-full text-left text-sm font-medium text-ink hover:underline">
                  <span className="line-clamp-2">{i.stakeholder.name}</span>
                </button>
                <p className="text-sm text-ink/85">{i.text}</p>
                <div className="mt-1">
                  <DueChip due={i.due} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {items.length > INITIAL && (
        <Button variant="ghost" size="sm" className="mt-2" onClick={() => setAll((v) => !v)}>
          {all ? 'Прикажи мање' : `Прикажи још ${items.length - INITIAL}`}
        </Button>
      )}
    </Card>
  );
}
