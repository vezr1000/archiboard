import { getKpiDefinition, getProjectKpi } from '@/data';
import { CHECK_STATUS_TONE } from '@/domain/labels';
import type { KpiId, Project, Tone } from '@/domain/types';
import { certScoreMax, certTone, formatCertScore } from '@/lib/cert';
import { formatNumber } from '@/lib/format';
import { kpiStatus } from '@/lib/kpi';

/** One progress-bar row of a project card. */
export interface MiniKpi {
  id: string;
  label: string;
  unit: string;
  value: number;
  target: number;
  /** Bar scale maximum. */
  max: number;
  tone: Tone;
  /** „358 / 320“ */
  valueLabel: string;
}

/** KPIs shown on a card: buildings → carbon + heating energy; the park (no GFA) → stormwater + green area. */
const cardKpiIds = (project: Project): KpiId[] =>
  project.gfaM2 ? ['embodied-carbon', 'operational-energy'] : ['stormwater-retention', 'green-area'];

/** Up to three bars: two KPIs that exist for the project, plus the certification score. */
export function miniKpisFor(project: Project): MiniKpi[] {
  const bars: MiniKpi[] = [];
  for (const id of cardKpiIds(project)) {
    const kpi = getProjectKpi(project.id, id);
    const def = getKpiDefinition(id);
    if (!kpi || !def) continue;
    bars.push({
      id,
      label: def.shortLabel,
      unit: def.unit,
      value: kpi.current,
      target: kpi.target,
      max: def.unit === '%' ? 100 : Math.max(kpi.current, kpi.target) * 1.25,
      tone: CHECK_STATUS_TONE[kpiStatus(def.direction, kpi.current, kpi.target)],
      valueLabel: `${formatNumber(kpi.current, def.decimals)} / ${formatNumber(kpi.target, def.decimals)}`,
    });
  }
  const c = project.certification;
  bars.push({
    id: 'certification',
    label: c.scheme === 'none' ? 'Интерни скор' : `${c.scheme} ${c.targetLevel}`,
    unit: '',
    value: c.currentScore,
    target: c.targetScore,
    max: certScoreMax(c.scheme),
    tone: certTone(c.currentScore, c.targetScore),
    valueLabel: `${formatNumber(c.currentScore, Number.isInteger(c.currentScore) ? 0 : 1)} / ${formatCertScore(c.targetScore, c.scheme)}`,
  });
  return bars;
}
