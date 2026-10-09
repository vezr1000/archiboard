/**
 * Seed data barrel + lookup helpers. Features import from here only:
 *
 *   import { projects, getProject, kpisForProject } from '@/data';
 *
 * Seed arrays are read-only. User-created items (options, decisions, accepted requirements) live in
 * `useAppStore`; use the merged hooks in `src/store/selectors.ts` when you need seed + user data together.
 */
import type {
  ActivityItem,
  AttentionItem,
  BoardSession,
  CertificationCategory,
  CertificationCriterion,
  Condition,
  Decision,
  DesignOption,
  GateId,
  KpiDefinition,
  KpiId,
  Material,
  Person,
  Project,
  ProjectDocument,
  ProjectKpi,
  ProjectMaterial,
  Regulation,
  Requirement,
  Risk,
  SiteInfo,
  Stakeholder,
} from '@/domain/types';
import { DEMO_TODAY } from '@/lib/dates';
import { activity } from './activity';
import { attentionItems } from './attention';
import { certificationCriteria, certifications } from './certification';
import { decisions } from './decisions';
import { documents } from './documents';
import { kpiDefinitions, projectKpis } from './kpis';
import { materials, projectMaterials } from './materials';
import { designOptions } from './options';
import { people } from './people';
import { projects } from './projects';
import { regulations } from './regulations';
import { requirements } from './requirements';
import { risks } from './risks';
import { boardSessions } from './sessions';
import { sites } from './sites';
import { stakeholders } from './stakeholders';

export {
  activity,
  attentionItems,
  boardSessions,
  certificationCriteria,
  certifications,
  decisions,
  designOptions,
  documents,
  kpiDefinitions,
  materials,
  people,
  projectKpis,
  projectMaterials,
  projects,
  regulations,
  requirements,
  risks,
  sites,
  stakeholders,
};
export { APP, CURRENT_USER_ID, FIRM } from './firm';

/* ---------- Generic ---------- */

const byId = <T extends { id: string }>(list: readonly T[], id: string | undefined): T | undefined =>
  id === undefined ? undefined : list.find((x) => x.id === id);

const forProject = <T extends { projectId: string }>(list: readonly T[], projectId: string): T[] =>
  list.filter((x) => x.projectId === projectId);

/** Sort by ISO `date` field, newest first. */
const newestFirst = <T extends { date: string }>(list: T[]): T[] => [...list].sort((a, b) => b.date.localeCompare(a.date));

/* ---------- Projects & people ---------- */

export const getProject = (id: string | undefined): Project | undefined => byId(projects, id);
export const getPerson = (id: string | undefined): Person | undefined => byId(people, id);
/** People for a list of ids, preserving order, skipping unknown ids. */
export const getPeople = (ids: readonly string[]): Person[] =>
  ids.map((id) => getPerson(id)).filter((p): p is Person => Boolean(p));
/** Project team (lead first). */
export const teamForProject = (projectId: string): Person[] => {
  const p = getProject(projectId);
  if (!p) return [];
  return getPeople([p.leadArchitectId, ...p.teamIds.filter((id) => id !== p.leadArchitectId)]);
};
/** People allocated to a project with their allocation %. */
export const allocationsForProject = (projectId: string): Array<{ person: Person; pct: number }> =>
  people.flatMap((person) => {
    const a = person.allocations.find((x) => x.projectId === projectId);
    return a ? [{ person, pct: a.pct }] : [];
  });
/** Total allocation % of a person across projects. */
export const totalAllocation = (person: Person): number => person.allocations.reduce((s, a) => s + a.pct, 0);
export const boardMembers = (): Person[] => people.filter((p) => p.boardMember);

/* ---------- KPIs ---------- */

export const getKpiDefinition = (id: KpiId | string): KpiDefinition | undefined =>
  kpiDefinitions.find((k) => k.id === id);
/** Project KPIs joined with their definitions, in definition order. */
export const kpisForProject = (projectId: string): Array<{ def: KpiDefinition; kpi: ProjectKpi }> =>
  kpiDefinitions.flatMap((def) => {
    const kpi = projectKpis.find((k) => k.projectId === projectId && k.kpiId === def.id);
    return kpi ? [{ def, kpi }] : [];
  });
export const getProjectKpi = (projectId: string, kpiId: KpiId): ProjectKpi | undefined =>
  projectKpis.find((k) => k.projectId === projectId && k.kpiId === kpiId);

/* ---------- Site & requirements ---------- */

export const siteForProject = (projectId: string): SiteInfo | undefined => sites.find((s) => s.projectId === projectId);
export const requirementsForProject = (projectId: string): Requirement[] => forProject(requirements, projectId);

/* ---------- Regulations ---------- */

export const getRegulation = (id: string | undefined): Regulation | undefined => byId(regulations, id);
/** Regulations that apply to a project (by explicit id or by typology). */
export const regulationsForProject = (projectId: string): Regulation[] => {
  const p = getProject(projectId);
  if (!p) return [];
  return regulations.filter(
    (r) => r.appliesTo.projectIds?.includes(projectId) || r.appliesTo.typologies?.includes(p.typology),
  );
};

/* ---------- Options, decisions, sessions ---------- */

export const optionsForProject = (projectId: string): DesignOption[] => forProject(designOptions, projectId);
export const getOption = (id: string | undefined): DesignOption | undefined => byId(designOptions, id);
export const getDecision = (id: string | undefined): Decision | undefined => byId(decisions, id);
export const decisionsForProject = (projectId: string): Decision[] => newestFirst(forProject(decisions, projectId));
export const getSession = (id: string | undefined): BoardSession | undefined => byId(boardSessions, id);
export const sessionsForProject = (projectId: string): BoardSession[] => newestFirst(forProject(boardSessions, projectId));
/** Scheduled sessions on/after `fromIso` (default DEMO_TODAY), soonest first. */
export const upcomingSessions = (fromIso: string = DEMO_TODAY): BoardSession[] =>
  boardSessions
    .filter((s) => s.outcome === 'scheduled' && s.date >= fromIso)
    .sort((a, b) => a.date.localeCompare(b.date));
/** Held sessions (outcome ≠ scheduled), newest first. */
export const pastSessions = (): BoardSession[] => newestFirst(boardSessions.filter((s) => s.outcome !== 'scheduled'));
/**
 * Open (not done) conditions of a project from board sessions and decisions, soonest due first.
 * `source` tells where the condition comes from (session or decision id).
 */
export const openConditionsForProject = (
  projectId: string,
): Array<Condition & { source: { kind: 'session' | 'decision'; id: string } }> =>
  [
    ...forProject(boardSessions, projectId).flatMap((s) =>
      s.conditions.filter((c) => !c.done).map((c) => ({ ...c, source: { kind: 'session' as const, id: s.id } })),
    ),
    ...forProject(decisions, projectId).flatMap((d) =>
      d.conditions.filter((c) => !c.done).map((c) => ({ ...c, source: { kind: 'decision' as const, id: d.id } })),
    ),
  ].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

/* ---------- Documents ---------- */

export const getDocument = (id: string | undefined): ProjectDocument | undefined => byId(documents, id);
export const documentsForProject = (projectId: string): ProjectDocument[] => forProject(documents, projectId);
/** Documents of a project required for a gate (from `requiredForGates`). */
export const documentsForGate = (projectId: string, gate: GateId): ProjectDocument[] =>
  forProject(documents, projectId).filter((d) => d.requiredForGates.includes(gate));

/**
 * Readiness of the documents required for a gate. „Ready“ = approved or already in review; drafts are „missing“
 * (this is how „недостају 2 од 12“ is counted everywhere).
 */
export const gateReadiness = (
  projectId: string,
  gate: GateId,
): { required: ProjectDocument[]; approved: ProjectDocument[]; inReview: ProjectDocument[]; missing: ProjectDocument[] } => {
  const required = documentsForGate(projectId, gate).filter((d) => d.status !== 'superseded');
  return {
    required,
    approved: required.filter((d) => d.status === 'approved'),
    inReview: required.filter((d) => d.status === 'review'),
    missing: required.filter((d) => d.status === 'draft'),
  };
};

/** The project's next scheduled board session (soonest), if any. */
export const nextSessionForProject = (projectId: string): BoardSession | undefined =>
  upcomingSessions().find((s) => s.projectId === projectId);

/* ---------- Materials ---------- */

export const getMaterial = (id: string | undefined): Material | undefined => byId(materials, id);
/** Project material passport rows joined with the EPD library entry (rows with unknown materials are skipped). */
export const materialsForProject = (
  projectId: string,
): Array<ProjectMaterial & { material: Material; gwpTotalKg: number }> =>
  forProject(projectMaterials, projectId).flatMap((pm) => {
    const material = getMaterial(pm.materialId);
    return material ? [{ ...pm, material, gwpTotalKg: material.gwpA1A3 * pm.quantity }] : [];
  });

/* ---------- Stakeholders, risks, certification, activity ---------- */

export const stakeholdersForProject = (projectId: string): Stakeholder[] => forProject(stakeholders, projectId);
export const risksForProject = (projectId: string): Risk[] => forProject(risks, projectId);
export const certificationForProject = (projectId: string): CertificationCategory | undefined =>
  certifications.find((c) => c.projectId === projectId);
export const criteriaForProject = (projectId: string): CertificationCriterion[] =>
  forProject(certificationCriteria, projectId);
export const activityForProject = (projectId: string): ActivityItem[] => newestFirst(forProject(activity, projectId));
/** All activity, newest first. */
export const recentActivity = (limit?: number): ActivityItem[] => newestFirst(activity).slice(0, limit);

const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2 } as const;
/** „Захтева пажњу“ items, most severe first, then newest. Pass a projectId to filter. */
export const attentionFor = (projectId?: string): AttentionItem[] =>
  attentionItems
    .filter((a) => !projectId || a.projectId === projectId)
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || b.date.localeCompare(a.date));
