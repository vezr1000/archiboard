import { CircleAlert, ChevronRight, Info, TriangleAlert } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router';
import { paths, type ProjectTabSlug } from '@/components/layout/navigation';
import { Badge } from '@/components/ui';
import { TONE_CLASSES } from '@/components/ui/tone';
import { getProject } from '@/data';
import { FINDING_SEVERITY_LABELS, FINDING_SEVERITY_TONE } from '@/domain/labels';
import type { AttentionItem, FindingSeverity } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatRelative } from '@/lib/format';

const ICON: Record<FindingSeverity, LucideIcon> = { critical: CircleAlert, warning: TriangleAlert, info: Info };

/**
 * „Захтева пажњу“ rows. Each row links into the relevant project tab.
 * `showProject={false}` omits the project name (inside a project cockpit).
 */
export function AttentionList({ items, showProject = true }: { items: AttentionItem[]; showProject?: boolean }) {
  return (
    <ul className="-mx-2 flex flex-col divide-y divide-line">
      {items.map((item) => {
        const Icon = ICON[item.severity];
        const tone = FINDING_SEVERITY_TONE[item.severity];
        const project = getProject(item.projectId);
        const tab = (item.tab ?? 'pregled') as ProjectTabSlug;
        return (
          <li key={item.id}>
            <Link
              to={paths.project(item.projectId, tab)}
              className="flex min-h-14 items-start gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-surface-2"
            >
              <span className={cn('mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full', TONE_CLASSES[tone].soft)}>
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium leading-snug text-ink">{item.title}</span>
                {item.detail && <span className="mt-0.5 line-clamp-2 block text-sm text-muted">{item.detail}</span>}
                <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                  <Badge tone={tone} size="sm">
                    {FINDING_SEVERITY_LABELS[item.severity]}
                  </Badge>
                  {showProject && project && <span>{project.shortName}</span>}
                  <span>{formatRelative(item.date)}</span>
                </span>
              </span>
              <ChevronRight className="mt-2 size-4 shrink-0 text-muted" aria-hidden />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
