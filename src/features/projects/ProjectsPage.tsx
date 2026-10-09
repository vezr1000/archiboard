import { useMemo, useState, type ReactNode } from 'react';
import { SearchX, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { paths } from '@/components/layout/navigation';
import {
  Badge,
  Button,
  DataList,
  EmptyState,
  FilterChips,
  HealthBadge,
  PageHeader,
  PhasePill,
  SearchInput,
  Select,
  type DataColumn,
} from '@/components/ui';
import { getProjectKpi, projects } from '@/data';
import { GATE_LABELS, HEALTH_LABELS, PHASE_LABELS, PHASES, phaseIndex, SCHEME_LABELS, TYPOLOGY_LABELS } from '@/domain/labels';
import type { CertificationScheme, Health, Phase, Project } from '@/domain/types';
import { formatCertScore } from '@/lib/cert';
import { cn } from '@/lib/cn';
import { formatArea, formatDate, formatNumber, formatRelative } from '@/lib/format';
import { kpiStatus } from '@/lib/kpi';

type SortKey = 'naziv' | 'faza' | 'zdravlje' | 'kapija';

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'naziv', label: 'Назив' },
  { value: 'faza', label: 'Фаза' },
  { value: 'zdravlje', label: 'Здравље (најкритичнији први)' },
  { value: 'kapija', label: 'Следећа капија' },
];

const HEALTH_ORDER: Record<Health, number> = { 'off-track': 0, 'at-risk': 1, 'on-track': 2 };

const COMPARATORS: Record<SortKey, (a: Project, b: Project) => number> = {
  naziv: (a, b) => a.name.localeCompare(b.name, 'sr'),
  faza: (a, b) => phaseIndex(a.phase) - phaseIndex(b.phase) || a.name.localeCompare(b.name, 'sr'),
  zdravlje: (a, b) => HEALTH_ORDER[a.health] - HEALTH_ORDER[b.health] || a.nextGate.date.localeCompare(b.nextGate.date),
  kapija: (a, b) => a.nextGate.date.localeCompare(b.nextGate.date),
};

const countBy = <T extends string>(pick: (p: Project) => T, value: T) => projects.filter((p) => pick(p) === value).length;

const uniq = <T,>(list: T[]): T[] => [...new Set(list)];

/** `/projekti` — all projects with search, filters and sorting. */
export function ProjectsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [healths, setHealths] = useState<Health[]>([]);
  const [schemes, setSchemes] = useState<CertificationScheme[]>([]);
  const [sort, setSort] = useState<SortKey>('kapija');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilters = cities.length + phases.length + healths.length + schemes.length;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects
      .filter((p) => {
        if (cities.length && !cities.includes(p.city)) return false;
        if (phases.length && !phases.includes(p.phase)) return false;
        if (healths.length && !healths.includes(p.health)) return false;
        if (schemes.length && !schemes.includes(p.certification.scheme)) return false;
        if (!q) return true;
        return [p.name, p.shortName, p.city, p.address, p.client, p.typologyLabel, ...p.tags].join(' ').toLowerCase().includes(q);
      })
      .sort(COMPARATORS[sort]);
  }, [query, cities, phases, healths, schemes, sort]);

  const clearAll = () => {
    setQuery('');
    setCities([]);
    setPhases([]);
    setHealths([]);
    setSchemes([]);
  };

  const columns: DataColumn<Project>[] = [
    {
      id: 'name',
      header: 'Пројекат',
      width: '28%',
      cell: (p) => (
        <span className="block min-w-0">
          <span className="block">{p.name}</span>
          <span className="block text-xs font-normal text-muted">
            {p.city} · {TYPOLOGY_LABELS[p.typology]}
          </span>
        </span>
      ),
    },
    { id: 'phase', header: 'Фаза', cell: (p) => <PhasePill phase={p.phase} />, mobileLabel: 'Фаза' },
    { id: 'health', header: 'Здравље', cell: (p) => <HealthBadge health={p.health} />, hideOnMobile: true },
    {
      id: 'cert',
      header: 'Сертификација',
      mobileLabel: 'Сертификација',
      cell: (p) => {
        const c = p.certification;
        return (
          <span className="block">
            <span className="block">{c.scheme === 'none' ? 'Интерни скор' : `${SCHEME_LABELS[c.scheme]} ${c.targetLevel}`}</span>
            <span className="block text-xs text-muted">
              {formatCertScore(c.currentScore, c.scheme)} од {formatCertScore(c.targetScore, c.scheme)}
            </span>
          </span>
        );
      },
    },
    {
      id: 'carbon',
      header: 'Угљеник (A1–A3)',
      mobileLabel: 'Уграђени угљеник',
      cell: (p) => {
        const k = getProjectKpi(p.id, 'embodied-carbon');
        if (!k || !p.gfaM2) return <span className="text-muted">—</span>;
        const status = kpiStatus('lower-better', k.current, k.target);
        return (
          <span className="block">
            <span className={cn('tabular font-medium', status === 'pass' ? 'text-good' : status === 'warn' ? 'text-warn' : 'text-bad')}>
              {formatNumber(k.current, 0)}
            </span>
            <span className="text-muted"> / {formatNumber(k.target, 0)}</span>
            <span className="block text-xs text-muted">kgCO₂e/m²</span>
          </span>
        );
      },
    },
    {
      id: 'area',
      header: 'БРГП / површина',
      mobileLabel: 'БРГП / површина',
      align: 'right',
      cell: (p) =>
        p.gfaM2 ? (
          <span className="tabular">{formatArea(p.gfaM2)}</span>
        ) : (
          <span className="tabular">
            {formatArea(p.siteAreaM2 ?? 0, 'auto')} <span className="text-xs text-muted">парцела</span>
          </span>
        ),
    },
    {
      id: 'gate',
      header: 'Следећа капија',
      mobileLabel: 'Следећа капија',
      cell: (p) => (
        <span className="block">
          <span className="block">{GATE_LABELS[p.nextGate.gate].code} · {formatDate(p.nextGate.date, 'day-month')}</span>
          <span className="block text-xs text-muted">{formatRelative(p.nextGate.date)}</span>
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Портфолио"
        title="Пројекти"
        subtitle="Сви активни пројекти студија са фазом, здрављем и циљем сертификације."
      />

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_16rem]">
        <SearchInput value={query} onChange={setQuery} placeholder="Претражи по називу, граду, инвеститору…" />
        <Select ariaLabel="Сортирање" value={sort} onChange={setSort} options={SORT_OPTIONS.map((o) => ({ value: o.value, label: `Сортирај: ${o.label}` }))} />
      </div>

      <div className="mt-3 md:hidden">
        <Button
          variant="secondary"
          icon={SlidersHorizontal}
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
          aria-controls="project-filters"
        >
          Филтери{activeFilters > 0 ? ` (${activeFilters})` : ''}
        </Button>
      </div>

      <div id="project-filters" className={cn('mt-3 flex-col gap-3 md:flex', filtersOpen ? 'flex' : 'hidden')}>
        <FilterGroup label="Град">
          <FilterChips
            multiple
            wrap
            ariaLabel="Град"
            value={cities}
            onChange={setCities}
            options={uniq(projects.map((p) => p.city)).map((c) => ({ value: c, label: c, count: countBy((p) => p.city, c) }))}
          />
        </FilterGroup>
        <FilterGroup label="Фаза">
          <FilterChips
            multiple
            wrap
            ariaLabel="Фаза"
            value={phases}
            onChange={setPhases}
            options={PHASES.filter((ph) => projects.some((p) => p.phase === ph)).map((ph) => ({
              value: ph,
              label: PHASE_LABELS[ph].short,
              count: countBy((p) => p.phase, ph),
            }))}
          />
        </FilterGroup>
        <FilterGroup label="Здравље">
          <FilterChips
            multiple
            wrap
            ariaLabel="Здравље"
            value={healths}
            onChange={setHealths}
            options={(['on-track', 'at-risk', 'off-track'] as Health[]).map((h) => ({ value: h, label: HEALTH_LABELS[h].short, count: countBy((p) => p.health, h) }))}
          />
        </FilterGroup>
        <FilterGroup label="Сертификација">
          <FilterChips
            multiple
            wrap
            ariaLabel="Шема сертификације"
            value={schemes}
            onChange={setSchemes}
            options={uniq(projects.map((p) => p.certification.scheme)).map((s) => ({
              value: s,
              label: SCHEME_LABELS[s],
              count: countBy((p) => p.certification.scheme, s),
            }))}
          />
        </FilterGroup>
      </div>

      <div className="mt-5 mb-3 flex min-h-8 items-center justify-between gap-3 text-sm text-muted">
        <span aria-live="polite">
          Приказано: <span className="tabular font-medium text-ink">{rows.length}</span> од {projects.length}
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
            title="Нема пројеката који одговарају"
            description="Промените или уклоните неки од филтера, или проверите унети појам за претрагу."
            action={<Button onClick={clearAll}>Очисти филтере</Button>}
          />
        </div>
      ) : (
        <DataList
          caption="Пројекти студија"
          rows={rows}
          rowKey={(p) => p.id}
          columns={columns}
          onRowClick={(p) => navigate(paths.project(p.id))}
          mobileAside={(p) => <HealthBadge health={p.health} />}
        />
      )}

      <FeedbackWidget moduleId="projekti" />
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
