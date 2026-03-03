# HyperTillDB Notes Expo

Expo notes/tasks test app using the main HyperTillDB API.

## Setup

```bash
cd /Users/onchez/projects/watermelon-enhance/hypertillDb
./scripts/build-hypertill-package.sh

cd /Users/onchez/projects/watermelon-enhance/hypertill-expo
npm install --force ../hypertillDb/.npm-package/onchez-hypertilldb-0.0.1.tgz
npx expo run:android
```

## API used here

- Type-first model definitions via `dbModel<Task>()`
- Babel metadata extraction via `@onchez/hypertilldb/babel-plugin`
- Auto runtime bootstrap via `createDB(...)` (no manual schema/model classes)
- Reactive reads via:
  - `db.useTasks(...)`
  - `db.useTaskSearch({ search, columns, where, orderBy })`
- Writes via:
  - `db.tasks.create(...)`
  - `db.tasks.update(...)`
  - `db.tasks.createMany(...)` (uses package default chunking)
  - optional tuning: `db.tasks.createMany(..., { chunkSize, onProgress })`
  - `db.tasks.delete(...)`
- camelCase app fields mapped to snake_case storage columns internally

## Main files

- `database/hypertill.ts`
- `database/models.ts`
- `babel.config.js`
- `App.tsx`

## What the app now demonstrates

1. String search with selectable columns (`name`, `category`, or both).
2. Large local write (`Seed 5k`) using chunked `createMany`.
3. Live progress UI for bulk writes (`written/total`, `percent`, `chunk/chunksTotal`).
4. Simple mutation result shape:
   - `{ data, error, loading, status, progress }`

## Commands

```bash
npx tsc --noEmit
npx expo export --platform android --clear
npx expo export --platform web --clear
```
