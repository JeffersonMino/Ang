// // ============================
// // FILE: lib/pages/register_page.dart
// // ============================
// import 'package:flutter/material.dart';
// import 'package:provider/provider.dart';
// import 'package:appsweb_control/providers/auth_provider.dart';

// class RegisterPage extends StatefulWidget {
//   const RegisterPage({super.key});

//   @override
//   _RegisterPageState createState() => _RegisterPageState();
// }

// class _RegisterPageState extends State<RegisterPage> {
//   final _formKey = GlobalKey<FormState>();
//   final _userCtrl = TextEditingController();
//   final _emailCtrl = TextEditingController();
//   final _passCtrl = TextEditingController();
//   final _nameCtrl = TextEditingController();
//   bool _loading = false;

//   @override
//   Widget build(BuildContext context) {
//     final auth = Provider.of<AuthProvider>(context);
//     return Scaffold(
//       appBar: AppBar(title: const Text('Registrar')),
//       body: Padding(
//         padding: const EdgeInsets.all(16.0),
//         child: Form(
//           key: _formKey,
//           child: Column(
//             children: [
//               TextFormField(
//                 controller: _userCtrl,
//                 decoration: const InputDecoration(labelText: 'Username'),
//                 validator: (v) =>
//                     v != null && v.isNotEmpty ? null : 'Requerido',
//               ),
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
//               TextFormField(
//                 controller: _nameCtrl,
//                 decoration: const InputDecoration(labelText: 'Nombre completo'),
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
//                           await auth.register(
//                             _userCtrl.text.trim(),
//                             _emailCtrl.text.trim(),
//                             _passCtrl.text.trim(),
//                             _nameCtrl.text.trim(),
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
//                       child: const Text('Crear cuenta'),
//                     ),
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

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final usernameCtrl = TextEditingController();
  final fullnameCtrl = TextEditingController();
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
            width: 420,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.07),
              borderRadius: BorderRadius.circular(25),
              boxShadow: [
                BoxShadow(
                  color: Colors.purpleAccent.withOpacity(0.5),
                  blurRadius: 30,
                  spreadRadius: 3,
                )
              ],
              border: Border.all(
                color: Colors.purpleAccent.withOpacity(0.6),
                width: 1.5,
              ),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Título futurista
                Text(
                  "REGISTER",
                  style: TextStyle(
                    fontSize: 34,
                    fontWeight: FontWeight.bold,
                    color: Colors.purpleAccent,
                    letterSpacing: 4,
                    shadows: [
                      Shadow(
                        color: Colors.purpleAccent.withOpacity(0.9),
                        blurRadius: 15,
                      )
                    ],
                  ),
                ),

                const SizedBox(height: 25),

                // USERNAME
                _futuristicField(
                  controller: usernameCtrl,
                  hint: "Username",
                  icon: Icons.person_outline,
                ),
                const SizedBox(height: 18),

                // FULL NAME
                _futuristicField(
                  controller: fullnameCtrl,
                  hint: "Full Name",
                  icon: Icons.badge_outlined,
                ),
                const SizedBox(height: 18),

                // EMAIL
                _futuristicField(
                  controller: emailCtrl,
                  hint: "Email",
                  icon: Icons.email_outlined,
                ),
                const SizedBox(height: 18),

                // PASSWORD
                _futuristicField(
                  controller: passCtrl,
                  hint: "Password",
                  icon: Icons.lock_outline,
                  isPassword: true,
                ),

                const SizedBox(height: 25),

                // Botón registrar
                GestureDetector(
                  onTap: () async {
                    try {
                      await auth.register(
                        usernameCtrl.text,
                        emailCtrl.text,
                        passCtrl.text,
                        fullnameCtrl.text,
                      );

                      Navigator.pop(context); // vuelve al login

                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text("Cuenta creada correctamente"),
                          backgroundColor: Colors.greenAccent,
                        ),
                      );
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
                        colors: [Colors.purpleAccent, Colors.pinkAccent],
                      ),
                      borderRadius: BorderRadius.circular(18),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.purpleAccent.withOpacity(0.7),
                          blurRadius: 25,
                          spreadRadius: 2,
                        )
                      ],
                    ),
                    child: const Center(
                      child: Text(
                        "CREAR CUENTA",
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

                // Volver al login
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Text(
                    "Volver al Login",
                    style: TextStyle(
                      color: Colors.purpleAccent,
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

  // WIDGET DEL CAMPO NEÓN
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
        prefixIcon: Icon(icon, color: Colors.purpleAccent),
        hintText: hint,
        hintStyle: TextStyle(color: Colors.white.withOpacity(0.5)),
        filled: true,
        fillColor: Colors.white.withOpacity(0.06),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(18),
          borderSide: BorderSide(
            color: Colors.purpleAccent.withOpacity(0.4),
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(18),
          borderSide: const BorderSide(
            color: Colors.purpleAccent,
            width: 2,
          ),
        ),
      ),
    );
  }
}
