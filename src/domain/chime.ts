/** When to chime: a warning shortly before a step's time runs out, and a double chime when it's up. */
import { stepTotalMs } from './step-run';
import type { Routine, RoutineRun, Step, StepRun } from './types';

export type ChimeKind = 'warning' | 'timesUp';

/** Warning lead time: 1 min before the end, or 30 s for steps of 2 min or less. */
export const warningLeadMs = (step: Step) => (step.mins > 2 ? 60_000 : 30_000);

/**
 * Time a step had used at moment `t`, reconstructed from its timestamps: a running step
 * grows from `startedAt`; a done step was running until `doneAt` (so an exact step that
 * auto-completed between two checks still crosses its end); a paused or idle one is flat.
 */
const usedAt = (sr: StepRun, t: number) => {
  if (sr.startedAt !== null) return sr.consumedMs + Math.max(0, t - sr.startedAt);
  if (sr.doneAt !== null) return sr.consumedMs - Math.max(0, sr.doneAt - t);
  return sr.consumedMs;
};

/** Chimes due for thresholds crossed in (`from`, `to`]. */
export const chimeEvents = (
  routines: Routine[],
  runs: Record<string, RoutineRun>,
  from: number,
  to: number,
): { routineId: string; stepId: string; kind: ChimeKind }[] => {
  const events: { routineId: string; stepId: string; kind: ChimeKind }[] = [];
  for (const routine of routines) {
    const run = runs[routine.id];
    if (!run) continue;
    for (const step of routine.steps) {
      const sr = run.steps[step.id];
      if (!sr) continue;
      const total = stepTotalMs(step);
      const before = total - usedAt(sr, from);
      const after = total - usedAt(sr, to);
      if (before > 0 && after <= 0) {
        events.push({ routineId: routine.id, stepId: step.id, kind: 'timesUp' });
      } else {
        const lead = warningLeadMs(step);
        if (before > lead && after <= lead) {
          events.push({ routineId: routine.id, stepId: step.id, kind: 'warning' });
        }
      }
    }
  }
  return events;
};
