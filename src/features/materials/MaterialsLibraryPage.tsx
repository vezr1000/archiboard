import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { ModulePlaceholder } from '@/components/layout/ModulePlaceholder';
import { PageHeader } from '@/components/ui/PageHeader';

/** `/materijali` — global EPD library. STEP 7 implements (CONCEPT §6.7). */
export function MaterialsLibraryPage() {
  return (
    <>
      <PageHeader eyebrow="Материјали" title="EPD библиотека" subtitle="Материјали са еколошким декларацијама (EPD), пореклом и потенцијалом поновне употребе." />
      <ModulePlaceholder step={7} description="Претрага и филтери по категорији, GWP опсегу и пореклу." />
      <FeedbackWidget moduleId="materijali" />
    </>
  );
}
