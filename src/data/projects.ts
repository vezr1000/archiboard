import type { Project } from '@/domain/types';

/**
 * Projects in the demo portfolio. STEP 2 fills the remaining five (see docs/CONCEPT.md §4).
 * Order = default display order (flagship first).
 */
export const projects: Project[] = [
  {
    id: 'savski-kej',
    name: 'Савски кеј — блок Ц',
    shortName: 'Савски кеј',
    city: 'Београд',
    address: 'Савска обала бб, Савски венац',
    parcel: 'КП 1789/3, КО Савски венац',
    plan: 'ПДР Савски амфитеатар, целина Ц',
    typology: 'stambeno-poslovni',
    typologyLabel: 'Стамбено-пословни, хибридна дрвена конструкција (CLT + АБ језгро)',
    description:
      'Стамбено-пословни блок уз Саву са 164 стана, приземљем за комерцијалне садржаје и јавним пролазом ка кеју. ' +
      'Носећа конструкција изнад приземља је од унакрсно лепљеног дрвета (CLT) са армиранобетонским језгрима.',
    gfaM2: 18_400,
    siteAreaM2: 4_850,
    floors: '2По+П+8+Пс',
    budgetEur: 31_500_000,
    client: 'Кеј Девелопмент д.о.о.',
    phase: 'pgd',
    phaseProgress: 0.7,
    health: 'at-risk',
    certification: { scheme: 'DGNB', targetLevel: 'Gold', currentScore: 66, targetScore: 70 },
    leadArchitectId: 'p-ana-jovanovic',
    teamIds: ['p-ana-jovanovic', 'p-nikola-petrovic', 'p-jelena-markovic'],
    nextGate: { gate: 'G2', date: '2026-10-22' },
    coverHue: 152,
    illustration: 'tower',
    coordinates: { x: 46, y: 30 },
    tags: ['CLT', 'DGNB', 'EU таксономија', 'Сава'],
    startYear: 2025,
  },
];
