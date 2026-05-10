import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  Bell,
  Camera,
  ChevronDown,
  HelpCircle,
  LogOut,
  Moon,
  Settings,
  Sun,
  UserCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

type ThemeMode = 'dark' | 'light';

function getInitialTheme(): ThemeMode {
  const stored = localStorage.getItem('herdscan-theme');
  return stored === 'light' ? 'light' : 'dark';
}

export default function ProfileMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [panel, setPanel] = useState<'profile' | 'settings' | 'notifications' | 'help' | null>(null);
  const [photo, setPhoto] = useState<string | null>(() => localStorage.getItem('herdscan-profile-photo'));
  const menuRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('herdscan-theme', theme);
  }, [theme]);

  useEffect(() => {
    function closeOnOutside(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }

    if (open) document.addEventListener('mousedown', closeOnOutside);
    return () => document.removeEventListener('mousedown', closeOnOutside);
  }, [open]);

  function toggleTheme() {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result);
      setPhoto(value);
      localStorage.setItem('herdscan-profile-photo', value);
    };
    reader.readAsDataURL(file);
  }

  const initial = user?.full_name?.charAt(0).toUpperCase() || 'H';
  const avatarContent = photo ? <img src={photo} alt="" /> : initial;

  return (
    <div className="profile-menu" ref={menuRef}>
      <button
        type="button"
        className="profile-trigger"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label="Open profile menu"
      >
        <span className="avatar">{avatarContent}</span>
        <span className="profile-trigger-copy">
          <span>{user?.full_name}</span>
          <small>{user?.role_name}</small>
        </span>
        <ChevronDown size={16} className={open ? 'rotate-180' : ''} />
      </button>

      {open && (
        <section className="profile-dropdown" aria-label="Profile menu">
          <div className="profile-card-header">
            <span className="avatar avatar-lg">{avatarContent}</span>
            <div className="min-w-0">
              <p className="profile-name">{user?.full_name}</p>
              <p className="profile-email">{user?.email}</p>
            </div>
          </div>

          <div className="profile-menu-list">
            <button type="button" onClick={() => setPanel(panel === 'profile' ? null : 'profile')}><UserCircle size={17} /> View Profile</button>
            <button type="button" onClick={() => fileInputRef.current?.click()}><Camera size={17} /> Change Photo</button>
            <button type="button" onClick={() => setPanel(panel === 'settings' ? null : 'settings')}><Settings size={17} /> Account Settings</button>
            <button type="button" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button type="button" onClick={() => setPanel(panel === 'notifications' ? null : 'notifications')}><Bell size={17} /> Notifications</button>
            <button type="button" onClick={() => setPanel(panel === 'help' ? null : 'help')}><HelpCircle size={17} /> Help / Support</button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />

          {panel && (
            <div className="profile-detail-panel">
              {panel === 'profile' && (
                <>
                  <strong>Profile</strong>
                  <span>{user?.full_name}</span>
                  <span>{user?.email}</span>
                  <span className="capitalize">{user?.role_name}</span>
                </>
              )}
              {panel === 'settings' && (
                <>
                  <strong>Account Settings</strong>
                  <span>Theme and profile photo preferences are saved on this browser.</span>
                </>
              )}
              {panel === 'notifications' && (
                <>
                  <strong>Notifications</strong>
                  <span>Use the bell in the header to review health alerts, vaccinations, and recent activity.</span>
                </>
              )}
              {panel === 'help' && (
                <>
                  <strong>Help / Support</strong>
                  <span>Contact your HerdScan administrator for account access, role changes, or deployment support.</span>
                </>
              )}
            </div>
          )}

          <button type="button" className="profile-logout" onClick={logout}>
            <LogOut size={17} />
            Logout
          </button>
        </section>
      )}
    </div>
  );
}
