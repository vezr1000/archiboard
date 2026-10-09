import { FolderSearch } from 'lucide-react';
import { Outlet, useParams } from 'react-router';
import { paths, PROJECT_TABS } from '@/components/layout/navigation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { HealthBadge } from '@/components/ui/HealthBadge';
import { PageHeader } from '@/components/ui/PageHeader';
import { PhasePill } from '@/components/ui/PhasePill';
import { RouteTabs } from '@/components/ui/Tabs';
import { getProject } from '@/data';
import { SCHEME_LABELS } from '@/domain/labels';
import type { ProjectOutletContext } from './useCurrentProject';

/**
 * `/projekti/:id/*` — project cockpit shell: header + route-driven module tabs + tab outlet.
 * STEP 3 may enrich the header (address, GFA, client …) but keeps this structure.
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
        back={{ to: paths.projects(), label: 'Пројекти' }}
        eyebrow={`${project.city} · ${project.typologyLabel.split(',')[0]}`}
        title={project.name}
        meta={
          <>
            <PhasePill phase={project.phase} />
            <HealthBadge health={project.health} />
            {cert.scheme !== 'none' && (
              <Badge tone="accent">
                {SCHEME_LABELS[cert.scheme]} {cert.targetLevel}
              </Badge>
            )}
          </>
        }
        className="mb-4 md:mb-5"
      />
      <RouteTabs
        ariaLabel="Модули пројекта"
        items={PROJECT_TABS.map((t) => ({ to: paths.project(project.id, t.slug), label: t.short }))}
        className="mb-6"
      />
      <Outlet context={context} />
    </>
  );
}
