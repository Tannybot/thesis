import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Bell, CalendarClock, CheckCircle2, Clock, X } from 'lucide-react';
import api from '@/lib/api';

type Notice = {
  id: string;
  title: string;
  summary: string;
  details: string;
  tone: 'warning' | 'info' | 'success';
};

type DashboardStats = {
  health_alerts?: number;
  upcoming_vaccinations?: number;
  active_animals?: number;
  total_animals?: number;
  recent_registrations?: number;
};

type ActivityItem = {
  type: string;
  title: string;
  description: string;
  date?: string;
};

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function closeOnOutside(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', closeOnOutside);
    return () => document.removeEventListener('mousedown', closeOnOutside);
  }, [open]);

  useEffect(() => {
    if (!open || loaded) return;
    loadNotifications();
  }, [open, loaded]);

  async function loadNotifications() {
    setLoading(true);
    try {
      const [statsRes, activityRes] = await Promise.all([
        api.get<DashboardStats>('/dashboard/stats'),
        api.get<ActivityItem[]>('/dashboard/recent-activity'),
      ]);
      const stats = statsRes.data;
      const activity = activityRes.data || [];
      const nextNotices: Notice[] = [
        {
          id: 'health-alerts',
          title: 'Health alerts',
          summary: `${stats.health_alerts || 0} record${stats.health_alerts === 1 ? '' : 's'} need attention`,
          details: 'Review health records marked with medium, high, or critical severity. Use the Health Records page to inspect diagnosis, severity, and recorded notes.',
          tone: (stats.health_alerts || 0) > 0 ? 'warning' : 'success',
        },
        {
          id: 'vaccinations',
          title: 'Upcoming vaccinations',
          summary: `${stats.upcoming_vaccinations || 0} vaccination${stats.upcoming_vaccinations === 1 ? '' : 's'} due soon`,
          details: 'Open Vaccinations to check due dates, vaccine names, batches, and the animal IDs connected to each schedule.',
          tone: (stats.upcoming_vaccinations || 0) > 0 ? 'info' : 'success',
        },
        {
          id: 'registrations',
          title: 'Recent registrations',
          summary: `${stats.recent_registrations || 0} new registration${stats.recent_registrations === 1 ? '' : 's'} this month`,
          details: `Current dashboard scope has ${stats.active_animals || 0} active animals out of ${stats.total_animals || 0} total tracked animals.`,
          tone: 'info',
        },
        ...activity.slice(0, 3).map((item, index) => ({
          id: `activity-${index}`,
          title: item.title,
          summary: item.description,
          details: `Recent ${item.type} activity recorded in the system. Open the related module for full record details and linked animal information.`,
          tone: 'info' as const,
        })),
      ];
      setNotices(nextNotices);
      setLoaded(true);
    } catch {
      setNotices([{
        id: 'notification-error',
        title: 'Notifications unavailable',
        summary: 'Unable to load dashboard notifications.',
        details: 'Check that the backend API is running and your session is still valid.',
        tone: 'warning',
      }]);
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }

  const activeCount = notices.filter((notice) => notice.tone !== 'success').length;

  return (
    <div className="notification-center" ref={panelRef}>
      <button
        className="header-action"
        id="notifications-btn"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <Bell size={18} />
        {activeCount > 0 && <span className="notification-dot" />}
      </button>

      {open && (
        <section className="notification-panel" aria-label="Notifications">
          <div className="notification-header">
            <div>
              <h2>Notifications</h2>
              <p>{activeCount} active update{activeCount === 1 ? '' : 's'}</p>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)} aria-label="Close notifications">
              <X size={16} />
            </button>
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-empty"><div className="spinner w-5 h-5 border-2" /> Loading notifications</div>
            ) : notices.length === 0 ? (
              <div className="notification-empty">No notifications</div>
            ) : notices.map((notice) => {
              const expanded = expandedId === notice.id;
              const Icon = notice.tone === 'warning' ? AlertTriangle : notice.tone === 'success' ? CheckCircle2 : CalendarClock;
              return (
                <article key={notice.id} className={`notification-item ${notice.tone}`}>
                  <button type="button" onClick={() => setExpandedId(expanded ? null : notice.id)}>
                    <span className="notification-icon"><Icon size={16} /></span>
                    <span className="notification-copy">
                      <strong>{notice.title}</strong>
                      <span>{notice.summary}</span>
                    </span>
                    <Clock size={14} className="notification-expand-icon" />
                  </button>
                  {expanded && <p className="notification-details">{notice.details}</p>}
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
