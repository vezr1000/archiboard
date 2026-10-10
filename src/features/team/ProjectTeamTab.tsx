import { useMemo, useState } from 'react';
import { TriangleAlert, Users } from 'lucide-react';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { Avatar, Badge, Button, Card, EmptyState, ProgressBar, useMediaQuery } from '@/components/ui';
import { teamForProject } from '@/data';
import { DISCIPLINE_LABELS } from '@/domain/labels';
import type { Person, Project } from '@/domain/types';
import { useCurrentProject } from '@/features/project/useCurrentProject';
import { formatNumber, formatPct } from '@/lib/format';
import { CompetencyCoverageCard } from './CompetencyCoverageCard';
import { PersonSheet } from './PersonSheet';
import { coverageOf, isOverallocated, pctOnProject, totalPct } from './teamLogic';

/** `/projekti/:id/tim` — project team and competency coverage (CONCEPT §6.12). */
export function ProjectTeamTab() {
  const project = useCurrentProject();
  return <TeamBody key={project.id} project={project} />;
}

const MOBILE_LIMIT = 6;

function TeamBody({ project }: { project: Project }) {
  const isPhone = useMediaQuery('(max-width: 767px)');
  const [showAll, setShowAll] = useState(false);
  const [openPerson, setOpenPerson] = useState<Person | null>(null);
  // Lead first, then biggest allocation on this project.
  const team = useMemo(() => {
    const all = teamForProject(project.id);
    return [...all].sort(
      (a, b) => Number(b.id === project.leadArchitectId) - Number(a.id === project.leadArchitectId) || pctOnProject(b, project.id) - pctOnProject(a, project.id),
    );
  }, [project]);
  const coverage = useMemo(() => coverageOf(project, team), [project, team]);

  if (team.length === 0) {
    return (
      <>
        <EmptyState icon={Users} title="Тим још није формиран" description="За овај пројекат нису додељени чланови тима." />
        <FeedbackWidget moduleId="projekat-tim" />
      </>
    );
  }

  const fte = team.reduce((s, p) => s + pctOnProject(p, project.id), 0) / 100;
  const limit = isPhone && !showAll ? MOBILE_LIMIT : team.length;
  const overloaded = team.filter(isOverallocated).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        <Card
          title="Пројектни тим"
          subtitle={`${team.length} људи · ${formatNumber(fte, 1)} FTE на пројекту`}
          action={
            overloaded > 0 ? (
              <Badge tone="warn" icon={TriangleAlert}>
                {overloaded} преоптерећено
              </Badge>
            ) : undefined
          }
          className="order-2 lg:order-1"
        >
          <ul className="grid gap-2.5 md:grid-cols-2">
            {team.slice(0, limit).map((p) => (
              <li key={p.id} className="min-w-0">
                <MemberCard person={p} project={project} onOpen={setOpenPerson} />
              </li>
            ))}
          </ul>
          {isPhone && team.length > MOBILE_LIMIT && (
            <Button variant="secondary" fullWidth className="mt-3" onClick={() => setShowAll((v) => !v)}>
              {limit < team.length ? `Прикажи још ${team.length - limit}` : 'Прикажи мање'}
            </Button>
          )}
        </Card>
        <div className="order-1 lg:order-2">
          <CompetencyCoverageCard coverage={coverage} onOpenPerson={setOpenPerson} />
        </div>
      </div>
      <FeedbackWidget moduleId="projekat-tim" className="mt-2!" />
      <PersonSheet person={openPerson} onClose={() => setOpenPerson(null)} />
    </div>
  );
}

function MemberCard({ person: p, project, onOpen }: { person: Person; project: Project; onOpen: (p: Person) => void }) {
  const here = pctOnProject(p, project.id);
  const total = totalPct(p);
  const over = isOverallocated(p);
  const lead = p.id === project.leadArchitectId;
  return (
    <button
      type="button"
      onClick={() => onOpen(p)}
      className="flex h-full w-full min-w-0 flex-col gap-2.5 rounded-2xl border border-line p-3 text-left transition-colors hover:border-line-strong hover:bg-surface-2/40"
    >
      <span className="flex items-start gap-3">
        <Avatar person={p} size="md" showTitle={false} />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="font-medium text-ink">{p.name}</span>
            {lead && (
              <Badge tone="accent" size="sm">
                водећи
              </Badge>
            )}
          </span>
          <span className="block text-xs text-muted">{p.role}</span>
          <span className="block text-xs text-muted">{DISCIPLINE_LABELS[p.discipline]}</span>
        </span>
      </span>
      {(p.licences.length > 0 || p.certifications.length > 0) && (
        <span className="flex flex-wrap gap-1">
          {p.licences.map((l) => (
            <Badge key={l} tone="accent" variant="outline" size="sm">
              {l}
            </Badge>
          ))}
          {p.certifications.map((c) => (
            <Badge key={c} tone="info" size="sm">
              {c}
            </Badge>
          ))}
        </span>
      )}
      <span className="mt-auto block">
        <ProgressBar label="На овом пројекту" valueLabel={formatPct(here, { decimals: 0 })} value={here} max={100} size="xs" tone="accent" />
        <span className="mt-1.5 flex items-center justify-between gap-2 text-xs">
          <span className="text-muted">Укупно на свим пројектима</span>
          <span className={over ? 'tabular inline-flex items-center gap-1 font-semibold text-bad' : 'tabular font-medium text-ink'}>
            {over && <TriangleAlert className="size-3.5" aria-hidden />}
            {formatPct(total, { decimals: 0 })}
          </span>
        </span>
      </span>
    </button>
  );
}
