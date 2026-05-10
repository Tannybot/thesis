import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  PawPrint,
  Pill,
  ShieldCheck,
  Syringe,
  Truck,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AppLogo from '@/components/ui/AppLogo';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/animals', label: 'Animals', icon: PawPrint },
  { path: '/health-records', label: 'Health Records', icon: Heart },
  { path: '/treatments', label: 'Treatments', icon: Pill },
  { path: '/vaccinations', label: 'Vaccinations', icon: Syringe },
  { path: '/supply-chain', label: 'Supply Chain', icon: Truck },
];

const adminItems = [
  { path: '/users', label: 'User Management', icon: Users },
];

export default function Sidebar() {
  const { user, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {!mobileOpen && (
        <button
          className="mobile-sidebar-toggle md:hidden header-action"
          onClick={() => setMobileOpen(true)}
          id="sidebar-toggle"
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>
      )}

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`app-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="brand-block">
          <div className="sidebar-brand-main">
            <div className="brand-mark">
              <AppLogo />
            </div>
            <div className="min-w-0">
              <h1 className="brand-title">HerdScan</h1>
              <p className="brand-subtitle">Livestock Traceability & Monitoring System</p>
            </div>
          </div>
          <button
            className="sidebar-close md:hidden header-action"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-5 overflow-y-auto">
          <p className="nav-section-label">Operations</p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className="mx-5 my-4" style={{ borderTop: '1px solid var(--line)' }} />
              <p className="nav-section-label">Administration</p>
              {adminItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="sidebar-user">
          <div className="flex items-center gap-3 mb-4 min-w-0">
            <span className="avatar">{user?.full_name?.charAt(0).toUpperCase()}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">{user?.full_name}</p>
              <p className="text-xs capitalize" style={{ color: 'var(--muted)' }}>{user?.role_name}</p>
            </div>
            {isAdmin ? <ShieldCheck size={18} style={{ color: 'var(--amber)' }} /> : <Activity size={18} style={{ color: 'var(--cyan)' }} />}
          </div>
          <button onClick={logout} className="nav-item w-full" style={{ margin: 0, color: 'var(--rose)' }} id="logout-btn">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
