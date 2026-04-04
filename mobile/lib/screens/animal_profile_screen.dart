import 'package:flutter/material.dart';
import '../services/api_service.dart';

/// Animal profile screen — displays full animal details after scanning.
class AnimalProfileScreen extends StatefulWidget {
  final Map<String, dynamic> animalData;

  const AnimalProfileScreen({super.key, required this.animalData});

  @override
  State<AnimalProfileScreen> createState() => _AnimalProfileScreenState();
}

class _AnimalProfileScreenState extends State<AnimalProfileScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<dynamic> _healthRecords = [];
  List<dynamic> _treatments = [];
  List<dynamic> _vaccinations = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _loadDetails();
  }

  Future<void> _loadDetails() async {
    try {
      final api = ApiService();
      final id = widget.animalData['id'];
      _healthRecords = await api.getHealthRecords(id);
      _treatments = await api.getTreatments(id);
      _vaccinations = await api.getVaccinations(id);
    } catch (e) {
      debugPrint('Error loading details: $e');
    }
    if (mounted) setState(() { _isLoading = false; });
  }

  String _getSpeciesEmoji(String species) {
    final map = {'cattle': '🐄', 'goat': '🐐', 'sheep': '🐑', 'pig': '🐷', 'poultry': '🐔'};
    return map[species] ?? '🐾';
  }

  @override
  Widget build(BuildContext context) {
    final animal = widget.animalData;

    return Scaffold(
      appBar: AppBar(
        title: Text(animal['name'] ?? animal['animal_uid']),
      ),
      body: Column(
        children: [
          // Animal header card
          Container(
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [const Color(0xFF1E293B), const Color(0xFF0F172A)],
              ),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF334155)),
            ),
            child: Row(
              children: [
                Text(_getSpeciesEmoji(animal['species'] ?? ''), style: const TextStyle(fontSize: 48)),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(animal['name'] ?? 'N/A',
                        style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
                      Text(animal['animal_uid'] ?? '',
                        style: const TextStyle(fontSize: 14, color: Color(0xFF10B981), fontFamily: 'monospace')),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8, runSpacing: 4,
                        children: [
                          _buildChip(animal['species'] ?? ''),
                          _buildChip(animal['breed'] ?? 'N/A'),
                          _buildChip(animal['gender'] ?? ''),
                          if (animal['weight'] != null) _buildChip('${animal['weight']} kg'),
                          if (animal['growth_stage'] != null) _buildChip(animal['growth_stage']),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Tabs
          TabBar(
            controller: _tabController,
            labelColor: const Color(0xFF10B981),
            unselectedLabelColor: Colors.grey,
            indicatorColor: const Color(0xFF10B981),
            tabs: const [
              Tab(text: 'Info'),
              Tab(text: 'Health'),
              Tab(text: 'Treatments'),
              Tab(text: 'Vaccines'),
            ],
          ),

          // Tab content
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : TabBarView(
                    controller: _tabController,
                    children: [
                      _buildInfoTab(animal),
                      _buildRecordsTab(_healthRecords, 'health'),
                      _buildRecordsTab(_treatments, 'treatment'),
                      _buildRecordsTab(_vaccinations, 'vaccination'),
                    ],
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildChip(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: const Color(0xFF334155),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(text, style: const TextStyle(fontSize: 12, color: Color(0xFFCBD5E1))),
    );
  }

  Widget _buildInfoTab(Map<String, dynamic> animal) {
    final fields = [
      ['UID', animal['animal_uid']],
      ['Species', animal['species']],
      ['Breed', animal['breed'] ?? 'N/A'],
      ['Gender', animal['gender']],
      ['Weight', animal['weight'] != null ? '${animal['weight']} kg' : 'N/A'],
      ['Growth Stage', animal['growth_stage'] ?? 'N/A'],
      ['Status', animal['status']],
      ['Owner', animal['owner_name'] ?? 'N/A'],
      ['Date of Birth', animal['date_of_birth'] ?? 'N/A'],
    ];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: fields.map((f) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(f[0] as String, style: TextStyle(fontSize: 14, color: Colors.grey[500])),
            Text((f[1] ?? 'N/A') as String,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Colors.white)),
          ],
        ),
      )).toList(),
    );
  }

  Widget _buildRecordsTab(List<dynamic> records, String type) {
    if (records.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.inbox_outlined, size: 48, color: Colors.grey[700]),
            const SizedBox(height: 8),
            Text('No $type records', style: TextStyle(color: Colors.grey[500])),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: records.length,
      itemBuilder: (context, index) {
        final r = records[index];
        String title = '';
        String subtitle = '';
        String date = '';

        if (type == 'health') {
          title = (r['record_type'] ?? '').toString().toUpperCase();
          subtitle = r['description'] ?? '';
          date = r['record_date'] ?? '';
        } else if (type == 'treatment') {
          title = '${r['treatment_type'] ?? ''} — ${r['medication'] ?? 'N/A'}';
          subtitle = 'Dosage: ${r['dosage'] ?? 'N/A'}';
          date = r['treatment_date'] ?? '';
        } else if (type == 'vaccination') {
          title = r['vaccine_name'] ?? '';
          subtitle = 'Batch: ${r['batch_number'] ?? 'N/A'}';
          date = r['vaccination_date'] ?? '';
        }

        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
            subtitle: Text(subtitle, style: TextStyle(color: Colors.grey[500], fontSize: 13)),
            trailing: Text(date, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
          ),
        );
      },
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }
}
