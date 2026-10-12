/**
 * Pure state transitions for "today" data (progress, timers, results).
 * Every function takes `now` explicitly so behaviour is deterministic and testable.
 */
import { dayKey } from './day';
import { completion, doneStepIds, rate } from './progress';
import { runEndsAt } from './timer';
import type { AppData, RoutineTimer, TodayData } from './types';

export const emptyToday = (now: number): TodayData => ({
  dayKey: dayKey(now),
  progress: {},
  results: {},
  timers: {},
});

/** Clears today's data if the calendar day changed. Returns the same object when nothing changed. */
export const rollover = <S extends AppData>(state: S, now: number): S =>
  state.dayKey === dayKey(now) ? state : { ...state, ...emptyToday(now) };

const withTimer = <S extends AppData>(state: S, routineId: string, timer: RoutineTimer): S => ({
  ...state,
  timers: { ...state.timers, [routineId]: timer },
});

/** Starts the routine's timers the first time it is opened today; reopening keeps them running. */
export const openRoutine = <S extends AppData>(state: S, routineId: string, now: number): S => {
  const s = rollover(state, now);
  if (s.timers[routineId]) return s;
  return withTimer(s, routineId, { start: now, stepStart: now, run: null });
};

/**
 * Tap on a step row.
 * - max step: toggles done; restarts the current-step countdown.
 * - exact step, not done: starts it (ignored if it is already running — it can't finish early).
 * - exact step, done: un-does it (the next tap starts it again).
 */
export const toggleStep = <S extends AppData>(
  state: S,
  routineId: string,
  stepId: string,
  now: number,
): S => {
  const s = resolveExpiredRuns(openRoutine(state, routineId, now), now);
  const routine = s.routines.find((r) => r.id === routineId);
  const step = routine?.steps.find((x) => x.id === stepId);
  if (!routine || !step) return s;

  const done = s.progress[routineId] ?? [];
  const timer = s.timers[routineId];
  const isDone = done.includes(stepId);

  if (step.mode === 'exact' && !isDone) {
    if (timer.run?.stepId === stepId) return s;
    return withTimer(s, routineId, { ...timer, run: { stepId, start: now } });
  }

  const next = isDone ? done.filter((id) => id !== stepId) : [...done, stepId];
  return {
    ...withTimer(s, routineId, { ...timer, stepStart: now }),
    progress: { ...s.progress, [routineId]: next },
  };
};

/**
 * Marks exact steps whose time has elapsed as done, for every routine.
 * The next step's countdown starts at the moment the exact step actually ended,
 * not when this happens to run (the app may have been in the background).
 */
export const resolveExpiredRuns = <S extends AppData>(state: S, now: number): S => {
  let next = state;
  for (const [routineId, timer] of Object.entries(state.timers)) {
    const routine = state.routines.find((r) => r.id === routineId);
    const endsAt = routine && runEndsAt(routine, timer);
    if (!timer.run) continue;
    if (endsAt === undefined) {
      // The running step was deleted from the routine.
      next = withTimer(next, routineId, { ...timer, run: null });
      continue;
    }
    if (endsAt > now) continue;
    const done = next.progress[routineId] ?? [];
    next = {
      ...withTimer(next, routineId, { ...timer, run: null, stepStart: endsAt }),
      progress: {
        ...next.progress,
        [routineId]: done.includes(timer.run.stepId) ? done : [...done, timer.run.stepId],
      },
    };
  }
  return next;
};

/** "I'm finished" — always allowed; records today's result for the routine. */
export const finishRoutine = <S extends AppData>(state: S, routineId: string, now: number): S => {
  const s = resolveExpiredRuns(rollover(state, now), now);
  const routine = s.routines.find((r) => r.id === routineId);
  if (!routine) return s;
  const { done, total, pct } = completion(routine, s.progress);
  const timer = s.timers[routineId];
  return {
    ...s,
    results: {
      ...s.results,
      [routineId]: {
        rating: rate(pct, s.settings.regularMin),
        done,
        total,
        at: now,
        secs: timer ? Math.round((now - timer.start) / 1000) : 0,
      },
    },
  };
};

export const resetToday = <S extends AppData>(state: S, now: number): S => ({
  ...state,
  ...emptyToday(now),
});

/** Steps of the routine that are not done yet (for the result screen's "Still waiting" chips). */
export const missedSteps = (state: AppData, routineId: string) => {
  const routine = state.routines.find((r) => r.id === routineId);
  if (!routine) return [];
  const done = doneStepIds(routine, state.progress);
  return routine.steps.filter((s) => !done.includes(s.id));
};
