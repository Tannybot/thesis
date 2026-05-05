import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Heart,
  LayoutDashboard,
  Menu,
  PawPrint,
  Pill,
  QrCode,
  Syringe,
  Truck,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import UserMenu from './UserMenu';

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
  const { isAdmin } = useAuth();
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
              <QrCode size={24} />
            </div>
            <div className="brand-copy">
              <h1 className="brand-title">LiveTrack</h1>
              <p className="brand-subtitle">Traceability Suite</p>
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

        <nav className="sidebar-nav">
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
              <div className="nav-divider" />
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

        <UserMenu variant="sidebar" />
      </aside>
    </>
  );
}
