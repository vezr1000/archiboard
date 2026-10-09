import { Link } from 'react-router';
import { Award, ChevronRight, ClipboardCheck, ListChecks } from 'lucide-react';
import { AiBadge } from '@/components/ai';
import { paths } from '@/components/layout/navigation';
import { Avatar, Badge, KeyValue, Sheet } from '@/components/ui';
import { getPerson, linksForDocument } from '@/data';
import {
  CRITERION_STATUS_LABELS,
  CRITERION_STATUS_TONE,
  DISCIPLINE_LABELS,
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_STATUS_TONE,
  DOCUMENT_TYPE_LABELS,
  FINDING_SEVERITY_LABELS,
  FINDING_SEVERITY_TONE,
  GATE_LABELS,
  SESSION_OUTCOME_LABELS,
  SESSION_OUTCOME_TONE,
} from '@/domain/labels';
import type { ProjectDocument } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatDate, formatRelative } from '@/lib/format';
import { DocumentPreview } from './DocumentPreview';

const H = ({ children }: { children: string }) => <h3 className="eyebrow mb-2">{children}</h3>;

const linkRow = 'flex min-h-11 items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-surface-2/60';

export interface DocumentSheetProps {
  /** Document to show; `null` closes the sheet. */
  doc: ProjectDocument | null;
  onClose: () => void;
}

/** Document detail: metadata, fake preview, version history timeline, gates and reverse-lookup links. */
export function DocumentSheet({ doc, onClose }: DocumentSheetProps) {
  return (
    <Sheet
      open={doc !== null}
      onClose={onClose}
      title={doc?.title ?? ''}
      subtitle={doc ? `${DOCUMENT_TYPE_LABELS[doc.type]} · ${doc.version}` : undefined}
      width="md"
    >
      {doc && <SheetBody doc={doc} />}
    </Sheet>
  );
}

function SheetBody({ doc }: { doc: ProjectDocument }) {
  const owner = getPerson(doc.ownerId);
  const links = linksForDocument(doc.id);
  const history = [...doc.history].sort((a, b) => b.date.localeCompare(a.date) || b.version.localeCompare(a.version));
  const nothingLinked = links.criteria.length + links.sessions.length + links.findings.length === 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-1.5">
        <Badge tone={DOCUMENT_STATUS_TONE[doc.status]} dot>
          {DOCUMENT_STATUS_LABELS[doc.status]}
        </Badge>
        <Badge variant="outline">{DISCIPLINE_LABELS[doc.discipline]}</Badge>
      </div>

      <DocumentPreview doc={doc} />

      <section>
        <H>Подаци</H>
        <KeyValue
          items={[
            { label: 'Врста', value: DOCUMENT_TYPE_LABELS[doc.type] },
            { label: 'Дисциплина', value: DISCIPLINE_LABELS[doc.discipline] },
            { label: 'Тренутна верзија', value: <span className="tabular font-medium">{doc.version}</span> },
            {
              label: 'Одговорно лице',
              value: owner ? (
                <span className="inline-flex items-center gap-2">
                  <Avatar person={owner} size="xs" />
                  {owner.name}
                </span>
              ) : (
                '—'
              ),
            },
            { label: 'Измењено', value: formatDate(doc.updated, 'long'), hint: formatRelative(doc.updated) },
            {
              label: 'Обавезно за капију',
              value:
                doc.requiredForGates.length > 0 ? (
                  <span className="flex flex-wrap justify-end gap-1">
                    {doc.requiredForGates.map((g) => (
                      <Badge key={g} variant="outline" size="sm" title={GATE_LABELS[g].full}>
                        {GATE_LABELS[g].code}
                      </Badge>
                    ))}
                  </span>
                ) : (
                  'није обавезно'
                ),
            },
          ]}
        />
      </section>

      <section>
        <H>Историја верзија</H>
        <ol className="relative ml-1.5 border-l border-line-strong pl-5">
          {history.map((h, i) => {
            const current = i === 0;
            return (
              <li key={`${h.version}-${h.date}`} className={cn('relative pb-4 last:pb-0')}>
                <span
                  className={cn(
                    'absolute top-1 -left-[1.62rem] size-2.5 rounded-full border-2',
                    current ? 'border-accent bg-accent' : 'border-line-strong bg-surface',
                  )}
                  aria-hidden
                />
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="tabular text-sm font-semibold text-ink">{h.version}</span>
                  {current && (
                    <Badge tone="accent" size="sm">
                      тренутна
                    </Badge>
                  )}
                  <span className="text-xs text-muted">{formatDate(h.date, 'long')}</span>
                </div>
                <p className="mt-0.5 text-sm text-ink/85">{h.note}</p>
              </li>
            );
          })}
        </ol>
      </section>

      <section>
        <H>Повезане ставке</H>
        {nothingLinked ? (
          <p className="text-sm text-muted">Документ за сада није наведен као доказ, обавеза за седницу нити предмет налаза.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {links.criteria.length > 0 && (
              <div>
                <h4 className="mb-1 text-xs font-medium text-muted">Доказ за критеријум сертификације</h4>
                <ul className="divide-y divide-line rounded-xl border border-line">
                  {links.criteria.map((c) => (
                    <li key={c.id}>
                      <Link to={paths.project(c.projectId, 'sertifikacija')} className={linkRow}>
                        <Award className="size-4 shrink-0 text-muted" aria-hidden />
                        <span className="min-w-0 flex-1 text-ink">{c.label}</span>
                        <Badge tone={CRITERION_STATUS_TONE[c.status]} size="sm">
                          {CRITERION_STATUS_LABELS[c.status]}
                        </Badge>
                        <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {links.sessions.length > 0 && (
              <div>
                <h4 className="mb-1 text-xs font-medium text-muted">Обавезно на седници одбора</h4>
                <ul className="divide-y divide-line rounded-xl border border-line">
                  {links.sessions.map((s) => (
                    <li key={s.id}>
                      <Link to={paths.session(s.id)} className={linkRow}>
                        <ClipboardCheck className="size-4 shrink-0 text-muted" aria-hidden />
                        <span className="min-w-0 flex-1 text-ink">
                          {GATE_LABELS[s.gate].full}
                          <span className="block text-xs text-muted">{formatDate(s.date, 'long')}</span>
                        </span>
                        <Badge tone={SESSION_OUTCOME_TONE[s.outcome]} size="sm">
                          {SESSION_OUTCOME_LABELS[s.outcome]}
                        </Badge>
                        <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {links.findings.length > 0 && (
              <div>
                <h4 className="mb-1 text-xs font-medium text-muted">Налази АИ пред-прегледа</h4>
                <ul className="divide-y divide-line rounded-xl border border-line">
                  {links.findings.map(({ session, finding }) => (
                    <li key={finding.id}>
                      <Link to={paths.session(session.id)} className={cn(linkRow, 'items-start')}>
                        <ListChecks className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
                        <span className="min-w-0 flex-1 text-ink">
                          {finding.title}
                          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                            {GATE_LABELS[session.gate].full} <AiBadge size="sm" />
                          </span>
                        </span>
                        <Badge tone={FINDING_SEVERITY_TONE[finding.severity]} size="sm">
                          {FINDING_SEVERITY_LABELS[finding.severity]}
                        </Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
