import { User } from '../types';

export function hasPermission(user: User | null, permission: string): boolean {
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permission);
}

export function getRoleHomeRoute(role: string): string {
  switch (role.toLowerCase()) {
    case 'judge':
      return '/cases';
    case 'clerk':
      return '/intake';
    case 'lawyer':
      return '/my-cases';
    case 'police':
      return '/evidence';
    case 'citizen':
      return '/citizen';
    case 'auditor':
      return '/audit';
    case 'admin':
      return '/admin/users';
    default:
      return '/login';
  }
}

