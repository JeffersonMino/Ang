// // ============================
// // FILE: lib/providers/auth_provider.dart
// // ============================
// import 'package:flutter/material.dart';
// import 'package:appsweb_control/services/api_services.dart';

// class AuthProvider extends ChangeNotifier {
//   final ApiService api;
//   bool _authenticated = false;
//   String? _token;

//   AuthProvider(this.api);

//   bool get authenticated => _authenticated;
//   String? get token => _token;

//   Future<void> login(String email, String password) async {
//     final res = await api.login(email, password);
//     final token = res['token'] as String?;
//     if (token != null) {
//       _token = token;
//       await api.saveToken(token);
//       _authenticated = true;
//       notifyListeners();
//     } else {
//       throw Exception('No token returned');
//     }
//   }

//   Future<void> register(
//     String username,
//     String email,
//     String password,
//     String fullName,
//   ) async {
//     final res = await api.register(username, email, password, fullName);
//     final token = res['token'] as String?;
//     if (token != null) {
//       _token = token;
//       await api.saveToken(token);
//       _authenticated = true;
//       notifyListeners();
//     } else {
//       throw Exception('Registration failed');
//     }
//   }

//   Future<void> logout() async {
//     _token = null;
//     _authenticated = false;
//     await api.secureStorage.delete(key: 'jwt');
//     notifyListeners();
//   }
// }


import 'package:flutter/material.dart';
import 'package:appsweb_control/services/api_services.dart';

class AuthProvider extends ChangeNotifier {
  final ApiService api;

  bool _authenticated = false;
  String? _token;

  AuthProvider(this.api);

  bool get authenticated => _authenticated;
  String? get token => _token;

  Future<void> login(String email, String password) async {
    final res = await api.login(email, password);

    final token = res['token'] as String?;
    if (token != null) {
      _token = token;

      // GUARDAMOS TOKEN CORRECTAMENTE
      await api.storage.saveToken(token);

      _authenticated = true;
      notifyListeners();
    } else {
      throw Exception('No token returned');
    }
  }

  Future<void> register(
      String username,
      String email,
      String password,
      String fullName,
  ) async {
    final res = await api.register(username, email, password, fullName);

    final token = res['token'] as String?;
    if (token != null) {
      _token = token;

      await api.storage.saveToken(token);

      _authenticated = true;
      notifyListeners();
    } else {
      throw Exception('Registration failed');
    }
  }

  Future<void> logout() async {
    _token = null;
    _authenticated = false;
    await api.storage.saveToken('');

    notifyListeners();
  }
}
