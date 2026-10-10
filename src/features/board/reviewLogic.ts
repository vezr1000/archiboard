/**
 * Gate review (step 10) — pure logic: steps, quorum, KPI gate check, proposals, AI-finding conditions, voting rule,
 * the board's decision record and the minutes (Записник) model shared by past sessions and finished reviews.
 */
import {
  boardChair,
  carriedConditionsForSession,
  getDocument,
  getPeople,
  getPerson,
  getProject,
  kpisForProject,
  sessionOfCondition,
} from '@/data';
import {
  FINDING_DISPOSITION_DONE_LABELS,
  GATE_CLOSES_PHASE,
  GATE_LABELS,
  GATES,
  PHASE_LABELS,
  SESSION_OUTCOME_LABELS,
  energyClassFromScale,
} from '@/domain/labels';
import type {
  AiFinding,
  BoardSession,
  BoardVote,
  CheckStatus,
  Condition,
  Decision,
  DesignParams,
  FindingDisposition,
  FindingSeverity,
  GateId,
  GateReviewState,
  KpiDefinition,
  MemberVote,
  Person,
  Project,
  ProjectDocument,
  ProjectKpi,
  ReviewCondition,
} from '@/domain/types';
import { evaluate, type ProjectModel } from '@/lib/carbonModel';
import { addDays } from '@/lib/dates';
import { formatDate, formatDateGenitive, formatNumber, formatPct } from '@/lib/format';
import { gapPct, kpiStatus } from '@/lib/kpi';

/* ------------------------------------------------------------------------------------------------
 * Steps
 * ---------------------------------------------------------------------------------------------- */

export const REVIEW_STEPS = [
  { id: 'priprema', title: 'Припрема', hint: 'Пројекат, чланови, дневни ред' },
  { id: 'dokumentacija', title: 'Документација', hint: 'Обавезна документа за капију' },
  { id: 'kpi', title: 'KPI провера', hint: 'Показатељи према прагу капије' },
  { id: 'ai', title: 'АИ пре-ревизија', hint: 'Налази и одлуке одбора' },
  { id: 'uslovi', title: 'Услови', hint: 'Носиоци и рокови' },
  { id: 'odluka', title: 'Одлука', hint: 'Гласање и записник' },
] as const;
export const STEP_COUNT = REVIEW_STEPS.length;

/** Quorum = simple majority of the session's members (≥ 3 of 4, ≥ 2 of 3). */
export const quorumFor = (members: number): number => Math.floor(members / 2) + 1;

/** Gate tolerance: a KPI within 5 % of its project target is a warning, beyond that it fails. */
export const GATE_TOLERANCE_PCT = 5;

/** The gate after `gate` (Г2 → Г3), used in condition deadlines. */
export const nextGateOf = (gate: GateId): GateId | undefined => GATES[GATES.indexOf(gate) + 1];

/* ------------------------------------------------------------------------------------------------
 * Initial state
 * ---------------------------------------------------------------------------------------------- */

/** Fresh review for a scheduled session: everyone present, open conditions of earlier gates carried over. */
export function initialReview(session: BoardSession): GateReviewState {
  return {
    sessionId: session.id,
    step: 0,
    maxStep: 0,
    presentIds: [...session.memberIds],
    agendaChecked: [],
    documentMarks: {},
    kpiAcknowledged: [],
    aiRun: false,
    findingDispositions: {},
    conditions: carriedConditionsForSession(session.id).map(({ condition }) => ({
      ...condition,
      id: `rc-${condition.id}`,
      source: 'carried' as const,
      sourceId: condition.id,
    })),
    votes: {},
    startedAt: new Date().toISOString(),
  };
}

/* ------------------------------------------------------------------------------------------------
 * Documents
 * ---------------------------------------------------------------------------------------------- */

/** Required documents of the session (register status: ready = approved or in review, missing = draft). */
export function sessionDocuments(session: BoardSession): ProjectDocument[] {
  return session.requiredDocumentIds.map((id) => getDocument(id)).filter((d): d is ProjectDocument => Boolean(d));
}
export const isDocReady = (d: ProjectDocument): boolean => d.status === 'approved' || d.status === 'review';

/* ------------------------------------------------------------------------------------------------
 * KPI gate check
 * ---------------------------------------------------------------------------------------------- */

export interface KpiCheck {
  def: KpiDefinition;
  kpi: ProjectKpi;
  status: CheckStatus;
  /** Signed % vs target, positive = above target (raw, not direction-adjusted). */
  deltaPct: number;
  /** Gap in % where positive = worse than target. */
  gap: number;
}

export function kpiChecks(projectId: string): KpiCheck[] {
  return kpisForProject(projectId).map(({ def, kpi }) => {
    const deltaPct = kpi.target === 0 ? 0 : ((kpi.current - kpi.target) / Math.abs(kpi.target)) * 100;
    return {
      def,
      kpi,
      status: kpiStatus(def.direction, kpi.current, kpi.target, GATE_TOLERANCE_PCT),
      deltaPct,
      gap: gapPct(def.direction, kpi.current, kpi.target),
    };
  });
}

export const isEnergyClass = (def: KpiDefinition): boolean => def.id === 'energy-class';

/** KPI value with unit, energy class as letter. */
export function formatKpi(def: KpiDefinition, v: number, withUnit = true): string {
  if (isEnergyClass(def)) return energyClassFromScale(v);
  const n = formatNumber(v, def.decimals);
  return withUnit && def.unit ? `${n} ${def.unit}` : n;
}

/* ------------------------------------------------------------------------------------------------
 * Proposed measures (decisions proposed for this session)
 * ---------------------------------------------------------------------------------------------- */

/**
 * Model scenarios for seed proposals that describe a concrete design change. Evaluated with the project's calibrated
 * what-if model, so the gate review shows exactly what the calculator shows (dec-sk-09: 340 / 333).
 */
const MEASURE_SCENARIOS: Record<string, Array<{ label: string; patch: Partial<DesignParams> }>> = {
  'dec-sk-09': [
    { label: 'фибер-цементне плоче', patch: { cladding: 'fiber-cement' } },
    { label: 'уз CEM III/A у АБ језгрима', patch: { cladding: 'fiber-cement', coreConcreteMix: 'cem-iii' } },
  ],
};

export interface MeasureEstimate {
  label: string;
  value: number;
}

/** Which KPI a proposal's impact applies to. */
export function proposalKpi(d: Decision): 'embodied-carbon' | 'operational-energy' | undefined {
  if (d.impact.carbonDeltaPct !== undefined) return 'embodied-carbon';
  if (d.impact.energyDeltaPct !== undefined) return 'operational-energy';
  return undefined;
}

/** Expected KPI value(s) after a proposed measure. */
export function measureEstimates(d: Decision, current: number, model: ProjectModel | null): MeasureEstimate[] {
  const scenarios = MEASURE_SCENARIOS[d.id];
  if (scenarios && model) {
    return scenarios.map((s) => ({
      label: s.label,
      value: Math.round(evaluate({ ...model.anchorParams, ...s.patch }, model.ctx, model.calibration).embodiedCarbon),
    }));
  }
  const delta = d.impact.carbonDeltaPct ?? d.impact.energyDeltaPct;
  if (delta === undefined) return [];
  return [{ label: 'процена из предлога', value: Math.round(current * (1 + delta / 100)) }];
}

/* ------------------------------------------------------------------------------------------------
 * Conditions
 * ---------------------------------------------------------------------------------------------- */

const lowerFirst = (s: string) => s.charAt(0).toLocaleLowerCase('sr') + s.slice(1);

/** Condition pre-filled from an AI finding („Претвори у услов“). */
export function conditionFromFinding(f: AiFinding, session: BoardSession, project: Project): ReviewCondition {
  const next = nextGateOf(session.gate);
  const action: Record<FindingSeverity, string> = {
    critical: 'доставити одбору решење у року од 14 дана',
    warning: next ? `решити пре капије ${GATE_LABELS[next].code}` : 'решити пре следеће седнице',
    info: next ? `пратити и известити на капији ${GATE_LABELS[next].code}` : 'пратити и известити одбор',
  };
  const docOwner = getDocument(f.documentId)?.ownerId;
  return {
    id: `rc-f-${f.id}`,
    text: `${f.title}: ${action[f.severity]}.`,
    ownerId: docOwner && project.teamIds.includes(docOwner) ? docOwner : project.leadArchitectId,
    dueDate: addDays(f.severity === 'critical' ? 14 : 30, session.date),
    done: false,
    source: 'finding',
    sourceId: f.id,
  };
}

/** Condition from a proposed measure in the KPI step („Укључи као услов“). */
export function conditionFromProposal(d: Decision, session: BoardSession, project: Project): ReviewCondition {
  const title = d.title.replace(/^Предлог:\s*/u, '');
  const due =
    d.conditions
      .map((c) => c.dueDate)
      .sort()
      .pop() ?? addDays(30, session.date);
  return {
    id: `rc-m-${d.id}`,
    text: `Спровести предложену меру — ${lowerFirst(title)} — и доставити ажурирани LCA прорачун.`,
    ownerId: d.conditions[0]?.ownerId ?? project.leadArchitectId,
    dueDate: due,
    done: false,
    source: 'kpi',
    sourceId: d.id,
  };
}

export function newCondition(session: BoardSession, project: Project): ReviewCondition {
  return {
    id: `rc-n-${Date.now().toString(36)}`,
    text: '',
    ownerId: project.leadArchitectId,
    dueDate: addDays(30, session.date),
    done: false,
    source: 'manual',
  };
}

/** People who can own a condition: project team, then board members, then anyone already assigned. */
export function ownerCandidates(project: Project, session: BoardSession, conditions: Condition[]): Person[] {
  const ids = [project.leadArchitectId, ...project.teamIds, ...session.memberIds, ...conditions.map((c) => c.ownerId)];
  return getPeople([...new Set(ids)]);
}

/** Gate label of the session a carried condition comes from (e.g. „Г1“). */
export const carriedFromLabel = (c: ReviewCondition): string | undefined => {
  if (c.source !== 'carried' || !c.sourceId) return undefined;
  const s = sessionOfCondition(c.sourceId);
  return s ? GATE_LABELS[s.gate].code : undefined;
};

/* ------------------------------------------------------------------------------------------------
 * Voting
 * ---------------------------------------------------------------------------------------------- */

export const VOTE_ORDER: BoardVote[] = ['approved', 'approved-with-conditions', 'rework'];
/** Strictness used only when there is a tie and the chair did not vote for any of the tied options. */
const STRICTNESS: Record<BoardVote, number> = { approved: 0, 'approved-with-conditions': 1, rework: 2 };

export interface VoteResult {
  tally: Record<BoardVote, number>;
  voted: number;
  /** Present members who must vote. */
  voters: number;
  /** Everyone present has voted. */
  complete: boolean;
  /** Outcome of the votes cast so far (undefined before the first vote). */
  outcome?: BoardVote;
  /** The tie was broken by the chair's vote. */
  decidedByChair: boolean;
  /** Tie with no chair vote among the tied options → the stricter outcome. */
  decidedByStrictness: boolean;
  /** The chair voted „враћено“ but the majority decided otherwise. */
  chairReworkOutvoted: boolean;
}

/** Majority of the present members' votes; on a tie the chair's vote decides (else the stricter outcome). */
export function computeVotes(votes: Record<string, MemberVote>, presentIds: string[], chairId: string | undefined): VoteResult {
  const tally: Record<BoardVote, number> = { approved: 0, 'approved-with-conditions': 0, rework: 0 };
  const cast = presentIds.map((id) => votes[id]).filter((v): v is MemberVote => Boolean(v));
  cast.forEach((v) => (tally[v.vote] += 1));
  const base = {
    tally,
    voted: cast.length,
    voters: presentIds.length,
    complete: presentIds.length > 0 && cast.length === presentIds.length,
    decidedByChair: false,
    decidedByStrictness: false,
    chairReworkOutvoted: false,
  };
  if (cast.length === 0) return base;
  const max = Math.max(...VOTE_ORDER.map((v) => tally[v]));
  const top = VOTE_ORDER.filter((v) => tally[v] === max);
  const chairVote = chairId && presentIds.includes(chairId) ? votes[chairId]?.vote : undefined;
  let outcome: BoardVote;
  let decidedByChair = false;
  let decidedByStrictness = false;
  if (top.length === 1) outcome = top[0];
  else if (chairVote && top.includes(chairVote)) {
    outcome = chairVote;
    decidedByChair = true;
  } else {
    outcome = [...top].sort((a, b) => STRICTNESS[b] - STRICTNESS[a])[0];
    decidedByStrictness = true;
  }
  return {
    ...base,
    outcome,
    decidedByChair,
    decidedByStrictness,
    chairReworkOutvoted: chairVote === 'rework' && outcome !== 'rework',
  };
}

/** One-word Serbian count for votes: „1 глас“, „2 гласа“, „5 гласова“. */
export function votesLabel(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} глас`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} гласа`;
  return `${n} гласова`;
}

/* ------------------------------------------------------------------------------------------------
 * Step completeness (for the step list and the final checklist)
 * ---------------------------------------------------------------------------------------------- */

export interface StepState {
  done: boolean;
  /** Short status, e.g. „кворум 4/4“, „10/12“. */
  label: string;
}

export function stepStates(
  review: GateReviewState,
  session: BoardSession,
  docs: ProjectDocument[],
  checks: KpiCheck[],
  agendaCount: number,
): StepState[] {
  const quorum = quorumFor(session.memberIds.length);
  const present = review.presentIds.length;
  const marked = docs.filter((d) => review.documentMarks[d.id]).length;
  const deviations = checks.filter((c) => c.status !== 'pass');
  const acked = deviations.filter((c) => review.kpiAcknowledged.includes(c.def.id)).length;
  const findings = session.aiFindings.length;
  const disposed = session.aiFindings.filter((f) => review.findingDispositions[f.id]).length;
  const votes = computeVotes(review.votes, review.presentIds, boardChair()?.id);
  return [
    {
      done: present >= quorum,
      label: `кворум ${present}/${session.memberIds.length} · ред ${review.agendaChecked.length}/${agendaCount}`,
    },
    { done: docs.length > 0 && marked === docs.length, label: `прегледано ${marked}/${docs.length}` },
    {
      done: acked === deviations.length,
      label: deviations.length === 0 ? 'без одступања' : `констатовано ${acked}/${deviations.length}`,
    },
    {
      done: review.aiRun && disposed === findings,
      label: !review.aiRun ? 'није покренуто' : findings === 0 ? 'без налаза' : `одлучено ${disposed}/${findings}`,
    },
    { done: review.maxStep > 4, label: `${review.conditions.length} ${conditionsWord(review.conditions.length)}` },
    { done: Boolean(review.outcome), label: `гласало ${votes.voted}/${votes.voters}` },
  ];
}

export function conditionsWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'услов';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'услова';
  return 'услова';
}

/* ------------------------------------------------------------------------------------------------
 * Decision record
 * ---------------------------------------------------------------------------------------------- */

export function buildBoardDecision(
  review: GateReviewState,
  session: BoardSession,
  outcome: BoardVote,
  result: VoteResult,
): Decision {
  const project = getProject(session.projectId);
  const gate = GATE_LABELS[session.gate];
  const docs = sessionDocuments(session);
  const accepted = docs.filter((d) => review.documentMarks[d.id] === 'accepted').length;
  const checks = kpiChecks(session.projectId);
  const fails = checks.filter((c) => c.status === 'fail');
  const warns = checks.filter((c) => c.status === 'warn');
  const disposed = session.aiFindings.filter((f) => review.findingDispositions[f.id]);
  const asConditions = disposed.filter((f) => review.findingDispositions[f.id] === 'condition').length;
  const tallyText = VOTE_ORDER.filter((v) => result.tally[v] > 0)
    .map((v) => `${SESSION_OUTCOME_LABELS[v].toLocaleLowerCase('sr')} — ${votesLabel(result.tally[v])}`)
    .join(', ');
  const comments = review.presentIds
    .map((id) => ({ p: getPerson(id), c: review.votes[id]?.comment?.trim() }))
    .filter((x) => x.p && x.c)
    .map((x) => `${x.p!.name}: „${x.c}“`);
  const id = `dec-board-${session.id}-${Date.now().toString(36)}`;
  return {
    id,
    projectId: session.projectId,
    date: session.date,
    title: `${gate.full} — одлука одбора`,
    context:
      `Ревизија капије ${gate.full}${project ? ` пројекта „${project.name}“` : ''}. ` +
      `Документација: прихваћено за ревизију ${accepted} од ${docs.length}. ` +
      `KPI према циљевима пројекта (толеранција ${GATE_TOLERANCE_PCT} %): ${checks.length - fails.length - warns.length} испуњено, ` +
      `${warns.length} у толеранцији, ${fails.length} није испуњено` +
      (fails.length ? ` (${fails.map((c) => c.def.shortLabel.toLocaleLowerCase('sr')).join(', ')})` : '') +
      '. ' +
      (session.aiFindings.length
        ? `АИ пре-ревизија (демо): ${session.aiFindings.length} налаза, ${asConditions} претворено у услове.`
        : ''),
    optionsConsidered: VOTE_ORDER.map((v) => SESSION_OUTCOME_LABELS[v]),
    decision: `${SESSION_OUTCOME_LABELS[outcome]}${review.conditions.length ? ` — ${review.conditions.length} ${conditionsWord(review.conditions.length)}` : ''}.`,
    rationale:
      `Гласање присутних чланова (${review.presentIds.length} од ${session.memberIds.length}): ${tallyText}.` +
      (result.decidedByChair ? ' Нерешен резултат — одлучио је глас председнице.' : '') +
      (comments.length ? ` ${comments.join(' ')}` : ''),
    impact: {},
    sessionId: session.id,
    conditions: review.conditions
      .filter((c) => c.text.trim())
      .map((c, i) => ({ id: `${id}-c${i + 1}`, text: c.text.trim(), ownerId: c.ownerId, dueDate: c.dueDate, done: false })),
    status: 'approved',
    isUserCreated: true,
  };
}

/* ------------------------------------------------------------------------------------------------
 * Minutes (Записник) model
 * ---------------------------------------------------------------------------------------------- */

export interface MinutesKpiRow {
  id: string;
  label: string;
  value: string;
  target: string;
  status: CheckStatus;
  delta?: string;
}

export interface MinutesData {
  session: BoardSession;
  project: Project | undefined;
  chair: Person | undefined;
  attendees: Person[];
  absent: Person[];
  quorum: number;
  agenda: string[];
  documents: { accepted: number; total: number; missing: ProjectDocument[]; caption: string };
  kpis: { caption: string; rows: MinutesKpiRow[] } | null;
  findings: Array<{ finding: AiFinding; disposition?: FindingDisposition }>;
  conditions: Array<Condition & { note?: string }>;
  votes: Array<{ person: Person; vote: MemberVote }> | null;
  outcome: BoardVote;
  /** Narrative conclusion. */
  text: string;
  /** Minutes generated in this demo from the gate review. */
  generated: boolean;
  completedAt?: string;
}

const kpiRow = (c: KpiCheck, value = c.kpi.current): MinutesKpiRow => ({
  id: c.def.id,
  label: c.def.shortLabel,
  value: formatKpi(c.def, value),
  target: formatKpi(c.def, c.kpi.target),
  status: kpiStatus(c.def.direction, value, c.kpi.target, GATE_TOLERANCE_PCT),
  delta: isEnergyClass(c.def)
    ? undefined
    : formatPct(((value - c.kpi.target) / Math.abs(c.kpi.target || 1)) * 100, { signed: true }),
});

/** Minutes of a held (seed) session. KPI snapshot = values at the end of the phase the gate closes, if recorded. */
export function minutesFromSeed(session: BoardSession): MinutesData {
  const project = getProject(session.projectId);
  const docs = sessionDocuments(session);
  const phase = GATE_CLOSES_PHASE[session.gate];
  const rows = kpiChecks(session.projectId).flatMap((c) => {
    const point = c.kpi.history.find((h) => h.phase === phase);
    return point ? [kpiRow(c, point.value)] : [];
  });
  return {
    session,
    project,
    chair: boardChair(),
    attendees: getPeople(session.memberIds),
    absent: [],
    quorum: quorumFor(session.memberIds.length),
    agenda: session.agenda,
    documents: {
      accepted: docs.length,
      total: docs.length,
      missing: [],
      caption: docs.length
        ? `Обавезна документа за капију: ${docs.length}.`
        : 'За ову капију нису била одређена обавезна документа.',
    },
    kpis: rows.length ? { caption: `Вредности на крају фазе ${PHASE_LABELS[phase].short} према циљевима пројекта`, rows } : null,
    findings: session.aiFindings.map((finding) => ({ finding })),
    conditions: session.conditions,
    votes: null,
    outcome: session.outcome === 'scheduled' ? 'approved' : session.outcome,
    text: session.minutes ?? '',
    generated: false,
  };
}

/** Minutes generated from a finished gate review. */
export function minutesFromReview(session: BoardSession, review: GateReviewState): MinutesData {
  const project = getProject(session.projectId);
  const docs = sessionDocuments(session);
  const checks = kpiChecks(session.projectId);
  const accepted = docs.filter((d) => review.documentMarks[d.id] === 'accepted');
  const missing = docs.filter((d) => review.documentMarks[d.id] !== 'accepted');
  const outcome = review.outcome ?? 'approved';
  const result = computeVotes(review.votes, review.presentIds, boardChair()?.id);
  const fails = checks.filter((c) => c.status === 'fail').length;
  const conditions = review.conditions.filter((c) => c.text.trim());
  const text =
    `Одбор је на седници одржаној ${formatDateGenitive(session.date)} размотрио капију ${GATE_LABELS[session.gate].full}` +
    `${project ? ` пројекта „${project.name}“` : ''}. Присутно чланова: ${review.presentIds.length} од ` +
    `${session.memberIds.length}, кворум је постојао. Документација је прихваћена за ревизију у ${accepted.length} од ` +
    `${docs.length} случајева` +
    (missing.length ? `; недостаје: ${missing.map((d) => d.title).join('; ')}` : '') +
    `. ${fails ? `${fails} ${fails === 1 ? 'показатељ не испуњава' : 'показатеља не испуњава'} праг капије.` : 'Сви показатељи испуњавају праг капије или су у толеранцији.'} ` +
    `Одлука: ${SESSION_OUTCOME_LABELS[outcome].toLocaleLowerCase('sr')}` +
    (conditions.length ? `, уз ${conditions.length} ${conditionsWord(conditions.length)} са носиоцима и роковима` : '') +
    `${result.decidedByChair ? ' (при нерешеном резултату одлучио је глас председнице)' : ''}.`;
  return {
    session,
    project,
    chair: boardChair(),
    attendees: getPeople(review.presentIds),
    absent: getPeople(session.memberIds.filter((id) => !review.presentIds.includes(id))),
    quorum: quorumFor(session.memberIds.length),
    agenda: session.agenda,
    documents: {
      accepted: accepted.length,
      total: docs.length,
      missing,
      caption: `Прихваћено за ревизију ${accepted.length} од ${docs.length} обавезних докумената.`,
    },
    kpis: { caption: `Праг капије = циљ пројекта, толеранција ${GATE_TOLERANCE_PCT} %`, rows: checks.map((c) => kpiRow(c)) },
    findings: session.aiFindings.map((finding) => ({ finding, disposition: review.findingDispositions[finding.id] })),
    conditions: conditions.map((c) => ({
      ...c,
      note: c.source === 'carried' ? `пренето са ${carriedFromLabel(c) ?? 'претходне капије'}` : undefined,
    })),
    votes: review.presentIds.flatMap((id) => {
      const person = getPerson(id);
      const vote = review.votes[id];
      return person && vote ? [{ person, vote }] : [];
    }),
    outcome,
    text,
    generated: true,
    completedAt: review.completedAt,
  };
}

/** Plain-text summary for „Копирај сажетак“. */
export function minutesSummary(m: MinutesData): string {
  const gate = GATE_LABELS[m.session.gate].full;
  const lines = [
    `АрхиБорд · Студио Градина — записник`,
    `${m.project?.name ?? ''} · ${gate} · ${formatDate(m.session.date, 'long')}`,
    `Одлука: ${SESSION_OUTCOME_LABELS[m.outcome]}`,
    `Присутни: ${m.attendees.map((p) => p.name).join(', ')}`,
  ];
  if (m.kpis) {
    const off = m.kpis.rows.filter((r) => r.status !== 'pass');
    lines.push(
      `KPI: ${m.kpis.rows.length - off.length} од ${m.kpis.rows.length} испуњава праг` +
        (off.length ? ` (одступа: ${off.map((r) => `${r.label} ${r.value}`).join(', ')})` : ''),
    );
  }
  if (m.conditions.length) {
    lines.push('Услови:');
    m.conditions.forEach((c, i) =>
      lines.push(`${i + 1}. ${c.text} — ${getPerson(c.ownerId)?.name ?? '—'}, рок до ${formatDateGenitive(c.dueDate)}`),
    );
  }
  if (m.findings.some((f) => f.disposition)) {
    lines.push(
      `АИ налази (демо): ` +
        m.findings
          .filter((f) => f.disposition)
          .map((f) => `${f.finding.title} — ${FINDING_DISPOSITION_DONE_LABELS[f.disposition!]}`)
          .join('; '),
    );
  }
  return lines.join('\n');
}
