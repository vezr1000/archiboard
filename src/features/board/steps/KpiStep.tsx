import { useMemo } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Check, ChevronRight, CircleCheck, Lightbulb, Plus } from 'lucide-react';
import { Sparkline, StackedBar, type StackSegment } from '@/components/charts';
import { paths } from '@/components/layout/navigation';
import { Badge, Button, Callout, Card } from '@/components/ui';
import { TONE_CLASSES } from '@/components/ui/tone';
import { proposalsForSession } from '@/data';
import { CHECK_STATUS_TONE, DECISION_STATUS_LABELS } from '@/domain/labels';
import type { CheckStatus, Decision, Tone } from '@/domain/types';
import { useProjectModel } from '@/features/options/useProjectModel';
import { cn } from '@/lib/cn';
import { formatNumber, formatPct } from '@/lib/format';
import { deltaTone } from '@/lib/kpi';
import { useAppStore } from '@/store';
import {
  GATE_TOLERANCE_PCT,
  conditionFromProposal,
  formatKpi,
  isEnergyClass,
  measureEstimates,
  proposalKpi,
  type KpiCheck,
} from '../reviewLogic';
import type { StepProps } from './PrepStep';

const BORDER_L: Record<Tone, string> = {
  neutral: 'border-l-line-strong',
  accent: 'border-l-accent',
  good: 'border-l-good',
  warn: 'border-l-warn',
  bad: 'border-l-bad',
  info: 'border-l-info',
  clay: 'border-l-clay',
};

const STATUS_TEXT: Record<CheckStatus, string> = { pass: 'испуњава', warn: 'у толеранцији', fail: 'не испуњава' };

/** Step 3 — KPI провера: every KPI vs the gate threshold (= project target), deviations acknowledged, proposed measures. */
export function KpiStep({ session, project, review, update, checks }: StepProps & { checks: KpiCheck[] }) {
  const userDecisions = useAppStore((s) => s.userDecisions);
  const model = useProjectModel(project);
  const proposals = useMemo(
    () => [
      ...proposalsForSession(session.id),
      ...userDecisions.filter((d) => d.sessionId === session.id && d.status === 'proposed'),
    ],
    [session.id, userDecisions],
  );

  const counts = { pass: 0, warn: 0, fail: 0 } as Record<CheckStatus, number>;
  checks.forEach((c) => (counts[c.status] += 1));
  const deviations = checks
    .filter((c) => c.status !== 'pass')
    .sort((a, b) => (a.status === b.status ? b.gap - a.gap : a.status === 'fail' ? -1 : 1));
  const passes = checks.filter((c) => c.status === 'pass');
  const acked = deviations.filter((c) => review.kpiAcknowledged.includes(c.def.id)).length;
  const verdictTone: Tone = counts.fail > 0 ? 'bad' : counts.warn > 0 ? 'warn' : 'good';
  const verdict =
    counts.fail > 0
      ? `${counts.fail} од ${checks.length} показатеља не испуњава праг капије`
      : counts.warn > 0
        ? `Сви показатељи су у толеранцији, ${counts.warn} са упозорењем`
        : 'Сви показатељи испуњавају праг капије';

  const toggleAck = (id: string) =>
    update((r) => ({
      ...r,
      kpiAcknowledged: r.kpiAcknowledged.includes(id) ? r.kpiAcknowledged.filter((x) => x !== id) : [...r.kpiAcknowledged, id],
    }));
  const addProposalCondition = (d: Decision) =>
    update((r) =>
      r.conditions.some((c) => c.sourceId === d.id)
        ? r
        : { ...r, conditions: [...r.conditions, conditionFromProposal(d, session, project)] },
    );
  const proposalsFor = (kpiId: string) => proposals.filter((d) => proposalKpi(d) === kpiId);

  if (checks.length === 0) {
    return (
      <Card title="KPI провера">
        <p className="text-sm text-muted">За овај пројекат још нису дефинисани показатељи.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Card
        title="Пресуда по показатељима"
        subtitle={`Праг капије = циљ пројекта · упозорење до ${GATE_TOLERANCE_PCT} % одступања`}
      >
        <p className={cn('font-display text-xl leading-snug', TONE_CLASSES[verdictTone].text)}>{verdict}.</p>
        <StackedBar
          className="mt-3"
          title="Показатељи према прагу капије"
          total={checks.length}
          height="md"
          legendValues
          segments={(
            [
              { id: 'pass', label: 'Испуњава', value: counts.pass, tone: 'good' },
              { id: 'warn', label: 'У толеранцији', value: counts.warn, tone: 'warn' },
              { id: 'fail', label: 'Не испуњава', value: counts.fail, tone: 'bad' },
            ] as StackSegment[]
          ).filter((s) => s.value > 0)}
        />
        {deviations.length > 0 && (
          <p className="mt-3 text-sm text-muted">
            Одбор констатује свако одступање:{' '}
            <span className="tabular font-medium text-ink">
              {acked} од {deviations.length}
            </span>
          </p>
        )}
      </Card>

      {deviations.length > 0 && (
        <section aria-labelledby="kpi-dev" className="flex flex-col gap-3">
          <h3 id="kpi-dev" className="eyebrow">
            Одступања ({deviations.length})
          </h3>
          {deviations.map((c) => {
            const tone = CHECK_STATUS_TONE[c.status];
            const isAck = review.kpiAcknowledged.includes(c.def.id);
            const values = c.kpi.history.map((h) => h.value);
            const props = proposalsFor(c.def.id);
            return (
              <Card key={c.def.id} className={cn('border-l-[3px]', BORDER_L[tone])}>
                <div className="flex min-w-0 items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-display text-base leading-snug text-ink">{c.def.label}</h4>
                    <Badge tone={tone} size="sm" className="mt-1">
                      {STATUS_TEXT[c.status]}
                    </Badge>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
                  <div className="min-w-0">
                    <p className="tabular font-display text-2xl text-ink">
                      {formatKpi(c.def, c.kpi.current, false)}
                      {!isEnergyClass(c.def) && c.def.unit && (
                        <span className="ml-1 font-sans text-sm text-muted">{c.def.unit}</span>
                      )}
                    </p>
                    <p className="text-sm text-muted">
                      праг {formatKpi(c.def, c.kpi.target)}
                      {!isEnergyClass(c.def) && (
                        <span className={cn('ml-1.5 font-medium', TONE_CLASSES[deltaTone(c.def.direction, c.deltaPct)].text)}>
                          {formatPct(c.deltaPct, { signed: true })}
                        </span>
                      )}
                    </p>
                  </div>
                  {values.length > 1 && (
                    <Sparkline
                      title={`${c.def.shortLabel}: кретање кроз фазе`}
                      values={values}
                      target={c.kpi.target}
                      tone={tone}
                      width={96}
                      height={32}
                    />
                  )}
                </div>
                {c.kpi.note && <p className="mt-2 line-clamp-3 text-xs leading-snug text-muted">{c.kpi.note}</p>}

                {props.map((d) => {
                  const estimates = measureEstimates(d, c.kpi.current, model);
                  const last = estimates[estimates.length - 1];
                  const stillOver = last ? last.value - c.kpi.target : 0;
                  const inConditions = review.conditions.some((x) => x.sourceId === d.id);
                  const delta = d.impact.carbonDeltaPct ?? d.impact.energyDeltaPct;
                  return (
                    <div key={d.id} className="mt-3 rounded-xl border border-info/30 bg-info-soft/50 p-3">
                      <p className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-info">
                        <Lightbulb className="size-3.5" aria-hidden />
                        Предложена мера
                        <Badge tone="info" size="sm" variant="outline">
                          {d.isUserCreated ? 'из калкулатора' : DECISION_STATUS_LABELS[d.status]}
                        </Badge>
                      </p>
                      <p className="mt-1 text-sm leading-snug font-medium text-ink">{d.title}</p>
                      {estimates.length > 0 && (
                        <ol className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm">
                          <li className="tabular font-medium text-bad">{formatNumber(c.kpi.current, 0)}</li>
                          {estimates.map((e) => (
                            <li key={e.label} className="inline-flex items-center gap-1.5">
                              <ArrowRight className="size-3.5 text-muted" aria-hidden />
                              <span className="tabular font-medium text-ink">≈ {formatNumber(e.value, 0)}</span>
                              <span className="text-xs text-muted">({e.label})</span>
                            </li>
                          ))}
                        </ol>
                      )}
                      <p className="mt-1 text-xs text-muted">
                        {delta !== undefined && <>утицај {formatPct(delta, { signed: true })} · </>}
                        {last && stillOver > 0
                          ? `и даље ${formatPct((stillOver / c.kpi.target) * 100, { decimals: 0 })} изнад прага ${formatNumber(c.kpi.target, 0)}`
                          : last
                            ? 'испуњава праг капије'
                            : ''}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          to={`${paths.project(project.id, 'odluke')}?decision=${d.id}`}
                          iconRight={ChevronRight}
                          className="-ml-2"
                        >
                          Отвори предлог
                        </Button>
                        <Button
                          size="sm"
                          variant={inConditions ? 'ghost' : 'secondary'}
                          icon={inConditions ? Check : Plus}
                          onClick={() => addProposalCondition(d)}
                          disabled={inConditions}
                        >
                          {inConditions ? 'У условима' : 'Укључи као услов'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
                <div className="mt-3 flex items-center justify-end gap-2 border-t border-line pt-3 sm:justify-between">
                  <span className="text-xs text-muted">
                    {isAck ? 'Одбор је констатовао одступање' : 'Одбор констатује одступање'}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleAck(c.def.id)}
                    aria-pressed={isAck}
                    className={cn(
                      'inline-flex min-h-10 items-center gap-1.5 rounded-xl border px-3 text-sm font-medium transition-colors',
                      isAck ? 'border-good bg-good-soft text-good' : 'border-line-strong bg-surface text-ink hover:bg-surface-2',
                    )}
                  >
                    {isAck ? <CircleCheck className="size-4" aria-hidden /> : <Check className="size-4 text-muted" aria-hidden />}
                    {isAck ? 'Констатовано' : 'Констатуј'}
                  </button>
                </div>
              </Card>
            );
          })}
        </section>
      )}

      {passes.length > 0 && (
        <Card title={`Испуњава праг (${passes.length})`} padding="md">
          <ul className="grid gap-x-6 sm:grid-cols-2">
            {passes.map((c) => (
              <li key={c.def.id} className="flex min-h-12 items-center gap-3 border-b border-line py-2 last:border-b-0">
                <CircleCheck className="size-4 shrink-0 text-good" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-ink">{c.def.shortLabel}</span>
                  <span className="block text-xs text-muted">
                    <span className="tabular">{formatKpi(c.def, c.kpi.current)}</span> · праг{' '}
                    {formatKpi(c.def, c.kpi.target, false)}
                  </span>
                </span>
                {c.kpi.history.length > 1 && (
                  <Sparkline
                    title={`${c.def.shortLabel}: кретање`}
                    values={c.kpi.history.map((h) => h.value)}
                    target={c.kpi.target}
                    tone="good"
                    width={56}
                    height={22}
                    area={false}
                  />
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {counts.fail > 0 && (
        <Callout tone="info" title="Шта одбор може да одлучи">
          Показатељи изван толеранције не значе аутоматски враћање на дораду: одбор може да одобри прелазак уз услове са носиоцима
          и роковима (корак 5) и да прати њихово испуњење до следеће капије.
        </Callout>
      )}
      <Link
        to={paths.project(project.id, 'ciljevi')}
        className="inline-flex min-h-10 items-center gap-1 self-start text-sm font-medium text-accent hover:underline"
      >
        Сви циљеви и мерила пројекта
        <ChevronRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}
