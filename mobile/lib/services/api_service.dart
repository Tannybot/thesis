import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';

/// API service for communicating with the FastAPI backend.
class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;

  late Dio _dio;

  ApiService._internal() {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConfig.baseUrl,
      connectTimeout: ApiConfig.timeout,
      receiveTimeout: ApiConfig.timeout,
      headers: {'Content-Type': 'application/json'},
    ));

    // Add auth interceptor
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString('access_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) {
        if (error.response?.statusCode == 401) {
          // Token expired — clear and redirect to login
          _clearToken();
        }
        handler.next(error);
      },
    ));
  }

  Future<void> _clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('access_token');
    await prefs.remove('refresh_token');
  }

  // === Auth ===
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await _dio.post(ApiConfig.login, data: {
      'email': email,
      'password': password,
    });
    // Save tokens
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('access_token', response.data['access_token']);
    await prefs.setString('refresh_token', response.data['refresh_token']);
    return response.data;
  }

  Future<Map<String, dynamic>> getMe() async {
    final response = await _dio.get(ApiConfig.me);
    return response.data;
  }

  // === Animals ===
  Future<List<dynamic>> getAnimals({int page = 1, int perPage = 50}) async {
    final response = await _dio.get(ApiConfig.animals, queryParameters: {
      'page': page,
      'per_page': perPage,
    });
    return response.data['animals'];
  }

  Future<Map<String, dynamic>> getAnimalByUid(String uid) async {
    final response = await _dio.get('${ApiConfig.animals}/uid/$uid');
    return response.data;
  }

  Future<Map<String, dynamic>> getAnimalById(int id) async {
    final response = await _dio.get('${ApiConfig.animals}/$id');
    return response.data;
  }

  // === Health Records ===
  Future<List<dynamic>> getHealthRecords(int animalId) async {
    final response = await _dio.get('${ApiConfig.healthRecords}/animal/$animalId');
    return response.data;
  }

  Future<void> createHealthRecord(Map<String, dynamic> data) async {
    await _dio.post(ApiConfig.healthRecords, data: data);
  }

  // === Treatments ===
  Future<List<dynamic>> getTreatments(int animalId) async {
    final response = await _dio.get('${ApiConfig.treatments}/animal/$animalId');
    return response.data;
  }

  // === Vaccinations ===
  Future<List<dynamic>> getVaccinations(int animalId) async {
    final response = await _dio.get('${ApiConfig.vaccinations}/animal/$animalId');
    return response.data;
  }

  // === Dashboard ===
  Future<Map<String, dynamic>> getDashboardStats() async {
    final response = await _dio.get(ApiConfig.dashboard);
    return response.data;
  }
}
