# Getting Started

## 1. Install dependencies

```bash
npm install
```

The enhanced WatermelonDB build is loaded from:

`vendor/nozbe-watermelondb-0.28.1-0.tgz`

## 2. Build and run (native)

Android:

```bash
npx expo run:android
```

iOS:

```bash
npx expo run:ios
```

## 3. Validate compile

```bash
npx tsc --noEmit
CI=1 npx expo export --clear --platform android
```

## 4. Main app flow

- Type a task and tap `Add`.
- Task insert goes through `reactive.from('tasks').insert(...)`.
- List updates automatically via `useReactiveQuery`.
- Tap a task to toggle `is_done`.
