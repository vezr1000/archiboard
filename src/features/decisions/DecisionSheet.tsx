import { Link } from 'react-router';
import { ChevronRight, Circle, CircleAlert, CircleCheck, Trash2 } from 'lucide-react';
import { DivergingBars } from '@/components/charts';
import { paths } from '@/components/layout/navigation';
import { Avatar, Badge, Button, Callout, Sheet } from '@/components/ui';
import { getPeople, getPerson, getSession } from '@/data';
import {
  DECISION_STATUS_LABELS,
  DECISION_STATUS_TONE,
  GATE_LABELS,
  SESSION_OUTCOME_LABELS,
  SESSION_OUTCOME_TONE,
} from '@/domain/labels';
import type { Decision } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatDate, formatPct, formatRelative } from '@/lib/format';
import { useProjectOptions } from '@/store';
import { decisionEmphasis, IMPACT_LABELS, impactValue, isOverdue, type ImpactKind } from './decisionsLogic';

const H = ({ children }: { children: string }) => <h3 className="eyebrow mb-2">{children}</h3>;

const linkRow =
  'flex min-h-11 items-center gap-3 rounded-xl border border-line px-3 py-2.5 text-sm transition-colors hover:bg-surface-2/60';

export interface DecisionSheetProps {
  /** Decision to show; `null` closes the sheet. */
  decision: Decision | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

/** Design Decision Record: context, options, decision, rationale, impact, conditions, board session. */
export function DecisionSheet({ decision, onClose, onDelete }: DecisionSheetProps) {
  return (
    <Sheet
      open={decision !== null}
      onClose={onClose}
      title={decision?.title ?? ''}
      subtitle={decision ? `Запис одлуке · ${formatDate(decision.date, 'long')}` : undefined}
      width="lg"
      footer={
        decision?.isUserCreated ? (
          <Button
            variant="danger"
            icon={Trash2}
            onClick={() => {
              onDelete(decision.id);
              onClose();
            }}
          >
            Обриши предлог
          </Button>
        ) : undefined
      }
    >
      {decision && <SheetBody decision={decision} />}
    </Sheet>
  );
}

function SheetBody({ decision: d }: { decision: Decision }) {
  const session = getSession(d.sessionId);
  const deciders = getPeople(d.decidedByIds ?? []);
  const options = useProjectOptions(d.projectId);
  const option = d.optionId ? options.find((o) => o.id === d.optionId) : undefined;
  const emphasis = decisionEmphasis(d);

  const impacts = (['carbon', 'energy', 'cost'] as ImpactKind[]).flatMap((k) => {
    const v = impactValue(d, k);
    return v === undefined ? [] : [{ id: k, label: IMPACT_LABELS[k].long, value: v }];
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-1.5">
        <Badge tone={DECISION_STATUS_TONE[d.status]} dot>
          {DECISION_STATUS_LABELS[d.status]}
        </Badge>
        {d.isUserCreated && (
          <Badge tone="info" variant="outline">
            нова · предлог
          </Badge>
        )}
      </div>

      {emphasis === 'rise' && (
        <Callout tone="bad" title="Одлука је значајно повећала уграђени угљеник">
          Погледајте образложење и услове испод — они описују како се последица исправља.
        </Callout>
      )}
      {emphasis === 'fix' && (
        <Callout tone="info" title="Предлог за смањење уграђеног угљеника">
          Одлука још није усвојена; чека седницу одбора.
        </Callout>
      )}

      <section>
        <H>Контекст</H>
        <p className="text-sm leading-relaxed text-ink">{d.context}</p>
      </section>

      <section>
        <H>Разматране опције</H>
        <ol className="flex flex-col gap-1.5">
          {d.optionsConsidered.map((o, i) => (
            <li key={o} className="flex gap-2.5 rounded-xl border border-line px-3 py-2 text-sm text-ink">
              <span className="tabular mt-px shrink-0 text-muted">{i + 1}.</span>
              <span className="min-w-0">{o}</span>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <H>Одлука</H>
        <div className="rounded-2xl bg-accent-soft p-3.5 text-sm leading-relaxed text-ink">{d.decision}</div>
      </section>

      <section>
        <H>Образложење</H>
        <p className="text-sm leading-relaxed text-ink">{d.rationale}</p>
      </section>

      <section>
        <H>Утицај</H>
        {impacts.length === 0 ? (
          <p className="text-sm text-muted">Утицај на угљеник, енергију и цену није процењен.</p>
        ) : (
          <>
            <DivergingBars
              title="Утицај одлуке"
              data={impacts}
              format={(v) => formatPct(v, { signed: true })}
              max={Math.max(10, ...impacts.map((i) => Math.abs(i.value)))}
            />
            <p className="mt-1 text-xs text-muted">Промена у односу на стање пројекта непосредно пре ове одлуке.</p>
          </>
        )}
      </section>

      <section>
        <H>Услови</H>
        {d.conditions.length === 0 ? (
          <p className="text-sm text-muted">Одлука је донета без додатних услова.</p>
        ) : (
          <ul className="divide-y divide-line rounded-xl border border-line">
            {d.conditions.map((c) => {
              const owner = getPerson(c.ownerId);
              const late = isOverdue(c);
              const Icon = c.done ? CircleCheck : late ? CircleAlert : Circle;
              return (
                <li key={c.id} className="flex items-start gap-3 px-3 py-2.5">
                  <Icon className={cn('mt-0.5 size-4 shrink-0', c.done ? 'text-good' : late ? 'text-bad' : 'text-muted')} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-sm', c.done ? 'text-muted line-through' : 'text-ink')}>{c.text}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                      {owner && (
                        <span className="inline-flex items-center gap-1.5">
                          <Avatar person={owner} size="xs" />
                          {owner.name}
                        </span>
                      )}
                      {c.done ? (
                        <Badge tone="good" size="sm">
                          испуњено
                        </Badge>
                      ) : late ? (
                        <Badge tone="bad" size="sm">
                          рок истекао {formatRelative(c.dueDate)}
                        </Badge>
                      ) : (
                        <span>
                          рок: {formatDate(c.dueDate, 'long')} ({formatRelative(c.dueDate)})
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <H>{d.status === 'proposed' ? 'Седница одбора' : 'Донета на седници'}</H>
        {session ? (
          <Link to={paths.session(session.id)} className={linkRow}>
            <span className="min-w-0 flex-1 text-ink">
              {GATE_LABELS[session.gate].full}
              <span className="block text-xs text-muted">
                {formatDate(session.date, 'long')}
                {d.status === 'proposed' && ' · предлог се разматра на овој седници'}
              </span>
            </span>
            <Badge tone={SESSION_OUTCOME_TONE[session.outcome]} size="sm">
              {SESSION_OUTCOME_LABELS[session.outcome]}
            </Badge>
            <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
          </Link>
        ) : deciders.length > 0 ? (
          <div>
            <p className="mb-2 text-sm text-muted">Одлука је донета ван седнице одбора (радни ниво пројектног тима).</p>
            <ul className="flex flex-wrap gap-2">
              {deciders.map((p) => (
                <li key={p.id} className="inline-flex items-center gap-1.5 rounded-full border border-line py-0.5 pr-3 pl-0.5 text-sm text-ink">
                  <Avatar person={p} size="xs" />
                  {p.name}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-muted">Још није додељена седници одбора.</p>
        )}
      </section>

      {option && (
        <section>
          <H>Повезана варијанта</H>
          <Link to={paths.project(d.projectId, 'varijante')} className={linkRow}>
            <span className="min-w-0 flex-1 text-ink">{option.name}</span>
            <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
          </Link>
        </section>
      )}
    </div>
  );
}
