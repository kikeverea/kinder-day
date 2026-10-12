import { DAY_ABBR, WEEK } from './constants';
import type { DayOfWeek, Routine } from './types';

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

export const routineMinutes = (routine: Pick<Routine, 'steps'>) =>
  routine.steps.reduce((sum, s) => sum + s.mins, 0);

export const greeting = (hour: number) =>
  hour < 12
    ? { text: 'Good morning,', emoji: '☀️' }
    : hour < 18
      ? { text: 'Good afternoon,', emoji: '🌈' }
      : { text: 'Good evening,', emoji: '🌙' };
