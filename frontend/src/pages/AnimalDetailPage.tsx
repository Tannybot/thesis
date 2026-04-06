/* Animal Detail Page — Futuristic neon profile with QR code, health, treatments, timeline */
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, QrCode, Heart, Pill, Syringe, Truck,
  Calendar, Weight, Printer, Download, Activity
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
  const [qrBroken, setQrBroken] = useState(false);
  const [qrBlobUrl, setQrBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (id) loadAnimal();
  }, [id]);

  useEffect(() => {
    return () => {
      if (qrBlobUrl) {
        URL.revokeObjectURL(qrBlobUrl);
      }
    };
  }, [qrBlobUrl]);

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

      // Load secure QR blob natively
      api.get(`/qr-codes/${id}`, { responseType: 'blob' })
        .then(res => {
           setQrBlobUrl(URL.createObjectURL(res.data));
           setQrBroken(false);
        })
        .catch(() => setQrBroken(true));

    } catch (err) {
      console.error('Failed to load animal', err);
    } finally {
      setLoading(false);
    }
  }

  function printQR() {
    window.print();
  }

  function handleSave() {
    if (!qrBlobUrl) return;
    const a = document.createElement('a');
    a.href = qrBlobUrl;
    a.download = `qr_${animal?.animal_uid || 'code'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
    <>
    <div className="space-y-8 print:hidden">
      {/* Breadcrumb */}
      <Link
        to="/animals"
        className="inline-flex items-center gap-2 text-sm transition-colors"
        style={{ color: 'rgba(52, 211, 153, 0.5)' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#34d399')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(52, 211, 153, 0.5)')}
      >
        <ArrowLeft size={16} /> Back to Animals
      </Link>

      {/* Header */}
      <div className="glass-card relative overflow-hidden min-w-0 p-5 sm:p-7 md:p-8">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

        <div style={{ display: 'flex', gap: '20px', position: 'relative', zIndex: 10, width: '100%', flexWrap: 'wrap' }}>
          {/* Emoji avatar */}
          <div className="flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-[20px] shrink-0" style={{ background: '#1a3a2e' }}>
            <span className="text-5xl drop-shadow-lg">{speciesEmojis[animal.species] || '🐾'}</span>
          </div>
          
          {/* Animal info — fills available space */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide text-white break-words">{animal.name || animal.animal_uid.split('-')[1]}</h1>
              <span className={`self-start sm:self-auto px-4 py-1.5 rounded-full text-sm font-bold tracking-wide capitalize ${animal.status === 'active' ? 'bg-[#1EBfae] text-[#06332E]' : 'bg-gray-700 text-gray-200'}`}>
                {animal.status}
              </span>
            </div>
            <p className="font-mono text-base sm:text-lg text-gray-400 mb-4 opacity-80 break-all">#{animal.animal_uid}</p>
            
            <div className="flex flex-wrap items-center gap-[12px] mt-2">
              {[
                { label: 'Species', val: animal.species },
                { label: 'Breed', val: animal.breed },
                { label: 'Gender', val: animal.gender },
                { label: 'Weight', val: animal.weight ? `${animal.weight} kg` : null },
                { label: 'Stage', val: animal.growth_stage },
              ].filter(x => x.val).map((item, i) => (
                <div key={i} className="px-[14px] py-[6px] bg-[#0f1f1a] border border-white/10 rounded-[20px] flex items-center gap-2.5">
                  <span className="text-xs font-bold tracking-[0.1em] text-[#34d399] uppercase">{item.label}</span>
                  <span className="text-[15px] font-semibold text-white capitalize">{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* QR Code — right side */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <div className="qr-print-area bg-white p-3 rounded-[14px] border border-white/20 shadow-lg" style={{ minWidth: '96px', minHeight: '96px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {qrBroken || !qrBlobUrl ? (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <QrCode size={32} className="opacity-40" />
                </div>
              ) : (
                <img 
                  src={qrBlobUrl} 
                  alt={`QR Code for ${animal.animal_uid}`} 
                  style={{ width: '72px', height: '72px', objectFit: 'contain' }}
                  onError={() => setQrBroken(true)}
                />
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={printQR} className="btn bg-white/10 hover:bg-white/20 text-white border border-white/10 text-[13px] justify-center shadow-none" style={{ padding: '8px 14px', borderRadius: '8px', minHeight: '36px' }}>
                <Printer size={14} /> Print
              </button>
              <button onClick={handleSave} disabled={!qrBlobUrl} className="btn bg-[#34d399]/20 hover:bg-[#34d399]/30 text-[#6ee7b7] border border-[#34d399]/30 text-[13px] justify-center shadow-none disabled:opacity-50" style={{ padding: '8px 14px', borderRadius: '8px', minHeight: '36px' }}>
                <Download size={14} /> Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap mb-6 mt-6 sm:mt-8 py-3 gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`flex items-center text-[15px] font-bold transition-all duration-200 ${
              activeTab === tab.key 
                ? 'bg-[#065f46] border border-[#10b981] text-white shadow-[0_4px_15px_rgba(16,185,129,0.3)] transform -translate-y-0.5' 
                : 'bg-white/5 border border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
            style={{ padding: '10px 18px', borderRadius: '10px', gap: '8px' }}
            onClick={() => setActiveTab(tab.key)}
          >
            <tab.icon size={18} />
            <span className="tracking-wide">{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`ml-1.5 px-2 py-0.5 rounded-md text-xs font-bold ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-300'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-in mt-4">
        {activeTab === 'overview' && (
          <div className="flex flex-col xl:flex-row gap-6">
            {/* Details Section */}
            <div className="glass-card flex-1">
              <h3 className="text-xl font-bold text-white tracking-wider mb-8 flex items-center gap-3">
                <QrCode className="text-[#34d399]" size={24} /> 
                Identity & Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6 xl:gap-x-10">
                {[
                  ['Unique ID', animal.animal_uid],
                  ['System Name', animal.name || 'N/A'],
                  ['Species Category', animal.species],
                  ['Specific Breed', animal.breed || 'N/A'],
                  ['Biological Gender', animal.gender],
                  ['Date of Birth', animal.date_of_birth || 'N/A'],
                  ['Recorded Weight', animal.weight ? `${animal.weight} kg` : 'N/A'],
                  ['Growth Stage', animal.growth_stage || 'N/A'],
                  ['Platform Status', animal.status],
                  ['Current Owner', animal.owner_name],
                  ['Date Registered', new Date(animal.created_at).toLocaleDateString()],
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-col">
                    <span className="font-bold text-gray-500 uppercase" style={{ fontSize: '11px', letterSpacing: '0.08em', marginBottom: '6px' }}>{label}</span>
                    <span className="capitalize tracking-wide text-gray-100" style={{ fontSize: '15px', fontWeight: 500 }}>{value}</span>
                  </div>
                ))}
              </div>
              
              {animal.notes && (
                <div className="mt-8 pt-6 border-t border-white/5">
                  <span className="text-xs font-bold tracking-[0.15em] text-gray-500 uppercase block mb-3">Additional Notes</span>
                  <p className="text-sm text-gray-300 leading-relaxed bg-white/5 p-5 rounded-xl border border-white/5 tracking-wide">
                    {animal.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Summary Section */}
            <div className="glass-card w-full xl:w-[360px] 2xl:w-[420px] shrink-0" style={{ padding: '24px' }}>
              <h3 className="text-xl font-bold text-white tracking-wider mb-8 flex items-center gap-3">
                <Activity className="text-[#22d3ee]" size={24} />
                Activity Summary
              </h3>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Health Records', count: animal.health_records_count, color: '#fbbf24', bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.3)' },
                  { label: 'Treatments', count: animal.treatments_count, color: '#34d399', bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.3)' },
                  { label: 'Vaccinations', count: animal.vaccinations_count, color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' },
                  { label: 'Movements', count: animal.movements_count, color: '#22d3ee', bg: 'rgba(34,211,238,0.15)', border: 'rgba(34,211,238,0.3)' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between bg-white/5 border border-white/5 transition-colors hover:bg-white/10 group cursor-default" style={{ padding: '14px 16px', borderRadius: '12px', minHeight: '52px' }}>
                    <span className="text-[15px] font-semibold tracking-wide text-gray-300 group-hover:text-white transition-colors">{item.label}</span>
                    <div className="flex items-center justify-center" style={{ minWidth: '32px', height: '32px', borderRadius: '8px', background: item.bg, border: `1px solid ${item.border}` }}>
                       <span style={{ color: item.color, fontSize: '14px', fontWeight: 500 }}>{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'health' && (
          <div className="glass-card overflow-x-auto min-w-0">
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Type</th><th>Description</th><th>Severity</th><th>Diagnosis</th><th>Recorded By</th></tr>
              </thead>
              <tbody>
                {healthRecords.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8" style={{ color: 'rgba(52, 211, 153, 0.4)' }}>No health records</td></tr>
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
          <div className="glass-card overflow-x-auto min-w-0">
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Type</th><th>Medication</th><th>Dosage</th><th>Administered By</th><th>Next Date</th></tr>
              </thead>
              <tbody>
                {treatments.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8" style={{ color: 'rgba(52, 211, 153, 0.4)' }}>No treatments</td></tr>
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
          <div className="glass-card overflow-x-auto min-w-0">
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Vaccine</th><th>Batch #</th><th>Administered By</th><th>Next Due</th></tr>
              </thead>
              <tbody>
                {vaccinations.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8" style={{ color: 'rgba(52, 211, 153, 0.4)' }}>No vaccinations</td></tr>
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
          <div className="glass-card overflow-x-auto min-w-0">
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Type</th><th>From</th><th>To</th><th>Handler</th><th>Transport</th><th>Purpose</th></tr>
              </thead>
              <tbody>
                {movements.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8" style={{ color: 'rgba(52, 211, 153, 0.4)' }}>No movements recorded</td></tr>
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
          <div className="glass-card overflow-x-auto min-w-0">
            <h3 className="text-lg font-semibold text-white/90 mb-6 flex items-center gap-2">
              Traceability Timeline
            </h3>
            {timeline.length === 0 ? (
              <div className="empty-state py-8">No timeline events</div>
            ) : (
              <div>
                {timeline.map((event, i) => {
                  const typeColors: Record<string, string> = {
                    registration: 'border-[#10b981]',
                    health: 'border-[#fbbf24]',
                    treatment: 'border-[#34d399]',
                    vaccination: 'border-[#059669]',
                    movement: 'border-[#22d3ee]',
                  };
                  return (
                    <div key={i} className="timeline-item">
                      <div className={`timeline-dot ${typeColors[event.event_type] || ''}`} />
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-base font-bold text-white/90">{event.title}</span>
                          <span className="text-xs px-2 py-0.5 rounded border border-white/10 bg-white/5" style={{ color: 'rgba(110, 231, 183, 0.7)' }}>
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[15px] font-medium leading-relaxed" style={{ color: 'rgba(52, 211, 153, 0.6)' }}>{event.description}</p>
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
    
    {/* Dedicated QR Code Print Layout */}
    <div className="hidden print:flex flex-col items-center justify-center w-full min-h-screen bg-white">
       <div className="flex flex-col items-center justify-center p-12">
          {qrBlobUrl ? (
             <img src={qrBlobUrl} alt="QR Code" className="w-[500px] h-[500px] object-contain mb-12" />
          ) : (
             <div className="w-[500px] h-[500px] flex items-center justify-center border-4 border-dashed border-gray-400 mb-12 rounded-[24px]">
                 <QrCode size={160} className="text-gray-400" />
             </div>
          )}
          <h1 className="text-7xl font-black text-black tracking-widest leading-none mb-6">{animal.animal_uid}</h1>
          <p className="text-4xl font-bold text-gray-400 uppercase tracking-[0.2em]">{animal.name || 'System ID'}</p>
       </div>
    </div>
    </>
  );
}
