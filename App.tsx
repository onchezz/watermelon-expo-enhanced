import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

import { createTask, createTasksMany, db, updateTask } from './database/hypertill';

type TaskStatusFilter = 'all' | 'open' | 'done';
type SearchColumnFilter = 'all' | 'name' | 'category';

const FILTERS: TaskStatusFilter[] = ['all', 'open', 'done'];
const SEARCH_COLUMNS: SearchColumnFilter[] = ['all', 'name', 'category'];
const BASE_QUERY = {
  orderBy: { created_at: 'desc' as const },
  limit: 800,
};

type TaskRow = NonNullable<ReturnType<typeof db.tasks.useList>['data']>[number];

function buildFilterWhere(filter: TaskStatusFilter) {
  if (filter === 'open') {
    return { isDone: false };
  }

  if (filter === 'done') {
    return { isDone: true };
  }

  return undefined;
}

function buildSearchColumns(searchColumn: SearchColumnFilter): ('name' | 'category')[] {
  if (searchColumn === 'name') {
    return ['name'];
  }
  if (searchColumn === 'category') {
    return ['category'];
  }
  return ['name', 'category'];
}

function buildSearchQuery(
  filter: TaskStatusFilter,
  search: string,
  searchColumn: SearchColumnFilter,
) {
  return {
    ...BASE_QUERY,
    where: buildFilterWhere(filter),
    search,
    columns: buildSearchColumns(searchColumn),
  };
}

function computeTaskStats(tasks: TaskRow[]) {
  let done = 0;
  for (const task of tasks) {
    if (task.isDone) {
      done += 1;
    }
  }

  return {
    total: tasks.length,
    done,
    open: tasks.length - done,
  };
}

export default function App() {
  const [draft, setDraft] = useState('');
  const [draftCategory, setDraftCategory] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>('all');
  const [searchColumn, setSearchColumn] = useState<SearchColumnFilter>('all');
  const [actionError, setActionError] = useState<string | null>(null);
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);
  const [isSeedingLarge, setIsSeedingLarge] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{
    written: number;
    total: number;
    percent: number;
    chunk: number;
    chunksTotal: number;
  } | null>(null);

  const allTasks = db.tasks.useList(BASE_QUERY);
  const filteredTasks = db.useTaskSearch(
    buildSearchQuery(statusFilter, search, searchColumn),
    [statusFilter, search, searchColumn],
  );

  const stats = useMemo(() => computeTaskStats(allTasks.data ?? []), [allTasks.data]);
  const combinedError = actionError ?? filteredTasks.error?.message ?? null;

  async function handleAddTask() {
    const value = draft.trim();
    if (!value) {
      setActionError('Task name is required.');
      return;
    }

    const result = await createTask({
      name: value,
      category: draftCategory.trim() || undefined,
      isDone: false,
    });

    if (result.error) {
      setActionError(result.error.message);
      return;
    }

    setDraft('');
    setDraftCategory('');
    setActionError(null);
  }

  async function handleToggle(task: TaskRow) {
    if (!task.id) {
      return;
    }

    const result = await updateTask(task.id, { isDone: !task.isDone });
    if (result.error) {
      setActionError(result.error.message);
      return;
    }

    setActionError(null);
  }

  async function handleDelete(task: TaskRow) {
    if (!task.id) {
      return;
    }

    const result = await db.tasks.delete(task.id);
    if (result.error) {
      setActionError(result.error.message);
      return;
    }

    setActionError(null);
  }

  async function handleSeedDemo() {
    const first = await db.tasks.fetch({ limit: 1 });
    if (first.error) {
      setActionError(first.error.message);
      return;
    }

    if ((first.data ?? []).length > 0) {
      setActionError(null);
      return;
    }

    const demoTasks = [
      { name: 'Set up HyperTillDB', category: 'setup' },
      { name: 'Use model-first API in Expo', category: 'dev' },
      { name: 'Ship offline-first task flow', category: 'shipping' },
    ];

    const result = await createTasksMany(
      demoTasks.map((item) => ({
        name: item.name,
        category: item.category,
        isDone: false,
      })),
    );

    if (result.error) {
      setActionError(result.error.message);
      return;
    }

    setActionError(null);
  }

  async function handleSeed5000() {
    const categories = ['inventory', 'catalog', 'ops', 'sales'];
    const rows = Array.from({ length: 5000 }, (_value, index) => ({
      name: `Product Task ${index + 1}`,
      category: categories[index % categories.length],
      isDone: index % 5 === 0,
    }));

    setIsSeedingLarge(true);
    setActionError(null);
    setBulkMessage('Seeding 5,000 tasks...');
    setBulkProgress({
      written: 0,
      total: rows.length,
      percent: 0,
      chunk: 0,
      chunksTotal: Math.ceil(rows.length / 250),
    });

    const result = await db.tasks.createMany(rows, {
      onProgress: (progress) => {
        setBulkProgress({
          written: progress.written,
          total: progress.total,
          percent: progress.percent,
          chunk: progress.chunk,
          chunksTotal: progress.chunksTotal,
        });
      },
    });

    setIsSeedingLarge(false);

    if (result.error) {
      setActionError(result.error.message);
      setBulkMessage('Seed failed');
      return;
    }

    setBulkMessage(`Seed done: ${result.progress.written}/${result.progress.total}`);
  }

  async function handleClearCompleted() {
    const doneTasks = await db.tasks.fetch({ where: { isDone: true }, limit: 400 });
    if (doneTasks.error) {
      setActionError(doneTasks.error.message);
      return;
    }

    for (const task of doneTasks.data ?? []) {
      if (!task.id) {
        continue;
      }

      const result = await db.tasks.delete(task.id);
      if (result.error) {
        setActionError(result.error.message);
        return;
      }
    }

    setActionError(null);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>HyperTillDB</Text>
      <Text style={styles.subtitle}>Type-first, reactive local-first tasks in Expo</Text>

      <View style={styles.row}>
        <TextInput
          placeholder="Create a task"
          value={draft}
          onChangeText={setDraft}
          style={styles.input}
        />
        <TextInput
          placeholder="Category (optional)"
          value={draftCategory}
          onChangeText={setDraftCategory}
          style={styles.input}
        />
        <Pressable onPress={handleAddTask} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      <TextInput
        placeholder="Search tasks locally"
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      <View style={styles.filterRow}>
        {FILTERS.map((filter) => {
          const selected = filter === statusFilter;
          return (
            <Pressable
              key={filter}
              onPress={() => {
                setStatusFilter(filter);
              }}
              style={[styles.filterChip, selected ? styles.filterChipActive : undefined]}
            >
              <Text style={[styles.filterChipText, selected ? styles.filterChipTextActive : undefined]}>
                {filter.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.filterRow}>
        {SEARCH_COLUMNS.map((column) => {
          const selected = column === searchColumn;
          return (
            <Pressable
              key={column}
              onPress={() => {
                setSearchColumn(column);
              }}
              style={[styles.filterChip, selected ? styles.filterChipActive : undefined]}
            >
              <Text style={[styles.filterChipText, selected ? styles.filterChipTextActive : undefined]}>
                SEARCH: {column.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.actionsRow}>
        <Pressable onPress={handleSeedDemo} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Seed Demo</Text>
        </Pressable>
        <Pressable
          onPress={handleSeed5000}
          style={[styles.secondaryButton, isSeedingLarge ? styles.secondaryButtonDisabled : undefined]}
          disabled={isSeedingLarge}
        >
          <Text style={styles.secondaryButtonText}>{isSeedingLarge ? 'Seeding 5k...' : 'Seed 5k'}</Text>
        </Pressable>
        <Pressable onPress={handleClearCompleted} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Clear Done</Text>
        </Pressable>
      </View>

      <Text style={styles.statsText}>
        Total: {stats.total} | Open: {stats.open} | Done: {stats.done}
      </Text>
      {!!bulkMessage && <Text style={styles.hintText}>{bulkMessage}</Text>}
      {!!bulkProgress && (
        <Text style={styles.hintText}>
          Bulk: {bulkProgress.written}/{bulkProgress.total} ({bulkProgress.percent}%) | chunk{' '}
          {bulkProgress.chunk}/{bulkProgress.chunksTotal}
        </Text>
      )}

      {filteredTasks.isLoading && <Text style={styles.hintText}>Loading tasks...</Text>}
      {!!combinedError && <Text style={styles.errorText}>{combinedError}</Text>}

      <FlatList<TaskRow>
        data={(filteredTasks.data ?? []) as TaskRow[]}
        keyExtractor={(item, index) => item.id ?? `${item.name}-${index}`}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.taskCard, item.isDone ? styles.taskDone : undefined]}
            onPress={async () => {
              await handleToggle(item);
            }}
          >
            <View style={styles.taskMeta}>
              <Text style={[styles.taskText, item.isDone ? styles.taskTextDone : undefined]}>{item.name}</Text>
              {!!item.category && <Text style={styles.categoryText}>#{item.category}</Text>}
            </View>
            <Pressable
              onPress={async (event) => {
                event.stopPropagation();
                await handleDelete(item);
              }}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </Pressable>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.hintText}>No tasks found for this filter/search.</Text>}
      />

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 22,
    backgroundColor: '#f4f6f8',
  },
  title: {
    fontSize: 27,
    fontWeight: '700',
    color: '#0f1720',
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 12,
    color: '#4d5b67',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#d5dbe1',
  },
  searchInput: {
    marginTop: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#d5dbe1',
  },
  addButton: {
    backgroundColor: '#0a7f47',
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: '#c8d1da',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
  },
  filterChipActive: {
    borderColor: '#0a7f47',
    backgroundColor: '#e8f7ef',
  },
  filterChipText: {
    fontWeight: '700',
    color: '#33424d',
    fontSize: 12,
  },
  filterChipTextActive: {
    color: '#0a7f47',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c8d1da',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  secondaryButtonText: {
    fontWeight: '700',
    color: '#33424d',
  },
  secondaryButtonDisabled: {
    opacity: 0.6,
  },
  statsText: {
    marginTop: 12,
    marginBottom: 8,
    color: '#33424d',
    fontWeight: '600',
  },
  list: {
    gap: 8,
    paddingBottom: 32,
  },
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d5dbe1',
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskMeta: {
    flex: 1,
    marginRight: 8,
  },
  taskDone: {
    backgroundColor: '#edf4ef',
    borderColor: '#b8d8c3',
  },
  taskText: {
    color: '#0f1720',
    fontSize: 15,
    fontWeight: '600',
  },
  categoryText: {
    marginTop: 2,
    fontSize: 12,
    color: '#5e6d79',
    fontWeight: '600',
  },
  taskTextDone: {
    color: '#5a6b62',
    textDecorationLine: 'line-through',
  },
  deleteButton: {
    backgroundColor: '#ffe2e2',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  deleteButtonText: {
    color: '#9f1d1d',
    fontWeight: '700',
    fontSize: 12,
  },
  hintText: {
    color: '#5e6d79',
    marginTop: 10,
  },
  errorText: {
    marginTop: 8,
    marginBottom: 4,
    color: '#b00020',
    fontWeight: '600',
  },
});
