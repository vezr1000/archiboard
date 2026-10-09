/**
 * Pure helpers for the „Циљеви и KPI“ tab: ambition levels → benchmark, comparability rules, ordering.
 */
import { AMBITION_LEVELS } from '@/domain/labels';
import type { KpiBenchmarks, KpiDefinition, KpiId, Project, ProjectKpi } from '@/domain/types';
import { gapPct } from '@/lib/kpi';

export type AmbitionId = (typeof AMBITION_LEVELS)[number]['id'];

export interface BenchmarkInfo {
  key: keyof KpiBenchmarks;
  /** Short label for the ladder. */
  label: string;
  value: number;
}

/** Short labels used on the benchmark ladder (the full names are explained in the info callout). */
export const BENCHMARK_SHORT: Record<keyof KpiBenchmarks, string> = {
  regulatoryMin: 'Пропис',
  euTaxonomy: 'EU таксономија',
  firmTarget: 'Циљ фирме',
  bestPractice: 'Најбоља пракса',
};

/** Full benchmark names, used in the sentence under the ambition selector. */
export const BENCHMARK_LONG: Record<keyof KpiBenchmarks, string> = {
  regulatoryMin: 'прописани минимум',
  euTaxonomy: 'праг EU таксономије',
  firmTarget: 'циљ фирме',
  bestPractice: 'најбоља пракса',
};

/**
 * Firm / regulatory benchmarks are defined for buildings (per m² БРГП, building plots). For a non-building project
 * (the park, no GFA) they are not comparable for carbon and green-area KPIs, so only the project target is used.
 */
const PARK_INCOMPARABLE: KpiId[] = ['embodied-carbon', 'embodied-carbon-wlc', 'green-area'];

export const benchmarksComparable = (project: Project, kpiId: KpiId): boolean =>
  !(project.gfaM2 === undefined && PARK_INCOMPARABLE.includes(kpiId));

/** All defined benchmarks of a KPI as ladder marks (empty when not comparable for this project). */
export function benchmarkList(project: Project, def: KpiDefinition): BenchmarkInfo[] {
  if (!benchmarksComparable(project, def.id)) return [];
  return (Object.keys(BENCHMARK_SHORT) as Array<keyof KpiBenchmarks>).flatMap((key) => {
    const value = def.benchmarks[key];
    return value === undefined ? [] : [{ key, label: BENCHMARK_SHORT[key], value }];
  });
}

/**
 * Benchmark used as the comparison line for an ambition level:
 * минимум → пропис (fallback: праг EU таксономије), добра пракса → циљ фирме, предводник → најбоља пракса.
 */
export function ambitionBenchmark(project: Project, def: KpiDefinition, level: AmbitionId): BenchmarkInfo | undefined {
  const list = benchmarkList(project, def);
  const pick = (k: keyof KpiBenchmarks) => list.find((b) => b.key === k);
  if (level === 'minimum') return pick('regulatoryMin') ?? pick('euTaxonomy');
  if (level === 'dobra-praksa') return pick('firmTarget');
  return pick('bestPractice');
}

/** Order of KPIs on the page: definition order, except the park puts its blue-green KPIs first. */
export function orderKpis<T extends { def: KpiDefinition }>(project: Project, items: T[]): T[] {
  if (project.gfaM2 !== undefined) return items;
  const first: KpiId[] = ['stormwater-retention', 'biotope-factor', 'green-area'];
  const rank = (id: KpiId) => {
    const i = first.indexOf(id);
    return i === -1 ? first.length : i;
  };
  return [...items].sort((a, b) => rank(a.def.id) - rank(b.def.id));
}

/** Signed % gap of the current value against a benchmark, positive = worse (same convention as `gapPct`). */
export const gapToBenchmark = (def: KpiDefinition, kpi: ProjectKpi, value: number): number => gapPct(def.direction, kpi.current, value);
