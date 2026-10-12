/** 0 = Sunday … 6 = Saturday (matches `Date#getDay`). */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** `max` = "Up to N min" (can finish early); `exact` = must last N min, checks itself off. */
export type StepMode = 'max' | 'exact';

export type Step = {
  id: string;
  emoji: string;
  label: string;
  /** 1–60 */
  mins: number;
  mode: StepMode;
};

export type Routine = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  days: DayOfWeek[];
  steps: Step[];
};

export type Rating = 'good' | 'regular' | 'bad';

export type RoutineResult = {
  rating: Rating;
  done: number;
  total: number;
  /** epoch ms */
  at: number;
  /** seconds since the routine was opened */
  secs: number;
};

/** All timestamps are epoch ms — never store counters, so timers survive leaving the screen or app. */
export type RoutineTimer = {
  /** When the routine was first opened today (drives the "All steps" countdown). */
  start: number;
  /** When the current max-mode step's countdown began (reset on every toggle). */
  stepStart: number;
  /** The exact-mode step currently running, if any. */
  run: { stepId: string; start: number } | null;
};

export type Settings = {
  kidName: string;
  /** Completion % at or above which the result is "regular" (👀) instead of "bad" (😬). */
  regularMin: number;
  confetti: boolean;
};

/** Data that belongs to a single calendar day and is cleared when the day changes. */
export type TodayData = {
  /** Local date, YYYY-MM-DD. */
  dayKey: string;
  /** routineId → done step ids */
  progress: Record<string, string[]>;
  results: Record<string, RoutineResult>;
  timers: Record<string, RoutineTimer>;
};

export type AppData = TodayData & {
  routines: Routine[];
  /** Per-weekday routine order. Routines missing from a list sort after it, in creation order. */
  dayOrder: Partial<Record<DayOfWeek, string[]>>;
  settings: Settings;
};
