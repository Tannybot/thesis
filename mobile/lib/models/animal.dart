/// Animal model for the mobile app.
class AnimalModel {
  final int id;
  final String animalUid;
  final String? name;
  final String species;
  final String? breed;
  final String gender;
  final double? weight;
  final String? growthStage;
  final String status;
  final String ownerName;
  final String? notes;
  final String createdAt;
  bool isSynced;

  AnimalModel({
    required this.id,
    required this.animalUid,
    this.name,
    required this.species,
    this.breed,
    required this.gender,
    this.weight,
    this.growthStage,
    required this.status,
    required this.ownerName,
    this.notes,
    required this.createdAt,
    this.isSynced = true,
  });

  factory AnimalModel.fromJson(Map<String, dynamic> json) {
    return AnimalModel(
      id: json['id'],
      animalUid: json['animal_uid'],
      name: json['name'],
      species: json['species'],
      breed: json['breed'],
      gender: json['gender'],
      weight: json['weight']?.toDouble(),
      growthStage: json['growth_stage'],
      status: json['status'],
      ownerName: json['owner_name'] ?? '',
      notes: json['notes'],
      createdAt: json['created_at'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'animal_uid': animalUid,
      'name': name,
      'species': species,
      'breed': breed,
      'gender': gender,
      'weight': weight,
      'growth_stage': growthStage,
      'status': status,
      'owner_name': ownerName,
      'notes': notes,
      'created_at': createdAt,
      'is_synced': isSynced,
    };
  }
}
