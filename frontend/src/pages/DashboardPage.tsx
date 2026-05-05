import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ClipboardList,
  HeartPulse,
  MapPinned,
  PawPrint,
  Radar,
  Route,
  ShieldCheck,
  Syringe,
  TrendingUp,
  Users,
  UserPlus,
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

const COLORS = ['#34d399', '#38bdf8', '#fbbf24', '#fb7185', '#818cf8', '#2dd4bf'];

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

  const statCards = [
    { label: 'Total Animals', value: stats.total_animals, icon: PawPrint, tone: '#34d399' },
    { label: 'Active Livestock', value: stats.active_animals, icon: Activity, tone: '#38bdf8' },
    { label: 'Health Alerts', value: stats.health_alerts, icon: AlertTriangle, tone: '#fbbf24' },
    { label: 'Due Vaccinations', value: stats.upcoming_vaccinations, icon: Syringe, tone: '#fb7185' },
  ];
  const statusMix = [
    { name: 'Active', value: stats.active_animals, color: '#57e39c' },
    { name: 'Sold', value: stats.sold_animals, color: '#f2c66d' },
    { name: 'Deceased', value: stats.deceased_animals, color: '#f18ca0' },
  ].filter((item) => item.value > 0);
  const activeRate = stats.total_animals > 0 ? Math.round((stats.active_animals / stats.total_animals) * 100) : 0;
  const alertLoad = stats.total_animals > 0 ? Math.round((stats.health_alerts / stats.total_animals) * 100) : 0;
  const footprintNodes = stats.species_breakdown.length > 0
    ? stats.species_breakdown.slice(0, 5)
    : [{ species: 'registry', count: stats.total_animals }];
  const adminActions = [
    { label: 'Review Health', path: '/health-records', icon: ClipboardList },
    { label: 'Vaccination Queue', path: '/vaccinations', icon: Syringe },
    { label: 'Manage Users', path: '/users', icon: UserPlus },
  ];

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow={<span className="page-eyebrow"><Radar size={14} /> Command Overview</span>}
        title="Dashboard"
        subtitle={`Welcome back, ${user?.full_name}. Monitor herd activity, health movement, vaccination demand, and registration trends.`}
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
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity={1} />
                      <stop offset="100%" stopColor="#34d399" stopOpacity={0.62} />
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
          title={isAdmin ? 'Operations And Administration' : 'Recent Operations'}
          subtitle="Quick system summary and latest recorded activity."
        />
        <div className="grid-admin-row">
          {isAdmin && stats.total_users !== undefined && (
            <Card>
              <SectionTitle icon={<Users size={20} style={{ color: 'var(--indigo)' }} />} title="Global System Overview" />
              <div className="grid-admin-tiles">
                {[
                  { label: 'Total Users', value: stats.total_users, icon: Users, color: 'var(--indigo)' },
                  { label: 'Registered Animals', value: stats.total_animals, icon: PawPrint, color: 'var(--emerald)' },
                  { label: 'Sold / Marketed', value: stats.sold_animals, icon: ShieldCheck, color: 'var(--amber)' },
                  { label: 'Deceased', value: stats.deceased_animals, icon: HeartPulse, color: 'var(--rose)' },
                ].map((item) => (
                  <div key={item.label} className="dashboard-mini-card">
                    <item.icon size={19} style={{ color: item.color }} />
                    <p className="metric-card-value mt-4" style={{ fontSize: 28 }}>{item.value}</p>
                    <p className="metric-card-label">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="dashboard-command-grid">
                <div className="dashboard-insight-panel">
                  <div>
                    <p className="dashboard-panel-kicker">Operational Mix</p>
                    <h3 className="dashboard-panel-title">Livestock status balance</h3>
                  </div>
                  {statusMix.length > 0 ? (
                    <div className="dashboard-status-chart">
                      <ResponsiveContainer width="100%" height={170}>
                        <PieChart>
                          <Pie
                            data={statusMix}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={44}
                            outerRadius={72}
                            paddingAngle={4}
                            stroke="rgba(5, 8, 7, 0.75)"
                            strokeWidth={3}
                          >
                            {statusMix.map((item) => <Cell key={item.name} fill={item.color} />)}
                          </Pie>
                          <Tooltip contentStyle={tooltipStyle} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="dashboard-chart-center">
                        <strong>{activeRate}%</strong>
                        <span>active</span>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-state dashboard-compact-empty"><PawPrint size={28} /> No status data</div>
                  )}
                  <div className="dashboard-status-legend">
                    {statusMix.map((item) => (
                      <span key={item.name}><i style={{ background: item.color }} />{item.name}: {item.value}</span>
                    ))}
                  </div>
                </div>

                <div className="dashboard-map-panel">
                  <div className="dashboard-map-header">
                    <div>
                      <p className="dashboard-panel-kicker">Tracking Panel</p>
                      <h3 className="dashboard-panel-title">System footprint</h3>
                    </div>
                    <MapPinned size={19} style={{ color: 'var(--emerald)' }} />
                  </div>
                  <div className="dashboard-map-surface">
                    {footprintNodes.map((node, index) => (
                      <span
                        key={node.species}
                        className="map-node"
                        style={{
                          left: `${14 + (index * 17) % 72}%`,
                          top: `${24 + (index * 23) % 52}%`,
                        }}
                      >
                        <i />
                        <small>{node.species}</small>
                      </span>
                    ))}
                    <span className="map-route route-a" />
                    <span className="map-route route-b" />
                  </div>
                </div>

                <div className="dashboard-actions-panel">
                  <div>
                    <p className="dashboard-panel-kicker">Quick Actions</p>
                    <h3 className="dashboard-panel-title">Common workflows</h3>
                  </div>
                  <div className="dashboard-quick-actions">
                    {adminActions.map((action) => (
                      <Link key={action.label} to={action.path} className="dashboard-action-button">
                        <action.icon size={17} />
                        <span>{action.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="dashboard-insights-list">
                  <div className="dashboard-insight-row">
                    <Route size={18} />
                    <div>
                      <strong>{stats.recent_registrations}</strong>
                      <span>new registrations this month</span>
                    </div>
                  </div>
                  <div className="dashboard-insight-row">
                    <AlertTriangle size={18} />
                    <div>
                      <strong>{alertLoad}%</strong>
                      <span>health alert load across registered animals</span>
                    </div>
                  </div>
                  <div className="dashboard-insight-row">
                    <ShieldCheck size={18} />
                    <div>
                      <strong>{stats.total_animals - stats.deceased_animals}</strong>
                      <span>animals remain traceable in the active registry</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <Card>
            <SectionTitle icon={<Activity size={20} style={{ color: 'var(--emerald)' }} />} title="Recent Activity" />
            <div className="activity-list">
              {activities.length > 0 ? (
                activities.slice(0, 8).map((activity, i) => (
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
                        <CollapsibleText text={activity.description} collapsedLength={78} />
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
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.34} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(198, 255, 227, 0.08)" />
                <XAxis dataKey="month" tick={{ fill: '#9ab7ad', fontSize: 12 }} axisLine={false} tickLine={false} tickMargin={12} />
                <YAxis tick={{ fill: '#9ab7ad', fontSize: 12 }} axisLine={false} tickLine={false} tickMargin={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="count" stroke="#38bdf8" fill="url(#healthGradient)" strokeWidth={3} />
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
