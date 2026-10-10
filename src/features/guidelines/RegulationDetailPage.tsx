import { Link, useParams } from 'react-router';
import { ArrowUpRight, BookMarked, Building, ListChecks, ScanSearch, Star } from 'lucide-react';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { paths } from '@/components/layout/navigation';
import { Badge, Button, Card, EmptyState, PageHeader, PhasePill } from '@/components/ui';
import {
  findingsForRegulation,
  getProject,
  getRegulation,
  projectsForRegulation,
  requirementsForRegulation,
} from '@/data';
import {
  FINDING_SEVERITY_LABELS,
  FINDING_SEVERITY_TONE,
  GATE_LABELS,
  JURISDICTION_LABELS,
  REGULATION_KIND_LABELS,
  REQUIREMENT_CATEGORY_LABELS,
  REQUIREMENT_STATUS_LABELS,
  REQUIREMENT_STATUS_TONE,
} from '@/domain/labels';
import type { Project, Regulation } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';
import { isFirmGuideline, KIND_TONE, relatedEntries } from './guidelinesLogic';

const DEMO_DISCLAIMER = 'Сажетак за демо — за примену консултовати важећи текст прописа.';

function KeyPoints({ points }: { points: string[] }) {
  return (
    <ol className="flex flex-col gap-3">
      {points.map((p, i) => (
        <li key={i} className="flex min-w-0 items-start gap-3">
          <span className="tabular mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
            {i + 1}
          </span>
          <p className="min-w-0 flex-1 text-[0.95rem] leading-relaxed text-ink">{p}</p>
        </li>
      ))}
    </ol>
  );
}

/** One project the entry applies to, with the project requirements that cite it. */
function ProjectApplication({ project, entry }: { project: Project; entry: Regulation }) {
  const reqs = requirementsForRegulation(entry.id).filter((r) => r.projectId === project.id);
  return (
    <li className="min-w-0 rounded-xl border border-line bg-surface p-3.5">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <Link to={paths.project(project.id, 'pregled')} className="inline-flex min-h-9 min-w-0 items-center gap-2 font-medium text-ink hover:text-accent">
          <Building className="size-4 shrink-0 text-muted" aria-hidden />
          <span className="min-w-0">{project.name}</span>
        </Link>
        <PhasePill phase={project.phase} />
      </div>
      {reqs.length > 0 ? (
        <>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
            <ListChecks className="size-3.5 shrink-0" aria-hidden />
            Услови у пројекту који се позивају на овај документ
          </p>
          <ul className="mt-1.5 flex flex-col gap-2">
            {reqs.map((r) => (
              <li key={r.id} className="flex min-w-0 flex-col gap-1 rounded-lg bg-surface-2/60 px-3 py-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge size="sm" tone={REQUIREMENT_STATUS_TONE[r.status]} dot>
                    {REQUIREMENT_STATUS_LABELS[r.status]}
                  </Badge>
                  <Badge size="sm" variant="outline">
                    {REQUIREMENT_CATEGORY_LABELS[r.category]}
                  </Badge>
                </div>
                <p className="text-sm leading-snug text-ink">{r.text}</p>
                <p className="text-xs text-muted">{r.sourceRef}</p>
              </li>
            ))}
          </ul>
          <Link to={paths.project(project.id, 'lokacija')} className="mt-2 inline-flex min-h-9 items-center gap-1 text-sm font-medium text-accent hover:underline">
            Отвори услове пројекта <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        </>
      ) : (
        <p className="mt-1 text-sm text-muted">Нема везаних услова у листи пројекта.</p>
      )}
    </li>
  );
}

/** `/smernice/:id` — library entry: summary, key points, where it applies, linked requirements and AI findings, related entries. */
export function RegulationDetailPage() {
  const { id } = useParams();
  const entry = getRegulation(id);

  if (!entry) {
    return (
      <>
        <PageHeader back={{ to: paths.guidelines(), label: 'Смернице и прописи' }} title="Документ није пронађен" />
        <EmptyState
          icon={BookMarked}
          title="Овог документа нема у библиотеци"
          description="Можда је адреса погрешна или је документ уклоњен."
          action={<Button to={paths.guidelines()}>Назад на библиотеку</Button>}
        />
        <FeedbackWidget moduleId="smernice-detalj" />
      </>
    );
  }

  const firm = isFirmGuideline(entry);
  // Projects the entry applies to, plus projects whose requirements cite it although it is not listed for them.
  const requirements = requirementsForRegulation(entry.id);
  const applies = projectsForRegulation(entry.id);
  const extraProjects = [...new Set(requirements.map((r) => r.projectId))]
    .filter((pid) => !applies.some((p) => p.id === pid))
    .flatMap((pid) => getProject(pid) ?? []);
  const projectList = [...applies, ...extraProjects];
  const findings = findingsForRegulation(entry.id);
  const related = relatedEntries(entry);

  return (
    <>
      <PageHeader
        back={{ to: paths.guidelines(), label: 'Смернице и прописи' }}
        eyebrow="Библиотека знања"
        title={entry.title}
        meta={
          <>
            {firm ? (
              <Badge tone="clay" variant="solid" icon={Star}>
                Стандард фирме
              </Badge>
            ) : (
              <Badge tone={KIND_TONE[entry.kind]}>{REGULATION_KIND_LABELS[entry.kind]}</Badge>
            )}
            <Badge variant="outline">{JURISDICTION_LABELS[entry.jurisdiction]}</Badge>
            <Badge variant="outline">{entry.year}.</Badge>
            <span className="tabular min-w-0 text-sm text-muted">{entry.code}</span>
          </>
        }
      />

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-6">
        <div className="flex min-w-0 flex-col gap-4">
          <Card title="Сажетак" className={cn(firm && 'border-clay/35 bg-clay-soft/50')}>
            <p className="text-[0.95rem] leading-relaxed text-ink">{entry.summary}</p>
            {firm ? (
              <p className="mt-3 text-xs leading-snug text-muted">
                Интерна смерница Студија Градина — обавезна за пројекте фирме на које се односи. Део знања фирме које се ажурира по лекцијама из пројеката.
              </p>
            ) : (
              <p className="mt-3 text-xs leading-snug text-muted">{DEMO_DISCLAIMER}</p>
            )}
          </Card>

          <Card title="Кључне тачке" subtitle={`${entry.keyPoints.length} ${entry.keyPoints.length < 5 ? 'тачке' : 'тачака'}`}>
            <KeyPoints points={entry.keyPoints} />
          </Card>

          <Card title="Где се примењује" subtitle={projectList.length > 0 ? 'Пројекти фирме и услови који се позивају на документ' : undefined}>
            {projectList.length === 0 ? (
              <p className="text-sm text-muted">Документ није везан за конкретан пројекат фирме — служи као општа референца.</p>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {projectList.map((p) => (
                  <ProjectApplication key={p.id} project={p} entry={entry} />
                ))}
              </ul>
            )}
          </Card>

          {findings.length > 0 && (
            <Card
              title="Налази АИ пре-ревизије"
              subtitle="Седнице одбора у којима се налаз позива на овај документ"
              eyebrow={
                <span className="inline-flex items-center gap-1 text-info">
                  <ScanSearch className="size-3.5" aria-hidden />
                  Одбор
                </span>
              }
            >
              <ul className="flex flex-col gap-2.5">
                {findings.map(({ session, finding }) => {
                  const project = getProject(session.projectId);
                  return (
                    <li key={`${session.id}-${finding.id}`} className="min-w-0 rounded-xl border border-line bg-surface p-3.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge tone={FINDING_SEVERITY_TONE[finding.severity]} size="sm" variant={finding.severity === 'critical' ? 'solid' : 'soft'}>
                          {FINDING_SEVERITY_LABELS[finding.severity]}
                        </Badge>
                        <span className="text-xs text-muted">
                          {project?.shortName} · {GATE_LABELS[session.gate].code} · {formatDate(session.date, 'long')}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm font-medium leading-snug text-ink">{finding.title}</p>
                      <Link to={paths.session(session.id)} className="mt-1 inline-flex min-h-9 items-center gap-1 text-sm font-medium text-accent hover:underline">
                        Отвори седницу <ArrowUpRight className="size-3.5" aria-hidden />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </div>

        <aside className="flex min-w-0 flex-col gap-4" aria-label="Повезано">
          {related.length > 0 && (
            <Card title="Сродни документи" subtitle="Деле исте ознаке">
              <ul className="flex flex-col divide-y divide-line">
                {related.map(({ entry: r, shared }) => (
                  <li key={r.id}>
                    <Link to={`/smernice/${r.id}`} className="group flex min-h-11 min-w-0 flex-col gap-1 py-2.5">
                      <span className="line-clamp-2 text-sm font-medium leading-snug text-ink group-hover:text-accent">{r.title}</span>
                      <span className="flex min-w-0 flex-wrap items-center gap-1.5">
                        <Badge size="sm" tone={KIND_TONE[r.kind]}>
                          {REGULATION_KIND_LABELS[r.kind]}
                        </Badge>
                        <span className="min-w-0 truncate text-xs text-muted">{shared.join(' · ')}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card title="Ознаке">
            <div className="flex flex-wrap gap-1.5">
              {entry.tags.map((t) => (
                <Link
                  key={t}
                  to={`${paths.guidelines()}?q=${encodeURIComponent(t)}`}
                  className="inline-flex min-h-8 items-center rounded-full border border-line bg-surface px-3 text-sm text-muted hover:border-accent hover:text-accent"
                >
                  {t}
                </Link>
              ))}
            </div>
          </Card>

        </aside>
      </div>

      <FeedbackWidget moduleId="smernice-detalj" />
    </>
  );
}
