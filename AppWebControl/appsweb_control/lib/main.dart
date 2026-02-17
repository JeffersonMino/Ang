import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:appsweb_control/pages/login_page.dart';
import 'package:appsweb_control/pages/register_page.dart';
import 'package:appsweb_control/pages/dashboard_page.dart';
import 'package:appsweb_control/pages/expenses_list_page.dart';
import 'package:appsweb_control/pages/add_expense_page.dart';
import 'package:appsweb_control/providers/auth_provider.dart';
import 'package:appsweb_control/services/api_services.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final apiService = ApiService();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider(apiService)),
      ],
      child: const ExpenseApp(),
    ),
  );
}

class ExpenseApp extends StatelessWidget {
  const ExpenseApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Expense Tracker',
      theme: ThemeData(primarySwatch: Colors.indigo),
      initialRoute: '/',
      routes: {
        '/': (ctx) => const LoginPage(),
        '/register': (ctx) => const RegisterPage(),
        '/dashboard': (ctx) => const DashboardPage(),
        '/expenses': (ctx) => const ExpensesListPage(),
        '/add': (ctx) => const AddExpensePage(),
      },
    );
  }
}
