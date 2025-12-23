import 'package:equatable/equatable.dart';

class Task extends Equatable {
  final String id;
  final String title;
  final String category;
  final String priority;
  final DateTime? dueDate;

  const Task({
    required this.id,
    required this.title,
    required this.category,
    required this.priority,
    this.dueDate,
  });

  @override
  List<Object?> get props => [id, title, category, priority, dueDate];
}
