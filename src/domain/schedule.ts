import type { DayOfWeek, Routine } from './types';

/** Routines scheduled on `day`, sorted by that day's saved order (unlisted ones last, in creation order). */
export const routinesForDay = (
  routines: Routine[],
  dayOrder: Partial<Record<DayOfWeek, string[]>>,
  day: DayOfWeek,
) => {
  const order = dayOrder[day] ?? [];
  const pos = (r: Routine) => {
    const i = order.indexOf(r.id);
    return i < 0 ? 1000 + routines.indexOf(r) : i;
  };
  return routines.filter((r) => r.days.includes(day)).sort((a, b) => pos(a) - pos(b));
};

export const moveItem = <T>(list: T[], from: number, to: number) => {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

export const sortDays = (days: DayOfWeek[]) => [...new Set(days)].sort((a, b) => a - b);
