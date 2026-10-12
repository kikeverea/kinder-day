import type { Rating, Routine } from './types';

/** Done ids that still exist in the routine (steps may have been edited since). */
export const doneStepIds = (routine: Routine, progress: Record<string, string[]>) => {
  const ids = progress[routine.id] ?? [];
  return ids.filter((id) => routine.steps.some((s) => s.id === id));
};

export const completion = (routine: Routine, progress: Record<string, string[]>) => {
  const done = doneStepIds(routine, progress).length;
  const total = routine.steps.length;
  return { done, total, left: total - done, pct: total ? Math.round((done / total) * 100) : 0 };
};

export const rate = (pct: number, regularMin: number): Rating =>
  pct >= 100 ? 'good' : pct >= regularMin ? 'regular' : 'bad';
