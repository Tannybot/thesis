import 'package:flutter/material.dart';
import '../models/user.dart';
import '../services/auth_service.dart';

/// App-wide state management using Provider.
class AppProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();

  UserModel? _user;
  bool _isLoading = true;

  UserModel? get user => _user;
  bool get isLoading => _isLoading;
  bool get isLoggedIn => _user != null;
  bool get isAdmin => _user?.isAdmin ?? false;

  Future<void> init() async {
    _isLoading = true;
    notifyListeners();

    final loggedIn = await _authService.isLoggedIn();
    if (loggedIn) {
      _user = await _authService.loadUser();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    try {
      _user = await _authService.login(email, password);
      notifyListeners();
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    _user = null;
    notifyListeners();
  }
}
