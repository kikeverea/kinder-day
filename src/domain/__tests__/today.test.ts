import {
  finishRoutine,
  missedSteps,
  openRoutine,
  pauseStep,
  resetToday,
  resumeStep,
  rollover,
  tick,
  toggleStep,
} from '../today';
import { T0, makeState, min, sec } from './fixtures';

const steps = (s: ReturnType<typeof makeState>) => s.runs.morning.steps;

/** Morning opened at T0 with "Wake up" ticked after 1 min, so "Brush my teeth" (exact) is current. */
const atTeeth = () => toggleStep(openRoutine(makeState(), 'morning', T0), 'morning', 'wake', T0 + min(1));

describe('rollover', () => {
  it('keeps the same object on the same day', () => {
    const s = makeState();
    expect(rollover(s, T0 + min(600))).toBe(s);
  });

  it('clears today data on a new day but keeps routines and settings', () => {
    const s = openRoutine(makeState(), 'morning', T0);
    const next = rollover(s, T0 + min(24 * 60));
    expect(next).toMatchObject({ dayKey: '2026-10-13', runs: {}, results: {} });
    expect(next.routines).toBe(s.routines);
  });
});

describe('openRoutine', () => {
  it('creates the run and starts the first step when it is a max step', () => {
    const s = openRoutine(makeState(), 'morning', T0);
    expect(s.runs.morning.openedAt).toBe(T0);
    expect(steps(s).wake).toEqual({ consumedMs: 0, startedAt: T0, doneAt: null });
  });

  it('keeps the existing run when reopened', () => {
    const s1 = openRoutine(makeState(), 'morning', T0);
    const s2 = openRoutine(s1, 'morning', T0 + min(5));
    expect(s2).toBe(s1);
  });

  it('ignores unknown routines', () => {
    const s = makeState();
    expect(openRoutine(s, 'nope', T0)).toBe(s);
  });
});

describe('max steps', () => {
  it('completing one records its time and makes the next step current', () => {
    const s = atTeeth();
    expect(steps(s).wake).toEqual({ consumedMs: min(1), startedAt: null, doneAt: T0 + min(1) });
    // Next is an exact step: it waits for a tap, so nothing is running.
    expect(steps(s).teeth).toBeUndefined();
  });

  it('the next max step starts automatically', () => {
    let s = atTeeth();
    s = toggleStep(s, 'morning', 'teeth', T0 + min(1));
    s = tick(s, T0 + min(3));
    expect(steps(s).dress.startedAt).toBe(T0 + min(3));
  });

  it('can be ticked out of order', () => {
    const s = toggleStep(openRoutine(makeState(), 'morning', T0), 'morning', 'dress', T0 + sec(10));
    expect(steps(s).dress.doneAt).toBe(T0 + sec(10));
    expect(steps(s).wake.startedAt).toBe(T0); // still current and running
  });

  it('un-doing one resumes it with the time it had left', () => {
    let s = atTeeth(); // wake used 1 min
    s = toggleStep(s, 'morning', 'wake', T0 + min(5));
    expect(steps(s).wake).toEqual({ consumedMs: min(1), startedAt: T0 + min(5), doneAt: null });
  });

  it('after an out-of-order exact step finishes, the first unfinished step runs again', () => {
    let s = openRoutine(makeState(), 'morning', T0);
    s = toggleStep(s, 'morning', 'teeth', T0); // skip ahead: wake pauses, teeth starts
    s = tick(s, T0 + min(2));
    expect(steps(s).wake.startedAt).toBe(T0 + min(2));
  });

  it('un-doing an earlier step pauses the step that was running', () => {
    let s = openRoutine(makeState(), 'morning', T0);
    s = toggleStep(s, 'morning', 'teeth', T0);
    s = toggleStep(s, 'morning', 'wake', T0 + min(3)); // teeth done at 2 min; wake done → dress runs
    expect(steps(s).dress.startedAt).toBe(T0 + min(3));
    s = toggleStep(s, 'morning', 'wake', T0 + min(4));
    expect(steps(s).dress).toEqual({ consumedMs: min(1), startedAt: null, doneAt: null });
    expect(steps(s).wake.startedAt).toBe(T0 + min(4));
  });
});

describe('exact steps and focus mode', () => {
  it('a tap starts the step', () => {
    const s = toggleStep(atTeeth(), 'morning', 'teeth', T0 + min(1));
    expect(steps(s).teeth).toEqual({ consumedMs: 0, startedAt: T0 + min(1), doneAt: null });
  });

  it('starting it pauses the running max step', () => {
    let s = openRoutine(makeState(), 'morning', T0);
    s = toggleStep(s, 'morning', 'teeth', T0 + sec(30));
    expect(steps(s).wake).toEqual({ consumedMs: sec(30), startedAt: null, doneAt: null });
  });

  it('ignores every tap while it runs: it cannot finish early and nothing else can be ticked', () => {
    const running = toggleStep(atTeeth(), 'morning', 'teeth', T0 + min(1));
    expect(toggleStep(running, 'morning', 'teeth', T0 + min(1.5))).toBe(running);
    expect(toggleStep(running, 'morning', 'wake', T0 + min(1.5))).toBe(running);
    expect(toggleStep(running, 'morning', 'dress', T0 + min(1.5))).toBe(running);
  });

  it('auto-completes at the moment its time ran out, even if noticed later', () => {
    let s = toggleStep(atTeeth(), 'morning', 'teeth', T0 + min(1));
    s = tick(s, T0 + min(10)); // app was closed
    expect(steps(s).teeth).toEqual({ consumedMs: min(2), startedAt: null, doneAt: T0 + min(3) });
    expect(steps(s).dress.startedAt).toBe(T0 + min(3));
  });

  it('allows taps again once it is done', () => {
    let s = toggleStep(atTeeth(), 'morning', 'teeth', T0 + min(1));
    s = toggleStep(s, 'morning', 'dress', T0 + min(4));
    expect(steps(s).dress.doneAt).toBe(T0 + min(4));
  });

  it('a done exact step resets to full time on tap, then starts again on the next tap', () => {
    let s = toggleStep(atTeeth(), 'morning', 'teeth', T0 + min(1));
    s = tick(s, T0 + min(3));
    s = toggleStep(s, 'morning', 'teeth', T0 + min(4));
    expect(steps(s).teeth).toEqual({ consumedMs: 0, startedAt: null, doneAt: null });
    s = toggleStep(s, 'morning', 'teeth', T0 + min(5));
    expect(steps(s).teeth.startedAt).toBe(T0 + min(5));
  });
});

describe('pause / resume', () => {
  const paused = () => {
    const s = toggleStep(atTeeth(), 'morning', 'teeth', T0 + min(1));
    return pauseStep(s, 'morning', T0 + min(1) + sec(50));
  };

  it('pausing keeps the used time and stops the clock', () => {
    expect(steps(paused()).teeth).toEqual({ consumedMs: sec(50), startedAt: null, doneAt: null });
  });

  it('a paused step never expires', () => {
    const s = tick(paused(), T0 + min(60));
    expect(steps(s).teeth.doneAt).toBeNull();
  });

  it('focus mode stays on while paused: other taps are still ignored', () => {
    const s = paused();
    expect(toggleStep(s, 'morning', 'dress', T0 + min(3))).toBe(s);
  });

  it('resuming continues with total time minus consumed', () => {
    let s = resumeStep(paused(), 'morning', T0 + min(5));
    expect(steps(s).teeth).toEqual({ consumedMs: sec(50), startedAt: T0 + min(5), doneAt: null });
    s = tick(s, T0 + min(10));
    expect(steps(s).teeth.doneAt).toBe(T0 + min(5) + sec(70));
  });

  it('pause and resume are no-ops outside focus mode', () => {
    const s = atTeeth();
    expect(pauseStep(s, 'morning', T0 + min(2))).toBe(s);
    expect(resumeStep(s, 'morning', T0 + min(2))).toBe(s);
  });
});

describe('finishRoutine', () => {
  it('rates by completion against the threshold and records elapsed time', () => {
    let s = atTeeth();
    s = finishRoutine(s, 'morning', T0 + min(4));
    expect(s.results.morning).toEqual({
      rating: 'bad',
      doneSteps: 1,
      totalSteps: 3,
      finishedAt: T0 + min(4),
      secs: 240,
    });

    s = toggleStep(s, 'morning', 'dress', T0 + min(5));
    s = finishRoutine(s, 'morning', T0 + min(6));
    expect(s.results.morning.rating).toBe('regular');
  });

  it('counts an exact step that ran out before finishing', () => {
    let s = toggleStep(atTeeth(), 'morning', 'dress', T0 + min(1));
    s = toggleStep(s, 'morning', 'teeth', T0 + min(1));
    s = finishRoutine(s, 'morning', T0 + min(3));
    expect(s.results.morning).toMatchObject({ rating: 'good', doneSteps: 3 });
  });

  it('respects a custom threshold', () => {
    let s = makeState({ settings: { kidName: 'Mia', regularMin: 30, confetti: true } });
    s = toggleStep(s, 'morning', 'wake', T0);
    expect(finishRoutine(s, 'morning', T0).results.morning.rating).toBe('regular');
  });
});

it('resetToday clears runs and results', () => {
  const s = finishRoutine(atTeeth(), 'morning', T0 + min(2));
  expect(resetToday(s, T0 + min(2))).toMatchObject({ runs: {}, results: {} });
});

it('missedSteps lists steps not done', () => {
  expect(missedSteps(atTeeth(), 'morning').map((x) => x.id)).toEqual(['teeth', 'dress']);
});
