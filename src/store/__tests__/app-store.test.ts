import { createMemoryStorage } from '@/storage/memory-storage';

import { createAppStore, createInitialData, STORAGE_KEY } from '../create-app-store';

const persisted = (storage: ReturnType<typeof createMemoryStorage>) =>
  JSON.parse(storage.dump()[STORAGE_KEY]);

it('seeds defaults on first launch', () => {
  const store = createAppStore(createMemoryStorage());
  expect(store.getState().routines.map((r) => r.id)).toEqual(['morning', 'school', 'bed']);
  expect(store.getState().settings.kidName).toBe('Mia');
});

it('persists data but never the parent unlock', () => {
  const storage = createMemoryStorage();
  const store = createAppStore(storage);
  store.getState().unlockParent();
  store.getState().updateSettings({ kidName: 'Sami' });

  const saved = persisted(storage);
  expect(saved.state.settings.kidName).toBe('Sami');
  expect(saved.state).not.toHaveProperty('parentUnlocked');
  expect(saved.state).not.toHaveProperty('toggleStep');
});

it('rehydrates synchronously from storage', () => {
  const storage = createMemoryStorage();
  const first = createAppStore(storage);
  first.getState().updateSettings({ graceMins: 8 });

  const second = createAppStore(storage);
  expect(second.getState().settings.graceMins).toBe(8);
  expect(second.getState().parentUnlocked).toBe(false);
});

it("drops yesterday's progress when rehydrating on a new day", () => {
  const yesterday = {
    ...createInitialData(Date.now() - 24 * 60 * 60_000),
    runs: { morning: { openedAt: 1, steps: {} } },
  };
  const storage = createMemoryStorage({
    [STORAGE_KEY]: JSON.stringify({ state: yesterday, version: 7 }),
  });
  const store = createAppStore(storage);
  expect(store.getState().runs).toEqual({});
});

it('fills in settings added after the data was saved', () => {
  const old = createInitialData(Date.now());
  const { confetti: _dropped, ...oldSettings } = old.settings;
  const storage = createMemoryStorage({
    [STORAGE_KEY]: JSON.stringify({ state: { ...old, settings: oldSettings }, version: 7 }),
  });
  expect(createAppStore(storage).getState().settings.confetti).toBe(true);
});

it('drops pre-v3 today data but keeps routines and settings', () => {
  const v2 = {
    ...createInitialData(Date.now()),
    progress: { morning: ['x'] },
    timers: { morning: { start: 1, stepStart: 1, run: null } },
    results: { morning: { rating: 'regular', doneSteps: 4, total: 7, at: 1, secs: 300 } },
    settings: { kidName: 'Sami', regularMin: 50, confetti: true },
  };
  const storage = createMemoryStorage({
    [STORAGE_KEY]: JSON.stringify({ state: v2, version: 2 }),
  });
  const state = createAppStore(storage).getState();
  expect(state.runs).toEqual({});
  expect(state.results).toEqual({});
  expect(state).not.toHaveProperty('progress');
  expect(state).not.toHaveProperty('timers');
  expect(state.settings).toEqual({ kidName: 'Sami', graceMins: 5, confetti: true, chimes: true });
});

it('does not write storage when an action changes nothing', () => {
  const storage = createMemoryStorage();
  const setItem = jest.spyOn(storage, 'setItem');
  const store = createAppStore(storage);
  const now = Date.now();
  store.getState().openRoutine('morning', now);
  const writes = setItem.mock.calls.length;
  store.getState().tick(now + 1000);
  store.getState().tick(now + 2000);
  store.getState().lockParent();
  expect(setItem.mock.calls.length).toBe(writes);
});

it('migrates v3 runs: finished routines get finishedAt from their result', () => {
  const now = Date.now();
  const v3 = {
    ...createInitialData(now),
    runs: {
      morning: { openedAt: now, steps: {} },
      bed: { openedAt: now, steps: {} },
    },
    results: { morning: { rating: 'good', doneSteps: 7, totalSteps: 7, finishedAt: now, secs: 60 } },
  };
  const storage = createMemoryStorage({ [STORAGE_KEY]: JSON.stringify({ state: v3, version: 3 }) });
  const { runs } = createAppStore(storage).getState();
  expect(runs.morning.finishedAt).toBe(now);
  expect(runs.bed.finishedAt).toBeNull();
});

it('migrates v4: regularMin → graceMins, results gain overtimeSecs', () => {
  const now = Date.now();
  const v4 = {
    ...createInitialData(now),
    settings: { kidName: 'Sami', regularMin: 70, confetti: false },
    results: { bed: { rating: 'good', doneSteps: 5, totalSteps: 5, finishedAt: now, secs: 60 } },
  };
  const storage = createMemoryStorage({ [STORAGE_KEY]: JSON.stringify({ state: v4, version: 4 }) });
  const state = createAppStore(storage).getState();
  expect(state.settings).toEqual({ kidName: 'Sami', graceMins: 5, confetti: false, chimes: true });
  expect(state.results.bed.overtimeSecs).toBe(0);
});

it('migrates v5 results: faceOverride defaults to null', () => {
  const now = Date.now();
  const v5 = {
    ...createInitialData(now),
    results: {
      bed: { rating: 'bad', doneSteps: 5, totalSteps: 5, finishedAt: now, secs: 60, overtimeSecs: 400 },
    },
  };
  const storage = createMemoryStorage({ [STORAGE_KEY]: JSON.stringify({ state: v5, version: 5 }) });
  expect(createAppStore(storage).getState().results.bed.faceOverride).toBeNull();
});

it('migrates v6: adds an empty history', () => {
  const { history: _h, ...v6 } = createInitialData(Date.now());
  const storage = createMemoryStorage({ [STORAGE_KEY]: JSON.stringify({ state: v6, version: 6 }) });
  expect(createAppStore(storage).getState().history).toEqual({});
});

it('migrates v7 runs: stoppedMs defaults to 0', () => {
  const v7 = { ...createInitialData(Date.now()), runs: { morning: { openedAt: 1, finishedAt: null, steps: {} } } };
  const storage = createMemoryStorage({ [STORAGE_KEY]: JSON.stringify({ state: v7, version: 7 }) });
  expect(createAppStore(storage).getState().runs.morning.stoppedMs).toBe(0);
});

it('migrates v8 steps: buffers default to 0', () => {
  const v8 = createInitialData(Date.now());
  v8.routines = v8.routines.map((r) => ({
    ...r,
    steps: r.steps.map(({ beforeMins: _b, afterMins: _a, ...s }) => s as typeof r.steps[number]),
  }));
  const storage = createMemoryStorage({ [STORAGE_KEY]: JSON.stringify({ state: v8, version: 8 }) });
  const steps = createAppStore(storage).getState().routines.flatMap((r) => r.steps);
  expect(steps.every((s) => s.beforeMins === 0 && s.afterMins === 0)).toBe(true);
});

it('migrates v9: adds empty saved steps', () => {
  const { stepTemplates: _t, ...v9 } = createInitialData(Date.now());
  const storage = createMemoryStorage({ [STORAGE_KEY]: JSON.stringify({ state: v9, version: 9 }) });
  expect(createAppStore(storage).getState().stepTemplates).toEqual([]);
});

it('persists saved steps', () => {
  const storage = createMemoryStorage();
  const store = createAppStore(storage);
  store.getState().saveStepTemplate({ emoji: '📚', label: 'Read', mins: 10, mode: 'exact', beforeMins: 1, afterMins: 0 });
  expect(persisted(storage).state.stepTemplates).toMatchObject([{ label: 'Read', mins: 10 }]);
});

it('migrates v10: routines and runs gain add-ons', () => {
  const data = createInitialData(Date.now());
  const v10 = {
    ...data,
    routines: data.routines.map(({ addOns: _a, ...r }) => r),
    runs: { morning: { openedAt: 1, finishedAt: null, stoppedMs: 0, steps: {} } },
  };
  const storage = createMemoryStorage({ [STORAGE_KEY]: JSON.stringify({ state: v10, version: 10 }) });
  const state = createAppStore(storage).getState();
  expect(state.routines.every((r) => Array.isArray(r.addOns))).toBe(true);
  expect(state.runs.morning.addOns).toEqual([]);
});

it('migrates v11 and persists saved add-ons', () => {
  const { addOnTemplates: _t, ...v11 } = createInitialData(Date.now());
  const storage = createMemoryStorage({ [STORAGE_KEY]: JSON.stringify({ state: v11, version: 11 }) });
  const store = createAppStore(storage);
  expect(store.getState().addOnTemplates).toEqual([]);
  store.getState().saveAddOnTemplate({ emoji: '💩', label: 'Poop', mins: 5 });
  expect(persisted(storage).state.addOnTemplates).toMatchObject([{ label: 'Poop', mins: 5 }]);
});

it('migrates v12: a 🦄 face becomes a 🦄 sticker, today and in history', () => {
  const now = Date.now();
  const result = (faceOverride: string | null) => ({
    rating: 'good',
    doneSteps: 5,
    totalSteps: 5,
    finishedAt: now,
    secs: 60,
    overtimeSecs: 0,
    faceOverride,
  });
  const bed = { id: 'bed', name: 'Bedtime', emoji: '🌙', color: '#C7B8FF', doneSteps: 5, totalSteps: 5 };
  const v12 = {
    ...createInitialData(now),
    results: { bed: result('unicorn'), morning: result('angry') },
    history: { '2026-10-12': { dayKey: '2026-10-12', routines: [{ ...bed, result: result('unicorn') }] } },
  };
  const storage = createMemoryStorage({ [STORAGE_KEY]: JSON.stringify({ state: v12, version: 12 }) });
  const state = createAppStore(storage).getState();
  expect(state.results.bed).toMatchObject({ faceOverride: null, sticker: '🦄' });
  expect(state.results.morning).toMatchObject({ faceOverride: 'angry', sticker: null });
  expect(state.history['2026-10-12'].routines[0].result).toMatchObject({ faceOverride: null, sticker: '🦄' });
});
