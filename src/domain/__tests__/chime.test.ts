import { chimeEvents, warningLeadMs } from '../chime';
import { openRoutine, pauseStep, tick, toggleStep } from '../today';
import { T0, makeState, min, morning, sec } from './fixtures';

const kinds = (s: ReturnType<typeof makeState>, from: number, to: number) =>
  chimeEvents(s.routines, s.runs, from, to).map((e) => `${e.stepId}:${e.kind}`);

it('warns 1 min before for steps over 2 min, else 30 s before', () => {
  const [wake, teeth, dress] = morning.steps; // 2, 2, 5 min
  expect(warningLeadMs(wake)).toBe(30_000);
  expect(warningLeadMs(teeth)).toBe(30_000);
  expect(warningLeadMs(dress)).toBe(60_000);
});

describe('max step (Wake up, 2 min, auto-running from T0)', () => {
  const s = openRoutine(makeState(), 'morning', T0);

  it('warns once when crossing 30 s left', () => {
    expect(kinds(s, T0 + sec(89), T0 + sec(90))).toEqual(['wake:warning']);
    expect(kinds(s, T0 + sec(90), T0 + sec(91))).toEqual([]);
  });

  it("chimes time's up once at 0", () => {
    expect(kinds(s, T0 + sec(119), T0 + sec(120))).toEqual(['wake:timesUp']);
    expect(kinds(s, T0 + sec(120), T0 + sec(150))).toEqual([]); // overtime stays quiet
  });

  it('a 5-min step warns at 1 min left', () => {
    const five = openRoutine(makeState({ routines: [{ ...morning, steps: [morning.steps[2]] }] }), 'morning', T0);
    expect(kinds(five, T0 + min(4) - sec(1), T0 + min(4))).toEqual(['dress:warning']);
  });
});

describe('exact step (Brush my teeth, 2 min)', () => {
  const started = () => {
    const s = toggleStep(openRoutine(makeState(), 'morning', T0), 'morning', 'wake', T0);
    return toggleStep(s, 'morning', 'teeth', T0);
  };

  it("chimes time's up even after the store already auto-completed it", () => {
    const completed = tick(started(), T0 + sec(121));
    expect(completed.runs.morning.steps.teeth.doneAt).toBe(T0 + sec(120));
    expect(kinds(completed, T0 + sec(119), T0 + sec(121))).toEqual(['teeth:timesUp']);
  });

  it('a paused step stays quiet', () => {
    const paused = pauseStep(started(), 'morning', T0 + sec(60));
    expect(kinds(paused, T0 + sec(89), T0 + sec(200))).toEqual([]);
  });
});

it('ignores idle steps and routines never opened', () => {
  expect(kinds(makeState(), T0, T0 + min(30))).toEqual([]);
});
