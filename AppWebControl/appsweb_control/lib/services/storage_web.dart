import 'dart:html' as html;

class StorageService {
  Future<void> saveToken(String token) async {
    html.window.localStorage['jwt'] = token;
  }

  Future<String?> getToken() async {
    return html.window.localStorage['jwt'];
  }
}
