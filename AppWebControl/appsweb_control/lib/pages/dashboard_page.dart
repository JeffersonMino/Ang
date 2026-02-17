// ============================
// FILE: lib/pages/dashboard_page.dart
// ============================
import 'package:flutter/material.dart';
import 'package:appsweb_control/services/api_services.dart';
import 'package:intl/intl.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  _DashboardPageState createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
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
      final now = DateTime.now();
      _expenses = await api.getExpenses(month: now.month, year: now.year);
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
    final total = _expenses.fold<double>(
      0.0,
      (p, e) => p + (e['amount'] as num).toDouble(),
    );

    return Scaffold(
      appBar: AppBar(title: const Text('Dashboard')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Gasto total del mes',
                            style: TextStyle(fontSize: 18),
                          ),
                          Text(
                            df.format(total),
                            style: const TextStyle(
                              fontSize: 28,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: () => Navigator.pushNamed(context, '/add'),
                    icon: const Icon(Icons.add),
                    label: const Text('Agregar gasto'),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Últimos gastos',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  ..._expenses.map(
                    (e) => ListTile(
                      leading: const Icon(Icons.monetization_on),
                      title: Text(e['description'] ?? 'Sin descripción'),
                      trailing: Text(
                        df.format((e['amount'] as num).toDouble()),
                      ),
                      subtitle: Text(
                        DateFormat.yMMMd().add_jm().format(
                          DateTime.parse(e['createdAt']),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => Navigator.pushNamed(context, '/expenses'),
        child: const Icon(Icons.list),
      ),
    );
  }
}
