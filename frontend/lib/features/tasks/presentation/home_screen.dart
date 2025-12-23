import 'package:flutter/material.dart';
import 'package:flutter_riverpod_todo_app/features/tasks/presentation/create_task_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.menu),
          onPressed: () {},
        ),
        title: const Text('My Tasks'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildFilterChips(),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: 4, // Placeholder
              itemBuilder: (context, index) {
                return const TaskCard();
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const CreateTaskScreen()),
          );
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildFilterChips() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 16),
      child: Row(
        children: [
          ChoiceChip(
            label: const Text('All'),
            selected: true,
            onSelected: (selected) {},
            backgroundColor: Colors.transparent,
            selectedColor: const Color(0xFF22D4A7),
            labelStyle: const TextStyle(color: Colors.white),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
              side: const BorderSide(color: Color(0xFF22D4A7)),
            ),
          ),
          const SizedBox(width: 8),
          ChoiceChip(
            label: const Text('Work'),
            selected: false,
            onSelected: (selected) {},
             backgroundColor: Colors.transparent,
            labelStyle: const TextStyle(color: Colors.white),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
              side: const BorderSide(color: Colors.grey),
            ),
          ),
          const SizedBox(width: 8),
          ChoiceChip(
            label: const Text('Personal'),
            selected: false,
            onSelected: (selected) {},
             backgroundColor: Colors.transparent,
            labelStyle: const TextStyle(color: Colors.white),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
              side: const BorderSide(color: Colors.grey),
            ),
          ),
        ],
      ),
    );
  }
}

class TaskCard extends StatelessWidget {
  const TaskCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Premium Task',
              style: TextStyle(color: Color(0xFF22D4A7), fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Finalize Q3 architectural diagrams',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.purple.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text('WORK', style: TextStyle(color: Colors.purple, fontSize: 10)),
                ),
                const SizedBox(width: 8),
                const Icon(Icons.circle, color: Colors.yellow, size: 8),
                const SizedBox(width: 4),
                const Text('Priority', style: TextStyle(color: Colors.white70)),
                const Spacer(),
                const Text('Oct 24', style: TextStyle(color: Colors.white70)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
