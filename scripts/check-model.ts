#!/usr/bin/env node
/**
 * What-if model check: `npm run check:model` (exit 1 on any failure).
 *
 * Runs with Node's built-in TypeScript type stripping, like check-data.ts (imports seed modules directly).
 * Asserts:
 * 1. Every seed option is reproduced exactly (rounded DesignResults) when it is the calculator's anchor.
 * 2. One model explains the carbon of all seed options: with the PROJECT calibration (from the selected option) the
 *    embodied carbon of every other seed option is within ±1 kgCO₂e/m² (no hidden per-option carbon fudge).
 * 3. The flagship storyline: Б 358; Б with larch 329; with fibre-cement 340; + CEM III/A in cores 333 (dec-sk-09);
 *    larch triggers the fire warning above 22 m; EU Taxonomy fails only on the missing A1–C4 LCA.
 * 4. Projects without options reproduce their current KPIs; sanity of directions (insulation, PV, shading, cement).
 * Prints a calibration table (model with project calibration vs seed) for the build log.
 */
import { boardSessions } from '../src/data/sessions.ts';
import { decisions } from '../src/data/decisions.ts';
import { kpiDefinitions, projectKpis } from '../src/data/kpis.ts';
import { designOptions } from '../src/data/options.ts';
import { projects } from '../src/data/projects.ts';
import { sites } from '../src/data/sites.ts';
import {
  contributions,
  evaluate,
  optionCalibration,
  setupProjectModel,
  toDesignResults,
  type ProjectModel,
} from '../src/lib/carbonModel.ts';
import type { DesignParams, DesignResults } from '../src/domain/types.ts';

const problems: string[] = [];
const fail = (where: string, msg: string) => problems.push(`${where}: ${msg}`);
const r1 = (v: number) => Math.round(v * 10) / 10;

function modelFor(projectId: string): ProjectModel | null {
  const project = projects.find((p) => p.id === projectId)!;
  const site = sites.find((s) => s.projectId === projectId);
  const open = [
    ...boardSessions.filter((s) => s.projectId === projectId).flatMap((s) => s.conditions),
    ...decisions.filter((d) => d.projectId === projectId).flatMap((d) => d.conditions),
  ].filter((c) => !c.done);
  return setupProjectModel({
    project,
    hdd: site?.climate.hdd ?? 2600,
    kpis: projectKpis.filter((k) => k.projectId === projectId).map((k) => ({ kpiId: k.kpiId, current: k.current, first: k.history[0]?.value })),
    pedLimit: kpiDefinitions.find((d) => d.id === 'primary-energy')?.benchmarks.euTaxonomy,
    options: designOptions.filter((o) => o.projectId === projectId),
    openConditionTexts: open.map((c) => c.text),
  });
}

const CORE_KEYS: Array<keyof DesignResults> = ['embodiedCarbon', 'operationalEnergy', 'energyClass', 'costDeltaPct', 'certPoints', 'daylightPct', 'durationMonths'];

/* ---------- 1 + 2: seed options ---------- */
const table: string[] = [];
table.push('| Варијанта | EC seed | EC model | Qh seed / model | разред | Δ цена % | серт. | дн. светло | месеци |');
table.push('|---|---|---|---|---|---|---|---|---|');
for (const p of projects) {
  const model = modelFor(p.id);
  const opts = designOptions.filter((o) => o.projectId === p.id);
  if (!model) {
    if (p.typology !== 'javni-prostor') fail(p.id, 'building project without a model');
    continue;
  }
  for (const o of opts) {
    // 1. exact reproduction with the option as anchor
    const anchored = toDesignResults(evaluate(o.params, model.ctx, optionCalibration(model, o)));
    for (const k of CORE_KEYS) {
      const a = anchored[k];
      const b = o.results[k];
      const ok = typeof a === 'number' && typeof b === 'number' ? Math.abs(a - b) <= 0.05 : a === b;
      if (!ok) fail(`option ${o.id}`, `${k}: anchored model ${a} ≠ seed ${b}`);
    }
    // 2. project calibration only
    const m = evaluate(o.params, model.ctx, model.calibration);
    const res = m.embodiedCarbon - o.results.embodiedCarbon;
    if (Math.abs(res) > 1) fail(`option ${o.id}`, `embodied carbon residual ${r1(res)} kgCO₂e/m² > 1 with project calibration`);
    const d = toDesignResults(m);
    table.push(
      `| ${p.shortName} ${o.code}${o.status === 'selected' ? ' (изабрана)' : ''} | ${o.results.embodiedCarbon} | ${r1(m.embodiedCarbon)} | ` +
        `${o.results.operationalEnergy} / ${d.operationalEnergy} | ${o.results.energyClass} / ${d.energyClass} | ${o.results.costDeltaPct} / ${d.costDeltaPct} | ` +
        `${o.results.certPoints} / ${d.certPoints} | ${o.results.daylightPct} / ${d.daylightPct} | ${o.results.durationMonths} / ${d.durationMonths} |`,
    );
  }
  // 4. projects without options reproduce their current KPIs
  if (opts.length === 0) {
    const r = toDesignResults(evaluate(model.anchorParams, model.ctx, model.calibration));
    const k = (id: string) => projectKpis.find((x) => x.projectId === p.id && x.kpiId === id)?.current;
    if (r.embodiedCarbon !== k('embodied-carbon')) fail(p.id, `defaults EC ${r.embodiedCarbon} ≠ KPI ${k('embodied-carbon')}`);
    if (r.operationalEnergy !== k('operational-energy')) fail(p.id, `defaults Qh ${r.operationalEnergy} ≠ KPI ${k('operational-energy')}`);
    table.push(`| ${p.shortName} (без варијанти, KPI) | ${k('embodied-carbon')} | ${r.embodiedCarbon} | ${k('operational-energy')} / ${r.operationalEnergy} | ${r.energyClass} | — | ${r.certPoints} | ${r.daylightPct} | ${r.durationMonths} |`);
  }
}

/* ---------- 3: flagship storyline ---------- */
const sk = modelFor('savski-kej')!;
const b = sk.selected!.params;
const ec = (params: DesignParams) => evaluate(params, sk.ctx, sk.calibration).embodiedCarbon;
const story: Array<[string, DesignParams, number]> = [
  ['Б (алуминијум)', b, 358],
  ['Б + ариш', { ...b, cladding: 'aris' }, 329],
  ['Б + фибер-цемент', { ...b, cladding: 'fiber-cement' }, 340],
  ['Б + фибер-цемент + CEM III/A у језгрима', { ...b, cladding: 'fiber-cement', coreConcreteMix: 'cem-iii' }, 333],
];
const storyLines: string[] = [];
for (const [label, params, expected] of story) {
  const v = ec(params);
  storyLines.push(`  ${label}: ${r1(v)} (очекивано ${expected})`);
  if (Math.round(v) !== expected) fail('storyline', `${label} = ${r1(v)}, expected ${expected}`);
}
const larch = evaluate({ ...b, cladding: 'aris' }, sk.ctx, sk.calibration);
if (!larch.fire.warning) fail('storyline', 'larch cladding above 22 m must trigger the fire warning');
if (evaluate(b, sk.ctx, sk.calibration).fire.warning) fail('storyline', 'aluminium cladding must not trigger the fire warning');
const tax = evaluate(b, sk.ctx, sk.calibration).taxonomy;
if (tax.pass || tax.criteria.find((c) => c.id === 'ped')?.pass !== true || tax.criteria.find((c) => c.id === 'gwp')?.pass !== false)
  fail('storyline', 'flagship taxonomy must pass primary energy and fail only the A1–C4 disclosure');
const g2 = { ...b, cladding: 'fiber-cement' as const, coreConcreteMix: 'cem-iii' as const };
const parts = contributions(sk.ctx, sk.calibration, b, g2);
const sum = parts.reduce((s, c) => s + c.delta, 0);
if (Math.abs(sum - (ec(g2) - ec(b))) > 1e-6) fail('contributions', 'do not sum to the total change');
if (evaluate(g2, sk.ctx, sk.calibration).costDeltaPct >= evaluate(b, sk.ctx, sk.calibration).costDeltaPct)
  fail('storyline', 'fibre-cement proposal should be cheaper than aluminium (dec-sk-09)');

/* ---------- 4: directions ---------- */
const at = (params: DesignParams) => evaluate(params, sk.ctx, sk.calibration);
const checks: Array<[string, boolean]> = [
  ['више изолације → мање Qh', at({ ...b, insulationCm: 30 }).heatingNeed < at(b).heatingNeed],
  ['више PV → више угљеника, мање примарне енергије', at({ ...b, pvKwp: 300 }).embodiedCarbon > at(b).embodiedCarbon && at({ ...b, pvKwp: 300 }).primaryEnergy < at(b).primaryEnergy],
  ['спољна засена → мање прегревања', at({ ...b, shading: 'spoljna' }).overheatingHours < at(b).overheatingHours],
  ['више застакљења → више прегревања и дневног светла', at({ ...b, glazingRatio: 0.55 }).overheatingHours > at(b).overheatingHours && at({ ...b, glazingRatio: 0.55 }).daylightPct > at(b).daylightPct],
  ['CEM I → више угљеника од CEM III/A', at({ ...b, concreteMix: 'cem-i' }).embodiedCarbon > at(b).embodiedCarbon],
  ['рекуперација → мање Qh', at({ ...b, mvhr: true }).heatingNeed < at(b).heatingNeed],
  ['поновна употреба → мање угљеника', at({ ...b, reusedPct: 30 }).embodiedCarbon < at(b).embodiedCarbon],
];
for (const [label, ok] of checks) if (!ok) fail('direction', label);

/* ---------- report ---------- */
if (problems.length) {
  console.error(`✗ check:model — ${problems.length} problem(s):\n  ` + problems.join('\n  '));
  process.exit(1);
}
console.log('✓ check:model — every seed option reproduced; carbon explained by one model per project (±1 kgCO₂e/m²).');
console.log('  Flagship storyline (kgCO₂e/m², A1–A3):\n' + storyLines.join('\n'));
console.log(`  Г2 proposal contributions: ${parts.map((c) => `${c.label} ${r1(c.delta)}`).join(', ')}`);
console.log('  Model with project calibration (seed / model):\n' + table.map((l) => '  ' + l).join('\n'));
