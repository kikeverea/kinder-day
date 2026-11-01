import { cheerFor, focusState, stepRow, timerCard, totalLeft } from '../timer';
import type { RoutineRun, StepRun } from '../types';
import { T0, buffered, min, morning, sec } from './fixtures';

const run = (steps: Record<string, Partial<StepRun>> = {}): RoutineRun => ({
  openedAt: T0,
  finishedAt: null,
  stoppedMs: 0,
  steps: Object.fromEntries(
    Object.entries(steps).map(([id, sr]) => [id, { consumedMs: 0, startedAt: null, doneAt: null, ...sr }]),
  ),
});
const done = { doneAt: T0, consumedMs: min(1) };
const [wake, teeth, dress] = morning.steps;

describe('timerCard', () => {
  it('counts down the running max step', () => {
    const c = timerCard(morning, run({ wake: { startedAt: T0 } }), T0 + sec(30));
    expect(c).toMatchObject({ step: { id: 'wake' }, left: 90, fraction: 0.75, state: 'running' });
  });

  it('keeps counting past zero as overtime', () => {
    const c = timerCard(morning, run({ wake: { startedAt: T0 } }), T0 + sec(150));
    expect(c).toMatchObject({ left: -30, fraction: 0, state: 'overtime' });
  });

  it('shows the full time for an exact step waiting for a tap', () => {
    const c = timerCard(morning, run({ wake: done }), T0 + min(9));
    expect(c).toMatchObject({ step: { id: 'teeth' }, left: 120, fraction: 1, state: 'waiting' });
  });

  it('is hidden in focus mode and when everything is done', () => {
    expect(timerCard(morning, run({ teeth: { startedAt: T0 } }), T0)).toBeUndefined();
    expect(timerCard(morning, run({ wake: done, teeth: done, dress: done }), T0)).toBeUndefined();
  });
});

describe('totalLeft', () => {
  it('is the total step time when nothing ran', () => {
    expect(totalLeft(morning, undefined, T0)).toBe(540);
  });

  it('keeps running while an exact step waits for a tap', () => {
    // wake used 1 min; teeth then waits 2 min for a tap
    expect(totalLeft(morning, run({ wake: done }), T0 + min(3))).toBe(360);
  });

  it('keeps running while an exact step is paused', () => {
    const paused = run({ wake: done, teeth: { consumedMs: sec(30) } });
    expect(totalLeft(morning, paused, T0 + min(4))).toBe(300);
  });

  it("adds exact steps' buffers to the total", () => {
    expect(totalLeft(buffered, undefined, T0)).toBe(720);
    expect(totalLeft(buffered, run({ wake: done }), T0 + min(10))).toBe(120);
  });

  it('goes negative when over time', () => {
    expect(totalLeft(morning, run({ wake: { startedAt: T0 } }), T0 + min(10))).toBe(-60);
  });

  it('stops while finished and skips that time after reopening', () => {
    expect(totalLeft(morning, { ...run(), finishedAt: T0 + min(2) }, T0 + min(30))).toBe(420);
    // reopened at T0 + 30 min after 28 min finished
    expect(totalLeft(morning, { ...run(), stoppedMs: min(28) }, T0 + min(31))).toBe(360);
  });
});

describe('stepRow', () => {
  it('reports idle, running, paused and done', () => {
    expect(stepRow(wake, undefined, T0).status).toBe('idle');
    expect(stepRow(wake, run({ wake: { startedAt: T0 } }), T0).status).toBe('running');
    expect(stepRow(teeth, run({ teeth: { consumedMs: sec(30) } }), T0).status).toBe('paused');
    expect(stepRow(wake, run({ wake: done }), T0).status).toBe('done');
  });

  it('gives the used fraction for the exact step fill', () => {
    const r = stepRow(teeth, run({ teeth: { consumedMs: sec(30), startedAt: T0 } }), T0 + sec(30));
    expect(r).toMatchObject({ usedFraction: 0.5, left: 60 });
  });

  it('flags overtime only for an unfinished max step past its time', () => {
    expect(stepRow(wake, run({ wake: { startedAt: T0 } }), T0 + min(3)).overtime).toBe(true);
    expect(stepRow(wake, run({ wake: { ...done, consumedMs: min(3) } }), T0).overtime).toBe(false);
    expect(stepRow(dress, undefined, T0).overtime).toBe(false);
  });

  it('marks only done exact steps as resettable', () => {
    expect(stepRow(teeth, run({ teeth: done }), T0).resettable).toBe(true);
    expect(stepRow(wake, run({ wake: done }), T0).resettable).toBe(false);
    expect(stepRow(teeth, undefined, T0).resettable).toBe(false);
  });
});

describe('focusState', () => {
  it('is off when no exact step is started', () => {
    expect(focusState(morning, run({ wake: { startedAt: T0 } }), T0)).toBeUndefined();
  });

  it('is off once the exact step is done', () => {
    expect(focusState(morning, run({ teeth: done }), T0)).toBeUndefined();
  });

  it('describes the running step', () => {
    expect(focusState(morning, run({ teeth: { startedAt: T0 } }), T0 + sec(30))).toMatchObject({
      step: { id: 'teeth' },
      stepNumber: 2,
      totalSteps: 3,
      left: 90,
      fraction: 0.75,
      paused: false,
      cheer: 'Nice and slow 🐢',
    });
  });

  it('stays on while paused, frozen at the consumed time', () => {
    expect(focusState(morning, run({ teeth: { consumedMs: sec(90) } }), T0 + min(30))).toMatchObject({
      left: 30,
      paused: true,
    });
  });

  it('clamps at 0 when time is up', () => {
    expect(focusState(morning, run({ teeth: { startedAt: T0 } }), T0 + sec(500))).toMatchObject({
      left: 0,
      fraction: 0,
    });
  });
});

it.each([
  [1, 'Nice and slow 🐢'],
  [0.67, 'Nice and slow 🐢'],
  [0.66, "You're doing great!"],
  [0.34, "You're doing great!"],
  [0.33, 'Almost there…'],
  [0.11, 'Almost there…'],
  [0.1, 'Last few seconds! ✨'],
  [0, 'Last few seconds! ✨'],
])('cheerFor(%f) → %s', (fraction, cheer) => expect(cheerFor(fraction)).toBe(cheer));
