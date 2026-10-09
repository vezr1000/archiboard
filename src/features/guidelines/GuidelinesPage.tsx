import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { ModulePlaceholder } from '@/components/layout/ModulePlaceholder';
import { PageHeader } from '@/components/ui/PageHeader';

/** `/smernice` — knowledge library + AI Q&A. STEP 11 implements (CONCEPT §6.14). */
export function GuidelinesPage() {
  return (
    <>
      <PageHeader eyebrow="Библиотека знања" title="Смернице и прописи" subtitle="Закони, правилници, стандарди, сертификациони системи и смернице фирме на једном месту." />
      <ModulePlaceholder step={11} description="Библиотека са претрагом и филтерима и „Питај АрхиБорд“ (АИ демо)." />
      <FeedbackWidget moduleId="smernice" />
    </>
  );
}
