import 'package:flutter/material.dart';
import 'package:flutter_riverpod_todo_app/features/tasks/presentation/widgets/audit_history_timeline.dart';

class TaskDetailScreen extends StatelessWidget {
  const TaskDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        elevation: 0,
        title: const Text('Task overview'),
        actions: [
          IconButton(
            icon: const Icon(Icons.more_vert),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildMetadataSection(),
            const SizedBox(height: 24),
            _buildChipsSection('Extracted entities', ['Oct 24', 'Jira']),
            const SizedBox(height: 24),
            _buildChipsSection('Suggested actions', ['Schedule meeting', 'Open Jira']),
            const SizedBox(height: 24),
            const Text('Audit History', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            const AuditHistoryTimeline(),
          ],
        ),
      ),
    );
  }

  Widget _buildMetadataSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Metadata', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        _buildMetadataRow('Category', 'WORK', chipColor: Colors.purple),
        const SizedBox(height: 12),
        _buildMetadataRow('Priority', 'High', icon: Icons.circle, iconColor: Colors.yellow),
        const SizedBox(height: 12),
        _buildMetadataRow('Due Date', 'Oct 24'),
      ],
    );
  }

  Widget _buildMetadataRow(String title, String value, {IconData? icon, Color? iconColor, Color? chipColor}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: const TextStyle(color: Colors.white70, fontSize: 16)),
        Row(
          children: [
            if (icon != null)
              Icon(icon, color: iconColor ?? Colors.white, size: 12),
            if (icon != null)
              const SizedBox(width: 8),
            if (chipColor != null)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: chipColor.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(value, style: TextStyle(color: chipColor, fontSize: 12, fontWeight: FontWeight.bold)),
              )
            else
              Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
      ],
    );
  }

  Widget _buildChipsSection(String title, List<String> chips) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: chips.map((chip) {
            return Chip(
              label: Text(chip),
              backgroundColor: const Color(0xFF16161A),
              labelStyle: const TextStyle(color: Colors.white),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: const BorderSide(color: Colors.grey),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}
