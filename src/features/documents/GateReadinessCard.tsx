import { useState } from 'react';
import { ChevronRight, FileWarning, ListFilter } from 'lucide-react';
import { Link } from 'react-router';
import { StackedBar, type StackSegment } from '@/components/charts';
import { paths } from '@/components/layout/navigation';
import { Badge, Button, Card, Segmented } from '@/components/ui';
import { documentsForGate, gateReadiness, getPerson, sessionsForProject } from '@/data';
import { GATE_LABELS, GATES } from '@/domain/labels';
import type { GateId, Project } from '@/domain/types';
import { formatDate, formatRelative } from '@/lib/format';
import { missingVerb } from './documentsLogic';

export interface GateReadinessCardProps {
  project: Project;
  onOpenDoc: (documentId: string) => void;
  /** Show the gate's documents in the register below. */
  onShowInRegister: (gate: GateId) => void;
}

/** „За Г2 недостају 2 од 12 докумената“ — document readiness for a selectable gate. */
export function GateReadinessCard({ project, onOpenDoc, onShowInRegister }: GateReadinessCardProps) {
  const gatesWithDocs = GATES.filter((g) => documentsForGate(project.id, g).length > 0);
  const initial = gatesWithDocs.includes(project.nextGate.gate) ? project.nextGate.gate : (gatesWithDocs[0] ?? project.nextGate.gate);
  const [gate, setGate] = useState<GateId>(initial);

  const readiness = gateReadiness(project.id, gate);
  const total = readiness.required.length;
  const missing = readiness.missing;
  const ready = readiness.approved.length + readiness.inReview.length;
  const session = sessionsForProject(project.id).find((s) => s.gate === gate);
  const gateCode = GATE_LABELS[gate].code;
  const isNext = gate === project.nextGate.gate;

  const segments = (
    [
      { id: 'approved', label: 'Одобрено', value: readiness.approved.length, tone: 'good' },
      { id: 'review', label: 'На ревизији', value: readiness.inReview.length, tone: 'info' },
      { id: 'draft', label: 'У изради', value: missing.length, tone: 'warn' },
    ] as StackSegment[]
  ).filter((s) => s.value > 0);

  return (
    <Card
      eyebrow={isNext ? 'Спремност за следећу капију' : 'Спремност за капију'}
      title={
        total === 0
          ? `За ${gateCode} нису одређена обавезна документа`
          : missing.length > 0
            ? `За ${gateCode} ${missingVerb(missing.length)} ${missing.length} од ${total} докумената`
            : `За ${gateCode} су сва документа спремна`
      }
      subtitle={
        <>
          {GATE_LABELS[gate].name}
          {session && (
            <>
              {' · '}
              {formatDate(session.date, 'day-month')} ({formatRelative(session.date)}) ·{' '}
              <Link to={paths.session(session.id)} className="text-accent hover:underline">
                седница одбора
              </Link>
            </>
          )}
        </>
      }
    >
      {gatesWithDocs.length > 1 && (
        <Segmented
          ariaLabel="Капија"
          className="mb-4"
          options={gatesWithDocs.map((g) => ({ value: g, label: GATE_LABELS[g].code }))}
          value={gate}
          onChange={setGate}
        />
      )}
      {total > 0 && (
        <div className="grid gap-5 md:grid-cols-2">
          <div className="min-w-0">
            <div className="mb-2 flex items-baseline justify-between gap-2 text-sm text-muted">
              <span>
                Спремно (одобрено или на ревизији){' '}
                <span className="tabular font-medium text-ink">
                  {ready} / {total}
                </span>
              </span>
            </div>
            <StackedBar title={`Спремност докумената за ${gateCode}`} total={total} height="md" legendValues segments={segments} />
            <p className="mt-3 text-xs text-muted">
              Документ у изради се броји као недостајући; на ревизији — као спреман за преглед одбора.
            </p>
          </div>

          <div className="min-w-0">
            {missing.length > 0 ? (
              <>
                <h4 className="mb-1 text-sm font-semibold text-ink">Недостају ({missing.length})</h4>
                <ul className="-mx-2 flex flex-col">
                  {missing.map((d) => {
                    const owner = getPerson(d.ownerId);
                    return (
                      <li key={d.id}>
                        <button
                          type="button"
                          onClick={() => onOpenDoc(d.id)}
                          className="flex min-h-12 w-full items-start gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-surface-2"
                        >
                          <FileWarning className="mt-0.5 size-4 shrink-0 text-warn" aria-hidden />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm leading-snug text-ink">{d.title}</span>
                            <span className="mt-0.5 block text-xs text-muted">
                              {d.version}
                              {owner && ` · ${owner.name}`} · измењено {formatRelative(d.updated)}
                            </span>
                          </span>
                          <Badge tone="warn" size="sm">
                            у изради
                          </Badge>
                          <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <p className="text-sm text-good">Сва обавезна документа за {gateCode} су одобрена или на ревизији.</p>
            )}
            <Button variant="ghost" size="sm" icon={ListFilter} onClick={() => onShowInRegister(gate)} className="mt-1">
              Прикажи у регистру ({gateCode})
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
