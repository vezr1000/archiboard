import { useState } from 'react';
import { CalendarDays, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { BarChart } from '@/components/charts';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { paths } from '@/components/layout/navigation';
import { Badge, Button, Card, PageHeader, SectionHeader, Stat } from '@/components/ui';
import { attentionFor, CURRENT_USER_ID, FIRM, getPerson, getProject, getProjectKpi, projects, upcomingSessions } from '@/data';
import { GATE_LABELS, PHASE_LABELS } from '@/domain/labels';
import { DEMO_TODAY, daysFromToday } from '@/lib/dates';
import { formatArea, formatDate, formatNumber, formatPct, formatRelative } from '@/lib/format';
import { ProjectCard } from '@/features/projects/ProjectCard';
import { AttentionList } from './AttentionList';
import { buildingProjects, portfolioStats } from './portfolioStats';

const ATTENTION_PREVIEW = 4;

/** `/` — board home (CONCEPT §6.1). Audience: Јелена Марковић, partner and chair of the design board. */
export function PortfolioPage() {
  const navigate = useNavigate();
  const [showAllAttention, setShowAllAttention] = useState(false);

  const stats = portfolioStats();
  const attention = attentionFor();
  const shownAttention = showAllAttention ? attention : attention.slice(0, ATTENTION_PREVIEW);
  const sessions = upcomingSessions().slice(0, 3);
  const user = getPerson(CURRENT_USER_ID);

  const carbonData = buildingProjects().flatMap((p) => {
    const kpi = getProjectKpi(p.id, 'embodied-carbon');
    return kpi ? [{ id: p.id, label: p.shortName, sublabel: PHASE_LABELS[p.phase].short, value: kpi.current, target: kpi.target }] : [];
  });

  return (
    <>
      <PageHeader
        eyebrow={formatDate(DEMO_TODAY, 'long')}
        title={`Добро јутро, ${user?.name.split(' ')[0] ?? 'Јелена'}`}
        subtitle={`${FIRM.name} · ${stats.activeCount} активних пројеката. Ево шта одбор данас треба да зна.`}
      />

      {/* KPI strip */}
      <section aria-label="Показатељи портфолија" className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Card padding="sm" className="md:p-4">
          <Stat
            label="Активни пројекти"
            value={stats.activeCount}
            hint={`${stats.healthCounts['on-track']} у складу · ${stats.healthCounts['at-risk']} ризик · ${stats.healthCounts['off-track']} одступање`}
          />
        </Card>
        <Card padding="sm" className="md:p-4">
          <Stat
            label="Укупна БРГП"
            value={formatNumber(stats.totalGfaM2, 0)}
            unit="m²"
            hint={`без парка (${formatArea(stats.nonBuildingSiteM2, 'ha')} површине)`}
          />
        </Card>
        <Card padding="sm" className="md:p-4">
          <Stat
            label="Уграђени угљеник"
            value={formatNumber(stats.weightedCarbon, 0)}
            unit="kgCO₂e/m²"
            delta={stats.carbonDeltaPct}
            direction="lower-better"
            deltaLabel={`од циља ${formatNumber(stats.firmCarbonTarget, 0)}`}
            hint="просек пондерисан БРГП"
          />
        </Card>
        <Card padding="sm" className="md:p-4">
          <Stat
            label="Пројекти у складу са циљем"
            value={formatPct(stats.onTrackShare, { ratio: true, decimals: 0 })}
            hint={`${stats.healthCounts['on-track']} од ${stats.activeCount} пројеката`}
          />
        </Card>
        <Card padding="sm" className="col-span-2 md:col-span-1 md:p-4">
          <Stat label="Капије у наредних 30 дана" value={stats.gatesIn30Days} hint="седнице одбора по плану" />
        </Card>
      </section>

      {/* Attention + upcoming sessions */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="min-w-0 lg:col-span-2" aria-labelledby="attention-title">
          <Card
            title={<span id="attention-title">Захтева пажњу</span>}
            subtitle={`${attention.length} ставки, најважније прво`}
          >
            <AttentionList items={shownAttention} />
            {attention.length > ATTENTION_PREVIEW && (
              <Button variant="ghost" fullWidth className="mt-2" onClick={() => setShowAllAttention((v) => !v)}>
                {showAllAttention ? 'Прикажи мање' : `Прикажи све (${attention.length})`}
              </Button>
            )}
          </Card>
        </section>

        <section className="min-w-0" aria-labelledby="sessions-title">
          <Card
            title={<span id="sessions-title">Предстојеће седнице</span>}
            subtitle="Следеће три капије"
            action={
              <Button variant="ghost" size="sm" to={paths.board()} iconRight={ChevronRight}>
                Све
              </Button>
            }
          >
            <ul className="-mx-2 flex flex-col divide-y divide-line">
              {sessions.map((s) => {
                const p = getProject(s.projectId);
                const d = formatDate(s.date, 'short').split(' ');
                return (
                  <li key={s.id}>
                    <Link to={paths.session(s.id)} className="flex min-h-14 items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-surface-2">
                      <span className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-surface-2 leading-tight">
                        <span className="tabular font-display text-lg font-semibold text-ink">{d[0].replace('.', '')}</span>
                        <span className="text-[0.65rem] text-muted uppercase">{d[1]}</span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">{GATE_LABELS[s.gate].full}</span>
                        <span className="block truncate text-sm text-muted">{p?.shortName}</span>
                        <span className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                          <CalendarDays className="size-3.5" aria-hidden />
                          {formatRelative(s.date)}
                          {daysFromToday(s.date) <= 14 && (
                            <Badge tone="clay" size="sm" className="ml-1">
                              ускоро
                            </Badge>
                          )}
                        </span>
                      </span>
                      <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>
        </section>
      </div>

      {/* Project cards */}
      <section className="mt-10" aria-labelledby="projects-title">
        <SectionHeader
          title={<span id="projects-title">Пројекти</span>}
          subtitle="Уграђени угљеник, енергија и сертификација у односу на циљ (црта на траци)"
          action={
            <Button variant="ghost" size="sm" to={paths.projects()} iconRight={ChevronRight}>
              Листа
            </Button>
          }
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <li key={p.id} className="grid min-w-0">
              <ProjectCard project={p} />
            </li>
          ))}
        </ul>
      </section>

      {/* Carbon budget */}
      <section className="mt-10" aria-labelledby="carbon-title">
        <Card
          title={<span id="carbon-title">Угљенични буџет портфолија</span>}
          subtitle="Уграђени угљеник (A1–A3) по пројекту: тренутна вредност у односу на циљ пројекта"
        >
          <BarChart
            title="Уграђени угљеник по пројекту, тренутно у односу на циљ"
            unit="kgCO₂e/m²"
            direction="lower-better"
            data={carbonData}
            onBarClick={(d) => navigate(paths.project(d.id, 'ciljevi'))}
          />
          <p className="mt-4 text-xs text-muted">
            Парк на Нишави није приказан јер је вредност исказана по m² површине интервенције, а не по БРГП. Просек
            портфолија износи {formatNumber(stats.weightedCarbon, 0)} kgCO₂e/m² (циљ фирме {formatNumber(stats.firmCarbonTarget, 0)}).
          </p>
        </Card>
      </section>

      <FeedbackWidget moduleId="portfolio" />
    </>
  );
}
