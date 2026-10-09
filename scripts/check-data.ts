#!/usr/bin/env node
/**
 * Seed-data integrity check: `npm run check:data` (exit 1 on any problem).
 *
 * Runs with Node's built-in TypeScript type stripping (Node ≥ 22.18 / 23.6). It imports the individual seed
 * modules in src/data/ directly (not the barrel, which uses the `@/` alias) — seed modules may only contain
 * `import type` from `@/…`, which Node erases.
 *
 * Checks: unique ids, referential integrity (projects, people, documents, sessions, materials, regulations,
 * KPIs, options, decisions), value ranges (1–5 scales, 0–100 %), phase/date sequencing, team ↔ allocation
 * consistency, gate-document consistency, certification score ↔ project score, material passport ↔ embodied
 * carbon KPI, and mixed Cyrillic/Latin words in seed copy.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { PHASES } from '../src/domain/labels.ts';
import type { Phase } from '../src/domain/types.ts';
import { activity } from '../src/data/activity.ts';
import { attentionItems } from '../src/data/attention.ts';
import { certificationCriteria, certifications } from '../src/data/certification.ts';
import { decisions } from '../src/data/decisions.ts';
import { documents } from '../src/data/documents.ts';
import { kpiDefinitions, projectKpis } from '../src/data/kpis.ts';
import { materials, projectMaterials } from '../src/data/materials.ts';
import { designOptions } from '../src/data/options.ts';
import { people } from '../src/data/people.ts';
import { projects } from '../src/data/projects.ts';
import { regulations } from '../src/data/regulations.ts';
import { requirements } from '../src/data/requirements.ts';
import { risks } from '../src/data/risks.ts';
import { boardSessions } from '../src/data/sessions.ts';
import { sites } from '../src/data/sites.ts';
import { stakeholders } from '../src/data/stakeholders.ts';

const DEMO_TODAY = '2026-10-09';
const PROJECT_TABS = ['pregled', 'lokacija', 'ciljevi', 'varijante', 'sertifikacija', 'materijali', 'dokumenta', 'odluke', 'rizici', 'akteri', 'tim'];

const problems: string[] = [];
const fail = (where: string, msg: string) => problems.push(`${where}: ${msg}`);

/* ---------- helpers ---------- */
const ids = <T extends { id: string }>(list: readonly T[]) => new Set(list.map((x) => x.id));
function unique(name: string, list: ReadonlyArray<{ id: string }>) {
  const seen = new Set<string>();
  for (const { id } of list) {
    if (seen.has(id)) fail(name, `duplicate id '${id}'`);
    seen.add(id);
  }
}
const inRange = (v: number, min: number, max: number) => Number.isFinite(v) && v >= min && v <= max;
const isIsoDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
const isScale5 = (v: number) => Number.isInteger(v) && v >= 1 && v <= 5;
const phaseIdx = (p: Phase) => PHASES.indexOf(p);

const projectIds = ids(projects);
const personIds = ids(people);
const docIds = ids(documents);
const sessionIds = ids(boardSessions);
const materialIds = ids(materials);
const regulationIds = ids(regulations);
const kpiIds = new Set(kpiDefinitions.map((k) => k.id));
const boardIds = new Set(people.filter((p) => p.boardMember).map((p) => p.id));
const projectOf = (id: string) => projects.find((p) => p.id === id);
const docOf = (id: string) => documents.find((d) => d.id === id);

const refProject = (where: string, id: string) => projectIds.has(id) || fail(where, `unknown projectId '${id}'`);
const refPerson = (where: string, id: string) => personIds.has(id) || fail(where, `unknown personId '${id}'`);
const refDoc = (where: string, id: string, projectId?: string) => {
  const d = docOf(id);
  if (!d) return fail(where, `unknown documentId '${id}'`);
  if (projectId && d.projectId !== projectId) fail(where, `document '${id}' belongs to '${d.projectId}', not '${projectId}'`);
};
const refRegulation = (where: string, id: string) => regulationIds.has(id) || fail(where, `unknown regulationId '${id}'`);

/* ---------- unique ids ---------- */
unique('projects', projects);
unique('people', people);
unique('regulations', regulations);
unique('requirements', requirements);
unique('designOptions', designOptions);
unique('decisions', decisions);
unique('boardSessions', boardSessions);
unique('documents', documents);
unique('materials', materials);
unique('stakeholders', stakeholders);
unique('risks', risks);
unique('certificationCriteria', certificationCriteria);
unique('activity', activity);
unique('attentionItems', attentionItems);
unique('conditions', [...boardSessions.flatMap((s) => s.conditions), ...decisions.flatMap((d) => d.conditions)]);
unique('aiFindings', boardSessions.flatMap((s) => s.aiFindings));

/* ---------- projects & people ---------- */
for (const p of projects) {
  const w = `project ${p.id}`;
  refPerson(w, p.leadArchitectId);
  p.teamIds.forEach((id) => refPerson(w, id));
  if (!p.teamIds.includes(p.leadArchitectId)) fail(w, 'lead architect not in teamIds');
  if (!inRange(p.phaseProgress, 0, 1)) fail(w, 'phaseProgress not in 0..1');
  if (!inRange(p.coordinates.x, 0, 100) || !inRange(p.coordinates.y, 0, 100)) fail(w, 'coordinates not in 0..100');
  if (p.nextGate.date < DEMO_TODAY) fail(w, `nextGate ${p.nextGate.date} is in the past`);
  const s = boardSessions.find((x) => x.projectId === p.id && x.outcome === 'scheduled' && x.gate === p.nextGate.gate && x.date === p.nextGate.date);
  if (!s) fail(w, `no scheduled session matching nextGate ${p.nextGate.gate} ${p.nextGate.date}`);
  for (const id of p.teamIds) {
    const person = people.find((x) => x.id === id);
    if (person && !person.allocations.some((a) => a.projectId === p.id)) fail(w, `team member '${id}' has no allocation on the project`);
  }
  if (!sites.some((s2) => s2.projectId === p.id)) fail(w, 'missing SiteInfo');
}
for (const person of people) {
  const w = `person ${person.id}`;
  for (const a of person.allocations) {
    refProject(w, a.projectId);
    if (!inRange(a.pct, 0, 100)) fail(w, `allocation pct ${a.pct} not in 0..100`);
    const p = projectOf(a.projectId);
    if (p && !p.teamIds.includes(person.id)) fail(w, `allocated to '${a.projectId}' but not in its teamIds`);
  }
  if ([...person.initials].length !== 2) fail(w, 'initials must be 2 letters');
}
const overallocated = people.filter((p) => p.allocations.reduce((s, a) => s + a.pct, 0) > 100);

/* ---------- KPIs ---------- */
const seenKpi = new Set<string>();
for (const k of projectKpis) {
  const w = `projectKpi ${k.projectId}/${k.kpiId}`;
  refProject(w, k.projectId);
  if (!kpiIds.has(k.kpiId)) fail(w, 'unknown kpiId');
  const key = `${k.projectId}/${k.kpiId}`;
  if (seenKpi.has(key)) fail(w, 'duplicate project KPI');
  seenKpi.add(key);
  const p = projectOf(k.projectId);
  if (!k.history.length) fail(w, 'empty history');
  for (let i = 1; i < k.history.length; i++) {
    if (phaseIdx(k.history[i].phase) <= phaseIdx(k.history[i - 1].phase)) fail(w, 'history phases not strictly ordered');
  }
  const last = k.history[k.history.length - 1];
  if (p && last && last.phase !== p.phase) fail(w, `last history phase '${last.phase}' ≠ project phase '${p.phase}'`);
  if (last && last.value !== k.current) fail(w, `last history value ${last.value} ≠ current ${k.current}`);
  if (k.kpiId === 'energy-class')
    [k.target, k.current, ...k.history.map((h) => h.value)].forEach(
      (v) => (Number.isInteger(v) && inRange(v, 1, 8)) || fail(w, `energy class ${v} not an integer in 1..8`),
    );
  if (['renewable-share', 'green-area', 'daylight', 'stormwater-retention'].includes(k.kpiId))
    [k.target, k.current].forEach((v) => inRange(v, 0, 100) || fail(w, `% value ${v} not in 0..100`));
  if (k.kpiId === 'biotope-factor') [k.target, k.current].forEach((v) => inRange(v, 0, 1) || fail(w, `biotope factor ${v} not in 0..1`));
}

/* ---------- sites ---------- */
const seenSite = new Set<string>();
for (const s of sites) {
  const w = `site ${s.projectId}`;
  refProject(w, s.projectId);
  if (seenSite.has(s.projectId)) fail(w, 'duplicate SiteInfo');
  seenSite.add(s.projectId);
  if (![8, 16].includes(s.climate.windRose.length)) fail(w, 'wind rose must have 8 or 16 entries');
  const sum = s.climate.windRose.reduce((a, e) => a + e.freq, 0);
  if (sum > 100 || sum < 50) fail(w, `wind rose frequencies sum to ${sum}`);
  const pctParams = s.urbanParams.filter((u) => u.unit === '%');
  pctParams.forEach((u) => (inRange(u.limit, 0, 100) && inRange(u.design, 0, 100)) || fail(w, `urban param ${u.id} % out of range`));
}

/* ---------- requirements & regulations ---------- */
for (const r of requirements) {
  const w = `requirement ${r.id}`;
  refProject(w, r.projectId);
  if (r.regulationId) refRegulation(w, r.regulationId);
}
for (const r of regulations) {
  const w = `regulation ${r.id}`;
  r.appliesTo.projectIds?.forEach((id) => refProject(w, id));
  if (r.keyPoints.length < 3 || r.keyPoints.length > 6) fail(w, `keyPoints count ${r.keyPoints.length} not in 3..6`);
}

/* ---------- options ---------- */
for (const o of designOptions) {
  const w = `option ${o.id}`;
  refProject(w, o.projectId);
  if (o.createdBy) refPerson(w, o.createdBy);
  if (!inRange(o.params.glazingRatio, 0, 1)) fail(w, 'glazingRatio not in 0..1');
  if (!inRange(o.params.reusedPct, 0, 100)) fail(w, 'reusedPct not in 0..100');
  if (o.params.greenRoofPct !== undefined && !inRange(o.params.greenRoofPct, 0, 100)) fail(w, 'greenRoofPct not in 0..100');
  if (!inRange(o.results.daylightPct, 0, 100)) fail(w, 'daylightPct not in 0..100');
}
for (const p of projects) {
  const selected = designOptions.filter((o) => o.projectId === p.id && o.status === 'selected');
  if (selected.length > 1) fail(`project ${p.id}`, 'more than one selected option');
  const sel = selected[0];
  const ec = projectKpis.find((k) => k.projectId === p.id && k.kpiId === 'embodied-carbon');
  if (sel && ec && sel.results.embodiedCarbon !== ec.current)
    fail(`option ${sel.id}`, `selected option carbon ${sel.results.embodiedCarbon} ≠ KPI ${ec.current}`);
}

/* ---------- conditions (shared) ---------- */
const checkConditions = (w: string, list: Array<{ id: string; ownerId: string; dueDate: string }>) =>
  list.forEach((c) => {
    refPerson(`${w} condition ${c.id}`, c.ownerId);
    if (!isIsoDate(c.dueDate)) fail(`${w} condition ${c.id}`, `bad dueDate '${c.dueDate}'`);
  });

/* ---------- decisions ---------- */
for (const d of decisions) {
  const w = `decision ${d.id}`;
  refProject(w, d.projectId);
  if (!isIsoDate(d.date)) fail(w, 'bad date');
  if (d.status !== 'proposed' && d.date > DEMO_TODAY) fail(w, 'approved decision dated in the future');
  if (d.sessionId) {
    const s = boardSessions.find((x) => x.id === d.sessionId);
    if (!s) fail(w, `unknown sessionId '${d.sessionId}'`);
    else if (s.projectId !== d.projectId) fail(w, `session '${s.id}' belongs to another project`);
  }
  d.decidedByIds?.forEach((id) => refPerson(w, id));
  if (!d.sessionId && !d.decidedByIds?.length) fail(w, 'needs sessionId or decidedByIds');
  if (d.optionId) {
    const o = designOptions.find((x) => x.id === d.optionId);
    if (!o) fail(w, `unknown optionId '${d.optionId}'`);
    else if (o.projectId !== d.projectId) fail(w, 'option belongs to another project');
  }
  checkConditions(w, d.conditions);
}

/* ---------- sessions ---------- */
for (const s of boardSessions) {
  const w = `session ${s.id}`;
  refProject(w, s.projectId);
  if (!isIsoDate(s.date)) fail(w, 'bad date');
  s.memberIds.forEach((id) => {
    refPerson(w, id);
    if (personIds.has(id) && !boardIds.has(id)) fail(w, `member '${id}' is not a board member`);
  });
  s.requiredDocumentIds.forEach((id) => refDoc(w, id, s.projectId));
  checkConditions(w, s.conditions);
  for (const f of s.aiFindings) {
    if (f.documentId) refDoc(`${w} finding ${f.id}`, f.documentId, s.projectId);
    if (f.regulationId) refRegulation(`${w} finding ${f.id}`, f.regulationId);
  }
  if (s.outcome === 'scheduled') {
    if (s.date < DEMO_TODAY) fail(w, 'scheduled session in the past');
    const gateDocs = documents.filter((d) => d.projectId === s.projectId && d.requiredForGates.includes(s.gate)).map((d) => d.id).sort();
    const req = [...s.requiredDocumentIds].sort();
    if (gateDocs.join() !== req.join()) fail(w, `requiredDocumentIds ≠ documents with requiredForGates ${s.gate}`);
  } else {
    if (s.date > DEMO_TODAY) fail(w, 'held session dated in the future');
    if (!s.minutes) fail(w, 'held session without minutes');
  }
}

/* ---------- documents ---------- */
for (const d of documents) {
  const w = `document ${d.id}`;
  refProject(w, d.projectId);
  refPerson(w, d.ownerId);
  if (d.updated > DEMO_TODAY) fail(w, 'updated in the future');
  if (!d.history.length) fail(w, 'empty history');
  const last = d.history[d.history.length - 1];
  if (last && last.version !== d.version) fail(w, `last history version '${last.version}' ≠ version '${d.version}'`);
  if (last && last.date !== d.updated) fail(w, `last history date ${last.date} ≠ updated ${d.updated}`);
  for (let i = 1; i < d.history.length; i++) if (d.history[i].date < d.history[i - 1].date) fail(w, 'history not chronological');
}

/* ---------- materials ---------- */
for (const m of materials) {
  const w = `material ${m.id}`;
  if (!inRange(m.recycledPct, 0, 100)) fail(w, 'recycledPct not in 0..100');
  if (m.distanceKm < 0) fail(w, 'negative distance');
  if (!(m.gwpA1A3 >= 0)) fail(w, 'gwpA1A3 must be ≥ 0 (fossil, no biogenic credit)');
}
for (const pm of projectMaterials) {
  const w = `projectMaterial ${pm.projectId}/${pm.materialId}/${pm.element}`;
  refProject(w, pm.projectId);
  if (!materialIds.has(pm.materialId)) fail(w, `unknown materialId '${pm.materialId}'`);
  if (!(pm.quantity > 0)) fail(w, 'quantity must be > 0');
}
// Passport total ↔ embodied-carbon KPI (±2 %).
for (const p of projects) {
  const rows = projectMaterials.filter((x) => x.projectId === p.id);
  const ec = projectKpis.find((k) => k.projectId === p.id && k.kpiId === 'embodied-carbon');
  const area = p.gfaM2 ?? p.siteAreaM2;
  if (!rows.length || !ec || !area) continue;
  const total = rows.reduce((s, r) => s + (materials.find((m) => m.id === r.materialId)?.gwpA1A3 ?? 0) * r.quantity, 0);
  const perM2 = total / area;
  if (Math.abs(perM2 - ec.current) / ec.current > 0.02)
    fail(`passport ${p.id}`, `Σ GWP / area = ${perM2.toFixed(1)} vs KPI ${ec.current} (> 2 % apart)`);
}

/* ---------- stakeholders & risks ---------- */
for (const s of stakeholders) {
  const w = `stakeholder ${s.id}`;
  refProject(w, s.projectId);
  if (!isScale5(s.influence) || !isScale5(s.interest)) fail(w, 'influence/interest not in 1..5');
  s.log.forEach((e) => (e.date <= DEMO_TODAY && isIsoDate(e.date)) || fail(w, `log date ${e.date} invalid or in the future`));
}
for (const r of risks) {
  const w = `risk ${r.id}`;
  refProject(w, r.projectId);
  refPerson(w, r.ownerId);
  if (!isScale5(r.probability) || !isScale5(r.impact)) fail(w, 'probability/impact not in 1..5');
}

/* ---------- certification ---------- */
const seenCert = new Set<string>();
for (const c of certifications) {
  const w = `certification ${c.projectId}`;
  refProject(w, c.projectId);
  if (seenCert.has(c.projectId)) fail(w, 'duplicate tracker');
  seenCert.add(c.projectId);
  const p = projectOf(c.projectId);
  if (p && p.certification.scheme !== c.scheme) fail(w, `scheme ${c.scheme} ≠ project scheme ${p.certification.scheme}`);
  const wsum = c.categories.reduce((s, x) => s + x.weight, 0);
  if (Math.abs(wsum - 100) > 0.5) fail(w, `category weights sum to ${wsum}`);
  for (const cat of c.categories) {
    if (cat.targeted > cat.max || cat.achieved + cat.atRisk > cat.max || cat.achieved < 0 || cat.atRisk < 0)
      fail(w, `category ${cat.id} points inconsistent`);
  }
  c.thresholds.forEach((t) => inRange(t.min, 0, 100) || fail(w, `threshold ${t.label} not in 0..100`));
  if (p) {
    const weighted = c.categories.reduce((s, x) => s + (x.weight * x.achieved) / x.max, 0);
    const score = p.certification.currentScore;
    if (c.scheme === 'LEED') {
      const pts = c.categories.reduce((s, x) => s + x.achieved, 0);
      if (pts !== score) fail(w, `LEED achieved points ${pts} ≠ project score ${score}`);
    } else if (c.scheme === 'EDGE') {
      const energy = c.categories.find((x) => x.id === 'energy');
      if (!energy || energy.achieved !== score) fail(w, `EDGE energy savings ≠ project score ${score}`);
    } else if (Math.abs(weighted - score) > 1) {
      fail(w, `weighted score ${weighted.toFixed(1)} ≠ project score ${score}`);
    }
  }
}
for (const cr of certificationCriteria) {
  const w = `criterion ${cr.id}`;
  refProject(w, cr.projectId);
  refPerson(w, cr.ownerId);
  const tracker = certifications.find((c) => c.projectId === cr.projectId);
  if (!tracker?.categories.some((x) => x.id === cr.categoryId)) fail(w, `unknown categoryId '${cr.categoryId}'`);
  if (cr.evidenceDocumentId) refDoc(w, cr.evidenceDocumentId, cr.projectId);
}

/* ---------- activity & attention ---------- */
for (const a of activity) {
  const w = `activity ${a.id}`;
  refProject(w, a.projectId);
  refPerson(w, a.actorId);
  if (a.date.slice(0, 10) > DEMO_TODAY) fail(w, 'dated in the future');
}
for (const a of attentionItems) {
  const w = `attention ${a.id}`;
  refProject(w, a.projectId);
  if (a.tab && !PROJECT_TABS.includes(a.tab)) fail(w, `unknown tab '${a.tab}'`);
}

/* ---------- content invariants for the demo storyline ---------- */
if (!sessionIds.has('ses-sk-g2')) fail('storyline', "missing flagship session 'ses-sk-g2'");
const healths = projects.map((p) => p.health);
if (!healths.includes('off-track') || healths.filter((h) => h === 'at-risk').length < 2) fail('storyline', 'need ≥1 off-track and ≥2 at-risk projects');
if (overallocated.length < 2) fail('storyline', 'need ≥2 overallocated people');

/* ---------- mixed-script words in seed copy ---------- */
const DATA_DIR = new URL('../src/data/', import.meta.url).pathname;
const MIXED = /[A-Za-z]+[Ѐ-ӿ]+|[Ѐ-ӿ]+[A-Za-z]+/g;
for (const f of readdirSync(DATA_DIR).filter((n) => n.endsWith('.ts'))) {
  readFileSync(join(DATA_DIR, f), 'utf8')
    .split('\n')
    .forEach((line, i) => {
      const m = line.match(MIXED);
      if (m) fail(`src/data/${f}:${i + 1}`, `mixed Cyrillic/Latin word(s): ${m.join(', ')}`);
    });
}

/* ---------- report ---------- */
if (problems.length) {
  console.error(`✗ check:data — ${problems.length} problem(s):\n  ` + problems.join('\n  '));
  process.exit(1);
}
const count = (pid: string) => ({
  req: requirements.filter((r) => r.projectId === pid).length,
  doc: documents.filter((r) => r.projectId === pid).length,
  dec: decisions.filter((r) => r.projectId === pid).length,
  risk: risks.filter((r) => r.projectId === pid).length,
  st: stakeholders.filter((r) => r.projectId === pid).length,
});
console.log(
  `✓ check:data — ${projects.length} projects, ${people.length} people (${overallocated.length} overallocated), ` +
    `${kpiDefinitions.length} KPI defs / ${projectKpis.length} project KPIs, ${regulations.length} regulations, ` +
    `${requirements.length} requirements, ${designOptions.length} options, ${decisions.length} decisions, ` +
    `${boardSessions.length} sessions, ${documents.length} documents, ${materials.length} materials / ` +
    `${projectMaterials.length} passport rows, ${stakeholders.length} stakeholders, ${risks.length} risks, ` +
    `${certificationCriteria.length} criteria, ${activity.length} activity, ${attentionItems.length} attention items.`,
);
console.log('  flagship savski-kej:', count('savski-kej'));
