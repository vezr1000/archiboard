import { TriangleAlert } from 'lucide-react';
import { StackedBar } from '@/components/charts';
import { Legend } from '@/components/charts/Legend';
import { Avatar, Badge, Card } from '@/components/ui';
import { getProject, projects } from '@/data';
import type { Person } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatPct } from '@/lib/format';
import { isOverallocated, projectColor, totalPct } from './teamLogic';

export interface WorkloadCardProps {
  /** People to show (already filtered). */
  people: Person[];
  onOpen: (p: Person) => void;
}

/** „Оптерећење“ — per person a stacked bar of allocations by project against the 100 % capacity marker. */
export function WorkloadCard({ people, onOpen }: WorkloadCardProps) {
  const sorted = [...people].sort((a, b) => totalPct(b) - totalPct(a) || a.name.localeCompare(b.name, 'sr'));
  // One common scale so that the 100 % marker lines up across rows.
  const scale = Math.max(120, ...sorted.map(totalPct));
  const over = sorted.filter(isOverallocated).length;
  return (
    <Card
      title="Оптерећење"
      subtitle="Ангажовање по пројектима · линија = 100 % капацитета"
      action={
        over > 0 ? (
          <Badge tone="bad" icon={TriangleAlert}>
            {over} преоптерећено
          </Badge>
        ) : undefined
      }
    >
      <Legend
        className="mb-4"
        items={[
          ...projects.map((p) => ({ label: p.shortName, color: projectColor(p.id) })),
          { label: '100 % капацитета', color: 'var(--ink)', shape: 'line' as const },
        ]}
      />
      {sorted.length === 0 ? (
        <p className="text-sm text-muted">Нико не одговара изабраним филтерима.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {sorted.map((p) => {
            const total = totalPct(p);
            const isOver = isOverallocated(p);
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onOpen(p)}
                  className={cn('block w-full min-w-0 rounded-xl px-2 py-2 text-left transition-colors hover:bg-surface-2/60', isOver && 'bg-bad-soft/40')}
                >
                  <span className="flex items-center gap-2.5">
                    <Avatar person={p} size="sm" showTitle={false} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{p.name}</span>
                      <span className="block truncate text-xs text-muted">
                        {p.office ?? ''}
                        {p.office ? ' · ' : ''}
                        {p.allocations.length} {p.allocations.length === 1 ? 'пројекат' : p.allocations.length < 5 ? 'пројекта' : 'пројеката'}
                      </span>
                    </span>
                    {isOver && <TriangleAlert className="size-4 shrink-0 text-bad" aria-hidden />}
                    <span className={cn('tabular shrink-0 text-sm font-semibold', isOver ? 'text-bad' : 'text-ink')}>{formatPct(total, { decimals: 0 })}</span>
                  </span>
                  <span className="mt-2 block">
                    <StackedBar
                      title={`Оптерећење: ${p.name}`}
                      height="sm"
                      showLegend={false}
                      total={scale}
                      marker={100}
                      overMarkerTone="bad"
                      format={(v) => formatPct(v, { decimals: 0 })}
                      segments={[...p.allocations]
                        .sort((a, b) => b.pct - a.pct)
                        .map((a) => ({ id: a.projectId, label: getProject(a.projectId)?.shortName ?? a.projectId, value: a.pct, color: projectColor(a.projectId) }))}
                    />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
