/* Treatments Page */
import { useEffect, useState } from 'react';
import { Pill, Plus } from 'lucide-react';
import api from '@/lib/api';
import type { Treatment, Animal } from '@/types';

export default function TreatmentsPage() {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const animalsRes = await api.get('/animals/', { params: { per_page: 100 } });
      setAnimals(animalsRes.data.animals);
      const allTreatments: Treatment[] = [];
      for (const a of animalsRes.data.animals) {
        const res = await api.get(`/treatments/animal/${a.id}`);
        allTreatments.push(...res.data);
      }
      allTreatments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setTreatments(allTreatments);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="page-header">
          <h1 className="page-title">Treatments</h1>
          <p className="page-subtitle">Track medical treatments and medications</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} id="add-treatment-btn">
          <Plus size={18} /> Log Treatment
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : (
        <div className="glass-card p-6 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Animal</th><th>Type</th><th>Medication</th><th>Dosage</th><th>By</th><th>Next Date</th></tr>
            </thead>
            <tbody>
              {treatments.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-surface-500">No treatments found</td></tr>
              ) : treatments.map((t) => (
                <tr key={t.id}>
                  <td className="whitespace-nowrap">{t.treatment_date}</td>
                  <td className="font-mono text-primary-400 text-sm">{t.animal_uid}</td>
                  <td className="capitalize">{t.treatment_type}</td>
                  <td>{t.medication || '—'}</td>
                  <td>{t.dosage || '—'}</td>
                  <td>{t.administered_by || '—'}</td>
                  <td>{t.next_treatment_date || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <AddTreatmentModal animals={animals} onClose={() => setShowModal(false)} onCreated={() => { setShowModal(false); loadData(); }} />
      )}
    </div>
  );
}

function AddTreatmentModal({ animals, onClose, onCreated }: { animals: Animal[]; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    animal_id: '', treatment_type: 'medication', medication: '', dosage: '',
    treatment_date: '', next_treatment_date: '', administered_by: '', notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/treatments/', {
        ...form, animal_id: parseInt(form.animal_id),
        next_treatment_date: form.next_treatment_date || null,
      });
      onCreated();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-lg font-semibold text-surface-100">Log Treatment</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            <div><label className="input-label">Animal *</label>
              <select className="input-field" value={form.animal_id} onChange={(e) => setForm({ ...form, animal_id: e.target.value })} required>
                <option value="">Select animal...</option>
                {animals.map((a) => <option key={a.id} value={a.id}>{a.animal_uid} — {a.name || a.species}</option>)}
              </select></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="input-label">Treatment Type *</label>
                <select className="input-field" value={form.treatment_type} onChange={(e) => setForm({ ...form, treatment_type: e.target.value })}>
                  <option value="medication">Medication</option><option value="surgery">Surgery</option>
                  <option value="therapy">Therapy</option><option value="other">Other</option>
                </select></div>
              <div><label className="input-label">Date *</label>
                <input className="input-field" type="date" value={form.treatment_date} onChange={(e) => setForm({ ...form, treatment_date: e.target.value })} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="input-label">Medication</label>
                <input className="input-field" value={form.medication} onChange={(e) => setForm({ ...form, medication: e.target.value })} /></div>
              <div><label className="input-label">Dosage</label>
                <input className="input-field" value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="input-label">Administered By</label>
                <input className="input-field" value={form.administered_by} onChange={(e) => setForm({ ...form, administered_by: e.target.value })} /></div>
              <div><label className="input-label">Next Treatment Date</label>
                <input className="input-field" type="date" value={form.next_treatment_date} onChange={(e) => setForm({ ...form, next_treatment_date: e.target.value })} /></div>
            </div>
            <div><label className="input-label">Notes</label>
              <textarea className="input-field" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? <div className="spinner w-4 h-4 border-2" /> : 'Save Treatment'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
