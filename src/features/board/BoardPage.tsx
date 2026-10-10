import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, CalendarDays, ChevronRight, ClipboardCheck, FileText, MapPin } from 'lucide-react';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { paths } from '@/components/layout/navigation';
import { Avatar, AvatarStack, Badge, Button, Card, PageHeader, ProgressBar, Stat, useMediaQuery } from '@/components/ui';
import {
  boardChair,
  boardMembers,
  boardSessions,
  gateReadiness,
  getPerson,
  getProject,
  getSession,
  openConditionsForProject,
  pastSessions,
  projects,
  upcomingSessions,
} from '@/data';
import { FINDING_SEVERITY_TONE, GATE_LABELS } from '@/domain/labels';
import type { BoardSession, FindingSeverity } from '@/domain/types';
import { cn } from '@/lib/cn';
import { DEMO_TODAY, isWithinNextDays } from '@/lib/dates';
import { formatDate, formatNumber, formatPct, formatRelative } from '@/lib/format';
import { sessionOutcomeOf, useAppStore, type SessionOutcomeInfo } from '@/store';
import { BoardCalendar } from './BoardCalendar';
import { STEP_COUNT, conditionsWord } from './reviewLogic';
import { sessionBadgeProps } from './SessionOutcomeBadge';

const SEVERITY_SHORT: Record<FindingSeverity, string> = { critical: 'критично', warning: 'упозорење', info: 'инфо' };
const SEVERITIES: FindingSeverity[] = ['critical', 'warning', 'info'];

/** Day block used in session lists („23 / ОКТ“). */
function DateBlock({ iso, year }: { iso: string; year?: boolean }) {
  const [day, month] = formatDate(iso, 'short').split(' ');
  return (
    <span className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-surface-2 leading-tight">
      <span className="tabular font-display text-lg font-semibold text-ink">{day.replace('.', '')}</span>
      <span className="text-[0.62rem] text-muted uppercase">
        {month}
        {year && ` ${iso.slice(2, 4)}`}
      </span>
    </span>
  );
}

function UpcomingSessionCard({ session, info }: { session: BoardSession; info: SessionOutcomeInfo }) {
  const project = getProject(session.projectId);
  const readiness = gateReadiness(session.projectId, session.gate);
  const total = readiness.required.length;
  const ready = readiness.approved.length + readiness.inReview.length;
  const badge = sessionBadgeProps(info);
  const counts = SEVERITIES.map((s) => ({ s, n: session.aiFindings.filter((f) => f.severity === s).length })).filter(
    (x) => x.n > 0,
  );
  const soon = isWithinNextDays(session.date, 14);
  const cta =
    info.status === 'completed'
      ? { label: 'Записник', variant: 'secondary' as const }
      : info.status === 'in-progress'
        ? { label: `Настави ревизију · корак ${(info.review?.step ?? 0) + 1}/${STEP_COUNT}`, variant: 'primary' as const }
        : { label: 'Започни ревизију', variant: 'primary' as const };

  return (
    <Card as="li" className="flex flex-col">
      <div className="flex min-w-0 items-start gap-3">
        <DateBlock iso={session.date} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
            <h3 className="font-display text-lg leading-snug text-ink">{GATE_LABELS[session.gate].full}</h3>
            <Badge tone={badge.tone} dot={info.status === 'in-progress'}>
              {badge.label}
            </Badge>
          </div>
          <Link to={paths.project(session.projectId)} className="block truncate text-sm font-medium text-ink hover:text-accent">
            {project?.name}
          </Link>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5" aria-hidden />
              {formatDate(session.date, 'weekday')} · {formatRelative(session.date)}
            </span>
            {soon && info.status !== 'completed' && (
              <Badge tone="clay" size="sm">
                ускоро
              </Badge>
            )}
          </p>
          {session.location && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">{session.location}</span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {total > 0 ? (
          <ProgressBar
            label={
              <span className="inline-flex items-center gap-1">
                <FileText className="size-3.5" aria-hidden />
                Документација
              </span>
            }
            valueLabel={`${ready} од ${total} спремно`}
            value={ready}
            max={total}
            tone={ready === total ? 'good' : readiness.missing.length > 0 ? 'warn' : 'accent'}
          />
        ) : (
          <p className="text-sm text-muted">Обавезна документа још нису одређена.</p>
        )}
        <div className="flex min-h-6 flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted">АИ налази:</span>
          {counts.length === 0 ? (
            <span className="text-xs text-muted">нема</span>
          ) : (
            counts.map(({ s, n }) => (
              <Badge key={s} tone={FINDING_SEVERITY_TONE[s]} size="sm">
                {n} {SEVERITY_SHORT[s]}
              </Badge>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-1 items-end">
        <Button to={paths.session(session.id)} variant={cta.variant} iconRight={ArrowRight} fullWidth className="sm:w-auto">
          {cta.label}
        </Button>
      </div>
    </Card>
  );
}

function PastSessionRow({ session, info }: { session: BoardSession; info: SessionOutcomeInfo }) {
  const project = getProject(session.projectId);
  const badge = sessionBadgeProps(info);
  const open = session.conditions.filter((c) => !c.done);
  const overdue = open.filter((c) => c.dueDate < DEMO_TODAY).length;
  const conditionsText =
    session.conditions.length === 0
      ? 'без услова'
      : open.length === 0
        ? `${session.conditions.length} ${conditionsWord(session.conditions.length)} · сви испуњени`
        : `${open.length} од ${session.conditions.length} отворено`;
  return (
    <li>
      <Link
        to={paths.session(session.id)}
        className="flex min-h-16 items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-surface-2"
      >
        <DateBlock iso={session.date} year />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-medium text-ink">{GATE_LABELS[session.gate].full}</span>
            <Badge tone={badge.tone} size="sm">
              {badge.label}
            </Badge>
          </span>
          <span className="block truncate text-sm text-muted">{project?.name}</span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
            <span>{conditionsText}</span>
            {overdue > 0 && <span className="font-medium text-bad">· {overdue} ван рока</span>}
            <span className="inline-flex items-center gap-1 text-accent">
              <ClipboardCheck className="size-3.5" aria-hidden />
              записник
            </span>
          </span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
      </Link>
    </li>
  );
}

/** `/odbor` — board sessions overview (CONCEPT §6.13): upcoming + past sessions, calendar, board statistics. */
export function BoardPage() {
  const reviews = useAppStore((s) => s.gateReviews);
  const members = boardMembers();
  const chair = boardChair();
  const upcoming = upcomingSessions();
  const past = pastSessions();
  const isPhone = useMediaQuery('(max-width: 767px)');
  const [showAll, setShowAll] = useState(false);
  const shownUpcoming = isPhone && !showAll ? upcoming.slice(0, 3) : upcoming;

  const stats = useMemo(() => {
    const held = boardSessions
      .map((s) => ({ s, info: sessionOutcomeOf(s, reviews[s.id]) }))
      .filter(({ info }) => info.status === 'held' || info.status === 'completed');
    const approved = held.filter(({ info }) => info.outcome === 'approved' || info.outcome === 'approved-with-conditions');
    const withConditions = held.filter(({ info }) => info.outcome === 'approved-with-conditions').length;
    const conditionCount = held.reduce(
      (sum, { s, info }) => sum + (info.status === 'completed' ? (info.review?.conditions.length ?? 0) : s.conditions.length),
      0,
    );
    const overdue = projects
      .flatMap((p) => openConditionsForProject(p.id).map((c) => ({ ...c, projectId: p.id })))
      .filter((c) => c.dueDate < DEMO_TODAY)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const next30 = upcomingSessions().filter((s) => isWithinNextDays(s.date, 30));
    return {
      held: held.length,
      approved: approved.length,
      withConditions,
      rate: held.length ? (approved.length / held.length) * 100 : 0,
      perGate: held.length ? conditionCount / held.length : 0,
      overdue,
      next30,
    };
  }, [reviews]);

  return (
    <>
      <PageHeader
        eyebrow="Одбор"
        title="Одбор за одрживост"
        subtitle="Ревизије капија пре преласка у следећу фазу — заказане седнице, исходи и услови са носиоцима и роковима."
        meta={
          <>
            <AvatarStack people={members} max={4} />
            <span className="text-sm text-muted">
              {members.length} члана
              {chair && (
                <>
                  {' '}
                  · председава <span className="text-ink">{chair.name}</span>
                </>
              )}
            </span>
          </>
        }
      />

      <section aria-label="Статистика одбора" className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card padding="sm" className="p-3.5!">
          <Stat
            size="sm"
            label="Стопа одобравања"
            value={formatPct(stats.rate, { decimals: 0 })}
            hint={`${stats.approved} од ${stats.held} капија · ${stats.withConditions} уз услове`}
          />
        </Card>
        <Card padding="sm" className="p-3.5!">
          <Stat size="sm" label="Услова по капији" value={formatNumber(stats.perGate, 1)} hint="просек одржаних седница" />
        </Card>
        <Card padding="sm" className={cn('p-3.5!', stats.overdue.length > 0 && 'border-bad/40')}>
          <Stat
            size="sm"
            label="Услови ван рока"
            value={<span className={stats.overdue.length > 0 ? 'text-bad' : undefined}>{stats.overdue.length}</span>}
            hint="сви пројекти, на данашњи дан"
          />
        </Card>
        <Card padding="sm" className="p-3.5!">
          <Stat
            size="sm"
            label="Седнице у 30 дана"
            value={stats.next30.length}
            hint={stats.next30[0] ? `следећа ${formatDate(stats.next30[0].date, 'day-month')}` : 'нема заказаних'}
          />
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section aria-labelledby="upcoming-title" className="min-w-0 lg:col-span-2">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <h2 id="upcoming-title" className="font-display text-xl text-ink">
              Предстојеће седнице
            </h2>
            <span className="text-sm text-muted">{upcoming.length} у плану</span>
          </div>
          <ul className="grid gap-3 md:grid-cols-2">
            {shownUpcoming.map((s) => (
              <UpcomingSessionCard key={s.id} session={s} info={sessionOutcomeOf(s, reviews[s.id])} />
            ))}
          </ul>
          {shownUpcoming.length < upcoming.length && (
            <Button variant="secondary" fullWidth className="mt-3" onClick={() => setShowAll(true)}>
              Прикажи још {upcoming.length - shownUpcoming.length}
            </Button>
          )}
        </section>

        <div className="flex min-w-0 flex-col gap-6">
          <Card title="Календар" subtitle="Наредних шест недеља">
            <BoardCalendar sessions={boardSessions} />
          </Card>

          <Card
            title="Услови ван рока"
            subtitle={stats.overdue.length ? 'Отворени услови са капија и одлука' : undefined}
            className={stats.overdue.length ? 'border-bad/30' : undefined}
          >
            {stats.overdue.length === 0 ? (
              <p className="text-sm text-muted">Сви отворени услови су у року.</p>
            ) : (
              <ul className="-mx-2 flex flex-col divide-y divide-line">
                {stats.overdue.map((c) => {
                  const owner = getPerson(c.ownerId);
                  const p = getProject(c.projectId);
                  const to =
                    c.source.kind === 'session' && getSession(c.source.id)
                      ? paths.session(c.source.id)
                      : `${paths.project(c.projectId, 'odluke')}?decision=${c.source.id}`;
                  return (
                    <li key={c.id}>
                      <Link to={to} className="flex min-h-12 items-start gap-3 rounded-xl px-2 py-2.5 hover:bg-surface-2">
                        {owner && <Avatar person={owner} size="xs" className="mt-0.5" />}
                        <span className="min-w-0 flex-1">
                          <span className="line-clamp-2 block text-sm leading-snug text-ink">{c.text}</span>
                          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                            <Badge tone="bad" size="sm">
                              рок истекао {formatRelative(c.dueDate)}
                            </Badge>
                            <span>{p?.shortName}</span>
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
        </div>

        <Card
          title="Одржане седнице"
          subtitle={`${past.length} седница · исход, услови и записник`}
          className="lg:col-span-2"
          padding="md"
        >
          <ul className="-mx-2 flex flex-col divide-y divide-line">
            {past.map((s) => (
              <PastSessionRow key={s.id} session={s} info={sessionOutcomeOf(s, reviews[s.id])} />
            ))}
          </ul>
        </Card>
      </div>

      <FeedbackWidget moduleId="odbor" />
    </>
  );
}
