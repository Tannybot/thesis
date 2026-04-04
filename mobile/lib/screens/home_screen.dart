import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import '../services/api_service.dart';
import '../models/animal.dart';
import 'scanner_screen.dart';
import 'animal_profile_screen.dart';
import 'sync_screen.dart';

/// Home screen with animal list and quick actions.
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<AnimalModel> _animals = [];
  bool _isLoading = true;
  Map<String, dynamic> _stats = {};

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() { _isLoading = true; });
    try {
      final api = ApiService();
      final animalsJson = await api.getAnimals(perPage: 50);
      _animals = animalsJson.map((j) => AnimalModel.fromJson(j)).toList();
      _stats = await api.getDashboardStats();
    } catch (e) {
      // Offline — show cached data if available
      debugPrint('Failed to load data: $e');
    }
    if (mounted) setState(() { _isLoading = false; });
  }

  String _getSpeciesEmoji(String species) {
    final map = {'cattle': '🐄', 'goat': '🐐', 'sheep': '🐑', 'pig': '🐷', 'poultry': '🐔'};
    return map[species] ?? '🐾';
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'active': return const Color(0xFF10B981);
      case 'sold': return const Color(0xFF3B82F6);
      case 'deceased': return const Color(0xFFEF4444);
      default: return const Color(0xFF64748B);
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AppProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('LiveTrack', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.sync),
            onPressed: () => Navigator.push(context,
              MaterialPageRoute(builder: (_) => const SyncScreen())),
            tooltip: 'Sync',
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => provider.logout(),
            tooltip: 'Logout',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadData,
        color: const Color(0xFF10B981),
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : CustomScrollView(
                slivers: [
                  // Stats cards
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Welcome, ${provider.user?.fullName ?? ""}',
                            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
                          const SizedBox(height: 4),
                          Text('${_animals.length} animals registered',
                            style: TextStyle(fontSize: 14, color: Colors.grey[500])),
                          const SizedBox(height: 16),

                          // Stat row
                          Row(
                            children: [
                              _buildStatCard('Active', '${_stats['active_animals'] ?? 0}', const Color(0xFF10B981)),
                              const SizedBox(width: 12),
                              _buildStatCard('Alerts', '${_stats['health_alerts'] ?? 0}', const Color(0xFFF59E0B)),
                              const SizedBox(width: 12),
                              _buildStatCard('Vaccines Due', '${_stats['upcoming_vaccinations'] ?? 0}', const Color(0xFF8B5CF6)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Animal list header
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('My Animals',
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: Colors.white)),
                          Text('${_animals.length} total',
                            style: TextStyle(fontSize: 13, color: Colors.grey[500])),
                        ],
                      ),
                    ),
                  ),

                  // Animal list
                  SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final animal = _animals[index];
                        return _buildAnimalCard(animal);
                      },
                      childCount: _animals.length,
                    ),
                  ),

                  const SliverPadding(padding: EdgeInsets.only(bottom: 80)),
                ],
              ),
      ),

      // FAB for QR scanning
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          final result = await Navigator.push<String>(context,
            MaterialPageRoute(builder: (_) => const ScannerScreen()));
          if (result != null && mounted) {
            // Navigate to animal profile after scan
            try {
              final api = ApiService();
              final animalData = await api.getAnimalByUid(result);
              if (mounted) {
                Navigator.push(context,
                  MaterialPageRoute(builder: (_) => AnimalProfileScreen(animalData: animalData)));
              }
            } catch (e) {
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Animal not found: $result'),
                    backgroundColor: const Color(0xFFEF4444)),
                );
              }
            }
          }
        },
        icon: const Icon(Icons.qr_code_scanner),
        label: const Text('Scan QR'),
        backgroundColor: const Color(0xFF10B981),
      ),
    );
  }

  Widget _buildStatCard(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFF334155)),
        ),
        child: Column(
          children: [
            Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
            const SizedBox(height: 4),
            Text(label, style: TextStyle(fontSize: 12, color: Colors.grey[500])),
          ],
        ),
      ),
    );
  }

  Widget _buildAnimalCard(AnimalModel animal) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Card(
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () async {
            try {
              final api = ApiService();
              final data = await api.getAnimalById(animal.id);
              if (mounted) {
                Navigator.push(context,
                  MaterialPageRoute(builder: (_) => AnimalProfileScreen(animalData: data)));
              }
            } catch (e) {
              debugPrint('Error: $e');
            }
          },
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Text(_getSpeciesEmoji(animal.species), style: const TextStyle(fontSize: 28)),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(animal.name ?? animal.animalUid,
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white)),
                      const SizedBox(height: 2),
                      Text('${animal.species} · ${animal.breed ?? "N/A"} · ${animal.gender}',
                        style: TextStyle(fontSize: 13, color: Colors.grey[500])),
                      Text(animal.animalUid,
                        style: const TextStyle(fontSize: 12, color: Color(0xFF10B981), fontFamily: 'monospace')),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: _getStatusColor(animal.status).withOpacity(0.15),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(animal.status,
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: _getStatusColor(animal.status))),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
