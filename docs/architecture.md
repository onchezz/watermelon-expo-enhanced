# Architecture

## Data layer

- `src/database/schema.ts` defines SQLite tables.
- `src/database/models/Task.ts` maps table rows to model helpers.
- `src/database/index.ts` initializes adapter and database.
- `src/database/reactive.ts` exports `reactive` client.

## UI layer

- `App.tsx` consumes reactive queries with `useReactiveQuery`.
- Writes (`insert`, `update`) are called through `reactive.from(...)`.
- Query invalidation and re-fetch are automatic.

## Why this wrapper style

- Keeps component code close to Supabase-like usage.
- Avoids manual subscription lifecycle in each component.
- Preserves WatermelonDB local performance and observability.
