import { reactive, type TaskRow } from './reactive';

export type TaskStatusFilter = 'all' | 'open' | 'done';

export type TaskQueryOptions = {
  status?: TaskStatusFilter;
  ascending?: boolean;
  limit?: number;
  from?: number;
  to?: number;
};

export type LocalResponse<T> = {
  data: T | null;
  error: Error | null;
};

export type TaskStats = {
  total: number;
  open: number;
  done: number;
};

function buildTasksQuery(options: TaskQueryOptions = {}) {
  const { status = 'all', ascending = false, limit, from, to } = options;

  let query = reactive.from<TaskRow>('tasks').order('created_at', { ascending });

  if (status === 'open') {
    query = query.eq('is_done', false);
  } else if (status === 'done') {
    query = query.eq('is_done', true);
  }

  if (typeof limit === 'number') {
    query = query.limit(limit);
  }

  if (typeof from === 'number' && typeof to === 'number') {
    query = query.range(from, to);
  }

  return query;
}

async function createTask(name: string): Promise<LocalResponse<TaskRow[]>> {
  const value = name.trim();
  if (!value) {
    return {
      data: null,
      error: new Error('Task name is required.'),
    };
  }

  return reactive.from<TaskRow>('tasks').insert({
    name: value,
    is_done: false,
    created_at: Date.now(),
  });
}

async function setTaskDone(taskId: string, isDone: boolean): Promise<LocalResponse<TaskRow[]>> {
  return reactive.from<TaskRow>('tasks').eq('id', taskId).update({ is_done: isDone });
}

async function renameTask(taskId: string, nextName: string): Promise<LocalResponse<TaskRow[]>> {
  const value = nextName.trim();
  if (!value) {
    return {
      data: null,
      error: new Error('Task name cannot be empty.'),
    };
  }

  return reactive.from<TaskRow>('tasks').eq('id', taskId).update({ name: value });
}

async function removeTask(taskId: string): Promise<LocalResponse<TaskRow[]>> {
  return reactive.from<TaskRow>('tasks').eq('id', taskId).delete();
}

async function clearCompletedTasks(): Promise<LocalResponse<number>> {
  const completed = await buildTasksQuery({ status: 'done' }).fetch();
  if (completed.error) {
    return { data: null, error: completed.error };
  }

  const rows = completed.data ?? [];
  let deleted = 0;

  for (const row of rows) {
    if (!row.id) {
      continue;
    }

    const result = await removeTask(row.id);
    if (result.error) {
      return { data: null, error: result.error };
    }

    deleted += 1;
  }

  return { data: deleted, error: null };
}

async function seedDemoTasksIfEmpty(): Promise<LocalResponse<number>> {
  const first = await buildTasksQuery({ limit: 1 }).maybeSingle();
  if (first.error) {
    return { data: null, error: first.error };
  }

  if (first.data) {
    return { data: 0, error: null };
  }

  const demoTasks = [
    'Set up local-first schema',
    'Create reactive queries',
    'Ship working offline UX',
  ];

  let inserted = 0;

  for (const name of demoTasks) {
    const result = await createTask(name);
    if (result.error) {
      return { data: null, error: result.error };
    }
    inserted += 1;
  }

  return { data: inserted, error: null };
}

function filterTasksBySearch(tasks: TaskRow[], searchTerm: string): TaskRow[] {
  const term = searchTerm.trim().toLowerCase();
  if (!term) {
    return tasks;
  }

  return tasks.filter((task) => task.name.toLowerCase().includes(term));
}

function computeTaskStats(tasks: TaskRow[]): TaskStats {
  let done = 0;
  for (const task of tasks) {
    if (task.is_done) {
      done += 1;
    }
  }

  return {
    total: tasks.length,
    done,
    open: tasks.length - done,
  };
}

export const supabaseLocal = {
  from: reactive.from.bind(reactive),
  tasks: {
    query: buildTasksQuery,
    fetch: (options?: TaskQueryOptions) => buildTasksQuery(options).fetch(),
    subscribe: (
      options: TaskQueryOptions,
      callback: (result: LocalResponse<TaskRow[]>) => void,
    ) => buildTasksQuery(options).subscribe(callback),
    create: createTask,
    setDone: setTaskDone,
    toggle: (taskId: string, currentValue: boolean) => setTaskDone(taskId, !currentValue),
    rename: renameTask,
    remove: removeTask,
    clearCompleted: clearCompletedTasks,
    seedDemoIfEmpty: seedDemoTasksIfEmpty,
    searchLocal: filterTasksBySearch,
    stats: computeTaskStats,
  },
};
