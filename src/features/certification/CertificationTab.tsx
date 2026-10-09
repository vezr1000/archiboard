import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { EmptyState } from '@/components/ui';
import { certificationForProject, criteriaForProject } from '@/data';
import { useCurrentProject } from '@/features/project/useCurrentProject';
import { CategoryCard, CertHeaderCard, NextLevelCard } from './CertCards';
import { CriteriaCard } from './CriteriaCard';
import { buildCertModel } from './certLogic';

/**
 * `/projekti/:id/sertifikacija` — credit tracker (CONCEPT §6.6). Works for DGNB, BREEAM, LEED, EDGE, Passivhaus and the
 * park's internal scorecard (scheme 'none'). Mobile: one column; ≥1024px: header + „next level“ side by side.
 */
export function CertificationTab() {
  const project = useCurrentProject();
  const tracker = certificationForProject(project.id);

  if (!tracker) {
    return (
      <>
        <EmptyState title="Сертификација није дефинисана" description="За овај пројекат још нема праћења кредита ни критеријума." />
        <FeedbackWidget moduleId="projekat-sertifikacija" />
      </>
    );
  }

  const model = buildCertModel(project, tracker);
  const criteria = criteriaForProject(project.id);

  return (
    <div className="grid gap-4 md:gap-6 lg:grid-cols-5">
      <div className="min-w-0 lg:col-span-2">
        <CertHeaderCard model={model} criteria={criteria} />
      </div>
      <div className="min-w-0 lg:col-span-3">
        <NextLevelCard model={model} criteria={criteria} />
      </div>
      <div className="min-w-0 lg:col-span-5">
        <CategoryCard model={model} />
      </div>
      <div className="min-w-0 lg:col-span-5">
        <CriteriaCard model={model} criteria={criteria} />
      </div>
      <div className="lg:col-span-5">
        <FeedbackWidget moduleId="projekat-sertifikacija" />
      </div>
    </div>
  );
}
