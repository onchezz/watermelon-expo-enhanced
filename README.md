# HyperTillDB Expo App

Expo + React Native starter app wired to `@onchez/hypertilldb@0.0.1`.

## What this repo includes

- Native Expo app (`expo run:android`, `expo run:ios`)
- Local-first task list backed by HyperTillDB SQLite adapter
- Supabase-style local-first service layer (`src/database/localFirst.ts`)
- Reactivity via `createReactiveClient` + `useReactiveQuery`

## Requirements

- Node.js 18+
- npm 9+
- Expo SDK 55 toolchain
- Android Studio / Xcode (for native builds)

## Quick start

```bash
npm install
npx expo run:android
```

## DB dependency version

This app is pinned to:

- `@onchez/hypertilldb@0.0.1`

To reset to this version at any time:

```bash
npm run setup:db:npm
```

To set another version:

```bash
./scripts/setup-enhanced-db.sh 0.0.1
```

## Database wiring

Main files:

- `src/database/schema.ts`
- `src/database/models/Task.ts`
- `src/database/index.ts`
- `src/database/index.web.ts`
- `src/database/reactive.ts`
- `src/database/localFirst.ts`
- `App.tsx`

Web runs use `index.web.ts` automatically (LokiJS adapter). Native runs use `index.ts` (SQLite adapter).

## Persistence behavior

- Data is stored locally in SQLite database `watermelon_expo`.
- Data persists across Metro reloads and app restarts.
- Data resets if the app is uninstalled.

## Notes

- HyperTillDB is local-first.
- For Expo native builds, run `expo run:*` after native/dependency changes.
