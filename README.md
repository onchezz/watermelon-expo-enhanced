# Watermelon Expo Enhanced

Expo + React Native starter app wired to the enhanced WatermelonDB fork and the new reactive query API (`createReactiveClient` + `useReactiveQuery`).

## What this repo includes

- Native Expo app (`expo run:android`, `expo run:ios`)
- Local-first task list backed by WatermelonDB SQLite
- Reactivity without manual `useEffect` subscriptions
- Vendored enhanced package tarball:
  - `vendor/nozbe-watermelondb-0.28.1-0.tgz`

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

Run static checks:

```bash
npx tsc --noEmit
CI=1 npx expo export --clear --platform android
```

## Database wiring

Main files:

- `src/database/schema.ts`
- `src/database/models/Task.ts`
- `src/database/index.ts`
- `src/database/reactive.ts`
- `App.tsx`

Reactive reads in components:

```tsx
const { data, isLoading, error } = useReactiveQuery(
  () => reactive.from<TaskRow>('tasks').order('created_at', { ascending: false }),
  [],
)
```

Writes:

```tsx
await reactive.from<TaskRow>('tasks').insert({
  name: value,
  is_done: false,
  created_at: Date.now(),
})
```

## Update to a newer enhanced DB build

The vendored tarball is generated from:

- Enhanced fork: `https://github.com/onchezz/watermelondb-enhanced`
- Branch: `codex/enhancement-bootstrap`

Refresh flow:

```bash
# in the watermelondb-enhanced repo clone
git checkout codex/enhancement-bootstrap
npm install
npm run build
cd dist
npm pack

# in this expo repo
cp ../watermelondb/dist/nozbe-watermelondb-0.28.1-0.tgz ./vendor/
npm install
```

## Project docs

- Live site: `https://onchezz.github.io/watermelon-expo-enhanced/`
- Home: `docs/index.html`
- Getting started: `docs/getting-started/index.html`
- Reactive API guide: `docs/reactive-api/index.html`
- Architecture notes: `docs/architecture/index.html`
- Troubleshooting: `docs/troubleshooting/index.html`
- Compatibility redirects for old links:
  - `docs/docs/index.html`
  - `docs/docs/getting-started/index.html`
  - `docs/docs/reactive-api/index.html`
  - `docs/docs/architecture/index.html`
  - `docs/docs/troubleshooting/index.html`

## Notes

- WatermelonDB is local-first. Fields like `project_id` are optional app-level columns used only if your local schema includes them.
- For Expo native builds, always run `expo run:*` after dependency or native config changes.
