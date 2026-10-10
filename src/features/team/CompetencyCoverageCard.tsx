import { CircleAlert, CircleCheck } from 'lucide-react';
import { Avatar, Badge, Card } from '@/components/ui';
import type { Person } from '@/domain/types';
import { cn } from '@/lib/cn';
import type { NeedCoverage } from './teamLogic';

export interface CompetencyCoverageCardProps {
  coverage: NeedCoverage[];
  onOpenPerson: (p: Person) => void;
}

function PersonChip({ p, onOpen }: { p: Person; onOpen: (p: Person) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(p)}
      className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-line py-0.5 pr-2.5 pl-0.5 text-[0.8125rem] text-ink hover:bg-surface-2"
    >
      <Avatar person={p} size="xs" showTitle={false} />
      {p.name}
    </button>
  );
}

/** „Покривеност компетенција“ — checklist of what the project needs vs who in the team covers it. */
export function CompetencyCoverageCard({ coverage, onOpenPerson }: CompetencyCoverageCardProps) {
  const missing = coverage.filter((c) => c.covered.length === 0).length;
  return (
    <Card
      title="Покривеност компетенција"
      subtitle={`${coverage.length - missing} од ${coverage.length} покривено шемом сертификације и типологијом`}
      action={
        missing > 0 ? (
          <Badge tone="warn" icon={CircleAlert}>
            {missing === 1 ? '1 недостаје' : `${missing} недостају`}
          </Badge>
        ) : (
          <Badge tone="good" icon={CircleCheck}>
            Све покривено
          </Badge>
        )
      }
    >
      <ul className="divide-y divide-line">
        {coverage.map(({ need, covered, elsewhere }) => {
          const ok = covered.length > 0;
          const Icon = ok ? CircleCheck : CircleAlert;
          return (
            <li key={need.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <Icon className={cn('mt-0.5 size-5 shrink-0', ok ? 'text-good' : 'text-warn')} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{need.label}</p>
                <p className="text-xs text-muted">{need.reason}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {ok ? (
                    covered.slice(0, 2).map((p) => <PersonChip key={p.id} p={p} onOpen={onOpenPerson} />)
                  ) : (
                    <Badge tone="warn" size="sm">
                      недостаје у тиму
                    </Badge>
                  )}
                  {covered.length > 2 && <span className="self-center text-xs text-muted">+ још {covered.length - 2}</span>}
                </div>
                {!ok && elsewhere.length > 0 && (
                  <p className="mt-1.5 text-xs text-muted">
                    У фирми: {elsewhere.slice(0, 3).map((p) => `${p.name}${p.office ? ` (${p.office})` : ''}`).join(', ')}
                    {elsewhere.length > 3 && ` и још ${elsewhere.length - 3}`}
                  </p>
                )}
                {!ok && elsewhere.length === 0 && <p className="mt-1.5 text-xs text-warn">Нико у фирми то не покрива — потребан спољни сарадник.</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
