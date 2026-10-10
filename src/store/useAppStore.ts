/**
 * Persisted user-created state (localStorage key `archiboard-v1`). Seed data is NOT stored here.
 *
 *   const addFeedback = useAppStore((s) => s.setFeedback);
 *   const options = useAppStore((s) => s.userOptions);   // select stable references only
 *
 * Zustand v5: never return a freshly built array/object from a selector (causes re-render loops).
 * Select the raw slice and derive with useMemo, or use the hooks in `./selectors.ts`.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Decision, DesignOption, EngagementLogEntry, FeedbackEntry, FeedbackRating, Requirement } from '@/domain/types';

/**
 * Gate review progress per board session id.
 * TODO(step 10): replace `unknown` with a concrete `GateReviewState` type (step, votes, conditions, outcome).
 */
export type GateReviewRecord = Record<string, unknown>;

export interface AppState {
  /** Options saved from the what-if calculator. */
  userOptions: DesignOption[];
  /** Decisions created by the user (from „Предложи одбору“ or a gate review). */
  userDecisions: Decision[];
  /** In-progress / finished gate reviews keyed by session id. */
  gateReviews: GateReviewRecord;
  /** Requirements accepted from the AI extraction demo. */
  acceptedRequirements: Requirement[];
  /** Engagement-log notes added by the user, per stakeholder id (shown after the seed log). */
  stakeholderNotes: Record<string, EngagementLogEntry[]>;
  /** Demo audience feedback (one entry per moduleId + sessionLabel). */
  feedback: FeedbackEntry[];
  /** Presenter's current session label, attached to new feedback, e.g. „Студио Х“. */
  feedbackSessionLabel: string;

  addUserOption: (option: DesignOption) => void;
  removeUserOption: (id: string) => void;
  addUserDecision: (decision: Decision) => void;
  updateUserDecision: (id: string, patch: Partial<Decision>) => void;
  removeUserDecision: (id: string) => void;
  setGateReview: (sessionId: string, state: unknown) => void;
  clearGateReview: (sessionId: string) => void;
  acceptRequirements: (items: Requirement[]) => void;
  /** Append a note to a stakeholder's engagement log. */
  addStakeholderNote: (stakeholderId: string, entry: EngagementLogEntry) => void;
  /** Upsert feedback for (moduleId, current session label). */
  setFeedback: (moduleId: string, rating: FeedbackRating, note?: string) => void;
  /** Update only the note of an existing answer. */
  setFeedbackNote: (moduleId: string, note: string) => void;
  clearFeedback: () => void;
  setFeedbackSessionLabel: (label: string) => void;
  /**
   * Reset the demo between audiences: clears saved options, decisions, gate reviews, accepted requirements and stakeholder notes.
   * Feedback and the session label are KEPT (use `clearFeedback` to wipe them — step 12 page).
   */
  resetDemo: () => void;
}

const initialData = {
  userOptions: [] as DesignOption[],
  userDecisions: [] as Decision[],
  gateReviews: {} as GateReviewRecord,
  acceptedRequirements: [] as Requirement[],
  stakeholderNotes: {} as Record<string, EngagementLogEntry[]>,
  feedback: [] as FeedbackEntry[],
  feedbackSessionLabel: '',
};

/** localStorage wrapped in try/catch (private mode, blocked storage, previews). */
const safeStorage = createJSONStorage(() => ({
  getItem: (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  setItem: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* ignore */
    }
  },
  removeItem: (k: string) => {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  },
}));

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialData,

      addUserOption: (option) => set((s) => ({ userOptions: [...s.userOptions, { ...option, isUserCreated: true }] })),
      removeUserOption: (id) => set((s) => ({ userOptions: s.userOptions.filter((o) => o.id !== id) })),

      addUserDecision: (decision) =>
        set((s) => ({ userDecisions: [...s.userDecisions, { ...decision, isUserCreated: true }] })),
      updateUserDecision: (id, patch) =>
        set((s) => ({ userDecisions: s.userDecisions.map((d) => (d.id === id ? { ...d, ...patch } : d)) })),

      removeUserDecision: (id) => set((s) => ({ userDecisions: s.userDecisions.filter((d) => d.id !== id) })),

      setGateReview: (sessionId, state) => set((s) => ({ gateReviews: { ...s.gateReviews, [sessionId]: state } })),
      clearGateReview: (sessionId) =>
        set((s) => {
          const next = { ...s.gateReviews };
          delete next[sessionId];
          return { gateReviews: next };
        }),

      acceptRequirements: (items) =>
        set((s) => {
          const known = new Set(s.acceptedRequirements.map((r) => r.id));
          return { acceptedRequirements: [...s.acceptedRequirements, ...items.filter((r) => !known.has(r.id))] };
        }),

      addStakeholderNote: (stakeholderId, entry) =>
        set((s) => ({
          stakeholderNotes: {
            ...s.stakeholderNotes,
            [stakeholderId]: [...(s.stakeholderNotes[stakeholderId] ?? []), { ...entry, isUserCreated: true }],
          },
        })),

      setFeedback: (moduleId, rating, note) =>
        set((s) => {
          const label = s.feedbackSessionLabel || undefined;
          const existing = s.feedback.find((f) => f.moduleId === moduleId && f.sessionLabel === label);
          const entry: FeedbackEntry = {
            moduleId,
            rating,
            note: note ?? existing?.note,
            sessionLabel: label,
            timestamp: new Date().toISOString(),
          };
          return {
            feedback: [...s.feedback.filter((f) => !(f.moduleId === moduleId && f.sessionLabel === label)), entry],
          };
        }),
      setFeedbackNote: (moduleId, note) =>
        set((s) => {
          const label = s.feedbackSessionLabel || undefined;
          return {
            feedback: s.feedback.map((f) =>
              f.moduleId === moduleId && f.sessionLabel === label ? { ...f, note: note || undefined } : f,
            ),
          };
        }),
      clearFeedback: () => set({ feedback: [] }),
      setFeedbackSessionLabel: (label) => set({ feedbackSessionLabel: label.trim() }),

      resetDemo: () =>
        set({
          userOptions: [],
          userDecisions: [],
          gateReviews: {},
          acceptedRequirements: [],
          stakeholderNotes: {},
        }),
    }),
    {
      name: 'archiboard-v1',
      version: 1,
      storage: safeStorage,
      partialize: (s) => ({
        userOptions: s.userOptions,
        userDecisions: s.userDecisions,
        gateReviews: s.gateReviews,
        acceptedRequirements: s.acceptedRequirements,
        stakeholderNotes: s.stakeholderNotes,
        feedback: s.feedback,
        feedbackSessionLabel: s.feedbackSessionLabel,
      }),
    },
  ),
);
