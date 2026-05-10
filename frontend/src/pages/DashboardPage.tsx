import { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  HeartPulse,
  PawPrint,
  Radar,
  ShieldCheck,
  Syringe,
  TrendingUp,
  Users,
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
