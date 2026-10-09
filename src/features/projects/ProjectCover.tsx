import type { ReactNode } from 'react';
import type { Project } from '@/domain/types';
import { cn } from '@/lib/cn';

type Illustration = NonNullable<Project['illustration']>;

/** Token colour per illustration (all theme-aware CSS variables). */
const COLOR: Record<Illustration, string> = {
  tower: 'var(--accent)',
  school: 'var(--chart-4)',
  park: 'var(--good)',
  office: 'var(--info)',
  kindergarten: 'var(--chart-5)',
  brewery: 'var(--clay)',
};

const W = 320;
const H = 88;
const GROUND = 78;

/** Small deterministic PRNG so a project always gets the same drawing (seeded by its cover hue). */
function rng(seed: number): () => number {
  let a = (Math.round(seed) + 1) * 2654435761;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Draw = (c: string, r: () => number) => ReactNode;

/** Abstract facade grid of stepped towers. */
const tower: Draw = (c, r) => {
  const out: ReactNode[] = [];
  for (let i = 0; i < 6; i++) {
    const w = 20 + r() * 14;
    const h = 24 + r() * 46;
    const x = 18 + i * 50 + r() * 6;
    const y = GROUND - h;
    out.push(<rect key={`b${i}`} x={x} y={y} width={w} height={h} fill={c} fillOpacity={0.08 + (i % 3) * 0.04} stroke={c} strokeOpacity={0.55} />);
    for (let fy = y + 7; fy < GROUND - 2; fy += 7) {
      out.push(<line key={`f${i}-${fy}`} x1={x} x2={x + w} y1={fy} y2={fy} stroke={c} strokeOpacity={0.25} />);
    }
    for (let fx = x + 6; fx < x + w - 2; fx += 6) {
      out.push(<line key={`v${i}-${fx}`} x1={fx} x2={fx} y1={y} y2={GROUND} stroke={c} strokeOpacity={0.18} />);
    }
    for (let k = 0; k < 4; k++) {
      const wx = x + 1 + Math.floor(r() * Math.max(1, Math.floor((w - 4) / 6))) * 6;
      const wy = y + 1 + Math.floor(r() * Math.floor((h - 4) / 7)) * 7;
      out.push(<rect key={`w${i}-${k}`} x={wx} y={wy} width={5} height={6} fill={c} fillOpacity={0.5} />);
    }
  }
  return out;
};

/** Low school wing with a row of windows, a taller block and trees. */
const school: Draw = (c, r) => {
  const out: ReactNode[] = [];
  out.push(<rect key="main" x={70} y={GROUND - 28} width={220} height={28} fill={c} fillOpacity={0.1} stroke={c} strokeOpacity={0.55} />);
  out.push(<rect key="roof" x={66} y={GROUND - 32} width={228} height={4} fill={c} fillOpacity={0.45} />);
  out.push(<rect key="block" x={22} y={GROUND - 46} width={52} height={46} fill={c} fillOpacity={0.16} stroke={c} strokeOpacity={0.55} />);
  for (let x = 80; x < 280; x += 20) out.push(<rect key={`w${x}`} x={x} y={GROUND - 20} width={12} height={9} fill={c} fillOpacity={r() > 0.3 ? 0.5 : 0.2} />);
  for (let y = GROUND - 38; y < GROUND - 8; y += 14)
    for (let x = 30; x < 66; x += 16) out.push(<rect key={`bw${x}-${y}`} x={x} y={y} width={9} height={8} fill={c} fillOpacity={0.45} />);
  out.push(<circle key="sun" cx={284} cy={20} r={9} fill={c} fillOpacity={0.22} />);
  for (let i = 0; i < 3; i++) out.push(<circle key={`t${i}`} cx={8 + i * 11 + r() * 4} cy={GROUND - 7 - r() * 5} r={6 + r() * 3} fill="var(--good)" fillOpacity={0.3} />);
  return out;
};

/** Contour lines of a river park with a meandering stream. */
const park: Draw = (c, r) => {
  const out: ReactNode[] = [];
  const ph1 = r() * 6;
  const ph2 = r() * 6;
  const wave = (base: number, a: number, k: number) => {
    let d = '';
    for (let x = 0; x <= W; x += 8) {
      const y = base + a * Math.sin(x / 38 + ph1 + k * 0.5) + (a / 2) * Math.sin(x / 17 + ph2 + k);
      d += `${x === 0 ? 'M' : 'L'}${x},${y.toFixed(1)} `;
    }
    return d;
  };
  for (let k = 0; k < 8; k++) {
    out.push(<path key={`c${k}`} d={wave(8 + k * 10, 4 + k * 0.6, k)} fill="none" stroke={c} strokeOpacity={0.22 + (k % 3) * 0.12} strokeWidth={1} />);
  }
  out.push(<path key="river" d={wave(46, 9, 3)} fill="none" stroke="var(--info)" strokeOpacity={0.55} strokeWidth={5} strokeLinecap="round" />);
  for (let i = 0; i < 9; i++) out.push(<circle key={`t${i}`} cx={14 + i * 36 + r() * 12} cy={12 + r() * 62} r={2 + r() * 2.5} fill={c} fillOpacity={0.4} />);
  return out;
};

/** Curtain-wall grid with a few highlighted panels. */
const office: Draw = (c, r) => {
  const out: ReactNode[] = [];
  const x0 = 70;
  const x1 = 250;
  const top = 8;
  out.push(<rect key="wall" x={x0} y={top} width={x1 - x0} height={GROUND - top} fill={c} fillOpacity={0.08} stroke={c} strokeOpacity={0.55} />);
  for (let x = x0; x <= x1; x += 12) out.push(<line key={`v${x}`} x1={x} x2={x} y1={top} y2={GROUND} stroke={c} strokeOpacity={0.3} />);
  for (let y = top; y <= GROUND; y += 10) out.push(<line key={`h${y}`} x1={x0} x2={x1} y1={y} y2={y} stroke={c} strokeOpacity={0.3} />);
  for (let k = 0; k < 16; k++) {
    const px = x0 + Math.floor(r() * 15) * 12;
    const py = top + Math.floor(r() * 7) * 10;
    out.push(<rect key={`p${k}`} x={px} y={py} width={12} height={10} fill={c} fillOpacity={0.14 + r() * 0.3} />);
  }
  out.push(<rect key="pod1" x={22} y={GROUND - 22} width={50} height={22} fill={c} fillOpacity={0.14} stroke={c} strokeOpacity={0.5} />);
  out.push(<rect key="pod2" x={250} y={GROUND - 30} width={48} height={30} fill={c} fillOpacity={0.12} stroke={c} strokeOpacity={0.5} />);
  return out;
};

/** Little gabled houses and playful dots. */
const kindergarten: Draw = (c, r) => {
  const out: ReactNode[] = [];
  for (let i = 0; i < 4; i++) {
    const w = 34 + r() * 14;
    const h = 20 + r() * 12;
    const x = 16 + i * 74 + r() * 8;
    const y = GROUND - h;
    out.push(<rect key={`h${i}`} x={x} y={y} width={w} height={h} fill={c} fillOpacity={0.12} stroke={c} strokeOpacity={0.5} />);
    out.push(<polygon key={`r${i}`} points={`${x - 4},${y} ${x + w / 2},${y - 16} ${x + w + 4},${y}`} fill={c} fillOpacity={0.3} stroke={c} strokeOpacity={0.55} />);
    out.push(<rect key={`d${i}`} x={x + w / 2 - 4} y={GROUND - 12} width={8} height={12} fill={c} fillOpacity={0.5} />);
    out.push(<circle key={`o${i}`} cx={x + 9} cy={y + 9} r={3.5} fill={c} fillOpacity={0.45} />);
  }
  for (let i = 0; i < 12; i++) out.push(<circle key={`dot${i}`} cx={r() * W} cy={6 + r() * 20} r={1.5 + r() * 2} fill={c} fillOpacity={0.3} />);
  return out;
};

/** Sawtooth hall roof, chimney and brick courses. */
const brewery: Draw = (c, r) => {
  const out: ReactNode[] = [];
  const hallTop = GROUND - 36;
  out.push(<rect key="hall" x={30} y={hallTop} width={230} height={36} fill={c} fillOpacity={0.1} stroke={c} strokeOpacity={0.55} />);
  let d = `M30,${hallTop}`;
  for (let x = 30; x < 260; x += 23) d += ` L${x},${hallTop - 14} L${x + 23},${hallTop}`;
  out.push(<path key="saw" d={d} fill={c} fillOpacity={0.22} stroke={c} strokeOpacity={0.6} />);
  for (let y = hallTop + 6; y < GROUND; y += 6)
    for (let x = 30 + ((y / 6) % 2) * 5; x < 260; x += 10) out.push(<line key={`br${x}-${y}`} x1={x} x2={x} y1={y} y2={y + 6} stroke={c} strokeOpacity={0.2} />);
  for (let y = hallTop + 6; y < GROUND; y += 6) out.push(<line key={`bh${y}`} x1={30} x2={260} y1={y} y2={y} stroke={c} strokeOpacity={0.2} />);
  for (let x = 44; x < 250; x += 36) out.push(<path key={`a${x}`} d={`M${x},${GROUND} V${GROUND - 14} A7,7 0 0 1 ${x + 14},${GROUND - 14} V${GROUND} Z`} fill={c} fillOpacity={r() > 0.3 ? 0.4 : 0.18} />);
  out.push(<rect key="chim" x={278} y={10} width={12} height={GROUND - 10} fill={c} fillOpacity={0.2} stroke={c} strokeOpacity={0.55} />);
  out.push(<rect key="chimtop" x={275} y={8} width={18} height={5} fill={c} fillOpacity={0.5} />);
  return out;
};

const DRAW: Record<Illustration, Draw> = { tower, school, park, office, kindergarten, brewery };

/**
 * Calm generative cover for a project: an abstract line drawing derived from `illustration` (motif) and
 * `coverHue` (seed for proportions). Token colours only, decorative (aria-hidden).
 */
export function ProjectCover({ project, className }: { project: Pick<Project, 'illustration' | 'coverHue'>; className?: string }) {
  const kind = project.illustration ?? 'tower';
  const color = COLOR[kind];
  const r = rng(project.coverHue);
  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ background: `color-mix(in srgb, ${color} 12%, var(--surface))` }}
      aria-hidden
    >
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="block size-full">
        {DRAW[kind](color, r)}
        {kind !== 'park' && <line x1={0} x2={W} y1={GROUND} y2={GROUND} stroke={color} strokeOpacity={0.6} strokeWidth={1.5} />}
      </svg>
    </div>
  );
}
