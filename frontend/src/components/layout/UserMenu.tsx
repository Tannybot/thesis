import { useEffect, useRef, useState } from 'react';
import type React from 'react';
import {
  Bell,
  Camera,
  ChevronDown,
  CircleHelp,
  LogOut,
  Moon,
  Settings,
  Sun,
  User,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import type { User as UserType } from '@/types';

const menuItems = [
  { label: 'View Profile', description: 'Review account identity', icon: User, action: 'profile' },
  { label: 'Change Photo', description: 'Update display avatar', icon: Camera, action: 'photo' },
  { label: 'Account Settings', description: 'Manage access details', icon: Settings, action: 'settings' },
  { label: 'Notifications', description: 'Alerts and preferences', icon: Bell, action: 'notifications' },
  { label: 'Help / Support', description: 'Guides and assistance', icon: CircleHelp, action: 'help' },
];

type ActivePanel = 'profile' | 'photo' | 'settings' | 'notifications' | 'help' | null;

type UserMenuProps = {
  variant?: 'header' | 'sidebar';
};

export default function UserMenu({ variant = 'header' }: UserMenuProps) {
  const { user, logout, refreshUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [lightMode, setLightMode] = useState(() => localStorage.getItem('livetrack-theme') === 'light');
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function closeOnOutside(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) document.addEventListener('mousedown', closeOnOutside);
    return () => document.removeEventListener('mousedown', closeOnOutside);
  }, [open]);

  useEffect(() => {
    document.documentElement.classList.toggle('theme-light', lightMode);
    localStorage.setItem('livetrack-theme', lightMode ? 'light' : 'dark');
  }, [lightMode]);

  function handleLogout() {
    setOpen(false);
    logout();
  }

  function openPanel(panel: ActivePanel) {
    setActivePanel(panel);
    setOpen(false);
  }

  return (
    <div className={`user-menu ${variant === 'sidebar' ? 'sidebar-user-menu' : ''}`} ref={menuRef}>
      <button
        type="button"
        className={`${variant === 'sidebar' ? 'sidebar-user-trigger' : 'header-user'} user-menu-trigger`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <UserAvatar user={user} />
        <div className="header-user-copy">
          <p className="header-user-name">{user?.full_name}</p>
          <p className="header-user-role">{user?.role_name}</p>
        </div>
        <ChevronDown size={15} className="user-menu-chevron" />
      </button>

      {open && (
        <section className="user-menu-panel" role="menu" aria-label="User menu">
          <div className="user-menu-profile">
            <span className="user-menu-avatar-wrap">
              <UserAvatar user={user} className="user-menu-avatar" />
              <i className="user-status-dot" aria-label="Online" />
            </span>
            <div className="min-w-0">
              <p className="user-menu-name">{user?.full_name}</p>
              <div className="user-menu-role-row">
                <p className="user-menu-role">{user?.role_name}</p>
                <span className="user-menu-status">Active</span>
              </div>
            </div>
          </div>

          <p className="user-menu-section-label">Quick actions</p>
          <div className="user-menu-list">
            {menuItems.map((item) => (
              <button key={item.label} type="button" className="user-menu-item" role="menuitem" onClick={() => openPanel(item.action as ActivePanel)}>
                <item.icon size={17} />
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </span>
              </button>
            ))}
            <button
              type="button"
              className="user-menu-item"
              role="menuitem"
              onClick={() => setLightMode((current) => !current)}
            >
              {lightMode ? <Sun size={17} /> : <Moon size={17} />}
              <span>
                <strong>{lightMode ? 'Light Mode On' : 'Dark Mode On'}</strong>
                <small>Switch dashboard appearance</small>
              </span>
            </button>
          </div>

          <div className="user-menu-footer">
            <button type="button" className="user-menu-item danger" role="menuitem" onClick={handleLogout}>
              <LogOut size={17} />
              <span>
                <strong>Sign Out</strong>
                <small>End current session</small>
              </span>
            </button>
          </div>
        </section>
      )}

      {activePanel === 'profile' && user && <ProfileDetailsModal user={user} onClose={() => setActivePanel(null)} />}
      {activePanel === 'photo' && user && <PhotoModal user={user} onClose={() => setActivePanel(null)} onSaved={refreshUser} />}
      {activePanel === 'settings' && user && <SettingsModal user={user} onClose={() => setActivePanel(null)} onSaved={refreshUser} />}
      {activePanel === 'notifications' && user && <PreferencesModal user={user} onClose={() => setActivePanel(null)} onSaved={refreshUser} />}
      {activePanel === 'help' && <HelpModal onClose={() => setActivePanel(null)} />}
    </div>
  );
}

function UserAvatar({ user, className = '' }: { user: UserType | null; className?: string }) {
  if (user?.profile_image_path) {
    return <img className={`avatar avatar-image ${className}`} src={user.profile_image_path} alt={`${user.full_name} avatar`} />;
  }

  return <span className={`avatar ${className}`}>{user?.full_name?.charAt(0).toUpperCase()}</span>;
}

function ProfileDetailsModal({ user, onClose }: { user: UserType; onClose: () => void }) {
  const joined = new Date(user.created_at).toLocaleDateString();

  return (
    <ProfileModal title="Profile Details" onClose={onClose}>
      <div className="profile-detail-header">
        <UserAvatar user={user} className="profile-modal-avatar" />
        <div className="min-w-0">
          <h2>{user.full_name}</h2>
          <p>{user.role_name}</p>
        </div>
      </div>
      <div className="profile-detail-grid">
        <InfoItem label="Email" value={user.email} />
        <InfoItem label="Role" value={user.role_name} />
        <InfoItem label="Account Status" value={user.is_active ? 'Active' : 'Inactive'} />
        <InfoItem label="Date Joined" value={joined} />
      </div>
    </ProfileModal>
  );
}

function PhotoModal({ user, onClose, onSaved }: { user: UserType; onClose: () => void; onSaved: () => Promise<void> }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(user.profile_image_path || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];
    setMessage('');
    setError('');
    if (!nextFile) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(nextFile.type)) {
      setError('Only JPG, PNG, and WEBP images are allowed.');
      return;
    }
    if (nextFile.size > 2 * 1024 * 1024) {
      setError('Profile photo must be 2MB or smaller.');
      return;
    }

    setFile(nextFile);
    setPreview(URL.createObjectURL(nextFile));
  }

  async function savePhoto() {
    if (!file) {
      setError('Choose an image before saving.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    try {
      const data = new FormData();
      data.append('photo', file);
      await api.post('/auth/me/photo', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      await onSaved();
      setMessage('Profile photo updated.');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update profile photo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProfileModal title="Change Profile Photo" onClose={onClose}>
      <div className="photo-upload-panel">
        {preview ? <img src={preview} alt="Profile preview" /> : <UserAvatar user={user} className="profile-modal-avatar" />}
        <label className="btn btn-secondary">
          Choose Image
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} hidden />
        </label>
      </div>
      <Feedback message={message} error={error} />
      <div className="profile-modal-actions">
        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
        <button type="button" className="btn btn-primary" onClick={savePhoto} disabled={loading}>
          {loading ? <div className="spinner w-4 h-4 border-2" /> : 'Save Photo'}
        </button>
      </div>
    </ProfileModal>
  );
}

function SettingsModal({ user, onClose, onSaved }: { user: UserType; onClose: () => void; onSaved: () => Promise<void> }) {
  const [fullName, setFullName] = useState(user.full_name);
  const [email, setEmail] = useState(user.email);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function saveSettings(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');
    if (fullName.trim().length < 2) {
      setError('Full name must be at least 2 characters.');
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/me', { full_name: fullName.trim(), email: email.trim() });
      await onSaved();
      setMessage('Account settings updated.');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update account settings.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProfileModal title="Account Settings" onClose={onClose}>
      <form onSubmit={saveSettings} className="profile-form">
        <div>
          <label className="input-label" htmlFor="profile-full-name">Full Name</label>
          <input id="profile-full-name" className="input-field" value={fullName} onChange={(event) => setFullName(event.target.value)} minLength={2} required />
        </div>
        <div>
          <label className="input-label" htmlFor="profile-email">Email</label>
          <input id="profile-email" type="email" className="input-field" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </div>
        <Feedback message={message} error={error} />
        <div className="profile-modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <div className="spinner w-4 h-4 border-2" /> : 'Save Changes'}
          </button>
        </div>
      </form>
    </ProfileModal>
  );
}

function PreferencesModal({ user, onClose, onSaved }: { user: UserType; onClose: () => void; onSaved: () => Promise<void> }) {
  const [prefs, setPrefs] = useState({
    email_alerts: user.notify_email_alerts ?? true,
    system_alerts: user.notify_system_alerts ?? true,
    activity_updates: user.notify_activity_updates ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function savePreferences() {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await api.put('/auth/me/preferences', prefs);
      await onSaved();
      setMessage('Notification preferences saved.');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save preferences.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProfileModal title="Notification Preferences" onClose={onClose}>
      <div className="toggle-list">
        <ToggleRow label="Email alerts" checked={prefs.email_alerts} onChange={() => setPrefs((current) => ({ ...current, email_alerts: !current.email_alerts }))} />
        <ToggleRow label="System alerts" checked={prefs.system_alerts} onChange={() => setPrefs((current) => ({ ...current, system_alerts: !current.system_alerts }))} />
        <ToggleRow label="Activity updates" checked={prefs.activity_updates} onChange={() => setPrefs((current) => ({ ...current, activity_updates: !current.activity_updates }))} />
      </div>
      <Feedback message={message} error={error} />
      <div className="profile-modal-actions">
        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
        <button type="button" className="btn btn-primary" disabled={loading} onClick={savePreferences}>
          {loading ? <div className="spinner w-4 h-4 border-2" /> : 'Save Preferences'}
        </button>
      </div>
    </ProfileModal>
  );
}

function HelpModal({ onClose }: { onClose: () => void }) {
  const [issue, setIssue] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submitIssue(event: React.FormEvent) {
    event.preventDefault();
    setMessage('');
    setError('');
    if (issue.trim().length < 10) {
      setError('Please describe the issue in at least 10 characters.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/me/support', { issue: issue.trim() });
      setIssue('');
      setMessage('Issue report submitted.');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit support request.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProfileModal title="Help / Support" onClose={onClose}>
      <div className="help-panel">
        <InfoItem label="FAQ" value="Use Animals to manage QR-linked livestock records. Use Health, Treatments, and Vaccinations to review care activity." />
        <InfoItem label="Contact Support" value="support@livetrack.local" />
      </div>
      <form onSubmit={submitIssue} className="profile-form">
        <div>
          <label className="input-label" htmlFor="support-issue">Report Issue</label>
          <textarea id="support-issue" className="input-field" rows={3} value={issue} onChange={(event) => setIssue(event.target.value)} placeholder="Describe what happened..." />
        </div>
        <Feedback message={message} error={error} />
        <div className="profile-modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <div className="spinner w-4 h-4 border-2" /> : 'Submit Issue'}
          </button>
        </div>
      </form>
    </ProfileModal>
  );
}

function ProfileModal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <section className="modal-content profile-action-modal" onClick={(event) => event.stopPropagation()} aria-label={title}>
        <div className="modal-header">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </section>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="profile-info-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Feedback({ message, error }: { message: string; error: string }) {
  if (!message && !error) return null;
  return <div className={`profile-feedback ${error ? 'error' : 'success'}`}>{error || message}</div>;
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={onChange} />
    </label>
  );
}
