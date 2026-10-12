import { moveItem, routinesForDay, sortDays } from '../schedule';
import { morning, school } from './fixtures';

const bed = { ...morning, id: 'bed', name: 'Bedtime' };

describe('routinesForDay', () => {
  it('filters by weekday', () => {
    expect(routinesForDay([morning, school], {}, 0).map((r) => r.id)).toEqual(['morning']);
    expect(routinesForDay([morning, school], {}, 1).map((r) => r.id)).toEqual(['morning', 'school']);
  });

  it('follows the saved order, unlisted routines last in creation order', () => {
    const ids = routinesForDay([morning, school, bed], { 1: ['school'] }, 1).map((r) => r.id);
    expect(ids).toEqual(['school', 'morning', 'bed']);
  });
});

it('moveItem moves without mutating', () => {
  const list = ['a', 'b', 'c', 'd'];
  expect(moveItem(list, 0, 2)).toEqual(['b', 'c', 'a', 'd']);
  expect(moveItem(list, 3, 0)).toEqual(['d', 'a', 'b', 'c']);
  expect(list).toEqual(['a', 'b', 'c', 'd']);
});

it('sortDays dedupes and sorts', () => {
  expect(sortDays([5, 1, 5, 0])).toEqual([0, 1, 5]);
});
