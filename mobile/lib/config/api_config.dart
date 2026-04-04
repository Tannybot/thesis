/// API Configuration for the Livestock Tracker mobile app.
class ApiConfig {
  // Change this to your backend server URL
  static const String baseUrl = 'http://10.0.2.2:8000/api'; // Android emulator
  // static const String baseUrl = 'http://localhost:8000/api'; // iOS simulator
  // static const String baseUrl = 'https://your-production-api.com/api'; // Production

  static const Duration timeout = Duration(seconds: 30);

  // Endpoints
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String me = '/auth/me';
  static const String animals = '/animals';
  static const String healthRecords = '/health-records';
  static const String treatments = '/treatments';
  static const String vaccinations = '/vaccinations';
  static const String movements = '/movements';
  static const String dashboard = '/dashboard/stats';
}
