import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  HeartPulse,
  PawPrint,
  ShieldCheck,
  Syringe,
  TrendingUp,
  Users,
  PlusCircle,
  ClipboardList,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { ActivityItem, DashboardStats } from '@/types';
import CollapsibleText from '@/components/ui/CollapsibleText';
import { Card, SectionTitle } from '@/components/ui/Card';
import MetricCard from '@/components/ui/MetricCard';
import PageHeader from '@/components/ui/PageHeader';

const COLORS = ['#22c55e', '#84cc16', '#14b8a6', '#facc15', '#4ade80', '#a3e635'];

const tooltipStyle = {
  background: 'rgba(7, 17, 14, 0.96)',
  border: '1px solid rgba(198, 255, 227, 0.16)',
  borderRadius: '14px',
  color: '#f4fbf7',
  padding: '12px 14px',
  boxShadow: '0 18px 60px rgba(0, 0, 0, 0.45)',
};

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [healthData, setHealthData] = useState<any>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const [statsRes, healthRes, activityRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/health-overview'),
        api.get('/dashboard/recent-activity'),
      ]);
      setStats(statsRes.data);
      setHealthData(healthRes.data);
      setActivities(activityRes.data);
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-24"><div className="spinner" /></div>;
  }

  if (!stats) return null;

  const pendingRecords = stats.health_alerts + stats.upcoming_vaccinations;
  const activePercent = stats.total_animals > 0 ? Math.round((stats.active_animals / stats.total_animals) * 100) : 0;
  const statusBalance = [
    { label: 'Active', value: stats.active_animals, color: 'var(--emerald)' },
    { label: 'Sold', value: stats.sold_animals, color: 'var(--amber)' },
    { label: 'Deceased', value: stats.deceased_animals, color: 'var(--rose)' },
  ].filter((item) => item.value > 0);
  const footprintPoints = stats.species_breakdown.length > 0 ? stats.species_breakdown : [{ species: 'No data', count: 0 }];
  const quickActions = isAdmin ? [
    { label: 'Monitor Animals', to: '/animals', icon: PawPrint },
    { label: 'Review Health', to: '/health-records', icon: HeartPulse },
    { label: 'Vaccination Queue', to: '/vaccinations', icon: Syringe },
    { label: 'Manage Users', to: '/users', icon: Users },
  ] : [
    { label: 'Register Animal', to: '/animals', icon: PlusCircle },
    { label: 'Review Health', to: '/health-records', icon: HeartPulse },
    { label: 'Vaccination Queue', to: '/vaccinations', icon: Syringe },
    { label: 'Trace Movements', to: '/supply-chain', icon: ClipboardList },
  ];
  const statCards = isAdmin ? [
    { label: 'Total Animals', value: stats.total_animals, icon: PawPrint, tone: '#22c55e', visual: 'livestock' as const },
    { label: 'Verified Animals', value: stats.active_animals, icon: ShieldCheck, tone: '#84cc16', visual: 'verified' as const },
    { label: 'Pending Records', value: pendingRecords, icon: AlertTriangle, tone: '#fbbf24', visual: 'records' as const },
    { label: 'Recent Activity', value: activities.length, icon: Activity, tone: '#14b8a6', visual: 'activity' as const },
  ] : [
    { label: 'My Animals', value: stats.total_animals, icon: PawPrint, tone: '#22c55e', visual: 'livestock' as const },
    { label: 'Active Livestock', value: stats.active_animals, icon: Activity, tone: '#84cc16', visual: 'verified' as const },
    { label: 'Health Alerts', value: stats.health_alerts, icon: AlertTriangle, tone: '#fbbf24', visual: 'records' as const },
    { label: 'Due Vaccinations', value: stats.upcoming_vaccinations, icon: Syringe, tone: '#fb7185', visual: 'activity' as const },
  ];

  return (
    <div className="page-shell">
      <PageHeader
        title={isAdmin ? 'Monitoring Dashboard' : 'My Herd Dashboard'}
        subtitle={
          isAdmin
            ? `Welcome back, ${user?.full_name}. Monitor user-submitted animals, record quality, recent activity, and herd-level analytics.`
            : `Welcome back, ${user?.full_name}. Register animals, track health activity, and review QR-linked traceability records.`
        }
        action={(
          <Card className="dashboard-summary-card">
            <div className="flex items-center gap-3">
              <div className="metric-card-icon"><TrendingUp size={21} /></div>
              <div className="min-w-0">
                <p className="metric-card-value">{stats.recent_registrations}</p>
                <p className="metric-card-label">new registrations this month</p>
              </div>
            </div>
          </Card>
        )}
      />

      <section className="page-section">
        <div className="grid-stat-tiles">
          {statCards.map((card) => (
            <MetricCard key={card.label} {...card} />
          ))}
        </div>
      </section>

      <section className="page-section">
        <SectionTitle title="Analytics" subtitle="Distribution and growth charts from the current dashboard scope." />
        <div className="grid-charts">
          <Card>
            <SectionTitle icon={<PawPrint size={20} style={{ color: 'var(--emerald)' }} />} title="Species Distribution" />
            {stats.species_breakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={310}>
                <PieChart>
                  <Pie
                    data={stats.species_breakdown}
                    dataKey="count"
                    nameKey="species"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={58}
                    paddingAngle={5}
                    label={(props: any) => `${props.name} (${props.value})`}
                    labelLine={false}
                    stroke="rgba(7, 17, 14, 0.72)"
                    strokeWidth={3}
                  >
                    {stats.species_breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: 16 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state"><PawPrint size={38} /> No species data yet</div>
            )}
          </Card>

          <Card>
            <SectionTitle icon={<Activity size={20} style={{ color: 'var(--cyan)' }} />} title="Growth Stages" />
            {stats.growth_stage_breakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={310}>
                <BarChart data={stats.growth_stage_breakdown} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a3e635" stopOpacity={1} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0.62} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(198, 255, 227, 0.08)" />
                  <XAxis dataKey="stage" tick={{ fill: '#9ab7ad', fontSize: 12 }} axisLine={false} tickLine={false} tickMargin={12} />
                  <YAxis tick={{ fill: '#9ab7ad', fontSize: 12 }} axisLine={false} tickLine={false} tickMargin={12} />
                  <Tooltip cursor={{ fill: 'rgba(52, 211, 153, 0.06)' }} contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="url(#barGradient)" radius={[10, 10, 0, 0]} maxBarSize={54} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state"><Activity size={38} /> No growth data yet</div>
            )}
          </Card>
        </div>
      </section>

      <section className="page-section">
        <SectionTitle
          title={isAdmin ? 'Global System Overview' : 'Herd Operations Overview'}
          subtitle="Quick system summary, workflow shortcuts, and latest recorded activity."
        />
        <div className="dashboard-operations-grid">
          <Card className="dashboard-command-card">
            <div className="grid-admin-tiles dashboard-command-tiles">
              {[
                { label: isAdmin ? 'Total Users' : 'My Account', value: isAdmin ? stats.total_users ?? 0 : 1, icon: Users, color: 'var(--indigo)' },
                { label: 'Registered Animals', value: stats.total_animals, icon: PawPrint, color: 'var(--emerald)' },
                { label: 'Sold / Marketed', value: stats.sold_animals, icon: ShieldCheck, color: 'var(--amber)' },
                { label: 'Deceased', value: stats.deceased_animals, icon: HeartPulse, color: 'var(--rose)' },
              ].map((item) => (
                <div key={item.label} className="dashboard-mini-card command-stat">
                  <item.icon size={18} style={{ color: item.color }} />
                  <p className="metric-card-value">{item.value}</p>
                  <p className="metric-card-label">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="dashboard-command-body">
              <div className="dashboard-mix-panel">
                <span className="panel-kicker">Operational Mix</span>
                <h3>Livestock status balance</h3>
                <div className="status-ring" style={{ '--ring-value': `${activePercent}%` } as CSSProperties}>
                  <div>
                    <strong>{activePercent}%</strong>
                    <span>active</span>
                  </div>
                </div>
                <div className="status-legend">
                  {statusBalance.length > 0 ? statusBalance.map((item) => (
                    <span key={item.label}><i style={{ background: item.color }} /> {item.label}: {item.value}</span>
                  )) : <span><i /> No status data</span>}
                </div>
              </div>

              <div className="dashboard-footprint-panel">
                <span className="panel-kicker">Tracking Panel</span>
                <h3>System footprint</h3>
                <div className="footprint-map">
                  {footprintPoints.slice(0, 6).map((item, index) => (
                    <span
                      key={`${item.species}-${index}`}
                      className="footprint-point"
                      style={{
                        left: `${18 + ((index * 23) % 68)}%`,
                        top: `${24 + ((index * 31) % 58)}%`,
                      }}
                    >
                      <i />
                      <b>{item.species}</b>
                    </span>
                  ))}
                </div>
              </div>

              <div className="dashboard-actions-panel">
                <span className="panel-kicker">Quick Actions</span>
                <h3>Common workflows</h3>
                <div className="workflow-list">
                  {quickActions.map((action) => (
                    <Link key={action.label} to={action.to} className="workflow-link">
                      <action.icon size={17} />
                      <span>{action.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="dashboard-snapshot-panel">
                {[
                  { label: 'new registrations this month', value: stats.recent_registrations, icon: TrendingUp },
                  { label: 'health alert load across registered animals', value: `${stats.total_animals ? Math.round((stats.health_alerts / stats.total_animals) * 100) : 0}%`, icon: AlertTriangle },
                  { label: 'animals remain traceable in active registry', value: stats.active_animals, icon: ShieldCheck },
                ].map((item) => (
                  <div key={item.label} className="snapshot-row">
                    <item.icon size={17} />
                    <div>
                      <strong>{item.value}</strong>
                      <span>{item.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="dashboard-activity-card">
            <SectionTitle icon={<Activity size={20} style={{ color: 'var(--emerald)' }} />} title="Recent Activity" />
            <div className="activity-list activity-list-tall">
              {activities.length > 0 ? (
                activities.slice(0, 10).map((activity, i) => (
                  <div key={i} className="activity-row">
                    <span
                      className="activity-dot"
                      style={{
                        background:
                          activity.type === 'registration' ? 'var(--emerald)' :
                          activity.type === 'health' ? 'var(--amber)' :
                          activity.type === 'movement' ? 'var(--cyan)' : 'var(--indigo)',
                      }}
                    />
                    <div className="min-w-0">
                      <p className="activity-title">{activity.title}</p>
                      <p className="activity-copy">
                        <CollapsibleText text={activity.description} collapsedLength={92} />
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state"><Activity size={36} /> No recent activity</div>
              )}
            </div>
          </Card>
        </div>
      </section>

      <section className="page-section">
        <Card>
          <SectionTitle
            icon={<HeartPulse size={20} style={{ color: 'var(--rose)' }} />}
            title="Health Records Trend"
            subtitle="Monthly trend for health-related livestock records."
          />
          {healthData?.monthly_records?.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={healthData.monthly_records} margin={{ top: 8, right: 10, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.34} />
                    <stop offset="95%" stopColor="#14532d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(198, 255, 227, 0.08)" />
                <XAxis dataKey="month" tick={{ fill: '#9ab7ad', fontSize: 12 }} axisLine={false} tickLine={false} tickMargin={12} />
                <YAxis tick={{ fill: '#9ab7ad', fontSize: 12 }} axisLine={false} tickLine={false} tickMargin={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="count" stroke="#22c55e" fill="url(#healthGradient)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><HeartPulse size={38} /> No health records yet</div>
          )}
        </Card>
      </section>
    </div>
  );
}
