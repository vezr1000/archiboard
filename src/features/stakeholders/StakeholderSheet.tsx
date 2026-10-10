import { useState } from 'react';
import { CircleCheck, Plus } from 'lucide-react';
import { Badge, Button, KeyValue, Select, Sheet } from '@/components/ui';
import { ENGAGEMENT_KIND_LABELS } from '@/domain/labels';
import type { EngagementKind, Stakeholder } from '@/domain/types';
import { cn } from '@/lib/cn';
import { DEMO_TODAY } from '@/lib/dates';
import { formatDate, formatRelative } from '@/lib/format';
import { useAppStore } from '@/store';
import { DueChip, AttitudeBadge, InfluenceInterest } from './StakeholderBits';
import { GROUP_LABELS, groupOf, KIND_ICONS, lastContact, parseDue, QUADRANT_HINTS, QUADRANT_LABELS, quadrantOf } from './stakeholdersLogic';
import type { Project } from '@/domain/types';

const H = ({ children }: { children: string }) => <h3 className="eyebrow mb-2">{children}</h3>;

const KIND_OPTIONS = (Object.keys(ENGAGEMENT_KIND_LABELS) as EngagementKind[]).map((value) => ({ value, label: ENGAGEMENT_KIND_LABELS[value] }));

export interface StakeholderSheetProps {
  /** Stakeholder (with the user's notes merged into `log`); `null` closes the sheet. */
  stakeholder: Stakeholder | null;
  project: Project;
  onClose: () => void;
}

/** Stakeholder detail: classification, obligations, engagement timeline, „Додај белешку“. */
export function StakeholderSheet({ stakeholder, project, onClose }: StakeholderSheetProps) {
  return (
    <Sheet open={stakeholder !== null} onClose={onClose} title={stakeholder?.name ?? ''} subtitle={stakeholder?.organization} width="md">
      {/* key: reset the note form when another stakeholder is opened */}
      {stakeholder && <SheetBody key={stakeholder.id} s={stakeholder} project={project} />}
    </Sheet>
  );
}

function SheetBody({ s, project }: { s: Stakeholder; project: Project }) {
  const quadrant = quadrantOf(s);
  const last = lastContact(s);
  const due = s.nextAction ? parseDue(s.nextAction, project) : undefined;
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-1.5">
        <AttitudeBadge attitude={s.attitude} />
        <Badge tone="neutral" variant="outline">
          {GROUP_LABELS[groupOf(s)]}
        </Badge>
        <Badge tone="accent" variant="outline">
          {QUADRANT_LABELS[quadrant]}
        </Badge>
      </div>

      <section>
        <KeyValue
          items={[
            { label: 'Улога у пројекту', value: s.role },
            { label: 'Утицај и интерес', value: <InfluenceInterest s={s} />, hint: QUADRANT_HINTS[quadrant] },
            { label: 'Последњи контакт', value: last ? `${formatDate(last, 'long')} (${formatRelative(last)})` : '—' },
          ]}
        />
      </section>

      {s.nextAction && (
        <section>
          <H>Следећи корак</H>
          <div className="rounded-2xl bg-accent-soft p-3.5 text-sm leading-relaxed text-ink">
            {s.nextAction}
            <div className="mt-2">
              <DueChip due={due} />
            </div>
          </div>
        </section>
      )}

      <section>
        <H>Обавезе</H>
        {s.obligations.length === 0 ? (
          <p className="text-sm text-muted">Нема евидентираних обавеза.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {s.obligations.map((o) => (
              <li key={o} className="flex gap-2.5 rounded-xl border border-line px-3 py-2 text-sm text-ink">
                <CircleCheck className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
                <span className="min-w-0">{o}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="eyebrow">Дневник комуникације</h3>
        </div>
        <NoteForm stakeholderId={s.id} />
        <ol className="relative mt-4 ml-1.5 border-l border-line-strong pl-5">
          {s.log.map((e, i) => {
            const Icon = KIND_ICONS[e.kind];
            return (
              <li key={`${e.date}-${i}`} className="relative pb-4 last:pb-0">
                <span
                  className={cn(
                    'absolute top-0.5 -left-[1.95rem] inline-flex size-6 items-center justify-center rounded-full border bg-surface',
                    e.isUserCreated ? 'border-info text-info' : 'border-line-strong text-muted',
                  )}
                  aria-hidden
                >
                  <Icon className="size-3.5" />
                </span>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                  <span>{formatDate(e.date, 'long')}</span>
                  <Badge tone="neutral" size="sm">
                    {ENGAGEMENT_KIND_LABELS[e.kind]}
                  </Badge>
                  {e.isUserCreated && (
                    <Badge tone="info" variant="outline" size="sm">
                      ново
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-ink">{e.summary}</p>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

/** „Додај белешку“ → inline form (kind + text); stores the entry dated DEMO_TODAY in the app store. */
function NoteForm({ stakeholderId }: { stakeholderId: string }) {
  const addNote = useAppStore((st) => st.addStakeholderNote);
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<EngagementKind>('sastanak');
  const [text, setText] = useState('');

  if (!open) {
    return (
      <Button variant="secondary" size="sm" icon={Plus} onClick={() => setOpen(true)}>
        Додај белешку
      </Button>
    );
  }
  const save = () => {
    const summary = text.trim();
    if (!summary) return;
    addNote(stakeholderId, { date: DEMO_TODAY, kind, summary });
    setText('');
    setOpen(false);
  };
  return (
    <form
      className="flex flex-col gap-3 rounded-2xl border border-line bg-surface-2/40 p-3"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <Select label="Врста контакта" value={kind} onChange={setKind} options={KIND_OPTIONS} />
      <div>
        <label htmlFor={`note-${stakeholderId}`} className="mb-1 block text-sm text-ink">
          Белешка
        </label>
        <textarea
          id={`note-${stakeholderId}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Шта је договорено или послато?"
          className="w-full resize-y rounded-xl border border-line bg-surface px-3 py-2 text-[0.95rem] text-ink placeholder:text-muted focus:border-accent focus:outline-none"
        />
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Откажи
        </Button>
        <Button type="submit" size="sm" disabled={text.trim() === ''}>
          Сачувај белешку
        </Button>
      </div>
    </form>
  );
}
