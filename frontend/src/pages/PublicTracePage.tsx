import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Beef, HeartPulse, ShieldCheck, Truck } from 'lucide-react';
import api from '@/lib/api';
import AppLogo from '@/components/ui/AppLogo';

interface PublicTraceRecord {
  animal: {
    animal_uid: string;
    name: string | null;
    species: string;
    breed: string | null;
    gender: string;
    weight: number | null;
    growth_stage: string | null;
    status: string;
    owner_name: string;
    date_of_birth: string | null;
    created_at: string | null;
  };
  health_records: Array<{
    record_type: string;
    description: string;
    severity: string | null;
    diagnosis: string | null;
    record_date: string | null;
  }>;
  movements: Array<{
    movement_type: string;
    from_location: string;
    to_location: string;
    departure_date: string | null;
    arrival_date: string | null;
    handler: string | null;
    transport_method: string | null;
    purpose: string | null;
  }>;
}

function fmt(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : 'N/A';
}

export default function PublicTracePage() {
  const { token } = useParams<{ token: string }>();
  const [record, setRecord] = useState<PublicTraceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.get(`/trace/${token}`)
      .then((res) => setRecord(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="spinner" /></div>;

  if (notFound || !record) {
    return (
      <main className="page-shell min-h-screen flex items-center justify-center">
        <div className="empty-state glass-card">
          <ShieldCheck size={42} style={{ color: 'var(--rose)' }} />
          <p className="text-xl font-bold text-white">Animal record not found</p>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>The QR code is invalid, inactive, or no longer linked to an animal record.</p>
        </div>
      </main>
    );
  }

  const animal = record.animal;

  return (
    <main className="page-shell min-h-screen">
      <div className="trace-brand-row">
        <div className="sidebar-brand-main">
          <div className="brand-mark"><AppLogo /></div>
          <div>
            <h1 className="brand-title">HerdScan</h1>
            <p className="brand-subtitle">Livestock Traceability & Monitoring System</p>
          </div>
        </div>
      </div>

      <div className="page-toolbar">
        <div className="page-header">
          <span className="page-eyebrow"><ShieldCheck size={14} /> Traceability Record</span>
          <h1 className="page-title">{animal.name || animal.animal_uid}</h1>
          <p className="page-subtitle">QR-verified livestock identity, health, and movement summary.</p>
        </div>
        <Link to="/login" className="btn btn-secondary">Staff Login</Link>
      </div>

      <section className="glass-card p-5 sm:p-7">
        <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
          <div className="animal-icon w-20 h-20 rounded-2xl"><Beef size={40} /></div>
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl sm:text-3xl font-black text-white break-words">{animal.name || animal.animal_uid}</h2>
            <p className="font-mono text-sm break-all mt-2" style={{ color: 'var(--cyan)' }}>#{animal.animal_uid}</p>
          </div>
          <span className="badge badge-active capitalize">{animal.status}</span>
        </div>

        <div className="grid grid-cols-1 min-[520px]:grid-cols-2 lg:grid-cols-4 gap-4 mt-7">
          {[
            ['Species', animal.species],
            ['Breed', animal.breed || 'N/A'],
            ['Gender', animal.gender],
            ['Weight', animal.weight ? `${animal.weight} kg` : 'N/A'],
            ['Stage', animal.growth_stage || 'N/A'],
            ['Date of Birth', fmt(animal.date_of_birth)],
            ['Registered', fmt(animal.created_at)],
          ].map(([label, value]) => (
            <div key={label} className="dashboard-mini-card">
              <p className="metric-card-label">{label}</p>
              <p className="text-base font-bold text-white capitalize mt-2">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <TracePanel title="Health Records" icon={<HeartPulse size={20} />} empty="No health records available.">
          {record.health_records.map((item, index) => (
            <TraceItem
              key={`${item.record_date}-${index}`}
              title={`${item.record_type}${item.severity ? ` - ${item.severity}` : ''}`}
              date={fmt(item.record_date)}
              body={item.diagnosis ? `${item.description} Diagnosis: ${item.diagnosis}` : item.description}
            />
          ))}
        </TracePanel>

        <TracePanel title="Movement History" icon={<Truck size={20} />} empty="No movement history available.">
          {record.movements.map((item, index) => (
            <TraceItem
              key={`${item.departure_date}-${index}`}
              title={`${item.movement_type}: ${item.from_location} to ${item.to_location}`}
              date={fmt(item.departure_date)}
              body={[item.handler, item.transport_method, item.purpose].filter(Boolean).join(' - ') || 'Movement recorded.'}
            />
          ))}
        </TracePanel>
      </section>
    </main>
  );
}

function TracePanel({ title, icon, empty, children }: { title: string; icon: React.ReactNode; empty: string; children: React.ReactNode }) {
  return (
    <section className="glass-card">
      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
        <span style={{ color: 'var(--emerald)' }}>{icon}</span>
        {title}
      </h3>
      <div className="activity-list">
        {Array.isArray(children) && children.length === 0 ? (
          <div className="empty-state py-8">{empty}</div>
        ) : children}
      </div>
    </section>
  );
}

function TraceItem({ title, date, body }: { title: string; date: string; body: string }) {
  return (
    <div className="activity-row">
      <span className="activity-dot" style={{ background: 'var(--emerald)' }} />
      <div className="min-w-0">
        <p className="activity-title capitalize">{title}</p>
        <p className="activity-copy">{date}</p>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{body}</p>
      </div>
    </div>
  );
}
