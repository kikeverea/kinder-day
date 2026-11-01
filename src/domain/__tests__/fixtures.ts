import { DEFAULT_SETTINGS } from '../seed';
import { emptyToday } from '../today';
import type { AppData, Routine } from '../types';

/** Monday 2026-10-12, 07:00 local time. */
export const T0 = new Date(2026, 9, 12, 7, 0, 0).getTime();
export const sec = (n: number) => n * 1000;
export const min = (n: number) => n * 60_000;

export const morning: Routine = {
  id: 'morning',
  name: 'Morning',
  emoji: '🌅',
  color: '#FFD66B',
  days: [0, 1, 2, 3, 4, 5, 6],
  steps: [
    { id: 'wake', emoji: '⏰', label: 'Wake up', mins: 2, mode: 'max', beforeMins: 0, afterMins: 0 },
    { id: 'teeth', emoji: '🪥', label: 'Brush my teeth', mins: 2, mode: 'exact', beforeMins: 0, afterMins: 0 },
    { id: 'dress', emoji: '👕', label: 'Put on my clothes', mins: 5, mode: 'max', beforeMins: 0, afterMins: 0 },
  ],
};

export const school: Routine = {
  id: 'school',
  name: 'After school',
  emoji: '🏫',
  color: '#8FE3B8',
  days: [1, 2, 3, 4, 5],
  steps: [{ id: 'snack', emoji: '🍎', label: 'Have a snack', mins: 10, mode: 'max', beforeMins: 0, afterMins: 0 }],
};

/** Morning with 3 min of buffers around Brush my teeth (12 min total). */
export const buffered: Routine = {
  ...morning,
  steps: morning.steps.map((s) => (s.mode === 'exact' ? { ...s, beforeMins: 2, afterMins: 1 } : s)),
};

export const makeState = (overrides: Partial<AppData> = {}): AppData => ({
  ...emptyToday(T0),
  routines: [morning, school],
  dayOrder: {},
  settings: DEFAULT_SETTINGS,
  history: {},
  ...overrides,
});
