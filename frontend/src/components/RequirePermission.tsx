import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../lib/permissions';

interface RequirePermissionProps {
  permission?: string;
  roles?: string[];
  children: React.ReactElement;
}

export const RequirePermission: React.FC<RequirePermissionProps> = ({ permission, roles, children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin bypass for administrative views
  if (user.role === 'admin' && permission !== 'redaction:reveal') {
    return children;
  }

  // Check role restriction if specified
  if (roles && roles.length > 0) {
    const userRole = user.role.toLowerCase();
    const hasRole = roles.some(r => r.toLowerCase() === userRole);
    if (!hasRole) {
      return <Navigate to="/forbidden" replace />;
    }
  }

  // Check granular permission if specified
  if (permission && !hasPermission(user, permission)) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
};

