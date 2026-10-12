# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

**Kid Routines**: a child taps through daily routine checklists (Morning, After school, Bedtime…) with timers and a result screen; a parent, behind a press-and-hold lock, manages routines and the weekly plan. Expo SDK 57, React Native 0.86, React 19.2.

- **Android only** for now: don't add iOS- or web-specific code or `.web.tsx` variants.
- The design handoff lives in `lib/design.zip` (gitignored). Its README holds the tokens, copy and screen specs, and the `class Component` block in `Kid Routines.dc.html` is the behavioural spec. `example/` (gitignored) is the original create-expo-app template, kept for reference only.
- Package manager is **npm** (`package-lock.json`), so use `npx`, not `bunx`.

## Commands

```bash
npm start                    # expo start (npm run android to open on a device/emulator)
npm run lint                 # expo lint
npm run typecheck            # tsc --noEmit
npm test                     # jest (jest-expo preset)
npx jest src/domain/__tests__/today.test.ts   # single file
npx jest -t "rollover"                         # tests matching a name
```

Test files must end in `.test.ts(x)` (non-test helpers such as `__tests__/fixtures.ts` are not collected).

## Git

Never add `Co-Authored-By` trailers or any other AI attribution to commit messages or PR descriptions.

## Architecture

The layers depend downward only: `app/` → `store/` → `domain/`, with `storage/` injected into the store.

- **`src/domain/`**: pure TypeScript with no React, no RN and no I/O. It holds the types (`AppData`, `Routine`, `Step`, `RoutineTimer`…), seed data, and every business rule as a pure function: `today.ts` (open, toggle, auto-completing exact steps, finish, day rollover), `routines.ts` (upsert/delete, weekly plan), plus `timer.ts`, `progress.ts`, `schedule.ts` and `format.ts`. Transitions take `now` explicitly, so new behaviour belongs here and gets a unit test.
- **Timers store timestamps, never counters.** Countdowns are derived from `now`. Expired exact-mode steps are resolved by `resolveExpiredRuns` (called by the store's `tick`, `toggleStep` and `finishRoutine`), so a step that ended while the app was backgrounded is completed at its real end time.
- **"Today" data** (`progress`, `results`, `timers`) is keyed by `dayKey` (local YYYY-MM-DD) and wiped by `rollover()` when the day changes, including on rehydrate.
- **`src/store/`**: a zustand store whose actions only delegate to domain functions. `create-app-store.ts` exports a factory that takes a `KeyValueStorage`, which lets tests use `createMemoryStorage()`. `index.ts` builds the app singleton `useAppStore`. `parentUnlocked` is session-only and deliberately excluded from persistence (`partialize`). Persisted data is versioned (`STORAGE_VERSION`): bump it and add a `migrate` when changing the `AppData` shape.
- **`src/storage/`**: the persistence boundary, which is expected to change soon. Everything goes through the `KeyValueStorage` interface, and the implementation is chosen in `storage/index.ts` only (currently SQLite via `expo-sqlite/kv-store`, using the sync API so state is ready on first render). Never import `expo-sqlite` or any other backend outside this folder. An async replacement is supported by zustand `persist`, but screens would then need to wait for `persist.hasHydrated()`.
- **`src/theme/`**: design tokens (`tokens.ts`) and `color.ts`, which provides `mixOklab`/`routineTint`/`doneTint`, an RN substitute for CSS `color-mix(in oklab)`.
- **Rendering time**: never call `Date.now()` during render (the React Compiler lint rule `react-hooks/purity` fails). Use `useNow(intervalMs)` from `src/hooks/use-now.ts`.
- **Kid-side "sticker" style**: 3dp ink borders plus a hard offset shadow done with RN `boxShadow` (`0 6px 0 #2B2340`, no blur). Don't use `elevation`, which blurs.
- **Fonts**: Fredoka, loaded with `useFonts` in `src/app/_layout.tsx` (works in Expo Go). Reference families through `fonts.*` in `tokens.ts`.
