import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from './Sidebar';

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
        <header className="app-header">
          <div className="top-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search animals, records..."
              className="input-field"
              id="global-search"
            />
          </div>

          <button className="header-action" id="notifications-btn" aria-label="Notifications">
            <Bell size={18} />
            <span className="notification-dot" />
          </button>

          <div className="header-user">
            <span className="avatar">{user?.full_name?.charAt(0).toUpperCase()}</span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.full_name}</p>
              <p className="text-xs capitalize" style={{ color: 'var(--muted)' }}>{user?.role_name}</p>
            </div>
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
