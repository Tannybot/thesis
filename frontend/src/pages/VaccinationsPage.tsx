/* Vaccinations Page — Futuristic neon theme */
import { useEffect, useState } from 'react';
import { Syringe, Plus } from 'lucide-react';
import api from '@/lib/api';
import type { Vaccination, Animal } from '@/types';

export default function VaccinationsPage() {
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const animalsRes = await api.get('/animals/', { params: { per_page: 100 } });
      setAnimals(animalsRes.data.animals);
      const allVacc: Vaccination[] = [];
      for (const a of animalsRes.data.animals) {
        const res = await api.get(`/vaccinations/animal/${a.id}`);
        allVacc.push(...res.data);
      }
      allVacc.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setVaccinations(allVacc);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[16px]">
        <div className="page-header">
          <h1 className="page-title">Vaccinations</h1>
          <p className="page-subtitle">Vaccination records and upcoming schedules</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} id="add-vaccination-btn">
          <Plus size={18} /> Log Vaccination
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : (
        <div className="glass-card table-wrapper min-w-0">
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Animal</th><th>Vaccine</th><th>Batch #</th><th>By</th><th>Next Due</th></tr>
            </thead>
            <tbody>
              {vaccinations.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8" style={{ color: 'rgba(167, 139, 250, 0.4)' }}>No vaccinations found</td></tr>
              ) : vaccinations.map((v) => (
                <tr key={v.id}>
                  <td className="whitespace-nowrap">{v.vaccination_date}</td>
                  <td className="font-mono text-sm" style={{ color: '#22d3ee' }}>{v.animal_uid}</td>
                  <td>{v.vaccine_name}</td>
                  <td className="font-mono text-sm">{v.batch_number || '—'}</td>
                  <td>{v.administered_by || '—'}</td>
                  <td>{v.next_due_date ? <span className="badge badge-warning">{v.next_due_date}</span> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <AddVaccinationModal animals={animals} onClose={() => setShowModal(false)} onCreated={() => { setShowModal(false); loadData(); }} />
      )}
    </div>
  );
}

function AddVaccinationModal({ animals, onClose, onCreated }: { animals: Animal[]; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    animal_id: '', vaccine_name: '', batch_number: '', vaccination_date: '',
    next_due_date: '', administered_by: '', notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/vaccinations/', {
        ...form, animal_id: parseInt(form.animal_id),
        next_due_date: form.next_due_date || null,
      });
      onCreated();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-lg font-semibold text-white/90">Log Vaccination</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            <div><label className="input-label">Animal *</label>
              <select className="input-field" value={form.animal_id} onChange={(e) => setForm({ ...form, animal_id: e.target.value })} required>
                <option value="">Select animal...</option>
                {animals.map((a) => <option key={a.id} value={a.id}>{a.animal_uid} — {a.name || a.species}</option>)}
              </select></div>
            <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-[16px]">
              <div><label className="input-label">Vaccine Name *</label>
                <input className="input-field" value={form.vaccine_name} onChange={(e) => setForm({ ...form, vaccine_name: e.target.value })} required /></div>
              <div><label className="input-label">Batch Number</label>
                <input className="input-field" value={form.batch_number} onChange={(e) => setForm({ ...form, batch_number: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-[16px]">
              <div><label className="input-label">Date *</label>
                <input className="input-field" type="date" value={form.vaccination_date} onChange={(e) => setForm({ ...form, vaccination_date: e.target.value })} required /></div>
              <div><label className="input-label">Next Due Date</label>
                <input className="input-field" type="date" value={form.next_due_date} onChange={(e) => setForm({ ...form, next_due_date: e.target.value })} /></div>
            </div>
            <div><label className="input-label">Administered By</label>
              <input className="input-field" value={form.administered_by} onChange={(e) => setForm({ ...form, administered_by: e.target.value })} /></div>
            <div><label className="input-label">Notes</label>
              <textarea className="input-field" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? <div className="spinner w-4 h-4 border-2" /> : 'Save Vaccination'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
