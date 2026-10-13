/**
 * Pure state transitions for "today" data (routine runs and results).
 * Every function takes `now` explicitly so behaviour is deterministic and testable.
 */
import { dayKey } from './day';
import { completion, rate } from './progress';
import { advance, focusStep, settle } from './routine-run';
import {
  completeStep,
  IDLE_STEP,
  isDone,
  isRunning,
  pauseStep as pauseStepRun,
  startStep,
  stepRunOf,
} from './step-run';
import type { AppData, Routine, RoutineRun, StepRun, TodayData } from './types';

export const emptyToday = (now: number): TodayData => ({
  dayKey: dayKey(now),
  runs: {},
  results: {},
});

/** Clears today's data if the calendar day changed. Returns the same object when nothing changed. */
export const rollover = <S extends AppData>(state: S, now: number): S =>
  state.dayKey === dayKey(now) ? state : { ...state, ...emptyToday(now) };

const withRun = <S extends AppData>(state: S, routineId: string, run: RoutineRun): S =>
  state.runs[routineId] === run ? state : { ...state, runs: { ...state.runs, [routineId]: run } };

const withStep = (run: RoutineRun, stepId: string, sr: StepRun): RoutineRun => ({
  ...run,
  steps: { ...run.steps, [stepId]: sr },
});

/** Brings every run up to `now`. Call on each timer tick and when the app returns to the foreground. */
export const tick = <S extends AppData>(state: S, now: number): S => {
  let s = rollover(state, now);
  for (const [routineId, run] of Object.entries(s.runs)) {
    const routine = s.routines.find((r) => r.id === routineId);
    if (routine) s = withRun(s, routineId, advance(routine, run, now));
  }
  return s;
};

/** Creates today's run on first open (starting the first step if it is a max step); reopening keeps it. */
export const openRoutine = <S extends AppData>(state: S, routineId: string, now: number): S => {
  const s = rollover(state, now);
  const routine = s.routines.find((r) => r.id === routineId);
  if (!routine) return s;
  const run = s.runs[routineId] ?? { openedAt: now, steps: {} };
  return withRun(s, routineId, advance(routine, run, now));
};

/** Applies `fn` to the routine's run after bringing it up to `now`. */
const updateRun = <S extends AppData>(
  state: S,
  routineId: string,
  now: number,
  fn: (routine: Routine, run: RoutineRun) => RoutineRun,
): S => {
  const s = openRoutine(state, routineId, now);
  const routine = s.routines.find((r) => r.id === routineId);
  const run = s.runs[routineId];
  return routine && run ? withRun(s, routineId, fn(routine, run)) : s;
};

/**
 * Tap on a step row.
 * - Focus mode (an exact step started and not done, running or paused): every tap is ignored.
 * - max step, not done: completes it; the next step becomes current.
 * - max step, done: un-does it; it resumes with the time it had left.
 * - exact step, not done: starts it (enters focus mode).
 * - exact step, done: resets it to its full time (shown with a reload icon).
 */
export const toggleStep = <S extends AppData>(
  state: S,
  routineId: string,
  stepId: string,
  now: number,
): S =>
  updateRun(state, routineId, now, (routine, run) => {
    const step = routine.steps.find((x) => x.id === stepId);
    if (!step || focusStep(routine, run)) return run;
    const sr = stepRunOf(run, stepId);

    let next: StepRun;
    if (isDone(sr)) next = step.mode === 'exact' ? IDLE_STEP : { ...sr, doneAt: null };
    else next = step.mode === 'exact' ? startStep(sr, now) : completeStep(sr, now);

    return settle(routine, withStep(run, stepId, next), now);
  });

/** Focus-mode ⏸ Pause. The step keeps its used time and focus mode stays on. */
export const pauseStep = <S extends AppData>(state: S, routineId: string, now: number): S =>
  updateRun(state, routineId, now, (routine, run) => {
    const focus = focusStep(routine, run);
    const sr = focus && stepRunOf(run, focus.id);
    return focus && sr && isRunning(sr) ? withStep(run, focus.id, pauseStepRun(sr, now)) : run;
  });

/** Focus-mode ▶ Resume: continues with the step's total time minus what it already used. */
export const resumeStep = <S extends AppData>(state: S, routineId: string, now: number): S =>
  updateRun(state, routineId, now, (routine, run) => {
    const focus = focusStep(routine, run);
    const sr = focus && stepRunOf(run, focus.id);
    return focus && sr && !isRunning(sr) ? withStep(run, focus.id, startStep(sr, now)) : run;
  });

/** "I'm finished": always allowed; records today's result for the routine. */
export const finishRoutine = <S extends AppData>(state: S, routineId: string, now: number): S => {
  const s = tick(state, now);
  const routine = s.routines.find((r) => r.id === routineId);
  if (!routine) return s;
  const run = s.runs[routineId];
  const { done, total, pct } = completion(routine, run);
  return {
    ...s,
    results: {
      ...s.results,
      [routineId]: {
        rating: rate(pct, s.settings.regularMin),
        doneSteps: done,
        totalSteps: total,
        finishedAt: now,
        secs: run ? Math.round((now - run.openedAt) / 1000) : 0,
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
  const run = state.runs[routineId];
  return routine.steps.filter((s) => !isDone(stepRunOf(run, s.id)));
};
