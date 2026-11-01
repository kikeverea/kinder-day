/** Saved steps ("templates") the routine editor can reuse. Pure transitions on `stepTemplates`. */
import { clampStep, type NewStep } from './draft';
import { uid } from './ids';
import type { AppData, Step } from './types';

/** Templates are matched by label, ignoring case and surrounding spaces. */
const sameLabel = (a: Pick<Step, 'label'>, b: Pick<Step, 'label'>) =>
  a.label.trim().toLowerCase() === b.label.trim().toLowerCase();

/** The saved template with this step's label, if any. */
export const templateFor = (templates: Step[], step: Pick<Step, 'label'>) =>
  templates.find((t) => sameLabel(t, step));

/** The step is saved exactly as it is (same label, icon, mode and minutes). */
export const isSavedTemplate = (templates: Step[], step: NewStep) => {
  const t = templateFor(templates, step);
  return (
    !!t &&
    t.emoji === step.emoji &&
    t.mode === step.mode &&
    t.mins === step.mins &&
    t.beforeMins === step.beforeMins &&
    t.afterMins === step.afterMins
  );
};

/**
 * Saves a step for reuse. A template with the same label is updated in place, so saving an
 * edited step refreshes it. Steps without a label are ignored; nothing changes when already saved.
 */
export const saveStepTemplate = <S extends AppData>(state: S, step: NewStep): S => {
  const label = step.label.trim();
  if (!label || isSavedTemplate(state.stepTemplates, step)) return state;
  const { emoji, mins, mode, beforeMins, afterMins } = step;
  const fields = clampStep({ emoji, label, mins, mode, beforeMins, afterMins });
  const existing = templateFor(state.stepTemplates, step);
  return {
    ...state,
    stepTemplates: existing
      ? state.stepTemplates.map((t) => (t.id === existing.id ? { ...fields, id: t.id } : t))
      : [...state.stepTemplates, { ...fields, id: uid() }],
  };
};

export const deleteStepTemplate = <S extends AppData>(state: S, templateId: string): S =>
  state.stepTemplates.some((t) => t.id === templateId)
    ? { ...state, stepTemplates: state.stepTemplates.filter((t) => t.id !== templateId) }
    : state;
