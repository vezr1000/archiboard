import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ChevronUp, RotateCcw, Save, Send, Sparkles } from 'lucide-react';
import type { DivergingDatum } from '@/components/charts';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { paths } from '@/components/layout/navigation';
import { useReducedMotion } from '@/components/ai/useReducedMotion';
import { Badge, Button, Callout, EnergyClassBadge } from '@/components/ui';
import { TONE_CLASSES } from '@/components/ui/tone';
import { CURRENT_USER_ID, nextSessionForProject } from '@/data';
import { GATE_LABELS } from '@/domain/labels';
import type { DesignOption, DesignParams, Project } from '@/domain/types';
import {
  contributions as computeContributions,
  evaluate,
  optionCalibration,
  PARAM_LABELS,
  resolveParams,
  toDesignResults,
  type FullParams,
  type ParamKey,
  type ProjectModel,
} from '@/lib/carbonModel';
import { cn } from '@/lib/cn';
import { formatDate, formatNumber, formatSigned } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';
import { CalculatorControls } from './CalculatorControls';
import { CalculatorDetails, CalculatorResults, TaxonomyChip, type ResultsTargets } from './CalculatorResults';
import { HowWeCalculate } from './HowWeCalculate';
import { buildProposal, changeSummary, nextOptionCode, paramsEqual, paramValueLabel } from './optionsLogic';
import { ProposeSheet, SaveOptionSheet } from './CalculatorSheets';
import { projectTargets } from './useProjectModel';

export interface CalcState {
  params: FullParams;
  /** Option whose calibration is used (loaded preset); undefined = project calibration. */
  anchorId?: string;
}

interface WhatIfCalculatorProps {
  project: Project;
  model: ProjectModel;
  options: DesignOption[];
  calc: CalcState;
  setCalc: (next: CalcState) => void;
}

interface Preset {
  id: string;
  label: string;
  title: string;
  params: DesignParams;
  anchorId?: string;
}

type Notice = { kind: 'saved'; name: string } | { kind: 'proposed'; title: string; sessionId?: string; sessionLabel?: string } | null;

/** ★ „Шта ако?“ калкулатор — live what-if model with presets, results, contributions and save/propose actions. */
export function WhatIfCalculator({ project, model, options, calc, setCalc }: WhatIfCalculatorProps) {
  const { ctx } = model;
  const addUserOption = useAppStore((s) => s.addUserOption);
  const addUserDecision = useAppStore((s) => s.addUserDecision);
  const reduced = useReducedMotion();
  const [saveOpen, setSaveOpen] = useState(false);
  const [proposeOpen, setProposeOpen] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  /* ---- reference (selected option or current project state) ---- */
  const selected = model.selected;
  const refParams = model.anchorParams;
  const refLabel = selected ? `варијанту ${selected.code ?? ''}`.trim() : 'тренутно стање';
  const refName = selected ? selected.name : 'Тренутно стање пројекта';
  const reference = useMemo(() => evaluate(refParams, ctx, model.calibration), [refParams, ctx, model.calibration]);

  /* ---- current result ---- */
  const anchor = options.find((o) => o.id === calc.anchorId);
  const cal = useMemo(() => (anchor ? optionCalibration(model, anchor) : model.calibration), [anchor, model]);
  const result = useMemo(() => evaluate(calc.params, ctx, cal), [calc.params, ctx, cal]);

  const contributionData = useMemo(() => {
    const from = resolveParams(refParams);
    const items: DivergingDatum[] = computeContributions(ctx, cal, refParams, calc.params).map((c) => ({
      id: c.key as string,
      label: c.label,
      value: c.delta,
      sublabel: `${paramValueLabel(c.key, from)} → ${paramValueLabel(c.key, calc.params)}`,
    }));
    // A loaded option keeps its own small residual — show it so the bars always add up to the total.
    const residual = cal.carbon - model.calibration.carbon;
    if (Math.abs(residual) >= 0.5) items.push({ id: 'kalibracija', label: 'Одступање учитане варијанте', value: residual, sublabel: 'калибрација на податке варијанте' });
    return items;
  }, [ctx, cal, refParams, calc.params, model.calibration.carbon]);

  /* ---- targets & scales ---- */
  const kpiTargets = projectTargets(project.id);
  const targets: ResultsTargets = {
    ...kpiTargets,
    cert: project.certification.scheme === 'none' ? undefined : project.certification.targetScore,
    pedLimit: ctx.taxonomy.pedLimit,
  };
  const ringMax = useMemo(() => {
    const top = Math.max(kpiTargets.carbon ?? 0, reference.embodiedCarbon, ...options.map((o) => o.results.embodiedCarbon));
    return Math.ceil((top * 1.3) / 50) * 50;
  }, [kpiTargets.carbon, reference.embodiedCarbon, options]);
  const pvMax = useMemo(() => {
    const maxPv = Math.max(resolveParams(refParams).pvKwp, ...options.map((o) => o.params.pvKwp));
    return Math.ceil(Math.max(ctx.gfaM2 * 0.015, maxPv * 1.5, 50) / 50) * 50;
  }, [ctx.gfaM2, refParams, options]);

  /* ---- presets ---- */
  const presets: Preset[] = useMemo(() => {
    const list: Preset[] = options.map((o) => ({
      id: o.id,
      label: o.code ?? '•',
      title: o.name,
      params: o.params,
      anchorId: o.id,
    }));
    if (!selected) {
      list.unshift({ id: 'current', label: 'Тренутно стање', title: 'Тренутно стање пројекта (калибрисано на KPI)', params: refParams });
    }
    // Блок 42: the design before the contractor's substitutions (CEM III/A in slabs, PV 180 kWp) — KPI note.
    if (project.id === 'blok-42') {
      list.push({
        id: 'pre-zamena',
        label: 'Пре замена извођача (CEM III/A, PV 180 kWp)',
        title: 'Пројектовано стање пре замена: CEM III/A у таваницама и PV 180 kWp',
        params: { ...refParams, coreConcreteMix: 'cem-iii', pvKwp: 180 },
      });
    }
    if (project.id === 'savski-kej' && selected) {
      list.push({
        id: 'g2',
        label: 'Предлог за Г2 (фибер-цемент + CEM III)',
        title: 'Предлог за Г2: фибер-цементне плоче уместо алуминијума и CEM III/A у језгрима (одлука dec-sk-09)',
        params: { ...selected.params, cladding: 'fiber-cement', coreConcreteMix: 'cem-iii' },
        anchorId: selected.id,
      });
    }
    return list;
  }, [options, project.id, selected, refParams]);
  const isActive = (p: Preset) => p.anchorId === calc.anchorId && paramsEqual(p.params, calc.params);
  const applyPreset = (p: Preset) => {
    setNotice(null);
    setCalc({ params: resolveParams(p.params), anchorId: p.anchorId });
  };
  const reset = () => {
    setNotice(null);
    setCalc({ params: resolveParams(refParams), anchorId: selected?.id });
  };
  const dirty = !paramsEqual(calc.params, refParams) || calc.anchorId !== selected?.id;

  /* ---- mobile sticky bar visibility ---- */
  const controlsRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [resultsVisible, setResultsVisible] = useState(true);
  useEffect(() => {
    const c = controlsRef.current;
    const r = resultsRef.current;
    if (!c || !r || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === c) setControlsVisible(e.isIntersecting);
        if (e.target === r) setResultsVisible(e.isIntersecting);
      }
    });
    io.observe(c);
    io.observe(r);
    return () => io.disconnect();
  }, []);
  const showBar = controlsVisible && !resultsVisible;
  const scrollToResults = () => resultsRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });

  /* ---- save / propose ---- */
  const savedMatch = options.find((o) => o.isUserCreated && paramsEqual(o.params, calc.params));
  const byImpact = [...contributionData].sort((a, b) => Math.abs(b.value) - Math.abs(a.value)).map((c) => c.id as ParamKey);
  const defaultName = changeSummary(refParams, calc.params, 3, byImpact);
  const session = nextSessionForProject(project.id);
  const sessionLabel = session ? `${GATE_LABELS[session.gate].full}, ${formatDate(session.date, 'day-month')}` : undefined;

  const saveOption = (name: string, summary: string): DesignOption => {
    const code = nextOptionCode(options);
    const option: DesignOption = {
      id: `opt-user-${Date.now().toString(36)}`,
      projectId: project.id,
      name: `Варијанта ${code} — ${name}`,
      code,
      summary,
      params: { ...calc.params },
      results: toDesignResults(result),
      status: 'proposed',
      createdBy: CURRENT_USER_ID,
      createdAt: new Date().toISOString().slice(0, 10),
      isUserCreated: true,
    };
    addUserOption(option);
    return option;
  };

  const onSave = (name: string, summary: string) => {
    const o = saveOption(name, summary);
    setCalc({ params: calc.params, anchorId: o.id });
    setSaveOpen(false);
    setNotice({ kind: 'saved', name: o.name });
  };

  const onPropose = (title: string, alsoSave: boolean) => {
    let optionId = savedMatch?.id;
    let optionName = savedMatch?.name ?? `Нова варијанта — ${defaultName}`;
    if (!savedMatch && alsoSave) {
      const o = saveOption(defaultName, autoSummary());
      optionId = o.id;
      optionName = o.name;
      setCalc({ params: calc.params, anchorId: o.id });
    }
    const decision = buildProposal({
      projectId: project.id,
      title,
      optionName,
      referenceName: refName,
      referenceLabel: refLabel,
      refParams,
      params: calc.params,
      result,
      reference,
      carbonTarget: kpiTargets.carbon,
      contributions: contributionData.map((c) => ({ label: c.label, delta: c.value })),
      paramLabels: PARAM_LABELS,
      session,
      optionId,
    });
    addUserDecision(decision);
    setProposeOpen(false);
    setNotice({ kind: 'proposed', title, sessionId: session?.id, sessionLabel });
  };

  const autoSummary = () => {
    const ec = Math.round(result.embodiedCarbon);
    const d = ec - Math.round(reference.embodiedCarbon);
    return (
      `Из калкулатора: ${defaultName}. Уграђени угљеник ${ec} kgCO₂e/m² (${formatSigned(d, 0)} у односу на ${refLabel}), ` +
      `Qh,nd ${Math.round(result.heatingNeed)} kWh/m²a, разред ${result.energyClass}.`
    );
  };

  const ec = Math.round(result.embodiedCarbon);
  const dEc = ec - Math.round(reference.embodiedCarbon);

  return (
    <section id="kalkulator" className="scroll-mt-4" aria-labelledby="kalkulator-naslov">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="eyebrow flex items-center gap-1.5 text-clay">
            <Sparkles className="size-3.5" aria-hidden /> Шта ако?
          </div>
          <h3 id="kalkulator-naslov" className="font-display text-xl text-ink md:text-2xl">
            Калкулатор угљеника и енергије
          </h3>
          <p className="mt-0.5 text-sm text-muted">Померите параметре — резултати, разред и усклађеност се рачунају одмах.</p>
        </div>
        <Badge tone="warn" variant="outline">
          Демо модел
        </Badge>
      </div>

      {/* presets */}
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none md:mx-0 md:flex-wrap md:px-0" role="group" aria-label="Учитај варијанту">
        {presets.map((p) => (
          <button
            key={p.id}
            type="button"
            title={p.title}
            onClick={() => applyPreset(p)}
            aria-pressed={isActive(p)}
            className={cn(
              'inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium whitespace-nowrap transition-colors',
              isActive(p) ? 'border-accent bg-accent text-accent-ink' : 'border-line bg-surface text-ink hover:border-line-strong',
            )}
          >
            {p.id === 'g2' || p.id === 'pre-zamena' ? (
              <Sparkles className="size-4" aria-hidden />
            ) : p.id === 'current' ? null : (
              <span className="text-xs opacity-70">Варијанта</span>
            )}
            {p.label}
          </button>
        ))}
        <button
          type="button"
          onClick={reset}
          disabled={!dirty}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted hover:text-ink disabled:opacity-40"
        >
          <RotateCcw className="size-4" aria-hidden /> Поништи
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
        <div ref={controlsRef} className="min-w-0 lg:col-span-5">
          <button
            type="button"
            onClick={scrollToResults}
            className="mb-3 inline-flex h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 text-sm font-medium text-accent hover:border-line-strong lg:hidden"
          >
            Резултати <ArrowDown className="size-4" aria-hidden />
          </button>
          <CalculatorControls
            params={calc.params}
            refParams={refParams}
            onChange={(patch) => {
              setNotice(null);
              setCalc({ params: { ...calc.params, ...patch }, anchorId: calc.anchorId });
            }}
            pvMax={pvMax}
            topFloorLevelM={ctx.topFloorLevelM}
          />
        </div>

        <div className="min-w-0 lg:col-span-7">
          <div
            ref={resultsRef}
            className="scroll-mt-4 rounded-2xl border border-line bg-surface p-4 md:p-5 lg:sticky lg:top-6 lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-lg text-ink">Резултати</h4>
              <span className="text-xs text-muted">поређење са: {refName}</span>
            </div>
            <CalculatorResults
              result={result}
              reference={reference}
              referenceLabel={refLabel}
              targets={targets}
              scheme={project.certification.scheme}
              ringMax={ringMax}
              contributions={contributionData}
              qhMax={cal.classShift === 0 ? ctx.profile.qhMax : undefined}
              fireNote={project.id === 'savski-kej' ? 'Управо због овог правила је облога од ариша у јуну 2026. замењена алуминијумом (одлука од 17. јуна).' : undefined}
            />
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Button variant="secondary" icon={Save} onClick={() => setSaveOpen(true)} fullWidth>
                Сачувај као варијанту
              </Button>
              <Button icon={Send} onClick={() => setProposeOpen(true)} fullWidth disabled={!dirty && !calc.anchorId}>
                Предложи одбору
              </Button>
            </div>
            {notice && (
              <Callout
                className="mt-3 animate-fade-in"
                tone="good"
                title={notice.kind === 'saved' ? 'Варијанта је сачувана' : 'Предлог је послат одбору'}
              >
                {notice.kind === 'saved' ? (
                  <>„{notice.name}“ је додата у поређење варијанти на врху странице.</>
                ) : (
                  <>
                    Нацрт одлуке „{notice.title}“ је у дневнику одлука
                    {notice.sessionLabel && <> и уврштен у седницу {notice.sessionLabel}</>}.
                    <span className="mt-2 flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" to={paths.project(project.id, 'odluke')}>
                        Отвори одлуке
                      </Button>
                      {notice.sessionId && (
                        <Button size="sm" variant="ghost" to={paths.session(notice.sessionId)}>
                          Седница одбора
                        </Button>
                      )}
                    </span>
                  </>
                )}
              </Callout>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 lg:mt-6">
        <CalculatorDetails result={result} reference={reference} targets={targets} scheme={project.certification.scheme} />
      </div>

      <div className="mt-4">
        <HowWeCalculate ctx={ctx} carbonOffset={model.calibration.carbon} />
      </div>

      <FeedbackWidget moduleId="varijante-kalkulator" compact question="Да ли бисте користили калкулатор „шта ако?“ на својим пројектима?" />

      {/* Spacer so the sticky bar never covers the last content on phones. */}
      <div className="h-16 lg:hidden" aria-hidden />

      {/* ---- mobile sticky results bar ---- */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 px-3 pb-2 transition-[transform,opacity] duration-200 lg:hidden',
          showBar ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
        )}
        aria-hidden={!showBar}
      >
        <button
          type="button"
          onClick={scrollToResults}
          tabIndex={showBar ? 0 : -1}
          className="mx-auto flex w-full max-w-xl items-center gap-3 rounded-2xl border border-line bg-surface/95 px-3 py-2 text-left shadow-pop backdrop-blur-md"
          aria-label={`Резултати: ${ec} kgCO₂e/m², разред ${result.energyClass}`}
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[0.68rem] text-muted">Угљеник A1–A3</span>
            <span className="flex items-baseline gap-1.5">
              <span className="tabular font-display text-lg font-semibold text-ink">{formatNumber(ec, 0)}</span>
              <span className="text-[0.68rem] text-muted">kgCO₂e/m²</span>
              {dEc !== 0 && (
                <span className={cn('tabular text-xs font-semibold', TONE_CLASSES[dEc < 0 ? 'good' : 'bad'].text)}>{formatSigned(dEc, 0)}</span>
              )}
            </span>
          </span>
          <EnergyClassBadge value={result.energyClass} size="md" animate />
          <TaxonomyChip result={result} compact />
          <ChevronUp className="size-5 shrink-0 text-muted" aria-hidden />
        </button>
      </div>

      <SaveOptionSheet
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        defaultName={defaultName}
        defaultSummary={autoSummary()}
        code={nextOptionCode(options)}
        onSave={onSave}
      />
      <ProposeSheet
        open={proposeOpen}
        onClose={() => setProposeOpen(false)}
        defaultTitle={`Предлог: ${defaultName}`}
        preview={{
          carbon: ec,
          carbonDeltaPct: reference.embodiedCarbon ? ((result.embodiedCarbon - reference.embodiedCarbon) / reference.embodiedCarbon) * 100 : 0,
          energyClass: result.energyClass,
          costDeltaPp: result.costDeltaPct - reference.costDeltaPct,
          taxonomyPass: result.taxonomy.pass,
          fireWarning: result.fire.warning,
          referenceLabel: refLabel,
        }}
        sessionLabel={sessionLabel}
        alreadySaved={Boolean(savedMatch)}
        onPropose={onPropose}
      />
    </section>
  );
}
