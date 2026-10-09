import { useCallback, useEffect, useRef, useState } from 'react';

export type ScriptedRunState = 'idle' | 'thinking' | 'streaming' | 'done';

export interface ScriptedRunOptions {
  /** Duration of the „thinking“ phase in ms. Default 1400. */
  thinkingMs?: number;
  /**
   * Duration of the „streaming“ phase in ms. If omitted the run stays in 'streaming' until you call `finish()`
   * (e.g. from StreamingText's onDone).
   */
  streamingMs?: number;
}

export interface ScriptedRun {
  state: ScriptedRunState;
  /** Start (or restart) the run: idle → thinking → streaming → done. */
  start: () => void;
  /** Jump to 'done' (e.g. when streaming text finished). */
  finish: () => void;
  /** Back to 'idle'. */
  reset: () => void;
  isRunning: boolean;
}

/**
 * State machine for scripted AI demos.
 * @example
 * const run = useScriptedRun({ thinkingMs: 1500 });
 * <Button onClick={run.start}>Анализирај</Button>
 * {run.state === 'thinking' && <ThinkingDots label="Анализирам…" />}
 * <StreamingText text={answer} active={run.state === 'streaming' || run.state === 'done'} onDone={run.finish} />
 */
export function useScriptedRun({ thinkingMs = 1400, streamingMs }: ScriptedRunOptions = {}): ScriptedRun {
  const [state, setState] = useState<ScriptedRunState>('idle');
  const timers = useRef<number[]>([]);

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  useEffect(() => clear, []);

  const start = useCallback(() => {
    clear();
    setState('thinking');
    timers.current.push(
      window.setTimeout(() => {
        setState('streaming');
        if (streamingMs !== undefined) timers.current.push(window.setTimeout(() => setState('done'), streamingMs));
      }, thinkingMs),
    );
  }, [thinkingMs, streamingMs]);

  const finish = useCallback(() => {
    clear();
    setState('done');
  }, []);

  const reset = useCallback(() => {
    clear();
    setState('idle');
  }, []);

  return { state, start, finish, reset, isRunning: state === 'thinking' || state === 'streaming' };
}
