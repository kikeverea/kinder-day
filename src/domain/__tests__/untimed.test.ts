import { chimeEvents } from '../chime';
import {
  addStep,
  canSave,
  draftFromRoutine,
  EMPTY_NEW_STEP,
  needsTime,
  setTimed,
  toggleStepMode,
  updateStep,
} from '../draft';
import { resultSubtitle, resultSummary, routineSummary, stepsTotalLabel, stepSubtitle } from '../format';
import { availableAddOns, isRoutineRunning } from '../routine-run';
import { isStepSaved, saveStepTemplate } from '../templates';
import { stepRow, timerCard } from '../timer';
import { finishRoutine, openRoutine, startAddOn, tick, toggleStep } from '../today';
import { T0, makeState, min, morning, relaxed } from './fixtures';

const state = () => makeState({ routines: [morning, relaxed] });
const opened = () => openRoutine(state(), 'relaxed', T0);

describe('running a routine without timer', () => {
  it('never runs a step with no time, so there is no timer card and no running badge', () => {
    const s = tick(opened(), T0 + min(30));
    expect(s.runs.relaxed.steps).toEqual({});
    expect(isRoutineRunning(s.runs.relaxed)).toBe(false);
    expect(timerCard(relaxed, s.runs.relaxed, T0 + min(30))).toBeUndefined();
    expect(stepRow(relaxed.steps[0], s.runs.relaxed, T0 + min(30))).toMatchObject({
      status: 'idle',
      usedFraction: 0,
      overtime: false,
    });
  });

  it('ticks steps off and still runs exact steps', () => {
    let s = toggleStep(opened(), 'relaxed', 'hands', T0 + min(1));
    expect(s.runs.relaxed.steps.hands.doneAt).toBe(T0 + min(1));
    expect(s.runs.relaxed.steps.read).toBeUndefined(); // the exact step waits for a tap
    s = toggleStep(s, 'relaxed', 'read', T0 + min(2));
    expect(isRoutineRunning(s.runs.relaxed)).toBe(true);
    s = tick(s, T0 + min(12));
    expect(s.runs.relaxed.steps.read.doneAt).toBe(T0 + min(12));
    expect(s.runs.relaxed.steps.bag).toBeUndefined(); // next step with no time doesn't start
  });

  it('has no add-ons', () => {
    expect(availableAddOns(relaxed, opened().runs.relaxed)).toEqual([]);
    const s = opened();
    expect(startAddOn(s, 'relaxed', 'poop', T0 + min(1)).runs.relaxed.addOns).toEqual([]);
  });

  it('rates by steps done only, however long it took', () => {
    let s = toggleStep(opened(), 'relaxed', 'hands', T0 + min(1));
    s = toggleStep(s, 'relaxed', 'read', T0 + min(2));
    s = toggleStep(tick(s, T0 + min(12)), 'relaxed', 'bag', T0 + min(90));
    expect(finishRoutine(s, 'relaxed', T0 + min(90)).results.relaxed).toMatchObject({
      rating: 'good',
      overtimeSecs: 0,
    });
    expect(finishRoutine(opened(), 'relaxed', T0 + min(90)).results.relaxed.rating).toBe('regular');
  });

  it('chimes for exact steps only', () => {
    let s = toggleStep(opened(), 'relaxed', 'hands', T0 + min(1));
    s = toggleStep(s, 'relaxed', 'read', T0 + min(2));
    expect(chimeEvents(s.routines, s.runs, T0, T0 + min(2))).toEqual([]);
    expect(chimeEvents(s.routines, s.runs, T0 + min(11), T0 + min(12))).toEqual([
      { routineId: 'relaxed', stepId: 'read', kind: 'timesUp' },
    ]);
  });
});

describe('copy', () => {
  it('shows no time for steps with none and no minutes for the routine', () => {
    expect(stepSubtitle(relaxed.steps[0], false)).toBe('✓ Tap when it’s done');
    expect(stepSubtitle(relaxed.steps[0], true)).toBe('✓ Done!');
    expect(stepSubtitle(relaxed.steps[1], false)).toBe('⏳ Takes 10 min · tap to start');
    expect(routineSummary(relaxed)).toBe('3 steps · No timer · 🧼 📚 🎒');
    expect(stepsTotalLabel(relaxed)).toBe('3 steps · No timer');
  });

  it('talks about steps, not time, on the result', () => {
    const r = {
      rating: 'good' as const,
      doneSteps: 3,
      totalSteps: 3,
      finishedAt: T0,
      secs: 720,
      overtimeSecs: 0,
      faceOverride: null,
      sticker: null,
    };
    expect(resultSubtitle(r, false)).toBe('Every step done. Super star!');
    expect(resultSummary(r, false)).toBe('3 of 3 steps');
  });
});

describe('editing', () => {
  it('adds non-exact steps with no time, whatever their minutes', () => {
    const d = addStep(draftFromRoutine(relaxed), { ...EMPTY_NEW_STEP, label: 'Snack', mins: 7 });
    expect(d.steps[3]).toMatchObject({ mode: 'max', mins: 0 });
    expect(updateStep(d, d.steps[3].id, { mins: 4 }).steps[3].mins).toBe(0);
    expect(addStep(d, { ...EMPTY_NEW_STEP, label: 'Piano', mode: 'exact', mins: 0 }).steps[4].mins).toBe(1);
  });

  it('toggles a step to exact with a default time, and back to no time', () => {
    const d = toggleStepMode(draftFromRoutine(relaxed), 'hands');
    expect(d.steps[0]).toMatchObject({ mode: 'exact', mins: 2 });
    expect(toggleStepMode(d, 'hands').steps[0]).toMatchObject({ mode: 'max', mins: 0 });
  });

  it('switching to no timer drops non-exact times; back to timed they need a time before saving', () => {
    const untimed = setTimed(draftFromRoutine(morning), false);
    expect(untimed.steps.map((s) => s.mins)).toEqual([0, 2, 0]);
    expect(canSave(untimed)).toBe(true);
    const timed = setTimed(untimed, true);
    expect(timed.steps.filter((s) => needsTime(s, true)).map((s) => s.id)).toEqual(['wake', 'dress']);
    expect(canSave(timed)).toBe(false);
    const fixed = updateStep(updateStep(timed, 'wake', { mins: 3 }), 'dress', { mins: 5 });
    expect(canSave(fixed)).toBe(true);
    expect(setTimed(fixed, true)).toBe(fixed);
  });
});

describe('saved steps from a routine without timer', () => {
  const hands = relaxed.steps[0];

  it('saves a new non-exact step with no time', () => {
    const s = saveStepTemplate(makeState(), hands, false);
    expect(s.stepTemplates).toMatchObject([{ label: 'Wash my hands', mode: 'max', mins: 0 }]);
    expect(isStepSaved(s.stepTemplates, hands, false)).toBe(true);
  });

  it('keeps the time and buffers of a saved step with the same label', () => {
    const timedHands = { ...hands, mins: 3 };
    const s = saveStepTemplate(makeState(), timedHands);
    // Same step seen without timer: already saved, and saving again changes nothing.
    expect(isStepSaved(s.stepTemplates, hands, false)).toBe(true);
    expect(saveStepTemplate(s, hands, false)).toBe(s);
    // A new icon updates it but keeps its 3 min.
    const next = saveStepTemplate(s, { ...hands, emoji: '🫧' }, false);
    expect(next.stepTemplates).toMatchObject([{ emoji: '🫧', mins: 3 }]);
  });

  it('a step with no time needs one in a timed routine', () => {
    expect(needsTime({ mode: 'max', mins: 0 }, true)).toBe(true);
    expect(needsTime({ mode: 'max', mins: 0 }, false)).toBe(false);
    expect(needsTime({ mode: 'exact', mins: 5 }, true)).toBe(false);
  });
});
