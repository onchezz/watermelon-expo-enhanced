import {
  createDB,
  dbModel,
  defineModels,
} from '@onchez/hypertilldb';
import type { Task } from './models';

export const models = defineModels({
  Task: dbModel<Task>(),
});

export const db = createDB({
  name: 'notes-app',
  models,
});

export async function createTask(input: Task) {
  return db.tasks.create(input);
}

export async function createTasksMany(input: Task[]) {
  return db.tasks.createMany(input);
}

export async function updateTask(id: string, patch: Partial<Task>) {
  return db.tasks.update(id, patch);
}
