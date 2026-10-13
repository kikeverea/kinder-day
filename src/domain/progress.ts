import { isDone, stepRunOf } from './step-run';
import type { Rating, Routine, RoutineRun } from './types';

/** Ids of the routine's steps that are done (entries for deleted steps are ignored). */
export const doneStepIds = (routine: Routine, run: RoutineRun | undefined) =>
  routine.steps.filter((s) => isDone(stepRunOf(run, s.id))).map((s) => s.id);

export const completion = (routine: Routine, run: RoutineRun | undefined) => {
  const done = doneStepIds(routine, run).length;
  const total = routine.steps.length;
  return { done, total, left: total - done, pct: total ? Math.round((done / total) * 100) : 0 };
};

export const rate = (pct: number, regularMin: number): Rating =>
  pct >= 100 ? 'good' : pct >= regularMin ? 'regular' : 'bad';
