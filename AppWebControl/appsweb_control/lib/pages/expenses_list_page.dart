// ============================
// FILE: lib/pages/expenses_list_page.dart
// ============================
import 'package:flutter/material.dart';
import 'package:appsweb_control/services/api_services.dart';
import 'package:intl/intl.dart';

class ExpensesListPage extends StatefulWidget {
  const ExpensesListPage({super.key});

  @override
  _ExpensesListPageState createState() => _ExpensesListPageState();
}

class _ExpensesListPageState extends State<ExpensesListPage> {
  final ApiService api = ApiService();
  bool _loading = true;
  List<dynamic> _expenses = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
    });
    try {
      _expenses = await api.getExpenses();
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(e.toString())));
    }
    setState(() {
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final df = NumberFormat.simpleCurrency();
    return Scaffold(
      appBar: AppBar(title: const Text('Gastos')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView.builder(
                itemCount: _expenses.length,
                itemBuilder: (ctx, i) {
                  final e = _expenses[i];
                  return ListTile(
                    leading: const Icon(Icons.monetization_on),
                    title: Text(e['description'] ?? 'Sin descripción'),
                    subtitle: Text(
                      DateFormat.yMMMd().format(DateTime.parse(e['createdAt'])),
                    ),
                    trailing: Text(df.format((e['amount'] as num).toDouble())),
                  );
                },
              ),
            ),
    );
  }
}
