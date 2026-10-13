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
    [STORAGE_KEY]: JSON.stringify({ state: yesterday, version: 6 }),
  });
  const store = createAppStore(storage);
  expect(store.getState().runs).toEqual({});
});

it('fills in settings added after the data was saved', () => {
  const old = createInitialData(Date.now());
  const { confetti: _dropped, ...oldSettings } = old.settings;
  const storage = createMemoryStorage({
    [STORAGE_KEY]: JSON.stringify({ state: { ...old, settings: oldSettings }, version: 6 }),
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
  expect(state.settings).toEqual({ kidName: 'Sami', graceMins: 5, confetti: true });
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
  expect(state.settings).toEqual({ kidName: 'Sami', graceMins: 5, confetti: false });
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
