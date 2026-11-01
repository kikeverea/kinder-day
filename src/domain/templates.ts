/**
 * Saved steps and add-ons ("templates") the routine editor can reuse. Pure transitions on
 * `stepTemplates` and `addOnTemplates`; both work the same way.
 */
import { clampMins, clampStep, type NewAddOn, type NewStep } from './draft';
import { uid } from './ids';
import type { AddOn, AppData, Step } from './types';

type Saved = { id: string; label: string };

/** Templates are matched by label, ignoring case and surrounding spaces. */
const sameLabel = (a: Pick<Saved, 'label'>, b: Pick<Saved, 'label'>) =>
  a.label.trim().toLowerCase() === b.label.trim().toLowerCase();

/** The saved template with this label, if any. */
export const templateFor = <T extends Saved>(templates: T[], item: Pick<Saved, 'label'>) =>
  templates.find((t) => sameLabel(t, item));

/** The item is saved exactly as it is: same label and every other field equal (its own id aside). */
export const isSavedTemplate = <T extends Saved>(templates: T[], item: Omit<T, 'id'>) => {
  const t = templateFor(templates, item);
  return (
    !!t &&
    Object.entries(item).every(([k, v]) => k === 'id' || k === 'label' || t[k as keyof T] === v)
  );
};

/**
 * Saves `fields` (already trimmed and clamped) into `templates`: a template with the same label is
 * updated in place, otherwise a new one is appended. Same list when there's no label or it's
 * already saved as is.
 */
const saveIn = <T extends Saved>(templates: T[], fields: Omit<T, 'id'>): T[] => {
  if (!fields.label || isSavedTemplate(templates, fields)) return templates;
  const existing = templateFor(templates, fields);
  return existing
    ? templates.map((t) => (t.id === existing.id ? ({ ...fields, id: t.id } as T) : t))
    : [...templates, { ...fields, id: uid() } as T];
};

const deleteIn = <T extends Saved>(templates: T[], templateId: string) =>
  templates.some((t) => t.id === templateId) ? templates.filter((t) => t.id !== templateId) : templates;

/**
 * Saves a step for reuse. A template with the same label is updated in place, so saving an
 * edited step refreshes it. Steps without a label are ignored; nothing changes when already saved.
 */
export const saveStepTemplate = <S extends AppData>(state: S, step: NewStep): S => {
  const { emoji, label, mins, mode, beforeMins, afterMins } = step;
  const fields: Omit<Step, 'id'> = clampStep({ emoji, label: label.trim(), mins, mode, beforeMins, afterMins });
  const stepTemplates = saveIn(state.stepTemplates, fields);
  return stepTemplates === state.stepTemplates ? state : { ...state, stepTemplates };
};

export const deleteStepTemplate = <S extends AppData>(state: S, templateId: string): S => {
  const stepTemplates = deleteIn(state.stepTemplates, templateId);
  return stepTemplates === state.stepTemplates ? state : { ...state, stepTemplates };
};

/** Saves an add-on for reuse, like `saveStepTemplate`. */
export const saveAddOnTemplate = <S extends AppData>(state: S, addOn: NewAddOn): S => {
  const fields: Omit<AddOn, 'id'> = { emoji: addOn.emoji, label: addOn.label.trim(), mins: clampMins(addOn.mins) };
  const addOnTemplates = saveIn(state.addOnTemplates, fields);
  return addOnTemplates === state.addOnTemplates ? state : { ...state, addOnTemplates };
};

export const deleteAddOnTemplate = <S extends AppData>(state: S, templateId: string): S => {
  const addOnTemplates = deleteIn(state.addOnTemplates, templateId);
  return addOnTemplates === state.addOnTemplates ? state : { ...state, addOnTemplates };
};
