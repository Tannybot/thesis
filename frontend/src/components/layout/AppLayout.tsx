import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from './Sidebar';
import AIAssistant from './AIAssistant';
import NotificationCenter from './NotificationCenter';
import ProfileMenu from './ProfileMenu';
import SearchCommand from './SearchCommand';

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
          <SearchCommand />

          <NotificationCenter />

          <ProfileMenu />
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
      <AIAssistant />
    </div>
  );
}
