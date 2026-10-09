import { useMemo, useState, type ReactNode } from 'react';
import { Leaf, SearchX, SlidersHorizontal } from 'lucide-react';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import {
  Badge,
  Button,
  Callout,
  DataList,
  EmptyState,
  FilterChips,
  PageHeader,
  RangeBar,
  SearchInput,
  Select,
  type DataColumn,
} from '@/components/ui';
import { materials, usageForMaterial } from '@/data';
import { MATERIAL_CATEGORY_LABELS, REUSE_POTENTIAL_LABELS, REUSE_POTENTIAL_TONE } from '@/domain/labels';
import type { Material, MaterialCategory, ReusePotential } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatNumber, formatPct } from '@/lib/format';
import { MaterialSheet } from './MaterialSheet';
import { formatKm, formatGwp, gwpRange, gwpUnit, ORIGIN_LABELS, originRegion, projectsCount, type OriginRegion } from './materialsLogic';

type SortKey = 'kategorija' | 'gwp-asc' | 'gwp-desc' | 'naziv' | 'udaljenost';

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'kategorija', label: 'Категорија' },
  { value: 'gwp-asc', label: 'GWP (од најнижег)' },
  { value: 'gwp-desc', label: 'GWP (од највишег)' },
  { value: 'naziv', label: 'Назив' },
  { value: 'udaljenost', label: 'Удаљеност (од најближег)' },
];

const CATEGORY_ORDER = Object.keys(MATERIAL_CATEGORY_LABELS) as MaterialCategory[];
const byName = (a: Material, b: Material) => a.name.localeCompare(b.name, 'sr');

const COMPARATORS: Record<SortKey, (a: Material, b: Material) => number> = {
  kategorija: (a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) || byName(a, b),
  'gwp-asc': (a, b) => a.gwpA1A3 - b.gwpA1A3 || byName(a, b),
  'gwp-desc': (a, b) => b.gwpA1A3 - a.gwpA1A3 || byName(a, b),
  naziv: byName,
  udaljenost: (a, b) => a.distanceKm - b.distanceKm || byName(a, b),
};

/** `/materijali` — global EPD library with search, filters, sorting and a detail sheet (CONCEPT §6.7). */
export function MaterialsLibraryPage() {
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [reuse, setReuse] = useState<ReusePotential[]>([]);
  const [origins, setOrigins] = useState<OriginRegion[]>([]);
  const [bioOnly, setBioOnly] = useState<Array<'bio'>>([]);
  const [sort, setSort] = useState<SortKey>('kategorija');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sheetId, setSheetId] = useState<string | null>(null);

  // Static per-material facts, computed once.
  const meta = useMemo(
    () =>
      new Map(
        materials.map((m) => [m.id, { range: gwpRange(m, materials), projects: usageForMaterial(m.id).length, origin: originRegion(m) }] as const),
      ),
    [],
  );

  const activeFilters = categories.length + reuse.length + origins.length + bioOnly.length;
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return materials
      .filter((m) => {
        if (categories.length && !categories.includes(m.category)) return false;
        if (reuse.length && !reuse.includes(m.reusePotential)) return false;
        if (origins.length && !origins.includes(meta.get(m.id)!.origin)) return false;
        if (bioOnly.length && !m.bioBased) return false;
        if (!q) return true;
        return [m.name, MATERIAL_CATEGORY_LABELS[m.category], m.epdSource, m.supplier ?? '', m.originCity].join(' ').toLowerCase().includes(q);
      })
      .sort(COMPARATORS[sort]);
  }, [query, categories, reuse, origins, bioOnly, sort, meta]);

  const clearAll = () => {
    setQuery('');
    setCategories([]);
    setReuse([]);
    setOrigins([]);
    setBioOnly([]);
  };
  const count = (pick: (m: Material) => string, value: string) => materials.filter((m) => pick(m) === value).length;

  const columns: DataColumn<Material>[] = [
    {
      id: 'name',
      header: 'Материјал',
      width: '26%',
      cell: (m) => (
        <span className="block min-w-0">
          <span className="block">{m.name}</span>
          <span className="block text-xs font-normal text-muted">{MATERIAL_CATEGORY_LABELS[m.category]}</span>
        </span>
      ),
    },
    {
      id: 'gwp',
      header: 'GWP A1–A3',
      width: '15%',
      mobileLabel: 'GWP A1–A3 (у оквиру категорије)',
      cell: (m) => {
        const r = meta.get(m.id)!.range;
        return (
          <span className="block min-w-0">
            <span className="tabular block font-medium">{formatGwp(m)}</span>
            <RangeBar
              className="mt-1.5 max-w-40"
              value={m.gwpA1A3}
              min={r.min}
              max={r.max}
              ariaLabel={`GWP у односу на остале (${MATERIAL_CATEGORY_LABELS[m.category]}, ${gwpUnit(m)}): од ${formatNumber(r.min)} до ${formatNumber(r.max)}`}
            />
          </span>
        );
      },
    },
    {
      id: 'epd',
      header: 'EPD извор и добављач',
      width: '20%',
      cell: (m) => (
        <span className="block min-w-0">
          <span className="block text-sm">{m.epdSource}</span>
          {m.supplier && <span className="block text-xs text-muted">{m.supplier}</span>}
        </span>
      ),
    },
    {
      id: 'origin',
      header: 'Порекло',
      cell: (m) => (
        <span className="block min-w-0">
          <span className="block">{m.originCity}</span>
          <span className="tabular block text-xs text-muted">{formatKm(m.distanceKm)}</span>
        </span>
      ),
    },
    { id: 'recycled', header: 'Рец.', align: 'right', mobileLabel: 'Рециклирани садржај', cell: (m) => <span className="tabular">{formatPct(m.recycledPct, { decimals: 0 })}</span> },
    {
      id: 'reuse',
      header: 'Поновна употреба',
      mobileLabel: 'Поновна употреба',
      cell: (m) => (
        <span className="inline-flex flex-wrap gap-1">
          <Badge size="sm" tone={REUSE_POTENTIAL_TONE[m.reusePotential]}>
            {REUSE_POTENTIAL_LABELS[m.reusePotential]}
          </Badge>
          {m.bioBased && (
            <Badge size="sm" tone="good" icon={Leaf}>
              био
            </Badge>
          )}
        </span>
      ),
    },
    {
      id: 'usage',
      header: 'Пројекти',
      align: 'right',
      mobileLabel: 'Користи се у',
      cell: (m) => {
        const n = meta.get(m.id)!.projects;
        return n > 0 ? <span className="tabular whitespace-nowrap">{projectsCount(n)}</span> : <span className="whitespace-nowrap text-muted">није у пасошу</span>;
      },
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Материјали"
        title="EPD библиотека"
        subtitle="Материјали са еколошким декларацијама (EPD), пореклом и потенцијалом поновне употребе."
      />

      <Callout tone="info" title="Шта је EPD?" className="mb-4">
        EPD (Environmental Product Declaration) је верификована еколошка декларација производа по стандарду EN 15804. Садржи GWP — потенцијал
        глобалног загревања у kgCO₂e по декларисаној јединици — за модуле A1–A3 (производња). Вредности у библиотеци су демо подаци; произвођачи и
        добављачи су измишљени.
      </Callout>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_16rem]">
        <SearchInput value={query} onChange={setQuery} placeholder="Претражи материјале, добављаче, порекло…" />
        <Select ariaLabel="Сортирање" value={sort} onChange={setSort} options={SORT_OPTIONS.map((o) => ({ value: o.value, label: `Сортирај: ${o.label}` }))} />
      </div>

      <div className="mt-3 md:hidden">
        <Button variant="secondary" icon={SlidersHorizontal} onClick={() => setFiltersOpen((v) => !v)} aria-expanded={filtersOpen} aria-controls="material-filters">
          Филтери{activeFilters > 0 ? ` (${activeFilters})` : ''}
        </Button>
      </div>

      <div id="material-filters" className={cn('mt-3 flex-col gap-3 md:flex', filtersOpen ? 'flex' : 'hidden')}>
        <FilterGroup label="Категорија">
          <FilterChips
            multiple
            wrap
            ariaLabel="Категорија материјала"
            value={categories}
            onChange={setCategories}
            options={CATEGORY_ORDER.filter((c) => materials.some((m) => m.category === c)).map((c) => ({
              value: c,
              label: MATERIAL_CATEGORY_LABELS[c],
              count: count((m) => m.category, c),
            }))}
          />
        </FilterGroup>
        <FilterGroup label="Поновна употреба">
          <FilterChips
            multiple
            wrap
            ariaLabel="Потенцијал поновне употребе"
            value={reuse}
            onChange={setReuse}
            options={(['high', 'medium', 'low'] as ReusePotential[]).map((v) => ({ value: v, label: REUSE_POTENTIAL_LABELS[v], count: count((m) => m.reusePotential, v) }))}
          />
        </FilterGroup>
        <FilterGroup label="Порекло">
          <FilterChips
            multiple
            wrap
            ariaLabel="Порекло материјала"
            value={origins}
            onChange={setOrigins}
            options={(Object.keys(ORIGIN_LABELS) as OriginRegion[]).map((o) => ({
              value: o,
              label: ORIGIN_LABELS[o],
              count: materials.filter((m) => meta.get(m.id)!.origin === o).length,
            }))}
          />
        </FilterGroup>
        <FilterGroup label="Својства">
          <FilterChips
            multiple
            wrap
            ariaLabel="Својства"
            value={bioOnly}
            onChange={setBioOnly}
            options={[{ value: 'bio' as const, label: 'Биобазирани', count: materials.filter((m) => m.bioBased).length }]}
          />
        </FilterGroup>
      </div>

      <div className="mt-5 mb-3 flex min-h-8 items-center justify-between gap-3 text-sm text-muted">
        <span aria-live="polite">
          Приказано: <span className="tabular font-medium text-ink">{rows.length}</span> од {materials.length}
          {activeFilters > 0 && (
            <Badge tone="accent" size="sm" className="ml-2">
              {activeFilters} филтера
            </Badge>
          )}
        </span>
        {(activeFilters > 0 || query) && (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            Очисти све
          </Button>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface">
          <EmptyState
            icon={SearchX}
            title="Нема материјала који одговарају"
            description="Промените или уклоните неки од филтера, или проверите унети појам за претрагу."
            action={<Button onClick={clearAll}>Очисти филтере</Button>}
          />
        </div>
      ) : (
        <DataList
          caption="EPD библиотека"
          rows={rows}
          rowKey={(m) => m.id}
          columns={columns}
          onRowClick={(m) => setSheetId(m.id)}
          groupBy={sort === 'kategorija' ? (m) => m.category : undefined}
          groupHeader={(key, group) => (
            <span className="flex items-baseline justify-between gap-3">
              <span>{MATERIAL_CATEGORY_LABELS[key as MaterialCategory]}</span>
              <span className="tabular font-normal text-muted">{formatNumber(group.length, 0)}</span>
            </span>
          )}
        />
      )}
      <p className="mt-2 text-xs text-muted">
        Трака „GWP A1–A3“ показује положај материјала између најнижег и највишег GWP у истој категорији и са истом декларисаном јединицом.
      </p>

      <FeedbackWidget moduleId="materijali" />
      <MaterialSheet materialId={sheetId} onChange={setSheetId} />
    </>
  );
}

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 md:flex-row md:items-center md:gap-3">
      <span className="w-28 shrink-0 text-xs font-medium text-muted">{label}</span>
      {children}
    </div>
  );
}
