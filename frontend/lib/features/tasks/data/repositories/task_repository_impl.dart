import 'package:flutter_riverpod_todo_app/core/network/dio_client.dart';
import 'package:flutter_riverpod_todo_app/features/tasks/data/models/task_model.dart';
import 'package:flutter_riverpod_todo_app/features/tasks/data/models/task_preview.dart';
import 'package:flutter_riverpod_todo_app/features/tasks/domain/repositories/task_repository.dart';

class TaskRepositoryImpl implements TaskRepository {
  final DioClient _dioClient;

  TaskRepositoryImpl(this._dioClient);

  @override
  Future<TaskPreview> getTaskPreview(String taskText) async {
    // Implement API call to POST /api/tasks
  }

  @override
  Future<Task> createTask(String taskText, bool confirm) async {
    // Implement API call to POST /api/tasks with confirm=true
  }

  @override
  Future<List<Task>> getTasks(int limit, int offset) async {
    // Implement API call to GET /api/tasks
  }

  @override
  Future<Task> getTaskById(String id) async {
    // Implement API call to GET /api/tasks/:id
  }

  @override
  Future<Task> updateTask(String id, Map<String, dynamic> updates) async {
    // Implement API call to PATCH /api/tasks/:id
  }

  @override
  Future<void> deleteTask(String id) async {
    // Implement API call to DELETE /api/tasks/:id
  }
}
