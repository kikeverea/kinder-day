import type { DayOfWeek, StepMode } from './types';

export const ALL_DAYS: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];
export const WEEKDAYS: DayOfWeek[] = [1, 2, 3, 4, 5];
/** Display order, Monday first. */
export const WEEK: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 0];

export const DAY_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;
export const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export const DAY_NAME = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const ROUTINE_COLORS = [
  '#FFB38A', // peach
  '#FFD66B', // sun
  '#8FE3B8', // mint
  '#8EC9FF', // sky
  '#C7A8FF', // lilac
  '#FF9EC7', // pink
] as const;

export const ICONS = [
  '🌅', '☀️', '🌙', '🏫', '⏰', '🚽', '🪥', '👕', '👟', '🧦',
  '📅', '🎒', '🧼', '🩰', '🥣', '📚', '✏️', '🛁', '👚', '📖',
  '🛏️', '🧸', '🐶', '🤸‍♀️', '🏊‍♀️', '🎨', '🚲', '🧹', '💧', '⭐',
] as const;

export const MIN_STEP_MINS = 1;
export const MAX_STEP_MINS = 60;
export const DEFAULT_STEP_MINS = 2;

export const MAX_GRACE_MINS = 30;

export const STEP_MODES: Record<StepMode, { label: string; hint: string }> = {
  max: { label: '⚡ Up to', hint: 'Can finish early — the timer is the most time allowed.' },
  exact: {
    label: '⏳ Exactly',
    hint: 'Must last the full time — it checks itself off when the timer ends.',
  },
};

export const FACE_EMOJI = {
  angry: '😡',
  bad: '😬',
  regular: '😶',
  good: '😄',
  unicorn: '🦄',
} as const;

/** Order of the grown-ups' face picker. */
export const FACE_CHOICES = ['angry', 'bad', 'regular', 'good', 'unicorn'] as const;
