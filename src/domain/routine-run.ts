/**
 * Rules for a routine's run: which step is current, which one runs, and how exact
 * steps complete. All functions are pure and preserve object identity when nothing changes.
 */
import {
  completeStep,
  isDone,
  isRunning,
  isStarted,
  leftMs,
  pauseStep,
  startStep,
  stepRunOf,
  stepTotalMs,
} from './step-run';
import type { Routine, RoutineRun, StepRun } from './types';

/** A step's clock is ticking right now (a finished run never ticks). */
export const isRoutineRunning = (run: RoutineRun | undefined) =>
  !!run && run.finishedAt === null && Object.values(run.steps).some(isRunning);

/** The exact step in focus mode: started (running or paused) and not done. */
export const focusStep = (routine: Routine, run: RoutineRun | undefined) =>
  routine.steps.find((s) => {
    const sr = stepRunOf(run, s.id);
    return s.mode === 'exact' && isStarted(sr) && !isDone(sr);
  });

/** The focus step if any, else the first step not done. */
export const currentStep = (routine: Routine, run: RoutineRun | undefined) =>
  focusStep(routine, run) ?? routine.steps.find((s) => !isDone(stepRunOf(run, s.id)));

const withSteps = (run: RoutineRun, steps: Record<string, StepRun>): RoutineRun => {
  const changed =
    Object.keys(steps).length !== Object.keys(run.steps).length ||
    Object.entries(steps).some(([id, sr]) => run.steps[id] !== sr);
  return changed ? { ...run, steps } : run;
};

/**
 * Enforces "at most one step runs":
 * - a finished run: nothing runs;
 * - in focus mode only the focus step may run (it is never auto-resumed after a pause);
 * - otherwise the current step runs if it is a max step (an exact step waits for a tap).
 * Every other step is paused.
 */
export const settle = (routine: Routine, run: RoutineRun, now: number): RoutineRun => {
  const finished = run.finishedAt !== null;
  const focus = finished ? undefined : focusStep(routine, run);
  const current = finished ? undefined : (focus ?? currentStep(routine, run));
  const autoRunId = !focus && current?.mode === 'max' ? current.id : undefined;
  const keepId = focus?.id ?? autoRunId;

  const steps: Record<string, StepRun> = {};
  for (const [id, sr] of Object.entries(run.steps)) {
    steps[id] = id === keepId ? sr : pauseStep(sr, now);
  }
  if (autoRunId) steps[autoRunId] = startStep(stepRunOf(run, autoRunId), now);
  return withSteps(run, steps);
};

/**
 * Completes a running exact step whose time is up, at the moment it actually ran out
 * (the app may have been closed), then settles from that moment so the next max step's
 * timer starts when the exact step ended.
 */
const completeExpired = (routine: Routine, run: RoutineRun, now: number): RoutineRun => {
  const focus = focusStep(routine, run);
  if (!focus) return run;
  const sr = stepRunOf(run, focus.id);
  if (!isRunning(sr) || leftMs(focus, sr, now) > 0) return run;
  const endedAt = sr.startedAt! + (stepTotalMs(focus) - sr.consumedMs);
  const next = { ...run, steps: { ...run.steps, [focus.id]: completeStep(sr, endedAt) } };
  return settle(routine, next, endedAt);
};

/** Brings a run up to `now`: completes an expired exact step, then settles. */
export const advance = (routine: Routine, run: RoutineRun, now: number): RoutineRun =>
  settle(routine, completeExpired(routine, run, now), now);
