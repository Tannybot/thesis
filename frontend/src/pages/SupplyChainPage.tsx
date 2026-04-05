/* Supply Chain / Movements Page — Futuristic neon theme */
import { useEffect, useState } from 'react';
import { Truck, Plus, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import type { Movement, Animal } from '@/types';

export default function SupplyChainPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const animalsRes = await api.get('/animals/', { params: { per_page: 100 } });
      setAnimals(animalsRes.data.animals);
      const allMov: Movement[] = [];
      for (const a of animalsRes.data.animals) {
        const res = await api.get(`/movements/animal/${a.id}`);
        allMov.push(...res.data);
      }
      allMov.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setMovements(allMov);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function getTypeBadge(type: string) {
    const colors: Record<string, string> = {
      transfer: 'badge-active', transport: 'badge-sold', sale: 'badge-warning', slaughter: 'badge-deceased',
    };
    return `badge ${colors[type] || 'badge-active'}`;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-toolbar">
        <div className="page-header">
          <h1 className="page-title">Supply Chain</h1>
          <p className="page-subtitle">Farm-to-market traceability and movement tracking</p>
        </div>
        <button className="btn btn-primary page-toolbar-action" onClick={() => setShowModal(true)} id="add-movement-btn">
          <Plus size={18} /> Log Movement
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : movements.length === 0 ? (
        <div className="empty-state glass-card" style={{ padding: '60px 20px' }}>
          <Truck size={48} className="mb-4" style={{ color: 'rgba(16, 185, 129, 0.3)' }} />
          <p className="text-lg font-medium" style={{ color: 'rgba(52, 211, 153, 0.6)' }}>No movements recorded</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {movements.map((m) => (
            <div key={m.id} className="glass-card table-wrapper min-w-0">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className={getTypeBadge(m.movement_type)}>{m.movement_type}</span>
                    <span className="font-mono text-sm" style={{ color: '#22d3ee' }}>{m.animal_uid}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-white/75">
                    <span className="break-words">{m.from_location}</span>
                    <ArrowRight size={14} style={{ color: 'rgba(16, 185, 129, 0.4)' }} />
                    <span className="break-words">{m.to_location}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm" style={{ color: 'rgba(52, 211, 153, 0.5)' }}>
                    <span>{new Date(m.departure_date).toLocaleDateString()}</span>
                    {m.handler && <span>Handler: {m.handler}</span>}
                    {m.transport_method && <span className="capitalize">Via: {m.transport_method}</span>}
                  </div>
                </div>
                {m.buyer_info && (
                  <div
                    className="text-sm p-4 rounded-xl w-full sm:w-auto sm:max-w-[280px]"
                    style={{
                      background: 'rgba(11, 26, 22, 0.5)',
                      border: '1px solid rgba(16, 185, 129, 0.08)',
                    }}
                  >
                    <p className="text-xs mb-1" style={{ color: 'rgba(52, 211, 153, 0.4)' }}>Buyer</p>
                    <p className="text-white/70">{m.buyer_info}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <AddMovementModal animals={animals} onClose={() => setShowModal(false)} onCreated={() => { setShowModal(false); loadData(); }} />
      )}
    </div>
  );
}

function AddMovementModal({ animals, onClose, onCreated }: { animals: Animal[]; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    animal_id: '', movement_type: 'transport', from_location: '', to_location: '',
    departure_date: '', handler: '', transport_method: 'truck', purpose: '', buyer_info: '', notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/movements/', {
        ...form, animal_id: parseInt(form.animal_id),
        departure_date: new Date(form.departure_date).toISOString(),
        buyer_info: form.buyer_info || null,
      });
      onCreated();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-lg font-semibold text-white/90">Log Movement</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            <div><label className="input-label">Animal *</label>
              <select className="input-field" value={form.animal_id} onChange={(e) => setForm({ ...form, animal_id: e.target.value })} required>
                <option value="">Select animal...</option>
                {animals.map((a) => <option key={a.id} value={a.id}>{a.animal_uid} — {a.name || a.species}</option>)}
              </select></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div><label className="input-label">Movement Type *</label>
                <select className="input-field" value={form.movement_type} onChange={(e) => setForm({ ...form, movement_type: e.target.value })}>
                  <option value="transport">Transport</option><option value="transfer">Transfer</option>
                  <option value="sale">Sale</option><option value="slaughter">Slaughter</option>
                </select></div>
              <div><label className="input-label">Departure Date *</label>
                <input className="input-field" type="datetime-local" value={form.departure_date} onChange={(e) => setForm({ ...form, departure_date: e.target.value })} required /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div><label className="input-label">From Location *</label>
                <input className="input-field" value={form.from_location} onChange={(e) => setForm({ ...form, from_location: e.target.value })} required /></div>
              <div><label className="input-label">To Location *</label>
                <input className="input-field" value={form.to_location} onChange={(e) => setForm({ ...form, to_location: e.target.value })} required /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div><label className="input-label">Handler</label>
                <input className="input-field" value={form.handler} onChange={(e) => setForm({ ...form, handler: e.target.value })} /></div>
              <div><label className="input-label">Transport Method</label>
                <select className="input-field" value={form.transport_method} onChange={(e) => setForm({ ...form, transport_method: e.target.value })}>
                  <option value="truck">Truck</option><option value="rail">Rail</option>
                  <option value="walk">Walk</option><option value="other">Other</option>
                </select></div>
            </div>
            <div><label className="input-label">Purpose</label>
              <input className="input-field" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} /></div>
            {form.movement_type === 'sale' && (
              <div><label className="input-label">Buyer Information</label>
                <input className="input-field" value={form.buyer_info} onChange={(e) => setForm({ ...form, buyer_info: e.target.value })} /></div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? <div className="spinner w-4 h-4 border-2" /> : 'Log Movement'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
