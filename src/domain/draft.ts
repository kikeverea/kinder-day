/** Pure editing operations for the routine editor's local draft (saved with `upsertRoutine`). */
import {
  ALL_DAYS,
  DEFAULT_ADD_ON_MINS,
  DEFAULT_STEP_MINS,
  MAX_BUFFER_MINS,
  MAX_STEP_MINS,
  MIN_BUFFER_MINS,
  MIN_STEP_MINS,
  ROUTINE_COLORS,
} from './constants';
import { uid } from './ids';
import { moveItem, sortDays } from './schedule';
import type { AddOn, DayOfWeek, Routine, Step, StepMode } from './types';

export type RoutineDraft = Routine & { isNew: boolean };

/** The "Add a step…" box. */
export type NewStep = Omit<Step, 'id'>;

export const EMPTY_NEW_STEP: NewStep = {
  emoji: '⭐',
  label: '',
  mins: DEFAULT_STEP_MINS,
  mode: 'max',
  beforeMins: 0,
  afterMins: 0,
};

/** New routines default to every day, ⭐, and the next palette colour. */
export const newDraft = (existingCount: number): RoutineDraft => ({
  id: uid(),
  name: '',
  emoji: '⭐',
  color: ROUTINE_COLORS[existingCount % ROUTINE_COLORS.length],
  days: [...ALL_DAYS],
  timed: true,
  steps: [],
  addOns: [],
  isNew: true,
});

export const draftFromRoutine = (routine: Routine): RoutineDraft => ({
  ...routine,
  days: [...routine.days],
  steps: routine.steps.map((s) => ({ ...s })),
  addOns: routine.addOns.map((a) => ({ ...a })),
  isNew: false,
});

export const toRoutine = ({ isNew: _isNew, ...routine }: RoutineDraft): Routine => ({
  ...routine,
  name: routine.name.trim(),
});

/** A non-exact step without time in a timed routine: it must get one before the routine is saved. */
export const needsTime = (step: Pick<Step, 'mins' | 'mode'>, timed: boolean) =>
  timed && step.mode === 'max' && step.mins === 0;

/** "Create routine" / "Save changes" needs a name, at least one step and every step timed. */
export const canSave = (draft: RoutineDraft) =>
  draft.name.trim().length > 0 &&
  draft.steps.length > 0 &&
  !draft.steps.some((s) => needsTime(s, draft.timed));

export const clampMins = (mins: number) => Math.min(MAX_STEP_MINS, Math.max(MIN_STEP_MINS, mins));

export const clampBufferMins = (mins: number) =>
  Math.min(MAX_BUFFER_MINS, Math.max(MIN_BUFFER_MINS, mins));

/** Clamps minutes and buffers. Without timer, non-exact steps have no time (0). */
export const clampStep = <T extends NewStep>(step: T, timed = true): T => ({
  ...step,
  mins: !timed && step.mode === 'max' ? 0 : clampMins(step.mins),
  beforeMins: clampBufferMins(step.beforeMins),
  afterMins: clampBufferMins(step.afterMins),
});

/**
 * Switches a routine between timed and no timer. Without timer, non-exact steps lose their time;
 * back to timed, they need one again (`needsTime`). Buffers and add-ons are kept but unused.
 */
export const setTimed = (draft: RoutineDraft, timed: boolean): RoutineDraft =>
  draft.timed === timed
    ? draft
    : { ...draft, timed, steps: draft.steps.map((s) => (s.mode === 'max' ? { ...s, mins: 0 } : s)) };

/** Flips a step between exact and the routine's other mode, giving a step that becomes exact a time. */
export const toggleStepMode = (draft: RoutineDraft, stepId: string): RoutineDraft => {
  const step = draft.steps.find((s) => s.id === stepId);
  if (!step) return draft;
  const mode = toggleMode(step.mode);
  return updateStep(draft, stepId, { mode, mins: step.mins || DEFAULT_STEP_MINS });
};

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
    steps: [...draft.steps, clampStep({ ...step, id: uid(), label }, draft.timed)],
  };
};

export const updateStep = (
  draft: RoutineDraft,
  stepId: string,
  patch: Partial<Omit<Step, 'id'>>,
): RoutineDraft => ({
  ...draft,
  steps: draft.steps.map((s) => (s.id === stepId ? clampStep({ ...s, ...patch }, draft.timed) : s)),
});

export const removeStep = (draft: RoutineDraft, stepId: string): RoutineDraft => ({
  ...draft,
  steps: draft.steps.filter((s) => s.id !== stepId),
});

export const moveStep = (draft: RoutineDraft, from: number, to: number): RoutineDraft => ({
  ...draft,
  steps: moveItem(draft.steps, from, to),
});

/** The "Add an add-on…" box. */
export type NewAddOn = Omit<AddOn, 'id'>;

export const EMPTY_NEW_ADD_ON: NewAddOn = { emoji: '🚽', label: '', mins: DEFAULT_ADD_ON_MINS };

/** Adds the add-on if it has a label; returns the same draft otherwise. */
export const addAddOn = (draft: RoutineDraft, addOn: NewAddOn): RoutineDraft => {
  const label = addOn.label.trim();
  if (!label) return draft;
  return {
    ...draft,
    addOns: [...draft.addOns, { ...addOn, id: uid(), label, mins: clampMins(addOn.mins) }],
  };
};

export const updateAddOnMins = (draft: RoutineDraft, addOnId: string, mins: number): RoutineDraft => ({
  ...draft,
  addOns: draft.addOns.map((a) => (a.id === addOnId ? { ...a, mins: clampMins(mins) } : a)),
});

export const removeAddOn = (draft: RoutineDraft, addOnId: string): RoutineDraft => ({
  ...draft,
  addOns: draft.addOns.filter((a) => a.id !== addOnId),
});
