import { completion, rate } from '../progress';
import { T0, morning } from './fixtures';

describe('rate', () => {
  it.each([
    [true, 0, 'good'],
    [true, 1, 'regular'],
    [true, 300, 'regular'],
    [true, 301, 'bad'],
    [false, 0, 'regular'],
    [false, 300, 'regular'],
    [false, 301, 'bad'],
  ] as const)('allDone=%s, %is over → %s', (allDone, overtimeSecs, out) =>
    expect(rate({ allDone, overtimeSecs, graceMins: 5 })).toBe(out),
  );
});

it('completion counts done steps and ignores entries of deleted steps', () => {
  const doneRun = { consumedMs: 0, startedAt: null, doneAt: T0 };
  const run = { openedAt: T0, finishedAt: null, stoppedMs: 0, steps: { wake: doneRun, gone: doneRun } };
  expect(completion(morning, run)).toEqual({ done: 1, total: 3, left: 2, pct: 33 });
});

it('completion of an empty routine is 0%', () => {
  expect(completion({ ...morning, steps: [] }, undefined).pct).toBe(0);
});
