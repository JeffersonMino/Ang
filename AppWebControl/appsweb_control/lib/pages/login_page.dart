// import 'package:flutter/material.dart';
// import 'package:provider/provider.dart';
// import 'package:appsweb_control/providers/auth_provider.dart';

// class LoginPage extends StatefulWidget {
//   const LoginPage({super.key});

//   @override
//   _LoginPageState createState() => _LoginPageState();
// }

// class _LoginPageState extends State<LoginPage> {
//   final _formKey = GlobalKey<FormState>();
//   final _emailCtrl = TextEditingController();
//   final _passCtrl = TextEditingController();
//   bool _loading = false;

//   @override
//   Widget build(BuildContext context) {
//     final auth = Provider.of<AuthProvider>(context);
//     return Scaffold(
//       appBar: AppBar(title: const Text('Login')),
//       body: Padding(
//         padding: const EdgeInsets.all(16.0),
//         child: Form(
//           key: _formKey,
//           child: Column(
//             children: [
//               TextFormField(
//                 controller: _emailCtrl,
//                 decoration: const InputDecoration(labelText: 'Email'),
//                 validator: (v) =>
//                     v != null && v.contains('@') ? null : 'Email inválido',
//               ),
//               TextFormField(
//                 controller: _passCtrl,
//                 decoration: const InputDecoration(labelText: 'Password'),
//                 obscureText: true,
//                 validator: (v) =>
//                     v != null && v.length >= 6 ? null : 'Min 6 caracteres',
//               ),
//               const SizedBox(height: 16),
//               _loading
//                   ? const CircularProgressIndicator()
//                   : ElevatedButton(
//                       onPressed: () async {
//                         if (!_formKey.currentState!.validate()) return;
//                         setState(() {
//                           _loading = true;
//                         });
//                         try {
//                           await auth.login(
//                             _emailCtrl.text.trim(),
//                             _passCtrl.text.trim(),
//                           );
//                           Navigator.pushReplacementNamed(context, '/dashboard');
//                         } catch (e) {
//                           ScaffoldMessenger.of(
//                             context,
//                           ).showSnackBar(SnackBar(content: Text(e.toString())));
//                         }
//                         setState(() {
//                           _loading = false;
//                         });
//                       },
//                       child: const Text('Ingresar'),
//                     ),
//               TextButton(
//                 onPressed: () => Navigator.pushNamed(context, '/register'),
//                 child: const Text('Registrarse'),
//               ),
//             ],
//           ),
//         ),
//       ),
//     );
//   }
// }

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:appsweb_control/providers/auth_provider.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final emailCtrl = TextEditingController();
  final passCtrl = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: SingleChildScrollView(
          child: Container(
            padding: const EdgeInsets.all(30),
            width: 380,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.07),
              borderRadius: BorderRadius.circular(25),
              boxShadow: [
                BoxShadow(
                  color: Colors.blueAccent.withOpacity(0.4),
                  blurRadius: 30,
                  spreadRadius: 2,
                )
              ],
              border: Border.all(
                color: Colors.blueAccent.withOpacity(0.6),
                width: 1.5,
              ),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Título Futurista
                Text(
                  "LOGIN",
                  style: TextStyle(
                    fontSize: 34,
                    fontWeight: FontWeight.bold,
                    color: Colors.cyanAccent,
                    letterSpacing: 4,
                    shadows: [
                      Shadow(
                        color: Colors.cyanAccent.withOpacity(0.8),
                        blurRadius: 15,
                      )
                    ],
                  ),
                ),
                const SizedBox(height: 25),

                // Campo Email
                _futuristicField(
                  controller: emailCtrl,
                  hint: "Email",
                  icon: Icons.email_outlined,
                ),
                const SizedBox(height: 18),

                // Campo Password
                _futuristicField(
                  controller: passCtrl,
                  hint: "Password",
                  icon: Icons.lock_outline,
                  isPassword: true,
                ),
                const SizedBox(height: 25),

                // Botón Login
                GestureDetector(
                  onTap: () async {
                    try {
                      await auth.login(emailCtrl.text, passCtrl.text);
                      Navigator.pushReplacementNamed(context, '/dashboard');
                    } catch (e) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(e.toString()),
                          backgroundColor: Colors.redAccent,
                        ),
                      );
                    }
                  },
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Colors.blueAccent, Colors.cyanAccent],
                      ),
                      borderRadius: BorderRadius.circular(18),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.cyanAccent.withOpacity(0.6),
                          blurRadius: 25,
                          spreadRadius: 2,
                        )
                      ],
                    ),
                    child: const Center(
                      child: Text(
                        "INGRESAR",
                        style: TextStyle(
                          color: Colors.black,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 2,
                        ),
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 20),

                // Link para registrarse
                GestureDetector(
                  onTap: () => Navigator.pushNamed(context, '/register'),
                  child: Text(
                    "Crear una cuenta",
                    style: TextStyle(
                      color: Colors.cyanAccent,
                      fontSize: 14,
                      decoration: TextDecoration.underline,
                    ),
                  ),
                )
              ],
            ),
          ),
        ),
      ),
    );
  }

  // WIDGET PERSONALIZADO PARA LOS CAMPOS DE TEXTO
  Widget _futuristicField({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    bool isPassword = false,
  }) {
    return TextField(
      controller: controller,
      obscureText: isPassword,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        prefixIcon: Icon(icon, color: Colors.cyanAccent),
        hintText: hint,
        hintStyle: TextStyle(color: Colors.white.withOpacity(0.5)),
        filled: true,
        fillColor: Colors.white.withOpacity(0.06),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(18),
          borderSide: BorderSide(
            color: Colors.cyanAccent.withOpacity(0.4),
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(18),
          borderSide: const BorderSide(
            color: Colors.cyanAccent,
            width: 2,
          ),
        ),
      ),
    );
  }
}
