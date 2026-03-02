import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useReactiveQuery } from '@nozbe/watermelondb/reactive/react';

import { supabaseLocal, type TaskStatusFilter } from './src/database/localFirst';
import type { TaskRow } from './src/database/reactive';

const FILTERS: TaskStatusFilter[] = ['all', 'open', 'done'];

export default function App() {
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>('all');
  const [actionError, setActionError] = useState<string | null>(null);

  const allTasksQuery = useReactiveQuery<TaskRow>(
    () => supabaseLocal.tasks.query({ status: 'all', limit: 400 }),
    [],
  );

  const filteredTasksQuery = useReactiveQuery<TaskRow>(
    () => supabaseLocal.tasks.query({ status: statusFilter, limit: 400 }),
    [statusFilter],
  );

  const displayTasks = useMemo(
    () => supabaseLocal.tasks.searchLocal(filteredTasksQuery.data ?? [], search),
    [filteredTasksQuery.data, search],
  );

  const stats = useMemo(() => supabaseLocal.tasks.stats(allTasksQuery.data ?? []), [allTasksQuery.data]);

  const combinedError = actionError ?? filteredTasksQuery.error?.message ?? null;

  async function handleAddTask() {
    const result = await supabaseLocal.tasks.create(draft);
    if (result.error) {
      setActionError(result.error.message);
      return;
    }

    setDraft('');
    setActionError(null);
  }

  async function handleToggle(task: TaskRow) {
    if (!task.id) {
      return;
    }

    const result = await supabaseLocal.tasks.toggle(task.id, task.is_done);
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

    const result = await supabaseLocal.tasks.remove(task.id);
    if (result.error) {
      setActionError(result.error.message);
      return;
    }

    setActionError(null);
  }

  async function handleSeedDemo() {
    const result = await supabaseLocal.tasks.seedDemoIfEmpty();
    if (result.error) {
      setActionError(result.error.message);
      return;
    }

    setActionError(null);
  }

  async function handleClearCompleted() {
    const result = await supabaseLocal.tasks.clearCompleted();
    if (result.error) {
      setActionError(result.error.message);
      return;
    }

    setActionError(null);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Supabase-Style LocalFirst</Text>
      <Text style={styles.subtitle}>WatermelonDB reactive client with working local CRUD and filters</Text>

      <View style={styles.row}>
        <TextInput
          placeholder="Create a task"
          value={draft}
          onChangeText={setDraft}
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

      <View style={styles.actionsRow}>
        <Pressable onPress={handleSeedDemo} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Seed Demo</Text>
        </Pressable>
        <Pressable onPress={handleClearCompleted} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Clear Done</Text>
        </Pressable>
      </View>

      <Text style={styles.statsText}>
        Total: {stats.total} | Open: {stats.open} | Done: {stats.done}
      </Text>

      {filteredTasksQuery.isLoading && <Text style={styles.hintText}>Loading tasks...</Text>}
      {!!combinedError && <Text style={styles.errorText}>{combinedError}</Text>}

      <FlatList<TaskRow>
        data={displayTasks}
        keyExtractor={(item, index) => item.id ?? `${item.name}-${index}`}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.taskCard, item.is_done ? styles.taskDone : undefined]}
            onPress={async () => {
              await handleToggle(item);
            }}
          >
            <Text style={[styles.taskText, item.is_done ? styles.taskTextDone : undefined]}>{item.name}</Text>
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
  },
  secondaryButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cad4dd',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  secondaryButtonText: {
    color: '#2b3a45',
    fontWeight: '700',
    fontSize: 12,
  },
  statsText: {
    marginTop: 12,
    color: '#3f4d59',
  },
  hintText: {
    marginTop: 12,
    color: '#5e6772',
  },
  errorText: {
    marginTop: 12,
    color: '#b3261e',
    fontWeight: '600',
  },
  list: {
    paddingTop: 14,
    paddingBottom: 32,
    gap: 8,
  },
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dfe5eb',
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  taskDone: {
    opacity: 0.58,
  },
  taskText: {
    color: '#101418',
    fontSize: 16,
    flex: 1,
  },
  taskTextDone: {
    textDecorationLine: 'line-through',
  },
  deleteButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0c8c5',
    backgroundColor: '#fff4f3',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  deleteButtonText: {
    color: '#b3261e',
    fontWeight: '700',
    fontSize: 12,
  },
});
