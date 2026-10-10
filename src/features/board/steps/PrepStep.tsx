import { useMemo } from 'react';
import { Link } from 'react-router';
import { ChevronRight, Users } from 'lucide-react';
import { paths } from '@/components/layout/navigation';
import { Avatar, Badge, Card, PhasePill, ProgressBar, Toggle } from '@/components/ui';
import { boardChair, getPeople, getPerson } from '@/data';
import { GATE_LABELS, PHASE_LABELS, SCHEME_LABELS } from '@/domain/labels';
import type { BoardSession, GateReviewState, Project } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatArea, formatDate, formatRelative } from '@/lib/format';
import { useAppStore } from '@/store';
import { quorumFor } from '../reviewLogic';
import type { ReviewUpdate } from '../useReview';

export interface StepProps {
  session: BoardSession;
  project: Project;
  review: GateReviewState;
  update: ReviewUpdate;
}

export interface AgendaItem {
  key: string;
  text: string;
  /** User proposal from the what-if calculator, linked to this session. */
  decisionId?: string;
}

/** Seed agenda + proposals the user sent to this session from Варијанте („Предложи одбору“). */
export function useAgendaItems(session: BoardSession): AgendaItem[] {
  const userDecisions = useAppStore((s) => s.userDecisions);
  return useMemo(
    () => [
      ...session.agenda.map((text, i) => ({ key: `a${i}`, text })),
      ...userDecisions
        .filter((d) => d.sessionId === session.id && d.status === 'proposed')
        .map((d) => ({ key: d.id, text: d.title, decisionId: d.id })),
    ],
    [session, userDecisions],
  );
}

const toggleIn = (list: string[], id: string, on: boolean) => (on ? [...new Set([...list, id])] : list.filter((x) => x !== id));

/** Step 1 — Припрема: project summary, attendance with quorum, agenda checklist. */
export function PrepStep({ session, project, review, update }: StepProps) {
  const chair = boardChair();
  const lead = getPerson(project.leadArchitectId);
  const members = getPeople(session.memberIds);
  const quorum = quorumFor(session.memberIds.length);
  const present = review.presentIds.length;
  const quorumOk = present >= quorum;
  const agenda = useAgendaItems(session);
  const checked = agenda.filter((a) => review.agendaChecked.includes(a.key)).length;
  const facts: Array<{ label: string; value: string; hint?: string }> = [
    { label: 'Капија', value: GATE_LABELS[session.gate].full, hint: `затвара фазу ${PHASE_LABELS[project.phase].short}` },
    {
      label: 'Датум',
      value: formatDate(session.date, 'long'),
      hint: `${formatRelative(session.date)}${session.location ? ` · ${session.location}` : ''}`,
    },
    { label: 'Председава', value: chair?.name ?? '—', hint: chair?.role },
    { label: 'Водећи архитекта', value: lead?.name ?? '—', hint: lead?.role },
    ...(project.gfaM2 ? [{ label: 'БРГП', value: formatArea(project.gfaM2) }] : []),
    {
      label: 'Сертификација',
      value:
        project.certification.scheme === 'none'
          ? 'Интерни скор'
          : `${SCHEME_LABELS[project.certification.scheme]} ${project.certification.targetLevel}`,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Card
        eyebrow="Пројекат пред одбором"
        title={project.name}
        subtitle={`${project.city} · ${project.typologyLabel}`}
        action={<PhasePill phase={project.phase} />}
      >
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-3">
          {facts.map((it) => (
            <div key={it.label} className="min-w-0">
              <dt className="text-xs text-muted">{it.label}</dt>
              <dd className="text-sm font-medium text-ink">{it.value}</dd>
              {it.hint && <dd className="text-xs leading-snug text-muted">{it.hint}</dd>}
            </div>
          ))}
        </dl>
        <Link
          to={paths.project(project.id)}
          className="mt-4 inline-flex min-h-10 items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          Преглед пројекта
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      </Card>

      <Card
        title="Чланови одбора"
        subtitle={`Кворум: најмање ${quorum} од ${session.memberIds.length}`}
        action={
          <Badge tone={quorumOk ? 'good' : 'bad'} icon={Users}>
            {quorumOk ? `кворум ${present}/${session.memberIds.length}` : 'нема кворума'}
          </Badge>
        }
      >
        <ul className="flex flex-col divide-y divide-line">
          {members.map((m) => {
            const isPresent = review.presentIds.includes(m.id);
            return (
              <li key={m.id} className="flex min-w-0 items-center gap-3 py-1.5">
                <Avatar person={m} size="md" className={cn(!isPresent && 'opacity-40')} />
                <Toggle
                  className="min-w-0 flex-1"
                  checked={isPresent}
                  onChange={(on) =>
                    update((r) => ({
                      ...r,
                      presentIds: session.memberIds.filter((id) => (id === m.id ? on : r.presentIds.includes(id))),
                    }))
                  }
                  label={
                    <span className="inline-flex min-w-0 flex-wrap items-center gap-x-2">
                      <span className={cn('font-medium', !isPresent && 'text-muted')}>{m.name}</span>
                      {m.id === chair?.id && (
                        <Badge tone="accent" size="sm">
                          председава
                        </Badge>
                      )}
                    </span>
                  }
                  description={isPresent ? m.role : `${m.role} · одсуство`}
                />
              </li>
            );
          })}
        </ul>
        {!quorumOk && (
          <p className="mt-2 text-sm text-bad">
            Без кворума одбор не може да донесе одлуку — потребно је још {quorum - present}.
          </p>
        )}
      </Card>

      <Card title="Дневни ред" subtitle="Означите тачке како се обрађују на седници">
        <ProgressBar
          className="mb-3"
          size="xs"
          value={checked}
          max={agenda.length}
          tone={checked === agenda.length ? 'good' : 'accent'}
          label="Обрађено"
          valueLabel={`${checked} од ${agenda.length}`}
        />
        <ol className="-mx-2 flex flex-col">
          {agenda.map((a, i) => {
            const on = review.agendaChecked.includes(a.key);
            return (
              <li key={a.key}>
                <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl px-2 py-2.5 hover:bg-surface-2/70">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={(e) => update((r) => ({ ...r, agendaChecked: toggleIn(r.agendaChecked, a.key, e.target.checked) }))}
                    className="mt-0.5 size-5 shrink-0 accent-accent"
                  />
                  <span className="tabular w-5 shrink-0 text-sm text-muted">{i + 1}.</span>
                  <span
                    className={cn(
                      'min-w-0 flex-1 text-sm leading-snug',
                      on ? 'text-muted line-through decoration-line-strong' : 'text-ink',
                    )}
                  >
                    {a.text}
                    {a.decisionId && (
                      <span className="mt-1 flex flex-wrap items-center gap-2">
                        <Badge tone="info" size="sm" variant="outline">
                          нови предлог из калкулатора
                        </Badge>
                        <Link
                          to={`${paths.project(project.id, 'odluke')}?decision=${a.decisionId}`}
                          className="text-xs font-medium text-accent hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Отвори предлог
                        </Link>
                      </span>
                    )}
                  </span>
                </label>
              </li>
            );
          })}
        </ol>
      </Card>
    </div>
  );
}
