import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import {
  Users,
  UserPlus,
  KeyRound,
  Check,
  X,
  Search,
  Scale
} from 'lucide-react';
import { Panel } from '../../components/ui/Panel';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';
import { Dialog } from '../../components/ui/Dialog';
import { InlineBanner } from '../../components/ui/InlineBanner';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
      setStatusMessage({ type: 'error', text: 'Failed to load user records from administration endpoint.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.status === 'active' ? 'disabled' : 'active';
    if (!confirm(`Are you sure you want to change status of ${user.name} to ${newStatus}?`)) return;
    try {
      await api.updateAdminUser(user.id, { status: newStatus });
      setStatusMessage({ type: 'success', text: `Status for ${user.name} changed to ${newStatus}.` });
      loadUsers();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Update failed.' });
    }
  };

  const handleResetPassword = async (user: any) => {
    const newPwd = prompt(`Enter new temporary password for ${user.name} (min 10 characters):`, 'NyayaReset@2026');
    if (!newPwd) return;
    try {
      await api.updateAdminUser(user.id, { password: newPwd });
      setStatusMessage({ type: 'success', text: `Password reset for ${user.name} and recorded in audit ledger.` });
      loadUsers();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Password reset failed.' });
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      await api.createAdminUser({
        name,
        email,
        password,
        role,
        court,
        registry: 'Patiala House Courts Registry'
      });
      setStatusMessage({ type: 'success', text: `User account for ${name} (${role}) successfully provisioned.` });
      setShowCreateModal(false);
      setName('');
      setEmail('');
      loadUsers();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'User creation failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Page Header */}
      <div className="border-b border-[#C5CCD6] pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0B2A5B]">
              <Scale className="w-4 h-4 text-[#FF9933]" aria-hidden="true" />
              <span>System Administration &bull; Access Management</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0B2A5B] font-display mt-1">
              Court User Administration
            </h1>
            <div className="w-16 h-[3px] bg-[#FF9933] mt-2 mb-2" />
            <p className="text-sm text-[#4A4F57] max-w-2xl">
              Manage user accounts, assign judicial and registry roles, and enforce security policies.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" aria-hidden="true" />
            <span>Create New User</span>
          </Button>
        </div>
      </div>

      {statusMessage && (
        <InlineBanner
          variant={statusMessage.type === 'success' ? 'success' : 'danger'}
          title={statusMessage.type === 'success' ? 'Administration Action Completed' : 'Administration Error'}
        >
          {statusMessage.text}
        </InlineBanner>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-[#F4F6FA] border border-[#C5CCD6] p-4 rounded">
        <div className="flex-1 relative">
          <label htmlFor="user-admin-search" className="sr-only">
            Search by user name or official email
          </label>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#757575]">
            <Search className="w-4 h-4" aria-hidden="true" />
          </div>
          <input
            id="user-admin-search"
            type="text"
            placeholder="Search by user name or official email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#C5CCD6] rounded text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
          />
        </div>

        <div className="w-full sm:w-60">
          <label htmlFor="user-admin-role-filter" className="sr-only">
            Filter by user category
          </label>
          <select
            id="user-admin-role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-[#C5CCD6] rounded text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
          >
            <option value="">All Categories ({users.length})</option>
            <option value="judge">Judge</option>
            <option value="clerk">Registry Clerk</option>
            <option value="lawyer">Advocate</option>
            <option value="police">Police / Investigating Officer</option>
            <option value="citizen">Citizen / Litigant</option>
            <option value="auditor">Auditor</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      <Panel
        title={`Registered Accounts (${filteredUsers.length})`}
        subtitle="Role-based access credentials with audit logging"
      >
        {loading ? (
          <div className="p-12 text-center text-[#4A4F57]">
            <div className="w-8 h-8 border-4 border-[#0B2A5B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold">Loading user records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#C5CCD6] rounded">
            <table className="w-full text-left text-sm border-collapse">
              <caption className="sr-only">Table of registered judicial portal user accounts</caption>
              <thead>
                <tr className="bg-[#0B2A5B] text-white">
                  <th scope="col" className="py-3 px-4 font-semibold text-xs tracking-wider uppercase">User / Official</th>
                  <th scope="col" className="py-3 px-4 font-semibold text-xs tracking-wider uppercase">Category</th>
                  <th scope="col" className="py-3 px-4 font-semibold text-xs tracking-wider uppercase">Court / Registry</th>
                  <th scope="col" className="py-3 px-4 font-semibold text-xs tracking-wider uppercase">Status</th>
                  <th scope="col" className="py-3 px-4 font-semibold text-xs tracking-wider uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C5CCD6] text-[#1A1A1A]">
                {filteredUsers.map((u, idx) => (
                  <tr
                    key={u.id}
                    className={`hover:bg-[#F4F6FA] transition-colors ${idx % 2 === 1 ? 'bg-[#F4F6FA]/50' : 'bg-white'}`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#0B2A5B]">{u.name}</div>
                      <div className="text-xs text-[#4A4F57] font-mono">{u.email}</div>
                    </td>
                    <td className="py-3 px-4 capitalize">
                      <span className="bg-[#F4F6FA] px-2 py-0.5 rounded border border-[#C5CCD6] text-xs font-semibold text-[#1A1A1A]">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-[#4A4F57]">
                      {u.court || 'Patiala House Courts'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase border ${
                        u.status === 'active'
                          ? 'bg-[#137333]/10 text-[#137333] border-[#137333]/30'
                          : 'bg-[#B3261E]/10 text-[#B3261E] border-[#B3261E]/30'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleResetPassword(u)}
                        title="Reset Password"
                        aria-label={`Reset password for ${u.name}`}
                        className="p-1.5 rounded bg-white hover:bg-[#F4F6FA] text-[#0B2A5B] border border-[#C5CCD6] transition-colors inline-flex items-center"
                      >
                        <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(u)}
                        title={u.status === 'active' ? 'Disable Account' : 'Enable Account'}
                        aria-label={`${u.status === 'active' ? 'Disable' : 'Enable'} account for ${u.name}`}
                        className={`p-1.5 rounded border transition-colors inline-flex items-center ${
                          u.status === 'active'
                            ? 'bg-white hover:bg-[#B3261E]/10 text-[#B3261E] border-[#C5CCD6]'
                            : 'bg-white hover:bg-[#137333]/10 text-[#137333] border-[#C5CCD6]'
                        }`}
                      >
                        {u.status === 'active' ? (
                          <X className="w-3.5 h-3.5" aria-hidden="true" />
                        ) : (
                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Accessible Dialog to Create New User */}
      <Dialog
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Judicial User Account"
        description="Provision authorized credentials for judicial, court registry, or investigative staff."
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <FormField label="Full Name" required htmlFor="create-user-name">
            <input
              id="create-user-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Adv. Amit Saxena"
              className="w-full px-3 py-2 bg-white border border-[#C5CCD6] rounded text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
            />
          </FormField>

          <FormField label="Official Email" required htmlFor="create-user-email">
            <input
              id="create-user-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@court.gov.in"
              className="w-full px-3 py-2 bg-white border border-[#C5CCD6] rounded text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
            />
          </FormField>

          <FormField label="User Category / Role" required htmlFor="create-user-role">
            <select
              id="create-user-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#C5CCD6] rounded text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
            >
              <option value="judge">Judge / Bench</option>
              <option value="clerk">Registry Clerk</option>
              <option value="lawyer">Advocate / Legal Counsel</option>
              <option value="police">Police / Investigating Officer</option>
              <option value="citizen">Citizen / Litigant</option>
              <option value="auditor">Auditor / Vigilance</option>
              <option value="admin">Administrator</option>
            </select>
          </FormField>

          <FormField label="Designated Court / Forum" required htmlFor="create-user-court">
            <input
              id="create-user-court"
              type="text"
              required
              value={court}
              onChange={(e) => setCourt(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#C5CCD6] rounded text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
            />
          </FormField>

          <FormField
            label="Initial Password (min 10 characters)"
            required
            htmlFor="create-user-password"
            hint="User will be prompted to update credentials upon initial session."
          >
            <input
              id="create-user-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#C5CCD6] rounded text-sm text-[#1A1A1A] font-mono focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#C5CCD6]">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isBusy={isSubmitting}
              disabled={isSubmitting}
            >
              Provision Account
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
