import { Database } from '@onchez/hypertilldb';
import LokiJSAdapter from '@onchez/hypertilldb/adapters/lokijs';

import { Task } from './models/Task';
import { schema } from './schema';

const adapter = new LokiJSAdapter({
  schema,
  dbName: 'hypertill_expo_web',
  useWebWorker: false,
  useIncrementalIndexedDB: true,
  onSetUpError: (error: unknown) => {
    console.error('HyperTillDB web setup error', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [Task],
});

export const tasksCollection = database.get<Task>(Task.table);
