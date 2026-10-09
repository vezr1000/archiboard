import { useState } from 'react';
import { Trees } from 'lucide-react';
import { useReducedMotion } from '@/components/ai/useReducedMotion';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { paths } from '@/components/layout/navigation';
import { Button, Callout, EmptyState, SectionHeader } from '@/components/ui';
import type { DesignOption, Project } from '@/domain/types';
import { useCurrentProject } from '@/features/project/useCurrentProject';
import { resolveParams } from '@/lib/carbonModel';
import { useAppStore } from '@/store/useAppStore';
import { useProjectOptions } from '@/store/selectors';
import { OptionComparison } from './OptionComparison';
import { useProjectModel } from './useProjectModel';
import { WhatIfCalculator, type CalcState } from './WhatIfCalculator';

/**
 * `/projekti/:id/varijante` — option comparison + ★ what-if calculator (CONCEPT §6.5).
 * Building projects: comparison (seed + saved options) and the calculator calibrated to the project.
 * Park: a calm „калкулатор је за зграде“ state, no fake building parameters.
 */
export function OptionsTab() {
  const project = useCurrentProject();
  // Fresh calculator state per project (the route element is reused when switching projects).
  return <OptionsTabBody key={project.id} project={project} />;
}

function OptionsTabBody({ project }: { project: Project }) {
  const model = useProjectModel(project);
  const options = useProjectOptions(project.id);
  const removeUserOption = useAppStore((s) => s.removeUserOption);
  const reduced = useReducedMotion();
  const [calc, setCalc] = useState<CalcState | null>(() =>
    model ? { params: resolveParams(model.anchorParams), anchorId: model.selected?.id } : null,
  );

  const load = (o: DesignOption) => {
    setCalc({ params: resolveParams(o.params), anchorId: o.id });
    document.getElementById('kalkulator')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };
  const remove = (o: DesignOption) => {
    removeUserOption(o.id);
    if (calc?.anchorId === o.id && model) setCalc({ params: calc.params, anchorId: model.selected?.id });
  };

  const comparison = (
    <section aria-labelledby="poredjenje">
      <SectionHeader
        title={<span id="poredjenje">Поређење варијанти</span>}
        subtitle={
          options.length > 0
            ? `${options.length} ${options.length === 1 ? 'варијанта' : options.length < 5 ? 'варијанте' : 'варијанти'} · вредности A1–A3 и Qh,nd по m² БРГП`
            : undefined
        }
      />
      <OptionComparison project={project} options={options} activeId={calc?.anchorId} onLoad={load} onDelete={remove} />
    </section>
  );

  if (!model || !calc) {
    return (
      <div className="flex flex-col gap-6">
        <EmptyState
          icon={Trees}
          title="Калкулатор је за зграде"
          description={
            <>
              {project.name} је јавни простор: вреднује се кроз задржавање атмосферских вода, фактор биотопа и зелене површине, а не кроз конструкцију,
              омотач и енергетски разред. Модел угљеника и енергије се зато овде не примењује.
            </>
          }
          action={
            <Button variant="secondary" to={paths.project(project.id, 'ciljevi')}>
              Циљеви и KPI парка
            </Button>
          }
        />
        {options.length > 0 && comparison}
        <FeedbackWidget moduleId="projekat-varijante" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {comparison}
      {project.phase === 'gradnja' && (
        <Callout tone="info" title="Пројекат је у градњи">
          Калкулатор полази од изведеног стања калибрисаног на тренутне KPI и служи за процену замена материјала које предлаже извођач.
        </Callout>
      )}
      <WhatIfCalculator project={project} model={model} options={options} calc={calc} setCalc={setCalc} />
      <FeedbackWidget moduleId="projekat-varijante" className="mt-2!" />
    </div>
  );
}
