import { useState } from 'react';
import { Avatar, Badge, Button, DataList, useMediaQuery, type DataColumn } from '@/components/ui';
import { getPerson } from '@/data';
import { RISK_CATEGORY_LABELS, RISK_STATUS_LABELS, RISK_STATUS_TONE } from '@/domain/labels';
import type { Risk } from '@/domain/types';
import { cn } from '@/lib/cn';
import { ScoreBadge } from './RiskBadges';

/** Mitigation text; clamped with „Прикажи више“ (the full text is also in the detail sheet). */
function Mitigation({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 90;
  return (
    <div className="min-w-0">
      <span className="mb-0.5 block text-[0.7rem] text-muted md:hidden">Ублажавање</span>
      <p className={cn('text-sm text-ink/85', !open && 'line-clamp-2')}>{text}</p>
      {long && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((o) => !o);
          }}
          onKeyDown={(e) => e.stopPropagation()}
          className="mt-0.5 inline-flex min-h-8 items-center text-xs text-accent hover:underline"
        >
          {open ? 'Прикажи мање' : 'Прикажи више'}
        </button>
      )}
    </div>
  );
}

export interface RiskListProps {
  risks: Risk[];
  selectedId: string | null;
  onOpen: (id: string) => void;
}

/** Risk register: table (≥768px) / cards (phones), score badge coloured by zone. */
const MOBILE_LIMIT = 5;

export function RiskList({ risks, selectedId, onOpen }: RiskListProps) {
  const isPhone = useMediaQuery('(max-width: 767px)');
  const [showAll, setShowAll] = useState(false);
  const selectedIndex = selectedId ? risks.findIndex((r) => r.id === selectedId) : -1;
  const limit = isPhone && !showAll ? Math.max(MOBILE_LIMIT, selectedIndex + 1) : risks.length;
  const columns: DataColumn<Risk>[] = [
    {
      id: 'score',
      header: 'Резултат',
      width: '8%',
      mobileLabel: null,
      hideOnMobile: true,
      cell: (r) => <ScoreBadge risk={r} />,
    },
    {
      id: 'title',
      header: 'Ризик',
      width: '28%',
      cell: (r) => <span className={cn('block break-words', r.status === 'closed' && 'text-muted')}>{r.title}</span>,
    },
    { id: 'category', header: 'Категорија', width: '12%', cell: (r) => <span className="text-sm">{RISK_CATEGORY_LABELS[r.category]}</span> },
    {
      id: 'pi',
      header: <span className="whitespace-nowrap">В × У</span>,
      width: '8%',
      align: 'center',
      mobileLabel: 'Вероватноћа × утицај',
      cell: (r) => (
        <span className="tabular whitespace-nowrap text-sm">
          {r.probability} × {r.impact}
        </span>
      ),
    },
    {
      id: 'owner',
      header: 'Одговорни',
      width: '9%',
      align: 'center',
      cell: (r) => {
        const owner = getPerson(r.ownerId);
        return owner ? (
          <span className="inline-flex items-center gap-2">
            <Avatar person={owner} size="xs" />
            <span className="text-sm md:hidden">{owner.name}</span>
          </span>
        ) : (
          '—'
        );
      },
    },
    {
      id: 'status',
      header: 'Статус',
      width: '11%',
      hideOnMobile: true,
      cell: (r) => (
        <Badge tone={RISK_STATUS_TONE[r.status]} dot>
          {RISK_STATUS_LABELS[r.status]}
        </Badge>
      ),
    },
    { id: 'mitigation', header: 'Ублажавање', width: '26%', mobileLabel: null, cell: (r) => <Mitigation text={r.mitigation} /> },
  ];
  return (
    <>
    <DataList
      rows={risks.slice(0, limit)}
      rowKey={(r) => r.id}
      caption="Регистар ризика"
      columns={columns}
      primaryColumn="title"
      selectedKey={selectedId ?? undefined}
      onRowClick={(r) => onOpen(r.id)}
      mobileAside={(r) => (
        <span className="flex flex-col items-end gap-1">
          <ScoreBadge risk={r} />
          <Badge tone={RISK_STATUS_TONE[r.status]} size="sm" dot>
            {RISK_STATUS_LABELS[r.status]}
          </Badge>
        </span>
      )}
      emptyText="Ниједан ризик не одговара изабраним филтерима."
    />
    {isPhone && risks.length > MOBILE_LIMIT && (
      <Button variant="secondary" fullWidth className="mt-3" onClick={() => setShowAll((v) => !v)}>
        {limit < risks.length ? `Прикажи још ${risks.length - limit}` : 'Прикажи мање'}
      </Button>
    )}
    </>
  );
}
