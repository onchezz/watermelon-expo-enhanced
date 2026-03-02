import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import { Task } from './models/Task';
import { schema } from './schema';

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'watermelon_expo',
  jsi: true,
  onSetUpError: (error: unknown) => {
    console.error('Watermelon setup error', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [Task],
});

export const tasksCollection = database.get<Task>(Task.table);
