/**
 * Hooks that merge seed data with user-created items from the store.
 *
 *   const options = useProjectOptions('savski-kej');      // seed + saved what-if options
 *   const decisions = useProjectDecisions('savski-kej');  // newest first
 *   const reqs = useProjectRequirements('savski-kej');    // seed + accepted AI-extracted items
 *   const fb = useModuleFeedback('varijante');            // current session's answer or undefined
 */
import { useMemo } from 'react';
import { decisionsForProject, optionsForProject, requirementsForProject } from '@/data';
import type { Decision, DesignOption, FeedbackEntry, Requirement } from '@/domain/types';
import { useAppStore } from './useAppStore';

export function useProjectOptions(projectId: string): DesignOption[] {
  const userOptions = useAppStore((s) => s.userOptions);
  return useMemo(
    () => [...optionsForProject(projectId), ...userOptions.filter((o) => o.projectId === projectId)],
    [projectId, userOptions],
  );
}

export function useProjectDecisions(projectId: string): Decision[] {
  const userDecisions = useAppStore((s) => s.userDecisions);
  return useMemo(
    () =>
      [...decisionsForProject(projectId), ...userDecisions.filter((d) => d.projectId === projectId)].sort((a, b) =>
        b.date.localeCompare(a.date),
      ),
    [projectId, userDecisions],
  );
}

export function useProjectRequirements(projectId: string): Requirement[] {
  const accepted = useAppStore((s) => s.acceptedRequirements);
  return useMemo(
    () => [...requirementsForProject(projectId), ...accepted.filter((r) => r.projectId === projectId)],
    [projectId, accepted],
  );
}

/** Feedback entry for a module in the current presenter session (or undefined). */
export function useModuleFeedback(moduleId: string): FeedbackEntry | undefined {
  const feedback = useAppStore((s) => s.feedback);
  const label = useAppStore((s) => s.feedbackSessionLabel);
  return useMemo(
    () => feedback.find((f) => f.moduleId === moduleId && f.sessionLabel === (label || undefined)),
    [feedback, label, moduleId],
  );
}
