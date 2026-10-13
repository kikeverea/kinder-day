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

/** Faces a result can show: the three ratings plus parent-only extremes. */
export type ResultFace = 'angry' | Rating | 'unicorn';

export type RoutineResult = {
  rating: Rating;
  /** Steps checked off when the routine was finished (0…totalSteps). */
  doneSteps: number;
  totalSteps: number;
  finishedAt: number;
  /** Seconds since the routine was opened. */
  secs: number;
  /** Seconds over the routine's total time when finished (0 when on time). */
  overtimeSecs: number;
  /** Face picked by a grown-up; null shows the face for `rating`. */
  faceOverride: ResultFace | null;
};

/**
 * One step's own timer. Timestamps are epoch ms and named `…At`; never store counters,
 * so timers stay correct while the screen or app is closed.
 *
 * Time used = `consumedMs` + (`startedAt` ? now − startedAt : 0).
 * Pausing folds the current stretch into `consumedMs`; resuming sets a new `startedAt`.
 */
export type StepRun = {
  /** Time used in earlier, finished running stretches. */
  consumedMs: number;
  /** When the current running stretch began; null when idle or paused. */
  startedAt: number | null;
  /** When the step was completed; null while not done. */
  doneAt: number | null;
};

/** A routine's activity today. At most one of its steps is running at any moment. */
export type RoutineRun = {
  /** When the routine was first opened today. */
  openedAt: number;
  /** When "I'm finished" was tapped; null while in progress. A finished run's clock is stopped. */
  finishedAt: number | null;
  /** stepId → that step's timer. Steps never touched have no entry. */
  steps: Record<string, StepRun>;
};

export type Settings = {
  kidName: string;
  /** Minutes over the routine's time still rated "regular" (😶); beyond that it's "bad" (😬). */
  graceMins: number;
  confetti: boolean;
};

/** Data that belongs to a single calendar day and is cleared when the day changes. */
export type TodayData = {
  /** Local date, YYYY-MM-DD. */
  dayKey: string;
  /** routineId → today's run */
  runs: Record<string, RoutineRun>;
  results: Record<string, RoutineResult>;
};

export type AppData = TodayData & {
  routines: Routine[];
  /** Per-weekday routine order. Routines missing from a list sort after it, in creation order. */
  dayOrder: Partial<Record<DayOfWeek, string[]>>;
  settings: Settings;
};
