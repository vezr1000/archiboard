import { COMPETENCY_LABELS } from '@/domain/labels';
import type { Competency, Person, Project } from '@/domain/types';
import { people, projects, totalAllocation } from '@/data';

/* ---------- Allocation helpers ---------- */

export const OVERALLOCATION_LIMIT = 100;
export const totalPct = (p: Person): number => totalAllocation(p);
export const isOverallocated = (p: Person): boolean => totalPct(p) > OVERALLOCATION_LIMIT;
export const pctOnProject = (p: Person, projectId: string): number => p.allocations.find((a) => a.projectId === projectId)?.pct ?? 0;

/** One colour per project (token colours, by index in the portfolio). */
export const PROJECT_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)', 'var(--chart-6)'];
export const projectColor = (projectId: string): string => {
  const i = projects.findIndex((p) => p.id === projectId);
  return PROJECT_COLORS[(i < 0 ? 0 : i) % PROJECT_COLORS.length];
};

/* ---------- Certifications ---------- */

export type CertScheme = 'DGNB' | 'LEED' | 'EDGE' | 'BREEAM' | 'WELL' | 'PH';
export const CERT_SCHEMES: CertScheme[] = ['DGNB', 'LEED', 'EDGE', 'BREEAM', 'WELL', 'PH'];
export const CERT_SCHEME_LABELS: Record<CertScheme, string> = { DGNB: 'DGNB', LEED: 'LEED', EDGE: 'EDGE', BREEAM: 'BREEAM', WELL: 'WELL', PH: 'Passivhaus' };

/** Certification scheme of a credential string, e.g. „LEED AP BD+C“ → LEED; null for tool certificates (One Click LCA …). */
export function certSchemeOf(cert: string): CertScheme | null {
  if (cert.startsWith('DGNB')) return 'DGNB';
  if (cert.startsWith('LEED')) return 'LEED';
  if (cert.startsWith('EDGE')) return 'EDGE';
  if (cert.startsWith('BREEAM')) return 'BREEAM';
  if (cert.startsWith('WELL')) return 'WELL';
  if (/passive house|passivhaus/i.test(cert)) return 'PH';
  return null;
}
export const hasScheme = (p: Person, scheme: CertScheme): boolean => p.certifications.some((c) => certSchemeOf(c) === scheme);

/* ---------- Licences ---------- */

export const LICENCE_LABELS: Record<string, string> = {
  'ИКС 200': 'Урбанизам',
  'ИКС 300': 'Одговорни пројектант архитектуре',
  'ИКС 310': 'Конструкције високоградње',
  'ИКС 330': 'Машинске инсталације',
  'ИКС 373': 'Пејзажна архитектура',
  'ИКС 381': 'Енергетска ефикасност зграда',
  'ИКС 400': 'Извођење радова',
};

/* ---------- Competency coverage of a project ---------- */

/** Competency level from which a person counts as „covering“ a competency (2 = самостално). */
export const COVER_LEVEL = 2;
export const level = (p: Person, c: Competency): number => p.competencies?.[c] ?? 0;

export interface CompetencyNeed {
  id: string;
  label: string;
  /** Why the project needs it. */
  reason: string;
  test: (p: Person) => boolean;
}

const hasLicence = (p: Person, l: string) => p.licences.includes(l);
const hasCert = (p: Person, re: RegExp) => p.certifications.some((c) => re.test(c));

/**
 * Competencies a project needs, from its certification scheme and typology (+ the baseline: ИКС 300 / 381, LCA, BIM).
 * Public-space projects need landscape instead of the building licences.
 */
export function competencyNeeds(project: Project): CompetencyNeed[] {
  const scheme = project.certification.scheme;
  const needs: CompetencyNeed[] = [];
  const park = project.typology === 'javni-prostor';

  if (park) {
    needs.push({ id: 'iks-373', label: 'ИКС 373 — одговорни пројектант пејзажне архитектуре', reason: 'Јавни простор', test: (p) => hasLicence(p, 'ИКС 373') });
  } else {
    needs.push(
      { id: 'iks-300', label: 'ИКС 300 — одговорни пројектант', reason: 'Основно за сваки пројекат зграде', test: (p) => hasLicence(p, 'ИКС 300') },
      { id: 'iks-381', label: 'ИКС 381 — енергетска ефикасност', reason: 'Енергетски пасош и елаборат ЕЕ', test: (p) => hasLicence(p, 'ИКС 381') },
    );
  }
  needs.push({ id: 'lca', label: 'LCA аналитичар', reason: 'Уграђени угљеник и извештај A1–C4', test: (p) => level(p, 'lca') >= COVER_LEVEL });
  if (!park) needs.push({ id: 'bim', label: 'BIM менаџер', reason: 'Координација модела и количине', test: (p) => level(p, 'bim') >= 3 });

  if (scheme === 'DGNB') needs.push({ id: 'dgnb', label: 'DGNB Consultant / Auditor', reason: 'Шема DGNB', test: (p) => hasCert(p, /^DGNB (Consultant|Auditor)/) });
  if (scheme === 'LEED') needs.push({ id: 'leed', label: 'LEED AP', reason: 'Шема LEED', test: (p) => hasCert(p, /^LEED AP/) });
  if (scheme === 'BREEAM') needs.push({ id: 'breeam', label: 'BREEAM AP', reason: 'Шема BREEAM', test: (p) => hasCert(p, /^BREEAM/) });
  if (scheme === 'EDGE') needs.push({ id: 'edge', label: 'EDGE Expert', reason: 'Шема EDGE', test: (p) => hasCert(p, /^EDGE Expert/) });
  if (scheme === 'Passivhaus')
    needs.push({ id: 'ph', label: 'Certified Passive House Designer', reason: 'Шема Passivhaus', test: (p) => hasCert(p, /Passive House Designer/) });
  if (scheme === 'none' && park) needs.push({ id: 'cert', label: 'Сертификација / интерни скорекард', reason: 'Интерни скорекард пројекта', test: (p) => level(p, 'sertifikacija') >= COVER_LEVEL });

  const timber = /CLT|дрвен/i.test(`${project.typologyLabel} ${project.tags.join(' ')}`);
  if (timber) needs.push({ id: 'timber', label: 'Конструктор за дрвене конструкције', reason: 'CLT и хибридна конструкција', test: (p) => level(p, 'drvene-konstrukcije') >= 3 });
  if (project.typology === 'adaptivna-prenamena') {
    needs.push(
      { id: 'heritage', label: 'Наслеђе и пренамена објекта', reason: 'Адаптивна поновна употреба', test: (p) => level(p, 'nasledje') >= 3 },
      { id: 'circ', label: 'Циркуларност и поновна употреба', reason: 'Циљ циркуларности', test: (p) => level(p, 'cirkularnost') >= COVER_LEVEL },
    );
  }
  if (project.typology === 'obrazovni' || scheme === 'Passivhaus') {
    needs.push({ id: 'energy', label: 'Енергетско моделовање', reason: 'Дубока обнова / пасивна кућа', test: (p) => level(p, 'energetsko-modelovanje') >= 3 });
  }
  return needs;
}

export interface NeedCoverage {
  need: CompetencyNeed;
  /** Project team members who cover it. */
  covered: Person[];
  /** Firm people outside the team who could cover it (shown for missing needs). */
  elsewhere: Person[];
}

export function coverageOf(project: Project, team: Person[]): NeedCoverage[] {
  const ids = new Set(team.map((p) => p.id));
  return competencyNeeds(project).map((need) => ({
    need,
    covered: team.filter(need.test),
    elsewhere: people.filter((p) => !ids.has(p.id) && need.test(p)),
  }));
}

/* ---------- Firm matrix ---------- */

export type MatrixGroup = 'competencies' | 'certificates' | 'licences';
export const MATRIX_GROUP_LABELS: Record<MatrixGroup, string> = { competencies: 'Компетенције', certificates: 'Сертификати', licences: 'Лиценце' };

export interface MatrixItem {
  id: string;
  label: string;
  /** Longer name for tooltips. */
  title: string;
  /** 0 = none; for graded items 1..3, for yes/no items 1. */
  value: (p: Person) => number;
  graded: boolean;
}

const competencyItems: MatrixItem[] = (Object.keys(COMPETENCY_LABELS) as Competency[]).map((c) => ({
  id: c,
  label: COMPETENCY_LABELS[c],
  title: COMPETENCY_LABELS[c],
  value: (p) => level(p, c),
  graded: true,
}));

const certificateItems: MatrixItem[] = [
  ...CERT_SCHEMES.map((s) => ({
    id: s,
    label: CERT_SCHEME_LABELS[s],
    title: `${CERT_SCHEME_LABELS[s]} — стручњак за шему`,
    value: (p: Person) => (hasScheme(p, s) ? 1 : 0),
    graded: false,
  })),
  { id: 'oneclick', label: 'One Click LCA', title: 'One Click LCA Certified Expert', value: (p) => (hasCert(p, /One Click LCA/) ? 1 : 0), graded: false },
  { id: 'bsi', label: 'buildingSMART', title: 'buildingSMART Professional Certification', value: (p) => (hasCert(p, /buildingSMART/) ? 1 : 0), graded: false },
];

const licenceItems: MatrixItem[] = Object.keys(LICENCE_LABELS).map((l) => ({
  id: l,
  label: l,
  title: `${l} — ${LICENCE_LABELS[l]}`,
  value: (p) => (p.licences.includes(l) ? 1 : 0),
  graded: false,
}));

export const MATRIX_ITEMS: Record<MatrixGroup, MatrixItem[]> = { competencies: competencyItems, certificates: certificateItems, licences: licenceItems };

/** Covered = competency level ≥ 2, or the credential is held. */
export const covers = (item: MatrixItem, p: Person): boolean => item.value(p) >= (item.graded ? COVER_LEVEL : 1);

/** Firm-wide coverage of an item (independent of any filters). */
export const coverersOf = (item: MatrixItem): Person[] => people.filter((p) => covers(item, p));

/** Items covered by exactly one person — single points of failure. */
export const singlePoints = (group: MatrixGroup): Array<{ item: MatrixItem; person: Person }> =>
  MATRIX_ITEMS[group].flatMap((item) => {
    const c = coverersOf(item);
    return c.length === 1 ? [{ item, person: c[0] }] : [];
  });
