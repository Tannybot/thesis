import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Beef, Filter, Pencil, Plus, QrCode, Search, Sprout, Trash2, TrendingUp, Weight } from 'lucide-react';
import api from '@/lib/api';
import type { Animal } from '@/types';
import { useAuth } from '@/hooks/useAuth';

const speciesOptions = ['', 'cattle', 'goat', 'sheep', 'pig', 'poultry'];
const statusOptions = ['', 'active', 'sold', 'deceased', 'transferred'];

function animalTitle(animal: Animal) {
  return animal.name || animal.animal_uid.split('-')[1] || animal.animal_uid;
}

export default function AnimalsPage() {
  const { isAdmin } = useAuth();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [species, setSpecies] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [animalToRename, setAnimalToRename] = useState<Animal | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

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

  async function handleDelete(animal: Animal) {
    const confirmed = window.confirm('Are you sure you want to delete this animal?');
    if (!confirmed) return;

    setNotice('');
    setError('');
    setDeletingId(animal.id);
    try {
      await api.delete(`/animals/${animal.id}`);
      setAnimals((current) => current.filter((item) => item.id !== animal.id));
      setTotal((current) => Math.max(0, current - 1));
      setNotice('Animal deleted successfully.');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete animal.');
    } finally {
      setDeletingId(null);
    }
  }

  function handleRenameSuccess(updatedAnimal: Animal) {
    setAnimals((current) => current.map((animal) => (
      animal.id === updatedAnimal.id ? updatedAnimal : animal
    )));
    setAnimalToRename(null);
    setNotice('Animal renamed successfully.');
  }

  return (
    <div className="page-shell">
      <div className="page-toolbar">
        <div className="page-header">
          <span className="page-eyebrow"><Beef size={14} /> Animal Registry</span>
          <h1 className="page-title">Animals</h1>
          <p className="page-subtitle">{total} registered livestock with QR-linked identity, health, and movement records.</p>
        </div>
        {!isAdmin && (
          <button className="btn btn-primary page-toolbar-action" onClick={() => setShowCreateModal(true)} id="register-animal-btn">
            <Plus size={18} />
            Register Animal
          </button>
        )}
      </div>

      <div className="glass-card animal-filter-card">
        <form onSubmit={handleSearch} className="filter-bar">
          <div className="filter-bar-search">
            <Search size={16} />
            <input
              type="text"
              className="input-field"
              placeholder="Search by name, UID, or breed..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="animal-search"
            />
          </div>
          <div className="filter-bar-controls">
            <select
              className="input-field"
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
              className="input-field"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              id="status-filter"
            >
              <option value="">All Status</option>
              {statusOptions.filter(Boolean).map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-secondary">
              <Filter size={16} /> Filter
            </button>
          </div>
        </form>
      </div>

      {(notice || error) && (
        <div
          className="p-4 rounded-xl text-sm font-semibold"
          style={{
            background: notice ? 'rgba(52, 211, 153, 0.12)' : 'rgba(251, 113, 133, 0.12)',
            border: notice ? '1px solid rgba(52, 211, 153, 0.25)' : '1px solid rgba(251, 113, 133, 0.25)',
            color: notice ? 'var(--emerald)' : 'var(--rose)',
          }}
        >
          {notice || error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : animals.length === 0 ? (
        <div className="empty-state glass-card">
          <QrCode size={46} style={{ color: 'var(--emerald)' }} />
          <p className="text-lg font-bold text-white">No animals found</p>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {isAdmin ? 'No user-submitted animals are available for monitoring.' : 'Register an animal to begin building its traceability record.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid-animals">
            {animals.map((animal) => (
              <div
                key={animal.id}
                className="glass-card glass-card-interactive animal-card"
                id={`animal-card-${animal.id}`}
              >
                <Link to={`/animals/${animal.id}`} className="animal-card-link">
                  <span className={`${getStatusBadge(animal.status)} absolute top-4 right-4 z-10`}>
                    {animal.status}
                  </span>

                  <div className="animal-card-top">
                    <div className="animal-icon">
                      <Beef size={28} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xl font-black text-white truncate">{animalTitle(animal)}</h3>
                      <p className="font-mono text-xs mt-1 truncate" style={{ color: 'var(--cyan)' }}>#{animal.animal_uid}</p>
                      <p className="text-sm capitalize mt-3" style={{ color: 'var(--muted)' }}>{animal.species}</p>
                    </div>
                  </div>

                  <div className="animal-meta-grid">
                    <div className="animal-meta">
                      <span className="animal-meta-label"><Sprout size={13} /> Breed</span>
                      <span className="animal-meta-value">{animal.breed || 'N/A'}</span>
                    </div>
                    <div className="animal-meta">
                      <span className="animal-meta-label"><Weight size={13} /> Weight</span>
                      <span className="animal-meta-value">{animal.weight ? `${animal.weight} kg` : 'N/A'}</span>
                    </div>
                    <div className="animal-meta" style={{ gridColumn: '1 / -1' }}>
                      <span className="animal-meta-label"><TrendingUp size={13} /> Stage / Gender</span>
                      <span className="animal-meta-value">{animal.growth_stage || 'N/A'} / {animal.gender}</span>
                    </div>
                  </div>
                </Link>

                {!isAdmin && (
                  <div className="animal-card-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => { setNotice(''); setError(''); setAnimalToRename(animal); }}
                      disabled={deletingId === animal.id}
                    >
                      <Pencil size={14} />
                      Rename
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(animal)}
                      disabled={deletingId === animal.id}
                    >
                      {deletingId === animal.id ? <div className="spinner w-4 h-4 border-2" /> : <Trash2 size={14} />}
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {total > 20 && (
            <div className="flex items-center justify-center gap-3">
              <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                Previous
              </button>
              <span className="text-sm font-bold" style={{ color: 'var(--muted)' }}>
                Page {page} of {Math.ceil(total / 20)}
              </span>
              <button className="btn btn-secondary btn-sm" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(page + 1)}>
                Next
              </button>
            </div>
          )}
        </>
      )}

      {showCreateModal && (
        <CreateAnimalModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => { setShowCreateModal(false); loadAnimals(); }}
        />
      )}

      {animalToRename && (
        <RenameAnimalModal
          animal={animalToRename}
          onClose={() => setAnimalToRename(null)}
          onRenamed={handleRenameSuccess}
        />
      )}
    </div>
  );
}

function RenameAnimalModal({
  animal,
  onClose,
  onRenamed,
}: {
  animal: Animal;
  onClose: () => void;
  onRenamed: (animal: Animal) => void;
}) {
  const [name, setName] = useState(animal.name || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanName = name.trim();

    if (cleanName.length < 2) {
      setError('Animal name must be at least 2 characters.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await api.put(`/animals/${animal.id}`, { name: cleanName });
      onRenamed(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to rename animal.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-lg font-bold text-white">Rename Animal</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm" aria-label="Close">Close</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            {error && (
              <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(251, 113, 133, 0.12)', border: '1px solid rgba(251, 113, 133, 0.25)', color: 'var(--rose)' }}>
                {error}
              </div>
            )}
            <div>
              <label className="input-label" htmlFor="rename-animal-name">Animal Name *</label>
              <input
                id="rename-animal-name"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                minLength={2}
                required
                autoFocus
              />
            </div>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>UID: {animal.animal_uid}</p>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={submitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <div className="spinner w-4 h-4 border-2" /> : 'Save Name'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
          <h2 className="text-lg font-bold text-white">Register New Animal</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm" aria-label="Close">Close</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            {error && (
              <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(251, 113, 133, 0.12)', border: '1px solid rgba(251, 113, 133, 0.25)', color: 'var(--rose)' }}>
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-5">
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
              <div className="min-[480px]:col-span-2">
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
