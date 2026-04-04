/// User model for the mobile app.
class UserModel {
  final int id;
  final String email;
  final String fullName;
  final String roleName;
  final bool isActive;

  UserModel({
    required this.id,
    required this.email,
    required this.fullName,
    required this.roleName,
    required this.isActive,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'],
      email: json['email'],
      fullName: json['full_name'],
      roleName: json['role_name'],
      isActive: json['is_active'],
    );
  }

  bool get isAdmin => roleName == 'admin';
}
