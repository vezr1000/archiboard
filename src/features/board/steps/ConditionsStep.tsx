import { useId } from 'react';
import { ClipboardList, Plus, Trash2 } from 'lucide-react';
import { Badge, Button, Card, EmptyState, IconButton, Select } from '@/components/ui';
import { FINDING_SEVERITY_TONE, REVIEW_CONDITION_SOURCE_LABELS } from '@/domain/labels';
import type { ReviewCondition, Tone } from '@/domain/types';
import { cn } from '@/lib/cn';
import { DEMO_TODAY } from '@/lib/dates';
import { formatDate, formatRelative } from '@/lib/format';
import { carriedFromLabel, conditionsWord, newCondition, ownerCandidates } from '../reviewLogic';
import type { StepProps } from './PrepStep';

const SOURCE_TONE: Record<ReviewCondition['source'], Tone> = { carried: 'clay', finding: 'info', kpi: 'info', manual: 'neutral' };

function ConditionEditor({
  c,
  index,
  owners,
  onChange,
  onRemove,
  severityTone,
}: {
  c: ReviewCondition;
  index: number;
  owners: Array<{ value: string; label: string }>;
  onChange: (patch: Partial<ReviewCondition>) => void;
  onRemove: () => void;
  severityTone?: Tone;
}) {
  const textId = useId();
  const dateId = useId();
  const late = c.dueDate < DEMO_TODAY;
  const from = carriedFromLabel(c);
  return (
    <li className={cn('min-w-0 rounded-2xl border bg-surface p-3.5', late ? 'border-bad/50' : 'border-line')}>
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <span className="tabular text-sm font-semibold text-muted">{index + 1}.</span>
          <Badge
            tone={c.source === 'finding' && severityTone ? severityTone : SOURCE_TONE[c.source]}
            size="sm"
            variant={c.source === 'manual' ? 'outline' : 'soft'}
          >
            {c.source === 'carried' && from ? `пренето са ${from}` : REVIEW_CONDITION_SOURCE_LABELS[c.source]}
          </Badge>
          {late && (
            <Badge tone="bad" size="sm" variant="solid">
              рок истекао {formatRelative(c.dueDate)}
            </Badge>
          )}
        </div>
        <IconButton icon={Trash2} label="Уклони услов" variant="ghost" size="sm" onClick={onRemove} className="-mt-1 -mr-1.5" />
      </div>
      <label htmlFor={textId} className="sr-only">
        Текст услова {index + 1}
      </label>
      <textarea
        id={textId}
        value={c.text}
        onChange={(e) => onChange({ text: e.target.value })}
        rows={3}
        placeholder="нпр. „Доставити ажурирани LCA са модулима C1–C4“"
        className="mt-2 min-h-[4.5rem] w-full resize-y rounded-xl [field-sizing:content] border border-line bg-surface px-3 py-2 text-sm leading-snug text-ink placeholder:text-muted focus:border-accent focus:outline-none"
      />
      <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_11rem]">
        <Select
          size="sm"
          label={<span className="text-xs text-muted">Носилац</span>}
          value={c.ownerId}
          onChange={(v) => onChange({ ownerId: v })}
          options={owners}
        />
        <div className="min-w-0">
          <label htmlFor={dateId} className="mb-1 block text-xs text-muted">
            Рок
          </label>
          <input
            id={dateId}
            type="date"
            value={c.dueDate}
            onChange={(e) => e.target.value && onChange({ dueDate: e.target.value })}
            className={cn(
              'h-9 w-full rounded-xl border bg-surface px-3 text-sm text-ink focus:border-accent focus:outline-none',
              late ? 'border-bad/60' : 'border-line',
            )}
          />
        </div>
      </div>
      {c.source === 'carried' && (
        <p className="mt-2 text-xs text-muted">
          {late
            ? `Услов са капије ${from ?? ''} није испуњен у року — одбор може да одреди нови рок.`
            : `Услов са капије ${from ?? ''} — првобитни рок ${formatDate(c.dueDate, 'numeric')}`}
        </p>
      )}
    </li>
  );
}

/** Step 5 — Услови: carried-over, finding-based and new conditions with owner and due date. */
export function ConditionsStep({ session, project, review, update }: StepProps) {
  const owners = ownerCandidates(project, session, review.conditions).map((p) => ({
    value: p.id,
    label: `${p.name} — ${p.role}`,
  }));
  const late = review.conditions.filter((c) => c.dueDate < DEMO_TODAY).length;
  const severityOf = (c: ReviewCondition) => session.aiFindings.find((f) => f.id === c.sourceId)?.severity;

  const patch = (id: string, p: Partial<ReviewCondition>) =>
    update((r) => ({ ...r, conditions: r.conditions.map((c) => (c.id === id ? { ...c, ...p } : c)) }));
  const remove = (c: ReviewCondition) =>
    update((r) => {
      const findingDispositions = { ...r.findingDispositions };
      if (c.source === 'finding' && c.sourceId) delete findingDispositions[c.sourceId];
      return { ...r, conditions: r.conditions.filter((x) => x.id !== c.id), findingDispositions };
    });
  const add = () => update((r) => ({ ...r, conditions: [...r.conditions, newCondition(session, project)] }));

  return (
    <div className="flex flex-col gap-4">
      <Card
        title="Услови одбора"
        subtitle={
          review.conditions.length
            ? `${review.conditions.length} ${conditionsWord(review.conditions.length)}${late ? ` · ${late} са истеклим роком` : ''}`
            : 'Још нема услова'
        }
        action={
          <Button size="sm" icon={Plus} onClick={add}>
            Додај услов
          </Button>
        }
      >
        <p className="text-sm text-muted">
          Отворени услови са претходне капије и налази претворени у услове унапред су попуњени. Свакоме одредите носиоца и рок —
          улазе у одлуку и записник.
        </p>
      </Card>

      {review.conditions.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          compact
          title="Нема услова"
          description="Одбор може да одобри капију без услова, или додајте услов ручно."
          action={
            <Button variant="secondary" icon={Plus} onClick={add}>
              Додај услов
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {review.conditions.map((c, i) => {
            const sev = severityOf(c);
            return (
              <ConditionEditor
                key={c.id}
                c={c}
                index={i}
                owners={owners}
                severityTone={sev ? FINDING_SEVERITY_TONE[sev] : undefined}
                onChange={(p) => patch(c.id, p)}
                onRemove={() => remove(c)}
              />
            );
          })}
        </ul>
      )}
      {review.conditions.length > 0 && (
        <Button variant="secondary" icon={Plus} onClick={add} className="self-start">
          Додај услов
        </Button>
      )}
    </div>
  );
}
