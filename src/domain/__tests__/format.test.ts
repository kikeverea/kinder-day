import { daysLabel, formatClock, greeting, plural, routineMinutes } from '../format';
import { morning } from './fixtures';

describe('formatClock', () => {
  it.each([
    [0, '0:00'],
    [5, '0:05'],
    [165, '2:45'],
    [3600, '60:00'],
    [-42, '0:42'],
  ])('%i s → %s', (secs, out) => expect(formatClock(secs)).toBe(out));
});

describe('daysLabel', () => {
  it.each([
    [[0, 1, 2, 3, 4, 5, 6], 'Every day'],
    [[], 'No days yet'],
    [[1, 2, 3, 4, 5], 'Weekdays'],
    [[0, 6], 'Weekends'],
    [[5, 1, 3], 'Mon, Wed, Fri'],
    [[0, 1], 'Mon, Sun'],
  ] as const)('%j → %s', (days, out) => expect(daysLabel([...days])).toBe(out));
});

it('greets by time of day', () => {
  expect(greeting(7).text).toBe('Good morning,');
  expect(greeting(12).text).toBe('Good afternoon,');
  expect(greeting(18).emoji).toBe('🌙');
});

it('pluralizes and sums minutes', () => {
  expect(plural(1, 'step')).toBe('1 step');
  expect(plural(3, 'step')).toBe('3 steps');
  expect(routineMinutes(morning)).toBe(9);
});
