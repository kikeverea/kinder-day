import {
  addStep,
  canSave,
  clampMins,
  draftFromRoutine,
  EMPTY_NEW_STEP,
  moveStep,
  newDraft,
  removeStep,
  toggleDay,
  toggleEveryDay,
  toggleMode,
  toRoutine,
  updateStep,
} from '../draft';
import { morning } from './fixtures';

describe('newDraft', () => {
  it('defaults to every day, ⭐ and the next palette colour', () => {
    const d = newDraft(3);
    expect(d).toMatchObject({ name: '', emoji: '⭐', color: '#8EC9FF', steps: [], isNew: true });
    expect(d.days).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(newDraft(6).color).toBe('#FFB38A'); // wraps around
  });
});

it('draftFromRoutine copies so edits never touch the store', () => {
  const d = draftFromRoutine(morning);
  expect(d.isNew).toBe(false);
  expect(d.steps).not.toBe(morning.steps);
  expect(d.steps[0]).not.toBe(morning.steps[0]);
  expect(d.days).not.toBe(morning.days);
});

it('toRoutine drops isNew and trims the name', () => {
  const r = toRoutine({ ...draftFromRoutine(morning), name: '  Sunrise ' });
  expect(r).not.toHaveProperty('isNew');
  expect(r.name).toBe('Sunrise');
});

it('canSave needs a name and at least one step', () => {
  expect(canSave(newDraft(0))).toBe(false);
  expect(canSave({ ...newDraft(0), name: 'Play' })).toBe(false);
  expect(canSave({ ...draftFromRoutine(morning), name: '   ' })).toBe(false);
  expect(canSave(draftFromRoutine(morning))).toBe(true);
});

it('clampMins keeps 1–60', () => {
  expect(clampMins(0)).toBe(1);
  expect(clampMins(61)).toBe(60);
  expect(clampMins(7)).toBe(7);
});

it('toggleMode flips max ↔ exact', () => {
  expect(toggleMode('max')).toBe('exact');
  expect(toggleMode('exact')).toBe('max');
});

describe('days', () => {
  it('toggleDay adds (sorted) and removes', () => {
    const d = { ...newDraft(0), days: [1, 5] as const };
    expect(toggleDay({ ...d, days: [1, 5] }, 3).days).toEqual([1, 3, 5]);
    expect(toggleDay({ ...d, days: [1, 5] }, 5).days).toEqual([1]);
  });

  it('toggleEveryDay turns all on, or all off when already every day', () => {
    expect(toggleEveryDay({ ...newDraft(0), days: [2] }).days).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(toggleEveryDay(newDraft(0)).days).toEqual([]);
  });
});

describe('steps', () => {
  const d = draftFromRoutine(morning);

  it('addStep trims the label, clamps minutes and gives a new id', () => {
    const next = addStep(d, { ...EMPTY_NEW_STEP, label: '  Feed the dog ', mins: 99, mode: 'exact' });
    expect(next.steps).toHaveLength(4);
    expect(next.steps[3]).toMatchObject({ label: 'Feed the dog', mins: 60, mode: 'exact', emoji: '⭐' });
    expect(next.steps[3].id).toEqual(expect.any(String));
  });

  it('addStep ignores an empty label', () => {
    expect(addStep(d, { ...EMPTY_NEW_STEP, label: '   ' })).toBe(d);
  });

  it('updateStep patches one step and clamps minutes', () => {
    const next = updateStep(d, 'wake', { mins: 0, mode: 'exact' });
    expect(next.steps[0]).toMatchObject({ id: 'wake', mins: 1, mode: 'exact' });
    expect(next.steps[1]).toBe(d.steps[1]);
  });

  it('removeStep and moveStep', () => {
    expect(removeStep(d, 'teeth').steps.map((s) => s.id)).toEqual(['wake', 'dress']);
    expect(moveStep(d, 2, 0).steps.map((s) => s.id)).toEqual(['dress', 'wake', 'teeth']);
  });
});
