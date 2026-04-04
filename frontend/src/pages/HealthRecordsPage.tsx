/* Health Records Page */
import { useEffect, useState } from 'react';
import { Heart, Plus } from 'lucide-react';
import api from '@/lib/api';
import type { HealthRecord, Animal } from '@/types';

export default function HealthRecordsPage() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const animalsRes = await api.get('/animals/', { params: { per_page: 100 } });
      setAnimals(animalsRes.data.animals);
      const allRecords: HealthRecord[] = [];
      for (const a of animalsRes.data.animals) {
        const res = await api.get(`/health-records/animal/${a.id}`);
        allRecords.push(...res.data);
      }
      allRecords.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setRecords(allRecords);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="page-header">
          <h1 className="page-title">Health Records</h1>
          <p className="page-subtitle">Monitor livestock health status and disease records</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} id="add-health-record-btn">
          <Plus size={18} /> Add Record
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : (
        <div className="glass-card p-6 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Animal</th><th>Type</th><th>Description</th><th>Severity</th><th>Diagnosis</th><th>Recorded By</th></tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-surface-500">No health records found</td></tr>
              ) : records.map((r) => (
                <tr key={r.id}>
                  <td className="whitespace-nowrap">{r.record_date}</td>
                  <td className="font-mono text-primary-400 text-sm">{r.animal_uid}</td>
                  <td className="capitalize">{r.record_type}</td>
                  <td className="max-w-[250px] truncate">{r.description}</td>
                  <td>{r.severity && <span className={`badge badge-${r.severity}`}>{r.severity}</span>}</td>
                  <td>{r.diagnosis || '—'}</td>
                  <td>{r.recorder_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <AddHealthRecordModal
          animals={animals}
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); loadData(); }}
        />
      )}
    </div>
  );
}

function AddHealthRecordModal({ animals, onClose, onCreated }: { animals: Animal[]; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ animal_id: '', record_type: 'checkup', description: '', severity: 'low', diagnosis: '', record_date: '' });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/health-records/', { ...form, animal_id: parseInt(form.animal_id) });
      onCreated();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-lg font-semibold text-surface-100">Add Health Record</h2>
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
              <div><label className="input-label">Record Type *</label>
                <select className="input-field" value={form.record_type} onChange={(e) => setForm({ ...form, record_type: e.target.value })}>
                  <option value="checkup">Checkup</option><option value="disease">Disease</option>
                  <option value="mortality">Mortality</option><option value="observation">Observation</option>
                </select></div>
              <div><label className="input-label">Severity</label>
                <select className="input-field" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                  <option value="low">Low</option><option value="medium">Medium</option>
                  <option value="high">High</option><option value="critical">Critical</option>
                </select></div>
            </div>
            <div><label className="input-label">Date *</label>
              <input className="input-field" type="date" value={form.record_date} onChange={(e) => setForm({ ...form, record_date: e.target.value })} required /></div>
            <div><label className="input-label">Description *</label>
              <textarea className="input-field" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></div>
            <div><label className="input-label">Diagnosis</label>
              <input className="input-field" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} /></div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <div className="spinner w-4 h-4 border-2" /> : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
