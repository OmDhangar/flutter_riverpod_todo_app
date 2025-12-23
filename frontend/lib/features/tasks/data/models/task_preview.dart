import 'package:equatable/equatable.dart';
import 'package:flutter_riverpod_todo_app/features/tasks/data/models/task_entities.dart';

class TaskPreview extends Equatable {
  final String category;
  final String priority;
  final TaskEntities entities;
  final List<String> suggestedActions;

  const TaskPreview({
    required this.category,
    required this.priority,
    required this.entities,
    required this.suggestedActions,
  });

  @override
  List<Object?> get props => [category, priority, entities, suggestedActions];
}
