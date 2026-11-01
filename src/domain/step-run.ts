/** Primitives for a single step's timer (`StepRun`). */
import type { RoutineRun, Step, StepRun } from './types';

export const IDLE_STEP: StepRun = { consumedMs: 0, startedAt: null, doneAt: null };

export const stepRunOf = (run: RoutineRun | undefined, stepId: string) =>
  run?.steps[stepId] ?? IDLE_STEP;

export const stepTotalMs = (step: Step) => step.mins * 60_000;

/** The step's share of the routine's total time: its minutes plus an exact step's buffers. */
export const stepAllowanceMins = (step: Step) =>
  step.mins + (step.mode === 'exact' ? step.beforeMins + step.afterMins : 0);

/** Time used so far, including the current running stretch. */
export const usedMs = (sr: StepRun, now: number) =>
  sr.consumedMs + (sr.startedAt === null ? 0 : now - sr.startedAt);

/** Time left; negative when a max step runs over. */
export const leftMs = (step: Step, sr: StepRun, now: number) => stepTotalMs(step) - usedMs(sr, now);

export const isDone = (sr: StepRun) => sr.doneAt !== null;
export const isRunning = (sr: StepRun) => sr.startedAt !== null;
/** Has used any time (running or paused). */
export const isStarted = (sr: StepRun) => sr.startedAt !== null || sr.consumedMs > 0;

export const startStep = (sr: StepRun, now: number): StepRun =>
  sr.startedAt !== null ? sr : { ...sr, startedAt: now };

export const pauseStep = (sr: StepRun, now: number): StepRun =>
  sr.startedAt === null ? sr : { ...sr, consumedMs: usedMs(sr, now), startedAt: null };

export const completeStep = (sr: StepRun, at: number): StepRun => ({
  consumedMs: usedMs(sr, at),
  startedAt: null,
  doneAt: at,
});
