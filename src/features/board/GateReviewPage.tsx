import { useParams } from 'react-router';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { paths } from '@/components/layout/navigation';
import { ModulePlaceholder } from '@/components/layout/ModulePlaceholder';
import { PageHeader } from '@/components/ui/PageHeader';
import { getProject, getSession } from '@/data';
import { GATE_LABELS } from '@/domain/labels';

/** `/odbor/:sessionId` — gate review stepper. STEP 10 implements (CONCEPT §6.13). */
export function GateReviewPage() {
  const { sessionId } = useParams();
  const session = getSession(sessionId);
  const project = getProject(session?.projectId);
  return (
    <>
      <PageHeader
        back={{ to: paths.board(), label: 'Одбор' }}
        eyebrow={session ? GATE_LABELS[session.gate].full : 'Ревизија капије'}
        title={project ? project.name : 'Ревизија капије'}
        subtitle="Припрема → Документација → KPI провера → АИ пре-ревизија → Услови → Одлука"
      />
      <ModulePlaceholder step={10} description="Корак-по-корак ревизија капије са гласањем чланова одбора и записником." />
      <FeedbackWidget moduleId="odbor-revizija" />
    </>
  );
}
