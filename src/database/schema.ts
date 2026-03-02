import { appSchema, tableSchema } from '@onchez/hypertilldb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'tasks',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'is_done', type: 'boolean' },
        { name: 'created_at', type: 'number', isIndexed: true },
      ],
    }),
  ],
});
