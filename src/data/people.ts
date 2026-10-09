import type { Person } from '@/domain/types';

/** Firm people. STEP 2 adds the rest of the team (~12–15 people). */
export const people: Person[] = [
  {
    id: 'p-jelena-markovic',
    name: 'Јелена Марковић',
    initials: 'ЈМ',
    role: 'Партнерка, председница одбора',
    discipline: 'arhitektura',
    licences: ['ИКС 300'],
    certifications: ['DGNB Auditor'],
    allocations: [{ projectId: 'savski-kej', pct: 15 }],
    office: 'Београд',
    boardMember: true,
    competencies: { sertifikacija: 3, lca: 2, nasledje: 2 },
  },
  {
    id: 'p-nikola-petrovic',
    name: 'Никола Петровић',
    initials: 'НП',
    role: 'Руководилац за одрживост',
    discipline: 'odrzivost',
    licences: ['ИКС 381'],
    certifications: ['DGNB Consultant', 'EDGE Expert'],
    allocations: [{ projectId: 'savski-kej', pct: 40 }],
    office: 'Београд',
    boardMember: true,
    competencies: { lca: 3, 'energetsko-modelovanje': 3, sertifikacija: 3, cirkularnost: 2 },
  },
  {
    id: 'p-ana-jovanovic',
    name: 'Ана Јовановић',
    initials: 'АЈ',
    role: 'Водећи архитекта пројекта',
    discipline: 'arhitektura',
    licences: ['ИКС 300'],
    certifications: ['LEED Green Associate'],
    allocations: [{ projectId: 'savski-kej', pct: 80 }],
    office: 'Београд',
    competencies: { bim: 3, 'drvene-konstrukcije': 2, lca: 1 },
  },
];
