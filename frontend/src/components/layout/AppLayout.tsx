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
        <header className="app-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', minHeight: '64px' }}>
          {/* Search bar — fills available space */}
          <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(167, 139, 250, 0.4)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search animals, records..."
              className="input-field"
              style={{
                background: 'rgba(19, 17, 43, 0.5)',
                borderColor: 'rgba(139, 92, 246, 0.12)',
                borderRadius: '24px',
                height: '44px',
                paddingLeft: '40px',
                width: '100%',
              }}
              id="global-search"
            />
          </div>

          {/* Notification bell — always visible */}
          <button
            style={{
              flexShrink: 0,
              position: 'relative',
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(139, 92, 246, 0.08)',
              border: '1px solid rgba(139, 92, 246, 0.12)',
              color: '#a78bfa',
              cursor: 'pointer',
            }}
            id="notifications-btn"
          >
            <Bell size={18} />
            <span
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#22d3ee',
                boxShadow: '0 0 6px rgba(34, 211, 238, 0.5)',
              }}
            />
          </button>

          {/* User name + role — hidden on mobile, shown on desktop */}
          <div
            className="app-header-user"
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 14px',
              borderRadius: '12px',
              background: 'rgba(139, 92, 246, 0.06)',
              border: '1px solid rgba(139, 92, 246, 0.1)',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap' }}>
              {user?.full_name}
            </span>
            <span className="badge badge-active" style={{ fontSize: '12px' }}>
              {user?.role_name}
            </span>
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
