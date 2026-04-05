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
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5">
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
      <div className="glass-card overflow-x-auto min-w-0" style={{ padding: '14px 20px' }}>
        <form onSubmit={handleSearch} className="filter-bar">
          {/* Search */}
          <div className="filter-bar-search" style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(52, 211, 153, 0.4)', pointerEvents: 'none' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search by name, UID, or breed..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '40px', width: '100%' }}
              id="animal-search"
            />
          </div>
          {/* Filters on the right */}
          <div className="filter-bar-controls" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <select
              className="input-field"
              value={species}
              onChange={(e) => { setSpecies(e.target.value); setPage(1); }}
              id="species-filter"
              style={{ minWidth: '140px' }}
            >
              <option value="">All Species</option>
              {speciesOptions.filter(Boolean).map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <select
              className="input-field"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              id="status-filter"
              style={{ minWidth: '130px' }}
            >
              <option value="">All Status</option>
              {statusOptions.filter(Boolean).map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-secondary" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
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
          <QrCode size={48} className="mb-4" style={{ color: 'rgba(16, 185, 129, 0.3)' }} />
          <p className="text-lg font-medium" style={{ color: 'rgba(52, 211, 153, 0.6)' }}>No animals found</p>
          <p className="text-sm mt-1" style={{ color: 'rgba(52, 211, 153, 0.35)' }}>Register your first animal to get started</p>
        </div>
      ) : (
        <>
          {/* Card Grid */}
          <div className="grid-animals">
            {animals.map((animal) => (
              <Link
                key={animal.id}
                to={`/animals/${animal.id}`}
                className="bg-[#0f1f1a] rounded-[16px] flex flex-col cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-emerald-500/30 overflow-hidden relative"
                style={{ border: '0.5px solid rgba(255,255,255,0.08)' }}
                id={`animal-card-${animal.id}`}
              >
                {/* Status Badge */}
                <span className={`absolute top-[12px] right-[12px] text-xs font-bold tracking-wide capitalize z-10 ${animal.status === 'active' ? 'bg-[#1EBfae] text-[#06332E]' : 'bg-gray-700 text-gray-200'}`}
                      style={{ padding: '4px 12px', borderRadius: '20px' }}>
                  {animal.status}
                </span>

                {/* Header Row */}
                <div style={{ padding: '20px 20px 0 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingRight: '50px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#1a3a2e', flexShrink: 0, overflow: 'hidden' }}>
                      <span style={{ fontSize: '28px', lineHeight: 1, paddingTop: '2px' }}>{getSpeciesEmoji(animal.species)}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'white', letterSpacing: '0.01em', lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {animal.name || animal.animal_uid.split('-')[1]}
                      </h3>
                      <p style={{ fontSize: '12px', fontFamily: 'monospace', marginTop: '2px', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>#{animal.animal_uid}</p>
                    </div>
                  </div>
                </div>
                
                {/* Data Rows */}
                <div style={{ padding: '16px 20px 20px 20px' }}>
                  <div className="grid-card-data">
                    {/* Breed */}
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <PawPrint size={14} style={{ color: '#34d399', flexShrink: 0 }} />
                        <span style={{ fontSize: '10px', color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Breed</span>
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 500, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{animal.breed || 'N/A'}</span>
                    </div>
                    
                    {/* Gender/Weight */}
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <Weight size={14} style={{ color: '#34d399', flexShrink: 0 }} />
                        <span style={{ fontSize: '10px', color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Weight</span>
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 500, color: 'white', textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{animal.gender} • {animal.weight ? `${animal.weight}kg` : 'N/A'}</span>
                    </div>
                    
                    {/* Stage */}
                    <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <TrendingUp size={14} style={{ color: '#34d399', flexShrink: 0 }} />
                        <span style={{ fontSize: '10px', color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Stage</span>
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 500, color: 'white', textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{animal.growth_stage || 'N/A'}</span>
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
              <span className="text-sm font-medium" style={{ color: 'rgba(52, 211, 153, 0.5)' }}>
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
            <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-5 lg:gap-6">
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
