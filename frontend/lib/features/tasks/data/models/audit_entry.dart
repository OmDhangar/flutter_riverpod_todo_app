import 'package:equatable/equatable.dart';

class AuditEntry extends Equatable {
  final DateTime timestamp;
  final String action;
  final Map<String, dynamic> changedFields;

  const AuditEntry({
    required this.timestamp,
    required this.action,
    required this.changedFields,
  });

  @override
  List<Object?> get props => [timestamp, action, changedFields];
}
