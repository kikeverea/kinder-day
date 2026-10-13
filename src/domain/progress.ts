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

/**
 * Result rating, by time:
 * - good 😄: within the routine's total time;
 * - regular 😶: up to `graceMins` over;
 * - bad 😬: more than `graceMins` over.
 * Undone steps cap the rating at regular, so 😄 always means everything done on time.
 */
export const rate = ({
  allDone,
  overtimeSecs,
  graceMins,
}: {
  allDone: boolean;
  overtimeSecs: number;
  graceMins: number;
}): Rating => {
  const byTime: Rating =
    overtimeSecs <= 0 ? 'good' : overtimeSecs <= graceMins * 60 ? 'regular' : 'bad';
  return byTime === 'good' && !allDone ? 'regular' : byTime;
};
