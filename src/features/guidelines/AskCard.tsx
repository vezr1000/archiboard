import { useEffect, useRef, useState } from 'react';
import { MessagesSquare, RotateCcw, Sparkles } from 'lucide-react';
import { AiBadge } from '@/components/ai';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { Button, Card, Sheet, useMediaQuery } from '@/components/ui';
import { cn } from '@/lib/cn';
import { AskForm, AskThreadView, QuestionChip, SuggestedQuestions } from './AskParts';
import { ASK_SCRIPTS } from './askScripts';
import { useAskThread } from './useAskThread';

const DISCLAIMER = 'Демо: одговори су унапред припремљени и општи — за примену консултовати важећи текст прописа.';
const INTRO = 'Поставите питање о прописима, стандардима и смерницама фирме. АрхиБорд одговара кратко и наводи изворе из библиотеке.';
const FEEDBACK_QUESTION = 'Да ли бисте користили овакав АИ асистент за прописе и смернице фирме?';

/**
 * ★ „Питај АрхиБорд“ — scripted Q&A on the library page.
 * ≥768px: the full chat lives in the card. Phones: the card is a compact teaser (suggested questions, „Отвори разговор“)
 * and the chat opens in a bottom sheet — also from a floating „Питај“ button that appears once the card is scrolled away.
 * The thread is page state, so it survives closing the sheet.
 */
export function AskCard() {
  const thread = useAskThread();
  const inline = useMediaQuery('(min-width: 768px)');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [cardVisible, setCardVisible] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  // Floating button only while the card itself is out of view.
  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setCardVisible(entry?.isIntersecting ?? true), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hasThread = thread.messages.length > 0;
  const askFromTeaser = (q: string) => {
    setSheetOpen(true);
    thread.ask(q);
  };

  const header = (
    <header className="mb-3 flex min-w-0 items-start justify-between gap-3">
      <div className="min-w-0">
        <AiBadge />
        <h2 className="mt-2 font-display text-xl leading-snug text-ink">Питај АрхиБорд</h2>
        <p className="mt-0.5 max-w-2xl text-sm text-muted">{INTRO}</p>
      </div>
      {inline && hasThread && (
        <Button variant="ghost" size="sm" icon={RotateCcw} onClick={thread.reset} disabled={thread.busy} className="shrink-0">
          Нова питања
        </Button>
      )}
    </header>
  );

  return (
    <>
      <div ref={cardRef}>
        <Card className="border-info/30" id="pitaj">
          {header}
          {inline ? (
            <div className="flex flex-col gap-4">
              <AskThreadView thread={thread} maxHeightClass="max-h-[30rem]" />
              <SuggestedQuestions thread={thread} label={hasThread ? 'Још питања' : 'Предложена питања'} />
              <AskForm thread={thread} />
              <p className="text-xs leading-snug text-muted">{DISCLAIMER}</p>
              <FeedbackWidget moduleId="smernice-pitaj" compact className="mt-0!" question={FEEDBACK_QUESTION} />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                {ASK_SCRIPTS.slice(0, 3).map((s) => (
                  <QuestionChip key={s.id} question={s.question} onAsk={askFromTeaser} />
                ))}
              </div>
              <Button icon={MessagesSquare} fullWidth onClick={() => setSheetOpen(true)}>
                {hasThread ? 'Настави разговор' : 'Отвори разговор (6 питања)'}
              </Button>
              <p className="text-xs leading-snug text-muted">{DISCLAIMER}</p>
            </div>
          )}
        </Card>
      </div>

      {!inline && (
        <>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            aria-hidden={cardVisible}
            tabIndex={cardVisible ? -1 : 0}
            className={cn(
              'fixed right-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-20 inline-flex h-12 items-center gap-2 rounded-full bg-accent px-5 text-[0.95rem] font-medium text-accent-ink shadow-pop transition-[transform,opacity] duration-200',
              cardVisible && 'pointer-events-none translate-y-3 opacity-0',
            )}
          >
            <Sparkles className="size-4" aria-hidden />
            Питај
          </button>

          <Sheet
            open={sheetOpen}
            onClose={() => setSheetOpen(false)}
            title="Питај АрхиБорд"
            subtitle={<AiBadge size="sm" />}
            footer={<AskForm thread={thread} />}
          >
            <div className="flex flex-col gap-4">
              {!hasThread && <p className="text-sm text-muted">{INTRO}</p>}
              <AskThreadView thread={thread} />
              <SuggestedQuestions thread={thread} label={hasThread ? 'Још питања' : 'Предложена питања'} />
              {hasThread && (
                <Button variant="ghost" size="sm" icon={RotateCcw} onClick={thread.reset} disabled={thread.busy} className="self-start">
                  Нова питања
                </Button>
              )}
              <p className="text-xs leading-snug text-muted">{DISCLAIMER}</p>
              <FeedbackWidget moduleId="smernice-pitaj" compact className="mt-0!" question={FEEDBACK_QUESTION} />
            </div>
          </Sheet>
        </>
      )}
    </>
  );
}
