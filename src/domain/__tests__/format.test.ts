import {
  clockTime,
  dateLabel,
  daysLabel,
  formatClock,
  greeting,
  plural,
  progressLabel,
  resultSubtitle,
  resultSummary,
  resultTitle,
  routineMinutes,
  stepSubtitle,
} from '../format';
import { T0, morning } from './fixtures';

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

it('formats dates and times like the design', () => {
  expect(dateLabel(T0)).toBe('Monday, October 12');
  expect(clockTime(new Date(2026, 9, 12, 7, 42).getTime())).toBe('7:42 AM');
  expect(clockTime(new Date(2026, 9, 12, 0, 5).getTime())).toBe('12:05 AM');
  expect(clockTime(new Date(2026, 9, 12, 12, 0).getTime())).toBe('12:00 PM');
  expect(clockTime(new Date(2026, 9, 12, 19, 30).getTime())).toBe('7:30 PM');
});

it('progressLabel', () => {
  expect(progressLabel(0, 7)).toBe("7 steps · tap each one when it's done");
  expect(progressLabel(3, 7)).toBe('3 done · 4 to go!');
  expect(progressLabel(7, 7)).toBe('Everything done! 🎉');
});

it('stepSubtitle', () => {
  const [wake, teeth] = morning.steps;
  expect(stepSubtitle(wake, false)).toBe('⏱️ Up to 2 min');
  expect(stepSubtitle(teeth, false)).toBe('⏳ Takes 2 min · tap to start');
  expect(stepSubtitle(teeth, true)).toBe('⏳ 2 min — done!');
});

describe('result copy', () => {
  const base = { doneSteps: 7, totalSteps: 7, finishedAt: T0, secs: 600, overtimeSecs: 0 };

  it('good', () => {
    const r = { ...base, rating: 'good' as const };
    expect(resultTitle(r)).toBe('You did it!');
    expect(resultSubtitle(r)).toBe('Every step, right on time. Super star!');
  });

  it('regular because of overtime', () => {
    const r = { ...base, rating: 'regular' as const, overtimeSecs: 120 };
    expect(resultTitle(r)).toBe('Almost on time!');
    expect(resultSubtitle(r)).toBe("Just a little over — you've got this.");
  });

  it('regular because of undone steps, on time', () => {
    const one = { ...base, rating: 'regular' as const, doneSteps: 6 };
    expect(resultTitle(one)).toBe('Hmm… almost!');
    expect(resultSubtitle(one)).toBe('So close! One step is still waiting for you.');
    expect(resultSubtitle({ ...one, doneSteps: 5 })).toBe('So close! 2 steps are still waiting for you.');
  });

  it('bad', () => {
    const r = { ...base, rating: 'bad' as const, overtimeSecs: 400 };
    expect(resultTitle(r)).toBe('Sheesh!');
    expect(resultSubtitle(r)).toBe("That took a while. Let's be quicker next time!");
  });
});

it('resultSummary', () => {
  const r = { rating: 'good' as const, doneSteps: 5, totalSteps: 7, finishedAt: T0, overtimeSecs: 0 };
  expect(resultSummary({ ...r, secs: 720 })).toBe('5 of 7 steps · 12 min');
  expect(resultSummary({ ...r, secs: 20 })).toBe('5 of 7 steps · 1 min');
  expect(resultSummary({ ...r, secs: 0 })).toBe('5 of 7 steps');
});
