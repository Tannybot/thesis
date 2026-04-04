/* App layout wrapper — sidebar + header + content */
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from './Sidebar';
import { Bell, Search } from 'lucide-react';

export default function AppLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        {/* Header */}
        <header className="app-header">
          <div className="flex items-center gap-4 ml-12 md:ml-0">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
              <input
                type="text"
                placeholder="Search animals, records..."
                className="input-field pl-9 w-64 text-sm"
                id="global-search"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn btn-ghost relative" id="notifications-btn">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-surface-300 hidden sm:block">
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
