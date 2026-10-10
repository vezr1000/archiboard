import { useId } from 'react';
import { CircleAlert, CircleCheck, ClipboardCheck, Gavel, Undo2 } from 'lucide-react';
import { Avatar, Badge, Button, Card, ChoiceGroup } from '@/components/ui';
import { TONE_CLASSES } from '@/components/ui/tone';
import { boardChair, getPeople } from '@/data';
import { SESSION_OUTCOME_LABELS, SESSION_OUTCOME_TONE } from '@/domain/labels';
import type { BoardSession, BoardVote, GateReviewState, Person } from '@/domain/types';
import { cn } from '@/lib/cn';
import { REVIEW_STEPS, VOTE_ORDER, conditionsWord, quorumFor, votesLabel, type StepState, type VoteResult } from '../reviewLogic';
import type { ReviewUpdate } from '../useReview';

const VOTE_OPTIONS = [
  { value: 'approved' as const, label: 'Одобрено', icon: CircleCheck, tone: 'good' as const },
  { value: 'approved-with-conditions' as const, label: 'Уз услове', icon: ClipboardCheck, tone: 'warn' as const },
  { value: 'rework' as const, label: 'Враћено на дораду', icon: Undo2, tone: 'bad' as const },
];

function VoteRow({
  person,
  isChair,
  vote,
  comment,
  onVote,
  onComment,
}: {
  person: Person;
  isChair: boolean;
  vote: BoardVote | undefined;
  comment: string;
  onVote: (v: BoardVote) => void;
  onComment: (c: string) => void;
}) {
  const id = useId();
  return (
    <li className="min-w-0 py-3.5 first:pt-0 last:pb-0">
      <div className="mb-2.5 flex min-w-0 items-center gap-3">
        <Avatar person={person} size="md" />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 text-sm font-medium text-ink">
            {person.name}
            {isChair && (
              <Badge tone="accent" size="sm">
                председава
              </Badge>
            )}
          </p>
          <p className="truncate text-xs text-muted">{person.role}</p>
        </div>
        {vote ? (
          <CircleCheck className="size-5 shrink-0 text-good" aria-label="гласао/ла" />
        ) : (
          <span className="shrink-0 text-xs text-muted">чека глас</span>
        )}
      </div>
      <ChoiceGroup ariaLabel={`Глас: ${person.name}`} value={vote} onChange={onVote} options={VOTE_OPTIONS} size="sm" />
      <label htmlFor={id} className="sr-only">
        Коментар: {person.name}
      </label>
      <input
        id={id}
        type="text"
        value={comment}
        onChange={(e) => onComment(e.target.value)}
        placeholder="Коментар уз глас (опционо)"
        className="mt-2 h-10 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
      />
    </li>
  );
}

/** Step 6 — Одлука: votes of present members, computed outcome (majority, chair breaks ties), close the session. */
export function DecisionStep({
  session,
  review,
  update,
  states,
  votes,
  canClose,
  quorumOk,
  onClose,
  goTo,
}: {
  session: BoardSession;
  review: GateReviewState;
  update: ReviewUpdate;
  states: StepState[];
  votes: VoteResult;
  canClose: boolean;
  quorumOk: boolean;
  onClose: () => void;
  goTo: (i: number) => void;
}) {
  const chair = boardChair();
  const present = getPeople(session.memberIds.filter((id) => review.presentIds.includes(id)));
  const absent = getPeople(session.memberIds.filter((id) => !review.presentIds.includes(id)));
  const outcome = votes.outcome;
  const tone = outcome ? SESSION_OUTCOME_TONE[outcome] : 'neutral';
  const conditionsCount = review.conditions.filter((c) => c.text.trim()).length;

  const setVote = (id: string, vote: BoardVote) =>
    update((r) => ({ ...r, votes: { ...r.votes, [id]: { ...r.votes[id], vote } } }));
  const setComment = (id: string, comment: string) =>
    update((r) => (r.votes[id] ? { ...r, votes: { ...r.votes, [id]: { ...r.votes[id], comment } } } : r));

  const open = states
    .slice(0, 4)
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => !s.done);

  const explain = votes.decidedByChair
    ? 'Нерешен резултат — одлучио је глас председнице.'
    : votes.decidedByStrictness
      ? 'Нерешен резултат без гласа председнице међу изједначенима — примењује се строжи исход.'
      : votes.chairReworkOutvoted
        ? 'Председница је гласала „враћено на дораду“, али одлучује већина; њен глас је одлучујући само при нерешеном резултату.'
        : null;

  return (
    <div className="flex flex-col gap-5">
      <Card
        title="Гласање"
        subtitle={`Гласају присутни чланови (${present.length} од ${session.memberIds.length}) · кворум ${quorumFor(session.memberIds.length)}`}
      >
        {present.length === 0 ? (
          <p className="text-sm text-bad">Нико није означен као присутан — вратите се на корак „Припрема“.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {present.map((p) => (
              <VoteRow
                key={p.id}
                person={p}
                isChair={p.id === chair?.id}
                vote={review.votes[p.id]?.vote}
                comment={review.votes[p.id]?.comment ?? ''}
                onVote={(v) => setVote(p.id, v)}
                onComment={(c) => setComment(p.id, c)}
              />
            ))}
          </ul>
        )}
        {absent.length > 0 && <p className="mt-3 text-xs text-muted">Одсутни: {absent.map((p) => p.name).join(', ')}</p>}
      </Card>

      <section
        aria-live="polite"
        className={cn(
          'rounded-2xl border p-5 md:p-6',
          outcome ? cn(TONE_CLASSES[tone].bgSoft, 'border-transparent') : 'border-dashed border-line-strong bg-surface',
        )}
      >
        <p className="eyebrow">{votes.complete ? 'Исход гласања' : `Гласало ${votes.voted} од ${votes.voters}`}</p>
        <p
          className={cn('mt-1 font-display text-3xl leading-tight md:text-4xl', outcome ? TONE_CLASSES[tone].text : 'text-muted')}
        >
          {outcome ? SESSION_OUTCOME_LABELS[outcome] : 'Чека гласове'}
        </p>
        {outcome && !votes.complete && <p className="mt-1 text-sm text-muted">Привремено — још нису гласали сви присутни.</p>}
        {votes.voted > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {VOTE_ORDER.filter((v) => votes.tally[v] > 0).map((v) => (
              <li key={v}>
                <Badge tone={SESSION_OUTCOME_TONE[v]} variant="outline">
                  {SESSION_OUTCOME_LABELS[v]}: {votesLabel(votes.tally[v])}
                </Badge>
              </li>
            ))}
          </ul>
        )}
        {outcome && outcome !== 'rework' && conditionsCount > 0 && (
          <p className="mt-3 text-sm text-ink">
            Уз {conditionsCount} {conditionsWord(conditionsCount)} са носиоцима и роковима.
          </p>
        )}
        {explain && <p className="mt-2 text-sm text-ink">{explain}</p>}
        <p className="mt-3 text-xs leading-snug text-muted">
          Правило: одлучује већина гласова присутних чланова; при нерешеном резултату одлучује глас председнице.
        </p>
      </section>

      {open.length > 0 && (
        <Card title="Пре затварања седнице" subtitle="Није обавезно, али записник ће то навести">
          <ul className="flex flex-col gap-1">
            {open.map(({ s, i }) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  className="flex min-h-10 w-full items-center gap-2 rounded-lg px-1 text-left text-sm hover:bg-surface-2"
                >
                  <CircleAlert className="size-4 shrink-0 text-warn" aria-hidden />
                  <span className="min-w-0 flex-1 text-ink">{REVIEW_STEPS[i].title}</span>
                  <span className="shrink-0 text-xs text-muted">{s.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button size="lg" icon={Gavel} onClick={onClose} disabled={!canClose}>
          Заврши седницу
        </Button>
        <p className="text-sm text-muted">
          {!quorumOk
            ? 'Нема кворума — седница не може да донесе одлуку.'
            : !votes.complete
              ? 'Гласају сви присутни чланови пре затварања.'
              : 'Одлука се уписује у дневник одлука пројекта и генерише се записник.'}
        </p>
      </div>
    </div>
  );
}
