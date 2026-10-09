import { ArrowRight, Info } from 'lucide-react';
import { BenchmarkScale, LineBand } from '@/components/charts';
import { Badge, Card, Stat } from '@/components/ui';
import { TONE_CLASSES } from '@/components/ui/tone';
import { CHECK_STATUS_TONE, ENERGY_CLASSES, ENERGY_CLASS_SCALE, energyClassFromScale, energyClassTone, PHASE_LABELS } from '@/domain/labels';
import type { CheckStatus, EnergyClass, KpiDefinition, Project, ProjectKpi } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';
import { gapPct, kpiStatus } from '@/lib/kpi';
import { ambitionBenchmark, benchmarkList, BENCHMARK_LONG, benchmarksComparable, type AmbitionId } from './kpiLogic';

export const KPI_STATUS_LABEL: Record<CheckStatus, string> = { pass: 'Испуњено', warn: 'Ризик', fail: 'Ван циља' };

/** Project status of a KPI against its own target. */
export const statusOf = (def: KpiDefinition, kpi: ProjectKpi): CheckStatus => kpi.status ?? kpiStatus(def.direction, kpi.current, kpi.target);

/* ------------------------------------------------------------------------------------------------ */

/** A+ … G badge row: current and target class highlighted, class colours go from good via warn to bad. */
function EnergyClassScale({ kpi, benchmarkClass, className }: { kpi: ProjectKpi; benchmarkClass?: EnergyClass; className?: string }) {
  const current = energyClassFromScale(kpi.current);
  const target = energyClassFromScale(kpi.target);
  return (
    <div className={className}>
      <ul className="grid grid-cols-8 gap-1" aria-label={`Енергетски разред: тренутно ${current}, циљ ${target}`}>
        {ENERGY_CLASSES.map((c) => {
          const tone = energyClassTone(c);
          const isCurrent = c === current;
          const isTarget = c === target;
          const caps = [isCurrent && 'сада', isTarget && 'циљ', c === benchmarkClass && 'ниво'].filter(Boolean) as string[];
          return (
            <li key={c} className="min-w-0 text-center">
              <div
                className={cn(
                  'flex h-9 items-center justify-center rounded-lg text-sm font-semibold',
                  isCurrent ? TONE_CLASSES[tone].solid : cn(TONE_CLASSES[tone].soft, 'opacity-80'),
                  isTarget && 'ring-2 ring-ink ring-offset-2 ring-offset-surface',
                  c === benchmarkClass && !isTarget && 'ring-2 ring-clay ring-offset-2 ring-offset-surface',
                )}
              >
                {c}
              </div>
              <div className="mt-1.5 flex min-h-8 flex-col items-center text-[0.65rem] leading-3.5 text-muted">
                {caps.map((cap) => (
                  <span key={cap} className={cn(cap === 'сада' && 'font-semibold text-ink')}>
                    {cap}
                  </span>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** One line comparing the current value with the benchmark of the selected ambition level. */
function AmbitionLine({ project, def, kpi, level }: { project: Project; def: KpiDefinition; kpi: ProjectKpi; level: AmbitionId }) {
  const bench = ambitionBenchmark(project, def, level);
  if (!bench) {
    return (
      <p className="text-xs text-muted">
        {benchmarksComparable(project, def.id)
          ? 'За овај ниво амбиције мерило није дефинисано.'
          : 'Мерила фирме важе за зграде; овде се користи само циљ пројекта.'}
      </p>
    );
  }
  const isClass = def.id === 'energy-class';
  const gap = gapPct(def.direction, kpi.current, bench.value);
  const tone = gap <= 0 ? 'good' : gap <= 10 ? 'warn' : 'bad';
  const fmt = (v: number) => formatNumber(v, def.decimals);
  let text: string;
  if (isClass) {
    const diff = ENERGY_CLASS_SCALE[energyClassFromScale(bench.value)] - ENERGY_CLASS_SCALE[energyClassFromScale(kpi.current)];
    text = diff === 0 ? 'исти разред' : diff > 0 ? `${diff} ${diff === 1 ? 'разред' : 'разреда'} бољи` : `${-diff} ${diff === -1 ? 'разред' : 'разреда'} лошији`;
  } else {
    const rel = formatNumber(Math.abs(gap), Math.abs(gap) < 10 ? 1 : 0);
    text = gap <= 0 ? `${rel} % боље од мерила` : `${rel} % лошије од мерила`;
  }
  return (
    <p className="text-xs text-muted">
      <span className="text-ink">Према мерилу {BENCHMARK_LONG[bench.key]}</span> (
      <span className="tabular">{isClass ? energyClassFromScale(bench.value) : `${fmt(bench.value)}${def.unit ? ` ${def.unit}` : ''}`}</span>
      ): <span className={cn('font-medium', TONE_CLASSES[tone].text)}>{gap <= 0 && !isClass ? 'испуњено' : ''}{gap <= 0 && !isClass ? ' · ' : ''}{text}</span>
    </p>
  );
}

/** Line chart of the value across phases, or the „нема историје“ state. */
function History({ project, def, kpi, level }: { project: Project; def: KpiDefinition; kpi: ProjectKpi; level: AmbitionId }) {
  const fmt = (v: number) => formatNumber(v, def.decimals);
  const bench = ambitionBenchmark(project, def, level);
  const best = benchmarksComparable(project, def.id) ? def.benchmarks.bestPractice : undefined;

  if (kpi.history.length < 2) {
    const only = kpi.history[0];
    return (
      <div className="flex min-h-28 flex-col items-center justify-center rounded-xl border border-dashed border-line-strong bg-surface-2/40 px-4 py-5 text-center">
        <p className="text-sm font-medium text-ink">Нема историје</p>
        <p className="mt-1 max-w-xs text-xs text-muted">
          {only ? `Постоји само једна процена (${PHASE_LABELS[only.phase].short}). ` : ''}Кретање кроз фазе постаје видљиво када пројекат пређе у следећу фазу.
        </p>
      </div>
    );
  }

  if (def.id === 'energy-class') {
    return (
      <div>
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-2" aria-label="Енергетски разред по фазама">
          {kpi.history.map((h, i) => {
            const c = energyClassFromScale(h.value);
            return (
              <li key={`${h.phase}-${i}`} className="flex items-center gap-1.5">
                {i > 0 && <ArrowRight className="size-3.5 text-muted" aria-hidden />}
                <span className="flex flex-col items-center gap-0.5">
                  <Badge tone={energyClassTone(c)} size="md">{c}</Badge>
                  <span className="text-[0.68rem] text-muted">{PHASE_LABELS[h.phase].short}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  const lowerBetter = def.direction === 'lower-better';
  const betterBest = best !== undefined && (lowerBetter ? best < kpi.target : best > kpi.target);
  let edge = betterBest ? (best as number) : kpi.target * (lowerBetter ? 0.85 : 1.15);
  if (def.unit === '%') edge = Math.min(100, edge);
  if (def.id === 'biotope-factor') edge = Math.min(1, edge);
  const band = lowerBetter ? { from: edge, to: kpi.target } : { from: kpi.target, to: edge };

  return (
    <LineBand
      title={def.shortLabel}
      unit={def.unit || undefined}
      format={fmt}
      target={kpi.target}
      band={{ ...band, label: betterBest ? 'Од циља до најбоље праксе' : 'Боље од циља' }}
      reference={bench ? { value: bench.value, label: `Мерило: ${bench.label}` } : undefined}
      direction={def.direction}
      points={kpi.history.map((h) => ({ label: PHASE_LABELS[h.phase].short, value: h.value }))}
    />
  );
}

/* ------------------------------------------------------------------------------------------------ */

export function KpiCard({ project, def, kpi, level }: { project: Project; def: KpiDefinition; kpi: ProjectKpi; level: AmbitionId }) {
  const status = statusOf(def, kpi);
  const tone = CHECK_STATUS_TONE[status];
  const isClass = def.id === 'energy-class';
  const fmt = (v: number) => formatNumber(v, def.decimals);
  const delta = kpi.target === 0 ? 0 : ((kpi.current - kpi.target) / Math.abs(kpi.target)) * 100;
  const unit = def.unit || undefined;
  const marks = benchmarkList(project, def);
  const bench = ambitionBenchmark(project, def, level);
  const comparable = benchmarksComparable(project, def.id);

  return (
    <Card as="article" className="flex flex-col gap-4" aria-label={def.label}>
      <header className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-lg leading-snug text-ink">{def.label}</h3>
          <p className="mt-0.5 text-xs text-muted">
            {def.unit ? `${def.unit} · ` : ''}
            {def.direction === 'lower-better' ? 'мање је боље' : 'више је боље'}
          </p>
        </div>
        <Badge tone={tone} dot>{KPI_STATUS_LABEL[status]}</Badge>
      </header>

      <Stat
        size="md"
        label="Тренутно"
        value={isClass ? energyClassFromScale(kpi.current) : fmt(kpi.current)}
        unit={isClass ? 'разред' : unit}
        {...(isClass ? {} : { delta, direction: def.direction, deltaLabel: 'од циља' })}
        hint={
          <>
            циљ пројекта <span className="font-medium text-ink">{isClass ? `разред ${energyClassFromScale(kpi.target)}` : `${fmt(kpi.target)}${def.unit ? ` ${def.unit}` : ''}`}</span>
          </>
        }
      />

      <AmbitionLine project={project} def={def} kpi={kpi} level={level} />

      <History project={project} def={def} kpi={kpi} level={level} />

      <div>
        <div className="eyebrow mb-2">{isClass ? 'Енергетски разреди' : 'Мерила · боље је удесно'}</div>
        {isClass ? (
          <EnergyClassScale kpi={kpi} benchmarkClass={bench ? energyClassFromScale(bench.value) : undefined} />
        ) : marks.length > 0 ? (
          <BenchmarkScale
            title={def.shortLabel}
            direction={def.direction}
            current={kpi.current}
            target={kpi.target}
            currentTone={tone}
            highlightId={bench?.key}
            format={fmt}
            marks={marks.map((m) => ({ id: m.key, label: m.label, value: m.value }))}
          />
        ) : (
          <p className="text-xs text-muted">
            {comparable ? 'Нема дефинисаних мерила за овај показатељ.' : 'Мерила фирме и прописа важе за зграде (по m² БРГП); за парк се показатељ пореди само са циљем пројекта.'}
          </p>
        )}
      </div>

      {kpi.note && (
        <div className="flex gap-2 rounded-xl bg-surface-2/70 p-3 text-xs leading-relaxed text-ink/85">
          <Info className="mt-0.5 size-3.5 shrink-0 text-muted" aria-hidden />
          <span className="min-w-0">{kpi.note}</span>
        </div>
      )}

      <details className="group text-xs text-muted">
        <summary className="cursor-pointer select-none py-1 font-medium text-accent marker:text-muted">О показатељу</summary>
        <p className="mt-1.5 leading-relaxed">{def.description}</p>
      </details>
    </Card>
  );
}
