import {
  finishRoutine,
  missedSteps,
  openRoutine,
  resetToday,
  resolveExpiredRuns,
  rollover,
  toggleStep,
} from '../today';
import { T0, makeState, min, sec } from './fixtures';

describe('rollover', () => {
  it('keeps the same object on the same day', () => {
    const s = makeState();
    expect(rollover(s, T0 + min(600))).toBe(s);
  });

  it('clears today data on a new day but keeps routines and settings', () => {
    const s = openRoutine(makeState({ progress: { morning: ['wake'] } }), 'morning', T0);
    const next = rollover(s, T0 + min(24 * 60));
    expect(next).toMatchObject({ dayKey: '2026-10-13', progress: {}, results: {}, timers: {} });
    expect(next.routines).toBe(s.routines);
  });
});

describe('openRoutine', () => {
  it('starts timers on first open only', () => {
    const s1 = openRoutine(makeState(), 'morning', T0);
    expect(s1.timers.morning).toEqual({ start: T0, stepStart: T0, run: null });
    const s2 = openRoutine(s1, 'morning', T0 + min(5));
    expect(s2.timers.morning.start).toBe(T0);
  });
});

describe('toggleStep', () => {
  it('toggles a max step and restarts the step countdown', () => {
    const s1 = toggleStep(makeState(), 'morning', 'wake', T0 + sec(30));
    expect(s1.progress.morning).toEqual(['wake']);
    expect(s1.timers.morning.stepStart).toBe(T0 + sec(30));
    const s2 = toggleStep(s1, 'morning', 'wake', T0 + sec(40));
    expect(s2.progress.morning).toEqual([]);
    expect(s2.timers.morning.stepStart).toBe(T0 + sec(40));
  });

  it('starts an exact step instead of completing it', () => {
    const s = toggleStep(makeState(), 'morning', 'teeth', T0);
    expect(s.progress.morning ?? []).toEqual([]);
    expect(s.timers.morning.run).toEqual({ stepId: 'teeth', start: T0 });
  });

  it('ignores taps on a running exact step (cannot finish early)', () => {
    const s1 = toggleStep(makeState(), 'morning', 'teeth', T0);
    const s2 = toggleStep(s1, 'morning', 'teeth', T0 + sec(30));
    expect(s2).toBe(s1);
  });

  it('un-does a finished exact step; next tap restarts it', () => {
    let s = toggleStep(makeState(), 'morning', 'teeth', T0);
    s = resolveExpiredRuns(s, T0 + min(2));
    expect(s.progress.morning).toEqual(['teeth']);
    s = toggleStep(s, 'morning', 'teeth', T0 + min(3));
    expect(s.progress.morning).toEqual([]);
    s = toggleStep(s, 'morning', 'teeth', T0 + min(4));
    expect(s.timers.morning.run).toEqual({ stepId: 'teeth', start: T0 + min(4) });
  });

  it('ignores unknown routines and steps', () => {
    const s = makeState();
    expect(toggleStep(s, 'morning', 'nope', T0).progress).toEqual({});
    expect(toggleStep(s, 'nope', 'wake', T0).progress).toEqual({});
  });
});

describe('resolveExpiredRuns', () => {
  it('leaves a run that has not finished', () => {
    const s = toggleStep(makeState(), 'morning', 'teeth', T0);
    expect(resolveExpiredRuns(s, T0 + sec(119))).toBe(s);
  });

  it('auto-completes and starts the next countdown when the step actually ended', () => {
    const s = toggleStep(makeState(), 'morning', 'teeth', T0);
    // App was backgrounded; we only notice 10 minutes later.
    const next = resolveExpiredRuns(s, T0 + min(10));
    expect(next.progress.morning).toEqual(['teeth']);
    expect(next.timers.morning).toMatchObject({ run: null, stepStart: T0 + min(2) });
  });

  it('drops a run whose step was deleted', () => {
    const s = toggleStep(makeState(), 'morning', 'teeth', T0);
    const edited = {
      ...s,
      routines: s.routines.map((r) =>
        r.id === 'morning' ? { ...r, steps: r.steps.filter((x) => x.id !== 'teeth') } : r,
      ),
    };
    expect(resolveExpiredRuns(edited, T0 + sec(1)).timers.morning.run).toBeNull();
  });
});

describe('finishRoutine', () => {
  it('rates by completion against the threshold and records elapsed time', () => {
    let s = openRoutine(makeState(), 'morning', T0);
    s = toggleStep(s, 'morning', 'wake', T0 + sec(10));
    s = finishRoutine(s, 'morning', T0 + min(4));
    expect(s.results.morning).toEqual({ rating: 'bad', done: 1, total: 3, at: T0 + min(4), secs: 240 });

    s = toggleStep(s, 'morning', 'dress', T0 + min(5));
    s = finishRoutine(s, 'morning', T0 + min(6));
    expect(s.results.morning.rating).toBe('regular');
  });

  it('counts an exact step that elapsed before finishing', () => {
    let s = toggleStep(makeState(), 'morning', 'wake', T0);
    s = toggleStep(s, 'morning', 'teeth', T0);
    s = toggleStep(s, 'morning', 'dress', T0);
    s = finishRoutine(s, 'morning', T0 + min(3));
    expect(s.results.morning).toMatchObject({ rating: 'good', done: 3 });
  });

  it('respects a custom threshold', () => {
    let s = makeState({ settings: { kidName: 'Mia', regularMin: 30, confetti: true } });
    s = toggleStep(s, 'morning', 'wake', T0);
    expect(finishRoutine(s, 'morning', T0).results.morning.rating).toBe('regular');
  });
});

it('resetToday clears progress, results and timers', () => {
  let s = toggleStep(makeState(), 'morning', 'wake', T0);
  s = finishRoutine(s, 'morning', T0);
  expect(resetToday(s, T0)).toMatchObject({ progress: {}, results: {}, timers: {} });
});

it('missedSteps lists steps not done', () => {
  const s = toggleStep(makeState(), 'morning', 'wake', T0);
  expect(missedSteps(s, 'morning').map((x) => x.id)).toEqual(['teeth', 'dress']);
});
