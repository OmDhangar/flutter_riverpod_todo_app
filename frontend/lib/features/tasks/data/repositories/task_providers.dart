import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod_todo_app/core/network/dio_client.dart';
import 'package:flutter_riverpod_todo_app/features/tasks/data/repositories/task_repository_impl.dart';
import 'package:flutter_riverpod_todo_app/features/tasks/domain/repositories/task_repository.dart';

final dioClientProvider = Provider<DioClient>((ref) => DioClient());

final taskRepositoryProvider = Provider<TaskRepository>((ref) {
  final dioClient = ref.watch(dioClientProvider);
  return TaskRepositoryImpl(dioClient);
});
