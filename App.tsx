import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useReactiveQuery } from '@nozbe/watermelondb/reactive/react';

import { reactive, type TaskRow } from './src/database/reactive';

export default function App() {
  const [draft, setDraft] = useState('');
  const { data, error, isLoading } = useReactiveQuery<TaskRow>(
    () => reactive.from<TaskRow>('tasks').order('created_at', { ascending: false }),
    [],
  );
  const tasks = data ?? [];

  async function handleAddTask() {
    const value = draft.trim();
    if (!value) {
      return;
    }

    const response = await reactive.from<TaskRow>('tasks').insert({
      name: value,
      is_done: false,
      created_at: Date.now(),
    });

    if (response.error) {
      console.error(response.error);
      return;
    }

    setDraft('');
  }

  async function handleToggle(task: TaskRow) {
    if (!task.id) {
      return;
    }

    const response = await reactive
      .from<TaskRow>('tasks')
      .eq('id', task.id)
      .update({ is_done: !task.is_done });

    if (response.error) {
      console.error(response.error);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Watermelon + Expo</Text>
      <View style={styles.row}>
        <TextInput
          placeholder="Write a task"
          value={draft}
          onChangeText={setDraft}
          style={styles.input}
        />
        <Pressable onPress={handleAddTask} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      {!!error && <Text style={styles.errorText}>{error.message}</Text>}
      {isLoading && <Text style={styles.hintText}>Loading tasks...</Text>}

      <FlatList<TaskRow>
        data={tasks}
        keyExtractor={(item, index) => item.id ?? `${item.name}-${index}`}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.taskCard, item.is_done ? styles.taskDone : undefined]}
            onPress={async () => {
              await handleToggle(item);
            }}
          >
            <Text style={[styles.taskText, item.is_done ? styles.taskTextDone : undefined]}>
              {item.name}
            </Text>
          </Pressable>
        )}
      />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    backgroundColor: '#f4f6f8',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    color: '#101418',
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
  hintText: {
    marginTop: 12,
    color: '#5e6772',
  },
  errorText: {
    marginTop: 12,
    color: '#b3261e',
  },
  list: {
    paddingTop: 16,
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
  },
  taskDone: {
    opacity: 0.55,
  },
  taskText: {
    color: '#101418',
    fontSize: 16,
  },
  taskTextDone: {
    textDecorationLine: 'line-through',
  },
});
