import { Badge, DataList, type DataColumn } from '@/components/ui';
import { getSession } from '@/data';
import { DECISION_STATUS_LABELS, DECISION_STATUS_TONE, GATE_LABELS } from '@/domain/labels';
import type { Decision } from '@/domain/types';
import { formatDate, formatPct } from '@/lib/format';
import { IMPACT_LABELS, impactTone, impactValue, openConditionCount, type ImpactKind } from './decisionsLogic';

const impactColumn = (kind: ImpactKind): DataColumn<Decision> => ({
  id: kind,
  header: IMPACT_LABELS[kind].short,
  align: 'right',
  width: '8%',
  cell: (d) => {
    const v = impactValue(d, kind);
    return v === undefined ? (
      <span className="text-muted">—</span>
    ) : (
      <Badge tone={impactTone(kind, v)} size="sm">
        {formatPct(v, { signed: true })}
      </Badge>
    );
  },
});

export interface DecisionListProps {
  decisions: Decision[];
  selectedId: string | null;
  onOpen: (id: string) => void;
}

/** Decision log as a table (≥768px) / cards (phones). */
export function DecisionList({ decisions, selectedId, onOpen }: DecisionListProps) {
  const columns: DataColumn<Decision>[] = [
    {
      id: 'title',
      header: 'Одлука',
      width: '34%',
      cell: (d) => (
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="min-w-0 break-words">{d.title}</span>
          {d.isUserCreated && (
            <Badge tone="info" variant="outline" size="sm">
              нова · предлог
            </Badge>
          )}
        </span>
      ),
    },
    { id: 'date', header: 'Датум', width: '11%', cell: (d) => <span className="text-sm text-muted">{formatDate(d.date, 'numeric')}</span> },
    {
      id: 'status',
      header: 'Статус',
      width: '10%',
      hideOnMobile: true,
      cell: (d) => (
        <Badge tone={DECISION_STATUS_TONE[d.status]} dot>
          {DECISION_STATUS_LABELS[d.status]}
        </Badge>
      ),
    },
    impactColumn('carbon'),
    impactColumn('energy'),
    impactColumn('cost'),
    {
      id: 'session',
      header: 'Седница',
      width: '9%',
      mobileLabel: 'Седница',
      cell: (d) => {
        const s = getSession(d.sessionId);
        return s ? <span className="text-sm">{GATE_LABELS[s.gate].code}</span> : <span className="text-sm text-muted">—</span>;
      },
    },
    {
      id: 'conditions',
      header: 'Отворени услови',
      width: '9%',
      align: 'right',
      mobileLabel: 'Отворени услови',
      cell: (d) => <span className="tabular text-sm">{openConditionCount(d)}</span>,
    },
  ];
  return (
    <DataList
      rows={decisions}
      rowKey={(d) => d.id}
      caption="Дневник одлука"
      columns={columns}
      primaryColumn="title"
      selectedKey={selectedId ?? undefined}
      onRowClick={(d) => onOpen(d.id)}
      mobileAside={(d) => (
        <Badge tone={DECISION_STATUS_TONE[d.status]} dot>
          {DECISION_STATUS_LABELS[d.status]}
        </Badge>
      )}
    />
  );
}
