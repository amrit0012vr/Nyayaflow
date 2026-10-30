import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Users, UserPlus, KeyRound, Check, X, Shield, Search } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('NyayaDemo@2026');
  const [role, setRole] = useState('lawyer');
  const [court, setCourt] = useState('Chief Judicial Magistrate, Patiala House Courts');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadUsers() {
    try {
      const data = await api.getAdminUsers();
      setUsers(data);
    } catch {
      alert('Failed to load user records');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.status === 'active' ? 'disabled' : 'active';
    if (!confirm(`Are you sure you want to set status of ${user.name} to ${newStatus}?`)) return;
    try {
      await api.updateAdminUser(user.id, { status: newStatus });
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Update failed');
    }
  };

  const handleResetPassword = async (user: any) => {
    const newPwd = prompt(`Enter new temporary password for ${user.name} (min 10 characters):`, 'NyayaReset@2026');
    if (!newPwd) return;
    try {
      await api.updateAdminUser(user.id, { password: newPwd });
      alert('Password reset successfully and audited in security log.');
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Password reset failed');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createAdminUser({
        name,
        email,
        password,
        role,
        court,
        registry: 'Patiala House Courts Registry'
      });
      alert('User created successfully.');
      setShowCreateModal(false);
      setName('');
      setEmail('');
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'User creation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-red-400" />
            <span>Court User Administration (UI-09)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage judicial personas, assign registry clearances, and enforce security policies.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-2 shadow-lg"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create Court User</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl mb-6">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by user name or official email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300"
        >
          <option value="">All Personas</option>
          <option value="judge">Judge</option>
          <option value="clerk">Clerk</option>
          <option value="lawyer">Advocate</option>
          <option value="police">Police</option>
          <option value="citizen">Citizen</option>
          <option value="auditor">Auditor</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* User Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">User / Official</th>
                <th className="py-3 px-4">Persona</th>
                <th className="py-3 px-4">Court / Registry</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white">{u.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                  </td>
                  <td className="py-3.5 px-4 capitalize font-semibold text-slate-300">
                    <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {u.court || 'District Court'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      u.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleResetPassword(u)}
                      title="Reset Password"
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 transition"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(u)}
                      title={u.status === 'active' ? 'Disable Account' : 'Enable Account'}
                      className={`p-1.5 rounded transition ${
                        u.status === 'active'
                          ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {u.status === 'active' ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-base font-bold text-white mb-4 pb-2 border-b border-slate-800">
              Create New Judicial User
            </h2>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Adv. Amit Saxena"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Official Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@court.gov.in"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Persona / Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="judge">Judge</option>
                  <option value="clerk">Clerk</option>
                  <option value="lawyer">Advocate</option>
                  <option value="police">Police / IO</option>
                  <option value="citizen">Citizen</option>
                  <option value="auditor">Auditor</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Initial Password (min 10 chars)</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded-lg"
                >
                  {isSubmitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

