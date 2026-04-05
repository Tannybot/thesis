/* Sidebar navigation component — Futuristic neon design */
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
      {!mobileOpen && (
        <button
          className="fixed z-50 p-2 md:hidden rounded-xl transition-all"
          style={{
            top: '17px',
            left: '12px',
            background: 'rgba(11, 26, 22, 0.85)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            backdropFilter: 'blur(10px)',
            color: '#6ee7b7'
          }}
          onClick={() => setMobileOpen(true)}
          id="sidebar-toggle"
        >
          <Menu size={26} />
        </button>
      )}

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`app-sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Logo Section */}
        <div className="flex items-center justify-between px-6" style={{ paddingTop: '18px', paddingBottom: '18px', paddingLeft: '28px', borderBottom: '1px solid rgba(16, 185, 129, 0.12)' }}>
          <div className="flex items-center gap-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
                animation: 'pulse-glow 4s ease-in-out infinite',
              }}
            >
              <QrCode size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight leading-none mb-1">LiveTrack</h1>
              <p className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: 'rgba(52, 211, 153, 0.6)' }}>QR System</p>
            </div>
          </div>
          <button 
            className="md:hidden p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors" 
            onClick={() => setMobileOpen(false)}
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-5 overflow-y-auto">
          <p className="px-7 py-2 text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: 'rgba(52, 211, 153, 0.4)' }}>
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
              <div className="mx-6 my-3" style={{ borderTop: '1px solid rgba(16, 185, 129, 0.08)' }} />
              <p className="px-7 py-2 text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: 'rgba(52, 211, 153, 0.4)' }}>
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
        <div className="p-4" style={{ borderTop: '1px solid rgba(16, 185, 129, 0.12)' }}>
          <div className="flex items-center gap-3 mb-3 px-2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.15))',
                color: '#6ee7b7',
                border: '1px solid rgba(16, 185, 129, 0.2)',
              }}
            >
              {user?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/90 truncate">{user?.full_name}</p>
              <p className="text-xs capitalize" style={{ color: 'rgba(52, 211, 153, 0.5)' }}>{user?.role_name}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="nav-item w-full hover:!bg-rose-500/10"
            style={{ color: '#fb7185' }}
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
