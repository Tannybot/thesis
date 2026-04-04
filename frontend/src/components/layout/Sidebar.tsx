/* Sidebar navigation component */
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, PawPrint, Heart, Pill, Syringe,
  Truck, Users, QrCode, LogOut, Menu, X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

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
  const location = useLocation();

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 btn btn-ghost md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        id="sidebar-toggle"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`app-sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-surface-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <QrCode size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-surface-50">LiveTrack</h1>
            <p className="text-[11px] text-surface-500">QR Livestock System</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <p className="px-7 py-2 text-[11px] font-semibold text-surface-500 uppercase tracking-wider">
            Main Menu
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
              onClick={() => setMobileOpen(false)}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <p className="px-7 py-2 mt-4 text-[11px] font-semibold text-surface-500 uppercase tracking-wider">
                Administration
              </p>
              {adminItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? 'active' : ''}`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* User section */}
        <div className="border-t border-surface-800 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary-600/20 flex items-center justify-center text-primary-400 font-semibold text-sm">
              {user?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-200 truncate">{user?.full_name}</p>
              <p className="text-xs text-surface-500 capitalize">{user?.role_name}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="nav-item w-full text-danger hover:bg-red-500/10"
            id="logout-btn"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
