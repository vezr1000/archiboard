/**
 * Theme preference: 'system' (default, follows OS), 'light' or 'dark'.
 * Persisted under localStorage `archiboard-theme` as a plain string (read by the inline script in index.html).
 *
 *   const { theme, setTheme, cycleTheme } = useThemeStore();
 *   const resolved = useResolvedTheme(); // 'light' | 'dark' actually shown
 */
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';

export type ThemePreference = 'system' | 'light' | 'dark';
const KEY = 'archiboard-theme';

function readPreference(): ThemePreference {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

function apply(theme: ThemePreference) {
  const root = document.documentElement;
  if (theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);
  try {
    if (theme === 'system') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, theme);
  } catch {
    /* ignore */
  }
}

interface ThemeState {
  theme: ThemePreference;
  setTheme: (t: ThemePreference) => void;
  /** system → light → dark → system */
  cycleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()((set, get) => ({
  theme: typeof window === 'undefined' ? 'system' : readPreference(),
  setTheme: (theme) => {
    apply(theme);
    set({ theme });
  },
  cycleTheme: () => {
    const order: ThemePreference[] = ['system', 'light', 'dark'];
    const next = order[(order.indexOf(get().theme) + 1) % order.length];
    get().setTheme(next);
  },
}));

const media = () => window.matchMedia('(prefers-color-scheme: dark)');
function subscribeSystem(cb: () => void) {
  const m = media();
  m.addEventListener('change', cb);
  return () => m.removeEventListener('change', cb);
}

/** The theme currently rendered ('light' | 'dark'), resolving 'system' via matchMedia. */
export function useResolvedTheme(): 'light' | 'dark' {
  const theme = useThemeStore((s) => s.theme);
  const systemDark = useSyncExternalStore(subscribeSystem, () => media().matches, () => false);
  if (theme === 'system') return systemDark ? 'dark' : 'light';
  return theme;
}

export const THEME_LABELS: Record<ThemePreference, string> = {
  system: 'Системска тема',
  light: 'Светла тема',
  dark: 'Тамна тема',
};
