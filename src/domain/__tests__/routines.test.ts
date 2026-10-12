import {
  addRoutineToDay,
  deleteRoutine,
  removeRoutineFromDay,
  reorderDay,
  upsertRoutine,
} from '../routines';
import { finishRoutine, toggleStep } from '../today';
import { T0, makeState, morning } from './fixtures';

it('upsertRoutine inserts new routines and replaces existing ones, trimming and sorting', () => {
  const created = upsertRoutine(makeState(), { ...morning, id: 'new', name: '  Play  ', days: [3, 1] });
  expect(created.routines.at(-1)).toMatchObject({ id: 'new', name: 'Play', days: [1, 3] });

  const edited = upsertRoutine(created, { ...morning, name: 'Sunrise' });
  expect(edited.routines).toHaveLength(3);
  expect(edited.routines[0].name).toBe('Sunrise');
});

it('deleteRoutine removes all traces', () => {
  let s = makeState({ dayOrder: { 1: ['school', 'morning'], 2: ['morning'] } });
  s = toggleStep(s, 'morning', 'wake', T0);
  s = finishRoutine(s, 'morning', T0);
  const next = deleteRoutine(s, 'morning');
  expect(next.routines.map((r) => r.id)).toEqual(['school']);
  expect(next.dayOrder).toEqual({ 1: ['school'], 2: [] });
  expect(next.progress).toEqual({});
  expect(next.results).toEqual({});
  expect(next.timers).toEqual({});
});

it('removeRoutineFromDay unschedules only that day', () => {
  const s = removeRoutineFromDay(makeState(), 'school', 3);
  expect(s.routines[1].days).toEqual([1, 2, 4, 5]);
});

it('addRoutineToDay schedules and appends to the current order', () => {
  const s = addRoutineToDay(makeState({ dayOrder: { 0: ['morning'] } }), 'school', 0);
  expect(s.routines[1].days).toEqual([0, 1, 2, 3, 4, 5]);
  expect(s.dayOrder[0]).toEqual(['morning', 'school']);
});

it('reorderDay stores the new order', () => {
  expect(reorderDay(makeState(), 1, ['school', 'morning']).dayOrder[1]).toEqual(['school', 'morning']);
});
