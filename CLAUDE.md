# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

**Kid Routines**: a child taps through daily routine checklists (Morning, After school, Bedtime…) with timers and a result screen; a parent, behind a press-and-hold lock, manages routines and the weekly plan. Expo SDK 58, React Native 0.88, React 19.3.

- **Android only** for now: don't add iOS- or web-specific code or `.web.tsx` variants.
- Design handoffs live in `lib/` (gitignored): `design.zip` is the full app (its README holds the tokens, copy and screen specs, and the `class Component` block in `Kid Routines.dc.html` is the behavioural spec), and `timed-step-feature.zip` is focus mode for exact steps, which supersedes the main handoff where they differ. `example/` (gitignored) is the original create-expo-app template, kept for reference only.
- Package manager is **npm** (`package-lock.json`), so use `npx`, not `bunx`.

## Commands

Run on a phone: install **Expo Go** from the Play Store, run `npm start` (phone and computer on the same Wi-Fi) and scan the QR code with Expo Go. Use `npx expo start --tunnel` if the LAN connection fails.

```bash
npm start                    # expo start (npm run android to open on a device/emulator)
npm run lint                 # expo lint
npm run typecheck            # tsc --noEmit
npm test                     # jest (jest-expo preset)
npx jest src/domain/__tests__/today.test.ts   # single file
npx jest -t "rollover"                         # tests matching a name
```

Installable APK (EAS, profiles in `eas.json`): `npx eas-cli@latest build -p android --profile preview`. Store build: `--profile production` (versionCode auto-increments remotely). EAS builds use Node 24.10.0 (`build.base.node` in `eas.json`) so their `npm ci` matches local npm 11. The default EAS image's npm 10 rejected an npm 11 lockfile. After changing dependencies, `npx npm@10.9.8 ci --ignore-scripts` in a scratch copy is a quick check. `android.package` is `com.kinderday.app`. Don't change it after the app is installed or published, because Android treats a new package as a different app and its data is lost.

Test files must end in `.test.ts(x)` (non-test helpers such as `__tests__/fixtures.ts` are not collected).

## Git

Never add `Co-Authored-By` trailers or any other AI attribution to commit messages or PR descriptions.

## Architecture

The layers depend downward only: `app/` → `store/` → `domain/`, with `storage/` injected into the store.

- **`src/domain/`**: pure TypeScript with no React, no RN and no I/O. It holds the types (`AppData`, `Routine`, `Step`, `RoutineRun`, `StepRun`…), seed data, and every business rule as a pure function: `today.ts` (open, toggle, pause/resume, finish, day rollover), `routines.ts` (upsert/delete, weekly plan), `routine-run.ts` and `step-run.ts` (per-step timers), plus `timer.ts`, `progress.ts`, `schedule.ts` and `format.ts`. Transitions take `now` explicitly, so new behaviour belongs here and gets a unit test.
- **Timers: one per step.** Each step's `StepRun` keeps `consumedMs` (time from earlier running stretches), `startedAt` (the current stretch, or null) and `doneAt`. Being done is `doneAt !== null`; there is no separate progress list. A routine's `RoutineRun` (`openedAt` plus `steps` keyed by step id) lives in `TodayData.runs`. Primitives are in `step-run.ts`. The rules are in `routine-run.ts`: `settle` enforces "at most one step runs", and `advance` completes an exact step whose time ran out at its real end time, so the next max step starts from that moment even if the app was closed.
- **Timestamp convention**: epoch ms, named `…At` (`startedAt`, `doneAt`, `openedAt`, `finishedAt`). Never store counters.
- **Step behaviour**:
  - Max ("Up to") steps auto-run when they become current (first not done). They keep counting past zero (overtime, shown with 😬). Un-doing one resumes it with the time it had left.
  - Exact steps start on tap and enter **focus mode**. They can be paused (`pauseStep`/`resumeStep`) but never stopped, and focus mode stays on while paused. Every `toggleStep` tap is ignored in focus mode. A done exact step resets to its full time on tap (reload icon).
  - "I'm finished" sets `RoutineRun.finishedAt` and stops the routine's clock (`settle` runs nothing in a finished run). Reopening the routine clears it and resumes. `isRoutineRunning()` (a step's clock is ticking) drives the timer badge on Kid Home.
  - **Result rating is by time** (this differs from the handoff, which rated by % done). Overtime = how far "All steps" went negative at finish. 😄 good = on time, 😶 regular = up to `settings.graceMins` (default 5) over, 😬 bad = beyond that. Undone steps cap the rating at 😶. See `rate()` in `progress.ts`, with copy in `format.ts` (`resultTitle`/`resultSubtitle`).
  - Grown-ups can override a result's face (😡 😬 😶 😄 🦄) from the Today tab or a face in the Week tab. `RoutineResult.faceOverride` sits on top of the computed `rating` (which is kept), and finishing again clears it. Always display `FACE_EMOJI[resultFace(result)]`, never the rating directly.
  - Display values come from `timer.ts`: `timerCard`, `focusState`, `stepRow` and `totalLeft` ("All steps" = total step time minus `elapsedMs(run)`, the time the routine has been open and not finished. It keeps running while an exact step waits for a tap or is paused, and time spent finished before a reopen is skipped via `RoutineRun.stoppedMs`).
- **"Today" data** (`runs`, `results`) is keyed by `dayKey` (local YYYY-MM-DD). When the day changes, `rollover()` (also run on rehydrate) archives a `DayRecord` snapshot into `history` and then wipes today's data. A snapshot holds each routine's name, emoji, colour, progress and result as they were that day, since routines change later. History keeps `HISTORY_DAYS` (90). Kid Home's ‹ date › switcher shows past days read-only. Days the app was never opened have no record.
- **`src/store/`**: a zustand store whose actions only delegate to domain functions, through `apply()`, which skips `set` when the domain function returned the same object (`persist` writes storage on every `set`). `create-app-store.ts` exports a factory that takes a `KeyValueStorage`, which lets tests use `createMemoryStorage()`. `index.ts` builds the app singleton `useAppStore`. `parentUnlocked` is session-only and deliberately excluded from persistence (`partialize`). Persisted data is versioned (`STORAGE_VERSION`): bump it and add a `migrate` when changing the `AppData` shape.
- **`src/storage/`**: the persistence boundary, which is expected to change soon. Everything goes through the `KeyValueStorage` interface, and the implementation is chosen in `storage/index.ts` only (currently SQLite via `expo-sqlite/kv-store`, using the sync API so state is ready on first render). Never import `expo-sqlite` or any other backend outside this folder. An async replacement is supported by zustand `persist`, but screens would then need to wait for `persist.hasHydrated()`.
- **`src/theme/`**: design tokens (`tokens.ts`) and `color.ts`, which provides `mixOklab`/`routineTint`/`doneTint`, an RN substitute for CSS `color-mix(in oklab)`.
- **Rendering time**: never call `Date.now()` during render (the React Compiler lint rule `react-hooks/purity` fails). Use `useNow(intervalMs)` from `src/hooks/use-now.ts`.
- **Kid-side "sticker" style**: 3dp ink borders plus a hard, unblurred offset shadow. Pressable stickers use `StickerPressable` (`src/components/kid/`), which draws the shadow as a real ink layer so the face can slide onto it when pressed. Static stickers can use RN `boxShadow` (`0 6px 0 #2B2340`). Never use `elevation`, which blurs.
- **UI building blocks**: `AppText` (Fredoka by `weight`, never raw `fontFamily`), `Emoji` (every emoji goes through it, so swapping to bundled images is one file), and kid components in `src/components/kid/`. Screens compute display values from `src/domain/timer.ts` and copy from `src/domain/format.ts` rather than inline. Looping animations use Reanimated 4 CSS keyframes (`animationName`), and value-driven ones use shared values.
- **Grown-ups area**: `src/app/parent/index.tsx` (Today / Week / Routines tabs), `parent/settings.tsx` (name, grace minutes, chimes, confetti; changes apply immediately) and `parent/edit/[id].tsx` (the editor; `id` is a routine id or `new`; `usePreventRemove` asks before discarding unsaved edits). The editor edits a local `RoutineDraft` through the pure functions in `src/domain/draft.ts` and only calls `saveRoutine` on Save, so backing out discards changes. Steps (editor) and each day's routines (Week tab, `components/parent/week-planner.tsx`, saved to `dayOrder` via `reorderDay`) reorder with `react-native-reorderable-list`: a `NestedReorderableList` inside a `ScrollViewContainer`, with the ⠿ handle calling `useReorderableDrag()` on press-in. Always pass `scrollEnabled={false}` to a nested list, because the page scrolls, not the list, and otherwise RN warns about VirtualizedLists nested in ScrollViews. Parent-side components live in `src/components/parent/`.
- **Chimes**: `useStepChimes()` (root layout) checks `chimeEvents()` (`src/domain/chime.ts`, pure and tested) every second and plays `assets/sounds/chime*.wav` via `expo-audio`, with haptics. One chime 1 min before a step ends (30 s for steps of 2 min or less), and a double chime at 0. It's foreground-only, can be switched off with `settings.chimes`, and gaps over 5 s are skipped as stale. The `expo-audio` plugin in `app.json` has microphone and background playback disabled; keep it that way.
- **Reduced motion**: looping or decorative animations (pulse, result loops, confetti, ✓ pop, focus entry) check `useReducedMotion()`. Do the same for new ones.
- **Clock**: `useStoreClock()` (mounted once in the root layout) calls the store's `tick` every second and on foreground. Screens re-render with `useNow(1000)`.
- **Parent lock**: parent routes sit inside `Stack.Protected guard={parentUnlocked}`. Kid Home re-locks on focus and navigates to `/parent` in an effect after `unlockParent()`, so the route exists before the push.
- **Fonts**: Fredoka, loaded with `useFonts` in `src/app/_layout.tsx` (works in Expo Go). Reference families through `fonts.*` in `tokens.ts`.
