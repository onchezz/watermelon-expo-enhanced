import { supabaseLocal } from '../localFirst';
import type { TaskRow } from '../reactive';

export async function createTaskExample(name: string) {
  return supabaseLocal.tasks.create(name);
}

export async function listOpenTasksExample() {
  return supabaseLocal.tasks.fetch({ status: 'open', limit: 50 });
}

export async function toggleTaskExample(task: TaskRow) {
  if (!task.id) {
    return { data: null, error: new Error('Task id is required.') };
  }

  return supabaseLocal.tasks.toggle(task.id, task.is_done);
}

export async function renameTaskExample(taskId: string, nextName: string) {
  return supabaseLocal.tasks.rename(taskId, nextName);
}

export async function clearCompletedTasksExample() {
  return supabaseLocal.tasks.clearCompleted();
}

export async function seedDemoDataExample() {
  return supabaseLocal.tasks.seedDemoIfEmpty();
}

export function subscribeToAllTasksExample(
  callback: (result: { data: TaskRow[] | null; error: Error | null }) => void,
) {
  return supabaseLocal.tasks.subscribe({ status: 'all' }, callback);
}
