import { useId } from 'react';
import type { Tone } from '@/domain/types';
import { cn } from '@/lib/cn';
import { toneVar } from '@/components/ui/tone';
import { truncate } from './utils';

export interface QuadrantItem {
  id: string;
  label: string;
  /** 1..5 horizontal (e.g. interest). */
  x: number;
  /** 1..5 vertical, bottom → top (e.g. influence). */
  y: number;
  tone?: Tone;
}

export interface QuadrantGridProps {
  items: QuadrantItem[];
  xLabel: string;
  yLabel: string;
  /** Labels for the four quadrants: top-left, top-right, bottom-left, bottom-right. */
  quadrants?: { tl: string; tr: string; bl: string; br: string };
  selectedId?: string;
  onItemClick?: (item: QuadrantItem) => void;
  /**
   * 'numbered' (default): numbered dots + a legend list under the chart — never overlaps, best on phones.
   * 'inline': text next to each dot (only for a few, well-spread items).
   */
  labelMode?: 'numbered' | 'inline';
  /** Numbered mode only: render the legend list under the chart (default true). Set false when the caller lists the items itself. */
  showList?: boolean;
  title: string;
  className?: string;
}

/** Default stakeholder quadrant labels (influence ↑ / interest →). */
export const STAKEHOLDER_QUADRANTS = {
  tl: 'Држати задовољним',
  tr: 'Блиско сарађивати',
  bl: 'Пратити',
  br: 'Редовно информисати',
};

/**
 * 2×2 grid with labelled dots on a 1–5 scale (stakeholder influence/interest).
 * @example
 * <QuadrantGrid title="Утицај и интерес" xLabel="Интерес" yLabel="Утицај" quadrants={STAKEHOLDER_QUADRANTS}
 *   items={stakeholders.map((s) => ({ id: s.id, label: s.name, x: s.interest, y: s.influence, tone: ATTITUDE_TONE[s.attitude] }))} />
 */
export function QuadrantGrid({ items, xLabel, yLabel, quadrants, selectedId, onItemClick, labelMode = 'numbered', showList = true, title, className }: QuadrantGridProps) {
  const titleId = useId();
  const W = 340;
  const H = 280;
  const left = 22;
  const bottom = 22;
  const pw = W - left - 6;
  const ph = H - bottom - 6;
  const sx = (v: number) => left + ((v - 0.5) / 5) * pw;
  const sy = (v: number) => 6 + ph - ((v - 0.5) / 5) * ph;

  // Spread items that share the same cell around a small circle.
  const groups = new Map<string, QuadrantItem[]>();
  items.forEach((it) => {
    const k = `${it.x}-${it.y}`;
    groups.set(k, [...(groups.get(k) ?? []), it]);
  });
  const placed = items.map((it) => {
    const g = groups.get(`${it.x}-${it.y}`)!;
    const idx = g.indexOf(it);
    const off = g.length > 1 ? (labelMode === 'numbered' ? 13 : 11) : 0;
    const a = (2 * Math.PI * idx) / g.length;
    return { it, x: sx(it.x) + off * Math.cos(a), y: sy(it.y) + off * Math.sin(a) };
  });

  const midX = left + pw / 2;
  const midY = 6 + ph / 2;
  return (
    <figure className={cn('min-w-0', className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-labelledby={titleId}>
        <title id={titleId}>{title}</title>
        <rect x={left} y={6} width={pw} height={ph} rx="10" fill="var(--surface-2)" opacity="0.6" />
        <rect x={midX} y={6} width={pw / 2} height={ph / 2} fill="var(--accent-soft)" opacity="0.7" />
        <line x1={midX} x2={midX} y1={6} y2={6 + ph} stroke="var(--line-strong)" strokeDasharray="3 3" />
        <line x1={left} x2={left + pw} y1={midY} y2={midY} stroke="var(--line-strong)" strokeDasharray="3 3" />
        {quadrants && (
          <g fontSize="9.5" fill="var(--muted)" fontWeight="600">
            <text x={left + 8} y={20}>{quadrants.tl}</text>
            <text x={left + pw - 8} y={20} textAnchor="end" fill="var(--accent)">{quadrants.tr}</text>
            <text x={left + 8} y={6 + ph - 8}>{quadrants.bl}</text>
            <text x={left + pw - 8} y={6 + ph - 8} textAnchor="end">{quadrants.br}</text>
          </g>
        )}
        {placed.map(({ it, x, y }, idx) => {
          const sel = it.id === selectedId;
          const anchorEnd = x > left + pw * 0.6;
          const numbered = labelMode === 'numbered';
          const r = numbered ? 9 : 6.5;
          return (
            <g
              key={it.id}
              onClick={onItemClick ? () => onItemClick(it) : undefined}
              style={onItemClick ? { cursor: 'pointer' } : undefined}
              tabIndex={onItemClick ? 0 : undefined}
              role={onItemClick ? 'button' : undefined}
              aria-label={it.label}
              onKeyDown={
                onItemClick
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onItemClick(it);
                      }
                    }
                  : undefined
              }
            >
              <title>{it.label}</title>
              <circle cx={x} cy={y} r={sel ? r + 1.5 : r} fill={toneVar(it.tone ?? 'accent')} stroke="var(--surface)" strokeWidth="2" />
              {sel && <circle cx={x} cy={y} r={r + 4.5} fill="none" stroke="var(--ink)" strokeWidth="1.5" />}
              {numbered && (
                <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="9.5" fontWeight="700" fill="var(--paper)">
                  {idx + 1}
                </text>
              )}
              {!numbered && (
                <text x={anchorEnd ? x - 10 : x + 10} y={y} dominantBaseline="central" textAnchor={anchorEnd ? 'end' : 'start'} fontSize="10" fill="var(--ink)">
                  {truncate(it.label, 18)}
                </text>
              )}
            </g>
          );
        })}
        <text x={left + pw / 2} y={H - 5} textAnchor="middle" fontSize="11" fill="var(--muted)">
          {xLabel} →
        </text>
        <text x={11} y={6 + ph / 2} textAnchor="middle" fontSize="11" fill="var(--muted)" transform={`rotate(-90 11 ${6 + ph / 2})`}>
          {yLabel} →
        </text>
      </svg>
      {labelMode === 'numbered' && showList && (
        <ol className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
          {items.map((it, i) => {
            const content = (
              <>
                <span
                  className="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-bold text-paper"
                  style={{ background: toneVar(it.tone ?? 'accent') }}
                  aria-hidden
                >
                  {i + 1}
                </span>
                <span className="min-w-0 truncate">{it.label}</span>
              </>
            );
            const cls = cn(
              'flex min-h-8 w-full min-w-0 items-center gap-2 rounded-lg px-1 text-left text-ink',
              it.id === selectedId && 'bg-surface-2 font-medium',
            );
            return (
              <li key={it.id} className="min-w-0">
                {onItemClick ? (
                  <button type="button" className={cn(cls, 'hover:bg-surface-2')} onClick={() => onItemClick(it)}>
                    {content}
                  </button>
                ) : (
                  <span className={cls}>{content}</span>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </figure>
  );
}
