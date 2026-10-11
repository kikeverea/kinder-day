# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project state

Freshly generated from `create-expo-app` (Expo SDK 57, React Native 0.86, React 19.2). Everything under `src/` is still starter/template code; `npm run reset-project` moves it to `example/` and creates a blank `src/app/`. Package manager is **npm** (`package-lock.json`), so use `npx`, not `bunx`.

## Commands

```bash
npm start            # expo start (also: npm run ios | android | web)
npm run lint         # expo lint — no ESLint config is committed yet; first run sets it up
npx tsc --noEmit     # typecheck
```

No test runner is configured (no Jest setup or test files).

## Git

Never add `Co-Authored-By` trailers or any other AI attribution to commit messages or PR descriptions.

## Architecture

- **Config flags** (`app.json`): `typedRoutes` and `reactCompiler` experiments are on — the React Compiler handles memoization, so avoid manual `useMemo`/`useCallback` unless profiling says otherwise; route hrefs are type-checked against files in `src/app/`. Web uses `output: "static"` (static rendering), URL scheme is `kinderday`.
- **Path aliases** (`tsconfig.json`): `@/*` → `src/*`, `@/assets/*` → `assets/*`.
- **Platform-specific files**: several modules have `.web.tsx`/`.web.ts` siblings that Metro picks for web (`app-tabs`, `animated-icon`, `use-color-scheme`). Changes to one usually need mirroring in the other.
  - `app-tabs.tsx` uses native tabs (`expo-router/unstable-native-tabs`); `app-tabs.web.tsx` builds a custom top bar with `expo-router/ui` headless `Tabs`. Native tab triggers reference routes by file name (`index`, `explore`); web triggers use hrefs. Adding a tab means editing both.
  - `use-color-scheme.web.ts` returns `'light'` until hydration, required for static web rendering.
- **Root layout** (`src/app/_layout.tsx`): holds the splash screen (`preventAutoHideAsync` + `AnimatedSplashOverlay`), wraps everything in expo-router's `ThemeProvider`, and renders `AppTabs` as the navigator.
- **Theming**: `src/constants/theme.ts` is the single source of `Colors` (light/dark), `Spacing`, `Fonts` (platform-selected; web fonts come from CSS vars in `src/global.css`, which theme.ts imports), `BottomTabInset`, and `MaxContentWidth`. Use `useTheme()` and the `ThemedText`/`ThemedView` components (which take `type`/`themeColor` keys from `Colors`) rather than hardcoding colors.
