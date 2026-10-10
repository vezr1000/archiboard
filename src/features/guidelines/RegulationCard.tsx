import { Link } from 'react-router';
import { ArrowUpRight, Building, ListChecks, Star } from 'lucide-react';
import { Badge } from '@/components/ui';
import { projects, requirementsForRegulation } from '@/data';
import { JURISDICTION_LABELS, REGULATION_KIND_LABELS } from '@/domain/labels';
import type { Regulation } from '@/domain/types';
import { cn } from '@/lib/cn';
import { appliesToLabels, appliesToProjects, isFirmGuideline, KIND_TONE } from './guidelinesLogic';

/** Number of project requirements („Услови и ограничења“) that cite the entry. */
export const linkedRequirementCount = (id: string): number => requirementsForRegulation(id).length;

export function pluralRequirements(n: number): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return `${n} услов у пројектима`;
  return `${n} услова у пројектима`;
}

/** Library entry card. Firm guidelines („Смернице фирме“) get a warmer clay style and a „Стандард фирме“ badge. */
export function RegulationCard({ entry }: { entry: Regulation }) {
  const firm = isFirmGuideline(entry);
  const applies = appliesToProjects(entry);
  const { labels, more, all } = appliesToLabels(applies, projects.length);
  const reqCount = linkedRequirementCount(entry.id);

  return (
    <Link
      to={`/smernice/${entry.id}`}
      className={cn(
        'group flex h-full min-w-0 flex-col rounded-2xl border p-4 transition-colors hover:shadow-soft md:p-5',
        firm ? 'border-clay/35 bg-clay-soft/60 hover:border-clay' : 'border-line bg-surface hover:border-line-strong',
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
        {firm ? (
          <Badge tone="clay" size="sm" variant="solid" icon={Star}>
            Стандард фирме
          </Badge>
        ) : (
          <Badge tone={KIND_TONE[entry.kind]} size="sm">
            {REGULATION_KIND_LABELS[entry.kind]}
          </Badge>
        )}
        <span className="tabular ml-auto text-xs text-muted">
          {JURISDICTION_LABELS[entry.jurisdiction]} · {entry.year}.
        </span>
      </div>

      <p className="tabular mt-3 truncate text-xs text-muted" title={entry.code}>
        {entry.code}
      </p>
      <h3 className="mt-0.5 line-clamp-3 font-display text-[1.05rem] leading-snug text-ink group-hover:text-accent">{entry.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{entry.summary}</p>

      <div className="mt-auto flex min-w-0 flex-col gap-2 pt-3">
        {(all || labels.length > 0) && (
          <div className="flex min-w-0 flex-wrap items-center gap-1.5" aria-label="Важи за пројекте">
            <Building className="size-3.5 shrink-0 text-muted" aria-hidden />
            {all ? (
              <Badge size="sm">Сви пројекти</Badge>
            ) : (
              <>
                {labels.map((l) => (
                  <Badge key={l} size="sm" variant="outline">
                    {l}
                  </Badge>
                ))}
                {more > 0 && <span className="text-xs text-muted">+{more}</span>}
              </>
            )}
          </div>
        )}
        <div className="flex min-w-0 items-center justify-between gap-2 text-xs text-muted">
          {reqCount > 0 ? (
            <span className="inline-flex min-w-0 items-center gap-1">
              <ListChecks className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">{pluralRequirements(reqCount)}</span>
            </span>
          ) : (
            <span />
          )}
          <span className="inline-flex shrink-0 items-center gap-0.5 font-medium text-accent">
            Детаљи <ArrowUpRight className="size-3.5" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}
