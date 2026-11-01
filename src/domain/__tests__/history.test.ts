import { dayKeyToTime, shiftDay } from '../day';
import { archiveDay, HISTORY_DAYS, oldestDay, pruneHistory } from '../history';
import { finishRoutine, openRoutine, rollover, setResultFace, setResultSticker, toggleStep } from '../today';
import { T0, makeState, min } from './fixtures';

const DAY = 24 * 60 * 60_000;

describe('day helpers', () => {
  it('shiftDay crosses months and years', () => {
    expect(shiftDay('2026-10-12', -1)).toBe('2026-10-11');
    expect(shiftDay('2026-03-01', -1)).toBe('2026-02-28');
    expect(shiftDay('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('dayKeyToTime lands on that local day', () => {
    expect(new Date(dayKeyToTime('2026-10-12')).getDate()).toBe(12);
  });
});

describe('archiveDay', () => {
  it("snapshots the day's routines in order, with progress and results", () => {
    // Monday: morning + school are scheduled.
    let s = toggleStep(openRoutine(makeState(), 'morning', T0), 'morning', 'wake', T0 + min(1));
    s = finishRoutine(s, 'morning', T0 + min(2));
    s = setResultSticker(setResultFace(s, 'morning', 'angry'), 'morning', '🦄');
    const record = archiveDay(s)!;
    expect(record.dayKey).toBe('2026-10-12');
    expect(record.routines.map((r) => r.id)).toEqual(['morning', 'school']);
    expect(record.routines[0]).toMatchObject({
      name: 'Morning',
      emoji: '🌅',
      doneSteps: 1,
      totalSteps: 3,
      result: { rating: 'regular', faceOverride: 'angry', sticker: '🦄' },
    });
    expect(record.routines[1]).toMatchObject({ doneSteps: 0, totalSteps: 1, result: null });
  });

  it('includes routines used that day even if not scheduled', () => {
    // Sunday: school isn't scheduled, but was opened.
    const sunday = T0 - DAY;
    const s = openRoutine(makeState({ dayKey: '2026-10-11' }), 'school', sunday);
    expect(archiveDay(s)!.routines.map((r) => r.id)).toEqual(['morning', 'school']);
  });

  it('is null when nothing was scheduled or used', () => {
    expect(archiveDay(makeState({ routines: [] }))).toBeNull();
  });
});

describe('rollover', () => {
  it('archives the finished day into history', () => {
    const s = finishRoutine(openRoutine(makeState(), 'morning', T0), 'morning', T0 + min(1));
    const next = rollover(s, T0 + DAY);
    expect(Object.keys(next.history)).toEqual(['2026-10-12']);
    expect(next.history['2026-10-12'].routines[0].result).not.toBeNull();
    expect(next.results).toEqual({});
  });

  it(`keeps only the last ${HISTORY_DAYS} days`, () => {
    const old = { dayKey: '2026-01-01', routines: [] };
    const s = makeState({ history: { '2026-01-01': old } });
    expect(rollover(s, T0 + DAY).history).not.toHaveProperty('2026-01-01');
  });
});

it('pruneHistory keeps identity when nothing is dropped', () => {
  const h = { '2026-10-10': { dayKey: '2026-10-10', routines: [] } };
  expect(pruneHistory(h, '2026-10-12')).toBe(h);
});

it('oldestDay', () => {
  expect(oldestDay({})).toBeUndefined();
  expect(
    oldestDay({
      '2026-10-10': { dayKey: '2026-10-10', routines: [] },
      '2026-09-01': { dayKey: '2026-09-01', routines: [] },
    }),
  ).toBe('2026-09-01');
});
