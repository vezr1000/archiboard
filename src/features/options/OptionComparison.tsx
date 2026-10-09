import { useMemo, useState } from 'react';
import { ChartColumn, Radar, SlidersHorizontal, Trash2 } from 'lucide-react';
import { GroupedBars, RadarChart } from '@/components/charts';
import { Badge, Button, Card, EmptyState, EnergyClassBadge, IconButton, Segmented, seriesColor } from '@/components/ui';
import { TONE_CLASSES } from '@/components/ui/tone';
import { CHECK_STATUS_TONE, OPTION_STATUS_LABELS, OPTION_STATUS_TONE } from '@/domain/labels';
import type { DesignOption, Project } from '@/domain/types';
import { formatCertScore } from '@/lib/cert';
import { cn } from '@/lib/cn';
import { formatNumber, formatPct, formatSigned } from '@/lib/format';
import { gapPct, kpiStatus } from '@/lib/kpi';
import { optionShortName, radarScore } from './optionsLogic';
import { projectTargets } from './useProjectModel';

interface OptionComparisonProps {
  project: Project;
  options: DesignOption[];
  /** Option currently loaded in the calculator. */
  activeId?: string;
  onLoad: (option: DesignOption) => void;
  onDelete: (option: DesignOption) => void;
}

/** „Поређење варијанти“: option cards (snap-scroll on phones, grid ≥768px) + comparison chart. */
export function OptionComparison({ project, options, activeId, onLoad, onDelete }: OptionComparisonProps) {
  // Phones start with the compact radar; ≥768px with the grouped bars.
  const [view, setView] = useState<'bars' | 'radar'>(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches ? 'radar' : 'bars',
  );
  const targets = projectTargets(project.id);
  // Colour follows the option (index in the full list), in bars and radar alike.
  const colorOf = (o: DesignOption) => seriesColor(options.indexOf(o));

  const radarOptions = useMemo(() => {
    const sel = options.filter((o) => o.status === 'selected');
    const user = options.filter((o) => o.isUserCreated).reverse();
    const rest = options.filter((o) => o.status !== 'selected' && !o.isUserCreated);
    return [...sel, ...user, ...rest].slice(0, 3);
  }, [options]);

  if (options.length === 0) {
    return (
      <EmptyState
        compact
        icon={ChartColumn}
        title="Још нема варијанти за поређење"
        description="Пројекат нема разрађене варијанте. Испробајте измене у калкулатору испод и сачувајте их као варијанту — појавиће се овде."
      />
    );
  }

  const scheme = project.certification.scheme;
  const code = (o: DesignOption) => o.code ?? '•';
  const radarAxes = [
    { id: 'ec', label: 'Угљеник', lower: true, get: (o: DesignOption) => o.results.embodiedCarbon },
    { id: 'qh', label: 'Енергија', lower: true, get: (o: DesignOption) => o.results.operationalEnergy },
    { id: 'cost', label: 'Трошак', lower: true, get: (o: DesignOption) => o.results.costDeltaPct },
    { id: 'cert', label: 'Сертификација', lower: false, get: (o: DesignOption) => o.results.certPoints },
    { id: 'dl', label: 'Дневно светло', lower: false, get: (o: DesignOption) => o.results.daylightPct },
    { id: 'dur', label: 'Трајање', lower: true, get: (o: DesignOption) => o.results.durationMonths },
  ];
  const radarValues = radarAxes.map((a) => radarScore(radarOptions.map(a.get), a.lower));

  return (
    <div className="flex flex-col gap-4">
      <ul
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 scrollbar-none md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-3"
        aria-label="Варијанте"
      >
        {options.map((o) => {
          const r = o.results;
          const tone = targets.carbon !== undefined ? CHECK_STATUS_TONE[kpiStatus('lower-better', r.embodiedCarbon, targets.carbon)] : 'neutral';
          const gap = targets.carbon !== undefined ? gapPct('lower-better', r.embodiedCarbon, targets.carbon) : undefined;
          const active = o.id === activeId;
          return (
            <li
              key={o.id}
              className={cn(
                'flex w-[84%] shrink-0 snap-start flex-col rounded-2xl border bg-surface p-4 sm:w-[62%] md:w-auto',
                o.status === 'selected' ? 'border-accent' : 'border-line',
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-full font-display text-lg font-semibold text-accent-ink"
                  style={{ background: colorOf(o) }}
                  aria-hidden
                >
                  {code(o)}
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="line-clamp-2 text-[0.95rem] leading-snug text-ink">{optionShortName(o)}</h4>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {o.isUserCreated ? (
                      <Badge tone="clay" size="sm">
                        Корисничка
                      </Badge>
                    ) : (
                      <Badge tone={OPTION_STATUS_TONE[o.status]} size="sm" dot>
                        {OPTION_STATUS_LABELS[o.status]}
                      </Badge>
                    )}
                    {active && (
                      <Badge tone="accent" variant="outline" size="sm">
                        у калкулатору
                      </Badge>
                    )}
                  </div>
                </div>
                {o.isUserCreated && <IconButton icon={Trash2} label={`Обриши ${o.name}`} size="sm" onClick={() => onDelete(o)} />}
              </div>

              <p className="mt-2 line-clamp-2 text-xs text-muted">{o.summary}</p>

              <div className="mt-3 rounded-xl bg-surface-2 px-3 py-2.5">
                <div className="text-[0.7rem] text-muted">Уграђени угљеник A1–A3</div>
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="tabular font-display text-2xl font-semibold text-ink">{formatNumber(r.embodiedCarbon, 0)}</span>
                  <span className="text-xs text-muted">kgCO₂e/m²</span>
                  {gap !== undefined && (
                    <span className={cn('tabular text-xs font-medium', TONE_CLASSES[tone].text)}>
                      {gap <= 0 ? `${formatPct(gap, { decimals: 0 })} од циља` : `${formatPct(gap, { signed: true, decimals: 0 })} изнад циља`}
                    </span>
                  )}
                </div>
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5 text-sm">
                <div className="min-w-0">
                  <dt className="text-[0.7rem] text-muted">Qh,nd</dt>
                  <dd className="flex items-center gap-1.5">
                    <span className="tabular text-ink">{formatNumber(r.operationalEnergy, 0)}</span>
                    <span className="text-xs text-muted">kWh/m²a</span>
                    <EnergyClassBadge value={r.energyClass} size="sm" />
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-[0.7rem] text-muted">Трошак</dt>
                  <dd className="tabular text-ink">{r.costDeltaPct === 0 ? 'основа' : formatPct(r.costDeltaPct, { signed: true, decimals: 1 })}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-[0.7rem] text-muted">Сертификација</dt>
                  <dd className="tabular text-ink">{scheme === 'none' ? formatNumber(r.certPoints, 0) : formatCertScore(r.certPoints, scheme)}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-[0.7rem] text-muted">Градња</dt>
                  <dd className="tabular text-ink">{formatNumber(r.durationMonths, 0)} мес.</dd>
                </div>
              </dl>

              <div className="mt-auto pt-4" />
              <Button
                variant={active ? 'ghost' : 'secondary'}
                size="sm"
                icon={SlidersHorizontal}
                fullWidth
                onClick={() => onLoad(o)}
              >
                Учитај у калкулатор
              </Button>
            </li>
          );
        })}
      </ul>

      {options.length >= 2 && (
        <Card
          title="Показатељи"
          subtitle={view === 'bars' ? 'Свака група има своју скалу' : 'Нормализовано: спољни руб = најбоља варијанта'}
          action={
            <Segmented
              ariaLabel="Приказ поређења"
              size="sm"
              value={view}
              onChange={setView}
              options={[
                { value: 'bars', label: 'Стубићи', icon: ChartColumn },
                { value: 'radar', label: 'Радар', icon: Radar },
              ]}
            />
          }
        >
          {view === 'bars' ? (
            <GroupedBars
              title="Поређење варијанти по показатељима"
              series={options.map((o) => ({ id: o.id, label: code(o), color: colorOf(o) }))}
              groups={[
                { id: 'ec', label: 'Уграђени угљеник', unit: 'kgCO₂e/m²', values: options.map((o) => o.results.embodiedCarbon), target: targets.carbon, direction: 'lower-better' },
                { id: 'qh', label: 'Енергија за грејање', unit: 'kWh/m²a', values: options.map((o) => o.results.operationalEnergy), target: targets.qh, direction: 'lower-better' },
                { id: 'cost', label: 'Трошак у односу на основу', unit: '%', values: options.map((o) => o.results.costDeltaPct), direction: 'lower-better', format: (v) => formatSigned(v, 1) },
                {
                  id: 'cert',
                  label: 'Сертификација',
                  unit: scheme === 'LEED' ? 'бод.' : '%',
                  values: options.map((o) => o.results.certPoints),
                  target: scheme === 'none' ? undefined : project.certification.targetScore,
                  direction: 'higher-better',
                },
                { id: 'dl', label: 'Дневно светло', unit: '%', values: options.map((o) => o.results.daylightPct), direction: 'higher-better' },
                { id: 'dur', label: 'Трајање градње', unit: 'мес.', values: options.map((o) => o.results.durationMonths), direction: 'lower-better' },
              ]}
            />
          ) : (
            <>
              <RadarChart
                title="Поређење варијанти — радар"
                axes={radarAxes.map((a) => ({ id: a.id, label: a.label }))}
                series={radarOptions.map((o, si) => ({ id: o.id, label: `${code(o)} ${optionShortName(o)}`, values: radarValues.map((vals) => vals[si]), color: colorOf(o) }))}
              />
              {options.length > 3 && <p className="mt-2 text-center text-xs text-muted">Радар приказује до три варијанте: изабрану и последње сачуване.</p>}
            </>
          )}
        </Card>
      )}
    </div>
  );
}
