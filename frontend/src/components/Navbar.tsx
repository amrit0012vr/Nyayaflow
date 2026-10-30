import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Scale, ShieldCheck, User as UserIcon, Globe, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { APP_ROUTES } from '../lib/routes';
import { hasPermission } from '../lib/permissions';

interface NavbarProps {
  language: string;
  setLanguage: (lang: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ language, setLanguage }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  // Filter allowed navigation items according to user permissions and role (RBAC-04)
  const allowedNavItems = APP_ROUTES.filter(route => {
    if (!route.showInNav) return false;
    if (user.role === 'admin') return true;
    if (route.roles && !route.roles.includes(user.role)) return false;
    if (route.permission && !hasPermission(user, route.permission)) return false;
    return true;
  });

  const roleColors: Record<string, string> = {
    judge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    clerk: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    lawyer: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    police: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    citizen: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    auditor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    admin: 'bg-red-500/20 text-red-300 border-red-500/40'
  };

  const roleLabels: Record<string, string> = {
    judge: 'Judge / Bench',
    clerk: 'Court Registry Clerk',
    lawyer: 'Advocate',
    police: 'Police / IO',
    citizen: 'Citizen / Litigant',
    auditor: 'Auditor / Vigilance',
    admin: 'Court Administrator'
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-lg">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white">
                Nyaya<span className="text-amber-400">Flow</span>
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Sealed
              </span>
            </div>
            <p className="text-xs text-slate-400">Secure Agentic AI for Timely Justice</p>
          </div>
        </div>

        {/* User Badge, Language & Logout (UI-04) */}
        <div className="flex items-center gap-3">
          {/* Active User Card */}
          <div className="flex items-center gap-2.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-white leading-tight">{user.name}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${roleColors[user.role] || 'bg-slate-700 text-slate-300'}`}>
                  {roleLabels[user.role] || user.role.toUpperCase()}
                </span>
                {user.court && <span className="text-[10px] text-slate-400 truncate max-w-[140px]">{user.court}</span>}
              </div>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-slate-800 px-2 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer"
            >
              <option value="en" className="bg-slate-800 text-white">English</option>
              <option value="hi" className="bg-slate-800 text-white">हिन्दी (Hindi)</option>
              <option value="or" className="bg-slate-800 text-white">ଓଡ଼ିଆ (Odia)</option>
            </select>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Log out securely"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Role-Aware Navigation Bar (RBAC-04) */}
      <div className="bg-slate-900/90 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 overflow-x-auto py-1.5 scrollbar-thin scrollbar-thumb-slate-700">
          {allowedNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`
              }
            >
              {item.navLabel}
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  );
};
