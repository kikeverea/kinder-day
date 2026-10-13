/** Past days: archived at rollover so the kid can look back at earlier results. */
import { dayKeyToTime, dayOfWeek, shiftDay } from './day';
import { completion } from './progress';
import { routinesForDay } from './schedule';
import type { AppData, DayRecord, PastRoutine } from './types';

export const HISTORY_DAYS = 90;

/**
 * Snapshot of the state's current day: the routines scheduled that day (in that day's
 * order) plus any other routine that was used. Null when there is nothing to keep.
 */
export const archiveDay = (state: AppData): DayRecord | null => {
  const scheduled = routinesForDay(state.routines, state.dayOrder, dayOfWeek(dayKeyToTime(state.dayKey)));
  const used = state.routines.filter(
    (r) => !scheduled.includes(r) && (state.runs[r.id] || state.results[r.id]),
  );
  const routines: PastRoutine[] = [...scheduled, ...used].map((r) => {
    const { done, total } = completion(r, state.runs[r.id]);
    return {
      id: r.id,
      name: r.name,
      emoji: r.emoji,
      color: r.color,
      doneSteps: state.results[r.id]?.doneSteps ?? done,
      totalSteps: state.results[r.id]?.totalSteps ?? total,
      result: state.results[r.id] ?? null,
    };
  });
  return routines.length ? { dayKey: state.dayKey, routines } : null;
};

/** Drops records older than `HISTORY_DAYS` before `todayKey`. */
export const pruneHistory = (history: Record<string, DayRecord>, todayKey: string) => {
  const oldest = shiftDay(todayKey, -HISTORY_DAYS);
  const kept = Object.entries(history).filter(([key]) => key >= oldest);
  return kept.length === Object.keys(history).length ? history : Object.fromEntries(kept);
};

/** The earliest archived dayKey, if any. */
export const oldestDay = (history: Record<string, DayRecord>) =>
  Object.keys(history).sort()[0] as string | undefined;
