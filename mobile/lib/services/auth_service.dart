import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import 'api_service.dart';

/// Authentication service — manages login state and tokens.
class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  final ApiService _api = ApiService();
  UserModel? currentUser;

  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('access_token') != null;
  }

  Future<UserModel> login(String email, String password) async {
    await _api.login(email, password);
    final userData = await _api.getMe();
    currentUser = UserModel.fromJson(userData);
    return currentUser!;
  }

  Future<UserModel?> loadUser() async {
    try {
      final userData = await _api.getMe();
      currentUser = UserModel.fromJson(userData);
      return currentUser;
    } catch (e) {
      return null;
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('access_token');
    await prefs.remove('refresh_token');
    currentUser = null;
  }
}
