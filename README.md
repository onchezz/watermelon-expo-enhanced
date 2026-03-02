# Watermelon Expo Enhanced

Expo + React Native starter app wired to the enhanced WatermelonDB fork and the new reactive query API (`createReactiveClient` + `useReactiveQuery`).

## What this repo includes

- Native Expo app (`expo run:android`, `expo run:ios`)
- Local-first task list backed by WatermelonDB SQLite
- Supabase-style local-first service layer (`src/database/localFirst.ts`)
- Reactivity without manual `useEffect` subscriptions for data wiring
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

## Installation modes

Use vendored tarball (default, already configured):

```bash
npm run setup:db:vendor
```

Switch to published npm package (once published):

```bash
npm run setup:db:npm
# or pin a specific version
./scripts/setup-enhanced-db.sh npm @onchezz/hyperdb@0.28.1-0.enhanced.0
```

This script keeps app imports unchanged by mapping `@nozbe/watermelondb` to `npm:@onchezz/hyperdb@...`.

## Database wiring

Main files:

- `src/database/schema.ts`
- `src/database/models/Task.ts`
- `src/database/index.ts`
- `src/database/reactive.ts`
- `src/database/localFirst.ts`
- `src/database/examples/supabaseLocalExamples.ts`
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
await supabaseLocal.tasks.create('Ship local-first feature')
await supabaseLocal.tasks.toggle(taskId, false)
await supabaseLocal.tasks.clearCompleted()
```

## Persistence behavior

- Data is stored locally in SQLite database `watermelon_expo`.
- Data should persist across Metro reloads and app restarts.
- Data resets if the app is uninstalled or if you explicitly reset storage.

## Update to a newer enhanced DB build

The vendored tarball is generated from:

- Enhanced fork: `https://github.com/onchezz/hyperDb`
- Branch: `codex/enhancement-bootstrap`
- Full packaging guide: `https://github.com/onchezz/hyperDb/blob/codex/enhancement-bootstrap/NPM_PACKAGE_SETUP.md`

Refresh flow:

```bash
# in the hyperDb repo clone
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
