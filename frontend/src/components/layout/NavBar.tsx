import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { APP_ROUTES } from '../../lib/routes';
import { hasPermission } from '../../lib/permissions';
import { LanguageCode } from '../../hooks/useLanguage';
import { t } from '../../lib/i18n';

export interface NavBarProps {
  language: LanguageCode;
}

export const NavBar: React.FC<NavBarProps> = ({ language }) => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Pre-login public links
  const publicLinks = [
    { to: '/login', label: t('home', language) },
    { to: '/about', label: t('about', language) },
    { to: '/how-it-works', label: t('how_it_works', language) },
    { to: '/legal-aid-info', label: t('legal_aid_info', language) },
    { to: '/help', label: t('help', language) },
    { to: '/contact', label: t('contact', language) }
  ];

  // Post-login links filtered by RBAC
  const authenticatedLinks = user
    ? APP_ROUTES.filter((route) => {
        if (!route.showInNav) return false;
        if (user.role === 'admin') return true;
        if (route.roles && !route.roles.includes(user.role)) return false;
        if (route.permission && !hasPermission(user, route.permission)) return false;
        return true;
      }).map((route) => ({
        to: route.path,
        label: route.navLabel
      }))
    : [];

  const links = user ? authenticatedLinks : publicLinks;

  return (
    <nav className="bg-[#0B2A5B] text-white shadow-md relative z-40" aria-label="Primary Navigation">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-12">
          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center h-full divide-x divide-white/15">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `h-full flex items-center px-4 text-xs font-medium text-white no-underline transition-colors hover:bg-[#071C3F] ${
                    isActive
                      ? 'border-b-[3px] border-[#FF9933] font-bold bg-[#071C3F]'
                      : 'border-b-[3px] border-transparent'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center justify-between w-full">
            <span className="text-xs font-semibold tracking-wider uppercase text-white/80">
              {user ? 'Judicial Navigation' : 'Portal Navigation'}
            </span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-panel"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="p-1.5 rounded text-white hover:bg-white/10 transition inline-control flex items-center gap-1 text-xs"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              <span>Menu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Disclosure Panel */}
      {mobileMenuOpen && (
        <div id="mobile-nav-panel" className="md:hidden bg-[#071C3F] border-t border-white/15 px-4 py-2 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-sm text-white no-underline transition-colors ${
                  isActive
                    ? 'bg-[#0B2A5B] font-bold border-l-4 border-[#FF9933]'
                    : 'hover:bg-white/10'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
};
