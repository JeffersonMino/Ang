// // ============================
// // FILE: lib/services/api_service.dart
// // ============================
// import 'dart:convert';
// import 'dart:html' as html; // <--- AGREGAR ESTO
// import 'package:http/http.dart' as http;
// import 'package:flutter_secure_storage/flutter_secure_storage.dart';

// class ApiService {
//   // Cambia la URL por la de tu API (https o http local con túnel)
//   final String baseUrl = 'http://localhost:5038/api';
//   final FlutterSecureStorage secureStorage = const FlutterSecureStorage();

//   Future<void> saveToken(String token) async {
//     html.window.localStorage['jwt'] = token;
//   }

//   Future<String?> getToken() async {
//     return html.window.localStorage['jwt'];
//   }

//   Future<Map<String, dynamic>> login(String email, String password) async {
//     final res = await http.post(
//       Uri.parse('$baseUrl/auth/login'),
//       headers: {'Content-Type': 'application/json'},
//       body: jsonEncode({'email': email, 'password': password}),
//     );

//     final data = _processResponse(res);

//     // Guarda el token si viene
//     if (data.containsKey("token")) {
//       await saveToken(data["token"]);
//     }

//     return data;
//   }

//   Future<Map<String, dynamic>> register(
//     String username,
//     String email,
//     String password,
//     String fullName,
//   ) async {
//     final res = await http.post(
//       Uri.parse('$baseUrl/auth/register'),
//       headers: {'Content-Type': 'application/json'},
//       body: jsonEncode({
//         'userName': username,
//         'email': email,
//         'password': password,
//         'fullName': fullName,
//       }),
//     );
//     return _processResponse(res);
//   }

//   Future<List<dynamic>> getExpenses({int? month, int? year}) async {
//     final token = await getToken();
//     final uri = Uri.parse('$baseUrl/expenses').replace(
//       queryParameters: {
//         if (month != null && year != null) 'month': month.toString(),
//         if (year != null && month != null) 'year': year.toString(),
//       },
//     );
//     final res = await http.get(uri, headers: _authHeader(token));
//     return _processListResponse(res);
//   }

//   Future<Map<String, dynamic>> addExpense(Map<String, dynamic> payload) async {
//     final token = await getToken();
//     final res = await http.post(
//       Uri.parse('$baseUrl/expenses'),
//       headers: _authHeader(token),
//       body: jsonEncode(payload),
//     );
//     return _processResponse(res);
//   }

//   Future<List<dynamic>> getCategories() async {
//     final token = await getToken();
//     final res = await http.get(
//       Uri.parse('$baseUrl/categories'),
//       headers: _authHeader(token),
//     );
//     return _processListResponse(res);
//   }

//   Map<String, String> _authHeader(String? token) {
//     final headers = {'Content-Type': 'application/json'};
//     if (token != null) headers['Authorization'] = 'Bearer ${token.trim()}';
//     return headers;
//   }

//   Map<String, dynamic> _processResponse(http.Response res) {
//     final code = res.statusCode;
//     if (code >= 200 && code < 300) {
//       return jsonDecode(res.body) as Map<String, dynamic>;
//     }
//     throw Exception('API error: \${res.statusCode} - \${res.body}');
//   }

//   List<dynamic> _processListResponse(http.Response res) {
//     final code = res.statusCode;
//     if (code >= 200 && code < 300) return jsonDecode(res.body) as List<dynamic>;
//     throw Exception('API error: \${res.statusCode} - \${res.body}');
//   }
// }

// ============================
// FILE: lib/services/api_service.dart
// ============================

import 'dart:convert';
import 'package:http/http.dart' as http;

import 'storage.dart'; // <--- IMPORTA LA CLASE CONDICIONAL

class ApiService {
  final String baseUrl = 'http://localhost:5038/api';

  final StorageService storage = StorageService();

  Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    final data = _processResponse(res);

    if (data.containsKey("token")) {
      await storage.saveToken(data["token"]);
    }

    return data;
  }

  Future<Map<String, dynamic>> register(
    String username,
    String email,
    String password,
    String fullName,
  ) async {
    final res = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'userName': username,
        'email': email,
        'password': password,
        'fullName': fullName,
      }),
    );
    return _processResponse(res);
  }

  Future<List<dynamic>> getExpenses({int? month, int? year}) async {
    final token = await storage.getToken();

    final uri = Uri.parse('$baseUrl/expenses').replace(
      queryParameters: {
        if (month != null) 'month': month.toString(),
        if (year != null) 'year': year.toString(),
      },
    );
    print("LLAMANDO A EXPENSES CON TOKEN: $token");
    final res = await http.get(uri, headers: _authHeader(token));

    return _processListResponse(res);
  }

  Future<Map<String, dynamic>> addExpense(Map<String, dynamic> payload) async {
    final token = await storage.getToken();
    print("ENVIANDO NUEVO GASTO CON TOKEN: $token");
    final res = await http.post(
      Uri.parse('$baseUrl/expenses'),
      headers: _authHeader(token),
      body: jsonEncode(payload),
    );

    return _processResponse(res);
  }

  Future<List<dynamic>> getCategories() async {
    final token = await storage.getToken();

    final res = await http.get(
      Uri.parse('$baseUrl/categories'),
      headers: _authHeader(token),
    );

    return _processListResponse(res);
  }

  Map<String, String> _authHeader(String? token) {
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer ${token.trim()}';
    }

    print("HEADERS ENVIADOS ===> $headers");

    return headers;
  }

  Map<String, dynamic> _processResponse(http.Response res) {
    final code = res.statusCode;

    if (code >= 200 && code < 300) {
      return jsonDecode(res.body) as Map<String, dynamic>;
    }

    throw Exception('API error: ${res.statusCode} - ${res.body}');
  }

  List<dynamic> _processListResponse(http.Response res) {
    final code = res.statusCode;

    if (code >= 200 && code < 300) {
      return jsonDecode(res.body) as List<dynamic>;
    }

    throw Exception('API error: ${res.statusCode} - ${res.body}');
  }
}
