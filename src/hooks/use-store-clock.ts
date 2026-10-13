import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useAppStore } from '@/store';

/**
 * Drives the store's `tick` once a second and on return to the foreground, so exact steps
 * auto-complete and "today" rolls over at midnight. Mount once, in the root layout.
 * `tick` keeps state identity when nothing changed, so idle ticks don't re-render or persist.
 */
export function useStoreClock() {
  const tick = useAppStore((s) => s.tick);

  useEffect(() => {
    tick();
    const id = setInterval(() => tick(), 1000);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') tick();
    });
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [tick]);
}
