import { currentStep, exactElapsed, stepCountdown, totalLeft } from '../timer';
import type { RoutineTimer } from '../types';
import { T0, morning, sec } from './fixtures';

const timer = (patch: Partial<RoutineTimer> = {}): RoutineTimer => ({
  start: T0,
  stepStart: T0,
  run: null,
  ...patch,
});

describe('currentStep', () => {
  it('is the first step not done', () => {
    expect(currentStep(morning, timer(), ['wake'])?.id).toBe('teeth');
  });

  it('prefers a running exact step', () => {
    const t = timer({ run: { stepId: 'teeth', start: T0 } });
    expect(currentStep(morning, t, [])?.id).toBe('teeth');
  });

  it('is undefined when everything is done', () => {
    expect(currentStep(morning, timer(), ['wake', 'teeth', 'dress'])).toBeUndefined();
  });
});

describe('stepCountdown', () => {
  it('counts down a max step from stepStart', () => {
    const c = stepCountdown(morning, timer(), [], T0 + sec(15));
    expect(c).toMatchObject({ left: 105, state: 'max-running' });
    expect(c?.fraction).toBeCloseTo(105 / 120);
  });

  it("reports time's up for a max step that ran over", () => {
    const c = stepCountdown(morning, timer(), [], T0 + sec(150));
    expect(c).toMatchObject({ left: -30, fraction: 0, state: 'max-overtime' });
  });

  it('shows the full time for an exact step not started yet', () => {
    const c = stepCountdown(morning, timer(), ['wake'], T0 + sec(500));
    expect(c).toMatchObject({ left: 120, fraction: 1, state: 'exact-idle' });
  });

  it('counts down a running exact step and clamps at 0', () => {
    const t = timer({ run: { stepId: 'teeth', start: T0 } });
    expect(stepCountdown(morning, t, ['wake'], T0 + sec(30))).toMatchObject({
      left: 90,
      state: 'exact-running',
    });
    expect(stepCountdown(morning, t, ['wake'], T0 + sec(999))?.left).toBe(0);
  });
});

it('totalLeft goes negative when over time', () => {
  expect(totalLeft(morning, undefined, T0)).toBe(540);
  expect(totalLeft(morning, timer(), T0 + sec(600))).toBe(-60);
});

it('exactElapsed is the running fraction, 0 otherwise', () => {
  const step = morning.steps[1];
  expect(exactElapsed(step, timer(), T0 + sec(60))).toBe(0);
  expect(exactElapsed(step, timer({ run: { stepId: 'teeth', start: T0 } }), T0 + sec(60))).toBe(0.5);
});
