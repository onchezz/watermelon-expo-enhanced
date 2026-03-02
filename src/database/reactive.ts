import { createReactiveClient } from '@onchez/hypertilldb';

import { database } from '.';

export const reactive = createReactiveClient(database);

export type TaskRow = {
  id?: string;
  name: string;
  is_done: boolean;
  created_at: number;
};
