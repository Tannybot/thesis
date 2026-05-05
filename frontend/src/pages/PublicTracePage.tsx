import { Children, useEffect, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Activity, Beef, HeartPulse, Pill, ShieldCheck, Syringe, Truck } from 'lucide-react';
import api from '@/lib/api';
import type { PublicTraceRecord } from '@/types';

function fmt(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : 'N/A';
}

function animalTitle(record: PublicTraceRecord) {
  return record.animal.name || record.animal.animal_uid;
}

export default function PublicTracePage({ tokenOverride }: { tokenOverride?: string }) {
  const params = useParams<{ token: string }>();
  const token = tokenOverride || params.token;
  const [record, setRecord] = useState<PublicTraceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    setNotFound(false);
    api.get(`/trace/${token}`)
      .then((res) => setRecord(res.data))
      .catch(() => {
        setRecord(null);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="spinner" /></div>;
  }

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
      <div className="page-toolbar">
        <div className="page-header">
          <span className="page-eyebrow"><ShieldCheck size={14} /> Public Traceability Record</span>
          <h1 className="page-title">{animalTitle(record)}</h1>
          <p className="page-subtitle">QR-verified livestock identity, health, and movement summary.</p>
        </div>
        <Link to="/login" className="btn btn-secondary">Staff Login</Link>
      </div>

      <section className="glass-card p-5 sm:p-7">
        <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
          <div className="animal-icon w-20 h-20 rounded-2xl">
            <Beef size={40} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h2 className="text-2xl sm:text-3xl font-black text-white break-words">{animalTitle(record)}</h2>
              <span className="badge badge-active capitalize">{animal.status}</span>
            </div>
            <p className="font-mono text-sm break-all" style={{ color: 'var(--cyan)' }}>#{animal.animal_uid}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 min-[520px]:grid-cols-2 lg:grid-cols-4 gap-4 mt-7">
          {[
            ['Species', animal.species],
            ['Breed', animal.breed || 'N/A'],
            ['Gender', animal.gender],
            ['Weight', animal.weight ? `${animal.weight} kg` : 'N/A'],
            ['Stage', animal.growth_stage || 'N/A'],
            ['Owner/User', animal.owner_name || 'N/A'],
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
              title={`${item.record_type}${item.severity ? ` • ${item.severity}` : ''}`}
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
              body={[item.handler, item.transport_method, item.purpose].filter(Boolean).join(' • ') || 'Movement recorded.'}
            />
          ))}
        </TracePanel>

        <TracePanel title="Treatments" icon={<Pill size={20} />} empty="No treatment records available.">
          {record.treatments.map((item, index) => (
            <TraceItem
              key={`${item.treatment_date}-${index}`}
              title={item.treatment_type}
              date={fmt(item.treatment_date)}
              body={[item.medication, item.dosage, item.administered_by].filter(Boolean).join(' • ') || 'Treatment recorded.'}
            />
          ))}
        </TracePanel>

        <TracePanel title="Vaccinations" icon={<Syringe size={20} />} empty="No vaccination records available.">
          {record.vaccinations.map((item, index) => (
            <TraceItem
              key={`${item.vaccination_date}-${index}`}
              title={item.vaccine_name}
              date={fmt(item.vaccination_date)}
              body={[item.administered_by, item.next_due_date ? `Next due: ${fmt(item.next_due_date)}` : null].filter(Boolean).join(' • ') || 'Vaccination recorded.'}
            />
          ))}
        </TracePanel>
      </section>
    </main>
  );
}

function TracePanel({ title, icon, empty, children }: { title: string; icon: ReactNode; empty: string; children: ReactNode }) {
  return (
    <section className="glass-card">
      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
        <span style={{ color: 'var(--emerald)' }}>{icon}</span>
        {title}
      </h3>
      <div className="activity-list">
        {Children.count(children) > 0 ? children : (
          <div className="empty-state py-8"><Activity size={32} /> {empty}</div>
        )}
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
