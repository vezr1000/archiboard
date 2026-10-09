import { PhaseTimeline } from '@/components/charts';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { Card } from '@/components/ui';
import { attentionFor, sessionsForProject } from '@/data';
import { PHASE_LABELS } from '@/domain/labels';
import type { GateId } from '@/domain/types';
import { formatPct } from '@/lib/format';
import { useProjectDecisions } from '@/store';
import { AttentionList } from '@/features/portfolio/AttentionList';
import { ActivityCard, CertificationCard, KpiTilesCard, LatestDecisionsCard, NextGateCard, TopRisksCard } from './OverviewCards';
import { useCurrentProject } from './useCurrentProject';

/**
 * `/projekti/:id/pregled` — project overview (CONCEPT §6.2).
 * Mobile: one column. Desktop: 3-column grid (wide cards span 2). Every card tolerates missing data
 * (e.g. the park has no GFA, energy class or storeys).
 */
export function OverviewTab() {
  const project = useCurrentProject();
  const decisions = useProjectDecisions(project.id);
  const attention = attentionFor(project.id);

  // Gate dates from the project's board sessions (newest session per gate wins; sessions are newest first).
  const gates: Partial<Record<GateId, { date: string }>> = {};
  for (const s of sessionsForProject(project.id)) if (!gates[s.gate]) gates[s.gate] = { date: s.date };

  return (
    <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
      {attention.length > 0 && (
        <Card title="Захтева пажњу" subtitle={`${attention.length} ${attention.length === 1 ? 'ставка' : 'ставки'} за овај пројекат`} className="lg:col-span-3">
          <AttentionList items={attention} showProject={false} />
        </Card>
      )}

      <Card
        title="Фазе и капије"
        subtitle={`Тренутно: ${PHASE_LABELS[project.phase].long} · ${formatPct(project.phaseProgress, { ratio: true, decimals: 0 })} завршено`}
        className="lg:col-span-3"
      >
        <PhaseTimeline current={project.phase} progress={project.phaseProgress} gates={gates} />
      </Card>

      <div className="min-w-0 lg:col-span-2">
        <KpiTilesCard project={project} />
      </div>
      <div className="min-w-0">
        <CertificationCard project={project} />
      </div>

      <div className="min-w-0 lg:col-span-2">
        <NextGateCard project={project} />
      </div>
      <div className="min-w-0">
        <LatestDecisionsCard project={project} decisions={decisions} />
      </div>

      <div className="min-w-0">
        <TopRisksCard project={project} />
      </div>
      <div className="min-w-0 lg:col-span-2">
        <ActivityCard project={project} />
      </div>

      <div className="lg:col-span-3">
        <FeedbackWidget moduleId="projekat-pregled" />
      </div>
    </div>
  );
}
