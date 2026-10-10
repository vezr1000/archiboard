import { useMemo, useState } from 'react';
import { Handshake } from 'lucide-react';
import { QuadrantGrid } from '@/components/charts';
import { Legend } from '@/components/charts/Legend';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { Card, EmptyState, FilterChips } from '@/components/ui';
import { toneVar } from '@/components/ui/tone';
import { ATTITUDE_LABELS, ATTITUDE_TONE } from '@/domain/labels';
import type { Project, StakeholderAttitude } from '@/domain/types';
import { useCurrentProject } from '@/features/project/useCurrentProject';
import { useProjectStakeholders } from '@/store';
import { NextActionsCard } from './NextActionsCard';
import { StakeholderList } from './StakeholderList';
import { StakeholderSheet } from './StakeholderSheet';
import {
  ATTITUDE_ORDER,
  GROUP_LABELS,
  GROUP_ORDER,
  groupOf,
  gridPosition,
  nextActionsOf,
  QUADRANTS,
  sortByImportance,
  type StakeholderGroup,
} from './stakeholdersLogic';

/** `/projekti/:id/akteri` — influence/interest map, next obligations, stakeholder register (CONCEPT §6.11). */
export function StakeholdersTab() {
  const project = useCurrentProject();
  return <StakeholdersBody key={project.id} project={project} />;
}

function StakeholdersBody({ project }: { project: Project }) {
  const stakeholders = useProjectStakeholders(project.id);
  const sorted = useMemo(() => sortByImportance(stakeholders), [stakeholders]);
  const numbers = useMemo(() => new Map(sorted.map((s, i) => [s.id, i + 1])), [sorted]);
  const [attitude, setAttitude] = useState<StakeholderAttitude | null>(null);
  const [group, setGroup] = useState<StakeholderGroup | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  if (stakeholders.length === 0) {
    return (
      <>
        <EmptyState icon={Handshake} title="Нема унетих заинтересованих страна" description="За овај пројекат још није направљена мапа актера." />
        <FeedbackWidget moduleId="projekat-akteri" />
      </>
    );
  }

  const filtered = sorted.filter((s) => (!attitude || s.attitude === attitude) && (!group || groupOf(s) === group));
  const nextActions = nextActionsOf(stakeholders, project);
  const open = stakeholders.find((s) => s.id === openId) ?? null;
  const filtering = attitude !== null || group !== null;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <Card title="Мапа утицаја" subtitle="Утицај × интерес · додирните тачку за детаље">
          <QuadrantGrid
            title="Мапа утицаја и интереса заинтересованих страна"
            xLabel="Интерес"
            yLabel="Утицај"
            quadrants={QUADRANTS}
            showList={false}
            selectedId={openId ?? undefined}
            onItemClick={(it) => setOpenId(it.id)}
            items={sorted.map((s) => ({ id: s.id, label: s.name, x: gridPosition(s.interest), y: gridPosition(s.influence), tone: ATTITUDE_TONE[s.attitude] }))}
          />
          <Legend
            className="mt-3"
            items={ATTITUDE_ORDER.map((a) => ({ label: ATTITUDE_LABELS[a], color: toneVar(ATTITUDE_TONE[a]), shape: 'dot' as const }))}
          />
          <p className="mt-2 text-xs text-muted">Бројеви одговарају листи испод (по утицају). Вредност 3 рачуна се као висока.</p>
        </Card>

        <div className="flex min-w-0 flex-col gap-4">
          <Card title="Преглед" subtitle={`${stakeholders.length} страна · додирните за филтер листе`}>
            <div className="flex flex-col gap-3">
              <div>
                <h4 className="mb-1.5 text-xs font-medium text-muted">Став</h4>
                <FilterChips
                  wrap
                  ariaLabel="Став заинтересоване стране"
                  value={attitude}
                  onChange={setAttitude}
                  options={ATTITUDE_ORDER.map((a) => ({ value: a, label: ATTITUDE_LABELS[a], count: stakeholders.filter((s) => s.attitude === a).length })).filter((o) => o.count > 0)}
                />
              </div>
              <div>
                <h4 className="mb-1.5 text-xs font-medium text-muted">Група</h4>
                <FilterChips
                  ariaLabel="Група заинтересованих страна"
                  value={group}
                  onChange={setGroup}
                  options={GROUP_ORDER.map((g) => ({ value: g, label: GROUP_LABELS[g], count: stakeholders.filter((s) => groupOf(s) === g).length })).filter((o) => o.count > 0)}
                />
              </div>
            </div>
          </Card>
          <NextActionsCard items={nextActions} numbers={numbers} onOpen={setOpenId} />
        </div>
      </div>

      <Card title="Заинтересоване стране" subtitle={filtering ? `${filtered.length} од ${stakeholders.length}` : `${stakeholders.length} страна · сортирано по утицају`}>
        <StakeholderList rows={filtered} numbers={numbers} selectedId={openId} onOpen={setOpenId} />
      </Card>

      <FeedbackWidget moduleId="projekat-akteri" className="mt-2!" />
      <StakeholderSheet stakeholder={open} project={project} onClose={() => setOpenId(null)} />
    </div>
  );
}
