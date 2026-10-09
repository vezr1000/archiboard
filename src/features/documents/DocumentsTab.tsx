import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { SectionHeader } from '@/components/ui';
import { documentsForProject } from '@/data';
import type { GateId, Project } from '@/domain/types';
import { useCurrentProject } from '@/features/project/useCurrentProject';
import { DocumentRegister } from './DocumentRegister';
import { DocumentSheet } from './DocumentSheet';
import { GateReadinessCard } from './GateReadinessCard';

/**
 * `/projekti/:id/dokumenta` — gate readiness + document register with version history (CONCEPT §6.8).
 * Deep link: `?doc=<documentId>` opens that document's sheet (used by the certification tab).
 */
export function DocumentsTab() {
  const project = useCurrentProject();
  // Fresh filter state per project (the route element is reused when switching projects).
  return <DocumentsBody key={project.id} project={project} />;
}

function DocumentsBody({ project }: { project: Project }) {
  const docs = useMemo(() => documentsForProject(project.id), [project.id]);
  const [params, setParams] = useSearchParams();
  const [gate, setGate] = useState<GateId | null>(null);

  const requestedId = params.get('doc');
  const open = docs.find((d) => d.id === requestedId) ?? null;

  const setDoc = (id: string | null) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (id) next.set('doc', id);
        else next.delete('doc');
        return next;
      },
      { replace: true },
    );

  // Deep link: bring the highlighted row into view (the sheet covers part of the page).
  const openId = open?.id;
  useEffect(() => {
    if (!openId) return;
    const t = window.setTimeout(() => {
      const el = [...document.querySelectorAll<HTMLElement>(`[data-doc-id="${openId}"]`)].find((e) => e.offsetParent !== null);
      el?.scrollIntoView({ block: 'center' });
    }, 50);
    return () => window.clearTimeout(t);
  }, [openId]);

  const showGateInRegister = (g: GateId) => {
    setGate(g);
    window.setTimeout(() => document.getElementById('registar')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Документација" subtitle={`${project.shortName} · ${docs.length} докумената у регистру`} className="mb-0!" />
      <GateReadinessCard project={project} onOpenDoc={setDoc} onShowInRegister={showGateInRegister} />
      <DocumentRegister docs={docs} selectedId={open?.id ?? null} onOpen={setDoc} gate={gate} onGateChange={setGate} />
      <FeedbackWidget moduleId="projekat-dokumenta" className="mt-2!" />
      <DocumentSheet doc={open} onClose={() => setDoc(null)} />
    </div>
  );
}
