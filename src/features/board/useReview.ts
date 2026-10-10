import { useCallback, useMemo } from 'react';
import type { BoardSession, GateReviewState } from '@/domain/types';
import { useAppStore, useGateReview } from '@/store';
import { initialReview } from './reviewLogic';

export type ReviewUpdate = (fn: (review: GateReviewState) => GateReviewState) => void;

/**
 * Gate review state of a scheduled session: the stored review, or a fresh one (not saved until the first change).
 * `update` always applies to the latest stored state, so rapid changes never overwrite each other.
 */
export function useReview(session: BoardSession): { review: GateReviewState; update: ReviewUpdate; started: boolean } {
  const stored = useGateReview(session.id);
  const setGateReview = useAppStore((s) => s.setGateReview);
  const fresh = useMemo(() => initialReview(session), [session]);
  const update = useCallback<ReviewUpdate>(
    (fn) => {
      const current = useAppStore.getState().gateReviews[session.id] ?? initialReview(session);
      setGateReview(session.id, fn(current));
    },
    [session, setGateReview],
  );
  return { review: stored ?? fresh, update, started: Boolean(stored) };
}
