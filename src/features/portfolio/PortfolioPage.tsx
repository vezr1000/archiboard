import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { ModulePlaceholder } from '@/components/layout/ModulePlaceholder';
import { PageHeader } from '@/components/ui/PageHeader';
import { FIRM } from '@/data';

/** `/` — board home. STEP 3 implements (CONCEPT §6.1). */
export function PortfolioPage() {
  return (
    <>
      <PageHeader eyebrow={FIRM.name} title="Портфолио" subtitle="Здравље портфолија, предстојеће капије и пројекти који одступају од циљева." />
      <ModulePlaceholder step={3} description="KPI трака портфолија, картице пројеката, „Захтева пажњу“, угљенични буџет." />
      <FeedbackWidget moduleId="portfolio" />
    </>
  );
}
