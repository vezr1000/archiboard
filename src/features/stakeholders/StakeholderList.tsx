import { useState } from 'react';
import { Button, DataList, useMediaQuery, type DataColumn } from '@/components/ui';
import type { Stakeholder } from '@/domain/types';
import { formatDate, formatRelative } from '@/lib/format';
import { cn } from '@/lib/cn';
import { GROUP_LABELS, groupOf, lastContact } from './stakeholdersLogic';
import { AttitudeBadge, InfluenceInterest, MapNumber } from './StakeholderBits';

const MOBILE_LIMIT = 6;

export interface StakeholderListProps {
  rows: Stakeholder[];
  numbers: Map<string, number>;
  selectedId: string | null;
  onOpen: (id: string) => void;
}

/** Stakeholder register: table (≥768px) / cards (phones, first 6 + „Прикажи још“). */
export function StakeholderList({ rows, numbers, selectedId, onOpen }: StakeholderListProps) {
  const isPhone = useMediaQuery('(max-width: 767px)');
  const [showAll, setShowAll] = useState(false);
  const selectedIndex = selectedId ? rows.findIndex((r) => r.id === selectedId) : -1;
  const limit = isPhone && !showAll ? Math.max(MOBILE_LIMIT, selectedIndex + 1) : rows.length;

  const columns: DataColumn<Stakeholder>[] = [
    {
      id: 'name',
      header: 'Страна',
      width: '27%',
      cell: (s) => (
        <span className="flex min-w-0 items-start gap-2">
          <MapNumber n={numbers.get(s.id) ?? 0} attitude={s.attitude} className="mt-0.5" />
          <span className="min-w-0">
            <span className="block break-words font-medium text-ink">{s.name}</span>
            {s.organization !== s.name && <span className="block break-words text-xs text-muted">{s.organization}</span>}
            <span className="mt-0.5 block text-xs text-muted md:hidden">{GROUP_LABELS[groupOf(s)]}</span>
          </span>
        </span>
      ),
    },
    { id: 'role', header: 'Улога', width: '20%', mobileLabel: null, cell: (s) => <span className="line-clamp-3 text-sm text-ink/85 md:line-clamp-none">{s.role}</span> },
    { id: 'attitude', header: 'Став', width: '10%', hideOnMobile: true, cell: (s) => <AttitudeBadge attitude={s.attitude} /> },
    { id: 'scale', header: 'Утицај / интерес', width: '13%', mobileLabel: null, cell: (s) => <InfluenceInterest s={s} /> },
    {
      id: 'last',
      header: 'Последњи контакт',
      width: '11%',
      cell: (s) => {
        const d = lastContact(s);
        return d ? (
          <span className="text-sm" title={formatDate(d, 'long')}>
            {formatRelative(d)}
          </span>
        ) : (
          <span className="text-sm text-muted">—</span>
        );
      },
    },
    {
      id: 'next',
      header: 'Следећи корак',
      width: '19%',
      cell: (s) => (s.nextAction ? <span className={cn('text-sm text-ink/85', 'line-clamp-3 md:line-clamp-none')}>{s.nextAction}</span> : <span className="text-sm text-muted">—</span>),
    },
  ];

  return (
    <>
      <DataList
        rows={rows.slice(0, limit)}
        rowKey={(s) => s.id}
        caption="Заинтересоване стране"
        columns={columns}
        primaryColumn="name"
        selectedKey={selectedId ?? undefined}
        onRowClick={(s) => onOpen(s.id)}
        mobileAside={(s) => <AttitudeBadge attitude={s.attitude} size="sm" />}
        emptyText="Ниједна страна не одговара изабраним филтерима."
      />
      {isPhone && rows.length > MOBILE_LIMIT && (
        <Button variant="secondary" fullWidth className="mt-3" onClick={() => setShowAll((v) => !v)}>
          {limit < rows.length ? `Прикажи још ${rows.length - limit}` : 'Прикажи мање'}
        </Button>
      )}
    </>
  );
}
