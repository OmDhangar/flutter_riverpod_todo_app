
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/task.dart';
import '../services/task_service.dart';

final taskServiceProvider = Provider<TaskService>((ref) => TaskService());

final tasksProvider = NotifierProvider<TasksNotifier, List<Task>>(TasksNotifier.new);

class TasksNotifier extends Notifier<List<Task>> {
  @override
  List<Task> build() {
    return []; // Initial state is an empty list
  }

  TaskService get _taskService => ref.watch(taskServiceProvider);

  Future<void> fetchTasks() async {
    try {
      state = await _taskService.fetchTasks();
    } catch (e) {
      // Handle error
    }
  }

  Future<void> createTask(Task task) async {
    try {
      final newTask = await _taskService.createTask(task);
      state = [...state, newTask];
    } catch (e) {
      // Handle error
    }
  }

  Future<void> updateTask(Task task) async {
    try {
      await _taskService.updateTask(task);
      state = [
        for (final t in state)
          if (t.id == task.id) task else t,
      ];
    } catch (e) {
      // Handle error
    }
  }

  Future<void> deleteTask(String id) async {
    try {
      await _taskService.deleteTask(id);
      state = state.where((task) => task.id != id).toList();
    } catch (e) {
      // Handle error
    }
  }
}
