# Troubleshooting

## `@nozbe/watermelondb could not be found`

Install dependencies in the app repo root:

```bash
npm install
```

Confirm tarball exists:

`vendor/nozbe-watermelondb-0.28.1-0.tgz`

## Flow syntax error from `src/Query/index.js` (`@lazy`)

Cause: importing WatermelonDB internal source paths (`@nozbe/watermelondb/src/...`).  
Fix: use package entrypoints only:

- `@nozbe/watermelondb`
- `@nozbe/watermelondb/adapters/sqlite`
- `@nozbe/watermelondb/reactive/react`

## TypeScript error: `import type ... can only be used in TypeScript files`

Cause: using `import type` in `.js` file.  
Fix: rename file to `.ts`/`.tsx` or use normal `import`.

## TS5053: `emitDeclarationOnly` with `noEmit`

Those options conflict.  
If running checks, use `noEmit` and remove `emitDeclarationOnly` from that config/profile.

## Native build mismatch after dependency changes

Rebuild native app:

```bash
npx expo run:android
# or
npx expo run:ios
```
