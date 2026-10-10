/**
 * Hooks that merge seed data with user-created items from the store.
 *
 *   const options = useProjectOptions('savski-kej');      // seed + saved what-if options
 *   const decisions = useProjectDecisions('savski-kej');  // newest first
 *   const reqs = useProjectRequirements('savski-kej');    // seed + accepted AI-extracted items
 *   const fb = useModuleFeedback('varijante');            // current session's answer or undefined
 */
import { useMemo } from 'react';
import { decisionsForProject, getSession, optionsForProject, requirementsForProject, stakeholdersForProject } from '@/data';
import type {
  BoardSession,
  Decision,
  DesignOption,
  FeedbackEntry,
  GateReviewState,
  Requirement,
  SessionOutcome,
  Stakeholder,
} from '@/domain/types';
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

/**
 * Project stakeholders with the user's notes merged into `log` (newest first; on the same day user notes come first).
 * Seed objects are never mutated.
 */
export function useProjectStakeholders(projectId: string): Stakeholder[] {
  const notes = useAppStore((s) => s.stakeholderNotes);
  return useMemo(
    () =>
      stakeholdersForProject(projectId).map((st) => {
        const mine = notes[st.id] ?? [];
        const log = [...[...mine].reverse(), ...[...st.log].reverse()].sort((a, b) => b.date.localeCompare(a.date));
        return { ...st, log };
      }),
    [projectId, notes],
  );
}

/* ---------- Gate reviews (step 10) ---------- */

/** Stored gate review of a session (undefined until the first change is saved). */
export function useGateReview(sessionId: string | undefined): GateReviewState | undefined {
  return useAppStore((s) => (sessionId ? s.gateReviews[sessionId] : undefined));
}

/**
 * - `held`: past session with a seed outcome;
 * - `completed`: scheduled session closed in this demo („Заврши седницу“) — outcome comes from the review;
 * - `in-progress`: a review has been started but not closed;
 * - `scheduled`: nothing started yet.
 */
export type SessionStatus = 'scheduled' | 'in-progress' | 'completed' | 'held';

export interface SessionOutcomeInfo {
  /** Effective outcome: seed outcome, or the demo review's outcome once closed, else „scheduled“. */
  outcome: SessionOutcome;
  status: SessionStatus;
  review?: GateReviewState;
}

/** Pure variant for lists (pass the store's `gateReviews[session.id]`). */
export function sessionOutcomeOf(session: BoardSession | undefined, review: GateReviewState | undefined): SessionOutcomeInfo {
  if (!session) return { outcome: 'scheduled', status: 'scheduled' };
  if (session.outcome !== 'scheduled') return { outcome: session.outcome, status: 'held' };
  if (review?.outcome) return { outcome: review.outcome, status: 'completed', review };
  if (review) return { outcome: 'scheduled', status: 'in-progress', review };
  return { outcome: 'scheduled', status: 'scheduled' };
}

/** Effective outcome of a board session (seed + gate review in this demo). Used by Одбор, project overview and Одлуке. */
export function useSessionOutcome(sessionId: string | undefined): SessionOutcomeInfo {
  const review = useGateReview(sessionId);
  return useMemo(() => sessionOutcomeOf(getSession(sessionId), review), [sessionId, review]);
}
