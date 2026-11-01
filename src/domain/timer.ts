/** Derived, display-ready timer values for the checklist screen. */
import { currentStep, elapsedMs, focusStep } from './routine-run';
import { isDone, isRunning, isStarted, leftMs, stepRunOf, stepTotalMs, usedMs } from './step-run';
import type { Routine, RoutineRun, Step } from './types';

const toSecs = (ms: number) => Math.round(ms / 1000);

export type TimerCard = {
  step: Step;
  /** Seconds left; negative when a max step ran over. */
  left: number;
  /** 0–1 ring fill. */
  fraction: number;
  /** running = max step counting down; overtime = max step past its time (shows 😬); waiting = exact step not started. */
  state: 'running' | 'overtime' | 'waiting';
};

/** The small timer card above the list. Undefined in focus mode or when everything is done. */
export const timerCard = (
  routine: Routine,
  run: RoutineRun | undefined,
  now: number,
): TimerCard | undefined => {
  if (focusStep(routine, run)) return undefined;
  const step = currentStep(routine, run);
  if (!step) return undefined;
  const total = stepTotalMs(step);
  if (step.mode === 'exact') return { step, left: toSecs(total), fraction: 1, state: 'waiting' };
  const left = leftMs(step, stepRunOf(run, step.id), now);
  return {
    step,
    left: toSecs(left),
    fraction: Math.max(0, left) / total,
    state: left <= 0 ? 'overtime' : 'running',
  };
};

/**
 * "⏱️ All steps": total step time minus the routine's elapsed time, so it keeps running
 * while an exact step waits for a tap or is paused. Negative when over time (shown as "+m:ss").
 */
export const totalLeft = (routine: Routine, run: RoutineRun | undefined, now: number) =>
  toSecs(
    routine.steps.reduce((sum, s) => sum + stepTotalMs(s), 0) - (run ? elapsedMs(run, now) : 0),
  );

export type StepRow = {
  status: 'idle' | 'running' | 'paused' | 'done';
  /** Seconds left; negative when a max step ran over. */
  left: number;
  /** 0–1 time used, for the exact step's progress fill. */
  usedFraction: number;
  /** Max step past its time: shows 😬. */
  overtime: boolean;
  /** Done exact step: tapping resets it to full time (reload icon). */
  resettable: boolean;
};

export const stepRow = (step: Step, run: RoutineRun | undefined, now: number): StepRow => {
  const sr = stepRunOf(run, step.id);
  const total = stepTotalMs(step);
  const left = leftMs(step, sr, now);
  const done = isDone(sr);
  return {
    status: done ? 'done' : isRunning(sr) ? 'running' : isStarted(sr) ? 'paused' : 'idle',
    left: toSecs(left),
    usedFraction: Math.min(1, usedMs(sr, now) / total),
    overtime: !done && step.mode === 'max' && left <= 0 && isStarted(sr),
    resettable: done && step.mode === 'exact',
  };
};

/** Focus-mode encouragement line, by fraction of time remaining. */
export const cheerFor = (fraction: number) =>
  fraction > 0.66
    ? 'Nice and slow 🐢'
    : fraction > 0.33
      ? "You're doing great!"
      : fraction > 0.1
        ? 'Almost there…'
        : 'Last few seconds! ✨';

export type FocusState = {
  step: Step;
  /** 1-based position in the routine ("Step 3 of 7"). */
  stepNumber: number;
  totalSteps: number;
  /** Seconds left, clamped at 0. */
  left: number;
  /** 0–1 time remaining (ring fill). */
  fraction: number;
  paused: boolean;
  cheer: string;
};

/**
 * Focus mode is on while an exact step is started and not done, even when paused: the
 * checklist swaps the step list, timer card and "I'm finished" button for a single focus card.
 */
export const focusState = (
  routine: Routine,
  run: RoutineRun | undefined,
  now: number,
): FocusState | undefined => {
  const step = focusStep(routine, run);
  if (!step) return undefined;
  const sr = stepRunOf(run, step.id);
  const left = Math.max(0, leftMs(step, sr, now));
  const fraction = left / stepTotalMs(step);
  return {
    step,
    stepNumber: routine.steps.indexOf(step) + 1,
    totalSteps: routine.steps.length,
    left: toSecs(left),
    fraction,
    paused: !isRunning(sr),
    cheer: cheerFor(fraction),
  };
};
