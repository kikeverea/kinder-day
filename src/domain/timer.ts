import type { Routine, RoutineTimer, Step } from './types';

const stepSecs = (step: Step) => step.mins * 60;

/** The exact step currently running (and not yet done), if any. */
export const runningStep = (routine: Routine, timer: RoutineTimer | undefined, done: string[]) => {
  if (!timer?.run) return undefined;
  const id = timer.run.stepId;
  return done.includes(id) ? undefined : routine.steps.find((s) => s.id === id);
};

/** "Current step" = the running exact step, else the first step not done. */
export const currentStep = (routine: Routine, timer: RoutineTimer | undefined, done: string[]) =>
  runningStep(routine, timer, done) ?? routine.steps.find((s) => !done.includes(s.id));

export type StepCountdown = {
  step: Step;
  /** Seconds left; negative only for a max step that ran over. */
  left: number;
  /** 0–1 ring fill. */
  fraction: number;
  state: 'max-running' | 'max-overtime' | 'exact-idle' | 'exact-running';
};

export const stepCountdown = (
  routine: Routine,
  timer: RoutineTimer | undefined,
  done: string[],
  now: number,
): StepCountdown | undefined => {
  const step = currentStep(routine, timer, done);
  if (!step) return undefined;
  const total = stepSecs(step);

  if (step.mode === 'exact') {
    const running = timer?.run?.stepId === step.id;
    const left = running
      ? Math.max(0, Math.round(total - (now - timer!.run!.start) / 1000))
      : total;
    return { step, left, fraction: left / total, state: running ? 'exact-running' : 'exact-idle' };
  }

  const left = timer ? Math.round(total - (now - timer.stepStart) / 1000) : total;
  return {
    step,
    left,
    fraction: Math.max(0, left) / total,
    state: left <= 0 ? 'max-overtime' : 'max-running',
  };
};

/** Seconds left for the whole routine since it was opened; negative when over time. */
export const totalLeft = (routine: Routine, timer: RoutineTimer | undefined, now: number) => {
  const total = routine.steps.reduce((sum, s) => sum + stepSecs(s), 0);
  return timer ? Math.round(total - (now - timer.start) / 1000) : total;
};

/** Elapsed fraction (0–1) of a running exact step, for the row's progress fill. */
export const exactElapsed = (step: Step, timer: RoutineTimer | undefined, now: number) => {
  if (timer?.run?.stepId !== step.id) return 0;
  const total = stepSecs(step);
  return Math.min(1, Math.floor((now - timer.run.start) / 1000) / total);
};

/** When a running exact step will finish (epoch ms), if one is running. */
export const runEndsAt = (routine: Routine, timer: RoutineTimer | undefined) => {
  if (!timer?.run) return undefined;
  const step = routine.steps.find((s) => s.id === timer.run!.stepId);
  return step ? timer.run.start + stepSecs(step) * 1000 : undefined;
};
