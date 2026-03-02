# Reactive API Guide

## Create client

```ts
import { createReactiveClient } from '@nozbe/watermelondb'
import { database } from './index'

export const reactive = createReactiveClient(database)
```

## Query reactively without manual `useEffect`

```tsx
import { useReactiveQuery } from '@nozbe/watermelondb/reactive/react'

const { data, isLoading, error } = useReactiveQuery(
  () => reactive.from<TaskRow>('tasks').order('created_at', { ascending: false }),
  [],
)
```

## Insert

```ts
await reactive.from<TaskRow>('tasks').insert({
  name: 'Buy milk',
  is_done: false,
  created_at: Date.now(),
})
```

## Update

```ts
await reactive
  .from<TaskRow>('tasks')
  .eq('id', taskId)
  .update({ is_done: true })
```

## Delete

```ts
await reactive
  .from<TaskRow>('tasks')
  .eq('id', taskId)
  .delete()
```

## Optional filters like `project_id`

WatermelonDB is local-first; filters only apply to your local schema.  
If your table has a `project_id` column, you can do:

```ts
reactive.from('tasks').eq('project_id', projectId).subscribe(...)
```

If not, remove that filter.
