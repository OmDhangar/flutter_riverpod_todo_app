
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/task.dart';

class TaskService {
  final String _baseUrl = 'http://localhost:3000/api';
  final String _apiKey = 'your_secret_api_key_here';

  Future<List<Task>> fetchTasks() async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/tasks'),
        headers: {'x-api-key': _apiKey},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return (data['data']['tasks'] as List)
            .map((task) => Task.fromJson(task))
            .toList();
      } else {
        throw Exception('Failed to load tasks');
      }
    } catch (e) {
      throw Exception('Failed to connect to the server');
    }
  }

  Future<Task> createTask(Task task) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/tasks'),
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': _apiKey,
        },
        body: json.encode(task.toJson()),
      );

      if (response.statusCode == 201) {
        final data = json.decode(response.body);
        return Task.fromJson(data['data']['task']);
      } else {
        throw Exception('Failed to create task');
      }
    } catch (e) {
      throw Exception('Failed to connect to the server');
    }
  }

  Future<Task> updateTask(Task task) async {
    try {
      final response = await http.patch(
        Uri.parse('$_baseUrl/tasks/${task.id}'),
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': _apiKey,
        },
        body: json.encode(task.toJson()),
      );

      if (response.statusCode == 200) {
        return task;
      } else {
        throw Exception('Failed to update task');
      }
    } catch (e) {
      throw Exception('Failed to connect to the server');
    }
  }

  Future<void> deleteTask(String id) async {
    try {
      final response = await http.delete(
        Uri.parse('$_baseUrl/tasks/$id'),
        headers: {'x-api-key': _apiKey},
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to delete task');
      }
    } catch (e) {
      throw Exception('Failed to connect to the server');
    }
  }
}
