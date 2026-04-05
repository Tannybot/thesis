/* Animals List Page — Futuristic neon grid view */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, QrCode, Eye, PawPrint, Weight, TrendingUp } from 'lucide-react';
import api from '@/lib/api';
import type { Animal } from '@/types';

const speciesOptions = ['', 'cattle', 'goat', 'sheep', 'pig', 'poultry'];
const statusOptions = ['', 'active', 'sold', 'deceased', 'transferred'];

export default function AnimalsPage() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [species, setSpecies] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadAnimals();
  }, [page, species, statusFilter]);

  async function loadAnimals() {
    setLoading(true);
    try {
      const params: any = { page, per_page: 20 };
      if (search) params.search = search;
      if (species) params.species = species;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/animals/', { params });
      setAnimals(res.data.animals);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Failed to load animals', err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    loadAnimals();
  }

  function getStatusBadge(status: string) {
    const classes: Record<string, string> = {
      active: 'badge-active',
      sold: 'badge-sold',
      deceased: 'badge-deceased',
      transferred: 'badge-warning',
    };
    return `badge ${classes[status] || 'badge-active'}`;
  }

  function getSpeciesEmoji(species: string) {
    const emojis: Record<string, string> = {
      cattle: '🐄', goat: '🐐', sheep: '🐑', pig: '🐷', poultry: '🐔',
    };
    return emojis[species] || '🐾';
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[16px]">
        <div className="page-header">
          <h1 className="page-title">Animals</h1>
          <p className="page-subtitle">{total} total registered livestock</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
          id="register-animal-btn"
        >
          <Plus size={18} />
          Register Animal
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card overflow-x-auto min-w-0">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-[16px]">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(167, 139, 250, 0.4)' }} />
            <input
              type="text"
              className="input-field pl-10 w-full"
              placeholder="Search by name, UID, or breed..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="animal-search"
            />
          </div>
          <div className="flex w-full sm:w-auto items-center gap-[16px]">
            <select
              className="input-field w-full sm:w-40"
              value={species}
              onChange={(e) => { setSpecies(e.target.value); setPage(1); }}
              id="species-filter"
            >
              <option value="">All Species</option>
              {speciesOptions.filter(Boolean).map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <select
              className="input-field w-full sm:w-36"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              id="status-filter"
            >
              <option value="">All Status</option>
              {statusOptions.filter(Boolean).map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-secondary whitespace-nowrap">
              <Filter size={16} /> Filter
            </button>
          </div>
        </form>
      </div>

      {/* Animals grid / table */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="spinner" /></div>
      ) : animals.length === 0 ? (
        <div className="empty-state glass-card">
          <QrCode size={48} className="mb-4" style={{ color: 'rgba(139, 92, 246, 0.3)' }} />
          <p className="text-lg font-medium" style={{ color: 'rgba(167, 139, 250, 0.6)' }}>No animals found</p>
          <p className="text-sm mt-1" style={{ color: 'rgba(167, 139, 250, 0.35)' }}>Register your first animal to get started</p>
        </div>
      ) : (
        <>
          {/* Card Grid */}
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-4 gap-[16px] pt-4">
            {animals.map((animal) => (
              <Link
                key={animal.id}
                to={`/animals/${animal.id}`}
                className="bg-[#1A1625] rounded-[16px] flex flex-col cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-purple-500/30 overflow-hidden relative"
                style={{ border: '0.5px solid rgba(255,255,255,0.08)' }}
                id={`animal-card-${animal.id}`}
              >
                {/* Status Badge */}
                <span className={`absolute top-[12px] right-[12px] text-xs font-bold tracking-wide capitalize z-10 ${animal.status === 'active' ? 'bg-[#1EBfae] text-[#06332E]' : 'bg-gray-700 text-gray-200'}`}
                      style={{ padding: '4px 12px', borderRadius: '20px' }}>
                  {animal.status}
                </span>

                {/* Header Row */}
                <div className="px-[24px] pt-[20px] mb-[16px]">
                  <div className="flex items-center gap-4 pr-[60px]">
                    <div className="flex items-center justify-center w-16 h-16 rounded-[14px] bg-[#3D2E3A] flex-shrink-0">
                      <span className="text-4xl drop-shadow-md">{getSpeciesEmoji(animal.species)}</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h3 className="text-2xl font-bold text-white tracking-wide leading-tight truncate">
                        {animal.name || animal.animal_uid.split('-')[1]}
                      </h3>
                      <p className="text-sm font-mono mt-0.5 text-gray-400">#{animal.animal_uid}</p>
                    </div>
                  </div>
                </div>
                
                {/* Divider */}
                <div className="h-[1px] w-full bg-white/5"></div>
                
                {/* Data Rows */}
                <div className="px-[24px] pb-[20px] pt-[16px] flex flex-col gap-[8px]">
                  {/* Row 1: Breed */}
                  <div className="flex items-center gap-4">
                    <PawPrint size={24} className="text-[#a78bfa] flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[11px] text-gray-400 tracking-[0.06em] uppercase mb-[2px]">Breed</span>
                      <span className="text-[16px] font-medium text-white">{animal.breed || 'N/A'}</span>
                    </div>
                  </div>
                  
                  {/* Row 2: Gender/Weight */}
                  <div className="flex items-center gap-4">
                    <Weight size={24} className="text-[#a78bfa] flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[11px] text-gray-400 tracking-[0.06em] uppercase mb-[2px]">Gender/Weight</span>
                      <span className="text-[16px] font-medium text-white capitalize">{animal.gender} | {animal.weight ? `${animal.weight} kg` : 'N/A'}</span>
                    </div>
                  </div>
                  
                  {/* Row 3: Stage */}
                  <div className="flex items-center gap-4">
                    <TrendingUp size={24} className="text-[#a78bfa] flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[11px] text-gray-400 tracking-[0.06em] uppercase mb-[2px]">Stage</span>
                      <span className="text-[16px] font-medium text-white capitalize">{animal.growth_stage || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                className="btn btn-secondary btn-sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <span className="text-sm font-medium" style={{ color: 'rgba(167, 139, 250, 0.5)' }}>
                Page {page} of {Math.ceil(total / 20)}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page >= Math.ceil(total / 20)}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Create Animal Modal */}
      {showCreateModal && (
        <CreateAnimalModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => { setShowCreateModal(false); loadAnimals(); }}
        />
      )}
    </div>
  );
}

/* Inline Create Animal Modal Component */
function CreateAnimalModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [formData, setFormData] = useState({
    name: '', species: 'cattle', breed: '', gender: 'male',
    weight: '', growth_stage: 'weaner', date_of_birth: '', notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/animals/', {
        ...formData,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        date_of_birth: formData.date_of_birth || null,
      });
      onCreated();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create animal');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-lg font-semibold text-white/90">Register New Animal</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            {error && (
              <div
                className="p-3 rounded-xl text-sm"
                style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)', color: '#fb7185' }}
              >{error}</div>
            )}
            <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-[16px]">
              <div>
                <label className="input-label">Name</label>
                <input className="input-field" placeholder="e.g., Bessie" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="input-label">Species *</label>
                <select className="input-field" value={formData.species}
                  onChange={(e) => setFormData({ ...formData, species: e.target.value })} required>
                  <option value="cattle">Cattle</option>
                  <option value="goat">Goat</option>
                  <option value="sheep">Sheep</option>
                  <option value="pig">Pig</option>
                  <option value="poultry">Poultry</option>
                </select>
              </div>
              <div>
                <label className="input-label">Breed</label>
                <input className="input-field" placeholder="e.g., Angus" value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })} />
              </div>
              <div>
                <label className="input-label">Gender *</label>
                <select className="input-field" value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })} required>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="input-label">Weight (kg)</label>
                <input className="input-field" type="number" step="0.1" placeholder="0.0" value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })} />
              </div>
              <div>
                <label className="input-label">Growth Stage</label>
                <select className="input-field" value={formData.growth_stage}
                  onChange={(e) => setFormData({ ...formData, growth_stage: e.target.value })}>
                  <option value="weaner">Weaner</option>
                  <option value="grower">Grower</option>
                  <option value="finisher">Finisher</option>
                  <option value="breeder">Breeder</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="input-label">Date of Birth</label>
                <input className="input-field" type="date" value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="input-label">Notes</label>
              <textarea className="input-field" rows={3} placeholder="Additional notes..."
                value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <div className="spinner w-4 h-4 border-2" /> : 'Register Animal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
