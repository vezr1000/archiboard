import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { paths } from '@/components/layout/navigation';
import { ModulePlaceholder } from '@/components/layout/ModulePlaceholder';
import { HealthBadge } from '@/components/ui/HealthBadge';
import { PageHeader } from '@/components/ui/PageHeader';
import { PhasePill } from '@/components/ui/PhasePill';
import { projects } from '@/data';

/** `/projekti` — project list with filters. STEP 3 implements; the temporary list below only enables navigation. */
export function ProjectsPage() {
  return (
    <>
      <PageHeader eyebrow="Портфолио" title="Пројекти" subtitle="Сви активни пројекти студија са фазом, здрављем и циљем сертификације." />
      <ModulePlaceholder step={3} description="Листа пројеката са филтерима (фаза, град, здравље, сертификација).">
        <ul className="flex flex-col gap-2">
          {projects.map((p) => (
            <li key={p.id}>
              <Link
                to={paths.project(p.id)}
                className="flex min-h-12 items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2 hover:border-line-strong"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-ink">{p.name}</span>
                  <span className="block truncate text-xs text-muted">{p.city}</span>
                </span>
                <PhasePill phase={p.phase} size="sm" />
                <HealthBadge health={p.health} size="sm" className="hidden sm:inline-flex" />
                <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </ModulePlaceholder>
      <FeedbackWidget moduleId="projekti" />
    </>
  );
}
