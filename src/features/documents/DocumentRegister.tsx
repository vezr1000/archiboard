import { useMemo, useState } from 'react';
import { FileText, SlidersHorizontal } from 'lucide-react';
import { Avatar, Badge, Button, Card, DataList, FilterChips, SearchInput, Select, useMediaQuery, type DataColumn } from '@/components/ui';
import { getPerson } from '@/data';
import {
  DISCIPLINE_LABELS,
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_STATUS_TONE,
  DOCUMENT_TYPE_LABELS,
  GATE_LABELS,
  GATES,
} from '@/domain/labels';
import type { Discipline, DocumentStatus, DocumentType, GateId, ProjectDocument } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatRelative } from '@/lib/format';
import { DOC_SORT_OPTIONS, matchesQuery, sortDocuments, type DocSort } from './documentsLogic';

const MOBILE_LIMIT = 8;

export interface DocumentRegisterProps {
  docs: ProjectDocument[];
  /** Highlighted (open) document id. */
  selectedId: string | null;
  onOpen: (documentId: string) => void;
  gate: GateId | null;
  onGateChange: (gate: GateId | null) => void;
}

const countBy = <K extends string>(docs: ProjectDocument[], key: (d: ProjectDocument) => K[]) => {
  const m = new Map<K, number>();
  for (const d of docs) for (const k of key(d)) m.set(k, (m.get(k) ?? 0) + 1);
  return m;
};

/** Document register: search, filter chips, sort, table (≥768px) / cards (phones). */
export function DocumentRegister({ docs, selectedId, onOpen, gate, onGateChange }: DocumentRegisterProps) {
  const isPhone = useMediaQuery('(max-width: 767px)');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<DocumentStatus[]>([]);
  const [types, setTypes] = useState<DocumentType[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [sort, setSort] = useState<DocSort>('updated');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const statusCounts = useMemo(() => countBy(docs, (d) => [d.status]), [docs]);
  const typeCounts = useMemo(() => countBy(docs, (d) => [d.type]), [docs]);
  const disciplineCounts = useMemo(() => countBy(docs, (d) => [d.discipline]), [docs]);
  const gateCounts = useMemo(() => countBy(docs, (d) => d.requiredForGates), [docs]);

  const filtered = useMemo(
    () =>
      sortDocuments(
        docs.filter(
          (d) =>
            (status.length === 0 || status.includes(d.status)) &&
            (types.length === 0 || types.includes(d.type)) &&
            (disciplines.length === 0 || disciplines.includes(d.discipline)) &&
            (!gate || d.requiredForGates.includes(gate)) &&
            matchesQuery(d, getPerson(d.ownerId)?.name ?? '', query),
        ),
        sort,
      ),
    [docs, status, types, disciplines, gate, query, sort],
  );

  const activeCount = status.length + types.length + disciplines.length + (gate ? 1 : 0);
  const clear = () => {
    setQuery('');
    setStatus([]);
    setTypes([]);
    setDisciplines([]);
    onGateChange(null);
  };

  // On phones only the first few rows are shown; the open (deep-linked) document is always included.
  const selectedIndex = selectedId ? filtered.findIndex((d) => d.id === selectedId) : -1;
  const limit = isPhone && !showAll ? Math.max(MOBILE_LIMIT, selectedIndex + 1) : filtered.length;
  const visible = filtered.slice(0, limit);

  const columns: DataColumn<ProjectDocument>[] = [
    {
      id: 'title',
      header: 'Назив',
      width: '33%',
      cell: (d) => (
        <span data-doc-id={d.id} className="flex min-w-0 items-start gap-2">
          <FileText className="mt-0.5 hidden size-4 shrink-0 text-muted md:block" aria-hidden />
          <span className="min-w-0 break-words">{d.title}</span>
        </span>
      ),
    },
    {
      id: 'type',
      header: 'Врста',
      width: '17%',
      cell: (d) => (
        <span className="block min-w-0">
          <span className="block text-sm">{DOCUMENT_TYPE_LABELS[d.type]}</span>
          <span className="block text-xs text-muted">{DISCIPLINE_LABELS[d.discipline]}</span>
        </span>
      ),
    },
    { id: 'version', header: 'Верзија', width: '7%', cell: (d) => <span className="tabular text-sm">{d.version}</span> },
    {
      id: 'status',
      header: 'Статус',
      width: '11%',
      hideOnMobile: true,
      cell: (d) => (
        <Badge tone={DOCUMENT_STATUS_TONE[d.status]} dot>
          {DOCUMENT_STATUS_LABELS[d.status]}
        </Badge>
      ),
    },
    {
      id: 'owner',
      header: 'Одговорни',
      width: '8%',
      align: 'center',
      cell: (d) => {
        const owner = getPerson(d.ownerId);
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
      id: 'updated',
      header: 'Измењено',
      width: '10%',
      cell: (d) => <span className="text-sm text-muted">{formatRelative(d.updated)}</span>,
    },
    {
      id: 'gates',
      header: 'Капије',
      width: '11%',
      mobileLabel: 'Обавезно за',
      cell: (d) =>
        d.requiredForGates.length > 0 ? (
          <span className="flex flex-wrap gap-1">
            {d.requiredForGates.map((g) => (
              <Badge key={g} variant="outline" size="sm" title={GATE_LABELS[g].full}>
                {GATE_LABELS[g].code}
              </Badge>
            ))}
          </span>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
  ];

  const gateOptions = GATES.filter((g) => gateCounts.has(g)).map((g) => ({ value: g, label: GATE_LABELS[g].code, count: gateCounts.get(g) }));

  return (
    <Card
      id="registar"
      title="Регистар докумената"
      subtitle={`${filtered.length === docs.length ? docs.length : `${filtered.length} од ${docs.length}`} докумената`}
      className="scroll-mt-20"
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <SearchInput value={query} onChange={setQuery} placeholder="Претражи документа…" className="sm:flex-1" />
          <div className="flex gap-2">
            <Select ariaLabel="Сортирање" size="md" value={sort} onChange={setSort} options={DOC_SORT_OPTIONS} className="min-w-0 flex-1 sm:w-60 sm:flex-none" />
            <Button
              variant="secondary"
              icon={SlidersHorizontal}
              onClick={() => setFiltersOpen((o) => !o)}
              aria-expanded={filtersOpen}
              className="shrink-0 md:hidden"
            >
              Филтери{activeCount > 0 ? ` · ${activeCount}` : ''}
            </Button>
          </div>
        </div>

        <div className={cn('flex-col gap-3', filtersOpen ? 'flex' : 'hidden', 'md:flex')}>
          <FilterGroup label="Статус">
            <FilterChips
              multiple
              wrap
              ariaLabel="Статус"
              value={status}
              onChange={setStatus}
              options={(['draft', 'review', 'approved', 'superseded'] as DocumentStatus[])
                .filter((s) => statusCounts.has(s))
                .map((s) => ({ value: s, label: DOCUMENT_STATUS_LABELS[s], count: statusCounts.get(s) }))}
            />
          </FilterGroup>
          <FilterGroup label="Капија">
            <FilterChips wrap ariaLabel="Обавезно за капију" value={gate} onChange={onGateChange} options={gateOptions} />
          </FilterGroup>
          <FilterGroup label="Врста">
            <FilterChips
              multiple
              wrap
              ariaLabel="Врста документа"
              value={types}
              onChange={setTypes}
              options={[...typeCounts.keys()].map((t) => ({ value: t, label: DOCUMENT_TYPE_LABELS[t], count: typeCounts.get(t) }))}
            />
          </FilterGroup>
          <FilterGroup label="Дисциплина">
            <FilterChips
              multiple
              wrap
              ariaLabel="Дисциплина"
              value={disciplines}
              onChange={setDisciplines}
              options={[...disciplineCounts.keys()].map((d) => ({ value: d, label: DISCIPLINE_LABELS[d], count: disciplineCounts.get(d) }))}
            />
          </FilterGroup>
        </div>

        {(activeCount > 0 || query) && (
          <div className="flex items-center justify-between gap-3 text-sm text-muted">
            <span>Приказано {filtered.length} од {docs.length}</span>
            <Button variant="ghost" size="sm" onClick={clear}>
              Очисти филтере
            </Button>
          </div>
        )}

        <DataList
          rows={visible}
          rowKey={(d) => d.id}
          caption="Документација пројекта"
          columns={columns}
          primaryColumn="title"
          selectedKey={selectedId ?? undefined}
          onRowClick={(d) => onOpen(d.id)}
          mobileAside={(d) => (
            <Badge tone={DOCUMENT_STATUS_TONE[d.status]} dot>
              {DOCUMENT_STATUS_LABELS[d.status]}
            </Badge>
          )}
          emptyText="Ниједан документ не одговара филтерима."
        />

        {isPhone && filtered.length > MOBILE_LIMIT && (
          <Button variant="secondary" fullWidth onClick={() => setShowAll((v) => !v)}>
            {limit < filtered.length ? `Прикажи још ${filtered.length - limit}` : 'Прикажи мање'}
          </Button>
        )}
      </div>
    </Card>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 md:flex-row md:items-start md:gap-3">
      <span className="text-xs font-medium text-muted md:w-20 md:shrink-0 md:pt-2.5">{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
