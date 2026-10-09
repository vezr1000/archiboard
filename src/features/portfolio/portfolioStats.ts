import { getKpiDefinition, getProjectKpi, projects, upcomingSessions } from '@/data';
import type { Health, Project } from '@/domain/types';
import { isWithinNextDays } from '@/lib/dates';

/** Projects that have a gross floor area (everything except the park, which is measured in site area). */
export const buildingProjects = (): Project[] => projects.filter((p) => p.gfaM2 !== undefined);

export interface PortfolioStats {
  activeCount: number;
  healthCounts: Record<Health, number>;
  /** Σ gross floor area of the buildings, m². */
  totalGfaM2: number;
  /** Σ site area of non-building projects (park), m². */
  nonBuildingSiteM2: number;
  /** GFA-weighted average of A1–A3 embodied carbon over buildings, kgCO₂e/m². */
  weightedCarbon: number;
  firmCarbonTarget: number;
  /** Weighted average vs the firm target, % (negative = better). */
  carbonDeltaPct: number;
  onTrackShare: number;
  /** Board sessions within the next 30 days. */
  gatesIn30Days: number;
}

export function portfolioStats(): PortfolioStats {
  const buildings = buildingProjects();
  const totalGfaM2 = buildings.reduce((s, p) => s + (p.gfaM2 ?? 0), 0);
  const nonBuildingSiteM2 = projects.filter((p) => p.gfaM2 === undefined).reduce((s, p) => s + (p.siteAreaM2 ?? 0), 0);

  let weighted = 0;
  let weight = 0;
  for (const p of buildings) {
    const kpi = getProjectKpi(p.id, 'embodied-carbon');
    if (!kpi || !p.gfaM2) continue;
    weighted += kpi.current * p.gfaM2;
    weight += p.gfaM2;
  }
  const weightedCarbon = weight > 0 ? weighted / weight : 0;
  const firmCarbonTarget = getKpiDefinition('embodied-carbon')?.benchmarks.firmTarget ?? 0;

  const healthCounts: Record<Health, number> = { 'on-track': 0, 'at-risk': 0, 'off-track': 0 };
  for (const p of projects) healthCounts[p.health] += 1;

  return {
    activeCount: projects.length,
    healthCounts,
    totalGfaM2,
    nonBuildingSiteM2,
    weightedCarbon,
    firmCarbonTarget,
    carbonDeltaPct: firmCarbonTarget > 0 ? ((weightedCarbon - firmCarbonTarget) / firmCarbonTarget) * 100 : 0,
    onTrackShare: projects.length > 0 ? healthCounts['on-track'] / projects.length : 0,
    gatesIn30Days: upcomingSessions().filter((s) => isWithinNextDays(s.date, 30)).length,
  };
}
