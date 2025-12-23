import 'package:equatable/equatable.dart';

class TaskEntities extends Equatable {
  final List<String> dates;
  final List<String> people;
  final List<String> locations;
  final List<String> topics;

  const TaskEntities({
    required this.dates,
    required this.people,
    required this.locations,
    required this.topics,
  });

  @override
  List<Object?> get props => [dates, people, locations, topics];
}
