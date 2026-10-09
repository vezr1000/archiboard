import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { ModulePlaceholder } from '@/components/layout/ModulePlaceholder';
import { PageHeader } from '@/components/ui/PageHeader';

/** `/tim` — firm people, competencies, workload. STEP 9 implements (CONCEPT §6.12). */
export function TeamPage() {
  return (
    <>
      <PageHeader eyebrow="Студио Градина" title="Тим фирме" subtitle="Људи, компетенције, лиценце и ангажовање по пројектима." />
      <ModulePlaceholder step={9} description="Матрица компетенција и оптерећење (упозорење на преоптерећење)." />
      <FeedbackWidget moduleId="tim" />
    </>
  );
}
