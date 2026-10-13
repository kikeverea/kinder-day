import type { DayOfWeek } from './types';

const pad = (n: number) => String(n).padStart(2, '0');

/** Local calendar date as YYYY-MM-DD. */
export const dayKey = (now: number) => {
  const d = new Date(now);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const dayOfWeek = (now: number) => new Date(now).getDay() as DayOfWeek;

/** Noon local time on the given YYYY-MM-DD (noon avoids DST edge cases). */
export const dayKeyToTime = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 12).getTime();
};

/** The dayKey `days` calendar days after `key` (negative for before). */
export const shiftDay = (key: string, days: number) => {
  const d = new Date(dayKeyToTime(key));
  d.setDate(d.getDate() + days);
  return dayKey(d.getTime());
};
