import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import * as routines from '@/domain/routines';
import { createSeedRoutines, DEFAULT_SETTINGS } from '@/domain/seed';
import * as today from '@/domain/today';
import type { AppData, DayOfWeek, Routine, Settings } from '@/domain/types';
import type { KeyValueStorage } from '@/storage/types';

export type AppState = AppData & {
  /** Session-only: parent area is reachable. Never persisted — the app always starts in kid mode. */
  parentUnlocked: boolean;

  unlockParent(): void;
  lockParent(): void;

  /** Call on every timer tick and when the app returns to the foreground. */
  tick(now?: number): void;
  openRoutine(routineId: string, now?: number): void;
  toggleStep(routineId: string, stepId: string, now?: number): void;
  finishRoutine(routineId: string, now?: number): void;
  resetToday(now?: number): void;

  saveRoutine(routine: Routine): void;
  deleteRoutine(routineId: string): void;
  addRoutineToDay(routineId: string, day: DayOfWeek): void;
  removeRoutineFromDay(routineId: string, day: DayOfWeek): void;
  reorderDay(day: DayOfWeek, routineIds: string[]): void;

  updateSettings(patch: Partial<Settings>): void;
};

type PersistedState = AppData;

export const STORAGE_KEY = 'kinder-day.state';
const STORAGE_VERSION = 1;

export const createInitialData = (now = Date.now()): AppData => ({
  ...today.emptyToday(now),
  routines: createSeedRoutines(),
  dayOrder: {},
  settings: DEFAULT_SETTINGS,
});

export const createAppStore = (storage: KeyValueStorage) =>
  create<AppState>()(
    persist(
      (set) => ({
        ...createInitialData(),
        parentUnlocked: false,

        unlockParent: () => set({ parentUnlocked: true }),
        lockParent: () => set({ parentUnlocked: false }),

        tick: (now = Date.now()) =>
          set((s) => today.resolveExpiredRuns(today.rollover(s, now), now)),
        openRoutine: (routineId, now = Date.now()) =>
          set((s) => today.openRoutine(s, routineId, now)),
        toggleStep: (routineId, stepId, now = Date.now()) =>
          set((s) => today.toggleStep(s, routineId, stepId, now)),
        finishRoutine: (routineId, now = Date.now()) =>
          set((s) => today.finishRoutine(s, routineId, now)),
        resetToday: (now = Date.now()) => set((s) => today.resetToday(s, now)),

        saveRoutine: (routine) => set((s) => routines.upsertRoutine(s, routine)),
        deleteRoutine: (routineId) => set((s) => routines.deleteRoutine(s, routineId)),
        addRoutineToDay: (routineId, day) =>
          set((s) => routines.addRoutineToDay(s, routineId, day)),
        removeRoutineFromDay: (routineId, day) =>
          set((s) => routines.removeRoutineFromDay(s, routineId, day)),
        reorderDay: (day, routineIds) => set((s) => routines.reorderDay(s, day, routineIds)),

        updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      }),
      {
        name: STORAGE_KEY,
        version: STORAGE_VERSION,
        storage: createJSONStorage<PersistedState>(() => storage),
        partialize: ({ dayKey, progress, results, timers, routines, dayOrder, settings }) => ({
          dayKey,
          progress,
          results,
          timers,
          routines,
          dayOrder,
          settings,
        }),
        merge: (persisted, current) => {
          const saved = persisted as Partial<PersistedState> | undefined;
          const merged = {
            ...current,
            ...saved,
            settings: { ...current.settings, ...saved?.settings },
          };
          return today.rollover(merged, Date.now());
        },
      },
    ),
  );
