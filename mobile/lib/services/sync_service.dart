import 'package:hive_flutter/hive_flutter.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'api_service.dart';

/// Sync service — handles offline data and syncs when online.
class SyncService {
  static final SyncService _instance = SyncService._internal();
  factory SyncService() => _instance;
  SyncService._internal();

  final ApiService _api = ApiService();
  late Box _pendingBox;

  Future<void> init() async {
    _pendingBox = await Hive.openBox('pending_records');
  }

  /// Save a record locally for later sync
  Future<void> saveForSync(String type, Map<String, dynamic> data) async {
    final key = '${type}_${DateTime.now().millisecondsSinceEpoch}';
    await _pendingBox.put(key, {
      'type': type,
      'data': data,
      'timestamp': DateTime.now().toIso8601String(),
      'synced': false,
    });
  }

  /// Get count of pending (un-synced) records
  int get pendingCount {
    return _pendingBox.values
        .where((v) => v['synced'] == false)
        .length;
  }

  /// Attempt to sync all pending records
  Future<int> syncAll() async {
    // Check connectivity
    final connectivity = await Connectivity().checkConnectivity();
    if (connectivity.contains(ConnectivityResult.none)) {
      return 0;
    }

    int syncedCount = 0;

    for (final key in _pendingBox.keys.toList()) {
      final record = _pendingBox.get(key);
      if (record == null || record['synced'] == true) continue;

      try {
        final type = record['type'] as String;
        final data = Map<String, dynamic>.from(record['data']);

        switch (type) {
          case 'health_record':
            await _api.createHealthRecord(data);
            break;
          // Add more types as needed
        }

        // Mark as synced
        record['synced'] = true;
        await _pendingBox.put(key, record);
        syncedCount++;
      } catch (e) {
        // Skip failed records, will retry next time
        print('Sync failed for $key: $e');
      }
    }

    return syncedCount;
  }

  /// Clear all synced records
  Future<void> cleanSynced() async {
    final keysToDelete = <dynamic>[];
    for (final key in _pendingBox.keys) {
      final record = _pendingBox.get(key);
      if (record != null && record['synced'] == true) {
        keysToDelete.add(key);
      }
    }
    await _pendingBox.deleteAll(keysToDelete);
  }
}
