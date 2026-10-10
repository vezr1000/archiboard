import { useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { SearchX } from 'lucide-react';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { Button, EmptyState, FilterChips, PageHeader, SearchInput, SectionHeader, Select } from '@/components/ui';
import { projects, regulations } from '@/data';
import type { Jurisdiction, RegulationKind } from '@/domain/types';
import { AskCard } from './AskCard';
import { RegulationCard } from './RegulationCard';
import { appliesToProjects, JURISDICTION_CHIP_LABELS, JURISDICTION_ORDER, KIND_CHIP_LABELS, KIND_ORDER, matchesQuery, sortLibrary } from './guidelinesLogic';

const ALL_PROJECTS = '';
const PROJECT_OPTIONS = [
  { value: ALL_PROJECTS, label: 'Важи за: сви пројекти' },
  ...projects.map((p) => ({ value: p.id, label: `Важи за: ${p.shortName}` })),
];

const KIND_OPTIONS = KIND_ORDER.map((k) => ({ value: k, label: KIND_CHIP_LABELS[k], count: regulations.filter((r) => r.kind === k).length }));
const JURISDICTION_OPTIONS = JURISDICTION_ORDER.map((j) => ({
  value: j,
  label: JURISDICTION_CHIP_LABELS[j],
  count: regulations.filter((r) => r.jurisdiction === j).length,
}));

/**
 * `/smernice` — knowledge library (laws, rulebooks, standards, EU, certification schemes, firm guidelines) with search,
 * filters and the ★ „Питај АрхиБорд“ scripted Q&A (CONCEPT §6.14). Filters live in the URL: `?q=`, `?vrsta=`, `?nadleznost=`, `?projekat=`.
 */
export function GuidelinesPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const kinds = (params.get('vrsta') ?? '').split(',').filter((k): k is RegulationKind => KIND_ORDER.includes(k as RegulationKind));
  const jurisdictions = (params.get('nadleznost') ?? '')
    .split(',')
    .filter((j): j is Jurisdiction => JURISDICTION_ORDER.includes(j as Jurisdiction));
  const projectId = projects.some((p) => p.id === params.get('projekat')) ? (params.get('projekat') as string) : ALL_PROJECTS;

  const update = (key: string, value: string) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  };

  const rows = useMemo(
    () =>
      sortLibrary(
        regulations.filter((r) => {
          if (kinds.length && !kinds.includes(r.kind)) return false;
          if (jurisdictions.length && !jurisdictions.includes(r.jurisdiction)) return false;
          if (projectId && !appliesToProjects(r).some((p) => p.id === projectId)) return false;
          return matchesQuery(r, query);
        }),
      ),
    [params],
  );

  const activeFilters = kinds.length + jurisdictions.length + (projectId ? 1 : 0) + (query ? 1 : 0);
  const clearAll = () => setParams({}, { replace: true });
  const firmCount = rows.filter((r) => r.kind === 'smernica-firme').length;

  return (
    <>
      <PageHeader
        eyebrow="Библиотека знања"
        title="Смернице и прописи"
        subtitle="Закони, правилници, стандарди, сертификациони системи и смернице Студија Градина на једном месту — са везом на услове и налазе у пројектима."
      />

      <AskCard />

      <section aria-labelledby="biblioteka" className="mt-8 md:mt-10">
        <SectionHeader
          title={<span id="biblioteka">Библиотека</span>}
          subtitle={`${regulations.length} докумената, од тога ${regulations.filter((r) => r.kind === 'smernica-firme').length} смерница фирме`}
        />

        <div className="mt-3 flex min-w-0 flex-col gap-3">
          <div className="grid min-w-0 gap-2 md:grid-cols-[minmax(0,1fr)_14rem]">
            <SearchInput value={query} onChange={(v) => update('q', v)} placeholder="Претражи библиотеку…" />
            <Select ariaLabel="Важи за пројекат" value={projectId} onChange={(v) => update('projekat', v)} options={PROJECT_OPTIONS} />
          </div>
          <FilterChips multiple ariaLabel="Врста документа" options={KIND_OPTIONS} value={kinds} onChange={(v) => update('vrsta', v.join(','))} />
          <FilterChips
            multiple
            ariaLabel="Надлежност"
            options={JURISDICTION_OPTIONS}
            value={jurisdictions}
            onChange={(v) => update('nadleznost', v.join(','))}
          />
        </div>

        <div className="mt-4 flex min-h-9 flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted" aria-live="polite">
            Приказано <span className="tabular font-medium text-ink">{rows.length}</span> од {regulations.length}
            {firmCount > 0 && activeFilters > 0 ? ` · смерница фирме: ${firmCount}` : ''}
          </p>
          {activeFilters > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Очисти филтере
            </Button>
          )}
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="Нема резултата"
            description="Покушајте са другом речи или уклоните неки од филтера."
            action={
              <Button variant="secondary" onClick={clearAll}>
                Очисти филтере
              </Button>
            }
          />
        ) : (
          <ul className="mt-2 grid gap-3 md:grid-cols-2 md:gap-4">
            {rows.map((r) => (
              <li key={r.id} className="min-w-0">
                <RegulationCard entry={r} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <FeedbackWidget moduleId="smernice" />
    </>
  );
}
