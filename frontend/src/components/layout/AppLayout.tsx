/* App layout wrapper — Futuristic neon theme */
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from './Sidebar';
import { Bell, Search } from 'lucide-react';

export default function AppLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        {/* Header */}
        <header className="app-header">
          <div className="flex items-center gap-4 ml-16 md:ml-0">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(167, 139, 250, 0.4)' }} />
              <input
                type="text"
                placeholder="Search animals, records..."
                className="input-field pl-10 w-72 text-sm"
                style={{
                  background: 'rgba(19, 17, 43, 0.5)',
                  borderColor: 'rgba(139, 92, 246, 0.12)',
                  borderRadius: '24px',
                  height: '44px',
                }}
                id="global-search"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              className="relative w-[44px] h-[44px] rounded-xl flex items-center justify-center transition-all"
              style={{
                background: 'rgba(139, 92, 246, 0.08)',
                border: '1px solid rgba(139, 92, 246, 0.12)',
                color: '#a78bfa',
              }}
              id="notifications-btn"
            >
              <Bell size={18} />
              <span
                className="absolute top-2 right-2 w-2 h-2 rounded-full"
                style={{
                  background: '#22d3ee',
                  boxShadow: '0 0 6px rgba(34, 211, 238, 0.5)',
                }}
              />
            </button>
            <div
              className="flex items-center gap-3 px-3 py-2 rounded-xl"
              style={{
                background: 'rgba(139, 92, 246, 0.06)',
                border: '1px solid rgba(139, 92, 246, 0.1)',
              }}
            >
              <span className="text-sm font-medium text-white/80 hidden sm:block">
                {user?.full_name}
              </span>
              <span className="badge badge-active text-xs">
                {user?.role_name}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
