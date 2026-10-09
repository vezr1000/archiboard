import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { ModulePlaceholder } from '@/components/layout/ModulePlaceholder';
import { PageHeader } from '@/components/ui/PageHeader';

/** `/odbor` — board sessions list. STEP 10 implements (CONCEPT §6.13). */
export function BoardPage() {
  return (
    <>
      <PageHeader eyebrow="Одбор за одрживу архитектуру" title="Одбор" subtitle="Састанци одбора по капијама — прошли и предстојећи, са исходима." />
      <ModulePlaceholder step={10} description="Листа састанака са исходима и улазак у ревизију капије." />
      <FeedbackWidget moduleId="odbor" />
    </>
  );
}
