import { Link } from 'react-router';
import { Check, ExternalLink, FileText, X } from 'lucide-react';
import { StackedBar, type StackSegment } from '@/components/charts';
import { paths } from '@/components/layout/navigation';
import { Avatar, Badge, Button, Card, ChoiceGroup } from '@/components/ui';
import { getPerson } from '@/data';
import { DISCIPLINE_LABELS, DOCUMENT_STATUS_LABELS, DOCUMENT_STATUS_TONE, DOCUMENT_TYPE_LABELS } from '@/domain/labels';
import type { DocumentReviewMark, ProjectDocument } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatRelative } from '@/lib/format';
import { isDocReady } from '../reviewLogic';
import type { StepProps } from './PrepStep';

const docLink = (projectId: string, docId: string) => `${paths.project(projectId, 'dokumenta')}?doc=${docId}`;

/** Step 2 — Документација: required documents with register status and the reviewer's accept / missing marks. */
export function DocsStep({ project, review, update, docs }: StepProps & { docs: ProjectDocument[] }) {
  const approved = docs.filter((d) => d.status === 'approved').length;
  const inReview = docs.filter((d) => d.status === 'review').length;
  const drafts = docs.filter((d) => !isDocReady(d));
  const ready = approved + inReview;
  const marks = review.documentMarks;
  const acceptedCount = docs.filter((d) => marks[d.id] === 'accepted').length;
  const missingCount = docs.filter((d) => marks[d.id] === 'missing').length;
  const unmarked = docs.length - acceptedCount - missingCount;
  const unmarkedReady = docs.filter((d) => isDocReady(d) && !marks[d.id]);
  const unmarkedDrafts = docs.filter((d) => !isDocReady(d) && !marks[d.id]);

  const setMark = (id: string, mark: DocumentReviewMark) =>
    update((r) => ({ ...r, documentMarks: { ...r.documentMarks, [id]: mark } }));
  const markMany = (list: ProjectDocument[], mark: DocumentReviewMark) =>
    update((r) => ({ ...r, documentMarks: { ...r.documentMarks, ...Object.fromEntries(list.map((d) => [d.id, mark])) } }));

  // Missing (draft) documents first, then in review, then approved — the board looks at problems first.
  const order = { draft: 0, review: 1, approved: 2, superseded: 3 } as const;
  const sorted = [...docs].sort((a, b) => order[a.status] - order[b.status]);

  return (
    <div className="flex flex-col gap-5">
      <Card title="Документација за капију" subtitle="Статус из регистра докумената · спремно = одобрено или на ревизији">
        {docs.length === 0 ? (
          <p className="text-sm text-muted">За ову капију нису одређена обавезна документа.</p>
        ) : (
          <>
            <p className="font-display text-3xl text-ink">
              <span className="tabular">{ready}</span>
              <span className="text-xl text-muted"> од {docs.length}</span> <span className="text-lg">спремно</span>
            </p>
            {drafts.length > 0 && (
              <p className="mt-0.5 text-sm text-warn">
                {drafts.length === 1 ? 'Недостаје 1 документ' : `Недостају ${drafts.length} документа`} (у изради)
              </p>
            )}
            <StackedBar
              className="mt-3"
              title="Статус обавезних докумената"
              total={docs.length}
              height="md"
              legendValues
              segments={(
                [
                  { id: 'approved', label: 'Одобрено', value: approved, tone: 'good' },
                  { id: 'review', label: 'На ревизији', value: inReview, tone: 'info' },
                  { id: 'draft', label: 'У изради', value: drafts.length, tone: 'warn' },
                ] as StackSegment[]
              ).filter((s) => s.value > 0)}
            />
            <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted">
                Преглед одбора: <span className="font-medium text-good">{acceptedCount} прихваћено</span> ·{' '}
                <span className={cn('font-medium', missingCount ? 'text-bad' : 'text-muted')}>{missingCount} недостаје</span> ·{' '}
                {unmarked} непрегледано
              </p>
              <div className="flex flex-wrap gap-2">
                {unmarkedReady.length > 0 && (
                  <Button size="sm" variant="secondary" icon={Check} onClick={() => markMany(unmarkedReady, 'accepted')}>
                    Прихвати спремна ({unmarkedReady.length})
                  </Button>
                )}
                {unmarkedDrafts.length > 0 && (
                  <Button size="sm" variant="ghost" icon={X} onClick={() => markMany(unmarkedDrafts, 'missing')}>
                    Означи недостајућа ({unmarkedDrafts.length})
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </Card>

      <ul className="flex flex-col gap-2.5">
        {sorted.map((d) => {
          const owner = getPerson(d.ownerId);
          const draft = !isDocReady(d);
          const mark = marks[d.id];
          return (
            <li
              key={d.id}
              className={cn(
                'min-w-0 rounded-2xl border border-l-[3px] bg-surface p-3.5 md:flex md:items-center md:gap-4',
                draft ? 'border-line border-l-warn bg-warn-soft/30' : 'border-line',
                mark === 'missing' && 'border-l-bad',
                mark === 'accepted' && 'border-l-good',
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-start gap-2">
                  <FileText className={cn('mt-0.5 size-4 shrink-0', draft ? 'text-warn' : 'text-muted')} aria-hidden />
                  <Link
                    to={docLink(project.id, d.id)}
                    className="group min-w-0 text-sm leading-snug font-medium text-ink hover:text-accent"
                  >
                    {d.title}
                    <ExternalLink
                      className="ml-1 inline size-3.5 align-[-2px] text-muted group-hover:text-accent"
                      aria-label="отвори документ"
                    />
                  </Link>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 pl-6 text-xs text-muted">
                  <Badge tone={draft ? 'warn' : DOCUMENT_STATUS_TONE[d.status]} size="sm">
                    {draft ? 'недостаје · у изради' : DOCUMENT_STATUS_LABELS[d.status]}
                  </Badge>
                  <span>{DOCUMENT_TYPE_LABELS[d.type]}</span>
                  <span>{DISCIPLINE_LABELS[d.discipline]}</span>
                  <span className="tabular">{d.version}</span>
                  {owner && (
                    <span className="inline-flex items-center gap-1">
                      <Avatar person={owner} size="xs" /> {owner.name}
                    </span>
                  )}
                  <span>{formatRelative(d.updated)}</span>
                </div>
              </div>
              <ChoiceGroup
                className="mt-3 md:mt-0 md:w-[19rem] md:shrink-0"
                size="sm"
                ariaLabel={`Преглед: ${d.title}`}
                value={mark}
                onChange={(v) => setMark(d.id, v)}
                options={[
                  { value: 'accepted', label: 'Прихваћено за ревизију', icon: Check, tone: 'good' },
                  { value: 'missing', label: 'Недостаје', icon: X, tone: 'bad' },
                ]}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
