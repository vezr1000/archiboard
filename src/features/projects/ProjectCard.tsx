import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { PhaseTimeline } from '@/components/charts';
import { paths } from '@/components/layout/navigation';
import { Badge, HealthBadge, PhasePill, ProgressBar } from '@/components/ui';
import { GATE_LABELS, SCHEME_LABELS, TYPOLOGY_LABELS } from '@/domain/labels';
import type { Project } from '@/domain/types';
import { formatRelative } from '@/lib/format';
import { miniKpisFor } from './miniKpis';
import { ProjectCover } from './ProjectCover';

/**
 * Portfolio card. The whole card is a link to the project cockpit.
 * Cover illustration · name, place · chips · three mini KPI bars with target marker · next gate.
 */
export function ProjectCard({ project }: { project: Project }) {
  const bars = miniKpisFor(project);
  const { gate, date } = project.nextGate;
  const cert = project.certification;
  return (
    <Link
      to={paths.project(project.id)}
      className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-colors hover:border-line-strong hover:shadow-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <ProjectCover project={project} className="h-20" />
      <div className="flex flex-1 flex-col gap-3.5 p-4">
        <div className="min-w-0">
          <h3 className="font-display text-lg leading-snug text-ink group-hover:underline">{project.name}</h3>
          <p className="mt-0.5 truncate text-sm text-muted">
            {project.city} · {TYPOLOGY_LABELS[project.typology]}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <PhasePill phase={project.phase} />
          <HealthBadge health={project.health} />
          {cert.scheme !== 'none' && (
            <Badge tone="accent" variant="outline">
              {SCHEME_LABELS[cert.scheme]} {cert.targetLevel}
            </Badge>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          {bars.map((b) => (
            <ProgressBar
              key={b.id}
              label={
                b.unit ? (
                  <>
                    {b.label} <span className="text-xs">{b.unit}</span>
                  </>
                ) : (
                  b.label
                )
              }
              valueLabel={b.valueLabel}
              value={b.value}
              max={b.max}
              target={b.target}
              tone={b.tone}
              size="sm"
            />
          ))}
        </div>

        <PhaseTimeline current={project.phase} progress={project.phaseProgress} gates={{ [gate]: { date } }} variant="compact" />

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3 text-sm">
          <span className="min-w-0 truncate text-muted">
            Следећа капија: <span className="font-medium text-ink">{GATE_LABELS[gate].full}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1 text-ink">
            {formatRelative(date)}
            <ArrowRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}
