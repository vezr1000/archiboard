import { useCallback, useState } from 'react';
import { matchQuestion, type AskScript } from './askScripts';

export interface AskMessage {
  id: number;
  role: 'user' | 'ai';
  /** User: the typed / chosen question. AI: unused (the script holds the answer). */
  text: string;
  /** AI: matched script, undefined = graceful fallback. */
  script?: AskScript;
  /** AI: the answer has been fully shown (so it is rendered instantly if the view remounts). */
  done: boolean;
}

export interface AskThread {
  messages: AskMessage[];
  /** An answer is still being produced — input is disabled meanwhile. */
  busy: boolean;
  /** Script ids already asked in this thread. */
  askedIds: Set<string>;
  ask: (question: string) => void;
  markDone: (id: number) => void;
  reset: () => void;
}

/**
 * Thread state of „Питај АрхиБорд“. Lives in the page component (not the store): it survives opening/closing the
 * mobile sheet but not leaving the page. Free text goes through `matchQuestion`; no match → scripted fallback.
 */
export function useAskThread(): AskThread {
  const [messages, setMessages] = useState<AskMessage[]>([]);

  const busy = messages.length > 0 && !messages[messages.length - 1]!.done;

  const ask = useCallback(
    (question: string) => {
      const text = question.trim();
      if (!text || busy) return;
      const script = matchQuestion(text);
      setMessages((prev) => {
        const next = prev.length === 0 ? 1 : prev[prev.length - 1]!.id + 1;
        return [...prev, { id: next, role: 'user', text, done: true }, { id: next + 1, role: 'ai', text: '', script, done: false }];
      });
    },
    [busy],
  );

  const markDone = useCallback((id: number) => {
    setMessages((prev) => (prev.some((m) => m.id === id && !m.done) ? prev.map((m) => (m.id === id ? { ...m, done: true } : m)) : prev));
  }, []);

  const reset = useCallback(() => setMessages([]), []);

  const askedIds = new Set(messages.flatMap((m) => (m.role === 'ai' && m.script ? [m.script.id] : [])));

  return { messages, busy, askedIds, ask, markDone, reset };
}
