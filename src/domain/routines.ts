/** Pure transitions for routine definitions and the weekly plan. */
import { routinesForDay, sortDays } from './schedule';
import type { AppData, DayOfWeek, Routine } from './types';

/** Insert or replace a routine (editor "Create routine" / "Save changes"). */
export const upsertRoutine = <S extends AppData>(state: S, routine: Routine): S => {
  const clean: Routine = { ...routine, name: routine.name.trim(), days: sortDays(routine.days) };
  const exists = state.routines.some((r) => r.id === routine.id);
  return {
    ...state,
    routines: exists
      ? state.routines.map((r) => (r.id === routine.id ? clean : r))
      : [...state.routines, clean],
  };
};

const omit = <V>(record: Record<string, V>, key: string) => {
  const { [key]: _removed, ...rest } = record;
  return rest;
};

/** Removes a routine and every trace of it (day order, today's progress, timers, results). */
export const deleteRoutine = <S extends AppData>(state: S, routineId: string): S => {
  const dayOrder: AppData['dayOrder'] = {};
  for (const [day, ids] of Object.entries(state.dayOrder)) {
    dayOrder[Number(day) as DayOfWeek] = ids.filter((id) => id !== routineId);
  }
  return {
    ...state,
    routines: state.routines.filter((r) => r.id !== routineId),
    dayOrder,
    progress: omit(state.progress, routineId),
    results: omit(state.results, routineId),
    timers: omit(state.timers, routineId),
  };
};

/** Planner ✕ — unschedules the routine on that day only. */
export const removeRoutineFromDay = <S extends AppData>(
  state: S,
  routineId: string,
  day: DayOfWeek,
): S => ({
  ...state,
  routines: state.routines.map((r) =>
    r.id === routineId ? { ...r, days: r.days.filter((d) => d !== day) } : r,
  ),
});

/** Planner "Add to {Day}" — schedules the routine and puts it last in that day's order. */
export const addRoutineToDay = <S extends AppData>(
  state: S,
  routineId: string,
  day: DayOfWeek,
): S => {
  const currentOrder = routinesForDay(state.routines, state.dayOrder, day).map((r) => r.id);
  return {
    ...state,
    routines: state.routines.map((r) =>
      r.id === routineId ? { ...r, days: sortDays([...r.days, day]) } : r,
    ),
    dayOrder: { ...state.dayOrder, [day]: [...currentOrder.filter((id) => id !== routineId), routineId] },
  };
};

/** Planner drag-and-drop result: the full ordered list of routine ids for the day. */
export const reorderDay = <S extends AppData>(state: S, day: DayOfWeek, ids: string[]): S => ({
  ...state,
  dayOrder: { ...state.dayOrder, [day]: ids },
});
