import 'package:flutter/material.dart';
import '../services/sync_service.dart';

/// Sync screen — shows pending records and triggers sync.
class SyncScreen extends StatefulWidget {
  const SyncScreen({super.key});

  @override
  State<SyncScreen> createState() => _SyncScreenState();
}

class _SyncScreenState extends State<SyncScreen> {
  final SyncService _syncService = SyncService();
  bool _isSyncing = false;
  String _statusMessage = '';
  int _pendingCount = 0;

  @override
  void initState() {
    super.initState();
    _pendingCount = _syncService.pendingCount;
  }

  Future<void> _syncNow() async {
    setState(() { _isSyncing = true; _statusMessage = 'Syncing...'; });

    try {
      final synced = await _syncService.syncAll();
      await _syncService.cleanSynced();

      setState(() {
        _pendingCount = _syncService.pendingCount;
        _statusMessage = synced > 0
            ? '✅ Synced $synced records successfully!'
            : '✅ All records are up to date.';
      });
    } catch (e) {
      setState(() { _statusMessage = '❌ Sync failed: $e'; });
    }

    setState(() { _isSyncing = false; });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Data Sync')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Status card
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: Column(
                children: [
                  Icon(
                    _pendingCount > 0 ? Icons.cloud_upload_outlined : Icons.cloud_done,
                    size: 48,
                    color: _pendingCount > 0 ? const Color(0xFFF59E0B) : const Color(0xFF10B981),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    _pendingCount > 0
                        ? '$_pendingCount records pending sync'
                        : 'All data synced',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: Colors.white),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _pendingCount > 0
                        ? 'Tap sync to upload pending records to the server'
                        : 'Your local data is up to date with the server',
                    style: TextStyle(fontSize: 14, color: Colors.grey[500]),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Sync button
            ElevatedButton.icon(
              onPressed: _isSyncing ? null : _syncNow,
              icon: _isSyncing
                  ? const SizedBox(width: 18, height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Icon(Icons.sync),
              label: Text(_isSyncing ? 'Syncing...' : 'Sync Now'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),

            const SizedBox(height: 16),

            // Status message
            if (_statusMessage.isNotEmpty)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF334155),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(_statusMessage,
                  style: const TextStyle(fontSize: 14, color: Colors.white),
                  textAlign: TextAlign.center),
              ),

            const Spacer(),

            // Info
            Text(
              'Records created while offline are automatically saved locally and will be synced when you have an internet connection.',
              style: TextStyle(fontSize: 13, color: Colors.grey[600]),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
