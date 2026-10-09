import { useEffect, useId, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { FaceNeutral, MessageSquareHeart, ThumbsDown, ThumbsUp } from 'lucide-react';
import type { FeedbackRating } from '@/domain/types';
import { FEEDBACK_RATING_LABELS } from '@/domain/labels';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/store/useAppStore';
import { useModuleFeedback } from '@/store/selectors';

const OPTIONS: Array<{ rating: FeedbackRating; icon: LucideIcon; active: string }> = [
  { rating: 'up', icon: ThumbsUp, active: 'border-good bg-good-soft text-good' },
  { rating: 'meh', icon: FaceNeutral, active: 'border-warn bg-warn-soft text-warn' },
  { rating: 'down', icon: ThumbsDown, active: 'border-bad bg-bad-soft text-bad' },
];

export interface FeedbackWidgetProps {
  /** Stable kebab-case module id (see MODULES in components/layout/navigation.ts). */
  moduleId: string;
  /** Override the question. */
  question?: string;
  className?: string;
}

/**
 * „Да ли бисте користили ову функцију?“ — demo feedback card. Put at the bottom of every routed page.
 * Saves to the store with the presenter's current session label; answers can be changed.
 * @example <FeedbackWidget moduleId="projekat-varijante" />
 */
export function FeedbackWidget({ moduleId, question = 'Да ли бисте користили ову функцију?', className }: FeedbackWidgetProps) {
  const entry = useModuleFeedback(moduleId);
  const setFeedback = useAppStore((s) => s.setFeedback);
  const setFeedbackNote = useAppStore((s) => s.setFeedbackNote);
  const sessionLabel = useAppStore((s) => s.feedbackSessionLabel);
  const [note, setNote] = useState(entry?.note ?? '');
  const [noteSaved, setNoteSaved] = useState(false);
  const noteId = useId();

  // Sync the draft when the stored entry changes (other session label, reset).
  useEffect(() => {
    setNote(entry?.note ?? '');
  }, [entry?.note, moduleId]);

  const saveNote = () => {
    setFeedbackNote(moduleId, note.trim());
    setNoteSaved(true);
    window.setTimeout(() => setNoteSaved(false), 1600);
  };

  return (
    <aside
      aria-label="Повратна информација"
      className={cn('mt-10 rounded-2xl border border-dashed border-line-strong bg-surface/60 p-4 md:p-5', className)}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-2.5">
          <MessageSquareHeart className="mt-0.5 size-5 shrink-0 text-clay" aria-hidden />
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">{entry ? 'Хвала на одговору!' : question}</p>
            <p className="text-xs text-muted">
              {entry ? 'Можете да промените одговор или додате напомену.' : 'Демо анкета — одговор остаје на овом уређају.'}
              {sessionLabel && <span> · Сесија: {sessionLabel}</span>}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2" role="radiogroup" aria-label={question}>
          {OPTIONS.map(({ rating, icon: Icon, active }) => {
            const selected = entry?.rating === rating;
            return (
              <button
                key={rating}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setFeedback(moduleId, rating)}
                className={cn(
                  'inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border px-3.5 text-sm font-medium transition-colors sm:flex-none',
                  selected ? active : 'border-line bg-surface text-ink hover:border-line-strong',
                )}
              >
                <Icon className="size-4" aria-hidden />
                {FEEDBACK_RATING_LABELS[rating]}
              </button>
            );
          })}
        </div>
      </div>
      {entry && (
        <div className="mt-3 animate-fade-in">
          <label htmlFor={noteId} className="mb-1 block text-xs text-muted">
            Напомена (опционо) — шта би ову функцију учинило кориснијом?
          </label>
          <textarea
            id={noteId}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => note.trim() !== (entry.note ?? '') && saveNote()}
            rows={2}
            className="w-full resize-y rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
            placeholder="нпр. „Корисно ако би се повезало са нашим BIM моделом“"
          />
          <div className="mt-1.5 flex items-center justify-end gap-3">
            {noteSaved && <span className="text-xs text-good">Сачувано</span>}
            <button
              type="button"
              onClick={saveNote}
              className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium text-accent hover:bg-accent-soft"
            >
              Сачувај напомену
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
