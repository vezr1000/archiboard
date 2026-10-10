/**
 * Visibility of the presenter „Демо пут“ card on the portfolio page.
 * Persisted under localStorage `archiboard-demo-guide-dismissed` ('1' = dismissed). Storage can be unavailable
 * (private mode), so every access is wrapped in try/catch and the state still works in memory.
 */
import { create } from 'zustand';

const KEY = 'archiboard-demo-guide-dismissed';

function readDismissed(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

function writeDismissed(dismissed: boolean) {
  try {
    if (dismissed) localStorage.setItem(KEY, '1');
    else localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

interface DemoGuideState {
  dismissed: boolean;
  dismiss: () => void;
  /** Show the card again (from „Више“ / sidebar). */
  reopen: () => void;
}

export const useDemoGuideStore = create<DemoGuideState>()((set) => ({
  dismissed: typeof window === 'undefined' ? false : readDismissed(),
  dismiss: () => {
    writeDismissed(true);
    set({ dismissed: true });
  },
  reopen: () => {
    writeDismissed(false);
    set({ dismissed: false });
  },
}));
