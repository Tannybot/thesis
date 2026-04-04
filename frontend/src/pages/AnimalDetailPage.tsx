/* Animal Detail Page — full profile with QR code, health, treatments, timeline */
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, QrCode, Heart, Pill, Syringe, Truck,
  Calendar, Weight, Printer, Download
} from 'lucide-react';
import api from '@/lib/api';
import type { AnimalDetail, HealthRecord, Treatment, Vaccination, Movement, TimelineEvent } from '@/types';

export default function AnimalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [animal, setAnimal] = useState<AnimalDetail | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadAnimal();
  }, [id]);

  async function loadAnimal() {
    try {
      const [animalRes, timelineRes] = await Promise.all([
        api.get(`/animals/${id}`),
        api.get(`/movements/timeline/${id}`),
      ]);
      setAnimal(animalRes.data);
      setTimeline(timelineRes.data);

      // Load related data in parallel
      const [hrRes, trRes, vaRes, moRes] = await Promise.all([
        api.get(`/health-records/animal/${id}`),
        api.get(`/treatments/animal/${id}`),
        api.get(`/vaccinations/animal/${id}`),
        api.get(`/movements/animal/${id}`),
      ]);
      setHealthRecords(hrRes.data);
      setTreatments(trRes.data);
      setVaccinations(vaRes.data);
      setMovements(moRes.data);
    } catch (err) {
      console.error('Failed to load animal', err);
    } finally {
      setLoading(false);
    }
  }

  function printQR() {
    window.print();
  }

  if (loading) {
    return <div className="flex justify-center py-12"><div className="spinner" /></div>;
  }

  if (!animal) {
    return <div className="empty-state glass-card"><p>Animal not found</p></div>;
  }

  const tabs = [
    { key: 'overview', label: 'Overview', icon: QrCode },
    { key: 'health', label: 'Health', icon: Heart, count: healthRecords.length },
    { key: 'treatments', label: 'Treatments', icon: Pill, count: treatments.length },
    { key: 'vaccinations', label: 'Vaccinations', icon: Syringe, count: vaccinations.length },
    { key: 'supply-chain', label: 'Supply Chain', icon: Truck, count: movements.length },
    { key: 'timeline', label: 'Timeline', icon: Calendar },
  ];

  const speciesEmojis: Record<string, string> = {
    cattle: '🐄', goat: '🐐', sheep: '🐑', pig: '🐷', poultry: '🐔',
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <Link to="/animals" className="inline-flex items-center gap-2 text-sm text-surface-400 hover:text-primary-400 transition-colors">
        <ArrowLeft size={16} /> Back to Animals
      </Link>

      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-700/20 flex items-center justify-center text-3xl border border-primary-500/20">
              {speciesEmojis[animal.species] || '🐾'}
            </div>
            <div>
              <h1 className="page-title">{animal.name || animal.animal_uid}</h1>
              <p className="text-primary-400 font-mono text-sm">{animal.animal_uid}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className={`badge badge-${animal.status}`}>{animal.status}</span>
                <span className="text-sm text-surface-400 capitalize">{animal.species} • {animal.breed || 'N/A'}</span>
                <span className="text-sm text-surface-400">{animal.gender} • {animal.weight ? `${animal.weight} kg` : 'N/A'}</span>
                {animal.growth_stage && <span className="text-sm text-surface-400 capitalize">Stage: {animal.growth_stage}</span>}
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex items-center gap-3">
            <div className="qr-print-area bg-white p-3 rounded-xl">
              <img
                src={`/api/qr-codes/${animal.id}`}
                alt={`QR Code for ${animal.animal_uid}`}
                className="w-24 h-24"
                id="animal-qr-code"
              />
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={printQR} className="btn btn-secondary btn-sm">
                <Printer size={14} /> Print
              </button>
              <a href={`/api/qr-codes/${animal.id}`} download className="btn btn-secondary btn-sm">
                <Download size={14} /> Save
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20'
                : 'text-surface-400 hover:bg-surface-800 hover:text-surface-200'
            }`}
            onClick={() => setActiveTab(tab.key)}
            id={`tab-${tab.key}`}
          >
            <tab.icon size={16} />
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="w-5 h-5 rounded-full bg-surface-700 text-xs flex items-center justify-center">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-in">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-surface-100 mb-4">Details</h3>
              <div className="space-y-3">
                {[
                  ['UID', animal.animal_uid],
                  ['Name', animal.name || 'N/A'],
                  ['Species', animal.species],
                  ['Breed', animal.breed || 'N/A'],
                  ['Gender', animal.gender],
                  ['Date of Birth', animal.date_of_birth || 'N/A'],
                  ['Weight', animal.weight ? `${animal.weight} kg` : 'N/A'],
                  ['Growth Stage', animal.growth_stage || 'N/A'],
                  ['Status', animal.status],
                  ['Owner', animal.owner_name],
                  ['Registered', new Date(animal.created_at).toLocaleDateString()],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2 border-b border-surface-800">
                    <span className="text-sm text-surface-400">{label}</span>
                    <span className="text-sm text-surface-200 capitalize">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-surface-100 mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Health Records', count: animal.health_records_count, color: 'text-amber-400' },
                  { label: 'Treatments', count: animal.treatments_count, color: 'text-blue-400' },
                  { label: 'Vaccinations', count: animal.vaccinations_count, color: 'text-purple-400' },
                  { label: 'Movements', count: animal.movements_count, color: 'text-teal-400' },
                ].map((item) => (
                  <div key={item.label} className="text-center p-4 rounded-xl bg-surface-800/50">
                    <p className={`text-2xl font-bold ${item.color}`}>{item.count}</p>
                    <p className="text-xs text-surface-400 mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
              {animal.notes && (
                <div className="mt-4 p-3 rounded-lg bg-surface-800/50">
                  <p className="text-sm text-surface-300">{animal.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'health' && (
          <div className="glass-card p-6 overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Type</th><th>Description</th><th>Severity</th><th>Diagnosis</th><th>Recorded By</th></tr>
              </thead>
              <tbody>
                {healthRecords.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-surface-500">No health records</td></tr>
                ) : healthRecords.map((r) => (
                  <tr key={r.id}>
                    <td className="whitespace-nowrap">{r.record_date}</td>
                    <td className="capitalize">{r.record_type}</td>
                    <td className="max-w-[300px] truncate">{r.description}</td>
                    <td>{r.severity && <span className={`badge badge-${r.severity}`}>{r.severity}</span>}</td>
                    <td>{r.diagnosis || '—'}</td>
                    <td>{r.recorder_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'treatments' && (
          <div className="glass-card p-6 overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Type</th><th>Medication</th><th>Dosage</th><th>Administered By</th><th>Next Date</th></tr>
              </thead>
              <tbody>
                {treatments.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-surface-500">No treatments</td></tr>
                ) : treatments.map((t) => (
                  <tr key={t.id}>
                    <td className="whitespace-nowrap">{t.treatment_date}</td>
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

        {activeTab === 'vaccinations' && (
          <div className="glass-card p-6 overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Vaccine</th><th>Batch #</th><th>Administered By</th><th>Next Due</th></tr>
              </thead>
              <tbody>
                {vaccinations.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-surface-500">No vaccinations</td></tr>
                ) : vaccinations.map((v) => (
                  <tr key={v.id}>
                    <td className="whitespace-nowrap">{v.vaccination_date}</td>
                    <td>{v.vaccine_name}</td>
                    <td className="font-mono text-sm">{v.batch_number || '—'}</td>
                    <td>{v.administered_by || '—'}</td>
                    <td>{v.next_due_date || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'supply-chain' && (
          <div className="glass-card p-6 overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Type</th><th>From</th><th>To</th><th>Handler</th><th>Transport</th><th>Purpose</th></tr>
              </thead>
              <tbody>
                {movements.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-surface-500">No movements recorded</td></tr>
                ) : movements.map((m) => (
                  <tr key={m.id}>
                    <td className="whitespace-nowrap">{new Date(m.departure_date).toLocaleDateString()}</td>
                    <td className="capitalize">{m.movement_type}</td>
                    <td>{m.from_location}</td>
                    <td>{m.to_location}</td>
                    <td>{m.handler || '—'}</td>
                    <td className="capitalize">{m.transport_method || '—'}</td>
                    <td>{m.purpose || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-surface-100 mb-6">Traceability Timeline</h3>
            {timeline.length === 0 ? (
              <div className="empty-state py-8">No timeline events</div>
            ) : (
              <div>
                {timeline.map((event, i) => {
                  const typeColors: Record<string, string> = {
                    registration: 'border-primary-500',
                    health: 'border-amber-500',
                    treatment: 'border-blue-500',
                    vaccination: 'border-purple-500',
                    movement: 'border-teal-500',
                  };
                  return (
                    <div key={i} className="timeline-item">
                      <div className={`timeline-dot ${typeColors[event.event_type] || ''}`} />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-surface-200">{event.title}</span>
                          <span className="text-xs text-surface-500">
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-surface-400">{event.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
