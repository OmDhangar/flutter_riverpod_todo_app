import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod_todo_app/config/config.dart';
import 'package:riverpod/src/framework.dart';

class FlutterRiverpodTodoApp extends ConsumerWidget {
  const FlutterRiverpodTodoApp({super.key});

  ProviderListenable get routesProvider => null;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final route = ref.watch(routesProvider);

    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      routerConfig: route,
    );
  }
}
