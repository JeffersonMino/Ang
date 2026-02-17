// ============================
// FILE: lib/pages/add_expense_page.dart
// ============================
import 'package:flutter/material.dart';
import 'package:appsweb_control/services/api_services.dart';

class AddExpensePage extends StatefulWidget {
  const AddExpensePage({super.key});

  @override
  _AddExpensePageState createState() => _AddExpensePageState();
}

class _AddExpensePageState extends State<AddExpensePage> {
  final _formKey = GlobalKey<FormState>();
  final _amountCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  int? _categoryId;
  List<dynamic> _categories = [];
  bool _loading = false;
  final ApiService api = ApiService();

  @override
  void initState() {
    super.initState();
    _loadCategories();
  }

  Future<void> _loadCategories() async {
    try {
      _categories = await api.getCategories();
      setState(() {});
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _loading = true;
    });
    try {
      final payload = {
        'categoryId': _categoryId,
        'amount': double.parse(_amountCtrl.text),
        'description': _descCtrl.text,
        'createdAt': DateTime.now().toUtc().toIso8601String(),
      };
      await api.addExpense(payload);
      Navigator.pop(context);
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
    return Scaffold(
      appBar: AppBar(title: const Text('Agregar gasto')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              DropdownButtonFormField<int>(
                initialValue: _categoryId,
                items: _categories
                    .map<DropdownMenuItem<int>>(
                      (c) => DropdownMenuItem<int>(
                        value: c['id'] as int,
                        child: Text(c['name']),
                      ),
                    )
                    .toList(),
                onChanged: (v) => setState(() {
                  _categoryId = v;
                }),
                decoration: const InputDecoration(labelText: 'Categoría'),
                validator: (v) => v == null ? 'Selecciona categoría' : null,
              ),
              TextFormField(
                controller: _amountCtrl,
                decoration: const InputDecoration(labelText: 'Monto'),
                keyboardType: TextInputType.number,
                validator: (v) =>
                    v != null && v.isNotEmpty ? null : 'Requerido',
              ),
              TextFormField(
                controller: _descCtrl,
                decoration: const InputDecoration(
                  labelText: 'Descripción (opc)',
                ),
                maxLines: 2,
              ),
              const SizedBox(height: 16),
              _loading
                  ? const CircularProgressIndicator()
                  : ElevatedButton(
                      onPressed: _save,
                      child: const Text('Guardar'),
                    ),
            ],
          ),
        ),
      ),
    );
  }
}
