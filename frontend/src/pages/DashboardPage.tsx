/* Dashboard Page — Futuristic neon analytics overview */
import { useEffect, useState } from 'react';
import {
  PawPrint, Heart, AlertTriangle, Syringe, TrendingUp,
  Activity, Users, ArrowUpRight
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend
} from 'recharts';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { DashboardStats, ActivityItem } from '@/types';

const COLORS = ['#10b981', '#22d3ee', '#f59e0b', '#f43f5e', '#059669', '#ec4899'];

const tooltipStyle = {
  background: 'rgba(11, 26, 22, 0.95)',
  border: '1px solid rgba(16, 185, 129, 0.2)',
  borderRadius: '14px',
  color: '#e2e8f0',
  padding: '12px 16px',
  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.1)',
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { label: 'Total Animals', value: stats.total_animals, icon: PawPrint, gradient: 'linear-gradient(135deg, #10b981, #059669)', shadowColor: 'rgba(16, 185, 129, 0.3)' },
    { label: 'Active', value: stats.active_animals, icon: Activity, gradient: 'linear-gradient(135deg, #22d3ee, #06b6d4)', shadowColor: 'rgba(34, 211, 238, 0.3)' },
    { label: 'Health Alerts', value: stats.health_alerts, icon: AlertTriangle, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', shadowColor: 'rgba(245, 158, 11, 0.3)' },
    { label: 'Due Vaccinations', value: stats.upcoming_vaccinations, icon: Syringe, gradient: 'linear-gradient(135deg, #ec4899, #be185d)', shadowColor: 'rgba(236, 72, 153, 0.3)' },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-2">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, {user?.full_name}. Here's your livestock overview.
          </p>
        </div>
        <div
          className="hidden sm:flex items-center gap-3 text-sm px-4 py-3 rounded-2xl"
          style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.12)',
          }}
        >
          <TrendingUp size={18} style={{ color: '#22d3ee' }} />
          <span className="font-medium text-white/80">{stats.recent_registrations} new records this month</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid-stat-tiles">
        {statCards.map((card, i) => (
          <div key={i} className="glass-card stat-card animate-in" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: card.gradient,
                  boxShadow: `0 4px 16px ${card.shadowColor}`,
                }}
              >
                <card.icon size={24} className="text-white" />
              </div>
              <ArrowUpRight size={18} style={{ color: 'rgba(52, 211, 153, 0.4)' }} />
            </div>
            <p className="text-3xl font-black text-white leading-none">{card.value}</p>
            <p className="text-[13px] mt-2 font-medium" style={{ color: 'rgba(52, 211, 153, 0.6)' }}>{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid-charts">
        {/* Species Breakdown */}
        <div className="glass-card overflow-x-auto min-w-0">
          <h3 className="text-lg font-bold text-white/90 mb-6 pb-4" style={{ borderBottom: '1px solid rgba(16, 185, 129, 0.1)' }}>
            Species Distribution
          </h3>
          {stats.species_breakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.species_breakdown}
                  dataKey="count"
                  nameKey="species"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={4}
                  label={(props: any) => `${props.name} (${props.value})`}
                  labelLine={false}
                  stroke="rgba(6, 15, 12, 0.6)"
                  strokeWidth={2}
                >
                  {stats.species_breakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '16px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state h-[300px]">No data yet</div>
          )}
        </div>

        {/* Growth Stages */}
        <div className="glass-card overflow-x-auto min-w-0">
          <h3 className="text-lg font-bold text-white/90 mb-6 pb-4" style={{ borderBottom: '1px solid rgba(16, 185, 129, 0.1)' }}>
            Growth Stages
          </h3>
          {stats.growth_stage_breakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.growth_stage_breakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.08)" />
                <XAxis dataKey="stage" tick={{ fill: 'rgba(52, 211, 153, 0.5)', fontSize: 12 }} axisLine={false} tickLine={false} tickMargin={12} />
                <YAxis tick={{ fill: 'rgba(52, 211, 153, 0.5)', fontSize: 12 }} axisLine={false} tickLine={false} tickMargin={12} />
                <Tooltip cursor={{ fill: 'rgba(16, 185, 129, 0.06)' }} contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="url(#barGradient)" radius={[8, 8, 0, 0]} maxBarSize={50} />
                <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '16px' }} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state h-[300px]">No data yet</div>
          )}
        </div>
      </div>

      {/* Admin stats + Activity feed */}
      <div className="grid-admin-row">
        {/* Admin stats — takes 2/3 width on desktop */}
        {isAdmin && stats.total_users !== undefined && (
          <div className="glass-card" style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '20px', marginBottom: '20px', borderBottom: '1px solid rgba(16, 185, 129, 0.1)' }}>
              <Users size={24} style={{ color: '#34d399' }} />
              <h3 className="text-lg font-bold text-white/90">Global System Overview</h3>
            </div>
            <div className="grid-admin-tiles">
              {[
                { label: 'Total Users', value: stats.total_users, color: '#6ee7b7' },
                { label: 'Active Animals', value: stats.total_animals, color: '#22d3ee' },
                { label: 'Sold / Marketed', value: stats.sold_animals, color: '#34d399' },
                { label: 'Deceased', value: stats.deceased_animals, color: '#fb7185' },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    textAlign: 'center',
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(11, 26, 22, 0.6)',
                    border: '1px solid rgba(16, 185, 129, 0.1)',
                  }}
                >
                  <p style={{ fontSize: '36px', fontWeight: 900, marginBottom: '6px', lineHeight: 1, color: item.color }}>{item.value}</p>
                  <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(52, 211, 153, 0.5)' }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity — takes 1/3 width on desktop */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '340px', minWidth: 0 }}>
          <div style={{ padding: '20px 20px 14px', flexShrink: 0, borderBottom: '1px solid rgba(16, 185, 129, 0.1)' }}>
            <h3 className="text-lg font-bold text-white/90">Recent Activity</h3>
          </div>
          <div style={{ padding: '16px 20px', flex: 1, overflowY: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {activities.length > 0 ? (
                activities.slice(0, 8).map((a, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 py-[10px] transition-colors"
                    style={{ borderBottom: '1px solid rgba(16, 185, 129, 0.05)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(16, 185, 129, 0.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{
                        background: a.type === 'registration' ? '#10b981' :
                          a.type === 'health' ? '#f59e0b' :
                          a.type === 'movement' ? '#22d3ee' : '#059669',
                        boxShadow: `0 0 8px ${
                          a.type === 'registration' ? 'rgba(16, 185, 129, 0.5)' :
                          a.type === 'health' ? 'rgba(245, 158, 11, 0.5)' :
                          a.type === 'movement' ? 'rgba(34, 211, 238, 0.5)' : 'rgba(5, 150, 105, 0.5)'
                        }`,
                      }}
                    />
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium text-white/90 truncate">{a.title}</p>
                      <p className="text-[13px] truncate mt-1 leading-relaxed" style={{ color: 'rgba(52, 211, 153, 0.5)' }}>{a.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state py-12">No recent activity</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Health monthly records (Moved to bottom) */}
      <div className="glass-card overflow-x-auto min-w-0" style={{ marginTop: '28px' }}>
        <h3 className="text-lg font-bold text-white/90 mb-6 pb-4" style={{ borderBottom: '1px solid rgba(16, 185, 129, 0.1)' }}>
          Health Records Trend
        </h3>
        {healthData?.monthly_records?.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={healthData.monthly_records} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.08)" />
              <XAxis dataKey="month" tick={{ fill: 'rgba(52, 211, 153, 0.5)', fontSize: 12 }} axisLine={false} tickLine={false} tickMargin={12} />
              <YAxis tick={{ fill: 'rgba(52, 211, 153, 0.5)', fontSize: 12 }} axisLine={false} tickLine={false} tickMargin={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="url(#strokeGradient)"
                fill="url(#healthGradient)"
                strokeWidth={3}
              />
              <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '16px' }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state h-[300px]">No health records yet</div>
        )}
      </div>
    </div>
  );
}
