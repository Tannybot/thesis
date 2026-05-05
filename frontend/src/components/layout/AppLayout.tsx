import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from './Sidebar';
import AIAssistant from './AIAssistant';
import NotificationCenter from './NotificationCenter';
import UserMenu from './UserMenu';

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();
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

          <div className="header-actions">
            <NotificationCenter />
            <UserMenu />
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
      <AIAssistant />
    </div>
  );
}
