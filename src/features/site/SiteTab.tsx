import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { EmptyState } from '@/components/ui';
import { siteForProject } from '@/data';
import { useCurrentProject } from '@/features/project/useCurrentProject';
import { AiExtractionCard } from './AiExtractionCard';
import { RequirementsCard } from './RequirementsCard';
import { ClimateCard, HazardsCard, SiteCard, UrbanParamsCard } from './SiteCards';

/**
 * `/projekti/:id/lokacija` — site, climate, hazards, urban parameters, requirements checklist and the
 * ★ AI extraction demo (CONCEPT §6.3). Mobile: one column. Desktop: 3-column grid.
 */
export function SiteTab() {
  const project = useCurrentProject();
  const site = siteForProject(project.id);

  if (!site) {
    return (
      <>
        <EmptyState title="Подаци о локацији још нису унети" description="За овај пројекат нема климатских података, хазарда ни урбанистичких параметара." />
        <FeedbackWidget moduleId="projekat-lokacija" />
      </>
    );
  }

  return (
    <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
      <div className="min-w-0">
        <SiteCard project={project} site={site} />
      </div>
      <div className="min-w-0 lg:col-span-2">
        <ClimateCard project={project} site={site} />
      </div>

      <div className="min-w-0">
        <HazardsCard site={site} />
      </div>
      <div className="min-w-0 lg:col-span-2">
        <UrbanParamsCard site={site} />
      </div>

      <div className="min-w-0 lg:col-span-3">
        <AiExtractionCard project={project} />
      </div>
      <div className="min-w-0 lg:col-span-3">
        <RequirementsCard project={project} />
      </div>

      <div className="lg:col-span-3">
        <FeedbackWidget moduleId="projekat-lokacija" />
      </div>
    </div>
  );
}
