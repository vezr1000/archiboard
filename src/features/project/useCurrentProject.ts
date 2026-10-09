import { useOutletContext } from 'react-router';
import type { Project } from '@/domain/types';

export interface ProjectOutletContext {
  project: Project;
}

/**
 * The project of the current cockpit route. Only valid inside `/projekti/:id/*` tabs
 * (ProjectLayout guarantees the project exists).
 * @example const project = useCurrentProject();
 */
export function useCurrentProject(): Project {
  return useOutletContext<ProjectOutletContext>().project;
}
