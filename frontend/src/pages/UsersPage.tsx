/* User Management Page (Admin Only) — Futuristic neon theme */
import { useEffect, useState } from 'react';
import { Users, Shield, UserCheck, UserX } from 'lucide-react';
import api from '@/lib/api';
import type { User } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

export default function UsersPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    try {
      const res = await api.get('/users/');
      setUsers(res.data.users);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function toggleUser(userId: number, isActive: boolean) {
    try {
      if (isActive) {
        await api.delete(`/users/${userId}`);
      } else {
        await api.put(`/users/${userId}`, { is_active: true });
      }
      loadUsers();
    } catch (err) { console.error(err); }
  }

  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="space-y-8">
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">Manage system users and access control</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : (
        <div className="glass-card table-wrapper min-w-0">
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="font-medium text-white/85">{u.full_name}</td>
                  <td style={{ color: 'rgba(52, 211, 153, 0.5)' }}>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role_name === 'admin' ? 'badge-warning' : 'badge-active'}`}>
                      {u.role_name === 'admin' && <Shield size={12} />}
                      {u.role_name}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-active' : 'badge-deceased'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="text-sm" style={{ color: 'rgba(52, 211, 153, 0.4)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => toggleUser(u.id, u.is_active)}
                      className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-primary'}`}
                      id={`toggle-user-${u.id}`}
                    >
                      {u.is_active ? <><UserX size={14} /> Deactivate</> : <><UserCheck size={14} /> Activate</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
