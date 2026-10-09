import { useId } from 'react';
import { FIRM } from '@/data';
import { DOCUMENT_TYPE_LABELS } from '@/domain/labels';
import type { ProjectDocument } from '@/domain/types';
import { previewKind } from './documentsLogic';

/**
 * Fake „first page“ thumbnail of a document, drawn in SVG by document type (drawing sheet / report with chart /
 * text document). Purely decorative — the demo has no real files.
 */
export function DocumentPreview({ doc }: { doc: ProjectDocument }) {
  const titleId = useId();
  const kind = previewKind(doc.type);
  return (
    <figure className="m-0">
      <svg viewBox="0 0 240 170" className="block w-full rounded-xl border border-line bg-surface-2" role="img" aria-labelledby={titleId}>
        <title id={titleId}>{`Приказ прве стране: ${DOCUMENT_TYPE_LABELS[doc.type]}, ${doc.version}`}</title>
        {/* sheet */}
        <rect x="14" y="10" width="212" height="150" rx="2" fill="var(--surface)" stroke="var(--line-strong)" />
        {kind === 'drawing' && <Drawing />}
        {kind === 'chart' && <ChartPage />}
        {kind === 'text' && <TextPage />}
        {/* title block */}
        <g>
          <rect x="148" y="132" width="72" height="22" fill="var(--surface)" stroke="var(--ink)" strokeWidth="0.8" />
          <line x1="148" y1="141" x2="220" y2="141" stroke="var(--ink)" strokeWidth="0.5" />
          <line x1="190" y1="141" x2="190" y2="154" stroke="var(--ink)" strokeWidth="0.5" />
          <text x="151" y="138.5" fontSize="5" fill="var(--ink)" fontWeight="600">
            {FIRM.name}
          </text>
          <text x="151" y="149" fontSize="4.5" fill="var(--muted)">
            {DOCUMENT_TYPE_LABELS[doc.type].split(' ')[0]}
          </text>
          <text x="193" y="149" fontSize="5.5" fill="var(--accent)" fontWeight="700">
            {doc.version}
          </text>
        </g>
      </svg>
    </figure>
  );
}

function Drawing() {
  return (
    <g>
      {/* modular grid */}
      {[44, 74, 104, 134, 164, 194].map((x) => (
        <line key={`gx${x}`} x1={x} y1="18" x2={x} y2="126" stroke="var(--line)" strokeWidth="0.6" strokeDasharray="2 2" />
      ))}
      {[34, 62, 90, 118].map((y) => (
        <line key={`gy${y}`} x1="22" y1={y} x2="218" y2={y} stroke="var(--line)" strokeWidth="0.6" strokeDasharray="2 2" />
      ))}
      {[44, 104, 164].map((x, i) => (
        <g key={`ab${x}`}>
          <circle cx={x} cy="16" r="4" fill="var(--surface)" stroke="var(--muted)" strokeWidth="0.6" />
          <text x={x} y="17.8" fontSize="4.5" textAnchor="middle" fill="var(--muted)">
            {i + 1}
          </text>
        </g>
      ))}
      {/* floor plan */}
      <rect x="44" y="34" width="120" height="84" fill="none" stroke="var(--ink)" strokeWidth="1.6" />
      <line x1="104" y1="34" x2="104" y2="118" stroke="var(--ink)" strokeWidth="1" />
      <line x1="44" y1="76" x2="104" y2="76" stroke="var(--ink)" strokeWidth="1" />
      <line x1="104" y1="62" x2="164" y2="62" stroke="var(--ink)" strokeWidth="1" />
      <rect x="116" y="82" width="22" height="26" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="0.8" />
      <path d="M44 100 A12 12 0 0 1 56 88" fill="none" stroke="var(--clay)" strokeWidth="0.8" />
      <path d="M104 52 A10 10 0 0 0 94 42" fill="none" stroke="var(--clay)" strokeWidth="0.8" />
      {/* dimension line */}
      <line x1="44" y1="124" x2="164" y2="124" stroke="var(--muted)" strokeWidth="0.6" />
      <line x1="44" y1="121" x2="44" y2="127" stroke="var(--muted)" strokeWidth="0.6" />
      <line x1="164" y1="121" x2="164" y2="127" stroke="var(--muted)" strokeWidth="0.6" />
    </g>
  );
}

function ChartPage() {
  const bars = [46, 62, 38, 74, 52, 30];
  return (
    <g>
      <rect x="26" y="20" width="84" height="7" rx="1.5" fill="var(--ink)" opacity="0.8" />
      <rect x="26" y="31" width="52" height="3.5" rx="1.5" fill="var(--line-strong)" />
      {/* chart */}
      <line x1="30" y1="122" x2="140" y2="122" stroke="var(--muted)" strokeWidth="0.8" />
      <line x1="30" y1="46" x2="30" y2="122" stroke="var(--muted)" strokeWidth="0.8" />
      {bars.map((h, i) => (
        <rect key={i} x={36 + i * 17} y={122 - h} width="11" height={h} fill={i === 3 ? 'var(--clay)' : 'var(--accent)'} opacity={i === 3 ? 0.9 : 0.75} />
      ))}
      <line x1="30" y1="70" x2="140" y2="70" stroke="var(--ink)" strokeWidth="0.8" strokeDasharray="3 2" />
      {/* side text column */}
      {[48, 56, 64, 72, 84, 92, 100, 108].map((y, i) => (
        <rect key={y} x="152" y={y} width={i % 4 === 3 ? 34 : 60} height="3" rx="1.5" fill="var(--line-strong)" />
      ))}
    </g>
  );
}

function TextPage() {
  return (
    <g>
      <rect x="26" y="20" width="110" height="7" rx="1.5" fill="var(--ink)" opacity="0.8" />
      <rect x="26" y="31" width="70" height="3.5" rx="1.5" fill="var(--line-strong)" />
      {Array.from({ length: 11 }, (_, i) => (
        <rect key={i} x="26" y={44 + i * 7.6} width={i === 4 || i === 9 ? 70 : 150} height="3" rx="1.5" fill="var(--line-strong)" opacity={i === 4 || i === 9 ? 0.6 : 1} />
      ))}
      {/* stamp */}
      <g transform="translate(190 36)">
        <circle r="11" fill="none" stroke="var(--accent)" strokeWidth="1.2" opacity="0.8" />
        <circle r="7.5" fill="none" stroke="var(--accent)" strokeWidth="0.6" opacity="0.8" />
        <path d="M-4 0 L-1 3 L4.5 -3" fill="none" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
      </g>
    </g>
  );
}
