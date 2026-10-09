import { useSyncExternalStore } from 'react';

/**
 * Subscribes to a CSS media query.
 * @example const isPhone = useMediaQuery('(max-width: 767px)');
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = (cb: () => void) => {
    const m = window.matchMedia(query);
    m.addEventListener('change', cb);
    return () => m.removeEventListener('change', cb);
  };
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}
