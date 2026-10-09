import { useId } from 'react';
import { riskScoreTone } from '@/domain/labels';
import { cn } from '@/lib/cn';
import { toneVar } from '@/components/ui/tone';

export interface HeatItem {
  id: string;
  /** 1..5 (x axis). */
  probability: number;
  /** 1..5 (y axis, bottom → top). */
  impact: number;
  label?: string;
}

export interface HeatMap5x5Props {
  items: HeatItem[];
  /** Highlighted cell. */
  selected?: { probability: number; impact: number } | null;
  onCellClick?: (cell: { probability: number; impact: number; items: HeatItem[] }) => void;
  xLabel?: string;
  yLabel?: string;
  title: string;
  className?: string;
}

/**
 * 5×5 risk matrix (probability × impact) with item counts per cell. Cells are coloured by score (P×I).
 * @example <HeatMap5x5 title="Матрица ризика" items={risks} onCellClick={(c) => setFilter(c)} />
 */
export function HeatMap5x5({ items, selected, onCellClick, xLabel = 'Вероватноћа', yLabel = 'Утицај', title, className }: HeatMap5x5Props) {
  const titleId = useId();
  const cell = 50;
  const gap = 4;
  const left = 30;
  const top = 6;
  const gridSize = 5 * cell + 4 * gap;
  const W = left + gridSize + 4;
  const H = top + gridSize + 34;
  const at = (p: number, i: number) => items.filter((it) => it.probability === p && it.impact === i);

  return (
    <figure className={cn('min-w-0', className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block w-full max-w-[24rem]" role="img" aria-labelledby={titleId}>
        <title id={titleId}>{title}</title>
        {[1, 2, 3, 4, 5].map((imp) =>
          [1, 2, 3, 4, 5].map((prob) => {
            const x = left + (prob - 1) * (cell + gap);
            const y = top + (5 - imp) * (cell + gap);
            const list = at(prob, imp);
            const score = prob * imp;
            const tone = riskScoreTone(score);
            const isSel = selected?.probability === prob && selected?.impact === imp;
            const clickable = Boolean(onCellClick);
            return (
              <g
                key={`${prob}-${imp}`}
                onClick={clickable ? () => onCellClick!({ probability: prob, impact: imp, items: list }) : undefined}
                style={clickable ? { cursor: 'pointer' } : undefined}
                role={clickable ? 'button' : undefined}
                aria-label={clickable ? `${xLabel} ${prob}, ${yLabel} ${imp}: ${list.length}` : undefined}
                tabIndex={clickable ? 0 : undefined}
                onKeyDown={
                  clickable
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onCellClick!({ probability: prob, impact: imp, items: list });
                        }
                      }
                    : undefined
                }
              >
                <rect
                  x={x}
                  y={y}
                  width={cell}
                  height={cell}
                  rx="8"
                  fill={toneVar(tone, true)}
                  stroke={isSel ? 'var(--ink)' : 'none'}
                  strokeWidth="2"
                  opacity={0.55 + (score / 25) * 0.45}
                />
                {list.length > 0 && (
                  <>
                    <circle cx={x + cell / 2} cy={y + cell / 2} r="13" fill={toneVar(tone)} />
                    <text x={x + cell / 2} y={y + cell / 2} textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="600" fill="var(--paper)">
                      {list.length}
                    </text>
                    {list.length === 1 && list[0].label && <title>{list[0].label}</title>}
                  </>
                )}
              </g>
            );
          }),
        )}
        {[1, 2, 3, 4, 5].map((n) => (
          <g key={n}>
            <text x={left + (n - 1) * (cell + gap) + cell / 2} y={top + gridSize + 13} textAnchor="middle" fontSize="11" fill="var(--muted)">
              {n}
            </text>
            <text x={left - 8} y={top + (5 - n) * (cell + gap) + cell / 2} textAnchor="end" dominantBaseline="central" fontSize="11" fill="var(--muted)">
              {n}
            </text>
          </g>
        ))}
        <text x={left + gridSize / 2} y={H - 3} textAnchor="middle" fontSize="11" fill="var(--muted)">
          {xLabel} →
        </text>
        <text
          x={9}
          y={top + gridSize / 2}
          textAnchor="middle"
          fontSize="11"
          fill="var(--muted)"
          transform={`rotate(-90 9 ${top + gridSize / 2})`}
        >
          {yLabel} →
        </text>
      </svg>
    </figure>
  );
}
