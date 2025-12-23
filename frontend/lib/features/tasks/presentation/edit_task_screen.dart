import 'package:flutter/material.dart';

class EditTaskScreen extends StatelessWidget {
  const EditTaskScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0E0E10),
      appBar: AppBar(
        title: const Text('Edit Task', style: TextStyle(color: Colors.white)),
        backgroundColor: const Color(0xFF0E0E10),
      ),
      body: const Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              decoration: InputDecoration(
                labelText: 'Title',
                labelStyle: TextStyle(color: Colors.white70),
              ),
            ),
            SizedBox(height: 16),
            TextField(
              decoration: InputDecoration(
                labelText: 'Category',
                labelStyle: TextStyle(color: Colors.white70),
              ),
            ),
            SizedBox(height: 16),
            ElevatedButton(
              onPressed: null,
              child: Text('Save Changes'),
            ),
          ],
        ),
      ),
    );
  }
}
