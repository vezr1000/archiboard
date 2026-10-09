import { useMemo, useState } from 'react';
import { Recycle } from 'lucide-react';
import { useReducedMotion } from '@/components/ai/useReducedMotion';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { paths } from '@/components/layout/navigation';
import { Button, EmptyState, SectionHeader } from '@/components/ui';
import { materialsForProject } from '@/data';
import { PHASE_LABELS } from '@/domain/labels';
import type { BuildingLayer, Project } from '@/domain/types';
import { useCurrentProject } from '@/features/project/useCurrentProject';
import { HotspotsCard } from './HotspotsCard';
import { MaterialSheet } from './MaterialSheet';
import { PassportIndicators } from './PassportIndicators';
import { PassportList } from './PassportList';
import { passportStats, referenceArea } from './materialsLogic';
import { SwapSuggestions } from './SwapSuggestions';

/**
 * `/projekti/:id/materijali` — material passport, carbon hotspots, circularity indicators and swap suggestions (CONCEPT §6.7).
 */
export function ProjectMaterialsTab() {
  const project = useCurrentProject();
  // Fresh filter / sheet state per project (the route element is reused when switching projects).
  return <ProjectMaterialsBody key={project.id} project={project} />;
}

function ProjectMaterialsBody({ project }: { project: Project }) {
  const rows = useMemo(() => materialsForProject(project.id), [project.id]);
  const area = referenceArea(project);
  const stats = useMemo(() => passportStats(rows, area.m2), [rows, area.m2]);
  const reduced = useReducedMotion();
  const [layer, setLayer] = useState<BuildingLayer | null>(null);
  const [materialId, setMaterialId] = useState<string | null>(null);
  const [sheetId, setSheetId] = useState<string | null>(null);

  const jumpToPassport = () =>
    window.setTimeout(() => document.getElementById('pasos')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }), 0);

  if (rows.length === 0) {
    return (
      <>
        <SectionHeader title="Материјали и циркуларност" subtitle={project.shortName} />
        <EmptyState
          icon={Recycle}
          title="Материјални пасош још није отворен"
          description={`Пројекат је у фази „${PHASE_LABELS[project.phase]}“ и за њега још нису унете позиције материјала. Пасош се формира из количина у моделу уз EPD податке — до тада угљеник пратите кроз циљеве и KPI.`}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="secondary" to={paths.project(project.id, 'ciljevi')}>
                Циљеви и KPI
              </Button>
              <Button variant="ghost" to={paths.materials()}>
                EPD библиотека
              </Button>
            </div>
          }
        />
        <FeedbackWidget moduleId="projekat-materijali" />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Материјали и циркуларност"
        subtitle={`${project.shortName} · ${rows.length} позиција у пасошу`}
        className="mb-0!"
      />
      <PassportIndicators stats={stats} projectId={project.id} unit={area.unit} />
      <HotspotsCard
        rows={rows}
        layer={layer}
        materialId={materialId}
        onLayer={(l) => {
          setLayer(l);
          if (l) jumpToPassport();
        }}
        onMaterial={(m) => {
          setMaterialId(m);
          if (m) jumpToPassport();
        }}
      />
      <SwapSuggestions project={project} rows={rows} areaM2={area.m2} unit={area.unit} onOpenMaterial={setSheetId} />
      <PassportList
        rows={rows}
        layer={layer}
        materialId={materialId}
        onLayer={setLayer}
        onMaterial={setMaterialId}
        onOpenMaterial={setSheetId}
      />
      <FeedbackWidget moduleId="projekat-materijali" className="mt-2!" />
      <MaterialSheet materialId={sheetId} onChange={setSheetId} projectId={project.id} />
    </div>
  );
}
