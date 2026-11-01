import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import * as routines from '@/domain/routines';
import { createSeedRoutines, DEFAULT_SETTINGS } from '@/domain/seed';
import * as today from '@/domain/today';
import type { AppData, DayOfWeek, ResultFace, Routine, Settings } from '@/domain/types';
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
  /** Focus-mode ⏸ Pause / ▶ Resume. */
  pauseStep(routineId: string, now?: number): void;
  resumeStep(routineId: string, now?: number): void;
  finishRoutine(routineId: string, now?: number): void;
  resetToday(now?: number): void;
  /** Grown-up override of today's result face; null restores the computed one. */
  setResultFace(routineId: string, face: ResultFace | null): void;

  saveRoutine(routine: Routine): void;
  deleteRoutine(routineId: string): void;
  addRoutineToDay(routineId: string, day: DayOfWeek): void;
  removeRoutineFromDay(routineId: string, day: DayOfWeek): void;
  reorderDay(day: DayOfWeek, routineIds: string[]): void;

  updateSettings(patch: Partial<Settings>): void;
};

type PersistedState = AppData;

export const STORAGE_KEY = 'kinder-day.state';
const STORAGE_VERSION = 9;

/** Upgrades persisted data from older `STORAGE_VERSION`s. Steps run in order. */
export const migrate = (persisted: unknown, version: number): PersistedState => {
  let state = persisted as PersistedState & Record<string, unknown>;
  if (version < 3) {
    // v3: per-step timers (`runs`) replace `progress` + `timers`; results use `finishedAt`.
    // Today's data is disposable (it resets daily), so drop it rather than convert it.
    const { progress: _progress, timers: _timers, ...rest } = state;
    state = { ...rest, runs: {}, results: {} };
  }
  if (version < 4) {
    // v4: RoutineRun.finishedAt (finished routines stop their clock).
    const runs: PersistedState['runs'] = {};
    for (const [id, run] of Object.entries(state.runs ?? {})) {
      runs[id] = { ...run, finishedAt: state.results?.[id]?.finishedAt ?? null };
    }
    state = { ...state, runs };
  }
  if (version < 5) {
    // v5: rating by time — settings.regularMin → graceMins (filled from defaults on merge);
    // today's results gain overtimeSecs.
    const { regularMin: _regularMin, ...settings } = (state.settings ?? {}) as Settings & {
      regularMin?: number;
    };
    const results: PersistedState['results'] = {};
    for (const [id, r] of Object.entries(state.results ?? {})) {
      results[id] = { ...r, overtimeSecs: r.overtimeSecs ?? 0 };
    }
    state = { ...state, settings: settings as Settings, results };
  }
  if (version < 6) {
    // v6: grown-ups can override a result's face.
    const results: PersistedState['results'] = {};
    for (const [id, r] of Object.entries(state.results ?? {})) {
      results[id] = { ...r, faceOverride: r.faceOverride ?? null };
    }
    state = { ...state, results };
  }
  if (version < 7) {
    // v7: archived past days.
    state = { ...state, history: state.history ?? {} };
  }
  if (version < 8) {
    // v8: the routine's "All steps" clock runs on elapsed time; RoutineRun gains stoppedMs.
    const runs: PersistedState['runs'] = {};
    for (const [id, run] of Object.entries(state.runs ?? {})) {
      runs[id] = { ...run, stoppedMs: run.stoppedMs ?? 0 };
    }
    state = { ...state, runs };
  }
  if (version < 9) {
    // v9: exact steps can have buffer minutes before and after.
    const routines = (state.routines ?? []).map((r) => ({
      ...r,
      steps: r.steps.map((s) => ({ ...s, beforeMins: s.beforeMins ?? 0, afterMins: s.afterMins ?? 0 })),
    }));
    state = { ...state, routines };
  }
  return state;
};

export const createInitialData = (now = Date.now()): AppData => ({
  ...today.emptyToday(now),
  routines: createSeedRoutines(),
  dayOrder: {},
  settings: DEFAULT_SETTINGS,
  history: {},
});

export const createAppStore = (storage: KeyValueStorage) =>
  create<AppState>()(
    persist(
      (set, get) => {
        /**
         * Runs a domain transition and commits it only if it produced a new state.
         * `persist` writes storage on every `set`, and domain functions keep identity when
         * nothing changed, so idle clock ticks cost neither a re-render nor a write.
         */
        const apply = (fn: (s: AppState) => AppState) => {
          const current = get();
          const next = fn(current);
          if (next !== current) set(next, true);
        };

        return {
          ...createInitialData(),
          parentUnlocked: false,

          unlockParent: () => set({ parentUnlocked: true }),
          lockParent: () => {
            if (get().parentUnlocked) set({ parentUnlocked: false });
          },

          tick: (now = Date.now()) => apply((s) => today.tick(s, now)),
          openRoutine: (routineId, now = Date.now()) =>
            apply((s) => today.openRoutine(s, routineId, now)),
          toggleStep: (routineId, stepId, now = Date.now()) =>
            apply((s) => today.toggleStep(s, routineId, stepId, now)),
          pauseStep: (routineId, now = Date.now()) => apply((s) => today.pauseStep(s, routineId, now)),
          resumeStep: (routineId, now = Date.now()) =>
            apply((s) => today.resumeStep(s, routineId, now)),
          finishRoutine: (routineId, now = Date.now()) =>
            apply((s) => today.finishRoutine(s, routineId, now)),
          resetToday: (now = Date.now()) => apply((s) => today.resetToday(s, now)),
          setResultFace: (routineId, face) => apply((s) => today.setResultFace(s, routineId, face)),

          saveRoutine: (routine) => apply((s) => routines.upsertRoutine(s, routine)),
          deleteRoutine: (routineId) => apply((s) => routines.deleteRoutine(s, routineId)),
          addRoutineToDay: (routineId, day) =>
            apply((s) => routines.addRoutineToDay(s, routineId, day)),
          removeRoutineFromDay: (routineId, day) =>
            apply((s) => routines.removeRoutineFromDay(s, routineId, day)),
          reorderDay: (day, routineIds) => apply((s) => routines.reorderDay(s, day, routineIds)),

          updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
        };
      },
      {
        name: STORAGE_KEY,
        version: STORAGE_VERSION,
        migrate,
        storage: createJSONStorage<PersistedState>(() => storage),
        partialize: ({ dayKey, runs, results, routines, dayOrder, settings, history }) => ({
          dayKey,
          runs,
          results,
          routines,
          dayOrder,
          settings,
          history,
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
