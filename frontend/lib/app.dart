
import 'package:flutter/material.dart';
import 'package:flutter_riverpod_todo_app/screens/home_screen.dart';

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Todo App',
      theme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: Colors.cyan,
        scaffoldBackgroundColor: const Color(0xFF0E0E10),
        cardColor: const Color(0x0016161a).withOpacity(0.5),
        textTheme: const TextTheme(
          bodyLarge: TextStyle(color: Colors.white),
          bodyMedium: TextStyle(color: Colors.white70),
        ),
        // Add other theme properties as needed
      ),
      home: const HomeScreen(),
    );
  }
}
