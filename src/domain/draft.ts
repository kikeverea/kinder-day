/** Pure editing operations for the routine editor's local draft (saved with `upsertRoutine`). */
import { ALL_DAYS, DEFAULT_STEP_MINS, MAX_STEP_MINS, MIN_STEP_MINS, ROUTINE_COLORS } from './constants';
import { uid } from './ids';
import { moveItem, sortDays } from './schedule';
import type { DayOfWeek, Routine, Step, StepMode } from './types';

export type RoutineDraft = Routine & { isNew: boolean };

/** The "Add a step…" box. */
export type NewStep = Omit<Step, 'id'>;

export const EMPTY_NEW_STEP: NewStep = {
  emoji: '⭐',
  label: '',
  mins: DEFAULT_STEP_MINS,
  mode: 'max',
};

/** New routines default to every day, ⭐, and the next palette colour. */
export const newDraft = (existingCount: number): RoutineDraft => ({
  id: uid(),
  name: '',
  emoji: '⭐',
  color: ROUTINE_COLORS[existingCount % ROUTINE_COLORS.length],
  days: [...ALL_DAYS],
  steps: [],
  isNew: true,
});

export const draftFromRoutine = (routine: Routine): RoutineDraft => ({
  ...routine,
  days: [...routine.days],
  steps: routine.steps.map((s) => ({ ...s })),
  isNew: false,
});

export const toRoutine = ({ isNew: _isNew, ...routine }: RoutineDraft): Routine => ({
  ...routine,
  name: routine.name.trim(),
});

/** "Create routine" / "Save changes" needs a name and at least one step. */
export const canSave = (draft: RoutineDraft) => draft.name.trim().length > 0 && draft.steps.length > 0;

export const clampMins = (mins: number) => Math.min(MAX_STEP_MINS, Math.max(MIN_STEP_MINS, mins));

export const toggleMode = (mode: StepMode): StepMode => (mode === 'max' ? 'exact' : 'max');

export const toggleDay = (draft: RoutineDraft, day: DayOfWeek): RoutineDraft => ({
  ...draft,
  days: draft.days.includes(day) ? draft.days.filter((d) => d !== day) : sortDays([...draft.days, day]),
});

/** "Every day" switch: all days on, or all off when already every day. */
export const toggleEveryDay = (draft: RoutineDraft): RoutineDraft => ({
  ...draft,
  days: draft.days.length === 7 ? [] : [...ALL_DAYS],
});

/** Adds the step if it has a label; returns the same draft otherwise. */
export const addStep = (draft: RoutineDraft, step: NewStep): RoutineDraft => {
  const label = step.label.trim();
  if (!label) return draft;
  return {
    ...draft,
    steps: [...draft.steps, { ...step, id: uid(), label, mins: clampMins(step.mins) }],
  };
};

export const updateStep = (
  draft: RoutineDraft,
  stepId: string,
  patch: Partial<Omit<Step, 'id'>>,
): RoutineDraft => ({
  ...draft,
  steps: draft.steps.map((s) =>
    s.id === stepId
      ? { ...s, ...patch, mins: clampMins(patch.mins ?? s.mins) }
      : s,
  ),
});

export const removeStep = (draft: RoutineDraft, stepId: string): RoutineDraft => ({
  ...draft,
  steps: draft.steps.filter((s) => s.id !== stepId),
});

export const moveStep = (draft: RoutineDraft, from: number, to: number): RoutineDraft => ({
  ...draft,
  steps: moveItem(draft.steps, from, to),
});
