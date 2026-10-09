import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { ModulePlaceholder } from '@/components/layout/ModulePlaceholder';
import { PageHeader } from '@/components/ui/PageHeader';

/** `/povratne-informacije` — presenter feedback summary. STEP 12 implements (CONCEPT §6.15). */
export function FeedbackSummaryPage() {
  return (
    <>
      <PageHeader eyebrow="Демо · алат за презентера" title="Повратне информације" subtitle="Које функције архитекти највише цене — збирно по модулима." />
      <ModulePlaceholder step={12} description="Рангирани преглед по модулима, ознака сесије, извоз у CSV/JSON и брисање." />
      <FeedbackWidget moduleId="povratne-informacije" />
    </>
  );
}
