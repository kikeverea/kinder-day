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
  first.getState().updateSettings({ regularMin: 70 });

  const second = createAppStore(storage);
  expect(second.getState().settings.regularMin).toBe(70);
  expect(second.getState().parentUnlocked).toBe(false);
});

it("drops yesterday's progress when rehydrating on a new day", () => {
  const yesterday = {
    ...createInitialData(Date.now() - 24 * 60 * 60_000),
    runs: { morning: { openedAt: 1, steps: {} } },
  };
  const storage = createMemoryStorage({
    [STORAGE_KEY]: JSON.stringify({ state: yesterday, version: 3 }),
  });
  const store = createAppStore(storage);
  expect(store.getState().runs).toEqual({});
});

it('fills in settings added after the data was saved', () => {
  const old = createInitialData(Date.now());
  const { confetti: _dropped, ...oldSettings } = old.settings;
  const storage = createMemoryStorage({
    [STORAGE_KEY]: JSON.stringify({ state: { ...old, settings: oldSettings }, version: 3 }),
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
  expect(state.settings.kidName).toBe('Sami');
});
