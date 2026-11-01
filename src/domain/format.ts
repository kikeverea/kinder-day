import { DAY_ABBR, DAY_NAME, WEEK } from './constants';
import { stepAllowanceMins } from './step-run';
import type { DayOfWeek, Routine, RoutineResult, Step } from './types';

/** Seconds → "m:ss". Negative values are formatted by magnitude; callers add the "+" for overtime. */
export const formatClock = (secs: number) => {
  const a = Math.abs(Math.round(secs));
  return `${Math.floor(a / 60)}:${String(a % 60).padStart(2, '0')}`;
};

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export const daysLabel = (days: DayOfWeek[]) => {
  if (days.length === 7) return 'Every day';
  if (days.length === 0) return 'No days yet';
  if (days.length === 5 && [1, 2, 3, 4, 5].every((d) => days.includes(d as DayOfWeek))) {
    return 'Weekdays';
  }
  if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends';
  return WEEK.filter((d) => days.includes(d))
    .map((d) => DAY_ABBR[d])
    .join(', ');
};

/** Total time allowed, including exact steps' buffers. */
export const routineMinutes = (routine: Pick<Routine, 'steps'>) =>
  routine.steps.reduce((sum, s) => sum + stepAllowanceMins(s), 0);

export const greeting = (hour: number) =>
  hour < 12
    ? { text: 'Good morning,', emoji: '☀️' }
    : hour < 18
      ? { text: 'Good afternoon,', emoji: '🌈' }
      : { text: 'Good evening,', emoji: '🌙' };

const MONTH_NAME = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

/** "Monday, October 12" — locale-independent, matching the design. */
export const dateLabel = (now: number) => {
  const d = new Date(now);
  return `${DAY_NAME[d.getDay()]}, ${MONTH_NAME[d.getMonth()]} ${d.getDate()}`;
};

/** "7:42 AM" */
export const clockTime = (at: number) => {
  const d = new Date(at);
  const h = d.getHours();
  return `${h % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};

/** Checklist label under the progress bar. */
export const progressLabel = (done: number, total: number) =>
  total > 0 && done === total
    ? 'Everything done! 🎉'
    : done === 0
      ? `${plural(total, 'step')} · tap each one when it's done`
      : `${done} done · ${total - done} to go!`;

/** Step row subtitle. */
export const stepSubtitle = (step: Step, done: boolean) =>
  step.mode === 'max'
    ? `⏱️ Up to ${step.mins} min`
    : done
      ? `⏳ ${step.mins} min — done!`
      : `⏳ Takes ${step.mins} min · tap to start`;

/** Result screen title. A "regular" on time means steps were left undone. */
export const resultTitle = (result: RoutineResult) =>
  result.rating === 'good'
    ? 'You did it!'
    : result.rating === 'bad'
      ? 'Sheesh!'
      : result.overtimeSecs > 0
        ? 'Almost on time!'
        : 'Hmm… almost!';

/** Result screen subtitle. */
export const resultSubtitle = (result: RoutineResult) => {
  const left = result.totalSteps - result.doneSteps;
  if (result.rating === 'good') return 'Every step, right on time. Super star!';
  if (result.rating === 'bad') return "That took a while. Let's be quicker next time!";
  return result.overtimeSecs > 0
    ? "Just a little over — you've got this."
    : `So close! ${left === 1 ? 'One step is' : `${left} steps are`} still waiting for you.`;
};

/** "5 of 7 steps · 12 min" */
export const resultSummary = (result: RoutineResult) =>
  `${result.doneSteps} of ${result.totalSteps} steps` +
  (result.secs ? ` · ${Math.max(1, Math.round(result.secs / 60))} min` : '');

/** Routines list: "7 steps · 21 min · ⏰ 🚽 🪥 👕" */
export const routineSummary = (routine: Routine) =>
  `${plural(routine.steps.length, 'step')} · ${routineMinutes(routine)} min · ` +
  routine.steps
    .slice(0, 4)
    .map((s) => s.emoji)
    .join(' ');

/** Editor steps header: "7 steps · 21 min total" */
export const stepsTotalLabel = (routine: Pick<Routine, 'steps'>) =>
  `${plural(routine.steps.length, 'step')} · ${routineMinutes(routine)} min total`;

/** Parent "Today" status line. */
export const todayStatus = (opened: boolean, result: RoutineResult | undefined) =>
  result
    ? `Finished at ${clockTime(result.finishedAt)} · ${result.doneSteps}/${result.totalSteps} steps`
    : opened
      ? 'In progress'
      : 'Not started yet';

/** Week planner row: "7 steps · 21 min · Every day" */
export const plannerSummary = (routine: Routine) =>
  `${plural(routine.steps.length, 'step')} · ${routineMinutes(routine)} min · ${daysLabel(routine.days)}`;
