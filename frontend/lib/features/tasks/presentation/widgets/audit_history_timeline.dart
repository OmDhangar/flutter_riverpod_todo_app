import 'package:flutter/material.dart';

class AuditHistoryTimeline extends StatelessWidget {
  const AuditHistoryTimeline({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: 3, // Replace with actual audit history count
      itemBuilder: (context, index) {
        return const ListTile(
          leading: Icon(Icons.history, color: Colors.white70),
          title: Text('Action', style: TextStyle(color: Colors.white)),
          subtitle: Text('Timestamp', style: TextStyle(color: Colors.white70)),
        );
      },
    );
  }
}
