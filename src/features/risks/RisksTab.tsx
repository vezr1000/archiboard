import { useMemo, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { HeatMap5x5 } from '@/components/charts';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { Badge, Button, Card, EmptyState, FilterChips, Select } from '@/components/ui';
import { risksForProject } from '@/data';
import { RISK_CATEGORY_LABELS, RISK_STATUS_LABELS } from '@/domain/labels';
import type { Project, RiskCategory, RiskStatus } from '@/domain/types';
import { useCurrentProject } from '@/features/project/useCurrentProject';
import { RiskList } from './RiskList';
import { RiskSheet } from './RiskSheet';
import { RISK_SORT_OPTIONS, RISK_ZONES, riskScore, riskZone, sortRisks, type RiskSort, type RiskZoneId } from './risksLogic';

/** `/projekti/:id/rizici` — 5×5 risk matrix and risk register (CONCEPT §6.10). */
export function RisksTab() {
  const project = useCurrentProject();
  return <RisksBody key={project.id} project={project} />;
}

const CATEGORIES: RiskCategory[] = ['regulatorni', 'tehnicki', 'troskovni', 'vremenski', 'klimatski', 'lanac-snabdevanja'];
const STATUSES: RiskStatus[] = ['open', 'mitigating', 'closed'];

function RisksBody({ project }: { project: Project }) {
  const risks = useMemo(() => risksForProject(project.id), [project.id]);
  const [cell, setCell] = useState<{ probability: number; impact: number } | null>(null);
  const [category, setCategory] = useState<RiskCategory | null>(null);
  const [status, setStatus] = useState<RiskStatus | null>(null);
  const [sort, setSort] = useState<RiskSort>('score');
  const [openId, setOpenId] = useState<string | null>(null);

  // Closed risks no longer count in the matrix.
  const active = useMemo(() => risks.filter((r) => r.status !== 'closed'), [risks]);
  const heatItems = useMemo(() => active.map((r) => ({ id: r.id, probability: r.probability, impact: r.impact, label: r.title })), [active]);

  const filtered = useMemo(
    () =>
      sortRisks(
        risks.filter(
          (r) =>
            (!cell || (r.probability === cell.probability && r.impact === cell.impact)) &&
            (!category || r.category === category) &&
            (!status || r.status === status),
        ),
        sort,
      ),
    [risks, cell, category, status, sort],
  );

  if (risks.length === 0) {
    return (
      <>
        <EmptyState icon={ShieldCheck} title="Регистар ризика је празан" description="За овај пројекат још нису унети ризици." />
        <FeedbackWidget moduleId="projekat-rizici" />
      </>
    );
  }

  const count = <K extends string>(pick: (r: (typeof risks)[number]) => K, v: K) => risks.filter((r) => pick(r) === v).length;
  const zoneCounts = Object.fromEntries(RISK_ZONES.map((z) => [z.id, 0])) as Record<RiskZoneId, number>;
  for (const r of active) zoneCounts[riskZone(riskScore(r)).id] += 1;
  const topScore = Math.max(0, ...active.map(riskScore));
  const filtering = cell !== null || category !== null || status !== null;
  const clear = () => {
    setCell(null);
    setCategory(null);
    setStatus(null);
  };
  const openRisk = risks.find((r) => r.id === openId) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <Card title="Матрица ризика" subtitle={`${active.length} отворених и ублажаваних · највећи резултат ${topScore}`}>
          <HeatMap5x5
            title="Матрица ризика: вероватноћа и утицај"
            items={heatItems}
            selected={cell}
            onCellClick={(c) => setCell((prev) => (prev && prev.probability === c.probability && prev.impact === c.impact ? null : c.items.length > 0 ? { probability: c.probability, impact: c.impact } : null))}
          />
          <ul className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1.5" aria-label="Зоне ризика">
            {RISK_ZONES.map((z) => (
              <li key={z.id} className="inline-flex items-center gap-1.5 text-xs text-muted">
                <Badge tone={z.tone} variant={z.solid ? 'solid' : 'soft'} size="sm">
                  {z.label}
                </Badge>
                {z.range}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-center text-xs text-muted">Додирните поље да филтрирате листу. Затворени ризици нису у матрици.</p>
        </Card>

        <Card title="Преглед по категоријама и статусу" subtitle={`${risks.length} ризика у регистру`}>
          <div className="flex flex-col gap-4">
            <div>
              <h4 className="mb-1.5 text-xs font-medium text-muted">Зоне (отворени и ублажавани ризици)</h4>
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Број ризика по зонама">
                {RISK_ZONES.map((z) => (
                  <li key={z.id} className="rounded-xl border border-line bg-surface-2/40 p-2.5">
                    <Badge tone={z.tone} variant={z.solid ? 'solid' : 'soft'} size="sm">
                      {z.label}
                    </Badge>
                    <div className="tabular mt-1.5 font-display text-2xl leading-none text-ink">{zoneCounts[z.id]}</div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-1.5 text-xs font-medium text-muted">Категорија</h4>
              <FilterChips
                wrap
                ariaLabel="Категорија ризика"
                value={category}
                onChange={setCategory}
                options={CATEGORIES.map((c) => ({ value: c, label: RISK_CATEGORY_LABELS[c], count: count((r) => r.category, c) })).filter((o) => o.count > 0)}
              />
            </div>
            <div>
              <h4 className="mb-1.5 text-xs font-medium text-muted">Статус</h4>
              <FilterChips
                wrap
                ariaLabel="Статус ризика"
                value={status}
                onChange={setStatus}
                options={STATUSES.map((s) => ({ value: s, label: RISK_STATUS_LABELS[s], count: count((r) => r.status, s) })).filter((o) => o.count > 0)}
              />
            </div>
          </div>
        </Card>
      </div>

      <Card
        title="Регистар ризика"
        subtitle={filtering ? `${filtered.length} од ${risks.length} ризика` : `${risks.length} ризика · резултат = вероватноћа × утицај`}
      >
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-muted">
          <Select ariaLabel="Сортирање ризика" value={sort} onChange={setSort} options={RISK_SORT_OPTIONS} className="w-full sm:w-56" />
          {filtering && (
            <>
            {cell && (
              <Badge tone="neutral" variant="outline">
                В {cell.probability} × У {cell.impact}
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clear}>
              Очисти филтере
            </Button>
            </>
          )}
        </div>
        <RiskList risks={filtered} selectedId={openId} onOpen={setOpenId} />
      </Card>

      <FeedbackWidget moduleId="projekat-rizici" className="mt-2!" />
      <RiskSheet risk={openRisk} onClose={() => setOpenId(null)} />
    </div>
  );
}
