/* Animals List Page — searchable, filterable livestock grid */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, QrCode, Eye } from 'lucide-react';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
      <div className="glass-card p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
            <input
              type="text"
              className="input-field pl-9 w-full"
              placeholder="Search by name, UID, or breed..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="animal-search"
            />
          </div>
          <div className="flex w-full sm:w-auto items-center gap-3">
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
          <QrCode size={48} className="mb-4 text-surface-600" />
          <p className="text-lg font-medium text-surface-400">No animals found</p>
          <p className="text-sm text-surface-500 mt-1">Register your first animal to get started</p>
        </div>
      ) : (
        <>
          {/* Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {animals.map((animal) => (
              <Link
                key={animal.id}
                to={`/animals/${animal.id}`}
                className="glass-card glass-card-interactive p-6 flex flex-col cursor-pointer"
                id={`animal-card-${animal.id}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{getSpeciesEmoji(animal.species)}</span>
                  <span className={getStatusBadge(animal.status)}>{animal.status}</span>
                </div>
                <h3 className="text-xl font-bold text-surface-50 transition-colors">
                  {animal.name || animal.animal_uid}
                </h3>
                <p className="text-sm text-primary-400 font-mono mt-1 mb-4">{animal.animal_uid}</p>
                <div className="space-y-2 text-sm text-surface-300 flex-1">
                  <div className="flex justify-between border-b border-surface-800 pb-2">
                    <span className="text-surface-500">Breed</span>
                    <span className="font-medium">{animal.breed || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-surface-800 pb-2">
                    <span className="text-surface-500">Gender/Weight</span>
                    <span className="font-medium capitalize">{animal.gender} • {animal.weight ? `${animal.weight}kg` : 'N/A'}</span>
                  </div>
                  {animal.growth_stage && (
                    <div className="flex justify-between border-b border-surface-800 pb-2">
                      <span className="text-surface-500">Stage</span>
                      <span className="font-medium capitalize">{animal.growth_stage}</span>
                    </div>
                  )}
                </div>
                <div className="mt-5 pt-3 flex items-center justify-between border-t border-surface-800">
                  <span className="text-xs text-surface-500 truncate pr-2">
                    Owner: {animal.owner_name}
                  </span>
                  <button className="btn btn-ghost btn-sm p-1">
                    <Eye size={16} />
                  </button>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                className="btn btn-secondary btn-sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <span className="text-sm text-surface-400">
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
          <h2 className="text-lg font-semibold text-surface-100">Register New Animal</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
            )}
            <div className="grid grid-cols-2 gap-4">
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
