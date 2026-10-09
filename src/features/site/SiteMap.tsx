import { useId } from 'react';
import type { Project, SiteInfo } from '@/domain/types';

type LayoutKind = 'quay' | 'riverside' | 'distant' | 'strip';

/** Abstract layouts: where the river is relative to the parcel. Chosen per project, falling back to flood risk. */
const LAYOUT_BY_PROJECT: Record<string, LayoutKind> = {
  'savski-kej': 'quay',
  'stara-pivara': 'riverside',
  'park-nisava': 'strip',
  'blok-42': 'distant',
  'os-novo-naselje': 'distant',
  'vrtic-bubamara': 'distant',
};

const RIVER_BY_CITY: Record<string, string> = { Београд: 'Сава', 'Нови Сад': 'Дунав', Ниш: 'Нишава' };

type Pt = [number, number];

interface Layout {
  /** Filled water body (closed path) or thick stroked centre line. */
  water: { d: string; stroke?: boolean };
  /** Outline of the bank (open path), drawn as a thin line. */
  bank?: string;
  streets: string[];
  blocks: Array<[number, number, number, number]>;
  parcel: Pt[];
  riverLabel: { x: number; y: number; rot: number };
  scaleLabel: string;
}

/** Point on the park river's centre line (cubic Bézier M-10,62 C 90,92 200,38 330,70). */
const riverPoint = (t: number): Pt => {
  const [p0, p1, p2, p3]: Pt[] = [[-10, 62], [90, 92], [200, 38], [330, 70]];
  const u = 1 - t;
  const f = (a: number, b: number, c: number, d: number) => u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
  return [f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])];
};
const STRIP_T = Array.from({ length: 13 }, (_, i) => i / 12);
const STRIP_PARCEL: Pt[] = [
  ...STRIP_T.map((t): Pt => [riverPoint(t)[0], riverPoint(t)[1] + 24]),
  ...[...STRIP_T].reverse().map((t): Pt => [riverPoint(t)[0], riverPoint(t)[1] + 54]),
];

const LAYOUTS: Record<LayoutKind, Layout> = {
  quay: {
    water: { d: 'M-10 172 C 70 154 170 190 330 162 L330 210 L-10 210 Z' },
    bank: 'M-10 172 C 70 154 170 190 330 162',
    streets: ['M-10 146 C 70 128 170 164 330 136', 'M222 -10 L229 150', 'M20 -10 L30 130'],
    blocks: [[238, 52, 60, 36], [238, 100, 60, 40], [36, 22, 62, 40], [36, 74, 62, 38], [124, 16, 66, 26]],
    parcel: [[110, 60], [208, 56], [214, 128], [104, 132]],
    riverLabel: { x: 250, y: 190, rot: -4 },
    scaleLabel: '≈ 50 m',
  },
  riverside: {
    water: { d: 'M-10 -10 L330 -10 L330 36 C 230 52 120 22 -10 40 Z' },
    bank: 'M-10 40 C 120 22 230 52 330 36',
    streets: ['M-10 70 C 120 52 230 82 330 66', 'M210 66 L214 210', 'M36 56 L30 210'],
    blocks: [[232, 92, 66, 44], [232, 150, 66, 40], [40, 100, 54, 80], [118, 164, 70, 28]],
    parcel: [[104, 92], [200, 90], [204, 156], [100, 158]],
    riverLabel: { x: 80, y: 28, rot: 3 },
    scaleLabel: '≈ 50 m',
  },
  distant: {
    water: { d: 'M214 -10 L330 -10 L330 52 C 290 40 244 26 214 -10 Z' },
    bank: 'M214 -10 C 244 26 290 40 330 52',
    streets: ['M-10 52 L330 66', 'M-10 150 L330 142', 'M96 -10 L100 210', 'M236 70 L242 210'],
    blocks: [[18, 70, 66, 64], [18, 158, 66, 36], [112, 70, 108, 28], [252, 84, 54, 46], [252, 156, 54, 38], [112, 160, 108, 32]],
    parcel: [[112, 106], [222, 108], [220, 138], [114, 136]],
    riverLabel: { x: 288, y: 22, rot: 28 },
    scaleLabel: '≈ 50 m',
  },
  strip: {
    water: { d: 'M-10 62 C 90 92 200 38 330 70', stroke: true },
    streets: ['M-10 176 C 90 190 200 150 330 170', 'M60 210 L64 140', 'M250 210 L246 128'],
    blocks: [[14, 18, 56, 26], [96, 12, 60, 22], [214, 8, 64, 24]],
    parcel: STRIP_PARCEL,
    riverLabel: { x: 196, y: 40, rot: -4 },
    scaleLabel: '≈ 200 m',
  },
};

const pts = (p: Pt[]) => p.map((q) => q.join(',')).join(' ');
const centroid = (p: Pt[]): Pt => [p.reduce((s, q) => s + q[0], 0) / p.length, p.reduce((s, q) => s + q[1], 0) / p.length];

/** Deterministic pseudo-random for tree dots (stable across renders). */
const rnd = (i: number) => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Stylised, abstract site plan — river, streets, parcel, building footprint (area ∝ индекс заузетости), north arrow
 * and a scale hint. No map tiles; not to scale.
 */
export function SiteMap({ project, site }: { project: Project; site: SiteInfo }) {
  const titleId = useId();
  const kind: LayoutKind = LAYOUT_BY_PROJECT[project.id] ?? (site.hazards.floodRisk === 'low' ? 'distant' : 'quay');
  const L = LAYOUTS[kind];
  const river = RIVER_BY_CITY[project.city] ?? 'Река';
  const isPark = project.typology === 'javni-prostor';
  const iz = site.urbanParams.find((p) => p.id === 'iz')?.design ?? 0.4;
  const c = centroid(L.parcel);
  const k = Math.sqrt(Math.min(0.9, Math.max(0.1, iz)));
  const footprint = L.parcel.map(([x, y]): Pt => [c[0] + (x - c[0]) * k, c[1] + (y - c[1]) * k]);

  return (
    <figure>
      <svg viewBox="0 0 320 200" className="block w-full overflow-hidden rounded-xl border border-line" role="img" aria-labelledby={titleId}>
        <title id={titleId}>{`Шематски приказ локације: парцела ${project.parcel}, река ${river}, север према горе.`}</title>
        <rect width="320" height="200" fill="var(--surface-2)" />

        {/* water */}
        {L.water.stroke ? (
          <>
            <path d={L.water.d} fill="none" stroke="var(--info-soft)" strokeWidth="26" strokeLinecap="round" />
            <path d={L.water.d} fill="none" stroke="var(--info)" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="3 4" />
          </>
        ) : (
          <>
            <path d={L.water.d} fill="var(--info-soft)" />
            {L.bank && <path d={L.bank} fill="none" stroke="var(--info)" strokeWidth="1.2" strokeOpacity="0.7" />}
          </>
        )}

        {/* neighbouring blocks and streets */}
        {L.blocks.map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx="2" fill="var(--surface)" stroke="var(--line)" />
        ))}
        {L.streets.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="var(--line-strong)" strokeWidth="5" strokeLinecap="round" strokeOpacity="0.55" />
        ))}

        {/* parcel */}
        <polygon points={pts(L.parcel)} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.6" strokeLinejoin="round" />
        {isPark ? (
          <g fill="var(--accent)" fillOpacity="0.55">
            {Array.from({ length: 26 }, (_, i) => {
              const [x, y] = riverPoint(0.03 + (i / 26) * 0.94);
              return <circle key={i} cx={x} cy={y + 39 + (rnd(i + 3) - 0.5) * 16} r={2.4 + rnd(i) * 1.6} />;
            })}
            <rect x="146" y="95" width="10" height="6" fill="var(--accent)" fillOpacity="0.9" />
          </g>
        ) : (
          <polygon points={pts(footprint)} fill="var(--accent)" fillOpacity="0.78" stroke="var(--accent)" strokeLinejoin="round" />
        )}

        {/* labels */}
        <text
          x={L.riverLabel.x}
          y={L.riverLabel.y}
          transform={`rotate(${L.riverLabel.rot} ${L.riverLabel.x} ${L.riverLabel.y})`}
          textAnchor="middle"
          fontSize="10"
          fontStyle="italic"
          fill="var(--info)"
        >
          {river}
        </text>
        <text x={c[0]} y={isPark ? 160 : L.parcel[0][1] - 6} textAnchor="middle" fontSize="9" fontWeight="600" fill="var(--accent)">
          {isPark ? 'парк' : 'парцела'}
        </text>

        {/* north arrow */}
        <g transform="translate(298 26)" fill="none" stroke="var(--ink)" strokeWidth="1.3">
          <circle r="13" fill="var(--surface)" stroke="var(--line-strong)" />
          <path d="M0 9 L0 -8" />
          <path d="M-4 -3 L0 -9 L4 -3" fill="var(--ink)" />
          <text y="23" textAnchor="middle" stroke="none" fontSize="9" fontWeight="700" fill="var(--ink)">С</text>
        </g>

        {/* scale hint */}
        <g transform="translate(14 184)">
          <path d="M0 0 H56 M0 -3 V3 M28 -2 V2 M56 -3 V3" stroke="var(--ink)" strokeWidth="1.2" fill="none" />
          <text x="62" y="3" fontSize="9" fill="var(--muted)">{L.scaleLabel}</text>
        </g>
      </svg>
      <figcaption className="mt-1.5 text-xs text-muted">Шематски приказ — није у размери, север је према горе.</figcaption>
    </figure>
  );
}
