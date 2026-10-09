import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { GanttChart, List } from 'lucide-react';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { Button, Card, Segmented } from '@/components/ui';
import type { Project } from '@/domain/types';
import { useCurrentProject } from '@/features/project/useCurrentProject';
import { useAppStore, useProjectDecisions } from '@/store';
import { CumulativeImpactCard } from './CumulativeImpactCard';
import { DecisionList } from './DecisionList';
import { DecisionSheet } from './DecisionSheet';
import { DecisionTimeline } from './DecisionTimeline';
import { openConditionCount } from './decisionsLogic';

type View = 'timeline' | 'list';
const MOBILE_LIMIT = 5;

/**
 * `/projekti/:id/odluke` — decision log (Design Decision Records) as timeline or list (CONCEPT §6.9).
 * Deep link: `?decision=<id>` opens the record (used by the gate review).
 */
export function DecisionsTab() {
  const project = useCurrentProject();
  return <DecisionsBody key={project.id} project={project} />;
}

function DecisionsBody({ project }: { project: Project }) {
  const decisions = useProjectDecisions(project.id);
  const removeUserDecision = useAppStore((s) => s.removeUserDecision);
  const [view, setView] = useState<View>('timeline');
  const [showAll, setShowAll] = useState(false);
  const [params, setParams] = useSearchParams();

  const open = decisions.find((d) => d.id === params.get('decision')) ?? null;
  const setOpen = (id: string | null) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (id) next.set('decision', id);
        else next.delete('decision');
        return next;
      },
      { replace: true },
    );

  const proposed = decisions.filter((d) => d.status === 'proposed').length;
  const openConditions = decisions.reduce((s, d) => s + openConditionCount(d), 0);

  // Long timelines are cut on every width (the list view shows everything); the open record is always included.
  const openIndex = open ? decisions.findIndex((d) => d.id === open.id) : -1;
  const limit = showAll ? decisions.length : Math.max(MOBILE_LIMIT + 1, openIndex + 1);
  const timelineItems = decisions.slice(0, limit);

  return (
    <div className="flex flex-col gap-6">
      <Card
        title="Дневник одлука"
        subtitle={`${project.shortName} · ${decisions.length} одлука · ${proposed} ${proposed === 1 ? 'предлог' : 'предлога'} · ${openConditions} отворених услова`}
        action={
          <Segmented
            ariaLabel="Приказ одлука"
            options={[
              { value: 'timeline', label: 'Временска линија', icon: GanttChart },
              { value: 'list', label: 'Листа', icon: List },
            ]}
            value={view}
            onChange={setView}
          />
        }
        className="[&>header]:flex-col [&>header]:gap-3 sm:[&>header]:flex-row"
      >
        {decisions.length === 0 ? (
          <p className="text-sm text-muted">Још нема забележених одлука за овај пројекат.</p>
        ) : view === 'timeline' ? (
          <>
            <DecisionTimeline decisions={timelineItems} selectedId={open?.id ?? null} onOpen={setOpen} onDelete={removeUserDecision} />
            {decisions.length > timelineItems.length && (
              <Button variant="secondary" fullWidth className="mt-4" onClick={() => setShowAll(true)}>
                Прикажи још {decisions.length - timelineItems.length}
              </Button>
            )}
            {showAll && decisions.length > MOBILE_LIMIT + 1 && (
              <Button variant="ghost" fullWidth className="mt-2" onClick={() => setShowAll(false)}>
                Прикажи мање
              </Button>
            )}
          </>
        ) : (
          <DecisionList decisions={decisions} selectedId={open?.id ?? null} onOpen={setOpen} />
        )}
      </Card>

      <CumulativeImpactCard decisions={decisions} />

      <FeedbackWidget moduleId="projekat-odluke" className="mt-2!" />
      <DecisionSheet decision={open} onClose={() => setOpen(null)} onDelete={removeUserDecision} />
    </div>
  );
}
