import { useMemo } from 'react';
import { getKpiDefinition, getProjectKpi, kpisForProject, openConditionsForProject, optionsForProject, siteForProject } from '@/data';
import type { Project } from '@/domain/types';
import { setupProjectModel, type ProjectModel } from '@/lib/carbonModel';

/** What-if model of a project (null for the park). Built once per project from seed data. */
export function useProjectModel(project: Project): ProjectModel | null {
  return useMemo(
    () =>
      setupProjectModel({
        project,
        hdd: siteForProject(project.id)?.climate.hdd ?? 2600,
        kpis: kpisForProject(project.id).map(({ kpi }) => ({ kpiId: kpi.kpiId, current: kpi.current, first: kpi.history[0]?.value })),
        pedLimit: getKpiDefinition('primary-energy')?.benchmarks.euTaxonomy,
        options: optionsForProject(project.id),
        openConditionTexts: openConditionsForProject(project.id).map((c) => c.text),
      }),
    [project],
  );
}

/** Project target for embodied carbon (A1–A3) and heating need, if defined. */
export function projectTargets(projectId: string): { carbon?: number; qh?: number; overheating?: number } {
  return {
    carbon: getProjectKpi(projectId, 'embodied-carbon')?.target,
    qh: getProjectKpi(projectId, 'operational-energy')?.target,
    overheating: getProjectKpi(projectId, 'overheating')?.target ?? getKpiDefinition('overheating')?.benchmarks.firmTarget,
  };
}
