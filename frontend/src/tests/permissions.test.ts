import { describe, it, expect } from 'vitest';
import { hasPermission, getRoleHomeRoute } from '../lib/permissions';
import { APP_ROUTES } from '../lib/routes';
import { User } from '../types';

describe('Permissions & Role Home Routing', () => {
  it('correctly validates user permissions', () => {
    const judgeUser: User = {
      id: 'u-1',
      name: 'Hon. Sengupta',
      email: 'judge1@demo.in',
      role: 'judge',
      org: 'District Court',
      court: 'High Court',
      permissions: ['case:list', 'case:read', 'review:write', 'evaluation:read']
    };

    expect(hasPermission(judgeUser, 'case:list')).toBe(true);
    expect(hasPermission(judgeUser, 'evaluation:read')).toBe(true);
    expect(hasPermission(judgeUser, 'users:manage')).toBe(false);
    expect(hasPermission(null, 'case:list')).toBe(false);
  });

  it('routes each role to their designated landing page', () => {
    expect(getRoleHomeRoute('judge')).toBe('/cases');
    expect(getRoleHomeRoute('clerk')).toBe('/intake');
    expect(getRoleHomeRoute('lawyer')).toBe('/my-cases');
    expect(getRoleHomeRoute('police')).toBe('/evidence');
    expect(getRoleHomeRoute('citizen')).toBe('/citizen');
    expect(getRoleHomeRoute('auditor')).toBe('/audit');
    expect(getRoleHomeRoute('admin')).toBe('/admin/users');
    expect(getRoleHomeRoute('unknown')).toBe('/login');
  });

  it('enforces navigation visibility rules across personas', () => {
    const citizenUser: User = {
      id: 'u-cit',
      name: 'Ramesh',
      email: 'citizen1@demo.in',
      role: 'citizen',
      org: 'Public Litigant',
      permissions: ['legalaid:chat', 'legalaid:eligibility', 'me:cases']
    };

    // Filter allowed nav items exactly as Navbar does
    const citizenNav = APP_ROUTES.filter(route => {
      if (!route.showInNav) return false;
      if (citizenUser.role === 'admin') return true;
      if (route.roles && !route.roles.includes(citizenUser.role)) return false;
      if (route.permission && !hasPermission(citizenUser, route.permission)) return false;
      return true;
    });

    const citizenPaths = citizenNav.map(r => r.path);
    // Citizen MUST only see their designated paths
    expect(citizenPaths).toContain('/citizen');
    expect(citizenPaths).toContain('/citizen/chat');
    expect(citizenPaths).toContain('/citizen/eligibility');
    expect(citizenPaths).toContain('/citizen/status');

    // Citizen MUST NOT see bench cause list, evidence vault, or user management
    expect(citizenPaths).not.toContain('/cases');
    expect(citizenPaths).not.toContain('/evidence');
    expect(citizenPaths).not.toContain('/intake');
    expect(citizenPaths).not.toContain('/admin/users');
    expect(citizenPaths).not.toContain('/audit');
  });
});
