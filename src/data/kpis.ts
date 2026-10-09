import type { KpiDefinition, ProjectKpi } from '@/domain/types';

/**
 * KPI definitions with benchmarks. STEP 2 completes all 11 KpiIds (see `KpiId` in types.ts) in this order:
 * embodied-carbon, embodied-carbon-wlc, operational-energy, primary-energy, energy-class, renewable-share,
 * water, green-area, biotope-factor, daylight, overheating.
 */
export const kpiDefinitions: KpiDefinition[] = [
  {
    id: 'embodied-carbon',
    label: 'Уграђени угљеник (A1–A3)',
    shortLabel: 'Уграђени угљеник',
    unit: 'kgCO₂e/m²',
    direction: 'lower-better',
    decimals: 0,
    benchmarks: { firmTarget: 350, bestPractice: 250 },
    description: 'Емисије из производње грађевинских материјала (модули A1–A3 по EN 15978), по m² БРГП.',
  },
  {
    id: 'operational-energy',
    label: 'Оперативна енергија',
    shortLabel: 'Оперативна енергија',
    unit: 'kWh/m²a',
    direction: 'lower-better',
    decimals: 0,
    benchmarks: { regulatoryMin: 65, euTaxonomy: 50, firmTarget: 40, bestPractice: 15 },
    description: 'Годишња потребна финална енергија за грејање, хлађење, вентилацију и припрему топле воде.',
  },
];

/** Per-project KPI values. STEP 2 fills every project × KPI. */
export const projectKpis: ProjectKpi[] = [
  {
    projectId: 'savski-kej',
    kpiId: 'embodied-carbon',
    target: 320,
    current: 358,
    history: [
      { phase: 'idr', value: 305 },
      { phase: 'pgd', value: 358 },
    ],
    note: 'Пораст након промене фасаде са дрвене облоге на алуминијумске панеле.',
  },
  {
    projectId: 'savski-kej',
    kpiId: 'operational-energy',
    target: 35,
    current: 38,
    history: [
      { phase: 'idr', value: 36 },
      { phase: 'pgd', value: 38 },
    ],
  },
];
