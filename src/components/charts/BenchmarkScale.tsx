import type { KpiDirection, Tone } from '@/domain/types';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';
import { TONE_CLASSES } from '@/components/ui/tone';

export interface BenchmarkMark {
  id: string;
  /** Short name, e.g. „Пропис“, „Циљ фирме“. */
  label: string;
  value: number;
}

export interface BenchmarkScaleProps {
  /** Benchmark ticks (regulatory minimum, EU taxonomy, firm target, best practice …), any order. */
  marks: BenchmarkMark[];
  /** Current value — drawn as the filled marker. */
  current: number;
  /** Project target — drawn as a thicker tick. */
  target?: number;
  /** Decides which side is „better“; the better side is always drawn on the right. */
  direction: KpiDirection;
  /** Tone of the current-value marker. Default accent. */
  currentTone?: Tone;
  /** Mark id to emphasise (e.g. the selected ambition level). */
  highlightId?: string;
  format?: (v: number) => string;
  title: string;
  className?: string;
}

const LANE_H = 17;
/** Assumed container width (px) used only to avoid overlapping labels; the layout itself is fluid. */
const ASSUMED_W = 290;
const CHAR_W = 6;

interface Item {
  id: string;
  name: string;
  valueText: string;
  pos: number; // 0..100, better = right
  kind: 'mark' | 'target';
  highlight?: boolean;
}

/**
 * Compact horizontal „ladder“: where the current value sits relative to the regulatory minimum, EU taxonomy,
 * firm target and best practice. The better side is always on the right, whatever the KPI direction.
 * @example
 * <BenchmarkScale title="Уграђени угљеник" direction="lower-better" current={358} target={320}
 *   marks={[{ id: 'firm', label: 'Циљ фирме', value: 350 }, { id: 'best', label: 'Најбоља пракса', value: 250 }]} />
 */
export function BenchmarkScale({ marks, current, target, direction, currentTone = 'accent', highlightId, format = (v) => formatNumber(v), title, className }: BenchmarkScaleProps) {
  const values = [current, ...(target !== undefined ? [target] : []), ...marks.map((m) => m.value)];
  let lo = Math.min(...values);
  let hi = Math.max(...values);
  if (lo === hi) {
    lo -= Math.abs(lo) * 0.1 || 1;
    hi += Math.abs(hi) * 0.1 || 1;
  }
  const pad = (hi - lo) * 0.08;
  lo -= pad;
  hi += pad;
  const posOf = (v: number) => ((direction === 'lower-better' ? hi - v : v - lo) / (hi - lo)) * 100;

  const items: Item[] = [
    ...marks.map((m) => ({ id: m.id, name: m.label, valueText: format(m.value), pos: posOf(m.value), kind: 'mark' as const, highlight: m.id === highlightId })),
    ...(target !== undefined ? [{ id: 'target', name: 'Циљ пројекта', valueText: format(target), pos: posOf(target), kind: 'target' as const }] : []),
  ].sort((a, b) => a.pos - b.pos);

  // Greedy lane assignment so labels do not overlap.
  const laneEnds: number[] = [];
  const placed = items.map((it) => {
    const w = ((it.name.length + it.valueText.length + 1) * CHAR_W + 8) / ASSUMED_W * 100;
    const align: 'start' | 'center' | 'end' = it.pos < 24 ? 'start' : it.pos > 76 ? 'end' : 'center';
    const start = align === 'start' ? it.pos : align === 'end' ? it.pos - w : it.pos - w / 2;
    const end = start + w;
    let lane = laneEnds.findIndex((e) => start >= e + 1);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = end;
    return { ...it, lane, align };
  });
  const lanes = Math.max(1, laneEnds.length);
  const labelsH = lanes * LANE_H + 4;

  // Compliant zone: from the most lenient mark to the better end.
  const zoneStart = marks.length > 0 ? Math.min(...marks.map((m) => posOf(m.value))) : undefined;
  const curPos = posOf(current);
  const curAlign = curPos < 18 ? 'start' : curPos > 82 ? 'end' : 'center';

  return (
    <div
      className={cn('min-w-0', className)}
      role="img"
      aria-label={`${title}: тренутно ${format(current)}${marks.length ? `; ${marks.map((m) => `${m.label} ${format(m.value)}`).join(', ')}` : ''}`}
    >
      <div className="relative" style={{ height: labelsH }} aria-hidden>
        {placed.map((it) => (
          <div key={it.id}>
            <span
              className={cn(
                'absolute z-10 whitespace-nowrap rounded bg-surface px-0.5 text-[0.68rem] leading-4',
                it.kind === 'target' ? 'font-semibold text-ink' : it.highlight ? 'font-semibold text-clay' : 'text-muted',
              )}
              style={{
                top: it.lane * LANE_H,
                ...(it.align === 'start' ? { left: `${it.pos}%` } : it.align === 'end' ? { right: `${100 - it.pos}%` } : { left: `${it.pos}%`, transform: 'translateX(-50%)' }),
              }}
            >
              {it.name} <span className="tabular font-semibold text-ink">{it.valueText}</span>
            </span>
            <span
              className={cn('absolute w-px', it.kind === 'target' ? 'bg-ink' : it.highlight ? 'bg-clay' : 'bg-line-strong')}
              style={{ left: `${it.pos}%`, top: it.lane * LANE_H + 16, bottom: 0 }}
            />
          </div>
        ))}
      </div>
      <div className="relative h-2.5 rounded-full bg-surface-2" aria-hidden>
        {zoneStart !== undefined && (
          <div className="absolute inset-y-0 rounded-full bg-good-soft" style={{ left: `${Math.max(0, zoneStart)}%`, right: 0 }} />
        )}
        {placed.map((it) => (
          <span
            key={it.id}
            className={cn('absolute -top-1 -bottom-1 w-px -translate-x-1/2', it.kind === 'target' ? 'w-0.5 bg-ink' : it.highlight ? 'w-0.5 bg-clay' : 'bg-line-strong')}
            style={{ left: `${it.pos}%` }}
          />
        ))}
        <span
          className={cn('absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface', TONE_CLASSES[currentTone].bg)}
          style={{ left: `${curPos}%` }}
        />
      </div>
      <div className="relative mt-1.5 h-4 text-[0.68rem] leading-4 text-muted" aria-hidden>
        <span
          className={cn('absolute z-10 whitespace-nowrap rounded-full bg-surface px-1.5 font-semibold', TONE_CLASSES[currentTone].text)}
          style={curAlign === 'start' ? { left: `${curPos}%` } : curAlign === 'end' ? { right: `${100 - curPos}%` } : { left: `${curPos}%`, transform: 'translateX(-50%)' }}
        >
          тренутно <span className="tabular">{format(current)}</span>
        </span>
      </div>
    </div>
  );
}
