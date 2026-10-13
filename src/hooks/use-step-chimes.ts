import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';

import { chimeEvents } from '@/domain/chime';
import { useAppStore } from '@/store';

const CHECK_MS = 1000;
/** A longer gap means the app was asleep or in the background: skip stale chimes. */
const MAX_GAP_MS = 5000;

/**
 * Plays step chimes with vibration: one chime shortly before a step's time runs out,
 * a double chime when it's up. Runs in the foreground only. Mount once, in the root layout.
 */
export function useStepChimes() {
  const single = useAudioPlayer(require('@/assets/sounds/chime.wav'));
  const double = useAudioPlayer(require('@/assets/sounds/chime-double.wav'));

  useEffect(() => {
    setAudioModeAsync({ interruptionMode: 'mixWithOthers', playsInSilentMode: true }).catch(() => {});
  }, []);

  useEffect(() => {
    let last = Date.now();
    const id = setInterval(() => {
      const now = Date.now();
      const from = last;
      last = now;
      const { settings, routines, runs } = useAppStore.getState();
      if (!settings.chimes || now - from > MAX_GAP_MS) return;

      const events = chimeEvents(routines, runs, from, now);
      if (events.some((e) => e.kind === 'timesUp')) {
        double.seekTo(0);
        double.play();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning), 400);
      } else if (events.length > 0) {
        single.seekTo(0);
        single.play();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    }, CHECK_MS);
    return () => clearInterval(id);
  }, [single, double]);
}
