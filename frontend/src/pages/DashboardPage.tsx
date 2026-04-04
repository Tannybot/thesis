/* Dashboard Page — analytics overview with Recharts */
import { useEffect, useState } from 'react';
import {
  PawPrint, Heart, AlertTriangle, Syringe, TrendingUp,
  Activity, Users, ArrowUpRight
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { DashboardStats, ActivityItem } from '@/types';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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
    { label: 'Total Animals', value: stats.total_animals, icon: PawPrint, color: 'from-emerald-500 to-teal-600' },
    { label: 'Active', value: stats.active_animals, icon: Activity, color: 'from-blue-500 to-indigo-600' },
    { label: 'Health Alerts', value: stats.health_alerts, icon: AlertTriangle, color: 'from-amber-500 to-orange-600' },
    { label: 'Due Vaccinations', value: stats.upcoming_vaccinations, icon: Syringe, color: 'from-purple-500 to-violet-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-4">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, {user?.full_name}. Here's your livestock overview.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm text-surface-400 bg-surface-900/50 p-3 rounded-xl border border-surface-800">
          <TrendingUp size={18} className="text-primary-500" />
          <span className="font-medium text-surface-200">{stats.recent_registrations} new records this month</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className="glass-card stat-card animate-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg shadow-black/20`}>
                <card.icon size={24} className="text-white" />
              </div>
              <ArrowUpRight size={18} className="text-surface-500" />
            </div>
            <p className="text-3xl font-bold text-surface-50">{card.value}</p>
            <p className="text-sm text-surface-400 mt-2 font-medium">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Species Breakdown */}
        <div className="glass-card p-8">
          <h3 className="text-xl font-bold text-surface-100 mb-6 border-b border-surface-800 pb-4">Species Distribution</h3>
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
                >
                  {stats.species_breakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                    padding: '12px 16px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state h-[300px]">No data yet</div>
          )}
        </div>

        {/* Growth Stages */}
        <div className="glass-card p-8">
          <h3 className="text-xl font-bold text-surface-100 mb-6 border-b border-surface-800 pb-4">Growth Stages</h3>
          {stats.growth_stage_breakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.growth_stage_breakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="stage" tick={{ fill: '#94a3b8', fontSize: 13 }} axisLine={false} tickLine={false} tickMargin={12} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 13 }} axisLine={false} tickLine={false} tickMargin={12} />
                <Tooltip
                  cursor={{ fill: '#334155', opacity: 0.2 }}
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                    padding: '12px 16px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state h-[300px]">No data yet</div>
          )}
        </div>
      </div>

      {/* Health chart + Activity feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Health monthly records */}
        <div className="glass-card p-8 lg:col-span-2">
          <h3 className="text-xl font-bold text-surface-100 mb-6 border-b border-surface-800 pb-4">Health Records Trend</h3>
          {healthData?.monthly_records?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={healthData.monthly_records} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 13 }} axisLine={false} tickLine={false} tickMargin={12} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 13 }} axisLine={false} tickLine={false} tickMargin={12} />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                    padding: '12px 16px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#10b981"
                  fill="url(#healthGradient)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state h-[300px]">No health records yet</div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="glass-card flex flex-col h-full">
          <div className="p-8 pb-4 shrink-0 border-b border-surface-800">
            <h3 className="text-xl font-bold text-surface-100">Recent Activity</h3>
          </div>
          <div className="p-6 flex-1 overflow-y-auto" style={{ maxHeight: '315px' }}>
            <div className="flex flex-col">
              {activities.length > 0 ? (
                activities.slice(0, 8).map((a, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 border-b border-surface-800/60 hover:bg-surface-800/40 transition-colors last:border-0 last:pb-2">
                    <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 shadow-lg ${
                      a.type === 'registration' ? 'bg-primary-500 shadow-primary-500/50' :
                      a.type === 'health' ? 'bg-amber-500 shadow-amber-500/50' :
                      a.type === 'movement' ? 'bg-blue-500 shadow-blue-500/50' : 'bg-surface-500 shadow-surface-500/50'
                    }`} />
                    <div className="min-w-0">
                      <p className="text-[15px] font-medium text-surface-100 truncate">{a.title}</p>
                      <p className="text-[14px] text-surface-400 truncate mt-1 leading-relaxed">{a.description}</p>
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

      {/* Admin stats */}
      {isAdmin && stats.total_users !== undefined && (
        <div className="glass-card p-8 mt-4">
          <div className="flex items-center gap-3 border-b border-surface-800 pb-6 mb-6">
            <Users size={24} className="text-primary-400" />
            <h3 className="text-xl font-bold text-surface-100">Global System Overview</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 rounded-2xl bg-surface-900/60 border border-surface-800">
              <p className="text-4xl font-black text-surface-50 mb-2">{stats.total_users}</p>
              <p className="text-sm font-medium text-surface-400 tracking-wide uppercase">Total Users</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-surface-900/60 border border-surface-800">
              <p className="text-4xl font-black text-surface-50 mb-2">{stats.total_animals}</p>
              <p className="text-sm font-medium text-surface-400 tracking-wide uppercase">Active Animals</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-surface-900/60 border border-surface-800">
              <p className="text-4xl font-black text-blue-400 mb-2">{stats.sold_animals}</p>
              <p className="text-sm font-medium text-surface-400 tracking-wide uppercase">Sold / Marketed</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-surface-900/60 border border-surface-800">
              <p className="text-4xl font-black text-red-400 mb-2">{stats.deceased_animals}</p>
              <p className="text-sm font-medium text-surface-400 tracking-wide uppercase">Deceased</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
