import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { ModulePlaceholder } from '@/components/layout/ModulePlaceholder';
import { getProjectTab, type ProjectTabSlug } from '@/components/layout/navigation';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useCurrentProject } from './useCurrentProject';

/** Temporary body for a project cockpit tab. Each tab file replaces this in its build step. */
export function ProjectTabPlaceholder({ slug, description }: { slug: ProjectTabSlug; description?: string }) {
  const project = useCurrentProject();
  const tab = getProjectTab(slug)!;
  return (
    <>
      <SectionHeader title={tab.label} subtitle={project.shortName} />
      <ModulePlaceholder step={tab.step} description={description} />
      <FeedbackWidget moduleId={tab.moduleId} />
    </>
  );
}
