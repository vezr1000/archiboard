import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { useReducedMotion } from './useReducedMotion';

export interface StreamingTextProps {
  text: string;
  /** Start revealing (false = render nothing). Default true. */
  active?: boolean;
  /** Words per second. Default 28. */
  speed?: number;
  /** Show everything at once (e.g. an answer that was already streamed before a remount). */
  instant?: boolean;
  /** Called once when fully revealed. */
  onDone?: () => void;
  /** Render as block paragraph(s). `\n\n` splits paragraphs; a paragraph starting with „•“ becomes a bullet. Default true. */
  paragraphs?: boolean;
  className?: string;
}

/**
 * Reveals text word by word (scripted „AI“ answer). Reduced motion → shows everything at once.
 * @example <StreamingText text={answer} active={state === 'streaming'} onDone={finish} />
 */
export function StreamingText({ text, active = true, speed = 28, instant, onDone, paragraphs = true, className }: StreamingTextProps) {
  const reduced = useReducedMotion();
  const tokens = text.split(/(\s+)/);
  const [count, setCount] = useState(0);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    doneRef.current = false;
    if (!active) {
      setCount(0);
      return;
    }
    if (reduced || instant) {
      setCount(tokens.length);
      return;
    }
    setCount(0);
    const interval = 1000 / speed / 2; // tokens include whitespace
    const id = window.setInterval(() => {
      setCount((c) => {
        if (c >= tokens.length) {
          window.clearInterval(id);
          return c;
        }
        return c + 1;
      });
    }, interval);
    return () => window.clearInterval(id);
  }, [text, active, reduced, instant, speed]);

  useEffect(() => {
    if (active && count >= tokens.length && !doneRef.current) {
      doneRef.current = true;
      onDoneRef.current?.();
    }
  }, [active, count, tokens.length]);

  if (!active) return null;
  const shown = tokens.slice(0, count).join('');
  const streaming = count < tokens.length;
  const caret = streaming ? <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-info" aria-hidden /> : null;

  return (
    <div className={cn('text-[0.95rem] leading-relaxed text-ink', className)} aria-live="polite" aria-busy={streaming}>
      {paragraphs
        ? shown.split(/\n{2,}/).map((p, i, arr) =>
            p.startsWith('•') ? (
              // Bullet paragraph („• текст“): hanging indent, tighter spacing.
              <p key={i} className="mb-1.5 flex gap-2 whitespace-pre-line last:mb-0">
                <span aria-hidden className="text-muted">
                  •
                </span>
                <span className="min-w-0 flex-1">
                  {p.slice(1).trimStart()}
                  {i === arr.length - 1 && caret}
                </span>
              </p>
            ) : (
              <p key={i} className="mb-2 whitespace-pre-line last:mb-0">
                {p}
                {i === arr.length - 1 && caret}
              </p>
            ),
          )
        : (
          <span className="whitespace-pre-line">
            {shown}
            {caret}
          </span>
        )}
    </div>
  );
}
