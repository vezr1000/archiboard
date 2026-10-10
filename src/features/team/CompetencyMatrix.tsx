import { useState } from 'react';
import { Check, TriangleAlert } from 'lucide-react';
import { Avatar, Badge, Callout, Card, DotScale, Segmented, useMediaQuery } from '@/components/ui';
import type { Person } from '@/domain/types';
import { cn } from '@/lib/cn';
import {
  covers,
  coverersOf,
  MATRIX_GROUP_LABELS,
  MATRIX_ITEMS,
  singlePoints,
  type MatrixGroup,
  type MatrixItem,
} from './teamLogic';

export interface CompetencyMatrixProps {
  /** People rows (already filtered). Coverage / single points are always computed firm-wide. */
  people: Person[];
  onOpen: (p: Person) => void;
}

const GROUP_OPTIONS = (Object.keys(MATRIX_GROUP_LABELS) as MatrixGroup[]).map((value) => ({ value, label: MATRIX_GROUP_LABELS[value] }));
const VIEW_OPTIONS = [
  { value: 'people', label: 'По људима' },
  { value: 'items', label: 'По компетенцијама' },
] as const;
type View = (typeof VIEW_OPTIONS)[number]['value'];

function Cell({ item, person }: { item: MatrixItem; person: Person }) {
  const v = item.value(person);
  if (v === 0) return <span className="text-line-strong" aria-label="нема">·</span>;
  if (item.graded) return <DotScale label={item.label} value={v} max={3} className={cn(v >= 2 ? '' : 'opacity-60')} />;
  return <Check className="mx-auto size-4 text-accent" aria-label="има" />;
}

/** „Матрица компетенција“ — people × competencies / certificates / licences, with single points of failure flagged. */
export function CompetencyMatrix({ people, onOpen }: CompetencyMatrixProps) {
  const isPhone = useMediaQuery('(max-width: 767px)');
  const [group, setGroup] = useState<MatrixGroup>('competencies');
  const [view, setView] = useState<View>('people');
  const items = MATRIX_ITEMS[group];
  const single = singlePoints(group);
  const singleIds = new Set(single.map((s) => s.item.id));
  const sorted = [...people].sort((a, b) => a.name.localeCompare(b.name, 'sr'));

  return (
    <Card title="Матрица компетенција" subtitle="Ко у фирми шта покрива" className="min-w-0">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Segmented ariaLabel="Група компетенција" options={GROUP_OPTIONS} value={group} onChange={setGroup} />
        {isPhone && <Segmented ariaLabel="Приказ матрице" options={[...VIEW_OPTIONS]} value={view} onChange={setView} />}
      </div>

      {single.length > 0 ? (
        <Callout tone="warn" title={single.length === 1 ? 'Једна критична зависност' : `${single.length} критичне зависности`} className="mb-4">
          Покрива је само једна особа:{' '}
          {single.map(({ item, person }, i) => (
            <span key={item.id}>
              {i > 0 && '; '}
              <strong>{item.label}</strong> ({person.name})
            </span>
          ))}
          . Ако та особа буде одсутна, фирма нема замену.
        </Callout>
      ) : (
        <p className="mb-4 text-sm text-muted">Свака ставка је покривена са најмање две особе.</p>
      )}

      {isPhone ? (
        view === 'people' ? (
          <ul className="flex flex-col gap-2">
            {sorted.map((p) => {
              const has = items.filter((it) => it.value(p) > 0);
              return (
                <li key={p.id}>
                  <button type="button" onClick={() => onOpen(p)} className="block w-full rounded-xl border border-line p-3 text-left hover:bg-surface-2/50">
                    <span className="flex items-center gap-2.5">
                      <Avatar person={p} size="xs" showTitle={false} />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{p.name}</span>
                    </span>
                    <span className="mt-2 flex flex-wrap gap-1">
                      {has.length === 0 && <span className="text-xs text-muted">—</span>}
                      {has.map((it) => (
                        <Badge key={it.id} tone={covers(it, p) ? 'accent' : 'neutral'} size="sm" variant={covers(it, p) ? 'soft' : 'outline'}>
                          {it.label}
                          {it.graded ? ` ${it.value(p)}` : ''}
                        </Badge>
                      ))}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((it) => {
              const who = coverersOf(it);
              return (
                <li key={it.id} className={cn('rounded-xl border p-3', singleIds.has(it.id) ? 'border-warn/50 bg-warn-soft/40' : 'border-line')}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-ink">{it.label}</span>
                    {singleIds.has(it.id) ? (
                      <Badge tone="warn" size="sm" icon={TriangleAlert}>
                        1 особа
                      </Badge>
                    ) : (
                      <Badge tone="neutral" size="sm">
                        {who.length} {who.length % 10 >= 2 && who.length % 10 <= 4 && (who.length < 10 || who.length > 20) ? 'особе' : 'особа'}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted">{who.map((p) => p.name).join(', ') || 'Нико'}</p>
                </li>
              );
            })}
          </ul>
        )
      ) : (
        <div className="-mx-1 overflow-x-auto px-1">
          <table className="w-full min-w-[40rem] border-separate border-spacing-0 text-sm">
            <caption className="sr-only">Матрица: {MATRIX_GROUP_LABELS[group]}</caption>
            <thead>
              <tr>
                <th scope="col" className="sticky left-0 z-10 bg-surface py-2 pr-3 text-left text-xs font-medium text-muted">
                  Особа
                </th>
                {items.map((it) => (
                  <th key={it.id} scope="col" title={it.title} className="px-1.5 py-2 text-center align-bottom text-xs font-medium text-muted">
                    <span className="block leading-tight">{it.label}</span>
                    {singleIds.has(it.id) && (
                      <span className="mt-1 inline-flex items-center gap-0.5 text-warn" title="Покрива је само једна особа">
                        <TriangleAlert className="size-3" aria-hidden />1
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => (
                <tr key={p.id} className="group">
                  <th scope="row" className="sticky left-0 z-10 border-t border-line bg-surface py-1.5 pr-3 text-left font-normal group-hover:bg-surface-2">
                    <button type="button" onClick={() => onOpen(p)} className="flex min-h-9 items-center gap-2 text-left text-ink hover:underline">
                      <Avatar person={p} size="xs" showTitle={false} />
                      <span className="whitespace-nowrap">{p.name}</span>
                    </button>
                  </th>
                  {items.map((it) => (
                    <td
                      key={it.id}
                      className={cn('border-t border-line px-1.5 py-1.5 text-center group-hover:bg-surface-2', singleIds.has(it.id) && 'bg-warn-soft/40')}
                    >
                      <Cell item={it} person={p} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-muted">
        {group === 'competencies'
          ? 'Тачке = ниво 1–3 (основно, самостално, експерт); „покрива“ значи ниво 2 или више.'
          : '✓ = особа има сертификат / лиценцу.'}{' '}
        Упозорење „1“ у заглављу = само једна особа у целој фирми.
      </p>
    </Card>
  );
}
