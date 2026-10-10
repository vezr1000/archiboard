import { useEffect, useId, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Check, ChevronDown, Copy, Download, FaceNeutral, MessageSquareHeart, ThumbsDown, ThumbsUp, Trash } from 'lucide-react';
import { StackedBar } from '@/components/charts';
import { MODULES } from '@/components/layout/navigation';
import type { DataColumn, FilterChipOption } from '@/components/ui';
import { Button, Card, DataList, EmptyState, FilterChips, Modal, PageHeader, Stat } from '@/components/ui';
import { FEEDBACK_RATING_LABELS } from '@/domain/labels';
import type { FeedbackRating } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatPct, formatRelative, formatSigned } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';
import {
  buildCsv,
  buildJson,
  buildSummaryText,
  downloadFile,
  exportFilename,
  notesOf,
  plural,
  rankModules,
  sessionKeyOf,
  sessionName,
  sessionOptions,
  type ModuleRow,
} from './feedbackLogic';

const MODULE_LABEL: Record<string, string> = Object.fromEntries(MODULES.map((m) => [m.id, m.label]));

const RATING_ICON: Record<FeedbackRating, LucideIcon> = { up: ThumbsUp, meh: FaceNeutral, down: ThumbsDown };
const RATING_TEXT: Record<FeedbackRating, string> = { up: 'text-good', meh: 'text-warn', down: 'text-bad' };

const scoreClass = (score: number) => (score > 0 ? 'text-good' : score < 0 ? 'text-bad' : 'text-muted');

const RANK_COLUMNS: DataColumn<ModuleRow>[] = [
  {
    id: 'module',
    header: 'Модул',
    cell: (r) => (
      <div className="min-w-0">
        <div className="font-medium text-ink">{r.label}</div>
        <div className="text-xs text-muted">{r.group}</div>
      </div>
    ),
  },
  {
    id: 'counts',
    header: 'Да · Можда · Не',
    mobileLabel: 'Да · Можда · Не',
    align: 'center',
    cell: (r) => (
      <span className="tabular whitespace-nowrap">
        <span className="text-good">{r.up}</span>
        <span className="text-muted"> · </span>
        <span className="text-warn">{r.meh}</span>
        <span className="text-muted"> · </span>
        <span className="text-bad">{r.down}</span>
      </span>
    ),
  },
  {
    id: 'score',
    header: 'Резултат',
    align: 'right',
    cell: (r) => <span className={cn('tabular font-semibold', scoreClass(r.score))}>{formatSigned(r.score, 2)}</span>,
  },
  {
    id: 'bar',
    header: 'Расподела',
    cell: (r) => (
      <StackedBar
        title={`${r.label}: расподела одговора`}
        total={r.total}
        height="sm"
        showLegend={false}
        segments={[
          { id: 'up', label: FEEDBACK_RATING_LABELS.up, value: r.up, tone: 'good' },
          { id: 'meh', label: FEEDBACK_RATING_LABELS.meh, value: r.meh, tone: 'warn' },
          { id: 'down', label: FEEDBACK_RATING_LABELS.down, value: r.down, tone: 'bad' },
        ]}
      />
    ),
  },
  {
    id: 'notes',
    header: 'Белешке',
    align: 'right',
    cell: (r) => <span className="tabular">{r.notes}</span>,
  },
];

type CopyState = 'idle' | 'ok' | 'fail';

/** `/povratne-informacije` — presenter's summary of the demo feedback widgets (CONCEPT §6.15). Has no FeedbackWidget of its own. */
export function FeedbackSummaryPage() {
  const feedback = useAppStore((s) => s.feedback);
  const storedLabel = useAppStore((s) => s.feedbackSessionLabel);
  const setSessionLabel = useAppStore((s) => s.setFeedbackSessionLabel);
  const clearFeedback = useAppStore((s) => s.clearFeedback);

  const labelId = useId();
  const [draft, setDraft] = useState(storedLabel);
  // Sync the input when the stored label changes from elsewhere (store trims on save).
  useEffect(() => setDraft(storedLabel), [storedLabel]);

  const commitLabel = () => {
    const v = draft.trim();
    setDraft(v);
    setSessionLabel(v);
  };

  // Session filter: the chips are multi-select and default to „all“, so we store what is EXCLUDED.
  // New sessions therefore appear active automatically.
  const [excluded, setExcluded] = useState<string[]>([]);
  const sessions = useMemo(() => sessionOptions(feedback), [feedback]);
  const activeSessions = useMemo(() => sessions.map((s) => s.value).filter((v) => !excluded.includes(v)), [sessions, excluded]);
  const filtered = useMemo(() => feedback.filter((f) => activeSessions.includes(sessionKeyOf(f))), [feedback, activeSessions]);

  const sessionChips: FilterChipOption<string>[] = sessions.map((s) => ({ value: s.value, label: s.label, count: s.count }));
  const onSessionsChange = (values: string[]) =>
    setExcluded(sessions.map((s) => s.value).filter((v) => !values.includes(v)));

  const { ranked, unanswered } = useMemo(() => rankModules(filtered), [filtered]);
  const notes = useMemo(() => notesOf(filtered), [filtered]);
  const up = filtered.filter((f) => f.rating === 'up').length;
  const sessionCount = new Set(filtered.map(sessionKeyOf)).size;

  const exportCsv = () => downloadFile(exportFilename('csv'), buildCsv(filtered), 'text/csv;charset=utf-8');
  const exportJson = () => downloadFile(exportFilename('json'), buildJson(filtered, activeSessions), 'application/json;charset=utf-8');

  const [copyState, setCopyState] = useState<CopyState>('idle');
  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(buildSummaryText(filtered, ranked));
      setCopyState('ok');
    } catch {
      setCopyState('fail');
    }
    window.setTimeout(() => setCopyState('idle'), 1800);
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteAll = () => {
    clearFeedback();
    setExcluded([]);
    setConfirmOpen(false);
  };

  const hasFeedback = feedback.length > 0;

  return (
    <>
      <PageHeader
        eyebrow="Демо · за презентера"
        title="Повратне информације"
        subtitle="Одговори са виџета на дну сваке странице, збирно по модулима и сесијама. Ова страница је за презентера, не за архитекте."
      />

      <Card title="Сесија" subtitle="Ознака се додаје сваком новом одговору" className="mb-6">
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor={labelId} className="mb-1 block text-sm font-medium text-ink">
              Ознака сесије
            </label>
            <input
              id={labelId}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitLabel}
              onKeyDown={(e) => e.key === 'Enter' && commitLabel()}
              placeholder="нпр. Студио Х"
              maxLength={60}
              className="h-10 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none sm:max-w-md"
            />
            <p className="mt-1.5 text-xs text-muted">Нови одговори ће бити означени овом сесијом (нпр. назив бироа)</p>
          </div>

          {sessionChips.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs text-muted">Прикажи одговоре из сесија</p>
              <FilterChips
                multiple
                wrap
                ariaLabel="Филтер по сесијама"
                options={sessionChips}
                value={activeSessions}
                onChange={onSessionsChange}
              />
            </div>
          )}
        </div>
      </Card>

      {!hasFeedback && (
        <EmptyState
          icon={MessageSquareHeart}
          title="Још нема одговора"
          description="Одговори стижу из виџета „Да ли бисте користили ову функцију?“ на дну сваке странице. Отворите било коју страницу и изаберите Да, Можда или Не."
        />
      )}

      {hasFeedback && filtered.length === 0 && (
        <EmptyState
          compact
          icon={MessageSquareHeart}
          title="Нема одговора за изабране сесије"
          action={
            <Button variant="secondary" size="sm" onClick={() => setExcluded([])}>
              Прикажи све сесије
            </Button>
          }
        />
      )}

      {filtered.length > 0 && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Card padding="sm" className="p-3.5!">
              <Stat label="Укупно одговора" value={filtered.length} size="md" />
            </Card>
            <Card padding="sm" className="p-3.5!">
              <Stat label="Сесија" value={sessionCount} size="md" />
            </Card>
            <Card padding="sm" className="p-3.5!">
              <Stat label={<span className="whitespace-normal">Модула са одговорима</span>} value={ranked.length} hint={`од ${unanswered.length + ranked.length}`} size="md" />
            </Card>
            <Card padding="sm" className="p-3.5!">
              <Stat
                label={<span className="whitespace-normal">Удео „Да“</span>}
                value={formatPct(up / filtered.length, { ratio: true, decimals: 0 })}
                hint={`${up} од ${filtered.length}`}
                size="md"
              />
            </Card>
          </div>

          <div className="flex flex-col gap-6">
            <Card
              title="Рангирање модула"
              subtitle="Резултат = (Да − Не) / укупно · од −1 до +1, сортирано по резултату, па по броју одговора"
            >
              <DataList
                caption="Рангирање модула"
                rows={ranked}
                rowKey={(r) => r.moduleId}
                columns={RANK_COLUMNS}
                primaryColumn="module"
              />
              {unanswered.length > 0 && (
                <details className="group mt-4 rounded-xl border border-line">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3.5 py-2.5 text-sm font-medium text-muted hover:text-ink">
                    Без одговора ({unanswered.length})
                    <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
                  </summary>
                  <ul className="grid gap-x-6 gap-y-1 border-t border-line px-3.5 py-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                    {unanswered.map((r) => (
                      <li key={r.moduleId} className="text-muted">
                        {r.label} <span className="text-xs">· {r.group}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </Card>

            <Card
              title="Белешке"
              subtitle={notes.length > 0 ? `${notes.length} ${plural(notes.length, ['белешка', 'белешке', 'белешки'])}` : 'Још нема напомена'}
            >
              {notes.length > 0 ? (
                <ul className="flex flex-col divide-y divide-line">
                  {notes.map((f) => {
                    const Icon = RATING_ICON[f.rating];
                    return (
                      <li key={`${f.moduleId}-${sessionKeyOf(f)}`} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                        <Icon className={cn('mt-0.5 size-4 shrink-0', RATING_TEXT[f.rating])} aria-hidden />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                            <span className="text-sm font-medium text-ink">{MODULE_LABEL[f.moduleId] ?? f.moduleId}</span>
                            <time dateTime={f.timestamp} className="text-xs text-muted">
                              {formatRelative(new Date(f.timestamp), new Date())}
                            </time>
                          </div>
                          <p className="mt-0.5 text-xs text-muted">
                            {FEEDBACK_RATING_LABELS[f.rating]} · Сесија: {sessionName(sessionKeyOf(f))}
                          </p>
                          <p className="mt-1.5 break-words text-sm text-ink">{f.note}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted">Одговори без напомене се не приказују овде.</p>
              )}
            </Card>

            <Card title="Извоз" subtitle="Изабране сесије · CSV за табеле, JSON за даљу обраду">
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button variant="secondary" icon={Download} onClick={exportCsv} className="w-full sm:w-auto">
                  Преузми CSV
                </Button>
                <Button variant="secondary" icon={Download} onClick={exportJson} className="w-full sm:w-auto">
                  Преузми JSON
                </Button>
                <Button
                  variant="ghost"
                  icon={copyState === 'ok' ? Check : Copy}
                  onClick={copySummary}
                  className="w-full sm:w-auto"
                >
                  {copyState === 'ok' ? 'Копирано' : copyState === 'fail' ? 'Копирање није успело' : 'Копирај сажетак'}
                </Button>
              </div>
            </Card>

            <Card title="Брисање" subtitle="Брише све одговоре свих сесија, не само изабраних. Ознака сесије се задржава.">
              <Button variant="danger" icon={Trash} onClick={() => setConfirmOpen(true)} className="w-full sm:w-auto">
                Обриши све одговоре
              </Button>
            </Card>
          </div>
        </>
      )}

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Обрисати све одговоре?"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Откажи
            </Button>
            <Button variant="danger" onClick={deleteAll}>
              Обриши све
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          Бришу се сви одговори ({feedback.length}) у свим сесијама. Радња се не може поништити.
        </p>
      </Modal>
    </>
  );
}
