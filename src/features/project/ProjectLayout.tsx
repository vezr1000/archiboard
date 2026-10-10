import type { ReactNode } from 'react';
import { FolderSearch, MapPin } from 'lucide-react';
import { Outlet, useParams } from 'react-router';
import { RouteSuspense } from '@/components/layout/PageFallback';
import { paths, PROJECT_TABS } from '@/components/layout/navigation';
import { Avatar, Badge, Button, EmptyState, HealthBadge, PageHeader, PhasePill, RouteTabs } from '@/components/ui';
import { getPerson, getProject } from '@/data';
import { SCHEME_LABELS, TYPOLOGY_LABELS } from '@/domain/labels';
import type { Project } from '@/domain/types';
import { formatArea } from '@/lib/format';
import type { ProjectOutletContext } from './useCurrentProject';

/**
 * `/projekti/:id/*` — project cockpit shell: header (breadcrumb, name, address, chips, key facts) +
 * route-driven module tabs + tab outlet. Kept compact on phones so the tabs stay near the top.
 */
export function ProjectLayout() {
  const { id } = useParams();
  const project = getProject(id);

  if (!project) {
    return (
      <EmptyState
        icon={FolderSearch}
        title="Пројекат није пронађен"
        description="Проверите адресу или изаберите пројекат са листе."
        action={<Button to={paths.projects()}>Сви пројекти</Button>}
      />
    );
  }

  const cert = project.certification;
  const context: ProjectOutletContext = { project };
  return (
    <>
      <PageHeader
        className="mb-3! md:mb-4!"
        back={{ to: paths.projects(), label: 'Пројекти' }}
        eyebrow={`${project.city} · ${TYPOLOGY_LABELS[project.typology]}`}
        title={project.name}
        subtitle={
          <span className="inline-flex items-start gap-1.5">
            <MapPin className="mt-1 size-4 shrink-0" aria-hidden />
            <span>{project.address}</span>
          </span>
        }
        meta={
          <>
            <PhasePill phase={project.phase} />
            <HealthBadge health={project.health} />
            {cert.scheme !== 'none' ? (
              <Badge tone="accent">
                {SCHEME_LABELS[cert.scheme]} {cert.targetLevel}
              </Badge>
            ) : (
              <Badge tone="accent" variant="outline">
                Интерни скор · {cert.targetLevel}
              </Badge>
            )}
          </>
        }
      />
      <KeyFacts project={project} />
      <RouteTabs
        ariaLabel="Модули пројекта"
        items={PROJECT_TABS.map((t) => ({ to: paths.project(project.id, t.slug), label: t.short }))}
        className="mb-6"
      />
      <RouteSuspense>
        <Outlet context={context} />
      </RouteSuspense>
    </>
  );
}

/** Compact key-facts row: area, storeys, client, lead architect. Missing facts (park: GFA, storeys) are skipped. */
function KeyFacts({ project }: { project: Project }) {
  const lead = getPerson(project.leadArchitectId);
  const facts: Array<{ label: string; value: ReactNode }> = [];
  if (project.gfaM2 !== undefined) facts.push({ label: 'БРГП', value: formatArea(project.gfaM2) });
  else if (project.siteAreaM2 !== undefined) facts.push({ label: 'Површина интервенције', value: formatArea(project.siteAreaM2, 'auto') });
  if (project.floors) facts.push({ label: 'Спратност', value: project.floors });
  facts.push({ label: 'Инвеститор', value: project.client });
  if (lead)
    facts.push({
      label: 'Водећи архитекта',
      value: (
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <Avatar person={lead} size="xs" showTitle={false} />
          <span className="truncate">{lead.name}</span>
        </span>
      ),
    });
  return (
    <dl className="mb-4 grid grid-cols-2 gap-x-4 gap-y-2.5 rounded-2xl border border-line bg-surface px-4 py-3 md:grid-cols-4">
      {facts.map((f) => (
        <div key={f.label} className="min-w-0">
          <dt className="truncate text-[0.7rem] text-muted">{f.label}</dt>
          <dd className="mt-0.5 line-clamp-2 min-w-0 text-sm leading-snug text-ink">
            {f.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
