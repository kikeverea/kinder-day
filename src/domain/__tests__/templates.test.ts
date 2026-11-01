import { addStep, draftFromRoutine, EMPTY_NEW_STEP } from '../draft';
import {
  deleteAddOnTemplate,
  deleteStepTemplate,
  isSavedTemplate,
  saveAddOnTemplate,
  saveStepTemplate,
  templateFor,
} from '../templates';
import { makeState, morning } from './fixtures';

const [, teeth] = morning.steps;

describe('saveStepTemplate', () => {
  it('saves a step with its own id', () => {
    const s = saveStepTemplate(makeState(), teeth);
    expect(s.stepTemplates).toHaveLength(1);
    const { id, ...fields } = s.stepTemplates[0];
    expect(id).not.toBe(teeth.id);
    expect(fields).toEqual({ emoji: '🪥', label: 'Brush my teeth', mins: 2, mode: 'exact', beforeMins: 0, afterMins: 0 });
  });

  it('trims the label and ignores steps without one', () => {
    const s = makeState();
    expect(saveStepTemplate(s, { ...EMPTY_NEW_STEP, label: '   ' })).toBe(s);
    expect(saveStepTemplate(s, { ...EMPTY_NEW_STEP, label: ' Read ' }).stepTemplates[0].label).toBe('Read');
  });

  it('updates the template with the same label instead of duplicating it', () => {
    const s1 = saveStepTemplate(makeState(), teeth);
    const s2 = saveStepTemplate(s1, { ...teeth, label: 'brush MY teeth ', mins: 3, afterMins: 2 });
    expect(s2.stepTemplates).toHaveLength(1);
    expect(s2.stepTemplates[0]).toMatchObject({ id: s1.stepTemplates[0].id, mins: 3, afterMins: 2 });
  });

  it('keeps the same state when already saved as is', () => {
    const s = saveStepTemplate(makeState(), teeth);
    expect(saveStepTemplate(s, teeth)).toBe(s);
  });

  it('clamps minutes', () => {
    const s = saveStepTemplate(makeState(), { ...teeth, mins: 99, beforeMins: -3 });
    expect(s.stepTemplates[0]).toMatchObject({ mins: 60, beforeMins: 0 });
  });
});

describe('isSavedTemplate', () => {
  it('matches by label but needs every field equal', () => {
    const { stepTemplates } = saveStepTemplate(makeState(), teeth);
    expect(templateFor(stepTemplates, { label: 'BRUSH my teeth' })).toBe(stepTemplates[0]);
    expect(isSavedTemplate(stepTemplates, teeth)).toBe(true);
    expect(isSavedTemplate(stepTemplates, { ...teeth, beforeMins: 1 })).toBe(false);
    expect(isSavedTemplate(stepTemplates, { ...teeth, label: 'Floss' })).toBe(false);
  });
});

it('deleteStepTemplate removes it, keeping identity for unknown ids', () => {
  const s = saveStepTemplate(makeState(), teeth);
  expect(deleteStepTemplate(s, 'nope')).toBe(s);
  expect(deleteStepTemplate(s, s.stepTemplates[0].id).stepTemplates).toEqual([]);
});

it('a reused template becomes a new step with a fresh id', () => {
  const [template] = saveStepTemplate(makeState(), teeth).stepTemplates;
  const d = addStep(draftFromRoutine(morning), template);
  expect(d.steps[3]).toMatchObject({ label: 'Brush my teeth', mode: 'exact' });
  expect(d.steps[3].id).not.toBe(template.id);
});

describe('add-on templates', () => {
  const poop = { emoji: '💩', label: 'Poop', mins: 5 };

  it('saves, updates by label and deletes like steps', () => {
    const s1 = saveAddOnTemplate(makeState(), { ...poop, label: ' Poop ' });
    expect(s1.addOnTemplates).toEqual([{ id: expect.any(String), ...poop }]);
    expect(isSavedTemplate(s1.addOnTemplates, poop)).toBe(true);
    expect(saveAddOnTemplate(s1, poop)).toBe(s1);
    const s2 = saveAddOnTemplate(s1, { ...poop, label: 'poop', mins: 99 });
    expect(s2.addOnTemplates).toEqual([{ ...s1.addOnTemplates[0], label: 'poop', mins: 60 }]);
    expect(deleteAddOnTemplate(s2, s2.addOnTemplates[0].id).addOnTemplates).toEqual([]);
    expect(s2.stepTemplates).toBe(s1.stepTemplates);
  });

  it('a saved add-on in the editor compares without its id', () => {
    const { addOnTemplates } = saveAddOnTemplate(makeState(), poop);
    expect(isSavedTemplate(addOnTemplates, { ...poop, id: 'routine-copy' } as typeof poop)).toBe(true);
  });
});
