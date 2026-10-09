import { ChevronRight, FileText } from 'lucide-react';
import { Link } from 'react-router';
import { RingScore, Sparkline, StackedBar, type StackSegment } from '@/components/charts';
import { paths } from '@/components/layout/navigation';
import { Avatar, Badge, Button, Card, Stat } from '@/components/ui';
import { TONE_CLASSES } from '@/components/ui/tone';
import {
  activityForProject,
  certificationForProject,
  gateReadiness,
  getPerson,
  getSession,
  kpisForProject,
  nextSessionForProject,
  openConditionsForProject,
  risksForProject,
} from '@/data';
import {
  CHECK_STATUS_TONE,
  DECISION_STATUS_LABELS,
  DECISION_STATUS_TONE,
  energyClassFromScale,
  energyClassTone,
  GATE_LABELS,
  PHASE_LABELS,
  RISK_CATEGORY_LABELS,
  riskScoreTone,
} from '@/domain/labels';
import type { Decision, KpiDefinition, Project, ProjectKpi, Tone } from '@/domain/types';
import { achievedLevel, certScoreMax, certTone, formatCertScore, thresholdsInScoreUnits } from '@/lib/cert';
import { cn } from '@/lib/cn';
import { DEMO_TODAY } from '@/lib/dates';
import { formatDate, formatNumber, formatPct, formatRelative } from '@/lib/format';
import { kpiStatus } from '@/lib/kpi';

/** Small list-row link used inside overview cards. */
const rowLink = 'flex min-h-12 items-start gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-surface-2';

const linkAction = (to: string, label: string) => (
  <Button variant="ghost" size="sm" to={to} iconRight={ChevronRight}>
    {label}
  </Button>
);

/* ------------------------------------------------------------------------------------------------ */

function KpiTile({ def, kpi }: { def: KpiDefinition; kpi: ProjectKpi }) {
  const status = kpi.status ?? kpiStatus(def.direction, kpi.current, kpi.target);
  const tone: Tone = CHECK_STATUS_TONE[status];
  const isClass = def.id === 'energy-class';
  const delta = kpi.target === 0 ? 0 : ((kpi.current - kpi.target) / Math.abs(kpi.target)) * 100;
  const values = kpi.history.map((h) => h.value);
  const first = kpi.history[0];
  const last = kpi.history[kpi.history.length - 1];
  const fmt = (v: number) => formatNumber(v, def.decimals);

  return (
    <li className={cn('min-w-0 rounded-xl border border-l-[3px] border-line bg-surface-2/40 p-3', TONE_CLASSES[tone].border)}>
      <Stat
        size="sm"
        label={def.shortLabel}
        value={isClass ? energyClassFromScale(kpi.current) : fmt(kpi.current)}
        unit={def.unit || undefined}
        {...(isClass ? {} : { delta, direction: def.direction, deltaLabel: 'од циља' })}
        hint={`циљ ${isClass ? energyClassFromScale(kpi.target) : fmt(kpi.target)}${def.unit ? ` ${def.unit}` : ''}`}
      />
      {isClass && <Badge tone={energyClassTone(energyClassFromScale(kpi.current))} size="sm" className="mt-2">Разред {energyClassFromScale(kpi.current)}</Badge>}
      {!isClass && values.length > 1 && (
        <div className="mt-2.5">
          <Sparkline title={`${def.shortLabel}: кретање кроз фазе`} values={values} target={kpi.target} tone={tone} width="100%" height={28} />
          <div className="mt-1 flex justify-between text-[0.68rem] text-muted">
            <span>{PHASE_LABELS[first.phase].short}</span>
            <span>{PHASE_LABELS[last.phase].short}</span>
          </div>
        </div>
      )}
    </li>
  );
}

/** KPI tiles: current vs target with trend sparkline across phases. */
export function KpiTilesCard({ project }: { project: Project }) {
  const kpis = kpisForProject(project.id).slice(0, 6);
  return (
    <Card
      title="Кључни показатељи"
      subtitle="Тренутна вредност, одступање од циља и кретање кроз фазе"
      action={linkAction(paths.project(project.id, 'ciljevi'), 'Сви KPI')}
      className="h-full"
    >
      {kpis.length === 0 ? (
        <p className="text-sm text-muted">За овај пројекат још нису дефинисани показатељи.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {kpis.map(({ def, kpi }) => (
            <KpiTile key={def.id} def={def} kpi={kpi} />
          ))}
        </ul>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------------------------------------ */

/** Certification score ring with award thresholds. */
export function CertificationCard({ project }: { project: Project }) {
  const c = project.certification;
  const tracker = certificationForProject(project.id);
  const thresholds = tracker ? thresholdsInScoreUnits(c.scheme, tracker.thresholds) : [];
  const reached = achievedLevel(thresholds, c.currentScore);
  const gap = c.targetScore - c.currentScore;
  const title = c.scheme === 'none' ? 'Интерни скор' : `${c.scheme} · циљ ${c.targetLevel}`;
  return (
    <Card
      title={title}
      subtitle={c.scheme === 'none' ? 'Плаво-зелена инфраструктура, интерни стандард фирме' : 'Предвиђени резултат сертификације'}
      action={linkAction(paths.project(project.id, 'sertifikacija'), 'Детаљи')}
      className="h-full"
    >
      <div className="flex flex-col items-center gap-3">
        <RingScore
          title={`Резултат сертификације ${c.scheme}`}
          value={c.currentScore}
          max={certScoreMax(c.scheme)}
          target={c.targetScore}
          tone={certTone(c.currentScore, c.targetScore)}
          thresholds={thresholds}
          size={190}
          label={formatCertScore(c.currentScore, c.scheme)}
          sublabel={`циљ ${formatCertScore(c.targetScore, c.scheme)}`}
        />
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
          {reached ? (
            <Badge tone="accent">Достигнуто: {reached.label}</Badge>
          ) : (
            <Badge tone="neutral">Испод првог нивоа</Badge>
          )}
          {gap > 0 ? (
            <span className="text-muted">
              недостаје <span className="tabular font-medium text-ink">{formatCertScore(Math.round(gap * 10) / 10, c.scheme)}</span> до циљаног скора
            </span>
          ) : (
            <span className="text-good">циљ је достигнут</span>
          )}
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------------------------------------ */

/** Next gate: document readiness + open conditions (overdue flagged). */
export function NextGateCard({ project }: { project: Project }) {
  const { gate, date } = project.nextGate;
  const session = nextSessionForProject(project.id);
  const readiness = gateReadiness(project.id, gate);
  const conditions = openConditionsForProject(project.id);
  const overdue = conditions.filter((c) => c.dueDate < DEMO_TODAY).length;
  const shown = conditions.slice(0, 4);
  const approved = readiness.approved.length;
  const total = readiness.required.length;

  return (
    <Card
      eyebrow="Следећа капија"
      title={GATE_LABELS[gate].full}
      subtitle={`${formatDate(date, 'weekday')} · ${formatRelative(date)}${session?.location ? ` · ${session.location}` : ''}`}
      action={session ? <Button variant="secondary" size="sm" to={paths.session(session.id)}>Отвори седницу</Button> : undefined}
      className="h-full"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="min-w-0">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <h4 className="text-sm font-semibold text-ink">Документација за капију</h4>
            <span className="tabular text-sm text-muted">
              одобрено <span className="font-medium text-ink">{approved}</span> од {total}
            </span>
          </div>
          {total === 0 ? (
            <p className="text-sm text-muted">За ову капију још нису одређена обавезна документа.</p>
          ) : (
            <>
              <StackedBar
                title="Спремност докумената за капију"
                total={total}
                height="md"
                legendValues
                segments={([
                  { id: 'approved', label: 'Одобрено', value: approved, tone: 'good' },
                  { id: 'review', label: 'На ревизији', value: readiness.inReview.length, tone: 'info' },
                  { id: 'draft', label: 'У изради', value: readiness.missing.length, tone: 'warn' },
                ] as StackSegment[]).filter((s) => s.value > 0)}
              />
              {readiness.missing.length > 0 ? (
                <ul className="-mx-2 mt-3 flex flex-col">
                  {readiness.missing.slice(0, 3).map((d) => (
                    <li key={d.id}>
                      <Link to={paths.project(project.id, 'dokumenta')} className={rowLink}>
                        <FileText className="mt-0.5 size-4 shrink-0 text-warn" aria-hidden />
                        <span className="min-w-0 flex-1 text-sm text-ink">{d.title}</span>
                        <Badge tone="warn" size="sm">недостаје</Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-good">Сва обавезна документа су у ревизији или одобрена.</p>
              )}
              <Button variant="ghost" size="sm" to={paths.project(project.id, 'dokumenta')} iconRight={ChevronRight} className="mt-1">
                Сва документа
              </Button>
            </>
          )}
        </div>

        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-2">
            <h4 className="text-sm font-semibold text-ink">Отворени услови</h4>
            <span className="text-sm text-muted">
              <span className="tabular font-medium text-ink">{conditions.length}</span>
              {overdue > 0 && <span className="text-bad"> · {overdue} са истеклим роком</span>}
            </span>
          </div>
          {conditions.length === 0 ? (
            <p className="text-sm text-muted">Нема отворених услова са претходних капија.</p>
          ) : (
            <ul className="-mx-2 flex flex-col">
              {shown.map((cond) => {
                const owner = getPerson(cond.ownerId);
                const late = cond.dueDate < DEMO_TODAY;
                const to =
                  cond.source.kind === 'session' && getSession(cond.source.id)
                    ? paths.session(cond.source.id)
                    : paths.project(project.id, 'odluke');
                return (
                  <li key={cond.id}>
                    <Link to={to} className={rowLink}>
                      {owner && <Avatar person={owner} size="xs" className="mt-0.5" />}
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 block text-sm leading-snug text-ink">{cond.text}</span>
                        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                          {late ? (
                            <Badge tone="bad" size="sm">рок истекао {formatRelative(cond.dueDate)}</Badge>
                          ) : (
                            <span>рок {formatRelative(cond.dueDate)}</span>
                          )}
                          {owner && <span>{owner.name}</span>}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          {conditions.length > shown.length && (
            <Button variant="ghost" size="sm" to={paths.project(project.id, 'odluke')} iconRight={ChevronRight} className="mt-1">
              Још {conditions.length - shown.length}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------------------------------------ */

function ImpactChip({ label, value, kind }: { label: string; value: number; kind: 'carbon' | 'energy' | 'cost' }) {
  // Lower is better for carbon and energy; for cost an increase is only a „warning“, not a failure.
  const tone: Tone = value === 0 ? 'neutral' : value < 0 ? (kind === 'cost' ? 'info' : 'good') : kind === 'cost' ? 'warn' : 'bad';
  return (
    <Badge tone={tone} size="sm">
      {label} {formatPct(value, { signed: true })}
    </Badge>
  );
}

/** Latest decisions (already merged seed + user-saved, newest first). */
export function LatestDecisionsCard({ project, decisions }: { project: Project; decisions: Decision[] }) {
  return (
    <Card
      title="Последње одлуке"
      subtitle={decisions.length > 0 ? `${decisions.length} у евиденцији одлука` : undefined}
      action={linkAction(paths.project(project.id, 'odluke'), 'Све')}
      className="h-full"
    >
      {decisions.length === 0 ? (
        <p className="text-sm text-muted">Још нема забележених одлука.</p>
      ) : (
        <ul className="-mx-2 flex flex-col divide-y divide-line">
          {decisions.slice(0, 3).map((d) => (
            <li key={d.id}>
              <Link to={paths.project(project.id, 'odluke')} className={rowLink}>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 block text-sm leading-snug font-medium text-ink">{d.title}</span>
                  <span className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                    <span>{formatDate(d.date, 'day-month')}</span>
                    <Badge tone={DECISION_STATUS_TONE[d.status]} size="sm">{DECISION_STATUS_LABELS[d.status]}</Badge>
                    {d.impact.carbonDeltaPct !== undefined && <ImpactChip label="CO₂" kind="carbon" value={d.impact.carbonDeltaPct} />}
                    {d.impact.energyDeltaPct !== undefined && <ImpactChip label="енергија" kind="energy" value={d.impact.energyDeltaPct} />}
                    {d.impact.costDeltaPct !== undefined && <ImpactChip label="трошак" kind="cost" value={d.impact.costDeltaPct} />}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------------------------------------ */

/** Top 3 open risks by probability × impact. */
export function TopRisksCard({ project }: { project: Project }) {
  const open = risksForProject(project.id)
    .filter((r) => r.status !== 'closed')
    .map((r) => ({ risk: r, score: r.probability * r.impact }))
    .sort((a, b) => b.score - a.score);
  return (
    <Card
      title="Највећи ризици"
      subtitle={open.length > 0 ? `Вероватноћа × утицај · ${open.length} отворених` : undefined}
      action={linkAction(paths.project(project.id, 'rizici'), 'Сви')}
      className="h-full"
    >
      {open.length === 0 ? (
        <p className="text-sm text-muted">Нема отворених ризика.</p>
      ) : (
        <ul className="-mx-2 flex flex-col divide-y divide-line">
          {open.slice(0, 3).map(({ risk, score }) => {
            const owner = getPerson(risk.ownerId);
            return (
              <li key={risk.id}>
                <Link to={paths.project(project.id, 'rizici')} className={rowLink}>
                  <Badge tone={riskScoreTone(score)} className="mt-0.5 min-w-9 justify-center">{score}</Badge>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 block text-sm leading-snug font-medium text-ink">{risk.title}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted">
                      <span>{RISK_CATEGORY_LABELS[risk.category]}</span>
                      <span className="tabular">{risk.probability} × {risk.impact}</span>
                      {owner && <span>{owner.name}</span>}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------------------------------------ */

/** Recent activity feed. */
export function ActivityCard({ project }: { project: Project }) {
  const items = activityForProject(project.id).slice(0, 6);
  return (
    <Card title="Недавна активност" subtitle="Шта се променило на пројекту" className="h-full">
      {items.length === 0 ? (
        <p className="text-sm text-muted">Још нема забележених активности.</p>
      ) : (
        <ul className="flex flex-col gap-3.5">
          {items.map((a) => {
            const actor = getPerson(a.actorId);
            return (
              <li key={a.id} className="flex min-w-0 gap-3">
                {actor ? <Avatar person={actor} size="sm" /> : <span className="size-8 shrink-0" />}
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug text-ink">{a.text}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {actor?.name} · {formatRelative(a.date)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
