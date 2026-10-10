import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { BookMarked, Building, FileText, Gavel, Leaf, Scale, SendHorizontal, Sparkles, type LucideIcon } from 'lucide-react';
import { StreamingText, ThinkingDots, useReducedMotion, useScriptedRun } from '@/components/ai';
import { IconButton } from '@/components/ui';
import { getRegulation } from '@/data';
import { cn } from '@/lib/cn';
import { ASK_FALLBACK, ASK_SCRIPTS, type Citation } from './askScripts';
import type { AskMessage, AskThread } from './useAskThread';

const CITATION_ICONS: Record<Extract<Citation, { kind: 'link' }>['icon'], LucideIcon> = {
  project: Building,
  decision: Scale,
  session: Gavel,
  materials: Leaf,
  document: FileText,
};

const chipCls =
  'inline-flex min-h-9 max-w-full items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors';

/** Sources of an answer: library entries (`/smernice/:id`, firm standards in clay) and project / decision / session pages. */
function Citations({ citations }: { citations: Citation[] }) {
  return (
    <div className="mt-3 border-t border-line pt-3">
      <p className="eyebrow mb-1.5">Извори</p>
      <ul className="flex flex-wrap gap-1.5">
        {citations.map((c) => {
          if (c.kind === 'reg') {
            const reg = getRegulation(c.id);
            if (!reg) return null;
            const firm = reg.kind === 'smernica-firme';
            return (
              <li key={c.id} className="min-w-0 max-w-full">
                <Link
                  to={`/smernice/${reg.id}`}
                  title={reg.title}
                  className={cn(
                    chipCls,
                    firm ? 'border-clay/40 bg-clay-soft text-clay hover:border-clay' : 'border-line bg-surface text-accent hover:border-accent hover:bg-accent-soft',
                  )}
                >
                  <BookMarked className="size-3.5 shrink-0" aria-hidden />
                  <span className="truncate">{c.label}</span>
                </Link>
              </li>
            );
          }
          const Icon = CITATION_ICONS[c.icon];
          return (
            <li key={c.to} className="min-w-0 max-w-full">
              <Link to={c.to} className={cn(chipCls, 'border-line bg-surface text-ink hover:border-accent hover:text-accent')}>
                <Icon className="size-3.5 shrink-0 text-muted" aria-hidden />
                <span className="truncate">{c.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** One scripted answer: ThinkingDots (~1 s) → StreamingText → citations. Finished answers render instantly on remount. */
function AnswerBubble({ message, onDone }: { message: AskMessage; onDone: (id: number) => void }) {
  const reduced = useReducedMotion();
  const wasDone = useRef(message.done).current; // finished before this mount → no animation
  const run = useScriptedRun({ thinkingMs: reduced ? 200 : 1000 });
  const { start, finish } = run;
  useEffect(() => {
    if (wasDone) finish();
    else start();
  }, [wasDone, start, finish]);

  const text = message.script?.answer ?? ASK_FALLBACK;
  const showText = run.state === 'streaming' || run.state === 'done';
  const done = run.state === 'done';

  return (
    <div className="flex min-w-0 max-w-[96%] flex-col items-start">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-info">
        <Sparkles className="size-3.5" aria-hidden />
        АрхиБорд
      </div>
      <div className="min-w-0 rounded-2xl rounded-tl-md border border-line bg-surface-2/60 px-3.5 py-3">
        {run.state === 'thinking' && <ThinkingDots label="Претражујем библиотеку…" />}
        {showText && (
          <StreamingText
            text={text}
            speed={wasDone ? 100 : 44}
            instant={wasDone}
            onDone={() => {
              finish();
              onDone(message.id);
            }}
            className="text-[0.92rem]"
          />
        )}
        {done && message.script && <Citations citations={message.script.citations} />}
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[88%] rounded-2xl rounded-br-md bg-accent-soft px-3.5 py-2.5 text-[0.92rem] leading-snug text-ink">{text}</p>
    </div>
  );
}

/** Suggested-question chip (wraps onto several lines on phones). */
export function QuestionChip({ question, onAsk, disabled }: { question: string; onAsk: (q: string) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onAsk(question)}
      className="inline-flex min-h-10 max-w-full items-center gap-2 rounded-2xl border border-line bg-surface px-3 py-2 text-left text-sm leading-snug text-ink transition-colors hover:border-accent hover:bg-accent-soft disabled:pointer-events-none disabled:opacity-50"
    >
      <Sparkles className="size-3.5 shrink-0 text-info" aria-hidden />
      <span className="min-w-0">{question}</span>
    </button>
  );
}

/** Suggested questions: all of them while the thread is empty, afterwards the ones not asked yet. */
export function SuggestedQuestions({ thread, label = 'Предложена питања' }: { thread: AskThread; label?: string }) {
  const list = thread.messages.length === 0 ? ASK_SCRIPTS : ASK_SCRIPTS.filter((s) => !thread.askedIds.has(s.id));
  if (list.length === 0) return null;
  return (
    <div>
      <p className="eyebrow mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-2">
        {list.map((s) => (
          <QuestionChip key={s.id} question={s.question} onAsk={thread.ask} disabled={thread.busy} />
        ))}
      </div>
    </div>
  );
}

/** Chat thread (user questions + streamed answers). Keeps the newest message in view while it is being written. */
export function AskThreadView({ thread, maxHeightClass }: { thread: AskThread; maxHeightClass?: string }) {
  const { messages, busy, markDone } = thread;
  const endRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (messages.length > 0) endRef.current?.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
  }, [messages.length, reduced]);

  useEffect(() => {
    if (!busy) return;
    const id = window.setInterval(() => endRef.current?.scrollIntoView({ block: 'nearest' }), 400);
    return () => {
      window.clearInterval(id);
      window.setTimeout(() => endRef.current?.scrollIntoView({ block: 'nearest' }), 120); // reveal the citations
    };
  }, [busy]);

  if (messages.length === 0) return null;
  return (
    <div role="log" aria-label="Разговор" className={cn('flex min-w-0 flex-col gap-3', maxHeightClass && cn('overflow-y-auto overscroll-contain pr-1', maxHeightClass))}>
      {messages.map((m) => (m.role === 'user' ? <UserBubble key={m.id} text={m.text} /> : <AnswerBubble key={m.id} message={m} onDone={markDone} />))}
      <div ref={endRef} aria-hidden />
    </div>
  );
}

/** Question input + send button. Disabled while an answer is being written. */
export function AskForm({ thread, className }: { thread: AskThread; className?: string }) {
  const [value, setValue] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim() || thread.busy) return;
    thread.ask(value);
    setValue('');
  };
  return (
    <form onSubmit={submit} className={cn('flex w-full min-w-0 items-center gap-2', className)}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={thread.busy}
        placeholder="Поставите питање…"
        aria-label="Питање за АрхиБорд"
        enterKeyHint="send"
        className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 text-[0.95rem] text-ink placeholder:text-muted focus:border-accent focus:outline-none disabled:opacity-60"
      />
      <IconButton icon={SendHorizontal} label="Пошаљи питање" variant="primary" type="submit" disabled={thread.busy || !value.trim()} className="size-11" />
    </form>
  );
}
