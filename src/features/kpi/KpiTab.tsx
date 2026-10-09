import { useState } from 'react';
import { StackedBar, type StackSegment } from '@/components/charts';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { Callout, Card, EmptyState, Segmented } from '@/components/ui';
import { kpisForProject } from '@/data';
import { AMBITION_LEVELS } from '@/domain/labels';
import { useCurrentProject } from '@/features/project/useCurrentProject';
import { gapPct } from '@/lib/kpi';
import { KpiCard, KPI_STATUS_LABEL, statusOf } from './KpiCard';
import { ambitionBenchmark, BENCHMARK_LONG, orderKpis, type AmbitionId } from './kpiLogic';

const LEVEL_HINT: Record<AmbitionId, string> = {
  minimum: 'прописани минимум (где га нема — праг EU таксономије)',
  'dobra-praksa': 'циљ фирме',
  predvodnik: 'најбоља пракса',
};

/**
 * `/projekti/:id/ciljevi` — KPIs against project target and benchmarks (CONCEPT §6.4).
 * Mobile: one column. ≥768px: KPI cards in two columns.
 */
export function KpiTab() {
  const project = useCurrentProject();
  const [level, setLevel] = useState<AmbitionId>('dobra-praksa');
  const items = orderKpis(project, kpisForProject(project.id));

  if (items.length === 0) {
    return (
      <>
        <EmptyState title="Показатељи још нису дефинисани" description="За овај пројекат нема унетих KPI вредности." />
        <FeedbackWidget moduleId="projekat-ciljevi" />
      </>
    );
  }

  const counts = { pass: 0, warn: 0, fail: 0 };
  for (const { def, kpi } of items) counts[statusOf(def, kpi)]++;
  const segments: StackSegment[] = [
    { id: 'pass', label: KPI_STATUS_LABEL.pass, value: counts.pass, tone: 'good' },
    { id: 'warn', label: KPI_STATUS_LABEL.warn, value: counts.warn, tone: 'warn' },
    { id: 'fail', label: KPI_STATUS_LABEL.fail, value: counts.fail, tone: 'bad' },
  ];

  // How many KPIs meet the benchmark of the selected ambition level (only KPIs that have one).
  const withBench = items.flatMap(({ def, kpi }) => {
    const b = ambitionBenchmark(project, def, level);
    return b ? [gapPct(def.direction, kpi.current, b.value) <= 0] : [];
  });
  const meeting = withBench.filter(Boolean).length;
  const levelLabel = AMBITION_LEVELS.find((l) => l.id === level)?.label ?? '';

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <Card>
        <div className="grid gap-5 md:grid-cols-2 md:gap-8">
          <div className="min-w-0">
            <h3 className="font-display text-lg text-ink">Ниво амбиције</h3>
            <Segmented
              ariaLabel="Ниво амбиције"
              fullWidth
              className="mt-2.5"
              value={level}
              onChange={setLevel}
              options={AMBITION_LEVELS.map((l) => ({ value: l.id, label: l.label }))}
            />
            <p className="mt-2.5 text-sm text-muted">
              Бира мерило које се на графиконима црта као тачкаста линија поређења: {LEVEL_HINT[level]}. Циљ пројекта се увек приказује.
            </p>
            <p className="mt-2 text-sm text-ink">
              {withBench.length === 0 ? (
                'За овај пројекат мерила нису упоредива.'
              ) : (
                <>
                  Мерило „{levelLabel}“ испуњава <span className="tabular font-semibold">{meeting}</span> од{' '}
                  <span className="tabular font-semibold">{withBench.length}</span> показатеља са дефинисаним мерилом
                  {level === 'minimum' && ` (${BENCHMARK_LONG.regulatoryMin})`}.
                </>
              )}
            </p>
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-lg text-ink">Стање према циљу пројекта</h3>
            <p className="mt-0.5 mb-3 text-sm text-muted">
              <span className="tabular font-semibold text-ink">{counts.pass}</span> од <span className="tabular">{items.length}</span> показатеља испуњава циљ
              {counts.warn + counts.fail > 0 && ` · ${counts.warn} у ризику · ${counts.fail} ван циља`}
            </p>
            <StackedBar title="Показатељи по статусу" total={items.length} height="lg" legendValues segments={segments.filter((s) => s.value > 0)} />
          </div>
        </div>
      </Card>

      {project.gfaM2 === undefined && (
        <Callout tone="info" title="Показатељи за јавни простор">
          Парк се не мери по m² БРГП: приоритет су задржавање атмосферских вода, фактор биотопа и зелене површине. Мерила фирме и прописа за зграде овде
          нису упоредива, па се користи циљ пројекта.
        </Callout>
      )}

      <ul className="grid gap-4 md:grid-cols-2 md:gap-6">
        {items.map(({ def, kpi }) => (
          <li key={def.id} className="min-w-0">
            <KpiCard project={project} def={def} kpi={kpi} level={level} />
          </li>
        ))}
      </ul>

      <Callout tone="info" title="Одакле су мерила">
        <ul className="mt-1 flex list-disc flex-col gap-1 pl-4">
          <li>
            <span className="font-medium">Пропис</span> — захтеви Правилника о енергетској ефикасности зграда (нпр. најмање разред C за нове зграде и највећа
            дозвољена потребна енергија за грејање) и типичне вредности из урбанистичких планова. За уграђени угљеник у Србији још не постоји гранична вредност.
          </li>
          <li>
            <span className="font-medium">EU таксономија</span> — критеријуми за ублажавање климатских промена код нових зграда (примарна енергија најмање 10 %
            испод nZEB захтева). Док Србија не објави нумеричке nZEB вредности, користи се интерна референца фирме.
          </li>
          <li>
            <span className="font-medium">Циљ фирме</span> — интерни стандард Студија Градина; ниво „добра пракса“.
          </li>
          <li>
            <span className="font-medium">Најбоља пракса</span> — оријентир за ниво „предводник“, интерно одређен на основу водећих пројеката и међународних
            оквира; није обавезан.
          </li>
        </ul>
        <p className="mt-2 text-muted">Циљ пројекта се утврђује на капијама и може бити строжи или блажи од мерила фирме.</p>
      </Callout>

      <FeedbackWidget moduleId="projekat-ciljevi" />
    </div>
  );
}
